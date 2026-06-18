import React, { useState, useEffect } from "react";
import { StudentProgress } from "../types";
import { Check, X, Award, Sparkles, RefreshCw, AlertCircle, ArrowRight, BookOpen, MessageSquare, Flame } from "lucide-react";

interface QuizQuestion {
  id: string;
  questionText: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const QUIZ_REGISTRY: { [materialId: string]: QuizQuestion[] } = {
  "res-bio-1": [
    {
      id: "bio-q1",
      questionText: "Which organelle is present in high densities inside active muscle cells to release aerobic energy?",
      options: ["Nucleus", "Mitochondria", "Ribosomes", "Cell Cellulose Wall"],
      correctIndex: 1,
      explanation: "Mitochondria act as the powerhouses of the cell, carrying out aerobic respiration to produce ATP. Active cells (like muscle fibers) require a lot of energy and thus have dense clusters of mitochondria."
    },
    {
      id: "bio-q2",
      questionText: "What is the correct structural description of an IGCSE plant cell wall?",
      options: [
        "Partially permeable barrier composed of proteins",
        "Fully permeable structure made of structural cellulose",
        "Impermeable shield built from starch deposits"
      ],
      correctIndex: 1,
      explanation: "Plant cell walls are made of cellulose and are fully permeable to water and dissolved solutes. They provide high turgor support, preventing osmotic lysis (cell bursting)."
    },
    {
      id: "bio-q3",
      questionText: "Specify the main function of ribosomes inside plant and animal cells.",
      options: ["Synthesizing proteins", "Directing cell division", "Conducting aerobic respiration"],
      correctIndex: 0,
      explanation: "Ribosomes are the site of translation during protein synthesis, assembling amino acid chains based on mRNA transcripts."
    }
  ],
  "res-chem-1": [
    {
      id: "chem-q1",
      questionText: "In which physical state of matter are particles arranged inside a regular repeating lattice, vibrating strictly about fixed positions?",
      options: ["Gas phase", "Liquid phase", "Solid phase"],
      correctIndex: 2,
      explanation: "Solids feature strong intermolecular forces that keep particles locked in a tightly packed, repeating crystal lattice. They cannot slide past each other, only vibrate."
    },
    {
      id: "chem-q2",
      questionText: "Why does the temperature of a water sample remain locked flat at exactly 0°C or 100°C during phase melting or boiling?",
      options: [
        "The external Bunsen burner is temporarily extinguished",
        "Energy is entirely utilized to break/overcome intermolecular bonds instead of accelerating particle speed",
        "The heat capacity of water falls instantly to absolute zero"
      ],
      correctIndex: 1,
      explanation: "During a phase transition, added thermal energy goes into breaking the forces of attraction between water molecules (latent heat) rather than increasing their average kinetic speed. Since temperature tracks speed (average kinetic energy), it stays constant."
    },
    {
      id: "chem-q3",
      questionText: "Which phase of matter exhibits rapid straight-line motion, huge molecular separation, and negligible intermolecular forces under stable conditions?",
      options: ["Gas phase", "Liquid phase", "Solid phase"],
      correctIndex: 0,
      explanation: "Gas molecules have negligible intermolecular forces of attraction, are extremely far apart, and possess high kinetic energy that drives constant, rapid, straight-line random collisions."
    }
  ],
  "res-phys-1": [
    {
      id: "phys-q1",
      questionText: "Which surface finish acts as the most superior radiator (emitter) of electromagnetic thermal infrared energy?",
      options: ["Polished Silver", "Matt Black", "Brilliant Glossy White", "Translucent Glass Finish"],
      correctIndex: 1,
      explanation: "Matt black surfaces are the most scientifically efficient absorbers and emitters of thermal (infrared) radiation. Shiny chrome or white surfaces represent poor emitters because they reflect radiation."
    },
    {
      id: "phys-q2",
      questionText: "In a thermal cooling practical (CAIE Paper 6), which parameter must be strictly maintained as a constant control variable?",
      options: [
        "The type of mercury used in thermometers",
        "Constant starting water temperature across all tins",
        "Atmospheric room pressure in millibars"
      ],
      correctIndex: 1,
      explanation: "The rate of thermal heat transfer depends directly on the initial temperature difference. Starting both tins at exactly the same temperature is critical to isolate surface finish influence."
    },
    {
      id: "phys-q3",
      questionText: "Thermal energy transfer by radiation requires what medium to travel?",
      options: [
        "Direct solid metallic contact layers",
        "Fluid currents such as water or air flows",
        "No material media is required (can travel across a vacuum)"
      ],
      correctIndex: 2,
      explanation: "Unlike conduction or convection which require vibrating particles or moving fluids, radiation transfers thermal energy via electromagnetic waves and can travel through empty vacuum space."
    }
  ],
  "res-math-1": [
    {
      id: "math-q1",
      questionText: "If the discriminant (Δ = b² - 4ac) of a quadratic equation is determined to be exactly zero, what is the nature of the roots?",
      options: [
        "Two unique, distinct real roots",
        "One single, repeated real root",
        "No real roots exist (imaginary pair)"
      ],
      correctIndex: 1,
      explanation: "When b² - 4ac = 0, the radical term in the quadratic formula disappears. Adding or subtracting 0 yields identical coordinates, meaning the quadratic equation has exactly one repeated real solution."
    },
    {
      id: "math-q2",
      questionText: "Find the exact discriminant value for the quadratic expression: x² - 6x + 9 = 0",
      options: ["-18", "0", "36", "72"],
      correctIndex: 1,
      explanation: "Identifying factors: a=1, b=-6, c=9. Discriminant formula: b² - 4ac = (-6)² - 4(1)(9) = 36 - 36 = 0."
    },
    {
      id: "math-q3",
      questionText: "Under which mathematical condition does a standard quadratic equation yield zero real solution coordinates?",
      options: ["b² - 4ac < 0", "b² - 4ac = 0", "b² - 4ac > 0"],
      correctIndex: 0,
      explanation: "If the discriminant is less than zero, the core root term requires a square root of a negative value, which is impossible in the real number coordinate space."
    }
  ],
  "fallback": [
    {
      id: "fall-q1",
      questionText: "Which cognitive process best summarizes the advantage of using 'Active Recall' during CAIE preparation?",
      options: [
        "It minimizes revision efforts by allowing passive skim-reading",
        "It forces retrieval from long-term memory, strengthening neural trace routes",
        "It permits copy-pasting definitions without needing to comprehend science models"
      ],
      correctIndex: 1,
      explanation: "Forcing yourself to retrieve information actively activates structural synaptic trace memories, creating resilient retention suited for active diagnostic assessments."
    },
    {
      id: "fall-q2",
      questionText: "How are CAIE Cambridge marking guides officially structured?",
      options: [
        "Vague, single-word templates with zero flexibility",
        "Comprehensive point-based rubrics directly married to syllabus learning codes",
        "Open-ended paragraphs graded purely by hand-writing style"
      ],
      correctIndex: 1,
      explanation: "CISE / IGCSE exam marks are strictly objective and allocated per itemized learning objective descriptor (e.g. 1 mark for identifying transition state, 1 mark for explanation)."
    },
    {
      id: "fall-q3",
      questionText: "True or False: Reviewing tutor feedback is secondary and should be avoided during crunch-time.",
      options: ["True", "False"],
      correctIndex: 1,
      explanation: "False! Reviewing examiner feedback is critical to pinpoint gaps, eliminate common candidate mistakes, and maximize your performance."
    }
  ]
};

interface ModuleQuizProps {
  materialId: string;
  subjectId: string;
  onAddBadge?: (badgeId: string) => void;
  progress?: StudentProgress;
  onUpdateProgress?: (progress: StudentProgress) => void;
  onAddLogMessage?: (msg: string) => void;
  onNavigateToDashboard?: () => void;
}

export default function ModuleQuiz({
  materialId,
  subjectId,
  onAddBadge,
  progress,
  onUpdateProgress,
  onAddLogMessage,
  onNavigateToDashboard
}: ModuleQuizProps) {
  const questions = QUIZ_REGISTRY[materialId] || QUIZ_REGISTRY["fallback"];

  // State
  const [selectedAnswers, setSelectedAnswers] = useState<{ [qIdx: number]: number }>({});
  const [submittedQuestions, setSubmittedQuestions] = useState<number[]>([]);
  const [confettiActive, setConfettiActive] = useState(false);
  const [particles, setParticles] = useState<{ id: number; left: string; color: string; delay: string; size: string; scale: string }[]>([]);
  const [xpAwarded, setXpAwarded] = useState(false);

  // Auto-reset quiz when material changes
  useEffect(() => {
    setSelectedAnswers({});
    setSubmittedQuestions([]);
    setXpAwarded(false);
    setConfettiActive(false);
  }, [materialId]);

  const triggerConfetti = () => {
    const colors = ["#3b82f6", "#10b981", "#fbbf24", "#ef4444", "#a78bfa", "#f472b6", "#22d3ee"];
    const newParticles = Array.from({ length: 80 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: `${Math.random() * 1.2}s`,
      size: `${Math.random() * 8 + 6}px`,
      scale: `${Math.random() * 0.7 + 0.6}`
    }));
    setParticles(newParticles);
    setConfettiActive(true);
    // Let's clear particles after animation finishes
    setTimeout(() => {
      setConfettiActive(false);
    }, 4500);
  };

