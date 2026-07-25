/**
 * CareSync EHR - Moteur de simulation
 *
 * Charge les données dans localStorage puis connecte un utilisateur fictif.
 * Modes disponibles : patient, medecin, admin, beta-testeur, aléatoire.
 *
 * Les données proviennent de assets/js/data.js (window.CARESYNC_DATA).
 * Fallback sur fetch() si data.js est absent (mode serveur HTTP).
 */
const Simulation = (function () {
  'use strict';

  // Liste des entités à charger dans localStorage
  var DATA_FILES = [
    { key: 'patients',     json: 'patients' },
    { key: 'medecins',     json: 'medecins' },
    { key: 'structures',   json: 'structures' },
    { key: 'ordonnances',  json: 'ordonnances' },
    { key: 'familles',     json: 'familles' },
    { key: 'consultations',json: 'consultations' },
    { key: 'regions',      json: 'regions' },
    { key: 'medicaments',  json: 'medicaments' },
    // Important : les clés JSON correspondent aux clés normalisées dans data.js
    // (build_data_js.py convertit 'beta-testeurs' en 'betaTesteurs', 'avis-medecins' en 'avisMedecins')
    { key: 'betaTesteurs', json: 'betaTesteurs' },
    { key: 'avisMedecins', json: 'avisMedecins' }
  ];

  // Listes de référence pour la génération aléatoire de patients
  var NOMS_BURKINABE = [
    'OUEDRAOGO', 'SAWADOGO', 'KONATE', 'TRAORE', 'ZONGO', 'COMPAORE', 'KABORE',
    'SANKARA', 'NACOULOMA', 'YAMEOGO', 'TAPSOBA', 'OUATTARA', 'BONKOUNGOU',
    'DABIRE', 'GNOUMOU', 'HIEN', 'BAMOGO', 'BESSA', 'SANOU', 'NEBIE',
    'DAO', 'BARE', 'SAMOURA', 'DIARRA', 'COULIBALY', 'TOURE', 'SISSOKO'
  ];
  var PRENOMS_MASCULINS = [
    'Amadou', 'Moussa', 'Issa', 'Boukary', 'Adama', 'Souleymane', 'Ibrahim',
    'Ousmane', 'Mahamadou', 'Yacouba', 'Salif', 'Karim', 'Rasmane', 'Herve'
  ];
  var PRENOMS_FEMININS = [
    'Aminata', 'Fatoumata', 'Mariam', 'Awa', 'Kadiatou', 'Adjaratou', 'Salimata',
    'Rasmata', 'Bibata', 'Nadege', 'Georgette', 'Immaculee', 'Cecile', 'Solange'
  ];
  var SPECIALITES = [
    'Médecine Générale', 'Pédiatrie', 'Gynécologie-Obstétrique', 'Chirurgie Générale',
    'Cardiologie', 'Médecine Interne', 'Neurologie', 'Dermatologie'
  ];
  var REGIONS_BF = [
    { region: 'Centre', chefLieu: 'Ouagadougou', province: 'Kadiogo' },
    { region: 'Hauts-Bassins', chefLieu: 'Bobo-Dioulasso', province: 'Houet' },
    { region: 'Boucle du Mouhoun', chefLieu: 'Dédougou', province: 'Mouhoun' },
    { region: 'Nord', chefLieu: 'Ouahigouya', province: 'Yatenga' },
    { region: 'Centre-Ouest', chefLieu: 'Koudougou', province: 'Boulkiemdé' },
    { region: 'Sud-Ouest', chefLieu: 'Gaoua', province: 'Poni' }
  ];
  var GROUPES_SANGUINS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
  var ELECTROPHORESES = ['AA', 'AS', 'AC', 'SS', 'SC', 'CC'];

  // Indique si la page est à la racine de public/ ou dans /pages/
  function isRootContext() {
    return window.location.pathname.indexOf('/pages/') === -1;
  }

  function getDataPath() {
    return isRootContext() ? '' : '../';
  }

  // Vérifie que data.js est bien chargé
  function hasEmbeddedData() {
    return typeof window.CARESYNC_DATA === 'object' && window.CARESYNC_DATA !== null;
  }

  /**
   * Charge toutes les données : priorise data.js, fallback sur fetch().
   */
  async function chargerDonnees() {
    try {
      var sources = [];

      if (hasEmbeddedData()) {
        // Mode hors-ligne : utilise les données préchargées
        DATA_FILES.forEach(function (df) {
          var data = window.CARESYNC_DATA[df.json] || [];
          sources.push({ key: df.key, data: data });
        });
      } else {
        // Mode serveur HTTP : fetch les fichiers JSON
        var prefix = getDataPath();
        // Map clé normalisée → nom de fichier JSON (avec tirets)
        var jsonFileMap = {
          'betaTesteurs': 'beta-testeurs.json',
          'avisMedecins': 'avis-medecins.json'
        };
        var fetches = DATA_FILES.map(function (df) {
          var file = prefix + 'assets/data/' + (jsonFileMap[df.json] || df.json + '.json');
          return fetch(file)
            .then(function (r) {
              if (!r.ok) throw new Error('HTTP ' + r.status);
              return r.json();
            })
            .then(function (data) { return { key: df.key, data: data }; })
            .catch(function (err) {
              console.warn('Simulation: échec chargement', file, err);
              return { key: df.key, data: [] };
            });
        });
        sources = await Promise.all(fetches);
      }

      // Stocke chaque entité dans localStorage
      sources.forEach(function (s) {
        Storage.set(s.key, s.data);
      });

      // Initialise les collections dynamiques si vides
      if (!Storage.get('journal')) Storage.set('journal', []);
      if (!Storage.get('documents')) Storage.set('documents', []);
      if (!Storage.get('notifications')) Storage.set('notifications', []);
      if (!Storage.get('codes')) Storage.set('codes', []);
      if (!Storage.get('rdv')) Storage.set('rdv', []);

      // Crée l'admin système par défaut si absent
      if (!Storage.get('admins')) {
        Storage.set('admins', [{
          id: 'BFA-ADM-2026-0001',
          nom: 'Système', prenom: 'Admin',
          fonction: 'Administrateur général',
          structure: 'Ministère de la Santé BF',
          service: 'Direction des Systèmes d\'Information',
          niveauPermission: 'Administrateur complet',
          telephone: '+226 25 30 00 00',
          email: 'admin@caresync.bf',
          dateCreation: '2026-01-01',
          motDePasse: 'admin2026',
          statutValidation: 'validé',
          statut: 'actif',
          niveauCertification: 'OR',
          consentement: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }]);
      }

      return true;
    } catch (err) {
      console.error('Simulation.chargerDonnees error:', err);
      return false;
    }
  }

  /**
   * Connecte un utilisateur par rôle en utilisant les données existantes.
   */
  function connecterRole(role) {
    var user = null;

    if (role === 'patient') {
      var patient = Storage.getById('patients', 'BFA-PAT-2026-0001');
      if (patient) {
        user = {
          id: patient.id, role: 'patient',
          nom: patient.nom, prenom: patient.prenom,
          email: patient.email, telephone: patient.telephone,
          dateConnexion: new Date().toISOString()
        };
      }
    } else if (role === 'medecin') {
      var medecin = Storage.getById('medecins', 'BFA-MED-2026-0001');
      if (medecin) {
        user = {
          id: medecin.id, role: 'medecin',
          nom: medecin.nom, prenom: medecin.prenom,
          specialite: medecin.specialite, etablissement: medecin.etablissement,
          dateConnexion: new Date().toISOString()
        };
      }
    } else if (role === 'admin') {
      user = {
        id: 'BFA-ADM-2026-0001', role: 'admin',
        nom: 'Système', prenom: 'Admin',
        fonction: 'Administrateur général',
        dateConnexion: new Date().toISOString()
      };
    } else if (role === 'aleatoire') {
      var choix = ['patient', 'medecin', 'admin'][Math.floor(Math.random() * 3)];
      return connecterRole(choix);
    } else if (role === 'beta-patient' || role === 'beta-medecin' || role === 'beta-admin') {
      return connecterBeta(role);
    }

    if (user) {
      Storage.set('user', user);
      Storage.set('sim_active', 'true');
      Storage.set('sim_mode', role);
      Storage.logAction('connexion_simulation', user.id, user.role, 'Connexion simulation (' + role + ')');

      var labels = { patient: 'patient', medecin: 'médecin', admin: 'administrateur' };
      Storage.addNotification(user.id, 'info', 'Bienvenue en mode simulation',
        'Vous êtes connecté(e) en tant que ' + labels[role] + '. Toutes les données sont fictives.',
        { action: 'simulation' });
    }

    return user;
  }

  // Connexion d'un beta-testeur (crée le compte s'il n'existe pas)
  function connecterBeta(role) {
    var betaList = Storage.getAll('betaTesteurs');
    var type = role.replace('beta-', '');
    var beta = betaList.find(function (b) { return b.type === type; });

    if (!beta) return null;

    var user = null;
    if (type === 'patient') {
      // Crée le patient lié s'il n'existe pas déjà
      var existing = Storage.getById('patients', beta.id);
      if (!existing) {
        var np = Object.assign({ id: beta.id, statutValidation: 'validé', niveauCertification: 'OR', motDePasse: 'beta2026', consentement: true, dateCreation: '2026-06-01' }, beta.patientLie);
        Storage.create('patients', np);
      }
      user = {
        id: beta.id, role: 'patient',
        nom: beta.patientLie.nom, prenom: beta.patientLie.prenom,
        email: beta.patientLie.email, telephone: beta.patientLie.telephone,
        dateConnexion: new Date().toISOString()
      };
    } else if (type === 'medecin') {
      var existingM = Storage.getById('medecins', beta.id);
      if (!existingM) {
        var nm = Object.assign({
          id: beta.id, statutValidation: 'validé', statut: 'actif',
          niveauCertification: 'OR', motDePasse: 'beta2026', consentement: true,
          dateCreation: '2026-06-01', specialites: [beta.medecinLie.specialite],
          nbPatients: 0, nbConsultations: 0
        }, beta.medecinLie);
        Storage.create('medecins', nm);
      }
      user = {
        id: beta.id, role: 'medecin',
        nom: beta.medecinLie.nom, prenom: beta.medecinLie.prenom,
        specialite: beta.medecinLie.specialite,
        etablissement: beta.medecinLie.etablissement,
        dateConnexion: new Date().toISOString()
      };
    } else if (type === 'admin') {
      var existingA = Storage.getById('admins', beta.id);
      if (!existingA) {
        var na = Object.assign({
          id: beta.id, statutValidation: 'validé', statut: 'actif',
          niveauCertification: 'OR', motDePasse: 'beta2026', consentement: true,
          dateCreation: '2026-06-01'
        }, beta.adminLie);
        Storage.create('admins', na);
      }
      user = {
        id: beta.id, role: 'admin',
        nom: beta.adminLie.nom, prenom: beta.adminLie.prenom,
        fonction: beta.adminLie.fonction,
        dateConnexion: new Date().toISOString()
      };
    }

    if (user) {
      Storage.set('user', user);
      Storage.set('sim_active', 'true');
      Storage.set('sim_mode', role);
      Storage.logAction('connexion_beta', user.id, user.role, 'Connexion beta-testeur (' + type + ')');
      Storage.addNotification(user.id, 'info', 'Mode beta-testeur',
        'Connecté en tant que beta-testeur ' + type + '. Toutes les données sont fictives.',
        { action: 'beta' });
    }
    return user;
  }

  // Redirige vers le dashboard du rôle
  function redirigerDashboard(role) {
    var routes = {
      patient: 'dashboard-patient.html',
      medecin: 'dashboard-medecin.html',
      admin: 'dashboard-admin.html',
      'beta-patient': 'dashboard-patient.html',
      'beta-medecin': 'dashboard-medecin.html',
      'beta-admin': 'dashboard-admin.html'
    };
    var prefix = isRootContext() ? 'pages/' : '';
    setTimeout(function () {
      window.location.href = prefix + (routes[role] || 'auth.html');
    }, 600);
  }

  // Réinitialise complètement la simulation
  function reinitialiser() {
    if (!confirm('Voulez-vous vraiment réinitialiser toutes les données de simulation ? Cette action est irréversible.')) {
      return;
    }
    Storage.clear();
    showToast('Simulation réinitialisée', 'Toutes les données fictives ont été effacées.', 'success');
    setTimeout(function () {
      var prefix = isRootContext() ? '' : '../';
      window.location.href = prefix + 'index.html';
    }, 1000);
  }

  // Ouvre la modale de choix de rôle (inclut beta-testeurs)
  function ouvrirModaleChoix() {
    var existing = document.getElementById('cs-sim-modal');
    if (existing) existing.remove();

    var modal = document.createElement('div');
    modal.id = 'cs-sim-modal';
    modal.className = 'cs-modal-backdrop';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.innerHTML =
      '<div class="cs-modal cs-modal-lg cs-anim-scale-in">' +
        '<div class="cs-modal-header">' +
          '<div class="flex items-center gap-3">' +
            '<div class="w-10 h-10 rounded-cs-sm bg-gold-100 text-gold-700 flex items-center justify-center">' +
              '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.937 15.503A5 5 0 0 0 8.5 12.06a5 5 0 0 0-3.443-1.437A5 5 0 0 0 8.5 9.19a5 5 0 0 0 1.437-3.443 5 5 0 0 0 1.437 3.443 5 5 0 0 0 3.443 1.437 5 5 0 0 0-3.443 1.437 5 5 0 0 0-1.437 3.443z"/></svg>' +
            '</div>' +
            '<div><h2 class="cs-modal-title">Mode démonstration</h2>' +
            '<p class="text-sm text-neutral-500">Choisissez un rôle pour explorer la plateforme</p></div>' +
          '</div>' +
          '<button onclick="Simulation.fermerModaleChoix()" class="cs-btn cs-btn-icon" aria-label="Fermer">' +
            '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
          '</button>' +
        '</div>' +
        '<div class="cs-modal-body" id="cs-sim-modal-body">' +
          '<div class="mb-5">' +
            '<h3 class="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">Comptes standards</h3>' +
            '<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">' +
              cardRole('patient', 'Patient', 'Consultez votre dossier médical', 'BFA-PAT-2026-0001', 'bg-primary-100 text-primary-700', 'user') +
              cardRole('medecin', 'Médecin', 'Gérez vos consultations', 'BFA-MED-2026-0001', 'bg-info-100 text-info-700', 'stethoscope') +
              cardRole('admin', 'Administrateur', 'Pilotez la plateforme', 'BFA-ADM-2026-0001', 'bg-admin-100 text-admin-700', 'shield') +
              cardRole('aleatoire', 'Aléatoire', 'Profil généré au hasard', 'Génération auto', 'bg-gold-100 text-gold-700', 'shuffle') +
            '</div>' +
          '</div>' +
          '<div class="mb-5">' +
            '<h3 class="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3 flex items-center gap-2">' +
              '<span class="cs-badge cs-badge-warning">BETA</span> Comptes beta-testeurs' +
            '</h3>' +
            '<div class="grid grid-cols-1 sm:grid-cols-3 gap-3">' +
              cardRole('beta-patient', 'Beta Patient', 'Accès complet patient', 'beta-patient-2026', 'bg-primary-100 text-primary-700', 'user-check') +
              cardRole('beta-medecin', 'Beta Médecin', 'Accès complet médecin', 'beta-medecin-2026', 'bg-info-100 text-info-700', 'stethoscope') +
              cardRole('beta-admin', 'Beta Admin', 'Accès complet admin', 'beta-admin-2026', 'bg-admin-100 text-admin-700', 'shield-check') +
            '</div>' +
          '</div>' +
          '<div class="bg-neutral-50 rounded-cs-md p-4 border border-neutral-200">' +
            '<div class="flex items-start gap-3">' +
              '<div class="w-8 h-8 rounded-full bg-info-100 text-info-700 flex items-center justify-center flex-shrink-0">' +
                '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>' +
              '</div>' +
              '<div class="text-xs text-neutral-600 leading-relaxed">' +
                '<strong class="text-neutral-800">À propos de la simulation</strong><br>' +
                'Toutes les données sont fictives et conformes au prototype pédagogique. La simulation charge des profils burkinabès réalistes (patients, médecins, structures sanitaires) pour démontrer le fonctionnement de la plateforme en moins de 30 secondes.' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="cs-modal-footer">' +
          '<button onclick="Simulation.fermerModaleChoix()" class="cs-btn cs-btn-secondary">Annuler</button>' +
          '<button onclick="Simulation.ouvrirGenerateur()" class="cs-btn cs-btn-warning">' +
            '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.937 15.503A5 5 0 0 0 8.5 12.06a5 5 0 0 0-3.443-1.437A5 5 0 0 0 8.5 9.19a5 5 0 0 0 1.437-3.443 5 5 0 0 0 1.437 3.443 5 5 0 0 0 3.443 1.437 5 5 0 0 0-3.443 1.437 5 5 0 0 0-1.437 3.443z"/></svg>' +
            'Générer un compte aléatoire</button>' +
        '</div>' +
      '</div>';

    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';

    modal.addEventListener('click', function (e) {
      if (e.target === modal) fermerModaleChoix();
    });
    document.addEventListener('keydown', escHandler);
  }

  function escHandler(e) {
    if (e.key === 'Escape') {
      fermerModaleChoix();
      document.removeEventListener('keydown', escHandler);
    }
  }

  function fermerModaleChoix() {
    var modal = document.getElementById('cs-sim-modal');
    if (modal) modal.remove();
    document.body.style.overflow = '';
  }

  // Carte de rôle pour la modale
  function cardRole(role, titre, description, id, iconClass, iconName) {
    return '<button onclick="Simulation.lancer(\'' + role + '\')" ' +
      'class="text-left bg-white border-2 border-neutral-200 hover:border-primary-500 rounded-cs-md p-4 transition-all hover:shadow-cs-medium group">' +
      '<div class="flex items-start justify-between mb-2">' +
        '<div class="w-10 h-10 rounded-cs-sm ' + iconClass + ' flex items-center justify-center group-hover:scale-110 transition-transform">' +
          icon(iconName, 20) + '</div>' +
      '</div>' +
      '<h3 class="font-semibold text-neutral-800 mb-1">' + titre + '</h3>' +
      '<p class="text-xs text-neutral-500 mb-2">' + description + '</p>' +
      '<div class="text-xs font-mono text-neutral-400 bg-neutral-50 rounded px-2 py-1 inline-block">' + id + '</div>' +
    '</button>';
  }

  // Lance la simulation pour un rôle
  async function lancer(role) {
    role = role || 'patient';
    var body = document.getElementById('cs-sim-modal-body');
    if (body) {
      body.innerHTML = '<div class="text-center py-12">' +
        '<div class="inline-block cs-spinner cs-spinner-dark" style="width:36px;height:36px;"></div>' +
        '<p class="mt-4 text-neutral-600">Chargement des données de simulation...</p>' +
        '<p class="text-xs text-neutral-400 mt-2">Cela peut prendre quelques secondes</p>' +
      '</div>';
    }

    var ok = await chargerDonnees();
    if (!ok) {
      if (body) {
        body.innerHTML = '<div class="text-center py-12 text-danger-700">' +
          '<p>Erreur de chargement. Vérifiez que le serveur est démarré.</p></div>';
      }
      return;
    }

    var user = connecterRole(role);
    if (!user) {
      if (body) {
        body.innerHTML = '<div class="text-center py-12 text-danger-700">' +
          '<p>Impossible de créer l\'utilisateur de simulation.</p></div>';
      }
      return;
    }

    showToast('Simulation démarrée', 'Connecté en tant que ' + role + '.', 'success');
    fermerModaleChoix();
    redirigerDashboard(role);
  }

  // Ouvre le générateur de comptes aléatoires
  function ouvrirGenerateur() {
    fermerModaleChoix();
    setTimeout(function () {
      var modal = document.createElement('div');
      modal.id = 'cs-gen-modal';
      modal.className = 'cs-modal-backdrop';
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      modal.innerHTML = '<div class="cs-modal cs-modal-lg cs-anim-scale-in">' +
        '<div class="cs-modal-header">' +
          '<div class="flex items-center gap-3">' +
            '<div class="w-10 h-10 rounded-cs-sm bg-gold-100 text-gold-700 flex items-center justify-center">' +
              icon('shuffle', 22) +
            '</div>' +
            '<div><h2 class="cs-modal-title">Générateur de comptes</h2>' +
            '<p class="text-sm text-neutral-500">Créez un compte aléatoire ou avec un code ministère</p></div>' +
          '</div>' +
          '<button onclick="Simulation.fermerGenerateur()" class="cs-btn cs-btn-icon" aria-label="Fermer">' + icon('x', 20) + '</button>' +
        '</div>' +
        '<div class="cs-modal-body">' +
          '<div class="mb-6">' +
            '<h3 class="text-sm font-semibold text-neutral-700 mb-3">1. Choisir un mode de génération</h3>' +
            '<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">' +
              '<button onclick="Simulation.genererCompteAleatoire(\'patient\')" class="text-left p-4 border-2 border-neutral-200 hover:border-primary-500 rounded-cs-md transition group">' +
                '<div class="flex items-center gap-2 mb-1"><div class="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center">' + icon('user', 16) + '</div>' +
                '<span class="font-medium text-neutral-800">Patient aléatoire</span></div>' +
                '<p class="text-xs text-neutral-500">Génère un patient fictif burkinabè avec un profil réaliste</p>' +
              '</button>' +
              '<button onclick="Simulation.genererCompteAleatoire(\'medecin\')" class="text-left p-4 border-2 border-neutral-200 hover:border-info-500 rounded-cs-md transition group">' +
                '<div class="flex items-center gap-2 mb-1"><div class="w-8 h-8 rounded-full bg-info-100 text-info-700 flex items-center justify-center">' + icon('stethoscope', 16) + '</div>' +
                '<span class="font-medium text-neutral-800">Médecin aléatoire</span></div>' +
                '<p class="text-xs text-neutral-500">Génère un médecin avec spécialité et structure</p>' +
              '</button>' +
              '<button onclick="Simulation.genererCompteAleatoire(\'admin\')" class="text-left p-4 border-2 border-neutral-200 hover:border-admin-500 rounded-cs-md transition group">' +
                '<div class="flex items-center gap-2 mb-1"><div class="w-8 h-8 rounded-full bg-admin-100 text-admin-700 flex items-center justify-center">' + icon('shield', 16) + '</div>' +
                '<span class="font-medium text-neutral-800">Admin aléatoire</span></div>' +
                '<p class="text-xs text-neutral-500">Génère un administrateur ministère</p>' +
              '</button>' +
              '<button onclick="Simulation.demanderCodeMinistere()" class="text-left p-4 border-2 border-gold-200 hover:border-gold-500 bg-gold-50 rounded-cs-md transition group">' +
                '<div class="flex items-center gap-2 mb-1"><div class="w-8 h-8 rounded-full bg-gold-100 text-gold-700 flex items-center justify-center">' + icon('key', 16) + '</div>' +
                '<span class="font-medium text-neutral-800">Code ministère</span></div>' +
                '<p class="text-xs text-neutral-500">Saisir un code d\'inscription fourni par le ministère</p>' +
              '</button>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="cs-modal-footer">' +
          '<button onclick="Simulation.fermerGenerateur()" class="cs-btn cs-btn-secondary">Fermer</button>' +
        '</div>' +
      '</div>';
      document.body.appendChild(modal);
      document.body.style.overflow = 'hidden';
    }, 200);
  }

  function fermerGenerateur() {
    var modal = document.getElementById('cs-gen-modal');
    if (modal) modal.remove();
    document.body.style.overflow = '';
  }

  // Génère un compte aléatoire et le connecte
  function genererCompteAleatoire(type) {
    chargerDonnees().then(function () {
      var user = null;
      if (type === 'patient') user = creerPatientAleatoire();
      else if (type === 'medecin') user = creerMedecinAleatoire();
      else if (type === 'admin') user = creerAdminAleatoire();

      if (user) {
        Storage.set('user', user);
        Storage.set('sim_active', 'true');
        Storage.set('sim_mode', type);
        Storage.logAction('generation_compte', user.id, user.role, 'Génération aléatoire (' + type + ')');
        showToast('Compte créé', user.prenom + ' ' + user.nom + ' (' + user.id + ')', 'success');
        fermerGenerateur();
        redirigerDashboard(type);
      }
    });
  }

  function creerPatientAleatoire() {
    var sexe = Math.random() > 0.5 ? 'M' : 'F';
    var nom = NOMS_BURKINABE[Math.floor(Math.random() * NOMS_BURKINABE.length)];
    var prenom = sexe === 'M'
      ? PRENOMS_MASCULINS[Math.floor(Math.random() * PRENOMS_MASCULINS.length)]
      : PRENOMS_FEMININS[Math.floor(Math.random() * PRENOMS_FEMININS.length)];
    var region = REGIONS_BF[Math.floor(Math.random() * REGIONS_BF.length)];
    var annee = 1950 + Math.floor(Math.random() * 65);

    var patient = {
      nom: nom, prenom: prenom,
      dateNaissance: annee + '-01-15',
      sexe: sexe,
      telephone: randomPhone(),
      email: prenom.toLowerCase() + '.' + nom.toLowerCase() + '@email.bf',
      region: region.region, province: region.province, district: region.chefLieu,
      adresse: 'Secteur ' + (1 + Math.floor(Math.random() * 30)) + ', ' + region.chefLieu,
      groupeSanguin: GROUPES_SANGUINS[Math.floor(Math.random() * GROUPES_SANGUINS.length)],
      electrophorese: ELECTROPHORESES[Math.floor(Math.random() * ELECTROPHORESES.length)],
      poids: 50 + Math.floor(Math.random() * 40),
      taille: 155 + Math.floor(Math.random() * 30),
      allergies: [], antecedents: [],
      statutMedical: 'Nouvel inscrit',
      familleId: null, roleFamille: null,
      dateCreation: new Date().toISOString().slice(0, 10),
      consentement: true, photo: null,
      motDePasse: 'caresync2026',
      statutValidation: 'validé',
      niveauCertification: 'BRONZE'
    };
    var created = Storage.create('patients', patient);
    return {
      id: created.id, role: 'patient',
      nom: created.nom, prenom: created.prenom,
      email: created.email, telephone: created.telephone,
      dateConnexion: new Date().toISOString()
    };
  }

  function creerMedecinAleatoire() {
    var nom = NOMS_BURKINABE[Math.floor(Math.random() * NOMS_BURKINABE.length)];
    var prenom = PRENOMS_MASCULINS[Math.floor(Math.random() * PRENOMS_MASCULINS.length)];
    var specialite = SPECIALITES[Math.floor(Math.random() * SPECIALITES.length)];
    var structures = Storage.getAll('structures');
    var structure = structures[Math.floor(Math.random() * structures.length)] || { id: '', nom: '' };

    var medecin = {
      nom: 'Dr. ' + nom, prenom: prenom,
      specialite: specialite,
      telephone: randomPhone(),
      email: 'dr.' + nom.toLowerCase() + '.' + prenom.toLowerCase() + '@caresync.bf',
      etablissement: structure.nom || 'Non assigné',
      etablissementId: structure.id || '',
      numeroAgrement: 'AGRE-2025-' + String(200 + Math.floor(Math.random() * 800)).padStart(4, '0'),
      diplome: 'Doctorat en Médecine - Université Joseph Ki-Zerbo',
      dateValidation: new Date().toISOString(),
      validePar: 'BFA-ADM-2026-0001',
      statutValidation: 'validé',
      statut: 'actif',
      specialites: [specialite],
      langues: ['Français'],
      nbPatients: 0, nbConsultations: 0,
      dateCreation: new Date().toISOString().slice(0, 10),
      motDePasse: 'caresync2026',
      niveauCertification: 'ARGENT',
      consentement: true
    };
    var created = Storage.create('medecins', medecin);
    return {
      id: created.id, role: 'medecin',
      nom: created.nom, prenom: created.prenom,
      specialite: created.specialite, etablissement: created.etablissement,
      dateConnexion: new Date().toISOString()
    };
  }

  function creerAdminAleatoire() {
    var nom = NOMS_BURKINABE[Math.floor(Math.random() * NOMS_BURKINABE.length)];
    var prenom = PRENOMS_MASCULINS[Math.floor(Math.random() * PRENOMS_MASCULINS.length)];
    var admin = {
      nom: nom, prenom: prenom,
      fonction: 'Agent administratif',
      structure: 'Ministère de la Santé BF',
      service: 'Direction régionale',
      niveauPermission: 'Lecture seule',
      telephone: randomPhone(),
      email: prenom.toLowerCase() + '.' + nom.toLowerCase() + '@sante.gov.bf',
      dateCreation: new Date().toISOString().slice(0, 10),
      motDePasse: 'caresync2026',
      niveauCertification: 'OR',
      consentement: true,
      statutValidation: 'validé'
    };
    var created = Storage.create('admins', admin);
    return {
      id: created.id, role: 'admin',
      nom: created.nom, prenom: created.prenom,
      fonction: created.fonction,
      dateConnexion: new Date().toISOString()
    };
  }

  // Demande un code ministère
  function demanderCodeMinistere() {
    fermerGenerateur();
    setTimeout(function () {
      var modal = document.createElement('div');
      modal.className = 'cs-modal-backdrop';
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      modal.innerHTML = '<div class="cs-modal">' +
        '<div class="cs-modal-header">' +
          '<h3 class="cs-modal-title">Code ministère</h3>' +
          '<button class="cs-btn cs-btn-icon" onclick="this.closest(\'.cs-modal-backdrop\').remove()" aria-label="Fermer">' + icon('x', 20) + '</button>' +
        '</div>' +
        '<div class="cs-modal-body">' +
          '<p class="text-sm text-neutral-600 mb-4">Saisissez un code d\'inscription fourni par le ministère. Exemple : MIN-PAT-2026-AB12.</p>' +
          '<label class="block text-sm font-medium text-neutral-700 mb-1" for="cs-code-input">Code</label>' +
          '<input id="cs-code-input" type="text" class="cs-input" placeholder="MIN-XXX-2026-XXXX" maxlength="20" />' +
          '<p class="text-xs text-neutral-400 mt-2">Astuce : générez un code depuis le dashboard admin.</p>' +
        '</div>' +
        '<div class="cs-modal-footer">' +
          '<button class="cs-btn cs-btn-secondary" onclick="this.closest(\'.cs-modal-backdrop\').remove()">Annuler</button>' +
          '<button class="cs-btn cs-btn-primary" id="cs-code-confirm">Valider</button>' +
        '</div>' +
      '</div>';
      document.body.appendChild(modal);
      document.getElementById('cs-code-confirm').addEventListener('click', function () {
        var code = document.getElementById('cs-code-input').value.trim().toUpperCase();
        var found = Storage.verifierCodeMinistere(code);
        if (found) {
          showToast('Code valide', 'Rôle : ' + found.role, 'success');
          modal.remove();
        } else {
          showToast('Code invalide', 'Le code est invalide, expiré ou déjà utilisé.', 'error');
        }
      });
    }, 200);
  }

  // API publique
  return {
    chargerDonnees: chargerDonnees,
    connecterRole: connecterRole,
    connecterBeta: connecterBeta,
    redirigerDashboard: redirigerDashboard,
    reinitialiser: reinitialiser,
    ouvrirModaleChoix: ouvrirModaleChoix,
    fermerModaleChoix: fermerModaleChoix,
    lancer: lancer,
    ouvrirGenerateur: ouvrirGenerateur,
    fermerGenerateur: fermerGenerateur,
    genererCompteAleatoire: genererCompteAleatoire,
    demanderCodeMinistere: demanderCodeMinistere
  };
})();