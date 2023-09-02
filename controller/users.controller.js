const Joi = require("joi");
const Jimp = require("jimp");
const gravatar = require("gravatar");
const fs = require("fs/promises");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const userService = require("../services/users.service");
const emailService = require("../services/email.service");

const userSchema = Joi.object({
	email: Joi.string().email().required(),
	password: Joi.string().min(6).required(),
});

const registerUser = async (req, res, next) => {
	try {
		const user = await userService.getUserByEmial(req.body.email);
		if (user) {
			return res.status(409).json({
				status: "fail",
				code: 409,
				message: "Email in use",
			});
		}

		const validateRegister = userSchema.validate(req.body);
		if (validateRegister.error) {
			return res.status(400).json({
				status: "fail",
				message: "Invalid data",
				error: validateRegister.error,
			});
		}

		const avatarURL = gravatar.url(req.body.email, {
			s: "200",
			r: "pg",
			d: "404",
		});

		const verificationToken = uuidv4();

		const newUser = await userService.register({ ...req.body, avatarURL, verificationToken });

		await emailService.sendVerificationEmail(newUser.email, verificationToken);

		res.status(201).json({
			status: "success",
			code: 201,
			data: {
				...newUser.toObject(),
				avatarURL,
				verificationToken,
			},
		});
	} catch (error) {
		next(error);
	}
};

const loginUser = async (req, res, next) => {
	try {
		const user = await userService.login(req.body);

		const validateRegister = userSchema.validate(req.body);
		if (validateRegister.error) {
			return res.status(400).json({
				status: "fail",
				message: "Invalid data",
				error: validateRegister.error,
			});
		}

		if (user) {
			res.json({
				status: "success",
				code: 200,
				data: { user },
			});
		} else {
			res.status(400).json({
				status: "fail",
				code: 400,
				message: "Incorrect login or password",
			});
		}
	} catch (error) {
		next(error);
	}
};

const logoutUser = async (req, res, next) => {
	try {
		await userService.logout(req.user._doc._id);
		res.json({
			status: "success",
			code: 200,
			message: "User logged out",
		});
	} catch (error) {
		next(error);
	}
};

const currentUser = async (req, res, next) => {
	try {
		const currentUser = req.user;
		res.status(200).json({
			status: "success",
			code: 200,
			data: {
				currentUser,
			},
		});
	} catch (error) {
		next(error);
	}
};

const updateAvatar = async (req, res, next) => {
	try {
		const uploadedFile = req.file;

		const avatar = await Jimp.read(uploadedFile.path);
		await avatar.cover(250, 250).write(uploadedFile.path);

		const newFileName = `avatar_${req.user._id}.${uploadedFile.mimetype.split("/")[1]}`;

		const newPath = path.join(__dirname, `../public/avatars/${newFileName}`);

		await fs.rename(uploadedFile.path, newPath);

		const avatarURL = `/avatars/${newFileName}`;
		res.status(200).json({
			status: "success",
			code: 200,
			avatarURL,
		});
	} catch (error) {
		next(error);
	}
};

const verifyUser = async (req, res, next) => {
	try {
		const { verificationToken } = req.params;

		if (!verificationToken) {
			return res.status(400).json({
				status: "fail",
				code: 400,
				message: "Missing verification token",
			});
		}

		const user = await userService.verifyUser(verificationToken);

		if (!user) {
			return res.status(404).json({
				status: "fail",
				code: 404,
				message: "User not found",
			});
		}

		return res.status(200).json({
			status: "success",
			code: 200,
			message: "Verification successful",
		});
	} catch (error) {
		next(error);
	}
};

const resendVerificationEmail = async (req, res, next) => {
	try {
		const { email } = req.body;

		if (!email) {
			return res.status(400).json({
				status: "fail",
				code: 400,
				message: "missing required field email",
			});
		}

		const user = await userService.getUserByEmial(email);
		if (!user) {
			return res.status(400).json({
				status: "fail",
				code: 400,
				message: "User not found",
			});
		}

		if (user.verify) {
			return res.status(400).json({
				status: "fail",
				code: 400,
				message: "Verification has already been passed",
			});
		}

		const newVerificationToken = uuidv4();

		await emailService.sendVerificationEmail(email, newVerificationToken);

		return res.status(200).json({
			status: "success",
			code: 200,
			message: "Verification email sent",
		});
	} catch (error) {
		next(error);
	}
};

module.exports = {
	registerUser,
	loginUser,
	logoutUser,
	currentUser,
	updateAvatar,
	verifyUser,
	resendVerificationEmail,
};
