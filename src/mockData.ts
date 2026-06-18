import { Subject, ResourceItem, Question, Badge, StudentProgress, Assignment, ForumPost, UserRole, Difficulty, PaperType } from "./types";

export const SUBJECTS: Subject[] = [
  {
    id: "bio",
    name: "Biology",
    category: "Sciences",
    syllabusCode: "0610",
    icon: "Biotech",
    topics: [
      { id: "bio-1", name: "Cell Structure and Organisation", subtopics: ["Plant and Animal Cells", "Specialised Cells", "Level of Organisation"] },
      { id: "bio-2", name: "Movement In and Out of Cells", subtopics: ["Diffusion", "Osmosis", "Active Transport"] },
      { id: "bio-3", name: "Biological Molecules", subtopics: ["Carbohydrates, Fats & Proteins", "Food Tests", "Enzymes Role"] }
    ]
  },
  {
    id: "chem",
    name: "Chemistry",
    category: "Sciences",
    syllabusCode: "0620",
    icon: "Flask",
    topics: [
      { id: "chem-1", name: "States of Matter", subtopics: ["Solids, Liquids & Gases", "Heating Curves", "Diffusion of Gases"] },
      { id: "chem-2", name: "Atoms, Elements and Compounds", subtopics: ["Atomic Structure & Isotopes", "Periodic Table trends", "Ionic & Covalent Bonding"] },
      { id: "chem-3", name: "Chemical Energetics", subtopics: ["Exothermic Reactions", "Endothermic Reactions", "Activation Energy"] }
    ]
  },
  {
    id: "phys",
    name: "Physics",
    category: "Sciences",
    syllabusCode: "0625",
    icon: "Zap",
    topics: [
      { id: "phys-1", name: "Motion, Forces and Energy", subtopics: ["Speed, Velocity & Acceleration", "Newton's Laws", "Work, Energy & Power"] },
      { id: "phys-2", name: "Thermal Physics", subtopics: ["Kinetic Molecular Theory", "Thermal Expansion", "Conduction, Convection & Radiation"] }
    ]
  },
  {
    id: "math",
    name: "Mathematics",
    category: "Mathematics",
    syllabusCode: "0580",
    icon: "Binary",
    topics: [
      { id: "math-1", name: "Number", subtopics: ["Fractions & Decimals", "Ratio & Proportion", "Standard Form"] },
      { id: "math-2", name: "Algebra & Graphs", subtopics: ["Quadratic Equations", "Functions & Composition", "Describing Functions"] }
    ]
  },
  {
    id: "cs",
    name: "Computer Science",
    category: "ICT & Technology",
    syllabusCode: "0478",
    icon: "Cpu",
    topics: [
      { id: "cs-1", name: "Data Representation", subtopics: ["Binary, Denary & Hexadecimal", "Text, Sound & Image Encoding", "Data Compression"] },
      { id: "cs-2", name: "Computer Systems", subtopics: ["Logic Gates & Circuits", "CPU Architecture", "Sensors & Actuators"] }
    ]
  }
];

