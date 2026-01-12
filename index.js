const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(express.json());

/* ===============================
   CONFIG
================================ */
const PORT = process.env.PORT || 3000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

/* ===============================
   HEALTH CHECK (ManyChat)
================================ */
app.head("/webhook/instagram", (req, res) => {
  return res.sendStatus(200);
});

/* ===============================
   INSTAGRAM DYNAMIC BLOCK
================================ */
app.post("/webhook/instagram", async (req, res) => {
  try {
    console.log("📩 Instagram Dynamic Block received");
    console.log(JSON.stringify(req.body, null, 2));

    const { contact_id, message } = req.body || {};

    if (!contact_id || !message) {
      return res.status(200).json({ version: "v2" });
    }

    console.log(`👤 From Instagram user ${contact_id}: ${message}`);

    /* ===============================
       GEMINI AI PROCESSING
    ================================ */
    const prompt = `
Act like a normal human would when presented with this text.
Respond naturally, casually, and conversationally.
Do NOT mention that you are an AI.

Text:
"${message}"
`;

    const result = await model.generateContent(prompt);
    const aiResponse = result.response.text().trim();

    console.log("🤖 Gemini response:", aiResponse);

    /* ===============================
       MANYCHAT RESPONSE FORMAT (v2)
    ================================ */
    return res.status(200).json({
      version: "v2",
      content: {
        type: "instagram",
        messages: [
          {
            type: "text",
            text: aiResponse
          }
        ],
        actions: [],
        quick_replies: []
      }
    });

  } catch (error) {
    console.error("❌ Instagram Webhook Error:", error);

    return res.status(200).json({
      version: "v2",
      content: {
        type: "instagram",
        messages: [
          {
            type: "text",
            text: "Something went wrong. Please try again."
          }
        ]
      }
    });
  }
});

/* ===============================
   SERVER START
================================ */
app.listen(PORT, () => {
  console.log(`🚀 Instagram webhook server running on port ${PORT}`);
});