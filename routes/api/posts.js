// imports
const express = require("express");
const mongoose = require('mongoose');
const passport = require('passport');

// router
const router = express.Router();

//models
const Post = require('../../models/Post');
const Profile = require('../../models/Profile');


// validators
const validatePostInput = require('../../validation/post');

// route    GET /api/post/test
// des      test posts
// access   public
router.get("/test", (req, res) => res.json({ msg: "Posts Works" }));


// @route    POST /api/post/
// @des      create post
// @access   private
router.post('/', passport.authenticate('jwt', {session:false}), (req,res)=>{
    const {errors, isValid} = validatePostInput(req.body);
    if(!isValid){
        return res.status(400).json(errors);
    }
    const newPost = new Post({
        text: req.body.text,
        name: req.body.name,
        avatar: req.body.avatar,
        user: req.user.id
    });
    newPost.save().then(post=>res.json(post));
});

// @route    GET /api/post/:id
// @des      get post by id
// @access   public
router.get('/:id', (req,res)=>{
    Post.findById({_id:req.params.id})
    .then(post=>res.json(post))
    .catch(err=>res.status(404).json({msg: "No post found"}));
});


// @route    GET /api/post/
// @des      get post
// @access   public
router.get('/', (req,res)=>{
    Post.find()
    .sort({date:-1})
    .then(posts=>res.json(posts))
    .catch(err=>res.status(404).json({msf: "No post found!"}));
});

// @route    DELETE /api/post/:id
// @des      delete post
// @access   private
router.get('/:id',passport.authenticate('jwt', {session: false}), (req,res)=>{
    Profile.findOne({user: req.user.id}).then(profile=>{
        Post.findById(req.params.id).then(post=>{
            if(post.user.toString() !== req.user.id){
                return res.status(401).json({notAuthorized: "Not Authorized!"});
            }
            post.remove().then(()=>res.json({success: true}));
        }).catch(err=>res.status(404).json({postnotfound: "Post not found!"}));
    }).catch(err=> res.status(404).json({usernotfound: "User not found!"}));
});

// @route    POST /api/post/like/:id
// @des      like post
// @access   private
router.post('/like/:id',passport.authenticate('jwt', {session: false}), (req,res)=>{
    Profile.findOne({user: req.user.id}).then(profile=>{
        Post.findById(req.params.id).then(post=>{
            if(post.likes.filter(like=> like.user.toString()===req.user.id).length > 0){
                return res.status(400).json({liked: "User already liked this post!"});
            }
            post.likes.unshift({user: req.user.id});
            post.save().then(post=>res.json(post));
        }).catch(err=>res.status(404).json({postnotfound: "Post not found!"}));
    }).catch(err=> res.status(404).json({usernotfound: "User not found!"}));
});

// @route    POST /api/post/unlike/:id
// @des      unlike post
// @access   private
router.post('/unlike/:id',passport.authenticate('jwt', {session: false}), (req,res)=>{
    Profile.findOne({user: req.user.id}).then(profile=>{
        Post.findById(req.params.id).then(post=>{
            if(post.likes.filter(like=> like.user.toString()===req.user.id).length === 0){
                return res.status(400).json({notliked: "You have not yet like this one!"});
            }
            // get removed index
            const removedIndex = post.likes.map(item=> item.user.toString()).indexOf(req.user.id);

            // splice out of array
            post.likes.splice(removedIndex,1);

            // save post
            post.save().then(post=> res.json(post));
        }).catch(err=>res.status(404).json({postnotfound: "Post not found!"}));
    }).catch(err=> res.status(404).json({usernotfound: "User not found!"}));
});

// @route    POST /api/posts/comment/:id
// @des      add comment to post
// @access   private
router.post('/comment/:id', passport.authenticate('jwt', {session:false}), (req,res)=>{
    const {errors,isValid} = validatePostInput(req.body);
    if(!isValid){
        return res.status(400).json(errors);
    }
    Post.findById(req.params.id)
        .then(post=>{
            const newComment = {
                text: req.body.text,
                name: req.body.name,
                avatar: req.body.avatar,
                user: req.user.id,
            }
            post.comments.unshift(newComment);

            post.save().then(post=>res.json(post));
        }).catch(err=> res.status(404).json({postnotfound: "Post not found!"}));
})


// @route    DELETE /api/posts/comment/:id/:comment_id
// @des      remove comment from post
// @access   private
router.delete('/comment/:id/:comment_id', passport.authenticate('jwt', {session:false}), (req,res)=>{
    Post.findById(req.params.id)
        .then(post=>{
            // check if comment exist
            if(post.comments.filter(comment=>comment._id.toString() !== req.params.comment_id).length === 0){
                return res.status(404).json({commentnotexist: "Comment doesn't exist!"});
            }
            // removeindex
            const removeIndex = post.comments.map(comment=> comment._id.toString()).indexOf(req.params.comment_id);

            post.comments.splice(removeIndex,1);
            post.save().then(post=>res.json(post));
        }).catch(err=> res.status(404).json({postnotfound: "Post not found!"}));
})






module.exports = router;
