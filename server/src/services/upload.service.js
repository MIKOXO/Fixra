import cloudinary from '../config/cloudinary.js';

const uploadToCloudinary = (file, folder) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'auto' },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve({
            url: result.secure_url,
            type: result.resource_type,
            publicId: result.public_id,
          });
        }
      }
    );

    uploadStream.end(file.buffer);
  });
};

export { uploadToCloudinary };
