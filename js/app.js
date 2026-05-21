/* ============================================================
   MINDCODE APP — Controle das telas (V1)
   ------------------------------------------------------------
   Orquestra o fluxo: boas-vindas -> questionario -> captura
   -> carregamento -> resultado. Le o Core e usa o Engine.
   Carrega depois de mindcode-core.js e engine.js.
   ============================================================ */

(function () {
  'use strict';

  var CORE = window.MINDCODE_CORE;
  var ENGINE = window.MindcodeEngine;

  if (!CORE || !ENGINE) {
    console.error('MINDCODE APP: Core ou Engine nao carregados.');
    return;
  }

  var WHATSAPP = '5554996453785'; // numero de contato (botao do Completo)

  /* ---------------- estado ---------------- */
  var state = {
    index: 0,                                  // pergunta atual (0-19)
    answers: new Array(CORE.questionnaire.length).fill(null),
    contact: {},
    result: null,
    reportData: null
  };

  /* ---------------- atalhos de DOM ---------------- */
  function $(id) { return document.getElementById(id); }

  /* ---------------- navegacao entre telas ---------------- */
  function showScreen(id) {
    var screens = document.querySelectorAll('.screen');
    for (var i = 0; i < screens.length; i++) {
      screens[i].classList.toggle('active', screens[i].id === id);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ---------------- TELA 2 — QUESTIONARIO ---------------- */
  function startQuiz() {
    state.index = 0;
    renderQuestion();
    showScreen('quiz');
  }

  function renderQuestion() {
    var total = CORE.questionnaire.length;
    var q = CORE.questionnaire[state.index];
    var saved = state.answers[state.index];

    $('q-num').textContent = String(state.index + 1).padStart(2, '0');
    $('q-progress').style.width = ((state.index + 1) / total * 100) + '%';
    $('q-text').textContent = q.text;
    $('q-back').style.visibility = 'visible';

    var box = $('q-options');
    box.innerHTML = '';
    ['A', 'B', 'C', 'D'].forEach(function (letter) {
      var opt = q.options[letter];
      var el = document.createElement('button');
      el.className = 'option' + (saved === letter ? ' sel' : '');
      el.setAttribute('data-key', letter);
      el.innerHTML = '<span class="mark"></span><span>' +
        escapeHtml(opt.text) + '</span>';
      el.addEventListener('click', function () { selectOption(letter); });
      box.appendChild(el);
    });
  }

  function selectOption(letter) {
    state.answers[state.index] = letter;

    var opts = document.querySelectorAll('#q-options .option');
    for (var i = 0; i < opts.length; i++) {
      opts[i].classList.toggle('sel', opts[i].getAttribute('data-key') === letter);
    }

    // avanca sozinho apos um instante, para um fluxo fluido
    window.setTimeout(function () {
      if (state.index < CORE.questionnaire.length - 1) {
        state.index++;
        renderQuestion();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        showScreen('capture');
      }
    }, 340);
  }

  function previousQuestion() {
    if (state.index > 0) {
      state.index--;
      renderQuestion();
    } else {
      showScreen('welcome');
    }
  }

  /* ---------------- TELA 3 — CAPTURA ---------------- */
  function validateCapture() {
    var ok = true;
    var name = $('in-name').value.trim();
    var email = $('in-email').value.trim();
    var whats = $('in-whats').value.trim();

    setError('name', '');
    setError('email', '');
    setError('whats', '');

    if (name.length < 2) { setError('name', 'Informe seu nome.'); ok = false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('email', 'Informe um e-mail válido.'); ok = false;
    }
    if (whats.replace(/\D/g, '').length < 10) {
      setError('whats', 'Informe um WhatsApp válido com DDD.'); ok = false;
    }

    if (ok) {
      state.contact = {
        name: name, email: email, whatsapp: whats,
        role: $('in-role').value.trim()
      };
    }
    return ok;
  }

  function setError(field, msg) {
    $('err-' + field).textContent = msg;
    $('in-' + (field === 'whats' ? 'whats' : field)).classList.toggle('err', !!msg);
  }

  function submitCapture() {
    if (!validateCapture()) return;
    showScreen('loading');
    runLoading();
  }

  /* ---------------- TELA 4 — CARREGANDO ---------------- */
  function runLoading() {
    var steps = [
      'Calculando percentuais…',
      'Identificando perfil dominante…',
      'Cruzando a combinação comportamental…',
      'Montando seu código…'
    ];
    var i = 0;
    $('load-step').textContent = steps[0];

    var timer = window.setInterval(function () {
      i++;
      if (i < steps.length) {
        $('load-step').textContent = steps[i];
      } else {
        window.clearInterval(timer);
      }
    }, 760);

    // processa o resultado e segue para a tela final
    window.setTimeout(function () {
      state.result = ENGINE.interpret(state.answers);
      state.reportData = ENGINE.buildReportData(
        state.contact, state.result, 'enxuto'
      );
      renderResult();
      showScreen('result');
    }, 3200);
  }

  /* ---------------- TELA 5 — RESULTADO ---------------- */
  function renderResult() {
    var r = state.result;
    var firstName = (state.contact.name || '').split(' ')[0] || 'Você';

    // --- cabecalho ---
    $('r-name').textContent = firstName + ' · seu código MINDCODE';

    var special = getSpecialProfile(r.flags);
    if (r.combination) {
      $('r-combo').innerHTML = '<em>' + escapeHtml(r.combination.name) + '</em>';
      $('r-tagline').textContent =
        r.dominant.data.name + ' + ' + r.secondary.data.name +
        ' — ' + r.combination.essence;
    } else if (special) {
      $('r-combo').innerHTML = '<em>' + escapeHtml(special.name) + '</em>';
      $('r-tagline').textContent = special.text;
    } else {
      $('r-combo').innerHTML = '<em>' + escapeHtml(r.dominant.data.name) + '</em>';
      $('r-tagline').textContent = r.dominant.data.definition;
    }

    // --- barras (ranking ja vem ordenado) ---
    var bars = $('r-bars');
    bars.innerHTML = '';
    r.ranking.forEach(function (item) {
      var p = CORE.profiles[item.profile];
      var row = document.createElement('div');
      row.className = 'bar-row';
      row.innerHTML =
        '<div class="bar-top">' +
          '<div class="bar-name">' + escapeHtml(p.name) +
            '<small>' + escapeHtml(p.nucleus) + '</small></div>' +
          '<div class="bar-pct">' + item.percentage + '%</div>' +
        '</div>' +
        '<div class="bar-track"><div class="bar-fill" ' +
          'style="background:' + p.color + '"></div></div>';
      bars.appendChild(row);
      // anima a largura no proximo frame
      var fill = row.querySelector('.bar-fill');
      window.requestAnimationFrame(function () {
        window.setTimeout(function () {
          fill.style.width = item.percentage + '%';
        }, 80);
      });
    });

    // --- perfil dominante ---
    var d = r.dominant.data;
    $('r-dom-name').textContent = d.name + ' · ' + d.title;
    $('r-dom-nucleus').textContent = 'Núcleo: ' + d.nucleus;
    $('r-dom-essence').textContent = d.essence;

    var chips = $('r-chips');
    chips.innerHTML = '';
    addChip(chips, 'Intensidade', r.dominant.intensity.label);
    addChip(chips, 'Secundário', r.secondary.data.name);
    addChip(chips, 'IECR médio', r.iecrAvg + '/100');
    if (r.flags.indexOf('HIGH_INTENSITY') !== -1) {
      addChip(chips, null, 'Alta intensidade');
    }
    if (r.flags.indexOf('HIGH_FRICTION_PAIR') !== -1) {
      addChip(chips, null, 'Atrito relacional alto');
    }

    // --- leitura rapida ---
    renderSynthesis(r, special);

    // --- disclaimer ---
    $('r-disclaimer').textContent = CORE.meta.disclaimer;
  }

  function renderSynthesis(r, special) {
    var box = $('r-synth');
    box.innerHTML = '';
    var parts = [];

    parts.push('Seu perfil dominante é o <b>' + r.dominant.data.name +
      '</b> (' + r.dominant.percentage + '%), em ' +
      r.dominant.intensity.label.toLowerCase() +
      '. ' + escapeHtml(r.dominant.intensity.note));

    parts.push('Como perfil secundário aparece o <b>' + r.secondary.data.name +
      '</b> (' + r.secondary.percentage + '%), que modula a forma como o ' +
      r.dominant.data.name + ' se expressa no dia a dia.');

    if (r.combination) {
      parts.push('A combinação <b>' + escapeHtml(r.combination.name) +
        '</b> tem como potencial: ' + r.combination.potential.toLowerCase());
    } else if (special) {
      parts.push(special.text);
    }

    parts.forEach(function (html) {
      var p = document.createElement('p');
      p.innerHTML = html;
      box.appendChild(p);
    });

    var pull = document.createElement('p');
    pull.className = 'pull';
    pull.textContent = '“' + r.dominant.data.phrase + '”';
    box.appendChild(pull);
  }

  /* perfil especial associado as flags (para BALANCED / DISTRIBUTED) */
  function getSpecialProfile(flags) {
    if (flags.indexOf('DISTRIBUTED') !== -1) return CORE.specialProfiles.distributed;
    if (flags.indexOf('BALANCED') !== -1) return CORE.specialProfiles.balanced;
    return null;
  }

  function addChip(container, label, value) {
    var c = document.createElement('div');
    c.className = 'chip';
    c.innerHTML = label
      ? escapeHtml(label) + ': <b>' + escapeHtml(value) + '</b>'
      : '<b>' + escapeHtml(value) + '</b>';
    container.appendChild(c);
  }

  /* ---------------- acoes dos relatorios ---------------- */
  function downloadEnxuto() {
    // O gerador de PDF entra na Etapa 4 (report-enxuto.js).
    if (window.MindcodeReportEnxuto &&
        typeof window.MindcodeReportEnxuto.generate === 'function') {
      window.MindcodeReportEnxuto.generate(state.reportData);
    } else {
      alert('O Relatório Enxuto em PDF é ativado na próxima etapa do projeto.');
    }
  }

  function requestCompleto() {
    var r = state.result;
    var combo = r.combination ? ' (' + r.combination.name + ')' : '';
    var msg =
      'Olá Diego! Acabei de fazer o MINDCODE e quero o Relatório Completo.\n\n' +
      'Meu perfil: ' + r.dominant.data.name + ' + ' + r.secondary.data.name + combo + '\n' +
      'Meu nome: ' + (state.contact.name || '');
    window.open('https://wa.me/' + WHATSAPP + '?text=' +
      encodeURIComponent(msg), '_blank');
  }

  function previewCompleto() {
    // Pre-visualizacao do Relatorio Completo (ferramenta de demonstracao).
    var data = ENGINE.buildReportData(state.contact, state.result, 'completo');
    if (window.MindcodeReportCompleto &&
        typeof window.MindcodeReportCompleto.generate === 'function') {
      window.MindcodeReportCompleto.generate(data);
    } else {
      alert('O Relatório Completo será ativado em breve.');
    }
  }

  /* ---------------- TELA 6 — PLANOS ---------------- */
  /* ordem de exibicao dos planos na pagina */
  var PLAN_ORDER = ['enxuto', 'completo', 'empresarial', 'certificacao'];

  function renderPlans() {
    var grid = $('plan-grid');
    grid.innerHTML = '';

    PLAN_ORDER.forEach(function (key) {
      var p = CORE.products[key];
      if (!p) return;

      var card = document.createElement('div');
      card.className = 'pcard' + (p.featured ? ' hot' : '');

      var html = '';
      if (p.featured) {
        html += '<div class="pcard-badge">' + escapeHtml(p.role) + '</div>';
      }
      html +=
        '<div class="pcard-top">' +
          '<div class="pcard-id">' +
            '<div class="pcard-role">' + escapeHtml(p.role) + '</div>' +
            '<div class="pcard-name">' + escapeHtml(p.name) + '</div>' +
          '</div>' +
          '<div class="pcard-price"><b>' + escapeHtml(p.priceLabel) + '</b>' +
            '<small>' + escapeHtml(p.priceNote || '') + '</small></div>' +
        '</div>' +
        '<div class="pcard-desc">' + escapeHtml(p.tagline || '') + '</div>' +
        '<ul>' + (p.features || []).map(function (f) {
          var locked = f.charAt(0) === '*';
          var text = locked ? f.slice(1) : f;
          return '<li' + (locked ? ' class="lock"' : '') + '>' +
            escapeHtml(text) + '</li>';
        }).join('') + '</ul>';

      // botao de acao
      var btnClass = p.featured ? 'btn btn-primary btn-block'
                                : 'btn btn-ghost btn-block';
      html += '<button class="' + btnClass + '" data-plan="' + key + '">' +
        planButtonLabel(key) + '</button>';

      card.innerHTML = html;
      grid.appendChild(card);
    });

    // liga os botoes
    var btns = grid.querySelectorAll('button[data-plan]');
    for (var i = 0; i < btns.length; i++) {
      btns[i].addEventListener('click', function () {
        choosePlan(this.getAttribute('data-plan'));
      });
    }

    $('plans-disclaimer').textContent = CORE.meta.disclaimer;
  }

  function planButtonLabel(key) {
    if (key === 'enxuto') return 'Baixar Relatório Enxuto';
    if (key === 'completo') return 'Quero o Relatório Completo';
    if (key === 'empresarial') return 'Falar sobre o Plano Empresarial';
    if (key === 'certificacao') return 'Quero me certificar';
    return 'Tenho interesse';
  }

  /* acao de cada plano: Enxuto baixa na hora; os demais vao ao WhatsApp */
  function choosePlan(key) {
    if (key === 'enxuto') {
      downloadEnxuto();
      return;
    }
    var p = CORE.products[key];
    var r = state.result;
    var perfil = r
      ? (r.dominant.data.name + ' + ' + r.secondary.data.name +
         (r.combination ? ' (' + r.combination.name + ')' : ''))
      : '';
    var msg = 'Olá Diego! Tenho interesse no plano "' + p.name +
      '" do MINDCODE.';
    if (perfil) { msg += '\n\nMeu perfil no teste: ' + perfil; }
    if (state.contact && state.contact.name) {
      msg += '\nMeu nome: ' + state.contact.name;
    }
    window.open('https://wa.me/' + WHATSAPP + '?text=' +
      encodeURIComponent(msg), '_blank');
  }

  function openPlans() {
    renderPlans();
    showScreen('plans');
  }

  /* ---------------- util ---------------- */
  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /* ---------------- inicializacao ---------------- */
  function init() {
    $('btn-start').addEventListener('click', startQuiz);
    $('q-back').addEventListener('click', previousQuestion);
    $('btn-submit').addEventListener('click', submitCapture);
    $('btn-enxuto').addEventListener('click', downloadEnxuto);
    $('btn-completo').addEventListener('click', requestCompleto);
    $('btn-completo-preview').addEventListener('click', previewCompleto);
    $('btn-all-plans').addEventListener('click', openPlans);
    $('btn-plans-back').addEventListener('click', function () {
      showScreen('result');
    });

    // Enter avanca na tela de captura
    ['in-name', 'in-email', 'in-whats', 'in-role'].forEach(function (id) {
      $(id).addEventListener('keydown', function (e) {
        if (e.key === 'Enter') { e.preventDefault(); submitCapture(); }
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // exposto para depuracao e para etapas seguintes
  window.MindcodeApp = {
    getState: function () { return state; },
    getReportData: function () { return state.reportData; }
  };

})();
