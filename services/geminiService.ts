import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { AppPlan, Flashcard, FormPlan, DocumentPlan, RefinementResult, ModelID, ComponentPlan, UiUxAnalysis, AppMode, ProjectPlan, ConsoleMessage } from '../types';
import { getApiKey, getOpenRouterApiKey } from './apiKeyService';

const combineInstructions = (agentInstruction: string | undefined, taskInstruction: string): string => {
    if (agentInstruction) {
        return `${agentInstruction}\n\nIMPORTANT:\n${taskInstruction}`;
    }
    return taskInstruction;
}

const cleanJsonString = (str: string): string => {
    // This regex finds the first and last bracket or square bracket, and extracts everything in between.
    const match = str.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
    if (match) {
        return match[0];
    }
    return str; // Return original if no JSON structure is found
};


const callOpenRouter = async (model: string, systemInstruction: string, userMessage: string): Promise<string> => {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${getOpenRouterApiKey()}`,
            "HTTP-Referer": "silocreative.netlify.app",
            "X-Title": "silocreate",
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "model": model,
            "messages": [
                { "role": "system", "content": systemInstruction },
                { "role": "user", "content": userMessage }
            ]
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("OpenRouter API error:", errorText);
        throw new Error(`OpenRouter API request failed with status ${response.status}`);
    }

    const data = await response.json();
    if (!data.choices || data.choices.length === 0) {
        throw new Error("Invalid response structure from OpenRouter API.");
    }
    return data.choices[0].message.content;
};


export const generateAppPlan = async (prompt: string, model: ModelID, agentSystemInstruction?: string): Promise<AppPlan> => {
  console.log(`Generating plan for prompt: "${prompt}" with model ${model}`);

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

  try {
    if (model.startsWith('gemini')) {
        const ai = new GoogleGenAI({ apiKey: getApiKey() });
        const schema = {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                features: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ['title', 'description', 'features'],
        };
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
        return JSON.parse(planJson);
    } else {
        const responseJson = await callOpenRouter(model, systemInstruction, prompt);
        return JSON.parse(cleanJsonString(responseJson));
    }
  } catch (error) {
    console.error(`Error generating plan with ${model}:`, error);
    throw new Error("Failed to generate an app plan from the AI model.");
  }
};

export const generateProjectPlan = async (prompt: string, model: ModelID, agentSystemInstruction?: string): Promise<ProjectPlan> => {
  console.log(`Generating project plan for prompt: "${prompt}" with model ${model}`);

  const taskInstruction = `You are a world-class software architect. A user will describe a web application project. Your task is to create a comprehensive project plan.

The plan must include:
1.  A concise **title**.
2.  A one-sentence **description**.
3.  A **techStack** array, identifying key technologies (e.g., "React", "Vite", "Tailwind CSS", "Node.js", "Supabase").
4.  A detailed **fileStructure** as a nested JSON object representing the complete directory tree. Files should be keys with an empty string as a value, and folders should be keys with an object of their contents as the value.

Example fileStructure:
{
  "public/": {
    "index.html": ""
  },
  "src/": {
    "components/": {
        "Button.jsx": ""
    },
    "App.jsx": "",
    "index.css": ""
  },
  "package.json": "",
  "vite.config.js": ""
}

Respond with ONLY the JSON object.`;
  const systemInstruction = combineInstructions(agentSystemInstruction, taskInstruction);

  try {
    if (model.startsWith('gemini')) {
        const ai = new GoogleGenAI({ apiKey: getApiKey() });
        const schema = {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                techStack: { type: Type.ARRAY, items: { type: Type.STRING } },
                fileStructure: { type: Type.OBJECT, additionalProperties: true }
            },
            required: ['title', 'description', 'techStack', 'fileStructure'],
        };
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: schema,
            },
        });
        return JSON.parse(response.text.trim());
    } else {
        const responseJson = await callOpenRouter(model, systemInstruction, prompt);
        return JSON.parse(cleanJsonString(responseJson));
    }
  } catch (error) {
    console.error(`Error generating project plan with ${model}:`, error);
    throw new Error("Failed to generate a project plan from the AI model.");
  }
};


export const generateComponentPlan = async (prompt: string, model: ModelID, agentSystemInstruction?: string): Promise<ComponentPlan> => {
  console.log(`Generating component plan for prompt: "${prompt}" with model ${model}`);

  const taskInstruction = `You are an expert UI component architect. A user wants to build a specific UI component. Create a plan for it.

The plan should include:
1.  A short **name** for the component (e.g., "Pricing Table").
2.  A one-sentence **description**.
3.  A list of key **properties** (props) the component should accept, each with a 'name', 'type' (e.g., "string", "number", "boolean", "array"), and a sensible 'defaultValue'.

Respond with ONLY the JSON object.`;
  const systemInstruction = combineInstructions(agentSystemInstruction, taskInstruction);

  try {
    if (model.startsWith('gemini')) {
      const ai = new GoogleGenAI({ apiKey: getApiKey() });
      const schema = {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          description: { type: Type.STRING },
          properties: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                type: { type: Type.STRING },
                defaultValue: { type: Type.STRING },
              },
              required: ['name', 'type', 'defaultValue'],
            },
          },
        },
        required: ['name', 'description', 'properties'],
      };
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction: systemInstruction,
          responseMimeType: "application/json",
          responseSchema: schema,
        },
      });
      return JSON.parse(response.text.trim());
    } else {
      const responseJson = await callOpenRouter(model, systemInstruction, prompt);
      return JSON.parse(cleanJsonString(responseJson));
    }
  } catch (error) {
    console.error(`Error generating component plan with ${model}:`, error);
    throw new Error("Failed to generate a component plan from the AI model.");
  }
};


export const generateFormPlan = async (prompt: string, model: ModelID, agentSystemInstruction?: string): Promise<FormPlan> => {
    console.log(`Generating form plan for prompt: "${prompt}" with model ${model}`);
    const taskInstruction = `You are an expert form designer. A user wants to build a web form. Create a plan for this form.

The plan must include:
1.  A short **title** for the form.
2.  A one-sentence **description**.
3.  A list of **fields**, each with a 'name' (e.g., "Full Name"), 'type' (e.g., "text", "email", "textarea", "select", "checkbox", "radio"), and a 'required' boolean status.

Respond with ONLY the JSON object.`;
    const systemInstruction = combineInstructions(agentSystemInstruction, taskInstruction);
    
    try {
        if (model.startsWith('gemini')) {
            const ai = new GoogleGenAI({ apiKey: getApiKey() });
            const schema = {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    fields: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                name: { type: Type.STRING },
                                type: { type: Type.STRING },
                                required: { type: Type.BOOLEAN },
                            },
                            required: ['name', 'type', 'required'],
                        },
                    },
                },
                required: ['title', 'description', 'fields'],
            };
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    systemInstruction: systemInstruction,
                    responseMimeType: "application/json",
                    responseSchema: schema,
                },
            });
            return JSON.parse(response.text.trim());
        } else {
            const responseJson = await callOpenRouter(model, systemInstruction, prompt);
            return JSON.parse(cleanJsonString(responseJson));
        }
    } catch (error) {
        console.error(`Error generating form plan with ${model}:`, error);
        throw new Error("Failed to generate a form plan from the AI model.");
    }
};

export const generateDocumentPlan = async (prompt: string, model: ModelID, agentSystemInstruction?: string): Promise<DocumentPlan> => {
  console.log(`Generating document plan for prompt: "${prompt}" with model ${model}`);

  const taskInstruction = `You are an expert document architect. A user wants to create a document or presentation. Analyze their prompt to determine the best format and create a plan.

The plan must include:
1.  A concise **title**.
2.  A **documentType**, which must be either "PDF" or "Presentation".
3.  A detailed **outline** as an array of strings. For a PDF, this should be chapter or section titles. For a Presentation, this should be the title of each slide.

Respond with ONLY the JSON object.`;
  const systemInstruction = combineInstructions(agentSystemInstruction, taskInstruction);

  try {
    if (model.startsWith('gemini')) {
        const ai = new GoogleGenAI({ apiKey: getApiKey() });
        const schema = {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                documentType: { type: Type.STRING },
                outline: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ['title', 'documentType', 'outline'],
        };
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: schema,
            },
        });
        return JSON.parse(response.text.trim());
    } else {
        const responseJson = await callOpenRouter(model, systemInstruction, prompt);
        return JSON.parse(cleanJsonString(responseJson));
    }
  } catch (error) {
    console.error(`Error generating document plan with ${model}:`, error);
    throw new Error("Failed to generate a document plan from the AI model.");
  }
};


export const generateFlashcards = async (prompt: string, model: ModelID, agentSystemInstruction?: string): Promise<Flashcard[]> => {
  console.log(`Generating flashcards for topic: "${prompt}" with model ${model}`);

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
  
  try {
    if (model.startsWith('gemini')) {
        const ai = new GoogleGenAI({ apiKey: getApiKey() });
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
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: schema,
            },
        });
        return JSON.parse(response.text.trim());
    } else {
        const responseJson = await callOpenRouter(model, systemInstruction, prompt);
        return JSON.parse(cleanJsonString(responseJson));
    }
  } catch (error) {
    console.error(`Error generating flashcards with ${model}:`, error);
    throw new Error("Failed to generate flashcards from the AI model.");
  }
};


// Function to generate HTML code using the Gemini API
export const generateAppCode = async (plan: AppPlan, model: ModelID, agentSystemInstruction?: string): Promise<string> => {
  console.log(`Generating code for app: "${plan.title}" with model ${model}`);

  const featuresString = plan.features.map(f => `- ${f}`).join('\n');
  const taskPrompt = `
    You are an expert web developer specializing in creating modern, single-file web applications using advanced HTML5, Tailwind CSS, and vanilla JavaScript. Your mission is to produce high-quality, production-ready applications that are not only functional but also beautiful and user-friendly.
    Based on the following plan, generate a complete, single HTML file.

    **Application Plan:**
    - **Title:** ${plan.title}
    - **Description:** ${plan.description}
    - **Features:**
    ${featuresString}

    **CRITICAL REQUIREMENTS:**
    1.  **Single HTML File:** The entire application must be contained within a single HTML file.
    2.  **Vanilla JavaScript:** Use modern, vanilla JavaScript (ES6+) for all application logic. DO NOT use React, Vue, or any other framework.
    3.  **Tailwind CSS:** Use Tailwind CSS for all styling. Include the CDN script: <script src="https://cdn.tailwindcss.com"></script>.
    4.  **High-Quality Aesthetics & UX:**
        - The application must be visually appealing with a modern, clean design.
        - Pay close attention to layout, spacing, typography, and color schemes.
        - Ensure a smooth and intuitive user experience. Use subtle transitions and animations where appropriate to enhance usability.
        - The app should be fully responsive and look great on all screen sizes, from mobile to desktop.
    5.  **Clean & Readable Code:**
        - The HTML should be semantic and well-structured.
        - The JavaScript code must be clean, well-commented, and organized. Use clear variable names and break logic into small, reusable functions.
        - All JavaScript must be within a SINGLE <script> tag at the end of the <body>.
    6.  **Accessibility (A11y):**
        - Use proper ARIA attributes where necessary.
        - Ensure good color contrast and keyboard navigability.
    7.  **No Build Step:** The code must run directly in the browser without any compilation.
    8.  **No Explanations:** The output must ONLY be the raw HTML code. Do not include markdown, comments, or explanations outside the code itself.
    9.  **Functionality:** The final app must be fully functional, implementing all features from the plan. All interactive elements MUST be wired up with vanilla JavaScript in the script tag to make the app work as described.
    10. **Style Tag:** Include an empty <style></style> tag inside the <head>. This is reserved for future CSS modifications.
    `;
    
  try {
    if (model.startsWith('gemini')) {
        const ai = new GoogleGenAI({ apiKey: getApiKey() });
        const config = agentSystemInstruction ? { systemInstruction: agentSystemInstruction } : {};
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: taskPrompt,
            config: config
        });
        return response.text;
    } else {
        return await callOpenRouter(model, agentSystemInstruction || '', taskPrompt);
    }
  } catch (error) {
      console.error(`Error generating code with ${model}:`, error);
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

export const generateNativeAppCode = async (plan: AppPlan, model: ModelID, agentSystemInstruction?: string): Promise<string> => {
  console.log(`Generating native code for app: "${plan.title}" with model ${model}`);
  
  const featuresString = plan.features.map(f => `- ${f}`).join('\n');
  const taskPrompt = `
    You are an expert React Native developer specializing in creating high-quality, production-ready mobile applications with Expo. Your code is clean, efficient, and follows best practices.
    Based on the following plan, generate a single, complete, and runnable App.js file.

    **Application Plan:**
    - **Title:** ${plan.title}
    - **Description:** ${plan.description}
    - **Features:**
    ${featuresString}

    **CRITICAL REQUIREMENTS:**
    1.  **Single File:** The entire application must be contained within a single file.
    2.  **High-Quality Aesthetics & UX:**
        - The application must be visually appealing with a modern, clean design suitable for mobile interfaces.
        - Pay close attention to layout, spacing, and typography using the StyleSheet API.
        - Ensure a smooth and intuitive user experience.
    3.  **Clean & Readable Code:**
        - The code must be well-organized, readable, and commented where necessary.
        - Use functional components with React hooks (\`useState\`, \`useEffect\`, etc.).
        - Define all styles using \`StyleSheet.create()\`; do not use inline styles.
    4.  **React Native & Expo Best Practices:**
        - Import components ONLY from 'react-native'.
        - Use standard components like \`View\`, \`Text\`, \`Button\`, \`TextInput\`, \`ScrollView\`, etc.
    5.  **Functionality:** The final app must be fully functional and implement all features from the plan.
    6.  **No Explanations:** The output must ONLY be the raw JavaScript/JSX code. Do not include any markdown (\`\`\`javascript\`), comments, or explanations outside of the code.
    7.  **Default Export:** The file must end with \`export default App;\`.
    `;
    
  try {
    if (model.startsWith('gemini')) {
        const ai = new GoogleGenAI({ apiKey: getApiKey() });
        const config = agentSystemInstruction ? { systemInstruction: agentSystemInstruction } : {};
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: taskPrompt,
            config: config
        });
        return response.text;
    } else {
        return await callOpenRouter(model, agentSystemInstruction || '', taskPrompt);
    }
  } catch (error) {
      console.error(`Error generating native code with ${model}:`, error);
      return `
        import React from 'react';
        import { View, Text, StyleSheet } from 'react-native';

        export default function App() {
          return (
            <View style={styles.container}>
              <Text style={styles.title}>Error</Text>
              <Text style={styles.text}>Failed to generate the app code.</Text>
            </View>
          );
        }

        const styles = StyleSheet.create({
          container: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#fee2e2',
            padding: 20,
          },
          title: {
            fontSize: 24,
            fontWeight: 'bold',
            color: '#b91c1c',
            marginBottom: 10,
          },
          text: {
            color: '#dc2626',
          }
        });
      `;
  }
};

