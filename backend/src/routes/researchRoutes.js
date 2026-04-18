const express = require('express');
const router = express.Router();
const { getClinicalTrials, getOpenAlexData, getPubMedData } = require('../controllers/researchController'); // getPubMedData add kiya
const { generateChatResponse } = require('../controllers/chatController'); // Naya Import

router.get('/trials', getClinicalTrials);
router.get('/openalex', getOpenAlexData);
router.get('/pubmed', getPubMedData); 
router.post('/chat', generateChatResponse); // Naya Route

module.exports = router;