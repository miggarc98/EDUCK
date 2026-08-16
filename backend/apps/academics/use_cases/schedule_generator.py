import random
from django.db import transaction
from apps.academics.domain.models import TeacherProfile, ClassSchedule
from apps.curriculum.domain.models import Course, Subject
from apps.institution.domain.models import InstitutionSetting

def to_min(t_str):
    h, m = map(int, t_str.split(':'))
    return h * 60 + m

def format_time(minutes):
    return f"{minutes // 60:02d}:{minutes % 60:02d}"

class ScheduleGeneratorService:
    def __init__(self, course_ids=None, overwrite=False):
        self.course_ids = course_ids
        self.overwrite = overwrite
        self.settings = InstitutionSetting.get_solo()
        self.days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']
        
    def generate(self):
        with transaction.atomic():
            if self.course_ids:
                courses = Course.objects.filter(id__in=self.course_ids, is_active=True)
            else:
                courses = Course.objects.filter(is_active=True)
                
            if self.overwrite:
                ClassSchedule.objects.filter(course__in=courses).delete()
                
            teacher_profiles = list(TeacherProfile.objects.select_related('user').filter(status='active'))
            
            start_minutes = to_min(self.settings.start_time or '07:00')
            end_minutes = to_min(self.settings.end_time or '14:30')
            duration = self.settings.block_duration_minutes or 45
            all_breaks = self.settings.settings_json.get('academic', {}).get('breaks', [])
            
            results = {'scheduled': 0, 'failed': [], 'messages': [], 'analysis': []}
            
            # Global check for teachers vs courses
            total_courses = courses.count()
            total_teachers = len(teacher_profiles)
            if total_teachers < total_courses:
                results['analysis'].append(
                    f"Alerta Global: Hay {total_teachers} docentes y {total_courses} cursos en total. "
                    "Por lo general, como mínimo, debe haber la misma cantidad de profesores que de cursos. "
                    "Necesitamos más maestros o subir la carga/pedir más tiempo a los maestros actuales."
                )
            
            for course in courses:
                # 1. Generate available time slots excluding breaks for this course
                course_breaks = [b for b in all_breaks if not b.get('courses') or course.id in b.get('courses', [])]
                slots = []
                current = start_minutes
                safety_counter = 0
                
                while current + 5 < end_minutes:
                    safety_counter += 1
                    if safety_counter > 100: break
                    
                    active_break = next((b for b in course_breaks if to_min(b['start_time']) <= current < to_min(b['end_time'])), None)
                    if active_break:
                        current = to_min(active_break['end_time'])
                        continue
                        
                    nxt = current + duration
                    if nxt <= end_minutes:
                        overlap_break = next((b for b in course_breaks if current < to_min(b['start_time']) < nxt), None)
                        if overlap_break:
                            b_start = to_min(overlap_break['start_time'])
                            slots.append(f"{format_time(current)} - {format_time(b_start)}")
                            current = b_start
                        else:
                            slots.append(f"{format_time(current)} - {format_time(nxt)}")
                            current = nxt
                    else:
                        slots.append(f"{format_time(current)} - {format_time(end_minutes)}")
                        break
                
                # 2. Retrieve required subjects
                subjects = course.subjects.filter(is_active=True)
                existing_schedules = ClassSchedule.objects.filter(course=course)
                scheduled_spots = {(s.day, s.time_slot): s.subject_id for s in existing_schedules}
                
                course_scheduled_total = 0
                
                for subject in subjects:
                    current_blocks = sum(1 for s in existing_schedules if s.subject_id == subject.id)
                    course_scheduled_total += current_blocks
                    needed_blocks = subject.weekly_hours - current_blocks
                    if needed_blocks <= 0: continue
                    
                    # 3. Find valid teachers by  Area , name 
                    valid_teachers = []
                    for t in teacher_profiles:
                        if not t.area: continue
                        t_area = t.area.lower().strip()
                        s_area = subject.area.name.lower().strip()
                        s_name = subject.name.lower().strip()
                        if t_area in s_area or s_area in t_area or t_area in s_name or s_name in t_area:
                            valid_teachers.append(t)
                    
                    if not valid_teachers:
                        if course.director:
                            dir_profile = next((t for t in teacher_profiles if t.user_id == course.director_id), None)
                            if dir_profile: valid_teachers = [dir_profile]
                            else: valid_teachers = teacher_profiles[:1]
                        else:
                            valid_teachers = teacher_profiles[:1]
                        results['messages'].append(f"Asignación forzada para '{subject.name}' (Curso {course.name}) sin docente de área.")
                        
                    blocks_scheduled_for_subject = 0
                    
                    assigned_teacher = None
                    subject_schedules = [s for s in existing_schedules if s.subject_id == subject.id]
                    if subject_schedules:
                        assigned_teacher_user_id = subject_schedules[0].teacher_id
                        assigned_teacher = next((t for t in valid_teachers if t.user_id == assigned_teacher_user_id), None)
                        
                    while blocks_scheduled_for_subject < needed_blocks:
                        remaining = needed_blocks - blocks_scheduled_for_subject
                        
                        chunks_size_2 = []
                        chunks_size_1 = []
                        
                        for day in self.days:
                            free_slots_today = [slot for slot in slots if (day, slot) not in scheduled_spots]
                            current_day_blocks = sum(1 for (d, s), subj_id in scheduled_spots.items() if d == day and subj_id == subject.id)
                            
                            if current_day_blocks < 2:
                                for s in free_slots_today:
                                    chunks_size_1.append([(day, s)])
                                    
                                if current_day_blocks == 0 and remaining >= 2:
                                    for i in range(len(free_slots_today) - 1):
                                        idx1 = slots.index(free_slots_today[i])
                                        idx2 = slots.index(free_slots_today[i+1])
                                        if idx2 == idx1 + 1:
                                            chunks_size_2.append([(day, free_slots_today[i]), (day, free_slots_today[i+1])])
                                            
                        random.shuffle(chunks_size_2)
                        random.shuffle(chunks_size_1)
                        
                        candidate_chunks = []
                        if remaining >= 2:
                            candidate_chunks.extend(chunks_size_2)
                        candidate_chunks.extend(chunks_size_1)
                        
                        if not candidate_chunks:
                            for day in self.days:
                                free_slots_today = [slot for slot in slots if (day, slot) not in scheduled_spots]
                                for s in free_slots_today:
                                    candidate_chunks.append([(day, s)])
                            random.shuffle(candidate_chunks)
                            
                        if not candidate_chunks:
                            break
                            
                        chunk_scheduled = False
                        for chunk in candidate_chunks:
                            chosen_teacher = None
                            if assigned_teacher:
                                teachers_to_try = [assigned_teacher]
                            else:
                                teachers_to_try = valid_teachers.copy()
                                random.shuffle(teachers_to_try)
                                
                            for t in teachers_to_try:
                                t_available = True
                                for (day, slot) in chunk:
                                    slot_start_str, slot_end_str = slot.split(' - ')
                                    slot_start, slot_end = to_min(slot_start_str.strip()), to_min(slot_end_str.strip())
                                    
                                    day_avail = t.availability.get(day)
                                    if day_avail:
                                        t_start = to_min(day_avail.get('start_time', '00:00'))
                                        t_end = to_min(day_avail.get('end_time', '23:59'))
                                        if slot_start < t_start or slot_end > t_end:
                                            t_available = False
                                            break
                                            
                                    if ClassSchedule.objects.filter(teacher=t.user, day=day, time_slot=slot).exists():
                                        t_available = False
                                        break
                                        
                                if t_available:
                                    chosen_teacher = t
                                    break
                                    
                            if chosen_teacher:
                                if not assigned_teacher:
                                    assigned_teacher = chosen_teacher
                                    
                                for (day, slot) in chunk:
                                    ClassSchedule.objects.create(
                                        course=course,
                                        day=day,
                                        time_slot=slot,
                                        subject=subject,
                                        teacher=chosen_teacher.user,
                                        room=f"Aula {course.name}"
                                    )
                                    scheduled_spots[(day, slot)] = subject.id
                                    blocks_scheduled_for_subject += 1
                                    results['scheduled'] += 1
                                    course_scheduled_total += 1
                                    
                                chunk_scheduled = True
                                break
                                
                        if not chunk_scheduled:
                            break
                            
                    if blocks_scheduled_for_subject < needed_blocks:
                        results['failed'].append(f"Faltaron {needed_blocks - blocks_scheduled_for_subject} bloques para '{subject.name}' (Curso {course.name}).")
                
                # Analysis for this course
                total_slots_available = len(self.days) * len(slots)
                gaps = total_slots_available - course_scheduled_total
                
                if gaps > 0:
                    total_required_hours = sum(subj.weekly_hours for subj in subjects)
                    if total_required_hours < total_slots_available:
                        deficit = total_slots_available - total_required_hours
                        results['analysis'].append(f"El curso {course.name} tiene {gaps} huecos. La suma de intensidad horaria de sus materias es menor a los bloques semanales. Sugerencia: Aumente la intensidad horaria de las materias o agregue nuevas asignaturas para cubrir {deficit} bloques faltantes.")
                    else:
                        results['analysis'].append(f"El curso {course.name} tiene {gaps} huecos. La intensidad horaria configurada es suficiente, pero no se pudo cumplir. Sugerencia: Faltan docentes, hay cruce de horarios o la disponibilidad de los docentes actuales es muy limitada.")
            
            return results
