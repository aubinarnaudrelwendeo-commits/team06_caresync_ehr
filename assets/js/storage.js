// Storage - Persistance localStorage avec préfixe csm_
// Toutes les opérations sont wrappées dans try/catch pour la robustesse.
const Storage = (function () {
  'use strict';

  const PREFIX = 'csm_';

  // Préfixes d'identifiants par entité (format BFA-XXX-2026-####)
  const ID_PREFIXES = {
    patients: 'BFA-PAT-2026-',
    medecins: 'BFA-MED-2026-',
    admins: 'BFA-ADM-2026-',
    structures: 'STR-2026-',
    consultations: 'CONS-2026-',
    ordonnances: 'ORD-2026-',
    familles: 'BFA-FAM-2026-',
    documents: 'DOC-2026-',
    validations: 'VAL-2026-',
    rdv: 'RDV-2026-',
    journal: 'LOG-2026-',
    notifications: 'NOT-2026-',
    codes: 'MIN-2026-'
  };

  const FALLBACK_PREFIX = 'BFA-GEN-2026-';

  /**
   * Récupère une valeur depuis localStorage
   * @param {string} key - clé sans préfixe
   * @returns {*} valeur désérialisée ou null
   */
  function get(key) {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      if (raw === null) return null;
      return JSON.parse(raw);
    } catch (err) {
      console.error('Storage.get error:', err);
      return null;
    }
  }

  /**
   * Stocke une valeur dans localStorage
   * @param {string} key - clé sans préfixe
   * @param {*} value - valeur à sérialiser
   * @returns {boolean} succès
   */
  function set(key, value) {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
      return true;
    } catch (err) {
      if (err.name === 'QuotaExceededError') {
        alert('Espace de stockage saturé. Réinitialisez la simulation via le menu.');
      }
      console.error('Storage.set error:', err);
      return false;
    }
  }

  /**
   * Supprime une clé
   * @param {string} key
   */
  function remove(key) {
    try {
      localStorage.removeItem(PREFIX + key);
    } catch (err) {
      console.error('Storage.remove error:', err);
    }
  }

  /**
   * Vide toutes les clés csm_ (préserve les autres)
   * @returns {boolean} succès
   */
  function clear() {
    try {
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.indexOf(PREFIX) === 0) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach(function (k) { localStorage.removeItem(k); });
      return true;
    } catch (err) {
      console.error('Storage.clear error:', err);
      return false;
    }
  }

  /**
   * Retourne tous les éléments d'une entité
   * @param {string} entity - nom de l'entité (patients, medecins, ...)
   * @returns {Array} tableau (vide si absent)
   */
  function getAll(entity) {
    const data = get(entity);
    return Array.isArray(data) ? data : [];
  }

  /**
   * Récupère un élément par son ID
   * @param {string} entity
   * @param {string} id
   * @returns {Object|null}
   */
  function getById(entity, id) {
    if (!id) return null;
    const items = getAll(entity);
    for (let i = 0; i < items.length; i++) {
      if (items[i].id === id) return items[i];
    }
    return null;
  }

  /**
   * Crée un nouvel élément (génère automatiquement ID + timestamps)
   * @param {string} entity
   * @param {Object} item - données sans ID
   * @returns {Object} élément créé
   */
  function create(entity, item) {
    const items = getAll(entity);
    const now = new Date().toISOString();
    const newItem = Object.assign({}, item, {
      id: item.id || generateId(entity),
      createdAt: item.createdAt || now,
      updatedAt: now
    });
    items.push(newItem);
    set(entity, items);
    return newItem;
  }

  /**
   * Met à jour un élément
   * @param {string} entity
   * @param {string} id
   * @param {Object} updates - champs à mettre à jour
   * @returns {Object|null} élément mis à jour
   */
  function update(entity, id, updates) {
    const items = getAll(entity);
    let updated = null;
    for (let i = 0; i < items.length; i++) {
      if (items[i].id === id) {
        items[i] = Object.assign({}, items[i], updates, {
          updatedAt: new Date().toISOString()
        });
        updated = items[i];
        break;
      }
    }
    if (updated) set(entity, items);
    return updated;
  }

  /**
   * Supprime un élément par ID
   * @param {string} entity
   * @param {string} id
   * @returns {boolean} succès
   */
  function removeById(entity, id) {
    const items = getAll(entity);
    const filtered = items.filter(function (it) { return it.id !== id; });
    if (filtered.length === items.length) return false;
    set(entity, filtered);
    return true;
  }

  /**
   * Génère un nouvel ID pour une entité
   * @param {string} entity
   * @returns {string} ID au format PREFIX-NNNN
   */
  function generateId(entity) {
    const prefix = ID_PREFIXES[entity] || FALLBACK_PREFIX;
    const items = getAll(entity);
    let maxNum = 0;
    for (let i = 0; i < items.length; i++) {
      const id = items[i].id || '';
      const parts = id.split('-');
      const num = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(num) && num > maxNum) maxNum = num;
    }
    const next = maxNum + 1;
    return prefix + String(next).padStart(4, '0');
  }

  // ===== Méthodes spécifiques =====

  function getConsultationsByPatient(patientId) {
    return getAll('consultations')
      .filter(function (c) { return c.patientId === patientId; })
      .sort(function (a, b) { return (b.date || '').localeCompare(a.date || ''); });
  }

  function getConsultationsByMedecin(medecinId) {
    return getAll('consultations')
      .filter(function (c) { return c.medecinId === medecinId; })
      .sort(function (a, b) { return (b.date || '').localeCompare(a.date || ''); });
  }

  function getOrdonnancesByPatient(patientId) {
    return getAll('ordonnances')
      .filter(function (o) { return o.patientId === patientId; })
      .sort(function (a, b) { return (b.date || '').localeCompare(a.date || ''); });
  }

  function getFamilleByPatient(patientId) {
    const familles = getAll('familles');
    for (let i = 0; i < familles.length; i++) {
      const f = familles[i];
      if (f.tuteurPrincipal === patientId) return f;
      if (Array.isArray(f.membres) && f.membres.indexOf(patientId) !== -1) return f;
    }
    return null;
  }

  function getMembresFamille(familleId) {
    const famille = getById('familles', familleId);
    if (!famille || !Array.isArray(famille.membres)) return [];
    return famille.membres
      .map(function (pid) { return getById('patients', pid); })
      .filter(function (p) { return p !== null; });
  }

  // Alias pratiques
  function getStructureById(id) { return getById('structures', id); }
  function getMedecinById(id) { return getById('medecins', id); }
  function getPatientById(id) { return getById('patients', id); }
  function getAdminById(id) { return getById('admins', id); }

  // ===== Journal d'audit (limité à 200 entrées) =====

  /**
   * Enregistre une action dans le journal d'audit
   * @param {string} action - type d'action (connexion, inscription, validation, etc.)
   * @param {string} userId - identifiant utilisateur
   * @param {string} role - rôle utilisateur
   * @param {string} details - description lisible
   * @param {Object} meta - métadonnées additionnelles (optionnel)
   */
  function logAction(action, userId, role, details, meta) {
    const journal = getAll('journal');
    const entry = {
      id: generateId('journal'),
      action: action,
      userId: userId,
      role: role,
      date: new Date().toISOString(),
      details: details,
      ip: 'local',
      meta: meta || null
    };
    journal.push(entry);
    // Garde seulement les 200 dernières entrées
    if (journal.length > 200) {
      journal.splice(0, journal.length - 200);
    }
    set('journal', journal);
    return entry;
  }

  function getJournal(limit) {
    const journal = getAll('journal');
    const sorted = journal.slice().reverse(); // plus récent d'abord
    return limit ? sorted.slice(0, limit) : sorted;
  }

  // ===== Notifications =====

  /**
   * Crée une notification pour un utilisateur
   * @param {string} userId - destinataire
   * @param {string} type - success | warning | danger | info
   * @param {string} titre
   * @param {string} message
   * @param {Object} meta - lien, action, etc.
   */
  function addNotification(userId, type, titre, message, meta) {
    const notifs = getAll('notifications');
    const notif = {
      id: generateId('notifications'),
      userId: userId,
      type: type,
      titre: titre,
      message: message,
      date: new Date().toISOString(),
      lue: false,
      meta: meta || null
    };
    notifs.push(notif);
    set('notifications', notifs);
    return notif;
  }

  function getNotifications(userId) {
    return getAll('notifications')
      .filter(function (n) { return n.userId === userId; })
      .sort(function (a, b) { return (b.date || '').localeCompare(a.date || ''); });
  }

  function getUnreadCount(userId) {
    return getNotifications(userId).filter(function (n) { return !n.lue; }).length;
  }

  function markNotificationRead(notifId) {
    const notifs = getAll('notifications');
    for (let i = 0; i < notifs.length; i++) {
      if (notifs[i].id === notifId) {
        notifs[i].lue = true;
        notifs[i].readAt = new Date().toISOString();
        break;
      }
    }
    set('notifications', notifs);
  }

  function markAllNotificationsRead(userId) {
    const notifs = getAll('notifications');
    notifs.forEach(function (n) {
      if (n.userId === userId && !n.lue) {
        n.lue = true;
        n.readAt = new Date().toISOString();
      }
    });
    set('notifications', notifs);
  }

  function deleteNotification(notifId) {
    removeById('notifications', notifId);
  }

  // ===== Codes du ministère =====

  /**
   * Crée un code d'inscription attribué par le ministère
   * @param {string} role - patient | medecin | admin
   * @param {Object} meta - info optionnelle (destinataire, motif, etc.)
   * @param {number} dureeValiditeHeures - durée de validité (défaut 72h)
   */
  function createCodeMinistere(role, meta, dureeValiditeHeures) {
    const codes = getAll('codes');
    const maintenant = new Date();
    const expiration = new Date(maintenant.getTime() + (dureeValiditeHeures || 72) * 3600000);
    const code = {
      id: generateId('codes'),
      code: genererCodeLisible(role),
      role: role,
      dateCreation: maintenant.toISOString(),
      dateExpiration: expiration.toISOString(),
      utilise: false,
      utilisePar: null,
      dateUtilisation: null,
      meta: meta || {}
    };
    codes.push(code);
    set('codes', codes);
    return code;
  }

  /**
   * Vérifie si un code ministère est valide et non utilisé
   * @param {string} codeValue
   * @returns {Object|null} code si valide, null sinon
   */
  function verifierCodeMinistere(codeValue) {
    const codes = getAll('codes');
    const maintenant = new Date();
    for (let i = 0; i < codes.length; i++) {
      if (codes[i].code === codeValue && !codes[i].utilise) {
        const expiration = new Date(codes[i].dateExpiration);
        if (expiration > maintenant) return codes[i];
      }
    }
    return null;
  }

  /**
   * Marque un code ministère comme utilisé
   * @param {string} codeValue
   * @param {string} userId - utilisateur qui l'a utilisé
   */
  function utiliserCodeMinistere(codeValue, userId) {
    const codes = getAll('codes');
    for (let i = 0; i < codes.length; i++) {
      if (codes[i].code === codeValue && !codes[i].utilise) {
        codes[i].utilise = true;
        codes[i].utilisePar = userId;
        codes[i].dateUtilisation = new Date().toISOString();
        set('codes', codes);
        return codes[i];
      }
    }
    return null;
  }

  function getCodesMinistere(filter) {
    const codes = getAll('codes');
    if (!filter) return codes.slice().reverse();
    return codes.filter(function (c) {
      if (filter.role && c.role !== filter.role) return false;
      if (filter.utilise !== undefined && c.utilise !== filter.utilise) return false;
      if (filter.expiré !== undefined) {
        const exp = new Date(c.dateExpiration) < new Date();
        if (filter.expiré !== exp) return false;
      }
      return true;
    }).reverse();
  }

  // Génère un code lisible du type MIN-PAT-2026-AB12
  function genererCodeLisible(role) {
    const prefix = role === 'patient' ? 'MIN-PAT' : (role === 'medecin' ? 'MIN-MED' : 'MIN-ADM');
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // sans I, O, 0, 1
    let suffix = '';
    for (let i = 0; i < 4; i++) {
      suffix += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return prefix + '-2026-' + suffix;
  }

  // ===== Export / Import =====

  function exportData() {
    const exportObj = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.indexOf(PREFIX) === 0) {
        try {
          exportObj[k] = JSON.parse(localStorage.getItem(k));
        } catch (e) { /* ignore */ }
      }
    }
    return JSON.stringify(exportObj, null, 2);
  }

  function importData(jsonStr) {
    try {
      const data = JSON.parse(jsonStr);
      Object.keys(data).forEach(function (k) {
        if (k.indexOf(PREFIX) === 0) {
          localStorage.setItem(k, JSON.stringify(data[k]));
        }
      });
      return true;
    } catch (err) {
      console.error('Storage.importData error:', err);
      return false;
    }
  }

  function downloadExport() {
    const blob = new Blob([exportData()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'caresync_backup_' + new Date().toISOString().slice(0, 10) + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // ===== Validation Patient =====

  function validerPatient(p) {
    const erreurs = [];
    if (!p.nom || p.nom.trim().length < 2) erreurs.push('Le nom doit comporter au moins 2 caractères');
    if (!p.prenom || p.prenom.trim().length < 2) erreurs.push('Le prénom doit comporter au moins 2 caractères');
    if (!p.dateNaissance) erreurs.push('La date de naissance est requise');
    if (p.sexe !== 'M' && p.sexe !== 'F') erreurs.push('Le sexe doit être M ou F');
    if (p.telephone && !/^\+226\s?\d{2}\s?\d{2}\s?\d{2}\s?\d{2}$/.test(p.telephone)) {
      erreurs.push('Le téléphone doit être au format +226 XX XX XX XX');
    }
    return { valide: erreurs.length === 0, erreurs: erreurs };
  }

  // API publique
  return {
    PREFIX: PREFIX,
    ID_PREFIXES: ID_PREFIXES,
    get: get,
    set: set,
    remove: remove,
    clear: clear,
    getAll: getAll,
    getById: getById,
    create: create,
    update: update,
    removeById: removeById,
    generateId: generateId,
    getConsultationsByPatient: getConsultationsByPatient,
    getConsultationsByMedecin: getConsultationsByMedecin,
    getOrdonnancesByPatient: getOrdonnancesByPatient,
    getFamilleByPatient: getFamilleByPatient,
    getMembresFamille: getMembresFamille,
    getStructureById: getStructureById,
    getMedecinById: getMedecinById,
    getPatientById: getPatientById,
    getAdminById: getAdminById,
    logAction: logAction,
    getJournal: getJournal,
    addNotification: addNotification,
    getNotifications: getNotifications,
    getUnreadCount: getUnreadCount,
    markNotificationRead: markNotificationRead,
    markAllNotificationsRead: markAllNotificationsRead,
    deleteNotification: deleteNotification,
    createCodeMinistere: createCodeMinistere,
    verifierCodeMinistere: verifierCodeMinistere,
    utiliserCodeMinistere: utiliserCodeMinistere,
    getCodesMinistere: getCodesMinistere,
    exportData: exportData,
    importData: importData,
    downloadExport: downloadExport,
    validerPatient: validerPatient
  };
})();
