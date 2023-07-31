require('dotenv').config();
const usersModel = require('../models/users.model');
const { genSalt, hash, compareSync } = require('bcrypt');
const moment = require('moment');
const { generateAccessToken, InitOAuth2Client, generateResetPasswordToken } = require('../helper');
const nodemailer = require('nodemailer');

const createUser = async (req, res) => {
  const body = req.body;
  const mysqlTimestamp = new Date();
  body.created_at = mysqlTimestamp;
  body.updated_at = mysqlTimestamp;
  const salt = await genSalt(10);
  body.password = await hash(body.password, salt);

  try {
    const results = await usersModel.create(body);
    return res.status(200).json({
      success: 1,
      data: results,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      success: 0,
      message: error.message || 'something was wrong',
    });
  }
};

const register = async (req, res) => {
  const body = req.body;
  const mysqlTimestamp = new Date();
  body.created_at = mysqlTimestamp;
  body.updated_at = mysqlTimestamp;
  const salt = await genSalt(10);
  body.password = await hash(body.password, salt);
  body.username = createUsernameFromEmail(body.email);

  try {
    const results = await usersModel.createWithoutAdmin(body);
    return res.status(200).json({
      success: 1,
      data: results,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      success: 0,
      message: error.message || 'something was wrong',
    });
  }
};

const getUsers = async (req, res) => {
  const query = req.query;

  try {
    const results = await usersModel.getMultiple(query);
    const resultData = results.data || results;
    resultData.forEach((result) => {
      const createdAt = new Date(result.created_at);
      result.created_at = moment(createdAt).format('YYYY-MM-DD HH:mm:ss');
      const updatedAt = new Date(result.updated_at);
      result.updated_at = moment(updatedAt).format('YYYY-MM-DD HH:mm:ss');
    });
    return res.status(200).json({
      success: 1,
      data: results,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      success: 0,
      message: error.message || 'something was wrong',
    });
  }
};

const getUserById = async (req, res) => {
  const params = req.params;

  try {
    const results = await usersModel.getById(params);
    const result = results[0];

    if (!result) {
      return res.status(404).json({
        success: 0,
        message: 'user not found',
      });
    }

    const createdAt = new Date(result.created_at);
    result.created_at = moment(createdAt).format('YYYY-MM-DD HH:mm:ss');
    const updatedAt = new Date(result.updated_at);
    result.updated_at = moment(updatedAt).format('YYYY-MM-DD HH:mm:ss');

    return res.status(200).json({
      success: 1,
      data: results,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      success: 0,
      message: error.message || 'something was wrong',
    });
  }
};

const getUserProfile = async (req, res) => {
  const params = { id: req.userId };

  try {
    const results = await usersModel.getById(params);
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
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      success: 0,
      message: error.message || 'something was wrong',
    });
  }
};

const updateUser = async (req, res) => {
  const body = req.body;
  const mysqlTimestamp = new Date();
  body.updated_at = mysqlTimestamp;
  const params = req.params;

  if (body.password) {
    const salt = await genSalt(10);
    body.password = await hash(body.password, salt);
  }

  try {
    const results = await usersModel.update(body, params);

    if (!results[0]) {
      return res.status(404).json({
        success: 0,
        message: 'user not found',
      });
    }

    return res.status(200).json({
      success: 1,
      data: results,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      success: 0,
      message: error.message || 'something was wrong',
    });
  }
};

const deleteUser = async (req, res) => {
  const params = req.params;

  try {
    const results = usersModel.delete(params);

    if (!results[0]) {
      return res.status(404).json({
        success: 0,
        message: 'user not found',
      });
    }

    return res.status(200).json({
      success: 1,
      data: results,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      success: 0,
      message: error.message,
    });
  }
};

