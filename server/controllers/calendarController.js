const CalendarService = require('../services/calendarService');

// Fetch upcoming events from Google Calendar
exports.getEvents = async (req, res, next) => {
  try {
    const { timeMin, timeMax } = req.query;
    const calendarService = new CalendarService(req.user);
    
    const result = await calendarService.listEvents(timeMin, timeMax);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

// Create a new event on Google Calendar
exports.createEvent = async (req, res, next) => {
  try {
    // Expected body: { title, description, location, start, end, attendees }
    const eventData = req.body;
    const calendarService = new CalendarService(req.user);
    
    const result = await calendarService.createEvent(eventData);
    
    // Return the event details and a link to view it in Google Calendar
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};