const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure upload directory exists
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

// File filter: Allow only PDF, JPG, JPEG, PNG
const fileFilter = (req, file, cb) => {
  const allowedExtensions = [".pdf", ".jpg", ".jpeg", ".png"];
  const ext = path.extname(file.originalname).toLowerCase();

  const allowedMimeTypes = [
    "application/pdf",
    "image/jpeg",
    "image/jpg",
    "image/png",
  ];

  if (
    allowedExtensions.includes(ext) &&
    allowedMimeTypes.includes(file.mimetype.toLowerCase())
  ) {
    cb(null, true);
  } else {
    cb(
      new Error("Only PDF, JPG, JPEG, and PNG files are allowed"),
      false
    );
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter,
});

// Middleware to handle single document upload (accepts any field name like 'file' or 'document')
const uploadSingleDocument = (req, res, next) => {
  upload.any()(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          message: "File size exceeds 5MB limit",
        });
      }
      return res.status(400).json({
        message: err.message,
      });
    } else if (err) {
      return res.status(400).json({
        message: err.message || "File upload failed",
      });
    }

    if (req.files && req.files.length > 0) {
      req.file = req.files[0];
    }

    next();
  });
};

module.exports = {
  uploadSingleDocument,
};
