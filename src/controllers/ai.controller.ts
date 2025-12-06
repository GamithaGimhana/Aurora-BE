import axios from "axios";
import { Request, Response } from "express";

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

// Helper: send request to Gemini
async function generateFromGemini(prompt: string, maxTokens: number = 500) {
  const response = await axios.post(
    GEMINI_API_URL,
    {
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        maxOutputTokens: maxTokens,
      },
    },
    {
      headers: {
        "Content-Type": "application/json",
        "X-goog-api-key": GOOGLE_API_KEY,
      },
    }
  );

  return (
    response.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
    response.data?.candidates?.[0]?.content?.[0]?.text ||
    "No Data"
  );
}

// Generate Notes
export const generateNotes = async (req: Request, res: Response) => {
  try {
    const { topic, text } = req.body;

    if (!topic && !text) {
      return res
        .status(400)
        .json({ message: "Provide either topic or text content" });
    }

    const prompt = `
      Create clear, structured study notes for:
      Topic: ${topic || "No topic provided"}

      Source content (if provided):
      ${text || "None"}

      Notes must be:
      - Well structured
      - Bullet points
      - Easy for a student to revise
      - Include key concepts, explanations, steps, examples
    `;

    const result = await generateFromGemini(prompt, 800);

    res.status(200).json({ data: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "AI failed to generate notes" });
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
