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
            reason: isAvailable ? undefined : 'Khoảng thời gian này đã có người đặt',
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

        // Prevent conflicts: reject if overlaps existing non-cancelled rentals
        const requestedStart = new Date(startDate);
        const requestedEnd = new Date(endDate);
        const conflict = product.rentalDates.some(rental => {
            const rentalStart = new Date(rental.startDate);
            const rentalEnd = new Date(rental.endDate);
            return (
                (requestedStart <= rentalEnd && requestedEnd >= rentalStart) &&
                rental.status !== 'cancelled'
            );
        });
        if (conflict) {
            return res.status(409).json({ message: 'Date range conflicts with existing booking' });
        }

        const newRental = {
            startDate,
            endDate,
            customerName,
            customerPhone,
            status: 'confirmed'
        };

        product.rentalDates.push(newRental);
        product.updatedAt = Date.now();

        const updatedProduct = await product.save();
        res.json(updatedProduct);

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// POST mark single day as booked (admin) - PROTECTED
router.post('/:id/book-day', authMiddleware, async (req, res) => {
    try {
        const { date } = req.body; // ISO string or yyyy-mm-dd
        if (!date) return res.status(400).json({ message: 'date is required' });

        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        const start = new Date(date);
        const end = new Date(date);
        end.setHours(23, 59, 59, 999);

        // conflict check
        const conflict = product.rentalDates.some(rental => {
            const rentalStart = new Date(rental.startDate);
            const rentalEnd = new Date(rental.endDate);
            return (start <= rentalEnd && end >= rentalStart) && rental.status !== 'cancelled';
        });
        if (conflict) return res.status(409).json({ message: 'This day is already booked' });

        product.rentalDates.push({ startDate: start, endDate: end, status: 'confirmed' });
        product.updatedAt = Date.now();
        const saved = await product.save();
        res.json(saved);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// POST toggle a single day booking (admin) - PROTECTED
router.post('/:id/toggle-day', authMiddleware, async (req, res) => {
    try {
        const { date } = req.body;
        if (!date) return res.status(400).json({ message: 'date is required' });

        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        const start = new Date(date);
        const end = new Date(date);
        end.setHours(23, 59, 59, 999);

        // Check if any existing rental covers this day
        const index = product.rentalDates.findIndex(rental => {
            const rentalStart = new Date(rental.startDate);
            const rentalEnd = new Date(rental.endDate);
            return (start <= rentalEnd && end >= rentalStart) && rental.status !== 'cancelled';
        });

        if (index >= 0) {
            // If day lies in an existing rental, adjust the range
            const rental = product.rentalDates[index];
            const rentalStart = new Date(rental.startDate);
            const rentalEnd = new Date(rental.endDate);
            const isSingleDay = rentalStart.toDateString() === rentalEnd.toDateString();
            if (isSingleDay) {
                // remove this single-day booking
                product.rentalDates.splice(index, 1);
            } else {
                // Split or shrink the range to exclude the selected day
                const dayStart = new Date(start.getFullYear(), start.getMonth(), start.getDate());
                const dayEnd = new Date(start.getFullYear(), start.getMonth(), start.getDate(), 23, 59, 59, 999);
                // Case 1: day at start of range
                if (dayStart.getTime() === new Date(rentalStart.getFullYear(), rentalStart.getMonth(), rentalStart.getDate()).getTime()) {
                    const newStart = new Date(dayStart);
                    newStart.setDate(newStart.getDate() + 1);
                    rental.startDate = newStart;
                // Case 2: day at end of range
                } else if (dayEnd.getTime() === new Date(rentalEnd.getFullYear(), rentalEnd.getMonth(), rentalEnd.getDate(), 23, 59, 59, 999).getTime()) {
                    const newEnd = new Date(dayEnd);
                    newEnd.setDate(newEnd.getDate() - 1);
                    rental.endDate = newEnd;
                // Case 3: day in the middle → split into two ranges
                } else {
                    const leftEnd = new Date(dayStart);
                    leftEnd.setDate(leftEnd.getDate() - 1);
                    const rightStart = new Date(dayStart);
                    rightStart.setDate(rightStart.getDate() + 1);
                    // Adjust current rental to left range
                    rental.endDate = leftEnd;
                    // Push new right range
                    product.rentalDates.push({ startDate: rightStart, endDate: rentalEnd, status: rental.status || 'confirmed' });
                }
            }
        } else {
            // add new single day booking
            product.rentalDates.push({ startDate: start, endDate: end, status: 'confirmed' });
        }

        product.updatedAt = Date.now();
        const saved = await product.save();
        res.json(saved);
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