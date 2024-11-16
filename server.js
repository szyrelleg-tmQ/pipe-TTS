import express from 'express';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
import dotenv from "dotenv";
import { generateTokens, verifyToken, verifyApiKey } from './middleware/apiService.js';
import PiperService from './controller/piper.js';
import mongoose from 'mongoose';
import cors from 'cors';

const app = express();
const port = 5000;

dotenv.config();

app.use(cors({ origin: 'http://localhost:3000' }));

const mongoURL = 'mongodb://localhost:27017/meteor1';

// Connect to MongoDB
mongoose.connect(mongoURL)
  .then(() => console.log('Connected successfully to MongoDB'))
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
  });

// Define a schema
const Schema = mongoose.Schema;
const documentSchema = new Schema({
  name: String,
  lang: String,
  voiceURI: String,
});

// Create a model
const Document = mongoose.model('voices', documentSchema);

app.use(bodyParser.urlencoded({
    extended: true
  }));

app.use(bodyParser.json());

const USER_ID = process.env.USER_ID;


app.post('/tokens', verifyApiKey, (req, res) => {
  const { accessToken, refreshToken } = generateTokens(USER_ID);
  res.json({ accessToken, refreshToken });
});


app.post('/refreshToken', (req, res) => {
  const refreshToken = req.body.refreshToken;
  if (!refreshToken) return res.sendStatus(401);

  if (!refreshTokens.includes(refreshToken)) {
    return res.status(403).json({ message: 'Invalid refresh token' });
  }

  jwt.verify(refreshToken, REFRESH_TOKEN_SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);
    const accessToken = jwt.sign({ userId: user.userId }, JWT_SECRET_KEY, { expiresIn: '15m' });
    res.json({ accessToken }); 
  });
});


app.post('/text:synthesize', (req, res) => {
  const piperService = new PiperService(req.body);
  piperService.convertTextToAudio().then((response) => {
    if(response.success){
      res.status(200).json({ message: 'Audio file created successfully.', data: response.data });
    }
  }).catch((error) => {
    res.status(500).json({ error: error.message });
  });
  // res.json({ message: 'Access granted. You have successfully accessed the protected resource.',data:req.body});
});

app.get('/voices', async (req, res) => {
  try {
    const documents = await Document.find();
    res.json(documents);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


app.post('/add', async (req, res) => {
  const document = new Document(req.body);
  try {
    const newDocument = await document.save();
    res.status(201).json(newDocument);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
