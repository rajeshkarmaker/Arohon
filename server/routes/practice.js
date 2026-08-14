import express from 'express';
import { generateJSON, generateContent } from '../gemini.js';

const router = express.Router();

/**
 * POST /api/practice/generate
 * Generate practice questions based on topic and style
 */
router.post('/generate', async (req, res) => {
  try {
    const { topic, courseName, questionStyle, difficulty, historicalContext } = req.body;

    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    const systemPrompt = `You are an exam question generator for RUET (Rajshahi University of Engineering & Technology).
Generate practice questions that mirror historical RUET exam patterns.
Base the question style on the provided context.
Never generate trivially easy questions for university-level courses.
Never fabricate specific textbook references unless you have evidence.`;

    const prompt = `Generate a practice question for:

Course: ${courseName || 'Not specified'}
Topic: ${topic}
Style: ${questionStyle || 'Mixed (conceptual + numerical)'}
Difficulty: ${difficulty || 'Medium'}
${historicalContext ? `Historical context: ${historicalContext}` : ''}

Return JSON:
{
  "question": "The full question text",
  "topic": "${topic}",
  "type": "${questionStyle || 'mixed'}",
  "difficulty": "${difficulty || 'medium'}",
  "marks": estimated marks (number),
  "hint": "A helpful hint without giving away the answer",
  "keyConcepts": ["concept1", "concept2"],
  "basis": "Brief explanation of why this question type was generated (e.g., 'Generated in the style of recurring application questions')",
  "sampleAnswer": "Complete model answer"
}`;

    const result = await generateJSON(prompt, systemPrompt);

    if (!result.success) {
      return res.status(500).json({ error: 'Failed to generate question', retryable: true });
    }

    res.json(result.data);
  } catch (error) {
    console.error('Practice generation error:', error);
    res.status(500).json({ error: 'Failed to generate question', retryable: true });
  }
});

/**
 * POST /api/practice/evaluate
 * Evaluate student's answer
 */
router.post('/evaluate', async (req, res) => {
  try {
    const { question, studentAnswer, topic, courseName } = req.body;

    if (!question || !studentAnswer) {
      return res.status(400).json({ error: 'Question and answer are required' });
    }

    const systemPrompt = `You are an academic evaluator for RUET students.
Evaluate the student's answer fairly and constructively.
Do NOT immediately provide the full solution.
Guide learning by pointing out what's correct, what's missing, and common mistakes.
Be encouraging but honest.`;

    const prompt = `Evaluate this answer:

Course: ${courseName || 'Not specified'}
Topic: ${topic || 'Not specified'}
Question: ${question}
Student's Answer: ${studentAnswer}

Return JSON:
{
  "score": percentage score (0-100),
  "isCorrect": boolean,
  "feedback": "Constructive feedback explaining what was done well and what needs improvement",
  "correctParts": ["parts the student got right"],
  "missingConcepts": ["concepts the student missed or got wrong"],
  "commonMistakes": ["relevant common mistakes to watch for"],
  "suggestion": "What the student should review or practice next",
  "encouragement": "Brief encouraging note"
}`;

    const result = await generateJSON(prompt, systemPrompt);

    if (!result.success) {
      return res.status(500).json({ error: 'Failed to evaluate answer', retryable: true });
    }

    res.json(result.data);
  } catch (error) {
    console.error('Evaluation error:', error);
    res.status(500).json({ error: 'Failed to evaluate answer', retryable: true });
  }
});

/**
 * POST /api/practice/explain
 * Explain a concept in different modes
 */
router.post('/explain', async (req, res) => {
  try {
    const { concept, mode, courseName } = req.body;

    const modeInstructions = {
      simple: 'Explain in simple terms a first-year student can easily understand.',
      'exam-focused': 'Explain focusing on what would be asked in a RUET exam. Include key points to memorize.',
      detailed: 'Give a comprehensive, detailed explanation with underlying theory.',
      example: 'Explain using a clear, worked-out example.',
      'step-by-step': 'Break down the concept into clear sequential steps.',
    };

    const instruction = modeInstructions[mode] || modeInstructions.simple;

    const result = await generateContent(
      `Explain this concept for a RUET ${courseName || ''} course:\n\n${concept}\n\n${instruction}`,
      {
        systemInstruction: 'You are Arohon Course Copilot for RUET students. Be clear, accurate, and exam-relevant. Use proper formatting with headers and bullet points.',
      }
    );

    if (!result.success) {
      return res.status(500).json({ error: 'Failed to generate explanation', retryable: true });
    }

    res.json({ explanation: result.text });
  } catch (error) {
    console.error('Explanation error:', error);
    res.status(500).json({ error: 'Failed to generate explanation', retryable: true });
  }
});

export default router;
