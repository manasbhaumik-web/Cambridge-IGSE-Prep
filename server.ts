import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

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

// Security Input Validation Helpers
class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

function validateString(value: any, name: string, minLength: number, maxLength: number): string {
  if (typeof value !== "string") {
    throw new ValidationError(`Invalid type for ${name}. Expected a string.`);
  }
  const trimmed = value.trim();
  if (trimmed.length < minLength || trimmed.length > maxLength) {
    throw new ValidationError(`Length of ${name} must be between ${minLength} and ${maxLength} characters.`);
  }
  return trimmed;
}

function validateInteger(value: any, name: string, min: number, max: number): number {
  const parsed = typeof value === "number" ? value : parseInt(value, 10);
  if (isNaN(parsed) || !Number.isInteger(parsed)) {
    throw new ValidationError(`Invalid value for ${name}. Expected an integer.`);
  }
  if (parsed < min || parsed > max) {
    throw new ValidationError(`Value of ${name} must be between ${min} and ${max}.`);
  }
  return parsed;
}

// 1. API: AI Standard-Aligned Question Generator
app.post("/api/ai/generate-question", async (req, res) => {
  try {
    const subject = validateString(req.body.subject, "subject", 1, 100);
    const topic = validateString(req.body.topic, "topic", 1, 200);
    const difficulty = validateString(req.body.difficulty, "difficulty", 1, 100);
    const paperType = validateString(req.body.paperType, "paperType", 1, 100);

    if (!ai) {
      return res.status(200).json({
        error: "Gemini API key is not configured, but you can practice using the high-quality preloaded Cambridge questions!",
        fallback: true
      });
    }

    const prompt = `Generate a high-quality Cambridge IGCSE standard question for:
Subject: ${subject}
Topic: ${topic}
Difficulty: ${difficulty}
Paper Type Specifics: ${paperType}

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
    parsedQuestion.subjectId = subject.toLowerCase().substring(0, 4).trim();
    parsedQuestion.topicId = topic.toLowerCase().replace(/\s+/g, "-").substring(0, 16);
    parsedQuestion.subtopic = topic;
    parsedQuestion.difficulty = difficulty;
    parsedQuestion.paperType = paperType;

    res.json(parsedQuestion);
  } catch (error: any) {
    if (error instanceof ValidationError) {
      return res.status(400).json({ error: error.message });
    }
    console.error("AI Generation error:", error);
    res.status(500).json({ error: "Failed to generate question due to internal error." });
  }
});

// 2. API: Cambridge Academic Tutor Chatbot
app.post("/api/ai/tutor", async (req, res) => {
  try {
    const message = validateString(req.body.message, "message", 1, 2000);
    const rawHistory = req.body.history;
    const history: { role: string; content: string }[] = [];
    if (rawHistory !== undefined && rawHistory !== null) {
      if (!Array.isArray(rawHistory)) {
        throw new ValidationError("Invalid type for history. Expected an array.");
      }
      for (const item of rawHistory) {
        if (!item || typeof item !== "object") {
          throw new ValidationError("Invalid history item. Expected an object.");
        }
        const role = validateString(item.role, "history.role", 1, 50);
        if (role !== "user" && role !== "model" && role !== "assistant") {
          throw new ValidationError("Invalid role in history.");
        }
        const content = validateString(item.content, "history.content", 1, 4000);
        history.push({ role, content });
      }
    }

    if (!ai) {
      return res.json({
        reply: "Hello! The Gemini API key is currently not active in this development preview, but I'm ready to serve as your local study partner! Let me know which topic in Math, Biology, Physics, or Chemistry you would like to review, and I will share my pre-packaged exam secrets with you!"
      });
    }

    const chatHistory = history.map((h) => ({
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
    const chatContents = [...chatHistory, { role: "user", parts: [{ text: message }] }];

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
      return res.status(400).json({ error: error.message });
    }
    console.error("AI Tutor error:", error);
    res.status(500).json({ error: "Tutor is currently offline due to an internal error." });
  }
});

// 3. API: AI Reading Assistant (Summarizer & Practice Question Creator)
app.post("/api/ai/reading-assistance", async (req, res) => {
  try {
    const text = validateString(req.body.text, "text", 1, 10000);
    const numQuestions = validateInteger(req.body.numQuestions ?? 3, "numQuestions", 1, 10);

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
2. Generate exactly ${numQuestions} custom practice questions directly testing the material.
   - Include 1 multiple-choice question (MCQ) containing an 'options' array of exactly 4 strings and a 'correctOptionIndex' (0-3).
   - Include at least 1 structured or short-written answer question (leave 'options' as null/undefined, and omit 'correctOptionIndex').
   - Assign appropriate marks and clear point distribution guidance.

Below is the study text to analyze:
---
${text}
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
      return res.status(400).json({ error: error.message });
    }
    console.error("Reading assistance generation err:", error);
    res.status(500).json({ error: "Failed to generate reading assistance due to an internal error." });
  }
});

// 3.5. API: IGCSE Approved Online Material Selector & Synthesis (Grades 1 to 11)
app.post("/api/ai/online-igcse-material", async (req, res) => {
  try {
    const gradeVal = req.body.grade !== undefined && req.body.grade !== null ? validateInteger(req.body.grade, "grade", 1, 12) : 7;
    const subjectVal = req.body.subject !== undefined && req.body.subject !== null ? validateString(req.body.subject, "subject", 1, 100) : "General Science";
    const topicKeywordVal = req.body.topicKeyword !== undefined && req.body.topicKeyword !== null ? validateString(req.body.topicKeyword, "topicKeyword", 1, 200) : "Core Concepts";

    const gradeNum = gradeVal;
    const subName = subjectVal;
    const topic = topicKeywordVal;

    // Determine stage group
    let curriculumStage = "Cambridge Upper Secondary";
    if (gradeNum <= 5) {
      curriculumStage = "Cambridge International Primary";
    } else if (gradeNum <= 8) {
      curriculumStage = "Cambridge Lower Secondary";
    }

    if (!ai) {
      // Generate an incredibly detailed and responsive offline study material tailored to their exact selections
      let title = `Syllabus Guide: ${subName} (${topic}) - Grade ${gradeNum}`;
      let syllabusCode = `CAIE-${subName.substring(0,3).toUpperCase()}-G${gradeNum}`;
      let difficulty = "Medium";
      let resourceType = "Revision Guide";
      let tags = [subName, `Grade ${gradeNum}`, "Revision", topic];
      let content = "";

      if (gradeNum <= 5) {
        difficulty = "Easy";
        resourceType = "Notes";
        content = `# ${subName} - Grade ${gradeNum} Primary Lesson Notes
## Focus Area: ${topic}

Welcome to your Cambridge Primary aligned preparation board! At this level (Grade ${gradeNum}), we focus on discovering foundational phenomena.

### 🌟 Key Concept Walkthrough
*   **Active Discovery**: When exploring ${topic}, we practice keen observation and recording facts clearly.
*   **Simple Definition**: In easy words, we learn that ${topic} affects our environment by creating standard observable patterns.
*   **Action Steps**:
    1.  Observe the properties carefully.
    2.  Measure any changes using standard tools (like a ruler, beaker, or timer).
    3.  Draw neat sketches of the experimental setups.

---
### 💡 Cambridge Primary Examiner Tip
Always use neat, colorful line drawings to label parts (like flowers, shapes, or basic chemical glassware). Be clear about writing down correct standard units!`;
      } else if (gradeNum <= 8) {
        difficulty = "Medium";
        resourceType = "Revision Guide";
        content = `# Grade ${gradeNum} ${subName} - Syllabus Analysis
## Topic Ref: ${topic}

This comprehensive revision document is aligned with the **Cambridge Lower Secondary (Grades 6-8)** standards for Grade ${gradeNum}.

### 🧠 Core Principles Explained
At Lower Secondary stage, ${topic} is evaluated on qualitative descriptions and direct linkages.

1.  **Scientific Inquiry & Mechanics**: We analyze the cause-and-effect relationship in ${topic}. For instance, increasing the input results in an immediate responsive change.
2.  **Key Definition**: 
    > **"${topic}"**: State clearly how this core mechanism is defined in examination past papers to score full marks.
3.  **Experimental Methodologies**:
    *   **Independent Variable**: What we change to inspect state changes.
    *   **Dependent Variable**: What we measure.
    *   **Control Variables**: What we keep exactly constant to ensure a **fair test**.

---
### 📝 Lower Secondary Study Secret
Never use vague terms like 'feel the heat' or 'the speed increases fast'. Instead, write command-aligned phrases like: "thermodynamic convection occurs" or "acceleration of ${subName} increases proportionally."`;
      } else {
        difficulty = "Exam Standard";
        resourceType = "Revision Guide";
        syllabusCode = subName.toLowerCase().includes("math") ? "0580/Extended" : subName.toLowerCase().includes("bio") ? "0610/Paper4" : subName.toLowerCase().includes("chem") ? "0620/Paper4" : "0983/Syllabus";
        content = `# Cambridge IGCSE ${subName} (Grade ${gradeNum}) Extended Revision Guide
## Module: ${topic} • Syllabus Ref: ${syllabusCode}

This study guide has been synthesized to align with the core **Cambridge IGCSE GCE O-Level (Grades 9-11)** examiner descriptors.

### 📌 Command Word Breakdowns
To secure the maximum number of marks in structured theoretical papers, carefully parse these commands:
*   **Describe**: State the points of a topic or give characteristics/features (e.g., "Describe the physical state variables of ${topic}"). No explanation of *why* is required!
*   **Explain**: Provide a clear causal path, mentioning details or reasons. Always include the word **"because"** or **"therefore"**!

### 🧪 Advanced Laboratory Practical Check (Paper 6 Focus)
When asked for experimental improvements on ${topic}, prioritize these high-yield Examiner tips:
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
        subtopic: topic,
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
Education Grade Level: Grade ${gradeNum} (${curriculumStage})
School Subject: ${subName}
Target Topic Core Concept: ${topic}

The lesson must:
1. Be perfectly suited for Grade ${gradeNum} students of the ${curriculumStage} curriculum system.
2. Provide a gorgeous, engaging and descriptive academic title mentioning Grade ${gradeNum} directly.
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
    const subLower = subName.toLowerCase();
    if (subLower.includes("chem")) subjectId = "chem";
    else if (subLower.includes("phys")) subjectId = "phys";
    else if (subLower.includes("math") || subLower.includes("arith")) subjectId = "math";
    else if (subLower.includes("comput") || subLower.includes("cod") || subLower.includes("cs")) subjectId = "cs";

    const finalResource = {
      id: `online-res-${Math.floor(Math.random() * 1000000)}`,
      title: parsed.title,
      subjectId,
      topicId: `online-topic-${Date.now()}`,
      subtopic: topic,
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
      return res.status(400).json({ error: error.message });
    }
    console.error("Online resource synthesis error:", error);
    res.status(500).json({ error: "Failed to synthesize approved online study material due to an internal error." });
  }
});

// 4. Mount Vite Dev Server in Development, or Static Serving in Production
async function bootstrap() {
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

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express server listening at http://0.0.0.0:${PORT}`);
  });
}

bootstrap();
