const passport = require("passport");

const auth = (req, res, next) => {
	// console.log(req.headers.authorization);
	passport.authenticate("jwt", { session: false }, (err, user) => {
		if (err || !user) {
			return res.status(401).json({
				status: "fail",
				code: 401,
				message: "Not authorized",
			});
		}
		req.user = user;
		next();
	})(req, res, next);
};

module.exports = auth;
