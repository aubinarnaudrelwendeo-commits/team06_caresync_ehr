/**
 * CareSync EHR - Système de notation des médecins (cursus coeur)
 *
 * Les patients peuvent attribuer une note de 1 à 4 coeurs à un médecin.
 * Chaque niveau de coeur a une couleur spécifique :
 *   - 4 coeurs rouges  : Excellent (note 5)
 *   - 3 coeurs rouges  : Très bon (note 4)
 *   - 2 coeurs orange  : Correct (note 3)
 *   - 1 coeur gris     : À améliorer (note 1-2)
 *
 * Le ministère de la Santé utilise ces données pour piloter la qualité
 * des soins. Les avis sont modérés avant publication.
 *
 * Statut : BETA (fonctionnalité en test)
 */
var HeartsRating = (function () {
  'use strict';

  var STATUT_BETA = true;

  // Couleurs SVG des coeurs selon le niveau
  var COULEURS = {
    plein: '#DC2626',      // Rouge vif
    demi: '#F97316',      // Orange
    vide: '#E5E7EB',       // Gris clair
    urgent: '#9CA3AF'      // Gris
  };

  // Convertit une note 1-5 en nombre de coeurs pleins (sur 4)
  function noteToCoeurs(note) {
    if (note >= 5) return 4;
    if (note >= 4) return 3;
    if (note >= 3) return 2;
    if (note >= 2) return 1;
    return 0;
  }

  // Convertit 4 coeurs en libellé
  function coeursToLabel(coeurs) {
    if (coeurs >= 4) return 'Excellent';
    if (coeurs === 3) return 'Très bon';
    if (coeurs === 2) return 'Correct';
    if (coeurs === 1) return 'À améliorer';
    return 'Insuffisant';
  }

  // Rendu HTML des coeurs SVG (sans emoji)
  // count = nombre de coeurs pleins (0 à 4)
  // interactive = true pour permettre le clic
  function renderCoeurs(count, interactive, medecinId) {
    var html = '<div class="cs-hearts' + (interactive ? ' cs-hearts-interactive' : '') + '" role="img" aria-label="' + count + ' coeurs sur 4"';
    if (interactive) html += ' data-medecin-id="' + (medecinId || '') + '"';
    html += '>';

    for (var i = 1; i <= 4; i++) {
      var color = i <= count ? COULEURS.plein : COULEURS.vide;
      var filled = i <= count;
      html += '<svg width="20" height="20" viewBox="0 0 24 24"' +
        ' class="cs-heart' + (interactive ? ' cs-heart-clickable' : '') + '"' +
        ' fill="' + color + '"' +
        ' stroke="' + (filled ? '#991B1B' : '#9CA3AF') + '"' +
        ' stroke-width="1.5"' +
        (interactive ? ' data-heart-index="' + i + '" role="button" tabindex="0" aria-label="' + i + ' coeur' + (i > 1 ? 's' : '') + '"' : '') +
        ' aria-hidden="' + (interactive ? 'false' : 'true') + '">' +
        '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>' +
        '<path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27" fill="none" stroke="' + (filled ? '#FFFFFF' : 'transparent') + '" stroke-width="1.2"/>' +
        '</svg>';
    }

    if (STATUT_BETA) {
      html += '<span class="cs-badge cs-badge-warning cs-badge-xs ml-2">BETA</span>';
    }

    html += '</div>';
    return html;
  }

  // Rendu d'un widget complet avec libellé et note moyenne
  function renderWidget(medecinId) {
    var med = Storage.getById('medecins', medecinId);
    if (!med) return '';

    var avis = Storage.getAll('avisMedecins').filter(function (a) {
      return a.medecinId === medecinId && a.visible;
    });

    if (avis.length === 0) {
      return '<div class="cs-hearts-widget">' +
        '<div class="text-xs text-neutral-500 mb-1">Aucun avis patient</div>' +
        renderCoeurs(0, false) +
        '<div class="text-xs text-neutral-400 mt-1">Pas encore noté</div>' +
      '</div>';
    }

    var somme = avis.reduce(function (acc, a) { return acc + a.note; }, 0);
    var moyenne = somme / avis.length;
    var coeurs = noteToCoeurs(moyenne);

    return '<div class="cs-hearts-widget">' +
      '<div class="flex items-center gap-2 mb-1">' +
        '<span class="text-xs text-neutral-500">' + avis.length + ' avis</span>' +
        '<span class="text-xs font-mono text-neutral-400">·</span>' +
        '<span class="text-xs font-semibold text-neutral-700">' + moyenne.toFixed(1) + '/5</span>' +
      '</div>' +
      renderCoeurs(coeurs, false) +
      '<div class="text-xs text-neutral-600 mt-1">' + coeursToLabel(coeurs) + '</div>' +
    '</div>';
  }

  // Rendu du formulaire de notation (patient connecté)
  function renderFormulaireNotation(medecinId, patientId) {
    var existant = Storage.getAll('avisMedecins').find(function (a) {
      return a.medecinId === medecinId && a.patientId === patientId;
    });

    var coeursInit = existant ? noteToCoeurs(existant.note) : 0;

    return '<div class="cs-card p-5">' +
      '<h3 class="font-semibold text-neutral-800 mb-2 flex items-center gap-2">' +
        icon('heart-pulse', 18) + ' Votre avis sur ce médecin' +
        '<span class="cs-badge cs-badge-warning cs-badge-xs">BETA</span>' +
      '</h3>' +
      '<p class="text-sm text-neutral-600 mb-4">Cliquez sur un coeur pour noter. Votre avis aide le ministère de la Santé à améliorer la qualité des soins.</p>' +
      '<div id="cs-hearts-input" data-medecin-id="' + medecinId + '" data-patient-id="' + patientId + '">' +
        renderCoeurs(coeursInit, true, medecinId) +
      '</div>' +
      '<label class="block text-sm font-medium text-neutral-700 mt-4 mb-1" for="cs-avis-commentaire">Commentaire (optionnel)</label>' +
      '<textarea id="cs-avis-commentaire" rows="3" class="cs-input" placeholder="Décrivez votre expérience..." maxlength="500">' +
        echapperHTML(existant ? existant.commentaire : '') + '</textarea>' +
      '<div class="flex items-center gap-2 mt-3">' +
        '<button class="cs-btn cs-btn-primary" onclick="HeartsRating.soumettreAvis(\'' + medecinId + '\', \'' + patientId + '\')">' +
          icon('check', 16) + ' Soumettre mon avis</button>' +
        (existant ? '<button class="cs-btn cs-btn-ghost" onclick="HeartsRating.supprimerAvis(\'' + existant.id + '\', \'' + medecinId + '\', \'' + patientId + '\')">Supprimer</button>' : '') +
      '</div>' +
      '<p class="text-xs text-neutral-400 mt-3">Les avis sont modérés par le ministère. Votre identité reste confidentielle si vous choisissez l\'option anonyme.</p>' +
    '</div>';
  }

  // Attache les handlers de clic sur les coeurs interactifs
  function bindCoeurs(container) {
    var hearts = (container || document).querySelectorAll('.cs-heart-clickable');
    hearts.forEach(function (heart) {
      // Évite les doubles-bindings
      if (heart.getAttribute('data-bound') === '1') return;
      heart.setAttribute('data-bound', '1');

      heart.addEventListener('click', function () {
        var index = parseInt(heart.getAttribute('data-heart-index'), 10);
        var heartsContainer = heart.closest('.cs-hearts');
        if (!heartsContainer) return;
        var medecinId = heartsContainer.getAttribute('data-medecin-id') || '';

        // Met à jour visuellement : change la couleur des coeurs cliqués
        var allHearts = heartsContainer.querySelectorAll('svg');
        allHearts.forEach(function (h, i) {
          var filled = i < index;
          h.setAttribute('fill', filled ? COULEURS.plein : COULEURS.vide);
          h.setAttribute('stroke', filled ? '#991B1B' : '#9CA3AF');
          var innerPath = h.querySelectorAll('path')[1];
          if (innerPath) {
            innerPath.setAttribute('stroke', filled ? '#FFFFFF' : 'transparent');
          }
        });

        // Stocke la valeur sélectionnée dans le conteneur parent
        var inputContainer = heartsContainer.closest('#cs-hearts-input') || heartsContainer.parentElement;
        inputContainer.setAttribute('data-selected-coeurs', String(index));
      });

      // Support clavier
      heart.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          heart.click();
        }
      });
    });
  }

  // Ouvre une modale contenant le formulaire de notation
  function ouvrirFormulaireNotation(medecinId, patientId) {
    var existing = document.getElementById('cs-hearts-modal');
    if (existing) existing.remove();
    var backdrop = document.createElement('div');
    backdrop.id = 'cs-hearts-modal';
    backdrop.className = 'cs-modal-backdrop';
    backdrop.setAttribute('role', 'dialog');
    backdrop.setAttribute('aria-modal', 'true');

    var med = Storage.getById('medecins', medecinId);
    var medName = med ? (med.prenom + ' ' + med.nom) : 'Médecin';

    backdrop.innerHTML = '<div class="cs-modal cs-anim-scale-in">' +
      '<div class="cs-modal-header">' +
        '<div class="flex items-center gap-3">' +
          '<div class="w-10 h-10 rounded-cs-sm bg-primary-100 text-primary-700 flex items-center justify-center">' + icon('heart-pulse', 22) + '</div>' +
          '<div><h2 class="cs-modal-title">Noter le médecin</h2>' +
          '<p class="text-sm text-neutral-500">' + echapperHTML(medName) + '</p></div>' +
        '</div>' +
        '<button class="cs-btn cs-btn-icon" onclick="this.closest(\'.cs-modal-backdrop\').remove()" aria-label="Fermer">' + icon('x', 20) + '</button>' +
      '</div>' +
      '<div class="cs-modal-body" id="cs-hearts-modal-body">' +
        renderFormulaireNotation(medecinId, patientId) +
      '</div>' +
    '</div>';
    document.body.appendChild(backdrop);
    document.body.style.overflow = 'hidden';
    backdrop.addEventListener('click', function (e) {
      if (e.target === backdrop) backdrop.remove();
    });
    setTimeout(function () {
      bindCoeurs(document.getElementById('cs-hearts-modal-body'));
    }, 50);
  }

  // Récupère la valeur sélectionnée dans un conteneur
  function getSelectedCoeurs(container) {
    var selected = container.getAttribute('data-selected-coeurs');
    return selected ? parseInt(selected, 10) : 0;
  }

  // Soumet un avis (appel API)
  function soumettreAvis(medecinId, patientId) {
    var container = document.getElementById('cs-hearts-input');
    if (!container) {
      showToast('Erreur', 'Impossible de soumettre l\'avis.', 'error');
      return;
    }
    var coeurs = getSelectedCoeurs(container);
    if (coeurs === 0) {
      showToast('Note requise', 'Veuillez sélectionner au moins 1 coeur.', 'warning');
      return;
    }
    var commentaire = (document.getElementById('cs-avis-commentaire') || {}).value || '';

    // Convertit coeurs en note (1-5)
    var note = coeurs === 4 ? 5 : coeurs === 3 ? 4 : coeurs === 2 ? 3 : coeurs === 1 ? 2 : 1;

    // Vérifie s'il existe déjà un avis
    var existant = Storage.getAll('avisMedecins').find(function (a) {
      return a.medecinId === medecinId && a.patientId === patientId;
    });

    if (existant) {
      Storage.update('avisMedecins', existant.id, {
        note: note, coeurs: coeurs, commentaire: commentaire,
        date: new Date().toISOString().slice(0, 10)
      });
      showToast('Avis mis à jour', 'Merci pour votre retour.', 'success');
    } else {
      Storage.create('avisMedecins', {
        medecinId: medecinId, patientId: patientId,
        note: note, coeurs: coeurs, commentaire: commentaire,
        date: new Date().toISOString().slice(0, 10),
        visible: true, anonyme: false, reponseMedecin: null
      });
      showToast('Avis soumis', 'Merci pour votre retour.', 'success');
    }

    // Recalcule la note moyenne du médecin
    recalculerMoyenneMedecin(medecinId);

    // Notifie le ministère pour modération
    Storage.addNotification('BFA-ADM-2026-0001', 'info',
      'Nouvel avis patient',
      'Un patient a noté un médecin (' + coeurs + '/4 coeurs). À modérer.',
      { action: 'avis', medecinId: medecinId });
  }

  // Supprime un avis
  function supprimerAvis(avisId, medecinId, patientId) {
    if (!confirm('Voulez-vous vraiment supprimer votre avis ?')) return;
    Storage.removeById('avisMedecins', avisId);
    recalculerMoyenneMedecin(medecinId);
    showToast('Avis supprimé', 'Votre avis a été retiré.', 'info');
    // Recharge le formulaire
    var container = document.getElementById('cs-hearts-input');
    if (container) {
      var parent = container.parentElement;
      parent.innerHTML = renderFormulaireNotation(medecinId, patientId);
      bindCoeurs(parent);
    }
  }

  // Recalcule la note moyenne d'un médecin et met à jour son profil
  function recalculerMoyenneMedecin(medecinId) {
    var avis = Storage.getAll('avisMedecins').filter(function (a) {
      return a.medecinId === medecinId && a.visible;
    });
    if (avis.length === 0) {
      Storage.update('medecins', medecinId, { noteMoyenne: null, nbAvis: 0 });
      return;
    }
    var somme = avis.reduce(function (acc, a) { return acc + a.note; }, 0);
    var moyenne = somme / avis.length;
    Storage.update('medecins', medecinId, {
      noteMoyenne: Math.round(moyenne * 100) / 100,
      nbAvis: avis.length
    });
  }

  // Rendu de la liste des avis pour un médecin (vue admin/ministère)
  function renderListeAvis(medecinId) {
    var avis = Storage.getAll('avisMedecins').filter(function (a) {
      return a.medecinId === medecinId;
    }).sort(function (a, b) { return (b.date || '').localeCompare(a.date || ''); });

    if (avis.length === 0) {
      return '<div class="cs-card p-5 text-center text-neutral-500">' + icon('heart-pulse', 32) +
        '<p class="mt-2 text-sm">Aucun avis pour ce médecin.</p></div>';
    }

    var html = '<div class="space-y-3">';
    avis.forEach(function (a) {
      var patient = Storage.getById('patients', a.patientId);
      var nomPatient = a.anonyme ? 'Anonyme' : (patient ? patient.prenom + ' ' + patient.nom : 'Patient supprimé');
      html += '<div class="cs-card p-4">' +
        '<div class="flex items-start justify-between mb-2">' +
          '<div>' +
            '<div class="font-medium text-neutral-800">' + echapperHTML(nomPatient) + '</div>' +
            '<div class="text-xs text-neutral-500">' + formatDate(a.date, { long: true }) + '</div>' +
          '</div>' +
          '<div class="text-right">' +
            renderCoeurs(noteToCoeurs(a.note), false) +
            '<div class="text-xs text-neutral-500 mt-1">' + a.note + '/5</div>' +
          '</div>' +
        '</div>' +
        (a.commentaire ? '<p class="text-sm text-neutral-700 mt-2">' + echapperHTML(a.commentaire) + '</p>' : '') +
        (a.reponseMedecin ? '<div class="mt-3 p-3 bg-info-50 rounded-cs-sm"><strong class="text-xs text-info-700">Réponse du médecin :</strong><p class="text-sm text-neutral-700 mt-1">' + echapperHTML(a.reponseMedecin) + '</p></div>' : '') +
        '<div class="flex gap-2 mt-3">' +
          '<button class="cs-btn cs-btn-sm cs-btn-ghost" onclick="HeartsRating.toggleVisibilite(\'' + a.id + '\')">' +
            (a.visible ? icon('eye-off', 14) + ' Masquer' : icon('eye', 14) + ' Afficher') +
          '</button>' +
        '</div>' +
      '</div>';
    });
    html += '</div>';
    return html;
  }

  // Bascule la visibilité d'un avis (modération)
  function toggleVisibilite(avisId) {
    var a = Storage.getById('avisMedecins', avisId);
    if (!a) return;
    Storage.update('avisMedecins', avisId, { visible: !a.visible });
    showToast('Visibilité modifiée', a.visible ? 'Avis masqué.' : 'Avis affiché.', 'info');
  }

  return {
    renderCoeurs: renderCoeurs,
    renderWidget: renderWidget,
    renderFormulaireNotation: renderFormulaireNotation,
    ouvrirFormulaireNotation: ouvrirFormulaireNotation,
    renderListeAvis: renderListeAvis,
    bindCoeurs: bindCoeurs,
    soumettreAvis: soumettreAvis,
    supprimerAvis: supprimerAvis,
    toggleVisibilite: toggleVisibilite,
    recalculerMoyenneMedecin: recalculerMoyenneMedecin,
    noteToCoeurs: noteToCoeurs,
    coeursToLabel: coeursToLabel,
    STATUT_BETA: STATUT_BETA
  };
})();
