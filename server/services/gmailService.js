const { google } = require('googleapis');
const { createOAuth2Client } = require('../config/google');

class GmailService {
  constructor(user) {
    // Initialize an OAuth2 client with the user's tokens
    this.oauth2Client = createOAuth2Client();
    this.oauth2Client.setCredentials({
      access_token: user.accessToken,
      refresh_token: user.refreshToken,
    });
    // Create the Gmail API client
    this.gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
  }

  // Fetch a list of emails with optional pagination and search query
  async fetchEmails(query = '', maxResults = 20, pageToken = null) {
    try {
      const response = await this.gmail.users.messages.list({
        userId: 'me',
        q: query,
        maxResults,
        pageToken,
      });

      const messages = response.data.messages || [];
      const nextPageToken = response.data.nextPageToken || null;

      // Fetch the full details for each message we got
      const emails = await Promise.all(
        messages.map((msg) => this.getEmailById(msg.id, 'metadata')) // Using 'metadata' to save bandwidth for lists
      );

      return { emails, nextPageToken };
    } catch (error) {
      console.error('Error fetching emails:', error);
      throw error;
    }
  }

  // Fetch a single email by its Gmail Message ID
  async getEmailById(messageId, format = 'full') {
    try {
      const response = await this.gmail.users.messages.get({
        userId: 'me',
        id: messageId,
        format: format, // 'full' for the whole email, 'metadata' for headers only
      });

      return this.parseEmailMessage(response.data, format === 'full');
    } catch (error) {
      console.error(`Error fetching email ${messageId}:`, error);
      throw error;
    }
  }

  // Parse the raw Gmail API response into a cleaner format for our frontend
  parseEmailMessage(message, includeBody = false) {
    const headers = message.payload.headers;
    
    // Helper to extract a header value
    const getHeader = (name) => {
      const header = headers.find((h) => h.name.toLowerCase() === name.toLowerCase());
      return header ? header.value : '';
    };

    // Helper to parse 'Name <email@example.com>' format
    const parseContact = (headerValue) => {
      if (!headerValue) return [];
      return headerValue.split(',').map(contact => {
        const match = contact.match(/(.*?)<(.+?)>/);
        if (match) {
          return { name: match[1].trim().replace(/"/g, ''), email: match[2].trim() };
        }
        return { name: contact.trim(), email: contact.trim() }; // Fallback
      });
    };

    const fromContact = parseContact(getHeader('From'))[0] || { name: 'Unknown', email: '' };

    const parsedEmail = {
      id: message.id, // We use the Gmail ID as our main identifier!
      threadId: message.threadId,
      from: fromContact,
      to: parseContact(getHeader('To')),
      subject: getHeader('Subject') || '(No Subject)',
      snippet: message.snippet,
      date: new Date(Number(message.internalDate)).toISOString(),
      isRead: !message.labelIds.includes('UNREAD'),
      isStarred: message.labelIds.includes('STARRED'),
      isImportant: message.labelIds.includes('IMPORTANT'),
      labels: message.labelIds,
    };

    if (includeBody) {
      // Decode the email body (base64url format from Gmail)
      let text = '';
      let html = '';

      const extractParts = (parts) => {
        if (!parts) return;
        parts.forEach((part) => {
          if (part.mimeType === 'text/plain' && part.body.data) {
            text += Buffer.from(part.body.data, 'base64').toString('utf-8');
          } else if (part.mimeType === 'text/html' && part.body.data) {
            html += Buffer.from(part.body.data, 'base64').toString('utf-8');
          } else if (part.parts) {
            extractParts(part.parts); // Recursively extract from multipart emails
          }
        });
      };

      if (message.payload.parts) {
        extractParts(message.payload.parts);
      } else if (message.payload.body && message.payload.body.data) {
        // Handle single part emails
        if (message.payload.mimeType === 'text/html') {
          html = Buffer.from(message.payload.body.data, 'base64').toString('utf-8');
        } else {
          text = Buffer.from(message.payload.body.data, 'base64').toString('utf-8');
        }
      }
      
      parsedEmail.body = { text, html };
    }

    return parsedEmail;
  }

  // Send a reply to an email thread
  async sendEmail(to, subject, body, threadId = null) {
    try {
      const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
      const messageParts = [
        `To: ${to}`,
        'Content-Type: text/html; charset=utf-8',
        'MIME-Version: 1.0',
        `Subject: ${utf8Subject}`,
        '',
        body,
      ];
      
      const message = messageParts.join('\n');
      const encodedMessage = Buffer.from(message)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, ''); // Base64url encoding required by Gmail

      const requestBody = { raw: encodedMessage };
      if (threadId) {
        requestBody.threadId = threadId; // Attach to an existing thread
      }

      const response = await this.gmail.users.messages.send({
        userId: 'me',
        requestBody,
      });

      return response.data;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }
}

module.exports = GmailService;