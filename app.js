/* =============================================
   HOJA DE RUTA PYTHON — COLOMBIA
   app.js v3 — Sidebar + ScrollSpy + Checklist + Playground
   ============================================= */
'use strict';

/* -----------------------------------------------
   1. SIDEBAR
   Comportamiento:
   - Desktop (>= 900px): siempre visible al cargar.
     El boton X dentro del header lo cierra.
     Cuando esta cerrado aparece una pestana en el
     borde izquierdo para reabrirlo.
     Los clicks en links NO lo cierran.
   - Movil (< 900px): cerrado por defecto.
     El FAB flotante lo abre.
     El overlay y el X lo cierran.
     Los clicks en links SI lo cierran.
   ----------------------------------------------- */
function initSidebar() {
  var sidebar   = document.getElementById('sidebar');
  var fab       = document.getElementById('sidebar-fab');
  var reopenBtn = document.getElementById('sidebar-reopen');
  var overlay   = document.getElementById('sidebar-overlay');
  var closeBtn  = document.getElementById('sidebar-close');

  if (!sidebar) return;

  function openSidebar() {
    sidebar.classList.add('is-open');
    document.body.classList.add('sidebar-open');
    if (overlay)   overlay.classList.add('is-visible');
    if (reopenBtn) reopenBtn.classList.remove('is-visible');
  }

  function closeSidebar() {
    sidebar.classList.remove('is-open');
    document.body.classList.remove('sidebar-open');
    if (overlay) overlay.classList.remove('is-visible');
    // Mostrar pestaña de reabrir solo en desktop
    if (reopenBtn && window.innerWidth >= 900) {
      reopenBtn.classList.add('is-visible');
    }
  }

  // Controles
  if (closeBtn)  closeBtn.addEventListener('click', closeSidebar);
  if (reopenBtn) reopenBtn.addEventListener('click', openSidebar);
  if (fab)       fab.addEventListener('click', openSidebar);
  if (overlay)   overlay.addEventListener('click', closeSidebar);

  // Estado inicial
  if (window.innerWidth >= 900) {
    openSidebar();
  }

  // Redimensionar ventana
  window.addEventListener('resize', function () {
    if (window.innerWidth >= 900) {
      // Volver a abrir si se pasa a desktop
      if (!sidebar.classList.contains('is-open')) {
        openSidebar();
      }
      // Quitar overlay que quedara visible del modo movil
      if (overlay) overlay.classList.remove('is-visible');
    } else {
      // Pasar a movil: cerrar sidebar y limpiar padding
      sidebar.classList.remove('is-open');
      document.body.classList.remove('sidebar-open');
      if (reopenBtn) reopenBtn.classList.remove('is-visible');
    }
  });

  // Links del sidebar
  document.querySelectorAll('.sidebar-link, .sidebar-sublink').forEach(function (link) {
    link.addEventListener('click', function () {
      // En movil cerrar al navegar; en desktop NO tocar
      if (window.innerWidth < 900) {
        closeSidebar();
      }
    });
  });
}

/* -----------------------------------------------
   2. SCROLL SPY
   Resalta el link del sidebar de la seccion
   que el usuario esta viendo en ese momento.
   ----------------------------------------------- */
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

/* -----------------------------------------------
   3. ACORDEONES DE MODULOS
   ----------------------------------------------- */
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
        // Scroll suave al card despues de que el DOM se actualiza
        setTimeout(function () {
          var card = btn.closest('.module-card');
          if (card) card.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 80);
      }
    });
  });
}

/* -----------------------------------------------
   4. CHECKLIST con localStorage
   70 items en 6 bloques.
   El estado se persiste en el navegador.
   ----------------------------------------------- */
var STORAGE_KEY  = 'py_ruta_checklist_v1';
var TOTAL        = 70;
var BLOCK_TOTALS = { b0: 7, b1: 17, b2: 14, b3: 12, b4: 13, b5: 7 };

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
    countEl.classList.toggle('is-done', done === BLOCK_TOTALS[bid]);
    total += done;
  });

  // Global label
  var gEl = document.getElementById('cl-global-count');
  if (gEl) gEl.textContent = total + ' / ' + TOTAL + ' completados';

  // Barra del sidebar
  var pct  = Math.round((total / TOTAL) * 100);
  var bar  = document.getElementById('sp-bar');
  var cnt  = document.getElementById('sp-count');
  if (bar) bar.style.width = pct + '%';
  if (cnt) cnt.textContent = total + ' / ' + TOTAL;
}

