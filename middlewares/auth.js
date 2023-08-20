require('dotenv').config();
const { verify } = require('jsonwebtoken');
const { promisify } = require('util');
const usersModel = require('../models/users.model');
const verifyAsync = promisify(verify);

const verifyAccessToken = async (req, res, next) => {
  const accessKey = process.env.ACCESS_SECRET_KEY;
  let token = req.get('authorization');

  if (!token) {
    return res.status(401).json({
      success: 0,
      message: 'No token provided!',
    });
  }

  token = token.slice(7);
  try {
    const decoded = await verifyAsync(token, accessKey);
    req.userId = decoded.id;
    next();
  } catch (error) {
    return res.status(401).json({
      success: 0,
      message: 'Unauthorized!',
    });
  }
};
const isAdmin = async (req, res, next) => {
  const params = { id: req.userId };
  try {
    const results = await usersModel.getById(params);
    const isAdmin = results[0]?.admin;
    if (!isAdmin) {
      res.status(403).json({
        success: 0,
        message: 'Require Admin Role!',
      });
    }
    next();
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      success: 0,
      message: error.message || 'something was wrong',
    });
  }
};

const verifyResetPasswordToken = async (req, res, next) => {
  const resetPasswordKey = process.env.RESET_PASSWORD_TOKEN_KEY;
  let token = req.get('authorization');

  if (!token) {
    return res.status(401).json({
      success: 0,
      message: 'No token provided!',
    });
  }

  token = token.slice(7);
  try {
    const decoded = await verifyAsync(token, resetPasswordKey);
    req.email = decoded.email;
  } catch (error) {
    console.log(error.message);
    return res.status(401).json({
      success: 0,
      message: 'Unauthorized!',
    });
  }
  next();
};

module.exports = { verifyAccessToken, isAdmin, verifyResetPasswordToken };
