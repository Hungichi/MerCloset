import express from "express";
import jwt from "jsonwebtoken";
import Admin from "../models/admin.js";
import rateLimit from "express-rate-limit";

const router = express.Router();

// Rate limiting cho login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 5, // Tối đa 5 lần đăng nhập
  message: {
    message: "Quá nhiều lần đăng nhập thất bại. Vui lòng thử lại sau 15 phút."
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Login admin
router.post("/login", loginLimiter, async (req, res) => {
    try {
        const { username, password } = req.body;

        // Tìm admin trong database
        const admin = await Admin.findOne({ username });
        
        if (!admin) {
            return res.status(401).json({ message: "Tên đăng nhập hoặc mật khẩu không đúng" });
        }

        // So sánh password với bcrypt
        const isPasswordValid = await admin.comparePassword(password);
        
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Tên đăng nhập hoặc mật khẩu không đúng" });
        }

        // Tạo JWT token với secret mạnh
        const token = jwt.sign(
            { 
                id: admin._id, 
                username: admin.username,
                role: 'admin'
            },
            process.env.JWT_SECRET || 'your-super-secret-key-change-this-in-production',
            { 
                expiresIn: '2h', // Giảm thời gian xuống 2h
                issuer: 'mercloset',
                audience: 'admin'
            }
        );

        res.json({
            success: true,
            token,
            admin: {
                id: admin._id,
                username: admin.username
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: "Lỗi server" });
    }
});

// Verify token
router.get("/verify", async (req, res) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ message: "Không có token" });
        }

        const decoded = jwt.verify(
            token, 
            process.env.JWT_SECRET || 'your-super-secret-key-change-this-in-production',
            {
                issuer: 'mercloset',
                audience: 'admin'
            }
        );
        
        res.json({ valid: true, admin: decoded });
    } catch (error) {
        res.status(401).json({ message: "Token không hợp lệ" });
    }
});

// Logout (blacklist token - optional)
router.post("/logout", async (req, res) => {
    try {
        // Trong thực tế, bạn có thể lưu token vào blacklist
        res.json({ success: true, message: "Đăng xuất thành công" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server" });
    }
});

export default router; 