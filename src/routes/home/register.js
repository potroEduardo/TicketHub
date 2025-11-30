import express from 'express';
import User from '../../models/user';

const router = express.Router();

router.use(
  ['/register', '/student-register', '/staff-register'], (req, res, next) => {
    res.locals.options.page = 'register';
    next();
  });

//preregistro
router.get('/register', (req, res) => {
  res.render('pre-register', res.locals.options);
});

//Registro de estudiante
router.get('/student-register', (req, res) => {
  res.locals.options.register_type = 'Student';
  res.render('register', res.locals.options);
});

// Registro de Organizador
router.get('/staff-register', (req, res) => {
  res.locals.options.register_type = 'Staff';
  res.render('register', res.locals.options);
});

const checkRegisterError = async (username, email) => {
  let userNameCount = await User.count({ username });
  let emailCount = await User.count({ email });
  let err;
  if (userNameCount || emailCount) {
    if (userNameCount) {
      err = new Error('Username already exists.');
    } else {
      err = new Error('Email already exists.');
    }
    err.status = 409;
  }
  return err;
};

// request de estudiante
router.post('/student-register', async (req, res, next) => {
  const { username, email, password } = req.body;
  const userType = 'student';
  const err = await checkRegisterError(username, email);
  if (err) {
    return res.status(err.status).render('error_views/auth-error',
      { error: err.message, link: '/student-register' });
  }
  User.create({
    username, email, password, userType
  })
    .then(user => {
      req.session.username = user.username;
      res.redirect('/');
    })
    .catch(err => {
      next(err);
    });
});

// request de administrador
router.post('/staff-register', async (req, res, next) => {
  const { username, email, password } = req.body;
  const userType = 'staff';
  const err = await checkRegisterError(username, email);
  if (err) {
    return res.status(err.status).render('error_views/auth-error',
      { error: err.message, link: '/staff-register' });
  }
  User.create({
    username, email, password, userType
  })
    .then(user => {
      req.session.username = user.username;
      res.redirect('/');
    })
    .catch(err => {
      next(err);
    });
});


export default router;