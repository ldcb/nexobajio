/**
 * CONTROLLER: efectos ligados al desplazamiento. Solo añade clases y variables CSS;
 * el aspecto de cada animación vive en css/animations.css.
 */
export class ScrollController {
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
