const express = require("express");
const router = express.Router() //helps to find routes
const {body, validationResult} = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authenticateToken = require('../../middleware/auth');
const User = require('../../models/User');

//API to create user
router.post(
    '/',
    [
        //validation
        body('fname', 'fname is required').notEmpty(),
        body('lname', 'lname is required').notEmpty(),
        body('email', 'Please enter a valid email').notEmpty().isEmail(),
        body('age', 'age is required').optional().isNumeric(),
        body('password', 'Please enter a password with 6 or more characters').isLength({min: 6}),
        body('type','Type is required').notEmpty(),
        body('type','Type must be admin or customer').isIn(['admin','customer'])
    ],
    async (req, res) => {
        try {
          const errors = validationResult(req)
          if(!errors.isEmpty()){
            return res.status(400).json({errors: errors.array()})
          }
          const salt = await bcrypt.genSalt(10)
          const hash = await bcrypt.hash(req.body.password, salt)
          const password = hash
          const userObj = {
            fname: req.body.fname,
            lname: req.body.lname,
            email: req.body.email,
            age: req.body.age,
            password: password,
            type: req.body.type
          }
          const user = new User(userObj)
          await user.save();
          res.status(201).json(user);
        } catch (error) {
          console.error(error);
          res.status(500).json({ message: "Something is wrong" });
        }
      }
);

//API to user login
router.post(
    '/login',
    [
        body('type','Type is required').notEmpty(),
        body('type','Type must be email or refresh').isIn(['email','refresh'])
    ],
     async (req, res) => {
    try {
        const errors = validationResult(req);
          if(!errors.isEmpty()){
            return res.status(400).json({errors: errors.array()})
          }
        const {email, password, type, refreshToken} = req.body
      
        if(type == 'email'){
          await handleEmailLogin(email, res, password);
        }else{
          handleRefreshLogin(refreshToken, res);
        }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Something is wrong" });
    }
  });

//API to Get a user profile using accessToken
router.get('/profile', authenticateToken, async (req, res) =>{
    try {
      const id = req.user.id; //used 'user' instead of 'params'
      const user = await User.findById(id);
      if (user) {
        res.json(user);
      } else {
        res.status(404).json({ message: "User not found" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Something is wrong" });
    }
  });

  //API to get users
router.get('/', async (req, res) => {
    try {
      const users = await User.find({});
      res.json(users);
    } catch (error) {
      res.status(404).json({ message: "User not found" });
    }
  });
  
  //API to get users by id
  router.get('/:id', async (req, res) => {
    try {
      const id = req.params.id;
      const user = await User.findById(id);
      if (user) {
        res.json(user);
      } else {
        res.status(404).json({ message: "User not found" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Something is wrong" });
    }
  });
  
  //API to edit user info
  router.put("/:id", async (req, res) => {
    try {
      //keeping the hash password in database after edit also.
      const salt = await bcrypt.genSalt(10)
      const hash = await bcrypt.hash(req.body.password, salt)
      const password = hash
      const id = req.params.id;
      const body = req.body;
      const user = await User.findByIdAndUpdate(id, body, { new: true });
      if (user) {
        user.password = password
        res.json(user);
        user.save()
      } else {
        res.status(404).json({ message: "User not found" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Something is wrong" });
    }
  });
  //require('crypto').randomBytes(64).toString('hex')
  //API to delete user
  router.delete("/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const user = await User.findByIdAndDelete(id);
      if (user) {
        res.json(user);
      } else {
        res.status(404).json({ message: "User not found" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Something is wrong" });
    }
  });

module.exports = router

function handleRefreshLogin(refreshToken, res) {
    if (!refreshToken) {
      res.status(401).json({ message: 'refreshToken is not defined' });
    } else {
      jwt.verify(refreshToken, process.env.JWT_SECRET, async (err, payload) => {
        if (err) {
          res.status(401).json({ message: 'Unauthorized' });
        } else {
          const id = payload.id;
          const user = await User.findById(id);
          if (!user) { //if user is not found
            res.status(401).json({ message: 'Unauthorized' });
          } else { //if user is found
            getUserTokens(user, res);
          }
        }
      });
    }
  }
  
  async function handleEmailLogin(email, res, password) {
    const user = await User.findOne({ email: email });
    //Checking if user email is valid
    if (!user) {
      res.status(401).json({ message: "User not found" });
    } else {
      //Checking if user password is valid
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        res.status(401).json({ message: "Wrong Password!" });
      } else {
        getUserTokens(user, res);
      }
    }
  }
  
  function getUserTokens(user, res) {
    const accessToken = jwt.sign({ email: user.email, id: user._id, type: user.type }, process.env.JWT_SECRET, { expiresIn: '5m' });
    const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '10m' });
    const userObj = user.toJSON();
    userObj['accessToken'] = accessToken;
    userObj['refreshToken'] = refreshToken;
    res.status(200).json(userObj);
  }
  
  