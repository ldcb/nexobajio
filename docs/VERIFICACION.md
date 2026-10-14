# Verificación del proyecto

Fecha de preparación: **14 de octubre de 2026**.

## Comprobaciones efectuadas

**14 grupos de pruebas de lógica aprobados**, reproducibles mediante `node tools/check.mjs` sin instalar dependencias:

1. Identificadores únicos, fechas y zonas horarias de los eventos.
2. Orden cronológico y conservación del array original.
3. Filtros por categoría, resultado vacío e identificador inexistente.
4. Coordinación entre modelo y vista para filtros y detalles.
5. Apertura, cambio y cierre de una pregunta frecuente.
6. Formulario válido con acentos y teléfono opcional.
7. Campos obligatorios, espacios vacíos y mensaje mínimo.
8. Límites máximos y formatos inválidos.
9. Bloqueo del éxito en formularios inválidos, confirmación simulada y asunto preparado.
10. Enlaces HTTPS aceptados y esquemas inseguros rechazados.
11. Etiquetas demo, correo de ejemplo y ausencia de redes inventadas.
12. Scripts diferidos, contenedor de eventos vacío y envío inicialmente deshabilitado.
13. Sintaxis del agrupado como script clásico, compatible con la carga sin módulos.
14. Coordinación del menú, Escape, cambio de ancho, foco, volver arriba y asunto de orientación usando un doble del DOM.

**331 comprobaciones estáticas aprobadas** durante la preparación:

- Referencias locales de ambas entradas, enlaces internos y existencia de recursos.
- IDs únicos, relaciones `aria-*`, controles etiquetados e imagen con texto alternativo.
- Un `h1`, diez secciones de contenido, cabecera, footer y trece áreas tecnológicas.
- Sintaxis de **16 archivos JavaScript** mediante Node.
- Resolución de imports y ausencia de asignaciones a `innerHTML` o llamadas a `eval()`.
- SVG bien formado en favicon e ilustración.
- Delimitadores CSS equilibrados, variables definidas y reglas responsive presentes.
- Reglas de movimiento reducido.
- Coincidencia exacta entre las fuentes y los archivos generados.
- Contraste matemático de los pares principales de texto.

| Texto / fondo | Contraste calculado |
| --- | ---: |
| Azul petróleo / blanco | 9.51:1 |
| Turquesa oscuro / blanco | 5.51:1 |
| Texto general / blanco | 7.89:1 |
| Texto secundario / gris claro | 5.73:1 |
| Error / fondo de error | 6.18:1 |
| Éxito / fondo de éxito | 6.73:1 |

Estos pares superan 4.5:1. El cálculo no constituye una auditoría completa de accesibilidad de toda la interfaz.

## Alcance y límites

El entorno de preparación no dispone de la herramienta de navegador necesaria para abrir y revisar visualmente esta página. **No se realizó una prueba en Edge, Chrome, Firefox, Safari ni un navegador móvil real.** No se afirma ausencia de mensajes en una consola real ni se presentan capturas de pruebas inexistentes.

Los tests de controladores utilizan vistas sustitutas y, para navegación, un doble pequeño del DOM. Verifican decisiones y cambios solicitados; no verifican el motor de renderizado, el foco nativo de `<dialog>`, los eventos reales, el tamaño final de los elementos o la interacción táctil.

La implementación incluye reglas para móvil, tablet y escritorio, y no depende de recursos remotos. Su comportamiento visual final y el zoom deben confirmarse en un navegador real. El balance de delimitadores CSS es una comprobación estática, no un analizador completo de todas las propiedades.

## Revisión manual rápida en tu equipo

| Acción | Resultado esperado |
| --- | --- |
| Extraer todo el ZIP y abrir `index.html` | Página con estilos, ilustración y tres tarjetas demo. |
| Desconectar internet y recargar | Recursos locales y funciones siguen disponibles. |
| Reducir a 320, 375, 768 y 1024 píxeles CSS | Menú y columnas se reorganizan; no aparece scroll horizontal. |
| Ampliar texto o zoom al 200 % | Contenido legible y controles alcanzables. |
| Abrir menú en móvil y pulsar Escape | Menú cerrado y foco devuelto al botón. |
| Pulsar Talleres y después Todos | Una tarjeta y después tres tarjetas. |
| Pulsar Más información | Diálogo con fecha, ubicación, ponente, costo y aviso demo. |
| Cerrar con Escape | Foco de regreso al botón que abrió el diálogo. |
| Elegir Me interesa este tema | Diálogo cerrado y asunto preparado en contacto. |
| Usar el FAQ con Enter/Espacio y flechas | Alternancia de respuestas y movimiento entre encabezados. |
| Enviar campos vacíos | Errores específicos y foco en el primer campo. |
| Completar los campos correctamente | Confirmación que dice que no se envió ni guardó información. |
| Activar movimiento reducido en el sistema | Sin scroll animado ni animaciones de entrada. |
| Desactivar JavaScript y recargar | Contenido estático visible, avisos y envío deshabilitado. |
| Abrir `index.modulos.html` desde HTTP local | Misma página usando los módulos originales. |
| Abrir las herramientas del navegador | Revisar consola y red durante estas acciones. |

Los eventos, el correo, las redes y el formulario continúan siendo de demostración hasta que se incorporen datos oficiales y, en el caso del formulario, un backend real.
