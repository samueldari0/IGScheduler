const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');

dotenv.config();

const verifyToken = async (req, res, next) => {
  const token = req.cookies.token || '';
  try {
    if (!token) {
      return res.redirect('/');
    }
    const decrypt = await jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      username: decrypt.username,
      password: decrypt.password,
    };
    next();
  } catch (err) {
      return res.status(500).json(err.toString());
  }
};

module.exports = verifyToken;