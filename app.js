
const path = require('path');
// ... rest of your imports and app configuration
const express = require("express");
const app = express();
const bodyParser = require("body-parser"); // parse the body of HTTP request
const cookieParser = require("cookie-parser"); //parse cookies that are sent with HTTP request
const session = require("express-session");
const flash = require('express-flash');
const User = require('./dataModels/User.model'); // Update the path according to your project structure
const ejs = require('ejs');
const passport = require("passport");
require("./config/passport")(passport);



app.use(flash());
app.use(session({
  secret: 'secret', // Replace 'secret' with a real secret key
  resave: false,
  saveUninitialized: false,
  cookie: {
      httpOnly: true,
      secure: false, // Set to true if using https
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));


app.use(passport.initialize());
app.use(passport.session());

//Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


const cors = require("cors");   //Cross-origin resource sharing (CORS) is a browser mechanism which
                                  //  enables controlled access to resources located outside of a given domain.
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:3001',
  credentials: true, // Allow cookies to be sent
}));

const routes = require("./routes/auth.routes");
app.use(routes);
// Inside app.js or server.js
const taskRoutes = require('./routes/task.routes');
app.use(taskRoutes);

//authentication

function isLoggedIn(req, res, next) {
  req.user ? next() : res.sendStatus(401);
}
const GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.use(new GoogleStrategy({
    clientID: '488506026380-6tpvsqjsqs8nvmv0p5a8bcjl3jh33gg5.apps.googleusercontent.com',
    clientSecret: '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',
    callbackURL: 'http://localhost:3001/google/callback' // Adjust the callback URL based on your setup
  },
  async function(request, accessToken, refreshToken, profile, done) {
    try {
        //const user = await User.findOne({ googleId: profile.id });

        const user = await User.findOne({
          $or: [
            { googleId: profile.id },
            { email: profile.emails[0].value }
          ]
        });

        if (user) {
          console.log("here")
          // User already exists, return the user
          return done(null, user);
        }

        // User doesn't exist, create a new user
        const newUser = new User({
          name: profile.displayName,
          email: profile.emails[0].value,
          googleId: profile.id,
          isOAuth: true,
          // Add other fields as needed
        });

        await newUser.save();

        return done(null, newUser);
      } catch (error) {
        return done(error);
      }
    }
));


passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
  console.log(user)
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});


app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/google/callback',
passport.authenticate( 'google', {
  successRedirect: '/protected',
  failureRedirect: '/auth/failure'
})
);

app.get('/protected', isLoggedIn, (req, res) => {
  const htmlWithScript = `
    <script>
      alert('Welcome To Planify');
      window.location.href = '/welcome'; // Change to your actual welcome page URL
    </script>
  `;
  res.send(htmlWithScript);
});

app.get('/auth/failure', (req, res) => {
  res.send('Failed to authenticate..');
});


app.use('/uploads/userProfileImages', express.static('uploads/userProfileImages'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'views')));

const ensureAuthenticated = require("./middlewares/auth.middleware");
app.get("/welcome", ensureAuthenticated, (req, res) => {
  res.sendFile(__dirname + "/views/homePage.html");
});

app.get('/update-profile', ensureAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'update-profile.html'));
});



app.get('/api/user/profile', ensureAuthenticated, async (req, res) => {
  try {
      const user = await User.findById(req.user.id).select('-password');
      res.json({
          id: user._id,
          name: user.name,
          email: user.email,
          profile_image: user.profile_image
      });
  } catch (error) {
      res.status(500).send(error.message);
  }
});

app.get('/api/user/profile-data', ensureAuthenticated, async (req, res) => {
  try {
      const user = await User.findById(req.user.id).select('-password');
      res.json({
          id: user._id,
          name: user.name,
          email: user.email,
          profile_image: user.profile_image
      });
  } catch (error) {
      res.status(500).send(error.message);
  }
});


app.set('views', path.join(__dirname, 'views'));


// Make sure this directory exists and matches where multer is storing the files
app.use('/uploads/userProfileImages', express.static(path.join(__dirname, 'uploads', 'userProfileImages')));


//Connect to DB
const mongoose = require("mongoose");
const Task = require('./dataModels/Task.model');
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to Database!");
  })
  .catch((error) => {
    console.log(error);
  });


module.exports = app;
