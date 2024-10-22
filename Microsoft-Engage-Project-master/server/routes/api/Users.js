const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");

// Load input validation
const validateRegisterInput = require("../../validation/register");
const validateLoginInput = require("../../validation/login");

// Load User model
const User = require("../../models/Users");

/**
 * This API is used to register new users.
 * If form data is invalid or email already exists in the database, it returns an error;
 * otherwise, it creates the account.
 */
router.post("/register", (req, res) => {
    // Validate registration data for errors
    const { errors, isValid } = validateRegisterInput(req.body);

    // If there is an error, return error code 400 with error description
    if (!isValid) {
        return res.status(400).json(errors);
    }

    User.findOne({ email: req.body.email }).then(user => {
        // If user is already in the database, return an error
        if (user) {
            return res.status(400).json({ email: "Email already exists in the database" });
        } else {
            // If the user is new, create an account
            const newUser = new User({
                name: req.body.name,
                email: req.body.email,
                password: req.body.password,
                userType: req.body.userType,
            });

            // Hash the password before saving it to the database
            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(newUser.password, salt, (err, hash) => {
                    if (err) throw err;
                    newUser.password = hash;
                    newUser.save()
                        .then(user => res.json(user))
                        .catch(err => console.log(err));
                });
            });

            return res.status(200).json({
                email: newUser.email,
                name: newUser.name,
                userType: newUser.userType
            });
        }
    });
});

/**
 * POST api/users/login
 * Login user and return JWT token
 * Public access
 */
router.post("/login", (req, res) => {
    // Form validation
    const { errors, isValid } = validateLoginInput(req.body);

    // Check validation
    if (!isValid) {
        return res.status(400).json(errors);
    }

    const email = req.body.email;
    const password = req.body.password;

    // Find user by email
    User.findOne({ email }).then(user => {
        // Check if user exists
        if (!user) {
            return res.status(404).json({ emailnotfound: "Email not found" });
        }

        // Check password
        bcrypt.compare(password, user.password).then(isMatch => {
            if (isMatch) {
                // User matched, create JWT Payload
                const payload = {
                    id: user.id,
                    name: user.name,
                    userType: user.userType,
                    email: user.email,
                };

                // Sign token
                jwt.sign(
                    payload,
                    keys.secretOrKey,
                    {
                        expiresIn: 31556926 // 1 year in seconds
                    },
                    (err, token) => {
                        res.json({
                            success: true,
                            token: "Bearer " + token
                        });
                    }
                );
            } else {
                return res.status(400).json({ passwordincorrect: "Password incorrect" });
            }
        });
    });
});

// Export the router
module.exports = router;
