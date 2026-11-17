require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function run() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const models = ['gemini-1.5-flash', 'gemini-1.5-flash-latest', 'gemini-pro', 'gemini-1.0-pro'];
  
  for (const m of models) {
    try {
      console.log("Testing model:", m);
      const model = genAI.getGenerativeModel({ model: m });
      const result = await model.generateContent("Say hi");
      console.log("SUCCESS for", m, "Response:", result.response.text());
      break;
    } catch (err) {
      console.error("FAILED for", m, err.message);
    }
  }
}
run();