export const STUDY_MATERIALS: ResourceItem[] = [
  {
    id: "res-bio-1",
    title: "Comprehensive Cell Structure Revision Guide",
    subjectId: "bio",
    topicId: "bio-1",
    subtopic: "Plant and Animal Cells",
    syllabusCode: "0610 (Core/Extended)",
    difficulty: Difficulty.MEDIUM,
    resourceType: "Revision Guide",
    content: `# Cell Structure & Organisation

## Plant vs. Animal Cells
Under an electron microscope, the differences between plant and animal cells become distinct. 

### Key Structures found in BOTH:
1. **Cytoplasm**: Gel-like substance where metabolic reactions take place.
2. **Cell Membrane**: Partially permeable barrier that controls exit/entry.
3. **Nucleus**: Contains DNA and coordinates cell activities.
4. **Mitochondria**: Responsible for aerobic respiration to release energy.
5. **Ribosomes**: Site of protein synthesis.

### Key Structures found in PLANT CELLS ONLY:
1. **Cell Wall**: Made of cellulose, fully permeable, maintains turgor pressure.
2. **Chloroplasts**: Contain chlorophyll to absorb sunlight for photosynthesis.
3. **Large Permanent Vacuole**: Filled with cell sap, supports the cell structure.

---
### Command Terms Tip for Cambridge Exams
When asked to **compare** plant and animal cells, always draw a direct comparison (e.g. "Plant cells have a cell wall made of cellulose, whereas animal cells lack a cell wall entirely.")`,
    author: "Mrs. Sarah Thompson (Cambridge Senior Examiner)",
    year: "2025",
    tags: ["Cell Structure", "Plant Biology", "Microscope"]
  },
  {
    id: "res-chem-1",
    title: "Interactive Solid, Liquid & Gas Energy Guide",
    subjectId: "chem",
    topicId: "chem-1",
    subtopic: "Solids, Liquids & Gases",
    syllabusCode: "0620 Paper 3/4",
    difficulty: Difficulty.EASY,
    resourceType: "Notes",
    content: `# The Kinetic Theory of Matter

All matter consists of tiny particles that are constantly moving. The arrangement and energy of these particles determine the state.

## 1. Solids
* **Arrangement**: Regular, repeating lattice, tightly packed.
* **Movement**: Vibrate about fixed positions.
* **Energy**: Lowest kinetic energy.
* **Forces**: Strong intermolecular forces.

## 2. Liquids
* **Arrangement**: Random but close together, contact with neighboring particles.
* **Movement**: Can slide past one another.
* **Energy**: Moderate kinetic energy.

## 3. Gases
* **Arrangement**: Random, highly spaced, virtually no order.
* **Movement**: Rapid, random, constant straight-line motion.
* **Energy**: Highest kinetic energy.
* **Forces**: Negligible intermolecular forces.

---
### Key Heating Curve Phases
* **Melting Point**: Temperature stays constant as energy goes into breaking intermolecular bonds instead of raising temperature.
* **Boiling Point**: Temperature is steady during the liquid-to-gas transition phase.`,
    author: "Dr. David Alistar",
    year: "2026",
    tags: ["Kinetic Theory", "Melting", "States of Matter"]
  },
  {
    id: "res-phys-1",
    title: "Light & Wave Properties Practical Manual",
    subjectId: "phys",
    topicId: "phys-2",
    subtopic: "Conduction, Convection & Radiation",
    syllabusCode: "0625 Paper 6",
    difficulty: Difficulty.HARD,
    resourceType: "Practical Guide",
    content: `# Paper 6 Practical Guide: thermal Emission & Color absorption

## Objective
To investigate how the surface color of a container affects the rate of thermal energy emission by radiation.

## Experimental Setup
1. Two identical copper cans are filled with boiling water.
2. **Can A** is painted matt black.
3. **Can B** is painted brilliant white.
4. Standard laboratory thermometers are suspended in the center of both cans.
5. Temp is recorded every 30 seconds for 5 minutes.

## Control Variables (Crucial for Paper 6 Marks!)
* Initial temperature of water (ensure they both start at ~85°C)
* Ambient room temperature (keep away from open windows/air vents)
* Constant water volume in both cans (e.g., 150 cm³)
* Same quality thermometers and identical thermal insulation at base

## Expected Observations
Matt black is a **better radiator/emitter** of thermal energy than shiny white. Therefore, the water in Can A (black) will cool down faster with a steeper cooling curve.`,
    author: "Mr. Julian Vance",
    year: "2025",
    tags: ["Practical Physics", "Thermal Physics", "Radiation"]
  },
  {
    id: "res-math-1",
    title: "Quadratic Equations Mastery Formula Sheet",
    subjectId: "math",
    topicId: "math-2",
    subtopic: "Quadratic Equations",
    syllabusCode: "0580 Paper 2/4",
    difficulty: Difficulty.MEDIUM,
    resourceType: "Formula Sheet",
    content: `# Quadratic Equations Formulas & Rules

For any quadratic equation in standard form:
$$ax^2 + bx + c = 0$$

## 1. The Quadratic Formula:
$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$

## 2. The Discriminant:
$$\\Delta = b^2 - 4ac$$
* If $\\Delta > 0$: **Two unique real solutions**
* If $\\Delta = 0$: **One real solution (repeated root)**
* If $\\Delta < 0$: **No real solutions**

## 3. Factoring Rules:
Find two numbers that multiply to $a \\times c$ and add to $b$. Splitting the middle term is critical for show-your-work questions where 3 marks are allocated!`,
    author: "Mrs. Sarah Thompson",
    year: "2026",
    tags: ["Algebra", "Quadratic Formula", "Math Core"]
  }
];

