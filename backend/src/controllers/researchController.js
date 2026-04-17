const axios = require('axios');

// 1. Clinical Trials API
const getClinicalTrials = async (req, res) => {
    try {
        const { disease } = req.query; // URL se bimari ka naam lenge
        const url = `https://clinicaltrials.gov/api/v2/studies?query.cond=${disease}&filter.overallStatus=RECRUITING&pageSize=5&format=json`;
        const response = await axios.get(url);
        res.json({ success: true, source: "ClinicalTrials", data: response.data.studies });
    } catch (error) {
        res.status(500).json({ success: false, message: "Trials fetch failed" });
    }
};

// 2. PubMed API (NIH)
const getPubMedData = async (req, res) => {
    try {
        const { query } = req.query;
        // Step 1: Search for IDs
        const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${query}&retmax=5&sort=pub+date&retmode=json`;
        const searchResponse = await axios.get(searchUrl);
        const ids = searchResponse.data.esearchresult.idlist.join(',');

        res.json({ success: true, source: "PubMed", fetched_ids: ids, message: "IDs fetched, next step is efetch API" });
    } catch (error) {
        res.status(500).json({ success: false, message: "PubMed fetch failed" });
    }
};

// 3. OpenAlex API
const getOpenAlexData = async (req, res) => {
    try {
        const { query } = req.query;
        const url = `https://api.openalex.org/works?search=${query}&per-page=5&page=1&sort=relevance_score:desc`;
        const response = await axios.get(url);
        res.json({ success: true, source: "OpenAlex", data: response.data.results });
    } catch (error) {
        res.status(500).json({ success: false, message: "OpenAlex fetch failed" });
    }
};

module.exports = { getClinicalTrials, getPubMedData, getOpenAlexData };