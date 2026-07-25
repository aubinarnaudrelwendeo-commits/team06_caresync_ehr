/**
 * CareSync EHR - Menus repliables pour tableaux de bord
 *
 * Permet de plier/déplier les sections du tableau de bord via des icônes chevron.
 * L'état est persisté dans localStorage pour chaque utilisateur.
 */
var CollapsibleMenus = (function () {
  'use strict';

  var STORAGE_KEY = 'cs_collapsed_sections';

  // Récupère l'état replié des sections pour un utilisateur
  function getCollapsedSections(userId) {
    var all = Storage.get(STORAGE_KEY) || {};
    return all[userId] || [];
  }

  // Marque une section comme repliée pour un utilisateur
  function setCollapsed(userId, sectionId, collapsed) {
    var all = Storage.get(STORAGE_KEY) || {};
    if (!all[userId]) all[userId] = [];
    var idx = all[userId].indexOf(sectionId);
    if (collapsed && idx === -1) all[userId].push(sectionId);
    if (!collapsed && idx !== -1) all[userId].splice(idx, 1);
    Storage.set(STORAGE_KEY, all);
  }

  // Transforme une section existante en section repliable
  // target = sélecteur CSS de la section à rendre repliable
  // options = { sectionId, title, icon, defaultCollapsed }
  function makeCollapsible(target, options) {
    var section = typeof target === 'string' ? document.querySelector(target) : target;
    if (!section) return;

    var sectionId = options.sectionId || section.id || 'section-' + Math.random().toString(36).slice(2);
    var title = options.title || 'Section';
    var iconName = options.icon || 'chevron-down';
    var user = getCurrentUser();
    var userId = user ? user.id : 'guest';

    var collapsedList = getCollapsedSections(userId);
    var isCollapsed = collapsedList.indexOf(sectionId) !== -1 || options.defaultCollapsed;

    // Enveloppe le contenu existant dans un conteneur repliable
    var originalContent = section.innerHTML;
    var wrapperId = 'cs-collapse-' + sectionId;

    section.innerHTML =
      '<button type="button" class="cs-collapse-header' + (isCollapsed ? ' cs-collapsed' : '') + '"' +
        ' aria-expanded="' + (!isCollapsed) + '"' +
        ' aria-controls="' + wrapperId + '"' +
        ' onclick="CollapsibleMenus.toggle(\'' + wrapperId + '\', \'' + sectionId + '\')">' +
        '<span class="cs-collapse-title">' +
          (options.icon ? '<span class="cs-collapse-icon">' + icon(options.icon, 18) + '</span>' : '') +
          '<span>' + echapperHTML(title) + '</span>' +
        '</span>' +
        '<span class="cs-collapse-chevron">' + icon('chevron-down', 18) + '</span>' +
      '</button>' +
      '<div id="' + wrapperId + '" class="cs-collapse-body' + (isCollapsed ? ' cs-hidden' : '') + '">' +
        originalContent +
      '</div>';

    section.classList.add('cs-collapsible');
  }

  // Bascule l'état replié d'une section
  function toggle(wrapperId, sectionId) {
    var wrapper = document.getElementById(wrapperId);
    if (!wrapper) return;
    var header = wrapper.previousElementSibling;
    var isCollapsed = wrapper.classList.contains('cs-hidden');

    if (isCollapsed) {
      wrapper.classList.remove('cs-hidden');
      if (header) {
        header.classList.remove('cs-collapsed');
        header.setAttribute('aria-expanded', 'true');
      }
      setCollapsed(getCurrentUser() ? getCurrentUser().id : 'guest', sectionId, false);
    } else {
      wrapper.classList.add('cs-hidden');
      if (header) {
        header.classList.add('cs-collapsed');
        header.setAttribute('aria-expanded', 'false');
      }
      setCollapsed(getCurrentUser() ? getCurrentUser().id : 'guest', sectionId, true);
    }
  }

  // Initialise automatiquement toutes les sections avec data-cs-collapsible
  function autoInit() {
    var sections = document.querySelectorAll('[data-cs-collapsible]');
    sections.forEach(function (section) {
      var opts = {
        sectionId: section.getAttribute('data-cs-collapsible') || section.id,
        title: section.getAttribute('data-cs-title') || 'Section',
        icon: section.getAttribute('data-cs-icon') || 'folder',
        defaultCollapsed: section.getAttribute('data-cs-default') === 'collapsed'
      };
      makeCollapsible(section, opts);
    });
  }

  return {
    makeCollapsible: makeCollapsible,
    toggle: toggle,
    autoInit: autoInit,
    getCollapsedSections: getCollapsedSections
  };
})();

// Auto-initialisation au chargement
document.addEventListener('DOMContentLoaded', function () {
  CollapsibleMenus.autoInit();
});