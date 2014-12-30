var mongoose = require('mongoose');
var express = require('express');
var router = express.Router();

//these models are found in the /models folder
var Post = mongoose.model('Post');
var Commment = mongoose.model('Comment');

/* GET home page. */
router.get('/', function (req, res) {
  res.render('index', { title: 'Express' });
});

//req=request object from the client
//res=response object to send back
router.get('/posts', function (req, res, next) {
    //grab all of the posts from the mongoose model which === the mongodb schema
    Post.find(function (err, posts) {
        //if we get an error, throw it to error handler
        //not sure yet how next works, so also sending to console
        if (err) {
            console.log(err);
            return next(err);
        }
        
        //recieved all of the posts, so send them in the response as a json
        res.json(posts);
    });
});

router.post('/posts', function (req, res, next) {
    //post is going to be created with the Post mongoose model
    //this creates a new object in memory before saving it
    var post = new Post(req.body);
    
    post.save(function (err, post) {
        if (err) { return next(err); }
        //no error, so respond with the post?
        //guessing .save adds this to the database,
        //and this res throws it back to the client confirming the save?
        res.json(post);
    });
});

router.param('post', function(req, res, next, id) {
  var query = Post.findById(id);

  query.exec(function (err, post){
    if (err) { return next(err); }
    if (!post) { return next(new Error("can't find post")); }

    req.post = post;
    return next();
  });
});

router.get('/posts/:post', function (req, res) {
    req.post.populate('comments', function (err, post) {
        res.json(req.post);
    });
});


router.put('/posts/:post/upvote', function(req, res, next) {
  req.post.upvote(function(err, post){
    if (err) { return next(err); }

    res.json(post);
  });
});

router.post('/posts/:post/comments', function (req, res, next) {
    var comment = new Comment(req.body);

    comment.save(function (err, comment) {
        if (err) { return next(err); }

        req.post.comments.push(comment);
        req.post.save(function (err, post) {
            if (err) { return next(err); }
            
            res.json(comment);
        });
    });
});

module.exports = router;