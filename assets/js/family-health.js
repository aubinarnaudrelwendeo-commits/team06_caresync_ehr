/**
 * CareSync EHR - Logique familiale intelligente
 *
 * Analyse les données familiales (groupes sanguins, électrophorèse, antécédents)
 * pour fournir des recommandations médicales vérifiées :
 *  - Compatibilité sanguine pour transfusion
 *  - Risque de transmission de drépanocytose (selon Mendel)
 *  - Identification des donneurs potentiels dans la famille
 *  - Détection des membres à risque (enfants AS × AS, etc.)
 *
 * Sources :
 *  - OMS - Drépanocytose : https://www.who.int/health-topics/sickle-cell-disease
 *  - Haute Autorité de Santé - Recommandations transfusion
 *  - Protocole national BF de prise en charge de la drépanocytose
 */
var FamilyHealth = (function () {
  'use strict';

  // Table de compatibilité AB0 pour transfusion (donneur → receveur)
  // Lignes = donneur, colonnes = receveur, true = compatible
  var COMPATIBILITE_ABO = {
    'O-':  { 'O-':true,  'O+':true,  'A-':true,  'A+':true,  'B-':true,  'B+':true,  'AB-':true, 'AB+':true },
    'O+':  { 'O+':true,  'A+':true,  'B+':true,  'AB+':true },
    'A-':  { 'A-':true,  'A+':true,  'AB-':true, 'AB+':true },
    'A+':  { 'A+':true,  'AB+':true },
    'B-':  { 'B-':true,  'B+':true,  'AB-':true, 'AB+':true },
    'B+':  { 'B+':true,  'AB+':true },
    'AB-': { 'AB-':true, 'AB+':true },
    'AB+': { 'AB+':true }
  };

  // Transmission de l'électrophorèse selon les génotypes des parents
  // Clés TRIÉES alphabétiquement (ex : "AC+AS" et non "AS+AC")
  // pour correspondre au tri fait par probabilitesEnfant()
  var TRANSMISSION_ELECTRO = {
    'AA+AA': { 'AA': 100 },
    'AA+AC': { 'AA': 50, 'AC': 50 },
    'AA+AS': { 'AA': 50, 'AS': 50 },
    'AA+CC': { 'AC': 100 },
    'AA+SC': { 'AC': 50, 'AS': 50 },
    'AA+SS': { 'AS': 100 },
    'AC+AS': { 'AA': 25, 'AC': 25, 'AS': 25, 'SC': 25 },
    'AC+CC': { 'AC': 50, 'CC': 50 },
    'AC+SC': { 'AC': 25, 'AS': 25, 'CC': 25, 'SC': 25 },
    'AC+SS': { 'AS': 50, 'SC': 50 },
    'AS+AS': { 'AA': 25, 'AS': 50, 'SS': 25 },
    'AS+CC': { 'AC': 50, 'SC': 50 },
    'AS+SC': { 'AC': 25, 'AS': 25, 'SC': 25, 'SS': 25 },
    'AS+SS': { 'AS': 50, 'SS': 50 },
    'CC+SC': { 'CC': 50, 'SC': 50 },
    'CC+SS': { 'SC': 100 },
    'SC+SC': { 'CC': 25, 'SC': 50, 'SS': 25 },
    'SC+SS': { 'SC': 50, 'SS': 50 },
    'SS+SS': { 'SS': 100 }
  };

  // Vérifie la compatibilité donneur → receveur
  function estCompatible(donneurGS, receveurGS) {
    if (!COMPATIBILITE_ABO[donneurGS]) return false;
    return !!COMPATIBILITE_ABO[donneurGS][receveurGS];
  }

  // Retourne les génotypes possibles pour un enfant selon les parents
  function probabilitesEnfant(parent1, parent2) {
    var key = [parent1, parent2].sort().join('+');
    return TRANSMISSION_ELECTRO[key] || null;
  }

  // Évalue le risque de drépanocytose pour un enfant à naître
  function evaluerRisqueDrepanocytose(electroP1, electroP2) {
    var probs = probabilitesEnfant(electroP1, electroP2);
    if (!probs) return { niveau: 'inconnu', message: 'Données insuffisantes pour évaluer le risque.' };

    var risqueSS = probs['SS'] || 0;
    var risqueSC = probs['SC'] || 0;
    var risqueTotal = risqueSS + risqueSC;

    if (risqueTotal === 0) {
      return {
        niveau: 'faible',
        message: 'Risque faible de drépanocytose majeure.',
        probabilites: probs,
        source: 'Recommandations OMS drépanocytose'
      };
    }
    if (risqueTotal >= 50) {
      return {
        niveau: 'élevé',
        message: 'Risque ÉLEVÉ de drépanocytose majeure (' + risqueTotal + '%). Conseil génétique obligatoire.',
        probabilites: probs,
        source: 'Protocole national BF de prise en charge de la drépanocytose'
      };
    }
    return {
      niveau: 'modéré',
      message: 'Risque modéré de drépanocytose (' + risqueTotal + '%). Suivi prénatal recommandé.',
      probabilites: probs,
      source: 'Recommandations OMS drépanocytose'
    };
  }

  // Recherche des donneurs compatibles dans une famille
  function trouverDonneursFamille(familleId, receveurId) {
    var famille = Storage.getById('familles', familleId);
    if (!famille) return { compatibles: [], incompatibles: [] };

    var receveur = Storage.getById('patients', receveurId);
    if (!receveur || !receveur.groupeSanguin) {
      return { compatibles: [], incompatibles: [] };
    }

    var compatibles = [];
    var incompatibles = [];

    (famille.membres || []).forEach(function (mid) {
      if (mid === receveurId) return;
      var membre = Storage.getById('patients', mid);
      if (!membre || !membre.groupeSanguin) return;

      // Vérifie aussi l'électrophorèse : un donneur drépanocytaire (SS) est contre-indiqué
      var electro = membre.electrophorese || 'AA';
      var drepano = (electro === 'SS' || electro === 'SC');

      var info = {
        patientId: membre.id,
        nom: membre.nom, prenom: membre.prenom,
        roleFamille: membre.roleFamille,
        groupeSanguin: membre.groupeSanguin,
        electrophorese: electro,
        compatible: estCompatible(membre.groupeSanguin, receveur.groupeSanguin) && !drepano,
        motif: ''
      };

      if (!info.compatible) {
        if (drepano) info.motif = 'Drépanocytose (' + electro + ') - contre-indiqué au don';
        else info.motif = 'Groupe ' + membre.groupeSanguin + ' incompatible avec ' + receveur.groupeSanguin;
        incompatibles.push(info);
      } else {
        compatibles.push(info);
      }
    });

    return { compatibles: compatibles, incompatibles: incompatibles };
  }

  // Analyse complète d'une famille pour identifier les risques
  function analyserFamille(familleId) {
    var famille = Storage.getById('familles', familleId);
    if (!famille) return null;

    var membres = (famille.membres || []).map(function (mid) {
      return Storage.getById('patients', mid);
    }).filter(function (p) { return p !== null; });

    // Statistiques
    var stats = {
      nbMembres: membres.length,
      groupesSanguins: {},
      electrophorese: {},
      drepanocytaires: 0,
      porteursSain: 0,
      allergies: [],
      antecedents: []
    };

    membres.forEach(function (m) {
      if (m.groupeSanguin) stats.groupesSanguins[m.groupeSanguin] = (stats.groupesSanguins[m.groupeSanguin] || 0) + 1;
      if (m.electrophorese) {
        stats.electrophorese[m.electrophorese] = (stats.electrophorese[m.electrophorese] || 0) + 1;
        if (m.electrophorese === 'SS' || m.electrophorese === 'SC') stats.drepanocytaires++;
        if (m.electrophorese === 'AS' || m.electrophorese === 'AC') stats.porteursSain++;
      }
      (m.allergies || []).forEach(function (a) {
        if (stats.allergies.indexOf(a) === -1) stats.allergies.push(a);
      });
      (m.antecedents || []).forEach(function (a) {
        if (stats.antecedents.indexOf(a) === -1) stats.antecedents.push(a);
      });
    });

    // Identifie les couples à risque (parents porteurs sains)
    var parents = membres.filter(function (m) {
      return m.roleFamille === 'Père' || m.roleFamille === 'Mère';
    });
    var couplesRisque = [];
    if (parents.length === 2) {
      var p1 = parents[0], p2 = parents[1];
      if (p1.electrophorese && p2.electrophorese) {
        var risque = evaluerRisqueDrepanocytose(p1.electrophorese, p2.electrophorese);
        if (risque.niveau !== 'faible') {
          couplesRisque.push({
            p1: p1, p2: p2, risque: risque
          });
        }
      }
    }

    // Identifie les enfants déjà atteints
    var enfantsAtteints = membres.filter(function (m) {
      return m.roleFamille === 'Enfant' && (m.electrophorese === 'SS' || m.electrophorese === 'SC');
    });

    // Enfants adoptés (visible médecin seulement)
    var enfantsAdoptes = membres.filter(function (m) {
      return m.roleFamille === 'Enfant' && m.adopted === true;
    });

    return {
      famille: famille,
      membres: membres,
      stats: stats,
      couplesRisque: couplesRisque,
      enfantsAtteints: enfantsAtteints,
      enfantsAdoptes: enfantsAdoptes,
      recommandations: genererRecommandations(stats, couplesRisque, enfantsAtteints)
    };
  }

  function genererRecommandations(stats, couplesRisque, enfantsAtteints) {
    var reco = [];

    if (stats.drepanocytaires > 0) {
      reco.push({
        niveau: 'urgent',
        titre: 'Drépanocytose avérée dans la famille',
        message: stats.drepanocytaires + ' membre(s) drépanocytaire(s). Suivi médical régulier et traitement prophylactique (Hydroxyurée si indiqué).',
        source: 'Protocole national BF drépanocytose 2024'
      });
    }
    if (couplesRisque.length > 0) {
      reco.push({
        niveau: 'élevé',
        titre: 'Couple à risque de transmission',
        message: 'Conseil génétique recommandé avant nouvelle grossesse. Diagnostic prénatal possible.',
        source: 'OMS - Drépanocytose'
      });
    }
    if (stats.porteursSain > 0 && couplesRisque.length === 0) {
      reco.push({
        niveau: 'info',
        titre: 'Porteur sain identifié',
        message: stats.porteursSain + ' membre(s) porteur(s) sain(s). Information à transmettre pour le conseil génétique.',
        source: 'OMS - Drépanocytose'
      });
    }
    if (enfantsAtteints.length > 0) {
      reco.push({
        niveau: 'élevé',
        titre: 'Enfant(s) drépanocytaire(s)',
        message: 'Suivi pédiatrique spécialisé obligatoire. Vaccination pneumococcique et prophylaxie pénicilline.',
        source: 'OMS - Prise en charge drépanocytose enfant'
      });
    }
    if (stats.allergies.length > 0) {
      reco.push({
        niveau: 'info',
        titre: 'Allergies familiales',
        message: 'Allergies recensées : ' + stats.allergies.join(', ') + '. Vérifier avant toute prescription.',
        source: 'Guide pharmacologique BF'
      });
    }

    return reco;
  }

  // Rendu HTML de l'analyse familiale (vue médecin)
  function renderAnalyse(analyse) {
    if (!analyse) return '<div class="cs-card p-5">Aucune analyse disponible.</div>';

    var html = '<div class="space-y-4">';

    // Statistiques famille
    html += '<section class="cs-card p-5">' +
      '<h3 class="font-semibold text-neutral-800 mb-3 flex items-center gap-2">' +
        icon('users', 18) + ' Composition familiale</h3>' +
      '<div class="grid grid-cols-2 sm:grid-cols-4 gap-3">' +
        statBlock('Membres', analyse.stats.nbMembres, 'user') +
        statBlock('Drépanocytaires', analyse.stats.drepanocytaires, 'heart-pulse', analyse.stats.drepanocytaires > 0 ? 'danger' : 'neutral') +
        statBlock('Porteurs sains', analyse.stats.porteursSain, 'alert-triangle', analyse.stats.porteursSain > 0 ? 'warning' : 'neutral') +
        statBlock('Allergies', analyse.stats.allergies.length, 'shield-alert', analyse.stats.allergies.length > 0 ? 'warning' : 'neutral') +
      '</div></section>';

    // Couples à risque
    if (analyse.couplesRisque.length > 0) {
      html += '<section class="cs-card p-5 border-l-4 border-danger-500">' +
        '<h3 class="font-semibold text-danger-700 mb-3 flex items-center gap-2">' +
          icon('alert-triangle', 18) + ' Couples à risque génétique</h3>';
      analyse.couplesRisque.forEach(function (c) {
        html += '<div class="bg-danger-50 p-3 rounded-cs-sm mb-2">' +
          '<div class="font-medium text-neutral-800 mb-1">' +
            echapperHTML(c.p1.prenom + ' ' + c.p1.nom + ' (' + c.p1.electrophorese + ')') +
            ' × ' + echapperHTML(c.p2.prenom + ' ' + c.p2.nom + ' (' + c.p2.electrophorese + ')') +
          '</div>' +
          '<div class="text-sm text-danger-700">' + echapperHTML(c.risque.message) + '</div>' +
          '<div class="text-xs text-neutral-500 mt-1">Source : ' + echapperHTML(c.risque.source || '') + '</div>' +
        '</div>';
      });
      html += '</section>';
    }

    // Recommandations
    if (analyse.recommandations.length > 0) {
      html += '<section class="cs-card p-5">' +
        '<h3 class="font-semibold text-neutral-800 mb-3 flex items-center gap-2">' +
          icon('lightbulb', 18) + ' Recommandations médicales</h3>' +
        '<div class="space-y-2">';
      analyse.recommandations.forEach(function (r) {
        var badgeClass = r.niveau === 'urgent' ? 'cs-badge-danger'
                       : r.niveau === 'élevé' ? 'cs-badge-danger'
                       : r.niveau === 'info' ? 'cs-badge-info' : 'cs-badge-warning';
        html += '<div class="p-3 bg-neutral-50 rounded-cs-sm">' +
          '<div class="flex items-center justify-between mb-1">' +
            '<span class="font-medium text-neutral-800">' + echapperHTML(r.titre) + '</span>' +
            '<span class="cs-badge ' + badgeClass + '">' + r.niveau + '</span>' +
          '</div>' +
          '<p class="text-sm text-neutral-600">' + echapperHTML(r.message) + '</p>' +
          '<p class="text-xs text-neutral-400 mt-1">Source : ' + echapperHTML(r.source) + '</p>' +
        '</div>';
      });
      html += '</div></section>';
    }

    // Enfants adoptés (visible médecin seulement)
    if (analyse.enfantsAdoptes.length > 0) {
      html += '<section class="cs-card p-5 border-l-4 border-info-500">' +
        '<h3 class="font-semibold text-info-700 mb-3 flex items-center gap-2">' +
          icon('info', 18) + ' Informations médicales confidentielles</h3>' +
        '<p class="text-xs text-neutral-500 mb-3">Visible uniquement par les médecins - secret médical</p>' +
        '<ul class="space-y-1">';
      analyse.enfantsAdoptes.forEach(function (e) {
        html += '<li class="text-sm text-neutral-700">' + icon('user', 14) + ' ' +
          echapperHTML(e.prenom + ' ' + e.nom) + ' - <em>Adopté</em></li>';
      });
      html += '</ul></section>';
    }

    html += '</div>';
    return html;
  }

  function statBlock(label, value, iconName, color) {
    var colorClass = color === 'danger' ? 'text-danger-700'
                   : color === 'warning' ? 'text-gold-700'
                   : color === 'info' ? 'text-info-700'
                   : 'text-neutral-700';
    return '<div class="p-3 bg-neutral-50 rounded-cs-sm text-center">' +
      '<div class="w-8 h-8 mx-auto rounded-cs-sm bg-white flex items-center justify-center mb-1 ' + colorClass + '">' +
        icon(iconName, 16) + '</div>' +
      '<div class="text-xl font-bold ' + colorClass + '">' + value + '</div>' +
      '<div class="text-xs text-neutral-500">' + echapperHTML(label) + '</div>' +
    '</div>';
  }

  return {
    estCompatible: estCompatible,
    probabilitesEnfant: probabilitesEnfant,
    evaluerRisqueDrepanocytose: evaluerRisqueDrepanocytose,
    trouverDonneursFamille: trouverDonneursFamille,
    analyserFamille: analyserFamille,
    renderAnalyse: renderAnalyse,
    COMPATIBILITE_ABO: COMPATIBILITE_ABO,
    TRANSMISSION_ELECTRO: TRANSMISSION_ELECTRO
  };
})();
