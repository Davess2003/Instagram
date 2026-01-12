const axios = require('axios');
require("dotenv").config();
const express = require("express");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const MANYCHAT_API_KEY = process.env.MANYCHAT_API_KEY;

// 👇 CHANGE THIS TO YOUR EXISTING MANYCHAT TAG NAME
const TAG_NAME = "CUSTOMER_SUPPORT";

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

    let { contact_id, message } = req.body || {};

    // ✅ REMOVE LEADING #
    const user_id = contact_id?.replace(/^#/, "");
    console.log(user_id);
    console.log(message);

    if (user_id && message) {
      console.log(`👤 From user ${user_id}: ${message}`);

      // 1️⃣ GET EXISTING TAG ID FROM MANYCHAT
      const tagId = await getTagIdByName(TAG_NAME);

      // 2️⃣ APPLY TAG IF IT EXISTS
      if (tagId) {
        await addTagToUser(user_id, tagId);
      } else {
        console.warn(`⚠️ Tag not found: ${TAG_NAME}`);
      }

      // 3️⃣ SEND REPLY
      const replyText = `You said: "${message}"`;
      await sendMessage(user_id, replyText);
    }

    // ✅ Required by ManyChat
    return res.status(200).json({ version: "v2" });

  } catch (err) {
    console.error("❌ Error:", err);
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
 * GET TAG ID BY NAME (NO ID GENERATION)
 */
async function getTagIdByName(tagName) {
  try {
    const res = await axios.get(
      "https://api.manychat.com/fb/page/getTags",
      {
        headers: {
          Authorization: `Bearer ${MANYCHAT_API_KEY}`,
        },
      }
    );

    const tag = res.data?.data?.find(
      t => t.name === tagName
    );

    return tag ? tag.id : null;

  } catch (error) {
    console.error(
      "❌ Get tags error:",
      error.response?.data || error.message
    );
    return null;
  }
}

/**
 * ADD EXISTING TAG TO USER
 */
async function addTagToUser(contactId, tagId) {
  try {
    await axios.post(
      "https://api.manychat.com/fb/subscriber/addTag",
      {
        subscriber_id: contactId,
        tag_id: tagId,
      },
      {
        headers: {
          Authorization: `Bearer ${MANYCHAT_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log(`🏷️ Tag "${TAG_NAME}" applied to ${contactId}`);

  } catch (error) {
    console.error(
      "❌ Add tag error:",
      error.response?.data || error.message
    );
  }
}

/**
 * SEND MESSAGE TO MANYCHAT USER
 */
async function sendMessage(contactId, message) {
  try {
    await axios.post(
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
