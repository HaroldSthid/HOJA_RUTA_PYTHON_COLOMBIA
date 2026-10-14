'use strict';

/**
 * HOJA DE RUTA PYTHON — COLOMBIA 
 * Script Principal v3.0 (Octubre 2026)
 */

/* =============================================
   1. NAVEGACIÓN Y SIDEBAR ADAPTATIVO
   ============================================= */
function initSidebar() {
  var sidebar   = document.getElementById('sidebar');
  var fab       = document.getElementById('sidebar-fab');
  var reopenBtn = document.getElementById('sidebar-reopen');
  var overlay   = document.getElementById('sidebar-overlay');
  var closeBtn  = document.getElementById('sidebar-close');

  if (!sidebar) return;

  function syncAria() {
    var expanded = sidebar.classList.contains('is-open') ? 'true' : 'false';
    if (fab)       fab.setAttribute('aria-expanded', expanded);
    if (reopenBtn) reopenBtn.setAttribute('aria-expanded', expanded);
  }

  function openSidebar(moveFocus) {
    sidebar.classList.add('is-open');
    document.body.classList.add('sidebar-open');
    if (overlay)  overlay.classList.add('is-visible');
    if (reopenBtn) reopenBtn.classList.remove('is-visible');
    syncAria();
    if (moveFocus === true && closeBtn) closeBtn.focus();
  }

  function closeSidebar(returnFocusTo) {
    sidebar.classList.remove('is-open');
    document.body.classList.remove('sidebar-open');
    if (overlay) overlay.classList.remove('is-visible');
    if (reopenBtn && window.innerWidth >= 900) {
      reopenBtn.classList.add('is-visible');
    }
    syncAria();
    if (returnFocusTo && returnFocusTo.focus) returnFocusTo.focus();
  }

  if (closeBtn)  closeBtn.addEventListener('click', function () {
    closeSidebar(window.innerWidth < 900 ? fab : reopenBtn);
  });
  if (reopenBtn) reopenBtn.addEventListener('click', function () { openSidebar(true); });
  if (fab)       fab.addEventListener('click', function () { openSidebar(true); });
  if (overlay)   overlay.addEventListener('click', function () { closeSidebar(fab); });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && window.innerWidth < 900 && sidebar.classList.contains('is-open')) {
      closeSidebar(fab);
    }
  });

  if (window.innerWidth >= 900) {
    openSidebar();
  }

  window.addEventListener('resize', function () {
    if (window.innerWidth >= 900) {
      if (!sidebar.classList.contains('is-open')) openSidebar();
      if (overlay) overlay.classList.remove('is-visible');
    } else {
      sidebar.classList.remove('is-open');
      document.body.classList.remove('sidebar-open');
      if (reopenBtn) reopenBtn.classList.remove('is-visible');
      syncAria();
    }
  });

  document.querySelectorAll('.sidebar-link, .sidebar-sublink').forEach(function (link) {
    link.addEventListener('click', function () {
      if (window.innerWidth < 900) closeSidebar();
    });
  });
}

/* =============================================
   2. SCROLLSPY (SEGUIMIENTO DE SECCIONES)
   ============================================= */
function initScrollSpy() {
  if (!('IntersectionObserver' in window)) return;
  var links    = document.querySelectorAll('.sidebar-link[data-section]');
  var sections = [];

  links.forEach(function (link) {
    var id = link.getAttribute('data-section');
    var el = document.getElementById(id);
    if (el) sections.push({ el: el, link: link });
  });

  if (sections.length === 0) return;

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        var found = sections.find(function (s) { return s.el === entry.target; });
        if (found) {
          links.forEach(function (l) { l.classList.remove('is-active'); });
          found.link.classList.add('is-active');
        }
      }
    });
  }, { threshold: 0.12, rootMargin: '-50px 0px -45% 0px' });

  sections.forEach(function (s) { observer.observe(s.el); });
}

/* =============================================
   3. ACORDEONES MÓDULOS DE FASES
   ============================================= */
