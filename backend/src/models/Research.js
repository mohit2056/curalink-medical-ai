const mongoose = require('mongoose');

const ResearchSchema = new mongoose.Schema({
    query: { type: String, required: true },
    source: { type: String, required: true }, // PubMed, OpenAlex, ya ClinicalTrials
    data: { type: Object, required: true },
    createdAt: { 
        type: Date, 
        default: Date.now, 
        expires: 604800 // 7 Din (seconds mein: 7 * 24 * 3600)
    }
});

// Isse search fast ho jayega
ResearchSchema.index({ query: 1, source: 1 });

module.exports = mongoose.model('Research', ResearchSchema);