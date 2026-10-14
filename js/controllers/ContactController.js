import { validateContact } from '../utils/validators.js';

/** CONTROLLER: coordina validación y vista. Aquí se conectaría un backend. */
export class ContactController {
  constructor(model, view) {
    this.model = model;
    this.view = view;
    this.attempted = false;
  }

  init() {
    this.view.renderContact(this.model.getContact(), this.model.getSocialLinks());
    this.view.bindSubmit((values) => {
      this.attempted = true;
      const errors = validateContact(values);
      this.view.showErrors(errors);
      if (Object.keys(errors).length > 0) return;

      // DEMOSTRACIÓN: no hay una petición de red ni se guardan estos datos.
      // Futuro: llamar aquí a un servicio async que use fetch hacia PHP, Node.js,
      // Firebase, Supabase o una API. Mostrar éxito solo tras una respuesta exitosa.
      // El servidor debe repetir la validación y aplicar límites de uso; una
      // validación en el navegador puede omitirse y NO constituye seguridad backend.
      this.view.showSuccess();
    });
    this.view.bindInput((values, fieldName) => {
      // Tras el primer intento corregimos únicamente el error del campo editado.
      if (this.attempted) this.view.showFieldError(fieldName, validateContact(values)[fieldName]);
    });
  }

  prefill(subject) {
    this.view.prefill(subject);
  }
}
