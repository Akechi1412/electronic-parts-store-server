const categoriesModel = require('../models/categories.model');

const checkDuplicateCategoryName = async (req, res, next) => {
  const body = req.body;

  try {
    const exists = await categoriesModel.checkExistsByName(body);
    if (exists) {
      return res.status(400).json({
        success: 0,
        message: 'Category name is already in use!',
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

module.exports = { checkDuplicateCategoryName };
