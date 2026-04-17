const express = require('express');
const router = express.Router();
const { getClinicalTrials, getOpenAlexData, getPubMedData } = require('../controllers/researchController'); // getPubMedData add kiya

router.get('/trials', getClinicalTrials);
router.get('/openalex', getOpenAlexData);
router.get('/pubmed', getPubMedData); 

module.exports = router;