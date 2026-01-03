import axios from "axios";
import { Request, Response } from "express";
import mammoth from "mammoth";
import { AuthRequest } from "../middlewares/auth.middleware";
import Note from "../models/Note";
// Keep your pdf-parse imports as you had them fixed previously
import * as pdfParse from "pdf-parse";
import OpenAI from "openai";

// Helper: send request to Gemini with RETRY LOGIC and CORRECT SCHEMA
async function generateFromGemini(prompt: string, maxTokens: number = 500) {
  const maxRetries = 3;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await axios.post(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-001:generateContent",
        {
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: maxTokens,
          },
        },
        {
          headers: {
            "Content-Type": "application/json",
            "X-goog-api-key": process.env.GOOGLE_API_KEY!,
          },
        }
      );

      const text =
        response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text) throw new Error("Empty AI response");

      return text;
    } catch (err: any) {
      if (err.response?.status === 429 && attempt < maxRetries) {
        await new Promise((r) => setTimeout(r, 2000 * attempt));
        continue;
      }

      console.error("Gemini API Error:", err.response?.data || err.message);
      throw err;
    }
  }

  throw new Error("Gemini failed after retries");
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Same function name → NO controller changes needed
async function generateFromAI(prompt: string, maxTokens = 500) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // fast + cheap + stable
      messages: [
        {
          role: "system",
          content:
            "You are an educational assistant that creates clear, structured study material for students.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: maxTokens,
    });

    const text = response.choices[0]?.message?.content;

    if (!text) {
      throw new Error("Empty AI response");
    }

    return text;
  } catch (err: any) {
    console.error("OpenAI API Error:", err.message);
    throw err;
  }
}

export const generateNotes = async (req: AuthRequest, res: Response) => {
    // ... existing implementation ...
    // (I am omitting the rest to save space, but you keep it exactly as it was)
    try {
        if (!req.user) {
          return res.status(401).json({ message: "Unauthorized" });
        }
    
        const { topic, description } = req.body;
        let sourceText = description || "";
    
        if (req.file) {
          const extractedText = await extractTextFromFile(req.file);
          sourceText += `\n${extractedText}`;
        }
    
        if (!topic && !sourceText) {
          return res.status(400).json({
            message: "Provide topic, description, or document",
          });
        }
    
        const prompt = `
    Create clear, structured study notes.
    
    Topic:
    ${topic || "Not provided"}
    
    Source content:
    ${sourceText || "None"}
    
    Rules:
    - Bullet points
    - Clear headings
    - Easy to revise
    - Student friendly
    `;
    
        const generated = await generateFromGemini(prompt, 200);
        // const generated = await generateFromAI(prompt, 200);

        if (!generated || typeof generated !== "string") {
          return res.status(502).json({
            message: "AI returned invalid content",
          });
        }
    
        const note = await Note.create({
          title: topic || "AI Generated Notes",
          content: generated,
          user: req.user.sub,
        });
    
        res.status(201).json({
          message: "AI note created successfully",
          data: note,
        });
      } catch (err: any) {
        console.error("AI error:", err.message);

        if (err.message.includes("quota")) {
          return res.status(429).json({
            message: "AI quota exceeded. Please try again later.",
          });
        }

        res.status(500).json({
          message: "AI note generation failed",
        });
      }
};

// Generate Flashcards
export const generateFlashcards = async (req: Request, res: Response) => {
  try {
    const { topic, text } = req.body;

    if (!topic && !text) {
      return res
        .status(400)
        .json({ message: "Provide either topic or text content" });
    }

    const prompt = `
      Create a list of flashcards based on the following topic or content.

      Topic: ${topic || "No topic"}
      Source text:
      ${text || "None"}

      Format output EXACTLY like this JSON:
      [
        { "front": "What is X?", "back": "X means..." },
        { "front": "Why does Y happen?", "back": "Because..." }
      ]
    `;

    // const result = await generateFromGemini(prompt, 500);
    const result = await generateFromAI(prompt, 1000);

    res.status(200).json({ data: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "AI failed to generate flashcards" });
  }
};

// Generate Quiz Questions
export const generateQuiz = async (req: Request, res: Response) => {
  try {
    const { topic, text, count } = req.body;

    const numQuestions = count || 10;

    if (!topic && !text) {
      return res
        .status(400)
        .json({ message: "Provide either topic or text content" });
    }

    const prompt = `
      Generate ${numQuestions} multiple-choice questions (MCQs) based on this topic or text.

      Topic: ${topic}
      Content: ${text || "None"}

      Format strictly in JSON like:
      [
        {
          "question": "What is ...?",
          "options": ["A", "B", "C", "D"],
          "correctAnswer": "B"
        }
      ]

      Make sure:
      - Options are short
      - Correct answer is one of the options
      - Questions test real understanding
    `;

    // const result = await generateFromGemini(prompt, 800);
    const result = await generateFromAI(prompt, 1000);

    res.status(200).json({ data: result });
  } catch (err) {
    res.status(500).json({ message: "AI failed to generate quiz" });
  }
};

// Helper: extract text from uploaded file (stub implementation)
async function extractTextFromFile(file: Express.Multer.File) {
  try {
    if (file.mimetype === "application/pdf") {
      // Defensive call: handles both import styles
      const parse = typeof pdfParse === 'function' ? pdfParse : (pdfParse as any).default;
      
      if (typeof parse !== 'function') {
        throw new Error("PDF parse library not loaded correctly");
      }

      const data = await parse(file.buffer);
      return data.text || "";
    }

    if (file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
      const result = await mammoth.extractRawText({ buffer: file.buffer });
      return result.value || "";
    }
  } catch (err) {
    console.error("Extraction error:", err);
    return ""; // Return empty string instead of crashing
  }
  return "";
}