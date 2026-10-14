import { createElement, scrollToContact } from '../utils/dom.js';
import { isSafeWebUrl } from '../utils/validators.js';

/** VIEW: presenta campos, errores, confirmación y canales editables. */
export class ContactView {
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
    // Sólo habilitamos enviar cuando el listener ya impide una navegación real.
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
    // No usamos fetch, almacenamiento local ni correos: sólo se simula la confirmación.
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
