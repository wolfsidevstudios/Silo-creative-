

import { GoogleGenAI, Type } from "@google/genai";
import { AppPlan, Flashcard, FormPlan, ReactAppPlan } from '../types';
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

export const generateReactAppPlan = async (prompt: string, agentSystemInstruction?: string): Promise<ReactAppPlan> => {
  console.log(`Generating React app plan for prompt: "${prompt}"`);
  const ai = new GoogleGenAI({ apiKey: getApiKey() });

  const taskInstruction = `You are an expert software architect planning a React web application using Vite, TypeScript, and Tailwind CSS. Based on the user's prompt, create a plan. The plan must include a title, description, key features, and a detailed file structure.

The file structure must always include these essential files:
- \`index.html\`: The main HTML entry point.
- \`package.json\`: For dependencies and scripts.
- \`vite.config.ts\`: Vite configuration.
- \`tsconfig.json\`: TypeScript configuration.
- \`tailwind.config.js\`: Tailwind CSS configuration.
- \`postcss.config.js\`: PostCSS configuration.
- \`src/main.tsx\`: The main React render entry point.
- \`src/App.tsx\`: The root App component.
- \`src/index.css\`: For global styles and Tailwind imports.

You can also add other files like components (e.g., \`src/components/Header.tsx\`) or utility files as needed.

You must respond with only a JSON object.`;

  const systemInstruction = combineInstructions(agentSystemInstruction, taskInstruction);
  const schema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      description: { type: Type.STRING },
      features: { type: Type.ARRAY, items: { type: Type.STRING } },
      files: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: 'Full path of the file, e.g., src/components/Button.tsx' },
            description: { type: Type.STRING, description: 'A brief description of the file\'s purpose.' },
          },
          required: ['name', 'description'],
        },
      },
    },
    required: ['title', 'description', 'features', 'files'],
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });
    const planJson = response.text.trim();
    return JSON.parse(planJson);
  } catch (error) {
    console.error("Error generating React app plan:", error);
    throw new Error("Failed to generate a React app plan.");
  }
};


export const generateFormPlan = async (prompt: string, agentSystemInstruction?: string): Promise<FormPlan> => {
    console.log(`Generating form plan for prompt: "${prompt}"`);

    const ai = new GoogleGenAI({ apiKey: getApiKey() });

    const taskInstruction = `You are an expert form designer. A user wants to build a web form. Create a plan for this form.

The plan must include:
1.  A short **title** for the form.
2.  A one-sentence **description**.
3.  A list of **fields**, each with a 'name' (e.g., "Full Name"), 'type' (e.g., "text", "email", "textarea", "select", "checkbox", "radio"), and a 'required' boolean status.

Respond with ONLY the JSON object.`;
    
    const systemInstruction = combineInstructions(agentSystemInstruction, taskInstruction);

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
        const plan: FormPlan = JSON.parse(planJson);
        return plan;
    } catch (error) {
        console.error("Error generating form plan with Gemini:", error);
        throw new Error("Failed to generate a form plan from the AI model.");
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
    You are an expert web developer specializing in creating modern, single-file web applications using React and Tailwind CSS.
    Based on the following plan, generate a complete, single HTML file.

    **Application Plan:**
    - **Title:** ${plan.title}
    - **Description:** ${plan.description}
    - **Features:**
    ${featuresString}

    **CRITICAL REQUIREMENTS:**
    1.  **Single HTML File:** The entire application must be contained within a single HTML file.
    2.  **React with HTM:** Use React for the application logic and UI. Since there's no build step, use the "HTM" library to enable JSX-like syntax.
    3.  **CDN Scripts:** Include these exact scripts in the <head> in this order:
        - React: <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
        - ReactDOM: <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
        - HTM: <script src="https://unpkg.com/htm@3/dist/htm.umd.js"></script>
        - Tailwind CSS: <script src="https://cdn.tailwindcss.com"></script>
    4.  **Body Structure:** The <body> must contain a single root element: <div id="root"></div>.
    5.  **JavaScript Logic:** All JavaScript code must be within a SINGLE <script type="module"> tag at the end of the <body>.
    6.  **Code Structure within Script:**
        - First, initialize htm: const html = htm.bind(React.createElement);
        - Define your main React component (e.g., function App() { ... }).
        - Use React hooks like useState and useEffect for state and side effects.
        - Use the 'html' tagged template literal for rendering, like so: return html\`<div className="bg-blue-500">Hello \${name}</div>\`;
        - Finally, render your main component to the root div: ReactDOM.render(html\`<\${App} />\`, document.getElementById('root'));
    7.  **No Explanations:** The output must ONLY be the raw HTML code. Do not include any markdown, comments, or explanations outside of the code.
    8.  **Functionality:** The final app must be fully functional and implement all features from the plan. It should be visually appealing and well-styled with Tailwind CSS.
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

export const generateReactAppCode = async (plan: ReactAppPlan, agentSystemInstruction?: string): Promise<{ [fileName: string]: string }> => {
  console.log(`Generating React app code for: "${plan.title}"`);
  const ai = new GoogleGenAI({ apiKey: getApiKey() });

  const taskPrompt = `
    You are an expert full-stack developer. Based on the following plan, generate the code for a complete React web application.

    **Application Plan:**
    - **Title:** ${plan.title}
    - **Description:** ${plan.description}
    - **Features:**
${plan.features.map(f => `    - ${f}`).join('\n')}
    - **File Structure:**
${plan.files.map(f => `    - \`${f.name}\`: ${f.description}`).join('\n')}

    **CRITICAL REQUIREMENTS:**
    1.  **Vite + React + TypeScript:** The project must be a standard Vite project.
    2.  **Tailwind CSS:** Ensure Tailwind is correctly set up in \`tailwind.config.js\`, \`postcss.config.js\`, and imported in \`src/index.css\`. The \`tailwind.config.js\` content array must be correctly configured (e.g., \`"./index.html", "./src/**/*.{js,ts,jsx,tsx}"\`).
    3.  **Dependencies:** The \`package.json\` must include \`react\` and \`react-dom\` in \`dependencies\`. It must include \`@types/react\`, \`@types/react-dom\`, \`vite\`, \`@vitejs/plugin-react\`, \`typescript\`, \`tailwindcss\`, \`postcss\`, and \`autoprefixer\` in \`devDependencies\`.
    4.  **Runnable Code:** All generated code must be complete, correct, and runnable.
    5.  **JSON Output:** Your entire response MUST be a single JSON object. The keys must be the full file paths (e.g., "src/App.tsx"), and the values must be the complete code for that file as a string. Do not include any other text, explanations, or markdown.
    `;
    
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: taskPrompt,
      config: {
        systemInstruction: agentSystemInstruction,
        responseMimeType: "application/json",
      },
    });
    const codeJson = response.text.trim();
    const sanitizedJson = codeJson.replace(/^```json\n/, '').replace(/\n```$/, '');
    return JSON.parse(sanitizedJson);
  } catch (error) {
    console.error("Error generating React app code:", error);
    throw new Error("Failed to generate React app code.");
  }
};