export const SAMPLE_QUESTIONS: Question[] = [
  {
    id: "q-bio-1",
    subjectId: "bio",
    topicId: "bio-1",
    subtopic: "Plant and Animal Cells",
    paperType: PaperType.PAPER_1,
    difficulty: Difficulty.EASY,
    marks: 1,
    timeEstimate: 1,
    questionText: "Which structure is present in a palisade cell of a leaf, but empty/absent in a human liver cell?",
    options: [
      "Cell Membrane",
      "Cellulose Cell Wall",
      "Nucleus",
      "Cytoplasm"
    ],
    correctOptionIndex: 1,
    learningObjective: "Core Syllabus Obj 2.1: Relate structure to function of plant cells",
    modelAnswer: "Cellulose Cell Wall (Option B). Only plant cells contain a cellulose cell wall which provides support. Animal cells like human liver cells do not have cell walls.",
    studentFriendlyExplanation: "Animal cells are squishy because they lack cell walls, only containing standard cell membranes. Leaves need cell walls (like the palisade layer) to keep the plant rigid and standing tall!",
    commonMistakes: [
      "Confusing the cell wall with the cell membrane, which acts as a border in BOTH cell types.",
      "Thinking mitochondria are only in animal cells - plants have mitochondria too!"
    ],
    improvementSuggestions: [
      "Review palisade cell structures: chloroplasts, cell walls, and vacuoles are found together here."
    ],
    markScheme: {
      points: [
        "Identifies Cellulose Cell Wall as plant-only structure (1 Mark)"
      ],
      examinerComments: "Candidates frequently misidentify ribosomes or mitochondria. Ensure clear understanding of cell parts unique to plants."
    }
  },
  {
    id: "q-chem-1",
    subjectId: "chem",
    topicId: "chem-1",
    subtopic: "Heating Curves",
    paperType: PaperType.PAPER_4,
    difficulty: Difficulty.EXAM_STANDARD,
    marks: 4,
    timeEstimate: 6,
    questionText: "A sample of ice at -10°C is heated continuously until it becomes steam at 110°C. Fully explain why the temperature remains constant at 0°C for a period of time, even though heating continues. Support your answer using the kinetic theory.",
    learningObjective: "Extended Syllabus Obj 1.1: Describe heating curve transitions",
    modelAnswer: "The temperature remains constant because the thermal energy supplied is absorbed to break/overcome the strong intermolecular forces/bonds holding water molecules together in the solid lattice. Consequently, the average kinetic energy of the water molecules does not increase during this phase transition, which corresponds to the melting point of ice. The energy is utilized entirely for the latent heat of fusion.",
    studentFriendlyExplanation: "When you heat ice and it starts melting, the temperature locks at exactly 0°C. Why? Because the heat is busy tearing the ice cubes' crystal lattice apart, rather than making the molecules vibrate faster. Only after all ice is liquid water will the temperature rise again!",
    commonMistakes: [
      "Stating that 'energy is lost' during phase transition. Energy is absorbed, just not converted into a temperature rise.",
      "Confusing intermolecular forces with covalent intramolecular H-O bonds. You do NOT break H₂O into hydrogen and oxygen!"
    ],
    improvementSuggestions: [
      "Use exact keywords: 'breaking intermolecular forces', 'constant kinetic energy', and 'latent heat'."
    ],
    markScheme: {
      points: [
        "Thermal energy is used to break/overcome intermolecular bonds/lattice forces. (1 Mark)",
        "Molecule spacing increases as they transition from solid to liquid liquid state. (1 Mark)",
        "The average kinetic energy of the molecules does not increase during melting. (1 Mark)",
        "Since temperature is a measure of average kinetic energy, the temperature stays constant. (1 Mark)"
      ],
      alternativeAnswers: [
        "Award mark if students refer to 'latent heat of fusion' absorbing energy."
      ],
      examinerComments: "High-scoring candidates correctly distinguish between kinetic energy (stays flat) and potential separation energy. A high percentage of candidates mistakenly suggest hydrogen/oxygen gas is released."
    }
  },
  {
    id: "q-cs-1",
    subjectId: "cs",
    topicId: "cs-2",
    subtopic: "Logic Gates & Circuits",
    paperType: PaperType.PAPER_1,
    difficulty: Difficulty.MEDIUM,
    marks: 1,
    timeEstimate: 2,
    questionText: "Which logic gate outputs a 'high' (1) signal strictly if both inputs are DIFFERENT, and outputs 'low' (0) if the inputs are identical?",
    options: [
      "AND Gate",
      "OR Gate",
      "XOR (Exclusive OR) Gate",
      "NAND Gate"
    ],
    correctOptionIndex: 2,
    learningObjective: "Logic Circuits Objective 3.1: Identify gate truth tables",
    modelAnswer: "XOR (Exclusive OR) Gate (Option C). The truth table of XOR gate results in 1 only when inputs represent (0, 1) or (1, 0). If inputs are (0,0) or (1,1), XOR returns 0.",
    studentFriendlyExplanation: "Think of XOR as the strict selector: 'One OR the other, but NOT both!'. Only a mismatch in inputs powers it up.",
    commonMistakes: [
      "Selecting the general OR gate, which triggers positive when both inputs are 1."
    ],
    improvementSuggestions: [
      "Draw the truth table for XOR, OR, AND, and NAND to compare mismatched input values side-by-side."
    ],
    markScheme: {
      points: [
        "Correctly identifies XOR Gate as mismatch trigger (1 Mark)"
      ],
      examinerComments: "Very straightforward question. Frequently well answered, though candidates sometimes confuse XOR with general OR."
    }
  }
];

