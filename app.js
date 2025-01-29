const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const routes = require('./routes/index');
const path = require('path');
const cookieParser = require('cookie-parser');

const app = express();

/* Config EJS */
app.set('view engine', 'ejs');
app.set('layout', 'layout');
app.use(cookieParser());

app.use(expressLayouts);
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true }))
app.use('/', routes); // page d'accueil

/* Import de bootstrap */
app.use('/css', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/css')));
app.use('/js', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/js')));

module.exports = app;