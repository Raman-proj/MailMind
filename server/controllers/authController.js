const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { createOAuth2Client, SCOPES } = require('../config/google');
const { google } = require('googleapis');

// 1. Redirect user to Google for login
exports.googleRedirect = (req, res) => {
  const oauth2Client = createOAuth2Client();
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline', // Request a refresh token
    prompt: 'consent', // Force consent screen to always get a refresh token
    scope: SCOPES,
  });
  res.redirect(authUrl);
};

// 2. Handle Google's callback with the authorization code
exports.googleCallback = async (req, res) => {
  const { code } = req.query;
  try {
    const oauth2Client = createOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Fetch user profile info from Google
    const oauth2 = google.oauth2({ auth: oauth2Client, version: 'v2' });
    const userInfo = await oauth2.userinfo.get();

    // Create or update the user in our database
    let user = await User.findOne({ googleId: userInfo.data.id });
    if (!user) {
      user = new User({
        googleId: userInfo.data.id,
        name: userInfo.data.name,
        email: userInfo.data.email,
        profilePicture: userInfo.data.picture,
      });
    }

    // Always update tokens (especially access token which expires often)
    user.accessToken = tokens.access_token;
    if (tokens.refresh_token) {
      user.refreshToken = tokens.refresh_token;
    }
    await user.save();

    // Create a JWT session token for our app
    const sessionToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    // Set it as an HTTP-only cookie for security
    res.cookie('token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Redirect to frontend
    res.redirect(process.env.CLIENT_URL);
  } catch (error) {
    console.error('Google Auth Error:', error);
    res.redirect(`${process.env.CLIENT_URL}/login?error=auth_failed`);
  }
};

// 3. Get the currently logged-in user's profile
exports.getMe = async (req, res) => {
  // req.user is populated by our auth middleware
  res.json({ user: req.user });
};

// 4. Log out by clearing the cookie
exports.logout = (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
};