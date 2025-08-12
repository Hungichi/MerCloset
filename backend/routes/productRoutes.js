import express from "express";
import Product from "../models/product.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

// GET all products (public)
router.get("/", async (req, res) => {
    try {
        const products = await Product.find({ isActive: true }).sort({ createdAt: -1 });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET single product (public)
router.get("/:id", async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST create new product (admin only) - PROTECTED
router.post("/", authMiddleware, async (req, res) => {
    try {
        const product = new Product(req.body);
        const savedProduct = await product.save();
        res.status(201).json(savedProduct);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// PUT update product (admin only) - PROTECTED
router.put("/:id", authMiddleware, async (req, res) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            { ...req.body, updatedAt: Date.now() },
            { new: true }
        );
        if (!updatedProduct) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.json(updatedProduct);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// DELETE product (admin only) - PROTECTED
router.delete("/:id", authMiddleware, async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.json({ message: "Product deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET check availability for specific dates (public)
router.get("/:id/availability", async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        if (!startDate || !endDate) {
            return res.status(400).json({ 
                message: "Start date and end date are required" 
            });
        }

        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        const requestedStart = new Date(startDate);
        const requestedEnd = new Date(endDate);

        // Check if product is available
        if (product.status !== 'available') {
            return res.json({
                available: false,
                reason: `Product is currently ${product.status}`
            });
        }

        // Check for conflicting rentals
        const conflictingRentals = product.rentalDates.filter(rental => {
            const rentalStart = new Date(rental.startDate);
            const rentalEnd = new Date(rental.endDate);
            
            return (
                (requestedStart <= rentalEnd && requestedEnd >= rentalStart) &&
                rental.status !== 'cancelled'
            );
        });

        const isAvailable = conflictingRentals.length === 0;

        res.json({
            available: isAvailable,
            product: {
                id: product._id,
                name: product.name,
                price: product.price,
                image: product.image
            },
            conflictingDates: conflictingRentals.map(rental => ({
                startDate: rental.startDate,
                endDate: rental.endDate,
                status: rental.status
            }))
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST add rental booking (admin only) - PROTECTED
router.post("/:id/rental", authMiddleware, async (req, res) => {
    try {
        const { startDate, endDate, customerName, customerPhone } = req.body;
        
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        const newRental = {
            startDate,
            endDate,
            customerName,
            customerPhone,
            status: 'pending'
        };

        product.rentalDates.push(newRental);
        product.status = 'rented';
        product.updatedAt = Date.now();

        const updatedProduct = await product.save();
        res.json(updatedProduct);

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// GET products by category (public)
router.get("/category/:category", async (req, res) => {
    try {
        const products = await Product.find({ 
            category: req.params.category,
            isActive: true 
        }).sort({ createdAt: -1 });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET search products (public)
router.get("/search/:query", async (req, res) => {
    try {
        const query = req.params.query;
        const products = await Product.find({
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } },
                { style: { $regex: query, $options: 'i' } },
                { category: { $regex: query, $options: 'i' } }
            ],
            isActive: true
        }).sort({ createdAt: -1 });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router; 