// Import existing packages from your current environment
require("dotenv").config();
const apiKey = process.env.API_KEY;  // Now your API is hidden 🔥

const { GoogleGenerativeAI } = require("@google/generative-ai");
const express = require("express");
const path = require("path");
const cors = require("cors"); // Adding CORS

// Setup Express server
const app = express();
const PORT = process.env.PORT || 3000;

// Use your existing API key 

const genAI = new GoogleGenerativeAI(apiKey);

// Middleware
app.use(cors()); // Enable CORS
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

// Create the generative model client with your existing configuration
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-pro",
});

// Use your existing generation config
const generationConfig = {
  temperature: 0.9,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 512,
  responseMimeType: "application/json",

};

// Chat API endpoint
app.post("/api/chat", async (req, res) => {
  const userMessage = req.body.message;

  if (!userMessage) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    const parts = [{ text: userMessage }];

    const result = await model.generateContent({
      contents: [{ role: "user", parts }],
      generationConfig,
    });

    const botResponse = result.response.text();
    res.json({ reply: botResponse });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to generate response", details: error.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`🎯 Student Chatbot Server running on http://localhost:${PORT}`);
});

