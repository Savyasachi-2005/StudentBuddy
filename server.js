// Import existing packages from your current environment
require("dotenv").config();
const apiKey = process.env.API_KEY;  // Now your API is hidden 🔥

const { GoogleGenerativeAI } = require("@google/generative-ai");
const express = require("express");
const path = require("path");
const cors = require("cors"); // Adding CORS

// Required for removing markup
const striptags = require("striptags");
const removeMarkdown = require("remove-markdown");

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
  responseMimeType: "text/plain",
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

    // Improved error handling
    if (!result || !result.response) {
      throw new Error("Invalid API Response: No response from Gemini AI.");
    }

    let botResponse = result.response.candidates[0]?.content?.parts[0]?.text || "Sorry, I couldn’t generate a response.";

    if (!botResponse) {
      throw new Error("Empty response received from Gemini AI.");
    }

    // Remove any markup before sending response
     botResponse = striptags(botResponse, ["br", "p"])  // Keep paragraph & line breaks
                      .replace(/\n{2,}/g, "\n")  // Remove excessive new lines
                      .trim();

    botResponse = removeMarkdown(botResponse); // Remove markdown but keep AI response format

    res.json({ reply: botResponse });
  } catch (error) {
    console.error("Error occurred:", error);

    // Categorizing errors
    if (error.message.includes("Invalid API Key")) {
      return res.status(403).json({ error: "Invalid API Key. Check your API key." });
    } else if (error.message.includes("quota")) {
      return res.status(429).json({ error: "Quota limit reached. Upgrade your API plan or try later." });
    } else if (error.message.includes("network")) {
      return res.status(500).json({ error: "Network error. Please check your internet connection or API status." });
    } else if (error.message.includes("Empty response")) {
      return res.status(500).json({ error: "AI model returned an empty response. Try rephrasing your question." });
    } else {
      return res.status(500).json({ error: "Failed to generate response", details: error.message });
    }
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`🎯 Student Chatbot Server running on http://localhost:${PORT}`);
});
