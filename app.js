const express = require("express");
const fileUpload = require("express-fileupload");
const path = require("path");
const cors = require("cors");
const fs = require("fs");
const filesPayloadExists = require("./middleware/filesPayloadExists");
const fileExtLimiter = require("./middleware/fileExtLimiter");
const fileSizeLimiter = require("./middleware/fileSizeLimiter");
const cloudinary = require("./cloudinary");

const PORT = process.env.PORT || 3500;
const app = express();
app.use(cors());

const uploader = async (path, folder, body) =>
  await cloudinary.uploads(path, folder, body);
app.post(
  "/upload-songs",
  fileUpload({ createParentPath: true }),
  filesPayloadExists,
  fileExtLimiter([".mp3", ".png", ".jpg", "jfif"]),
  fileSizeLimiter,
  async (req, res) => {
    try {
      const files = Object.keys(req.files);
      Object.keys(req.files).forEach((key) => {
        req.files[key].mv(
          path.join(__dirname, "files", req.files[key].name),
          (err) => {
            if (err) {
              res.status(500).json({ status: "error", message: err });
            }
          }
        );
      });
      const urls = await uploader(files, "VMusic", req.body);
      if (urls.length) {
        res
          .status(200)
          .json({ message: "upload song successful!", data: urls });
      } else {
        res.status(400).json({ message: "failed to upload song!" });
      }
      // remove all exist files in files folder
      fs.readdir(path.join(__dirname, "files"), function (err, files) {
        if (err) {
          res
            .status(400)
            .json({
              message: "Error occur when try to read files from server!",
              error: err,
            });
          return;
        }
        for (const file of files) {
          fs.unlink(path.join(__dirname, "files", file), (err) => {
            if (err) throw err;
          });
        }
      });
    } catch (error) {console.log('try catch err: ', error)}
  }
);

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
