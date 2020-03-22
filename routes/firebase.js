const express = require('express');
const router = express.Router();

var admin = require("firebase-admin");

const FIREBASE_TYPE = process.env.FIREBASE_TYPE;
const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID;
const FIREBASE_PRIVATE_KEY_ID = process.env.FIREBASE_PRIVATE_KEY_ID;
const FIREBASE_PRIVATE_KEY = process.env.FIREBASE_PRIVATE_KEY;
const FIREBASE_CLIENT_EMAIL = process.env.FIREBASE_CLIENT_EMAIL;
const FIREBASE_CLIENT_ID = process.env.FIREBASE_CLIENT_ID;
const FIREBASE_AUTH_URI = process.env.FIREBASE_AUTH_URI;
const FIREBASE_TOKEN_URI = process.env.FIREBASE_TOKEN_URI;
const FIREBASE_AUTH_PROVIDER_X509_CERT_URL = process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL;
const FIREBASE_CLIENT_X509_CERT_URL = process.env.FIREBASE_CLIENT_X509_CERT_URL;

const serviceAccount = {
    "type": FIREBASE_TYPE,
    "project_id": FIREBASE_PROJECT_ID,
    "private_key_id": FIREBASE_PRIVATE_KEY_ID,
    "private_key": FIREBASE_PRIVATE_KEY,
    "client_email": FIREBASE_CLIENT_EMAIL,
    "client_id": FIREBASE_CLIENT_ID,
    "auth_uri": FIREBASE_AUTH_URI,
    "token_uri": FIREBASE_TOKEN_URI,
    "auth_provider_x509_cert_url": FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
    "client_x509_cert_url": FIREBASE_CLIENT_X509_CERT_URL
  }

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://im-bored-d4aa9.firebaseio.com"
});

const db = admin.database();
const auth = admin.auth();

async function createUser(email) 
{
    try{
        const { uid } = await auth.createUser({email})
        const newUserRef = db.ref(`/users/${uid}`)
        newUserRef.update({email})
    }
    catch(e){
        throw new Error(e.message)
    }
}

async function setToken(uid, token){
    try{
        const newUserRef = db.ref(`/users/${uid}`)
        newUserRef.update({token})
    }
    catch(e){
        throw new Error(e.message)
    }
}

async function getToken(uid){
    try{
        const token = await (await db.ref(`/users/${uid}/token`).once("value")).val()
        return token
    }
    catch(e){
        throw new Error(e.message)
    }
}

router.post("/user", async function(req, res, next) {
    try {
        const {email} = req.body;
        await createUser(email);
        res.end().status(200);
    } catch(e) {
        res.end().status(400)
    }
})

router.post("/token", async function(req, res, next){
    try {
        const {token, uid} = (req.body);
        await setToken(uid, token);
        res.end().status(200);
    } catch(e) {
        res.end().status(400)
    }
})

router.get("/token", async function(req, res, next){
    try {
        const {uid} = (req.query);
        const token = await getToken(uid);
        const parsedToken = JSON.parse(token)
        res.json(parsedToken).status(200);
    } catch(e) {
        res.end().status(400)
    }
})

module.exports = router;