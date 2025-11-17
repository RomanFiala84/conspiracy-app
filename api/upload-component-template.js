// api/upload-component-template.js
// Upload component template screenshots (FIXNÉ 1200×2000px)

import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { imageBase64, contentId, contentType, dimensions } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ 
        success: false, 
        error: 'No image data provided' 
      });
    }

    console.log('📥 Uploading component template:', contentId, dimensions);

    // Upload do Cloudinary
    const uploadResult = await cloudinary.uploader.upload(imageBase64, {
      folder: `conspiracy-app/component-templates`,
      public_id: `template_${contentId}`,
      resource_type: 'image',
      format: 'png',
      quality: 'auto:best',
      overwrite: true, // ✅ Prepíše starý template
      
      tags: [
        'component-template',
        contentType || 'unknown',
        contentId || 'unknown',
        `${dimensions?.width}x${dimensions?.height}`
      ],
      
      context: {
        contentId: contentId || 'unknown',
        contentType: contentType || 'unknown',
        width: dimensions?.width || 1200,
        height: dimensions?.height || 2000,
        createdAt: new Date().toISOString(),
      },
    });

    console.log('✅ Component template uploaded:', uploadResult.secure_url);

    return res.status(200).json({
      success: true,
      data: {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        width: uploadResult.width,
        height: uploadResult.height,
      }
    });

  } catch (error) {
    console.error('❌ Template upload error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Upload failed',
      details: error.message
    });
  }
}
