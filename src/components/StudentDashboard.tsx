import React, { useState, useEffect } from "react";
import { StudentProgress, Question, Badge, UserRole, Subject, Difficulty, PaperType } from "../types";
import { SUBJECTS, SAMPLE_QUESTIONS, BADGES } from "../mockData";
import { Award, Clock, Send, Sparkles, BookOpen, Flame, HelpCircle, CheckCircle, AlertTriangle, ArrowRight, Play, RotateCcw, Users, Trophy, TrendingUp, Heart, Search, Share2, MessageSquare, Calendar, Shield } from "lucide-react";

const BUDDY_ICON_MAP: { [key: string]: React.ComponentType<any> } = {
  BookOpen: BookOpen,
  Sparkles: Sparkles,
  Shield: Shield,
  CheckCircle: CheckCircle,
  Calendar: Calendar
};

import { Assignment } from "../types";

interface StudentDashboardProps {
  progress: StudentProgress;
  onUpdateProgress: (progress: StudentProgress) => void;
  onAddLogMessage?: (msg: string) => void;
  assignments?: Assignment[];
  onUpdateAssignments?: (assignments: Assignment[]) => void;
  subjects?: Subject[];
}

export default function StudentDashboard({
  progress,
  onUpdateProgress,
  onAddLogMessage,
  assignments = [],
  onUpdateAssignments,
  subjects = SUBJECTS
}: StudentDashboardProps) {
  // Navigation
  const [activeTab, setActiveTab] = useState<"quiz" | "tutor" | "badges" | "buddies" | "assignments">("quiz");
  const [typedAnswers, setTypedAnswers] = useState<{[assignmentId: string]: {[questionId: string]: string}}>({});

  // Study Buddies State
  const [buddies, setBuddies] = useState([
    {
      id: "buddy-1",
      name: "Chloe Tan",
      level: 4,
      xp: 850,
      xpNeeded: 1000,
      streakDays: 7,
      subjectFocus: "Chemistry (0620)",
      badges: ["badge-1", "badge-4"],
      statusText: "Grinding on states of matter curves! 🧪",
      lastActive: "15 mins ago",
      cheers: 12,
      cheeredByMe: false,
    },
    {
      id: "buddy-2",
      name: "Marcus Vance",
      level: 5,
      xp: 120,
      xpNeeded: 1200,
      streakDays: 12,
      subjectFocus: "Physics (0625)",
      badges: ["badge-1", "badge-3", "badge-5"],
      statusText: "Analyzing thermal heat loss experiment controls.",
      lastActive: "2 hrs ago",
      cheers: 24,
      cheeredByMe: false,
    },
    {
      id: "buddy-3",
      name: "Priya Sharma",
      level: 3,
      xp: 945,
      xpNeeded: 1000,
      streakDays: 3,
      subjectFocus: "Mathematics (0580)",
      badges: ["badge-1", "badge-2"],
      statusText: "Formulating quadratic formula discriminants.",
      lastActive: "Just now",
      cheers: 9,
      cheeredByMe: false,
    },
    {
      id: "buddy-4",
      name: "Zackary Chen",
      level: 2,
      xp: 450,
      xpNeeded: 800,
      streakDays: 0,
      subjectFocus: "Computer Science (0478)",
      badges: ["badge-1"],
      statusText: "Stuck on logic gates AND vs XOR truth tables! 🧠",
      lastActive: "1 day ago",
      cheers: 4,
      cheeredByMe: false,
    },
    {
      id: "buddy-5",
      name: "Amina Diallo",
      level: 4,
      xp: 310,
      xpNeeded: 1000,
      streakDays: 6,
      subjectFocus: "Biology (0610)",
      badges: ["badge-1", "badge-2", "badge-4"],
      statusText: "Drafting palisade vs liver cells comparisons. 🌿",
      lastActive: "5 mins ago",
      cheers: 19,
      cheeredByMe: false,
    }
  ]);

  const [buddySearchQuery, setBuddySearchQuery] = useState("");
  const [buddyFilter, setBuddyFilter] = useState<"All" | "Streak" | "HighLevel" | "Active">("All");
  const [selectedCompareBuddy, setSelectedCompareBuddy] = useState<any | null>(null);
  const [myBroadcastStatus, setMyBroadcastStatus] = useState("Reviewing active past documents! ✨");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [newStatusInput, setNewStatusInput] = useState("");

  // Selection configurations
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("bio");
  const [selectedTopicId, setSelectedTopicId] = useState<string>("bio-1");
  const [useAIQuestion, setUseAIQuestion] = useState<boolean>(false);
  const [quizDifficulty, setQuizDifficulty] = useState<Difficulty>(Difficulty.EASY);
  const [quizPaperType, setQuizPaperType] = useState<PaperType>(PaperType.PAPER_1);

  // Active quiz states
  const [isQuizActive, setIsQuizActive] = useState<boolean>(false);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [loadingQuestion, setLoadingQuestion] = useState<boolean>(false);
  const [isTimed, setIsTimed] = useState<boolean>(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(60);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);

  // Student response states
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [writtenAnswer, setWrittenAnswer] = useState<string>("");
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [earnedXPMessage, setEarnedXPMessage] = useState<string | null>(null);

  // AI Tutor chat states
  const [chatInput, setChatInput] = useState<string>("");
  const [chatMessages, setChatMessages] = useState<{ role: "user" | "model"; content: string }[]>([
    { role: "model", content: "Hi! I am your Cambridge IGCSE revision partner. Type any topic in Science, Maths, or Tech, and I will share past paper secrets and analogies with you!" }
  ]);
  const [sendingChat, setSendingChat] = useState<boolean>(false);

  // Auto-set initial topic based on selected subject
  useEffect(() => {
    const sub = SUBJECTS.find(s => s.id === selectedSubjectId);
    if (sub && sub.topics.length > 0) {
      setSelectedTopicId(sub.topics[0].id);
    }
  }, [selectedSubjectId]);

  // Timed exam countdown timer
  useEffect(() => {
    if (isQuizActive && isTimed && timeRemaining > 0 && !quizSubmitted) {
      const timer = setTimeout(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (isQuizActive && isTimed && timeRemaining === 0 && !quizSubmitted) {
      handleSubmitAnswer();
    }
  }, [isQuizActive, isTimed, timeRemaining, quizSubmitted]);

  // Launch a new exam
  const handleStartPractice = async () => {
    setLoadingQuestion(true);
    setQuizSubmitted(false);
    setSelectedOptionIndex(null);
    setWrittenAnswer("");
    setEarnedXPMessage(null);

    // Topic details
    const targetSubjectObj = SUBJECTS.find(s => s.id === selectedSubjectId);
    const targetTopicObj = targetSubjectObj?.topics.find(t => t.id === selectedTopicId);
    const topicHeading = targetTopicObj ? targetTopicObj.name : "Cell Structure";

    if (useAIQuestion) {
      if (onAddLogMessage) {
        onAddLogMessage(`Requesting standard-aligned AI question generator for Subject: ${targetSubjectObj?.name} ...`);
      }

      try {
        const response = await fetch("/api/ai/generate-question", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subject: targetSubjectObj?.name || "Biology",
            topic: topicHeading,
            difficulty: quizDifficulty,
            paperType: quizPaperType
          })
        });

        const data = await response.json();

        if (data.error) {
          // Fallback if key missing or failed
          if (onAddLogMessage) {
            onAddLogMessage(`AI key not active. Seeding premium offline past-paper library content instead.`);
          }
          const matchedFallback = SAMPLE_QUESTIONS.find(q => q.subjectId === selectedSubjectId) || SAMPLE_QUESTIONS[1];
          setCurrentQuestion(matchedFallback);
        } else {
          setCurrentQuestion(data);
          if (onAddLogMessage) {
            onAddLogMessage(`Received genuine Cambridge-standard AI question. Question ID: ${data.id}`);
          }
        }
      } catch (err: any) {
        console.error("Failed generating AI question:", err);
        const matchedFallback = SAMPLE_QUESTIONS.find(q => q.subjectId === selectedSubjectId) || SAMPLE_QUESTIONS[1];
        setCurrentQuestion(matchedFallback);
      }
    } else {
      // Fetch preloaded matching question or pick default chemistry curves
      const matched = SAMPLE_QUESTIONS.find(q => q.subjectId === selectedSubjectId && q.topicId === selectedTopicId) ||
                       SAMPLE_QUESTIONS.find(q => q.subjectId === selectedSubjectId) ||
                       SAMPLE_QUESTIONS[1];

      setCurrentQuestion(matched);
      if (onAddLogMessage) {
        onAddLogMessage(`Loaded curated local past-paper mock template. Q-ID: ${matched.id}`);
      }
    }

    setLoadingQuestion(false);
    setIsQuizActive(true);

    const matchTime = currentQuestion?.timeEstimate || 5;
    setTimeRemaining(matchTime * 60);
  };

  // Submit test answers
  const handleSubmitAnswer = () => {
    if (!currentQuestion) return;

    setQuizSubmitted(true);

    let xpEarned = 50; // base xp
    let pointsScored = 0;
    const maxPossPoints = currentQuestion.marks;

    if (currentQuestion.options) {
      // Multiple Choice Question
      if (selectedOptionIndex === currentQuestion.correctOptionIndex) {
        pointsScored = maxPossPoints;
        xpEarned = 150; // success boost
      } else {
        xpEarned = 30; // participation points
      }
    } else {
      // Structured Question
      pointsScored = Math.round(maxPossPoints * 0.75); // simulated self evaluation standard
      xpEarned = 100;
    }

    // Award badges depending on results
    let updatedBadges = [...progress.badges];
    if (xpEarned === 150 && !updatedBadges.includes("badge-2")) {
      updatedBadges.push("badge-2"); // award "Cambridge Whiz"
    }

    // Increment progress stats
    let newXp = progress.xp + xpEarned;
    let newLevel = progress.level;
    if (newXp >= progress.xpNeededForNextLevel) {
      newLevel += 1;
      newXp = newXp - progress.xpNeededForNextLevel;
      alert(`🎉 LEVEL UP! You reached Cambridge Level ${newLevel}! Awesome dedication.`);
    }

    const updatedProgress: StudentProgress = {
      ...progress,
      xp: newXp,
      level: newLevel,
      badges: updatedBadges,
      completedQuizzes: [...progress.completedQuizzes, currentQuestion.id],
      scores: {
        ...progress.scores,
        [currentQuestion.id]: {
          score: pointsScored,
          maxScore: maxPossPoints,
          submittedAt: new Date().toISOString(),
          answerText: writtenAnswer || undefined
        }
      }
    };

    onUpdateProgress(updatedProgress);
    setEarnedXPMessage(`Earned +${xpEarned} XP towards Level ${newLevel}!`);

    if (onAddLogMessage) {
      onAddLogMessage(`Evaluated quiz question ${currentQuestion.id}. Student awarded ${pointsScored}/${maxPossPoints} marks. Student XP balance updated.`);
    }
  };

  // Chat with AI Tutor
  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    setChatInput("");
    setChatMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setSendingChat(true);

    if (onAddLogMessage) {
      onAddLogMessage(`Publishing prompt transcript to academic IGCSE tutor API endpoint...`);
    }

    try {
      const response = await fetch("/api/ai/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg,
          history: chatMessages.slice(-6) // hold last few chats for context
        })
      });

      const data = await response.json();
      setChatMessages(prev => [...prev, { role: "model", content: data.reply }]);

    } catch (err: any) {
      console.error("AI Tutor error:", err);
      // fallback explanation simulation to keep preview flawless
      setChatMessages(prev => [
        ...prev,
        {
          role: "model",
          content: `No active key detected. However, here is your core study tip for Chemistry states of matter transitions: Temperature locks flat because the extra thermal energy goes straight into breaking the strong intermolecular bonds holding solid molecules in grid-like crystal lattices, rather than increasing their average kinetic speed! Always include "breaking intermolecular bonds" on Paper 4 examinations.`
        }
      ]);
    }
    setSendingChat(false);
  };

  // Format countdown clock nicely
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainSecs = secs % 60;
    return `${mins}:${remainSecs < 10 ? "0" : ""}${remainSecs}`;
  };

  return (
    <div id="student-portal-root" className="space-y-6">
      {/* Gamification Level Hub */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          {/* Level Progress */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-lg ring-4 ring-blue-100 font-display">
              Lv {progress.level}
            </div>
            <div className="space-y-1.5 flex-1">
              <div className="flex justify-between text-xs font-extrabold text-slate-400">
                <span className="tracking-widest">REVISION RANK: CANDIDATE APEX</span>
                <span className="font-mono">{progress.xp} / {progress.xpNeededForNextLevel} XP</span>
              </div>
              <div className="w-64 md:w-80 h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-500"
                  style={{ width: `${Math.round((progress.xp / progress.xpNeededForNextLevel) * 100)}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Flame streak & Badges Summary */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-amber-50 text-amber-700 font-extrabold text-xs px-4 py-2.5 rounded-2xl border border-amber-100 shadow-sm animate-pulse">
              <Flame className="w-5 h-5 fill-current" />
              <span>{progress.streakDays} Day active Streak!</span>
            </div>

            <button
              id="student-tab-badges"
              onClick={() => setActiveTab("badges")}
              className="flex items-center gap-2 bg-blue-50/60 hover:bg-blue-100 text-blue-700 font-extrabold text-xs px-4 py-2.5 rounded-2xl border border-blue-100 shadow-sm transition"
            >
              <Award className="w-4.5 h-4.5 text-blue-600" />
              <span>Earned Badges ({progress.badges.length})</span>
            </button>
          </div>
        </div>

        {/* Dashboard inner navigation */}
        <div className="flex gap-2 border-t border-slate-150 mt-6 pt-4 text-xs font-bold uppercase tracking-wider flex-wrap">
          <button
            id="subtab-quiz"
            onClick={() => setActiveTab("quiz")}
            className={`px-4 py-2.5 rounded-xl transition duration-200 cursor-pointer ${
              activeTab === "quiz" ? "bg-blue-600 text-white shadow-sm shadow-blue-600/10" : "text-slate-500 hover:bg-slate-100"
            }`}
          >
            Past-Paper Exam Center
          </button>
          <button
            id="subtab-tutor"
            onClick={() => setActiveTab("tutor")}
            className={`px-4 py-2.5 rounded-xl transition duration-200 cursor-pointer ${
              activeTab === "tutor" ? "bg-blue-600 text-white shadow-sm shadow-blue-600/10" : "text-slate-500 hover:bg-slate-100"
            }`}
          >
            Interactive AI Companion Tutor
          </button>
          <button
            id="subtab-assignments"
            onClick={() => setActiveTab("assignments")}
            className={`px-4 py-2.5 rounded-xl transition duration-200 cursor-pointer flex items-center gap-1.5 ${
              activeTab === "assignments" ? "bg-blue-600 text-white shadow-sm shadow-blue-600/10" : "text-slate-500 hover:bg-slate-100"
            }`}
          >
            Syllabus Homework ({assignments.length})
          </button>
          <button
            id="subtab-buddies"
            onClick={() => setActiveTab("buddies")}
            className={`px-4 py-2.5 rounded-xl transition duration-200 cursor-pointer flex items-center gap-1.5 ${
              activeTab === "buddies" ? "bg-blue-600 text-white shadow-sm shadow-blue-600/10" : "text-slate-500 hover:bg-slate-100"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Study Buddies
          </button>
        </div>
      </div>

      {activeTab === "quiz" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">
          {/* Diagnostic Setup Parameters */}
          {!isQuizActive ? (
            <div className="lg:col-span-12 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 tracking-tight font-display">Cambridge Assessment Configurator</h3>
                <p className="text-xs text-slate-400 mt-1 font-medium">Configure syllabus bounds and difficulty levels to launch interactive timed practices.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pb-4">
                {/* Subject Selector */}
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">Syllabus Subject</label>
                  <select
                    id="setup-subject"
                    value={selectedSubjectId}
                    onChange={e => setSelectedSubjectId(e.target.value)}
                    className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {SUBJECTS.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.syllabusCode})</option>
                    ))}
                  </select>
                </div>

                {/* Topic Selector */}
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">Topic Target</label>
                  <select
                    id="setup-topic"
                    value={selectedTopicId}
                    onChange={e => setSelectedTopicId(e.target.value)}
                    className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {SUBJECTS.find(s => s.id === selectedSubjectId)?.topics.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    )) || <option>Cell organization</option>}
                  </select>
                </div>

                {/* Difficulty */}
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">Examiner Tier Difficulty</label>
                  <select
                    id="setup-difficulty"
                    value={quizDifficulty}
                    onChange={e => setQuizDifficulty(e.target.value as Difficulty)}
                    className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {Object.values(Difficulty).map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                {/* Paper Type */}
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 font-sans">CAIE Paper Style</label>
                  <select
                    id="setup-paper"
                    value={quizPaperType}
                    onChange={e => setQuizPaperType(e.target.value as PaperType)}
                    className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {Object.values(PaperType).map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Advanced diagnostic options */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-slate-800">Use Cambridge-Standard AI Generator</span>
                    <span className="text-[9px] bg-blue-100 text-blue-800 font-extrabold px-1.5 py-0.5 rounded">REAL TIME</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-none font-medium">Drafts syllabus questions and examiners' marking guides with Google Gemini API.</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <input
                      id="toggle-ai-gen"
                      type="checkbox"
                      checked={useAIQuestion}
                      onChange={e => setUseAIQuestion(e.target.checked)}
                      className="w-4 h-4 accent-blue-600 cursor-pointer"
                    />
                    <label htmlFor="toggle-ai-gen" className="text-xs font-bold text-slate-500 select-none cursor-pointer">Enable AI Question</label>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <input
                      id="toggle-timed-exam"
                      type="checkbox"
                      checked={isTimed}
                      onChange={e => setIsTimed(e.target.checked)}
                      className="w-4 h-4 accent-blue-600 cursor-pointer"
                    />
                    <label htmlFor="toggle-timed-exam" className="text-xs font-bold text-slate-500 select-none cursor-pointer">Enable Exam Countdown Clock</label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  id="btn-run-exam"
                  onClick={handleStartPractice}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-6 py-3 rounded-xl transition duration-200 shadow-md shadow-blue-600/10 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current" />
                  Launch Past-Paper Practice session
                </button>
              </div>
            </div>
          ) : (
            /* Active Live Quiz section */
            <div className="lg:col-span-12 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              {loadingQuestion ? (
                <div className="py-12 text-center text-slate-405 text-slate-405 text-slate-400">
                  <Sparkles className="w-10 h-10 text-blue-500 mx-auto animate-spin mb-3" />
                  <p className="font-bold">Consulting Cambridge IGCSE Syllabus standard models...</p>
                </div>
              ) : currentQuestion ? (
                <div className="space-y-6">
                  {/* Active Header */}
                  <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] bg-slate-900 text-white px-2.5 py-1 rounded-sm uppercase tracking-wider font-extrabold">
                        {currentQuestion.paperType}
                      </span>
                      <span className="text-xs text-gray-400">• Allocated Marks:</span>
                      <span className="text-xs font-bold text-gray-700">{currentQuestion.marks} Marks</span>
                    </div>

                    {isTimed && (
                      <div className="flex items-center gap-1.5 bg-red-50 text-red-700 font-bold text-xs px-3 py-1.5 rounded-lg border border-red-100">
                        <Clock className="w-4 h-4 animate-pulse" />
                        <span>{formatTime(timeRemaining)}</span>
                      </div>
                    )}
                  </div>

                  {/* Syllabus objective box */}
                  <p className="text-[11px] text-gray-400 uppercase tracking-widest font-extrabold leading-none">
                    Learning objective reference: <span className="text-slate-700">{currentQuestion.learningObjective}</span>
                  </p>

                  {/* Problem statement */}
                  <div className="prose prose-sm max-w-none text-gray-800 font-extrabold text-base md:text-lg leading-snug tracking-tight">
                    {currentQuestion.questionText}
                  </div>

                  {/* MCQs Option Selector */}
                  {currentQuestion.options ? (
                    <div className="grid grid-cols-1 gap-3 pt-3">
                      {currentQuestion.options.map((opt, oIdx) => {
                        const isCorrectOpt = oIdx === currentQuestion.correctOptionIndex;
                        const isSelectedOpt = selectedOptionIndex === oIdx;

                        let stylePill = "border-gray-200 bg-white hover:bg-gray-50";
                        if (quizSubmitted) {
                          if (isCorrectOpt) {
                            stylePill = "border-emerald-500 bg-emerald-50 text-emerald-900";
                          } else if (isSelectedOpt) {
                            stylePill = "border-red-500 bg-red-50 text-red-900";
                          } else {
                            stylePill = "border-gray-105 opacity-60";
                          }
                        } else if (isSelectedOpt) {
                          stylePill = "border-emerald-500 bg-emerald-50/20";
                        }

                        return (
                          <button
                            key={oIdx}
                            id={`opt-btn-${oIdx}`}
                            disabled={quizSubmitted}
                            onClick={() => setSelectedOptionIndex(oIdx)}
                            className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${stylePill}`}
                          >
                            <span className="w-6 h-6 rounded-full bg-gray-150 border border-gray-200/80 shrink-0 font-black text-xs flex items-center justify-center">
                              {String.fromCharCode(65 + oIdx)}
                            </span>
                            <span className="text-sm font-bold">{opt}</span>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    /* Structured written output */
                    <div className="space-y-2 pt-3">
                      <label className="block text-xs font-black uppercase tracking-wider text-gray-400">Written Response Sheet</label>
                      <textarea
                        id="written-exercise-box"
                        disabled={quizSubmitted}
                        value={writtenAnswer}
                        onChange={(e) => setWrittenAnswer(e.target.value)}
                        placeholder="Draft your detailed explain / compare answer. Use Cambridge command nouns..."
                        rows={5}
                        className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-emerald-500"
                      ></textarea>
                    </div>
                  )}

                  {/* Submission and Action buttons */}
                  {!quizSubmitted ? (
                    <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                      <button
                        id="btn-cancel-quiz"
                        onClick={() => setIsQuizActive(false)}
                        className="text-xs text-gray-400 hover:underline"
                      >
                        Abandon attempt
                      </button>

                      <button
                        id="btn-final-quiz-turnin"
                        onClick={handleSubmitAnswer}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm px-6 py-2.5 rounded-xl transition"
                      >
                        Submit Response
                      </button>
                    </div>
                  ) : (
                    /* Correction & Explanation Panel */
                    <div className="space-y-6 pt-4 border-t border-gray-150 animate-fadeIn">
                      {/* Score message status */}
                      {currentQuestion.options && (
                        <div className={`p-4 rounded-xl border flex items-center gap-3 ${
                          selectedOptionIndex === currentQuestion.correctOptionIndex
                            ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                            : "bg-red-50 border-red-300 text-red-800"
                        }`}>
                          {selectedOptionIndex === currentQuestion.correctOptionIndex ? (
                            <>
                              <CheckCircle className="w-5 h-5" />
                              <span className="font-extrabold text-sm">Correct Answer! Full Marks +150 XP.</span>
                            </>
                          ) : (
                            <>
                              <AlertTriangle className="w-5 h-5 animate-bounce shadow-sm" />
                              <span className="font-extrabold text-sm">Incorrect option. Correct solution is {String.fromCharCode(65 + (currentQuestion.correctOptionIndex || 0))}. +30 participation XP awarded.</span>
                            </>
                          )}
                        </div>
                      )}

                      {earnedXPMessage && (
                        <div className="font-extrabold text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 fill-current animate-pulse text-emerald-600" />
                          <span>{earnedXPMessage}</span>
                        </div>
                      )}

                      {/* Diagnostic details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 text-sm">
                        {/* Syllabus model details */}
                        <div className="space-y-3 bg-gray-50 border border-gray-200/60 p-5 rounded-2xl">
                          <h4 className="font-black text-gray-800 border-b border-gray-200 pb-2">Cambridge Model Solution & Criteria</h4>
                          <div>
                            <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest block mb-1">Standard Model Answer</span>
                            <p className="text-xs text-gray-700 whitespace-pre-wrap italic bg-white p-3 rounded-xl border border-gray-150 leading-relaxed">
                              "{currentQuestion.modelAnswer}"
                            </p>
                          </div>

                          <div className="pt-2">
                            <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest block mb-1">Examiner Mark Scheme</span>
                            <div className="space-y-1 bg-white p-3 rounded-xl border border-gray-150">
                              {currentQuestion.markScheme.points.map((pt, index) => (
                                <p key={index} className="text-xs text-gray-700 flex items-start gap-1">
                                  <span>•</span>
                                  <span>{pt}</span>
                                </p>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Interactive simple coaching student support */}
                        <div className="space-y-3 bg-emerald-50/20 border border-emerald-150 p-5 rounded-2xl">
                          <h4 className="font-black text-emerald-950 border-b border-emerald-150 pb-2 flex items-center gap-1">
                            <Sparkles className="w-4 h-4 text-emerald-600 fill-current" />
                            Examiner Revision Advisory
                          </h4>

                          <div>
                            <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-widest block mb-1">Student Friendly Concept Tip</span>
                            <p className="text-xs text-emerald-900 leading-relaxed bg-white/70 p-3 rounded-xl leading-relaxed">
                              {currentQuestion.studentFriendlyExplanation}
                            </p>
                          </div>

                          <div>
                            <span className="text-[10px] font-extrabold text-red-800 uppercase tracking-widest block mb-1">Common Student Errors</span>
                            <div className="space-y-1">
                              {currentQuestion.commonMistakes.map((mis, index) => (
                                <p key={index} className="text-xs text-red-900 flex items-start gap-1">
                                  <span className="font-black">•</span>
                                  <span>{mis}</span>
                                </p>
                              ))}
                            </div>
                          </div>

                          <div className="pt-2 border-t border-emerald-150">
                            <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-widest block mb-1">Improvement Guidance</span>
                            <div className="space-y-1">
                              {currentQuestion.improvementSuggestions.map((sug, index) => (
                                <p key={index} className="text-xs text-emerald-900 flex items-start gap-1">
                                  <span>✔</span>
                                  <span>{sug}</span>
                                </p>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end pt-4 border-t border-gray-100">
                        <button
                          id="btn-close-active-quiz"
                          onClick={() => setIsQuizActive(false)}
                          className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition cursor-pointer"
                        >
                          Exit revision session
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="p-6 text-center text-gray-500">Failed to load exam question.</p>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === "tutor" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 animate-fadeIn">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-lg font-extrabold text-slate-900 tracking-tight font-display">Active IGCSE Student Support Assistant</h3>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">Explore syllabus concepts, request food tests mnemonics, or query calculations safety check processes.</p>
          </div>

          <div className="h-[400px] overflow-y-auto bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-4 flex flex-col justify-between">
            <div className="space-y-3 overflow-y-auto pr-1">
              {chatMessages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fadeIn`}
                >
                  <div className={`max-w-md p-3.5 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap shadow-xs ${
                    msg.role === "user"
                      ? "bg-slate-900 text-white rounded-tr-none"
                      : "bg-white text-gray-800 rounded-tl-none border border-slate-200"
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}

              {sendingChat && (
                <div className="flex justify-start">
                  <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center gap-2 text-xs text-gray-500">
                    <Sparkles className="w-4 h-4 text-blue-600 animate-spin" />
                    Checking examiner booklets...
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Prompt Entry Form */}
          <form onSubmit={handleSendChatMessage} className="flex gap-2 pt-2">
            <input
              id="tutor-chat-input"
              type="text"
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              placeholder="e.g. Can you explain the difference between Benedict and Biuret food tests in Biology?"
              className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600"
              disabled={sendingChat}
            />
            <button
              id="btn-send-tutor-chat"
              type="submit"
              disabled={sendingChat || !chatInput.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-3 rounded-xl flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer shadow-md shadow-blue-600/10"
            >
              <Send className="w-4.5 h-4.5" />
              Ask Buddy
            </button>
          </form>
        </div>
      )}

      {activeTab === "badges" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6 animate-fadeIn">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 tracking-tight font-display font-display">Active Academic Badges & Credentials</h3>
            <p className="text-xs text-slate-400 mt-1 font-medium">Unlock badges by doing practice, reading curriculum guides, and working with teachers!</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {BADGES.map((b) => {
              const hasBadge = progress.badges.includes(b.id);

              return (
                <div
                  key={b.id}
                  id={`badge-card-${b.id}`}
                  className={`p-4 rounded-2xl border transition-all flex items-start gap-4 ${
                    hasBadge
                      ? "bg-blue-50/45 border-blue-300 shadow-sm"
                      : "bg-white border-slate-200 opacity-50"
                  }`}
                >
                  <div className={`p-3 rounded-xl border ${
                    hasBadge
                      ? "bg-blue-50 border-blue-200 text-blue-700"
                      : "bg-slate-100 border-transparent text-slate-300"
                  }`}>
                    <Award className="w-6 h-6" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-sm text-gray-800 leading-none">{b.title}</h4>
                      <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded ${
                        b.rarity === "Legendary"
                          ? "bg-amber-100 text-amber-800"
                          : b.rarity === "Epic"
                          ? "bg-purple-100 text-purple-800"
                          : b.rarity === "Rare"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }`}>
                        {b.rarity}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">{b.description}</p>
                    <span className="text-[10px] font-bold block mt-1">
                      {hasBadge ? "✔ Achieved" : "🔒 Locked Campaign"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === "buddies" && (
        <div className="space-y-6 animate-fadeIn">
          {/* Top Bento Cards Header */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Bento Card 1: Study Community Summary */}
            <div className="md:col-span-4 bg-gradient-to-br from-blue-900 to-indigo-950 text-white rounded-2xl p-6 border border-slate-800 shadow-md relative overflow-hidden flex flex-col justify-between min-h-[180px]">
              <div className="absolute right-0 top-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>
              <div>
                <span className="text-[10px] font-extrabold text-blue-300 tracking-wider uppercase bg-blue-950/85 px-2.5 py-1 rounded border border-blue-800/80 font-mono">
                  Collective Hall Status
                </span>
                <h4 className="text-lg font-black tracking-tight mt-2.5 font-display">
                  Classroom Study Hall
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed max-w-xs mt-1.5 font-sans">
                  You are studying alongside <span className="text-blue-300 font-bold">5 active classmates</span>. Together, you constitute the "Candidate Apex" preparation squad.
                </p>
              </div>

              <div className="flex gap-4 pt-3 border-t border-slate-800/60 mt-3 text-xs font-mono text-slate-300">
                <div className="flex items-center gap-1">
                  <Flame className="w-4 h-4 text-orange-400 fill-orange-400" />
                  <span>Streak: 28 Days Combined</span>
                </div>
                <div className="flex items-center gap-1">
                  <Trophy className="w-4 h-4 text-yellow-400" />
                  <span>Leader Board: Tier 1</span>
                </div>
              </div>
            </div>

            {/* Bento Card 2: Your Public Status Update Bubble */}
            <div className="md:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-extrabold text-slate-400 tracking-wider uppercase block font-mono">
                      Broadcast Hub
                    </span>
                    <h4 className="text-base font-black text-slate-900 mt-0.5 font-display">
                      Your Public Learning Broadcast
                    </h4>
                  </div>
                  <span className="text-[10px] text-emerald-600 bg-emerald-50 border border-emerald-100 font-bold px-2 py-0.5 rounded-full uppercase flex items-center gap-1 font-mono">
                     <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                     Publicly Visible
                  </span>
                </div>

                <div className="mt-3.5 bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-600 border border-blue-200 flex items-center justify-center text-white shrink-0 font-black text-xs font-display">
                    AM
                  </div>
                  <div className="space-y-1 flex-1">
                    <span className="font-extrabold text-xs text-slate-800 block">Alex Mercer (You)</span>
                    {isUpdatingStatus ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newStatusInput}
                          onChange={(e) => setNewStatusInput(e.target.value)}
                          placeholder="e.g. Grinding Biology Paper 1 questions!"
                          className="flex-1 text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-blue-600 animate-fadeIn"
                        />
                        <button
                          onClick={() => {
                            if (newStatusInput.trim()) {
                              setMyBroadcastStatus(newStatusInput.trim());
                              if (onAddLogMessage) {
                                onAddLogMessage(`Alex Mercer updated public study broadcast to: "${newStatusInput.trim()}"`);
                              }
                            }
                            setIsUpdatingStatus(false);
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold px-3 py-1 rounded-lg transition"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setIsUpdatingStatus(false)}
                          className="text-slate-400 hover:text-slate-600 text-[10px] font-bold px-1.5 py-1 rounded-lg"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-600 leading-relaxed italic font-medium">
                        "{myBroadcastStatus}"
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Status Preset Tags */}
              <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-slate-100">
                <span className="text-[10px] font-extrabold text-slate-400 tracking-wider uppercase font-mono mr-1">
                  Preset Shorthand:
                </span>
                {[
                  "🧪 Grinding Past Papers",
                  "📐 Solving quadratics",
                  "💡 Chatting with AI Tutor",
                  "📝 Doing Alternative to Practicals"
                ].map((p, idx) => (
                  <button
                    key={idx}
                    disabled={isUpdatingStatus}
                    onClick={() => {
                      setMyBroadcastStatus(p);
                      if (onAddLogMessage) {
                        onAddLogMessage(`Alex Mercer updated study broadcast shorthand: "${p}"`);
                      }
                    }}
                    className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1 rounded-xl transition font-medium border border-slate-200/50 cursor-pointer"
                  >
                    {p}
                  </button>
                ))}
                {!isUpdatingStatus && (
                  <button
                    onClick={() => {
                      setNewStatusInput(myBroadcastStatus);
                      setIsUpdatingStatus(true);
                    }}
                    className="text-[11px] text-blue-600 hover:text-blue-800 underline font-bold px-2 py-1"
                  >
                    Custom Status...
                  </button>
                )}
              </div>
            </div>

          </div>

          {/* Roster & Search Toolbar */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="relative w-full sm:w-72">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </span>
              <input
                type="text"
                value={buddySearchQuery}
                onChange={(e) => setBuddySearchQuery(e.target.value)}
                placeholder="Search classmate name or topic..."
                className="w-full text-xs bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block font-mono whitespace-nowrap">
                Filter:
              </span>
              {[
                { label: "All Buddies", value: "All" },
                { label: "High Hot Streaks", value: "Streak" },
                { label: "Top Achiever Levels", value: "HighLevel" },
                { label: "Active Today", value: "Active" }
              ].map((f) => (
                <button
                  key={f.value}
                  onClick={() => setBuddyFilter(f.value as any)}
                  className={`text-xs px-3.5 py-1.5 rounded-xl border font-bold transition duration-150 cursor-pointer whitespace-nowrap ${
                    buddyFilter === f.value
                      ? "bg-slate-900 border-slate-900 text-white"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Main Content Layout: Classmates Bento Grid list + Sidebar Leaderboard */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Hand: Classmates list (spanning 8 cols) */}
            <div className="lg:col-span-8 space-y-4 animate-fadeIn">
              {buddies
                .filter(b => {
                  const matchSearch = b.name.toLowerCase().includes(buddySearchQuery.toLowerCase()) ||
                                      b.statusText.toLowerCase().includes(buddySearchQuery.toLowerCase()) ||
                                      b.subjectFocus.toLowerCase().includes(buddySearchQuery.toLowerCase());
                  if (buddyFilter === "All") return matchSearch;
                  if (buddyFilter === "Streak") return matchSearch && b.streakDays > 5;
                  if (buddyFilter === "HighLevel") return matchSearch && b.level >= 4;
                  if (buddyFilter === "Active") return matchSearch && !b.lastActive.includes("day");
                  return matchSearch;
                })
                .map((b) => (
                  <div
                    key={b.id}
                    className="bg-white border border-slate-200 hover:border-slate-300 transition duration-200 rounded-2xl p-5 shadow-sm space-y-4"
                  >
                    {/* Header buddy identity */}
                    <div className="flex gap-4 items-start justify-between">
                      <div className="flex gap-3 items-center">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-blue-500 flex items-center justify-center text-white font-black text-sm relative shadow-sm">
                          {b.name.split(" ").map(n => n[0]).join("")}
                          
                          {/* Live active ring signal */}
                          {!b.lastActive.includes("day") && (
                            <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white animate-pulse"></span>
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-extrabold text-sm text-slate-900">{b.name}</h4>
                            <span className="text-[9px] bg-slate-150 text-slate-600 border border-slate-200 font-extrabold px-1.5 py-0.5 rounded font-mono">
                              Level {b.level}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium font-sans">
                            <span>Focus: {b.subjectFocus}</span>
                            <span>•</span>
                            <span>{b.lastActive}</span>
                          </div>
                        </div>
                      </div>

                      {/* Hot streak badge */}
                      {b.streakDays > 0 ? (
                        <div className="flex items-center gap-1 bg-amber-50 text-amber-700 font-bold text-[10px] px-2.5 py-1 rounded-xl border border-amber-100 shrink-0 font-sans">
                          <Flame className="w-3.5 h-3.5 fill-current text-amber-500" />
                          <span>{b.streakDays}d Streak</span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-300 font-mono italic">Offline study</span>
                      )}
                    </div>

                    {/* Status Quote */}
                    <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-3 text-xs text-slate-600 italic font-mono flex gap-2 items-center">
                      <div className="bg-blue-600/10 p-1 rounded shrink-0">
                        <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
                      </div>
                      <span className="leading-relaxed">"{b.statusText}"</span>
                    </div>

                    {/* Badges and Stats Progress Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      
                      {/* XP mini bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-baseline text-[10px] font-bold text-slate-400 font-mono uppercase">
                          <span>Revision XP Track</span>
                          <span>{b.xp} / {b.xpNeeded} XP</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-indigo-600 h-full rounded-full"
                            style={{ width: `${(b.xp / b.xpNeeded) * 100}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Publicly earned badges */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-extrabold text-slate-400 tracking-wider uppercase block font-mono">
                          Public Badges Earned
                        </span>
                        
                        <div className="flex gap-1.5 flex-wrap">
                          {b.badges.map((bId) => {
                            const badgeData = BADGES.find(item => item.id === bId);
                            if (!badgeData) return null;
                            const IconComponent = BUDDY_ICON_MAP[badgeData.iconName] || Award;

                            return (
                              <div
                                key={bId}
                                title={`${badgeData.title}: ${badgeData.description} (${badgeData.rarity})`}
                                className="flex items-center gap-1 bg-blue-50/60 border border-blue-200/80 rounded-xl px-2 py-0.5 text-[10px] font-bold text-blue-700 hover:bg-blue-100 cursor-help transition"
                              >
                                <IconComponent className="w-3 h-3 text-blue-600 shrink-0" />
                                <span>{badgeData.title}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                    </div>

                    {/* Actions tray */}
                    <div className="flex justify-between items-center pt-3 border-t border-slate-100 text-xs">
                      <button
                        onClick={() => {
                          const updated = buddies.map(item => {
                            if (item.id === b.id) {
                              const newCheered = !item.cheeredByMe;
                              const newCheers = newCheered ? item.cheers + 1 : item.cheers - 1;
                              
                              if (onAddLogMessage) {
                                if (newCheered) {
                                  onAddLogMessage(`Alex Mercer cheered and celebrated studies on ${b.name}'s profile!`);
                                } else {
                                  onAddLogMessage(`Alex Mercer recalled study celebration for ${b.name}`);
                                }
                              }
                              return { ...item, cheeredByMe: newCheered, cheers: newCheers };
                            }
                            return item;
                          });
                          setBuddies(updated);
                        }}
                        className={`flex items-center gap-2 font-bold px-3 py-1.5 rounded-xl border transition cursor-pointer ${
                          b.cheeredByMe
                            ? "bg-rose-50 border-rose-300 text-rose-700"
                            : "bg-white border-slate-200 text-slate-500 hover:bg-rose-50/40 hover:border-rose-250 hover:text-rose-600"
                        }`}
                      >
                        <Heart className={`w-3.5 h-3.5 transition-all ${b.cheeredByMe ? "fill-rose-500 stroke-rose-600 scale-125 animate-pulse" : ""}`} />
                        <span>{b.cheers} Cheers</span>
                      </button>

                      <button
                        onClick={() => setSelectedCompareBuddy(b)}
                        className="flex items-center gap-1 text-slate-600 hover:text-blue-700 bg-slate-50 hover:bg-blue-50 px-3 py-1.5 rounded-xl font-bold transition border border-slate-200 cursor-pointer"
                      >
                        <Share2 className="w-3.5 h-3.5 text-slate-450 text-slate-400" />
                        Compare Milestones
                      </button>
                    </div>

                  </div>
                ))}
            </div>

            {/* Right Hand: Leaderboard bento widget (spanning 4 cols) */}
            <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
              <div>
                <span className="text-[10px] font-extrabold text-blue-600 tracking-wider uppercase bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded font-mono">
                  Weekly Podium
                </span>
                <h4 className="text-base font-black text-slate-900 tracking-tight mt-2 font-display">
                  Study Hall Leaderboard
                </h4>
                <p className="text-xs text-slate-400 leading-normal mt-0.5 font-medium">
                  Ranks configured by experience points earned across standard quizzes.
                </p>
              </div>

              {/* Ranks list */}
              <div className="space-y-2.5">
                {[
                  { name: "Priya Sharma", level: 3, xp: 945, isYou: false, rank: 1, avatar: "PS" },
                  { name: "Chloe Tan", level: 4, xp: 850, isYou: false, rank: 2, avatar: "CT" },
                  { name: "Alex Mercer (You)", level: progress.level, xp: progress.xp, isYou: true, rank: 3, avatar: "AM" },
                  { name: "Marcus Vance", level: 5, xp: 120, isYou: false, rank: 4, avatar: "MV" },
                  { name: "Amina Diallo", level: 4, xp: 310, isYou: false, rank: 5, avatar: "AD" },
                  { name: "Zackary Chen", level: 2, xp: 450, isYou: false, rank: 6, avatar: "ZC" },
                ]
                  // Sort leaderboard dynamically!
                  .sort((x, y) => {
                    const totalScoreX = x.level * 1000 + x.xp;
                    const totalScoreY = y.level * 1005 + y.xp;
                    return totalScoreY - totalScoreX;
                  })
                  .map((row, idx) => {
                    const dynamicRank = idx + 1;
                    return (
                      <div
                        key={row.name}
                        className={`flex items-center justify-between p-3 rounded-xl border transition ${
                          row.isYou
                            ? "bg-blue-50/65 border-blue-300 ring-1 ring-blue-200"
                            : "bg-slate-50/45 border-slate-200/60"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          {/* Rank indicator badge */}
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center font-extrabold text-[10px] font-mono shrink-0 ${
                            dynamicRank === 1
                              ? "bg-amber-50 text-amber-800 border border-amber-300 animate-pulse"
                              : dynamicRank === 2
                              ? "bg-slate-200 text-slate-800 border border-slate-300"
                              : dynamicRank === 3
                              ? "bg-amber-100 text-amber-800 border border-amber-300"
                              : "bg-slate-100 text-slate-500"
                          }`}>
                            {dynamicRank}
                          </span>

                          <div className="w-7 h-7 rounded-full bg-slate-900 flex items-center justify-center text-white shrink-0 font-bold text-[10px] font-display">
                            {row.avatar}
                          </div>

                          <div className="space-y-0.5">
                            <span className={`text-[12px] block leading-none font-sans ${row.isYou ? "font-black text-slate-900" : "font-semibold text-slate-700"}`}>
                              {row.name}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium font-mono">
                              Level {row.level} • {row.xp} XP
                            </span>
                          </div>
                        </div>

                        {/* Rank award visual if top 3 */}
                        {dynamicRank <= 3 && (
                          <Trophy className={`w-4 h-4 shrink-0 ${
                            dynamicRank === 1
                              ? "text-yellow-500 fill-yellow-500"
                              : dynamicRank === 2
                              ? "text-slate-450 fill-slate-300 text-slate-400"
                              : "text-amber-600 fill-amber-500"
                          }`} />
                        )}
                      </div>
                    );
                  })}
              </div>

              {/* Class challenge panel */}
              <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-150 text-indigo-950 flex gap-2.5 text-xs">
                <Sparkles className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-extrabold font-display">Next Class Group Target</h5>
                  <p className="mt-1 leading-normal font-sans opacity-90 text-[11px]">
                    To unlock the "Synergetic Scholars" class incentive, all candidates must secure at least level 4 before the CAIE final Chemistry mocks! Ask buddies for help.
                  </p>
                </div>
              </div>

            </div>

          </div>

          {/* SIDE-BY-SIDE COMPARE DIALOG OVERLAY */}
          {selectedCompareBuddy && (
            <div className="fixed inset-0 bg-slate-900/65 flex items-center justify-center p-4 z-50 animate-fadeIn backdrop-blur-xs">
              <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full shadow-2xl p-6 relative animate-zoomIn space-y-5">
                
                {/* Header card */}
                <div className="flex justify-between items-start pb-4 border-b border-slate-105">
                  <div>
                    <span className="text-[10px] text-blue-600 font-extrabold uppercase tracking-widest block font-mono">
                      Milestone Comparison Sheet
                    </span>
                    <h3 className="text-lg font-black text-slate-900 tracking-tight mt-1 font-display">
                      Let's compare: Alex Mercer vs {selectedCompareBuddy.name}
                    </h3>
                  </div>

                  <button
                    onClick={() => setSelectedCompareBuddy(null)}
                    className="text-slate-400 hover:text-slate-600 font-bold text-sm p-1.5 focus:outline-none cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                {/* Compare Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Left Column: Alex (You) */}
                  <div className="bg-blue-50/30 border border-blue-200 rounded-xl p-4 space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-blue-100">
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-black text-xs font-display">
                        AM
                      </div>
                      <div>
                        <span className="text-xs font-black text-slate-900 block">Alex Mercer (You)</span>
                        <span className="text-[10px] text-slate-500 font-mono">Current Candidate</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500 font-medium">Rank Level:</span>
                        <span className="font-bold text-slate-800">Level {progress.level}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500 font-medium">Active Streak:</span>
                        <span className="font-bold text-orange-600">{progress.streakDays} Days</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500 font-medium">Active Badges:</span>
                        <span className="font-extrabold text-blue-700">{progress.badges.length} Items</span>
                      </div>
                    </div>

                    {/* Badge collection list */}
                    <div className="space-y-1 pt-1">
                      <span className="text-[9px] font-extrabold tracking-wider text-slate-450 uppercase block font-mono">Your Badges:</span>
                      <div className="flex gap-1 flex-wrap">
                        {progress.badges.map(bId => {
                          const hasBadge = BADGES.find(item => item.id === bId);
                          if (!hasBadge) return null;
                          return (
                            <span key={bId} className="text-[10px] bg-white text-slate-705 text-slate-700 border border-slate-200/80 font-bold px-1.5 py-0.5 rounded">
                              {hasBadge.title}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Buddy */}
                  <div className="bg-indigo-50/30 border border-indigo-200 rounded-xl p-4 space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-indigo-100">
                      <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-black text-xs font-display">
                        {selectedCompareBuddy.name.split(" ").map((n:any) => n[0]).join("")}
                      </div>
                      <div>
                        <span className="text-xs font-black text-slate-900 block">{selectedCompareBuddy.name}</span>
                        <span className="text-[10px] text-slate-500 font-mono">Study Buddy</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500 font-medium">Rank Level:</span>
                        <span className="font-bold text-slate-800">Level {selectedCompareBuddy.level}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500 font-medium">Active Streak:</span>
                        <span className="font-bold text-orange-600">{selectedCompareBuddy.streakDays} Days</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500 font-medium">Active Badges:</span>
                        <span className="font-extrabold text-indigo-700">{selectedCompareBuddy.badges.length} Items</span>
                      </div>
                    </div>

                    {/* Badge collection list */}
                    <div className="space-y-1 pt-1">
                      <span className="text-[9px] font-extrabold tracking-wider text-slate-450 uppercase block font-mono">Buddy Badges:</span>
                      <div className="flex gap-1 flex-wrap">
                        {selectedCompareBuddy.badges.map((bId:any) => {
                          const hasBadge = BADGES.find(item => item.id === bId);
                          if (!hasBadge) return null;
                          return (
                            <span key={bId} className="text-[10px] bg-white text-slate-705 text-slate-700 border border-slate-200/80 font-bold px-1.5 py-0.5 rounded">
                              {hasBadge.title}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                </div>

                {/* Intelligent Study Advisor Summary */}
                <div className="p-4 bg-emerald-50 border border-emerald-150 rounded-xl flex gap-2.5 leading-relaxed text-xs">
                  <Sparkles className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-extrabold text-emerald-950 font-display text-[13px]">Synergetic Study Suggestion</h5>
                    <p className="text-emerald-900 mt-1 font-medium font-sans">
                      {selectedCompareBuddy.badges.includes("badge-4") && !progress.badges.includes("badge-4") ? (
                        `${selectedCompareBuddy.name} has unlocked the prestigious "Teacher's Favorite" badge! Ask them on the IGCSE Forums how to structure your core question sheets.`
                      ) : progress.badges.includes("badge-2") && !selectedCompareBuddy.badges.includes("badge-2") ? (
                        `You have unlocked the rare "Cambridge Whiz" badge! Share your past-paper secrets with ${selectedCompareBuddy.name} on standard topic checks to help them scale their Level ${selectedCompareBuddy.level} tier.`
                      ) : (
                        `Both of you have a healthy study rivalry! Form a shared revision cell around "${selectedCompareBuddy.subjectFocus}" to practice alternative to practical guide tests.`
                      )}
                    </p>
                  </div>
                </div>

                {/* Footer action */}
                <div className="flex justify-end pt-3 border-t border-slate-100">
                  <button
                    onClick={() => {
                      if (onAddLogMessage) {
                        onAddLogMessage(`Alex Mercer sent a collaborative invitation code to ${selectedCompareBuddy.name} for a shared mock exam session.`);
                      }
                      setSelectedCompareBuddy(null);
                      alert(`🚀 Revision session invitation sent directly to ${selectedCompareBuddy.name}! Live notification logs updated.`);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition cursor-pointer"
                  >
                    Send Private invitation link
                  </button>
                </div>

              </div>
            </div>
          )}

        </div>
      )}

      {activeTab === "assignments" && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-black text-slate-900 font-display">Active Syllabus Homework Assignments</h3>
            <p className="text-xs text-slate-400 mt-1 font-sans">
              Type or draft candidate responses of structured exam worksheets and click "Upload Written Assignment" to log them on the teacher grading portal.
            </p>
          </div>

          {assignments.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400">
              <BookOpen className="w-12 h-12 text-slate-250 mx-auto mb-3 text-slate-400" />
              <p className="font-bold text-sm">No assignments active at the moment.</p>
              <p className="text-xs max-w-xs mx-auto mt-1">Teachers can upload new homework items in the Curriculum Curation Center.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {assignments.map((assignment) => {
                // Find if this student has submitted
                const submission = assignment.submissions?.find(sub => sub.studentId === "student-1");
                const isSubmitted = !!submission;

                const handleUploadAssignmentAnswers = (assignmentId: string) => {
                  if (!onUpdateAssignments) return;
                  
                  const answersForThisAssignment = typedAnswers[assignmentId] || {};
                  
                  // Check if answers are empty
                  if (Object.keys(answersForThisAssignment).length === 0) {
                    alert("Please type structural answers for the homework questions before uploading.");
                    return;
                  }

                  // Create a new submission object
                  const newSubmission = {
                    studentId: "student-1",
                    studentName: "Alex Mercer",
                    submittedAt: new Date().toISOString(),
                    answers: answersForThisAssignment,
                    graded: false,
                    maxScore: assignment.questions.reduce((sum, q) => sum + q.marks, 0),
                  };

                  // Replace or add the student submission inside subclasses
                  const updatedSubmissions = [
                    ...(assignment.submissions?.filter(sub => sub.studentId !== "student-1") || []),
                    newSubmission
                  ];

                  const updatedAssignments = assignments.map(a => {
                    if (a.id === assignmentId) {
                      return {
                        ...a,
                        submissions: updatedSubmissions
                      };
                    }
                    return a;
                  });

                  onUpdateAssignments(updatedAssignments);
                  if (onAddLogMessage) {
                    onAddLogMessage(`✨ Alex Mercer uploaded academic answers for assignment: "${assignment.title}".`);
                  }
                  alert(`🎉 Written answers uploaded successfully to the teacher grading desk! They have been recorded on the system.`);
                };

                return (
                  <div key={assignment.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-3">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] bg-indigo-50 border border-indigo-200 text-indigo-700 font-extrabold px-2.5 py-0.5 rounded font-mono uppercase">
                            {assignment.subjectId.toUpperCase()} Revision
                          </span>
                          <span className="text-[10px] bg-slate-100 text-slate-500 font-mono px-2 py-0.5 rounded">
                            Due: {new Date(assignment.dueDate).toLocaleDateString()}
                          </span>
                        </div>
                        <h4 className="text-base font-black text-slate-900 tracking-tight mt-1.5 font-display">
                          {assignment.title}
                        </h4>
                      </div>

                      <div>
                        {isSubmitted ? (
                          <span className={`text-[10px] font-extrabold px-3 py-1.5 rounded-full border uppercase tracking-wider block text-center ${
                            submission.graded 
                              ? "bg-emerald-50 border-emerald-200 text-emerald-700" 
                              : "bg-amber-50 border-amber-200 text-amber-700"
                          }`}>
                            {submission.graded 
                              ? `Graded: ${submission.score} / ${submission.maxScore} marks` 
                              : "Uploaded - Awaiting Grading"}
                          </span>
                        ) : (
                          <span className="bg-rose-50 border border-rose-200 text-rose-700 text-[10px] font-extrabold px-3 py-1.5 rounded-full uppercase tracking-wider block text-center">
                            Not Started / Pending
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Question items */}
                    <div className="space-y-5">
                      {assignment.questions.map((q, idx) => {
                        const savedAns = submission?.answers?.[q.id];
                        const tempAns = typedAnswers[assignment.id]?.[q.id] || "";

                        return (
                          <div key={q.id} className="bg-slate-50/45 border border-slate-150 p-4 rounded-xl space-y-3">
                            <div className="flex justify-between items-start gap-3">
                              <span className="font-extrabold text-[11px] text-slate-400 font-mono">
                                QUESTION {idx + 1}
                              </span>
                              <span className="font-bold text-[10px] text-blue-700 font-mono">
                                ({q.marks} Marks)
                              </span>
                            </div>

                            <p className="text-xs font-semibold text-slate-800 leading-normal">{q.questionText}</p>

                            {isSubmitted ? (
                              <div className="space-y-2.5 pt-1">
                                <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 block font-mono">Your uploaded response</span>
                                <p className="text-xs bg-white border border-slate-200 rounded-lg p-3 text-slate-700 font-sans italic">
                                  {savedAns || "No answer submitted."}
                                </p>

                                {submission.graded && (
                                  <div className="bg-emerald-500/10 border border-emerald-200 rounded-xl p-4.5 space-y-2 animate-fadeIn">
                                    <div className="flex justify-between items-center text-emerald-800 border-b border-emerald-100 pb-1.5">
                                      <span className="text-[10px] uppercase font-black tracking-widest font-mono">Official feedback notes</span>
                                      <span className="text-[11px] font-bold">Feedback Marks awarded</span>
                                    </div>
                                    <p className="text-xs text-emerald-950 font-sans italic leading-relaxed">
                                      "{submission.teacherFeedback || "Excellent alignment with past paper mark scheme command keys."}"
                                    </p>
                                    <div className="text-[10px] text-slate-500 font-mono">
                                      Graded on: {submission.gradedAt ? new Date(submission.gradedAt).toLocaleDateString() : "Present"}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="space-y-2 pt-1">
                                <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 block font-mono">Compose Answer</span>
                                <textarea
                                  rows={3}
                                  placeholder="Type your detailed written response, mentioning key definitions..."
                                  value={tempAns}
                                  onChange={(e) => {
                                    const currentTyped = typedAnswers[assignment.id] || {};
                                    setTypedAnswers(prev => ({
                                      ...prev,
                                      [assignment.id]: {
                                        ...currentTyped,
                                        [q.id]: e.target.value
                                      }
                                    }));
                                  }}
                                  className="w-full text-xs bg-white border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans leading-relaxed text-slate-800"
                                />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Submit Assignment Buttons */}
                    {!isSubmitted && (
                      <div className="flex justify-end pt-2 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => handleUploadAssignmentAnswers(assignment.id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl transition duration-150 cursor-pointer shadow-sm"
                        >
                          Upload Written Assignment
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