function initModuleToggles() {
  document.querySelectorAll('.module-toggle').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var targetId = btn.getAttribute('data-target');
      var content  = document.getElementById(targetId);
      if (!content) return;

      var isOpen = btn.getAttribute('aria-expanded') === 'true';
      if (isOpen) {
        btn.setAttribute('aria-expanded', 'false');
        content.hidden = true;
      } else {
        btn.setAttribute('aria-expanded', 'true');
        content.hidden = false;
      }
    });
  });
}

/* =============================================
   4. CHECKLIST INTERACTIVO (+30 HITOS & PERSISTENCIA)
   ============================================= */
var STORAGE_KEY  = 'py_ruta_checklist_v8';
var TOTAL        = 30;
var BLOCK_TOTALS = { b1: 5, b2: 5, b3: 5, b4: 5, b5: 5, b6: 5 };

function loadState() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
  catch (e) { return {}; }
}

function saveState(state) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
  catch (e) {}
}

function itemKey(cb) {
  var lbl = cb.closest('label');
  return lbl ? lbl.textContent.trim().substring(0, 90) : null;
}

function applyItem(cb, checked) {
  cb.checked = checked;
  var li = cb.closest('li');
  if (li) li.classList.toggle('is-checked', checked);
}

function refreshCounts() {
  var total = 0;
  Object.keys(BLOCK_TOTALS).forEach(function (bid) {
    var block   = document.getElementById('block-' + bid);
    var countEl = document.getElementById('count-' + bid);
    if (!block || !countEl) return;

    var done = 0;
    block.querySelectorAll('input[type="checkbox"]').forEach(function (cb) {
      if (cb.checked) done++;
    });

    countEl.textContent = done + ' / ' + BLOCK_TOTALS[bid];
    total += done;
  });

  var gEl = document.getElementById('cl-global-count');
  if (gEl) gEl.textContent = total + ' / ' + TOTAL + ' completados';

  var pct = Math.round((total / TOTAL) * 100);
  var bar = document.getElementById('sp-bar');
  var cnt = document.getElementById('sp-count');
  if (bar) bar.style.width = pct + '%';
  if (cnt) cnt.textContent = total + ' / ' + TOTAL;
}

function launchConfetti() {
  var colors = ['#ffd43b', '#4b8bbe', '#2fb350', '#e24329'];
  for (var i = 0; i < 25; i++) {
    var p = document.createElement('div');
    p.className = 'confetti-particle';
    p.style.left = (Math.random() * 80 + 10) + 'vw';
    p.style.background = colors[Math.floor(Math.random() * colors.length)];
    document.body.appendChild(p);
    setTimeout(function (particle) { particle.remove(); }, 2000, p);
  }
}

function initChecklist() {
  var state      = loadState();
  var checkboxes = document.querySelectorAll('.cl-list input[type="checkbox"]');

  checkboxes.forEach(function (cb) {
    var k = itemKey(cb);
    applyItem(cb, !!(k && state[k]));
  });
  refreshCounts();

  checkboxes.forEach(function (cb) {
    cb.addEventListener('change', function () {
      var k = itemKey(cb);
      if (!k) return;
      var s = loadState();
      if (cb.checked) s[k] = true; else delete s[k];
      saveState(s);
      applyItem(cb, cb.checked);
      refreshCounts();

      var block = cb.closest('.cl-block');
      if (block) {
        var blockCbs = block.querySelectorAll('input[type="checkbox"]');
        var allDone = Array.from(blockCbs).every(function (c) { return c.checked; });
        if (allDone && cb.checked) launchConfetti();
      }
    });
  });

  var resetBtn = document.getElementById('cl-reset');
  if (resetBtn) {
    resetBtn.addEventListener('click', function () {
      if (!confirm('¿Reiniciar todo el progreso guardado en el checklist?')) return;
      localStorage.removeItem(STORAGE_KEY);
      checkboxes.forEach(function (cb) { applyItem(cb, false); });
      refreshCounts();
    });
  }
}

/* =============================================
   5. PLAYGROUND INTERACTIVO CON PYODIDE
   ============================================= */
