import React, { useState, useRef } from "react";
import { Assignment, Question, UserRole, Subject, Difficulty, PaperType, ResourceItem } from "../types";
import { SUBJECTS, SAMPLE_QUESTIONS, INITIAL_ASSIGNMENTS } from "../mockData";
import { FileText, Plus, CheckCircle, Clock, Users, ArrowUpRight, TrendingUp, AlertCircle, Save, Upload, BookOpen, Sparkles } from "lucide-react";

interface TeacherDashboardProps {
  assignments: Assignment[];
  onUpdateAssignments: (assignments: Assignment[]) => void;
  subjects?: Subject[];
  onAddSubject?: (newSub: Subject) => void;
  onAddTopic?: (subjectId: string, topicName: string, subtopics: string[]) => void;
  onAddStudyMaterial?: (newMaterial: ResourceItem) => void;
  onAddLogMessage?: (msg: string) => void;
}

export default function TeacherDashboard({
  assignments,
  onUpdateAssignments,
  subjects = SUBJECTS,
  onAddSubject,
  onAddTopic,
  onAddStudyMaterial,
  onAddLogMessage
}: TeacherDashboardProps) {
  const [activeTab, setActiveTab] = useState<"grading" | "creator" | "analytics" | "syllabus">("grading");

  // Assignment Creator States
  const [newTitle, setNewTitle] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("chem");
  const [dueDate, setDueDate] = useState("2026-06-30");
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([SAMPLE_QUESTIONS[0]]);

  // Grading Center States
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>(assignments[0]?.id || "");
  const [selectedSubmissionIndex, setSelectedSubmissionIndex] = useState<number>(0);
  const [currentScore, setCurrentScore] = useState<number>(1);
  const [teacherFeedback, setTeacherFeedback] = useState<string>("");

  // Curriculum Curation states
  const [curriculumMode, setCurriculumMode] = useState<"syllabus" | "subject" | "topic">("syllabus");

  // Type-specific inputs
  const [teacherSubName, setTeacherSubName] = useState("");
  const [teacherSubCat, setTeacherSubCat] = useState<"Sciences" | "Mathematics" | "Languages" | "Humanities" | "ICT & Technology" | "Commerce">("Sciences");
  const [teacherSubCode, setTeacherSubCode] = useState("");

  const [teacherTopicSubId, setTeacherTopicSubId] = useState("bio");
  const [teacherTopicName, setTeacherTopicName] = useState("");
  const [teacherSubtopics, setTeacherSubtopics] = useState("");

  const [syllabusTitle, setSyllabusTitle] = useState("");
  const [syllabusSubId, setSyllabusSubId] = useState("bio");
  const [syllabusTopicId, setSyllabusTopicId] = useState("bio-1");
  const [syllabusDifficulty, setSyllabusDifficulty] = useState<Difficulty>(Difficulty.MEDIUM);
  const [syllabusResourceType, setSyllabusResourceType] = useState<"Notes" | "Worksheet" | "Revision Guide" | "Flash Cards" | "Practical Guide" | "Formula Sheet">("Notes");
  const [syllabusContent, setSyllabusContent] = useState("");
  const [syllabusAuthor, setSyllabusAuthor] = useState("Mrs. Sarah Thompson");
  const [syllabusYear, setSyllabusYear] = useState("2026");
  const [syllabusTags, setSyllabusTags] = useState("");

  // Drag and Drop State and Ref
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Drag-and-drop handler
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (file: File) => {
    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const text = loadEvent.target?.result as string;
      if (text) {
        setSyllabusContent(text);
        if (!syllabusTitle) {
          const cleanName = file.name
            .replace(/\.[^/.]+$/, "") // remove extension
            .replace(/[-_]/g, " ") // replace dashes or underscores
            .split(" ")
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
          setSyllabusTitle(cleanName);
        }
        if (onAddLogMessage) {
          onAddLogMessage(`Uploaded & parsed document: "${file.name}" for syllabus notes.`);
        }
      }
    };
    reader.readAsText(file);
  };

  // Submit forms handlers
  const handleTeacherAddSubjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherSubName.trim() || !teacherSubCode.trim()) return;
    if (onAddSubject) {
      const subId = teacherSubName.toLowerCase().replace(/[^a-z0-9]/g, "").substring(0, 6);
      const newSub: Subject = {
        id: subId,
        name: teacherSubName,
        category: teacherSubCat,
        syllabusCode: teacherSubCode,
        icon: "Atom",
        topics: []
      };
      onAddSubject(newSub);
      setTeacherSubName("");
      setTeacherSubCode("");
      alert(`Subject "${newSub.name}" registered in the central system!`);
    } else {
      alert("Local registry sync is currently offline.");
    }
  };

  const handleTeacherAddTopicSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherTopicName.trim()) return;
    if (onAddTopic) {
      const subtopicArray = teacherSubtopics
        .split(",")
        .map(s => s.trim())
        .filter(s => s.length > 0);
      onAddTopic(teacherTopicSubId, teacherTopicName, subtopicArray);
      setTeacherTopicName("");
      setTeacherSubtopics("");
      alert(`Syllabus Topic "${teacherTopicName}" registered successfully!`);
    } else {
      alert("Local registry sync is currently offline.");
    }
  };

  const handleTeacherAddSyllabusSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!syllabusTitle.trim() || !syllabusContent.trim()) return;
    if (onAddStudyMaterial) {
      const tagsArray = syllabusTags
        .split(",")
        .map(s => s.trim())
        .filter(s => s.length > 0);

      const subObj = subjects.find(s => s.id === syllabusSubId);
      const topicObj = subObj?.topics.find(t => t.id === syllabusTopicId);

      const newMaterial: ResourceItem = {
        id: `res-gen-${Date.now()}`,
        title: syllabusTitle,
        subjectId: syllabusSubId,
        topicId: syllabusTopicId,
        subtopic: topicObj ? topicObj.name : "Curriculum General",
        syllabusCode: subObj ? `${subObj.syllabusCode} (Teacher Curation)` : "Core Syllabus",
        difficulty: syllabusDifficulty,
        resourceType: syllabusResourceType,
        content: syllabusContent,
        author: syllabusAuthor,
        year: syllabusYear,
        tags: tagsArray.length > 0 ? tagsArray : ["Teacher Curation"]
      };

      onAddStudyMaterial(newMaterial);
      setSyllabusTitle("");
      setSyllabusContent("");
      setSyllabusTags("");
      alert(`Syllabus Resource: "${syllabusTitle}" has been officially published to student desks!`);
    } else {
      alert("Local registry sync is currently offline.");
    }
  };

  const activeAssignment = assignments.find(a => a.id === selectedAssignmentId) || assignments[0];

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newAssign: Assignment = {
      id: `assign-${Date.now()}`,
      title: newTitle,
      teacherId: "teacher-1",
      subjectId: selectedSubjectId,
      dueDate: dueDate,
      questions: selectedQuestions,
      submissions: [
        {
          studentId: "student-1",
          studentName: "Alex Mercer",
          submittedAt: new Date().toISOString(),
          answers: selectedQuestions.reduce((acc, q) => {
            acc[q.id] = q.options ? "B" : "The structural element is key to the overall biological system.";
            return acc;
          }, {} as { [key: string]: string }),
          graded: false,
          score: undefined,
          maxScore: selectedQuestions.reduce((sum, q) => sum + q.marks, 0),
          teacherFeedback: "",
        }
      ]
    };

    const updated = [newAssign, ...assignments];
    onUpdateAssignments(updated);
    if (onAddLogMessage) {
      onAddLogMessage(`Created new assignment: "${newTitle}" for Subject ${selectedSubjectId.toUpperCase()}`);
    }

    // Reset creator states
    setNewTitle("");
    setSelectedQuestions([SAMPLE_QUESTIONS[0]]);
    setActiveTab("grading");
    setSelectedAssignmentId(newAssign.id);
    setSelectedSubmissionIndex(0);
  };

  const handleGradingSubmit = () => {
    if (!activeAssignment) return;

    const updatedSubmissions = activeAssignment.submissions.map((sub, idx) => {
      if (idx === selectedSubmissionIndex) {
        return {
          ...sub,
          graded: true,
          score: currentScore,
          teacherFeedback: teacherFeedback,
          gradedAt: new Date().toISOString()
        };
      }
      return sub;
    });

    const updatedAssignments = assignments.map(a => {
      if (a.id === activeAssignment.id) {
        return {
          ...a,
          submissions: updatedSubmissions
        };
      }
      return a;
    });

    onUpdateAssignments(updatedAssignments);

    const targetSub = activeAssignment.submissions[selectedSubmissionIndex];
    if (onAddLogMessage) {
      onAddLogMessage(`Successfully saved student evaluation for ${targetSub.studentName} with score ${currentScore}/${targetSub.maxScore}`);
    }

    alert(`Feedback and grade of ${currentScore} points officially saved for ${targetSub.studentName}!`);
  };

  const selectSubmissionToGrade = (subIdx: number) => {
    setSelectedSubmissionIndex(subIdx);
    const sub = activeAssignment?.submissions[subIdx];
    if (sub) {
      setCurrentScore(sub.score !== undefined ? sub.score : 0);
      setTeacherFeedback(sub.teacherFeedback || "");
    }
  };

  return (
    <div id="teacher-dashboard-container" className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 p-6 rounded-2xl text-white shadow-sm">
        <div>
          <h2 className="text-xl font-bold tracking-tight font-display">Cambridge Educator Console</h2>
          <p className="text-slate-400 text-xs mt-1">Syllabus 0620/0610/0580/0478 Academic Controller Desk</p>
        </div>

        {/* Dashboard inner tabs */}
        <div className="flex items-center gap-1 bg-slate-800 p-1.5 rounded-xl text-xs font-bold">
          <button
            id="tab-toggle-grading"
            onClick={() => {
              setActiveTab("grading");
              if (activeAssignment?.submissions[0]) {
                const sub = activeAssignment.submissions[0];
                setCurrentScore(sub.score || 0);
                setTeacherFeedback(sub.teacherFeedback || "");
              }
            }}
            className={`px-3 py-1.5 rounded-lg cursor-pointer ${
              activeTab === "grading" ? "bg-blue-600 text-white shadow-xs" : "text-slate-300 hover:bg-slate-700"
            }`}
          >
            Submissions & Grading
          </button>
          <button
            id="tab-toggle-creator"
            onClick={() => setActiveTab("creator")}
            className={`px-3 py-1.5 rounded-lg cursor-pointer ${
              activeTab === "creator" ? "bg-blue-600 text-white shadow-xs" : "text-slate-300 hover:bg-slate-700"
            }`}
          >
            Create Assignment
          </button>
          <button
            id="tab-toggle-analytics"
            onClick={() => setActiveTab("analytics")}
            className={`px-3 py-1.5 rounded-lg cursor-pointer ${
              activeTab === "analytics" ? "bg-blue-600 text-white shadow-xs" : "text-slate-300 hover:bg-slate-700"
            }`}
          >
            Class Diagnostics
          </button>
          <button
            id="tab-toggle-syllabus"
            onClick={() => setActiveTab("syllabus")}
            className={`px-3 py-1.5 rounded-lg cursor-pointer ${
              activeTab === "syllabus" ? "bg-blue-600 text-white shadow-xs" : "text-slate-300 hover:bg-slate-700"
            }`}
          >
            Curriculum Curation
          </button>
        </div>
      </div>

      {activeTab === "grading" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* List of active assessments */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Select Assignment Topic</label>
              <select
                id="grading-assignment-select"
                value={selectedAssignmentId}
                onChange={e => {
                  setSelectedAssignmentId(e.target.value);
                  setSelectedSubmissionIndex(0);
                  const selected = assignments.find(a => a.id === e.target.value);
                  const subIdx0 = selected?.submissions[0];
                  if (subIdx0) {
                    setCurrentScore(subIdx0.score !== undefined ? subIdx0.score : 0);
                    setTeacherFeedback(subIdx0.teacherFeedback || "");
                  }
                }}
                className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans"
              >
                {assignments.map(a => (
                  <option key={a.id} value={a.id}>{a.title}</option>
                ))}
              </select>
            </div>

            {activeAssignment ? (
              <div className="space-y-2">
                <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-2 mt-4 px-1">
                  Students Submissions ({activeAssignment.submissions.length})
                </h4>

                {activeAssignment.submissions.map((sub, idx) => (
                  <button
                    key={idx}
                    id={`btn-select-sub-${idx}`}
                    onClick={() => selectSubmissionToGrade(idx)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      selectedSubmissionIndex === idx
                        ? "bg-slate-50 border-slate-300 shadow-xs"
                        : "bg-white border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <div>
                      <h5 className="font-bold text-sm text-slate-800 leading-none">{sub.studentName}</h5>
                      <span className="text-[10px] text-slate-400 block mt-1.5 font-mono">
                        Submitted {new Date(sub.submittedAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="text-right">
                      {sub.graded ? (
                        <span className="text-xs bg-blue-50 text-blue-700 font-bold px-2 py-1 rounded-full border border-blue-105 border-blue-100 flex items-center gap-1 font-mono">
                          <CheckCircle className="w-3 h-3 text-blue-600" />
                          {sub.score}/{sub.maxScore} Marks
                        </span>
                      ) : (
                        <span className="text-xs bg-amber-50 text-amber-700 font-bold px-2 py-1 rounded-full border border-amber-100 flex items-center gap-1 animate-pulse font-mono">
                          <Clock className="w-3 h-3 text-amber-600" />
                          Ungraded
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400 text-center py-6 font-medium">No assignments built yet.</p>
            )}
          </div>

          {/* Grading Pane */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
            {activeAssignment && activeAssignment.submissions[selectedSubmissionIndex] ? (
              <div className="space-y-4 font-sans">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-slate-200 gap-2">
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900 tracking-tight font-display">
                      Evaluation: {activeAssignment.submissions[selectedSubmissionIndex].studentName}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Subject syllabus reference: {activeAssignment.subjectId.toUpperCase()}
                    </p>
                  </div>
                  <div className="text-xs font-semibold text-slate-400 font-mono">
                    Maximum possible mark: <span className="font-bold text-slate-700 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">{activeAssignment.submissions[selectedSubmissionIndex].maxScore} Marks</span>
                  </div>
                </div>

                {/* Question & Answer Details */}
                <div className="space-y-4">
                  {activeAssignment.questions.map((q, qIndex) => {
                    const studentAns = activeAssignment.submissions[selectedSubmissionIndex].answers[q.id];

                    return (
                      <div key={q.id} className="space-y-2 border-b border-gray-50 pb-4">
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="text-sm font-bold text-gray-800">
                            Problem {qIndex + 1}: {q.questionText}
                          </h4>
                          <span className="text-xs bg-gray-100 text-gray-600 font-bold px-2 py-0.5 rounded-full shrink-0">
                            {q.marks} Marks
                          </span>
                        </div>

                        {/* Student Response */}
                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-1">Student Answer</span>
                          <p className="text-sm text-slate-700 italic leading-relaxed">
                            "{studentAns || "No answer text provided."}"
                          </p>
                        </div>

                        {/* Model response & marking guide */}
                        <div className="bg-emerald-50/40 border border-emerald-100 rounded-xl p-4">
                          <span className="text-[10px] font-extrabold text-emerald-805 uppercase tracking-widest block mb-2">Cambridge Point Scheme (Examiner Model)</span>
                          <div className="space-y-1.5 font-mono">
                            {q.markScheme.points.map((pt, pIdx) => (
                              <p key={pIdx} className="text-xs text-emerald-900 flex items-start gap-2">
                                <span className="font-bold mt-0.5">•</span>
                                <span>{pt}</span>
                              </p>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Marking Action Form */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4 mt-6">
                  <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Diagnostic Scoring & Real-Time Feedback Loop</h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5">
                        Award Marks: {currentScore} / {activeAssignment.submissions[selectedSubmissionIndex].maxScore}
                      </label>
                      <input
                        id="grade-slider-input"
                        type="range"
                        min="0"
                        max={activeAssignment.submissions[selectedSubmissionIndex].maxScore}
                        value={currentScore}
                        onChange={(e) => setCurrentScore(parseInt(e.target.value))}
                        className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
                      />
                      <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-1 font-mono">
                        <span>0 Marks</span>
                        <span>{activeAssignment.submissions[selectedSubmissionIndex].maxScore} Marks</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5 font-sans">Constructive Examiner Comments</label>
                      <textarea
                        id="grade-feedback-box"
                        rows={3}
                        value={teacherFeedback}
                        onChange={(e) => setTeacherFeedback(e.target.value)}
                        placeholder="Great effort! You clearly matched key syllabus descriptors. To improve next time, detail..."
                        className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-blue-605 focus:ring-blue-600 font-sans"
                      ></textarea>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      id="btn-submit-student-grade"
                      onClick={handleGradingSubmit}
                      className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer shadow-md shadow-blue-600/10"
                    >
                      <Save className="w-4 h-4 text-white" />
                      Save Evaluation & Notify Parent
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-12 text-center text-gray-400 h-full">
                <Users className="w-16 h-16 text-gray-200 mb-3" />
                <p className="font-extrabold text-lg text-gray-700">Grading Desk Empty</p>
                <p className="text-sm mt-1 max-w-xs">Pick a compiled assignment and click on a student's record from the sidebar list to grade.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "creator" && (
        <form onSubmit={handleCreateAssignment} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6 animate-fadeIn">
          <div className="border-b border-slate-200 pb-4">
            <h3 className="text-lg font-extrabold text-slate-800 tracking-tight font-display">Create past paper assessment</h3>
            <p className="text-xs text-slate-400 mt-0.5">Distribute custom point exams to your assigned classrooms in seconds.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-2 font-sans">Assignment Banner Title</label>
              <input
                id="creator-banner-title"
                type="text"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                placeholder="e.g. Chapter 1: Cell Organization Assessment"
                className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-2 font-sans">Subject Course</label>
              <select
                id="creator-banner-subject"
                value={selectedSubjectId}
                onChange={e => setSelectedSubjectId(e.target.value)}
                className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans"
              >
                {SUBJECTS.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.syllabusCode})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-2 font-sans">Target Submission Deadline</label>
              <input
                id="creator-banner-deadline"
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-gray-450 text-gray-400 uppercase tracking-widest mb-3">
              Included Problem Banks ({selectedQuestions.length} Selected)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {SAMPLE_QUESTIONS.map(q => {
                const isSelected = selectedQuestions.some(sq => sq.id === q.id);

                return (
                  <div
                    key={q.id}
                    className={`p-4 rounded-xl border transition-all flex justify-between items-start ${
                      isSelected ? "border-blue-600 bg-blue-50/40 font-semibold" : "border-slate-200 bg-white"
                    }`}
                  >
                    <div>
                      <span className="text-[9px] uppercase font-bold tracking-widest text-blue-700 block mb-1">
                        Syllabus Ref: {q.learningObjective}
                      </span>
                      <h4 className="text-xs font-bold text-slate-800 leading-snug font-display">{q.questionText}</h4>
                      <p className="text-[10px] text-slate-400 mt-2 font-mono">Allocated points: {q.marks} Marks • {q.timeEstimate} min</p>
                    </div>

                    <button
                      type="button"
                      id={`btn-toggle-q-select-${q.id}`}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedQuestions(selectedQuestions.filter(sq => sq.id !== q.id));
                        } else {
                          setSelectedQuestions([...selectedQuestions, q]);
                        }
                      }}
                      className={`text-xs ml-3 font-semibold px-2.5 py-1 rounded-lg ${
                        isSelected ? "bg-blue-600 text-white" : "bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-205 cursor-pointer"
                      }`}
                    >
                      {isSelected ? "Selected" : "Add Problem"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-200">
            <button
              type="submit"
              id="btn-creator-save-assign"
              className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-5 py-3 rounded-xl transition shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4 text-white" />
              Publish Assessment to Student Portals
            </button>
          </div>
        </form>
      )}

      {activeTab === "analytics" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6 animate-fadeIn">
          <div className="border-b border-slate-200 pb-4">
            <h3 className="text-lg font-extrabold text-slate-800 tracking-tight font-display">Active Class Mastery & Diagnostic Analytics</h3>
            <p className="text-xs text-slate-400 mt-0.5">Real-time alerts highlighting curriculum gaps based on recent assessment submissions.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-205 border-slate-200">
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest block mb-1 font-sans">Class Avg Percentage</span>
              <div className="flex items-baseline gap-2 mt-2 animate-fadeIn">
                <span className="text-2xl font-black text-slate-800 font-display">77.5%</span>
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-0.5 font-mono">
                  <TrendingUp className="w-3.5 h-3.5" />
                  +4.2%
                </span>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-205 border-slate-200">
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest block mb-1 font-sans">Mastery Syllabus Ref</span>
              <div className="flex items-baseline gap-2 mt-2 animate-fadeIn">
                <span className="text-lg font-black text-slate-850 font-display">0610 (Biology)</span>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 font-extrabold px-1.5 py-0.5 rounded uppercase font-mono">90% mastery</span>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-250 border-slate-200">
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest block mb-1">Weakest Topic Focus</span>
              <div className="flex items-baseline gap-2 mt-2 animate-fadeIn font-sans">
                <span className="text-sm font-black text-rose-700 font-display">0620 (Heating curves)</span>
                <span className="text-[10px] bg-rose-50 text-rose-700 font-extrabold px-1.5 py-0.5 rounded uppercase font-mono">35% pass</span>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-205 border-slate-200">
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest block mb-1 font-sans">Submissions Received</span>
              <div className="flex items-baseline gap-2 mt-2 animate-fadeIn">
                <span className="text-2xl font-black text-slate-800 font-display">2 / 2</span>
                <span className="text-xs text-blue-750 font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded font-mono">100% Turn-In</span>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-amber-50/40 border border-amber-200 flex gap-3 animate-fadeIn">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 animate-bounce" />
            <div>
              <h5 className="font-extrabold text-smtext-amber-950 leading-none font-display">Diagnostic Advice on Heating Curves (Syllabus 0620)</h5>
              <p className="text-xs text-amber-900 leading-relaxed mt-2 font-medium">
                Calculations and energy-flatline explanations continue to be a class-wide hazard. 70% of candidate mistakes are linked to confusing intermolecular bonds with intramolecular forces during water phase changes. We recommend scheduling an interactive live whiteboard or attaching the 'Solid, Liquid & Gas Energy Guide' in your next assignment set.
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === "syllabus" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-extrabold text-slate-800 tracking-tight font-display">Cambridge Syllabus & Resources Curation Center</h3>
              <p className="text-xs text-slate-400 mt-0.5">Author and publish curriculum guides, syllabus topics and custom syllabus subjects directly.</p>
            </div>

            <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold grow-0 shrink-0">
              <button
                onClick={() => setCurriculumMode("syllabus")}
                className={`px-3 py-1.5 rounded-lg cursor-pointer transition ${curriculumMode === "syllabus" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"}`}
              >
                Upload Syllabus Resource
              </button>
              <button
                id="mode-toggle-subject"
                onClick={() => setCurriculumMode("subject")}
                className={`px-3 py-1.5 rounded-lg cursor-pointer transition ${curriculumMode === "subject" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"}`}
              >
                Create Subject
              </button>
              <button
                id="mode-toggle-topic"
                onClick={() => setCurriculumMode("topic")}
                className={`px-3 py-1.5 rounded-lg cursor-pointer transition ${curriculumMode === "topic" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"}`}
              >
                Create Topic
              </button>
            </div>
          </div>

          {/* CURRICULUM MODE: SUBJECT */}
          {curriculumMode === "subject" && (
            <form onSubmit={handleTeacherAddSubjectSubmit} className="max-w-xl mx-auto bg-slate-50 border border-slate-200 p-6 rounded-2xl space-y-4 animate-fadeIn">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
                <Plus className="w-5 h-5 text-indigo-600" />
                <h4 className="text-sm font-extrabold uppercase text-slate-700 tracking-wider">Publish a New Academic Subject</h4>
              </div>

              <div>
                <label className="block text-[11px] uppercase font-extrabold text-slate-500 mb-1">Subject Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Environmental Management"
                  value={teacherSubName}
                  onChange={(e) => setTeacherSubName(e.target.value)}
                  className="w-full text-xs font-semibold bg-white border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] uppercase font-extrabold text-slate-500 mb-1">Category Group</label>
                  <select
                    value={teacherSubCat}
                    onChange={(e: any) => setTeacherSubCat(e.target.value)}
                    className="w-full text-xs font-semibold bg-white border border-slate-200 rounded-lg p-2.5 focus:outline-none"
                  >
                    <option value="Sciences">Sciences</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Languages">Languages</option>
                    <option value="Humanities">Humanities</option>
                    <option value="ICT & Technology">ICT & Technology</option>
                    <option value="Commerce">Commerce</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] uppercase font-extrabold text-slate-500 mb-1">Syllabus Code (CAIE)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 0680"
                    value={teacherSubCode}
                    onChange={(e) => setTeacherSubCode(e.target.value)}
                    className="w-full text-xs font-semibold bg-white border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-blue-505 font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-slate-900 text-white text-xs py-3 rounded-xl hover:bg-slate-800 font-extrabold tracking-wider uppercase transition shadow-md flex items-center justify-center gap-1 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Register Course Code
              </button>
            </form>
          )}

          {/* CURRICULUM MODE: TOPIC */}
          {curriculumMode === "topic" && (
            <form onSubmit={handleTeacherAddTopicSubmit} className="max-w-xl mx-auto bg-slate-50 border border-slate-200 p-6 rounded-2xl space-y-4 animate-fadeIn">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
                <Plus className="w-5 h-5 text-indigo-600" />
                <h4 className="text-sm font-extrabold uppercase text-slate-700 tracking-wider">Publish New syllabus Topic Chapter</h4>
              </div>

              <div>
                <label className="block text-[11px] uppercase font-extrabold text-slate-500 mb-1">Choose Course Subject</label>
                <select
                  value={teacherTopicSubId}
                  onChange={(e) => setTeacherTopicSubId(e.target.value)}
                  className="w-full text-xs font-semibold bg-white border border-slate-200 rounded-lg p-2.5 focus:outline-none"
                >
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.syllabusCode})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] uppercase font-extrabold text-slate-500 mb-1">Topic Title / Chapter Head</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Managing Ecosystems"
                  value={teacherTopicName}
                  onChange={(e) => setTeacherTopicName(e.target.value)}
                  className="w-full text-xs font-semibold bg-white border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase font-extrabold text-slate-500 mb-1">Detailed subtopics (comma separated)</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Food chains, energy webs, biodiversity index, habitat preservation"
                  value={teacherSubtopics}
                  onChange={(e) => setTeacherSubtopics(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-slate-900 text-white text-xs py-3 rounded-xl hover:bg-slate-800 font-extrabold tracking-wider uppercase transition shadow-md flex items-center justify-center gap-1 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Publish Syllabus Chapter
              </button>
            </form>
          )}

          {/* CURRICULUM MODE: SYLLABUS RESOURCE WITH DRAG & DROP */}
          {curriculumMode === "syllabus" && (
            <form onSubmit={handleTeacherAddSyllabusSubmit} className="space-y-6 animate-fadeIn">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left side inputs */}
                <div className="lg:col-span-7 space-y-4">
                  
                  {/* File Upload zone with Drag and Drop */}
                  <div className="space-y-2">
                    <label className="block text-xs font-extrabold text-slate-400 uppercase tracking-widest">Syllabus file attachment</label>
                    
                    <div
                      onDragEnter={handleDrag}
                      onDragOver={handleDrag}
                      onDragLeave={handleDrag}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-2xl p-5 text-center flex flex-col items-center justify-center gap-3 transition-all cursor-pointer ${
                        dragActive
                          ? "border-blue-600 bg-blue-50 scale-[1.01]"
                          : "border-slate-350 border-slate-300 bg-slate-50 hover:bg-slate-100"
                      }`}
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept=".txt,.md,.markdown"
                        className="hidden"
                      />
                      
                      <div className="p-3 bg-white rounded-full shadow-xs border border-slate-100 text-blue-600">
                        <Upload className="w-6 h-6 animate-pulse" />
                      </div>

                      <div>
                        <p className="text-xs font-bold text-slate-800">
                          {dragActive ? "Drop the document here!" : "Drag & drop your syllabus study file (.txt or .md) here"}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1">or click to browse local computer directory</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Syllabus Title</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Energy Flow and Biological Trophics Guide"
                        value={syllabusTitle}
                        onChange={(e) => setSyllabusTitle(e.target.value)}
                        className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Authoring Professor</label>
                      <input
                        type="text"
                        required
                        value={syllabusAuthor}
                        onChange={(e) => setSyllabusAuthor(e.target.value)}
                        className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Subject</label>
                      <select
                        value={syllabusSubId}
                        onChange={(e) => {
                          const sid = e.target.value;
                          setSyllabusSubId(sid);
                          const subObj = subjects.find(s => s.id === sid);
                          if (subObj && subObj.topics && subObj.topics.length > 0) {
                            setSyllabusTopicId(subObj.topics[0].id);
                          } else {
                            setSyllabusTopicId("");
                          }
                        }}
                        className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:outline-none"
                      >
                        {subjects.map(s => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Syllabus Topic</label>
                      <select
                        value={syllabusTopicId}
                        onChange={(e) => setSyllabusTopicId(e.target.value)}
                        className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:outline-none"
                      >
                        {subjects.find(s => s.id === syllabusSubId)?.topics.map(t => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        )) || <option value="">General</option>}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Resource Format</label>
                      <select
                        value={syllabusResourceType}
                        onChange={(e: any) => setSyllabusResourceType(e.target.value)}
                        className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:outline-none"
                      >
                        <option value="Notes">Notes Format</option>
                        <option value="Worksheet">Practice Worksheet</option>
                        <option value="Revision Guide">Revision Guide</option>
                        <option value="Flash Cards">Flash Cards Deck</option>
                        <option value="Practical Guide">Practical Lab Guide</option>
                        <option value="Formula Sheet">Physics / Maths Formulas</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Year</label>
                      <input
                        type="text"
                        required
                        value={syllabusYear}
                        onChange={(e) => setSyllabusYear(e.target.value)}
                        className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg p-2.5 lg:p-2 focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Custom Tags (comma separated)</label>
                    <input
                      type="text"
                      placeholder="e.g. Ecology, 2026 Core, Photosynthesis, Lab Practical"
                      value={syllabusTags}
                      onChange={(e) => setSyllabusTags(e.target.value)}
                      className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Right side syllabus text editor */}
                <div className="lg:col-span-5 flex flex-col space-y-2">
                  <label className="block text-xs font-extrabold text-slate-400 uppercase tracking-widest">Syllabus Text / Educational Markdown Content</label>
                  <textarea
                    required
                    rows={12}
                    value={syllabusContent}
                    onChange={(e) => setSyllabusContent(e.target.value)}
                    placeholder="# States of Matter&#10;&#10;Explain the physical change between solids, liquids, and gases..."
                    className="w-full grow text-xs bg-slate-50 border border-slate-200 rounded-2xl p-4 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono leading-relaxed"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-200">
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs px-5 py-3 rounded-xl transition shadow-md cursor-pointer uppercase tracking-wider"
                >
                  <Plus className="w-4 h-4 text-white" />
                  Publish To Student Libraries
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
