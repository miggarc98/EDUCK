from apps.curriculum.domain.models import Area, Subject, Course

LEY_115_DATA = [
    # 1. Educación Básica (1º - 9º)
    {
        "area_name": "Matemáticas",
        "description": "Área obligatoria Ley 115: Razonamiento matemático, estructuras y resolución de problemas.",
        "subjects": ["Matemáticas", "Geometría", "Estadística"],
        "levels": ["Básica Primaria", "Básica Secundaria"]
    },
    {
        "area_name": "Ciencias Naturales y Educación Ambiental",
        "description": "Área obligatoria Ley 115: Procesos biológicos, físicos, químicos y preservación ambiental.",
        "subjects": ["Ciencias Naturales"],
        "levels": ["Básica Primaria", "Básica Secundaria"]
    },
    {
        "area_name": "Humanidades",
        "description": "Área obligatoria Ley 115: Lengua castellana, literatura e idiomas extranjeros.",
        "subjects": ["Lengua Castellana", "Idioma Extranjero (Inglés)"],
        "levels": ["Preescolar", "Básica Primaria", "Básica Secundaria", "Media Académica"]
    },
    {
        "area_name": "Ciencias Sociales",
        "description": "Área obligatoria Ley 115: Historia, geografía, constitución y cátedra de paz.",
        "subjects": ["Historia", "Geografía", "Cátedra de Paz y Constitución"],
        "levels": ["Básica Primaria", "Básica Secundaria"]
    },
    {
        "area_name": "Educación Artística",
        "description": "Área obligatoria Ley 115: Expresión plástica, musical y corporal.",
        "subjects": ["Artes Plásticas", "Música", "Danzas"],
        "levels": ["Preescolar", "Básica Primaria", "Básica Secundaria", "Media Académica"]
    },
    {
        "area_name": "Educación Física, Recreación y Deportes",
        "description": "Área obligatoria Ley 115: Desarrollo psicomotriz, deporte y hábitos saludables.",
        "subjects": ["Educación Física"],
        "levels": ["Preescolar", "Básica Primaria", "Básica Secundaria", "Media Académica"]
    },
    {
        "area_name": "Educación Ética y Valores Humanos",
        "description": "Área obligatoria Ley 115: Formación moral, convivencia y desarrollo humano.",
        "subjects": ["Ética y Valores"],
        "levels": ["Básica Primaria", "Básica Secundaria", "Media Académica"]
    },
    {
        "area_name": "Educación Religiosa",
        "description": "Área obligatoria Ley 115: Dimensión trascendente y formación axiológica.",
        "subjects": ["Religión"],
        "levels": ["Básica Primaria", "Básica Secundaria", "Media Académica"]
    },
    {
        "area_name": "Tecnología e Informática",
        "description": "Área obligatoria Ley 115: Pensamiento computacional, herramientas digitales y tecnología.",
        "subjects": ["Informática y Tecnología"],
        "levels": ["Básica Primaria", "Básica Secundaria", "Media Académica"]
    },
    # 2. Educación Media Académica (10º y 11º) - Ramificaciones y Áreas Específicas
    {
        "area_name": "Matemáticas (Media)",
        "description": "Área obligatoria Ley 115: Matemáticas avanzadas para educación media (Trigonometría, Cálculo).",
        "subjects": ["Trigonometría", "Cálculo", "Estadística Avanzada"],
        "levels": ["Media Académica"]
    },
    {
        "area_name": "Ciencias Naturales (Media)",
        "description": "Área obligatoria Ley 115: Profundización en Biología, Física y Química.",
        "subjects": ["Biología", "Física", "Química"],
        "levels": ["Media Académica"]
    },
    {
        "area_name": "Ciencias Económicas y Políticas",
        "description": "Área obligatoria Ley 115 (Media): Análisis económico, sistemas políticos y ciudadanía.",
        "subjects": ["Economía", "Política"],
        "levels": ["Media Académica"]
    },
    {
        "area_name": "Filosofía",
        "description": "Área obligatoria Ley 115 (Media): Pensamiento crítico, ontología, epistemología y lógica.",
        "subjects": ["Filosofía"],
        "levels": ["Media Académica"]
    }
]

def seed_ley115_curriculum():
    """
    Precarga las áreas obligatorias y asignaturas según los artículos 23 y 31 de la Ley 115 de 1994 (MEN Colombia).
    Asocia las asignaturas a los cursos según el nivel educativo de cada una.
    """
    all_courses = Course.objects.all()
    created_areas_count = 0
    created_subjects_count = 0

    for item in LEY_115_DATA:
        area_name = item["area_name"]
        description = item["description"]
        levels = item["levels"]

        area, created = Area.objects.get_or_create(
            name=area_name,
            defaults={
                "description": description,
                "is_mandatory": True,
                "is_active": True
            }
        )
        if created:
            created_areas_count += 1
        elif not area.is_mandatory:
            area.is_mandatory = True
            area.save()

        # Find courses matching the designated levels
        matching_courses = all_courses.filter(level__in=levels)

        for subj_name in item["subjects"]:
            subject, s_created = Subject.objects.get_or_create(
                name=subj_name,
                area=area,
                defaults={
                    "description": f"Asignatura oficial del área de {area.name}",
                    "is_active": True
                }
            )
            if s_created:
                created_subjects_count += 1

            # Associate matching courses
            if matching_courses.exists():
                subject.courses.add(*matching_courses)

    return {
        "areas_created": created_areas_count,
        "subjects_created": created_subjects_count,
        "status": "success"
    }
