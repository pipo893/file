import { GoogleGenAI, Type, Schema } from "@google/genai";
import { QuizData } from "../types";

const processFileToQuiz = async (
  base64Data: string, 
  mimeType: string, 
  fileName: string,
  startQuestion: number = 1,
  endQuestion: number = 50
): Promise<QuizData> => {
  const apiKey = AIzaSyCfDNZplkQUMSMd7nZWGWvVWZMT8witQZk ;
  if (!apiKey) {
    throw new Error("API Key is missing");
  }

  const ai = new GoogleGenAI({ apiKey });

  // Schema definition for the expected JSON structure
  const quizSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      title: {
        type: Type.STRING,
        description: "A suitable title for the quiz derived from the document",
      },
      questions: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.INTEGER, description: "The specific question number found in the document (e.g., 51, 52...)" },
            text: { type: Type.STRING, description: "The content of the question" },
            options: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  key: { type: Type.STRING, description: "Option letter (A, B, C, D)" },
                  text: { type: Type.STRING, description: "The text of the option" }
                },
                required: ["key", "text"]
              }
            },
            correctAnswer: { type: Type.STRING, description: "The letter of the correct answer (A, B, C, D)." },
            explanation: { type: Type.STRING, description: "Brief explanation of why this answer is correct." }
          },
          required: ["id", "text", "options", "correctAnswer"]
        }
      }
    },
    required: ["title", "questions"]
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          },
          {
            text: `Analyze this document ("${fileName}") and extract multiple-choice questions.
            
            TARGET RANGE: Extract questions specifically numbered from ${startQuestion} to ${endQuestion}.
            
            CRITICAL INSTRUCTIONS:
            1. Look for questions starting with numbers in the range ${startQuestion}-${endQuestion}.
            2. Ignore questions before ${startQuestion}.
            3. Stop extracting after question ${endQuestion}.
            4. If the document uses a different numbering format, try to map the ${startQuestion}-th question in the file to the ${endQuestion}-th question sequentially.
            5. If no questions are found in this range, return an empty questions array.

            For each question:
            - Extract the question text.
            - Extract options (A, B, C, D).
            - Identify or solve for the correct answer.
            - Provide a short explanation.
            `
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: quizSchema,
        thinkingConfig: { thinkingBudget: 0 }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response from AI");
    }

    const data = JSON.parse(text) as QuizData;
    
    // Fallback: If AI returns data but IDs are messed up, try to re-index them for UI consistency if needed,
    // but prefer keeping original IDs for reference.
    if (data.questions.length === 0) {
      throw new Error(`Không tìm thấy câu hỏi nào trong khoảng từ câu ${startQuestion} đến ${endQuestion}.`);
    }

    return data;
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Failed to process the file.");
  }
};

export { processFileToQuiz };
