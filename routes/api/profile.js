// import
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");

// load profile model
const Profile = require("../../models/Profile");

// load user model
const profile = require("../../models/User");

// router.get("/test", (req, res) => res.json({ msg: "Profile Works" }));

// route    GET /api/profile/
// des      get the current user profile
// access   private
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    errors = {};
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        if (!profile) {
          errors.noprofile = "No profile for this user!";
          res.status(404).json(errors);
        }
        res.json(profile);
      })
      .catch(err => {
        res.status(404).json(err);
      });
    //   .catch(err => res.status(404).json(err));
  }
);

// route    POST /api/profile/
// des      get the current user profile
// access   private
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    //   get the fields
    const profileFields = {};
    if (req.body.handle) profileFields.handle = req.body.handle;
    if (req.body.company) profileFields.company = req.body.company;
    if (req.body.website) profileFields.handle = req.body.handle;
    if (req.body.location) profileFields.handle = req.body.handle;
    if (req.body.bio) profileFields.handle = req.body.handle;
    if (req.body.status) profileFields.handle = req.body.handle;
    if (req.body.githubusername) profileFields.handle = req.body.handle;
    if (req.body.handle) profileFields.handle = req.body.handle;
    if (req.body.handle) profileFields.handle = req.body.handle;
    if (req.body.handle) profileFields.handle = req.body.handle;
  }
);
module.exports = router;
