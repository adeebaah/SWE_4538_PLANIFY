const express = require("express");
const router = express.Router();
const path = require('path');
const { uploadUserProfileImage } = require("../middlewares/image.middleware");
const ensureAuthenticated = require('../middlewares/auth.middleware');

const {
  getLogin,
  getRegister,
  postLogin,
  postRegister,
  getForgotPassword,
  postForgotPassword,
  getResetPassword,
  postResetPassword,
  getProfile,
  postProfileImage,
  updateProfile,
  getProfileInfos,
  deleteProfile,
  // updateProfile,
  // getProfileInfos,
  // deleteProfile
} = require("../controllers/auth.controllers");

// Existing routes
router.get("/login", getLogin);
router.post("/login", postLogin);
router.get("/register", getRegister);
router.post("/register", postRegister);

// router.get("/logout", (req, res) => {
//   req.logout((err) => {
//     if (err) {
//       res.json({ error: err });
//     } else res.redirect("/");
//   });
// });

// router.get('/logout', (req, res) => {
//   req.logout(); // Passport's logout function to remove the user from the session
//   res.redirect('/login'); // Redirect to login page after logout
// });

router.get('/logout', (req, res) => {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/login');
  });
});


router.patch("/update-profile", ensureAuthenticated, updateProfile);

// Get a list of user profiles
router.get("/profiles", ensureAuthenticated, getProfileInfos);

// Delete a user's profile
router.delete("/delete-profile/:id", ensureAuthenticated, deleteProfile);


router.get("/forgot-password", getForgotPassword);
router.post("/request-reset-password", postForgotPassword);

router.get("/reset-password/:token", getResetPassword);
router.post("/reset-password/:token", postResetPassword);

// New route for profile page

router.get("/profile", ensureAuthenticated, getProfile);

// New route for uploading profile image
router.post("/profile/image", ensureAuthenticated, uploadUserProfileImage.single('profile_image'), postProfileImage);

module.exports = router;
