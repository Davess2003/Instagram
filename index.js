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

// Free plan safe
const MODEL = "mistral-small-latest";

// Conversation memory
const conversations = new Map();
const MAX_MESSAGES = 10; // user+assistant pairs

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

    /* ===============================
       CONVERSATION MEMORY
    ================================ */
    let history = conversations.get(contact_id);

    if (!history) {
      history = [
        {
          role: "system",
          content: `
Reply like a normal human.
Keep it short and conversational (1–2 sentences).
Do not mention AI.

Your name is Dave.
If the user asks about Dave or wants Dave, reply that they’ll have to wait for him to answer.
          `.trim()
        }
      ];
    }

    // Add user message
    history.push({
      role: "user",
      content: message
    });

    // Trim history to prevent token explosion
    if (history.length > MAX_MESSAGES * 2 + 1) {
      history = [
        history[0], // system prompt
        ...history.slice(-MAX_MESSAGES * 2)
      ];
    }

    /* ===============================
       MISTRAL AI
    ================================ */
    const result = await mistral.chat.complete({
      model: MODEL,
      messages: history,
      temperature: 0.7
    });

    const aiReply =
      result.choices?.[0]?.message?.content?.trim() ||
      "Sorry, I didn’t catch that.";

    // Add assistant reply
    history.push({
      role: "assistant",
      content: aiReply
    });

    // Save conversation
    conversations.set(contact_id, history);

    /* ===============================
       MANYCHAT RESPONSE (v2)
    ================================ */
    return res.status(200).json({
      version: "v2",
      content: {
        type: "instagram",
        messages: [
          {
            type: "text",
            text: aiReply
          }
        ],
        actions: [],
        quick_replies: []
      }
    });

  } catch (err) {
    console.error("❌ Webhook Error:", err);

    return res.status(200).json({
      version: "v2",
      content: {
        type: "instagram",
        messages: [
          {
            type: "text",
            text: "Something went wrong, try again later."
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