  const handleSelectOption = (qIdx: number, oIdx: number) => {
    if (submittedQuestions.includes(qIdx)) return; // already locked

    const updatedAnswers = { ...selectedAnswers, [qIdx]: oIdx };
    setSelectedAnswers(updatedAnswers);

    const updatedSubmitted = [...submittedQuestions, qIdx];
    setSubmittedQuestions(updatedSubmitted);

    // Dynamic logging
    const qObj = questions[qIdx];
    const isCorrect = oIdx === qObj.correctIndex;
    if (onAddLogMessage) {
      onAddLogMessage(
        `Quiz interactive answer: Alex Mercer answered "${qObj.options[oIdx]}" on Q${qIdx + 1}. Result: ${
          isCorrect ? "CORRECT (+1 Mark)" : "INCORRECT (Feedback loaded)"
        }`
      );
    }
  };

  const score = Object.entries(selectedAnswers).reduce((acc, [qIdxStr, oIdx]) => {
    const qIdx = parseInt(qIdxStr);
    return acc + (oIdx === questions[qIdx].correctIndex ? 1 : 0);
  }, 0);

  const completedCount = submittedQuestions.length;
  const isFinished = completedCount === questions.length;
  const isPerfect = isFinished && score === questions.length;

  // Award XP and Badge upon perfect completion
  useEffect(() => {
    if (isPerfect && !xpAwarded) {
      setXpAwarded(true);

      // Trigger glorious particle waterfall
      triggerConfetti();

      // Log
      if (onAddLogMessage) {
        onAddLogMessage(`🌟 Outstanding! Alex Mercer achieved a PERFECT score of 3/3 on Syllabus resource checkpoint quiz. Triggering rewards...`);
      }

      // Award "Cambridge Whiz" badge
      if (onAddBadge) {
        onAddBadge("badge-2");
      }

      // Reward progress XP dynamically
      if (progress && onUpdateProgress) {
        const addedXP = 150; // extra reward for perfect module checkpoint
        let newXp = progress.xp + addedXP;
        let newLevel = progress.level;
        let xpNeeded = progress.xpNeededForNextLevel;

        if (newXp >= xpNeeded) {
          newXp -= xpNeeded;
          newLevel += 1;
          if (onAddLogMessage) {
            onAddLogMessage(`🚀 ACADEMIC RANK UP! Alex Mercer leveled up to Level ${newLevel}!`);
          }
        }

        const scoresCopy = { ...progress.scores };
        // Save quiz score
        scoresCopy[`quiz-material-${materialId}`] = {
          score: score,
          maxScore: questions.length,
          submittedAt: new Date().toISOString()
        };

        const updatedProgress: StudentProgress = {
          ...progress,
          level: newLevel,
          xp: newXp,
          xpNeededForNextLevel: xpNeeded,
          scores: scoresCopy,
          completedQuizzes: [...progress.completedQuizzes, `quiz-material-${materialId}`]
        };

        onUpdateProgress(updatedProgress);
      }
    } else if (isFinished && !isPerfect && !xpAwarded) {
      // Finished with mixed score - award partial standard progress
      setXpAwarded(true);
      if (onAddLogMessage) {
        onAddLogMessage(`Check completed of sub-topic questions. Final result score: ${score}/${questions.length}. Encouragement tips provided.`);
      }

      if (progress && onUpdateProgress) {
        const addedXP = 50; // smaller increment
        let newXp = progress.xp + addedXP;
        let newLevel = progress.level;
        let xpNeeded = progress.xpNeededForNextLevel;

        if (newXp >= xpNeeded) {
          newXp -= xpNeeded;
          newLevel += 1;
        }

        const updatedProgress: StudentProgress = {
          ...progress,
          level: newLevel,
          xp: newXp,
          scores: {
            ...progress.scores,
            [`quiz-material-${materialId}`]: {
              score: score,
              maxScore: questions.length,
              submittedAt: new Date().toISOString()
            }
          }
        };

        onUpdateProgress(updatedProgress);
      }
    }
  }, [isFinished, isPerfect, xpAwarded]);

