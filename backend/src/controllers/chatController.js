const { HfInference } = require('@huggingface/inference');
const { getClinicalTrials, getOpenAlexData, getPubMedData } = require('./researchController');

// Apni API key use kar rahe hain
const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

const generateChatResponse = async (req, res) => {
    try {
        const userQuery = req.body.message;
        if (!userQuery) return res.status(400).json({ success: false, message: "Message is required" });

        console.log(`[CHAT INITIATED] 💬 Processing query: ${userQuery}`);

        // --- STEP 1: TEENO APIs SE DATA LAANA (Simultaneously for speed) ---
        // Hum mock requests create kar rahe hain taaki humare existing functions kaam karein
        const mockReq = { query: { query: userQuery, disease: userQuery } };
        const trialsPromise = new Promise((resolve) => getClinicalTrials(mockReq, { json: resolve, status: () => ({ json: resolve }) }));
        const openAlexPromise = new Promise((resolve) => getOpenAlexData(mockReq, { json: resolve, status: () => ({ json: resolve }) }));
        const pubMedPromise = new Promise((resolve) => getPubMedData(mockReq, { json: resolve, status: () => ({ json: resolve }) }));

        // Sabko ek sath run karo (fastest way)
        const [trialsRes, openAlexRes, pubMedRes] = await Promise.all([trialsPromise, openAlexPromise, pubMedPromise]);

        // --- STEP 2: DATA COMBINE KARNA (Ssirf zaroori information) ---
        let combinedContext = "Here is the latest medical data fetched from trusted sources:\n\n";
        
        if (trialsRes.success && trialsRes.data?.length > 0) {
            combinedContext += `[CLINICAL TRIALS (from ClinicalTrials.gov)]\n`;
            trialsRes.data.slice(0, 2).forEach(t => combinedContext += `- Title: ${t.title}, Status: ${t.status}\n`);
            combinedContext += '\n';
        }

        if (pubMedRes.success && pubMedRes.data?.length > 0) {
            combinedContext += `[RESEARCH PAPERS (from PubMed)]\n`;
            pubMedRes.data.slice(0, 2).forEach(p => combinedContext += `- Title: ${p.title}\n  Abstract: ${p.abstract.substring(0, 150)}...\n`);
            combinedContext += '\n';
        }

        // --- STEP 3: PROMPT ENGINEERING (The Magic Words) ---
        const systemPrompt = `
You are Curalink, an advanced Medical Research Assistant. Your goal is to provide accurate, easy-to-understand summaries based ONLY on the provided context.

MANDATORY OUTPUT FORMAT:
You MUST structure your response exactly with these 4 headings:

**1. Condition Overview**
(A brief, 2-3 sentence summary of the condition requested by the user.)

**2. Research Insights**
(Summarize the key findings from the Research Papers provided in the context.)

**3. Clinical Trials**
(Mention the relevant clinical trials and their status from the context.)

**4. Source Attribution**
(Clearly state that this data comes from PubMed, ClinicalTrials.gov, etc., and advise consulting a doctor).

CONTEXT DATA:
${combinedContext}
`;

        // --- STEP 4: HUGGING FACE (LLAMA-3) API CALL ---
        console.log(`[AI PROCESSING] 🧠 Sending context to Llama-3...`);
        const result = await hf.chatCompletion({
            model: "meta-llama/Meta-Llama-3-8B-Instruct",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: `Please provide information on: ${userQuery}` }
            ],
            max_tokens: 500,
        });

        const finalAnswer = result.choices[0].message.content;

        // --- STEP 5: SEND RESPONSE TO FRONTEND ---
        res.json({ success: true, answer: finalAnswer });

    } catch (error) {
        console.error("Chat Controller Error:", error);
        res.status(500).json({ success: false, message: "AI response failed" });
    }
};

module.exports = { generateChatResponse };