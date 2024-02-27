const cloudinary = require("cloudinary").v2;
const sharp = require("sharp");

require("dotenv").config();

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadImages = async (req, res) => {
  try {
    const { files } = req;

    if (files?.length < 6) {
      const uploadPromises = files.map((file) => {
        return new Promise((resolve, reject) => {
          sharp(file.buffer)
            // .resize({ height: 300, width: 300 })
            .toBuffer()
            .then((data) => {
              const stream = cloudinary.uploader.upload_stream(
                { resource_type: "auto", quality: 50 },
                (error, result) => {
                  if (error) {
                    reject(error);
                  } else {
                    resolve(result);
                  }
                }
              );

              stream.end(data);
            })
            .catch((error) => reject(error));
        });
      });
      const uploadedImages = await Promise.all(uploadPromises);

      const simplifiedImages =
        uploadedImages.map(({ asset_id, url }) => ({
          _id: asset_id,
          img: url,
        })) || [];

      return res.status(200).json({
        status: 200,
        message: "Images uploaded successfully to Cloudinary",
        data: simplifiedImages,
      });
    } else {
      return res.status(409).json({
        status: 409,
        message: "More than 5 image is not allowed",
        data: null,
      });
    }
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: error });
  }
};

module.exports = { uploadImages };
