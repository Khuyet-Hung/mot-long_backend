import { v2 as cloudinary } from 'cloudinary';
import { Request } from 'express';
import multer from 'multer';
import { Readable } from 'stream';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Multer configuration for memory storage
const storage = multer.memoryStorage();

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Check file type
  if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ chấp nhận file ảnh và video!'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB default
    files: parseInt(process.env.MAX_FILES || '10')
  }
});

// Upload file to Cloudinary
export const uploadToCloudinary = async (
  buffer: Buffer,
  originalName: string,
  mimetype: string
): Promise<{ url: string; publicId: string; resourceType: string }> => {
  return new Promise((resolve, reject) => {
    const resourceType = mimetype.startsWith('video/') ? 'video' : 'image';
    
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: resourceType,
        folder: 'volunteer-activities',
        public_id: `${Date.now()}-${originalName.split('.')[0]}`,
        format: resourceType === 'image' ? 'webp' : 'mp4',
        transformation: resourceType === 'image' 
          ? [
              { quality: 'auto:good' },
              { fetch_format: 'auto' },
              { width: 1200, height: 800, crop: 'limit' }
            ]
          : [
              { quality: 'auto:good' },
              { width: 1280, height: 720, crop: 'limit' }
            ]
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve({
            url: result!.secure_url,
            publicId: result!.public_id,
            resourceType
          });
        }
      }
    );

    // Convert buffer to stream and pipe to Cloudinary
    const stream = Readable.from(buffer);
    stream.pipe(uploadStream);
  });
};

// Delete file from Cloudinary
export const deleteFromCloudinary = async (publicId: string, resourceType: string = 'image') => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType as any
    });
    return result;
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw error;
  }
};

// Get optimized image URL
export const getOptimizedImageUrl = (publicId: string, width?: number, height?: number) => {
  return cloudinary.url(publicId, {
    fetch_format: 'auto',
    quality: 'auto',
    width,
    height,
    crop: 'fill'
  });
};
