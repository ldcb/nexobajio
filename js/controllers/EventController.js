/** CONTROLLER: solicita datos al modelo y entrega el resultado a la vista. */
export class EventController {
  constructor(model, view) {
    this.model = model;
    this.view = view;
  }

  init() {
    this.view.setDemoNotice(this.model.getAll());
    this.view.render(this.model.getAll());
    // Las arrow functions conservan el this del controlador dentro del callback.
    this.view.bindFilter((category) => {
      this.view.setActiveFilter(category);
      this.view.render(this.model.getByCategory(category));
    });
    this.view.bindDetails((id, trigger) => {
      const event = this.model.getById(id);
      if (event) this.view.showDetails(event, trigger);
    });
  }
}
