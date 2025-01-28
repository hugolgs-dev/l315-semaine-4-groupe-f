const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const routes = require('./routes/index');
const path = require('path');

const app = express();

/* Config EJS */
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set('layout', 'layout');

app.use('/', routes); // page d'accueil

/* Import de bootstrap */
app.use('/css', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/css')));
app.use('/js', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/js')));

module.exports = app;