function initChecklist() {
  var state     = loadState();
  var checkboxes = document.querySelectorAll('.cl-list input[type="checkbox"]');

  // Restaurar
  checkboxes.forEach(function (cb) {
    var k = itemKey(cb);
    applyItem(cb, !!(k && state[k]));
  });
  refreshCounts();

  // Cambios
  checkboxes.forEach(function (cb) {
    cb.addEventListener('change', function () {
      var k = itemKey(cb);
      if (!k) return;
      var s = loadState();
      if (cb.checked) s[k] = true; else delete s[k];
      saveState(s);
      applyItem(cb, cb.checked);
      refreshCounts();
    });
  });

  // Reset
  var resetBtn = document.getElementById('cl-reset');
  if (resetBtn) {
    resetBtn.addEventListener('click', function () {
      if (!confirm('Reiniciar todo el checklist? Esta accion no se puede deshacer.')) return;
      localStorage.removeItem(STORAGE_KEY);
      checkboxes.forEach(function (cb) { applyItem(cb, false); });
      refreshCounts();
    });
  }
}

/* -----------------------------------------------
   5. PLAYGROUND PYTHON — Pyodide via CDN
   Carga lazy cuando la seccion entra en viewport.
   Ctrl+Enter ejecuta desde el teclado.
   Tab inserta 4 espacios.
   ----------------------------------------------- */
var pyodide        = null;
var pyodideLoading = false;
var pyodideReady   = false;
var PYODIDE_CDN    = 'https://cdn.jsdelivr.net/pyodide/v0.27.5/full/pyodide.js';

var STARTER = [
  "# Estructuras del track de Python",
  "frutas  = ['manzana', 'naranja', 'pera', 'uva']",
  "numeros = [10, 25, 7, 42, 18, 3]",
  "",
  "gastos = {",
  "    'enero':   {'alimentacion': 450000, 'transporte': 120000},",
  "    'febrero': {'alimentacion': 380000, 'transporte':  95000},",
  "    'marzo':   {'alimentacion': 520000, 'transporte': 140000}",
  "}",
  "",
  "print(f'Suma numeros: {sum(numeros)}')",
  "print('Frutas:', sorted(frutas))",
  "print()",
  "for mes, cats in gastos.items():",
  "    t = sum(cats.values())",
  "    print(f'{mes.capitalize():10s}: $ {t:,}')"
].join('\n');

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
  s.onerror = function () {
    setOut('No se pudo cargar Pyodide.\nVerifica tu conexion a internet.', true);
  };
  document.head.appendChild(s);
}

async function ensurePyodide() {
  if (pyodideReady)   return true;
  if (pyodideLoading) return false;
  pyodideLoading = true;
  setOutHTML('<span class="output-loading">Cargando entorno Python (Pyodide)... primera carga puede tardar unos segundos.</span>');

  return new Promise(function (resolve) {
    loadPyScript(async function () {
      try {
        pyodide = await window.loadPyodide();
        pyodide.runPython(
          "import sys, io\n_buf = io.StringIO()\nsys.stdout = _buf\nsys.stderr = _buf\n"
        );
        pyodideReady   = true;
        pyodideLoading = false;
        setOutHTML('<span class="output-hint">Listo. Ctrl+Enter para ejecutar.</span>');
        resolve(true);
      } catch (err) {
        pyodideLoading = false;
        setOut('Error al inicializar Pyodide:\n' + (err.message || err), true);
        resolve(false);
      }
    });
  });
}

