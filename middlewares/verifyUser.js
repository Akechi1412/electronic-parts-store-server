const usersModel = require('../models/users.model');

const checkDuplicateUsernameOrEmail = async (req, res, next) => {
  const body = req.body;

  try {
    const exists = await usersModel.checkExistsByUsername(body);
    if (exists) {
      return res.status(400).json({
        success: 0,
        message: 'Username is already in use!',
      });
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      success: 0,
      message: error.message || 'something was wrong',
    });
  }

  try {
    const exists = await usersModel.checkExistsByEmail(body);
    if (exists) {
      return res.status(400).json({
        success: 0,
        message: 'Email is already in use!',
      });
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      success: 0,
      message: error.message || 'something was wrong',
    });
  }

  next();
};

module.exports = { checkDuplicateUsernameOrEmail };
