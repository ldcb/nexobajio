import { createElement, createIcon } from '../utils/dom.js';

/** VIEW: dibuja preguntas y cambia su estado visual/accesible. */
export class FAQView {
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
