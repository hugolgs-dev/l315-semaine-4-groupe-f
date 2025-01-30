const mongoose = require('mongoose');
const { mongo } = require("mongoose");

const documentSchema = new mongoose.Schema({
    datasetid: String,
    recordid: String,
    fields: {
        nombre_de_reservations: Number,
        rang: Number,
        titre_avec_lien_vers_le_catalogue: String,
        auteur: String,
        type_de_document: String,
        record_timestamp: String,
        FIELD9: String,
    },
    emprunteur: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }  ,// ajout du champ emprunteur
});

module.exports = mongoose.model('Document', documentSchema);
