const categoriesModel = require('../models/categories.model');

const checkDuplicateCategoryName = async (req, res, next) => {
  const body = req.body;
  const params = req.params;

  try {
    const exists = await categoriesModel.checkExistsByName(body, params);
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

const checkValidToDelete = async (req, res, next) => {
  const params = req.params;

  try {
    const exists = await categoriesModel.checkExistsSubcategory(params);
    if (exists) {
      return res.status(400).json({
        success: 0,
        message: 'This category has some subcategory',
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

module.exports = { checkDuplicateCategoryName, checkValidToDelete };
