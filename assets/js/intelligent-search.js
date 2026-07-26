/**
 * CareSync EHR - Recherche intelligente de patients et médecins
 *
 * Recherche multi-critères : nom, prénom, identifiant BFA, numéro CIN, téléphone.
 * Fonctionne comme un autocomplete avec suggestions en temps réel.
 */
var IntelligentSearch = (function () {
  'use strict';

  // Délai avant déclenchement de la recherche (ms)
  var DEBOUNCE_MS = 200;

  // Nombre maximum de suggestions affichées
  var MAX_RESULTS = 8;

  // Poids des différents critères de scoring
  var SCORE_ID = 100;
  var SCORE_CIN = 80;
  var SCORE_NOM_EXACT = 50;
  var SCORE_NOM_PARTIAL = 20;
  var SCORE_PRENOM = 30;
  var SCORE_TELEPHONE = 60;

  // Normalise une chaîne pour comparaison (sans accents, majuscules)
  function normalize(s) {
    if (!s) return '';
    return String(s).toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, ' ').trim();
  }

  // Calcule le score de pertinence d'un item pour une requête
  function scoreItem(item, query, entityType) {
    if (!query) return 0;
    var q = normalize(query);
    if (!q) return 0;
    var score = 0;

    // ID exact (BFA-PAT-2026-XXXX)
    if (item.id && normalize(item.id) === q) score += SCORE_ID;
    else if (item.id && normalize(item.id).indexOf(q) !== -1) score += SCORE_ID / 2;

    // Numéro CIN burkinabè
    if (item.numeroCIN) {
      if (normalize(item.numeroCIN) === q) score += SCORE_CIN;
      else if (normalize(item.numeroCIN).indexOf(q) !== -1) score += SCORE_CIN / 2;
    }

    // Téléphone (recherche sur chiffres uniquement)
    var qDigits = q.replace(/\D/g, '');
    if (qDigits.length >= 3 && item.telephone) {
      var telDigits = item.telephone.replace(/\D/g, '');
      if (telDigits.indexOf(qDigits) !== -1) score += SCORE_TELEPHONE;
    }

    // Nom
    var nom = normalize(item.nom);
    if (nom === q) score += SCORE_NOM_EXACT;
    else if (nom.indexOf(q) !== -1) score += SCORE_NOM_PARTIAL;

    // Prénom
    var prenom = normalize(item.prenom);
    if (prenom === q) score += SCORE_PRENOM;
    else if (prenom.indexOf(q) !== -1) score += SCORE_PRENOM / 2;

    // Spécialité (médecins)
    if (entityType === 'medecins' && item.specialite) {
      var spec = normalize(item.specialite);
      if (spec.indexOf(q) !== -1) score += SCORE_NOM_PARTIAL;
    }

    return score;
  }

  // Recherche dans une entité et renvoie les meilleurs résultats
  function search(entity, query) {
    var items = Storage.getAll(entity);
    if (!query || query.length < 2) return [];
    var scored = items.map(function (it) {
      return { item: it, score: scoreItem(it, query, entity) };
    }).filter(function (r) { return r.score > 0; });
    scored.sort(function (a, b) { return b.score - a.score; });
    return scored.slice(0, MAX_RESULTS).map(function (r) { return r.item; });
  }

  // Construit le HTML d'un résultat de suggestion
  function renderResult(item, type, onclick) {
    var avatar = '<div class="cs-search-avatar ' + avatarColor(item.id) + '">' +
      initiales(item.prenom, item.nom) + '</div>';

    var ligne2 = '';
    if (type === 'patients') {
      var age = item.dateNaissance ? calculerAge(item.dateNaissance) : null;
      ligne2 = (item.sexe === 'F' ? 'F' : 'M') + (age !== null ? ' · ' + age + ' ans' : '');
      if (item.groupeSanguin) ligne2 += ' · ' + item.groupeSanguin;
    } else if (type === 'medecins') {
      ligne2 = item.specialite || '—';
      if (item.etablissement) ligne2 += ' · ' + truncate(item.etablissement, 30);
    } else if (type === 'structures') {
      ligne2 = item.type || '—';
      if (item.region) ligne2 += ' · ' + item.region;
    }

    return '<button type="button" class="cs-search-result" data-cs-search-result>' +
      avatar +
      '<div class="cs-search-result-content">' +
        '<div class="cs-search-result-name">' + echapperHTML(item.prenom + ' ' + item.nom) + '</div>' +
        '<div class="cs-search-result-meta">' + echapperHTML(ligne2) + '</div>' +
        '<div class="cs-search-result-id font-mono">' + echapperHTML(item.id) + '</div>' +
      '</div>' +
      icon('chevron-right', 16) +
    '</button>';
  }

  // Attache la recherche à un champ input
  // options = { inputSelector, resultsSelector, entityType, onSelect, onNoResults }
  function attach(options) {
    var input = document.querySelector(options.inputSelector);
    if (!input) return;

    var resultsEl = document.querySelector(options.resultsSelector);
    if (!resultsEl) return;

    var entityType = options.entityType || 'patients';
    var timer = null;

    var handler = function () {
      var query = input.value.trim();
      if (timer) clearTimeout(timer);
      timer = setTimeout(function () {
        if (query.length < 2) {
          resultsEl.innerHTML = '';
          resultsEl.classList.remove('cs-search-active');
          return;
        }
        var results = search(entityType, query);
        renderResults(results, resultsEl, entityType, options.onSelect);
      }, DEBOUNCE_MS);
    };

    input.addEventListener('input', handler);
    input.addEventListener('focus', handler);

    // Ferme les résultats au clic extérieur
    document.addEventListener('click', function (e) {
      if (!input.contains(e.target) && !resultsEl.contains(e.target)) {
        resultsEl.classList.remove('cs-search-active');
      }
    });
  }

  function renderResults(results, container, type, onSelect) {
    if (!results.length) {
      container.innerHTML = '<div class="cs-search-empty">Aucun résultat trouvé</div>';
      container.classList.add('cs-search-active');
      return;
    }
    var html = results.map(function (item) {
      return renderResult(item, type);
    }).join('');
    container.innerHTML = html;
    container.classList.add('cs-search-active');

    // Attache les handlers de clic
    var btns = container.querySelectorAll('[data-cs-search-result]');
    btns.forEach(function (btn, i) {
      btn.addEventListener('click', function () {
        if (onSelect) onSelect(results[i]);
      });
    });
  }

  return {
    search: search,
    attach: attach,
    normalize: normalize
  };
})();
