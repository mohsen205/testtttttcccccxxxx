const admin = require("firebase-admin");

const serviceAccount = require("../config/serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "gs://eductive-lesson-8d897.appspot.com", // process.env.STORAGE_BUCKET
});

const storage = admin.storage();

const bucket = storage.bucket();

const functions = require("firebase-functions");

const db = admin.firestore();

const axios = require("axios");

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_ADDRESS,
    pass: process.env.EMAIL_PASSWORD,
  },
});

module.exports = { admin, db, axios, functions, transporter, bucket, storage };
