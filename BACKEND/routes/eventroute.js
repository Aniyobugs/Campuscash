const express = require('express');
const router = express.Router();
const Event = require('../model/event');
const upload = require('../middleware/multer');
const mongoose = require('mongoose');
const { Readable } = require('stream');

// ==========================
// Add new event (Banner)
// ==========================
router.post('/add', upload.single('image'), async (req, res) => {
    try {
        const { title, description, templateId } = req.body;

        let imageUrl = '';
        if (req.file) {
            const db = mongoose.connection.db;
            const bucket = new mongoose.mongo.GridFSBucket(db, { bucketName: 'uploads' });

            const filename = `${Date.now()}-${req.file.originalname}`;
            const readable = Readable.from(req.file.buffer);

            const uploadStream = bucket.openUploadStream(filename, {
                contentType: req.file.mimetype
            });

            await new Promise((resolve, reject) => {
                readable.pipe(uploadStream)
                    .on('error', reject)
                    .on('finish', resolve);
            });

            imageUrl = `/api/files/${uploadStream.id}`;
        }

        const newEvent = new Event({
            title,
            description,
            templateId: Number(templateId),
            imageUrl
        });

        await newEvent.save();
        res.status(201).json({ message: 'Event banner created successfully', event: newEvent });
    } catch (error) {
        console.error("Error creating event:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// ==========================
// Get active event
// ==========================
router.get('/active', async (req, res) => {
    try {
        // Fetch the most recently created active event
        const activeEvent = await Event.findOne({ isActive: true }).sort({ createdAt: -1 });
        if (!activeEvent) {
            return res.status(404).json({ message: 'No active events found' });
        }
        res.status(200).json(activeEvent);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// ==========================
// Get all events (Admin)
// ==========================
router.get('/all', async (req, res) => {
    try {
        const events = await Event.find().sort({ createdAt: -1 });
        res.status(200).json(events);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// ==========================
// Toggle active status
// ==========================
router.put('/toggle/:id', async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        event.isActive = !event.isActive;
        await event.save();

        res.status(200).json({ message: `Event is now ${event.isActive ? 'active' : 'inactive'}`, event });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// ==========================
// Delete event
// ==========================
router.delete('/:id', async (req, res) => {
    try {
        await Event.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Event deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
