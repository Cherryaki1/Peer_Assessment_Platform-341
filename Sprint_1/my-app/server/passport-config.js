// Import the LocalStrategy from the passport-local module for local authentication
const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt') // Import bcrypt for hashing and comparing passwords

// Function to initialize passport authentication
function initialize(passport, getUserByEmail, getUserByID) {
    // Inner function to authenticate the user
    const authenticateUser = async (email, password, done) => {
        // Retrieve user by email using the provided callback function
        const user = getUserByEmail(email)

        // If no user is found, return an error message
        if (user == null) {
            return done(null, false, { message: 'No user with that email' })
        }

        try {
            // Compare the provided password with the hashed password stored in the database
            if (await bcrypt.compare(password, user.password)) {
                // If the password matches, authentication is successful
                return done(null, user)
            } else {
                // If the password is incorrect, return an error message
                return done(null, false, { message: 'Password Incorrect' })
            }
        } catch (e) {
            // If an error occurs during password comparison, pass the error to done
            return done(e)
        }
    }

    // Use the LocalStrategy for authentication, specifying the username field as 'email'
    passport.use(new LocalStrategy({ usernameField: 'email' }, authenticateUser))

    // Serialize the user ID to store it in the session
    passport.serializeUser((user, done) => done(null, user.id))

    // Deserialize the user based on the stored ID when the session is accessed
    passport.deserializeUser((id, done) => {
        return done(null, getUserByID(id)) // Use the provided callback to retrieve the user
    })
}

// Export the initialize function for use in other modules
module.exports = initialize
