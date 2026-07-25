// Utils - Fonctions globales partagées : formatage, échappement HTML, toasts.

/**
 * Charge un fichier JSON via fetch
 * @param {string} path - chemin relatif
 * @returns {Promise<*|null>}
 */
function loadJSON(path) {
  return fetch(path)
    .then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    })
    .catch(function (err) {
      console.warn('loadJSON error for', path, err);
      return null;
    });
}

/**
 * Échappe le HTML pour prévention XSS
 * @param {string} texte
 * @returns {string}
 */
function echapperHTML(texte) {
  if (texte === null || texte === undefined) return '';
  return String(texte)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Formate une date ISO en chaîne lisible
 * @param {string} dateStr - ISO date
 * @param {Object} options - { avecHeure: bool, long: bool }
 * @returns {string}
 */
function formatDate(dateStr, options) {
  if (!dateStr) return '—';
  options = options || {};
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '—';
    const formatOpts = options.long
      ? { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }
      : { day: '2-digit', month: '2-digit', year: 'numeric' };
    if (options.avecHeure) {
      formatOpts.hour = '2-digit';
      formatOpts.minute = '2-digit';
    }
    return d.toLocaleDateString('fr-FR', formatOpts);
  } catch (e) {
    return '—';
  }
}

/**
 * Formate une date relative (il y a X minutes)
 * @param {string} dateStr
 * @returns {string}
 */
function formatRelative(dateStr) {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now - d) / 1000);
    if (diff < 60) return 'à l\'instant';
    if (diff < 3600) return 'il y a ' + Math.floor(diff / 60) + ' min';
    if (diff < 86400) return 'il y a ' + Math.floor(diff / 3600) + ' h';
    if (diff < 604800) return 'il y a ' + Math.floor(diff / 86400) + ' j';
    return formatDate(dateStr);
  } catch (e) {
    return '—';
  }
}

/**
 * Calcule l'âge en années
 * @param {string} dateNaissance - ISO date
 * @returns {number|null}
 */
function calculerAge(dateNaissance) {
  if (!dateNaissance) return null;
  const d = new Date(dateNaissance);
  if (isNaN(d.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
  return age >= 0 ? age : null;
}

/**
 * Retourne l'âge formaté
 * @param {string} dateNaissance
 * @returns {string}
 */
function formatAge(dateNaissance) {
  const age = calculerAge(dateNaissance);
  if (age === null) return '—';
  if (age === 0) {
    const mois = Math.floor((Date.now() - new Date(dateNaissance).getTime()) / (30 * 86400000));
    return mois + ' mois';
  }
  return age + ' ans';
}

/**
 * Calcule l'IMC
 * @param {number} poids - kg
 * @param {number} taille - cm
 * @returns {string|null}
 */
function calculerIMC(poids, taille) {
  if (!poids || !taille) return null;
  const imc = poids / Math.pow(taille / 100, 2);
  return imc.toFixed(1);
}

/**
 * Initiales d'une personne
 * @param {string} prenom
 * @param {string} nom
 * @returns {string}
 */
function initiales(prenom, nom) {
  const p = (prenom || '').trim().charAt(0).toUpperCase();
  const n = (nom || '').trim().charAt(0).toUpperCase();
  if (!p && !n) return '?';
  return (p + n) || '?';
}

/**
 * Utilisateur connecté courant
 * @returns {Object|null}
 */
function getCurrentUser() {
  return Storage.get('user');
}

/**
 * Vérifie l'authentification (redirige si non connecté ou mauvais rôle)
 * @param {string} role - 'patient' | 'medecin' | 'admin' | undefined
 * @returns {Object|null} utilisateur si authentifié
 */
function requireAuth(role) {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = '../index.html';
    return null;
  }
  if (role && user.role !== role) {
    const routes = {
      patient: 'dashboard-patient.html',
      medecin: 'dashboard-medecin.html',
      admin: 'dashboard-admin.html'
    };
    if (routes[user.role]) {
      window.location.href = routes[user.role];
    } else {
      window.location.href = '../index.html';
    }
    return null;
  }
  return user;
}

/**
 * Déconnexion
 */
function logout() {
  const user = getCurrentUser();
  if (user) {
    Storage.logAction('deconnexion', user.id, user.role, 'Déconnexion utilisateur');
  }
  Storage.remove('user');
  Storage.remove('remember');
  window.location.href = '../index.html';
}

/**
 * Affiche un toast
 * @param {string} titre
 * @param {string} message
 * @param {string} type - 'success' | 'error' | 'warning' | 'info'
 * @param {number} duration - millisecondes (défaut 4500)
 */
function showToast(titre, message, type, duration) {
  type = type || 'success';
  duration = duration || 4500;
  let container = document.querySelector('.cs-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'cs-toast-container';
    document.body.appendChild(container);
  }

  const icons = {
    success: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
    error: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
    warning: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
    info: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
  };

  const toast = document.createElement('div');
  toast.className = 'cs-toast cs-toast-' + type;
  toast.setAttribute('role', 'alert');
  toast.innerHTML =
    '<div class="cs-toast-icon">' + (icons[type] || icons.info) + '</div>' +
    '<div class="cs-toast-content">' +
      '<div class="cs-toast-title">' + echapperHTML(titre) + '</div>' +
      (message ? '<div class="cs-toast-message">' + echapperHTML(message) + '</div>' : '') +
    '</div>' +
    '<button class="cs-toast-close" aria-label="Fermer">' +
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
    '</button>';
  container.appendChild(toast);

  // Animation d'entrée
  requestAnimationFrame(function () { toast.classList.add('visible'); });

  // Fermeture
  const closeBtn = toast.querySelector('.cs-toast-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', function () { removeToast(toast); });
  }
  // Auto-fermeture
  setTimeout(function () { removeToast(toast); }, duration);
}