export const generateFormCode = async (plan: FormPlan, model: ModelID, agentSystemInstruction?: string): Promise<string> => {
  console.log(`Generating code for form: "${plan.title}" with model ${model}`);

  const fieldsString = plan.fields.map(f => `- ${f.name} (type: ${f.type}, required: ${f.required})`).join('\n');
  const taskPrompt = `
    You are an expert web developer who creates beautiful, accessible, and highly functional web forms with a modern, production-ready aesthetic.
    Based on the following plan, generate a complete, single-file HTML document.

    **Form Plan:**
    - **Title:** ${plan.title}
    - **Description:** ${plan.description}
    - **Fields:**
    ${fieldsString}

    **CRITICAL REQUIREMENTS:**
    1.  **Single HTML File:** The output must be a single, complete HTML file.
    2.  **Tailwind CSS:** Use Tailwind CSS for styling. Include the CDN script: <script src="https://cdn.tailwindcss.com"></script>.
    3.  **High-Quality Aesthetics & UX:**
        - The form must be visually stunning, with excellent layout, spacing, and modern input styling (e.g., focus states, transitions).
        - Ensure a smooth and professional user experience.
        - The form must be fully responsive.
    4.  **Advanced Client-Side Validation:**
        - Implement robust validation using vanilla JavaScript inside a <script> tag.
        - Prevent submission if required fields are empty or invalid (e.g., email format).
        - Display clear, user-friendly error messages next to the invalid fields, not using generic alerts. Style these messages appropriately (e.g., red text).
        - Dynamically add/remove error styles as the user interacts with the form.
    5.  **Accessibility (A11y):**
        - Use <label> tags correctly associated with their inputs.
        - Implement ARIA attributes for validation feedback (e.g., \`aria-invalid\`).
    6.  **Netlify Forms Compatibility:**
        - The <form> tag MUST include the 'data-netlify="true"' attribute.
        - Include a honeypot field for spam prevention: <p class="hidden"><label>Don’t fill this out if you’re human: <input name="bot-field" /></label></p>.
    7.  **No Explanations:** The output must be ONLY the raw HTML code. Do not include any markdown like \`\`\`html.
    8.  **Style Tag:** Include an empty <style></style> tag inside the <head> for future CSS edits.
    `;
    
  try {
    if (model.startsWith('gemini')) {
        const ai = new GoogleGenAI({ apiKey: getApiKey() });
        const config = agentSystemInstruction ? { systemInstruction: agentSystemInstruction } : {};
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: taskPrompt,
            config: config
        });
        return response.text;
    } else {
        return await callOpenRouter(model, agentSystemInstruction || '', taskPrompt);
    }
  } catch (error) {
    console.error(`Error generating form code with ${model}:`, error);
    return `
      <!DOCTYPE html>
      <html>
      <head><title>Error</title><script src="https://cdn.tailwindcss.com"></script></head>
      <body><div class="p-4 bg-red-100 text-red-800">Failed to generate form code.</div></body>
      </html>
    `;
  }
};

