/* ARCHIVO GENERADO: edita los módulos originales y ejecuta tools/build_offline.py.
 * Se conservan los comentarios para poder estudiar el código sin minificación.
 * Los datos externos siguen en js/data/events.js y js/data/community.js. */
(function () {
"use strict";

/* ===== FUENTE: js/utils/dom.js ===== */
/** Utilidades pequeñas para no repetir la creación segura de elementos. */
function createElement(tag, className = '', text = '') {
  // El DOM es la representación del HTML como objetos que JavaScript modifica.
  const element = document.createElement(tag);
  element.className = className;
  // textContent trata el texto como texto, nunca como etiquetas ejecutables.
  element.textContent = text;
  return element;
}

function createIcon(name) {
  // SVG usa un espacio de nombres distinto del HTML. Sus símbolos están en index.html.
  const namespace = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(namespace, 'svg');
  const use = document.createElementNS(namespace, 'use');
  svg.setAttribute('class', 'icon');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  use.setAttribute('href', `#icon-${name}`);
  svg.append(use);
  return svg;
}

function formatEventDate(event, options) {
  // Intl respeta el idioma y la zona del evento, aunque el visitante viaje.
  return new Intl.DateTimeFormat('es-MX', {
    timeZone: event.timeZone,
    ...options
  }).format(new Date(event.startsAt));
}

function scrollToContact() {
  // El foco permite que una persona con teclado continúe en el formulario.
  const firstField = document.querySelector('#contact-name');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  firstField.focus({ preventScroll: true });
  document.querySelector('#contacto').scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
}


/* ===== FUENTE: js/utils/validators.js ===== */
/** Funciones puras: reciben valores y devuelven errores, sin tocar la página. */
function validateContact(values) {
  const errors = {};
  // trim elimina espacios de los extremos: un campo con solo espacios está vacío.
  const name = String(values.name || '').trim();
  const email = String(values.email || '').trim();
  const phone = String(values.phone || '').trim();
  const subject = String(values.subject || '').trim();
  const message = String(values.message || '').trim();
  const allowedTypes = ['Estudiante', 'Profesional', 'Empresa', 'Emprendedor', 'Otro'];

  // Las longitudes también se revisan en JavaScript: no dependemos de maxlength.
  if (name.length < 2 || name.length > 80) {
    errors.name = 'Escribe un nombre de entre 2 y 80 caracteres.';
  }

  // Esta expresión regular detecta errores comunes; no comprueba que el buzón exista.
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Escribe un correo válido, por ejemplo nombre@dominio.com.';
  }

  // El teléfono es opcional. Si se escribe, admitimos un + inicial y separadores.
  const digits = phone.replace(/\D/g, '');
  if (phone && (!/^\+?[\d\s().-]+$/.test(phone) || digits.length < 7 || digits.length > 15)) {
    errors.phone = 'Usa entre 7 y 15 dígitos; puedes incluir un + al inicio.';
  }

  if (!allowedTypes.includes(values.userType)) {
    errors.userType = 'Selecciona el perfil con el que te identificas.';
  }

  if (subject.length < 3 || subject.length > 120) {
    errors.subject = 'Escribe un asunto de entre 3 y 120 caracteres.';
  }

  if (message.length < 20 || message.length > 2000) {
    errors.message = 'Cuéntanos un poco más: escribe entre 20 y 2000 caracteres.';
  }

  // Un objeto sin propiedades significa que no encontramos errores.
  return errors;
}

function isSafeWebUrl(value) {
  // new URL interpreta la dirección. Permitimos solo HTTPS para los canales externos.
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}


/* ===== FUENTE: js/models/EventModel.js ===== */
/** MODEL: administra información; no busca elementos ni escribe HTML. */
class EventModel {
  // constructor se ejecuta con new EventModel(datos). Guardamos una copia
  // de cada objeto con map para no cambiar accidentalmente el array original.
  constructor(events = []) {
    this.events = events.map((event) => ({ ...event }));
  }

  // Métodos: funciones que pertenecen a la clase. Ordenamos una copia;
  // sort modifica su array, por eso usamos [...] antes de ordenar por fecha.
  getAll() {
    return [...this.events].sort((a, b) => new Date(a.startsAt) - new Date(b.startsAt));
  }

  // filter conserva solo los objetos de la categoría solicitada.
  getByCategory(category = 'all') {
    const events = this.getAll();
    return category === 'all' ? events : events.filter((event) => event.category === category);
  }

  // find devuelve un evento o undefined. El controlador maneja esa ausencia.
  getById(id) {
    return this.events.find((event) => event.id === id);
  }
}


/* ===== FUENTE: js/models/CommunityModel.js ===== */
/** MODEL: ofrece los datos de comunidad sin conocer el DOM. */
class CommunityModel {
  // Recibir datos permite reutilizar este modelo con un JSON o una API futura.
  constructor(data) {
    this.data = data;
  }

  // Devolvemos copias sencillas: la vista no necesita modificar la fuente.
  getFAQs() {
    return this.data.faqs.map((faq) => ({ ...faq }));
  }

  getContact() {
    return { ...this.data.contact };
  }

  getSocialLinks() {
    return this.data.socialLinks.map((link) => ({ ...link }));
  }
}


/* ===== FUENTE: js/views/EventView.js ===== */

/** VIEW: convierte objetos en tarjetas; no decide qué eventos deben mostrarse. */
class EventView {
  constructor() {
    // Guardamos referencias porque render() volverá a utilizarlas al filtrar.
    this.container = document.querySelector('#events-grid');
    this.filters = document.querySelector('#event-filters');
    this.status = document.querySelector('#events-status');
    this.notice = document.querySelector('#events-demo-notice');
    this.dialog = document.querySelector('#event-dialog');
    this.dialogBody = document.querySelector('#event-dialog-body');
    this.lastTrigger = null;

    // El elemento dialog administra el foco modal y la tecla Escape de forma nativa.
    this.dialog.querySelector('[data-close-dialog]').addEventListener('click', () => this.dialog.close());
    this.dialog.addEventListener('close', () => {
      if (this.lastTrigger && this.lastTrigger.isConnected) this.lastTrigger.focus();
    });
    // Cerramos al pulsar fuera del rectángulo del diálogo, no en su espacio interior.
    this.dialog.addEventListener('click', (event) => {
      const box = this.dialog.getBoundingClientRect();
      const outside = event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom;
      if (event.target === this.dialog && outside) this.dialog.close();
    });
  }

  render(events) {
    // DocumentFragment reúne nodos antes de insertarlos; replaceChildren evita duplicados.
    const fragment = document.createDocumentFragment();
    events.forEach((event) => fragment.append(this.createCard(event)));
    if (events.length === 0) fragment.append(createElement('p', 'empty-state', 'Pronto compartiremos más encuentros en esta categoría.'));
    this.container.replaceChildren(fragment);
    this.status.textContent = `${events.length} ${events.length === 1 ? 'evento mostrado' : 'eventos mostrados'}.`;
  }

  createCard(event) {
    const card = createElement('article', 'event-card');
    const head = createElement('div', 'event-card-top');
    const date = createElement('time', 'date-tile');
    date.dateTime = event.startsAt;
    date.setAttribute('aria-label', formatEventDate(event, { dateStyle: 'full' }));
    date.append(createElement('span', 'date-day', formatEventDate(event, { day: '2-digit' })));
    date.append(createElement('span', 'date-month', formatEventDate(event, { month: 'short', year: 'numeric' }).replace('.', '')));
    const labels = createElement('div', 'event-labels');
    labels.append(createElement('span', 'tag', event.category));
    if (event.isDemo) labels.append(createElement('span', 'demo-label', 'DEMO'));
    head.append(date, labels);

    const body = createElement('div', 'event-card-body');
    const topic = createElement('p', 'eyebrow small', event.topic);
    const title = createElement('h3', '', event.title);
    title.id = `event-title-${event.id}`;
    card.setAttribute('aria-labelledby', title.id);
    const meta = createElement('ul', 'event-meta');
    // forEach ejecuta una función por elemento. Cada fila tiene un icono y texto.
    [
      ['pin', event.location],
      ['clock', `${formatEventDate(event, { hour: '2-digit', minute: '2-digit', hour12: false })} h · Ciudad de México`],
      ['person', event.speaker]
    ].forEach(([icon, text]) => {
      const item = createElement('li');
      item.append(createIcon(icon), createElement('span', '', text));
      meta.append(item);
    });
    const button = createElement('button', 'text-button', 'Más información');
    button.type = 'button';
    // dataset vincula la tarjeta con su objeto de datos sin copiar lógica al HTML.
    button.dataset.eventId = event.id;
    button.setAttribute('aria-label', `Más información sobre ${event.title}`);
    button.append(createIcon('arrow'));
    body.append(topic, title, meta, button);
    card.append(head, body);
    return card;
  }

  setDemoNotice(events) {
    const hasDemo = events.some((event) => event.isDemo);
    this.notice.hidden = !hasDemo;
    this.notice.textContent = hasDemo ? 'DATOS DE DEMOSTRACIÓN · Los eventos marcados DEMO son ejemplos, no convocatorias reales.' : '';
  }

  setActiveFilter(category) {
    this.filters.querySelectorAll('[data-event-filter]').forEach((button) => {
      // aria-pressed comunica qué filtro está activo, además de su color visual.
      button.setAttribute('aria-pressed', String(button.dataset.eventFilter === category));
    });
  }

  bindFilter(handler) {
    // Delegación: un solo listener sirve para todos los botones de este contenedor.
    this.filters.addEventListener('click', (event) => {
      const button = event.target.closest('[data-event-filter]');
      if (button) handler(button.dataset.eventFilter);
    });
  }

  bindDetails(handler) {
    this.container.addEventListener('click', (event) => {
      const button = event.target.closest('[data-event-id]');
      if (button) handler(button.dataset.eventId, button);
    });
  }

  showDetails(event, trigger) {
    this.lastTrigger = trigger;
    document.querySelector('#event-dialog-title').textContent = event.title;
    const notice = createElement('p', 'notice', 'DATOS DE DEMOSTRACIÓN · Esta actividad no es una convocatoria real.');
    notice.hidden = !event.isDemo;
    const description = createElement('p', 'dialog-description', event.description);
    const details = createElement('dl', 'detail-list');
    // Las listas de definición relacionan cada etiqueta con su valor de forma semántica.
    const rows = [
      ['Fecha', formatEventDate(event, { dateStyle: 'full' })],
      ['Horario', `${formatEventDate(event, { hour: '2-digit', minute: '2-digit', hour12: false })} h · Ciudad de México`],
      ['Lugar', event.location], ['Tema', event.topic], ['Ponente', event.speaker],
      ['Duración', event.duration], ['Costo', event.cost], ['Dirigido a', event.audience]
    ];
    rows.forEach(([label, value]) => {
      const row = createElement('div');
      row.append(createElement('dt', '', label), createElement('dd', '', value));
      details.append(row);
    });
    // El botón prellena el contacto; no anuncia una inscripción inexistente.
    const interest = createElement('button', 'button button-primary', 'Me interesa este tema');
    interest.type = 'button';
    interest.dataset.contactSubject = `Me interesa: ${event.title}`;
    this.dialogBody.replaceChildren(notice, description, details, interest);
    this.dialog.showModal();
  }
}


/* ===== FUENTE: js/views/FAQView.js ===== */

/** VIEW: dibuja preguntas y cambia su estado visual/accesible. */
class FAQView {
  constructor() {
    this.container = document.querySelector('#faq-list');
  }

  render(faqs) {
    const fragment = document.createDocumentFragment();
    faqs.forEach((faq, index) => {
      const item = createElement('div', 'faq-item');
      const heading = createElement('h3');
      const button = createElement('button', 'faq-button');
      button.type = 'button';
      button.id = `faq-button-${faq.id}`;
      button.dataset.faqId = faq.id;
      button.setAttribute('aria-expanded', 'false');
      button.setAttribute('aria-controls', `faq-panel-${faq.id}`);
      const number = createElement('span', 'faq-number', String(index + 1).padStart(2, '0'));
      number.setAttribute('aria-hidden', 'true');
      button.append(number, createElement('span', 'faq-question', faq.question), createIcon('plus'));
      const panel = createElement('div', 'faq-panel');
      panel.id = `faq-panel-${faq.id}`;
      panel.hidden = true;
      panel.setAttribute('role', 'region');
      panel.setAttribute('aria-labelledby', button.id);
      panel.append(createElement('p', '', faq.answer));
      heading.append(button);
      item.append(heading, panel);
      fragment.append(item);
    });
    this.container.replaceChildren(fragment);
  }

  setExpanded(id) {
    // Solo una respuesta permanece abierta. null cierra todas.
    this.container.querySelectorAll('[data-faq-id]').forEach((button) => {
      const expanded = button.dataset.faqId === id;
      button.setAttribute('aria-expanded', String(expanded));
      document.getElementById(button.getAttribute('aria-controls')).hidden = !expanded;
    });
  }

  bindToggle(handler) {
    this.container.addEventListener('click', (event) => {
      const button = event.target.closest('[data-faq-id]');
      if (button) handler(button.dataset.faqId);
    });
    // Enter y Espacio ya funcionan en button; añadimos flechas, Inicio y Fin.
    this.container.addEventListener('keydown', (event) => {
      const buttons = [...this.container.querySelectorAll('[data-faq-id]')];
      const index = buttons.indexOf(event.target);
      if (index < 0) return;
      let target = index; // let permite reasignar el destino según la tecla.
      if (event.key === 'ArrowDown') target = (index + 1) % buttons.length;
      else if (event.key === 'ArrowUp') target = (index - 1 + buttons.length) % buttons.length;
      else if (event.key === 'Home') target = 0;
      else if (event.key === 'End') target = buttons.length - 1;
      else return;
      event.preventDefault();
      buttons[target].focus();
    });
  }
}


/* ===== FUENTE: js/views/ContactView.js ===== */


/** VIEW: presenta campos, errores, confirmación y canales editables. */
class ContactView {
  constructor() {
    this.form = document.querySelector('#contact-form');
    this.status = document.querySelector('#contact-status');
    this.fields = ['name', 'email', 'phone', 'userType', 'subject', 'message'];
  }

  getValues() {
    // FormData obtiene los controles por su atributo name, no por sus etiquetas.
    return Object.fromEntries(new FormData(this.form).entries());
  }

  bindSubmit(handler) {
    this.form.addEventListener('submit', (event) => {
      event.preventDefault(); // Evita recargar o enviar a una dirección inexistente.
      handler(this.getValues());
    });
    // Solo habilitamos enviar cuando el listener ya impide una navegación real.
    this.form.querySelector('[type="submit"]').disabled = false;
  }

  bindInput(handler) {
    this.form.addEventListener('input', (event) => {
      this.status.textContent = '';
      this.status.className = 'form-status';
      handler(this.getValues(), event.target.name);
    });
  }

  showFieldError(name, message = '') {
    const field = this.form.elements.namedItem(name);
    if (!field) return;
    field.setAttribute('aria-invalid', message ? 'true' : 'false');
    document.getElementById(`${field.id}-error`).textContent = message;
  }

  showErrors(errors) {
    this.fields.forEach((name) => this.showFieldError(name, errors[name]));
    const first = this.fields.find((name) => errors[name]);
    if (first) {
      this.status.className = 'form-status is-error';
      this.status.textContent = 'Revisa los campos señalados para continuar.';
      this.form.elements.namedItem(first).focus();
    }
  }

  showSuccess() {
    // No usamos fetch, almacenamiento local ni correos: solo se simula la confirmación.
    this.status.className = 'form-status is-success';
    this.status.textContent = '¡Validación correcta! Esta es una demostración: tu mensaje no se envió ni se guardó.';
    this.status.focus({ preventScroll: true });
  }

  prefill(subject) {
    this.form.elements.namedItem('subject').value = subject;
    this.showFieldError('subject');
    this.status.textContent = '';
    this.status.className = 'form-status';
    scrollToContact();
  }

  renderContact(contact, socialLinks) {
    document.querySelectorAll('[data-contact-email]').forEach((container) => {
      // Un correo de ejemplo se muestra como texto; no abrimos una dirección ficticia.
      const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email);
      const element = createElement(contact.isDemo || !validEmail ? 'span' : 'a', '', contact.email);
      if (!contact.isDemo && validEmail) element.href = `mailto:${contact.email}`;
      container.replaceChildren(element);
    });
    document.querySelectorAll('[data-contact-demo]').forEach((label) => { label.hidden = !contact.isDemo; });
    const container = document.querySelector('#social-links');
    const fragment = document.createDocumentFragment();
    socialLinks.forEach((social) => {
      const item = createElement('li');
      if (isSafeWebUrl(social.url)) {
        const anchor = createElement('a', '', social.name);
        anchor.href = social.url;
        anchor.target = '_blank';
        anchor.rel = 'noopener noreferrer';
        anchor.setAttribute('aria-label', `${social.name} (abre una pestaña nueva)`);
        item.append(anchor);
      } else {
        item.append(createElement('span', 'social-pending', `${social.name} · próximamente`));
      }
      fragment.append(item);
    });
    container.replaceChildren(fragment);
  }
}


