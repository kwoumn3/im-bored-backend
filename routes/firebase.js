const express = require('express');
const router = express.Router();

var admin = require("firebase-admin");

var serviceAccount = require("/Users/ashleyt/Downloads/im-bored-d4aa9-firebase-adminsdk-ig9y1-7d573f9ed7.json");

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