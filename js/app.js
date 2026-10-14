/**
 * PUNTO DE ENTRADA. Lee este archivo después de README.md.
 * import reúne piezas independientes; export en cada archivo indica qué comparte.
 * Estos dos primeros imports solo ejecutan los archivos de datos compartidos.
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
import { ThemeController } from './controllers/ThemeController.js';
import { ScrollController } from './controllers/ScrollController.js';

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
