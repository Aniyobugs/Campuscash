var mongoose = require('mongoose');

var eventSchema = new mongoose.Schema({
    title: {
        type: String,

    },
    description: {
        type: String,

    },
    templateId: {
        type: Number,

        enum: [1, 2, 3] // 1: Simple Centered, 2: Split Image/Text, 3: Full Background
    },
    imageUrl: {
        type: String,
        required: false // Not all templates might need an image, or optional
    },
    isActive: {
        type: Boolean,
        default: true
    },
    points: {
        type: Number,
        default: 50 // Points awarded for volunteering
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Event', eventSchema);
