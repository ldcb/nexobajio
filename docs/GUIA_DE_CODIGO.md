# Guía de lectura del código

El objetivo es comprender el proyecto por partes. No necesitas empezar por el archivo agrupado: los módulos originales son más fáciles de seguir.

## HTML: estructura y significado

| Elemento o atributo | Función en esta página |
| --- | --- |
| `header` | Cabecera común con marca y menú. |
| `nav` | Región de navegación; `aria-label` distingue el menú principal del footer. |
| `main` | Contenido principal, sin cabecera ni pie. |
| `section` | Bloque temático, como eventos o comunidad. |
| `article` | Unidad con sentido propio, como una tarjeta de evento. |
| `button` | Una acción: abrir, filtrar, validar. A diferencia de un enlace, no navega por sí mismo. |
| `a` | Un destino: otra sección, correo o canal externo real. |
| `form` | Controles que representan un conjunto de datos. |
| `label` | Nombre visible del control, vinculado a su `id` mediante `for`. |
| `footer` | Pie con datos finales y navegación secundaria. |
| `class` | Agrupa estilos o identifica varios elementos del mismo tipo. |
| `id` | Nombre único para enlaces internos, referencias y selección desde JS. |
| `data-*` | Guarda datos breves para el comportamiento, como `data-event-filter`. |
| `aria-label` | Aporta nombre accesible cuando el contenido visible no basta, por ejemplo un botón con ×. |
| `aria-expanded` | Informa si un menú o respuesta está abierto. |
| `aria-describedby` | Relaciona un control con instrucciones o errores. |
| `hidden` | Oculta un elemento tanto visualmente como en el árbol de accesibilidad. |

Busca `#events-grid` en `index.html`. Está vacío: ése es el lugar donde `EventView` insertará los artículos. Las secciones informativas sí son HTML estático, porque no necesitan una consulta de datos.

Los símbolos SVG se definen una vez en la parte superior y se reutilizan con `<use href="#icon-arrow">`. Los iconos decorativos llevan `aria-hidden="true"`. La ilustración del hero tiene texto alternativo porque aporta el concepto de conexión.

## CSS: un sistema pequeño

Las hojas se cargan en orden. Una regla posterior puede completar o sustituir otra anterior, según su especificidad.

| Técnica | Por qué se utiliza |
| --- | --- |
| `:root` y variables | Cambiar un color o espacio sin buscarlo en cada componente. |
| Flexbox | Alinear botones, menús, iconos y contenido en una dirección. |
| Grid | Organizar columnas y filas de servicios, eventos y formulario. |
| `minmax(0, 1fr)` | Permitir que las columnas se reduzcan sin que un texto fuerce el ancho. |
| `clamp()` | Cambiar tamaños gradualmente entre un mínimo y un máximo. |
| Media queries | Reorganizar componentes según el ancho disponible. |
| `:hover` | Responder al puntero. No es el único estado disponible. |
| `:focus-visible` | Mostrar con claridad la posición del teclado. |
| `:nth-child()` | Introducir variaciones visuales pequeñas sin tocar los datos. |
| `transition` | Suavizar cambios de color o posición durante una interacción. |
| `prefers-reduced-motion` | Respetar la preferencia del sistema de reducir animaciones. |

### Unidades

- `px`: unidad CSS útil para bordes y detalles finos; no equivale necesariamente a un píxel físico de pantalla.
- `rem`: proporcional al tamaño raíz. Favorece un diseño que acompaña las preferencias de lectura.
- `%`: relativo a una dimensión de su contenedor, según la propiedad.
- `vw`: un centésimo del ancho de la ventana; sirve para tamaños fluidos.
- `vh`: un centésimo del alto de la ventana; limita la altura del diálogo.
- `dvh`: alto dinámico del área visible; ayuda al menú en móviles con barras que aparecen y desaparecen.
- `fr`: una fracción del espacio disponible en Grid.

Los breakpoints están en `responsive.css`: 64rem para el menú, 48rem para apilar secciones y 36rem para teléfonos. Son límites de diseño, no nombres de modelos de dispositivos.

## JavaScript: las piezas que aparecen realmente