export const generateDocumentCode = async (plan: DocumentPlan, model: ModelID, agentSystemInstruction?: string): Promise<string> => {
    console.log(`Generating ${plan.documentType} code for: "${plan.title}" with model ${model}`);
    
    let taskPrompt: string;
    if (plan.documentType === 'Presentation') {
        taskPrompt = `
You are an expert presentation designer. Based on the following plan, create a complete, single HTML file that renders a slide deck using Marp (Markdown Presentation Ecosystem).

**Presentation Plan:**
- **Title:** ${plan.title}
- **Outline (Slide Titles):**
${plan.outline.map(item => `- ${item}`).join('\n')}

**CRITICAL REQUIREMENTS:**
1.  **Single HTML File:** The entire presentation must be a single HTML file.
2.  **Marp for Slides:** Use Marp markdown syntax. Each slide is separated by \`---\`.
3.  **Content Generation:** For each slide in the outline, generate relevant, concise, and engaging content. Use headings, lists, bold text, and italics to structure the information effectively.
4.  **Include Marp Renderer:** The HTML file MUST include the Marp web component script in the \`<head>\`:
    \`<script src="https://cdn.jsdelivr.net/npm/@marp-team/marp-core@latest/lib/browser.js"></script>\`
5.  **Styling:** Use Marp's built-in themes (like \`gaia\`, \`uncover\`) or provide custom CSS in a \`<style>\` tag. Ensure the presentation is modern, professional, and visually appealing. Add a theme directive like \`<!-- theme: default -->\` at the top of the markdown.
6.  **Structure:** The Marp markdown should be placed inside a \`<script type="text/marp">\` tag within the \`<body>\`.
7.  **No Explanations:** The output must ONLY be the raw HTML code.
`;
    } else { // PDF
        taskPrompt = `
You are an expert document writer and designer. Based on the following plan, generate a professional, single-file HTML document that is optimized for reading and printing to PDF.

**Document Plan:**
- **Title:** ${plan.title}
- **Outline (Sections/Chapters):**
${plan.outline.map(item => `- ${item}`).join('\n')}

**CRITICAL REQUIREMENTS:**
1.  **Single HTML File:** The entire document must be a single HTML file.
2.  **Tailwind CSS:** Use Tailwind CSS for all styling. Include the CDN script: \`<script src="https://cdn.tailwindcss.com"></script>\`.
3.  **High-Quality Aesthetics:**
    - The document must have a clean, professional, and readable layout, similar to a Google Doc or a Notion page.
    - Use excellent typography, spacing, and a clear visual hierarchy (e.g., H1, H2, H3 for sections).
4.  **Content Generation:** For each section in the outline, generate well-written, detailed, and informative content. Use paragraphs, lists, and other formatting to make the content easy to digest.
5.  **Print-Friendly:** The design should be optimized for printing. Use a white background and dark text. Avoid elements that would not print well. Use \`@media print\` styles in a \`<style>\` tag if necessary for specific print adjustments (e.g., hiding elements).
6.  **No Explanations:** The output must ONLY be the raw HTML code.
`;
    }

    try {
        if (model.startsWith('gemini')) {
            const ai = new GoogleGenAI({ apiKey: getApiKey() });
            const config = agentSystemInstruction ? { systemInstruction: agentSystemInstruction } : {};
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: taskPrompt,
                config: config,
            });
            return response.text;
        } else {
            return await callOpenRouter(model, agentSystemInstruction || '', taskPrompt);
        }
    } catch (error) {
        console.error(`Error generating document code with ${model}:`, error);
        return `
      <!DOCTYPE html>
      <html>
      <head><title>Error</title><script src="https://cdn.tailwindcss.com"></script></head>
      <body><div class="p-4 bg-red-100 text-red-800">Failed to generate the document.</div></body>
      </html>
    `;
    }
};

