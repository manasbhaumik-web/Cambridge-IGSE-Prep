import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Custom ValidationError to separate user validation issues from internal system faults
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

// Input validation helpers for security and stability
export function validateString(
  value: any,
  name: string,
  options?: { minLength?: number; maxLength?: number }
): string {
  if (typeof value !== "string") {
    throw new ValidationError(`Field '${name}' must be a string.`);
  }
  const trimmed = value.trim();
  if (options?.minLength !== undefined && trimmed.length < options.minLength) {
    throw new ValidationError(`Field '${name}' must be at least ${options.minLength} characters.`);
  }
  if (options?.maxLength !== undefined && trimmed.length > options.maxLength) {
    throw new ValidationError(`Field '${name}' must be at most ${options.maxLength} characters.`);
  }
  return trimmed;
}

export function validateInteger(
  value: any,
  name: string,
  options?: { min?: number; max?: number }
): number {
  let num: number;
  if (typeof value === "number") {
    num = value;
  } else if (typeof value === "string") {
    num = parseInt(value, 10);
    if (isNaN(num)) {
      throw new ValidationError(`Field '${name}' must be a valid integer.`);
    }
  } else {
    throw new ValidationError(`Field '${name}' must be a number or a numeric string.`);
  }

  if (!Number.isInteger(num)) {
    throw new ValidationError(`Field '${name}' must be an integer.`);
  }

  if (options?.min !== undefined && num < options.min) {
    throw new ValidationError(`Field '${name}' must be at least ${options.min}.`);
  }
  if (options?.max !== undefined && num > options.max) {
    throw new ValidationError(`Field '${name}' must be at most ${options.max}.`);
  }
  return num;
}

