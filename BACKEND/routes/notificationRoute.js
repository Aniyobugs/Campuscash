const express = require("express");
const router = express.Router();
const Notification = require("../model/notification");
const jwt = require("jsonwebtoken");
const SECRET_KEY = "mysecret"; // In production use process.env.SECRET_KEY

// Middleware to verify token and get user ID
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided" });

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.userId = decoded.id;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid token" });
    }
};

// GET /api/notifications/my - Get all notifications for logged-in user
router.get("/my", verifyToken, async (req, res) => {
    try {
        const notifications = await Notification.find({ userId: req.userId }).sort({ createdAt: -1 });
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: "Error fetching notifications", error: error.message });
    }
});

// PUT /api/notifications/read/:id - Mark specific notification as read
router.put("/read/:id", verifyToken, async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, userId: req.userId },
            { isRead: true },
            { new: true }
        );
        if (!notification) return res.status(404).json({ message: "Notification not found" });
        res.json(notification);
    } catch (error) {
        res.status(500).json({ message: "Error updating notification", error: error.message });
    }
});

// PUT /api/notifications/read-all - Mark all as read
router.put("/read-all", verifyToken, async (req, res) => {
    try {
        await Notification.updateMany({ userId: req.userId, isRead: false }, { isRead: true });
        res.json({ message: "All notifications marked as read" });
    } catch (error) {
        res.status(500).json({ message: "Error updating notifications", error: error.message });
    }
});

module.exports = router;