export const generateComponentCode = async (plan: ComponentPlan, model: ModelID, agentSystemInstruction?: string): Promise<string> => {
    console.log(`Generating code for component: "${plan.name}" with model ${model}`);
    
    const propsString = plan.properties.map(p => `- ${p.name} (type: ${p.type}, default: ${p.defaultValue})`).join('\n');
    const taskPrompt = `
You are an expert web developer creating standalone UI components.
Based on the following plan, generate a single HTML file that showcases the component.

**Component Plan:**
- **Name:** ${plan.name}
- **Description:** ${plan.description}
- **Properties:**
${propsString}

**CRITICAL REQUIREMENTS:**
1.  **Single HTML File:** The entire output must be a single HTML file.
2.  **Demonstration:** The HTML should display one or more examples of the component with different properties to demonstrate its functionality and appearance.
3.  **Styling:** Style the component using Tailwind CSS. Include the CDN script.
4.  **Logic:** If the component is interactive, all logic must be contained in a single vanilla JavaScript <script> tag.
5.  **Isolation:** The component's HTML, CSS, and JS should be self-contained and easy to copy and paste into another project. Add comments to clearly delineate the component's code from the demonstration page code.
6.  **No Explanations:** The output must ONLY be the raw HTML code.
`;

    try {
        if (model.startsWith('gemini')) {
            const ai = new GoogleGenAI({ apiKey: getApiKey() });
            const config = agentSystemInstruction ? { systemInstruction: agentSystemInstruction } : {};
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: taskPrompt,
                config: config,
            });
            return response.text;
        } else {
            return await callOpenRouter(model, agentSystemInstruction || '', taskPrompt);
        }
    } catch (error) {
        console.error(`Error generating component code with ${model}:`, error);
        return `
      <!DOCTYPE html>
      <html>
      <head><title>Error</title><script src="https://cdn.tailwindcss.com"></script></head>
      <body><div class="p-4 bg-red-100 text-red-800">Failed to generate component.</div></body>
      </html>
    `;
    }
};

// FIX: Add generateMultiFileAppCode
export const generateMultiFileAppCode = async (plan: AppPlan, model: ModelID, agentSystemInstruction?: string): Promise<{ [path: string]: string }> => {
    console.log(`Generating multi-file code for app: "${plan.title}" with model ${model}`);
    
    const featuresString = plan.features.map(f => `- ${f}`).join('\n');
    const taskPrompt = `
You are an expert web developer creating modern, multi-file web applications.
Based on the following plan, generate a set of files (HTML, CSS, JavaScript).

**Application Plan:**
- **Title:** ${plan.title}
- **Description:** ${plan.description}
- **Features:**
${featuresString}

**CRITICAL REQUIREMENTS:**
1.  **File Structure:** Create separate files for HTML (\`index.html\`), CSS (\`style.css\`), and JavaScript (\`script.js\`).
2.  **HTML:** The \`index.html\` should link to the CSS and JS files correctly (\`<link rel="stylesheet" href="style.css">\` and \`<script src="script.js" defer></script>\`).
3.  **CSS:** Use modern CSS for styling in \`style.css\`. You can use flexbox, grid, and custom properties for a clean and responsive design. Do not use Tailwind CSS classes in the HTML.
4.  **JavaScript:** Use vanilla JavaScript (ES6+) in \`script.js\` for all application logic. The code should be clean, commented, and well-organized.
5.  **Functionality:** The final app must be fully functional, implementing all features from the plan.
6.  **Return JSON:** You MUST respond with a single JSON object where keys are the file paths and values are the file content as strings.
    Example:
    {
      "index.html": "<!DOCTYPE html>...",
      "style.css": "body { ... }",
      "script.js": "document.addEventListener..."
    }
`;
    const systemInstruction = agentSystemInstruction || '';
    try {
        let resultJson: string;
        if (model.startsWith('gemini')) {
            const ai = new GoogleGenAI({ apiKey: getApiKey() });
            const schema = {
                type: Type.OBJECT,
                properties: {
                    'index.html': { type: Type.STRING },
                    'style.css': { type: Type.STRING },
                    'script.js': { type: Type.STRING },
                },
                required: ['index.html', 'style.css', 'script.js'],
            };
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: taskPrompt,
                config: {
                    ...(agentSystemInstruction ? { systemInstruction: agentSystemInstruction } : {}),
                    responseMimeType: "application/json",
                    responseSchema: schema,
                },
            });
            resultJson = response.text.trim();
        } else {
            resultJson = await callOpenRouter(model, systemInstruction, taskPrompt);
        }
        return JSON.parse(cleanJsonString(resultJson));
    } catch (error) {
        console.error(`Error generating multi-file code with ${model}:`, error);
        throw new Error("Failed to generate multi-file application code.");
    }
};

