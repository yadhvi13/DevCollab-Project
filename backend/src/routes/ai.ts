import express from 'express';
import { GoogleGenAI } from '@google/genai';
import { authenticate } from './auth';

const router = express.Router();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

router.post('/explain', authenticate, async (req: any, res) => {
  try {
    const { code, language } = req.body;
    
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'AI not configured' });
    }

    const prompt = `Explain the following ${language} code in concise, structural markdown commentary. Focus on its purpose, how it works, and any key patterns used:\n\n\`\`\`${language}\n${code}\n\`\`\``;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
    });

    res.json({ explanation: response.text });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate explanation' });
  }
});

router.post('/review', authenticate, async (req: any, res) => {
  try {
    const { code, language } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'AI not configured' });
    }

    const prompt = `Review the following ${language} code. Audit for syntax errors, highlight potential memory leak vulnerabilities or performance issues, and produce custom refactoring suggestions. Output in markdown format.\n\n\`\`\`${language}\n${code}\n\`\`\``;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
    });

    res.json({ review: response.text });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate code review' });
  }
});

router.post('/chat', authenticate, async (req: any, res) => {
    try {
      const { message, fileContext, history } = req.body;
  
      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: 'AI not configured' });
      }

      let systemInstruction = "You are DevCollab's AI assistant. Answer queries regarding the code.";
      if (fileContext) {
          systemInstruction += ` The user is currently looking at this code:\n\n${fileContext}`;
      }
      
      const contents = history.map((msg: any) => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }]
      }));

      contents.push({ role: 'user', parts: [{ text: message }] });

      const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents,
          config: {
              systemInstruction: {
                role: 'system',
                parts: [{ text: systemInstruction }]
              }
          }
      });
  
      res.json({ reply: response.text });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to generate chat response' });
    }
  });

export default router;
