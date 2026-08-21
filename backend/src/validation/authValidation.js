const { body } = require('express-validator');
const validate = require('../middlewares/validate');

const nameRules = [
  body('name')
    .trim()
    .whitelist('a-zA-Z0-9\\s')
    .notEmpty()
    .withMessage('name is required')
    .bail()
    .isLength({ min: 3, max: 255 })
    .withMessage('name must be between 3 and 255 characters'),
];

const emailRules = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('email is required')
    .bail()
    .isEmail()
    .withMessage('invalid email')
    .normalizeEmail(),
];

const optionalWhatsappRules = [
  body('whatsapp_number')
    .optional({ values: 'falsy' })
    .trim()
    .isMobilePhone('id-ID')
    .withMessage('invalid number')
    .isLength({ min: 10, max: 20 })
    .withMessage('number length must be between 10 and 20 characters'),
];

const passwordRules = [
  body('password')
    .notEmpty()
    .withMessage('password is required')
    .bail()
    .isLength({ min: 8, max: 72 })
    .withMessage('password must be between 8 and 72 characters'),
];

const loginPasswordRules = [
  body('password')
    .notEmpty()
    .withMessage('password is required')
    .bail()
    .isLength({ max: 72 })
    .withMessage('password is too long'),
];

const oldPasswordRules = [
  body('old_password')
    .notEmpty()
    .withMessage('old_password is required')
    .bail()
    .isLength({ max: 72 })
    .withMessage('old_password is too long'),
];

const newPasswordRules = [
  body('new_password')
    .notEmpty()
    .withMessage('new_password is required')
    .bail()
    .isLength({ min: 8, max: 72 })
    .withMessage('new_password must be between 8 and 72 characters')
    .custom((value, { req }) => value !== req.body.old_password)
    .withMessage('new_password must be different from old_password'),
];

const requestOtpRules = [...emailRules];

const verifyOtpRules = [
  ...emailRules,
  body('code')
    .isLength({ min: 6, max: 6 })
    .withMessage('invalid otp')
    .isNumeric()
    .withMessage('invalid otp'),
  ...nameRules,
  ...passwordRules,
  ...optionalWhatsappRules,
];

const loginRules = [...emailRules, ...loginPasswordRules];

const registerRules = [...nameRules, ...emailRules, ...passwordRules, ...optionalWhatsappRules];

const updateProfileRules = [...nameRules, ...optionalWhatsappRules];

const changePasswordRules = [...oldPasswordRules, ...newPasswordRules];

const authLogin = [...loginRules, validate];
const authRegister = [...registerRules, validate];
const authUpdateProfile = [...updateProfileRules, validate];
const authChangePassword = [...changePasswordRules, validate];
const authRequestOtp = [...requestOtpRules, validate];
const authVerifyOtp = [...verifyOtpRules, validate];

module.exports = {
  authLogin,
  authRegister,
  authUpdateProfile,
  authChangePassword,
  authRequestOtp,
  authVerifyOtp,
};
