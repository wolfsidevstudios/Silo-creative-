import { GoogleGenAI, Type } from "@google/genai";
import { AppPlan, Flashcard } from '../types';
import { getApiKey } from './apiKeyService';

const combineInstructions = (agentInstruction: string | undefined, taskInstruction: string): string => {
    if (agentInstruction) {
        return `${agentInstruction}\n\nIMPORTANT:\n${taskInstruction}`;
    }
    return taskInstruction;
}

export const generateAppPlan = async (prompt: string, agentSystemInstruction?: string): Promise<AppPlan> => {
  console.log(`Generating plan for prompt: "${prompt}"`);

  const ai = new GoogleGenAI({ apiKey: getApiKey() });

  const taskInstruction = `You are an expert software architect. A user will provide you with an idea for a web application. Your task is to break down this idea into a simple, clear, and actionable plan.

The plan should consist of:
1. A concise and catchy **title** for the application.
2. A brief, one-sentence **description** of what the application does.
3. A list of 3-5 key **features** that are essential for the application's core functionality.

You must respond with only a JSON object that strictly follows this structure:
{
  "title": "string",
  "description": "string",
  "features": ["string", "string", ...]
}`;
  
  const systemInstruction = combineInstructions(agentSystemInstruction, taskInstruction);

  const schema = {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        description: { type: Type.STRING },
        features: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING,
          },
        },
      },
      required: ['title', 'description', 'features'],
    };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    const planJson = response.text.trim();
    const plan: AppPlan = JSON.parse(planJson);
    return plan;
  } catch (error) {
    console.error("Error generating plan with Gemini:", error);
    throw new Error("Failed to generate an app plan from the AI model.");
  }
};

export const generateFlashcards = async (prompt: string, agentSystemInstruction?: string): Promise<Flashcard[]> => {
  console.log(`Generating flashcards for topic: "${prompt}"`);

  const ai = new GoogleGenAI({ apiKey: getApiKey() });

  const taskInstruction = `You are an expert educator. A user will provide you with a topic. Your task is to generate a set of flashcards for that topic.

The flashcards should be:
1. Clear and concise.
2. Factually accurate.
3. Formatted as a JSON array of objects, where each object has a "question" and an "answer".

You must respond with only a JSON object that strictly follows this structure:
[
  {
    "question": "string",
    "answer": "string"
  },
  ...
]`;

  const systemInstruction = combineInstructions(agentSystemInstruction, taskInstruction);

  const schema = {
      type: Type.ARRAY,
      items: {
          type: Type.OBJECT,
          properties: {
              question: { type: Type.STRING },
              answer: { type: Type.STRING },
          },
          required: ['question', 'answer'],
      }
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    const flashcardsJson = response.text.trim();
    const flashcards: Flashcard[] = JSON.parse(flashcardsJson);
    return flashcards;
  } catch (error) {
    console.error("Error generating flashcards with Gemini:", error);
    throw new Error("Failed to generate flashcards from the AI model.");
  }
};


// Function to generate HTML code using the Gemini API
export const generateAppCode = async (plan: AppPlan, agentSystemInstruction?: string): Promise<string> => {
  console.log(`Generating code for app: "${plan.title}"`);

  const ai = new GoogleGenAI({ apiKey: getApiKey() });

  const featuresString = plan.features.map(f => `- ${f}`).join('\n');
  const taskPrompt = `
    You are an expert web developer tasked with creating a single-file web application.
    Based on the following plan, generate a complete HTML file.

    **Application Plan:**
    - **Title:** ${plan.title}
    - **Description:** ${plan.description}
    - **Features:**
    ${featuresString}

    **Requirements:**
    1.  The output must be a single, complete HTML file.
    2.  Use Tailwind CSS for styling. Include the Tailwind CDN script in the <head>: <script src="https://cdn.tailwindcss.com"></script>.
    3.  All JavaScript logic must be included within <script> tags inside the HTML file.
    4.  The code should be well-formatted and easy to read.
    5.  Do not include any explanations, comments, or markdown formatting like \`\`\`html outside of the HTML code itself. The output should be only the raw HTML code.
    6.  Ensure the application is functional and implements all the features described in the plan.
    `;
    
    const config = agentSystemInstruction ? { systemInstruction: agentSystemInstruction } : {};

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: taskPrompt,
        config: config
    });
    return response.text;
  } catch (error) {
      console.error("Error generating code with Gemini:", error);
      // Fallback to a simple error message display in HTML
      return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Error</title>
          <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="bg-red-100 flex items-center justify-center h-screen font-sans">
          <div class="text-center p-8 bg-white rounded-lg shadow-lg max-w-sm">
            <h1 class="text-2xl font-bold text-red-700">Failed to Generate App</h1>
            <p class="text-red-600 mt-2">Sorry, there was an error communicating with the AI model to generate the application code.</p>
          </div>
        </body>
        </html>
      `;
  }
};