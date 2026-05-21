/* ============================================================
   MINDCODE — Relatório Completo (V1)
   ------------------------------------------------------------
   Gera o relatorio aprofundado como documento printavel.
   Mesma base visual do Enxuto; estrutura de ~22 paginas.
   O usuario salva como PDF pela caixa de impressao.

   API:  window.MindcodeReportCompleto.generate(reportData)
   reportData = MindcodeEngine.buildReportData(user, result, 'completo')

   Reaproveita os estilos injetados por report-enxuto.js quando
   presente; caso contrario injeta os seus proprios.
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
    } catch (e) { return d.toLocaleDateString('pt-BR'); }
  }
  function getSpecial(flags) {
    if (flags.indexOf('DISTRIBUTED') !== -1) return CORE.specialProfiles.distributed;
    if (flags.indexOf('BALANCED') !== -1) return CORE.specialProfiles.balanced;
    return null;
  }
  var PKEYS = ['leao', 'pavao', 'macaco', 'cachorro'];

  /* ---------- estilo proprio (alem do que o Enxuto ja traz) ---------- */
  var EXTRA = '' +
  '#mc-report-c{position:fixed;inset:0;z-index:9999;display:none;' +
    'background:#101013;overflow:auto;-webkit-overflow-scrolling:touch}' +
  '#mc-report-c.open{display:block}' +
  '.mcc-toc{list-style:none;margin:14px 0 0;padding:0;column-count:2;' +
    'column-gap:30px}' +
  '.mcc-toc li{font-size:12.5px;color:#4A463E;padding:6px 0;' +
    'border-bottom:1px solid #EDE8DA;display:flex;justify-content:space-between;' +
    'gap:10px;break-inside:avoid}' +
  '.mcc-toc li b{color:#A8763F;font-family:"Fraunces",Georgia,serif;font-weight:500}' +
  '.mcc-grid{display:flex;gap:14px;margin:6px 0}' +
  '.mcc-col{flex:1;background:#F2EEE2;border:1px solid #E3DECF;' +
    'border-radius:10px;padding:16px 17px}' +
  '.mcc-col h4{font-size:11px;letter-spacing:.14em;text-transform:uppercase;' +
    'color:#A8763F;font-weight:700;margin-bottom:7px}' +
  '.mcc-col p{font-size:12.5px;color:#4A463E;margin:0}' +
  '.mcc-def{display:flex;gap:13px;padding:11px 0;border-bottom:1px solid #EDE8DA}' +
  '.mcc-def:last-child{border-bottom:none}' +
  '.mcc-def .role{flex:none;width:96px;font-weight:700;font-size:12.5px;' +
    'color:#26241F}' +
  '.mcc-def .role small{display:block;font-weight:400;color:#A8A293;' +
    'font-size:10px;text-transform:uppercase;letter-spacing:.08em}' +
  '.mcc-def .desc{font-size:12.5px;color:#4A463E}' +
  /* matriz IECR */
  '.mcc-matrix{width:100%;border-collapse:collapse;margin-top:10px;' +
    'font-size:12px}' +
  '.mcc-matrix th,.mcc-matrix td{border:1px solid #E3DECF;padding:8px 6px;' +
    'text-align:center}' +
  '.mcc-matrix th{background:#F2EEE2;color:#26241F;font-weight:700;' +
    'font-size:11px;text-transform:uppercase;letter-spacing:.04em}' +
  '.mcc-matrix td.rowh{background:#F2EEE2;font-weight:700}' +
  '.mcc-matrix td .lv{display:block;font-size:9px;color:#8A8475;' +
    'text-transform:uppercase;letter-spacing:.04em}' +
  '.mcc-iecr-cell{font-family:"Fraunces",Georgia,serif;font-weight:500;' +
    'font-size:15px;color:#211F1A}' +
  '.mcc-step{display:flex;gap:13px;padding:11px 0;' +
    'border-bottom:1px solid #EDE8DA;break-inside:avoid}' +
  '.mcc-step:last-child{border-bottom:none}' +
  '.mcc-step .num{flex:none;width:26px;height:26px;border-radius:50%;' +
    'background:#A8763F;color:#FBF9F4;font-weight:700;font-size:13px;' +
    'display:flex;align-items:center;justify-content:center;' +
    'font-family:"Fraunces",Georgia,serif}' +
  '.mcc-step .txt{font-size:13px;color:#4A463E;padding-top:3px}' +
  '@media print{' +
    'body>*{display:none!important}' +
    '#mc-report-c{display:block!important;position:static;background:#fff;overflow:visible}' +
    '#mc-report-c .mc-bar{display:none!important}' +
    '#mc-report-c .mc-pages{padding:0}' +
    '#mc-report-c .mc-page{box-shadow:none;border-radius:0;margin:0;' +
      'max-width:none;width:210mm;min-height:296mm;page-break-after:always}' +
    '#mc-report-c .mc-page:last-child{page-break-after:auto}' +
    '@page{size:A4;margin:0}' +
    '*{-webkit-print-color-adjust:exact;print-color-adjust:exact}' +
  '}';

  function ensureUI() {
    if (!document.getElementById('mc-report-style-extra')) {
      var st = document.createElement('style');
      st.id = 'mc-report-style-extra';
      st.textContent = EXTRA;
      document.head.appendChild(st);
    }
    // Se o Enxuto nao foi carregado, precisamos do estilo-base tambem.
    if (!document.getElementById('mc-report-style') &&
        !document.getElementById('mc-base-injected')) {
      // estilos-base minimos (espelho do Enxuto) — garantia de standalone
      var base = document.createElement('style');
      base.id = 'mc-base-injected';
      base.textContent = BASE_STYLE;
      document.head.appendChild(base);
    }
    if (document.getElementById('mc-report-c')) return;

    var ov = document.createElement('div');
    ov.id = 'mc-report-c';
    ov.innerHTML =
      '<div class="mc-bar">' +
        '<button class="close" id="mcc-close">Fechar</button>' +
        '<button class="save" id="mcc-save">Salvar como PDF</button>' +
      '</div>' +
      '<div class="mc-pages" id="mcc-pages"></div>';
    document.body.appendChild(ov);

    document.getElementById('mcc-save').addEventListener('click', function () {
      window.print();
    });
    document.getElementById('mcc-close').addEventListener('click', function () {
      ov.classList.remove('open');
      document.body.style.overflow = '';
    });
  }

  /* estilo-base minimo, usado so se o Enxuto nao estiver presente */
  var BASE_STYLE = '' +
  '#mc-report-c .mc-bar{position:sticky;top:0;z-index:5;display:flex;gap:10px;' +
    'justify-content:flex-end;padding:13px 16px;background:rgba(16,16,19,.92);' +
    'border-bottom:1px solid rgba(255,255,255,.08)}' +
  '#mc-report-c .mc-bar button{font-family:"Hanken Grotesk",sans-serif;' +
    'font-weight:600;font-size:14px;cursor:pointer;border-radius:999px;' +
    'padding:11px 22px;border:1px solid rgba(255,255,255,.18)}' +
  '#mc-report-c .mc-bar .save{background:#C0915C;color:#1a140c}' +
  '#mc-report-c .mc-bar .close{background:transparent;color:#e9e6df}' +
  '#mc-report-c .mc-pages{padding:24px 14px 60px}' +
  '#mc-report-c .mc-page{background:#FBF9F4;color:#26241F;width:100%;' +
    'max-width:680px;margin:0 auto 22px;border-radius:6px;overflow:hidden;' +
    'font-family:"Hanken Grotesk",sans-serif;line-height:1.6;' +
    'box-shadow:0 16px 50px -16px rgba(0,0,0,.6);display:flex;' +
    'flex-direction:column}' +
  '#mc-report-c .mc-pad{padding:46px 48px;flex:1}' +
  '#mc-report-c .mc-foot{border-top:1px solid #E3DECF;padding:14px 48px;' +
    'display:flex;justify-content:space-between;font-size:10px;' +
    'letter-spacing:.12em;text-transform:uppercase;color:#A8A293}' +
  '#mc-report-c .mc-brand{display:flex;align-items:center;gap:8px;' +
    'font-weight:700;letter-spacing:.32em;font-size:12px}' +
  '#mc-report-c .mc-brand .d{width:6px;height:6px;border-radius:50%;' +
    'background:#A8763F}' +
  '#mc-report-c .mc-brand span{color:#A8763F}' +
  '#mc-report-c .mc-eyebrow{font-size:11px;letter-spacing:.24em;' +
    'text-transform:uppercase;color:#A8763F;font-weight:700}' +
  '#mc-report-c .mc-h1{font-family:"Fraunces",Georgia,serif;font-weight:500;' +
    'font-size:38px;line-height:1.12;color:#211F1A}' +
  '#mc-report-c .mc-h2{font-family:"Fraunces",Georgia,serif;font-weight:500;' +
    'font-size:25px;line-height:1.18;color:#211F1A}' +
  '#mc-report-c .mc-sig{font-family:"Fraunces",Georgia,serif;font-style:italic;' +
    'font-size:15px;color:#A8763F}' +
  '#mc-report-c .mc-p{font-size:14px;color:#4A463E}' +
  '#mc-report-c .mc-mut{color:#8A8475;font-size:13px}' +
  '#mc-report-c .mc-rule{height:1px;background:#E3DECF;margin:20px 0}' +
  '#mc-report-c .mc-tag{display:inline-block;font-size:10px;' +
    'letter-spacing:.18em;text-transform:uppercase;font-weight:700;' +
    'color:#A8763F;margin-bottom:9px}' +
  '#mc-report-c .mc-nucleus{font-size:11px;letter-spacing:.1em;' +
    'text-transform:uppercase;color:#8A8475;margin:5px 0 14px}' +
  '#mc-report-c .mc-list{list-style:none;margin:10px 0;padding:0}' +
  '#mc-report-c .mc-list li{font-size:13.5px;color:#4A463E;' +
    'padding:7px 0 7px 22px;position:relative;border-bottom:1px solid #EDE8DA}' +
  '#mc-report-c .mc-list li:last-child{border-bottom:none}' +
  '#mc-report-c .mc-list li::before{content:"";position:absolute;left:2px;' +
    'top:14px;width:7px;height:7px;border-radius:50%}' +
  '#mc-report-c .mc-list.good li::before{background:#7C9A92}' +
  '#mc-report-c .mc-list.warn li::before{background:#BC8160}' +
  '#mc-report-c .mc-quote{font-family:"Fraunces",Georgia,serif;' +
    'font-style:italic;font-size:21px;line-height:1.4;color:#211F1A;' +
    'border-left:3px solid #A8763F;padding:6px 0 6px 22px;margin:8px 0}' +
  '#mc-report-c .mc-callout{background:#F2EEE2;border:1px solid #E3DECF;' +
    'border-radius:10px;padding:20px 22px}' +
  '#mc-report-c .mc-bar-row{margin-bottom:17px}' +
  '#mc-report-c .mc-bar-top{display:flex;justify-content:space-between;' +
    'align-items:baseline;margin-bottom:6px}' +
  '#mc-report-c .mc-bar-name{font-weight:700;font-size:14px}' +
  '#mc-report-c .mc-bar-name small{color:#A8A293;font-weight:400;' +
    'margin-left:8px;text-transform:uppercase;letter-spacing:.06em;font-size:10px}' +
  '#mc-report-c .mc-bar-pct{font-family:"Fraunces",Georgia,serif;' +
    'font-size:18px;font-weight:500}' +
  '#mc-report-c .mc-track{height:10px;background:#EDE8DA;border-radius:999px;' +
    'overflow:hidden}' +
  '#mc-report-c .mc-fill{height:100%;border-radius:999px}' +
  '#mc-report-c .mc-disc{font-size:10.5px;color:#A8A293;line-height:1.55}' +
  '#mc-report-c .mc-price{font-family:"Fraunces",Georgia,serif;font-weight:500;' +
    'font-size:30px;color:#211F1A;margin:6px 0 2px}' +
  '#mc-report-c .mc-price small{font-size:13px;color:#8A8475;' +
    'font-family:"Hanken Grotesk",sans-serif}';

  /* ---------- componentes ---------- */
  function brandRow() {
    return '<div class="mc-brand"><span class="d"></span>' +
      'MIND<span>CODE</span></div>';
  }
  function page(inner, rd, label, n, total) {
    return '<div class="mc-page"><div class="mc-pad">' + inner + '</div>' +
      '<div class="mc-foot"><span>MINDCODE · ' + esc(label) + '</span>' +
      '<span>' + esc(rd.user.name) + ' · ' + n + '/' + total + '</span></div></div>';
  }
  function head(tag, title) {
    return '<div style="margin-top:8px"><span class="mc-tag">' + esc(tag) +
      '</span></div><h2 class="mc-h2">' + esc(title) + '</h2>';
  }
  function barsBlock(result) {
    return result.ranking.map(function (item) {
      var p = CORE.profiles[item.profile];
      return '<div class="mc-bar-row"><div class="mc-bar-top">' +
        '<div class="mc-bar-name">' + esc(p.name) +
        '<small>' + esc(p.nucleus) + '</small></div>' +
        '<div class="mc-bar-pct">' + item.percentage + '%</div></div>' +
        '<div class="mc-track"><div class="mc-fill" style="width:' +
        item.percentage + '%;background:' + p.color + '"></div></div></div>';
    }).join('');
  }
  function listBlock(items, cls) {
    return '<ul class="mc-list ' + cls + '">' + items.map(function (i) {
      return '<li>' + esc(i) + '</li>';
    }).join('') + '</ul>';
  }
  function twoCols(aTitle, aText, bTitle, bText) {
    return '<div class="mcc-grid">' +
      '<div class="mcc-col"><h4>' + esc(aTitle) + '</h4><p>' + esc(aText) + '</p></div>' +
      '<div class="mcc-col"><h4>' + esc(bTitle) + '</h4><p>' + esc(bText) + '</p></div>' +
      '</div>';
  }

  /* ---------- matriz IECR ---------- */
  function iecrMatrixTable(domKey) {
    var names = { leao: 'Leão', pavao: 'Pavão', macaco: 'Macaco', cachorro: 'Cachorro' };
    var h = '<table class="mcc-matrix"><thead><tr><th></th>';
    PKEYS.forEach(function (k) { h += '<th>' + names[k] + '</th>'; });
    h += '</tr></thead><tbody>';
    PKEYS.forEach(function (rk) {
      h += '<tr><td class="rowh">' + names[rk] + '</td>';
      PKEYS.forEach(function (ck) {
        var cell = CORE.iecrMatrix[rk + '+' + ck] || { value: '-', level: '' };
        var hot = (rk === domKey || ck === domKey);
        h += '<td' + (hot ? ' style="background:#F7EFE2"' : '') + '>' +
          '<span class="mcc-iecr-cell">' + cell.value + '</span>' +
          '<span class="lv">' + esc(cell.level) + '</span></td>';
      });
      h += '</tr>';
    });
    return h + '</tbody></table>';
  }

  /* ---------- montagem do relatorio ---------- */
  function buildReport(rd) {
    var r = rd.result;
    var dom = r.dominant.data;
    var sec = r.secondary.data;
    var special = getSpecial(r.flags);
    var appDom = CORE.applied[r.dominant.profile];
    var appSec = CORE.applied[r.secondary.profile];
    var combo = r.combination;
    var TOTAL = 22;
    var L = 'Relatório Completo';
    var pages = [];

    var identityTitle = combo ? combo.name : (special ? special.name : dom.name);

    /* 1 — CAPA */
    pages.push(
      '<div class="mc-page"><div class="mc-pad" style="display:flex;' +
      'flex-direction:column;justify-content:space-between">' +
        '<div>' + brandRow() + '<div class="mc-sig" style="margin-top:8px">' +
          esc(CORE.brand.signature) + '</div></div>' +
        '<div style="padding:30px 0">' +
          '<div class="mc-eyebrow">Relatório Completo</div>' +
          '<div style="font-family:Fraunces,Georgia,serif;font-weight:500;' +
            'font-size:46px;line-height:1.08;color:#211F1A;margin:8px 0">' +
            '<em style="color:#A8763F">' + esc(identityTitle) + '</em></div>' +
          '<div class="mc-mut">' +
            (combo ? esc(dom.name + ' + ' + sec.name) : esc(dom.title)) + '</div>' +
          '<div class="mc-rule"></div>' +
          '<div class="mc-p"><b>Análise comportamental de ' +
            esc(rd.user.name) + '</b></div>' +
          '<div class="mc-mut">' + formatDate(rd.generatedAt) +
            (rd.user.role ? ' · ' + esc(rd.user.role) : '') + '</div>' +
        '</div>' +
        '<div class="mc-mut" style="font-size:11px;letter-spacing:.06em">' +
          'MINDCODE · Diego Winterhalter</div>' +
      '</div></div>'
    );

    /* 2 — METODO E LIMITES + SUMARIO */
    var toc = [
      'Resultado geral', 'Interpretação dos percentuais',
      'Perfil dominante', 'Pontos fortes', 'Pontos de atenção',
      'Perfil secundário', 'Combinação híbrida', 'Perfil emocional',
      'Perfil de comunicação', 'O que agrada e o que irrita',
      'Perfil no trabalho', 'Como você compra', 'Como você vende',
      'Como você negocia', 'IECR', 'Mapa de esforço relacional',
      'Comunicação por perfil', 'Plano de desenvolvimento', 'Síntese final'
    ];
    pages.push(page(
      head('O método', 'Como ler este relatório') +
      '<p class="mc-p">O MINDCODE traduz o seu padrão comportamental em ' +
        'quatro arquétipos — Leão, Pavão, Macaco e Cachorro — e mostra como ' +
        'esse padrão aparece em decisão, comunicação, vendas, liderança e ' +
        'relacionamento. Cada pessoa tem os quatro; o que muda é a proporção.</p>' +
      '<p class="mc-p" style="margin-top:10px">Este relatório é uma leitura ' +
        'aplicada, feita para desenvolvimento. Não é um diagnóstico nem um ' +
        'rótulo fixo: descreve tendências do seu momento atual.</p>' +
      '<div class="mc-rule"></div>' +
      '<span class="mc-tag">Sumário</span>' +
      '<ul class="mcc-toc">' + toc.map(function (t, i) {
        return '<li><span>' + esc(t) + '</span><b>' + (i + 1) + '</b></li>';
      }).join('') + '</ul>',
      rd, L, 2, TOTAL));

    /* 3 — RESULTADO GERAL */
    pages.push(page(
      head('Resultado geral', 'Distribuição dos quatro perfis') +
      '<p class="mc-mut" style="margin-bottom:20px">Os percentuais somam ' +
        '100%. Juntos, formam a assinatura comportamental do seu momento atual.</p>' +
      barsBlock(r) +
      '<div class="mc-rule"></div>' +
      '<div class="mcc-grid">' +
        '<div class="mcc-col"><h4>Dominante</h4><p><b>' + esc(dom.name) +
          '</b> · ' + r.dominant.percentage + '% · ' +
          esc(r.dominant.intensity.label) + '</p></div>' +
        '<div class="mcc-col"><h4>Secundário</h4><p><b>' + esc(sec.name) +
          '</b> · ' + r.secondary.percentage + '% · ' +
          esc(r.secondary.intensity.label) + '</p></div>' +
      '</div>',
      rd, L, 3, TOTAL));

    /* 4 — INTERPRETACAO DOS PERCENTUAIS */
    var interpRows = r.ranking.map(function (item) {
      var p = CORE.profiles[item.profile];
      return '<div class="mcc-def"><div class="role">' + esc(p.name) +
        '<small>' + item.percentage + '% · ' + esc(item.intensity.label) +
        '</small></div><div class="desc">' + esc(item.intensity.note) +
        ' ' + esc(p.definition) + '</div></div>';
    }).join('');
    pages.push(page(
      head('Interpretação', 'O que cada percentual indica') +
      '<p class="mc-mut" style="margin-bottom:8px">A intensidade de cada ' +
        'perfil muda o peso dele no seu comportamento.</p>' + interpRows +
      (special ? '<div class="mc-rule"></div><div class="mc-callout">' +
        '<span class="mc-tag">' + esc(special.name) + '</span>' +
        '<p class="mc-p">' + esc(special.text) + '</p></div>' : ''),
      rd, L, 4, TOTAL));

    /* 5 — PERFIL DOMINANTE */
    pages.push(page(
      '<div style="margin-top:8px"><span class="mc-tag">Perfil dominante</span></div>' +
      '<h1 class="mc-h1">' + esc(dom.name) + '</h1>' +
      '<div class="mc-nucleus">' + esc(dom.title) + ' · núcleo: ' +
        esc(dom.nucleus) + '</div>' +
      '<p class="mc-p">' + esc(dom.essence) + '</p>' +
      '<p class="mc-p" style="margin-top:10px">' + esc(dom.definition) +
        ' Em ' + esc(r.dominant.intensity.label.toLowerCase()) + ' (' +
        r.dominant.percentage + '%), esse padrão tende a ser ' +
        (r.dominant.percentage >= 50 ? 'central na maior parte das suas decisões.'
          : 'frequente, mas dividindo espaço com os demais perfis.') + '</p>' +
      '<div class="mc-rule"></div>' +
      '<div class="mc-quote">' + esc(dom.phrase) + '</div>',
      rd, L, 5, TOTAL));

    /* 6 — PONTOS FORTES */
    pages.push(page(
      head('Pontos fortes', 'A força do seu ' + dom.name) +
      '<p class="mc-mut" style="margin-bottom:6px">Onde esse perfil, bem ' +
        'usado, trabalha a seu favor.</p>' + listBlock(dom.strengths, 'good'),
      rd, L, 6, TOTAL));

    /* 7 — PONTOS DE ATENCAO */
    pages.push(page(
      head('Pontos de atenção', 'Quando o ' + dom.name + ' age em excesso') +
      '<p class="mc-mut" style="margin-bottom:6px">Não são defeitos: são o ' +
        'mesmo padrão sem regulação. Risco central: ' +
        esc(dom.riskCore.toLowerCase()) + '</p>' +
      listBlock(dom.attention, 'warn'),
      rd, L, 7, TOTAL));

    /* 8 — PERFIL SECUNDARIO */
    pages.push(page(
      '<div style="margin-top:8px"><span class="mc-tag">Perfil secundário</span></div>' +
      '<h1 class="mc-h1">' + esc(sec.name) + '</h1>' +
      '<div class="mc-nucleus">' + esc(sec.title) + ' · o modulador</div>' +
      '<p class="mc-p">' + esc(sec.essence) + '</p>' +
      '<p class="mc-p" style="margin-top:10px">Como perfil secundário (' +
        r.secondary.percentage + '%), o ' + esc(sec.name) + ' não comanda, ' +
        'mas modula: ele ajusta a forma como o ' + esc(dom.name) +
        ' se expressa. Onde o ' + esc(dom.name) + ' dá o impulso, o ' +
        esc(sec.name) + ' dá o tempero.</p>' +
      '<div class="mc-rule"></div>' +
      '<div class="mcc-grid">' +
        '<div class="mcc-col"><h4>' + esc(sec.name) + ' soma</h4><p>' +
          esc(sec.strengths[0]) + '. ' + esc(sec.strengths[1]) + '.</p></div>' +
        '<div class="mcc-col"><h4>' + esc(sec.name) + ' alerta</h4><p>' +
          esc(sec.attention[0]) + '.</p></div>' +
      '</div>',
      rd, L, 8, TOTAL));

    /* 9 — COMBINACAO HIBRIDA */
    var comboInner;
    if (combo) {
      comboInner = head('Combinação híbrida', combo.name) +
        '<p class="mc-mut">' + esc(dom.name) + ' + ' + esc(sec.name) + '</p>' +
        '<p class="mc-p" style="margin-top:10px">' + esc(combo.essence) + '</p>' +
        '<div class="mc-rule"></div>' +
        '<div class="mcc-grid">' +
          '<div class="mcc-col"><h4>Potencial</h4><p>' + esc(combo.potential) +
            '</p></div>' +
          '<div class="mcc-col"><h4>Risco</h4><p>' + esc(combo.risk) +
            '</p></div></div>' +
        '<div class="mc-quote" style="margin-top:14px">' + esc(combo.phrase) +
          '</div>' +
        '<span class="mc-tag" style="margin-top:8px">Desenvolvimento da combinação</span>' +
        '<p class="mc-p">' + esc(combo.development) + '</p>';
    } else {
      comboInner = head('Combinação', special ? special.name : 'Perfil de padrão único') +
        '<p class="mc-p">' + (special ? esc(special.text) :
          'Seu dominante aparece com folga sobre os demais. Em vez de uma ' +
          'combinação híbrida, o relatório lê você a partir de um padrão ' +
          'central forte — o ' + esc(dom.name) + ' conduz a maior parte das ' +
          'situações.') + '</p>';
    }
    pages.push(page(comboInner, rd, L, 9, TOTAL));

    /* 10 — PERFIL EMOCIONAL */
    pages.push(page(
      head('Perfil emocional', 'Como você sente e processa') +
      '<p class="mc-p">' + esc(appDom.emotional) + '</p>' +
      '<div class="mc-rule"></div>' +
      '<span class="mc-tag">Modulação do ' + esc(sec.name) + '</span>' +
      '<p class="mc-p">' + esc(appSec.emotional) + '</p>',
      rd, L, 10, TOTAL));

    /* 11 — PERFIL DE COMUNICACAO */
    pages.push(page(
      head('Perfil de comunicação', 'Como você se comunica') +
      twoCols('Você busca', dom.communication.seek,
              'Você evita', dom.communication.avoid) +
      '<p class="mc-p" style="margin-top:8px">Para se comunicar bem com ' +
        'você, o caminho é falar na chave do ' + esc(dom.name) + ': ' +
        esc(dom.communication.seek.toLowerCase()) + ' E evitar o que trava ' +
        'a conversa: ' + esc(dom.communication.avoid.toLowerCase()) + '</p>',
      rd, L, 11, TOTAL));

    /* 12 — O QUE AGRADA / O QUE IRRITA */
    pages.push(page(
      head('Relações', 'O que agrada e o que irrita') +
      '<div class="mcc-grid" style="align-items:flex-start">' +
        '<div style="flex:1"><span class="mc-tag">O que agrada</span>' +
          listBlock(appDom.pleases, 'good') + '</div>' +
        '<div style="flex:1"><span class="mc-tag">O que irrita</span>' +
          listBlock(appDom.annoys, 'warn') + '</div>' +
      '</div>',
      rd, L, 12, TOTAL));

    /* 13 — PERFIL NO TRABALHO */
    pages.push(page(
      head('No trabalho', 'Líder, liderado e parceiro') +
      '<div class="mcc-def"><div class="role">Como líder' +
        '<small>conduzindo</small></div><div class="desc">' +
        esc(appDom.work.asLeader) + '</div></div>' +
      '<div class="mcc-def"><div class="role">Como liderado' +
        '<small>sendo conduzido</small></div><div class="desc">' +
        esc(appDom.work.asLed) + '</div></div>' +
      '<div class="mcc-def"><div class="role">Como parceiro' +
        '<small>ao seu lado</small></div><div class="desc">' +
        esc(appDom.work.asPartner) + '</div></div>',
      rd, L, 13, TOTAL));

    /* 14 — COMO COMPRA */
    pages.push(page(
      head('Comportamento de compra', 'Como você compra') +
      '<p class="mc-p">' + esc(appDom.buys) + '</p>' +
      '<div class="mc-rule"></div>' +
      '<span class="mc-tag">Para quem vende para você</span>' +
      '<p class="mc-p">Falar na chave do ' + esc(dom.name) + ': ' +
        esc(dom.communication.seek.toLowerCase()) + '</p>',
      rd, L, 14, TOTAL));

    /* 15 — COMO VENDE */
    pages.push(page(
      head('Comportamento de venda', 'Como você vende') +
      '<p class="mc-p">' + esc(appDom.sells) + '</p>' +
      '<div class="mc-rule"></div>' +
      '<span class="mc-tag">Modulação do ' + esc(sec.name) + '</span>' +
      '<p class="mc-p">' + esc(appSec.sells) + '</p>',
      rd, L, 15, TOTAL));

    /* 16 — COMO NEGOCIA */
    pages.push(page(
      head('Comportamento de negociação', 'Como você negocia') +
      '<p class="mc-p">' + esc(appDom.negotiates) + '</p>' +
      '<div class="mc-rule"></div>' +
      '<div class="mcc-grid">' +
        '<div class="mcc-col"><h4>Sua força na mesa</h4><p>' +
          esc(dom.strengths[0]) + '.</p></div>' +
        '<div class="mcc-col"><h4>Seu ponto cego</h4><p>' +
          esc(dom.attention[0]) + '.</p></div></div>',
      rd, L, 16, TOTAL));

    /* 17 — IECR (conceito + par dominante) */
    var iecrPair = r.iecrPair || { value: '-', level: '-', orientation: '' };
    pages.push(page(
      head('IECR', 'Índice de Esforço Cognitivo Relacional') +
      '<p class="mc-p">' + esc(rd.iecrNote) + '</p>' +
      '<div class="mc-rule"></div>' +
      '<div class="mc-callout">' +
        '<span class="mc-tag">Seu par dominante · ' + esc(dom.name) +
          ' + ' + esc(sec.name) + '</span>' +
        '<div class="mc-price">' + iecrPair.value +
          ' <small>/100 · ' + esc(iecrPair.level) + '</small></div>' +
        '<p class="mc-p" style="margin-top:6px">' +
          esc(iecrPair.orientation) + '</p>' +
      '</div>' +
      '<p class="mc-mut" style="margin-top:12px">IECR médio do seu perfil ' +
        'dominante diante dos outros três: <b>' + r.iecrAvg + '/100</b>.</p>',
      rd, L, 17, TOTAL));

    /* 18 — MAPA DE ESFORCO RELACIONAL (matriz) */
    pages.push(page(
      head('Mapa relacional', 'Matriz de esforço entre perfis') +
      '<p class="mc-mut" style="margin-bottom:4px">Quanto maior o número, ' +
        'mais adaptação a relação exige. As linhas e colunas do seu perfil ' +
        'dominante (' + esc(dom.name) + ') estão destacadas.</p>' +
      iecrMatrixTable(r.dominant.profile),
      rd, L, 18, TOTAL));

    /* 19 — COMUNICACAO POR PERFIL */
    var commRows = PKEYS.map(function (k) {
      var p = CORE.profiles[k];
      return '<div class="mcc-def"><div class="role">' + esc(p.name) +
        '<small>' + esc(p.nucleus) + '</small></div><div class="desc">' +
        '<b>Busque:</b> ' + esc(p.communication.seek) + ' <b>Evite:</b> ' +
        esc(p.communication.avoid) + '</div></div>';
    }).join('');
    pages.push(page(
      head('Comunicação aplicada', 'Como falar com cada perfil') +
      '<p class="mc-mut" style="margin-bottom:4px">Use este mapa para ' +
        'adaptar sua linguagem a clientes, equipe e parceiros.</p>' + commRows,
      rd, L, 19, TOTAL));

    /* 20 — PLANO DE DESENVOLVIMENTO */
    var steps = appDom.development.map(function (s, i) {
      return '<div class="mcc-step"><div class="num">' + (i + 1) +
        '</div><div class="txt">' + esc(s) + '</div></div>';
    }).join('');
    pages.push(page(
      head('Plano de desenvolvimento', 'Seus próximos passos') +
      '<p class="mc-mut" style="margin-bottom:6px">Quatro focos práticos ' +
        'para regular o ' + esc(dom.name) + ' e ampliar seu repertório.</p>' +
      steps +
      (combo ? '<div class="mc-rule"></div><span class="mc-tag">Foco da ' +
        'combinação ' + esc(combo.name) + '</span><p class="mc-p">' +
        esc(combo.development) + '</p>' : ''),
      rd, L, 20, TOTAL));

    /* 21 — SINTESE FINAL */
    pages.push(page(
      head('Síntese', 'Seu código MINDCODE') +
      '<p class="mc-p">Seu padrão atual combina <b>' + esc(dom.name) +
        '</b> (' + r.dominant.percentage + '%) como força central e <b>' +
        esc(sec.name) + '</b> (' + r.secondary.percentage + '%) como ' +
        'modulador' + (combo ? ', formando a combinação <b>' +
        esc(combo.name) + '</b>' : '') + '. ' +
        'O caminho de evolução não é deixar de ser quem você é — é usar esse ' +
        'padrão com consciência, sabendo a hora de ativá-lo e a hora de ' +
        'regulá-lo.</p>' +
      '<div class="mc-quote">' + esc(dom.phrase) + '</div>' +
      '<p class="mc-p">O comportamento não é uma sentença. É um repertório — ' +
        'e repertório se amplia.</p>',
      rd, L, 21, TOTAL));

    /* 22 — CONTINUIDADE + DISCLAIMER */
    var cert = rd.products.certificacao;
    var emp = rd.products.empresarial;
    pages.push(page(
      head('Continuidade', 'Leve o MINDCODE adiante') +
      '<div class="mcc-grid">' +
        '<div class="mcc-col"><h4>Mentoria e aplicação</h4>' +
          '<p>Leitura individual do seu relatório e plano de ação ' +
          'acompanhado com Diego Winterhalter.</p></div>' +
        '<div class="mcc-col"><h4>Para empresas</h4>' +
          '<p>' + esc(emp.name) + ' · ' + esc(emp.priceLabel) + ' — ' +
          esc(emp.note) + '.</p></div>' +
      '</div>' +
      '<div class="mcc-grid">' +
        '<div class="mcc-col"><h4>Formação</h4>' +
          '<p>' + esc(cert.name) + ' · ' + esc(cert.priceLabel) + ' — ' +
          esc(cert.note) + '.</p></div>' +
        '<div class="mcc-col"><h4>Seu resultado</h4>' +
          '<p>' + esc(identityTitle) + ' — guarde este relatório e ' +
          'revisite seu plano de desenvolvimento.</p></div>' +
      '</div>' +
      '<div class="mc-rule"></div>' +
      '<p class="mc-disc">' + esc(rd.disclaimer) + '</p>' +
      '<p class="mc-disc" style="margin-top:6px">' + esc(rd.iecrNote) + '</p>',
      rd, L, 22, TOTAL));

    return pages.join('');
  }

  /* ---------- API ---------- */
  function generate(reportData) {
    if (!CORE) { CORE = window.MINDCODE_CORE; }
    if (!reportData || !reportData.result) {
      console.error('MINDCODE Completo: reportData invalido.');
      return;
    }
    if (!CORE.applied) {
      console.error('MINDCODE Completo: bloco "applied" ausente no Core.');
      return;
    }
    ensureUI();
    document.getElementById('mcc-pages').innerHTML = buildReport(reportData);
    var ov = document.getElementById('mc-report-c');
    ov.classList.add('open');
    ov.scrollTop = 0;
    document.body.style.overflow = 'hidden';
  }

  window.MindcodeReportCompleto = { generate: generate };

})();
