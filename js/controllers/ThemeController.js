// La misma clave aparece en el script del <head> de index.html.
const THEME_STORAGE_KEY = 'nexobajio-theme';

/** CONTROLLER: alterna el modo claro/oscuro y recuerda la elección del visitante. */
export class ThemeController {
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
