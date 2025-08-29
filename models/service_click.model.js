const mongoose = require("mongoose");

const serviceClickSchema = new mongoose.Schema({
    serviceName: {
        type: String,
        required: true,
        trim: true,
    },
    userIdentifier: {
        type: String,
        required: true,
        trim: true,
    },
    clickedAt: {
        type: Date,
        default: Date.now,
    },
});

serviceClickSchema.index({ serviceName: 1, userIdentifier: 1, clickedAt: -1 });

module.exports = mongoose.model("ServiceClick", serviceClickSchema);