/* ===== FUENTE: js/controllers/EventController.js ===== */
/** CONTROLLER: solicita datos al modelo y entrega el resultado a la vista. */
class EventController {
  constructor(model, view) {
    this.model = model;
    this.view = view;
  }

  init() {
    this.view.setDemoNotice(this.model.getAll());
    this.view.render(this.model.getAll());
    // Las arrow functions conservan el this del controlador dentro del callback.
    this.view.bindFilter((category) => {
      this.view.setActiveFilter(category);
      this.view.render(this.model.getByCategory(category));
    });
    this.view.bindDetails((id, trigger) => {
      const event = this.model.getById(id);
      if (event) this.view.showDetails(event, trigger);
    });
  }
}


/* ===== FUENTE: js/controllers/FAQController.js ===== */
/** CONTROLLER: conserva el id de la pregunta abierta; la vista solo lo refleja. */
class FAQController {
  constructor(model, view) {
    this.model = model;
    this.view = view;
    this.openId = null;
  }

  init() {
    this.view.render(this.model.getFAQs());
    this.view.bindToggle((id) => {
      this.openId = this.openId === id ? null : id;
      this.view.setExpanded(this.openId);
    });
  }
}


/* ===== FUENTE: js/controllers/ContactController.js ===== */

/** CONTROLLER: coordina validación y vista. Aquí se conectaría un backend. */
class ContactController {
  constructor(model, view) {
    this.model = model;
    this.view = view;
    this.attempted = false;
  }

