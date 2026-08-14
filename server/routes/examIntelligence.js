import express from 'express';
import { generateJSON, analyzeWithFile } from '../gemini.js';

const router = express.Router();

// Cache analysis results to avoid redundant API calls
const analysisCache = new Map();

/**
 * POST /api/exam-intelligence/analyze
 * Multi-stage Exam Intelligence analysis pipeline
 */
router.post('/analyze', async (req, res) => {
  try {
    const { courseId, courseName, examType, teacher, topics, historicalQuestions, lectureContent, studyHours } = req.body;

    if (!courseId || !courseName) {
      return res.status(400).json({ error: 'Course information is required' });
    }

    // Check cache
    const cacheKey = `${courseId}_${examType}_${teacher || 'any'}`;
    if (analysisCache.has(cacheKey)) {
      const cached = analysisCache.get(cacheKey);
      if (Date.now() - cached.timestamp < 10 * 60 * 1000) { // 10 min cache
        return res.json({ ...cached.data, cached: true });
      }
    }

    const systemPrompt = `You are an academic exam pattern analyst for RUET (Rajshahi University of Engineering & Technology).
    
Your task is to analyze historical exam questions and course materials to identify patterns, recurring topics, and teacher questioning styles.

CRITICAL RULES:
- Base ALL analysis on the provided historical questions and materials
- Never fabricate historical frequency data - only report what the evidence supports
- Never invent textbook question numbers
- Never claim certainty about future exam questions
- Use language like "high priority", "frequently observed", "evidence suggests"
- Distinguish between exact repetition and semantic similarity
- Be transparent about evidence quality

Return a comprehensive JSON analysis.`;

    const prompt = `Analyze this course for exam preparation:

COURSE: ${courseName} (${courseId})
EXAM TYPE: ${examType || 'Class Test'}
${teacher ? `TEACHER: ${teacher}` : ''}
${studyHours ? `AVAILABLE STUDY TIME: ${studyHours} hours` : ''}

COURSE TOPICS:
${topics ? topics.join('\n') : 'See historical questions for topic inference'}

HISTORICAL EXAM QUESTIONS (organized by year):
${historicalQuestions || 'No historical questions provided'}

CURRENT LECTURE MATERIAL:
${lectureContent || 'No current lecture content provided'}

Based on this data, produce a thorough analysis with the following JSON structure:
{
  "course": "course name",
  "examType": "exam type",
  "summary": "Brief 2-3 sentence executive summary of the analysis",
  "sourcesAnalyzed": {
    "historicalPapers": number,
    "lectureResources": number,
    "totalQuestionsAnalyzed": number
  },
  "highYieldTopics": [
    {
      "rank": 1,
      "topic": "topic name",
      "priority": "high|medium|low",
      "historicalFrequency": "X of Y assessments",
      "frequencyRatio": 0.8,
      "questionPatterns": ["pattern1", "pattern2"],
      "rationale": "why this is important",
      "currentRelevance": "high|medium|low",
      "evidence": ["specific evidence from the data"]
    }
  ],
  "teacherPattern": {
    "style": "overall style description",
    "questionTypes": {
      "conceptual": percentage,
      "numerical": percentage,
      "application": percentage,
      "recall": percentage,
      "derivation": percentage
    },
    "observations": ["observation1", "observation2"],
    "repetitionTendency": "high|moderate|low",
    "lectureDependency": "high|moderate|low",
    "evidence": ["specific evidence"]
  },
  "likelyQuestionArchetypes": [
    {
      "archetype": "question description/structure",
      "topic": "related topic",
      "type": "conceptual|numerical|application|mixed",
      "rationale": "why this type is likely",
      "relatedHistorical": ["similar past questions"]
    }
  ],
  "studyPlan": [
    {
      "order": 1,
      "topic": "topic name",
      "action": "what to do",
      "timeEstimate": "estimated time",
      "reason": "why this order"
    }
  ],
  "practiceRecommendations": [
    {
      "topic": "topic",
      "type": "practice type",
      "description": "what to practice",
      "priority": "high|medium|low"
    }
  ],
  "readiness": {
    "topicsCovered": number,
    "totalTopics": number,
    "highYieldCoverage": "percentage description",
    "overallAssessment": "brief readiness statement"
  }
}

Ensure every frequency claim is backed by the provided historical data. Do not inflate numbers.`;

    const result = await generateJSON(prompt, systemPrompt);

    if (!result.success) {
      return res.status(500).json({
        error: 'Gemini analysis failed. Try again.',
        retryable: true,
        detail: result.error,
      });
    }

    // Cache the result
    analysisCache.set(cacheKey, {
      data: result.data,
      timestamp: Date.now(),
    });

    res.json(result.data);
  } catch (error) {
    console.error('Exam intelligence error:', error);
    res.status(500).json({
      error: 'Gemini is temporarily unavailable. Your information is safe. Try again.',
      retryable: true,
    });
  }
});

