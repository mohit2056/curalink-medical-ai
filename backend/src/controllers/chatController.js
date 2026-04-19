const { HfInference } = require('@huggingface/inference');
const { getClinicalTrials, getOpenAlexData, getPubMedData } = require('./researchController');

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

const generateChatResponse = async (req, res) => {
    try {
        const userQuery = req.body.message;
        const chatHistory = req.body.history || [];
        if (!userQuery) return res.status(400).json({ success: false, message: "Message is required" });

        // 1. Keyword Extraction
        const extractResult = await hf.chatCompletion({
            model: "meta-llama/Meta-Llama-3-8B-Instruct",
            messages: [
                { role: "system", content: "Extract ONLY the main medical condition from the query. No extra words." },
                { role: "user", content: userQuery }
            ],
            max_tokens: 10,
            temperature: 0.1
        });
        let searchKeyword = extractResult.choices[0].message.content.trim().replace(/['"]/g, '');

        // 2. Fetch Data
        const mockReq = { query: { query: searchKeyword, disease: searchKeyword } };
        const trialsPromise = new Promise((resolve) => getClinicalTrials(mockReq, { json: resolve, status: () => ({ json: resolve }) }));
        const openAlexPromise = new Promise((resolve) => getOpenAlexData(mockReq, { json: resolve, status: () => ({ json: resolve }) }));
        const pubMedPromise = new Promise((resolve) => getPubMedData(mockReq, { json: resolve, status: () => ({ json: resolve }) }));

        const [trialsRes, openAlexRes, pubMedRes] = await Promise.all([trialsPromise, openAlexPromise, pubMedPromise]);

        // 3. Prepare Context
        let combinedContext = "Medical data context:\n";
        if (trialsRes.success && trialsRes.data?.length > 0) {
            combinedContext += `[CLINICAL TRIALS]\n`;
            trialsRes.data.slice(0, 3).forEach(t => combinedContext += `- Title: ${t.title}\n`);
        }
        if (pubMedRes.success && pubMedRes.data?.length > 0) {
            combinedContext += `[RESEARCH PAPERS]\n`;
            pubMedRes.data.slice(0, 3).forEach(p => combinedContext += `- Title: ${p.title}\n  Abstract: ${p.abstract.substring(0, 150)}...\n`);
        }

        // 4. Prompt
        const systemPrompt = `You are Curalink. Provide highly structured summaries based ONLY on the context.
MANDATORY FORMAT:
### 1. Condition Overview
### 2. Research Insights
### 3. Clinical Trials
### 4. Source Attribution
CONTEXT:
${combinedContext}`;

        const formattedHistory = chatHistory.map(msg => ({
            role: msg.role === 'ai' ? 'assistant' : 'user',
            content: msg.content
        }));

        const result = await hf.chatCompletion({
            model: "meta-llama/Meta-Llama-3-8B-Instruct",
            messages: [
                { role: "system", content: systemPrompt },
                ...formattedHistory,
                { role: "user", content: `Please answer based on the context: ${userQuery}` }
            ],
            max_tokens: 600,
        });

        let finalAnswer = result.choices[0].message.content;

        // 🔥 THE ROOT CAUSE FIX: GUARANTEED LINKS 🔥
        finalAnswer += "\n\n### 🔗 Direct Reference Links\n";
        
        let hasLinks = false;
        if (pubMedRes.success && pubMedRes.data?.length > 0) {
            pubMedRes.data.slice(0, 3).forEach(p => {
                const pubmedUrl = p.url || (p.id ? `https://pubmed.ncbi.nlm.nih.gov/${p.id}/` : `https://pubmed.ncbi.nlm.nih.gov`);
                finalAnswer += `* **Research Paper:** [${p.title}](${pubmedUrl})\n`;
                hasLinks = true;
            });
        }
        
        if (trialsRes.success && trialsRes.data?.length > 0) {
            trialsRes.data.slice(0, 3).forEach(t => {
                const trialUrl = t.url || (t.id ? `https://clinicaltrials.gov/study/${t.id}` : `https://clinicaltrials.gov`);
                finalAnswer += `* **Clinical Trial:** [${t.title}](${trialUrl})\n`;
                hasLinks = true;
            });
        }

        if (!hasLinks) {
            finalAnswer += "* No direct links available for this query.\n";
        }

        // Debug log to confirm backend generated links
        console.log("[DEBUG] Final Answer Length:", finalAnswer.length, "Has Links Added:", hasLinks);

        res.json({ success: true, answer: finalAnswer });

    } catch (error) {
        console.error("Chat Controller Error:", error);
        res.status(500).json({ success: false, message: "AI response failed" });
    }
};

module.exports = { generateChatResponse };