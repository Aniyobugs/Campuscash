const express = require('express');
const router = express.Router();
const Volunteer = require('../model/volunteer');

// Apply for volunteer
router.post('/apply', async (req, res) => {
    try {
        const { name, email, studentId, department, year, reason, eventId } = req.body;

        // Check if user has already applied for this event
        const existingApplication = await Volunteer.findOne({
            email,
            eventId: eventId || null
        });

        if (existingApplication) {
            return res.status(400).json({ message: 'You have already applied for this event.' });
        }

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

        // Create Notification if Approved/Rejected
        if (status === 'approved' || status === 'rejected') {
            const User = require('../model/user');
            const Notification = require('../model/notification');
            const Event = require('../model/event');

            // Find user by email (assuming email is unique and matches)
            const user = await User.findOne({ email: volunteer.email });

            if (user) {
                let pointsAwarded = 0;
                let message = "";

                if (status === 'approved') {
                    // Calculate points if event exists
                    if (volunteer.eventId) {
                        const event = await Event.findById(volunteer.eventId);
                        pointsAwarded = event ? (event.points || 50) : 50;
                    } else {
                        pointsAwarded = 50; // Default points if no specific event linked
                    }

                    // Award points
                    user.points = (user.points || 0) + pointsAwarded;
                    await user.save();

                    message = `Congratulations! Your volunteer application for "${volunteer.reason.substring(0, 20)}..." has been APPROVED. You have been awarded ${pointsAwarded} points!`;
                } else {
                    message = `Update: Your volunteer application has been REJECTED.`;
                }

                const type = status === 'approved' ? 'success' : 'error';

                await new Notification({
                    userId: user._id,
                    message,
                    type
                }).save();
            }
        }

        res.status(200).json({ message: 'Status updated successfully', volunteer });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