  const handleReset = () => {
    setSelectedAnswers({});
    setSubmittedQuestions([]);
    setXpAwarded(false);
    setConfettiActive(false);
    if (onAddLogMessage) {
      onAddLogMessage(`Revision quiz restarted for material: ${materialId}. Let's secure that perfect 3/3 score!`);
    }
  };

  return (
    <div id="module-quiz-container" className="pt-8 border-t border-slate-200 mt-8 space-y-4">
      {/* Confetti element */}
      {confettiActive && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {particles.map((p) => (
            <div
              key={p.id}
              className="absolute animate-confetti rounded-sm shadow-md"
              style={{
                left: p.left,
                top: "-20px",
                width: p.size,
                height: p.size,
                backgroundColor: p.color,
                animationDelay: p.delay,
                transform: `scale(${p.scale})`,
              }}
            />
          ))}
        </div>
      )}

      {/* Header and badge status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-extrabold text-blue-600 tracking-wider uppercase bg-blue-50 border border-blue-200 px-2 py-0.5 rounded font-mono">
            Syllabus Checkpoint
          </span>
          <h4 className="text-base font-black text-slate-900 tracking-tight mt-1 font-display">
            Interactive Module Revision Quiz
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Test your understanding immediately and secure milestone ranks as you study.
          </p>
        </div>

        {/* Mini progress pill */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-1.5 self-start sm:self-auto">
          <BookOpen className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-bold text-slate-700 font-mono">
            Status: {completedCount}/{questions.length} Solved
          </span>
        </div>
      </div>

      {/* Bento Grid layout for question sets */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mt-1">
        
        {/* Q1: Bento Card taking 8 cols (double width) */}
        <div className="col-span-1 md:col-span-8 bg-slate-50 border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:border-slate-300 transition duration-200 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center pb-2.5 border-b border-slate-200/60 mb-4">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 font-mono">
                Featured Question 01 • {submittedQuestions.includes(0) ? "Locked" : "Active Check"}
              </span>
              <span className="text-[10px] font-bold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-md font-mono">
                1 Mark
              </span>
            </div>

            <h5 className="text-sm font-extrabold text-slate-900 tracking-tight leading-relaxed font-display">
              {questions[0].questionText}
            </h5>

            <div className="space-y-2 mt-4">
              {questions[0].options.map((option, idx) => {
                const isSelected = selectedAnswers[0] === idx;
                const isCorrect = idx === questions[0].correctIndex;
                const wasAnswered = submittedQuestions.includes(0);

                let optionStyle = "bg-white border-slate-200/85 hover:border-slate-300/85 hover:bg-slate-50 text-slate-700";
                if (wasAnswered) {
                  if (isCorrect) {
                     optionStyle = "bg-emerald-50 border-emerald-400 text-emerald-900";
                  } else if (isSelected) {
                     optionStyle = "bg-rose-50 border-rose-400 text-rose-900";
                  } else {
                     optionStyle = "bg-white border-slate-200/60 text-slate-450 opacity-60";
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={wasAnswered}
                    onClick={() => handleSelectOption(0, idx)}
                    className={`w-full text-left p-3.5 rounded-xl border text-xs font-semibold leading-tight transition-all duration-150 flex justify-between items-center ${optionStyle} ${
                      !wasAnswered ? "cursor-pointer active:scale-99" : ""
                    }`}
                  >
                    <span>{option}</span>
                    {wasAnswered && isCorrect && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                    {wasAnswered && isSelected && !isCorrect && <X className="w-4 h-4 text-rose-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Explanation if submitted */}
          {submittedQuestions.includes(0) && (
            <div className="bg-emerald-50/20 border border-emerald-100 rounded-xl p-3.5 mt-4 text-xs text-emerald-950 leading-relaxed animate-fadeIn">
              <div className="flex gap-2 items-start">
                <AlertCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-extrabold text-[10px] uppercase tracking-wide text-emerald-800 block mb-0.5">Syllabus Feedback</span>
                  <p className="font-medium font-sans">{questions[0].explanation}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Q2: Bento Card taking 4 cols */}
        <div className="col-span-1 md:col-span-4 bg-slate-50 border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:border-slate-300 transition duration-200 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center pb-2.5 border-b border-slate-200/60 mb-4">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 font-mono">
                Checkpoint 02
              </span>
              <span className="text-[10px] font-bold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-md font-mono">
                1 Mark
              </span>
            </div>

            <h5 className="text-xs font-semibold text-slate-900 leading-relaxed font-display">
              {questions[1].questionText}
            </h5>

            <div className="space-y-2 mt-4">
              {questions[1].options.map((option, idx) => {
                const isSelected = selectedAnswers[1] === idx;
                const isCorrect = idx === questions[1].correctIndex;
                const wasAnswered = submittedQuestions.includes(1);

                let optionStyle = "bg-white border-slate-200/85 hover:border-slate-300/85 hover:bg-slate-50 text-slate-700";
                if (wasAnswered) {
                  if (isCorrect) {
                     optionStyle = "bg-emerald-50 border-emerald-400 text-emerald-900";
                  } else if (isSelected) {
                     optionStyle = "bg-rose-50 border-rose-400 text-rose-900";
                  } else {
                     optionStyle = "bg-white border-slate-200/60 text-slate-450 opacity-60";
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={wasAnswered}
                    onClick={() => handleSelectOption(1, idx)}
                    className={`w-full text-left p-3.5 rounded-xl border text-[11px] font-bold leading-normal transition-all duration-150 flex justify-between items-center ${optionStyle} ${
                      !wasAnswered ? "cursor-pointer active:scale-99" : ""
                    }`}
                  >
                    <span>{option}</span>
                    {wasAnswered && isCorrect && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                    {wasAnswered && isSelected && !isCorrect && <X className="w-3.5 h-3.5 text-rose-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Short explanation */}
          {submittedQuestions.includes(1) && (
            <div className="bg-emerald-50/10 border border-emerald-100/60 rounded-xl p-3.5 mt-4 text-[11px] text-emerald-950 leading-relaxed animate-fadeIn">
              <p className="font-semibold font-sans">{questions[1].explanation}</p>
            </div>
          )}
        </div>

        {/* Q3: Bento Card taking 4 cols */}
        <div className="col-span-1 md:col-span-4 bg-slate-50 border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:border-slate-300 transition duration-200 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center pb-2.5 border-b border-slate-200/60 mb-4">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 font-mono">
                Checkpoint 03
              </span>
              <span className="text-[10px] font-bold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-md font-mono">
                1 Mark
              </span>
            </div>

            <h5 className="text-xs font-semibold text-slate-900 leading-relaxed font-display">
              {questions[2].questionText}
            </h5>

            <div className="space-y-2 mt-4">
              {questions[2].options.map((option, idx) => {
                const isSelected = selectedAnswers[2] === idx;
                const isCorrect = idx === questions[2].correctIndex;
                const wasAnswered = submittedQuestions.includes(2);

                let optionStyle = "bg-white border-slate-200/85 hover:border-slate-300/85 hover:bg-slate-50 text-slate-700";
                if (wasAnswered) {
                  if (isCorrect) {
                     optionStyle = "bg-emerald-50 border-emerald-400 text-emerald-900";
                  } else if (isSelected) {
                     optionStyle = "bg-rose-50 border-rose-400 text-rose-900";
                  } else {
                     optionStyle = "bg-white border-slate-200/60 text-slate-450 opacity-60";
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={wasAnswered}
                    onClick={() => handleSelectOption(2, idx)}
                    className={`w-full text-left p-3.5 rounded-xl border text-[11px] font-bold leading-normal transition-all duration-150 flex justify-between items-center ${optionStyle} ${
                      !wasAnswered ? "cursor-pointer active:scale-99" : ""
                    }`}
                  >
                    <span>{option}</span>
                    {wasAnswered && isCorrect && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                    {wasAnswered && isSelected && !isCorrect && <X className="w-3.5 h-3.5 text-rose-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Short explanation */}
          {submittedQuestions.includes(2) && (
            <div className="bg-emerald-50/10 border border-emerald-100/60 rounded-xl p-3.5 mt-4 text-[11px] text-emerald-950 leading-relaxed animate-fadeIn">
              <p className="font-semibold font-sans">{questions[2].explanation}</p>
            </div>
          )}
        </div>

        {/* Score & Next Steps Card: Bento Card taking 8 cols (double width) with gorgeous dark board theme */}
        <div className="col-span-1 md:col-span-8 bg-slate-900 border border-slate-800 text-white rounded-2xl p-6 shadow-md relative overflow-hidden flex flex-col justify-between min-h-[220px]">
          
          {/* Glowing background vector orb */}
          <div className="absolute right-0 top-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

          {/* Finished or In-Progress stats */}
          {!isFinished ? (
            <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
              <div>
                <div className="flex items-center gap-1.5 text-blue-400">
                  <Flame className="w-4 h-4 text-orange-400 fill-orange-400 animate-pulse" />
                  <span className="text-[10px] font-extrabold uppercase tracking-wider font-mono">Solve to Unlock Complete Rewards</span>
                </div>
                <h5 className="text-lg font-black text-white hover:text-blue-200 transition tracking-tight mt-1.5 font-display">
                  Active Revision Progress
                </h5>
                <p className="text-xs text-slate-350 text-slate-300 leading-relaxed mt-1 max-w-md">
                  Submit answers for all 3 questions to unlock the next steps curriculum guide, secure a <span className="font-bold text-orange-400">Perfect Revision Reward</span> (+150 XP), and earn the <span className="text-blue-400 font-extrabold">Cambridge Whiz</span> badge!
                </p>
              </div>

              {/* Progress Bar indicator */}
              <div className="space-y-1.5 mt-4">
                <div className="flex justify-between items-baseline text-[10px] font-bold text-slate-400 font-mono uppercase">
                  <span>Questions Solved</span>
                  <span>{completedCount} / {questions.length} Completed</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
                  <div
                    className="bg-blue-500 h-full transition-all duration-350 rounded-full"
                    style={{ width: `${(completedCount / questions.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ) : (
            // Quiz completed view
            <div className="relative z-10 flex flex-col justify-between h-full space-y-5 animate-fadeIn">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {isPerfect ? (
                      <div className="flex items-center gap-1.5 text-emerald-400">
                        <Award className="w-4.5 h-4.5 animate-bounce text-yellow-400" />
                        <span className="text-[10px] font-extrabold uppercase tracking-widest font-mono">PERFECT COMPLETION REWARDED!</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-blue-400">
                        <Check className="w-4.5 h-4.5 text-blue-400" />
                        <span className="text-[10px] font-extrabold uppercase tracking-widest font-mono">REVISION SESSION TERMINATED</span>
                      </div>
                    )}
                  </div>

                  <span className="text-xs font-bold font-mono px-3 py-1 bg-slate-800 border border-slate-700/80 rounded-xl">
                    Score: {score} / {questions.length} Marks
                  </span>
                </div>

                <div className="mt-2.5">
                  <h5 className="text-lg font-black text-white font-display flex items-center gap-2">
                    {isPerfect ? (
                      <>
                        <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse fill-yellow-400" />
                        Cambridge Mastery Acquired!
                      </>
                    ) : (
                      "Revision Check completed!"
                    )}
                  </h5>

                  <p className="text-xs text-slate-300 leading-relaxed mt-1 max-w-xl">
                    {isPerfect
                      ? "Outstanding job! You've matched every single syllabus key term with perfect accuracy. Alex Mercer has been credited +150 XP and a milestone achievement has been logged."
                      : `Decent effort! You secured ${score} out of ${questions.length} marks correctly. We recommend resetting the quiz below to study the material guidelines again and lock in a 100% perfect rating.`}
                  </p>
                </div>
              </div>

              {/* NEXT STEPS PROMPT PANEL */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 mt-1.5 space-y-2.5">
                <span className="text-[10px] font-extrabold text-slate-450 text-slate-400 uppercase tracking-widest block font-mono">
                  Syllabus Recommendations & Next Steps:
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <button
                    onClick={() => {
                      if (onNavigateToDashboard) {
                        onNavigateToDashboard();
                      } else {
                        alert("Select 'Workspace Dashboard' on the left sidebar to access standard graded paper reviews!");
                      }
                    }}
                    className="flex items-center justify-between p-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700/85 hover:bg-slate-800/80 rounded-xl text-left cursor-pointer transition text-slate-350"
                  >
                    <div className="flex items-center gap-2">
                      <div className="bg-blue-600/15 p-1 rounded-md">
                        <Flame className="w-3.5 h-3.5 text-blue-400" />
                      </div>
                      <span className="font-semibold text-slate-200">Start past paper mocks</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                  </button>

                  <button
                    onClick={() => {
                      alert("Forum navigation is active. Access 'IGCSE Forums' on the left sidebar to post structured questions!");
                    }}
                    className="flex items-center justify-between p-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700/85 hover:bg-slate-800/80 rounded-xl text-left cursor-pointer transition text-slate-350"
                  >
                    <div className="flex items-center gap-2">
                      <div className="bg-blue-600/15 p-1 rounded-md">
                        <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
                      </div>
                      <span className="font-semibold text-slate-200">Ask community experts</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                  </button>
                </div>
              </div>

              {/* Reset/Action Tray */}
              <div className="flex justify-between items-center pt-3 border-t border-slate-800 mt-2">
                <span className="text-[10px] text-slate-450 text-slate-400 font-mono">
                  {isPerfect ? "🎉 Milestone synced!" : "Learn from errors & retry"}
                </span>

                <button
                  onClick={handleReset}
                  className="flex items-center gap-1.5 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 text-xs font-semibold px-3.5 py-2 rounded-xl transition cursor-pointer border border-slate-700"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Reset Quiz Attempt
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
