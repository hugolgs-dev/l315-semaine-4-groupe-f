require('dotenv').config();
require('./models/User');

const mongoose = require('mongoose');

/* Connexion BDD */
mongoose.connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

mongoose.connection
    .on('open', () => {
        console.log('Mongoose connexion ouverte');
    })
    .on('error', (err) => {
        console.log(`Erreur de connexion: ${err.message}`);
    });

const app = require('./app')
const server = app.listen(3000, () => {
    console.log(`Le serveur tourne sur le port ${server.address().port}`)
})