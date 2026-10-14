/**
 * DATOS DE DEMOSTRACIÓN: estas actividades no constituyen una agenda real.
 * Cada objeto representa un evento; el array ([]) reúne los tres objetos.
 * Edita este archivo para que ambas versiones de la página cambien al instante.
 *
 * Puente entre versiones: este archivo es JavaScript normal, sin import/export.
 * Puede cargarse con <script defer> desde file:// y también importarse por sus
 * efectos desde app.js. Sólo los datos usan este espacio global compartido;
 * modelos, vistas y controladores permanecen en módulos independientes.
 */
globalThis.NexoBajioData = globalThis.NexoBajioData || {};

// Cada propiedad tiene un propósito: id identifica; category filtra;
// startsAt contiene fecha, hora y desfase; timeZone permite mostrar la hora local.
globalThis.NexoBajioData.events = [
  {
    id: 'ia-cotidiana-demo',
    title: 'Inteligencia artificial para la vida real',
    category: 'Charla',
    startsAt: '2026-11-07T11:00:00-06:00',
    timeZone: 'America/Mexico_City',
    location: 'Bajío · sede de ejemplo',
    topic: 'Inteligencia Artificial',
    speaker: 'Especialista invitado · demostración',
    description: 'Explora usos cotidianos de la IA para organizar ideas, aprender y trabajar. Un primer acercamiento con ejemplos claros y espacio para tus preguntas.',
    audience: 'Personas curiosas, estudiantes y emprendedores. No necesitas experiencia previa.',
    duration: '90 minutos',
    cost: 'Sin costo en este ejemplo',
    isDemo: true
  },
  {
    id: 'primera-web-demo',
    title: 'Tu primera página web, paso a paso',
    category: 'Taller',
    startsAt: '2026-11-14T10:00:00-06:00',
    timeZone: 'America/Mexico_City',
    location: 'En línea · sesión de ejemplo',
    topic: 'Desarrollo Web',
    speaker: 'Persona facilitadora · demostración',
    description: 'Descubre cómo trabajan juntos HTML, CSS y JavaScript. Construye una página sencilla mientras compartes dudas y hallazgos con otras personas.',
    audience: 'Principiantes. Para realizar la práctica se propone llevar una computadora.',
    duration: '2 horas',
    cost: 'Por definir en una convocatoria real',
    isDemo: true
  },
  {
    id: 'conexiones-demo',
    title: 'Ideas, café y nuevas conexiones',
    category: 'Meetup',
    startsAt: '2026-11-21T17:00:00-06:00',
    timeZone: 'America/Mexico_City',
    location: 'Bajío · espacio de ejemplo',
    topic: 'Comunidad y emprendimiento',
    speaker: 'Comunidad anfitriona · demostración',
    description: 'Un encuentro para conversar sobre proyectos, intercambiar experiencias y conocer a personas con intereses tecnológicos. Trae una idea o simplemente tus ganas de aprender.',
    audience: 'Estudiantes, profesionales, docentes, empresas y personas interesadas.',
    duration: '2 horas',
    cost: 'Sin costo en este ejemplo',
    isDemo: true
  }
];
