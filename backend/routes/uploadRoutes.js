import express from "express";
import multer from "multer";
import cloudinary from "../config/cloudinary.js";

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
    if (!req.file) {
      return res.status(400).json({ message: "Không có file nào được upload" });
    }

    // Upload lên Cloudinary
    const result = await cloudinary.uploader.upload_stream(
      {
        folder: "mercloset",
        resource_type: "auto",
      },
      (error, result) => {
        if (error) {
          return res.status(500).json({ message: "Lỗi upload lên Cloudinary", error: error.message });
        }
        res.json({
          success: true,
          url: result.secure_url,
          public_id: result.public_id,
        });
      }
    );

    // Pipe file buffer vào upload stream
    result.end(req.file.buffer);
  } catch (error) {
    res.status(500).json({ message: "Lỗi upload ảnh", error: error.message });
  }
});

// Upload multiple images
router.post("/multiple", upload.array("images", 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "Không có file nào được upload" });
    }

    const uploadPromises = req.files.map((file) => {
      return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            folder: "mercloset",
            resource_type: "auto",
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve({
                url: result.secure_url,
                public_id: result.public_id,
              });
            }
          }
        ).end(file.buffer);
      });
    });

    const results = await Promise.all(uploadPromises);
    res.json({
      success: true,
      images: results,
    });
  } catch (error) {
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