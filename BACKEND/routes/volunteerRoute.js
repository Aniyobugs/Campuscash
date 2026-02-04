const express = require('express');
const router = express.Router();
const Volunteer = require('../model/volunteer');

// Apply for volunteer
router.post('/apply', async (req, res) => {
    try {
        const { name, email, studentId, department, year, reason, eventId } = req.body;

        const newVolunteer = new Volunteer({
            name,
            email,
            studentId,
            department,
            year,
            reason,
            eventId
        });

        await newVolunteer.save();
        res.status(201).json({ message: 'Application submitted successfully', volunteer: newVolunteer });
    } catch (error) {
        console.error("Error submitting volunteer application:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get all volunteers (Admin)
router.get('/all', async (req, res) => {
    try {
        const volunteers = await Volunteer.find().sort({ createdAt: -1 });
        res.status(200).json(volunteers);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update volunteer status
router.put('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        if (!['pending', 'approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const volunteer = await Volunteer.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!volunteer) {
            return res.status(404).json({ message: 'Volunteer not found' });
        }

        res.status(200).json({ message: 'Status updated successfully', volunteer });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
