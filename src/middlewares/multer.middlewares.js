import multer from "multer";
import path from "path";
let count = 0;
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.resolve("public/temp");
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    count++;
    const uniqueSuffix = count;
    cb(null, file.originalname + "-" + uniqueSuffix);
  },
});

export const upload = multer({ storage: storage });
