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
    """
    Servicio encargado de generar los horarios de clase automáticamente.
    Aplica reglas de disponibilidad de profesores, jornadas, áreas y cruces.
    """
    def __init__(self, course_ids=None, overwrite=False):
        self.course_ids = course_ids
        self.overwrite = overwrite
        self.settings = InstitutionSetting.get_solo()
        self.days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']
        
    def generate(self):
        """
        Método principal que coordina la generación de horarios.
        Sigue un enfoque atómico delegando responsabilidades a métodos auxiliares.
        """
        with transaction.atomic():
            courses = self._get_courses()
            if self.overwrite:
                ClassSchedule.objects.filter(course__in=courses).delete()
                
            teacher_profiles = list(TeacherProfile.objects.select_related('user').filter(status='active'))
            
            results = {'scheduled': 0, 'failed': [], 'messages': [], 'analysis': []}
            self._check_global_availability(courses, teacher_profiles, results)
            
            teacher_hours_assigned = self._get_initial_teacher_hours(teacher_profiles)
            shifts_config = self.settings.shifts if isinstance(self.settings.shifts, list) else []
            shift_dict = {s.get('id'): s for s in shifts_config if isinstance(s, dict)}
            
            for course in courses:
                slots = self._generate_course_slots(course, shift_dict)
                subjects = course.subjects.filter(is_active=True)
                existing_schedules = ClassSchedule.objects.filter(course=course)
                scheduled_spots = {(s.day, s.time_slot): s.subject_id for s in existing_schedules}
                
                course_scheduled_total = 0
                
                for subject in subjects:
                    current_blocks = sum(1 for s in existing_schedules if s.subject_id == subject.id)
                    course_scheduled_total += current_blocks
                    
                    target_hours = subject.weekly_hours
                    if isinstance(subject.weekly_hours_overrides, dict) and course.degree:
                        target_hours = subject.weekly_hours_overrides.get(course.degree, subject.weekly_hours)
                        
                    needed_blocks = target_hours - current_blocks
                    if needed_blocks <= 0: 
                        continue
                    
                    valid_teachers = self._get_valid_teachers(course, subject, teacher_profiles, teacher_hours_assigned, results)
                    
                    blocks_scheduled = self._schedule_blocks(
                        course, subject, needed_blocks, slots, scheduled_spots, 
                        valid_teachers, teacher_hours_assigned, existing_schedules
                    )
                    
                    results['scheduled'] += blocks_scheduled
                    course_scheduled_total += blocks_scheduled
                    
                    if blocks_scheduled < needed_blocks:
                        results['failed'].append(f"Faltaron {needed_blocks - blocks_scheduled} bloques para '{subject.name}' (Curso {course.name}).")
                
                self._analyze_course_gaps(course, subjects, slots, course_scheduled_total, results)
            
            return results

    def _get_courses(self):
        """Obtiene los cursos a procesar."""
        if self.course_ids:
            return Course.objects.filter(id__in=self.course_ids, is_active=True)
        return Course.objects.filter(is_active=True)

    def _get_initial_teacher_hours(self, teacher_profiles):
        """Calcula las horas iniciales asignadas a cada profesor."""
        return {t.user_id: ClassSchedule.objects.filter(teacher=t.user).count() for t in teacher_profiles}

    def _check_global_availability(self, courses, teacher_profiles, results):
        """
        Valida que exista una cantidad mínima viable de docentes frente a los cursos.
        Añade advertencias al análisis si es necesario.
        """
        total_courses = courses.count()
        total_teachers = len(teacher_profiles)
        if total_teachers < total_courses:
            results['analysis'].append(
                f"Alerta Global: Hay {total_teachers} docentes y {total_courses} cursos en total. "
                "Por lo general, como mínimo, debe haber la misma cantidad de profesores que de cursos. "
                "Necesitamos más maestros o subir la carga/pedir más tiempo a los maestros actuales."
            )

    def _generate_course_slots(self, course, shift_dict):
        """
        Genera los bloques de tiempo disponibles para un curso,
        excluyendo los descansos configurados.
        """
        course_shift = shift_dict.get(course.shift)
        if course_shift:
            c_start_min = to_min(course_shift.get('start_time', '07:00'))
            c_end_min = to_min(course_shift.get('end_time', '14:30'))
        else:
            c_start_min = to_min(self.settings.start_time or '07:00')
            c_end_min = to_min(self.settings.end_time or '14:30')
        
        all_breaks = self.settings.settings_json.get('academic', {}).get('breaks', [])
        course_breaks = []
        for b in all_breaks:
            b_shift = b.get('shift_id')
            if b_shift and b_shift != course.shift:
                continue
            if b.get('courses') and course.id not in b.get('courses', []):
                continue
            course_breaks.append(b)
            
        slots = []
        current = c_start_min
        duration = self.settings.block_duration_minutes or 45
        safety_counter = 0
        
        while current + 5 < c_end_min:
            safety_counter += 1
            if safety_counter > 100: break
            
            active_break = next((b for b in course_breaks if to_min(b['start_time']) <= current < to_min(b['end_time'])), None)
            if active_break:
                current = to_min(active_break['end_time'])
                continue
                
            nxt = current + duration
            if nxt <= c_end_min:
                overlap_break = next((b for b in course_breaks if current < to_min(b['start_time']) < nxt), None)
                if overlap_break:
                    b_start = to_min(overlap_break['start_time'])
                    slots.append(f"{format_time(current)} - {format_time(b_start)}")
                    current = b_start
                else:
                    slots.append(f"{format_time(current)} - {format_time(nxt)}")
                    current = nxt
            else:
                slots.append(f"{format_time(current)} - {format_time(c_end_min)}")
                break
                
        return slots

    def _get_valid_teachers(self, course, subject, teacher_profiles, teacher_hours_assigned, results):
        """
        Filtra y ordena los docentes válidos para dictar una materia específica en un curso.
        Prioriza al titular, luego afinidad de área, y por último disponibilidad de horas.
        """
        valid_teachers = []
        s_area = subject.area.name.lower().strip()
        s_name = subject.name.lower().strip()
        course_titular_id = course.titular_id

        for t in teacher_profiles:
            if course.shift and isinstance(getattr(t, 'available_shifts', None), list) and t.available_shifts:
                if course.shift not in t.available_shifts:
                    continue
                    
            current_t_hours = teacher_hours_assigned.get(t.user_id, 0)
            max_allowed = getattr(t, 'max_hours', getattr(self.settings, 'default_teacher_max_hours', 22))
                
            if current_t_hours >= max_allowed:
                continue
                
            is_titular = (t.user_id == course_titular_id)
            t_areas = [t.area.lower().strip()] if t.area else []
            if isinstance(t.additional_areas, list):
                t_areas.extend([a.lower().strip() for a in t.additional_areas])
                
            is_match = is_titular
            if not is_match:
                for ta in t_areas:
                    if ta in s_area or s_area in ta or ta in s_name or s_name in ta:
                        is_match = True
                        break
                    
            if is_match:
                valid_teachers.append(t)
                
        # Sort valid teachers: titular first, then primary area match, then by current assigned hours
        def sort_key(t):
            is_titular = (t.user_id == course.titular_id)
            t_primary = t.area.lower().strip() if t.area else ""
            primary_match = (t_primary in s_area or s_area in t_primary or t_primary in s_name or s_name in t_primary)
            return (not is_titular, not primary_match, teacher_hours_assigned.get(t.user_id, 0))
            
        valid_teachers.sort(key=sort_key)
        
        if not valid_teachers:
            valid_teachers = self._get_fallback_teachers(course, teacher_profiles, teacher_hours_assigned)
            results['messages'].append(f"Asignación forzada para '{subject.name}' (Curso {course.name}) sin docente de área.")
            
        return valid_teachers

    def _get_fallback_teachers(self, course, teacher_profiles, teacher_hours_assigned):
        """Obtiene docentes de respaldo en caso de no encontrar especialistas disponibles."""
        fallback_teachers = []
        for t in teacher_profiles:
            max_allowed = getattr(t, 'max_hours', getattr(self.settings, 'default_teacher_max_hours', 22))
            if teacher_hours_assigned.get(t.user_id, 0) >= max_allowed: continue
            if course.shift and getattr(t, 'available_shifts', None):
                if course.shift not in t.available_shifts: continue
            fallback_teachers.append(t)
            
        if fallback_teachers:
            fallback_teachers.sort(key=lambda t: teacher_hours_assigned.get(t.user_id, 0))
            return fallback_teachers[:1]
            
        if course.titular:
            titular_profile = next((t for t in teacher_profiles if t.user_id == course.titular_id), None)
            if titular_profile: return [titular_profile]
            
        if course.director:
            dir_profile = next((t for t in teacher_profiles if t.user_id == course.director_id), None)
            if dir_profile: return [dir_profile]
            
        return teacher_profiles[:1]

    def _schedule_blocks(self, course, subject, needed_blocks, slots, scheduled_spots, valid_teachers, teacher_hours_assigned, existing_schedules):
        """
        Intenta asignar los bloques de horario necesarios para una asignatura,
        respetando disponibilidad y cruces.
        """
        blocks_scheduled = 0
        assigned_teacher = None
        
        subject_schedules = [s for s in existing_schedules if s.subject_id == subject.id]
        if subject_schedules:
            assigned_teacher_user_id = subject_schedules[0].teacher_id
            assigned_teacher = next((t for t in valid_teachers if t.user_id == assigned_teacher_user_id), None)
            if assigned_teacher and teacher_hours_assigned.get(assigned_teacher.user_id, 0) >= getattr(assigned_teacher, 'max_hours', 22):
                assigned_teacher = None
            
        while blocks_scheduled < needed_blocks:
            remaining = needed_blocks - blocks_scheduled
            candidate_chunks = self._get_candidate_chunks(remaining, slots, scheduled_spots, subject.id)
            
            if not candidate_chunks:
                break
                
            chunk_scheduled = False
            for chunk in candidate_chunks:
                chosen_teacher = self._find_available_teacher(chunk, assigned_teacher, valid_teachers)
                        
                if chosen_teacher:
                    if not assigned_teacher:
                        assigned_teacher = chosen_teacher
                        
                    for (day, slot) in chunk:
                        ClassSchedule.objects.create(
                            course=course,
                            day=day,
                            time_slot=slot,
                            subject=subject,
                            teacher=chosen_teacher.user
                        )
                        scheduled_spots[(day, slot)] = subject.id
                        teacher_hours_assigned[chosen_teacher.user_id] = teacher_hours_assigned.get(chosen_teacher.user_id, 0) + 1
                        
                    blocks_scheduled += len(chunk)
                    chunk_scheduled = True
                    break
                    
            if not chunk_scheduled:
                break
                
        return blocks_scheduled

    def _get_candidate_chunks(self, remaining, slots, scheduled_spots, subject_id):
        """Agrupa ranuras de tiempo disponibles en bloques simples o dobles."""
        chunks_size_2 = []
        chunks_size_1 = []
        
        for day in self.days:
            free_slots = [slot for slot in slots if (day, slot) not in scheduled_spots]
            current_day_blocks = sum(1 for (d, s), subj_id in scheduled_spots.items() if d == day and subj_id == subject_id)
            
            if current_day_blocks < 2:
                for s in free_slots:
                    chunks_size_1.append([(day, s)])
                    
                if current_day_blocks == 0 and remaining >= 2:
                    for i in range(len(free_slots) - 1):
                        idx1 = slots.index(free_slots[i])
                        idx2 = slots.index(free_slots[i+1])
                        if idx2 == idx1 + 1:
                            chunks_size_2.append([(day, free_slots[i]), (day, free_slots[i+1])])
                            
        random.shuffle(chunks_size_2)
        random.shuffle(chunks_size_1)
        
        candidate_chunks = []
        if remaining >= 2:
            candidate_chunks.extend(chunks_size_2)
        candidate_chunks.extend(chunks_size_1)
        
        if not candidate_chunks:
            # Fallback a un solo bloque en cualquier día
            for day in self.days:
                free_slots = [slot for slot in slots if (day, slot) not in scheduled_spots]
                for s in free_slots:
                    candidate_chunks.append([(day, s)])
            random.shuffle(candidate_chunks)
            
        return candidate_chunks

    def _find_available_teacher(self, chunk, assigned_teacher, valid_teachers):
        """Encuentra el primer profesor disponible para dictar un bloque de clases (chunk)."""
        teachers_to_try = [assigned_teacher] if assigned_teacher else valid_teachers.copy()
        if not assigned_teacher:
            random.shuffle(teachers_to_try)
            
        for t in teachers_to_try:
            if self._is_teacher_available(t, chunk):
                return t
        return None

    def _is_teacher_available(self, teacher, chunk):
        """Verifica si el profesor tiene cruces u otras restricciones horarias."""
        for (day, slot) in chunk:
            slot_start_str, slot_end_str = slot.split(' - ')
            slot_start, slot_end = to_min(slot_start_str.strip()), to_min(slot_end_str.strip())
            
            day_avail = teacher.availability.get(day)
            if day_avail:
                t_start = to_min(day_avail.get('start_time', '00:00'))
                t_end = to_min(day_avail.get('end_time', '23:59'))
                if slot_start < t_start or slot_end > t_end:
                    return False
                    
            if ClassSchedule.objects.filter(teacher=teacher.user, day=day, time_slot=slot).exists():
                return False
        return True

    def _analyze_course_gaps(self, course, subjects, slots, course_scheduled_total, results):
        """Analiza si quedaron huecos en el horario del curso y emite sugerencias."""
        total_slots_available = len(self.days) * len(slots)
        gaps = total_slots_available - course_scheduled_total
        
        if gaps > 0:
            total_required_hours = sum(subj.weekly_hours for subj in subjects)
            if total_required_hours < total_slots_available:
                deficit = total_slots_available - total_required_hours
                results['analysis'].append(f"El curso {course.name} tiene {gaps} huecos. La suma de intensidad horaria de sus materias es menor a los bloques semanales. Sugerencia: Aumente la intensidad horaria de las materias o agregue nuevas asignaturas para cubrir {deficit} bloques faltantes.")
            else:
                results['analysis'].append(f"El curso {course.name} tiene {gaps} huecos. La intensidad horaria configurada es suficiente, pero no se pudo cumplir. Sugerencia: Faltan docentes, hay cruce de horarios o la disponibilidad de los docentes actuales es muy limitada.")