/**
 * POST /api/exam-intelligence/quick-forecast
 * Quick topic priority analysis for dashboard
 */
router.post('/quick-forecast', async (req, res) => {
  try {
    const { courseId, courseName, historicalQuestions } = req.body;

    const prompt = `For the RUET course "${courseName}", based on these historical questions:
${historicalQuestions}

Return a JSON array of the top 5 high-yield topics:
[{ "topic": "name", "priority": "high|medium", "frequency": "X of Y years", "brief": "one sentence reason" }]`;

    const result = await generateJSON(prompt,
      'You are an exam pattern analyst. Be evidence-based. Never fabricate data.');

    if (!result.success) {
      return res.status(500).json({ error: 'Analysis failed', retryable: true });
    }

    res.json(result.data);
  } catch (error) {
    console.error('Quick forecast error:', error);
    res.status(500).json({ error: 'Analysis failed', retryable: true });
  }
});

/**
 * POST /api/exam-intelligence/ocr-analyze
 * Multimodal OCR question paper analysis
 */
router.post('/ocr-analyze', async (req, res) => {
  try {
    const { fileBase64, mimeType, fileName, courseName } = req.body;

    if (!fileBase64) {
      return res.status(400).json({ error: 'File data is required' });
    }

    const systemPrompt = `You are a RUET exam analyst.
    
Your task is to analyze the uploaded question paper, perform OCR to extract all questions, determine the academic topics covered, and suggest targeted practice questions matching the exact topic scope and style.

Return a JSON object with this structure:
{
  "fileName": "name of file",
  "extractedQuestions": ["List of all questions found in the document"],
  "mainTopics": ["Determined key topics from the paper"],
  "suggestedPractice": [
    {
      "question": "A new practice question matching the style and topics of the paper",
      "topic": "Topic category",
      "hint": "A helpful hint for this question",
      "sampleAnswer": "Comprehensive model answer"
    }
  ],
  "studyTip": "A customized study recommendation for this paper"
}

Analyze carefully and return valid JSON only.`;

    const prompt = `Perform OCR on the attached question paper for course: ${courseName || 'Not specified'}.
Extract the questions, identify the underlying topics, and generate 3 custom practice questions matching the style and topics.`;

    const result = await analyzeWithFile(prompt, fileBase64, mimeType, systemPrompt);

    if (!result.success) {
      return res.status(500).json({ error: 'OCR analysis failed. Try again.', retryable: true });
    }

    try {
      const parsed = JSON.parse(result.text.replace(/```json/g, '').replace(/```/g, '').trim());
      res.json(parsed);
    } catch (e) {
      // Try extracting json regex
      const jsonMatch = result.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          return res.json(parsed);
        } catch (e2) {}
      }
      res.json({
        fileName,
        extractedQuestions: [result.text],
        mainTopics: ['Extracted Topics'],
        suggestedPractice: [],
        studyTip: 'Review the text above for details.'
      });
    }
  } catch (error) {
    console.error('OCR analyze error:', error);
    res.status(500).json({ error: 'OCR analysis failed. Try again.' });
  }
});

export default router;
