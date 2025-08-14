import express from "express";
import multer from "multer";
import { v2 as cloudinary } from 'cloudinary';

const router = express.Router();

// Cấu hình multer để xử lý file upload
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Chỉ cho phép upload ảnh
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ được upload file ảnh!'), false);
    }
  }
});

// Upload single image
router.post("/single", upload.single("image"), async (req, res) => {
  try {
    // Đảm bảo Cloudinary luôn được cấu hình sau khi dotenv đã load
    // Một số môi trường yêu cầu thiết lập CLOUDINARY_URL
    if (!process.env.CLOUDINARY_URL && process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
      process.env.CLOUDINARY_URL = `cloudinary://${process.env.CLOUDINARY_API_KEY}:${process.env.CLOUDINARY_API_SECRET}@${process.env.CLOUDINARY_CLOUD_NAME}`;
    }
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });

    console.log('=== UPLOAD DEBUG ===');
    console.log('1. Request received');
    console.log('2. File info:', {
      fieldname: req.file?.fieldname,
      originalname: req.file?.originalname,
      mimetype: req.file?.mimetype,
      size: req.file?.size,
      buffer: req.file?.buffer ? 'Buffer exists' : 'No buffer'
    });
    
    console.log('3. Environment variables:');
    console.log('   CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME);
    console.log('   CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? '***' : 'undefined');
    console.log('   CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? '***' : 'undefined');
    
    console.log('4. Cloudinary config check:');
    const cfg = cloudinary.config();
    console.log('   cloudinary.config.cloud_name:', cfg.cloud_name);
    console.log('   cloudinary.config.api_key:', cfg.api_key ? '***' : 'undefined');
    console.log('   cloudinary.config.api_secret:', cfg.api_secret ? '***' : 'undefined');

    if (!req.file) {
      console.log('5. No file received');
      return res.status(400).json({ message: "Không có file nào được upload" });
    }

    console.log('5. Starting Cloudinary upload...');
    // Upload lên Cloudinary sử dụng buffer
    const result = await cloudinary.uploader.upload(
      `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`,
      {
        folder: "mercloset",
        resource_type: "auto",
      }
    );

    console.log('6. Upload successful:', result.secure_url);
    res.json({
      success: true,
      url: result.secure_url,
      public_id: result.public_id,
    });
  } catch (error) {
    console.error('7. Upload error:', error);
    console.error('   Error name:', error.name);
    console.error('   Error message:', error.message);
    console.error('   Error stack:', error.stack);
    res.status(500).json({ message: "Lỗi upload ảnh", error: error.message });
  }
});

// Upload multiple images
router.post("/multiple", upload.array("images", 10), async (req, res) => {
  try {
    // Đảm bảo Cloudinary luôn được cấu hình ở mỗi request
    if (!process.env.CLOUDINARY_URL && process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
      process.env.CLOUDINARY_URL = `cloudinary://${process.env.CLOUDINARY_API_KEY}:${process.env.CLOUDINARY_API_SECRET}@${process.env.CLOUDINARY_CLOUD_NAME}`;
    }
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "Không có file nào được upload" });
    }

    const uploadPromises = req.files.map(async (file) => {
      try {
        const result = await cloudinary.uploader.upload(
          `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
          {
            folder: "mercloset",
            resource_type: "auto",
          }
        );
        
        return {
          url: result.secure_url,
          public_id: result.public_id,
        };
      } catch (uploadError) {
        console.error('Single file upload error:', uploadError);
        throw uploadError;
      }
    });

    const results = await Promise.all(uploadPromises);
    res.json({
      success: true,
      images: results,
    });
  } catch (error) {
    console.error('Multiple upload error:', error);
    res.status(500).json({ message: "Lỗi upload ảnh", error: error.message });
  }
});

// Delete image from Cloudinary
router.delete("/:public_id", async (req, res) => {
  try {
    const { public_id } = req.params;
    const result = await cloudinary.uploader.destroy(public_id);
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ message: "Lỗi xóa ảnh", error: error.message });
  }
});

export default router; 