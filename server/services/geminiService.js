const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Candidate models in priority order: user override -> gemini-3.1-flash-lite -> gemini-3.8-flash -> gemini-3.5-flash
const CANDIDATE_MODELS = [
  process.env.GEMINI_MODEL,
  'gemini-3.1-flash-lite',
  'gemini-3.8-flash',
  'gemini-3.5-flash'
].filter(Boolean);

class GeminiService {
  constructor() {
    this._genAI = null;
  }

  get client() {
    if (!this._genAI) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('GEMINI_API_KEY is not configured in server/.env');
      }
      this._genAI = new GoogleGenerativeAI(apiKey);
    }
    return this._genAI;
  }

  // Executes generateContent with fallback across candidate models if one is busy (503), rate-limited (429), or deprecated (404)
  async generateWithFallback(optionsOrPrompt) {
    let lastError = null;

    // Remove duplicates from candidate list while preserving order
    const uniqueModels = [...new Set(CANDIDATE_MODELS)];

    for (const modelName of uniqueModels) {
      try {
        const model = this.client.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(optionsOrPrompt);
        return result;
      } catch (err) {
        lastError = err;
        const msg = (err.message || '').toLowerCase();
        
        // If the model is not found, unsupported, busy (503), or rate-limited (429), try the next candidate
        const isRecoverable =
          msg.includes('404') ||
          msg.includes('not found') ||
          msg.includes('is not supported') ||
          msg.includes('503') ||
          msg.includes('service unavailable') ||
          msg.includes('high demand') ||
          msg.includes('429') ||
          msg.includes('too many requests') ||
          err.status === 503 ||
          err.status === 429;

        if (isRecoverable) {
          console.warn(`Gemini model "${modelName}" unavailable (${err.message.substring(0, 100)}), trying next candidate...`);
          continue;
        }

        // For fatal errors (e.g. invalid key), throw immediately
        throw err;
      }
    }

    throw lastError || new Error('No candidate Gemini model succeeded.');
  }

  // Analyzes an email to extract intent, priority, and meeting details
  async analyzeEmail(emailContent, emailDate = new Date().toISOString()) {
    const prompt = `
    Analyze the following email content and extract key information.
    The email was sent on: ${emailDate}.
    CRITICAL INSTRUCTION: Use the email's sent date to determine the correct year for any dates mentioned in the email. If the email mentions a month and day (e.g. "August 14") without a year, you MUST use the year from the email's sent date.

    Provide the output STRICTLY as a JSON object matching the format below.
    Do not include markdown blocks like \`\`\`json, just the raw JSON text.

    Format:
    {
      "summary": "A short 1-sentence summary of the email",
      "intent": "One of: general, question, request, meeting_request, follow_up, notification, job_opportunity, important, other",
      "actionRequired": "A short suggestion on what the user should do next",
      "priority": "One of: low, medium, high",
      "meeting": {
        "isMeeting": boolean (true if a meeting is proposed or discussed),
        "title": "Suggested meeting title (or null)",
        "date": "YYYY-MM-DD (or null)",
        "time": "HH:MM in 24hr format (or null)",
        "durationMinutes": integer (estimated duration in minutes, default 30, or null),
        "location": "Meeting link or physical location (or null)",
        "meetingLink": "Video call link if present (or null)",
        "attendees": ["list of email addresses to invite"]
      }
    }

    Email Content:
    ${emailContent}
    `;

    try {
      const result = await this.generateWithFallback({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      });
      const responseText = result.response.text();
      
      // Strip markdown code fences if model wrapped response in ```json ... ```
      let cleanText = responseText.trim();
      if (cleanText.startsWith('```')) {
        cleanText = cleanText.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();
      }

      return JSON.parse(cleanText);
    } catch (error) {
      console.error('Error analyzing email with Gemini:', error);
      throw new Error(error.message || 'Failed to analyze email content.');
    }
  }

  // Generates a contextual reply to an email based on a specified tone
  async generateReply(emailContent, tone) {
    const prompt = `
    Write a reply to the following email.
    The tone of the reply should be: ${tone}.
    Keep it natural, professional, and directly address the points in the original email.
    Do NOT include subject lines or placeholders like [Your Name]. Just write the body of the email.

    Original Email:
    ${emailContent}
    `;

    try {
      const result = await this.generateWithFallback(prompt);
      return { reply: result.response.text().trim() };
    } catch (error) {
      console.error('Error generating reply with Gemini:', error);
      throw new Error(error.message || 'Failed to generate reply.');
    }
  }
}

module.exports = new GeminiService();
