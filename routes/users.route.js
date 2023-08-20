const {
  createUser,
  register,
  getUsers,
  getUserById,
  updateUser,
  updateUserProfile,
  deleteUser,
  login,
  getUserProfile,
  forgotPassword,
  resetPassword,
} = require('../controllers/users.controller');
const router = require('express').Router();
const { verifyAccessToken, isAdmin, verifyResetPasswordToken } = require('../middlewares/auth');
const { checkDuplicateUsernameOrEmail } = require('../middlewares/verifyUser');

router.post('/', verifyAccessToken, isAdmin, checkDuplicateUsernameOrEmail, createUser);
router.get('/profile', verifyAccessToken, getUserProfile);
router.get('/', verifyAccessToken, isAdmin, getUsers);
router.get('/:id', verifyAccessToken, isAdmin, getUserById);
router.patch('/:id', verifyAccessToken, isAdmin, updateUser);
router.patch('/', verifyAccessToken, updateUserProfile);
router.delete('/:id', verifyAccessToken, isAdmin, deleteUser);
router.post('/register', checkDuplicateUsernameOrEmail, register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', verifyResetPasswordToken, resetPassword);

module.exports = router;
