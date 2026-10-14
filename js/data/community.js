/** Configuración editable. No contiene credenciales ni datos personales reales. */
globalThis.NexoBajioData = globalThis.NexoBajioData || {};

// Un objeto agrupa información relacionada mediante pares clave: valor.
globalThis.NexoBajioData.community = {
  contact: {
    // .example es un dominio de ejemplo: cambia el correo y después isDemo.
    email: 'hola@nexobajio.example',
    isDemo: true,
    region: 'Desde el Bajío, para conectar contigo.'
  },
  // Deja url vacía mientras no exista un canal oficial; así no hay enlaces falsos.
  // Cuando lo tengas, escribe la URL completa que empiece por https://.
  socialLinks: [
    { name: 'Instagram', url: '' },
    { name: 'Facebook', url: '' },
    { name: 'LinkedIn', url: '' }
  ],
  // Respuestas iniciales editables; no prometen fechas, precios ni servicios activos.
  faqs: [
    { id: 'comunidad', question: '¿Qué es NexoBajío?', answer: 'Es una comunidad tecnológica nacida en el Bajío para conectar personas, conocimiento y tecnología mediante actividades de aprendizaje y colaboración.' },
    { id: 'experiencia', question: '¿Necesito saber programación para participar?', answer: 'No. Puedes acercarte desde cualquier nivel. La idea es aprender, compartir y encontrar herramientas útiles, incluso si apenas empiezas a explorar la tecnología.' },
    { id: 'costo', question: '¿Los eventos tienen costo?', answer: 'Cada convocatoria indicará su costo, requisitos y condiciones. La agenda que ves ahora contiene datos de demostración; todavía no representa eventos confirmados.' },
    { id: 'ponente', question: '¿Puedo proponer una conferencia?', answer: 'Sí. Cuéntanos el tema, a quién podría ayudar y el formato que imaginas. Buscamos propuestas prácticas y accesibles que aporten a la comunidad. El formulario actual es una demostración y aún no envía mensajes.' },
    { id: 'empresas', question: '¿Las empresas pueden participar?', answer: 'Sí. La comunidad busca vincular empresas, talento y conocimiento. Pueden compartir experiencias, proponer actividades y explorar formas de colaboración.' },
    { id: 'orientacion', question: '¿Puedo pedir orientación sobre algún problema tecnológico?', answer: 'Sí. La intención es ayudarte a entender el problema y conectar con personas que puedan orientarte. La comunidad no garantiza atención inmediata ni sustituye un servicio técnico contratado.' },
    { id: 'lugar', question: '¿Dónde se realizan los eventos?', answer: 'Se contempla realizar actividades presenciales en el Bajío y encuentros en línea. La sede o enlace se anunciará en cada convocatoria confirmada. Las ubicaciones actuales son ejemplos.' }
  ]
};
