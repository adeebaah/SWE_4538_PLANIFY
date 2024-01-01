require('dotenv').config({ debug: true });
const fs = require('fs');

const User = require("../dataModels/User.model");
const path = require("path");
const bcrypt = require("bcrypt");
const passport = require("passport");
const crypto = require('crypto');
const nodemailer = require('nodemailer');


// const users = []; // store the user info here

// const initializePassport = require("../config/passport");
// initializePassport(
//   passport, 
//   email => users.find(user => user.email === email),
//   id => users.find(user => user.id === id)
//   );

const getLogin = async (req, res) => {
  const filePath = path.join(__dirname, "..", "views", "login.html");
  res.sendFile(filePath);
};

const postLogin = (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/welcome",
    failureRedirect: "/login",
    failureFlash: true,
  })(req, res, next);
};


const getRegister = async (req, res) => {
  const filePath = path.join(__dirname, "..", "views", "register.html");
  res.sendFile(filePath);
};

const postRegister = async (req, res, next) => {
  // try {
  //   const hashedPassword = await bcrypt.hash(req.body.password, 10); // req.body.password ==> password should be exact match to register.html name=password,  10:how many time you want to generate hash. it's a standard default value
  //   users.push({
  //     id: Date.now().toString(),
  //     name: req.body.username ,
  //     email: req.body.email,
  //     password: hashedPassword,
  //   });

  //   res.redirect("/login");
  // } catch{
  //   res.redirect("/register");
  // }
  // console.log(users); // show the user list

  const {  email, password } = req.body;
const name= req.body.username

  console.log(name)
  console.log(email)
  console.log(password)

const errors=[]
if (!name || !email || !password ) {
  errors.push("All fields are required!");
}

if (errors.length > 0) {
  res.status(400).json({ error: errors });
} else {
  //Create New User
  User.findOne({ email: email }).then((user) => {
    if (user) {
      errors.push("User already exists with this email!");
      res.status(400).json({ error: errors });
    } else {
      bcrypt.genSalt(10, (err, salt) => {
        if (err) {
          errors.push(err);
          res.status(400).json({ error: errors });
        } else {
          bcrypt.hash(password, salt, (err, hash) => {
            if (err) {
              errors.push(err);
              res.status(400).json({ error: errors });
            } else {
              const newUser = new User({
                name,
                email,
                password: hash,
              });
              newUser
                .save()
                .then(() => {
                  res.redirect("/login");
                })
                .catch(() => {
                  errors.push("Please try again");
                  res.status(400).json({ error: errors });
                });
            }
          });
        }
      });
    }
  });
}
};

// Reset password
console.log(process.env.EMAIL_HOST); // Should output 'smtp.gmail.com'
console.log(process.env.EMAIL_PORT); // Should output '465'
console.log(process.env.EMAIL_SECURE); // Should output 'true'


const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT, 10),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD
  }
});


//**** */
const getForgotPassword = (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'forgot-password.html'));
};

const postForgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const user = await User.findOne({ email: email });
  if (!user) {
    return res.status(400).json({ error: 'User not found' });
  }

  const token = crypto.randomBytes(20).toString('hex'); // Generate a hexadecimal token

  user.resetPasswordToken = token;
  user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

  await user.save();
  console.log('Generated token:', token); 

  //const resetLink = `http://${req.headers.host}/reset-password/${token}`;
  const mailOptions = {
    to: user.email,
    subject: 'Password Reset',
    text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          `http://${req.headers.host}/reset-password/${token}\n\n` + // Use backticks and ${token}
          'If you did not request this, please ignore this email and your password will remain unchanged.\n',
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error); // This will log the complete error
      return res.status(500).json({ error: 'Error sending email', details: error.toString() });
    }
    res.status(200).json({ message: 'Email sent', info: info.response });
  });
};



