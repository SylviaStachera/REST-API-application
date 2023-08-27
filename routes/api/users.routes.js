const express = require("express");
const router = express.Router();
const usersController = require("../../controller/users.controller");
const authMiddleware = require("../../auth/auth");

router.post("/user/signup", usersController.registerUser);
router.post("/user/login", usersController.loginUser);
router.get("/user/logout/:id", authMiddleware, usersController.logoutUser);

module.exports = router;