// FIX: Add generateFullStackAppCode
export const generateFullStackAppCode = async (plan: AppPlan, model: ModelID, agentSystemInstruction?: string): Promise<{ [path: string]: string }> => {
    console.log(`Generating full-stack code for app: "${plan.title}" with model ${model}`);

    const featuresString = plan.features.map(f => `- ${f}`).join('\n');
    const taskPrompt = `
You are an expert full-stack developer creating a simple project with a vanilla HTML/CSS/JS frontend and a Node.js/Express backend.
Based on the plan, generate a set of files for the project.

**Application Plan:**
- **Title:** ${plan.title}
- **Description:** ${plan.description}
- **Features:**
${featuresString}

**CRITICAL REQUIREMENTS:**
1.  **File Structure:**
    - \`package.json\`: Basic config with 'express' as a dependency and a 'start' script.
    - \`server.js\`: A simple Express server. It should serve static files from a 'public' directory and include at least one API endpoint (e.g., \`/api/data\`).
    - \`public/index.html\`: The main frontend file.
    - \`public/style.css\`: The frontend stylesheet.
    - \`public/script.js\`: The frontend JavaScript, which should include a \`fetch\` call to the backend API endpoint.
2.  **Backend:** The \`server.js\` file should be well-commented and create a functional Express server.
3.  **Frontend:** The frontend files should constitute a complete, working user interface that interacts with the backend.
4.  **Return JSON:** You MUST respond with a single JSON object where keys are the full file paths and values are the file content as strings.
    Example:
    {
      "package.json": "{...}",
      "server.js": "const express = require('express'); ...",
      "public/index.html": "<!DOCTYPE html>...",
      "public/style.css": "body { ... }",
      "public/script.js": "fetch('/api/data')..."
    }
`;
    const systemInstruction = agentSystemInstruction || '';
    try {
        let resultJson: string;
        if (model.startsWith('gemini')) {
            const ai = new GoogleGenAI({ apiKey: getApiKey() });
            const schema = {
                type: Type.OBJECT,
                properties: {
                    'package.json': { type: Type.STRING },
                    'server.js': { type: Type.STRING },
                    'public/index.html': { type: Type.STRING },
                    'public/style.css': { type: Type.STRING },
                    'public/script.js': { type: Type.STRING },
                },
                required: ['package.json', 'server.js', 'public/index.html', 'public/style.css', 'public/script.js'],
            };
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: taskPrompt,
                config: {
                    ...(agentSystemInstruction ? { systemInstruction: agentSystemInstruction } : {}),
                    responseMimeType: "application/json",
                    responseSchema: schema,
                },
            });
            resultJson = response.text.trim();
        } else {
            resultJson = await callOpenRouter(model, systemInstruction, taskPrompt);
        }
        return JSON.parse(cleanJsonString(resultJson));
    } catch (error) {
        console.error(`Error generating full-stack code with ${model}:`, error);
        throw new Error("Failed to generate full-stack application code.");
    }
};

export const generateProjectCode = async (plan: ProjectPlan, model: ModelID, agentSystemInstruction?: string): Promise<{ [path: string]: string }> => {
    console.log(`Generating project code for: "${plan.title}" with model ${model}`);
    
    const taskPrompt = `
You are an expert full-stack software engineer. You will be given a complete project plan, including title, description, tech stack, and a detailed file structure.
Your task is to generate the full code for every single file specified in the plan.

**Project Plan:**
- **Title:** ${plan.title}
- **Description:** ${plan.description}
- **Tech Stack:** ${plan.techStack.join(', ')}
- **File Structure:**
${JSON.stringify(plan.fileStructure, null, 2)}

**CRITICAL REQUIREMENTS:**
1.  **Generate All Files:** You MUST provide the complete code for every file listed in the \`fileStructure\`.
2.  **Adhere to Tech Stack:** The code must be written using the specified technologies. For example, if the stack includes "React" and "Vite", generate appropriate JSX, vite configs, etc.
3.  **High-Quality Code:** The code must be clean, functional, well-commented, and follow modern best practices.
4.  **Functionality:** The final generated project must be runnable and fully implement the features implied by the description and file structure.
5.  **Return JSON:** Your response MUST be a single JSON object where the keys are the full file paths (e.g., "src/App.jsx") and the values are the complete file content as a string. Do not nest the JSON object.

Example Response:
{
  "src/App.jsx": "import React from 'react'; ...",
  "src/index.css": "body { ... }",
  "package.json": "{ \\"name\\": \\"...\\" }"
}
`;

    try {
        const ai = new GoogleGenAI({ apiKey: getApiKey() });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: taskPrompt,
            config: {
                ...(agentSystemInstruction ? { systemInstruction: agentSystemInstruction } : {}),
                responseMimeType: "application/json",
                // A dynamic schema is complex, so we ask the model to produce a flat object
                // and parse it carefully.
            },
        });
        const resultJson = response.text.trim();
        return JSON.parse(cleanJsonString(resultJson));
    } catch (error) {
        console.error(`Error generating project code with ${model}:`, error);
        throw new Error("Failed to generate project code.");
    }
};


// FIX: Add generateProject
export const generateProject = async (
    plan: any,
    appMode: AppMode,
    model: ModelID,
    agentSystemInstruction?: string
): Promise<{ [path: string]: string }> => {
    let code: string;
    let fileName = 'index.html';

    switch (appMode) {
        case 'build':
            code = await generateAppCode(plan as AppPlan, model, agentSystemInstruction);
            return { [fileName]: code };
        case 'native':
            code = await generateNativeAppCode(plan as AppPlan, model, agentSystemInstruction);
            fileName = 'App.js';
            return { [fileName]: code };
        case 'form':
            code = await generateFormCode(plan as FormPlan, model, agentSystemInstruction);
            return { [fileName]: code };
        case 'document':
            code = await generateDocumentCode(plan as DocumentPlan, model, agentSystemInstruction);
            return { [fileName]: code };
        case 'component':
            code = await generateComponentCode(plan as ComponentPlan, model, agentSystemInstruction);
            return { [fileName]: code };
        case 'multifile':
            return await generateMultiFileAppCode(plan as AppPlan, model, agentSystemInstruction);
        case 'fullstack':
            return await generateFullStackAppCode(plan as AppPlan, model, agentSystemInstruction);
        case 'project':
            return await generateProjectCode(plan as ProjectPlan, model, agentSystemInstruction);
        default:
            throw new Error(`Code generation for appMode "${appMode}" is not supported.`);
    }
};

