/**
 * Test server for AI features in canvas-editor
 * This is a minimal Express server to handle AI requests during development
 */

const express = require('express');
const { generateOutline, analyzeText } = require('./ai-service');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// API routes
app.post('/api/ai/outline', async (req, res) => {
  try {
    const { topic, criteria } = req.body;
    
    if (!topic) {
      return res.status(400).json({ message: 'Topic is required' });
    }
    
    const result = await generateOutline(topic, criteria);
    res.json(result);
  } catch (error) {
    console.error('Error generating outline:', error);
    res.status(500).json({ message: 'Failed to generate outline', error: error.message });
  }
});

app.post('/api/ai/analyze', async (req, res) => {
  try {
    const { text, analysisType } = req.body;
    
    if (!text) {
      return res.status(400).json({ message: 'Text is required' });
    }
    
    if (!analysisType) {
      return res.status(400).json({ message: 'Analysis type is required' });
    }
    
    const result = await analyzeText(text, analysisType);
    res.json(result);
  } catch (error) {
    console.error('Error analyzing text:', error);
    res.status(500).json({ message: 'Failed to analyze text', error: error.message });
  }
});

// Static file serving - for testing only
app.use(express.static(path.join(__dirname, '../')));

// Start server
app.listen(PORT, () => {
  console.log(`AI test server running on port ${PORT}`);
  console.log(`Access the editor at http://localhost:${PORT}`);
});