const getResetPassword = async (req, res) => {
  const { token } = req.params;

  // Load the HTML file from the disk
  let htmlContent = fs.readFileSync(path.join(__dirname, '..', 'views', 'reset-password.html'), 'utf8');

  // Replace the placeholder with the actual token value
  htmlContent = htmlContent.replace('{{token}}', token);

  // Send the modified content
  res.send(htmlContent);
};





const postResetPassword = async (req, res) => {
  const { token } = req.params;

  const { password } = req.body;

  console.log('Received token:', token); // Log the token received from the URL
  console.log('Received password:', password);

  try {
    // Find the user with the provided token and valid expiration
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    console.log('User found:', user); 

    if (!user) {
      console.error('Password reset token is invalid or has expired');
      return res.status(400).json({ error: 'Password reset token is invalid or has expired' });
    }

    // Hash the new password and update the user's password
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({ message: 'Password has been updated' });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};


const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('-password');
    // Serve the profile.html page instead of sending JSON
    res.sendFile(path.join(__dirname, '..', 'views', 'profile.html')); // Make sure the path is correct
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const postProfileImage = async (req, res) => {
  try {
    const userId = req.user.id; // Based on your session management

    const user = await User.findById(userId);
    if (req.file) {
      // Save the correct path for the uploaded image
      // The path should be relative to where you're serving static files from
      user.profile_image = req.file.filename; // Just save the filename if you're serving static files correctly
      await user.save();
      res.redirect('/profile'); // Redirect to the profile page
    } else {
      throw new Error('File upload unsuccessful.');
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// const updateProfile = async (req, res) => {
//   try {
//     const userId = req.user.id; // Extract user ID from the authenticated user
//     const { name, email, password } = req.body;

//     // Find and update the user's profile in the database
//     const user = await User.findByIdAndUpdate(
//       userId,
//       { name, email, password },
//       { new: true } // Return the updated user object
//     );

//     if (!user) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     // Exclude sensitive information (e.g., password) from the response
//     const userProfile = {
//       id: user._id,
//       name: user.name,
//       email: user.email,
//       profession: user.profession,
//       hobby: user.hobby,
//       profile_image: user.profile_image,
//     };

//     res.json(userProfile);
//   } catch (error) {
//     console.error("Error:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };



const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id; // Extract user ID from the authenticated user
    const { name, email, password } = req.body;

    // Create an object to store the updated fields
    const updatedFields = {};

    // Only update fields with non-empty values
    if (name) {
      updatedFields.name = name;
    }
    if (email) {
      updatedFields.email = email;
    }
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updatedFields.password = hashedPassword;
    }

    // Find and update the user's profile in the database
    const user = await User.findByIdAndUpdate(
      userId,
      updatedFields,
      { new: true } // Return the updated user object
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Exclude sensitive information (e.g., password) from the response
    const userProfile = {
      id: user._id,
      name: user.name,
      email: user.email,
      profession: user.profession,
      hobby: user.hobby,
      profile_image: user.profile_image,
    };

    res.json(userProfile);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get a list of user profiles
const getProfileInfos = async (req, res) => {
  try {
    // Retrieve user profiles from the database
    const users = await User.find().select("-password");

    // Exclude sensitive information (e.g., password) from each profile
    const profiles = users.map((user) => ({
      id: user._id,
      name: user.name,
      email: user.email,
      profession: user.profession,
      hobby: user.hobby,
      profile_image: user.profile_image,
    }));

    res.json(profiles);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete a user's profile
const deleteProfile = async (req, res) => {
  try {
    const profileId = req.params.id;

    // Find and delete the user's profile in the database
    const deletedProfile = await User.findByIdAndDelete(profileId);

    if (!deletedProfile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    res.json({ message: "Profile deleted successfully" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};




module.exports = {
  getLogin,
  getRegister,
  postLogin,
  postRegister,
  updateProfile,
  getProfileInfos,
  deleteProfile,

  // getProfileInfos,
  // updateProfile,
  // deleteProfile,
  getForgotPassword,
  postForgotPassword,
  getResetPassword,
  postResetPassword,
  getProfile,
  postProfileImage
};