export const refineAppCode = async (existingCode: string, prompt: string, model: ModelID, agentSystemInstruction?: string): Promise<RefinementResult> => {
  console.log(`Refining code with prompt: "${prompt}" using model ${model}`);
  
  const taskPrompt = `
    You are an expert web developer tasked with modifying an existing single-file web application built with HTML, Tailwind CSS, and vanilla JavaScript.
    The HTML structure includes a <style> tag in the <head> for CSS modifications.

    **User's Change Request:**
    "${prompt}"

    **Existing Application Code:**
    \`\`\`html
    ${existingCode}
    \`\`\`

    **MODIFICATION STRATEGY:**
    - **For STYLISTIC changes** (e.g., colors, fonts, spacing, borders, sizing): Your HIGHEST PRIORITY is to add or modify CSS rules within the \`<style>\` tag in the \`<head>\`. Use CSS selectors to target elements. AVOID changing HTML and Tailwind classes for purely stylistic updates.
    - **For STRUCTURAL changes** (e.g., adding a button, removing a section, changing the layout logic): You SHOULD modify the HTML structure in the \`<body>\` and the JavaScript in the \`<script>\` tag.
    - **If in doubt, prefer CSS modifications over HTML class changes.**

    **CRITICAL INSTRUCTIONS:**
    1.  **Apply the Change:** Accurately implement the user's request following the MODIFICATION STRATEGY.
    2.  **Analyze and Summarize:** Provide a brief, user-friendly summary of the changes. For 'files_edited', list 'styles.css' if you only changed the \`<style>\` tag. List 'index.html' if you changed the \`<body>\`. List 'script.js' if you changed the \`<script>\` tag. List all that apply.
    3.  **Return JSON:** You MUST respond with a single JSON object with the following structure:
        {
          "code": "The entire, complete, and updated HTML file content as a single string.",
          "summary": "A friendly summary of the changes you made.",
          "files_edited": ["A list of the conceptual files you edited, e.g., 'styles.css', 'index.html']
        }
    4.  **Maintain Structure:** The application must remain a single HTML file. The \`<style>\` tag must be preserved in the \`<head>\`. All JavaScript must remain in one \`<script>\` tag.
    5.  **Preserve Functionality:** Ensure existing functionality remains intact unless the user specifically asks to change or remove it.
    `;
    const systemInstruction = agentSystemInstruction || '';

    try {
        let resultJson: string;
        if (model.startsWith('gemini')) {
            const ai = new GoogleGenAI({ apiKey: getApiKey() });
            const schema = {
                type: Type.OBJECT, properties: { code: { type: Type.STRING }, summary: { type: Type.STRING }, files_edited: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ['code', 'summary', 'files_edited'],
            };
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: taskPrompt,
                config: {
                    ...(agentSystemInstruction ? { systemInstruction: agentSystemInstruction } : {}),
                    responseMimeType: "application/json",
                    responseSchema: schema,
                },
            });
            resultJson = response.text.trim();
        } else {
            resultJson = await callOpenRouter(model, systemInstruction, taskPrompt);
        }
        // @ts-ignore
        return JSON.parse(cleanJsonString(resultJson));
    } catch (error) {
        console.error(`Error refining code with ${model}:`, error);
        throw new Error("Failed to refine the application code.");
    }
};

export const selfCorrectCode = async (
    originalPrompt: string,
    existingCode: string,
    imageBase64: string,
    agentSystemInstruction?: string
): Promise<RefinementResult> => {
    console.log(`Performing self-correction analysis using Gemini Vision.`);
    const ai = new GoogleGenAI({ apiKey: getApiKey() });

    const taskPrompt = `You are an expert QA engineer. Your task is to review a web application that was generated by an AI. You will be given the original user prompt, a screenshot of the app, and the full HTML code.

**Your Goal:**
Compare the screenshot and code against the original prompt.
1.  **If the app perfectly matches the prompt's requirements** and has no visual bugs, you MUST respond with a JSON object where the "summary" field is EXACTLY the string "NO_CHANGES_NEEDED".
2.  **If there are any issues** (e.g., functionality is missing, visual glitches, doesn't match the prompt), you MUST fix the HTML/CSS/JS code. Then, respond with a JSON object containing the full, corrected code and a summary of the fixes.

**Original User Prompt:**
"${originalPrompt}"

**Existing Application Code:**
\`\`\`html
${existingCode}
\`\`\`

**CRITICAL RESPONSE FORMAT:**
You MUST respond with a single JSON object.
- For a perfect app: \`{"code": "", "summary": "NO_CHANGES_NEEDED", "files_edited": []}\`
- For a corrected app: \`{"code": "...", "summary": "...", "files_edited": ["..."]}\``;

    const schema = {
        type: Type.OBJECT,
        properties: { code: { type: Type.STRING }, summary: { type: Type.STRING }, files_edited: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ['code', 'summary', 'files_edited'],
    };

    const imagePart = { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } };
    const textPart = { text: taskPrompt };

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
            config: {
                ...(agentSystemInstruction ? { systemInstruction: agentSystemInstruction } : {}),
                responseMimeType: "application/json",
                responseSchema: schema,
            },
        });
        // @ts-ignore
        return JSON.parse(response.text.trim());
    } catch (error) {
        console.error("Error during self-correction:", error);
        throw new Error("Failed to analyze the application code.");
    }
};

export const refineNativeAppCode = async (existingCode: string, prompt: string, model: ModelID, agentSystemInstruction?: string): Promise<RefinementResult> => {
  console.log(`Refining native code with prompt: "${prompt}" using model ${model}`);

  const taskPrompt = `
    You are an expert React Native developer modifying an existing single-file mobile application built for Expo.
    You will be given the application's complete current code and a user's request for a change.

    **User's Change Request:**
    "${prompt}"

    **Existing Application Code:**
    \`\`\`javascript
    ${existingCode}
    \`\`\`

    **CRITICAL INSTRUCTIONS:**
    1.  **Apply the Change:** Your primary goal is to accurately implement the user's requested change into the provided code.
    2.  **Analyze and Summarize:** After applying the change, provide a brief, user-friendly summary of what you did. Since this is a single file, the "files_edited" array should just contain "App.js".
    3.  **Return JSON:** You MUST respond with a single JSON object with the following structure:
        {
          "code": "The entire, complete, and updated App.js file content as a single string.",
          "summary": "A friendly summary of the changes you made.",
          "files_edited": ["App.js"]
        }
    4.  **Maintain Structure:** The application must remain a single file. Continue to use standard React Native components and \`StyleSheet\` for styling.
    5.  **Preserve Functionality:** Ensure existing functionality remains intact unless the user specifically asks to change or remove it.
    `;
    const systemInstruction = agentSystemInstruction || '';

    try {
        let resultJson: string;
        if (model.startsWith('gemini')) {
            const ai = new GoogleGenAI({ apiKey: getApiKey() });
            const schema = {
                type: Type.OBJECT, properties: { code: { type: Type.STRING }, summary: { type: Type.STRING }, files_edited: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ['code', 'summary', 'files_edited'],
            };
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: taskPrompt,
                config: {
                    ...(agentSystemInstruction ? { systemInstruction: agentSystemInstruction } : {}),
                    responseMimeType: "application/json",
                    responseSchema: schema,
                },
            });
            resultJson = response.text.trim();
        } else {
            resultJson = await callOpenRouter(model, systemInstruction, taskPrompt);
        }
        // @ts-ignore
        return JSON.parse(cleanJsonString(resultJson));
    } catch (error) {
        console.error(`Error refining native code with ${model}:`, error);
        throw new Error("Failed to refine the application code.");
    }
};

