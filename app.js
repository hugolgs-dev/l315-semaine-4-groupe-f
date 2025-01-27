const express = require('express');
const routes = require('./routes/index');
const path = require('path');

const app = express();
app.use('/', routes); // page d'accueil
app.set('view engine', 'ejs');

/* Import de bootstrap */
app.use('/css', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/css')));
app.use('/js', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/js')));

module.exports = app;