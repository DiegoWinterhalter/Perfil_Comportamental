/* ============================================================
   MINDCODE ENGINE — Motor de interpretação (V1)
   ------------------------------------------------------------
   Camada de LÓGICA, separada do conteúdo.
   Nenhum texto de relatório aqui — só cálculo e classificação.
   Lê o objeto MINDCODE_CORE; nunca o modifica.

   Ordem de carregamento no site:
     <script src="data/mindcode-core.js"></script>
     <script src="js/engine.js"></script>

   API pública (window.MindcodeEngine):
     calculateScores(answers)            -> { counts, percentages }
     rankProfiles(percentages)           -> [ {profile, percentage}, ... ]
     classifyIntensity(percentage)       -> { label, note }
     detectCombination(domKey, secKey)   -> hybrid | null
     getIecr(profileA, profileB)         -> { value, level, orientation } | null
     detectFlags(percentages, ranking)   -> [ 'FLAG', ... ]
     interpret(answers)                  -> objeto-resultado completo
     buildReportData(user, result, type) -> objeto pronto para o relatório
   ============================================================ */

(function (global) {

  // Resolve o Core: global do navegador, identificador direto ou require (Node).
  var CORE = (typeof window !== 'undefined' && window.MINDCODE_CORE)
    ? window.MINDCODE_CORE
    : (typeof MINDCODE_CORE !== 'undefined')
      ? MINDCODE_CORE
      : (typeof require !== 'undefined' ? require('./mindcode-core.js') : null);

  if (!CORE) {
    throw new Error('MINDCODE ENGINE: MINDCODE_CORE nao foi carregado.');
  }

  var PROFILE_KEYS = ['leao', 'pavao', 'macaco', 'cachorro'];

  /* ------------------------------------------------------------
     calculateScores
     Aceita um array de 20 respostas. Cada item pode ser:
       - a letra direta: 'A' | 'B' | 'C' | 'D'
       - ou um objeto: { answer: 'A' } ou { key: 'A' }
     Retorna contagem e percentual por perfil.
     ------------------------------------------------------------ */
  function calculateScores(answers) {
    var counts = { leao: 0, pavao: 0, macaco: 0, cachorro: 0 };

    (answers || []).forEach(function (a) {
      if (a == null) return;
      var letter = (typeof a === 'string') ? a : (a.answer || a.key);
      if (!letter) return;
      var profile = CORE.answerMap[String(letter).toUpperCase()];
      if (profile) counts[profile] += 1;
    });

    var percentages = {};
    PROFILE_KEYS.forEach(function (p) {
      percentages[p] = counts[p] * CORE.scoringRules.responseValue;
    });

    return { counts: counts, percentages: percentages };
  }

  /* ------------------------------------------------------------
     rankProfiles
     Ordena os 4 perfis do maior para o menor percentual.
     [0] dominante  [1] secundario  [2] terceiro  [3] menor.
     Empate e resolvido por ordem fixa dos arquetipos (estavel).
     ------------------------------------------------------------ */
  function rankProfiles(percentages) {
    return PROFILE_KEYS
      .map(function (key) {
        return { profile: key, percentage: percentages[key] };
      })
      .sort(function (a, b) {
        if (b.percentage !== a.percentage) return b.percentage - a.percentage;
        return PROFILE_KEYS.indexOf(a.profile) - PROFILE_KEYS.indexOf(b.profile);
      });
  }

  /* ------------------------------------------------------------
     classifyIntensity
     Converte um percentual numa faixa de intensidade do Core.
     ------------------------------------------------------------ */
  function classifyIntensity(percentage) {
    var band = CORE.scoringRules.classification.find(function (c) {
      return percentage >= c.min && percentage <= c.max;
    });
    return band
      ? { label: band.label, note: band.note }
      : { label: '-', note: '' };
  }

  /* ------------------------------------------------------------
     detectCombination
     Localiza a combinacao hibrida oficial (a ordem importa:
     dominante + secundario). Retorna null se nao houver.
     ------------------------------------------------------------ */
  function detectCombination(dominantKey, secondaryKey) {
    var key = dominantKey + '+' + secondaryKey;
    var hybrid = CORE.hybrids[key];
    if (!hybrid) return null;
    return Object.assign({ key: key }, hybrid);
  }

  /* ------------------------------------------------------------
     getIecr
     Retorna o dado IECR de um par de perfis.
     ------------------------------------------------------------ */
  function getIecr(profileA, profileB) {
    return CORE.iecrMatrix[profileA + '+' + profileB] || null;
  }

  /* ------------------------------------------------------------
     detectFlags
     Ativa as flags interpretativas a partir dos percentuais.
     Precedencia (briefing, secao 8 / regras do Core):
       - DISTRIBUTED: dominante <= 35% E topo achatado
         (gap 1o-3o <= 10pp). Substitui hibrido e alta intensidade.
       - BALANCED: gap 1o-2o <= 5pp com topo destacado. Substitui hibrido.
       - HYBRID_ACTIVE: gap 1o-2o entre 6 e 30pp.
       - HIGH_INTENSITY: adiciona quando dominante >= 55%.
       - LOW_EXPRESSION_*: sempre adiciona (perfil <= 10%).
       - HIGH_FRICTION_PAIR: sempre adiciona (IECR dom+sec >= 75).

     Nota: o briefing define DISTRIBUTED como "nenhum perfil acima de
     35%". Sozinha, essa regra entra em conflito com BALANCED quando o
     dominante e 35% e ha um segundo proximo (ex.: 35/30/20/15). Por
     isso DISTRIBUTED exige tambem topo achatado (gap 1o-3o <= 10pp):
     um par co-dominante claro e lido como BALANCED, e so um espalhamento
     real entre os quatro perfis e lido como DISTRIBUTED.
     ------------------------------------------------------------ */
  function detectFlags(percentages, ranking) {
    var sr = CORE.scoringRules;
    var flags = [];

    var dominant = ranking[0];
    var secondary = ranking[1];
    var tertiary = ranking[2];
    var gap12 = dominant.percentage - secondary.percentage;
    var gap13 = dominant.percentage - tertiary.percentage;

    // --- Padrao central -------------------------------------
    if (dominant.percentage <= sr.distributedMax && gap13 <= sr.distributedSpread) {
      flags.push('DISTRIBUTED');
    } else {
      if (gap12 <= sr.balancedDifference) {
        flags.push('BALANCED');
      } else if (gap12 <= 30) {
        flags.push('HYBRID_ACTIVE');
      }
      // gap12 > 30: perfil unico forte, sem flag de combinacao.
      if (dominant.percentage >= sr.dominanceThreshold) {
        flags.push('HIGH_INTENSITY');
      }
    }

    // --- Baixa expressao (sempre adiciona) ------------------
    PROFILE_KEYS.forEach(function (p) {
      if (percentages[p] <= sr.lowExpressionMax) {
        flags.push('LOW_EXPRESSION_' + p.toUpperCase());
      }
    });

    // --- Atrito relacional do par dominante (sempre adiciona)
    var iecr = getIecr(dominant.profile, secondary.profile);
    if (iecr && iecr.value >= sr.highFrictionThreshold) {
      flags.push('HIGH_FRICTION_PAIR');
    }

    return flags;
  }

  /* ------------------------------------------------------------
     interpret
     Pipeline completo: recebe as 20 respostas e devolve o
     objeto-resultado que os relatorios vao consumir.
     ------------------------------------------------------------ */
  function interpret(answers) {
    var scores = calculateScores(answers);
    var percentages = scores.percentages;
    var ranking = rankProfiles(percentages);

    var flags = detectFlags(percentages, ranking);

    var dominant = ranking[0];
    var secondary = ranking[1];

    // Ranking enriquecido com nome e faixa de intensidade.
    var rankingDetailed = ranking.map(function (r) {
      return {
        profile: r.profile,
        name: CORE.profiles[r.profile].name,
        percentage: r.percentage,
        intensity: classifyIntensity(r.percentage)
      };
    });

    // Combinacao hibrida so quando a flag HYBRID_ACTIVE estiver ativa.
    var combination = (flags.indexOf('HYBRID_ACTIVE') !== -1)
      ? detectCombination(dominant.profile, secondary.profile)
      : null;

    // IECR do par dominante + secundario.
    var iecrPair = getIecr(dominant.profile, secondary.profile);

    // IECR medio: esforco do dominante diante dos outros 3 perfis.
    var others = PROFILE_KEYS.filter(function (p) {
      return p !== dominant.profile;
    });
    var iecrAvg = Math.round(
      others.reduce(function (sum, p) {
        var v = getIecr(dominant.profile, p);
        return sum + (v ? v.value : 0);
      }, 0) / others.length
    );

    return {
      counts: scores.counts,
      percentages: percentages,
      ranking: rankingDetailed,
      dominant: {
        profile: dominant.profile,
        percentage: dominant.percentage,
        intensity: rankingDetailed[0].intensity,
        data: CORE.profiles[dominant.profile]
      },
      secondary: {
        profile: secondary.profile,
        percentage: secondary.percentage,
        intensity: rankingDetailed[1].intensity,
        data: CORE.profiles[secondary.profile]
      },
      tertiary: rankingDetailed[2],
      lowest: rankingDetailed[3],
      flags: flags,
      combination: combination,
      iecrPair: iecrPair,
      iecrAvg: iecrAvg
    };
  }

  /* ------------------------------------------------------------
     buildReportData
     Empacota tudo o que o relatorio precisa para renderizar.
     type: 'enxuto' | 'completo'
     ------------------------------------------------------------ */
  function buildReportData(user, result, type) {
    var reportType = (type === 'completo') ? 'completo' : 'enxuto';
    return {
      type: reportType,
      generatedAt: new Date().toISOString(),
      user: {
        name: (user && user.name) || '',
        email: (user && user.email) || '',
        whatsapp: (user && user.whatsapp) || '',
        role: (user && user.role) || ''
      },
      brand: CORE.brand,
      disclaimer: CORE.meta.disclaimer,
      iecrNote: CORE.meta.iecrNote,
      sections: CORE.reportStructure[reportType],
      products: CORE.products,
      result: result
    };
  }

  /* ------------------------------------------------------------
     Exposicao da API
     ------------------------------------------------------------ */
  var MindcodeEngine = {
    calculateScores: calculateScores,
    rankProfiles: rankProfiles,
    classifyIntensity: classifyIntensity,
    detectCombination: detectCombination,
    getIecr: getIecr,
    detectFlags: detectFlags,
    interpret: interpret,
    buildReportData: buildReportData
  };

  if (typeof window !== 'undefined') { window.MindcodeEngine = MindcodeEngine; }
  if (typeof module !== 'undefined' && module.exports) { module.exports = MindcodeEngine; }

})(typeof globalThis !== 'undefined' ? globalThis : this);
