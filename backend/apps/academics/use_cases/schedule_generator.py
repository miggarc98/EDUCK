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
                course_breaks = [b for b in all_breaks if b.get('courses') and course.id in b.get('courses', [])]
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
                    
                    # 3. Find valid teachers
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
                    available_spots = [(day, slot) for day in self.days for slot in slots if (day, slot) not in scheduled_spots]
                    random.shuffle(available_spots)
                    
                    for day, slot in available_spots:
                        if blocks_scheduled_for_subject >= needed_blocks:
                            break
                            
                        slot_start_str, slot_end_str = slot.split(' - ')
                        slot_start, slot_end = to_min(slot_start_str.strip()), to_min(slot_end_str.strip())
                        
                        chosen_teacher = None
                        random.shuffle(valid_teachers)
                        for t in valid_teachers:
                            day_avail = t.availability.get(day)
                            if day_avail:
                                t_start = to_min(day_avail.get('start_time', '00:00'))
                                t_end = to_min(day_avail.get('end_time', '23:59'))
                                if slot_start < t_start or slot_end > t_end:
                                    continue
                            
                            if ClassSchedule.objects.filter(teacher=t.user, day=day, time_slot=slot).exists():
                                continue
                                
                            chosen_teacher = t
                            break
                            
                        if chosen_teacher:
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
