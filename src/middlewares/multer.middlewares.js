import multer from "multer";
let count = 0;
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    count++;
    const uniqueSuffix = count;
    cb(null, file.originalname + "-" + uniqueSuffix);
  },
});

export const upload = multer({ storage: storage });
