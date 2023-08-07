const {
  createUser,
  register,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  login,
  getUserProfile,
  forgotPassword,
  resetPassword,
} = require('../controllers/users.controller');
const router = require('express').Router();
const { verifyAccessToken, isAdmin, verifyResetPasswordToken } = require('../middlewares/auth');
const { checkDuplicateUsernameOrEmail } = require('../middlewares/verifyUser');

router.post('/', checkDuplicateUsernameOrEmail, createUser);
router.get('/profile', verifyAccessToken, getUserProfile);
router.get('/', getUsers);
router.get('/:id', verifyAccessToken, getUserById);
router.patch('/:id', updateUser);
router.delete('/:id', deleteUser);
router.post('/register', checkDuplicateUsernameOrEmail, register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', verifyResetPasswordToken, resetPassword);

module.exports = router;
