const express = require('express');
const auth = require('../middleware/auth');
const PostureSession = require('../models/PostureSession');
const { detectPosture } = require('../services/postureDetection');
const router = express.Router();

// Start a new posture monitoring session
router.post('/sessions', auth, async (req, res) => {
  try {
    const newSession = new PostureSession({
      user: req.user.id,
      startTime: new Date(),
      endTime: new Date(), // Will be updated when session ends
      postureScore: 100 // Initial score
    });

    const session = await newSession.save();
    res.json(session);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// End a posture monitoring session
router.put('/sessions/:id/end', auth, async (req, res) => {
  try {
    const { totalAlerts, incorrectPostures, postureScore } = req.body;
    
    let session = await PostureSession.findById(req.params.id);
    
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    
    // Check if session belongs to user
    if (session.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    // Update session
    session.endTime = new Date();
    session.totalAlerts = totalAlerts || session.totalAlerts;
    session.incorrectPostures = incorrectPostures || session.incorrectPostures;
    session.postureScore = postureScore || session.postureScore;
    
    await session.save();
    res.json(session);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Analyze posture from image data
router.post('/analyze', auth, async (req, res) => {
  try {
    const { imageData, sessionId } = req.body;
    
    // Process the image data using the posture detection service
    const result = detectPosture(imageData);
    
    // If there's an active session, record the alert if needed
    if (sessionId && !result.isGoodPosture) {
      let session = await PostureSession.findById(sessionId);
      
      if (session && session.user.toString() === req.user.id) {
        session.totalAlerts += 1;
        session.incorrectPostures.push(result.postureType);
        session.postureScore = Math.max(0, session.postureScore - 5);
        await session.save();
      }
    }
    
    res.json(result);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Record a posture alert
router.post('/sessions/:id/alerts', auth, async (req, res) => {
  try {
    const { postureType } = req.body;
    
    let session = await PostureSession.findById(req.params.id);
    
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    
    // Check if session belongs to user
    if (session.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    // Update session
    session.totalAlerts += 1;
    session.incorrectPostures.push(postureType);
    // Reduce score for each alert, but keep it between 0-100
    session.postureScore = Math.max(0, session.postureScore - 5);
    
    await session.save();
    res.json(session);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get user's posture history
router.get('/history', auth, async (req, res) => {
  try {
    const sessions = await PostureSession.find({ user: req.user.id })
      .sort({ startTime: -1 });
    res.json(sessions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get posture statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const sessions = await PostureSession.find({ user: req.user.id });
    
    if (sessions.length === 0) {
      return res.json({
        averageScore: 0,
        bestScore: 0,
        latestScore: 0,
        totalSessions: 0,
        totalTime: 0,
        improvement: 0
      });
    }
    
    // Calculate statistics
    const totalSessions = sessions.length;
    const averageScore = sessions.reduce((sum, session) => sum + session.postureScore, 0) / totalSessions;
    const bestScore = Math.max(...sessions.map(session => session.postureScore));
    const latestScore = sessions[0].postureScore;
    
    // Calculate total monitoring time in minutes
    const totalTime = sessions.reduce((sum, session) => {
      const duration = new Date(session.endTime) - new Date(session.startTime);
      return sum + duration / (1000 * 60); // Convert ms to minutes
    }, 0);
    
    // Calculate improvement (if at least 2 sessions)
    let improvement = 0;
    if (totalSessions >= 2) {
      const oldestScore = sessions[sessions.length - 1].postureScore;
      improvement = ((latestScore - oldestScore) / oldestScore) * 100;
    }
    
    res.json({
      averageScore,
      bestScore,
      latestScore,
      totalSessions,
      totalTime,
      improvement
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
