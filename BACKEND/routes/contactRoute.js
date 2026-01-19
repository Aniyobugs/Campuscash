const express = require("express");
const router = express.Router();
const Contact = require("../model/contact");

// POST /api/contact/submit - Submit a new message
router.post("/submit", async (req, res) => {
    try {
        const { firstName, lastName, email, message } = req.body;

        if (!firstName || !email || !message) {
            return res.status(400).json({ message: "Please fill all required fields" });
        }

        const newContact = new Contact({
            firstName,
            lastName: lastName || "",
            email,
            message,
        });

        await newContact.save();
        res.status(201).json({ message: "Message sent successfully!" });
    } catch (error) {
        console.error("Contact submit error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// GET /api/contact/all - Get all messages (Admin only)
router.get("/all", async (req, res) => {
    try {
        const messages = await Contact.find().sort({ createdAt: -1 });
        res.status(200).json(messages);
    } catch (error) {
        console.error("Get messages error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// PUT /api/contact/:id/status - Update status
router.put("/:id/status", async (req, res) => {
    try {
        const { status } = req.body;
        const message = await Contact.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        res.json(message);
    } catch (error) {
        res.status(500).json({ message: "Error updating status" });
    }
});

module.exports = router;