async function runPython() {
  var editor = document.getElementById('py-editor');
  if (!editor) return;
  var code = editor.value.trim();
  if (!code) {
    setOutHTML('<span class="output-hint">El editor esta vacio.</span>');
    return;
  }
  var ok = await ensurePyodide();
  if (!ok) return;

  try {
    pyodide.runPython("_buf.truncate(0); _buf.seek(0)");
    pyodide.runPython(code);
    var output = pyodide.runPython("_buf.getvalue()");
    if (output && output.trim()) {
      setOut(output, false);
    } else {
      setOutHTML('<span class="output-hint">Ejecutado sin salida. Usa print() para ver resultados.</span>');
    }
  } catch (err) {
    var msg   = (err.message || String(err));
    var lines = msg.split('\n').filter(function (l) {
      return l && !l.includes('pyodide') && !l.includes('_pyodide');
    });
    setOut(lines.join('\n') || msg, true);
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
      setOutHTML('<span class="output-hint">Editor limpiado.</span>');
    });
  }

  editor.addEventListener('keydown', function (e) {
    // Ctrl+Enter o Cmd+Enter ejecuta
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      runPython();
    }
    // Tab inserta 4 espacios
    if (e.key === 'Tab') {
      e.preventDefault();
      var s = editor.selectionStart;
      var end = editor.selectionEnd;
      editor.value = editor.value.substring(0, s) + '    ' + editor.value.substring(end);
      editor.selectionStart = editor.selectionEnd = s + 4;
    }
  });

  // Precarga Pyodide al llegar a la seccion
  var section = document.getElementById('playground');
  if (section && 'IntersectionObserver' in window) {
    var obs = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) { ensurePyodide(); obs.disconnect(); }
    }, { threshold: 0.1 });
    obs.observe(section);
  }
}

/* -----------------------------------------------
   INIT
   ----------------------------------------------- */
document.addEventListener('DOMContentLoaded', function () {
  initSidebar();
  initScrollSpy();
  initModuleToggles();
  initChecklist();
  initPlayground();
  initReadProgress();
  initScrollReveal();
  initHeroStats();
  initPhasePipeline();
  initFlipCards();
  initTopicAccordions();
  initModuleTabs();
  initConfetti();
  initTypewriter();
});

/* =============================================
   NEW INTERACTIVE FEATURES
   ============================================= */

/* --- FEATURE 1: READ PROGRESS BAR --- */
function initReadProgress() {
  var bar = document.createElement('div');
  bar.id = 'read-progress';
  bar.style.cssText = 'position:fixed;top:0;left:0;height:3px;width:0%;background:var(--yellow);z-index:9999;transition:width 0.1s ease;pointer-events:none;';
  document.body.appendChild(bar);
  window.addEventListener('scroll', function () {
    var scrollable = document.documentElement.scrollHeight - window.innerHeight;
    var pct = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
    bar.style.width = pct + '%';
  }, { passive: true });
}

/* --- FEATURE 2: SCROLL REVEAL --- */
function initScrollReveal() {
  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('main > section.reveal').forEach(function (s) {
      s.classList.add('is-visible');
    });
    return;
  }
  var sections = document.querySelectorAll('main > section.reveal');
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });
  sections.forEach(function (s) {
    var rect = s.getBoundingClientRect();
    if (rect.top < 50) {
      s.classList.add('is-visible');
    } else {
      observer.observe(s);
    }
  });
}

