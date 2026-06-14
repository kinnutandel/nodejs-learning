const express = require('express');
const { route } = require('./admin');
const { check, body } = require('express-validator');
const authController = require('../controllers/auth');
const User = require('../models/user');

const router = express.Router();

router.get('/login', authController.getLogin);
//router.post('/login', authController.postLogin);
router.post(
  '/login',
  [
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email address.'),
      //.normalizeEmail(),
    body('password', 'Password has to be valid.')
      .isLength({ min: 5 })
      .isAlphanumeric()
      .trim()
  ],
  authController.postLogin
);

router.get('/signup', authController.getSignup);
router.post(
    '/signup', 
    [
        check('email')
            .isEmail()
            .withMessage('Please enter valid E-Mail.')
            .custom((value, {req}) => {
                // if(value === 'kinnar.tandel@gmail.com') {
                //     throw new Error('This E-Mail address is forbidden');
                // }

                // return true;

                return User.findOne({email: value})
                    .then(userDoc => {
                        if(userDoc) {

                            return Promise.reject('E-Mail exists already!');
                            //req.flash('error', 'E-Mail exists already!')
                            //return res.redirect('/signup');
                        } 
                })
            })
            .normalizeEmail(),

        body('password', 'Please enter password with number and text and at least 5 characters.')
            .isLength({min: 5})
            .isAlphanumeric()
            .trim(),

        body('confirmPassword')
        .trim()
        .custom((value, {req}) => {
            if(value !== req.body.password) {
                throw new Error('password and confirm password do not match.');
            }
            return true;
        })
    ],
    authController.postSignup
);

router.post('/logout', authController.postLogout);

router.get('/reset', authController.getReset);
router.post('/reset', authController.postReset);

router.get('/reset/:token', authController.getNewPassword);
router.post('/new-password', authController.postNewPassword);

module.exports = router;