  init() {
    this.view.renderContact(this.model.getContact(), this.model.getSocialLinks());
    this.view.bindSubmit((values) => {
      this.attempted = true;
      const errors = validateContact(values);
      this.view.showErrors(errors);
      if (Object.keys(errors).length > 0) return;

      // DEMOSTRACIÓN: no hay una petición de red ni se guardan estos datos.
      // Futuro: llamar aquí a un servicio async que use fetch hacia PHP, Node.js,
      // Firebase, Supabase o una API. Mostrar éxito solo tras una respuesta exitosa.
      // El servidor debe repetir la validación y aplicar límites de uso; una
      // validación en el navegador puede omitirse y NO constituye seguridad backend.
      this.view.showSuccess();
    });
    this.view.bindInput((values, fieldName) => {
      // Tras el primer intento corregimos únicamente el error del campo editado.
      if (this.attempted) this.view.showFieldError(fieldName, validateContact(values)[fieldName]);
    });
  }

  prefill(subject) {
    this.view.prefill(subject);
  }
}


/* ===== FUENTE: js/controllers/NavigationController.js ===== */
/** Pequeño controlador de interfaz: menú móvil, enlaces de contacto y volver arriba. */
class NavigationController {
  constructor(contactController) {
    this.contactController = contactController;
    this.menuButton = document.querySelector('#menu-button');
    this.menu = document.querySelector('#main-navigation');
    this.topLink = document.querySelector('#back-to-top');
    // La misma frontera de 64rem se utiliza en responsive.css.
    this.desktop = window.matchMedia('(min-width: 64rem)');
  }

