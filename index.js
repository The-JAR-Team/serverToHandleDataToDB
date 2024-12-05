
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

mongoose.set('strictQuery', true);

const sessionSchema = new mongoose.Schema(
  {
    userProfile: String,
    lectureTitle: String,
    durationMinutes: Number,
    startTime: String,
    focusPercentage: Number,
    totalUnfocusedTimeMs: Number,
    focusIntervals: Array,
    chartData: Object,
  },
  { timestamps: true }
);

const Session = mongoose.model('Session', sessionSchema);

app.get('/', (req, res) => {
  res.send('Hello, the server is running!');
});

app.get('/api/sessions', async (req, res) => {
  try {
    const sessions = await Session.find({});
    res.status(200).json(sessions);
  } catch (error) {
    console.error('Error retrieving sessions:', error);
    res.status(500).json({ error: 'Failed to retrieve sessions.' });
  }
});


app.post('/api/sessions', async (req, res) => {
  try {
    const sessionData = req.body;

    console.log('Received session data:', sessionData);

    if (!sessionData.user || !sessionData.user.profile) {
      throw new Error('User profile is missing');
    }
    if (!sessionData.lecture || !sessionData.lecture.title) {
      throw new Error('Lecture title is missing');
    }
    if (
      !sessionData.summary ||
      typeof sessionData.summary.total_unfocused_time_ms === 'undefined'
    ) {
      throw new Error('Summary data is missing');
    }

    const session = new Session({
      userProfile: sessionData.user.profile,
      lectureTitle: sessionData.lecture.title,
      durationMinutes: sessionData.lecture.duration_minutes,
      startTime: sessionData.lecture.start_time,
      focusPercentage: sessionData.focusPercentage,
      totalUnfocusedTimeMs: sessionData.summary.total_unfocused_time_ms,
      focusIntervals: sessionData.summary.focus_intervals,
      chartData: sessionData.chartData,
    });

    await session.save();
    res.status(201).json({ message: 'Session data saved successfully.' });
  } catch (error) {
    console.error('Error saving session data:', error);
    res.status(500).json({ error: error.message });
  }
});

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected successfully.');
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
