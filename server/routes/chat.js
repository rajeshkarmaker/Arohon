import express from 'express';
import { chatWithContext, analyzeWithFile } from '../gemini.js';

const router = express.Router();

// Chat conversations stored in memory (hackathon-appropriate)
const conversations = new Map();

/**
 * POST /api/chat
 * Course Copilot — grounded Q&A
 */
router.post('/', async (req, res) => {
  try {
    const { message, courseId, courseName, courseCode, conversationId, context } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Build context from course materials and conversation history
    const convId = conversationId || `conv_${Date.now()}`;
    const history = conversations.get(convId) || [];

    // Build conversation context string
    let contextStr = context || '';
    if (history.length > 0) {
      contextStr += '\n\nPrevious conversation:\n';
      history.slice(-6).forEach(msg => {
        contextStr += `${msg.role}: ${msg.content}\n`;
      });
    }

    const courseInfo = courseName ? { name: courseName, code: courseCode || '' } : null;

    const fullPrompt = history.length > 0
      ? `Previous conversation context is provided in the system prompt. Now answer: ${message}`
      : message;

    const result = await chatWithContext(fullPrompt, contextStr, courseInfo);

    if (!result.success) {
      return res.status(500).json({
        error: 'Gemini is temporarily unavailable. Your information is safe. Try again.',
        retryable: true,
      });
    }

    // Save to history
    history.push({ role: 'user', content: message });
    history.push({ role: 'assistant', content: result.text });
    conversations.set(convId, history);

    // Extract potential source citations from the response
    const sourceMatches = result.text.match(/\[Source: ([^\]]+)\]/g) || [];
    const sources = sourceMatches.map(s => s.replace('[Source: ', '').replace(']', ''));

    res.json({
      response: result.text,
      sources,
      conversationId: convId,
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      error: 'Gemini is temporarily unavailable. Your information is safe. Try again.',
      retryable: true,
    });
  }
});

/**
 * POST /api/chat/with-file
 * Chat with uploaded file analysis
 */
router.post('/with-file', async (req, res) => {
  try {
    const { message, fileBase64, mimeType, fileName, courseId, courseName } = req.body;

    if (!fileBase64 || !message) {
      return res.status(400).json({ error: 'Message and file are required' });
    }

    const systemPrompt = `You are Arohon Course Copilot for RUET students.
Analyze the uploaded document and answer the student's question.
${courseName ? `Course context: ${courseName}` : ''}
Be specific, cite content from the document, and focus on exam relevance.
Never fabricate information not present in the document.`;

    const result = await analyzeWithFile(
      `Document: ${fileName}\n\nStudent question: ${message}`,
      fileBase64,
      mimeType,
      systemPrompt
    );

    if (!result.success) {
      return res.status(500).json({
        error: 'Gemini is temporarily unavailable. Try again.',
        retryable: true,
      });
    }

    res.json({
      response: result.text,
      sources: [fileName],
    });
  } catch (error) {
    console.error('File chat error:', error);
    res.status(500).json({
      error: 'Gemini is temporarily unavailable. Try again.',
      retryable: true,
    });
  }
});

export default router;
