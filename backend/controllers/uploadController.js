import cloudinary from '../config/cloudinary.js';
import { Readable } from 'stream';

const {
  ENABLE_CLOUDINARY,
  CLOUDINARY_FOLDER = 'skillshub/videos',
  CLOUDINARY_UPLOAD_PRESET = 'skillshub_uploads'
} = process.env;

export const createUploadSignature = async (req, res) => {
  try {
    const cloudinaryEnabled = String(ENABLE_CLOUDINARY).toLowerCase() === 'true';

    if (!cloudinaryEnabled) {
      return res
        .status(400)
        .json({ success: false, message: 'Cloudinary uploads are disabled on this server' });
    }

    const timestamp = Math.round(Date.now() / 1000);
    const {
      folder = CLOUDINARY_FOLDER,
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
        apiKey: cloudinary.config().api_key,
        uploadPreset: CLOUDINARY_UPLOAD_PRESET
      }
    });
  } catch (error) {
    console.error('Cloudinary signature error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate upload signature' });
  }
};

export const uploadFile = async (req, res) => {
  try {
    const cloudinaryEnabled = String(ENABLE_CLOUDINARY).toLowerCase() === 'true';

    if (!cloudinaryEnabled) {
      return res
        .status(400)
        .json({ success: false, message: 'Cloudinary uploads are disabled on this server' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file provided' });
    }

    const { resourceType = 'auto', folder } = req.body;
    const file = req.file;

    // Determine resource type from file mimetype if not specified
    let uploadResourceType = resourceType;
    if (resourceType === 'auto') {
      if (file.mimetype.startsWith('image/')) {
        uploadResourceType = 'image';
      } else if (file.mimetype.startsWith('video/')) {
        uploadResourceType = 'video';
      } else {
        uploadResourceType = 'raw';
      }
    }

    // Create a readable stream from the buffer
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: uploadResourceType,
        folder: folder || (uploadResourceType === 'video' ? 'skillshub/videos' : 'skillshub/images'),
        use_filename: true,
        unique_filename: true,
        overwrite: false
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          return res.status(500).json({
            success: false,
            message: 'Failed to upload file to Cloudinary',
            error: error.message
          });
        }

        res.status(200).json({
          success: true,
          data: {
            url: result.secure_url,
            publicId: result.public_id,
            resourceType: result.resource_type,
            format: result.format,
            width: result.width,
            height: result.height,
            bytes: result.bytes
          }
        });
      }
    );

    // Pipe the buffer to the upload stream
    const bufferStream = new Readable();
    bufferStream.push(file.buffer);
    bufferStream.push(null);
    bufferStream.pipe(stream);
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ success: false, message: 'Failed to upload file', error: error.message });
  }
};

