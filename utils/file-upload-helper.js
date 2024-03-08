const cloudinary = require("cloudinary").v2;
const sharp = require("sharp");

require("dotenv").config();

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadImagesToCloudinary = async (files, res, limit, dimesion) => {
  try {
    let imageQuantity = limit ? limit : 5;
    let imageDimension = dimesion ? dimesion : 300;

    if (files?.length <= imageQuantity) {
      const uploadPromises = files.map((file) => {
        return new Promise((resolve, reject) => {
          sharp(file.buffer)
            // .resize({ height: imageDimension, width: imageDimension })
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
        uploadedImages.map(({ asset_id, url }, index) => ({
          _id: asset_id,
          img: url,
          default: index == 1 ? true : false,
        })) || [];

      return {
        status: 200,
        message: "success",
        data: simplifiedImages,
      };
    } else {
      return {
        status: 409,
        message: "More than 5 image is not allowed",
        data: null,
      };
    }
  } catch (error) {
    console.error("Error:", error);
    return {
      status: 500,
      message: error,
      data: null,
    };
  }
};

module.exports = { uploadImagesToCloudinary };
