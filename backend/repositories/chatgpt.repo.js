const { GoogleGenAI } = require("@google/genai");

const API_KEY = "xxx";

const ai = new GoogleGenAI({ apiKey: API_KEY });

const chatbotRepo = {
  createResponse: async (contents) => {
    try {
      console.log("contents before ");
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash", // old version api  "gemini-1.5-pro",
        contents,
      });
      console.log("contents", response);
      return response.candidates[0].content.parts[0].text
        .replace(/\*\*(.*?)\*\*/g, "$1")
        .trim();
    } catch (error) {
      console.log(error);
      return null;
    }
  },
};

module.exports = chatbotRepo;
