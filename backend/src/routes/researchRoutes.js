const express = require('express');
const router = express.Router();
const { getClinicalTrials, getPubMedData, getOpenAlexData } = require('../controllers/researchController');

// Routes define kar rahe hain (Sath mein ?disease=xyz ya ?query=xyz lagana padega)
router.get('/trials', getClinicalTrials);
router.get('/pubmed', getPubMedData);
router.get('/openalex', getOpenAlexData);

module.exports = router;