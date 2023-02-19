const cloudinary = require("cloudinary").v2;
const dotenv = require("dotenv");
const path = require("path");
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});
exports.uploads = async (fileNames, folder, body) => {
  console.log("body: ", fileNames);
  let urls = [];
  let avtUrl;
  const avtName = fileNames.find((name) => path.extname(name) !== ".mp3");
  if(avtName){
    await cloudinary.uploader.upload(path.join(__dirname, "files", avtName), {
      resource_type: "image",
      folder: folder,
      overwrite: true,
      public_id: avtName.replace(path.extname(avtName), ""),
    }).then(avt=>{
      avtUrl=avt.url
    });
    fileNames.splice(fileNames.indexOf(avtName), 1);
  }
  for (let i = 0; i < fileNames.length; i++) {
    await cloudinary.uploader
      .upload(path.join(__dirname, "files", fileNames[i]), {
        resource_type: "auto",
        folder: folder,
        overwrite: true,
        public_id: fileNames[i].replace(path.extname(fileNames[i]), "").replace(/ */g, ''),
      })
      .then(function (song) {
        urls.push({
          url: song.url,
          id: song.public_id,
          name: body.songName,
          author: body.authorName,
          avt:avtUrl||''
        });
      })
      .catch(function (err) {
        if (err) {
          console.log(err);
        }
      });
  }
  console.log("urls: ", urls);
  return urls;
};
