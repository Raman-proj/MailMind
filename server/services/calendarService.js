const { google } = require('googleapis');
const { createOAuth2Client } = require('../config/google');

class CalendarService {
  constructor(user) {
    this.oauth2Client = createOAuth2Client();
    this.oauth2Client.setCredentials({
      access_token: user.accessToken,
      refresh_token: user.refreshToken,
    });
    this.calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
  }

  // Fetch upcoming events from the user's primary calendar
  async listEvents(timeMin, timeMax) {
    try {
      const response = await this.calendar.events.list({
        calendarId: 'primary', // Use the user's default calendar
        timeMin: timeMin || new Date().toISOString(),
        timeMax: timeMax, // Optional
        maxResults: 50,
        singleEvents: true,
        orderBy: 'startTime',
      });
      return { events: response.data.items };
    } catch (error) {
      console.error('Error listing calendar events:', error);
      throw error;
    }
  }

  // Create a new event on the user's calendar
  async createEvent(eventData) {
    try {
      const { title, description, location, start, end, attendees } = eventData;

      const event = {
        summary: title,
        location: location || '',
        description: description || '',
        start: {
          dateTime: start.dateTime,
          timeZone: 'UTC', // Defaulting to UTC for simplicity
        },
        end: {
          dateTime: end.dateTime,
          timeZone: 'UTC',
        },
        attendees: attendees || [],
      };

      const response = await this.calendar.events.insert({
        calendarId: 'primary',
        resource: event,
        sendUpdates: 'all', // Send notifications to attendees
      });

      return {
        event: response.data,
        htmlLink: response.data.htmlLink, // Link to view the event in Google Calendar
      };
    } catch (error) {
      console.error('Error creating calendar event:', error);
      throw error;
    }
  }
}

module.exports = CalendarService;