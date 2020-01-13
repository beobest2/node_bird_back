const express = require('express');
const db = require('../models');
const bcrypt = require('bcrypt');
const passport = require('passport');

const router = express.Router();

router.get('/', (req, res) => { // 회원 정보 가져오기
  console.log(1);
  if (!req.user) {
    return res.status(401).send('you need to login');
  }
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

router.get('/:id', (req, res) => {
  console.log(2);
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

router.get('/:id/posts', (req, res) => {

});

module.exports = router;