// const GoogleStrategy = require('passport-google-oauth2').Strategy;
// const passport = require('passport');
// // const User = require("../dataModels/User.model");
// const User = require("./dataModels/User.model");


// const GOOGLE_CLIENT_ID = '700876182200-43app2h94ulhjdapi1ge8mo84pn8cdin.apps.googleusercontent.com';
// const GOOGLE_CLIENT_SECRET = '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';

// function initialize (passport) {

// passport.use(new GoogleStrategy({
//     clientID:     GOOGLE_CLIENT_ID,
//     clientSecret: GOOGLE_CLIENT_SECRET,
//     callbackURL: "http://localhost:3001/google/callback",
//     passReqToCallback   : true,
//     scope: ['email', 'profile'],
//   },
//   async function(request, accessToken, refreshToken, profile, done) {
//     try {
//         const user = await User.findOne({ googleId: profile.id });

//         if (user) {
//           console.log("here")
//           // User already exists, return the user
//           return done(null, user);
//         }

//         // User doesn't exist, create a new user
//         const newUser = new User({
//           name: profile.displayName,
//           email: profile.emails[0].value,
//           googleId: profile.id,
//           // Add other fields as needed
//         });

//         await newUser.save();

//         return done(null, newUser);
//       } catch (error) {
//         return done(error);
//       }
//     }
// ));

// passport.serializeUser((user, done) =>{
//     done(null, user.id)
//   })

//   passport.deserializeUser(async (id, done) => {
//     try {
//       const user = await User.findById(id);
//     console.log(user)
//       done(null, user);
//     } catch (err) {
//       done(err, null);
//     }
//   });
// }


// module.exports = initialize