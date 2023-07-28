require('dotenv').config();
const usersModel = require('../models/users.model');
const { genSalt, hash, compareSync } = require('bcrypt');
const { sign } = require('jsonwebtoken');

module.exports = {
  createUser: async (req, res) => {
    const body = req.body;
    const salt = await genSalt(10);
    body.password = await hash(body.password, salt);
    usersModel.create(body, (error, results) => {
      if (error) {
        console.log(error);
        return res.status(500).json({
          success: 0,
          message: 'Error when create user',
        });
      }
      return res.status(200).json({
        success: 1,
        data: results,
      });
    });
  },
  getUsers: (req, res) => {
    usersModel.getMultiple((error, results) => {
      if (error) {
        console.log(error);
        return res.status(500).json({
          success: 0,
          message: 'Error when get users',
        });
      }
      if (!results) {
        return res.status(404).json({
          success: 0,
          message: 'Users not found',
        });
      }
      return res.status(200).json({
        success: 1,
        data: results,
      });
    });
  },
  getUserById: (req, res) => {
    const params = req.params;
    usersModel.getById(params, (error, results) => {
      if (error) {
        console.log(error);
        return res.status(500).json({
          success: 0,
          message: 'Error when get user by id',
        });
      }
      if (!results) {
        return res.status(404).json({
          success: 0,
          message: 'User not found',
        });
      }
      return res.status(200).json({
        success: 1,
        data: results,
      });
    });
  },
  getUserProfile: (req, res) => {
    const params = { id: req.userId };
    usersModel.getById(params, (error, results) => {
      if (error) {
        console.log(error);
        return res.status(500).json({
          success: 0,
          message: 'Error when get user by id',
        });
      }
      if (!results) {
        return res.status(404).json({
          success: 0,
          message: 'User not found',
        });
      }
      const data = {
        username: results[0].username,
        fullname: results[0].fullname,
        email: results[0].email,
        phone: results[0].phone,
        avatar: results[0].avatar,
      };
      return res.status(200).json({
        success: 1,
        data,
      });
    });
  },
  updateUser: async (req, res) => {
    const body = req.body;
    const params = req.params;
    const salt = await genSalt(10);
    body.password = await hash(body.password, salt);

    if (!params.id) {
      return res.status(404).json({
        success: 0,
        message: 'Id params not found',
      });
    }

    usersModel.update(body, params, (error, results) => {
      if (error) {
        console.log(error);
        return res.status(500).json({
          success: 0,
          message: 'Error when update user',
        });
      }
      if (!results) {
        return res.status(404).json({
          success: 0,
          message: 'User not found',
        });
      }
      return res.status(200).json({
        success: 1,
        data: results,
      });
    });
  },
  deleteUser: (req, res) => {
    const params = req.params;
    if (!params.id) {
      return res.status(404).json({
        success: 0,
        message: 'Id params not found',
      });
    }

    usersModel.delete(params, (error, results) => {
      if (error) {
        console.log(error);
        return res.status(500).json({
          success: 0,
          message: 'Error when delete user',
        });
      }
      if (!results) {
        return res.status(404).json({
          success: 0,
          message: 'User not found',
        });
      }
      return res.status(200).json({
        success: 1,
        data: results,
      });
    });
  },
  login: (req, res) => {
    const body = req.body;

    if (body.email) {
      usersModel.getByEmail(body, (error, results) => {
        if (error) {
          console.log(error);
          return res.status(500).json({
            success: 0,
            message: 'Error when get user by email',
          });
        }
        if (!results) {
          return res.json({
            success: 0,
            message: 'Invalid email or passowrd',
          });
        }
        const resultData = results[0];
        console.log(resultData);
        const isMatchingPassword = compareSync(body.password, resultData.password);
        if (isMatchingPassword) {
          const jsontoken = sign({ id: resultData.id }, process.env.SECRET_KEY, {
            algorithm: 'HS256',
            allowInsecureKeySizes: true,
            expiresIn: '1h',
          });
          return res.json({
            success: 1,
            message: 'login successfully',
            token: jsontoken,
          });
        } else {
          return res.json({
            success: 0,
            message: 'Invalid email or passowrd',
          });
        }
      });
    } else if (body.username) {
      usersModel.getByUsername(body, (error, results) => {
        if (error) {
          console.log(error);
          return res.status(500).json({
            success: 0,
            message: 'Error when get user by username',
          });
        }
        if (!results) {
          return res.json({
            success: 0,
            message: 'Invalid username or passowrd',
          });
        }
        const resultData = results[0];
        console.log(resultData);
        const isMatchingPassword = compareSync(body.password, resultData.password);
        if (isMatchingPassword) {
          const jsontoken = sign({ id: resultData.id }, process.env.SECRET_KEY, {
            algorithm: 'HS256',
            allowInsecureKeySizes: true,
            expiresIn: '1h',
          });
          return res.json({
            success: 1,
            message: 'login successfully',
            token: jsontoken,
          });
        } else {
          return res.json({
            success: 0,
            message: 'Invalid email or passowrd',
          });
        }
      });
    } else {
      return res.status(500).json({
        success: 0,
        message: 'username or email not found',
      });
    }
  },
};
