const express = require('express');
const router = express.Router();
const db = require('../models');

router.post('/', async (req, res, next) => { // POST /api/post
  try {
    console.log(req.user);
    const hashtags = req.body.content.match(/#[^\s]+/g);
    const newPost = await db.Post.create({
      content: req.body.content, 
      UserId: req.user.id,
    });
    if (hashtags) {
      const result = await Promise.all(hashtags.map(tag => db.Hashtag.findOrCreate({
        where: { name: tag.slice(1).toLowerCase() },
      })));
      await newPost.addHashtags(result.map(r => r[0]));
    }
    // const User = await newPost.getUser();
    // newPost.User = User;
    // res.json(newPost);
    const fullPost = await db.Post.findOne({
      where: { id: newPost.id },
      include: [{
        model: db.User,
      }],
    });
    res.json(fullPost);
  } catch (e) {
    console.error(e);
    next(e);
  }
});

router.post('/images', (req, res) => {

});

router.get('/:id/comments', async (req, res, next) => {

});

router.post('/:id/comment', async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).send('you need to login');
    }
    const post = await db.Post.findOne({where: {id: req.params.id}});
    if(!post){
      return res.status(404).send('post not exists');
    }
    const newComment = await db.Comment.create({
      PostId: post.id,
      UserId: req.user.id,
      content: req.body.content,
    });
    await post.addComment(newComment.id);
  } catch (e) {
    console.error(e);
    next(e);
  }
});

module.exports = router;