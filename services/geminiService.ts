
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { AppPlan, Flashcard, FormPlan, DocumentPlan, RefinementResult } from '../types';
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

export const generateDocumentPlan = async (prompt: string, agentSystemInstruction?: string): Promise<DocumentPlan> => {
  console.log(`Generating document plan for prompt: "${prompt}"`);

  const ai = new GoogleGenAI({ apiKey: getApiKey() });

  const taskInstruction = `You are an expert document architect. A user wants to create a document or presentation. Analyze their prompt to determine the best format and create a plan.

The plan must include:
1.  A concise **title**.
2.  A **documentType**, which must be either "PDF" or "Presentation".
3.  A detailed **outline** as an array of strings. For a PDF, this should be chapter or section titles. For a Presentation, this should be the title of each slide.

Respond with ONLY the JSON object.`;
    
  const systemInstruction = combineInstructions(agentSystemInstruction, taskInstruction);

  const schema = {
      type: Type.OBJECT,
      properties: {
          title: { type: Type.STRING },
          documentType: { type: Type.STRING },
          outline: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
          },
      },
      required: ['title', 'documentType', 'outline'],
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
      const plan: DocumentPlan = JSON.parse(planJson);
      return plan;
  } catch (error) {
      console.error("Error generating document plan with Gemini:", error);
      throw new Error("Failed to generate a document plan from the AI model.");
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

export const generateNativeAppCode = async (plan: AppPlan, agentSystemInstruction?: string): Promise<string> => {
  console.log(`Generating native code for app: "${plan.title}"`);

  const ai = new GoogleGenAI({ apiKey: getApiKey() });

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

export const generateDocumentCode = async (plan: DocumentPlan, agentSystemInstruction?: string): Promise<string> => {
    console.log(`Generating ${plan.documentType} code for: "${plan.title}"`);
    const ai = new GoogleGenAI({ apiKey: getApiKey() });

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

Example Structure:
<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.jsdelivr.net/npm/@marp-team/marp-core@latest/lib/browser.js"></script>
  <style>/* Custom CSS here */</style>
</head>
<body>
  <script type="text/marp">
  <!-- theme: gaia -->
  # Slide 1 Title
  Content...
  ---
  # Slide 2 Title
  Content...
  </script>
</body>
</html>
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

    const config = agentSystemInstruction ? { systemInstruction: agentSystemInstruction } : {};

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: taskPrompt,
            config: config,
        });
        return response.text;
    } catch (error) {
        console.error("Error generating document code with Gemini:", error);
        return `
      <!DOCTYPE html>
      <html>
      <head><title>Error</title><script src="https://cdn.tailwindcss.com"></script></head>
      <body><div class="p-4 bg-red-100 text-red-800">Failed to generate the document.</div></body>
      </html>
    `;
    }
};


export const refineAppCode = async (existingCode: string, prompt: string, agentSystemInstruction?: string): Promise<RefinementResult> => {
  console.log(`Refining code with prompt: "${prompt}"`);

  const ai = new GoogleGenAI({ apiKey: getApiKey() });

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
  
    const schema = {
        type: Type.OBJECT,
        properties: {
            code: { type: Type.STRING },
            summary: { type: Type.STRING },
            files_edited: {
                type: Type.ARRAY,
                items: {
                    type: Type.STRING,
                },
            },
        },
        required: ['code', 'summary', 'files_edited'],
    };

    try {
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
        const result: RefinementResult = JSON.parse(resultJson);
        return result;
    } catch (error) {
        console.error("Error refining code with Gemini:", error);
        throw new Error("Failed to refine the application code.");
    }
};

export const selfCorrectCode = async (
    originalPrompt: string,
    existingCode: string,
    imageBase64: string,
    agentSystemInstruction?: string
): Promise<RefinementResult> => {
    console.log(`Performing self-correction analysis.`);
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
        properties: {
            code: { type: Type.STRING },
            summary: { type: Type.STRING },
            files_edited: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
            },
        },
        required: ['code', 'summary', 'files_edited'],
    };

    const imagePart = {
        inlineData: {
            mimeType: 'image/jpeg',
            data: imageBase64,
        },
    };
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

        const resultJson = response.text.trim();
        const result: RefinementResult = JSON.parse(resultJson);
        return result;
    } catch (error) {
        console.error("Error during self-correction:", error);
        throw new Error("Failed to analyze the application code.");
    }
};

export const getPrimaryAction = async (code: string, agentSystemInstruction?: string): Promise<{ selector: string; action: string; justification: string }> => {
    console.log("Identifying primary action for testing.");
    const ai = new GoogleGenAI({ apiKey: getApiKey() });

    const taskPrompt = `You are a test automation engineer. Analyze the following HTML code and identify the single most important interactive element for a user to test. This is likely the main button (e.g., "Submit", "Calculate", "Start") or a primary input field.

Return a JSON object with the element's CSS selector, the action to perform (e.g., "click"), and a brief justification.

**Existing Application Code:**
\`\`\`html
${code}
\`\`\`

**CRITICAL RESPONSE FORMAT:**
Respond with ONLY a JSON object with this exact structure:
\`{"selector": "string", "action": "string", "justification": "string"}\``;

    const schema = {
        type: Type.OBJECT,
        properties: {
            selector: { type: Type.STRING },
            action: { type: Type.STRING },
            justification: { type: Type.STRING },
        },
        required: ['selector', 'action', 'justification'],
    };

    try {
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
        return JSON.parse(resultJson);
    } catch (error) {
        console.error("Error getting primary action:", error);
        throw new Error("Failed to identify a primary action for testing.");
    }
};


export const refineNativeAppCode = async (existingCode: string, prompt: string, agentSystemInstruction?: string): Promise<RefinementResult> => {
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
    
    const schema = {
        type: Type.OBJECT,
        properties: {
            code: { type: Type.STRING },
            summary: { type: Type.STRING },
            files_edited: {
                type: Type.ARRAY,
                items: {
                    type: Type.STRING,
                },
            },
        },
        required: ['code', 'summary', 'files_edited'],
    };

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: taskPrompt,
            config: {
                // Fix: Correctly pass agentSystemInstruction to systemInstruction property.
                ...(agentSystemInstruction ? { systemInstruction: agentSystemInstruction } : {}),
                responseMimeType: "application/json",
                responseSchema: schema,
            },
        });
        const resultJson = response.text.trim();
        const result: RefinementResult = JSON.parse(resultJson);
        return result;
    } catch (error) {
        console.error("Error refining native code with Gemini:", error);
        throw new Error("Failed to refine the application code.");
    }
};

export const chatAboutCode = async (existingCode: string, prompt: string, agentSystemInstruction?: string): Promise<string> => {
  console.log(`Chatting about code with prompt: "${prompt}"`);

  const ai = new GoogleGenAI({ apiKey: getApiKey() });

  const taskPrompt = `
    You are an expert developer and helpful AI assistant. A user has a question about a piece of code they are working on. Your task is to provide a clear, concise, and helpful answer.

    **User's Question:**
    "${prompt}"

    **The Code in Question:**
    \`\`\`
    ${existingCode}
    \`\`\`

    **Instructions:**
    1.  Analyze the user's question in the context of the provided code.
    2.  Provide a direct answer to the question.
    3.  If appropriate, you can include small code snippets to illustrate your point, but do not return the full code.
    4.  Keep your explanation easy to understand for someone who might not be an expert.
    5.  Your response should be conversational and helpful. Do not respond in JSON or any other structured format.
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
      console.error("Error chatting about code with Gemini:", error);
      throw new Error("Failed to get a response from the AI model.");
  }
};