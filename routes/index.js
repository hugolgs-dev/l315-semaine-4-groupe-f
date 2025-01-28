const express = require('express');
const mongoose = require('mongoose');

/* Les modèles */
const Document = require('../models/Document');

const router = express.Router();

/* page d'accueil */
router.get('/', (req, res) => {
    res.render('home', {
        title: 'Page d\'accueil',
    });
})

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

