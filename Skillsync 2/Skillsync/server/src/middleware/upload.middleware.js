import multer from "multer";

// max size: 2MB
const MAX_SIZE = 2 * 1024 * 1024;

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];

  if (!allowedTypes.includes(file.mimetype)) {
    cb(
      new Error("Only JPG, JPEG, and PNG images are allowed"),
      false
    );
  } else {
    cb(null, true);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: MAX_SIZE
  },
  fileFilter
});

export default upload;
