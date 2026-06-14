const crypto = require('crypto');
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const { validationResult } = require('express-validator');


exports.getLogin = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    errorMessage: message,
    oldInput: {
      email: '',
      password: ''
    },
    validationErrors: []
  });
};
// exports.getLogin = (req, res, next) => {
//     let message = req.flash('error');

//     if(message.length > 0) {
//         message = message[0];
//     } else {
//         message = null;
//     }

//     res.render('auth/login', {
//         path: '/login',
//         pageTitle: 'Login',
//         //isAuthenticated: false
//         errorMessage: message,
//     });
// };

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render('auth/login', {
      path: '/login',
      pageTitle: 'Login',
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email: email,
        password: password
      },
      validationErrors: errors.array()
    });
  }

  User.findOne({ email: email })
    .then(user => {
      if (!user) {
        return res.status(422).render('auth/login', {
          path: '/login',
          pageTitle: 'Login',
          errorMessage: 'Invalid email or password.',
          oldInput: {
            email: email,
            password: password
          },
          validationErrors: []
        });
      }
      bcrypt
        .compare(password, user.password)
        .then(doMatch => {
          if (doMatch) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            return req.session.save(err => {
              console.log(err);
              res.redirect('/');
            });
          }
          return res.status(422).render('auth/login', {
            path: '/login',
            pageTitle: 'Login',
            errorMessage: 'Invalid email or password.',
            oldInput: {
              email: email,
              password: password
            },
            validationErrors: []
          });
        })
        .catch(err => {
          console.log(err);
          res.redirect('/login');
        });
    })
    .catch(err => console.log(err));
};

// exports.postLogin = (req, res, next) => {
//   const email = req.body.email;
//   const password = req.body.password;

//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return res.status(422).render('auth/login', {
//         path: '/login',
//         pageTitle: 'Login',
//         errorMessage: errors.array()[0].msg,
//         oldInput: {
//             email: email,
//             password: password
//         },
//         validationErrors = errors.array()
//     });
//   }

//   User.findOne({ email: email })
//     .then(user => {
//       if (!user) {
//         req.flash('error', 'Invalid email or password.');
//         return res.redirect('/login');
//       }
//       bcrypt
//         .compare(password, user.password)
//         .then(doMatch => {
//           if (doMatch) {
//             req.session.isLoggedIn = true;
//             req.session.user = user;
//             return req.session.save(err => {
//               console.log(err);
//               res.redirect('/');
//             });
//           }
//           req.flash('error', 'Invalid email or password.');
//           res.redirect('/login');
//         })
//         .catch(err => {
//           console.log(err);
//           res.redirect('/login');
//         });
//     })
//     .catch(err => console.log(err));
// };

// exports.postLogin = (req, res, next) => {
//     const email = req.body.email;
//     const password = req.body.password;
//     User.findOne({ email: email })
//         .then(user => {
//             console.log("user ==> ", user);
//             if (!user) {
//                 req.flash('error', 'Invalid email or password.')
//                 return res.redirect('/login');
//             }
//             bcrypt
//                 .compare(password, user.password)
//                 .then(doMatch => {
//                     if (doMatch) {

//                         req.session.isLoggedIn = true;
//                         req.session.user = {
//                             _id: user._id.toString(),
//                             email: user.email,
//                             cart: user.cart
//                         };
//                         return req.session.save(err => {
//                             console.log(err);
//                             res.redirect('/');
//                         });
//                     }
//                     req.flash('error', 'Invalid email or password.')
//                     res.redirect('/login');
//                 })
//                 .catch(err => {
//                     console.log(err);
//                     req.flash('error', 'Invalid email or password.')
//                     res.redirect('/login');
//                 });
//         })
//         .catch(err => console.log(err));
// };

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    console.log(err);
    res.redirect('/');
  });
};

exports.getSignup = (req, res, next) => {

    let message = req.flash('error');

    if(message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }

    res.render('auth/signup', {
        path: '/signup',
        pageTitle: 'Signup',
        //isAuthenticated: false,
        errorMessage: message,
        oldInput: {
            email: '', 
            password: '', 
            confirmPassword: ''
        },
        validationErrors: []
    });
};

