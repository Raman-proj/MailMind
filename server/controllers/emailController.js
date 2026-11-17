const GmailService = require('../services/gmailService');

// Fetch a paginated list of emails
exports.getEmails = async (req, res, next) => {
  try {
    const { maxResults, pageToken, q } = req.query;
    
    // Instantiate our GmailService with the current user's tokens
    const gmailService = new GmailService(req.user);
    
    const result = await gmailService.fetchEmails(
      q || '',
      maxResults ? parseInt(maxResults, 10) : 20,
      pageToken
    );
    
    res.json(result); // Returns { emails: [...], nextPageToken }
  } catch (error) {
    next(error); // Pass to our error handling middleware
  }
};

// Fetch a single email's full details and body
exports.getEmailById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const gmailService = new GmailService(req.user);
    
    const email = await gmailService.getEmailById(id, 'full');
    res.json(email);
  } catch (error) {
    next(error);
  }
};

// Send a reply via Gmail
exports.sendReply = async (req, res, next) => {
  try {
    const { id } = req.params; // We might use this to reply to a specific message
    const { to, subject, body, threadId } = req.body;
    
    const gmailService = new GmailService(req.user);
    
    // We send the reply directly through Google's API
    const result = await gmailService.sendEmail(to, subject, body, threadId);
    
    res.json({ message: 'Reply sent successfully', result });
  } catch (error) {
    next(error);
  }
};