/**
 * Chequeos reproducibles con Node.js, sin npm install ni dependencias.
 * Ejecutar: node tools/check.mjs
 * Prueban reglas de datos y controladores con vistas sustitutas; no simulan
 * un navegador completo ni demuestran por sí solos el aspecto responsive.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import '../js/data/events.js';
import '../js/data/community.js';
import { EventModel } from '../js/models/EventModel.js';
import { CommunityModel } from '../js/models/CommunityModel.js';
import { EventController } from '../js/controllers/EventController.js';
import { FAQController } from '../js/controllers/FAQController.js';
import { ContactController } from '../js/controllers/ContactController.js';
import { NavigationController } from '../js/controllers/NavigationController.js';
import { validateContact, isSafeWebUrl } from '../js/utils/validators.js';
import { Script } from 'node:vm';

let passed = 0;
// Cada test nombra una conducta observable; un fallo termina con código distinto de cero.
function test(name, check) {
  check();
  passed += 1;
  console.log(`✓ ${name}`);
}
const data = globalThis.NexoBajioData;
const model = new EventModel(data.events);
const community = new CommunityModel(data.community);
const valid = {
  name: 'María García', email: 'maria@example.com', phone: '', userType: 'Estudiante',
  subject: 'Quiero participar', message: 'Me interesa aprender desarrollo web en la comunidad.'
};

test('La agenda contiene ids únicos y fechas válidas', () => {
  assert.equal(new Set(data.events.map((event) => event.id)).size, data.events.length);
  data.events.forEach((event) => {
    assert.ok(Number.isFinite(Date.parse(event.startsAt)));
    assert.doesNotThrow(() => new Intl.DateTimeFormat('es-MX', { timeZone: event.timeZone }));
    ['title', 'category', 'location', 'topic', 'speaker', 'description'].forEach((key) => assert.ok(event[key]));
  });
});
test('El modelo ordena cronológicamente y no altera los datos originales', () => {
  const reversed = [...data.events].reverse();
  const sorted = new EventModel(reversed).getAll();
  assert.equal(sorted[0].id, data.events[0].id);
  assert.equal(reversed[0].id, data.events.at(-1).id);
});
test('Cada filtro devuelve su categoría y un filtro vacío no falla', () => {
  ['Charla', 'Taller', 'Meetup'].forEach((type) => {
    assert.equal(model.getByCategory(type).length, 1);
    assert.equal(model.getByCategory(type)[0].category, type);
  });
  assert.equal(model.getByCategory('all').length, 3);
  assert.equal(model.getByCategory('Inexistente').length, 0);
  assert.equal(model.getById('Inexistente'), undefined);
});
test('El controlador de eventos conecta filtros y detalles con el modelo', () => {
  const view = {
    setDemoNotice(events) { this.notice = events; },
    render(events) { this.events = events; },
    bindFilter(handler) { this.filter = handler; },
    bindDetails(handler) { this.details = handler; },
    setActiveFilter(category) { this.active = category; },
    showDetails(event, trigger) { this.selected = event; this.trigger = trigger; }
  };
  new EventController(model, view).init();
  assert.equal(view.events.length, 3);
  view.filter('Taller');
  assert.equal(view.events.length, 1);
  assert.equal(view.active, 'Taller');
  view.details(data.events[0].id, 'botón');
  assert.equal(view.selected.id, data.events[0].id);
  assert.equal(view.trigger, 'botón');
});
test('El FAQ abre, alterna y cierra una sola pregunta', () => {
  const view = {
    render(faqs) { this.faqs = faqs; },
    bindToggle(handler) { this.toggle = handler; },
    setExpanded(id) { this.open = id; }
  };
  new FAQController(community, view).init();
  assert.equal(view.faqs.length, 7);
  view.toggle('comunidad'); assert.equal(view.open, 'comunidad');
  view.toggle('costo'); assert.equal(view.open, 'costo');
  view.toggle('costo'); assert.equal(view.open, null);
});
test('Un formulario válido admite teléfono vacío y nombres con acentos', () => {
  assert.deepEqual(validateContact(valid), {});
  assert.deepEqual(validateContact({ ...valid, phone: '+52 (445) 123-4567' }), {});
});
test('Los campos obligatorios y el mensaje mínimo se revisan tras trim', () => {
  const errors = validateContact({});
  assert.deepEqual(Object.keys(errors), ['name', 'email', 'userType', 'subject', 'message']);
  assert.ok(validateContact({ ...valid, message: ' '.repeat(30) }).message);
  assert.ok(validateContact({ ...valid, message: 'x'.repeat(19) }).message);
  assert.equal(validateContact({ ...valid, message: 'x'.repeat(20) }).message, undefined);
});
test('Los límites máximos y los formatos inválidos son rechazados', () => {
  const cases = { name: 'a'.repeat(81), email: 'sin-arroba', phone: 'llámame', userType: 'Administrador', subject: 'x'.repeat(121), message: 'x'.repeat(2001) };
  for (const [field, value] of Object.entries(cases)) assert.ok(validateContact({ ...valid, [field]: value })[field]);
  assert.ok(validateContact({ ...valid, phone: '123456' }).phone);
  assert.ok(validateContact({ ...valid, phone: '1'.repeat(16) }).phone);
});
test('El contacto no confirma un envío inválido y sólo simula éxito válido', () => {
  const view = {
    renderContact(contact, links) { this.contact = contact; this.links = links; },
    bindSubmit(handler) { this.submit = handler; },
    bindInput(handler) { this.input = handler; },
    showErrors(errors) { this.errors = errors; },
    showSuccess() { this.successes = (this.successes || 0) + 1; },
    showFieldError(name, error) { this.field = [name, error]; },
    prefill(subject) { this.subject = subject; }
  };
  const controller = new ContactController(community, view);
  controller.init();
  view.submit({}); assert.equal(view.successes, undefined);
  view.submit(valid); assert.equal(view.successes, 1);
  view.input({ ...valid, email: 'incorrecto' }, 'email'); assert.ok(view.field[1]);
  controller.prefill('Orientación: redes'); assert.equal(view.subject, 'Orientación: redes');
});
test('Los enlaces de redes aceptan HTTPS y rechazan esquemas ejecutables', () => {
  assert.equal(isSafeWebUrl('https://example.com/comunidad'), true);
  ['', '#', 'javascript:alert(1)', 'data:text/html,test', 'http://example.com'].forEach((url) => assert.equal(isSafeWebUrl(url), false));
});
test('Los datos iniciales están etiquetados como ejemplos y sin redes inventadas', () => {
  assert.ok(data.events.every((event) => event.isDemo));
  assert.equal(data.community.contact.isDemo, true);
  assert.ok(data.community.contact.email.endsWith('.example'));
  assert.ok(data.community.socialLinks.every((link) => link.url === ''));
});
test('La página usa scripts locales diferidos y el envío empieza deshabilitado', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  assert.ok(html.includes('defer src="js/app.offline.js"'));
  assert.ok(html.includes('type="submit" disabled'));
  assert.ok(html.includes('id="events-grid" class="events-grid"></div>'));
  assert.ok(html.includes('lang="es-MX"'));
});

test('El agrupado es un script clásico válido, sin imports de módulos', () => {
  const source = readFileSync(new URL('../js/app.offline.js', import.meta.url), 'utf8');
  assert.doesNotThrow(() => new Script(source));
});

// Un doble de DOM permite probar la coordinación del menú sin afirmar una prueba visual.
// Registra estados y callbacks; no reproduce el motor de diseño ni eventos reales del navegador.
test('Menú: abrir, cerrar con Escape, cambio de ancho y retorno de foco', () => {
  const previousWindow = globalThis.window;
  const previousDocument = globalThis.document;
  const listeners = {};
  const attributes = { 'aria-expanded': 'false' };
  const classes = new Set();
  const button = {
    addEventListener(type, callback) { listeners[`button:${type}`] = callback; },
    setAttribute(key, value) { attributes[key] = value; },
    getAttribute(key) { return attributes[key]; },
    focus() { this.focused = true; }
  };
  const menu = {
    classList: { toggle(name, enabled) { if (enabled) classes.add(name); else classes.delete(name); } },
    addEventListener(type, callback) { listeners[`menu:${type}`] = callback; }
  };
  const topLink = {};
  const media = { addEventListener(type, callback) { listeners[`media:${type}`] = callback; } };
  const dialog = { open: false };
  const nodes = { '#menu-button': button, '#main-navigation': menu, '#back-to-top': topLink, '#event-dialog': dialog };
  globalThis.window = {
    scrollY: 0,
    matchMedia() { return media; },
    addEventListener(type, callback) { listeners[`window:${type}`] = callback; }
  };
  globalThis.document = {
    querySelector(selector) { return nodes[selector]; },
    addEventListener(type, callback) { listeners[`document:${type}`] = callback; }
  };
  const contact = { prefill(subject) { this.subject = subject; } };
  try {
    new NavigationController(contact).init();
    assert.equal(topLink.hidden, true);
    listeners['button:click']();
    assert.equal(attributes['aria-expanded'], 'true');
    assert.equal(classes.has('is-open'), true);
    listeners['document:keydown']({ key: 'Escape' });
    assert.equal(attributes['aria-expanded'], 'false');
    assert.equal(button.focused, true);
    listeners['button:click']();
    listeners['media:change']();
    assert.equal(classes.has('is-open'), false);
    window.scrollY = 700;
    listeners['window:scroll']();
    assert.equal(topLink.hidden, false);
    const trigger = { dataset: { contactSubject: 'Orientación: Mi computadora' } };
    listeners['document:click']({
      target: { closest(selector) { return selector === '[data-contact-subject]' ? trigger : null; } },
      preventDefault() {}
    });
    assert.equal(contact.subject, 'Orientación: Mi computadora');
  } finally {
    // Restauramos los objetos globales, incluso si una comprobación falla.
    if (previousWindow === undefined) delete globalThis.window;
    else globalThis.window = previousWindow;
    if (previousDocument === undefined) delete globalThis.document;
    else globalThis.document = previousDocument;
  }
});
console.log(`\n${passed} grupos de comprobaciones correctos. La prueba visual en navegador es independiente.`);
