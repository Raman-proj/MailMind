# AI-Powered Email Assistant

A full-stack MERN application that intelligently parses emails, detects meeting requests, auto-schedules calendar events with reminders, and generates AI-powered smart replies using Google Gemini.

## Architecture

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   React +    │────▶│  Express.js  │────▶│   MongoDB    │
│   Vite       │◀────│  Node.js     │◀────│              │
│   (Client)   │     │  (Server)    │     │              │
└──────────────┘     └──────┬───────┘     └──────────────┘
                            │
                 ┌──────────┼──────────┐
                 ▼          ▼          ▼
           ┌──────────┐ ┌────────┐ ┌──────────┐
           │ Gmail   │ │Google  │ │  Gemini  │
           │  API    │ │Calendar│ │   API    │
           └──────────┘ │  API   │ └──────────┘
                        └────────┘
```

## Tech Stack

| Layer       | Technology                  |
|-------------|-----------------------------|
| Frontend    | React 18 + Vite 5          |
| Styling     | Plain CSS (premium dark UI) |
| Backend     | Express.js + Node.js       |
| Database    | MongoDB (Mongoose)          |
| Auth        | Google OAuth 2.0 + JWT      |
| AI Engine   | Google Gemini 1.5 Flash     |
| Email       | Gmail API                  |
| Calendar    | Google Calendar API         |

## Features

- **Smart Email Parsing** — Fetches and parses emails from Gmail
- **AI Meeting Detection** — Gemini AI identifies meeting requests
- **Auto-Scheduling** — Creates Google Calendar events with 24h & 1h reminders
- **AI Reply Generation** — Context-aware reply suggestions
- **Regex Fallback** — Parser extracts date/time/location without AI
- **Dashboard Analytics** — Stats on emails, meetings, AI analysis
- **Calendar View** — Monthly grid with event display
- **Premium Dark UI** — Hand-crafted CSS, no framework dependency

## Setup Instructions

### 1. Prerequisites

- Node.js 18+
- MongoDB running locally or MongoDB Atlas URI
- Google Cloud Platform account
- Gemini API key

### 2. Google Cloud Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project (or select existing)
3. Enable these APIs:
   - Gmail API
   - Google Calendar API
   - People API (for user info)
4. Go to **APIs & Services → Credentials**
5. Create **OAuth 2.0 Client ID** (Web application)
   - Add `http://localhost:5173/auth/callback` to **Authorized redirect URIs**
   - Add `http://localhost:5000/api/auth/google/callback` as well
   - Note your **Client ID** and **Client Secret**
6. Get your **Gemini API Key** from [Google AI Studio](https://aistudio.google.com/app/apikey)

### 3. Install Dependencies

```bash
cd ai-email-assistant
npm run install:all
```

### 4. Configure Environment

```bash
# Server
cp server/.env.example server/.env
```

Edit `server/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ai-email-assistant
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=http://localhost:5000/api/auth/google/callback
GEMINI_API_KEY=your_gemini_api_key
JWT_SECRET=generate_a_random_string_here
CLIENT_URL=http://localhost:5173
```

```bash
# Client
cp client/.env.example client/.env
```

Edit `client/.env`:

```env
VITE_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
VITE_GOOGLE_REDIRECT_URI=http://localhost:5173/auth/callback
```

### 5. Run the App

```bash
# Development (both servers)
npm run dev

# Or separately:
npm run dev:server   # http://localhost:5000
npm run dev:client   # http://localhost:5173
```

### 6. Build for Production

```bash
npm run build
```

Serve the `client/dist` folder with your preferred static file server.

## Project Structure

```
ai-email-assistant/
├── package.json                 # Root scripts
├── README.md
├── server/
│   ├── server.js                # Express entry point
│   ├── package.json
│   ├── .env.example
│   ├── config/
│   │   ├── db.js                # MongoDB connection
│   │   └── google.js            # Google OAuth + API clients
│   ├── models/
│   │   ├── User.js              # User schema
│   │   ├── Email.js             # Email schema with AI analysis
│   │   └── CalendarEvent.js     # Calendar event schema
│   ├── controllers/
│   │   ├── authController.js    # Google OAuth login
│   │   ├── emailController.js   # Email CRUD + Gmail sync
│   │   ├── aiController.js      # Gemini analysis + replies
│   │   └── calendarController.js # Calendar operations + auto-schedule
│   ├── routes/
│   │   ├── auth.js
│   │   ├── emails.js
│   │   ├── ai.js
│   │   └── calendar.js
│   ├── services/
│   │   ├── gmailService.js      # Gmail API wrapper
│   │   ├── calendarService.js   # Google Calendar wrapper
│   │   ├── geminiService.js     # Gemini AI wrapper
│   │   └── emailParser.js       # Regex-based email parsing
│   └── middleware/
│       ├── auth.js              # JWT auth middleware
│       └── errorHandler.js      # Global error handler
└── client/
    ├── package.json
    ├── vite.config.js
    ├── index.html
    ├── .env.example
    └── src/
        ├── main.jsx             # React entry
        ├── App.jsx              # Routes + auth guard
        ├── index.css            # Complete design system (plain CSS)
        ├── context/
        │   └── AuthContext.jsx   # Auth state management
        ├── services/
        │   └── api.js            # API client (all endpoints)
        ├── components/
        │   ├── Sidebar.jsx       # Navigation sidebar
        │   ├── Topbar.jsx        # Top bar with search + sync
        │   └── EmailCard.jsx     # Email list item
        └── pages/
            ├── Login.jsx        # Google OAuth login
            ├── Dashboard.jsx    # Stats + recent emails
            ├── Emails.jsx       # Full email list with filters
            ├── EmailDetail.jsx  # Email view + AI analysis + reply
            ├── Calendar.jsx     # Monthly calendar + events
            └── Settings.jsx     # User preferences
```

## API Endpoints

| Method | Endpoint                         | Description                        |
|--------|----------------------------------|------------------------------------|
| POST   | /api/auth/google                 | Google OAuth login                  |
| GET    | /api/auth/me                     | Get current user                   |
| POST   | /api/auth/logout                 | Logout                             |
| GET    | /api/emails                      | List emails (paginated, filterable) |
| GET    | /api/emails/:id                  | Get single email                   |
| POST   | /api/emails/sync                 | Sync emails from Gmail              |
| POST   | /api/emails/:id/reply            | Send reply via Gmail                |
| POST   | /api/ai/analyze/:emailId         | Analyze email with Gemini           |
| POST   | /api/ai/generate-reply/:emailId  | Generate AI reply                   |
| GET    | /api/calendar/events             | List calendar events                |
| POST   | /api/calendar/events             | Create calendar event               |
| POST   | /api/calendar/auto-schedule/:id  | Auto-schedule meeting from email    |

## License
MIT
