const express = require("express");
const { check } = require("express-validator");

const userController = require("../controllers/users-controllers");

const router = express.Router();

router.post(
  "/signup",
  [
    check("name").not().isEmpty(),
    check("email").normalizeEmail().isEmail(),
    check("password").isLength({ min: 8 }),
    check("confirmPassword").custom((confirmPassword, { req }) => {
      if (confirmPassword !== req.body.password) {
        throw new Error("Passwords don't match");
      } else {
        return confirmPassword;
      }
    }),
  ],
  userController.signup
);

module.exports = router;
