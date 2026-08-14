import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const FLASH_MODEL = 'gemini-3.6-flash';

/**
 * Generate content with Gemini - general purpose
 */
export async function generateContent(prompt, options = {}) {
  try {
    const config = {};
    if (options.jsonMode) {
      config.responseMimeType = 'application/json';
    }
    if (options.systemInstruction) {
      config.systemInstruction = options.systemInstruction;
    }

    const response = await genAI.models.generateContent({
      model: options.model || FLASH_MODEL,
      contents: typeof prompt === 'string' ? prompt : prompt,
      config: Object.keys(config).length > 0 ? config : undefined,
    });

    return {
      success: true,
      text: response.text,
      raw: response,
    };
  } catch (error) {
    console.error('Gemini API error:', error.message);
    return {
      success: false,
      error: error.message,
      text: null,
    };
  }
}

/**
 * Generate structured JSON output from Gemini
 */
export async function generateJSON(prompt, systemInstruction) {
  const result = await generateContent(prompt, {
    jsonMode: true,
    systemInstruction,
  });

  if (result.success && result.text) {
    try {
      const parsed = JSON.parse(result.text);
      return { success: true, data: parsed };
    } catch (e) {
      // Try to extract JSON from the response
      const jsonMatch = result.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          return { success: true, data: parsed };
        } catch (e2) {
          return { success: false, error: 'Failed to parse JSON response', raw: result.text };
        }
      }
      return { success: false, error: 'Failed to parse JSON response', raw: result.text };
    }
  }

  return { success: false, error: result.error || 'Generation failed' };
}

/**
 * Chat with context and grounding
 */
export async function chatWithContext(question, context, courseInfo) {
  const systemPrompt = `You are Arohon Course Copilot — an AI academic assistant for RUET (Rajshahi University of Engineering & Technology) students.

Your role:
- Answer questions about course materials accurately
- Ground your answers in the provided course materials when available
- Cite specific sources when referencing course content
- If you cannot find sufficient evidence in the materials, say so honestly
- Never fabricate citations or page numbers
- Be concise, clear, and exam-focused

Current course context:
${courseInfo ? `Course: ${courseInfo.name} (${courseInfo.code})` : 'General academic query'}

Available course materials and context:
${context || 'No specific materials provided. Answer based on general knowledge but note the limitation.'}

Format your response with clear structure. When citing sources, use the format: [Source: document name].`;

  const result = await generateContent(question, {
    systemInstruction: systemPrompt,
  });

  return result;
}

/**
 * Analyze with file content (base64)
 */
export async function analyzeWithFile(prompt, fileBase64, mimeType, systemInstruction) {
  try {
    const contents = [
      {
        role: 'user',
        parts: [
          {
            inlineData: {
              data: fileBase64,
              mimeType: mimeType,
            },
          },
          { text: prompt },
        ],
      },
    ];

    const config = {};
    if (systemInstruction) {
      config.systemInstruction = systemInstruction;
    }

    const response = await genAI.models.generateContent({
      model: FLASH_MODEL,
      contents,
      config: Object.keys(config).length > 0 ? config : undefined,
    });

    return { success: true, text: response.text };
  } catch (error) {
    console.error('Gemini file analysis error:', error.message);
    return { success: false, error: error.message };
  }
}

export { genAI, FLASH_MODEL };
