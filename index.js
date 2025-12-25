require("dotenv").config();
const express = require("express");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

/**
 * Webhook verification (REQUIRED)
 * Meta calls this once when you save the webhook
 */
app.get("/webhook/instagram", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✅ Webhook verified");
    return res.status(200).send(challenge);
  }

  console.log("❌ Webhook verification failed");
  return res.sendStatus(403);
});

/**
 * Incoming Instagram events (DMs, etc.)
 */
app.post("/webhook/instagram", (req, res) => {
  try {
    const entry = req.body.entry?.[0];
    const event = entry?.messaging?.[0];

    if (event?.message?.text) {
      console.log("📩 New Instagram DM");
      console.log("From:", event.sender.id);
      console.log("Text:", event.message.text);
    }

    // Always respond 200 FAST
    res.sendStatus(200);
  } catch (err) {
    console.error("Webhook error:", err);
    res.sendStatus(200); // never fail
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Webhook server running on port ${PORT}`);
});
