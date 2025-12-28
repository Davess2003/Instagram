require("dotenv").config();
const express = require("express");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

/**
 * External Request endpoint
 * Used by Automation tools (ManyChat / etc.)
 */

/**
 * HEAD requests (health check / preflight)
 * MUST return 200 with no body
 */
app.head("/webhook/instagram", (req, res) => {
  console.log("🔎 HEAD request received (health check)");
  return res.sendStatus(200);
});

/**
 * POST requests (actual message payload)
 */
app.post("/webhook/instagram", (req, res) => {
  try {
    console.log("📩 External Request received");
    console.log("Headers:", req.headers);
    console.log("Body:", JSON.stringify(req.body, null, 2));

    /**
     * Example expected body:
     * {
     *   "user_id": "123456",
     *   "username": "john_doe",
     *   "message": "Hello"
     * }
     */

    const { user_id, message } = req.body || {};

    if (message) {
      console.log("From user:", user_id);
      console.log("Message:", message);
    }

    // ALWAYS respond 200 fast
    return res.sendStatus(200);
  } catch (err) {
    console.error("❌ Error handling request:", err);
    return res.sendStatus(200); // never fail
  }
});

/**
 * Optional GET health check
 */
app.get("/", (req, res) => {
  res.send("✅ Webhook server running");
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