// FIX: Add refineMultiFileCode
export const refineMultiFileCode = async (files: { [path: string]: string }, prompt: string, model: ModelID, agentSystemInstruction?: string): Promise<RefinementResult> => {
    console.log(`Refining multi-file code with prompt: "${prompt}" using model ${model}`);
    const filesString = Object.entries(files).map(([path, content]) => `
--- FILE: ${path} ---
\`\`\`
${content}
\`\`\`
`).join('\n');

    const taskPrompt = `
You are an expert web developer tasked with modifying an existing multi-file web application.
The user will provide a change request and the full content of all relevant files.

**User's Change Request:**
"${prompt}"

**Existing Application Files:**
${filesString}

**CRITICAL INSTRUCTIONS:**
1.  **Analyze and Apply:** Carefully analyze all provided files and the user's request. Modify one or more files to implement the change.
2.  **Return All Files:** You MUST return the complete and updated content for ALL original files, even those you did not change.
3.  **Summarize:** Provide a brief, user-friendly summary of the changes you made and list the file paths of the files you edited.
4.  **Return JSON:** You MUST respond with a single JSON object with the following structure:
    {
      "files": {
        "path/to/file1.html": "...",
        "path/to/file2.css": "...",
        "path/to/file3.js": "..."
      },
      "summary": "A friendly summary of the changes you made.",
      "files_edited": ["path/to/file2.css", "path/to/file3.js"]
    }
5.  **Maintain Structure:** Preserve the original file structure. Do not add or remove files unless specifically requested.
6.  **Preserve Functionality:** Ensure existing functionality remains intact unless the user explicitly asks to change or remove it.
`;
    const systemInstruction = agentSystemInstruction || '';

    try {
        let resultJson: string;
        if (model.startsWith('gemini')) {
            const ai = new GoogleGenAI({ apiKey: getApiKey() });
            const schema = {
                type: Type.OBJECT,
                properties: {
                    files: {
                        type: Type.OBJECT,
                        additionalProperties: { type: Type.STRING },
                    },
                    summary: { type: Type.STRING },
                    files_edited: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING }
                    }
                },
                required: ['files', 'summary', 'files_edited'],
            };
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: taskPrompt,
                config: {
                    ...(agentSystemInstruction ? { systemInstruction: agentSystemInstruction } : {}),
                    responseMimeType: "application/json",
                    responseSchema: schema,
                },
            });
            resultJson = response.text.trim();
        } else {
            resultJson = await callOpenRouter(model, systemInstruction, taskPrompt);
        }
        return JSON.parse(cleanJsonString(resultJson));
    } catch (error) {
        console.error(`Error refining multi-file code with ${model}:`, error);
        throw new Error("Failed to refine the application code.");
    }
};

export const debugCode = async (
    files: { [path: string]: string },
    error: ConsoleMessage,
    model: ModelID,
    agentSystemInstruction: string | undefined,
    appMode: AppMode
): Promise<RefinementResult> => {
    console.log(`Debugging code with error: "${error.content[0]}"`);
    const filesString = Object.entries(files).map(([path, content]) => `
--- FILE: ${path} ---
\`\`\`
${content}
\`\`\`
`).join('\n');

    const taskPrompt = `
You are an expert AI software engineer specializing in debugging. You will be given the full code for an application and a runtime error that occurred. Your task is to identify the bug, fix it, and explain your reasoning.

**Runtime Error:**
\`\`\`
${error.content.join(' ')}
\`\`\`

**Existing Application Files:**
${filesString}

**CRITICAL INSTRUCTIONS:**
1.  **Analyze and Fix:** Carefully analyze the error message and the provided code to locate the bug. Fix the bug by modifying the necessary file(s).
2.  **Return All Files:** You MUST return the complete and updated content for ALL original files in a \`files\` object, even for files you did not change.
3.  **Explain the Fix:** Provide a brief, user-friendly summary explaining what the bug was and how you fixed it.
4.  **Return JSON:** You MUST respond with a single JSON object with the following structure:
    {
      "files": {
        "path/to/file1.html": "...",
        "path/to/file2.css": "...",
        "path/to/file3.js": "..."
      },
      "summary": "A friendly explanation of the fix.",
      "files_edited": ["path/to/the/file/I/edited.js"]
    }
5.  **Preserve Functionality:** Ensure your fix does not break any other existing functionality.
`;
    const systemInstruction = agentSystemInstruction || '';
    
    // For now, AI debugging is only implemented for Gemini.
    try {
        const ai = new GoogleGenAI({ apiKey: getApiKey() });
        const schema = {
            type: Type.OBJECT,
            properties: {
                files: { type: Type.OBJECT, additionalProperties: { type: Type.STRING } },
                summary: { type: Type.STRING },
                files_edited: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ['files', 'summary', 'files_edited'],
        };
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: taskPrompt,
            config: {
                ...(agentSystemInstruction ? { systemInstruction: agentSystemInstruction } : {}),
                responseMimeType: "application/json",
                responseSchema: schema,
            },
        });
        const resultJson = response.text.trim();
        return JSON.parse(cleanJsonString(resultJson));
    } catch (error) {
        console.error(`Error debugging code with ${model}:`, error);
        throw new Error("Failed to debug the application code.");
    }
};


// FIX: Add refineFiles
export const refineFiles = async (
    files: { [path: string]: string },
    prompt: string,
    model: ModelID,
    agentSystemInstruction: string | undefined,
    appMode: AppMode
): Promise<RefinementResult> => {
    if (appMode === 'native') {
        const result: any = await refineNativeAppCode(files['App.js'] || '', prompt, model, agentSystemInstruction);
        return {
            files: { 'App.js': result.code },
            summary: result.summary,
            files_edited: result.files_edited
        };
    }
    
    if (['build', 'form', 'document', 'component'].includes(appMode)) {
        // These are single-file web apps
        const result: any = await refineAppCode(files['index.html'] || '', prompt, model, agentSystemInstruction);
        return {
            files: { 'index.html': result.code },
            summary: result.summary,
            files_edited: result.files_edited
        };
    }
    
    if (['multifile', 'fullstack', 'project'].includes(appMode)) {
        return await refineMultiFileCode(files, prompt, model, agentSystemInstruction);
    }

    // Fallback or error for unsupported modes
    throw new Error(`Refinement for appMode "${appMode}" is not supported.`);
};

// FIX: Add wrapSimpleCodeCall
export const wrapSimpleCodeCall = (
    isTranslation: boolean,
    isCloning: boolean,
    prompt: string,
    model: ModelID,
    agentSystemInstruction?: string
): Promise<{ [path: string]: string }> | null => {
    if (isTranslation) {
        return translateCodeToWebApp(prompt, model, agentSystemInstruction)
            .then(code => ({ 'index.html': code }));
    }
    if (isCloning) {
        return cloneWebsite(prompt, model, agentSystemInstruction)
            .then(code => ({ 'index.html': code }));
    }
    return null;
};


export const translateCodeToWebApp = async (sourceCode: string, model: ModelID, agentSystemInstruction?: string): Promise<string> => {
    console.log(`Translating code to web app with model ${model}`);
    const taskPrompt = `
You are an expert polyglot developer who specializes in translating application logic from various programming languages into standalone, single-file web applications (HTML, Tailwind CSS, vanilla JS).

**User's Source Code:**
\`\`\`
${sourceCode}
\`\`\`

**Your Task:**
1.  **Analyze the source code** to understand its core functionality, logic, and intended purpose.
2.  **Re-implement the functionality** as a visually appealing, user-friendly, single-file web application.
3.  **Follow all CRITICAL REQUIREMENTS** for building high-quality web apps: Single HTML file, Tailwind CSS from CDN, clean vanilla JS in one script tag, responsive design, and high-quality aesthetics.
4.  **No Explanations:** The output must ONLY be the raw HTML code.
`;
    try {
        if (model.startsWith('gemini')) {
            const ai = new GoogleGenAI({ apiKey: getApiKey() });
            const config = agentSystemInstruction ? { systemInstruction: agentSystemInstruction } : {};
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: taskPrompt,
                config: config,
            });
            return response.text;
        } else {
            return await callOpenRouter(model, agentSystemInstruction || '', taskPrompt);
        }
    } catch (error) {
        console.error(`Error translating code with ${model}:`, error);
        throw new Error("Failed to translate code to web app.");
    }
};

