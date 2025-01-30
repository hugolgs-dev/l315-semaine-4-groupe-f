const express = require('express');
const router = express.Router();
const cookieParser = require('cookie-parser');
const authenticate = require('../middleware/authenticate'); 
router.use(cookieParser());
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

/* les modèles */
const Document = require('../models/Document');

/* import du contrôleur d'authentification */
const { signUp, login, logout } = require('../Controllers/AuthController');

/* routes d'authentification */
router.post('/signup', signUp);  // route pour l'inscription
router.post('/login', login);    // route pour la connexion
router.get('/logout', (req, res) => {
    res.clearCookie('token');  // efface le cookie contenant le token
    res.redirect('/');         // redirige vers la page d'accueil après la déconnexion
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
    // [] pour avoir une array vide plutôt qu'une erreur TypeUndefined si utilisateur non connecté, comme ça les documents se chargent quand même

    // passe les documents à la vue, et ajoute userId à la vue si l'utilisateur est connecté
    res.render('pages/documents', {
      documentsDisponibles,
      documentsEmpruntes,
      userId: req.user ? req.user.id : null  // ajoute userId seulement si l'utilisateur est authentifié
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des documents:', error);
    res.status(500).send('Erreur lors de la récupération des documents');
  }
});

// route pour emprunter un document
router.post('/emprunter/:id', authenticate, async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;  // récupère l'ID de l'utilisateur connecté

    try {
        const document = await Document.findById(id);

        if (document.emprunteur) {
            return res.status(400).send('Ce document est déjà emprunté.');  // vérifie si le document est déjà emprunté
        }

        document.emprunteur = userId;
        await document.save();

        res.redirect('/documents');  // redirige vers la page des documents
    } catch (error) {
        console.error('Erreur lors de l\'emprunt du document:', error);
        res.status(500).send('Erreur lors de l\'emprunt du document');
    }
});

// route pour rendre un document
router.post('/rendre/:recordid', authenticate, async (req, res) => {
    const { recordid } = req.params;  // récupère le recordid du document depuis l'URL
    const userId = req.user.id;  // récupère l'ID de l'utilisateur connecté

    try {
        // recherche du document par recordid (non par _id)
        const document = await Document.findOne({ recordid: recordid });

        if (!document) {
            console.log('Document non trouvé');
            return res.status(404).send('Document non trouvé');
        }

        // vérifie que l'utilisateur est bien l'emprunteur du document
        if (document.emprunteur.toString() !== userId) {
            console.log('L\'utilisateur n\'a pas emprunté ce document');
            return res.status(400).send('Vous ne pouvez pas rendre un document que vous n\'avez pas emprunté');
        }

        // supprime l'emprunteur du document pour marquer qu'il est rendu
        document.emprunteur = undefined;  // supprime le champ emprunteur
        const updatedDocument = await document.save();

        console.log('Document après mise à jour:', updatedDocument);

        // redirige vers la page des documents après mise à jour
        res.redirect('/documents');
    } catch (error) {
        console.error('Erreur lors du retour du document:', error);
        res.status(500).send('Erreur lors du retour du document: ' + error.message);
    }
});

module.exports = router;
