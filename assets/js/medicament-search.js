/**
 * CareSync EHR - Recherche intelligente de médicaments
 *
 * Autocomplete sur la base de médicaments vérifiés par le ministère de la Santé
 * et l'Ordre des Pharmaciens du Burkina Faso.
 *
 * Fournit aussi une fonction de rendu pour afficher la fiche complète
 * d'un médicament (posologie, contre-indications, effets indésirables).
 */
var MedicamentSearch = (function () {
  'use strict';

  var DEBOUNCE_MS = 200;
  var MAX_RESULTS = 10;

  function normalize(s) {
    if (!s) return '';
    return String(s).toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .trim();
  }

  // Calcule le score d'un médicament pour une requête
  function scoreMedicament(med, query) {
    if (!query) return 0;
    var q = normalize(query);
    if (q.length < 2) return 0;
    var score = 0;

    // DCI (priorité haute)
    var dci = normalize(med.dci);
    if (dci === q) score += 100;
    else if (dci.indexOf(q) === 0) score += 60;
    else if (dci.indexOf(q) !== -1) score += 40;

    // Nom commercial
    var nom = normalize(med.nom);
    if (nom === q) score += 90;
    else if (nom.indexOf(q) === 0) score += 50;
    else if (nom.indexOf(q) !== -1) score += 30;

    // Classe thérapeutique
    var classe = normalize(med.classe);
    if (classe.indexOf(q) !== -1) score += 20;

    return score;
  }

  // Recherche dans la base de médicaments
  function search(query) {
    var meds = Storage.getAll('medicaments');
    if (!query || query.length < 2) return [];
    var scored = meds.map(function (m) {
      return { item: m, score: scoreMedicament(m, query) };
    }).filter(function (r) { return r.score > 0; });
    scored.sort(function (a, b) { return b.score - a.score; });
    return scored.slice(0, MAX_RESULTS).map(function (r) { return r.item; });
  }

  // Rendu d'une suggestion dans la liste déroulante
  function renderSuggestion(med) {
    return '<button type="button" class="cs-search-result" data-cs-med-result>' +
      '<div class="cs-search-avatar bg-primary-100 text-primary-700">' +
        icon('pill', 18) + '</div>' +
      '<div class="cs-search-result-content">' +
        '<div class="cs-search-result-name">' + echapperHTML(med.nom) + '</div>' +
        '<div class="cs-search-result-meta">' + echapperHTML(med.dci + ' · ' + med.dosage) + '</div>' +
        '<div class="cs-search-result-id font-mono">' + echapperHTML(med.classe) + '</div>' +
      '</div>' +
      icon('chevron-right', 16) +
    '</button>';
  }

  // Rendu de la fiche complète d'un médicament (modale)
  function renderFiche(med) {
    var ci = (med.contreIndications || []).map(function (c) {
      return '<li>' + icon('x', 14) + ' ' + echapperHTML(c) + '</li>';
    }).join('');
    var ei = (med.effetsIndesirables || []).map(function (e) {
      return '<li>' + icon('alert-triangle', 14) + ' ' + echapperHTML(e) + '</li>';
    }).join('');

    return '<div class="cs-modal cs-modal-lg cs-anim-scale-in">' +
      '<div class="cs-modal-header">' +
        '<div class="flex items-center gap-3">' +
          '<div class="w-10 h-10 rounded-cs-sm bg-primary-100 text-primary-700 flex items-center justify-center">' +
            icon('pill', 22) + '</div>' +
          '<div>' +
            '<h2 class="cs-modal-title">' + echapperHTML(med.nom) + '</h2>' +
            '<p class="text-sm text-neutral-500">' + echapperHTML(med.dci + ' · ' + med.dosage) + '</p>' +
          '</div>' +
        '</div>' +
        '<button class="cs-btn cs-btn-icon" onclick="this.closest(\'.cs-modal-backdrop\').remove()" aria-label="Fermer">' + icon('x', 20) + '</button>' +
      '</div>' +
      '<div class="cs-modal-body">' +
        '<div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">' +
          ficheStat('Forme', med.forme, 'file-text') +
          ficheStat('Dosage', med.dosage, 'activity') +
          ficheStat('Prix BF', med.prixPublicBF + ' FCFA', 'tag') +
          ficheStat('Remboursement', med.remboursement, 'shield-check') +
        '</div>' +
        '<div class="cs-card p-4 mb-4">' +
          '<h3 class="font-semibold text-neutral-800 mb-2 flex items-center gap-2">' +
            icon('user', 18) + ' Posologie adulte</h3>' +
          '<p class="text-sm text-neutral-700">' + echapperHTML(med.posologieAdulte) + '</p>' +
        '</div>' +
        '<div class="cs-card p-4 mb-4">' +
          '<h3 class="font-semibold text-neutral-800 mb-2 flex items-center gap-2">' +
            icon('user-check', 18) + ' Posologie enfant</h3>' +
          '<p class="text-sm text-neutral-700">' + echapperHTML(med.posologieEnfant) + '</p>' +
        '</div>' +
        '<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">' +
          '<div class="cs-card p-4">' +
            '<h3 class="font-semibold text-danger-700 mb-2 flex items-center gap-2">' +
              icon('alert-circle', 18) + ' Contre-indications</h3>' +
            (ci ? '<ul class="cs-med-list">' + ci + '</ul>' : '<p class="text-sm text-neutral-500">Aucune contre-indication majeure.</p>') +
          '</div>' +
          '<div class="cs-card p-4">' +
            '<h3 class="font-semibold text-gold-700 mb-2 flex items-center gap-2">' +
              icon('alert-triangle', 18) + ' Effets indésirables</h3>' +
            (ei ? '<ul class="cs-med-list">' + ei + '</ul>' : '<p class="text-sm text-neutral-500">Aucun effet indésirable répertorié.</p>') +
          '</div>' +
        '</div>' +
        '<div class="cs-card p-4 bg-info-50 border-info-200">' +
          '<h3 class="font-semibold text-info-700 mb-2 flex items-center gap-2">' +
            icon('badge-check', 18) + ' Certification</h3>' +
          '<p class="text-sm text-neutral-700">Vérifié par : <strong>' + echapperHTML(med.verifiePar) + '</strong></p>' +
          '<p class="text-xs text-neutral-500 mt-1">Date de vérification : ' + formatDate(med.dateVerification) + '</p>' +
          '<p class="text-xs text-neutral-500">Statut : ' + echapperHTML(med.statut) + '</p>' +
          '<p class="text-xs text-neutral-500">Conservation : ' + echapperHTML(med.conservation) + '</p>' +
        '</div>' +
      '</div>' +
      '<div class="cs-modal-footer">' +
        '<button class="cs-btn cs-btn-secondary" onclick="this.closest(\'.cs-modal-backdrop\').remove()">Fermer</button>' +
        '<button class="cs-btn cs-btn-primary" onclick="MedicamentSearch.ajouterALOrdonnance(\'' + med.id + '\')">' +
          icon('plus', 16) + ' Ajouter à l\'ordonnance</button>' +
      '</div>' +
    '</div>';
  }

  function ficheStat(label, value, iconName) {
    return '<div class="cs-card p-3 text-center">' +
      '<div class="w-8 h-8 mx-auto rounded-cs-sm bg-neutral-100 text-neutral-700 flex items-center justify-center mb-1">' +
        icon(iconName, 16) + '</div>' +
      '<div class="text-xs text-neutral-500">' + echapperHTML(label) + '</div>' +
      '<div class="text-sm font-semibold text-neutral-800">' + echapperHTML(String(value)) + '</div>' +
    '</div>';
  }

  // Ouvre la modale de fiche complète
  function ouvrirFiche(medId) {
    var med = Storage.getById('medicaments', medId);
    if (!med) return;
    var existing = document.getElementById('cs-med-fiche-modal');
    if (existing) existing.remove();
    var backdrop = document.createElement('div');
    backdrop.id = 'cs-med-fiche-modal';
    backdrop.className = 'cs-modal-backdrop';
    backdrop.setAttribute('role', 'dialog');
    backdrop.setAttribute('aria-modal', 'true');
    backdrop.innerHTML = renderFiche(med);
    document.body.appendChild(backdrop);
    document.body.style.overflow = 'hidden';
    backdrop.addEventListener('click', function (e) {
      if (e.target === backdrop) backdrop.remove();
    });
  }

  // Placeholder pour intégration ordonnance (appelée depuis la fiche)
  function ajouterALOrdonnance(medId) {
    var med = Storage.getById('medicaments', medId);
    if (!med) return;
    showToast('Médicament ajouté', med.nom + ' prêt à être ajouté à une ordonnance.', 'success');
    // Émet un événement pour que la page d'ordonnance réagisse
    document.dispatchEvent(new CustomEvent('medicament:ajouter', { detail: { med: med } }));
  }

  // Attache l'autocomplete à un champ input
  // options = { inputSelector, resultsSelector, onSelect }
  function attach(options) {
    var input = document.querySelector(options.inputSelector);
    if (!input) return;
    var resultsEl = document.querySelector(options.resultsSelector);
    if (!resultsEl) return;

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
        var results = search(query);
        if (!results.length) {
          resultsEl.innerHTML = '<div class="cs-search-empty">Aucun médicament trouvé</div>';
        } else {
          resultsEl.innerHTML = results.map(renderSuggestion).join('');
          var btns = resultsEl.querySelectorAll('[data-cs-med-result]');
          btns.forEach(function (btn, i) {
            btn.addEventListener('click', function () {
              if (options.onSelect) options.onSelect(results[i]);
              else ouvrirFiche(results[i].id);
            });
          });
        }
        resultsEl.classList.add('cs-search-active');
      }, DEBOUNCE_MS);
    };

    input.addEventListener('input', handler);
    input.addEventListener('focus', handler);

    document.addEventListener('click', function (e) {
      if (!input.contains(e.target) && !resultsEl.contains(e.target)) {
        resultsEl.classList.remove('cs-search-active');
      }
    });
  }

  return {
    search: search,
    attach: attach,
    ouvrirFiche: ouvrirFiche,
    ajouterALOrdonnance: ajouterALOrdonnance,
    renderFiche: renderFiche
  };
})();
