import React, { useState } from "react";
import { UserRole } from "../types";
import {
  GraduationCap,
  Users,
  User,
  Settings,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  Bookmark,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { motion } from "motion/react";

interface LoginPageProps {
  onLoginSuccess: (role: UserRole, email: string) => void;
}

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [email, setEmail] = useState("alex@cambridge.edu");
  const [password, setPassword] = useState("••••••••");
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.STUDENT);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const preseededAccounts = [
    {
      role: UserRole.STUDENT,
      name: "Alex Mercer",
      email: "alex@cambridge.edu",
      title: "IGCSE Year 11 Science Student",
      subtitle: "Review exams, complete worksheets & chat with AI Tutor",
      icon: GraduationCap,
      color: "border-emerald-200 bg-emerald-50/50 text-emerald-800 hover:border-emerald-300",
      activeColor: "ring-2 ring-emerald-500 border-emerald-500 bg-emerald-50",
      iconBg: "bg-emerald-100 text-emerald-700"
    },
    {
      role: UserRole.TEACHER,
      name: "Mrs. Sarah Thompson",
      email: "thompson@cambridge.edu",
      title: "Cambridge Curriculum Coordinator",
      subtitle: "Publish syllabus worksheets & review submitted student scripts",
      icon: Users,
      color: "border-indigo-200 bg-indigo-50/50 text-indigo-800 hover:border-indigo-300",
      activeColor: "ring-2 ring-indigo-500 border-indigo-500 bg-indigo-50",
      iconBg: "bg-indigo-100 text-indigo-700"
    },
    {
      role: UserRole.PARENT,
      name: "Paternal Guardian",
      email: "guardian@cambridge.edu",
      title: "Alex's Academic Supervisor",
      subtitle: "Monitor actual grades, focus logs, and test outcome trends",
      icon: User,
      color: "border-amber-200 bg-amber-50/50 text-amber-800 hover:border-amber-300",
      activeColor: "ring-2 ring-amber-500 border-amber-500 bg-amber-50",
      iconBg: "bg-amber-100 text-amber-750"
    },
    {
      role: UserRole.ADMIN,
      name: "Systems Controller",
      email: "admin@cambridge.edu",
      title: "Syllabus Compliance Admin",
      subtitle: "Inspect telemetry registers, local database states & audits",
      icon: Settings,
      color: "border-rose-200 bg-rose-50/50 text-rose-800 hover:border-rose-300",
      activeColor: "ring-2 ring-rose-500 border-rose-500 bg-rose-50",
      iconBg: "bg-rose-100 text-rose-700"
    }
  ];

  const handleSelectAccount = (acc: typeof preseededAccounts[0]) => {
    setEmail(acc.email);
    setPassword("password123");
    setSelectedRole(acc.role);
    setErrorMsg("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg("Please enter an email address.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    // Simulate standard latency authentication
    setTimeout(() => {
      // Validate or map user role based on email if typed manually
      let finalRole = selectedRole;
      if (email.includes("thompson")) {
        finalRole = UserRole.TEACHER;
      } else if (email.includes("guardian")) {
        finalRole = UserRole.PARENT;
      } else if (email.includes("admin")) {
        finalRole = UserRole.ADMIN;
      } else if (email.includes("alex")) {
        finalRole = UserRole.STUDENT;
      }

      setLoading(false);
      onLoginSuccess(finalRole, email);
    }, 850);
  };

  return (
    <div id="login-container" className="min-h-screen bg-slate-50 flex items-center justify-center p-4 md:p-8 select-none">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden transition-all duration-350">
        
        {/* Left Side: Brand visual welcome pane */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-8 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Subtle glowing spheres */}
          <div className="absolute -top-12 -left-12 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-emerald-500/15 rounded-full blur-3xl"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full border border-white/10 w-fit self-start backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-blue-300 fill-current" />
              <span className="text-[10px] font-bold tracking-widest uppercase font-mono text-slate-200">Pre-University Prep</span>
            </div>
            
            <div className="mt-12 space-y-4">
              <h1 className="text-3xl font-black font-display tracking-tight leading-none bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                Cambridge IGCSE
              </h1>
              <p className="text-xl font-bold font-display text-slate-100 tracking-tight">
                Role Isolated Workspace
              </p>
              <p className="text-xs text-slate-300 leading-relaxed max-w-sm">
                A unified diagnostic Sandbox. Access customized modules tailored for Learners, Educators, Parents, and Compliance Administrators.
              </p>
            </div>
          </div>

          <div className="relative z-10 pt-12 space-y-4 border-t border-white/10 mt-12 lg:mt-0">
            <div id="school-descriptor-capsule" className="space-y-3">
              <div className="flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-slate-300">
                  <span className="font-bold text-white">Full Role Independence:</span> Separate data pipelines mapped strictly to verified desks.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-slate-300">
                  <span className="font-bold text-white">Interactive State Syncing:</span> Grades validated as an educator immediately reflect on student dashboards.
                </p>
              </div>
            </div>
            <div className="text-[10px] text-slate-400 font-mono pt-4 leading-none select-none">
              Security Protocol Level: sandbox-mode
            </div>
          </div>
        </div>

        {/* Right Side: Account Selection & Form Login */}
        <div className="lg:col-span-7 p-6 md:p-10 flex flex-col justify-center space-y-6">
          <div>
            <h2 className="text-lg font-black text-gray-900 tracking-tight font-display">
              Welcome back to CAIE Sandbox
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Select an official account for rapid role simulation, or sign in manually.
            </p>
          </div>

          {/* Quick-Login Pre-seeded accounts */}
          <div className="space-y-2.5">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block select-none">
              Double Click or Click a profile Card to Select
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {preseededAccounts.map((acc) => {
                const Icon = acc.icon;
                const isSelected = selectedRole === acc.role && email === acc.email;
                return (
                  <button
                    key={acc.role}
                    type="button"
                    onClick={() => handleSelectAccount(acc)}
                    className={`p-3 text-left border rounded-xl transition-all duration-200 select-none cursor-pointer flex flex-col justify-between group ${
                      isSelected ? acc.activeColor : `${acc.color} hover:scale-[1.01] hover:shadow-xs`
                    }`}
                  >
                    <div className="flex items-start justify-between w-full">
                      <div className={`p-1.5 rounded-lg ${acc.iconBg} shrink-0`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-[9px] font-mono select-none font-extrabold bg-white/70 border border-slate-200 px-1.5 py-0.5 rounded shadow-2xs">
                        {acc.role.toUpperCase()}
                      </span>
                    </div>
                    <div className="mt-3">
                      <h4 className="font-bold text-xs text-gray-900 group-hover:text-blue-900">
                        {acc.name}
                      </h4>
                      <p className="text-[10px] text-gray-500 leading-normal mt-0.5">
                        {acc.subtitle}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="relative flex items-center justify-center py-1 select-none">
            <div className="absolute inset-x-0 h-px bg-gray-200"></div>
            <span className="relative bg-white px-3 text-[10px] font-bold text-gray-400 uppercase">
              Or Authenticate Manually
            </span>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-900 text-xs rounded-xl flex items-center gap-2 animate-shake">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span className="font-medium">{errorMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase block select-none">
                  Syllabus Registered Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium transition"
                    placeholder="name@cambridge.edu"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase block select-none">
                  Credential Pin
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-9 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium transition"
                    placeholder="Password PIN"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase block select-none">
                Target Desk Context (Role mapping target)
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[UserRole.STUDENT, UserRole.TEACHER, UserRole.PARENT, UserRole.ADMIN].map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setSelectedRole(role)}
                    className={`py-1.5 px-1 rounded-lg border text-center font-mono font-bold text-[9px] uppercase transition cursor-pointer select-none ${
                      selectedRole === role
                        ? "bg-slate-900 border-slate-900 text-white"
                        : "bg-white hover:bg-slate-50 border-slate-200 text-slate-600"
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-3 rounded-xl transition duration-200 cursor-pointer shadow-md shadow-blue-600/10 hover:shadow-lg flex items-center justify-center gap-1.5 hover:scale-[1.01]"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Verifying Session token...</span>
                </>
              ) : (
                <>
                  <span>Initialize {selectedRole.toUpperCase()} workspace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
