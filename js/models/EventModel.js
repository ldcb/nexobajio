/** MODEL: administra información; no busca elementos ni escribe HTML. */
export class EventModel {
  // constructor se ejecuta con new EventModel(datos). Guardamos una copia
  // de cada objeto con map para no cambiar accidentalmente el array original.
  constructor(events = []) {
    this.events = events.map((event) => ({ ...event }));
  }

  // Métodos: funciones que pertenecen a la clase. Ordenamos una copia;
  // sort modifica su array, por eso usamos [...] antes de ordenar por fecha.
  getAll() {
    return [...this.events].sort((a, b) => new Date(a.startsAt) - new Date(b.startsAt));
  }

  // filter conserva sólo los objetos de la categoría solicitada.
  getByCategory(category = 'all') {
    const events = this.getAll();
    return category === 'all' ? events : events.filter((event) => event.category === category);
  }

  // find devuelve un evento o undefined. El controlador maneja esa ausencia.
  getById(id) {
    return this.events.find((event) => event.id === id);
  }
}
