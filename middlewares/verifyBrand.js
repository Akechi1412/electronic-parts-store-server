const brandsModel = require('../models/brands.model');

const checkDuplicateBrandName = async (req, res, next) => {
  const body = req.body;
  const params = req.params;

  try {
    const exists = await brandsModel.checkExistsByName(body, params);
    if (exists) {
      return res.status(400).json({
        success: 0,
        message: 'Brand name is already in use!',
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

module.exports = { checkDuplicateBrandName };