exports.postSignup = (req, res, next) => {

    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;

    const errors = validationResult(req);
    console.log("===errors====", errors)
    if(!errors.isEmpty()) {
        return res.status(422).render('auth/signup', {
            path: '/signup',
            pageTitle: 'Signup',
            //isAuthenticated: false,
            errorMessage: errors.array()[0].msg,
            oldInput: { 
                email: email, 
                password: password, 
                confirmPassword: req.body.confirmPassword
            },
            validationErrors: errors.array()
        });
    }

    // User.findOne({email: email})
    //     .then(userDoc => {
    //         if(userDoc) {
    //             req.flash('error', 'E-Mail exists already!')
    //             return res.redirect('/signup');
    //         } 

            //return 
            bcrypt.hash(password, 12)
                .then(hashedPassword => {
                    const user = new User({
                        email: email,
                        password: hashedPassword,
                        cart: {items: []}
                    });

                    return user.save()
                })
                .then(result => {
                    res.redirect('/login');

                    // return transporter.sendMail({
                    //     to: email,
                    //     from: 'shop@node-complete.com',
                    //     subject: 'Signup succeeded!',
                    //     html: '<h1>You successfully signed up!</h1>'
                    // });
                })
                .catch(err => console.error(err))
                //;
        //})
        //.catch(err => console.error(err));
};

exports.getReset = (req, res, next) => {

    let message = req.flash('error');

    if(message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }

    res.render('auth/reset', {
        path: '/rest',
        pageTitle: 'Reset password',
        //isAuthenticated: false,
        errorMessage: message,
    });
};

exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect('/reset');
    }
    const token = buffer.toString('hex');
    User.findOne({ email: req.body.email })
      .then(user => {
        if (!user) {
          req.flash('error', 'No account with that email found.');
          return res.redirect('/reset');
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;
        return user.save();
      })
      .then(result => {
        console.log("reset password link :", `http://127.0.0.1:3000/reset/${token}`)
        res.redirect('/');
        // transporter.sendMail({
        //   to: req.body.email,
        //   from: 'shop@node-complete.com',
        //   subject: 'Password reset',
        //   html: `
        //     <p>You requested a password reset</p>
        //     <p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to set a new password.</p>
        //   `
        // });
      })
      .catch(err => {
        console.log(err);
      });
  });
};


// exports.postReset = (req, res, next) => {
//     crypto.randomBytes(32, (err, buffer) => {
//         if(err) {
//             return res.redirect('/reset');
//         }
//         const token = buffer.toString('hex');
//         User.findOne({email: req.body.email})
//             .then(user => {
//                 if(!user) {
//                     req.flash('No account with this user');
//                     return res.redirect('/reset');
//                 }

//                 user.resetToken = token;
//                 user.resetTokenExpiration = Date.now() + 3600000;
//                 return user.save();
//             })
//             .then(result => {
//                 console.log('reset password link :', "http://127.0.0.1:3000/reset/${token}")
//                 res.redirect('/');
//                 // return transporter.sendMail({
//                 //     to: req.body.email,
//                 //     from: 'shop@node-complete.com',
//                 //     subject: 'Password reset!',
//                 //     html: `
//                 //     <p>You requested a password reset</p>
//                 //     <p>Click this <a href="http://127.0.0.1:3000/reset/${token}">link</a> to set new password.</p>
//                 //     `
//                 // });
//             })
//             .catch(err => console.error(err));
//     });
// };

exports.getNewPassword = (req, res, next) => {
    const token = req.params.token;
    User.findOne({resetToken: token, resetTokenExpiration: {$gt: Date.now()}})
        .then(user => {
            let message = req.flash('error');

            if(message.length > 0) {
                message = message[0];
            } else {
                message = null;
            }

            res.render('auth/new-password', {
                path: '/new-password',
                pageTitle: 'New password',
                //isAuthenticated: false,
                errorMessage: message,
                userId: user._id.toString(),
                passwordToken: token
            });
        })
        .catch(err => console.error(err));
};
exports.postNewPassword = (req, res, next) => {
    const newPassword = req.body.password;
    const userId = req.body.userId;
    const passwordToken = req.body.passwordToken;
    let resetUser;

    User.findOne({resetToken: passwordToken, resetTokenExpiration: {$gt: Date.now()}, _id: userId })
        .then(user => {
            resetUser = user;
            return bcrypt.hash(newPassword, 12)
        })
        .then(hashedPassword => {
            resetUser.password = hashedPassword;
            resetUser.resetToken = undefined;
            resetUser.resetTokenExpiration = undefined;

            return resetUser.save();
        })
        .then(result => {
            res.redirect('/login');
        })
        .catch(err => console.error(err));
};