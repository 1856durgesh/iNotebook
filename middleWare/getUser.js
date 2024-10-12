// it will get the user details form the token 
var jwt = require("jsonwebtoken");
const JWT_SECRET = "Gate$Exam@2025";

const fetchUser = (req, res, next) => {
  // get the user from the jwt tokken and id to  req object
  const token = req.header("auth-token");
  if (!token) {
    res.status(401).send({ error: "Please authenticate using a valid token." });
  }
  try {
    const data = jwt.verify(token, JWT_SECRET);
   
    req.user = data.user;
    next();
  } catch (err) {
    res.status(401).send({ error: "Please authenticate using a valid token." });
  }
};

module.exports = fetchUser;