export const generateNativeAppCode = async (plan: AppPlan, agentSystemInstruction?: string): Promise<string> => {
  console.log(`Generating native code for app: "${plan.title}"`);

  const ai = new GoogleGenAI({ apiKey: getApiKey() });

  const featuresString = plan.features.map(f => `- ${f}`).join('\n');
  const taskPrompt = `
    You are an expert React Native developer specializing in creating mobile applications with Expo.
    Based on the following plan, generate a single, complete, and runnable App.js file.

    **Application Plan:**
    - **Title:** ${plan.title}
    - **Description:** ${plan.description}
    - **Features:**
    ${featuresString}

    **CRITICAL REQUIREMENTS:**
    1.  **Single File:** The entire application must be contained within a single file.
    2.  **React Native & Expo:** Use React for the application logic and UI. Import components ONLY from 'react-native'. Do not import from 'react-native-web' or any other web-specific library.
    3.  **Standard Components:** Use standard React Native components like \`View\`, \`Text\`, \`Button\`, \`StyleSheet\`, \`TextInput\`, \`Image\`, etc.
    4.  **Styling:** Use \`StyleSheet.create()\` for all styles. Do not use inline styles.
    5.  **Functional Components:** The root component must be a functional component named \`App\`. Use React hooks like \`useState\` and \`useEffect\`.
    6.  **No Explanations:** The output must ONLY be the raw JavaScript/JSX code. Do not include any markdown (\`\`\`javascript\`), comments, or explanations outside of the code.
    7.  **Functionality:** The final app must be fully functional and implement all features from the plan. It should be visually appealing and well-structured.
    8.  **Default Export:** The file must end with \`export default App;\`.
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
      console.error("Error generating native code with Gemini:", error);
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

export const generateFormCode = async (plan: FormPlan, agentSystemInstruction?: string): Promise<string> => {
  console.log(`Generating code for form: "${plan.title}"`);
  const ai = new GoogleGenAI({ apiKey: getApiKey() });

  const fieldsString = plan.fields.map(f => `- ${f.name} (type: ${f.type}, required: ${f.required})`).join('\n');

  const taskPrompt = `
    You are an expert web developer who creates beautiful, accessible, and highly functional web forms with a modern aesthetic.
    Based on the following plan, generate a complete, single-file HTML document.

    **Form Plan:**
    - **Title:** ${plan.title}
    - **Description:** ${plan.description}
    - **Fields:**
    ${fieldsString}

    **CRITICAL REQUIREMENTS:**
    1.  **Single HTML File:** The output must be a single, complete HTML file.
    2.  **Tailwind CSS:** Use Tailwind CSS for styling. Include the CDN script: <script src="https://cdn.tailwindcss.com"></script>.
    3.  **Netlify Forms Compatibility:** The <form> tag MUST include the 'data-netlify="true"' attribute. Also include a honeypot field for spam prevention: <p class="hidden"><label>Don’t fill this out if you’re human: <input name="bot-field" /></label></p>.
    4.  **Advanced Client-Side Validation:** Implement robust client-side validation using vanilla JavaScript within a <script> tag.
        - The form should not submit if required fields are empty or if email fields are invalid.
        - Display clear, user-friendly error messages next to the invalid fields, not using generic alerts. Style these error messages (e.g., red text).
        - Add and remove error states/styles dynamically as the user interacts with the form.
    5.  **Aesthetics & UX:** The form should be visually appealing, with excellent layout, spacing, and modern input styling. Use transitions for a smoother user experience.
    6.  **No Explanations:** The output must be ONLY the raw HTML code. Do not include any markdown like \`\`\`html.
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
    console.error("Error generating form code with Gemini:", error);
    return `
      <!DOCTYPE html>
      <html>
      <head><title>Error</title><script src="https://cdn.tailwindcss.com"></script></head>
      <body><div class="p-4 bg-red-100 text-red-800">Failed to generate form code.</div></body>
      </html>
    `;
  }
};

export const refineAppCode = async (existingCode: string, prompt: string, agentSystemInstruction?: string): Promise<string> => {
  console.log(`Refining code with prompt: "${prompt}"`);

  const ai = new GoogleGenAI({ apiKey: getApiKey() });

  const taskPrompt = `
    You are an expert web developer tasked with modifying an existing single-file web application built with React, HTM, and Tailwind CSS.
    You will be given the application's complete current HTML code and a user's request for a change.

    **User's Change Request:**
    "${prompt}"

    **Existing Application Code:**
    \`\`\`html
    ${existingCode}
    \`\`\`

    **CRITICAL INSTRUCTIONS:**
    1.  **Apply the Change:** Your primary goal is to accurately implement the user's requested change into the provided code.
    2.  **Return the Full Code:** You MUST return the entire, complete, and updated HTML file. Do NOT provide only the changed snippets, explanations, or markdown formatting. Your response should be only the raw HTML code.
    3.  **Maintain Structure:** The application must remain a single HTML file with React, ReactDOM, HTM, and Tailwind CSS loaded from CDN. All JavaScript logic must be within the single \`<script type="module">\`.
    4.  **Preserve Functionality:** Ensure that the existing functionality of the application remains intact unless the user's request specifically asks to change or remove it.
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
      console.error("Error refining code with Gemini:", error);
      // On error, we throw so the UI can inform the user but keep the old code.
      throw new Error("Failed to refine the application code.");
  }
};

export const refineReactAppCode = async (fileTree: { [fileName: string]: string }, prompt: string, agentSystemInstruction?: string): Promise<{ [fileName: string]: string }> => {
  console.log(`Refining React app code with prompt: "${prompt}"`);
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  
  const taskPrompt = `
    You are an expert full-stack developer modifying an existing React web application.
    You will be given the application's complete file structure and code as a JSON object, and a user's request for a change.

    **User's Change Request:**
    "${prompt}"

    **Existing Application Code (as JSON):**
    \`\`\`json
    ${JSON.stringify(fileTree, null, 2)}
    \`\`\`

    **CRITICAL INSTRUCTIONS:**
    1.  **Apply the Change:** Accurately implement the user's change. This might involve modifying existing files, adding new files, or deleting files.
    2.  **Return the Full Project:** You MUST return the entire, complete, and updated file tree as a single JSON object. The keys must be the file paths and values must be the full code for that file.
    3.  **Maintain Structure:** The project must remain a standard Vite + React + TypeScript project.
    4.  **Preserve Functionality:** Ensure that existing functionality remains intact unless the user's request specifically asks to change it.
  `;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: taskPrompt,
      config: {
        systemInstruction: agentSystemInstruction,
        responseMimeType: "application/json",
      },
    });
    const codeJson = response.text.trim();
    const sanitizedJson = codeJson.replace(/^```json\n/, '').replace(/\n```$/, '');
    return JSON.parse(sanitizedJson);
  } catch (error) {
    console.error("Error refining React app code:", error);
    throw new Error("Failed to refine the React application code.");
  }
};


export const refineNativeAppCode = async (existingCode: string, prompt: string, agentSystemInstruction?: string): Promise<string> => {
  console.log(`Refining native code with prompt: "${prompt}"`);

  const ai = new GoogleGenAI({ apiKey: getApiKey() });

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
    2.  **Return the Full Code:** You MUST return the entire, complete, and updated file. Do NOT provide only the changed snippets, explanations, or markdown formatting. Your response should be only the raw code.
    3.  **Maintain Structure:** The application must remain a single file. Continue to use standard React Native components and \`StyleSheet\` for styling.
    4.  **Preserve Functionality:** Ensure that the existing functionality of the application remains intact unless the user's request specifically asks to change or remove it.
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
      console.error("Error refining native code with Gemini:", error);
      throw new Error("Failed to refine the application code.");
  }
};
