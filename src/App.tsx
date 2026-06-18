import React, { useState } from "react";
import { UserRole, StudentProgress, Assignment, Subject, ResourceItem } from "./types";
import { SUBJECTS, STUDY_MATERIALS, INITIAL_STUDENT_PROGRESS, INITIAL_ASSIGNMENTS } from "./mockData";
import RoleSwitcher from "./components/RoleSwitcher";
import LoginPage from "./components/LoginPage";
import StudentDashboard from "./components/StudentDashboard";
import TeacherDashboard from "./components/TeacherDashboard";
import ParentDashboard from "./components/ParentDashboard";
import StudyLibrary from "./components/StudyLibrary";
import StudentForum from "./components/StudentForum";

// Lucide Icons
import {
  GraduationCap,
  Users,
  User,
  Settings,
  BookOpen,
  MessageSquare,
  Activity,
  Award,
  Sparkles,
  Zap,
  Globe,
  Bell,
  HardDrive,
  LogOut,
  Key,
  Plus,
  Upload,
  FileText,
  AlertCircle
} from "lucide-react";

export default function App() {
  // Authentication states
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string>("");

  // Global States (Interactive and cross-synchronized across views!)
  const [currentRole, setCurrentRole] = useState<UserRole>(UserRole.STUDENT);
  const [subjects, setSubjects] = useState<Subject[]>(SUBJECTS);
  const [studyMaterials, setStudyMaterials] = useState<ResourceItem[]>(STUDY_MATERIALS);
  const [studentProgress, setStudentProgress] = useState<StudentProgress>(INITIAL_STUDENT_PROGRESS);
  const [assignments, setAssignments] = useState<Assignment[]>(INITIAL_ASSIGNMENTS);

  // Admin Resource Creator Workspace tab
  const [adminTab, setAdminTab] = useState<"analytics" | "creator">("analytics");

  // Admin resource creator states
  const [adminSubName, setAdminSubName] = useState("");
  const [adminSubCat, setAdminSubCat] = useState<"Sciences" | "Mathematics" | "Languages" | "Humanities" | "ICT & Technology" | "Commerce">("Sciences");
  const [adminSubCode, setAdminSubCode] = useState("");

  const [adminTopicSubId, setAdminTopicSubId] = useState("bio");
  const [adminTopicName, setAdminTopicName] = useState("");
  const [adminSubtopics, setAdminSubtopics] = useState("");

  // Layout states
  const [activeNavGroup, setActiveNavGroup] = useState<"workspace" | "library" | "forum">("workspace");

  // Real-time Event timeline (proving full-stack role syncing!)
  const [activityLogs, setActivityLogs] = useState<string[]>([
    "IGCSE diagnostics engine online.",
    "Alex Mercer student profile loaded successfully with Level 3 rank.",
    "Syllabus 0620 (States of Matter) assessment preloaded. Pending Chloe Tan evaluation."
  ]);

  const addLogMessage = (msg: string) => {
    setActivityLogs(prev => [
      `[${new Date().toLocaleTimeString()}] ${msg}`,
      ...prev.slice(0, 7) // keep last 8 entries
    ]);
  };

  const handleAddSubject = (newSubject: Subject) => {
    setSubjects(prev => {
      if (prev.some(s => s.id === newSubject.id || s.syllabusCode === newSubject.syllabusCode)) {
        alert("Subject ID or Syllabus Code already exists!");
        return prev;
      }
      return [...prev, newSubject];
    });
    addLogMessage(`📚 New Subject Added: "${newSubject.name}" (${newSubject.syllabusCode})`);
  };

  const handleAddTopic = (subjectId: string, topicName: string, subtopics: string[]) => {
    setSubjects(prev => prev.map(sub => {
      if (sub.id === subjectId) {
        const newTopicId = `${subjectId}-topic-${Date.now()}`;
        return {
          ...sub,
          topics: [
            ...sub.topics,
            { id: newTopicId, name: topicName, subtopics }
          ]
        };
      }
      return sub;
    }));
    const subName = subjects.find(s => s.id === subjectId)?.name || subjectId;
    addLogMessage(`📌 New Topic added under ${subName}: "${topicName}"`);
  };

  const handleAddStudyMaterial = (newMaterial: ResourceItem) => {
    setStudyMaterials(prev => [newMaterial, ...prev]);
    addLogMessage(`📄 Syllabus guide published: "${newMaterial.title}"`);
  };

  const handleAdminAddSubjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminSubName.trim() || !adminSubCode.trim()) return;
    const subId = adminSubName.toLowerCase().replace(/[^a-z0-9]/g, "").substring(0, 6);
    const newSub: Subject = {
      id: subId,
      name: adminSubName,
      category: adminSubCat,
      syllabusCode: adminSubCode,
      icon: "Atom",
      topics: []
    };
    handleAddSubject(newSub);
    setAdminSubName("");
    setAdminSubCode("");
    alert(`Subject "${newSub.name}" (${newSub.syllabusCode}) added successfully!`);
  };

  const handleAdminAddTopicSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminTopicName.trim()) return;
    const subtopicArray = adminSubtopics
      .split(",")
      .map(s => s.trim())
      .filter(s => s.length > 0);
    handleAddTopic(adminTopicSubId, adminTopicName, subtopicArray);
    setAdminTopicName("");
    setAdminSubtopics("");
    alert(`Topic "${adminTopicName}" added successfully to subject!`);
  };

  const handleLoginSuccess = (role: UserRole, email: string) => {
    setCurrentRole(role);
    setUserEmail(email);
    setIsLoggedIn(true);
    setActiveNavGroup("workspace");
    addLogMessage(`🔐 User ${email} authenticated successfully. Accessing ${role.toUpperCase()} workspace.`);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserEmail("");
    addLogMessage(`🔓 User ${userEmail || "anonymous"} logged out.`);
  };

  // Callback: Students completing assignments or quizzes awarded badges
  const handleAwardBadge = (badgeId: string) => {
    if (studentProgress.badges.includes(badgeId)) return;

    const updated = {
      ...studentProgress,
      badges: [...studentProgress.badges, badgeId]
    };
    setStudentProgress(updated);
    addLogMessage(`🎉 Student Alex Mercer earned NEW milestone badge: "${badgeId.replace("badge-", "Badge ")}"!`);
  };

  const handleUpdateProgress = (newProgress: StudentProgress) => {
    setStudentProgress(newProgress);
    addLogMessage(`XP modified! Current Level: ${newProgress.level}, XP: ${newProgress.xp}/${newProgress.xpNeededForNextLevel}.`);
  };

  const handleUpdateAssignments = (newAssignments: Assignment[]) => {
    setAssignments(newAssignments);
    // Auto sync student score if changed in assignments
    const activeSub = newAssignments[0]?.submissions.find(s => s.studentId === studentProgress.userId);
    if (activeSub && activeSub.graded && activeSub.score !== undefined) {
      const qId = newAssignments[0].questions[0].id;
      const progressScores = { ...studentProgress.scores };

      if (!progressScores[qId] || progressScores[qId].score !== activeSub.score) {
        progressScores[qId] = {
          score: activeSub.score,
          maxScore: activeSub.maxScore,
          submittedAt: activeSub.gradedAt || new Date().toISOString()
        };

        const updatedProgress = {
          ...studentProgress,
          scores: progressScores
        };

        // If newly graded, upgrade XP
        if (!studentProgress.scores[qId]) {
          updatedProgress.xp = studentProgress.xp + 100;
          updatedProgress.badges = studentProgress.badges.includes("badge-4")
            ? studentProgress.badges
            : [...studentProgress.badges, "badge-4"]; // Receive positive academic feedback
        }

        setStudentProgress(updatedProgress);
        addLogMessage(`Parent tracking panel synced! Student scores modified on question ${qId}.`);
      }
    }
  };

  const handleChangeRole = (role: UserRole) => {
    setCurrentRole(role);
    setActiveNavGroup("workspace");
    addLogMessage(`Switched sandbox perspective environment to: ${role.toUpperCase()} portal.`);
  };

  // Dedicated decorative and configuration details for high-fidelity role separation
  const getRoleConfig = (role: UserRole) => {
    switch (role) {
      case UserRole.STUDENT:
        return {
          badgeLabel: "ALEX'S STUDENT DESK",
          sidebarTitle: "Student Navigation",
          desc: "Personal assessment engine & peer companion",
          themeColor: "text-emerald-700 bg-emerald-50 border-emerald-100",
          portalHeader: "STUDENT ACADEMY",
          portalSub: "Review syllabus guidelines, practice exams, and chat with AI Tutor",
          bannerClass: "border-emerald-500/20 bg-gradient-to-r from-emerald-500/5 via-blue-500/5 to-transparent",
          accentColor: "emerald-600",
          stats: {
            label: "Alex Mercer Rank",
            value: `Level ${studentProgress.level} (Active Streak: ${studentProgress.streakDays}d)`
          }
        };
      case UserRole.TEACHER:
        return {
          badgeLabel: "TEACHER EVALUATION DESK",
          sidebarTitle: "Thompson's Dashboard",
          desc: "Official IGCSE Curriculum controller",
          themeColor: "text-indigo-700 bg-indigo-50 border-indigo-100",
          portalHeader: "CAMBRIDGE EDUCATOR PORTAL",
          portalSub: "Create worksheets, grade structural assignments, and observe learner metrics",
          bannerClass: "border-indigo-500/20 bg-gradient-to-r from-indigo-500/5 via-blue-500/5 to-transparent",
          accentColor: "indigo-600",
          stats: {
            label: "Educator Credentials",
            value: "Natural Sciences Controller"
          }
        };
      case UserRole.PARENT:
        return {
          badgeLabel: "PARENT STEWARD CONSOLE",
          sidebarTitle: "Guardian Tracking Panel",
          desc: "Predicted performance & real-time monitoring",
          themeColor: "text-amber-700 bg-amber-50 border-amber-100",
          portalHeader: "GUARDIAN REPORT HUB",
          portalSub: "Track simulated Cambridge grade predictions and school progress indicators",
          bannerClass: "border-amber-500/20 bg-gradient-to-r from-amber-500/5 via-amber-100/5 to-transparent",
          accentColor: "amber-600",
          stats: {
            label: "Alex's Supervisor Status",
            value: "Paternal Tracking: Verified"
          }
        };
      case UserRole.ADMIN:
      default:
        return {
          badgeLabel: "ROOT SYSTEM CONSOLE",
          sidebarTitle: "Administrator Base",
          desc: "Administrative billing, audits, and performance indicators",
          themeColor: "text-rose-700 bg-rose-50 border-rose-100",
          portalHeader: "SUPER-ADMIN SYSTEM DECK",
          portalSub: "Global database integrity status, subscription metrics, and syllabus compliance",
          bannerClass: "border-slate-800/20 bg-slate-100",
          accentColor: "slate-900",
          stats: {
            label: "Systems Host Status",
            value: "Authority Level: ROOT"
          }
        };
    }
  };

  const roleConfig = getRoleConfig(currentRole);

  if (!isLoggedIn) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div id="main-application-shell" className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col justify-between selection:bg-blue-100 selection:text-blue-900 animate-fadeIn">
      {/* Top Banner Navigation tailored per Active Portal theme */}
      <header className={`border-b ${roleConfig.bannerClass} py-4 px-6 sticky top-0 z-55 shadow-xs backdrop-blur-md bg-white/90 transition-all duration-350`}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2.5 rounded-xl text-white shadow-md shadow-blue-600/10 flex items-center justify-center animate-fadeIn">
              <Zap className="w-5 h-5 text-yellow-300 fill-current animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold text-slate-900 tracking-tight leading-none font-display">CAIE Premium IGCSE</h1>
                <span className="text-[9px] bg-blue-600 text-white font-extrabold px-1.5 py-0.5 rounded tracking-widest font-mono uppercase">
                  {currentRole} Portal
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 font-semibold select-none text-left">
                {roleConfig.portalHeader} — {roleConfig.portalSub}
              </p>
            </div>
          </div>

          {/* Quick Stats Header Ring linked with Active Role metrics & Authenticated Account Session details */}
          <div className="flex flex-wrap items-center gap-3 self-end sm:self-auto">
            <div className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 flex items-center gap-2 shadow-xs">
              <Award className="w-4.5 h-4.5 text-blue-600" />
              <div className="leading-tight text-left">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">{roleConfig.stats.label}</span>
                <span className="text-xs font-black text-slate-800 font-display">{roleConfig.stats.value}</span>
              </div>
            </div>

            <div className="bg-blue-50 text-blue-800 border border-blue-100 rounded-xl px-3 py-1.5 items-center gap-2 hidden md:flex">
              <Globe className="w-4 h-4 text-blue-600 animate-spin" />
              <div className="leading-none text-left">
                <span className="text-[9px] text-blue-600 font-bold block uppercase">Live Sync</span>
                <span className="text-xs font-bold">Role Isolated</span>
              </div>
            </div>

            {/* Authenticated Account Details & Log out action */}
            <div className="bg-slate-900/5 hover:bg-slate-900/10 border border-slate-200/80 rounded-xl px-3 py-1.5 flex items-center gap-2 shadow-2xs transition">
              <div className="leading-tight text-left">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide block">Active User</span>
                <span className="text-xs font-bold text-slate-800 truncate max-w-[120px] block font-mono">
                  {userEmail || `${currentRole}@cambridge.edu`}
                </span>
              </div>
              <button
                id="header-logout-btn"
                onClick={handleLogout}
                className="ml-1 p-1 bg-red-100 hover:bg-red-200 text-red-700 hover:text-red-800 rounded-lg transition duration-150 cursor-pointer"
                title="Log Out of Portal"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container Workspace */}
      <main className="max-w-7xl w-full mx-auto p-4 md:p-6 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Dynamic Sidebar tailored per Role to represent fully isolated systems */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-sm space-y-4 animate-fadeIn">
            <div>
              <span className="text-[9px] font-mono font-black text-blue-600 tracking-widest uppercase">
                {roleConfig.badgeLabel}
              </span>
              <h3 className="text-sm font-black text-slate-800 tracking-tight mt-1 font-display">
                {roleConfig.sidebarTitle}
              </h3>
              <p className="text-[10px] text-slate-400 font-medium leading-normal mt-0.5">
                {roleConfig.desc}
              </p>
            </div>

            <div className="space-y-1.5 border-t border-slate-100 pt-3">
              {/* STUDENT ROLE TABS */}
              {currentRole === UserRole.STUDENT && (
                <>
                  <button
                    id="sidebar-nav-workspace"
                    onClick={() => setActiveNavGroup("workspace")}
                    className={`w-full text-left p-3 rounded-xl font-bold text-xs uppercase tracking-wide transition flex items-center gap-3 cursor-pointer ${
                      activeNavGroup === "workspace"
                        ? "bg-emerald-50 text-emerald-800 border-l-4 border-emerald-600 border border-slate-200/50 shadow-xs scale-102"
                        : "bg-transparent text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <Zap className="w-4 h-4 text-emerald-600" />
                    <span>Alex's Learning Desk</span>
                  </button>

                  <button
                    id="sidebar-nav-library"
                    onClick={() => setActiveNavGroup("library")}
                    className={`w-full text-left p-3 rounded-xl font-bold text-xs uppercase tracking-wide transition flex items-center justify-between gap-3 cursor-pointer ${
                      activeNavGroup === "library"
                        ? "bg-emerald-50 text-emerald-800 border-l-4 border-emerald-600 border border-slate-200/50 shadow-xs scale-102"
                        : "bg-transparent text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <BookOpen className="w-4 h-4 text-emerald-600" />
                      <span>Syllabus Resources</span>
                    </div>
                  </button>

                  <button
                    id="sidebar-nav-forum"
                    onClick={() => setActiveNavGroup("forum")}
                    className={`w-full text-left p-3 rounded-xl font-bold text-xs uppercase tracking-wide transition flex items-center gap-3 cursor-pointer ${
                      activeNavGroup === "forum"
                        ? "bg-emerald-50 text-emerald-800 border-l-4 border-emerald-600 border border-slate-200/50 shadow-xs scale-102"
                        : "bg-transparent text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <MessageSquare className="w-4 h-4 text-emerald-600" />
                    <span>IGCSE Student Peer Forums</span>
                  </button>
                </>
              )}

              {/* TEACHER ROLE TABS */}
              {currentRole === UserRole.TEACHER && (
                <>
                  <button
                    id="sidebar-nav-workspace"
                    onClick={() => setActiveNavGroup("workspace")}
                    className={`w-full text-left p-3 rounded-xl font-bold text-xs uppercase tracking-wide transition flex items-center gap-3 cursor-pointer ${
                      activeNavGroup === "workspace"
                        ? "bg-indigo-50 text-indigo-800 border-l-4 border-indigo-600 border border-slate-200/50 shadow-xs scale-102"
                        : "bg-transparent text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <Zap className="w-4 h-4 text-indigo-600" />
                    <span>Grading & Evaluation Desk</span>
                  </button>

                  <button
                    id="sidebar-nav-library"
                    onClick={() => setActiveNavGroup("library")}
                    className={`w-full text-left p-3 rounded-xl font-bold text-xs uppercase tracking-wide transition flex items-center justify-between gap-3 cursor-pointer ${
                      activeNavGroup === "library"
                        ? "bg-indigo-50 text-indigo-800 border-l-4 border-indigo-600 border border-slate-200/50 shadow-xs scale-102"
                        : "bg-transparent text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <BookOpen className="w-4 h-4 text-indigo-550" />
                      <span>Syllabus Reference Bank</span>
                    </div>
                  </button>

                  <button
                    id="sidebar-nav-forum"
                    onClick={() => setActiveNavGroup("forum")}
                    className={`w-full text-left p-3 rounded-xl font-bold text-xs uppercase tracking-wide transition flex items-center gap-3 cursor-pointer ${
                      activeNavGroup === "forum"
                        ? "bg-indigo-50 text-indigo-800 border-l-4 border-indigo-600 border border-slate-200/50 shadow-xs scale-102"
                        : "bg-transparent text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <MessageSquare className="w-4 h-4 text-indigo-550" />
                    <span>Teacher/Student Forum Board</span>
                  </button>
                </>
              )}

              {/* PARENT ROLE TABS */}
              {currentRole === UserRole.PARENT && (
                <>
                  <button
                    id="sidebar-nav-workspace"
                    onClick={() => setActiveNavGroup("workspace")}
                    className={`w-full text-left p-3 rounded-xl font-bold text-xs uppercase tracking-wide transition flex items-center gap-3 cursor-pointer ${
                      activeNavGroup === "workspace"
                        ? "bg-amber-50 text-amber-800 border-l-4 border-amber-600 border border-slate-200/50 shadow-xs scale-102"
                        : "bg-transparent text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <Zap className="w-4 h-4 text-amber-600" />
                    <span>Alex's Performance Monitor</span>
                  </button>

                  <button
                    id="sidebar-nav-library"
                    onClick={() => setActiveNavGroup("library")}
                    className={`w-full text-left p-3 rounded-xl font-bold text-xs uppercase tracking-wide transition flex items-center justify-between gap-3 cursor-pointer ${
                      activeNavGroup === "library"
                        ? "bg-amber-50 text-amber-800 border-l-4 border-amber-600 border border-slate-200/50 shadow-xs scale-102"
                        : "bg-transparent text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <BookOpen className="w-4 h-4 text-amber-500" />
                      <span>Glance Expected Studies</span>
                    </div>
                  </button>
                </>
              )}

              {/* ADMIN ROLE TABS */}
              {currentRole === UserRole.ADMIN && (
                <>
                  <button
                    id="sidebar-nav-workspace"
                    onClick={() => setActiveNavGroup("workspace")}
                    className={`w-full text-left p-3 rounded-xl font-bold text-xs uppercase tracking-wide transition flex items-center gap-3 cursor-pointer ${
                      activeNavGroup === "workspace"
                        ? "bg-slate-100 text-slate-900 border-l-4 border-slate-900 border border-slate-200 shadow-xs scale-102"
                        : "bg-transparent text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <Settings className="w-4 h-4 text-slate-700" />
                    <span>Super-Core Control Desk</span>
                  </button>

                  <button
                    id="sidebar-nav-forum"
                    onClick={() => setActiveNavGroup("forum")}
                    className={`w-full text-left p-3 rounded-xl font-bold text-xs uppercase tracking-wide transition flex items-center gap-3 cursor-pointer ${
                      activeNavGroup === "forum"
                        ? "bg-slate-100 text-slate-900 border-l-4 border-slate-900 border border-slate-200 shadow-xs scale-102"
                        : "bg-transparent text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <MessageSquare className="w-4 h-4 text-slate-600" />
                    <span>System Forums Audit Desk</span>
                  </button>
                </>
              )}
            </div>

            {/* LOWER PORTION: Role-Specific contextual summary boxes */}
            <div className="pt-4 border-t border-slate-100">
              {currentRole === UserRole.STUDENT && (
                <div className="bg-slate-900 rounded-xl p-4 text-white relative overflow-hidden shadow-md">
                  <div className="relative z-10 flex flex-col">
                    <p className="text-[10px] font-extrabold text-blue-400 uppercase tracking-widest mb-1">Premium Student upgrade</p>
                    <p className="text-[11px] text-slate-300 leading-relaxed mb-3 font-medium">Unlock AI Essay Marker, structured timed papers and examiner tips.</p>
                    <button 
                      onClick={() => alert("Cambridge Pro subscription unlocked! You now have unrestricted access to premium models.")}
                      className="w-full py-2 bg-blue-600 text-[10px] font-extrabold tracking-wider rounded-lg hover:bg-blue-500 text-white cursor-pointer hover:scale-102 transition duration-200"
                    >
                      UPGRADE NOW
                    </button>
                  </div>
                  <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-blue-500/20 rounded-full blur-2xl"></div>
                </div>
              )}

              {currentRole === UserRole.TEACHER && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-600 space-y-2">
                  <span className="text-[9px] font-bold text-indigo-700 block uppercase tracking-wider font-mono">Teacher Activity State</span>
                  <p className="font-semibold text-slate-800">Natural Science Department</p>
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Department Class:</span>
                    <span className="font-bold text-slate-700">Year 11 (A-Block)</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Pending Evaluation:</span>
                    <span className="bg-rose-100 text-rose-700 font-bold px-1.5 py-0.2 rounded">1 student response</span>
                  </div>
                </div>
              )}

              {currentRole === UserRole.PARENT && (
                <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-3.5 text-xs text-slate-600 space-y-2">
                  <span className="text-[9px] font-bold text-amber-700 block uppercase tracking-wider font-mono">Paternal Sync Status</span>
                  <p className="font-bold text-slate-800">School predicted grade: A*</p>
                  <p className="text-[10px] leading-relaxed text-slate-500">Connected with Mrs. Thompson. Auto updates each time teacher grades papers.</p>
                  <button
                    onClick={() => alert("Simulated direct contact channel established with Year 11 teacher Mrs. Sarah Thompson!")}
                    className="w-full bg-white hover:bg-slate-50 text-amber-800 text-[9px] font-bold py-1.5 border border-amber-200 rounded-md transition"
                  >
                    ✉ CONTRIBUTE LIAISON
                  </button>
                </div>
              )}

              {currentRole === UserRole.ADMIN && (
                <div className="bg-slate-900 rounded-xl p-3.5 text-xs text-slate-200 space-y-2 font-mono">
                  <span className="text-[9px] font-bold text-rose-500 block uppercase tracking-wider">SYSTEM METRICS TELEMETRY</span>
                  <div className="text-[10px] space-y-1 text-slate-400">
                    <p>• DB Instance state: ONLINE</p>
                    <p>• CAIE Modules load: OK</p>
                    <p>• Subscription Tier: STRIPE GATEWAY</p>
                  </div>
                  <button
                    onClick={() => alert("Simulated complete backup of local student scores, assignments list, and vellum library tags was saved successfully!")}
                    className="w-full bg-slate-800 hover:bg-slate-750 text-white text-[9px] font-bold py-1 rounded border border-slate-700 transition"
                  >
                    RUN SYSTEM BACKUP
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Quick Context Advisory adapted per Active Portal type */}
          <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-4.5 space-y-2 text-slate-900 hidden lg:block animate-fadeIn">
            <h4 className="font-extrabold text-xs flex items-center gap-1 text-blue-800 font-display">
              <Sparkles className="w-4 h-4 text-blue-600 animate-pulse fill-current" />
              Role Isolated Features
            </h4>
            <p className="text-[11px] leading-relaxed text-slate-600 mt-1">
              Currently navigating as a <span className="font-extrabold text-slate-800 capitalize">{currentRole}</span>. Alternate with the sandboxed top buttons to synchronize results from grading desks directly into student boards!
            </p>
          </div>
        </div>

        {/* Dynamic Display area */}
        <div className="lg:col-span-9">
          {activeNavGroup === "library" && (
            <StudyLibrary 
              subjects={subjects}
              studyMaterials={studyMaterials}
              onAddStudyMaterial={handleAddStudyMaterial}
              onAddBadge={handleAwardBadge} 
              progress={studentProgress}
              onUpdateProgress={handleUpdateProgress}
              onAddLogMessage={addLogMessage}
              onNavigateToDashboard={() => setActiveNavGroup("workspace")}
            />
          )}

          {activeNavGroup === "forum" && (
            <StudentForum currentRole={currentRole} userName={currentRole === UserRole.TEACHER ? "Mrs. Sarah Thompson" : "Alex Mercer"} />
          )}

          {activeNavGroup === "workspace" && (
            <>
              {/* STUDENT WORKSPACE */}
              {currentRole === UserRole.STUDENT && (
                <StudentDashboard
                  progress={studentProgress}
                  onUpdateProgress={handleUpdateProgress}
                  assignments={assignments}
                  onUpdateAssignments={handleUpdateAssignments}
                  subjects={subjects}
                  onAddLogMessage={addLogMessage}
                />
              )}

              {/* TEACHER WORKSPACE */}
              {currentRole === UserRole.TEACHER && (
                <TeacherDashboard
                  assignments={assignments}
                  onUpdateAssignments={handleUpdateAssignments}
                  subjects={subjects}
                  onAddSubject={handleAddSubject}
                  onAddTopic={handleAddTopic}
                  onAddStudyMaterial={handleAddStudyMaterial}
                  onAddLogMessage={addLogMessage}
                />
              )}

              {/* PARENT WORKSPACE */}
              {currentRole === UserRole.PARENT && (
                <ParentDashboard
                  progress={studentProgress}
                  assignments={assignments}
                />
              )}

              {/* ADMIN WORKSPACE (Platform Settings & Backups) */}
              {currentRole === UserRole.ADMIN && (
                <div id="admin-desk" className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-6 animate-fadeIn">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-4">
                    <div>
                      <h2 className="text-lg font-black text-gray-800 tracking-tight">Super Administrator Control Centre</h2>
                      <p className="text-xs text-gray-400 mt-1">Syllabus versioning, billing structures, and platform performance audits.</p>
                    </div>

                    <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold shrink-0">
                      <button
                        onClick={() => setAdminTab("analytics")}
                        className={`px-3 py-1.5 rounded-lg cursor-pointer transition ${adminTab === "analytics" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"}`}
                      >
                        System Analytics
                      </button>
                      <button
                        id="admin-tab-creator"
                        onClick={() => setAdminTab("creator")}
                        className={`px-3 py-1.5 rounded-lg cursor-pointer transition ${adminTab === "creator" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"}`}
                      >
                        Academic Creator Hub
                      </button>
                    </div>
                  </div>

                  {adminTab === "analytics" ? (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 rounded-xl border border-gray-200 bg-slate-50">
                          <span className="text-[10px] text-gray-400 font-bold block mb-1 uppercase">Platform Subscribers</span>
                          <span className="text-xl font-bold text-gray-850">1,204 Active accounts</span>
                        </div>

                        <div className="p-4 rounded-xl border border-gray-200 bg-slate-50">
                          <span className="text-[10px] text-gray-400 font-bold block mb-1 uppercase">Syllabus compliance standard</span>
                          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded uppercase inline-block mt-1">
                            CAIE Syllabus 2026 Compatible
                          </span>
                        </div>

                        <div className="p-4 rounded-xl border border-gray-200 bg-slate-50">
                          <span className="text-[10px] text-gray-400 font-bold block mb-1 uppercase">Monthly premium subscription fee</span>
                          <span className="text-sm font-black text-slate-800">Stripe Gateway: $14.99/mo</span>
                        </div>
                      </div>

                      <div className="p-4.5 rounded-xl border border-rose-100 bg-rose-50/50 flex gap-3 text-rose-950">
                        <HardDrive className="w-5 h-5 text-rose-700 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-bold text-xs leading-none">Database Backup & Curriculum Control</h4>
                          <p className="text-[11px] leading-relaxed mt-2 text-rose-900">
                            All local revision notes, MCQ problems, active assignments, and grading metrics are securely cached in localized memory blocks. Platform expands easily to A-Levels or IB curricula without changing any structural schemas because nodes are indexed by modular tags.
                          </p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
                      {/* Form to submit New Subject */}
                      <form onSubmit={handleAdminAddSubjectSubmit} className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-4">
                        <div className="flex items-center gap-2 border-b border-slate-205 pb-2">
                          <Plus className="w-4 h-4 text-rose-600" />
                          <h4 className="text-xs font-extrabold uppercase text-slate-700 tracking-wide">Register New General Subject</h4>
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Subject / Curriculum Name</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Geography or English Literature"
                            value={adminSubName}
                            onChange={(e) => setAdminSubName(e.target.value)}
                            className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-blue-600"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Subject Category</label>
                            <select
                              value={adminSubCat}
                              onChange={(e: any) => setAdminSubCat(e.target.value)}
                              className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2"
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
                            <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Syllabus code</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. 0460"
                              value={adminSubCode}
                              onChange={(e) => setAdminSubCode(e.target.value)}
                              className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2 focus:outline-none font-mono"
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          className="w-full bg-slate-900 text-white text-xs py-2 rounded-xl hover:bg-slate-800 font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" /> Publish New Subject
                        </button>
                      </form>

                      {/* Form to submit New Topic under Subject */}
                      <form onSubmit={handleAdminAddTopicSubmit} className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-4">
                        <div className="flex items-center gap-2 border-b border-slate-205 pb-2">
                          <Plus className="w-4 h-4 text-indigo-600" />
                          <h4 className="text-xs font-extrabold uppercase text-slate-700 tracking-wide">Register New syllabus Topic</h4>
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Target Subject Class</label>
                          <select
                            value={adminTopicSubId}
                            onChange={(e) => setAdminTopicSubId(e.target.value)}
                            className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2.5 outline-none"
                          >
                            {subjects.map(s => (
                              <option key={s.id} value={s.id}>{s.name} ({s.syllabusCode})</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Syllabus Chapter / Topic Title</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Plate Tectonics or Cell Organization"
                            value={adminTopicName}
                            onChange={(e) => setAdminTopicName(e.target.value)}
                            className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2.5 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Detailed subtopics (comma separated)</label>
                          <input
                            type="text"
                            placeholder="e.g. Crust movement, fault lines, tsunamis"
                            value={adminSubtopics}
                            onChange={(e) => setAdminSubtopics(e.target.value)}
                            className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2.5 focus:outline-none"
                          />
                        </div>

                        <button
                          type="submit"
                          className="w-full bg-slate-900 text-white text-xs py-2 rounded-xl hover:bg-slate-800 font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" /> Publish New Topic
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Real-time Diagnostics Event Log Footer (proving roll interactions!) */}
      <footer className="bg-slate-900 border-t border-slate-800 py-6 px-6 text-white text-xs mt-12 w-full">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-4 space-y-2">
            <div className="flex items-center gap-1.5">
              <Activity className="w-4.5 h-4.5 text-emerald-500 animate-pulse" />
              <span className="font-extrabold uppercase tracking-widest text-[10px] text-slate-400">
                Sandbox Event Synchronization Log
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-normal">
              Observe real-time logs updating when you evaluate student answers as a teacher or clear practices as a student. This confirms consistent state logic.
            </p>
          </div>

          <div className="lg:col-span-8 bg-slate-950 rounded-xl p-3 border border-slate-800 h-32 overflow-y-auto font-mono text-[11px] leading-relaxed text-emerald-400 space-y-1">
            {activityLogs.map((log, index) => (
              <p key={index}>{log}</p>
            ))}
          </div>
        </div>

        <div className="max-w-7xl mx-auto border-t border-slate-800 mt-6 pt-4 flex flex-col md:flex-row justify-between text-slate-450 text-[10px] text-slate-500">
          <span>Cambridge Assessment IGCSE Prep Portal • Built via AI Studio Developer Environment</span>
          <span>Security & User Privacy Protected by Role-Based Encryption</span>
        </div>
      </footer>
    </div>
  );
}
