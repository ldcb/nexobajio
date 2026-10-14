/** Funciones puras: reciben valores y devuelven errores, sin tocar la página. */
export function validateContact(values) {
  const errors = {};
  // trim elimina espacios de los extremos: un campo con sólo espacios está vacío.
  const name = String(values.name || '').trim();
  const email = String(values.email || '').trim();
  const phone = String(values.phone || '').trim();
  const subject = String(values.subject || '').trim();
  const message = String(values.message || '').trim();
  const allowedTypes = ['Estudiante', 'Profesional', 'Empresa', 'Emprendedor', 'Otro'];

  // Las longitudes también se revisan en JavaScript: no dependemos de maxlength.
  if (name.length < 2 || name.length > 80) {
    errors.name = 'Escribe un nombre de entre 2 y 80 caracteres.';
  }

  // Esta expresión regular detecta errores comunes; no comprueba que el buzón exista.
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Escribe un correo válido, por ejemplo nombre@dominio.com.';
  }

  // El teléfono es opcional. Si se escribe, admitimos un + inicial y separadores.
  const digits = phone.replace(/\D/g, '');
  if (phone && (!/^\+?[\d\s().-]+$/.test(phone) || digits.length < 7 || digits.length > 15)) {
    errors.phone = 'Usa entre 7 y 15 dígitos; puedes incluir un + al inicio.';
  }

  if (!allowedTypes.includes(values.userType)) {
    errors.userType = 'Selecciona el perfil con el que te identificas.';
  }

  if (subject.length < 3 || subject.length > 120) {
    errors.subject = 'Escribe un asunto de entre 3 y 120 caracteres.';
  }

  if (message.length < 20 || message.length > 2000) {
    errors.message = 'Cuéntanos un poco más: escribe entre 20 y 2000 caracteres.';
  }

  // Un objeto sin propiedades significa que no encontramos errores.
  return errors;
}

export function isSafeWebUrl(value) {
  // new URL interpreta la dirección. Permitimos sólo HTTPS para los canales externos.
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}
