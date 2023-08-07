const {
  createBrand,
  getBrands,
  getBrandById,
  updateBrand,
  deleteBrand,
} = require('../controllers/brands.controller');
const router = require('express').Router();
const { verifyAccessToken, isAdmin } = require('../middlewares/auth');
const { checkDuplicateBrandName } = require('../middlewares/verifyBrand');

router.post('/', verifyAccessToken, isAdmin, checkDuplicateBrandName, createBrand);
router.get('/', getBrands);
router.get('/:id', getBrandById);
router.patch('/:id', verifyAccessToken, isAdmin, checkDuplicateBrandName, updateBrand);
router.delete('/:id', verifyAccessToken, isAdmin, deleteBrand);

module.exports = router;
