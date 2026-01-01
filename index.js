require("dotenv").config();
const express = require("express");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

/**
 * HEAD requests (ManyChat health check)
 * MUST return 200 with no body
 */
app.head("/webhook/instagram", (req, res) => {
  console.log("🔎 HEAD request received (health check)");
  return res.sendStatus(200);
});

/**
 * POST requests (ManyChat External Request)
 */
app.post("/webhook/instagram", (req, res) => {
  try {
    console.log("📩 External Request received");
    console.log("Headers:", req.headers);
    console.log("Body:", JSON.stringify(req.body, null, 2));

    const { user_id, message } = req.body || {};

    if (message) {
      console.log("From user:", user_id);
      console.log("Message:", message);
    }

    // ✅ VALID ManyChat empty response
    return res.status(200).json({
      version: "v2"
      // no content = no message sent
    });

  } catch (err) {
    console.error("❌ Error handling request:", err);

    // NEVER fail automation
    return res.status(200).json({
      version: "v2"
    });
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
