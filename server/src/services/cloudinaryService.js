const cloudinary = require('../config/cloudinary');

/**
 * Uploads a base64 image or data URL to Cloudinary
 * @param {string} base64Data - Base64 image string (e.g. data:image/jpeg;base64,...)
 * @param {string} folder - Target folder in Cloudinary (defaults to 'playrush/players')
 * @returns {Promise<string>} - Cloudinary secure URL, or original base64 as fallback
 */
const uploadToCloudinary = async (base64Data, folder = 'playrush/players') => {
  if (!base64Data) return null;

  // Check if Cloudinary credentials are configured
  if (
    !process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET
  ) {
    console.warn('⚠️ Cloudinary keys not configured in .env. Storing base64 fallback.');
    return base64Data;
  }

  try {
    const uploadResult = await cloudinary.uploader.upload(base64Data, {
      folder,
      transformation: [
        { width: 400, height: 400, crop: 'fill', gravity: 'face' },
        { quality: 'auto', fetch_format: 'auto' },
      ],
    });

    console.log('✅ Image uploaded to Cloudinary:', uploadResult.secure_url);
    return uploadResult.secure_url;
  } catch (err) {
    console.error('❌ Cloudinary upload error:', err.message);
    // Graceful fallback to original base64 so registration is never blocked
    return base64Data;
  }
};

module.exports = { uploadToCloudinary };
