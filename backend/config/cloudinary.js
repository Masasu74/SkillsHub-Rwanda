import { v2 as cloudinary } from 'cloudinary';

const {
  CLOUDINARY_URL,
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET
} = process.env;

if (CLOUDINARY_URL) {
  cloudinary.config(CLOUDINARY_URL);
} else {
cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME || 'ddlrwdiu9',
    api_key: CLOUDINARY_API_KEY || '315574799718232',
    api_secret: CLOUDINARY_API_SECRET || 'OlqTmYvGe0wDz_47yBsecluGZzI',
  secure: true
});

  if (!CLOUDINARY_API_KEY) {
    console.warn(
      '⚠️ Cloudinary API key is not set. Update CLOUDINARY_API_KEY to enable secure uploads.'
    );
  }
}

export default cloudinary;

