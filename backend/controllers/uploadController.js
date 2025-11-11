import cloudinary from '../config/cloudinary.js';

export const createUploadSignature = async (req, res) => {
  try {
    const timestamp = Math.round(Date.now() / 1000);
    const {
      folder = 'skillshub/videos',
      eager = 'q_auto:good',
      resourceType = 'video'
    } = req.body || {};

    const options = {
      timestamp,
      folder,
      eager,
      resource_type: resourceType
    };

    const signature = cloudinary.utils.api_sign_request(options, cloudinary.config().api_secret);

    res.status(200).json({
      success: true,
      data: {
        signature,
        timestamp,
        folder,
        eager,
        resourceType,
        cloudName: cloudinary.config().cloud_name,
        apiKey: cloudinary.config().api_key
      }
    });
  } catch (error) {
    console.error('Cloudinary signature error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate upload signature' });
  }
};

