# Arquitectura del Sistema EDUCK

## 1. Visión General de la Arquitectura
EDUCK es una plataforma web de gestión educativa orientada al sector público colombiano[cite: 10], construida bajo un modelo de **Monolito Modular** que aplica los principios de *Screaming Architecture* y *Clean Architecture*. 
* **Backend:** Implementado en Python y Django 5, utilizando Django REST Framework (DRF) para la API y `django-tenants` con PostgreSQL para soportar *Multi-tenancy* mediante aislamiento por esquemas (*schemas*) entre el SaaS global y cada institución educativa.
* **Frontend:** Desarrollado en React con Vite bajo una estructura modular (`src/modules/` y `src/globals/`), configurado como una Progressive Web App (PWA) con soporte *offline-first* (vía *Service Workers* e IndexedDB) para garantizar accesibilidad en zonas de baja conectividad[cite: 10].
* **Despliegue:** Orquestado mediante contenedores Docker y Docker Compose, utilizando Nginx como servidor web/proxy inverso para servir el frontend y Gunicorn para la ejecución de la API de Django.

---

## 2. Organización y Estructuración del Backend (Django)
El backend agrupa la lógica de negocio en aplicaciones de Django independientes (*apps*), asegurando que cada dominio mantenga una separación estricta de responsabilidades (modelos, servicios, serializadores, vistas y rutas):
* **`platform_admin`:** Gestiona el esquema `public` del SaaS, permitiendo la creación de nuevos *tenants* (instituciones), asignación de dominios y ejecución automatizada de migraciones de esquemas.
* **`institution`:** Administra las configuraciones base de cada colegio dentro de su esquema aislado, tales como sedes (urbanas/rurales), escalas de calificación y jornadas académicas[cite: 10].
* **`curriculum`:** Aloja el catálogo de asignaturas, planes de estudio y está arquitectónicamente aislado para soportar en el futuro un motor algorítmico de generación de horarios.
* **`auth_users`:** Controla la identidad mediante autenticación JWT, la gestión de perfiles y el control de acceso basado en roles (Coordinador, Docente, Estudiante y Padre).
* **`enrollment`:** Maneja el registro e historial de matrículas de los estudiantes, estructurando los datos necesarios para la integración y exportación hacia las plataformas gubernamentales SIMAT y SINEB[cite: 10].
* **`academics`:** Administra el registro de calificaciones, periodos y control de asistencia, integrando capacidades *offline* para mitigar la brecha digital[cite: 10].
* **`behavior`:** Controla la convivencia escolar, permitiendo el registro de faltas, el debido proceso legal y la aplicación rigurosa de los protocolos del Manual de Convivencia[cite: 10].
* **`communications`:** Funciona como el canal oficial de mensajería institucional, circulares y citaciones para reemplazar canales informales y asegurar trazabilidad[cite: 10].
* **`analytics`:** Consolida la información de manera centralizada para alimentar el tablero de control (*dashboard*) directivo, facilitando la toma de decisiones basada en datos[cite: 10].
* **`support_help`:** Provee guías interactivas y un centro de ayuda integrado para apoyar a los usuarios frente al déficit de competencias digitales[cite: 10].
* **`core`:** Contiene utilidades transversales, clases base, excepciones globales y helpers compartidos por todo el sistema.

---

## 3. Organización y Estructuración del Frontend (React)
El frontend organiza su código fuente separando los elementos transversales de los dominios funcionales del negocio:
* **`src/globals/`:** Agrupa todos los recursos compartidos de la aplicación, incluyendo componentes de interfaz globales (diseño atómico), *hooks* transversales (como control de estado de red o temas), la tienda global de estados, utilidades de formateo y la configuración centralizada de Axios para la comunicación con la API.
* **`src/modules/`:** Contiene los módulos funcionales de la aplicación (*features*). Cada módulo encapsula de forma independiente sus propios componentes visuales, lógica específica, servicios de consumo y rutas correspondientes a los dominios del backend (`platform_admin`, `institution`, `curriculum`, `auth_users`, `enrollment`, `academics`, `behavior`, `communications`, `analytics`, `support_help`).
* **Configuración PWA:** Incorpora los archivos de manifiesto y el *Service Worker* en el directorio público para permitir el almacenamiento local y la sincronización de datos cuando se restablezca la conectividad.

---

## 4. Comunicación Modular y Futura Escalabilidad a Microservicios
La estructura descrita garantiza la evolución del sistema hacia una arquitectura distribuida sin comprometer la integridad del monolito modular inicial:
* **Encapsulamiento:** Los dominios de negocio están estrictamente desacoplados; la comunicación entre módulos se realiza a través de interfaces y servicios internos definidos, evitando acoplamientos directos entre bases de datos o modelos de diferentes dominios.
* **Extracción Autónoma:** Debido a que cada módulo agrupa de forma hermética sus responsabilidades, aquellos servicios con alta demanda computacional (como el motor de horarios en `curriculum` o la analítica en `analytics`) podrán ser extraídos fácilmente en el futuro, empaquetados en contenedores independientes y convertidos en microservicios autónomos con esquemas de datos distribuidos mediante `django-tenants`.