export const cloneWebsite = async (url: string, model: ModelID, agentSystemInstruction?: string): Promise<string> => {
  console.log(`Cloning website from URL: "${url}" with model ${model}`);
  const taskPrompt = `
    You are an expert web developer who specializes in creating high-fidelity clones of existing websites. Your task is to replicate the visual design, layout, and structure of the provided URL as a single-file web application.

    **Target URL to Clone:**
    ${url}

    **CRITICAL REQUIREMENTS:**
    1.  **Analyze the Target:** Conceptually "view" the website at the provided URL. Pay close attention to its HTML structure, color scheme, typography, spacing, layout, and any key interactive components.
    2.  **Single HTML File:** The entire clone must be contained within a single HTML file.
    3.  **Vanilla JavaScript:** If there is simple interactivity (e.g., dropdowns, modals), replicate it using modern, vanilla JavaScript (ES6+). All JavaScript must be within a SINGLE <script> tag at the end of the <body>. Do NOT use React, Vue, or any other framework.
    4.  **Tailwind CSS:** Replicate all styling using Tailwind CSS. You MUST include the Tailwind CSS CDN script in the <head>: <script src="https://cdn.tailwindcss.com"></script>. Do not use external stylesheets or extensive custom CSS in a <style> tag. Rely on Tailwind classes.
    5.  **High-Fidelity Replica:** The final output should be a visually accurate clone of the original site's "above the fold" content or primary landing page view. You don't need to clone the entire multi-page site, just the main page provided in the URL.
    6.  **Image and Asset Handling:** Replace images with appropriate placeholders from a service like \`https://placehold.co/\` or use descriptive alt text. For example: \`<img src="https://placehold.co/600x400" alt="Hero image of a mountain landscape">\`. Do not attempt to use the original image URLs.
    7.  **No Explanations:** The output must ONLY be the raw HTML code. Do not include markdown, comments, or explanations outside the code itself.
    8.  **Clean & Readable Code:** The generated code should be well-structured, semantic, and clean.
    `;
    
  try {
    if (model.startsWith('gemini')) {
        const ai = new GoogleGenAI({ apiKey: getApiKey() });
        const config = agentSystemInstruction ? { systemInstruction: agentSystemInstruction } : {};
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: taskPrompt,
            config: config
        });
        return response.text;
    } else {
        return await callOpenRouter(model, agentSystemInstruction || '', taskPrompt);
    }
  } catch (error) {
      console.error(`Error cloning website with ${model}:`, error);
      return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <title>Error Cloning Site</title>
          <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="bg-red-100 flex items-center justify-center h-screen font-sans">
          <div class="text-center p-8 bg-white rounded-lg shadow-lg">
            <h1 class="text-2xl font-bold text-red-700">Failed to Clone Website</h1>
            <p class="text-red-600 mt-2">Sorry, there was an error communicating with the AI model to clone the website from the provided URL.</p>
          </div>
        </body>
        </html>
      `;
  }
};


export const analyzeUiUx = async (code: string, imageBase64: string, agentSystemInstruction?: string): Promise<UiUxAnalysis> => {
    console.log(`Analyzing UI/UX for the generated app.`);
    const ai = new GoogleGenAI({ apiKey: getApiKey() });

    const taskPrompt = `You are a world-class UI/UX design expert. You will be given the code and a screenshot of a web application. Your task is to provide a concise, actionable critique of its design and usability.

**Instructions:**
1.  Analyze the provided screenshot for key UI/UX principles: layout, spacing, typography, color contrast, accessibility, and visual hierarchy.
2.  Provide a one-sentence **headline** that summarizes your overall impression.
3.  Provide a list of 3-5 specific, actionable **suggestions** for improvement. Each suggestion should specify the design **area** (e.g., "Color Contrast", "Typography") and the **suggestion** itself.
4.  Do not comment on the code, only on the visual design in the screenshot.

**Existing Code (for context):**
\`\`\`html
${code}
\`\`\`

**CRITICAL RESPONSE FORMAT:**
You MUST respond with a single JSON object with the exact structure below:
{
  "headline": "string",
  "suggestions": [
    { "area": "string", "suggestion": "string" },
    ...
  ]
}`;
    
    const schema = {
        type: Type.OBJECT,
        properties: {
            headline: { type: Type.STRING },
            suggestions: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        area: { type: Type.STRING },
                        suggestion: { type: Type.STRING },
                    },
                    required: ['area', 'suggestion'],
                }
            }
        },
        required: ['headline', 'suggestions'],
    };

    const imagePart = { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } };
    const textPart = { text: taskPrompt };

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
            config: {
                ...(agentSystemInstruction ? { systemInstruction: agentSystemInstruction } : {}),
                responseMimeType: "application/json",
                responseSchema: schema,
            },
        });
        return JSON.parse(response.text.trim());
    } catch (error) {
        console.error("Error during UI/UX analysis:", error);
        throw new Error("Failed to analyze the application's UI/UX.");
    }
};

export const generateDocumentation = async (code: string, model: ModelID, agentSystemInstruction?: string): Promise<string> => {
    console.log(`Generating documentation for code with model ${model}`);
    
    const taskPrompt = `
You are an expert technical writer. Your task is to generate clear, concise documentation for the provided single-file web application.

**Application Code:**
\`\`\`html
${code}
\`\`\`

**Instructions:**
- Analyze the HTML, CSS (in the style tag), and JavaScript (in the script tag).
- Generate documentation in **Markdown format**.
- The documentation should include:
    1.  A brief **Overview** of what the application does.
    2.  A **Features** section listing its key capabilities.
    3.  A **Code Breakdown** section explaining:
        - The overall HTML structure.
        - Key JavaScript functions and their purpose.
- Your response must be ONLY the raw Markdown text. Do not include any other explanations.
`;
    
    try {
        if (model.startsWith('gemini')) {
            const ai = new GoogleGenAI({ apiKey: getApiKey() });
            const config = agentSystemInstruction ? { systemInstruction: agentSystemInstruction } : {};
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: taskPrompt,
                config: config,
            });
            return response.text;
        } else {
            return await callOpenRouter(model, agentSystemInstruction || '', taskPrompt);
        }
    } catch (error) {
        console.error(`Error generating documentation with ${model}:`, error);
        throw new Error("Failed to generate documentation from the AI model.");
    }
};