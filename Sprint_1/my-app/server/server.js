// server.js
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const session = require('express-session');
const flash = require('express-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const userLogin = require('./models/userLogin');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use(cors({
    origin: 'http://localhost:3001', // Replace with your React app's URL
    credentials: true // Allow credentials (cookies, sessions, etc.)
}));

app.set('view engine', 'ejs');

// Passport Local Strategy
passport.use(new LocalStrategy({
    usernameField: 'Email', // Using 'Email' with a capital 'E'
    passwordField: 'Password' // Ensure this matches with the schema
}, async (Email, Password, done) => {
    try {
        const user = await userLogin.findOne({ Email: Email }); // Look for 'Email' with a capital 'E'
        if (!user) {
            return done(null, false, { message: 'No user with that email' });
        }

        // Compare passwords as plain text
        if (Password !== user.Password) {
            return done(null, false, { message: 'Incorrect password' });
        }

        return done(null, user);
    } catch (err) {
        return done(err);
    }
}));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
    try {
        const user = await userLogin.findById(id);
        done(null, user);
    } catch (err) {
        done(err);
    }
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {}).then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.get('/', (req, res) => {
    res.render('login', { messages: req.flash() }); // Pass flash messages to the template
});

app.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        req.logIn(user, (err) => {
            if (err) {
                return next(err);
            }
            return res.json({ message: 'Login successful', user: user });
        });
    })(req, res, next);
});

app.get('/index', (req, res) => {
    if (req.isAuthenticated()) {
        res.json({ message: `Welcome, ${req.user.FirstName}!`, user: req.user });
    } else {
        res.status(401).json({ message: 'Unauthorized' });
    }
});

app.post('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).json({ message: 'Logout failed' });
        }
        res.json({ message: 'Logout successful' });
    });
});

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});