require('dotenv').config();
const { verify } = require('jsonwebtoken');
const usersModel = require('../models/users.model');

module.exports = {
  verifyToken: (req, res, next) => {
    const secretKey = process.env.SECRET_KEY;
    let token = req.get('authorization');

    if (!token) {
      return res.status(403).json({
        success: 0,
        message: 'No token provided!',
      });
    }

    token = token.slice(7);
    verify(token, secretKey, (error, decoded) => {
      if (error) {
        return res.status(401).send({
          success: 0,
          message: 'Unauthorized!',
        });
      }
      console.log(decoded);
      req.userId = decoded.id;
      next();
    });
  },
  isAdmin: (req, res, next) => {
    const params = { id: req.userId };
    usersModel.getById(params, (error, results) => {
      if (error) {
        console.log(error);
        return res.status(500).json({
          success: 0,
          message: 'Database error',
        });
      }
      if (!results) {
        return res.status(404).json({
          success: 0,
          message: 'User not found',
        });
      }
      const isAdmin = results[0]?.admin;
      if (!isAdmin) {
        res.status(403).json({
          success: 0,
          message: 'Require Admin Role!',
        });
      }
      next();
    });
  },
};
