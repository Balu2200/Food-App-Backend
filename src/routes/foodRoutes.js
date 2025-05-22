const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { ImageAnnotatorClient } = require("@google-cloud/vision");

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Decode base64 credentials and write to a file only once
const base64Credentials = process.env.GOOGLE_APPLICATION_CREDENTIALS_BASE64;
const credentialsPath = path.join(__dirname, "../google-credentials.json");

if (base64Credentials) {
  if (!fs.existsSync(credentialsPath)) {
    const decoded = Buffer.from(base64Credentials, "base64").toString("utf8");
    fs.writeFileSync(credentialsPath, decoded);
    console.log("Google credentials file created");
  } else {
    console.log("Google credentials file already exists");
  }

  // Set environment variable that Google Vision SDK expects
  process.env.GOOGLE_APPLICATION_CREDENTIALS = credentialsPath;
}

// Initialize Google Vision client
const client = new ImageAnnotatorClient();

router.post("/detect-food", upload.single("image"), async (req, res) => {
  console.log("Image route called");

  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    console.log("Received file:", req.file.mimetype, req.file.size);

    const [result] = await client.labelDetection(req.file.buffer);
    const labels = result.labelAnnotations || [];

    if (labels.length > 0) {
      return res.json({
        labels: labels.slice(0, 5).map((label) => ({
          description: label.description,
          confidence: label.score,
        })),
      });
    } else {
      return res.status(404).json({ error: "No labels detected." });
    }
  } catch (err) {
    console.error("Error detecting food:", err);
    res.status(500).json({ error: "Error processing image." });
  }
});

module.exports = router;
