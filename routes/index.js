const express = require('express');
const mongoose = require('mongoose');

/* Les modèles */
const Document = require('../models/Document');

/* Import authentication controller */
const { signUp, login, logout } = require('../Controllers/AuthController');

const router = express.Router();
/* Authentication Routes */
router.post('/signup', signUp);
router.post('/login', login);
router.get('/logout', logout);


/* page d'accueil */
router.get('/', (req, res) => {
    console.log(req)
    const isLoggedIn = req.cookies.token ? true : false;
    res.render('home', {
        title: 'Page d\'accueil',
        isLoggedIn: isLoggedIn,  // Pass the logged-in status to the view
      });
});

// Routes d'authentification supplémentaires
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

// Route pour afficher les documents
router.get('/documents', async (req, res) => {
    try {
        // Simuler un utilisateur connecté pour les tests
        const userId = '6799fa4cf55e9b254a11dbc7'; // À remplacer par l'ID de l'utilisateur connecté

        // Récupérer tous les documents depuis la base de données
        const allDocuments = await Document.find({});

        // Séparer les documents disponibles et ceux empruntés par l'utilisateur
        const documentsDisponibles = allDocuments.filter(doc => !doc.emprunteur);
        const documentsEmpruntes = allDocuments.filter(doc => doc.emprunteur?.toString() === userId);

        // Rendre la vue avec les documents triés et l'ID de l'utilisateur
        res.render('pages/documents', { documentsDisponibles, documentsEmpruntes, userId });
    } catch (error) {
        console.error(error);
        res.status(500).send('Erreur lors de la récupération des documents');
    }
});

// Route pour emprunter un document
router.post('/emprunter/:id', async (req, res) => {
    try {
        const userId = '6799fa4cf55e9b254a11dbc7'; // Simuler un utilisateur connecté ici, à remplacer par l'ID réel
        const documentId = req.params.id; // Corrigé pour correspondre à la route

        // Mettre à jour le document en ajoutant l'ID de l'utilisateur dans le champ emprunteur
        const updatedDocument = await Document.findByIdAndUpdate(
            documentId,
            { emprunteur: userId },
            { new: true }
        );

        if (!updatedDocument) {
            return res.status(404).send('Document non trouvé');
        }

        // Rediriger vers la page des documents pour afficher la mise à jour
        res.redirect('/documents');
    } catch (error) {
        console.error(error);
        res.status(500).send('Erreur lors de l\'emprunt du document');
    }
});

// Route pour rendre un document (supprimer l'emprunteur)
router.post('/rendre/:documentId', async (req, res) => {
    try {
        const documentId = req.params.documentId; // recordid
        const userId = '6799fa4cf55e9b254a11dbc7'; // Simuler un utilisateur connecté

        // Utilisation de recordid pour trouver le document et supprimer l'emprunteur
        const updatedDocument = await Document.findOneAndUpdate(
            { recordid: documentId, emprunteur: userId }, // Vérifie qu'il y a un emprunteur avec le même userId
            { $unset: { emprunteur: 1 } }, // Supprimer le champ emprunteur
            { new: true } // Retourner le document mis à jour
        );

        if (!updatedDocument) {
            return res.status(404).send('Document non trouvé ou l\'utilisateur n\'a pas emprunté ce document');
        }

        // Rediriger vers la page des documents après mise à jour
        res.redirect('/documents');
    } catch (error) {
        console.error(error);
        res.status(500).send('Erreur lors de la suppression de l\'emprunteur');
    }
});

module.exports = router;
