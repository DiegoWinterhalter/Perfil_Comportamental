/* ============================================================
   MINDCODE — Relatório Enxuto (V1)
   ------------------------------------------------------------
   Gera o relatorio de 3-5 paginas como documento printavel.
   O usuario salva como PDF pela caixa de impressao do navegador.
   Tema claro (proprio para impressao), independente do site.

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

  /* ---------- estilos do relatorio ---------- */
  var STYLE = '' +
  '#mc-report{position:fixed;inset:0;z-index:9999;display:none;' +
    'background:#101013;overflow:auto;-webkit-overflow-scrolling:touch}' +
  '#mc-report.open{display:block}' +
  '.mc-bar{position:sticky;top:0;z-index:5;display:flex;gap:10px;' +
    'justify-content:flex-end;padding:13px 16px;' +
    'background:rgba(16,16,19,.92);backdrop-filter:blur(6px);' +
    'border-bottom:1px solid rgba(255,255,255,.08)}' +
  '.mc-bar button{font-family:"Hanken Grotesk",system-ui,sans-serif;' +
    'font-weight:600;font-size:14px;cursor:pointer;border-radius:999px;' +
    'padding:11px 22px;border:1px solid rgba(255,255,255,.18);transition:.18s}' +
  '.mc-bar .save{background:#C0915C;color:#1a140c;border-color:#C0915C}' +
  '.mc-bar .save:hover{filter:brightness(1.07)}' +
  '.mc-bar .close{background:transparent;color:#e9e6df}' +
  '.mc-bar .close:hover{border-color:#C0915C;color:#C0915C}' +
  '.mc-pages{padding:24px 14px 60px}' +
  /* pagina */
  '.mc-page{background:#FBF9F4;color:#26241F;width:100%;max-width:680px;' +
    'margin:0 auto 22px;border-radius:6px;overflow:hidden;' +
    'font-family:"Hanken Grotesk",system-ui,sans-serif;line-height:1.6;' +
    'box-shadow:0 16px 50px -16px rgba(0,0,0,.6);' +
    'display:flex;flex-direction:column;position:relative}' +
  '.mc-pad{padding:46px 48px;flex:1;display:flex;flex-direction:column}' +
  '.mc-foot{border-top:1px solid #E3DECF;padding:14px 48px;' +
    'display:flex;justify-content:space-between;font-size:10px;' +
    'letter-spacing:.12em;text-transform:uppercase;color:#A8A293}' +
  /* tipografia do relatorio */
  '.mc-brand{display:flex;align-items:center;gap:8px;font-weight:700;' +
    'letter-spacing:.32em;font-size:12px;color:#26241F}' +
  '.mc-brand .d{width:6px;height:6px;border-radius:50%;background:#A8763F}' +
  '.mc-brand span{color:#A8763F}' +
  '.mc-eyebrow{font-size:11px;letter-spacing:.24em;text-transform:uppercase;' +
    'color:#A8763F;font-weight:700}' +
  '.mc-h1{font-family:"Fraunces",Georgia,serif;font-weight:500;' +
    'font-size:38px;line-height:1.12;letter-spacing:-.01em;color:#211F1A}' +
  '.mc-h2{font-family:"Fraunces",Georgia,serif;font-weight:500;' +
    'font-size:25px;line-height:1.18;color:#211F1A}' +
  '.mc-sig{font-family:"Fraunces",Georgia,serif;font-style:italic;' +
    'font-size:15px;color:#A8763F}' +
  '.mc-p{font-size:14px;color:#4A463E}' +
  '.mc-mut{color:#8A8475;font-size:13px}' +
  '.mc-rule{height:1px;background:#E3DECF;margin:20px 0}' +
  /* capa */
  '.mc-cover{justify-content:space-between}' +
  '.mc-cover-mid{display:flex;flex-direction:column;gap:14px;padding:30px 0}' +
  '.mc-cover-combo{font-family:"Fraunces",Georgia,serif;font-weight:500;' +
    'font-size:46px;line-height:1.08;color:#211F1A}' +
  '.mc-cover-combo em{font-style:italic;color:#A8763F}' +
  /* barras */
  '.mc-bar-row{margin-bottom:17px}' +
  '.mc-bar-top{display:flex;justify-content:space-between;align-items:baseline;' +
    'margin-bottom:6px}' +
  '.mc-bar-name{font-weight:700;font-size:14px;color:#26241F}' +
  '.mc-bar-name small{color:#A8A293;font-weight:400;margin-left:8px;' +
    'text-transform:uppercase;letter-spacing:.06em;font-size:10px}' +
  '.mc-bar-pct{font-family:"Fraunces",Georgia,serif;font-size:18px;' +
    'font-weight:500;color:#211F1A}' +
  '.mc-track{height:10px;background:#EDE8DA;border-radius:999px;overflow:hidden}' +
  '.mc-fill{height:100%;border-radius:999px}' +
  /* blocos */
  '.mc-tag{display:inline-block;font-size:10px;letter-spacing:.18em;' +
    'text-transform:uppercase;font-weight:700;color:#A8763F;margin-bottom:9px}' +
  '.mc-nucleus{font-size:11px;letter-spacing:.1em;text-transform:uppercase;' +
    'color:#8A8475;margin:5px 0 14px}' +
  '.mc-list{list-style:none;margin:10px 0;padding:0}' +
  '.mc-list li{font-size:13.5px;color:#4A463E;padding:7px 0 7px 22px;' +
    'position:relative;border-bottom:1px solid #EDE8DA}' +
  '.mc-list li:last-child{border-bottom:none}' +
  '.mc-list li::before{content:"";position:absolute;left:2px;top:14px;' +
    'width:7px;height:7px;border-radius:50%}' +
  '.mc-list.good li::before{background:#7C9A92}' +
  '.mc-list.warn li::before{background:#BC8160}' +
  '.mc-quote{font-family:"Fraunces",Georgia,serif;font-style:italic;' +
    'font-size:21px;line-height:1.4;color:#211F1A;border-left:3px solid #A8763F;' +
    'padding:6px 0 6px 22px;margin:8px 0}' +
  '.mc-callout{background:#F2EEE2;border:1px solid #E3DECF;border-radius:10px;' +
    'padding:20px 22px;margin-top:6px}' +
  '.mc-callout .mc-h2{font-size:21px;margin-bottom:6px}' +
  '.mc-price{font-family:"Fraunces",Georgia,serif;font-weight:500;' +
    'font-size:30px;color:#211F1A;margin:6px 0 2px}' +
  '.mc-price small{font-size:13px;color:#8A8475;font-family:"Hanken Grotesk",sans-serif}' +
  '.mc-disc{font-size:10.5px;color:#A8A293;line-height:1.55;margin-top:14px}' +
  /* impressao */
  '@media print{' +
    'body{background:#fff}' +
    'body>*{display:none!important}' +
    '#mc-report{display:block!important;position:static;background:#fff;overflow:visible}' +
    '.mc-bar{display:none!important}' +
    '.mc-pages{padding:0}' +
    '.mc-page{box-shadow:none;border-radius:0;margin:0;max-width:none;' +
      'width:210mm;min-height:296mm}' +
    '@page{size:A4;margin:0}' +
    '.mc-page{page-break-after:always}' +
    '.mc-page:last-child{page-break-after:auto}' +
    '*{-webkit-print-color-adjust:exact;print-color-adjust:exact}' +
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
        '<button class="close" id="mc-close">Fechar</button>' +
        '<button class="save" id="mc-save">Salvar como PDF</button>' +
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
      '<span>' + esc(rd.user.name) + ' · ' + n + '/5</span></div>';
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

  /* ---------- as 5 paginas ---------- */
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
          '<div class="mc-sig" style="margin-top:8px">' +
            esc(CORE.brand.signature) + '</div></div>' +
        '<div class="mc-cover-mid">' +
          '<div class="mc-eyebrow">Relatório Enxuto</div>' +
          '<div class="mc-cover-combo"><em>' + esc(identityTitle) + '</em></div>' +
          '<div class="mc-mut">' + esc(identitySub) + '</div>' +
          '<div class="mc-rule"></div>' +
          '<div class="mc-p"><b>Análise comportamental de ' +
            esc(rd.user.name) + '</b></div>' +
          '<div class="mc-mut">' + formatDate(rd.generatedAt) +
            (rd.user.role ? ' · ' + esc(rd.user.role) : '') + '</div>' +
        '</div>' +
        '<div class="mc-mut" style="font-size:11px;letter-spacing:.06em">' +
          'MINDCODE · Diego Winterhalter</div>' +
      '</div></div>';

    /* --- PAGINA 2 — RESULTADO --- */
    var p2 =
      '<div class="mc-page"><div class="mc-pad">' +
        brandRow() +
        '<div class="mc-eyebrow" style="margin-top:26px">Seu resultado</div>' +
        '<h2 class="mc-h2" style="margin:6px 0 4px">Distribuição dos quatro perfis</h2>' +
        '<p class="mc-mut" style="margin-bottom:22px">' +
          'Cada perfil aparece num percentual. Juntos, eles formam o seu ' +
          'padrão comportamental atual.</p>' +
        barsBlock(r) +
        '<div class="mc-rule"></div>' +
        '<p class="mc-p">Seu perfil dominante é o <b>' + esc(dom.name) +
          '</b> (' + r.dominant.percentage + '%), em ' +
          esc(r.dominant.intensity.label.toLowerCase()) + '. ' +
          esc(r.dominant.intensity.note) + ' O perfil secundário é o <b>' +
          esc(sec.name) + '</b> (' + r.secondary.percentage + '%).</p>' +
      '</div>' + footer(rd, 2) + '</div>';

    /* --- PAGINA 3 — PERFIL DOMINANTE + FORCAS --- */
    var p3 =
      '<div class="mc-page"><div class="mc-pad">' +
        brandRow() +
        '<div style="margin-top:26px"><span class="mc-tag">Perfil dominante</span></div>' +
        '<h1 class="mc-h1">' + esc(dom.name) + '</h1>' +
        '<div class="mc-nucleus">' + esc(dom.title) +
          ' · núcleo: ' + esc(dom.nucleus) + '</div>' +
        '<p class="mc-p">' + esc(dom.essence) + '</p>' +
        '<div class="mc-rule"></div>' +
        '<span class="mc-tag">Pontos fortes</span>' +
        listBlock(dom.strengths, 'good') +
      '</div>' + footer(rd, 3) + '</div>';

    /* --- PAGINA 4 — PONTOS DE ATENCAO + FRASE --- */
    var p4 =
      '<div class="mc-page"><div class="mc-pad">' +
        brandRow() +
        '<div style="margin-top:26px"><span class="mc-tag">Pontos de atenção</span></div>' +
        '<h2 class="mc-h2" style="margin:4px 0 6px">' +
          'Onde o ' + esc(dom.name) + ' pode te limitar</h2>' +
        '<p class="mc-mut" style="margin-bottom:6px">' +
          'Nenhum perfil é melhor que outro. Estes são os pontos a observar ' +
          'quando o padrão age em excesso.</p>' +
        listBlock(dom.attention, 'warn') +
        '<div class="mc-rule"></div>' +
        '<span class="mc-tag">Frase de reflexão</span>' +
        '<div class="mc-quote">' + esc(dom.phrase) + '</div>' +
      '</div>' + footer(rd, 4) + '</div>';

    /* --- PAGINA 5 — SECUNDARIO + CTA --- */
    var modulText = r.combination
      ? ('A combinação <b>' + esc(r.combination.name) + '</b> — ' +
         esc(r.combination.essence) + ' — descreve como esses dois perfis ' +
         'operam juntos em você.')
      : (special
          ? esc(special.text)
          : ('O ' + esc(sec.name) + ' modula a forma como o ' +
             esc(dom.name) + ' se expressa no dia a dia.'));

    var c = rd.products.completo;
    var p5 =
      '<div class="mc-page"><div class="mc-pad">' +
        brandRow() +
        '<div style="margin-top:26px"><span class="mc-tag">Perfil secundário</span></div>' +
        '<h1 class="mc-h1">' + esc(sec.name) + '</h1>' +
        '<div class="mc-nucleus">' + esc(sec.title) +
          ' · o modulador</div>' +
        '<p class="mc-p">' + esc(sec.essence) + '</p>' +
        '<p class="mc-p" style="margin-top:10px">' + modulText + '</p>' +
        '<div class="mc-rule"></div>' +
        '<div class="mc-callout">' +
          '<span class="mc-tag">Continue sua análise</span>' +
          '<h2 class="mc-h2">Relatório Completo</h2>' +
          '<p class="mc-p">18 a 30 páginas com sua combinação híbrida ' +
            'aprofundada, perfil emocional e de comunicação, como você compra, ' +
            'vende, negocia e lidera, plano de desenvolvimento — e o <b>IECR, ' +
            'o Índice de Esforço Cognitivo Relacional</b>, recurso exclusivo do ' +
            'relatório completo.</p>' +
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
