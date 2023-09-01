const express = require("express");
const router = express.Router();
const usersController = require("../../controller/users.controller");
const authMiddleware = require("../../middlewares/auth");
const upload = require("../../middlewares/multer");

router.post("/users/signup", usersController.registerUser);
router.post("/users/login", usersController.loginUser);
router.get("/users/logout", authMiddleware, usersController.logoutUser);
router.get("/users/current", authMiddleware, usersController.currentUser);
router.patch("/users/avatars", authMiddleware, upload.single("avatar"), usersController.updateAvatar);

module.exports = router;
