const jwt = require('jsonwebtoken');

//Middleware to authenticate JWT access token
module.exports = function (req, res, next) {
    const authHeader = req.headers.authorization
    if(!authHeader){
      res.status(401).json({message: 'Unauthorized!'})
      return;
    }
    const token = authHeader.split(' ')[1];
  //token is an array where its first element(index:0) is 'Bearer' and 2nd element(index:1) is the 'given token'
  if(!token){
    //if token is found then it is authorized, else not.
    res.status(401).json({message: 'Unauthorized!'})
    return;
  }else {
    jwt.verify(token, process.env.JWT_SECRET, (err, payload) =>{
      if(err){
        res.status(401).json({message: 'Unauthorized!'})
      }else{
        req.user = payload //user taking user details where payload = user email and pass
        next()
      } 
    } )
  }
};   