const login = async (req, res) => {
  const ACCESS_EXPIRES_MILISECOND = Number(process.env.ACCESS_EXPIRES_SECOND) * 1000;
  const body = req.body;

  if (body.email) {
    try {
      const results = await usersModel.getByEmail(body);
      const resultData = results[0];

      if (!resultData?.password) {
        return res.status(401).json({
          success: 0,
          message: 'Invalid email or passowrd',
        });
      }

      if (body.role === 'admin' && !resultData?.admin) {
        return res.status(403).json({
          success: 0,
          message: 'Access Denied',
        });
      }

      const isMatchingPassword = compareSync(body.password, resultData.password);
      if (isMatchingPassword) {
        const accessToken = generateAccessToken(resultData.id);
        return res.json({
          success: 1,
          message: 'login successfully',
          accessToken,
          accessExpiredAt: new Date().getTime() + ACCESS_EXPIRES_MILISECOND,
        });
      } else {
        return res.status(401).json({
          success: 0,
          message: 'Invalid email or passowrd',
        });
      }
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({
        success: 0,
        message: error.message || 'something was wrong',
      });
    }
  } else if (body.username) {
    try {
      const results = await usersModel.getByUsername(body);
      const resultData = results[0];
      if (!resultData?.password) {
        return res.status(401).json({
          success: 0,
          message: 'Invalid username or passoword',
        });
      }
      if (body.role === 'admin' && !resultData?.admin) {
        return res.status(403).json({
          success: 0,
          message: 'Access Denied',
        });
      }

      const isMatchingPassword = compareSync(body.password, resultData.password);
      if (isMatchingPassword) {
        const accessToken = generateAccessToken(resultData.id);
        return res.json({
          success: 1,
          message: 'login successfully',
          accessToken,
          accessExpiredAt: new Date().getTime() + ACCESS_EXPIRES_MILISECOND,
        });
      } else {
        return res.status(401).json({
          success: 0,
          message: 'Invalid username or passoword',
        });
      }
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({
        success: 0,
        message: error.message || 'something was wrong',
      });
    }
  } else {
    return res.status(404).json({
      success: 0,
      message: 'username or email not found',
    });
  }
};

const forgotPassword = async (req, res) => {
  const body = req.body;
  let email = '';
  const myOAuth2Client = InitOAuth2Client();

  if (body.email) {
    try {
      const results = await usersModel.getByEmail(body);
      const resultData = results[0];
      if (results[0]?.id) {
        email = body.email;
      } else {
        return res.status(404).json({
          success: 0,
          message: 'email not found',
        });
      }
      if (body.role === 'admin' && !resultData?.admin) {
        return res.status(403).json({
          success: 0,
          message: 'Access Denied',
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: 0,
        message: error.message || 'something was wrong',
      });
    }
  } else {
    return res.status(404).json({
      success: 0,
      message: 'email not found',
    });
  }

  try {
    const myAccessTokenObject = await myOAuth2Client.getAccessToken();
    const myAccessToken = myAccessTokenObject?.token;
    const transport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.ADMIN_EMAIL_ADDRESS,
        clientId: process.env.GOOGLE_MAILER_CLIENT_ID,
        clientSecret: process.env.GOOGLE_MAILER_CLIENT_SECRET,
        refresh_token: process.env.GOOGLE_MAILER_REFRESH_TOKEN,
        accessToken: myAccessToken,
      },
    });
    const resetPasswordToken = generateResetPasswordToken(email);
    const url = `${process.env.CLIENT_HOST}/reset-password?token=${resetPasswordToken}`;
    const mailOptions = {
      to: email,
      subject: '[ELECTRONIC PARTS STORE] Reset your password',
      html: `<h3>Thay đổi mật khẩu mới</h3>
        <p>Vui lòng truy cập vào đường dẫn sau và đổi mật khẩu mới: <a href=${url}>EPS Reset Password</a></p>
        <p>Lưu ý: <i>Đường dẫn này chỉ có hiệu lực trong 15 phút!</i></p>
      `,
    };
    // Send email
    await transport.sendMail(mailOptions);
    return res.status(200).json({
      success: 1,
      message: 'Reset password email sent successfully.',
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      status: 0,
      message: error.message || 'something was wrong',
    });
  }
};

const resetPassword = async (req, res) => {
  const params = { email: req.email };

  const body = req.body;
  if (!body.password) {
    return res.status(400).json({
      success: 0,
      message: 'password is missing',
    });
  }

  const mysqlTimestamp = new Date();
  body.updated_at = mysqlTimestamp;
  const salt = await genSalt(10);
  body.password = await hash(body.password, salt);

  try {
    const results = await usersModel.updateByEmail(body, params);
    return res.status(200).json({
      success: 1,
      data: results,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      success: 0,
      message: error.message || 'something was wrong',
    });
  }
};

module.exports = {
  createUser,
  getUsers,
  getUserById,
  getUserProfile,
  updateUser,
  deleteUser,
  login,
  forgotPassword,
  resetPassword,
  register,
};