function removeToast(toast) {
  if (!toast || !toast.parentNode) return;
  toast.classList.remove('visible');
  toast.classList.add('cs-toast-out');
  setTimeout(function () {
    if (toast.parentNode) toast.parentNode.removeChild(toast);
  }, 250);
}

/**
 * Génère un numéro de téléphone burkinabè aléatoire
 * @returns {string}
 */
function randomPhone() {
  const prefixes = ['70', '71', '72', '76', '77', '78', '65', '66', '67', '68'];
  const p = prefixes[Math.floor(Math.random() * prefixes.length)];
  const r = function () { return String(Math.floor(Math.random() * 100)).padStart(2, '0'); };
  return '+226 ' + p + ' ' + r() + ' ' + r() + ' ' + r();
}

/**
 * Génère une date aléatoire entre deux années
 * @param {number} yearStart
 * @param {number} yearEnd
 * @returns {string} YYYY-MM-DD
 */
function randomDate(yearStart, yearEnd) {
  const y = yearStart + Math.floor(Math.random() * (yearEnd - yearStart + 1));
  const m = 1 + Math.floor(Math.random() * 12);
  const d = 1 + Math.floor(Math.random() * 28);
  return y + '-' + String(m).padStart(2, '0') + '-' + String(d).padStart(2, '0');
}

/**
 * Génère un ID patient aléatoire pour tests
 * @returns {string}
 */
function generatePatientId() {
  const num = 1000 + Math.floor(Math.random() * 9000);
  return 'BFA-PAT-2026-' + num;
}

/**
 * Première lettre en majuscule
 * @param {string} str
 * @returns {string}
 */
function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Tronque un texte avec ellipsis
 * @param {string} str
 * @param {number} n
 * @returns {string}
 */
function truncate(str, n) {
  n = n || 50;
  if (!str) return '';
  return str.length > n ? str.substring(0, n) + '…' : str;
}

/**
 * Retourne la classe CSS du badge selon le statut
 * @param {string} statut
 * @returns {string} classe cs-badge-*
 */
function badgeForStatut(statut) {
  if (!statut) return 'cs-badge-neutral';
  const s = statut.toLowerCase();
  const map = {
    'validé': 'cs-badge-success',
    'valide': 'cs-badge-success',
    'actif': 'cs-badge-success',
    'active': 'cs-badge-success',
    'terminée': 'cs-badge-success',
    'terminé': 'cs-badge-success',
    'à jour': 'cs-badge-success',
    'certifiée': 'cs-badge-success',
    'certifié': 'cs-badge-success',
    'en_attente': 'cs-badge-warning',
    'en attente': 'cs-badge-warning',
    'en cours': 'cs-badge-info',
    'en_cours': 'cs-badge-info',
    'à venir': 'cs-badge-info',
    'a venir': 'cs-badge-info',
    'brouillon': 'cs-badge-neutral',
    'inactif': 'cs-badge-neutral',
    'inactive': 'cs-badge-neutral',
    'expirée': 'cs-badge-danger',
    'expiré': 'cs-badge-danger',
    'rejeté': 'cs-badge-danger',
    'rejete': 'cs-badge-danger',
    'en retard': 'cs-badge-danger',
    'urgent': 'cs-badge-danger',
    'critique': 'cs-badge-danger'
  };
  return map[s] || 'cs-badge-neutral';
}

/**
 * Classe dot pour un type d'événement
 * @param {string} type
 * @returns {string}
 */
function dotClassForType(type) {
  const map = {
    'consultation': 'cs-dot-success',
    'ordonnance': 'cs-dot-info',
    'vaccin': 'cs-dot-warning',
    'urgence': 'cs-dot-danger',
    'document': 'cs-dot-info',
    'validation': 'cs-dot-warning'
  };
  return map[type] || 'cs-dot-info';
}

/**
 * Debounce une fonction
 * @param {Function} fn
 * @param {number} wait
 * @returns {Function}
 */
function debounce(fn, wait) {
  wait = wait || 200;
  let timer = null;
  return function () {
    const ctx = this;
    const args = arguments;
    clearTimeout(timer);
    timer = setTimeout(function () { fn.apply(ctx, args); }, wait);
  };
}

/**
 * Formate la taille d'un fichier
 * @param {number} bytes
 * @returns {string}
 */
function formatFileSize(bytes) {
  if (!bytes) return '0 o';
  if (bytes < 1024) return bytes + ' o';
  if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + ' Ko';
  return (bytes / (1024 * 1024)).toFixed(2) + ' Mo';
}

/**
 * Récupère un paramètre URL
 * @param {string} name
 * @returns {string|null}
 */
function getURLParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

/**
 * Retourne la couleur d'avatar selon l'ID (hachage)
 * @param {string} id
 * @returns {string} classe Tailwind
 */
function avatarColor(id) {
  const colors = ['bg-primary-100 text-primary-700', 'bg-info-100 text-info-700',
    'bg-gold-100 text-gold-700', 'bg-admin-100 text-admin-700', 'bg-danger-100 text-danger-700'];
  let hash = 0;
  for (let i = 0; i < (id || '').length; i++) {
    hash = ((hash << 5) - hash) + id.charCodeAt(i);
    hash |= 0;
  }
  return colors[Math.abs(hash) % colors.length];
}