| Concepto | Ejemplo del proyecto |
| --- | --- |
| `const` | Guarda una referencia que no se reasigna, como `eventModel`. No congela el objeto. |
| `let` | Permite cambiar una variable, como el índice de destino del teclado del FAQ. |
| Función | `validateContact(values)` recibe datos y devuelve errores. |
| Objeto | Un evento agrupa `title`, `startsAt`, `location` y otras propiedades. |
| Array | `events` reúne varios eventos dentro de `[]`. |
| Clase | `EventModel` define cómo crear modelos con datos y métodos. |
| Constructor | Se ejecuta al usar `new`; prepara las referencias o datos necesarios. |
| Método | `getByCategory()` pertenece a `EventModel`. |
| DOM | Árbol de objetos que representa la página y permite crear o cambiar elementos. |
| Evento | Una acción que el navegador comunica: `click`, `input`, `submit`, `keydown`. |
| `addEventListener` | Registra la función que responderá a un evento. |
| `map` | Produce otro array: se usa para copiar los objetos sin cambiar el original. |
| `forEach` | Recorre elementos para realizar una acción, como añadir sus tarjetas. |
| `filter` | Produce un array solo con los eventos de la categoría elegida. |
| `find` | Busca el evento que coincide con un identificador. |
| Template literal | Usa comillas invertidas para combinar texto y valores: `` `#icon-${name}` ``. |
| `import` | Trae una pieza de otro módulo o ejecuta un módulo de datos. |
| `export` | Declara qué clase o función ofrece un módulo a otros. |
| Callback | Función entregada a otra para ejecutarla después, por ejemplo al hacer clic. |

### Un clic recorrido paso a paso

1. El visitante pulsa el botón con `data-event-filter="Taller"`.
2. El listener registrado por `EventView.bindFilter()` obtiene `Taller`.
3. El callback del controlador llama a `EventModel.getByCategory('Taller')`.
4. El modelo devuelve un array con los eventos que cumplen esa categoría.
5. El controlador llama a `EventView.render(array)`.
6. La vista crea artículos con `document.createElement`, agrega texto con `textContent` y reemplaza el contenido de `#events-grid`.
7. El estado accesible anuncia cuántos eventos se muestran.

El modelo no sabe qué es una tarjeta y la vista no decide cómo ordenar los eventos. Esa separación es el objetivo educativo del MVC.

### Datos compartidos y módulos ES6

`events.js` y `community.js` son archivos de datos con JavaScript normal. Asignan un objeto a `globalThis.NexoBajioData`. Esto es una excepción consciente para compartir **una sola fuente editable** entre scripts clásicos y módulos.

La entrada modular los importa por sus efectos: `import './data/events.js'` ejecuta el archivo, sin pedir un export. Las clases y funciones restantes sí emplean `import` y `export` convencionales. La versión de doble clic agrupa esas clases dentro de una función para no exponerlas todas como globales.

## Validación no es lo mismo que seguridad del servidor

`validators.js` no toca el DOM: recibe los valores y devuelve un objeto. Si el objeto tiene claves, cada clave contiene el mensaje de error del campo correspondiente. Si está vacío, el formulario cumple las reglas locales.

`textContent` evita convertir el mensaje de alguien en código HTML ejecutable. Una expresión regular para correo no prueba que esa dirección exista, y cualquier validación frontend puede saltarse. Cuando exista backend, éste deberá validar de nuevo y controlar quién puede escribir y con qué límites.

## Experimentos pequeños para aprender

1. Cambia el título del primer evento y recarga `index.html`. Verás que no se necesita reconstruir.
2. Deja `events` como `[]`: observa el estado de agenda vacía. Después restaura los datos.
3. Cambia `--color-primary` y recarga: observa qué componentes usan la variable.
4. Pulsa “Mi computadora”: revisa cómo el asunto aparece en el formulario.
5. Envía el formulario vacío: observa el primer campo enfocado y los errores asociados.
6. Corrige el correo: su error se actualiza sin volver a pulsar enviar.
7. Abre el FAQ con teclado y prueba flechas, Inicio, Fin, Enter y Espacio.
8. Modifica un mensaje en una vista, ejecuta `python tools/build_offline.py` y compara las dos entradas.

Haz una copia del proyecto antes de experimentar si quieres conservar una versión inicial intacta.