export const BADGES: Badge[] = [
  { id: "badge-1", title: "Syllabus Novice", description: "Read your very first IGCSE study material guide.", iconName: "BookOpen", rarity: "Common" },
  { id: "badge-2", title: "Cambridge Whiz", description: "Answer 3 practice questions with 100% correct answers.", iconName: "Sparkles", rarity: "Rare" },
  { id: "badge-3", title: "Exam Warrior", description: "Complete a timed mock examination.", iconName: "Shield", rarity: "Epic" },
  { id: "badge-4", title: "Teacher's Favorite", description: "Receive positive academic feedback on an assignment from a teacher.", iconName: "CheckCircle", rarity: "Legendary" },
  { id: "badge-5", title: "Focus Virtuoso", description: "Daily learning streaks up to 5 consecutive days.", iconName: "Calendar", rarity: "Epic" }
];

export const INITIAL_STUDENT_PROGRESS: StudentProgress = {
  userId: "student-1",
  level: 3,
  xp: 340,
  xpNeededForNextLevel: 1000,
  completedQuizzes: ["q-bio-1"],
  badges: ["badge-1", "badge-2"],
  streakDays: 4,
  lastActiveDate: "2026-06-15",
  completedModules: {
    "bio": ["bio-1"],
    "chem": []
  },
  scores: {
    "q-bio-1": { score: 1, maxScore: 1, submittedAt: "2026-06-15" }
  }
};