  setMenu(open, restoreFocus = false) {
    this.menu.classList.toggle('is-open', open);
    this.menuButton.setAttribute('aria-expanded', String(open));
    this.menuButton.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    if (restoreFocus) this.menuButton.focus();
  }

  init() {
    this.menuButton.addEventListener('click', () => {
      this.setMenu(this.menuButton.getAttribute('aria-expanded') !== 'true');
    });
    this.menu.addEventListener('click', (event) => {
      if (event.target.closest('a')) this.setMenu(false);
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && this.menuButton.getAttribute('aria-expanded') === 'true') this.setMenu(false, true);
    });
    document.addEventListener('click', (event) => {
      if (!event.target.closest('.site-header')) this.setMenu(false);
      const trigger = event.target.closest('[data-contact-subject]');
      if (!trigger) return;
      event.preventDefault();
      const dialog = document.querySelector('#event-dialog');
      // close emite su evento después; esperamos un frame para enfocar el formulario.
      if (dialog.open) {
        dialog.addEventListener('close', () => {
          requestAnimationFrame(() => this.contactController.prefill(trigger.dataset.contactSubject));
        }, { once: true });
        dialog.close();
      } else {
        this.contactController.prefill(trigger.dataset.contactSubject);
      }
    });
    this.desktop.addEventListener('change', () => this.setMenu(false));
    const updateTopLink = () => { this.topLink.hidden = window.scrollY < 600; };
    // passive indica que no bloquearemos el scroll; el navegador puede optimizarlo.
    window.addEventListener('scroll', updateTopLink, { passive: true });
    updateTopLink();
  }
}


