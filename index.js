const express = require("express");

const app = express();
app.use(express.json());

/* ===============================
   CONFIG
================================ */
const PORT = process.env.PORT || 3000;

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

    // If valid Instagram message
    if (contact_id && message) {
      console.log(`👤 From Instagram user ${contact_id}: ${message}`);

      /* ===============================
         AI PROCESSING
      ================================ */
      const aiResponse = `Im tryna test this AI shit rn: Im guessing u said "${message}"`;

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
    }

    // Fallback response (required by ManyChat)
    return res.status(200).json({
      version: "v2"
    });

  } catch (error) {
    console.error("❌ Instagram Webhook Error:", error);

    // Always respond 200 for ManyChat
    return res.status(200).json({
      version: "v2"
    });
  }
});

/* ===============================
   SERVER START
================================ */
app.listen(PORT, () => {
  console.log(`🚀 Instagram webhook server running on port ${PORT}`);
});
