const users = require('../models/users.model');
const usersModel = require('../models/users.model');

module.exports = {
  checkDuplicateUsernameOrEmail: (req, res, next) => {
    const body = req.body;
    usersModel.checkExistsByEmail(body, (error, results) => {
      if (error) {
        console.log(error);
        return res.status(500).json({
          success: 0,
          message: 'Database Error',
        });
      }
      if (results[0].output) {
        return res.status(400).json({
          success: 0,
          message: 'Username is already in use!',
        });
      }
    });
    usersModel.checkExistsByUsername(body, (error, results) => {
      if (error) {
        console.log(error);
        return res.status(500).json({
          success: 0,
          message: 'Database Error',
        });
      }
      if (results[0].output) {
        return res.status(400).json({
          success: 0,
          message: 'Username is already in use!',
        });
      }
    });
    next();
  },
};
