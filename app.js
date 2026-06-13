const path = require('path');
const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');

const errorController = require('./controllers/error');
const User = require('./models/user');

const MONGODB_URI = 
    'mongodb+srv://kinnartandel:J9nc6FxLidlJ9a1R@cluster0.defqjrx.mongodb.net/test';

const app = express();
const store = new MongoDBStore({
    uri: MONGODB_URI,
    collection: 'sessions',
});
const csrfProtection = csrf();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');
const { connect } = require('http2');

app.use(bodyParser.urlencoded({ extended : false}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(
    session({
        secret: 'my secret', 
        resave: false, 
        saveUninitialized: false, 
        store: store
    })
);
// app.use(
//     session({
//         secret: 'my secret',
//         resave: false,
//         saveUninitialized: false,
//         store: store,
//         cookie: {
//             maxAge: 1000 * 60 * 60 * 24, // 1 day
//             httpOnly: true
//         }
//     })
// );
app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
    console.log('URL:', req.url);
    console.log('Session ID:', req.sessionID);
    console.log('Cookie:', req.headers.cookie);
    console.log('--------------------');
    next();
});

app.use((req, res, next) => {
    if (!req.session.user) {
        return next();
    }

    User.findById(req.session.user._id)
        .then(user => {
            req.user = user;
            next();
        })
        .catch(err => console.log(err));
});

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});
app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);

const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer(app);

mongoose
    .connect(MONGODB_URI)
    .then(result => {
             
            app.listen(port);      
    })
    .catch(err => console.error(err));


