const {
  createBrand,
  getBrands,
  getBrandById,
  updateBrand,
  deleteBrand,
} = require('../controllers/brands.controller');
const router = require('express').Router();
const { verifyAccessToken, isAdmin } = require('../middlewares/auth');
const { checkDuplicateCategoryName, checkValidToDelete } = require('../middlewares/verifyCategory');

router.post('/', verifyAccessToken, isAdmin, checkDuplicateCategoryName, createBrand);
router.get('/', getBrands);
router.get('/:id', getBrandById);
router.patch('/:id', verifyAccessToken, isAdmin, checkDuplicateCategoryName, updateBrand);
router.delete('/:id', verifyAccessToken, isAdmin, checkValidToDelete, deleteBrand);

module.exports = router;
