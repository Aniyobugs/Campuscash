const multer = require("multer");
// Use memory storage so server can stream file into GridFS (or any storage) instead of writing to disk
const storage = multer.memoryStorage();

// filter (optional)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only images are allowed"), false);
  }
};

// export upload instance
const upload = multer({ storage, fileFilter });
module.exports = upload;
