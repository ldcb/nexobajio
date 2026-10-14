/**
 * PUNTO DE ENTRADA. Lee este archivo después de README.md.
 * import reúne piezas independientes; export en cada archivo indica qué comparte.
 * Estos dos primeros imports sólo ejecutan los archivos de datos compartidos.
 */
import './data/events.js';
import './data/community.js';
import { EventModel } from './models/EventModel.js';
import { CommunityModel } from './models/CommunityModel.js';
import { EventView } from './views/EventView.js';
import { FAQView } from './views/FAQView.js';
import { ContactView } from './views/ContactView.js';
import { EventController } from './controllers/EventController.js';
import { FAQController } from './controllers/FAQController.js';
import { ContactController } from './controllers/ContactController.js';
import { NavigationController } from './controllers/NavigationController.js';

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

  // El año siempre refleja el reloj del dispositivo sin editar el footer cada enero.
  document.querySelector('#current-year').textContent = String(new Date().getFullYear());

  // El contenido es visible por defecto; la animación nunca oculta información esencial.
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if ('IntersectionObserver' in window && !reducedMotion) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target); // Cada bloque se anima una sola vez.
      });
    }, { threshold: 0.12 });
    document.querySelectorAll('[data-reveal]').forEach((element) => observer.observe(element));
  }
}

// type="module" y defer ejecutan después de analizar el HTML: el DOM ya existe.
startApp();
