// src/index.js
import React, { useEffect } from "react";
function BackgroundPreview({ apiKey }) {
  useEffect(() => {
    const testConnection = async () => {
      const prompt = "Respond ONLY with the word 'CONNECTED' if you receive this.";
      console.log("Testing Gemini Connection...");
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }]
            })
          }
        );
        const data = await response.json();
        if (data.candidates && data.candidates[0]) {
          console.log("Gemini Response:", data.candidates[0].content.parts[0].text);
        } else {
          console.error("Unexpected Gemini Response Format:", data);
        }
      } catch (err) {
        console.error("Gemini Connection Failed:", err);
      }
    };
    if (apiKey) {
      testConnection();
    } else {
      console.warn("Gemini API Key is missing. Skipping connection test.");
    }
  }, [apiKey]);
  return /* @__PURE__ */ React.createElement("div", {
    style: {
      color: "#00ff00",
      fontFamily: "monospace",
      padding: "20px",
      background: "#000",
      height: "100%"
    }
  }, "[SYSTEM] GEMINI CONNECTION TEST ACTIVE...", /* @__PURE__ */ React.createElement("br", null), "[INFO] CHECK CONSOLE FOR RESULTS.");
}
export {
  BackgroundPreview as default
};
