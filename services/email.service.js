const nodemailer = require("nodemailer");
const { APP_URL } = process.env;

const transporter = nodemailer.createTransport({
	service: "Gmail",
	auth: {
		user: process.env.EMAIL_USER,
		pass: process.env.EMAIL_PASSWORD,
	},
	tls: {
		rejectUnauthorized: false,
	},
});

const sendVerificationEmail = async (userEmail, verificationToken) => {
	const mailOptions = {
		from: process.env.EMAIL_USER,
		to: userEmail,
		subject: "Email Verification",
		text: `Please click on the following link to verify your email: ${APP_URL}/users/verify/${verificationToken}`,
	};

	try {
		await transporter.sendMail(mailOptions);
		console.log("Verification email sent successfully.");
	} catch (error) {
		console.error("Error sending verification email:", error);
	}
};

module.exports = { sendVerificationEmail };
