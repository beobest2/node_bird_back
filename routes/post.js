const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const db = require('../models');
const { isLoggedIn } = require('./middleware');

const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, done) {
      done(null, 'uploads')
    },
    filename(req, file, done) {
      const ext = path.extname(file.originalname);
      const basename = path.basename(file.originalname, ext);
      done(null, basename + new Date().valueOf() + ext);
    },
  }),
  limits: {fileSize: 20 * 1024 * 1024 },
});

router.post('/', isLoggedIn, upload.none(), async (req, res, next) => { // POST /api/post
  try {
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
    if (req.body.image) {
      if (Array.isArray(req.body.image)) {
        const images = await Promise.all(req.body.image.map((image)=>{
          return db.Image.create({src: image});
        }));
        await newPost.addImages(images);
      } else {
        const image = await db.Image.create({src: req.body.image});
        await newPost.addImage(image);
      }
    }
    // const User = await newPost.getUser();
    // newPost.User = User;
    // res.json(newPost);
    const fullPost = await db.Post.findOne({
      where: { id: newPost.id },
      include: [{
        model: db.User,
      }, {
        model: db.Image,
      }],
    });
    res.json(fullPost);
  } catch (e) {
    console.error(e);
    next(e);
  }
});

router.post('/images', upload.array('image'), (req, res) => {
  console.log(req.files.map(v => v.filename));
  res.json(req.files.map(v => v.filename));
});

router.get('/:id/comments', async (req, res, next) => {
  try {
    const post = await db.Post.findOne({where: {id: req.params.id}});
    if (!post) {
      return res.status(404).send('post not exists');
    }
    const comments = await db.Comment.findAll({
      where: {
        PostId: req.params.id,
      },
      order: [['createdAt', 'ASC']],
      include: [{
        model: db.User,
        attributes: ['id', 'nickname'],
      }],
    });
    res.json(comments);
  } catch (e) {
    console.error(e);
    next(e);
  }

});

router.post('/:id/comment', isLoggedIn, async (req, res, next) => {
  try {
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
    const comment = await db.Comment.findOne({
      where: {
        id: newComment.id,
      },
      include: [{
        model: db.User,
        attributes: ['id', 'nickname'],
      }],
    });
    return res.json(comment);
  } catch (e) {
    console.error(e);
    next(e);
  }
});

router.post('/:id/like', isLoggedIn, async (req, res, next) => {
  try {
    const post = await db.Post.findOne({where: {id: req.params.id}});
    if(!post) {
      return res.status(404).send('post not exists');
    }
    await post.addLiker(req.user.id);
    res.json({userId: req.user.id});
  } catch (e) {
    next(e);
  }
});

router.delete('/:id/like', isLoggedIn, async (req, res, next) => {
  try {
    const post = await db.Post.findOne({where: {id: req.params.id}});
    if(!post) {
      return res.status(404).send('post not exists');
    }
    await post.removeLiker(req.user.id);
    res.json({userId: req.user.id})
  } catch (e) {
    console.error(e);
    next(e);
  }
});

router.post('/:id/retweet', isLoggedIn, async (req, res, next) => {
  try {
    const post = await db.Post.findOne({where: {id: req.params.id}});
    if (!post) {
      return res.status(404).send('post not exists');
    }
    if (req.user.id === post.UserId) {
      return res.status(403).send('cannot retweet your post');
    }
    const retweetTargetId = post.RetweetId || post.id;
    const exPost = await db.Post.findOne({
      where: {
        UserId: req.user.id,
        RetweetId: retweetTargetId,
      },
    });
    if (exPost) {
      return res.status(403).send('already retweet');
    }
    const retweet = await db.Post.create({
      UserId: req.user.id,
      RetweetId: retweetTargetId,
      content: 'retweet!!',
    });
    const retweetWIthPrevPost = await db.Post.findOne({
      where: {id: retweet.id},
      include: [{
        model: db.User,
      }, {
        model: db.Post,
        as: 'Retweet',
        include: [{
          model: db.User,
          attributes: ['id', 'nickname'],
        }, {
          model: db.Image,
        }],
      }],
    });
    res.json(retweetWIthPrevPost);
  } catch (e) {
    console.error(e);
    next(e);
  }
})

module.exports = router;