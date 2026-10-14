/** MODEL: ofrece los datos de comunidad sin conocer el DOM. */
export class CommunityModel {
  // Recibir datos permite reutilizar este modelo con un JSON o una API futura.
  constructor(data) {
    this.data = data;
  }

  // Devolvemos copias sencillas: la vista no necesita modificar la fuente.
  getFAQs() {
    return this.data.faqs.map((faq) => ({ ...faq }));
  }

  getContact() {
    return { ...this.data.contact };
  }

  getSocialLinks() {
    return this.data.socialLinks.map((link) => ({ ...link }));
  }
}