// Initialize server-side Gemini client as instructed
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// 1. API: AI Standard-Aligned Question Generator
app.post("/api/ai/generate-question", async (req, res) => {
  try {
    const { subject, topic, difficulty, paperType } = req.body;

    // Validate inputs
    const validatedSubject = validateString(subject, "subject", { minLength: 1, maxLength: 50 });
    const validatedTopic = validateString(topic, "topic", { minLength: 1, maxLength: 100 });
    const validatedDifficulty = validateString(difficulty, "difficulty", { minLength: 1, maxLength: 50 });
    const validatedPaperType = validateString(paperType, "paperType", { minLength: 1, maxLength: 50 });

    if (!ai) {
      return res.status(200).json({
        error: "Gemini API key is not configured, but you can practice using the high-quality preloaded Cambridge questions!",
        fallback: true
      });
    }

    const prompt = `Generate a high-quality Cambridge IGCSE standard question for:
Subject: ${validatedSubject}
Topic: ${validatedTopic}
Difficulty: ${validatedDifficulty}
Paper Type Specifics: ${validatedPaperType}

The question must:
1. Implement official Cambridge IGCSE command words (e.g. "Describe", "Explain", "Analyze", "Calculate", "State", "Compare").
2. Adhere to appropriate mark allocation and a realistic time estimate in minutes (e.g., 1 mark per minute for structured, or 1 mark/minute for multiple-choice).
3. If paperType is 'Paper 1 (MCQ Core)' or 'Paper 2 (MCQ Extended)', make sure to provide an array of exactly 4 distinct options and set correctOptionIndex (0-3).
4. Provide a pristine point-based marking scheme, acceptable alternate answers, examiner's notes, model answers, user-friendly simple explanations, and a list of common errors.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an expert Chief Examiner for the Cambridge Assessment International Education (CAIE) IGCSE board. You generate authentic, high-quality, syllabus-aligned past paper questions, strict mark schemes, teacher-level model answers, and student-focused tutorials.",
        temperature: 0.7,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questionText: { type: Type.STRING, description: "The full question text including sub-parts if necessary." },
            marks: { type: Type.INTEGER, description: "Total marks allocated (e.g. 1 to 8)." },
            timeEstimate: { type: Type.INTEGER, description: "Time estimate in minutes." },
            options: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Array of exactly 4 options. MUST be null or omitted if structured paper, but populated for Paper 1 or Paper 2."
            },
            correctOptionIndex: { type: Type.INTEGER, description: "0-indexed index of the correct option if MCQ. Omit if structured." },
            learningObjective: { type: Type.STRING, description: "The specific learning objective or syllabus code reference." },
            modelAnswer: { type: Type.STRING, description: "Detailed, full-marks written response." },
            studentFriendlyExplanation: { type: Type.STRING, description: "A simple, accessible, intuitive explanation for a 14-16yo student to learn the core concept." },
            commonMistakes: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "What students frequently get wrong or lose marks on in this topic."
            },
            improvementSuggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Direct tips to get maximum marks under examiner expectations."
            },
            markScheme: {
              type: Type.OBJECT,
              properties: {
                points: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Bullet points showing how marks are distributed (e.g. '1 mark for identifying...')"
                },
                alternativeAnswers: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Alternative answers or keywords also accepted."
                },
                examinerComments: { type: Type.STRING, description: "Comments on difficulty and general candidate performance." }
              },
              required: ["points", "examinerComments"]
            }
          },
          required: [
            "questionText",
            "marks",
            "timeEstimate",
            "learningObjective",
            "modelAnswer",
            "studentFriendlyExplanation",
            "commonMistakes",
            "improvementSuggestions",
            "markScheme"
          ]
        }
      }
    });

    const parsedQuestion = JSON.parse(response.text || "{}");
    // Generate a random ID
    parsedQuestion.id = `q-ai-${Math.floor(Math.random() * 1000000)}`;
    parsedQuestion.subjectId = validatedSubject.toLowerCase().substring(0, 4).trim();
    parsedQuestion.topicId = validatedTopic.toLowerCase().replace(/\s+/g, "-").substring(0, 16);
    parsedQuestion.subtopic = validatedTopic;
    parsedQuestion.difficulty = validatedDifficulty;
    parsedQuestion.paperType = validatedPaperType;

    res.json(parsedQuestion);
  } catch (error: any) {
    if (error instanceof ValidationError) {
      console.warn("Validation failure in generate-question:", error.message);
      return res.status(400).json({ error: error.message });
    }
    console.error("AI Generation error:", error);
    res.status(500).json({ error: "An unexpected error occurred. Please try again later." });
  }
});

// 2. API: Cambridge Academic Tutor Chatbot
app.post("/api/ai/tutor", async (req, res) => {
  try {
    const { message, history } = req.body;

    // Validate message
    const validatedMessage = validateString(message, "message", { minLength: 1, maxLength: 1000 });

    // Validate history if present
    let validatedHistory: { role: string; content: string }[] = [];
    if (history !== undefined) {
      if (!Array.isArray(history)) {
        throw new ValidationError("Field 'history' must be an array.");
      }
      for (let i = 0; i < history.length; i++) {
        const h = history[i];
        if (!h || typeof h !== "object") {
          throw new ValidationError(`Field 'history[${i}]' must be an object.`);
        }
        const r = validateString(h.role, `history[${i}].role`, { minLength: 1, maxLength: 50 });
        const c = validateString(h.content, `history[${i}].content`, { minLength: 1, maxLength: 2000 });
        validatedHistory.push({ role: r, content: c });
      }
    }

    if (!ai) {
      return res.json({
        reply: "Hello! The Gemini API key is currently not active in this development preview, but I'm ready to serve as your local study partner! Let me know which topic in Math, Biology, Physics, or Chemistry you would like to review, and I will share my pre-packaged exam secrets with you!"
      });
    }

    const chatHistory = validatedHistory.map((h) => ({
      role: h.role === "user" ? "user" : "model",
      parts: [{ text: h.content }]
    }));

    // Start a chat session or send prompt directly
    const chat = ai.chats.create({
      model: "gemini-3.5-flash",
      config: {
        systemInstruction: "You are the IGCSE Mentor, a warm, supportive, highly interactive tutor designed for secondary students (ages 14-16) preparing for their Cambridge exams. You excel at keeping subjects fun, breaking down complex math or science concepts into micro-lessons, and giving diagnostic feedback using Cambridge Assessment keywords. Keep your tone encouraging, use clear emojis, list structural steps, ask checking questions, and celebrate their progress to build confidence!",
        temperature: 0.7,
      }
    });

    // Let's call generateContent with a simulated history context
    const chatContents = [...chatHistory, { role: "user", parts: [{ text: validatedMessage }] }];

    const result = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: chatContents,
      config: {
        systemInstruction: "You are the state-of-the-art Cambridge IGCSE Mentor, a highly encouraging AI tutor specializing in breaking down science, maths, languages and technology curricula for younger students. Use analogies, bullet points, interactive check questions, and maintain high standards of CAIE keywords.",
        temperature: 0.7
      }
    });

    res.json({ reply: result.text });
  } catch (error: any) {
    if (error instanceof ValidationError) {
      console.warn("Validation failure in tutor:", error.message);
      return res.status(400).json({ error: error.message });
    }
    console.error("AI Tutor error:", error);
    res.status(500).json({ error: "An unexpected error occurred. Please try again later." });
  }
});

// 3. API: AI Reading Assistant (Summarizer & Practice Question Creator)
app.post("/api/ai/reading-assistance", async (req, res) => {
  try {
    const { text, numQuestions } = req.body;

    // Validate inputs
    const validatedText = validateString(text, "text", { minLength: 1, maxLength: 5000 });
    const validatedNumQuestions = numQuestions !== undefined
      ? validateInteger(numQuestions, "numQuestions", { min: 1, max: 10 })
      : 3;

    if (!ai) {
      return res.status(200).json({
        error: "Gemini API key is not configured, but our offline sandbox successfully simulated your guide analysis!",
        offline: true,
        summary: `### Core Summary of Provided Text
This text detailing curriculum study requirements covers key elements of academic candidate benchmarks.

*   **Key Concept**: Systematic revision builds operational competence.
*   **Command Words**: Examiners prioritize command verbs like **Describe** (to outline characteristics) and **Explain** (to provide reasons/causes).
*   **Formula Focus**: Ensure all physical constants or chemical balance calculations are written out with units.

*Examiner Study Tip*: Scoring full points requires addressing each point-marking scheme explicitly rather than summarizing generally.`,
        questions: [
          {
            id: `q-ra-off-${Date.now()}-1`,
            questionText: "Outline the key distinction between general summarization and the precise use of candidate command words when answering examination questions.",
            marks: 2,
            modelAnswer: "Precise command words target specific mark scheme points (e.g., 'Describe' vs. 'Explain' triggers a mechanical point grid), whereas general summarization misses key terminologies necessary for credit under examiner criteria.",
            explanation: "In Cambridge papers, answering exactly matching the command terms ensures you don't lose credit for writing excessive general text that lacks specific keywords.",
            markSchemePoints: [
              "Identifies command words as target-specific criteria triggers (1 Mark)",
              "Contrasts with general summarization missing key credit milestones (1 Mark)"
            ]
          },
          {
            id: `q-ra-off-${Date.now()}-2`,
            questionText: "What are the core command words used in Cambridge examination grading?",
            marks: 1,
            options: [
              "Summarize, Outline, Present",
              "Describe, Explain, State, Calculate",
              "Synthesize, Memorize, Rewrite",
              "Discuss, Debate, Argue"
            ],
            correctOptionIndex: 1,
            modelAnswer: "Describe, Explain, State, Calculate (Option B). These are the formal command verbs declared in syllabus guidelines.",
            explanation: "Cambridge examinations use precise command words to signal the exact nature and depth of response expected from candidates.",
            markSchemePoints: [
              "Identifies correct set of CAIE command verbs (1 Mark)"
            ]
          }
        ]
      });
    }

    const prompt = `You are a Senior Cambridge IGCSE Examiner and Academic Tutor.
Analyze the following study text and generate high-value Reading Assistance:
1. Provide a comprehensive, clean Markdown summary of the text highlighting core definitions, formulas, or biological/chemical/mathematical concepts with Examiner Tips.
2. Generate exactly ${validatedNumQuestions} custom practice questions directly testing the material.
   - Include 1 multiple-choice question (MCQ) containing an 'options' array of exactly 4 strings and a 'correctOptionIndex' (0-3).
   - Include at least 1 structured or short-written answer question (leave 'options' as null/undefined, and omit 'correctOptionIndex').
   - Assign appropriate marks and clear point distribution guidance.

Below is the study text to analyze:
---
${validatedText}
---`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are the premium CAIE Reading Assistant. You convert syllabus notes and paragraphs into elegant summaries and customized practice questions with answer schemes in highly structured format.",
        temperature: 0.7,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: "A comprehensive formatted Markdown summary of the text. Focus on clear structures." },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  questionText: { type: Type.STRING, description: "The practice question text." },
                  marks: { type: Type.INTEGER, description: "Marks allocated." },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Explicit list of exactly 4 options if it's an MCQ. MUST be null or omitted for written questions."
                  },
                  correctOptionIndex: { type: Type.INTEGER, description: "0-3 index if MCQ. MUST be null or omitted for written questions." },
                  modelAnswer: { type: Type.STRING, description: "Official examiner level model answer." },
                  explanation: { type: Type.STRING, description: "Friendly, logical walkthrough for candidates." },
                  markSchemePoints: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Points outlining how the marks are allocated."
                  }
                },
                required: ["questionText", "marks", "modelAnswer", "explanation", "markSchemePoints"]
              }
            }
          },
          required: ["summary", "questions"]
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    // Inject random IDs
    if (result.questions) {
      result.questions = result.questions.map((q: any, i: number) => ({
        ...q,
        id: `q-ra-ai-${Date.now()}-${i}`
      }));
    }

    res.json(result);
  } catch (error: any) {
    if (error instanceof ValidationError) {
      console.warn("Validation failure in reading-assistance:", error.message);
      return res.status(400).json({ error: error.message });
    }
    console.error("Reading assistance generation err:", error);
    res.status(500).json({ error: "An unexpected error occurred. Please try again later." });
  }
});

// 3.5. API: IGCSE Approved Online Material Selector & Synthesis (Grades 1 to 11)
app.post("/api/ai/online-igcse-material", async (req, res) => {
  try {
    const { grade, subject, topicKeyword } = req.body;

    // Validate inputs
    const validatedGrade = validateInteger(grade, "grade", { min: 1, max: 11 });
    const validatedSubject = validateString(subject, "subject", { minLength: 1, maxLength: 50 });
    const validatedTopicKeyword = validateString(topicKeyword, "topicKeyword", { minLength: 1, maxLength: 100 });

    // Determine stage group
    let curriculumStage = "Cambridge Upper Secondary";
    if (validatedGrade <= 5) {
      curriculumStage = "Cambridge International Primary";
    } else if (validatedGrade <= 8) {
      curriculumStage = "Cambridge Lower Secondary";
    }

    if (!ai) {
      // Generate an incredibly detailed and responsive offline study material tailored to their exact selections
      let title = `Syllabus Guide: ${validatedSubject} (${validatedTopicKeyword}) - Grade ${validatedGrade}`;
      let syllabusCode = `CAIE-${validatedSubject.substring(0,3).toUpperCase()}-G${validatedGrade}`;
      let difficulty = "Medium";
      let resourceType = "Revision Guide";
      let tags = [validatedSubject, `Grade ${validatedGrade}`, "Revision", validatedTopicKeyword];
      let content = "";

      if (validatedGrade <= 5) {
        difficulty = "Easy";
        resourceType = "Notes";
        content = `# ${validatedSubject} - Grade ${validatedGrade} Primary Lesson Notes
## Focus Area: ${validatedTopicKeyword}

Welcome to your Cambridge Primary aligned preparation board! At this level (Grade ${validatedGrade}), we focus on discovering foundational phenomena.

### 🌟 Key Concept Walkthrough
*   **Active Discovery**: When exploring ${validatedTopicKeyword}, we practice keen observation and recording facts clearly.
*   **Simple Definition**: In easy words, we learn that ${validatedTopicKeyword} affects our environment by creating standard observable patterns.
*   **Action Steps**:
    1.  Observe the properties carefully.
    2.  Measure any changes using standard tools (like a ruler, beaker, or timer).
    3.  Draw neat sketches of the experimental setups.

---
### 💡 Cambridge Primary Examiner Tip
Always use neat, colorful line drawings to label parts (like flowers, shapes, or basic chemical glassware). Be clear about writing down correct standard units!`;
      } else if (validatedGrade <= 8) {
        difficulty = "Medium";
        resourceType = "Revision Guide";
        content = `# Grade ${validatedGrade} ${validatedSubject} - Syllabus Analysis
## Topic Ref: ${validatedTopicKeyword}

This comprehensive revision document is aligned with the **Cambridge Lower Secondary (Grades 6-8)** standards for Grade ${validatedGrade}.

### 🧠 Core Principles Explained
At Lower Secondary stage, ${validatedTopicKeyword} is evaluated on qualitative descriptions and direct linkages.

1.  **Scientific Inquiry & Mechanics**: We analyze the cause-and-effect relationship in ${validatedTopicKeyword}. For instance, increasing the input results in an immediate responsive change.
2.  **Key Definition**: 
    > **"${validatedTopicKeyword}"**: State clearly how this core mechanism is defined in examination past papers to score full marks.
3.  **Experimental Methodologies**:
    *   **Independent Variable**: What we change to inspect state changes.
    *   **Dependent Variable**: What we measure.
    *   **Control Variables**: What we keep exactly constant to ensure a **fair test**.

---
### 📝 Lower Secondary Study Secret
Never use vague terms like 'feel the heat' or 'the speed increases fast'. Instead, write command-aligned phrases like: "thermodynamic convection occurs" or "acceleration of ${validatedSubject} increases proportionally."`;
      } else {
        difficulty = "Exam Standard";
        resourceType = "Revision Guide";
        syllabusCode = validatedSubject.toLowerCase().includes("math") ? "0580/Extended" : validatedSubject.toLowerCase().includes("bio") ? "0610/Paper4" : validatedSubject.toLowerCase().includes("chem") ? "0620/Paper4" : "0983/Syllabus";
        content = `# Cambridge IGCSE ${validatedSubject} (Grade ${validatedGrade}) Extended Revision Guide
## Module: ${validatedTopicKeyword} • Syllabus Ref: ${syllabusCode}

This study guide has been synthesized to align with the core **Cambridge IGCSE GCE O-Level (Grades 9-11)** examiner descriptors.

### 📌 Command Word Breakdowns
To secure the maximum number of marks in structured theoretical papers, carefully parse these commands:
*   **Describe**: State the points of a topic or give characteristics/features (e.g., "Describe the physical state variables of ${validatedTopicKeyword}"). No explanation of *why* is required!
*   **Explain**: Provide a clear causal path, mentioning details or reasons. Always include the word **"because"** or **"therefore"**!

### 🧪 Advanced Laboratory Practical Check (Paper 6 Focus)
When asked for experimental improvements on ${validatedTopicKeyword}, prioritize these high-yield Examiner tips:
1.  **Insulation & Heat Loss**: Use lagged beakers or a polystyrene cup with a lid to restrict ambient thermal losses.
2.  **Parallax Error avoidance**: View measuring cylinders or thermometers at eye-level, perpendicular to the meniscus line scale.
3.  **Reliability checks**: Always state that you will repeat the experiment at least 3 times and calculate the average mean value to eliminate anomalies.

---
### 🎓 IGCSE Exam Masterclass Tip
The mark scheme is heavily structured. When an item has 3 marks allocated, write exactly 3 distinct bullet points emphasizing official CAIE keywords.`;
      }

      return res.status(200).json({
        title,
        subjectId: "bio", // fallback link to bio, can be modified in UI if needed
        topicId: `online-item-${Date.now()}`,
        subtopic: validatedTopicKeyword,
        syllabusCode,
        difficulty,
        resourceType,
        content,
        author: "Cambridge Approved Online Synergy, offline mock-up fallback",
        year: "2026",
        tags,
        warning: "Tutor running in offline demonstration mode. To sync with real-time AI servers, add a GEMINI_API_KEY to your Settings > Secrets panel."
      });
    }

    const prompt = `Generate a highly professional, pristine academic study material lesson resource approved for:
Education Grade Level: Grade ${validatedGrade} (${curriculumStage})
School Subject: ${validatedSubject}
Target Topic Core Concept: ${validatedTopicKeyword}

The lesson must:
1. Be perfectly suited for Grade ${validatedGrade} students of the ${curriculumStage} curriculum system.
2. Provide a gorgeous, engaging and descriptive academic title mentioning Grade ${validatedGrade} directly.
3. Formulate standard Cambridge syllabus references or Primary/Lower Secondary stage codes.
4. Output highly detailed pedagogical content written in pristine Markdown (with introduction, deep concept analysis, command-words alerts, and explicit Cambridge Board Examiner tips).
5. Specify an appropriate Resource Type (Notes, Worksheet, Revision Guide, Flash Cards, Practical Guide, Formula Sheet).
6. Specify target Difficulty (Easy, Medium, Hard, Exam Standard, Examiner Challenge) based on grade depth.
7. Generate 3 or 4 relevant academic hashtag keywords.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: `You are a Senior IGCSE curriculum director at Cambridge Assessment International Education. You produce impeccable, authentic study material, lessons, and guide worksheets beautifully tailored for Grade 1 to 11 syllabus alignment.`,
        temperature: 0.7,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "Highly engaging academic topic title." },
            syllabusCode: { type: Type.STRING, description: "Official syllabus code reference e.g., '0580/Core' or 'Primary Stage 4'." },
            difficulty: { type: Type.STRING, description: "Difficulty level. Must be exactly one of: Easy, Medium, Hard, Exam Standard, Examiner Challenge." },
            resourceType: { type: Type.STRING, description: "Target resource format. Must be exactly one of: Notes, Worksheet, Revision Guide, Flash Cards, Practical Guide, Formula Sheet." },
            content: { type: Type.STRING, description: "Dense, professional markdown layout lesson text. Make sure is long, thorough, and highly accurate." },
            author: { type: Type.STRING, description: "Curation credit name e.g. 'Cambridge Board Panel of Curators'." },
            tags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "3-4 key tag keywords"
            }
          },
          required: ["title", "syllabusCode", "difficulty", "resourceType", "content", "author", "tags"]
        }
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    
    // Dynamically assign subjectId links based on the chosen subject name
    let subjectId = "bio";
    const subLower = validatedSubject.toLowerCase();
    if (subLower.includes("chem")) subjectId = "chem";
    else if (subLower.includes("phys")) subjectId = "phys";
    else if (subLower.includes("math") || subLower.includes("arith")) subjectId = "math";
    else if (subLower.includes("comput") || subLower.includes("cod") || subLower.includes("cs")) subjectId = "cs";

    const finalResource = {
      id: `online-res-${Math.floor(Math.random() * 1000000)}`,
      title: parsed.title,
      subjectId,
      topicId: `online-topic-${Date.now()}`,
      subtopic: validatedTopicKeyword,
      syllabusCode: parsed.syllabusCode,
      difficulty: parsed.difficulty,
      resourceType: parsed.resourceType,
      content: parsed.content,
      author: parsed.author,
      year: "2026",
      tags: parsed.tags
    };

    res.json(finalResource);
  } catch (error: any) {
    if (error instanceof ValidationError) {
      console.warn("Validation failure in online-igcse-material:", error.message);
      return res.status(400).json({ error: error.message });
    }
    console.error("Online resource synthesis error:", error);
    res.status(500).json({ error: "An unexpected error occurred. Please try again later." });
  }
});

// 4. Mount Vite Dev Server in Development, or Static Serving in Production
export async function bootstrap() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting in DEVELOPMENT mode...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting in PRODUCTION mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const serverInstance = app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express server listening at http://0.0.0.0:${PORT}`);
  });

  return serverInstance;
}

if (process.env.NODE_ENV !== "test") {
  bootstrap();
}

export { app };