export const INITIAL_ASSIGNMENTS: Assignment[] = [
  {
    id: "assign-1",
    title: "Week 2: States of Matter & Kinetics Written Review",
    teacherId: "teacher-1",
    subjectId: "chem",
    dueDate: "2026-06-25",
    questions: [
      SAMPLE_QUESTIONS[1], // q-chem-1 (ice-steam heating curves, 4 marks)
    ],
    submissions: [
      {
        studentId: "student-1",
        studentName: "Alex Mercer",
        submittedAt: "2026-06-15T18:30:00Z",
        answers: {
          "q-chem-1": "Ice particles begin absorbing thermal kinetic energy and start vibrating with maximum frequency. During this process, bonds are broken so the temperature flatlines because all the warmth is busy cracking intermolecular bonds."
        },
        graded: true,
        score: 3,
        maxScore: 4,
        teacherFeedback: "Excellent attempt, Alex! You correctly identified that heating breaks intermolecular bonds and that kinetic energy remains constant during the flatline. To get the full 4 marks, explain clearly that temperature is a measure of average kinetic energy, so a steady kinetic energy results in a constant temperature.",
        gradedAt: "2026-06-16T08:00:00Z"
      },
      {
        studentId: "student-2",
        studentName: "Chloe Tan",
        submittedAt: "2026-06-14T10:15:00Z",
        answers: {
          "q-chem-1": "Because the heating is turned off for a moment. No heat is entered so it does not rise."
        },
        graded: false,
        score: undefined,
        maxScore: 4,
        teacherFeedback: undefined,
        gradedAt: undefined
      }
    ]
  }
];

export const FORUM_THREADS: ForumPost[] = [
  {
    id: "post-1",
    subjectId: "bio",
    title: "How to memorize the food tests (Benedict's vs Biuret) easily?",
    content: "I keep mixing up the colors of the experiments. In Benedict's test for reducing sugars, what is the final colour if lots of sugar is present? And for Biuret protein test what is the positive color change?",
    authorName: "Alex Mercer",
    authorRole: UserRole.STUDENT,
    createdAt: "2026-06-13T14:20:00Z",
    likes: 5,
    likedBy: ["student-2"],
    replies: [
      {
        id: "rep-1",
        authorName: "Mrs. Sarah Thompson",
        authorRole: UserRole.TEACHER,
        content: "Hi Alex! Here is a great mnemonic: 'Benedict is sweet (Sugar) and likes bricks (Brick-Red positive change)'. For proteins: 'Biuret starts with B, becomes Violet (V)'. \n\nBenedict's: Blue -> Green -> Yellow -> Brick-Red ppt (lots of reducing sugar).\nBiuret test: Blue -> Purple/Violet (Protein present).",
        createdAt: "2026-06-13T16:45:00Z"
      },
      {
        id: "rep-2",
        authorName: "Chloe Tan",
        authorRole: UserRole.STUDENT,
        content: "Wow that is extremely helpful Mrs. Thompson! I used to get mixed up all the time during paper 6 mocks.",
        createdAt: "2026-06-14T09:12:00Z"
      }
    ]
  },
  {
    id: "post-2",
    subjectId: undefined, // General
    title: "Top 5 Revision Practices for Cambridge Board Exams 2026",
    content: "Hey everyone! Just compiled my top strategies for active recall: 1) Blurting technique by chapters, 2) Practicing matching past paper examiner comments on mistakes, 3) Doing questions with a strict timer. Let me know what you think works best!",
    authorName: "Mrs. Sarah Thompson",
    authorRole: UserRole.TEACHER,
    createdAt: "2026-06-15T09:00:00Z",
    likes: 8,
    likedBy: ["student-1", "student-2"],
    replies: []
  }
];