/* ===== FUENTE: js/controllers/ThemeController.js ===== */
// La misma clave aparece en el script del <head> de index.html.
const THEME_STORAGE_KEY = 'nexobajio-theme';

/** CONTROLLER: alterna el modo claro/oscuro y recuerda la elección del visitante. */
class ThemeController {
  constructor() {
    this.root = document.documentElement;
    this.button = document.querySelector('#theme-toggle');
    this.themeColor = document.querySelector('meta[name="theme-color"]');
    this.systemDark = window.matchMedia('(prefers-color-scheme: dark)');
  }

  apply(theme) {
    const dark = theme === 'dark';
    // data-theme activa las variables de color definidas en variables.css.
    this.root.dataset.theme = dark ? 'dark' : 'light';
    this.button.setAttribute('aria-pressed', String(dark));
    this.themeColor.setAttribute('content', dark ? '#0B1220' : '#0F4C5C');
  }

  getSavedTheme() {
    // localStorage puede estar bloqueado (modo privado); entonces seguimos al sistema.
    try {
      return localStorage.getItem(THEME_STORAGE_KEY);
    } catch {
      return null;
    }
  }

  init() {
    this.apply(this.root.dataset.theme);
    this.button.hidden = false;
    this.button.addEventListener('click', () => {
      const next = this.root.dataset.theme === 'dark' ? 'light' : 'dark';
      this.apply(next);
      try {
        localStorage.setItem(THEME_STORAGE_KEY, next);
      } catch {
        // Sin almacenamiento el cambio funciona igual, solo que no se recuerda.
      }
    });
    // Si el visitante no ha elegido, acompañamos los cambios del sistema.
    this.systemDark.addEventListener('change', (event) => {
      if (!this.getSavedTheme()) this.apply(event.matches ? 'dark' : 'light');
    });
  }
}


