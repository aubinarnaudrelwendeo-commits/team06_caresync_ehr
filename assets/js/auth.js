// Auth - Connexion multi-rôles, inscription patient/médecin/admin, validation des comptes.
// Note : prototype pédagogique, les mots de passe sont en clair dans localStorage.
const Auth = (function () {
  'use strict';

  const REGEX_ID = /^BFA-(PAT|MED|ADM)-2026-\d{4}$/;
  const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const REGEX_PHONE = /^\+226\s?\d{2}\s?\d{2}\s?\d{2}\s?\d{2}$/;
  const REGEX_CODE_MINISTERE = /^MIN-(PAT|MED|ADM)-2026-[A-Z0-9]{4}$/;

  /**
   * Tente une connexion par identifiant BFA + mot de passe
   */
  function connexion(identifiant, motDePasse, souvenir) {
    identifiant = (identifiant || '').trim().toUpperCase();
    if (!REGEX_ID.test(identifiant)) {
      return { success: false, error: 'Format d\'identifiant invalide. Exemple : BFA-PAT-2026-0001' };
    }
    if (!motDePasse || motDePasse.length < 6) {
      return { success: false, error: 'Mot de passe incorrect (minimum 6 caractères).' };
    }

    const prefixe = identifiant.slice(4, 7); // PAT | MED | ADM
    let user = null;

    if (prefixe === 'PAT') {
      const patient = Storage.getById('patients', identifiant);
      if (patient) {
        if (patient.motDePasse && patient.motDePasse !== motDePasse) {
          return { success: false, error: 'Mot de passe incorrect.' };
        }
        user = {
          id: patient.id, role: 'patient',
          nom: patient.nom, prenom: patient.prenom,
          email: patient.email, telephone: patient.telephone,
          dateConnexion: new Date().toISOString()
        };
      }
    } else if (prefixe === 'MED') {
      const medecin = Storage.getById('medecins', identifiant);
      if (medecin) {
        if (medecin.motDePasse && medecin.motDePasse !== motDePasse) {
          return { success: false, error: 'Mot de passe incorrect.' };
        }
        if (medecin.statutValidation === 'en_attente') {
          return { success: false, error: 'Votre compte médecin est en attente de validation par le ministère.' };
        }
        if (medecin.statut === 'inactif') {
          return { success: false, error: 'Votre compte médecin est actuellement inactif.' };
        }
        user = {
          id: medecin.id, role: 'medecin',
          nom: medecin.nom, prenom: medecin.prenom,
          specialite: medecin.specialite, etablissement: medecin.etablissement,
          dateConnexion: new Date().toISOString()
        };
      }
    } else if (prefixe === 'ADM') {
      const admin = Storage.getById('admins', identifiant);
      if (admin) {
        if (admin.motDePasse && admin.motDePasse !== motDePasse) {
          return { success: false, error: 'Mot de passe incorrect.' };
        }
        user = {
          id: admin.id, role: 'admin',
          nom: admin.nom, prenom: admin.prenom,
          fonction: admin.fonction,
          dateConnexion: new Date().toISOString()
        };
      } else {
        // Compte admin système par défaut (prototype pédagogique)
        if (identifiant === 'BFA-ADM-2026-0001' && motDePasse === 'admin2026') {
          user = {
            id: 'BFA-ADM-2026-0001', role: 'admin',
            nom: 'Système', prenom: 'Admin',
            fonction: 'Administrateur général',
            dateConnexion: new Date().toISOString()
          };
        }
      }
    }

    if (!user) {
      return { success: false, error: 'Aucun compte trouvé avec cet identifiant. Lancez la simulation ou inscrivez-vous.' };
    }

    Storage.set('user', user);
    if (souvenir) Storage.set('remember', identifiant);
    else Storage.remove('remember');

    Storage.logAction('connexion', user.id, user.role, 'Connexion réussie');
    Storage.addNotification(user.id, 'success', 'Connexion réussie',
      'Bienvenue ' + (user.prenom || '') + ' ' + (user.nom || '') + '. Vous êtes connecté(e).', { action: 'login' });

    return { success: true, user: user };
  }

  /**
   * Redirige vers le dashboard du rôle
   */
  function redirigerApresConnexion(role) {
    const routes = {
      patient: 'dashboard-patient.html',
      medecin: 'dashboard-medecin.html',
      admin: 'dashboard-admin.html'
    };
    setTimeout(function () {
      window.location.href = routes[role] || 'auth.html';
    }, 600);
  }

  /**
   * Inscription patient
   */
  function inscriptionPatient(data) {
    const erreurs = validerPatient(data);
    if (erreurs.length > 0) {
      return { success: false, errors: erreurs };
    }

    // Vérifier le code ministère si fourni
    let codeUtilise = null;
    if (data.codeMinistere) {
      const code = Storage.verifierCodeMinistere(data.codeMinistere);
      if (!code) {
        return { success: false, errors: ['Code ministère invalide, déjà utilisé ou expiré.'] };
      }
      if (code.role !== 'patient') {
        return { success: false, errors: ['Ce code ministère n\'est pas attribué à un patient.'] };
      }
      codeUtilise = code;
    }

    const patient = {
      nom: (data.nom || '').trim().toUpperCase(),
      prenom: capitalize(data.prenom || ''),
      dateNaissance: data.dateNaissance,
      sexe: data.sexe,
      telephone: data.telephone,
      email: data.email || null,
      adresse: data.adresse || '',
      region: data.region || '',
      province: data.province || '',
      district: data.district || '',
      groupeSanguin: data.groupeSanguin || null,
      poids: data.poids || null,
      taille: data.taille || null,
      allergies: data.allergies || [],
      antecedents: data.antecedents || [],
      statutMedical: 'Nouvel inscrit',
      familleId: null,
      roleFamille: null,
      dateCreation: new Date().toISOString().slice(0, 10),
      consentement: true,
      photo: null,
      statutValidation: 'en_attente',
      motifInscription: data.motifInscription || '',
      motDePasse: data.motDePasse || 'caresync2026',
      codeMinistere: codeUtilise ? codeUtilise.code : null,
      dateValidation: null,
      validePar: null,
      niveauCertification: codeUtilise ? 'BRONZE' : null
    };

    const created = Storage.create('patients', patient);

    if (codeUtilise) {
      Storage.utiliserCodeMinistere(codeUtilise.code, created.id);
      // Validation automatique pour les inscriptions avec code ministère
      Storage.update('patients', created.id, {
        statutValidation: 'validé',
        dateValidation: new Date().toISOString(),
        validePar: 'BFA-ADM-2026-0001',
        niveauCertification: 'OR'
      });
      Storage.addNotification(created.id, 'success', 'Compte certifié OR',
        'Votre inscription a été validée par le Ministère. Niveau de certification : OR.', { action: 'validation' });
    } else {
      // Notification à l'admin
      Storage.addNotification('BFA-ADM-2026-0001', 'warning', 'Nouvelle inscription patient',
        'Le patient ' + created.prenom + ' ' + created.nom + ' (' + created.id + ') attend une validation.', { action: 'validation', target: created.id });
    }

    Storage.logAction('inscription_patient', created.id, 'patient',
      'Inscription patient' + (codeUtilise ? ' avec code ministère ' + codeUtilise.code : ''), { codeMinistere: codeUtilise ? codeUtilise.code : null });

    return { success: true, id: created.id, user: created, certifie: !!codeUtilise };
  }

  /**
   * Inscription médecin
   */
  function inscriptionMedecin(data) {
    const erreurs = validerMedecin(data);
    if (erreurs.length > 0) {
      return { success: false, errors: erreurs };
    }

    let codeUtilise = null;
    if (data.codeMinistere) {
      const code = Storage.verifierCodeMinistere(data.codeMinistere);
      if (!code) {
        return { success: false, errors: ['Code ministère invalide, déjà utilisé ou expiré.'] };
      }
      if (code.role !== 'medecin') {
        return { success: false, errors: ['Ce code ministère n\'est pas attribué à un médecin.'] };
      }
      codeUtilise = code;
    }

    // Vérifier numéro d'agrément
    const medecins = Storage.getAll('medecins');
    if (data.numeroAgrement) {
      const existant = medecins.find(function (m) { return m.numeroAgrement === data.numeroAgrement; });
      if (existant) {
        return { success: false, errors: ['Numéro d\'agrément déjà utilisé par un autre médecin.'] };
      }
    } else {
      // Générer automatiquement un numéro d'agrément
      data.numeroAgrement = 'AGRE-2025-' + String(100 + medecins.length + 1).padStart(4, '0');
    }

    // Préfixer le nom avec "Dr." si pas déjà fait
    let nomFinal = (data.nom || '').trim().toUpperCase();
    if (nomFinal && nomFinal.toLowerCase().indexOf('dr.') !== 0 && nomFinal.toLowerCase().indexOf('dr ') !== 0) {
      nomFinal = 'Dr. ' + nomFinal;
    }

    const medecin = {
      nom: nomFinal,
      prenom: capitalize(data.prenom || ''),
      dateNaissance: data.dateNaissance || '',
      sexe: data.sexe || 'M',
      specialite: data.specialite,
      telephone: data.telephone,
      email: data.email,
      etablissement: data.etablissement || '',
      etablissementId: data.etablissementId || '',
      numeroAgrement: data.numeroAgrement,
      diplome: data.diplome || '',
      dateValidation: codeUtilise ? new Date().toISOString() : null,
      validePar: codeUtilise ? 'BFA-ADM-2026-0001' : null,
      statutValidation: codeUtilise ? 'validé' : 'en_attente',
      statut: codeUtilise ? 'actif' : 'inactif',
      specialites: data.specialites || [data.specialite],
      langues: data.langues || ['Français'],
      disponibilite: data.disponibilite || {},
      biographie: data.biographie || '',
      nbPatients: 0,
      nbConsultations: 0,
      dateCreation: new Date().toISOString().slice(0, 10),
      motDePasse: data.motDePasse || 'caresync2026',
      codeMinistere: codeUtilise ? codeUtilise.code : null,
      niveauCertification: codeUtilise ? 'OR' : null,
      consentement: true
    };

    const created = Storage.create('medecins', medecin);

    if (codeUtilise) {
      Storage.utiliserCodeMinistere(codeUtilise.code, created.id);
      Storage.addNotification(created.id, 'success', 'Compte médecin certifié OR',
        'Votre inscription médecin a été validée par le Ministère. Vous pouvez exercer.', { action: 'validation' });
    } else {
      Storage.addNotification('BFA-ADM-2026-0001', 'warning', 'Nouveau médecin à valider',
        'Dr. ' + created.prenom + ' ' + created.nom + ' (' + created.id + ') attend une validation.', { action: 'validation', target: created.id });
    }

    Storage.logAction('inscription_medecin', created.id, 'medecin',
      'Inscription médecin' + (codeUtilise ? ' avec code ministère' : ''), { codeMinistere: codeUtilise ? codeUtilise.code : null });

    return { success: true, id: created.id, user: created, certifie: !!codeUtilise };
  }

  /**
   * Inscription administrateur
   */
  function inscriptionAdmin(data) {
    const erreurs = validerAdmin(data);
    if (erreurs.length > 0) {
      return { success: false, errors: erreurs };
    }

    let codeUtilise = null;
    if (data.codeMinistere) {
      const code = Storage.verifierCodeMinistere(data.codeMinistere);
      if (!code) {
        return { success: false, errors: ['Code ministère invalide, déjà utilisé ou expiré.'] };
      }
      if (code.role !== 'admin') {
        return { success: false, errors: ['Ce code ministère n\'est pas attribué à un administrateur.'] };
      }
      codeUtilise = code;
    }

    const admin = {
      nom: (data.nom || '').trim().toUpperCase(),
      prenom: capitalize(data.prenom || ''),
      fonction: data.fonction,
      structure: data.structure || '',
      service: data.service || '',
      niveauPermission: data.niveauPermission || 'Lecture seule',
      telephone: data.telephone,
      email: data.email,
      province: data.province || '',
      ville: data.ville || '',
      superieur: data.superieur || '',
      dateCreation: new Date().toISOString().slice(0, 10),
      motDePasse: data.motDePasse || 'caresync2026',
      codeMinistere: codeUtilise ? codeUtilise.code : null,
      niveauCertification: codeUtilise ? 'OR' : null,
      consentement: true,
      statutValidation: codeUtilise ? 'validé' : 'en_attente'
    };

    const created = Storage.create('admins', admin);

    if (codeUtilise) {
      Storage.utiliserCodeMinistere(codeUtilise.code, created.id);
    }

    // Auto-connexion admin
    const user = {
      id: created.id, role: 'admin',
      nom: created.nom, prenom: created.prenom,
      fonction: created.fonction,
      dateConnexion: new Date().toISOString()
    };
    Storage.set('user', user);

    Storage.logAction('inscription_admin', created.id, 'admin',
      'Inscription administrateur' + (codeUtilise ? ' avec code ministère' : ''), { codeMinistere: codeUtilise ? codeUtilise.code : null });

    return { success: true, id: created.id, user: user, certifie: !!codeUtilise };
  }

  // ===== Validation =====

  function validerPatient(data) {
    const erreurs = [];
    if (!data.nom || data.nom.trim().length < 2) erreurs.push('Le nom doit comporter au moins 2 caractères');
    if (!data.prenom || data.prenom.trim().length < 2) erreurs.push('Le prénom doit comporter au moins 2 caractères');
    if (!data.dateNaissance) erreurs.push('La date de naissance est requise');
    if (data.sexe !== 'M' && data.sexe !== 'F') erreurs.push('Le sexe doit être M ou F');
    if (!data.telephone || !REGEX_PHONE.test(data.telephone)) erreurs.push('Le téléphone doit être au format +226 XX XX XX XX');
    if (data.email && !REGEX_EMAIL.test(data.email)) erreurs.push('Email invalide');
    return erreurs;
  }

  function validerMedecin(data) {
    const erreurs = [];
    if (!data.nom || data.nom.trim().length < 2) erreurs.push('Le nom doit comporter au moins 2 caractères');
    if (!data.prenom || data.prenom.trim().length < 2) erreurs.push('Le prénom doit comporter au moins 2 caractères');
    if (!data.specialite) erreurs.push('La spécialité est requise');
    if (!data.telephone || !REGEX_PHONE.test(data.telephone)) erreurs.push('Le téléphone doit être au format +226 XX XX XX XX');
    if (!data.email || !REGEX_EMAIL.test(data.email)) erreurs.push('Email professionnel requis et valide');
    if (!data.etablissementId) erreurs.push('La structure de rattachement est requise');
    if (data.numeroAgrement && data.numeroAgrement.trim().length < 5) erreurs.push('Numéro d\'agrément invalide');
    return erreurs;
  }

  function validerAdmin(data) {
    const erreurs = [];
    if (!data.nom || data.nom.trim().length < 2) erreurs.push('Le nom doit comporter au moins 2 caractères');
    if (!data.prenom || data.prenom.trim().length < 2) erreurs.push('Le prénom doit comporter au moins 2 caractères');
    if (!data.fonction) erreurs.push('La fonction administrative est requise');
    if (!data.telephone || !REGEX_PHONE.test(data.telephone)) erreurs.push('Le téléphone doit être au format +226 XX XX XX XX');
    if (!data.email || !REGEX_EMAIL.test(data.email)) erreurs.push('Email professionnel requis et valide');
    return erreurs;
  }

  /**
   * Évalue la force d'un mot de passe
   */
  function evaluerMotDePasse(pwd) {
    if (!pwd) return { score: 0, label: 'Aucun', color: 'danger', checks: {} };
    const checks = {
      longueur: pwd.length >= 8,
      majuscule: /[A-Z]/.test(pwd),
      minuscule: /[a-z]/.test(pwd),
      chiffre: /[0-9]/.test(pwd),
      special: /[^A-Za-z0-9]/.test(pwd)
    };
    let score = 0;
    Object.keys(checks).forEach(function (k) { if (checks[k]) score++; });
    const labels = ['Très faible', 'Faible', 'Moyen', 'Bon', 'Fort', 'Excellent'];
    const colors = ['danger', 'danger', 'warning', 'info', 'success', 'success'];
    return {
      score: score,
      label: labels[score],
      color: colors[score],
      checks: checks
    };
  }

  /**
   * Génère un code ministère pour un rôle (admin uniquement)
   */
  function genererCodeMinistere(role, meta, dureeHeures) {
    return Storage.createCodeMinistere(role, meta, dureeHeures);
  }

  /**
   * Valide un compte utilisateur (admin)
   */
  function validerCompte(entity, id, adminId) {
    const item = Storage.getById(entity, id);
    if (!item) return { success: false, error: 'Compte introuvable' };

    const updates = {
      statutValidation: 'validé',
      statut: 'actif',
      dateValidation: new Date().toISOString(),
      validePar: adminId,
      niveauCertification: item.niveauCertification || 'ARGENT'
    };
    Storage.update(entity, id, updates);

    Storage.addNotification(id, 'success', 'Compte validé',
      'Votre compte a été validé par le Ministère. Niveau de certification : ' + (updates.niveauCertification || 'ARGENT') + '.',
      { action: 'validation' });

    Storage.logAction('validation_compte', adminId, 'admin',
      'Validation du compte ' + id + ' (' + entity + ')', { target: id });

    return { success: true, user: Storage.getById(entity, id) };
  }

  /**
   * Rejette un compte utilisateur (admin)
   */
  function rejeterCompte(entity, id, adminId, motif) {
    const item = Storage.getById(entity, id);
    if (!item) return { success: false, error: 'Compte introuvable' };

    Storage.update(entity, id, {
      statutValidation: 'rejeté',
      statut: 'inactif',
      motifRejet: motif,
      dateRejet: new Date().toISOString(),
      rejetePar: adminId
    });

    Storage.addNotification(id, 'danger', 'Compte rejeté',
      'Votre inscription a été rejetée. Motif : ' + motif,
      { action: 'rejet', motif: motif });

    Storage.logAction('rejet_compte', adminId, 'admin',
      'Rejet du compte ' + id + ' (' + entity + ') - Motif : ' + motif, { target: id, motif: motif });

    return { success: true };
  }

  // API publique
  return {
    REGEX_ID: REGEX_ID,
    REGEX_EMAIL: REGEX_EMAIL,
    REGEX_PHONE: REGEX_PHONE,
    REGEX_CODE_MINISTERE: REGEX_CODE_MINISTERE,
    connexion: connexion,
    redirigerApresConnexion: redirigerApresConnexion,
    inscriptionPatient: inscriptionPatient,
    inscriptionMedecin: inscriptionMedecin,
    inscriptionAdmin: inscriptionAdmin,
    validerPatient: validerPatient,
    validerMedecin: validerMedecin,
    validerAdmin: validerAdmin,
    evaluerMotDePasse: evaluerMotDePasse,
    genererCodeMinistere: genererCodeMinistere,
    validerCompte: validerCompte,
    rejeterCompte: rejeterCompte
  };
})();
