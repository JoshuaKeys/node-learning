const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { body, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');

// @route POST api/users
// @desc Register User
// @access Public

router.post(
  '/',
  [
    auth,
    body('firstName').isString().not().isEmpty(),
    body('lastName').isString(),
    body('email')
      .isEmail()
      .custom(async (value, { req }) => {
        const user = await User.findOne({ email: req.body.email });
        if (user) {
          return Promise.reject('Email already in use');
        }
        return user;
      }),
    body('password')
      .isString()
      .isLength({ min: 6 })
      .withMessage('Please enter a password with 6 or more characters'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    const { firstName, lastName, email, password } = req.body;
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = new User({
      firstName,
      lastName,
      email,
      password,
    });

    // Encrypt the password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    const payload = {
      user: {
        id: user.id,
      },
    };
    jwt.sign(
      payload,
      config.get('jwtSecret'),
      {
        expiresIn: 360000,
      },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  }
);

router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});
module.exports = router;
