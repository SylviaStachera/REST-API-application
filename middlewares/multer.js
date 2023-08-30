const multer = require("multer");
const path = require("path");

const date = new Date();

const updatePath = path.join(process.cwd(), "tmp");

const storage = multer.diskStorage({
	destination: (_, __, callback) => {
		callback(null, updatePath);
	},
	filename: (_, file, callback) => {
		const uniqueSuffix = date + "-" + Math.round(Math.random() * 1e9);
		callback(null, file.fieldname + "-" + uniqueSuffix + "." + file.originalname.split(".").pop());
	},
});

const upload = multer({ storage: storage });

module.exports = upload;
