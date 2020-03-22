const express = require('express');
const router = express.Router();

const { google } = require('googleapis');

const oauth2Client = new google.auth.OAuth2(
    "",
    "",
    "https://13db125b.ngrok.io/calendar"
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
        const {tokens} = await oauth2Client.getToken(authCode)
        console.log(tokens)
        oauth2Client.setCredentials(tokens);
    } catch(e) {
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

router.post("/access-token", async function(req, res, next) {
    try {
        const {authCode} = req.body;
        await retrieveAccessToken(authCode);
        res.end().status(200);
    } catch(e) {
        res.end().status(400)
    }
})

module.exports = router;
