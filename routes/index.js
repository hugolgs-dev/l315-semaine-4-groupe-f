const express = require('express');
const router = express.Router();
const cookieParser = require('cookie-parser');
const authenticate = require('../middleware/authenticate'); 
router.use(cookieParser());
const { body, validationResult } = require('express-validator');


/* les modèles */
const Document = require('../models/Document');
const User = require('../models/User'); // Import du modèle User

/* import du contrôleur d'authentification */
const { signUp, login, logout } = require('../Controllers/AuthController');
const { adminSignUp, adminLogin, adminLogout } = require('../Controllers/AdminAuthController');

/* routes d'authentification */
router.post('/signup', signUp);  // route pour l'inscription
router.post('/login', login);    // route pour la connexion
router.get('/logout', (req, res) => {
    res.clearCookie('token');  // efface le cookie contenant le token
    res.redirect('/');         // redirige vers la page d'accueil après la déconnexion
});

/* routes d'authentification pour les administrateurs */

// Route GET pour afficher la page de connexion admin
router.get('/admin/login', (req, res) => {
    res.render('admin/login', {
        title: 'Connexion Admin',
        message: '', // Optionnel : pour afficher des messages d'erreur ou de succès
        messageType: '', // Optionnel : pour styliser le message (danger, success, etc.)
    });
});

// Route GET pour afficher la page d'inscription admin
router.get('/admin/signup', (req, res) => {
    res.render('admin/signup', {
        title: 'Inscription Admin',
        message: '', // Optionnel : pour afficher des messages d'erreur ou de succès
        messageType: '', // Optionnel : pour styliser le message (danger, success, etc.)
    });
});

// Route POST pour gérer l'inscription admin
router.post('/admin/signup', adminSignUp);

// Route POST pour gérer la connexion admin
router.post('/admin/login', adminLogin);

// Route GET pour gérer la déconnexion admin
router.get('/admin/logout', (req, res) => {
    res.clearCookie('adminToken');  // efface le cookie contenant le token admin
    res.redirect('/admin/login');   // redirige vers la page de connexion admin
});

/* Route GET pour le tableau de bord admin avec pagination */
const ITEMS_PER_PAGE = 10; // Nombre d'éléments par page

router.get('/admin/dashboard', authenticate, async (req, res) => {
  try {
    const users = await User.find(); // Récupération des utilisateurs depuis MongoDB
    const documents = await Document.find(); 
      console.log("Utilisateurs récupérés :", users);
    res.render('admin/dashboard', {
      title: 'Tableau de Bord Admin',
      users,
      documents,
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('admin/error', {
      title: 'Erreur',
      message: 'Une erreur est survenue lors de la récupération des données.',
    });
  }
});

/* Route POST pour ajouter un utilisateur */
router.post('/admin/add-user', async (req, res) => {
  const { name, email, password } = req.body;

  try {
      // Créer un nouvel utilisateur
      const newUser = new User({
          name,
          email,
          password, // Assurez-vous de hasher le mot de passe en amont si nécessaire
      });

      // Sauvegarder l'utilisateur dans MongoDB
      await newUser.save();

      if (req.xhr) {
        return res.json({ message: 'Utilisateur ajouté avec succès.', user: newUser });
      }

      res.redirect('/admin/dashboard');
  } catch (err) {
      console.error(err);
      res.status(500).render('admin/dashboard', {
          title: 'Tableau de Bord Admin',
          message: 'Une erreur est survenue lors de l\'ajout de l\'utilisateur.',
          messageType: 'danger',
      });
  }
});


/* Route POST pour ajouter un document */
router.post('/admin/add-document', async (req, res) => {
  const { title, description } = req.body;

  try {
      // Créer un nouveau document
      const newDocument = new Document({
          datasetid: "some_dataset_id",  // Valeur par défaut
          recordid: "some_record_id",    // Valeur par défaut
          fields: {
              titre_avec_lien_vers_le_catalogue: title,
              type_de_document: description,  // Si "description" représente un type
              record_timestamp: new Date(),   // Mettre la date actuelle
          }
      });

      // Sauvegarder le document dans MongoDB
      await newDocument.save();
      if (req.xhr) {
        return res.json({ message: 'Document ajouté avec succès.', document: newDocument });
      }
      
      res.redirect('/admin/dashboard');
  } catch (err) {
      console.error(err);
      res.status(500).render('admin/dashboard', {
          title: 'Tableau de Bord Admin',
          message: 'Une erreur est survenue lors de l\'ajout du document.',
          messageType: 'danger',
      });
  }
});


/* Route DELETE pour supprimer un utilisateur */
router.delete('/admin/delete-user/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // Vérifier si l'utilisateur existe avant de le supprimer
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }

    // Supprimer l'utilisateur
    await User.findByIdAndDelete(id);
    res.status(200).json({ message: 'Utilisateur supprimé avec succès.' });
  } catch (err) {
    console.error('Erreur lors de la suppression de l\'utilisateur:', err);
    res.status(500).json({ message: 'Erreur serveur. Impossible de supprimer l\'utilisateur.' });
  }
});
/* Route DELETE pour supprimer un document */
router.delete('/admin/delete-document/:id', async (req, res) => {
  const { id } = req.params;

  try {
      const document = await Document.findById(id);
      if (!document) {
          return res.status(404).json({ message: "Document non trouvé." });
      }

      await document.deleteOne();
      res.json({ message: "Document supprimé avec succès." });
  } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Erreur lors de la suppression du document." });
  }
});

