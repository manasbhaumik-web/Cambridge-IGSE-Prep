import React, { useState } from "react";
import { ResourceItem, Subject, Difficulty, StudentProgress } from "../types";
import { SUBJECTS, STUDY_MATERIALS } from "../mockData";
import { BookOpen, Search, Filter, HelpCircle, Tag, Sparkles, Download, Clock, Eye, X, Globe } from "lucide-react";
import ModuleQuiz from "./ModuleQuiz";

interface StudyLibraryProps {
  onAddBadge?: (badgeId: string) => void;
  progress?: StudentProgress;
  onUpdateProgress?: (progress: StudentProgress) => void;
  onAddLogMessage?: (msg: string) => void;
  onNavigateToDashboard?: () => void;
  subjects?: Subject[];
  studyMaterials?: ResourceItem[];
  onAddStudyMaterial?: (newMaterial: ResourceItem) => void;
}

// Generates an incredibly authentic simulated Cambridge PDF document within the iframe preview with antique keyword highlighting.
const generatePreviewHtml = (material: ResourceItem, highlightKeyword: string = "") => {
  const highlightWordInText = (text: string, keyword: string) => {
    if (!keyword || !keyword.trim()) return text;
    // Replace special regex characters safely
    const escaped = keyword.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`(${escaped})`, 'gi');
    return text.replace(regex, `<mark class="gothic-highlight">$1</mark>`);
  };

  const renderedParagraphs = material.content
    .split("\n")
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .map(paragraph => {
      const highlightedText = highlightWordInText(paragraph, highlightKeyword);
      return `<p>${highlightedText}</p>`;
    })
    .join("");

  const highlightedTitle = highlightWordInText(material.title, highlightKeyword);

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <title>Cambridge Assessment Syllabus Resource Preview</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@600;700;800&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
          
          body {
            font-family: 'Inter', system-ui, -apple-system, sans-serif;
            color: #122c4d;
            background-color: #f2faf9;
            padding: 45px;
            margin: 0;
            line-height: 1.6;
            -webkit-font-smoothing: antialiased;
          }

          .paper-outline {
            border: 1px solid rgba(163, 193, 173, 0.4);
            padding: 40px;
            background: #ffffff;
            box-shadow: 0 4px 30px rgba(0, 0, 0, 0.01);
            position: relative;
            min-height: 80vh;
            border-radius: 8px;
          }

          .watermark {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-35deg);
            font-family: 'Outfit', serif;
            font-size: 64px;
            font-weight: 800;
            color: rgba(10, 77, 64, 0.02);
            pointer-events: none;
            white-space: nowrap;
            user-select: none;
            z-index: 1;
            letter-spacing: 6px;
          }

          .paper-header {
            border-bottom: 3px double #a3c1ad;
            padding-bottom: 20px;
            margin-bottom: 35px;
            text-align: center;
            position: relative;
            z-index: 10;
          }

          .crest {
            font-family: 'Outfit', sans-serif;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 5px;
            text-transform: uppercase;
            color: #0a4d40;
            margin-bottom: 8px;
          }

          .syllabus-title {
            font-family: 'Outfit', sans-serif;
            font-size: 24px;
            color: #073b31;
            margin: 12px 0;
            font-weight: 700;
            letter-spacing: 0.5px;
            line-height: 1.2;
          }

          .meta-grid {
            display: grid;
            grid-template-cols: 1fr 1fr;
            font-size: 11px;
            font-family: 'JetBrains Mono', monospace;
            color: #548f76;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            margin-top: 18px;
            border-top: 1px dashed rgba(163, 193, 173, 0.3);
            padding-top: 12px;
          }

          .content-box {
            position: relative;
            z-index: 10;
            font-size: 16px;
            color: #122c4d;
            text-align: justify;
            text-justify: inter-word;
          }

          .content-box p {
            margin-top: 0;
            margin-bottom: 22px;
            text-indent: 1.5em;
          }

          .content-box p:first-of-type {
            text-indent: 0;
          }

          .footer-line {
            position: relative;
            z-index: 10;
            margin-top: 60px;
            border-top: 1px solid rgba(163, 193, 173, 0.2);
            padding-top: 15px;
            font-size: 11px;
            font-family: 'JetBrains Mono', monospace;
            color: #548f76;
            display: flex;
            justify-content: space-between;
          }

          .badge-gold {
            border: 1px solid #a3c1ad;
            color: #0d2240;
            padding: 3px 10px;
            font-size: 9px;
            font-weight: bold;
            border-radius: 4px;
            text-transform: uppercase;
            font-family: 'JetBrains Mono', monospace;
            display: inline-block;
            margin-top: 6px;
            letter-spacing: 1px;
            background-color: rgba(163, 193, 173, 0.15);
          }

          /* Clear Yellow Highlight match background as requested */
          .gothic-highlight {
            background-color: #fef08a;
            color: #1c1917;
            padding: 1px 4px;
            font-weight: bold;
            border-radius: 3px;
            box-shadow: 0 0 10px rgba(254, 240, 138, 0.82);
            border-bottom: 2px solid #eab308;
            transition: all 0.3s ease;
          }
        </style>
      </head>
      <body>
        <div class="watermark">OFFICIAL COPIER</div>
        <div class="paper-outline">
          <div class="paper-header">
            <div class="crest">CAMBRIDGE ASSESSMENT INT PREPARATION</div>
            <div class="syllabus-title">${highlightedTitle}</div>
            <div class="badge-gold">${material.resourceType} • LEVEL: ${material.difficulty}</div>
            <div class="meta-grid">
              <div>Syllabus Ref: ${material.syllabusCode} / ${material.topicId}</div>
              <div style="text-align: right;">Academic Year: ${material.year || "2026"}</div>
            </div>
          </div>
          <div class="content-box">
            ${renderedParagraphs}
          </div>
          <div class="footer-line">
            <div>© Cambridge Assessment International Education 2026</div>
            <div>STATUS: GRANTED PREVIEW</div>
          </div>
        </div>
      </body>
    </html>
  `;
};

export default function StudyLibrary({
  onAddBadge,
  progress,
  onUpdateProgress,
  onAddLogMessage,
  onNavigateToDashboard,
  subjects = SUBJECTS,
  studyMaterials = STUDY_MATERIALS,
  onAddStudyMaterial
}: StudyLibraryProps) {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("bio");
  const [leftSidebarTab, setLeftSidebarTab] = useState<"local" | "online">("local");
  const [selectedGrade, setSelectedGrade] = useState<number>(7);
  const [onlineSubject, setOnlineSubject] = useState<string>("Biology");
  const [onlineTopicKeyword, setOnlineTopicKeyword] = useState<string>("");
  const [isDownloadingMaterial, setIsDownloadingMaterial] = useState<boolean>(false);
  const [lastDownloadedMaterial, setLastDownloadedMaterial] = useState<ResourceItem | null>(null);
  const [downloadSuccessMsg, setDownloadSuccessMsg] = useState<string>("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("All");
  const [selectedType, setSelectedType] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeMaterial, setActiveMaterial] = useState<ResourceItem | null>(studyMaterials[0] || null);
  
  // Quick Look overlay modal state for instant student glancing
  const [quickLookMaterial, setQuickLookMaterial] = useState<ResourceItem | null>(null);
  const [highlightQuery, setHighlightQuery] = useState<string>("");

  // AI Reading Assistance States
  const [viewMode, setViewMode] = useState<"document" | "ai-assist">("document");
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);
  const [studentAnswers, setStudentAnswers] = useState<{[key: string]: string}>({});
  const [submittedQuestions, setSubmittedQuestions] = useState<{[key: string]: boolean}>({});
  const [selfGrades, setSelfGrades] = useState<{[key: string]: boolean[]}>({});

  const handleOpenQuickLook = (material: ResourceItem) => {
    setQuickLookMaterial(material);
    setHighlightQuery(searchQuery);
  };

  const handleSelectMaterial = (material: ResourceItem) => {
    setActiveMaterial(material);
    setViewMode("document");
    setAnalysisResult(null);
    setStudentAnswers({});
    setSubmittedQuestions({});
    setSelfGrades({});
    if (onAddBadge) {
      // Award "Syllabus Novice" badge on reading study guides as mandated
      onAddBadge("badge-1");
    }
  };

  const filteredMaterials = studyMaterials.filter((item) => {
    const matchesSubject = item.subjectId === selectedSubjectId;
    const matchesDifficulty = selectedDifficulty === "All" || item.difficulty === selectedDifficulty;
    const matchesType = selectedType === "All" || item.resourceType === selectedType;

    const query = searchQuery.toLowerCase();
    const matchesSearch =
      query === "" ||
      item.title.toLowerCase().includes(query) ||
      item.content.toLowerCase().includes(query) ||
      item.tags.some(t => t.toLowerCase().includes(query));

    return matchesSubject && matchesDifficulty && matchesType && matchesSearch;
  });

  const subject = subjects.find(s => s.id === selectedSubjectId);

  const resourceTypes = ["All", "Notes", "Worksheet", "Revision Guide", "Flash Cards", "Practical Guide", "Formula Sheet"];

  const handleRequestReadingAssistance = async () => {
    if (!activeMaterial) return;
    setIsAnalyzing(true);
    setAnalysisResult(null);
    setStudentAnswers({});
    setSubmittedQuestions({});
    setSelfGrades({});

    try {
      const response = await fetch("/api/ai/reading-assistance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: activeMaterial.content, numQuestions: 3 }),
      });

      if (!response.ok) {
        throw new Error("Assistant model service did not react properly.");
      }

      const result = await response.json();
      setAnalysisResult(result);
      if (onAddLogMessage) {
        onAddLogMessage(`✨ Reading Assistant analyzed: "${activeMaterial.title}" identifying crucial exam definitions.`);
      }
    } catch (err: any) {
      console.error(err);
      alert("Host response offline or missing connection: " + err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAnswerSubmit = (qId: string) => {
    setSubmittedQuestions(prev => ({ ...prev, [qId]: true }));
    if (onAddLogMessage) {
      onAddLogMessage(`Student submitted open response for Cambridge marking evaluation.`);
    }
  };

  const handleSaveMarksEarned = (questionText: string, marksEarned: number) => {
    if (progress && onUpdateProgress) {
      const addedXp = marksEarned * 30;
      const newXp = progress.xp + addedXp;
      const levelUp = newXp >= progress.xpNeededForNextLevel;
      const updatedProg: StudentProgress = {
        ...progress,
        xp: levelUp ? newXp - progress.xpNeededForNextLevel : newXp,
        level: levelUp ? progress.level + 1 : progress.level,
        xpNeededForNextLevel: levelUp ? progress.xpNeededForNextLevel + 250 : progress.xpNeededForNextLevel
      };
      onUpdateProgress(updatedProg);
      if (onAddLogMessage) {
        onAddLogMessage(`✨ XP upgraded! Added ${addedXp} XP to Mercer overall progress.`);
      }
      if (levelUp) {
        alert(`🎉 LEVEL UP! You reached Level ${progress.level + 1}! Nice structural answer scores!`);
      } else {
        alert(`Awesome job! Marked ${marksEarned} marks correctly, boosting your revision stats by ${addedXp} XP!`);
      }
    } else {
      alert(`Well done! You scored ${marksEarned} marks according to the official CAIE checklist.`);
    }
  };

  return (
    <div id="library-root" className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">
      {/* Subject tabs and Search */}
      <div className="lg:col-span-12 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight font-display">IGCSE Syllabus Resource Library</h2>
            <p className="text-xs text-slate-400 mt-1 font-medium">Official high-quality revision notes, command term explanations, and laboratory practical manuals.</p>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:flex-initial">
              <Search className="absolute left-3 top-2.5 w-4.5 h-4.5 text-slate-400" />
              <input
                id="library-search-input"
                type="text"
                placeholder="Search resources, topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full md:w-64 bg-slate-50 text-xs pl-9 pr-4 py-2 border border-slate-100 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 font-sans"
              />
            </div>
          </div>
        </div>

        {/* Brand Tabs */}
        <div className="flex flex-wrap items-center gap-2 mt-6 border-b border-slate-100 pb-4">
          {subjects.map((sub) => (
            <button
              key={sub.id}
              id={`tab-subject-${sub.id}`}
              onClick={() => {
                setSelectedSubjectId(sub.id);
                const firstSubMat = studyMaterials.find(m => m.subjectId === sub.id) || null;
                setActiveMaterial(firstSubMat);
                setViewMode("document");
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                selectedSubjectId === sub.id
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-600/10 scale-102"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <span>{sub.name}</span>
              <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-md font-mono">{sub.syllabusCode}</span>
            </button>
          ))}
        </div>

        {/* Secondary filters */}
        <div className="flex flex-wrap items-center gap-4 mt-4 text-xs font-semibold text-slate-500">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Difficulty:</span>
            <select
              id="library-difficulty-selector"
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg p-1 text-xs font-bold focus:outline-none"
            >
              <option value="All">All Levels</option>
              {Object.values(Difficulty).map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span>Type:</span>
            <select
              id="library-type-selector"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg p-1 text-xs font-bold focus:outline-none"
            >
              {resourceTypes.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main browse grid */}
      <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-4 shadow-sm h-[560px] overflow-y-auto">
        
        {/* Left column navigation switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold font-sans mb-4">
          <button
            type="button"
            onClick={() => setLeftSidebarTab("local")}
            className={`flex-1 py-1.5 rounded-lg cursor-pointer transition text-center ${leftSidebarTab === "local" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"}`}
          >
            Syllabus Guides
          </button>
          <button
            type="button"
            onClick={() => setLeftSidebarTab("online")}
            className={`flex-1 py-1.5 rounded-lg cursor-pointer transition text-center flex items-center justify-center gap-1 ${leftSidebarTab === "online" ? "bg-blue-600 text-white shadow-xs" : "text-slate-500 hover:text-slate-800"}`}
          >
            <Globe className="w-3.5 h-3.5" />
            Online Curator (G1-11)
          </button>
        </div>

        {leftSidebarTab === "local" ? (
          <>
            <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-400 mb-4 px-2 font-display">
              {subject?.name} Guides ({filteredMaterials.length})
            </h3>

            <div className="space-y-2">
              {filteredMaterials.length === 0 ? (
                <div className="p-6 text-center text-slate-400">
                  <BookOpen className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                  <p className="text-sm">No materials matching filters.</p>
                </div>
              ) : (
                filteredMaterials.map((mat) => (
                  <div
                    key={mat.id}
                    id={`btn-mat-${mat.id}`}
                    onClick={() => handleSelectMaterial(mat)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer block group ${
                      activeMaterial?.id === mat.id
                        ? "bg-blue-50/60 border-blue-300 shadow-xs"
                        : "bg-white border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 justify-between">
                      <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider ${
                        mat.difficulty === Difficulty.HARD || mat.difficulty === Difficulty.EXAMINER_CHALLENGE
                          ? "bg-red-50 text-red-700"
                          : mat.difficulty === Difficulty.MEDIUM
                          ? "bg-amber-50 text-amber-700"
                          : "bg-blue-50 text-blue-700"
                      }`}>
                        {mat.difficulty}
                      </span>
                      
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-slate-400">{mat.resourceType}</span>
                        <button
                          id={`btn-quu-${mat.id}`}
                          title="Quick Look"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenQuickLook(mat);
                          }}
                          className="p-1 rounded text-slate-400 hover:text-blue-700 hover:bg-slate-100 transition cursor-pointer md:opacity-50 group-hover:opacity-100"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <h4 className="font-bold text-sm text-slate-800 mt-2 leading-tight tracking-tight hover:text-blue-700 transition font-sans">
                      {mat.title}
                    </h4>
                    <div className="flex flex-wrap items-center gap-1.5 mt-3">
                      {mat.tags.map((tag, idx) => (
                        <span key={idx} className="bg-slate-100 text-slate-500 text-[10px] px-1.5 py-0.5 rounded border border-slate-200/50">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        ) : (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-600 space-y-1">
              <span className="text-[10px] uppercase font-mono font-black text-blue-700 block">
                Grade 1 to Grade 11 Resource Hub
              </span>
              <p className="text-[11px] leading-snug">
                Select key criteria to retrieve syllabus-approved material curated from online educational databases.
              </p>
            </div>

            {/* Grade Selector */}
            <div>
              <label className="text-[10px] font-mono font-bold uppercase text-slate-400 block mb-1.5">
                Select Grade Level
              </label>
              <select
                id="online-grade-select"
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(parseInt(e.target.value))}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500 font-bold cursor-pointer"
              >
                {Array.from({ length: 11 }, (_, i) => i + 1).map((g) => {
                  let label = `Grade ${g}`;
                  if (g <= 5) label += " (Primary)";
                  else if (g <= 8) label += " (Lower Secondary)";
                  else label += " (IGCSE Secondary)";
                  return (
                    <option key={g} value={g}>
                      {label}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Subject Selector */}
            <div>
              <label className="text-[10px] font-mono font-bold uppercase text-slate-400 block mb-1.5">
                Select Subject Hub
              </label>
              <select
                id="online-subject-select"
                value={onlineSubject}
                onChange={(e) => setOnlineSubject(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500 font-bold cursor-pointer"
              >
                <option value="Biology">Biology</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Physics">Physics</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Computer Science">Computer Science</option>
                <option value="English">English Language</option>
                <option value="History">History & Humanities</option>
              </select>
            </div>

            {/* Custom Topic Focus */}
            <div>
              <label className="text-[10px] font-mono font-bold uppercase text-slate-400 block mb-1.5">
                Subtopic / Topic Keyword (Optional)
              </label>
              <input
                id="online-topic-focus"
                type="text"
                placeholder="e.g. Photosynthesis, Heat, Ratios..."
                value={onlineTopicKeyword}
                onChange={(e) => setOnlineTopicKeyword(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans"
              />
            </div>

            <button
              type="button"
              id="btn-trigger-online-import"
              disabled={isDownloadingMaterial}
              onClick={async () => {
                setIsDownloadingMaterial(true);
                setDownloadSuccessMsg("");
                setLastDownloadedMaterial(null);
                try {
                  const response = await fetch("/api/ai/online-igcse-material", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      grade: selectedGrade,
                      subject: onlineSubject,
                      topicKeyword: onlineTopicKeyword
                    })
                  });
                  if (!response.ok) {
                    throw new Error("Online curriculum curator was busy or timed out.");
                  }
                  const data = await response.json();
                  setLastDownloadedMaterial(data);
                  setDownloadSuccessMsg(data.warning ? "✨ Synthesis ready in Offline Sandbox Mode!" : "✨ Approved online material fetched successfully!");
                } catch (err: any) {
                  alert("Error curating material: " + err.message);
                } finally {
                  setIsDownloadingMaterial(false);
                }
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs uppercase tracking-wider py-3 rounded-xl transition duration-150 cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
            >
              {isDownloadingMaterial ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Retrieving Materials...</span>
                </>
              ) : (
                <>
                  <Globe className="w-3.5 h-3.5" />
                  <span>Search Online Resources</span>
                </>
              )}
            </button>

            {/* Download outcome preview */}
            {lastDownloadedMaterial && (
              <div className="bg-emerald-500/10 border border-emerald-200 p-4 rounded-xl space-y-3 animate-fadeIn">
                <div className="flex items-center gap-1.5 text-emerald-800">
                  <Sparkles className="w-3.5 h-3.5 animate-pulse text-emerald-600" />
                  <span className="text-[10px] uppercase font-black tracking-widest font-mono">Matched Syllabus Resource</span>
                </div>
                <div>
                  <h5 className="text-xs font-bold text-emerald-950 font-sans leading-snug text-left">{lastDownloadedMaterial.title}</h5>
                  <p className="text-[10px] font-mono text-emerald-700 mt-1 uppercase text-left">
                    Code: {lastDownloadedMaterial.syllabusCode} • {lastDownloadedMaterial.resourceType}
                  </p>
                </div>

                {downloadSuccessMsg && (
                  <p className="text-[10px] text-slate-500 leading-relaxed font-sans italic text-left">
                    {downloadSuccessMsg}
                  </p>
                )}

                <button
                  type="button"
                  onClick={() => {
                    if (onAddStudyMaterial) {
                      onAddStudyMaterial(lastDownloadedMaterial);
                      // Make newly imported material the active one!
                      setSelectedSubjectId(lastDownloadedMaterial.subjectId);
                      setActiveMaterial(lastDownloadedMaterial);
                      setViewMode("document");
                      setLastDownloadedMaterial(null);
                      setDownloadSuccessMsg("");
                      alert(`🎉 "${lastDownloadedMaterial.title}" successfully added to your active workspace library! View the left column to read it.`);
                    }
                  }}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black text-[10px] uppercase tracking-wider py-2.5 rounded-lg transition cursor-pointer"
                >
                  📥 Import to Cambridge Library
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Reader section */}
      <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between h-[560px] overflow-y-auto">
        {activeMaterial ? (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
              <div>
                <span className="text-[10px] font-extrabold tracking-widest text-blue-700 uppercase bg-blue-50 border border-blue-200 px-2.5 py-1 rounded font-mono">
                  {activeMaterial.resourceType} • {activeMaterial.syllabusCode}
                </span>
                <h3 className="text-lg font-black text-slate-900 tracking-tight mt-2.5 font-display">
                  {activeMaterial.title}
                </h3>
              </div>
              
              <div className="flex items-center gap-1.5 shrink-0 self-start sm:self-center">
                <button
                  id={`btn-quick-look-upper-${activeMaterial.id}`}
                  onClick={() => handleOpenQuickLook(activeMaterial)}
                  className="flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold px-2.5 py-2 rounded-xl transition cursor-pointer border border-slate-200 shadow-sm"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-500" />
                  Quick Look
                </button>
                <button
                  id="btn-fake-doc-download"
                  onClick={() => alert(`Simulated PDF attachment prepared for offline practice matching ${activeMaterial.syllabusCode}. Ready to print!`)}
                  className="flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold px-2.5 py-2 rounded-xl transition cursor-pointer border border-slate-200 shadow-sm"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  Download
                </button>
              </div>
            </div>

            {/* Inner Sub tabs selection to activate Reading Assistance */}
            <div className="flex bg-slate-150 bg-slate-100 p-1 rounded-xl text-xs font-bold font-sans self-stretch">
              <button
                onClick={() => setViewMode("document")}
                className={`flex-1 py-1.5 rounded-lg cursor-pointer transition text-center ${viewMode === "document" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"}`}
              >
                Syllabus Document
              </button>
              <button
                id="btn-trigger-ai-assist-tab"
                onClick={() => {
                  setViewMode("ai-assist");
                  if (!analysisResult) {
                    handleRequestReadingAssistance();
                  }
                }}
                className={`flex-1 py-1.5 rounded-lg cursor-pointer transition text-center flex items-center justify-center gap-1.5 ${viewMode === "ai-assist" ? "bg-blue-600 text-white shadow-xs" : "text-slate-500 hover:text-slate-800"}`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                AI Reading Assistant
              </button>
            </div>

            {viewMode === "document" ? (
              <>
                <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-wrap leading-relaxed py-2 font-sans">
                  {activeMaterial.content}
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mt-6">
                  <h5 className="text-xs font-extrabold uppercase tracking-wide text-slate-400 mb-2 font-display">Resource Properties</h5>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs leading-none font-mono">
                    <div>
                      <span className="text-slate-400 text-[10px] block mb-1">Author / Examiner</span>
                      <span className="font-semibold text-slate-700 font-sans">{activeMaterial.author}</span>
                    </div>
                    {activeMaterial.year && (
                      <div>
                        <span className="text-slate-400 text-[10px] block mb-1">Exam Term</span>
                        <span className="font-semibold text-slate-700 font-sans">June/Nov {activeMaterial.year}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-slate-400 text-[10px] block mb-1">Sub-topic Node</span>
                      <span className="font-semibold text-slate-700 leading-tight block font-sans">{activeMaterial.subtopic}</span>
                    </div>
                  </div>
                </div>

                {/* Interactive Section Quiz checkpoint */}
                <ModuleQuiz
                  materialId={activeMaterial.id}
                  subjectId={activeMaterial.subjectId}
                  onAddBadge={onAddBadge}
                  progress={progress}
                  onUpdateProgress={onUpdateProgress}
                  onAddLogMessage={onAddLogMessage}
                  onNavigateToDashboard={onNavigateToDashboard}
                />
              </>
            ) : (
              <div className="space-y-6 animate-fadeIn py-2">
                {isAnalyzing ? (
                  <div className="p-12 text-center space-y-4">
                    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-800">Synthesizing Revision Content</h4>
                      <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">Reading course guidelines, extracting definitions and formulating practice questions...</p>
                    </div>
                  </div>
                ) : analysisResult ? (
                  <div className="space-y-6">
                    {/* Part 1: Comprehensive Summary Box */}
                    <div className="bg-gradient-to-br from-slate-50 to-blue-50/20 border border-slate-200 rounded-2xl p-5 space-y-3">
                      <div className="flex items-center gap-1.5 text-blue-800 border-b border-slate-200 pb-2">
                        <Sparkles className="w-4 h-4" />
                        <h4 className="text-xs font-black uppercase tracking-wider font-display">Tutor Summary Insights</h4>
                      </div>
                      
                      <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap font-sans">
                        {analysisResult.summary}
                      </div>
                    </div>

                    {/* Part 2: Custom Practice session */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-1.5 text-slate-800 border-b border-light pb-2">
                        <HelpCircle className="w-4 h-4 text-slate-500" />
                        <h4 className="text-xs font-black uppercase tracking-wider font-display">Custom Practice Session ({analysisResult.questions?.length || 0} Questions)</h4>
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        {analysisResult.questions && analysisResult.questions.map((q: any, index: number) => {
                          const isMCQ = q.options && q.options.length > 0;
                          const chosenAns = studentAnswers[q.id];
                          const submitted = submittedQuestions[q.id];
                          const grades = selfGrades[q.id] || [];

                          return (
                            <div key={q.id || index} className="border border-slate-200 rounded-2xl p-4.5 bg-white space-y-3 shadow-xs">
                              <div className="flex justify-between items-start gap-2">
                                <span className="bg-slate-100 text-slate-800 text-[9px] font-extrabold px-2 py-0.5 rounded font-mono font-sans uppercase">
                                  Question {index + 1}
                                </span>
                                <span className="text-blue-700 text-[10px] font-bold font-mono">
                                  {q.marks} Marks
                                </span>
                              </div>

                              <h5 className="text-xs font-bold text-slate-800 leading-snug">{q.questionText}</h5>

                              {/* MCQ Render block */}
                              {isMCQ ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                                  {q.options.map((opt: string, optIdx: number) => {
                                    const isCorrect = optIdx === q.correctOptionIndex;
                                    const isSelected = chosenAns === optIdx;
                                    
                                    let btnStyle = "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700";
                                    if (submitted) {
                                      if (isCorrect) {
                                        btnStyle = "bg-emerald-500/10 border-emerald-500 text-emerald-800 font-bold";
                                      } else if (isSelected) {
                                        btnStyle = "bg-rose-50 border-rose-300 text-rose-800";
                                      }
                                    } else if (isSelected) {
                                      btnStyle = "bg-blue-50 border-blue-500 text-blue-900 font-bold";
                                    }

                                    return (
                                      <button
                                        key={optIdx}
                                        type="button"
                                        disabled={submitted}
                                        onClick={() => {
                                          setStudentAnswers(prev => ({ ...prev, [q.id]: optIdx }));
                                          setSubmittedQuestions(prev => ({ ...prev, [q.id]: true }));
                                          if (optIdx === q.correctOptionIndex) {
                                            handleSaveMarksEarned(q.questionText, 1);
                                          } else {
                                            alert(`Incorrect option. Review the explanation walkthrough to learn the correct syllabus path.`);
                                          }
                                        }}
                                        className={`w-full text-left p-2.5 rounded-xl border text-[11px] transition ${btnStyle}`}
                                      >
                                        {opt}
                                      </button>
                                    );
                                  })}
                                </div>
                              ) : (
                                /* Structured Written Answer render block */
                                <div className="space-y-3">
                                  <textarea
                                    disabled={submitted}
                                    rows={3}
                                    placeholder="Type your structured answer matching standard command words here..."
                                    value={(chosenAns as string) || ""}
                                    onChange={(e) => setStudentAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans leading-relaxed"
                                  />

                                  {!submitted && (
                                    <button
                                      type="button"
                                      disabled={!chosenAns}
                                      onClick={() => handleAnswerSubmit(q.id)}
                                      className="bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white text-[10px] uppercase tracking-wide font-black px-4.5 py-1.8 rounded-lg cursor-pointer disabled:opacity-40"
                                    >
                                      Submit Answer as Student response
                                    </button>
                                  )}
                                </div>
                              )}

                              {/* Walkthrough, self-grading checklists once answered */}
                              {submitted && (
                                <div className="mt-3 bg-slate-50 border border-slate-150 p-4 rounded-xl space-y-3 animate-fadeIn">
                                  
                                  {/* Section of Walkthrough and model */}
                                  <div className="space-y-2">
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block font-mono">Official model answer scheme</span>
                                    <p className="text-[11px] text-slate-800 leading-relaxed font-sans">{q.modelAnswer}</p>
                                    
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block font-mono">Tutor walkthrough notes</span>
                                    <p className="text-[10px] text-slate-500 leading-relaxed font-sans italic">{q.explanation}</p>
                                  </div>

                                  {/* If written question, show checklist to rate marks */}
                                  {!isMCQ && (
                                    <div className="border-t border-slate-200/60 pt-3 space-y-2.5">
                                      <span className="text-[9px] font-black text-rose-600 uppercase tracking-widest block font-mono">Score your written script (marking guide)</span>
                                      
                                      <div className="space-y-1.5">
                                        {q.markSchemePoints && q.markSchemePoints.map((point: string, ptIdx: number) => (
                                          <label key={ptIdx} className="flex items-start gap-2 text-[10px] text-slate-600 leading-relaxed cursor-pointer font-sans select-none">
                                            <input
                                              type="checkbox"
                                              checked={grades[ptIdx] || false}
                                              onChange={(e) => {
                                                const updated = [...grades];
                                                updated[ptIdx] = e.target.checked;
                                                setSelfGrades(prev => ({ ...prev, [q.id]: updated }));
                                              }}
                                              className="rounded text-blue-600 border-slate-300 w-3.5 h-3.5 mt-0.5 shrink-0"
                                            />
                                            <span>{point}</span>
                                          </label>
                                        ))}
                                      </div>

                                      <button
                                        type="button"
                                        onClick={() => {
                                          const marksCalculated = grades.filter(Boolean).length;
                                          handleSaveMarksEarned(q.questionText, marksCalculated);
                                        }}
                                        className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-[9px] uppercase tracking-wide px-3.5 py-1.5 rounded-lg shadow-sm cursor-pointer block"
                                      >
                                        Submit Marks Earned
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-2xl">
                    <Sparkles className="w-10 h-10 text-slate-250 mx-auto mb-2 text-slate-400 animate-pulse" />
                    <h4 className="text-sm font-extrabold text-slate-800">Ready for Synthesis</h4>
                    <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">Initialize the Cambridge Tutor reading assistant to obtain instant notes, definitions and practice problems.</p>
                    
                    <button
                      type="button"
                      onClick={handleRequestReadingAssistance}
                      className="mt-4 bg-slate-900 text-white font-extrabold text-[10px] uppercase tracking-wider px-4 py-2 rounded-xl hover:bg-slate-800 transition shadow-sm cursor-pointer"
                    >
                      ✨ Run Reading Assistant Synthesis
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center text-slate-400">
            <BookOpen className="w-16 h-16 text-slate-200 mb-3" />
            <p className="font-extrabold text-lg text-slate-600 font-display">Select curriculum guides</p>
            <p className="text-sm mt-1 max-w-xs">Pick any syllabus guide or worksheet model from the side directory to launch learning details.</p>
          </div>
        )}
      </div>

      {/* --- QUICK LOOK MODAL ACCESSED BY STUDENTS FOR DOCK VISUALS --- */}
      {quickLookMaterial && (
        <div 
          id="quick-look-modal-overlay"
          className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-[999] flex items-center justify-center p-4 md:p-6 animate-fadeIn"
          onClick={() => {
            setQuickLookMaterial(null);
            setHighlightQuery("");
          }}
        >
          <div 
            id="quick-look-modal-container"
            className="bg-slate-50 rounded-3xl border border-slate-200 w-full max-w-4xl h-[85vh] flex flex-col shadow-2xl overflow-hidden relative double-border"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Top bar with antique headers and live visual keyword highlighter */}
            <div className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-amber-500/10 p-2 rounded-lg border border-amber-500/30">
                  <BookOpen className="w-5 h-5 text-amber-400 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-amber-500 uppercase tracking-widest font-extrabold">Instant Document Preview</span>
                    <span className="text-[9px] bg-amber-400 text-slate-950 font-extrabold px-1.5 py-0.2 rounded font-mono">
                      {quickLookMaterial.syllabusCode}
                    </span>
                  </div>
                  <h3 className="text-sm md:text-base font-bold text-white tracking-tight mt-0.5 font-display text-left">
                    {quickLookMaterial.title}
                  </h3>
                </div>
              </div>

              {/* Dynamic Keyword Highlighting Section */}
              <div className="flex items-center gap-2.5 bg-slate-950/70 py-1.5 px-3 rounded-xl border border-slate-700/50 self-stretch md:self-center">
                <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-amber-450 text-amber-400">Search Prep Term:</span>
                <input
                  id="iframe-highlight-search"
                  type="text"
                  placeholder="Type to highlight e.g. active..."
                  value={highlightQuery}
                  onChange={(e) => setHighlightQuery(e.target.value)}
                  className="bg-slate-900 text-slate-100 placeholder-slate-500 border-0 outline-none text-xs rounded-lg px-2 py-1 w-36 md:w-44 focus:ring-1 focus:ring-amber-500 font-sans"
                />
                {highlightQuery && (
                  <button
                    onClick={() => setHighlightQuery("")}
                    className="text-[10px] font-bold text-slate-400 hover:text-white underline cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  id="modal-download-btn"
                  onClick={() => {
                    alert(`Simulated PDF saved on offline browser stack! Resource: ${quickLookMaterial.title}`);
                  }}
                  className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold px-3 py-1.5 rounded-xl transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Print / Save
                </button>
                <button
                  id="modal-close-btn"
                  onClick={() => {
                    setQuickLookMaterial(null);
                    setHighlightQuery("");
                  }}
                  className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition cursor-pointer"
                  title="Close Preview"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Suggested hot syllabus keyword helper bar */}
            <div className="bg-slate-100 border-b border-slate-200/80 px-6 py-2.5 flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-extrabold flex items-center gap-1 mr-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Quick Highlights:
              </span>
              
              {/* Load resource tags dynamically for high-speed clicking */}
              {quickLookMaterial.tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setHighlightQuery(tag)}
                  className={`text-[10px] px-2.5 py-0.5 rounded-full border transition-all font-bold cursor-pointer hover:scale-103 ${
                    highlightQuery.toLowerCase() === tag.toLowerCase()
                      ? "bg-amber-500 text-slate-950 border-amber-600 shadow-xs"
                      : "bg-white text-slate-600 hover:bg-slate-50 border-slate-200"
                  }`}
                >
                  #{tag}
                </button>
              ))}

              {/* Add key biological / academic core terms */}
              {["active", "practical", "formula", "oxford", "cambridge", "energy"].map((term) => {
                // Only show terms occurring or related to learning
                return (
                  <button
                    key={term}
                    onClick={() => setHighlightQuery(term)}
                    className={`text-[10px] px-2.5 py-0.5 rounded-full border transition-all font-semibold uppercase tracking-wider cursor-pointer font-sans hover:scale-103 ${
                      highlightQuery.toLowerCase() === term.toLowerCase()
                        ? "bg-amber-400 text-slate-950 border-amber-500 shadow-xs"
                        : "bg-slate-150/50 text-slate-500 hover:bg-slate-200/50 border-slate-200/60"
                    }`}
                  >
                    {term}
                  </button>
                );
              })}
            </div>

            {/* Embedding the live styled PDF preview iframe */}
            <div className="flex-1 bg-white relative">
              <iframe
                id="quick-look-preview-frame"
                className="w-full h-full border-0"
                srcDoc={generatePreviewHtml(quickLookMaterial, highlightQuery)}
                title={quickLookMaterial.title}
              />
            </div>

            {/* Modal Bottom control panel */}
            <div className="bg-slate-100 border-t border-slate-200 px-6 py-3 flex items-center justify-between text-xs font-medium text-slate-500 font-mono">
              <div className="flex items-center gap-1.5 text-slate-400">
                <Clock className="w-3.5 h-3.5" />
                <span>Authorized Cambridge Prep Viewer • Visual Keyword Finder: Active</span>
              </div>
              <button 
                onClick={() => {
                  setQuickLookMaterial(null);
                  setHighlightQuery("");
                }}
                className="text-xs font-bold text-slate-600 hover:text-slate-900 transition underline cursor-pointer"
              >
                Close Glance
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
