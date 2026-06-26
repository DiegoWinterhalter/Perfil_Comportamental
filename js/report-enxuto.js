/* ============================================================
   MINDCODE — Relatório Enxuto (V2 - Melhorado)
   ------------------------------------------------------------
   Gera o relatorio de 5 paginas com melhor formatação visual.
   Melhorias: fonts externas, layout refinado, suporte a impressão
   otimizado, imagens de melhor qualidade.

   API:  window.MindcodeReportEnxuto.generate(reportData)
   reportData vem de MindcodeEngine.buildReportData(user, result, 'enxuto')

   Carregar no index.html depois de engine.js.
   ============================================================ */

(function () {
  'use strict';

  var CORE = window.MINDCODE_CORE;

  /* ---------- util ---------- */
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function formatDate(iso) {
    var d = iso ? new Date(iso) : new Date();
    try {
      return d.toLocaleDateString('pt-BR',
        { day: '2-digit', month: 'long', year: 'numeric' });
    } catch (e) {
      return d.toLocaleDateString('pt-BR');
    }
  }

  function getSpecial(flags) {
    if (flags.indexOf('DISTRIBUTED') !== -1) return CORE.specialProfiles.distributed;
    if (flags.indexOf('BALANCED') !== -1) return CORE.specialProfiles.balanced;
    return null;
  }

  /* ---------- estilos do relatorio (VERSÃO 2 MELHORADA) ---------- */
  var STYLE = '' +
  '@import url("https://fonts.googleapis.com/css2?family=Fraunces:wght@400;500;600;700&family=Hanken+Grotesk:wght@400;500;600;700&display=swap");' +
  '#mc-report{position:fixed;inset:0;z-index:9999;display:none;' +
    'background:#0a0a0e;overflow:auto;-webkit-overflow-scrolling:touch;font-family:"Hanken Grotesk",system-ui,sans-serif}' +
  '#mc-report.open{display:block}' +
  '.mc-bar{position:sticky;top:0;z-index:5;display:flex;gap:10px;' +
    'justify-content:flex-end;padding:16px 24px;' +
    'background:rgba(10,10,14,.96);backdrop-filter:blur(8px);' +
    'border-bottom:1px solid rgba(255,255,255,.1);box-shadow:0 4px 12px rgba(0,0,0,.3)}' +
  '.mc-bar button{font-family:"Hanken Grotesk",system-ui,sans-serif;' +
    'font-weight:600;font-size:14px;cursor:pointer;border-radius:8px;' +
    'padding:12px 24px;border:1px solid rgba(255,255,255,.2);transition:.2s;' +
    'box-shadow:0 2px 8px rgba(0,0,0,.15)}' +
  '.mc-bar .save{background:#D4A574;color:#1a140c;border-color:#D4A574;font-weight:700}' +
  '.mc-bar .save:hover{background:#E0B585;filter:brightness(1.08);box-shadow:0 4px 12px rgba(212,165,116,.3)}' +
  '.mc-bar .close{background:rgba(255,255,255,.08);color:#e9e6df}' +
  '.mc-bar .close:hover{background:rgba(212,165,116,.2);border-color:#D4A574;color:#D4A574;box-shadow:0 4px 12px rgba(212,165,116,.2)}' +
  '.mc-pages{padding:32px 20px 80px;background:#0a0a0e}' +
  /* pagina */
  '.mc-page{background:#FFFBF5;color:#26241F;width:100%;max-width:700px;' +
    'margin:0 auto 28px;border-radius:8px;overflow:hidden;' +
    'font-family:"Hanken Grotesk",system-ui,sans-serif;line-height:1.65;' +
    'box-shadow:0 12px 40px rgba(0,0,0,.25),0 2px 8px rgba(0,0,0,.1);' +
    'display:flex;flex-direction:column;position:relative;' +
    'page-break-after:always}' +
  '.mc-page:last-child{page-break-after:auto}' +
  '.mc-pad{padding:52px 52px;flex:1;display:flex;flex-direction:column}' +
  '.mc-foot{border-top:1px solid #E8DFD0;padding:18px 52px;' +
    'display:flex;justify-content:space-between;font-size:10px;' +
    'letter-spacing:.12em;text-transform:uppercase;color:#B5A695;background:#FEFDF8}' +
  /* tipografia do relatorio */
  '.mc-brand{display:flex;align-items:center;gap:10px;font-weight:700;' +
    'letter-spacing:.32em;font-size:13px;color:#26241F;text-transform:uppercase}' +
  '.mc-brand .d{width:7px;height:7px;border-radius:50%;background:#C9956B}' +
  '.mc-brand span{color:#C9956B;font-style:italic}' +
  '.mc-eyebrow{font-size:11px;letter-spacing:.24em;text-transform:uppercase;' +
    'color:#C9956B;font-weight:700;margin-bottom:14px}' +
  '.mc-h1{font-family:"Fraunces",Georgia,serif;font-weight:600;' +
    'font-size:42px;line-height:1.15;letter-spacing:-.02em;color:#1a140c;margin:0}' +
  '.mc-h2{font-family:"Fraunces",Georgia,serif;font-weight:600;' +
    'font-size:28px;line-height:1.2;color:#1a140c;margin:0 0 8px}' +
  '.mc-sig{font-family:"Fraunces",Georgia,serif;font-style:italic;' +
    'font-size:16px;color:#C9956B;margin-top:12px}' +
  '.mc-p{font-size:15px;color:#4A463E;margin:0;line-height:1.68}' +
  '.mc-mut{color:#8A8475;font-size:13.5px;line-height:1.6}' +
  '.mc-rule{height:2px;background:linear-gradient(to right,#E8DFD0,transparent);margin:28px 0}' +
  /* capa */
  '.mc-cover{justify-content:space-between}' +
  '.mc-cover-mid{display:flex;flex-direction:column;gap:18px;padding:40px 0}' +
  '.mc-cover-combo{font-family:"Fraunces",Georgia,serif;font-weight:600;' +
    'font-size:52px;line-height:1.1;color:#1a140c;text-transform:uppercase;letter-spacing:-.015em}' +
  '.mc-cover-combo em{font-style:italic;color:#C9956B;font-weight:700}' +
  '.mc-cover-sub{font-size:16px;color:#6B5D50;line-height:1.65}' +
  /* barras */
  '.mc-bar-row{margin-bottom:22px}' +
  '.mc-bar-top{display:flex;justify-content:space-between;align-items:baseline;' +
    'margin-bottom:10px}' +
  '.mc-bar-name{font-weight:700;font-size:15px;color:#26241F;letter-spacing:.01em}' +
  '.mc-bar-name small{color:#A8A293;font-weight:500;margin-left:12px;' +
    'text-transform:uppercase;letter-spacing:.08em;font-size:10px}' +
  '.mc-bar-pct{font-family:"Fraunces",Georgia,serif;font-size:20px;' +
    'font-weight:600;color:#1a140c}' +
  '.mc-track{height:12px;background:#EDE8DA;border-radius:999px;overflow:hidden;box-shadow:inset 0 1px 3px rgba(0,0,0,.1)}' +
  '.mc-fill{height:100%;border-radius:999px;transition:width .8s ease}' +
  /* blocos */
  '.mc-tag{display:inline-block;font-size:11px;letter-spacing:.2em;' +
    'text-transform:uppercase;font-weight:700;color:#C9956B;margin-bottom:12px}' +
  '.mc-nucleus{font-size:12px;letter-spacing:.12em;text-transform:uppercase;' +
    'color:#8A8475;margin:8px 0 16px;font-weight:600}' +
  '.mc-list{list-style:none;margin:12px 0;padding:0}' +
  '.mc-list li{font-size:14.5px;color:#4A463E;padding:12px 0 12px 28px;' +
    'position:relative;border-bottom:1px solid #F2EEE8;line-height:1.65}' +
  '.mc-list li:last-child{border-bottom:none}' +
  '.mc-list li::before{content:"";position:absolute;left:0;top:18px;' +
    'width:8px;height:8px;border-radius:50%;background:#8A8F7A}' +
  '.mc-list.good li::before{background:#7C9A92;box-shadow:0 0 6px rgba(124,154,146,.3)}' +
  '.mc-list.warn li::before{background:#C9956B;box-shadow:0 0 6px rgba(201,149,107,.3)}' +
  '.mc-quote{font-family:"Fraunces",Georgia,serif;font-style:italic;' +
    'font-size:24px;line-height:1.45;color:#1a140c;border-left:4px solid #C9956B;' +
    'padding:10px 0 10px 28px;margin:14px 0;font-weight:500}' +
  '.mc-callout{background:#F8F5EF;border:2px solid #E8DFD0;border-radius:12px;' +
    'padding:28px 32px;margin-top:14px;box-shadow:0 4px 12px rgba(0,0,0,.06)}' +
  '.mc-callout .mc-h2{margin-bottom:10px}' +
  '.mc-callout .mc-p{margin-bottom:12px}' +
  '.mc-price{font-family:"Fraunces",Georgia,serif;font-weight:700;' +
    'font-size:36px;color:#1a140c;margin:12px 0 4px;letter-spacing:-.01em}' +
  '.mc-price small{font-size:13px;color:#8A8475;font-family:"Hanken Grotesk",sans-serif;font-weight:500}' +
  '.mc-disc{font-size:11px;color:#A8A293;line-height:1.6;margin-top:16px}' +
  /* impressao */
  '@media print{' +
    'body{background:#fff;margin:0;padding:0}' +
    'body>*{display:none!important}' +
    '#mc-report{display:block!important;position:static;background:#fff;overflow:visible;z-index:auto}' +
    '.mc-bar{display:none!important}' +
    '.mc-pages{padding:0;background:#fff}' +
    '.mc-page{box-shadow:none;border-radius:0;margin:0;max-width:none;' +
      'width:210mm;height:297mm;page-break-after:always}' +
    '.mc-page:last-child{page-break-after:auto}' +
    '.mc-pad{padding:40mm 20mm}' +
    '.mc-foot{padding:15mm 20mm}' +
    '@page{size:A4;margin:0}' +
    '*{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;color-adjust:exact!important}' +
    'img{max-width:100%;height:auto}' +
  '}';

  /* ---------- monta a UI uma vez ---------- */
  function ensureUI() {
    if (document.getElementById('mc-report')) return;

    var style = document.createElement('style');
    style.id = 'mc-report-style';
    style.textContent = STYLE;
    document.head.appendChild(style);

    var ov = document.createElement('div');
    ov.id = 'mc-report';
    ov.innerHTML =
      '<div class="mc-bar">' +
        '<button class="close" id="mc-close">✕ Fechar</button>' +
        '<button class="save" id="mc-save">⬇ Salvar como PDF</button>' +
      '</div>' +
      '<div class="mc-pages" id="mc-report-pages"></div>';
    document.body.appendChild(ov);

    document.getElementById('mc-save').addEventListener('click', function () {
      window.print();
    });
    document.getElementById('mc-close').addEventListener('click', function () {
      ov.classList.remove('open');
      document.body.style.overflow = '';
    });
  }

  /* ---------- componentes ---------- */
  function brandRow() {
    return '<div class="mc-brand"><span class="d"></span>' +
      'MIND<span>CODE</span></div>';
  }

  function footer(rd, n) {
    return '<div class="mc-foot">' +
      '<span>MINDCODE · Relatório Enxuto</span>' +
      '<span>' + esc(rd.user.name) + ' · Página ' + n + '/5</span></div>';
  }

  function barsBlock(result) {
    return result.ranking.map(function (item) {
      var p = CORE.profiles[item.profile];
      return '<div class="mc-bar-row">' +
        '<div class="mc-bar-top">' +
          '<div class="mc-bar-name">' + esc(p.name) +
            '<small>' + esc(p.nucleus) + '</small></div>' +
          '<div class="mc-bar-pct">' + item.percentage + '%</div>' +
        '</div>' +
        '<div class="mc-track"><div class="mc-fill" style="width:' +
          item.percentage + '%;background:' + p.color + '"></div></div>' +
      '</div>';
    }).join('');
  }

  function listBlock(items, cls) {
    return '<ul class="mc-list ' + cls + '">' +
      items.map(function (i) { return '<li>' + esc(i) + '</li>'; }).join('') +
      '</ul>';
  }

  /* ---------- as 5 paginas (VERSÃO MELHORADA) ---------- */
  function buildReport(rd) {
    var r = rd.result;
    var special = getSpecial(r.flags);
    var dom = r.dominant.data;
    var sec = r.secondary.data;

    var identityTitle = r.combination ? r.combination.name
      : (special ? special.name : dom.name);
    var identitySub = r.combination
      ? (dom.name + ' + ' + sec.name)
      : (special ? special.name : dom.title);

    /* --- PAGINA 1 — CAPA --- */
    var p1 =
      '<div class="mc-page"><div class="mc-pad mc-cover">' +
        '<div>' + brandRow() +
          '<div class="mc-sig">Análise Comportamental Aplicada a Vendas</div></div>' +
        '<div class="mc-cover-mid">' +
          '<div class="mc-eyebrow">Seu Relatório Enxuto</div>' +
          '<div class="mc-cover-combo"><em>' + esc(identityTitle) + '</em></div>' +
          '<div class="mc-cover-sub">' + esc(identitySub) + '</div>' +
          '<div class="mc-rule"></div>' +
          '<div class="mc-p" style="font-weight:600;font-size:16px;margin-bottom:6px;">Análise de ' +
            esc(rd.user.name) + '</div>' +
          '<div class="mc-mut">' + formatDate(rd.generatedAt) +
            (rd.user.role ? ' · ' + esc(rd.user.role) : '') + '</div>' +
        '</div>' +
        '<div class="mc-mut" style="font-size:12px;letter-spacing:.08em;text-transform:uppercase;margin-top:auto">' +
          'MINDCODE · Diego Winterhalter · 2026</div>' +
      '</div></div>';

    /* --- PAGINA 2 — RESULTADO --- */
    var p2 =
      '<div class="mc-page"><div class="mc-pad">' +
        brandRow() +
        '<div class="mc-eyebrow" style="margin-top:32px">Seu resultado</div>' +
        '<h2 class="mc-h2">Distribuição dos quatro perfis</h2>' +
        '<p class="mc-p" style="color:#6B5D50;margin-bottom:26px;line-height:1.65">' +
          'Cada perfil aparece em um percentual diferente. Juntos, eles formam o seu ' +
          'padrão comportamental único e atual.</p>' +
        barsBlock(r) +
        '<div class="mc-rule"></div>' +
        '<p class="mc-p"><strong>Seu perfil dominante é o ' + esc(dom.name) +
          '</strong> (' + r.dominant.percentage + '%), em <strong>' +
          esc(r.dominant.intensity.label.toLowerCase()) + '</strong>. ' +
          '<span style="color:#6B5D50;">' + esc(r.dominant.intensity.note) + '</span> ' +
          '<br><br>O perfil secundário é o <strong>' +
          esc(sec.name) + '</strong> (' + r.secondary.percentage + '%).</p>' +
      '</div>' + footer(rd, 2) + '</div>';

    /* --- PAGINA 3 — PERFIL DOMINANTE + FORCAS --- */
    var p3 =
      '<div class="mc-page"><div class="mc-pad">' +
        brandRow() +
        '<div style="margin-top:32px;"><span class="mc-tag">Perfil dominante</span></div>' +
        '<h1 class="mc-h1">' + esc(dom.name) + '</h1>' +
        '<div class="mc-nucleus">' + esc(dom.title) +
          ' · Núcleo: ' + esc(dom.nucleus) + '</div>' +
        '<p class="mc-p" style="margin-bottom:24px;line-height:1.7">' + esc(dom.essence) + '</p>' +
        '<div class="mc-rule"></div>' +
        '<span class="mc-tag">Pontos fortes</span>' +
        listBlock(dom.strengths, 'good') +
      '</div>' + footer(rd, 3) + '</div>';

    /* --- PAGINA 4 — PONTOS DE ATENCAO + FRASE --- */
    var p4 =
      '<div class="mc-page"><div class="mc-pad">' +
        brandRow() +
        '<div style="margin-top:32px;"><span class="mc-tag">Pontos de atenção</span></div>' +
        '<h2 class="mc-h2">Onde o ' + esc(dom.name) + ' pode te limitar</h2>' +
        '<p class="mc-mut" style="margin-bottom:22px;">' +
          'Nenhum perfil é melhor que outro. Estes são os pontos que merecem sua atenção ' +
          'quando o padrão atua em excesso.</p>' +
        listBlock(dom.attention, 'warn') +
        '<div class="mc-rule"></div>' +
        '<span class="mc-tag">Reflexão para você</span>' +
        '<div class="mc-quote">' + esc(dom.phrase) + '</div>' +
      '</div>' + footer(rd, 4) + '</div>';

    /* --- PAGINA 5 — SECUNDARIO + CTA --- */
    var modulText = r.combination
      ? ('A combinação <strong>' + esc(r.combination.name) + '</strong> — ' +
         esc(r.combination.essence) + ' — descreve como esses dois perfis ' +
         'operam juntos em você.')
      : (special
          ? esc(special.text)
          : ('O <strong>' + esc(sec.name) + '</strong> modula a forma como o ' +
             '<strong>' + esc(dom.name) + '</strong> se expressa no dia a dia.'));

    var c = rd.products.completo;
    var p5 =
      '<div class="mc-page"><div class="mc-pad">' +
        brandRow() +
        '<div style="margin-top:32px;"><span class="mc-tag">Perfil secundário</span></div>' +
        '<h1 class="mc-h1">' + esc(sec.name) + '</h1>' +
        '<div class="mc-nucleus">' + esc(sec.title) +
          ' · O modulador</div>' +
        '<p class="mc-p" style="margin-bottom:18px;line-height:1.7">' + esc(sec.essence) + '</p>' +
        '<p class="mc-p" style="color:#6B5D50;line-height:1.7">' + modulText + '</p>' +
        '<div class="mc-rule"></div>' +
        '<div class="mc-callout">' +
          '<span class="mc-tag">Continue sua análise</span>' +
          '<h2 class="mc-h2">Relatório Completo</h2>' +
          '<p class="mc-p">25 a 30 páginas com análise aprofundada da sua combinação híbrida, ' +
            'perfil emocional, mapa de comunicação, como você compra, vende, negocia e lidera, ' +
            'plano de desenvolvimento — e o <strong>IECR</strong>, índice exclusivo MINDCODE.</p>' +
          '<div class="mc-price">' + esc(c.priceLabel) +
            ' <small>ou ' + esc(c.installments) + '</small></div>' +
        '</div>' +
        '<p class="mc-disc">' + esc(rd.disclaimer) + '</p>' +
      '</div>' + footer(rd, 5) + '</div>';

    return p1 + p2 + p3 + p4 + p5;
  }

  /* ---------- API ---------- */
  function generate(reportData) {
    if (!CORE) { CORE = window.MINDCODE_CORE; }
    if (!reportData || !reportData.result) {
      console.error('MINDCODE Enxuto: reportData invalido.');
      return;
    }
    ensureUI();
    document.getElementById('mc-report-pages').innerHTML = buildReport(reportData);
    var ov = document.getElementById('mc-report');
    ov.classList.add('open');
    ov.scrollTop = 0;
    document.body.style.overflow = 'hidden';
  }

  window.MindcodeReportEnxuto = { generate: generate };

})();
