/** Pequeño controlador de interfaz: menú móvil, enlaces de contacto y volver arriba. */
export class NavigationController {
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