/* --- FEATURE 3: HERO STATS COUNTER --- */
function initHeroStats() {
  var statsEl = document.querySelector('.hero-stats');
  if (!statsEl || !('IntersectionObserver' in window)) return;
  var ran = false;
  var observer = new IntersectionObserver(function (entries) {
    if (!entries[0].isIntersecting || ran) return;
    ran = true;
    observer.disconnect();
    statsEl.querySelectorAll('.stat-num').forEach(function (el) {
      var target = parseInt(el.getAttribute('data-target'), 10);
      var start = performance.now();
      var duration = 1500;
      function step(now) {
        var elapsed = now - start;
        var progress = Math.min(elapsed / duration, 1);
        // easeOut cubic
        var eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(eased * target);
        if (progress < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }, { threshold: 0.5 });
  observer.observe(statsEl);
}

/* --- FEATURE 4: PHASE PIPELINE --- */
function initPhasePipeline() {
  var nodes = document.querySelectorAll('.pipe-node');
  var phases = document.querySelectorAll('.phase');
  nodes.forEach(function (node) {
    node.addEventListener('click', function () {
      var idx = parseInt(node.getAttribute('data-phase'), 10) - 1;
      var phase = phases[idx];
      if (phase) phase.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  });
}

/* --- FEATURE 5: FLIP CARDS (touch toggle) --- */
function initFlipCards() {
  document.querySelectorAll('.flip-card').forEach(function (card) {
    card.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'touch') {
        card.classList.toggle('is-flipped');
      }
    });
  });
}

/* --- FEATURE 6: TOPIC ACCORDIONS --- */
function initTopicAccordions() {
  document.querySelectorAll('.topics').forEach(function (topicsGroup) {
    var headers = topicsGroup.querySelectorAll('.topic-header');
    headers.forEach(function (header, idx) {
      var body = header.nextElementSibling;
      if (!body || !body.classList.contains('topic-body')) return;
      // Collapse all except first
      if (idx === 0) {
        body.style.maxHeight = body.scrollHeight + 'px';
        header.setAttribute('aria-expanded', 'true');
        header.classList.add('is-open');
      } else {
        body.style.maxHeight = '0';
        body.style.paddingTop = '0';
        body.style.paddingBottom = '0';
        header.setAttribute('aria-expanded', 'false');
      }
      header.addEventListener('click', function () {
        var isOpen = header.getAttribute('aria-expanded') === 'true';
        if (isOpen) {
          body.style.maxHeight = '0';
          body.style.paddingTop = '0';
          body.style.paddingBottom = '0';
          header.setAttribute('aria-expanded', 'false');
          header.classList.remove('is-open');
        } else {
          body.style.maxHeight = body.scrollHeight + 'px';
          body.style.paddingTop = '';
          body.style.paddingBottom = '';
          header.setAttribute('aria-expanded', 'true');
          header.classList.add('is-open');
        }
      });
    });
  });
}

/* --- FEATURE 7: MODULE TABS --- */
function initModuleTabs() {
  document.querySelectorAll('.module-content').forEach(function (mc) {
    var btns = mc.querySelectorAll('.tab-btn');
    var panels = mc.querySelectorAll('.tab-panel');
    if (!btns.length || !panels.length) return;
    btns.forEach(function (btn, i) {
      btn.addEventListener('click', function () {
        btns.forEach(function (b) { b.classList.remove('is-active'); });
        panels.forEach(function (p) { p.classList.remove('is-active'); });
        btn.classList.add('is-active');
        var tab = btn.getAttribute('data-tab');
        var targetPanel = mc.querySelector('.tab-panel[data-tab="' + tab + '"]');
        if (targetPanel) targetPanel.classList.add('is-active');
      });
    });
  });
}

/* --- FEATURE 9: CHECKLIST CONFETTI --- */
function initConfetti() {
  var colors = ['#ffd43b', '#4b8bbe', '#2fb350', '#e24329'];
  document.querySelectorAll('.cl-block').forEach(function (block) {
    var checkboxes = block.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(function (cb) {
      cb.addEventListener('change', function () {
        var all = Array.from(checkboxes);
        if (all.every(function (c) { return c.checked; })) {
          launchConfetti(colors);
        }
      });
    });
  });
}

function launchConfetti(colors) {
  for (var i = 0; i < 35; i++) {
    (function () {
      var p = document.createElement('div');
      p.className = 'confetti-particle';
      p.style.left = Math.random() * 100 + 'vw';
      p.style.background = colors[Math.floor(Math.random() * colors.length)];
      p.style.animationDelay = (Math.random() * 0.4) + 's';
      p.style.transform = 'translateX(' + (Math.random() * 60 - 30) + 'px)';
      document.body.appendChild(p);
      setTimeout(function () { p.remove(); }, 2500);
    })();
  }
}

/* --- FEATURE 10: TYPEWRITER --- */
function initTypewriter() {
  var staticEl  = document.getElementById('tw-static');
  var dynamicEl = document.getElementById('tw-dynamic');
  if (!staticEl || !dynamicEl) return;
  var staticText  = 'Empeza por la guia, ';
  var dynamicText = 'no por el repo';
  var si = 0;
  function typeStatic() {
    if (si < staticText.length) {
      staticEl.textContent += staticText[si];
      si++;
      setTimeout(typeStatic, 60);
    } else {
      var di = 0;
      function typeDynamic() {
        if (di < dynamicText.length) {
          dynamicEl.textContent += dynamicText[di];
          di++;
          setTimeout(typeDynamic, 60);
        }
      }
      typeDynamic();
    }
  }
  typeStatic();
}
