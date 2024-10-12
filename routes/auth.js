const express = require("express");
const User = require("../models/User");
const router = express.Router();
const { body, validationResult } = require("express-validator");
var bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
var fetchUser = require("../middleWare/getUser");

const JWT_SECRET = "Gate$Exam@2025";
let  success=false;

//Route1: create a user using :get"/api/auth/createuser" no login required
router.post(
  "/",
  [
    body("name", "Enter a valid name").isLength({ min: 3 }),
    body("email", "Enter a valid email").isEmail(),
    body("password", "Enter a valid password").isLength({ min: 5 }),
  ],
  async (req, res) => {
    // check for validation error
    // if their are error the return bad request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({success, errors: errors.array() });
    }
    // now we will update  the User in the database
    // Extract data from the request body
    const { name, email, password } = req.body;
    try {
      // check user exist with the same email
      // User is a promise
      let user = await User.findOne({ email });
      if (user) {
        return res
          .status(400)
          .json({ error: "User already exist whith the same data." });
      }

      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(password, salt);
      // Create the new user
      user = new User({
        name: name,
        email: email,
        password: secPass,
      });

      const userName=user.name;

      // save the user in the data base
      await user.save();
      // res.status(201).json({ message: "User created successfully." });
      const data = {
        user: {
          id: user.id,
        },
      };
      const authToken = jwt.sign(data, JWT_SECRET);
      success=true;
      res.json({success, authToken,userName });
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server errror");
    }
  }
);

//Route 2: authenticate a user using :Post "/api/auth/login" No login required
router.post(
  "/login",
  [
    body("email", "Enter a valid email").isEmail(),
    body("password", "Password can not be blank").exists(),
  ],
  async (req, res) => {
    // If there are error return bad request and the error
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({success,errors: errors.array() });
    }

    const { email, password } = req.body;
    try {
      let user = await User.findOne({ email });
      if (!user) {
        return res
          .status(400)
          .json({success, error: "Please try to login with rigth credential." });
      }
      const passwordCompare = await bcrypt.compare(password, user.password);
      if (!passwordCompare) {
        return res
          .status(400)
          .json({success, error: "Please try to login with rigth credential." });
      }
      const data = {
        user: {
          id: user.id,
        },
      };
      const userName=user.name;
      const authToken = jwt.sign(data, JWT_SECRET);
      success=true;
      res.json({success, authToken,userName });
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server errror");
    }
  }
);

// Route 3: Get logedin user details using :POSt "/api/auth/getuser" . Login Required

router.post("/getuser", fetchUser, async (req, res) => {
  try {
   const userId=req.user.id;
    const user = await User.findById(userId).select("-password");
    res.send(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});
module.exports = router;
