const express = require("express");

const app = express();
app.use(express.json());

/* ===============================
   CONFIG
================================ */
const PORT = process.env.PORT || 3000;

// n8n webhook URL
// Example: https://your-n8n-domain/webhook/instagram-ai
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;

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
       SEND TO n8n
    ================================ */
    const n8nResponse = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contact_id,
        message,
        platform: "instagram"
      })
    });

    if (!n8nResponse.ok) {
      throw new Error(`n8n error: ${n8nResponse.status}`);
    }

    // IMPORTANT: n8n returns PLAIN TEXT
    const aiReply =
      (await n8nResponse.text()).trim() ||
      "Sorry, I didn’t catch that.";

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

app.post("/webhook/whatsapp", async (req, res) => {
  try {
    const { contact_id, message } = req.body || {};

    if (!contact_id || !message) {
      return res.status(200).json({ version: "v2" });
    }

    // Send to n8n with WhatsApp platform identifier
    const n8nResponse = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contact_id,
        message,
        platform: "whatsapp"
      })
    });

    if (!n8nResponse.ok) {
      throw new Error(`n8n error: ${n8nResponse.status}`);
    }

    const aiReply = (await n8nResponse.text()).trim() || "Sorry, I didn't catch that.";

    // WhatsApp response format
    return res.status(200).json({
      version: "v2",
      content: {
        type: "whatsapp",
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
    console.error("❌ WhatsApp Webhook Error:", err);

    return res.status(200).json({
      version: "v2",
      content: {
        type: "whatsapp",
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

app.head("/webhook/whatsapp", (req, res) => {
  return res.sendStatus(200);
});

app.post("/webhook/messenger", async (req, res) => {
  try {
    const { contact_id, message } = req.body || {};

    if (!contact_id || !message) {
      return res.status(200).json({ version: "v2" });
    }

    // Send to n8n with Messenger platform identifier
    const n8nResponse = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contact_id,
        message,
        platform: "messenger"
      })
    });

    if (!n8nResponse.ok) {
      throw new Error(`n8n error: ${n8nResponse.status}`);
    }

    const aiReply = (await n8nResponse.text()).trim() || "Sorry, I didn't catch that.";

    // Messenger response format
    return res.status(200).json({
      version: "v2",
      content: {
        type: "messenger",
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
    console.error("❌ Messenger Webhook Error:", err);

    return res.status(200).json({
      version: "v2",
      content: {
        type: "messenger",
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

app.head("/webhook/messenger", (req, res) => {
  return res.sendStatus(200);
});

/* ===============================
   SERVER START
================================ */
app.listen(PORT, () => {
  console.log(`🚀 Instagram webhook server running on port ${PORT}`);
});
