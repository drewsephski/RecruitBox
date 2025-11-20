import { GoogleGenAI, Type } from "@google/genai";
import { RecruitmentResult, GenerationConfig } from "../types";

// Initialize client strictly with API Key from process.env directly
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = 'gemini-2.0-flash';

// Define the schema for structured output
const recruitmentSchema = {
  type: Type.OBJECT,
  properties: {
    jobDescription: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        summary: { type: Type.STRING },
        responsibilities: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        },
        requirements: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        },
        benefits: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      },
      required: ['title', 'summary', 'responsibilities', 'requirements', 'benefits']
    },
    interviewGuide: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          competency: { type: Type.STRING },
          evaluationCriteria: { type: Type.STRING }
        },
        required: ['question', 'competency', 'evaluationCriteria']
      }
    },
    screeningQuestions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          idealAnswerKeywords: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ['question', 'idealAnswerKeywords']
      }
    }
  },
  required: ['jobDescription', 'interviewGuide', 'screeningQuestions']
};

export const generateRecruitmentAssets = async (rawNotes: string, config: GenerationConfig): Promise<RecruitmentResult> => {
  // The API key is assumed to be valid and pre-configured in the environment.

  const prompt = `
    You are an expert HR strategist and technical recruiter acting as a dedicated hiring engine.
    
    Role Configuration:
    - Tone: ${config.tone} (Adjust language complexity and vibe accordingly)
    - Seniority Level: ${config.seniority}
    
    Task:
    Analyze the following raw notes about a job role. 
    1. Create a polished, professional Job Description suitable for LinkedIn/ATS.
    2. Create a set of 8-10 behavioral interview questions targeting the specific soft and hard skills required.
    3. Create 3-5 prescreening questions to filter candidates, including keywords to look for in answers.
    
    Raw Notes:
    "${rawNotes}"
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: recruitmentSchema,
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response generated");

    return JSON.parse(text) as RecruitmentResult;
  } catch (error) {
    console.error("Recruitment Generation Error:", error);
    throw error;
  }
};

export const sendChatMessage = async (history: {role: string, parts: {text: string}[]}[], message: string) => {
  try {
    const chat = ai.chats.create({
        model: MODEL_NAME,
        // Use 'as any' to ensure compatibility with SDK's internal Content type definition if needed
        history: history as any,
    });

    const result = await chat.sendMessage({ message });
    return result.text;
  } catch (error) {
    console.error("Chat Error:", error);
    throw error;
  }
};