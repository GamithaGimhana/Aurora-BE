import axios from "axios";
import { Request, Response } from "express";
import mammoth from "mammoth";
import { AuthRequest } from "../middlewares/auth.middleware";
import Note from "../models/Note";
// Replace what you have with this:
import * as pdfParse from "pdf-parse";

// If that still fails at runtime, use this instead:
// const pdfParse = require("pdf-parse");

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

// Helper: send request to Gemini
async function generateFromGemini(prompt: string, maxTokens: number = 500) {
  try {
    const response = await axios.post(GEMINI_API_URL, {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: maxTokens },
    }, {
      headers: {
        "Content-Type": "application/json",
        "X-goog-api-key": GOOGLE_API_KEY,
      },
    });

    return response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "No Data";
  } catch (error: any) {
    if (error.response?.status === 429) {
      console.error("QUOTA EXHAUSTED: Please wait a minute before trying again.");
      throw new Error("AI service is currently busy (Rate limit reached).");
    }
    throw error;
  }
}

// Generate Notes
export const generateNotes = async (req: AuthRequest, res: Response) => {
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

    const generated = await generateFromGemini(prompt, 1000);

    const note = await Note.create({
      title: topic || "AI Generated Notes",
      content: generated,
      user: req.user.sub,
    });

    res.status(201).json({
      message: "AI note created successfully",
      data: note,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to generate AI note" });
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

    const result = await generateFromGemini(prompt, 500);

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

    const result = await generateFromGemini(prompt, 800);

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