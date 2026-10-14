import { createElement, createIcon, formatEventDate } from '../utils/dom.js';

/** VIEW: convierte objetos en tarjetas; no decide qué eventos deben mostrarse. */
export class EventView {
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
