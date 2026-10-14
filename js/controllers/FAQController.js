/** CONTROLLER: conserva el id de la pregunta abierta; la vista sólo lo refleja. */
export class FAQController {
  constructor(model, view) {
    this.model = model;
    this.view = view;
    this.openId = null;
  }

  init() {
    this.view.render(this.model.getFAQs());
    this.view.bindToggle((id) => {
      this.openId = this.openId === id ? null : id;
      this.view.setExpanded(this.openId);
    });
  }
}
