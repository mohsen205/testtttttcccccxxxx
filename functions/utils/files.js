const { bucket } = require("../utils/admin");
const BusBoy = require("busboy");
const { uuid } = require("uuidv4");
const os = require("os");
const path = require("path");
const fs = require("fs");

const getImageExtension = (filename) => {
  const file = filename.filename;
  const index = file.lastIndexOf(".");
  if (index === -1) {
    throw new Error("File has no extension.");
  }
  return file.substr(index);
};

const uploadImage = (request) => {
  return new Promise((resolve, reject) => {
    const busboy = BusBoy({ headers: request.headers });
    let imageFileName;
    let imageToBeUploaded = {};
    busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
      console.log(fieldname, file, filename, encoding, mimetype);
      const imageExtension = getImageExtension(filename);
      imageFileName = `${uuid()}${imageExtension}`;

      const filePath = path.join(os.tmpdir(), imageFileName);

      imageToBeUploaded = { filePath, mimetype };

      file.pipe(fs.createWriteStream(filePath));
    });

    busboy.on("finish", () => {
      bucket
        .upload(imageToBeUploaded.filePath, {
          resumable: false,
          metadata: {
            metadata: {
              contentType: imageToBeUploaded.mimetype,
            },
          },
        })
        .then(() => {
          const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${process.env.BUCKET_NAME}/o/${imageFileName}?alt=media&token=${process.env.BUCKET_TOKEN}`;
          resolve(imageUrl);
        })
        .catch((error) => {
          reject(error);
        });
    });
    busboy.end(request.rawBody);
  });
};

const updateImage = (imagePath, request) => {
  return new Promise((resolve, reject) => {
    const busboy = BusBoy({ headers: request.headers });
    let imageFileName;
    let imageToBeUploaded = {};
    busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
      const imageExtension = getImageExtension(filename);
      imageFileName = `${uuid()}${imageExtension}`;

      const filePath = path.join(os.tmpdir(), imageFileName);

      imageToBeUploaded = { filePath, mimetype };

      file.pipe(fs.createWriteStream(filePath));
    });

    busboy.on("finish", () => {
      bucket
        .file(imagePath)
        .delete()
        .then(() => {
          return bucket.upload(imageToBeUploaded.filePath, {
            resumable: false,
            metadata: {
              metadata: {
                contentType: imageToBeUploaded.mimetype,
              },
            },
          });
        })
        .then(() => {
          const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${process.env.BUCKET_NAME}/o/${imageFileName}?alt=media&token=${process.env.BUCKET_TOKEN}`;
          resolve(imageUrl);
        })
        .catch((error) => {
          reject(error);
        });
    });
    busboy.end(request.rawBody);
  });
};

const deleteImage = async (imagePath) => {
  const imageFile = bucket.file(imagePath);
  await imageFile.delete();
};

module.exports = { getImageExtension, uploadImage, deleteImage, updateImage };
