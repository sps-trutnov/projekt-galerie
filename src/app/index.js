const express = require('express');
const session = require('express-session');
const env = require('dotenv').config()
const path = require('path');
const app = express();
app.use('/', session({
    secret: 5,
    secure: false,
    resave: false,
    saveUninitialized: false,
    cookie: { 
        sameSite: true,
        expires: 300000 //5 minut 60000 = 1 minuta
    },
}));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'www')));
app.use(express.json());
app.use(express.urlencoded({ "extended": true }));
app.use('/', require(path.join(__dirname, 'routers', 'dbRouter')));
app.use('/', require(path.join(__dirname, 'routers', 'routery')));
module.exports = app;
app.use('/css',express.static(path.join(__dirname, 'styles')));
app.use('/scripts',express.static(path.join(__dirname, 'scripts')));