var pyodide        = null;
var pyodideLoading = false;
var pyodideReady   = false;
var PYODIDE_CDN    = 'https://cdn.jsdelivr.net/pyodide/v0.27.5/full/pyodide.js';

var STARTER = "# Código de prueba interactivo\nprint('¡Hola desde la Hoja de Ruta de Python Colombia!')\nfrutas = ['Manzana', 'Pera', 'Uva']\nfor fruta in frutas:\n    print(f'Procesando: {fruta}')";

function setOut(text, isError) {
  var el = document.getElementById('py-output');
  if (!el) return;
  el.textContent = text;
  el.className   = 'output-content' + (isError ? ' output-error' : '');
}

function setOutHTML(html) {
  var el = document.getElementById('py-output');
  if (!el) return;
  el.innerHTML = html;
  el.className = 'output-content';
}

function loadPyScript(cb) {
  if (document.getElementById('pyodide-script')) { cb(); return; }
  var s     = document.createElement('script');
  s.id      = 'pyodide-script';
  s.src     = PYODIDE_CDN;
  s.async   = true;
  s.onload  = cb;
  document.head.appendChild(s);
}

async function ensurePyodide() {
  if (pyodideReady)   return true;
  if (pyodideLoading) return false;
  pyodideLoading = true;
  setOutHTML('<span class="output-loading">Cargando intérprete de Python en el navegador...</span>');

  return new Promise(function (resolve) {
    loadPyScript(async function () {
      try {
        pyodide = await window.loadPyodide();
        pyodide.runPython("import sys, io\n_buf = io.StringIO()\nsys.stdout = _buf\nsys.stderr = _buf\n");
        pyodideReady   = true;
        pyodideLoading = false;
        setOutHTML('<span class="output-hint">Entorno listo. Presiona Ctrl+Enter para ejecutar.</span>');
        resolve(true);
      } catch (err) {
        pyodideLoading = false;
        setOut('Error al cargar Pyodide.', true);
        resolve(false);
      }
    });
  });
}

async function runPython() {
  var editor = document.getElementById('py-editor');
  if (!editor) return;
  var code = editor.value.trim();
  if (!code) return;
  var ok = await ensurePyodide();
  if (!ok) return;

  try {
    pyodide.runPython("_buf.truncate(0); _buf.seek(0)");
    pyodide.runPython(code);
    var output = pyodide.runPython("_buf.getvalue()");
    setOut(output || 'Ejecutado correctamente (sin salida en consola).', false);
  } catch (err) {
    setOut(err.message || String(err), true);
  }
}

function initPlayground() {
  var editor   = document.getElementById('py-editor');
  var runBtn   = document.getElementById('run-btn');
  var clearBtn = document.getElementById('clear-btn');
  if (!editor || !runBtn) return;

  editor.value = STARTER;
  runBtn.addEventListener('click', runPython);

  if (clearBtn) {
    clearBtn.addEventListener('click', function () {
      editor.value = '';
      setOutHTML('<span class="output-hint">Consola limpia.</span>');
    });
  }

  editor.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      runPython();
    }
  });
}

/* =============================================
   6. BARRA DE PROGRESO DE LECTURA Y REVEAL
   ============================================= */
function initReadProgress() {
  window.addEventListener('scroll', function () {
    var bar = document.getElementById('read-progress');
    if (!bar) return;
    var scrollable = document.documentElement.scrollHeight - window.innerHeight;
    var pct = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
    bar.style.width = pct + '%';
  }, { passive: true });
}

function initScrollReveal() {
  var sections = document.querySelectorAll('main > section');
  sections.forEach(function (sec) { sec.classList.add('reveal'); });

  if (!('IntersectionObserver' in window)) {
    sections.forEach(function (sec) { sec.classList.add('is-visible'); });
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.05 });

  sections.forEach(function (sec) { observer.observe(sec); });
}

/* =============================================
   INICIALIZACIÓN AL CARGAR EL DOM
   ============================================= */
document.addEventListener('DOMContentLoaded', function () {
  initSidebar();
  initScrollSpy();
  initModuleToggles();
  initChecklist();
  initPlayground();
  initReadProgress();
  initScrollReveal();
});