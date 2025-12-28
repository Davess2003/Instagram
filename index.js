require("dotenv").config();
const express = require("express");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

/**
 * External Request endpoint
 * Used by Automation tools (ManyChat / etc.)
 */
app.post("/webhook/instagram", (req, res) => {
  try {
    console.log("📩 External Request received");
    console.log("Headers:", req.headers);
    console.log("Body:", JSON.stringify(req.body, null, 2));

    /**
     * Example expected body (depends on automation config):
     * {
     *   "user_id": "123456",
     *   "username": "john_doe",
     *   "message": "Hello"
     * }
     */

    const message = req.body.message;
    const userId = req.body.user_id;

    if (message) {
      console.log("From user:", userId);
      console.log("Message:", message);
    }

    // MUST respond 200 quickly
    return res.sendStatus(200);
  } catch (err) {
    console.error("❌ Error handling request:", err);
    return res.sendStatus(200); // never fail
  }
});

/**
 * Optional health check
 */
app.get("/", (req, res) => {
  res.send("✅ Webhook server running");
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