/* ===== FUENTE: js/controllers/ScrollController.js ===== */
/**
 * CONTROLLER: efectos ligados al desplazamiento. Solo añade clases y variables CSS;
 * el aspecto de cada animación vive en css/animations.css.
 */
class ScrollController {
  constructor() {
    this.root = document.documentElement;
    this.header = document.querySelector('.site-header');
    this.heroVisual = document.querySelector('.hero-visual');
    this.navLinks = [...document.querySelectorAll('.main-navigation > a:not(.button)')];
    this.ticking = false;
  }

  init() {
    // motion-ready confirma al script del <head> que las animaciones tienen quien las active.
    this.root.classList.add('motion-ready');
    this.observeReveals();
    this.observeSections();
    // passive indica que no bloquearemos el scroll; rAF agrupa los cálculos por fotograma.
    window.addEventListener('scroll', () => this.requestUpdate(), { passive: true });
    window.addEventListener('resize', () => this.requestUpdate(), { passive: true });
    this.update();
  }

  observeReveals() {
    const targets = document.querySelectorAll('[data-reveal], [data-reveal-group]');
    // Sin animaciones permitidas no hay nada que esperar: mostramos todo de inmediato.
    if (!this.root.classList.contains('motion-ok')) {
      targets.forEach((element) => element.classList.add('is-revealed'));
      return;
    }
    // --i ordena la cascada; el tope evita esperas largas en listas extensas.
    document.querySelectorAll('[data-reveal-group]').forEach((group) => {
      [...group.children].forEach((child, index) => child.style.setProperty('--i', String(Math.min(index, 8))));
    });
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target); // Cada bloque se anima una sola vez.
      });
    }, { rootMargin: '0px 0px -12% 0px' }); // Esperamos a que el bloque suba un poco.
    targets.forEach((element) => observer.observe(element));
  }

  observeSections() {
    if (!('IntersectionObserver' in window)) return;
    // Map relaciona el id de cada sección con su enlace del menú.
    const links = new Map(this.navLinks.map((link) => [link.hash.slice(1), link]));
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const active = links.get(entry.target.id);
        this.navLinks.forEach((link) => link.classList.toggle('is-active', link === active));
      });
    }, { rootMargin: '-45% 0px -50% 0px' }); // Una franja en el centro de la pantalla.
    links.forEach((link, id) => {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    });
  }

  requestUpdate() {
    if (this.ticking) return;
    this.ticking = true;
    requestAnimationFrame(() => this.update());
  }

  update() {
    this.ticking = false;
    const scrolled = window.scrollY;
    const max = this.root.scrollHeight - window.innerHeight;
    const progress = max > 0 ? Math.min(scrolled / max, 1) : 0;
    this.root.style.setProperty('--scroll-progress', progress.toFixed(4));
    this.header.classList.toggle('is-scrolled', scrolled > 8);
    // El parallax se limita a las primeras pantallas, donde el hero sigue visible.
    if (this.heroVisual && this.root.classList.contains('motion-ok')) {
      this.heroVisual.style.setProperty('--parallax', `${(Math.min(scrolled, 600) * 0.06).toFixed(1)}px`);
    }
  }
}


