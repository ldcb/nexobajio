/** Utilidades pequeñas para no repetir la creación segura de elementos. */
export function createElement(tag, className = '', text = '') {
  // El DOM es la representación del HTML como objetos que JavaScript modifica.
  const element = document.createElement(tag);
  element.className = className;
  // textContent trata el texto como texto, nunca como etiquetas ejecutables.
  element.textContent = text;
  return element;
}

export function createIcon(name) {
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

export function formatEventDate(event, options) {
  // Intl respeta el idioma y la zona del evento, aunque el visitante viaje.
  return new Intl.DateTimeFormat('es-MX', {
    timeZone: event.timeZone,
    ...options
  }).format(new Date(event.startsAt));
}

export function scrollToContact() {
  // El foco permite que una persona con teclado continúe en el formulario.
  const firstField = document.querySelector('#contact-name');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  firstField.focus({ preventScroll: true });
  document.querySelector('#contacto').scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
}