/* page d'accueil */
router.get('/', (req, res) => {
    const isLoggedIn = req.cookies.token ? true : false; // vérifie si le token existe dans les cookies
    res.render('home', {
        title: 'Page d\'accueil',
        isLoggedIn: isLoggedIn // ajoute la variable isLoggedIn à l'objet passé à la vue
    });
});

// routes d'authentification supplémentaires
router.get('/signup', (req, res) => {
    res.render('auth/inscription', {
        title: 'Page d\'inscription',
    });
});

router.get('/login', (req, res) => {
    res.render('auth/login', {
        title: 'Page de connexion',
    });
});

// route pour afficher les documents
router.get('/documents', authenticate, async (req, res) => {
  try {
    const allDocuments = await Document.find({});  // récupère tous les documents

    const documentsDisponibles = allDocuments.filter(doc => !doc.emprunteur);
    const documentsEmpruntes = req.user ? allDocuments.filter(doc => doc.emprunteur && doc.emprunteur.toString() === req.user.id.toString()) : [] ;

    res.render('pages/documents', {
      documentsDisponibles,
      documentsEmpruntes,
      userId: req.user ? req.user.id : null
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des documents:', error);
    res.status(500).send('Erreur lors de la récupération des documents');
  }
});

// route pour emprunter un document
router.post('/emprunter/:id', authenticate, async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    try {
        const document = await Document.findById(id);

        if (document.emprunteur) {
            return res.status(400).send('Ce document est déjà emprunté.');
        }

        document.emprunteur = userId;
        await document.save();

        res.redirect('/documents');
    } catch (error) {
        console.error('Erreur lors de l\'emprunt du document:', error);
        res.status(500).send('Erreur lors de l\'emprunt du document');
    }
});

// route pour rendre un document
router.post('/rendre/:recordid', authenticate, async (req, res) => {
    const { recordid } = req.params;
    const userId = req.user.id;

    try {
        const document = await Document.findOne({ recordid: recordid });

        if (!document) {
            console.log('Document non trouvé');
            return res.status(404).send('Document non trouvé');
        }

        if (document.emprunteur.toString() !== userId) {
            console.log('L\'utilisateur n\'a pas emprunté ce document');
            return res.status(400).send('Vous ne pouvez pas rendre un document que vous n\'avez pas emprunté');
        }

        document.emprunteur = undefined;
        await document.save();

        res.redirect('/documents');
    } catch (error) {
        console.error('Erreur lors du retour du document:', error);
        res.status(500).send('Erreur lors du retour du document: ' + error.message);
    }
});

module.exports = router;