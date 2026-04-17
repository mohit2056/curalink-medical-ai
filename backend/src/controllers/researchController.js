const axios = require('axios');
const Research = require('../models/Research'); // Apna MongoDB Model
const xml2js = require('xml2js');

// 1. Clinical Trials API (With Smart Caching & Structuring)
const getClinicalTrials = async (req, res) => {
    try {
        const query = (req.query.disease || req.query.query || "").toLowerCase();
        const sourceName = "ClinicalTrials";

        // 🔥 STEP 1: MongoDB Caching Check (Fast Response)
        const cachedData = await Research.findOne({ query: query, source: sourceName });
        if (cachedData) {
            console.log(`[CACHE HIT] ⚡ Serving ${sourceName} data for: ${query}`);
            return res.json({ success: true, source: sourceName, cached: true, data: cachedData.data });
        }

        // 🌐 STEP 2: Fetch from API (If not in cache)
        console.log(`[API CALL] 🌐 Fetching fresh ${sourceName} data for: ${query}`);
        // Hum 20 results la rahe hain (Depth first logic ke liye)
        const url = `https://clinicaltrials.gov/api/v2/studies?query.cond=${query}&filter.overallStatus=RECRUITING&pageSize=20&format=json`;
        const response = await axios.get(url);

        // 🧹 STEP 3: Data Structuring (Kachra hatao, sirf kaam ki cheez rakho)
        const rawTrials = response.data.studies || [];
        const structuredTrials = rawTrials.map(trial => {
            const protocol = trial.protocolSection;
            return {
                id: protocol?.identificationModule?.nctId || "N/A",
                title: protocol?.identificationModule?.briefTitle || "No Title",
                status: trial.statusModule?.overallStatus || "Unknown",
                conditions: protocol?.conditionsModule?.conditions || [],
                url: `https://clinicaltrials.gov/study/${protocol?.identificationModule?.nctId}`
            };
        });

        // 💾 STEP 4: Save to MongoDB (Taaki agle 7 din tak API call na karni pade)
        await Research.create({
            query: query,
            source: sourceName,
            data: structuredTrials
        });

        res.json({ success: true, source: sourceName, cached: false, data: structuredTrials });

    } catch (error) {
        console.error("ClinicalTrials Error:", error.message);
        res.status(500).json({ success: false, message: "Trials fetch failed" });
    }
};

// 2. OpenAlex API (With Smart Caching & Structuring)
const getOpenAlexData = async (req, res) => {
    try {
        const query = (req.query.query || "").toLowerCase();
        const sourceName = "OpenAlex";

        // 🔥 STEP 1: Check Cache
        const cachedData = await Research.findOne({ query: query, source: sourceName });
        if (cachedData) {
            console.log(`[CACHE HIT] ⚡ Serving ${sourceName} data for: ${query}`);
            return res.json({ success: true, source: sourceName, cached: true, data: cachedData.data });
        }

        // 🌐 STEP 2: Fetch Fresh Data (Depth: 25 results)
        console.log(`[API CALL] 🌐 Fetching fresh ${sourceName} data for: ${query}`);
        const url = `https://api.openalex.org/works?search=${query}&per-page=25&page=1&sort=relevance_score:desc`;
        const response = await axios.get(url);

        // 🧹 STEP 3: Structuring (Extract Title, Abstract, Authors, Year, URL)
        const rawWorks = response.data.results || [];
        const structuredWorks = rawWorks.map(work => {
            return {
                id: work.id,
                title: work.title,
                abstract: work.abstract_inverted_index ? "Abstract available (Needs parsing)" : "No abstract", 
                publication_year: work.publication_year,
                authors: work.authorships?.map(a => a.author.display_name).slice(0, 3).join(", ") || "Unknown",
                url: work.doi || work.id
            };
        });

        // 💾 STEP 4: Save to MongoDB
        await Research.create({
            query: query,
            source: sourceName,
            data: structuredWorks
        });

        res.json({ success: true, source: sourceName, cached: false, data: structuredWorks });

    } catch (error) {
        console.error("OpenAlex Error:", error.message);
        res.status(500).json({ success: false, message: "OpenAlex fetch failed" });
    }
};
// 3. PubMed API (NIH) - With XML parsing & Caching
const getPubMedData = async (req, res) => {
    try {
        const query = (req.query.query || "").toLowerCase();
        const sourceName = "PubMed";

        // 🔥 STEP 1: Check Cache
        const cachedData = await Research.findOne({ query: query, source: sourceName });
        if (cachedData) {
            console.log(`[CACHE HIT] ⚡ Serving ${sourceName} data for: ${query}`);
            return res.json({ success: true, source: sourceName, cached: true, data: cachedData.data });
        }

        console.log(`[API CALL] 🌐 Fetching fresh ${sourceName} data for: ${query}`);
        
        // 🌐 STEP 2A: Fetch IDs first
        const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${query}&retmax=15&sort=pub+date&retmode=json`;
        const searchResponse = await axios.get(searchUrl);
        const ids = searchResponse.data.esearchresult.idlist;

        if (!ids || ids.length === 0) {
            return res.json({ success: true, source: sourceName, cached: false, data: [] });
        }

        // 🌐 STEP 2B: Fetch Actual XML Data using IDs
        const fetchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=${ids.join(',')}&retmode=xml`;
        const fetchResponse = await axios.get(fetchUrl);

        // 🧹 STEP 3: Convert XML to JSON
        const parser = new xml2js.Parser({ explicitArray: false });
        const result = await parser.parseStringPromise(fetchResponse.data);

        let articles = result.PubmedArticleSet.PubmedArticle;
        if (!articles) articles = [];
        if (!Array.isArray(articles)) articles = [articles]; // Agar ek hi result ho

        // 🧹 STEP 4: Structure Data
        const structuredWorks = articles.map(article => {
            const medline = article.MedlineCitation;
            const articleData = medline.Article;
            
            // Abstract nikalne ka safe tarika (kabhi array hota hai, kabhi string)
            let abstractText = "No abstract available";
            if (articleData.Abstract && articleData.Abstract.AbstractText) {
                abstractText = typeof articleData.Abstract.AbstractText === 'string' 
                    ? articleData.Abstract.AbstractText 
                    : (articleData.Abstract.AbstractText._ || "Abstract available");
            }

            const pmid = medline.PMID._ || medline.PMID;

            return {
                id: pmid,
                title: articleData.ArticleTitle,
                abstract: abstractText,
                year: articleData.Journal?.JournalIssue?.PubDate?.Year || "Unknown",
                url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`
            };
        });

        // 💾 STEP 5: Save to MongoDB
        await Research.create({
            query: query,
            source: sourceName,
            data: structuredWorks
        });

        res.json({ success: true, source: sourceName, cached: false, data: structuredWorks });

    } catch (error) {
        console.error("PubMed Error:", error.message);
        res.status(500).json({ success: false, message: "PubMed fetch failed" });
    }
};

// Teeno APIs ko export kar diya
module.exports = { getClinicalTrials, getOpenAlexData, getPubMedData };
