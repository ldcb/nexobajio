#!/usr/bin/env python3
"""Construye la versión de doble clic sin instalar bibliotecas.

Uso, desde la carpeta NexoBajio: python tools/build_offline.py
Los módulos conservan sus comentarios. Este pequeño empaquetador sólo soporta
el estilo de imports/exports usado en este proyecto, no todo el estándar JS.
"""

from pathlib import Path
import re

# __file__ permite encontrar el proyecto aunque ejecutes el script desde otra carpeta.
ROOT = Path(__file__).resolve().parents[1]

# El orden respeta dependencias: utilidades, modelos, vistas, controladores y entrada.
# Los datos se mantienen externos: cambiar events.js no requiere ejecutar este script.
MODULES = [
    'js/utils/dom.js',
    'js/utils/validators.js',
    'js/models/EventModel.js',
    'js/models/CommunityModel.js',
    'js/views/EventView.js',
    'js/views/FAQView.js',
    'js/views/ContactView.js',
    'js/controllers/EventController.js',
    'js/controllers/FAQController.js',
    'js/controllers/ContactController.js',
    'js/controllers/NavigationController.js',
    'js/app.js',
]

def build():
    """Devuelve el contenido sin ejecutarlo; los chequeos pueden verificar su sincronía."""
    parts = [
        '/* ARCHIVO GENERADO: edita los módulos originales y ejecuta tools/build_offline.py.\n'
        ' * Se conservan los comentarios para poder estudiar el código sin minificación.\n'
        ' * Los datos externos siguen en js/data/events.js y js/data/community.js. */\n',
        # La función inmediata crea un ámbito privado para no exponer todas las clases.
        '(function () {\n"use strict";\n',
    ]
    for relative_path in MODULES:
        source = (ROOT / relative_path).read_text(encoding='utf-8')
        # Todos los import del proyecto ocupan una línea; rechazamos formatos inesperados.
        source = re.sub(r'^import .+;\s*$', '', source, flags=re.MULTILINE)
        source = re.sub(r'^export (?=(?:class|function|const)\s)', '', source, flags=re.MULTILINE)
        if re.search(r'^\s*(?:import|export)\s', source, flags=re.MULTILINE):
            raise ValueError(f'Import/export no compatible en {relative_path}; revisa el empaquetador.')
        parts.append(f'\n/* ===== FUENTE: {relative_path} ===== */\n{source}\n')
    parts.append('})();\n')
    return ''.join(parts)

def module_page():
    """Genera la misma página visual con un punto de entrada ES6 para servidor local."""
    html = (ROOT / 'index.html').read_text(encoding='utf-8')
    scripts = '''<!-- APP-SCRIPTS:START -->
  <!-- Versión de estudio con módulos ES6: abre por http://localhost, no por file://. -->
  <script type="module" src="js/app.js"></script>
  <!-- Este diagnóstico funciona incluso si el navegador bloquea los imports de file://. -->
  <script>
    // Mostramos la explicación sin cargar el módulo cuando el protocolo es un archivo local.
    if (window.location.protocol === 'file:') {
      const notice = document.createElement('p');
      notice.className = 'notice';
      notice.textContent = 'Esta versión usa módulos ES6 y necesita servidor local. Para abrir con doble clic, usa index.html. Consulta README.md para ejecutar python -m http.server 8000.';
      document.body.prepend(notice);
    }
  </script>
  <!-- APP-SCRIPTS:END -->'''
    return re.sub(r'<!-- APP-SCRIPTS:START -->.*?<!-- APP-SCRIPTS:END -->', scripts, html, flags=re.DOTALL)

if __name__ == '__main__':
    (ROOT / 'js/app.offline.js').write_text(build(), encoding='utf-8')
    (ROOT / 'index.modulos.html').write_text(module_page(), encoding='utf-8')
    print('Actualizados: js/app.offline.js e index.modulos.html')
    print('Abre index.html con doble clic o sirve index.modulos.html mediante HTTP.')
