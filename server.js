if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const express = require('express');               // Web framework for Node.js
const app = express();                            // Create an Express application
const bcrypt = require('bcrypt');                 // Library for hashing passwords
const passport = require('passport');             // Authentication middleware
const flash = require('express-flash');           // Middleware for flash messages
const session = require('express-session');       // Middleware for session management
const methodOverride = require('method-override'); // Middleware to override HTTP methods
const initializePassport = require('./passport-config'); // Module for passport configuration

const users = []        // In-memory user array (Note: This will be replaced by the MongoDB database)

// Initialize passport with user lookup functions
initializePassport(
    passport, 
    email => users.find(user => user.email === email),  // Find user by email
    id => users.find(user => user.id == id)             // Find user by id
)

// Set up EJS as the templating engine
app.set('view-engine', 'ejs')
// Middleware to parse form data
app.use(express.urlencoded({ extended: false }))
// Middleware for flash messages (error/success notifications)
app.use(flash())

// Middleware to manage user sessions
app.use(session({
    secret: process.env.SESSION_SECRET,       // Session secret from environment variable
    resave: false,                            // Don't resave session if not modified
    saveUninitialized: false                  // Don't save uninitialized sessions
}))

// Initialize Passport for authentication
app.use(passport.initialize())
app.use(passport.session())                   // Persistent login sessions

// Override HTTP methods like DELETE and PUT (for forms that don't support them)
app.use(methodOverride('_method'))

// Route: Home page (only accessible if authenticated)
app.get('/', checkAuthenticated, (req, res) => {
    // Render the index.ejs template, passing the user's name
    res.render('index.ejs', { name: req.user.name })
})

// Route: Login page (only accessible if NOT authenticated)
app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login.ejs')
})

// Handle login POST request with passport authentication
app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',                     // Redirect to home on success
    failureRedirect: '/login',                // Redirect back to login on failure
    failureFlash: true                        // Show failure flash message
}))

// Route: Registration page (only accessible if NOT authenticated)
app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render('register.ejs')
})

// Handle registration POST request
app.post('/register', checkNotAuthenticated, async (req, res) => {
    try {
        // Hash the user's password with bcrypt
        const hashedPassword = await bcrypt.hash(req.body.password, 10)

        // Push a new user into the users array
        users.push({
            id: Date.now().toString(),           // MongoDB already generates this
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword            // Store hashed password
        })

        // Redirect to the login page upon successful registration
        res.redirect('/login')
    } catch {
        // If an error occurs, redirect back to the registration page
        res.redirect('/register')
    }

    console.log(users)                            // Log the new user to the console (for debugging)
})

// The users array will be reset to an empty array when we restart the server which is why we need MongoDB here to store the users

// Route: Handle logout and redirect to the login page
app.delete('/logout', (req, res, next) => {
    req.logout((err) => {                       // Passport's logout function
        if (err) {
            return next(err)                    // Handle any logout errors
        }
        res.redirect('/login')                  // Redirect to login page after logout
    })
})

// Middleware: Check if the user is authenticated
function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next()                           // Continue if authenticated
    }

    res.redirect('/login')                      // Redirect to login if not authenticated
}

// Middleware: Check if the user is NOT authenticated
function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/')                // Redirect to home if authenticated
    }
    next()                                      // Continue if not authenticated
}

// Start the server on port 3000
app.listen(3000)
