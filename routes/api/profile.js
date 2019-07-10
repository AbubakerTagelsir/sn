// import
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");

// load profile model
const Profile = require("../../models/Profile");

// load user model
const User = require("../../models/User");

// router.get("/test", (req, res) => res.json({ msg: "Profile Works" }));

// validator
const validateProfileInput = require('../../validation/profile');
const validateExperienceInput = require('../../validation/experience');
const validateEducationInput = require('../../validation/education');

// route    GET /api/profile/
// des      get the current user profile
// access   private
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    errors = {};
    Profile.findOne({ user: req.user.id })
      .populate('user', ['name', 'avatar'])
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

// route    GET /api/profile/handle/:handle
// des      get profile by handle
// access   public
router.get('/handle/:handle', (req,res)=>{
  const errors = {}
  Profile.findOne({handle:req.params.handle})
    .populate('user',['name', 'avatar'])
    .then(profile=>{
      if(!profile){
        errors.noprofile = "There's no profile for this handle!"
        res.status(404).json(errors);
      }
      res.json(profile)
    }).catch(err=> res.status(404).json(err));
});

// route    GET /api/profile/all
// des      get all profile
// access   public
router.get('/all', (req,res)=>{
  const errors = {}
  Profile.find()
    .populate('user',['name', 'avatar'])
    .then(profiles=>{
      if(!profiles){
        errors.noprofile = "No Profiles found!"
        res.status(404).json(errors);
      }
      res.json(profiles)
    }).catch(err=> res.status(404).json(err));
});


// route    GET /api/profile/user/:user_id
// des      get profile by user_id
// access   public
router.get('/user/:user_id', (req,res)=>{
  const errors = {}
  Profile.findOne({user:req.params.user_id})
    .populate('user',['name', 'avatar'])
    .then(profile=>{
      if(!profile){
        errors.noprofile = "There's no profile for this handle!"
        res.status(404).json(errors);
      }
      res.json(profile)
    }).catch(err=> res.status(404).json(err));
});




// route    POST /api/profile/
// des      create user profile
// access   private
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const {errors, isValid} = validateProfileInput(req.body);

    // check validation
    if(!isValid){
      return res.status(400).json(errors);
    }
    //   get the fields
    const profileFields = {};
    profileFields.user = req.user.id;
    if (req.body.handle) profileFields.handle = req.body.handle;
    if (req.body.company) profileFields.company = req.body.company;
    if (req.body.website) profileFields.website = req.body.website;
    if (req.body.location) profileFields.location = req.body.location;
    if (req.body.bio) profileFields.bio = req.body.bio;
    if (req.body.status) profileFields.status = req.body.status;
    if (req.body.githubusername) profileFields.githubusername = req.body.githubusername;
    // skills - split into array
    if(typeof req.body.skills !== undefined){
      profileFields.skills = req.body.skills.split(',');
    }
    // social
    profileFields.social = {}

    if (req.body.youtube) profileFields.social.youtube = req.body.youtube;
    if (req.body.twitter) profileFields.social.twitter = req.body.twitter;
    if (req.body.facebook) profileFields.social.facebook = req.body.facebook;
    if (req.body.linkedin) profileFields.social.linkedin = req.body.linkedin;
    if (req.body.instagram) profileFields.social.instagram = req.body.instagram;

    console.log(req.user.id);
    Profile.findOne({user: req.user.id})
    .then(profile => {
      if(profile){
        console.log("Existing Profile");
        // update
        Profile.findOneAndUpdate(
          { user: req.user.id}, 
          {$set: profileFields}, 
          {new: true}
          )
          .populate('user', ['name', 'avatar'])
          .then(profile=> res.json(profile));
      }else{
        console.log("New Profile");
        // create

        // check handle 
        Profile.findOne({handle: profileFields.handle}).then(profile=>{
          if(profile){
            console.log("Profile Already Exist!");
            errors.handle = "This handle is already exists!";
            return res.status(400).json(errors);
          }
          console.log("Creating New Profile");
          new Profile(profileFields).save().then(profile=> res.json(profile));
        });
      }
    })
  }
);


// route    POST /api/profile/experience
// des      add experience to profile
// access   private
router.post('/experience', passport.authenticate('jwt', {session: false}), (req,res)=>{
  const {errors, isValid} = validateExperienceInput(req.body)
  if (!isValid){
    return res.status(400).json(errors);
  }
  Profile.findOne({user: req.user.id})
  .then(profile=>{
    const newExp = {
      title: req.body.title,
      company: req.body.company,
      from: req.body.from,
      to: req.body.to,
      location: req.body.location,
      current: req.body.current,
      description: req.body.description
    }
    // add to experience array
    profile.experience.unshift(newExp);
    profile.save().then(profile=> res.json(profile));
  });
});

// route    POST /api/profile/education
// des      add education to profile
// access   private
router.post('/education', passport.authenticate('jwt', {session: false}), (req,res)=>{
  const {errors, isValid} = validateEducationInput(req.body)
  if (!isValid){
    return res.status(400).json(errors);
  }
  Profile.findOne({user: req.user.id})
  .then(profile=>{
    const newEdu = {
      school: req.body.school,
      degree: req.body.degree,
      fieldOfStudy: req.body.fieldOfStudy,
      to: req.body.to,
      from: req.body.from,
      current: req.body.current,
      description: req.body.description
    }
    // add to experience array
    profile.education.unshift(newEdu);
    profile.save().then(profile=> res.json(profile));
  });
});


// route    DELETE /api/profile/experience/:exp_id
// des      delete experience from profile
// access   private
router.delete('/experience/:exp_id', passport.authenticate('jwt', {session: false}), (req,res)=>{
  Profile.findOne({user: req.user.id})
  .then(profile=>{
    // get remove index
    const removeIndex = profile.experience.map(item=> item.id).indexof(req.params.exp_id);

    // splice out of array
    profile.experience.splice(removeIndex,1);

    // add to experience array
    profile.save().then(profile=> res.json(profile));
  }).catch(err=> res.status(404).json(err));
});

// route    DELETE /api/profile/education/:edu_id
// des      delete education from profile
// access   private
router.delete('/education/:edup_id', passport.authenticate('jwt', {session: false}), (req,res)=>{
  Profile.findOne({user: req.user.id})
  .then(profile=>{
    // get remove index
    const removeIndex = profile.education.map(item=> item.id).indexof(req.params.edu_id);

    // splice out of array
    profile.education.splice(removeIndex,1);

    // add to experience array
    profile.save().then(profile=> res.json(profile));
  }).catch(err=> res.status(404).json(err));
});


// route    DELETE /api/profile
// des      delete user and profile
// access   private
router.delete('/', passport.authenticate('jwt', {session: false}), (req,res)=> {
  Profile.findOneAndRemove({user: req.user.id}).then(()=>{
    User.findOneAndRemove({_id: req.user.id}).then(()=> res.json({success: true}));
  });
});
module.exports = router;
