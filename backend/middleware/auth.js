import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ message: "Không có token, truy cập bị từ chối" });
        }

        // Verify token với options đầy đủ
        const decoded = jwt.verify(
            token, 
            process.env.JWT_SECRET || 'your-super-secret-key-change-this-in-production',
            {
                issuer: 'mercloset',
                audience: 'admin'
            }
        );

        // Kiểm tra role
        if (decoded.role !== 'admin') {
            return res.status(403).json({ message: "Không có quyền truy cập" });
        }

        req.admin = decoded;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: "Token đã hết hạn" });
        } else if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: "Token không hợp lệ" });
        } else {
            return res.status(401).json({ message: "Token không hợp lệ" });
        }
    }
}; 