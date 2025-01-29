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

router.get('/signup', (req, res) => {
    res.render('auth/inscription', {
        title: 'Page d\'accueil',
    });
});

router.get('/login', (req, res) => {
    res.render('auth/login', {
        title: 'Page d\'accueil',
    });
});



/* page d'affichage des documents */
router.get('/documents', async (req, res) => {
    try {
        const documents = await Document.find({});
        res.render('pages/documents', { documents });
    } catch (error) {
        res.status(500).send('Erreur lors de la récupération des documents');
    }
});



module.exports = router;
