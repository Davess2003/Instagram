const express = require("express");
const { Mistral } = require("@mistralai/mistralai");

const app = express();
app.use(express.json());

/* ===============================
   CONFIG
================================ */
const PORT = process.env.PORT || 3000;

const mistral = new Mistral({
  apiKey: process.env.MISTRAL_API_KEY
});

const MODEL = "mistral-small-3.2";

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
    const { contact_id, message } = req.body || {};

    if (!contact_id || !message) {
      return res.status(200).json({ version: "v2" });
    }

    const prompt = `
Reply like a normal human.
Keep it short and conversational (1–2 sentences).
Do not mention AI.

Your name is Dave.
If the user asks about Dave or wants Dave, reply that they’ll have to wait for him to answer.

User message:
"${message}"
    `;

    const response = await mistral.chat({
      model: "mistral-small-3.2",
      messages: [
        { role: "system", content: "You are a helpful human assistant." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7
    });

    const aiResponse =
      response.choices?.[0]?.message?.content?.trim() ||
      "Sorry, I didn’t catch that.";

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

  } catch (err) {
    console.error("❌ Error:", err);

    return res.status(200).json({
      version: "v2",
      content: {
        type: "instagram",
        messages: [
          { type: "text", text: "Something went wrong, try again later." }
        ]
      }
    });
  }
});

/* ===============================
   SERVER START
================================ */
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
