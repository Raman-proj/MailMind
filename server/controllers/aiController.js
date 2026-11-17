const geminiService = require('../services/geminiService');
const GmailService = require('../services/gmailService');

// Fetch an email and analyze it with AI
exports.analyzeEmail = async (req, res, next) => {
  try {
    const { emailId } = req.params;
    
    // 1. Fetch the full email content from Gmail
    const gmailService = new GmailService(req.user);
    const email = await gmailService.getEmailById(emailId, 'full');
    
    // Use the plain text version if available, otherwise strip HTML from the HTML version
    const textBody = email.body?.text?.trim();
    const htmlBody = email.body?.html ? email.body.html.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim() : '';
    const contentToAnalyze = textBody || htmlBody || email.snippet || 'Empty email';

    // 2. Ask Gemini to analyze the content
    const analysis = await geminiService.analyzeEmail(contentToAnalyze, email.date);
    
    // We return the structured JSON straight to the frontend! No DB storage needed.
    res.json(analysis);
  } catch (error) {
    next(error);
  }
};

// Generate a suggested reply
exports.generateReply = async (req, res, next) => {
  try {
    const { emailId } = req.params;
    const { tone } = req.body;
    
    const gmailService = new GmailService(req.user);
    const email = await gmailService.getEmailById(emailId, 'full');
    
    const textBody = email.body?.text?.trim();
    const htmlBody = email.body?.html ? email.body.html.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim() : '';
    const contentToAnalyze = textBody || htmlBody || email.snippet || 'Empty email';
    
    const reply = await geminiService.generateReply(contentToAnalyze, tone || 'professional');
    
    res.json(reply);
  } catch (error) {
    next(error);
  }
};