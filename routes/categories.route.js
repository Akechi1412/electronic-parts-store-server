const {
  createCategory,
  getCategories,
  getCategoriesWithoutProducts,
  getCategoryById,
  updateCategory,
  deleteCategory,
} = require('../controllers/categories.controller');
const router = require('express').Router();
const { verifyAccessToken, isAdmin } = require('../middlewares/auth');
const {
  checkDuplicateCategoryName,
  checkCategoryExistsSubcategory,
  checkCategoryExistsProduct,
} = require('../middlewares/verifyCategory');

router.post('/', verifyAccessToken, isAdmin, checkDuplicateCategoryName, createCategory);
router.get('/', getCategories);
router.get('/without-products', getCategoriesWithoutProducts);
router.get('/:id', getCategoryById);
router.patch('/:id', verifyAccessToken, isAdmin, checkDuplicateCategoryName, updateCategory);
router.delete(
  '/:id',
  verifyAccessToken,
  isAdmin,
  checkCategoryExistsSubcategory,
  checkCategoryExistsProduct,
  deleteCategory
);

module.exports = router;