/* ===== FUENTE: js/app.js ===== */
/**
 * PUNTO DE ENTRADA. Lee este archivo después de README.md.
 * import reúne piezas independientes; export en cada archivo indica qué comparte.
 * Estos dos primeros imports solo ejecutan los archivos de datos compartidos.
 */













function startApp() {
  // const evita reasignar la referencia. El contenido del objeto sí puede cambiar.
  const eventModel = new EventModel(globalThis.NexoBajioData.events);
  const communityModel = new CommunityModel(globalThis.NexoBajioData.community);
  const eventController = new EventController(eventModel, new EventView());
  const faqController = new FAQController(communityModel, new FAQView());
  const contactController = new ContactController(communityModel, new ContactView());

  // El orden importa: primero dibujamos contenido; después conectamos navegación.
  eventController.init();
  faqController.init();
  contactController.init();
  new NavigationController(contactController).init();
  new ThemeController().init();
  // Va al final: las tarjetas de eventos y el FAQ ya existen y entran en la cascada.
  new ScrollController().init();

  // El año siempre refleja el reloj del dispositivo sin editar el footer cada enero.
  document.querySelector('#current-year').textContent = String(new Date().getFullYear());
}

// type="module" y defer ejecutan después de analizar el HTML: el DOM ya existe.
startApp();

})();
