const express = require('express');
const router = express.Router();

const { google } = require('googleapis');

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

const oauth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
);

// generate a url that asks permissions for Blogger and Google Calendar scopes
const scopes = [
    'https://www.googleapis.com/auth/calendar'
];

async function generateAuthUrl() {
    try {
        const url = await oauth2Client.generateAuthUrl({
            // 'online' (default) or 'offline' (gets refresh_token)
            access_type: 'offline',
        
            // If you only need one scope you can pass it as a string
            scope: scopes
        });
        return url;
    } catch(e) {
        throw new Error(e.message);
    }
}

async function retrieveAccessToken(authCode) {
    try {
        const {tokens} = await oauth2Client.getToken(authCode);
        oauth2Client.setCredentials(tokens);
        return tokens;
    } catch(e) {
        throw new Error(e.message);
    }
}

async function getCalendars(authToken) {
    try {
        oauth2Client.setCredentials(authToken);
        const calendar = google.calendar({
            version: 'v3',
            auth: oauth2Client
        });
        const {data: {items}} = await calendar.calendarList.list();
        return items;
    } catch(e) {
        console.error(e);
        throw new Error(e.message);
    }
}

/* GET users listing. */
router.get('/', async function (req, res, next) {
    try {
        const url = await generateAuthUrl();
        res.json({url});
    } catch(e) {
        res.end().status(400);
    }
});

router.get("/calendars", async function(req, res, next) {
    const tokens = JSON.parse(req.headers.authorization);
    try {
        const calendars = await getCalendars(tokens);
        res.json(calendars).status(200);
    } catch(e) {
        console.error(e);
        res.end().status(400);
    }
})

router.post("/access-token", async function(req, res, next) {
    try {
        const {authCode} = req.body;
        const auth = await retrieveAccessToken(authCode);
        res.json(auth).status(200);
    } catch(e) {
        console.error(e);
        res.end().status(400)
    }
})

module.exports = router;
