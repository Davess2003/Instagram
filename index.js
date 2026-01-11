const axios = require('axios');
require("dotenv").config();
const express = require("express");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const MANYCHAT_API_KEY = process.env.MANYCHAT_API_KEY;

/**
 * HEAD requests (ManyChat health)
 */
app.head("/webhook/instagram", (req, res) => {
  return res.sendStatus(200);
});

/**
 * POST requests (ManyChat External Request)
 */
app.post("/webhook/instagram", async (req, res) => {
  try {
    console.log("📩 External Request received");
    console.log(JSON.stringify(req.body, null, 2));

    let { user_id, message } = req.body || {};

    // ✅ REMOVE LEADING # FROM USER ID (e.g. #11211324 → 11211324)
    if (typeof user_id === "string") {
      user_id = user_id.replace(/^#/, "");
    }

    if (user_id && message) {
      console.log(`👤 From user ${user_id}: ${message}`);

      // 🔁 AUTO REPLY LOGIC
      const replyText = `You said: "${message}"`;

      await sendMessage(user_id, replyText);
    }

    // ✅ ManyChat requires this exact response
    return res.status(200).json({ version: "v2" });

  } catch (err) {
    console.error("❌ Error:", err);

    // ❗ Never break ManyChat automation
    return res.status(200).json({ version: "v2" });
  }
});

/**
 * Health check
 */
app.get("/", (req, res) => {
  res.send("✅ Webhook server running");
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

/**
 * SEND MESSAGE TO MANYCHAT USER
 */
async function sendMessage(contactId, message) {
  try {
    const response = await axios.post(
      "https://api.manychat.com/fb/sending/sendContent",
      {
        subscriber_id: contactId,
        data: {
          version: "v2",
          content: {
            messages: [
              {
                type: "text",
                text: message
              }
            ]
          }
        }
      },
      {
        headers: {
          Authorization: `Bearer ${MANYCHAT_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    console.log("✅ Message sent to", contactId);
  } catch (error) {
    console.error(
      "❌ ManyChat send error:",
      error.response?.data || error.message
    );
  }
}
