import mongoose from "mongoose";
import dotenv from "dotenv";
import Admin from "../models/admin.js";

dotenv.config();

const setupAdmin = async () => {
    try {
        // Kết nối database
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Đã kết nối database");

        // Kiểm tra admin đã tồn tại chưa
        const existingAdmin = await Admin.findOne({ username: "admin" });
        
        if (existingAdmin) {
            console.log("⚠️  Admin account đã tồn tại!");
            console.log("Username: admin");
            console.log("Để thay đổi password, hãy xóa admin cũ và chạy lại script này.");
            process.exit(0);
        }

        // Tạo admin mới
        const admin = new Admin({
            username: "admin",
            password: "FanTrang2304" // Sẽ được hash tự động
        });

        await admin.save();
        console.log("✅ Đã tạo admin account thành công!");
        console.log("Username: admin");
        console.log("Password: FanTrang2304");
        console.log("⚠️  Hãy đổi password ngay sau khi đăng nhập lần đầu!");

    } catch (error) {
        console.error("❌ Lỗi setup admin:", error.message);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

setupAdmin(); 