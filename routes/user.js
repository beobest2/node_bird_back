const express = require('express');
const db = require('../models');
const bcrypt = require('bcrypt');
const passport = require('passport');
const { isLoggedIn } = require('./middleware');

const router = express.Router();

router.get('/', isLoggedIn, (req, res) => { // 회원 정보 가져오기
  const user = Object.assign({}, req.user.toJSON());
  delete user.password;
  return res.json(user);
});

router.post('/', async (req, res, next) => { // 회원 가입
  try {
    const exUser = await db.User.findOne({
      where: {
        userId: req.body.userId,
      }
    });
    if (exUser) {
      return res.status(403).send('id already use');
    } 
    const hashedPassword = await bcrypt.hash(req.body.password, 12); //salt 는 10 ~ 13 사이
    const newUser = await db.User.create({
      nickname: req.body.nickname,
      userId: req.body.userId,
      password: hashedPassword
    });
    console.log(newUser);
    return res.status(200).json(newUser);
  } catch (e) {
    console.error(e);
    // return res.status(403).send(e);
    return next(e);
  }
});

router.get('/:id', async (req, res, next) => { // 남의 정보 가져오는 것
  try {
    const result = await db.User.findOne({
      where: {id: parseInt(req.params.id, 10)},
      include: [{
        model: db.Post,
        as: 'Posts',
        attributes: ['id']
      },{
        model: db.User,
        as: 'Followings',
        attributes: ['id']
      },{
        model: db.User,
        as: 'Followers',
        attributes: ['id']
      }],
      attributes: ['id', 'nickname'],
    });
    const jsonUser = result.toJSON();
    jsonUser.Posts = jsonUser.Posts ? jsonUser.Posts.length : 0;
    jsonUser.Followings = jsonUser.Followings ? jsonUser.Followings.length : 0;
    jsonUser.Followers = jsonUser.Followers ? jsonUser.Followers.length : 0;
    res.json(jsonUser);
  } catch (e) {
    console.error(e);
    next(e);
  }
});

router.post('/logout', (req, res) => {
  req.logout();
  req.session.destroy();
  res.send('logout success');
});

router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      console.error(err);
      next(err);
    }
    if (info) {
      return res.status(401).send(info.reason);
    }
    return req.login(user, async (loginErr) => {
      if(loginErr) {
        return next(loginErr);
      }
      const fullUser = await db.User.findOne({
        where: {id: user.id},
        include: [{
          model: db.Post,
          as: 'Posts',
          attributes: ['id'],
        }, {
          model: db.User,
          as: 'Followings',
          attributes: ['id'],
        }, {
          model: db.User,
          as: 'Followers',
          attributes: ['id'],
        }],
        attributes: ['id', 'nickname', 'userId'],
      })
      console.log(fullUser);
      return res.json(fullUser);
    });
  })(req, res, next);
});

router.get('/:id/follow', (req, res) => { 

});

router.post('/:id/follow', (req, res) => { 

});

router.delete('/:id/follow', (req, res) => { 

});

router.get('/:id/posts', async (req, res, next) => {
  try {
      const posts = await db.Post.findAll({
        where: {
          UserId: parseInt(req.params.id, 10),
          RetweetId: null,
        }, include: [{
          model: db.User,
          attributes: ['id', 'nickname'],
        },{
          model: db.Image,
        },{
          model: db.User,
          through: 'Like',
          as: 'Likers',
          attributes: ['id'],
        }],
    });
    res.json(posts);
  } catch(e){
    console.error(e);
    next(e);
  }
});

module.exports = router;