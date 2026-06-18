import React from "react";
import { StudentProgress, Assignment, Subject } from "../types";
import { SUBJECTS } from "../mockData";
import { Award, Heart, Shield, TrendingUp, Calendar, ArrowUpRight, Flame, AlertCircle, FileText, Sparkles } from "lucide-react";

interface ParentDashboardProps {
  progress: StudentProgress;
  assignments: Assignment[];
}

export default function ParentDashboard({ progress, assignments }: ParentDashboardProps) {
  // Calculate average scores and predicted grades based on graded assignments
  const gradedSubmissions = assignments.flatMap(a =>
    a.submissions.filter(sub => sub.studentId === progress.userId && sub.graded)
  );

  const totalScore = gradedSubmissions.reduce((sum, s) => sum + (s.score || 0), 0);
  const maxScore = gradedSubmissions.reduce((sum, s) => sum + s.maxScore, 0);
  const averagePercentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 78;

  // Predict IGCSE standard letters (A*, A, B, C, D, E, U)
  let predictedGrade = "B";
  let gradeColor = "text-indigo-650 bg-indigo-50 border-indigo-250";
  if (averagePercentage >= 90) {
    predictedGrade = "A*";
    gradeColor = "text-emerald-700 bg-emerald-50 border-emerald-250";
  } else if (averagePercentage >= 80) {
    predictedGrade = "A";
    gradeColor = "text-teal-700 bg-teal-50 border-teal-250";
  } else if (averagePercentage >= 70) {
    predictedGrade = "B";
    gradeColor = "text-blue-700 bg-blue-50 border-blue-250";
  } else if (averagePercentage >= 60) {
    predictedGrade = "C";
    gradeColor = "text-amber-700 bg-amber-50 border-amber-250";
  }

  // Study hours or activity points count
  const mockWeeklyActivity = [
    { day: "Mon", hr: 1.5, active: true },
    { day: "Tue", hr: 2.1, active: true },
    { day: "Wed", hr: 0.8, active: true },
    { day: "Thu", hr: 3.0, active: true },
    { day: "Fri", hr: 1.2, active: true },
    { day: "Sat", hr: 0.5, active: false },
    { day: "Sun", hr: 0.0, active: false }
  ];

  return (
    <div id="parent-dashboard" className="space-y-6">
      {/* Bio Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-blue-700 via-blue-900 to-slate-900 p-6 rounded-2xl text-white shadow-md">
        <div>
          <span className="text-[10px] bg-blue-500 text-white font-extrabold uppercase px-2.5 py-1 rounded-full tracking-wider font-mono">
            Parent Support Dashboard
          </span>
          <h2 className="text-xl font-bold tracking-tight mt-2.5 font-display">Alex Mercer (IGCSE Year 11)</h2>
          <p className="text-blue-200 text-xs mt-0.5 font-medium">Academic Growth Monitor paired with Cambridge Syllabi</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white/10 p-2 px-3 rounded-xl text-center border border-white/15">
            <span className="text-[10px] text-blue-200 block font-semibold uppercase tracking-wider">Daily Streak</span>
            <div className="flex items-center gap-1 text-amber-400 justify-center font-black mt-0.5">
              <Flame className="w-4 h-4 fill-current animate-pulse" />
              <span>{progress.streakDays} Days</span>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Predicted Grade Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">Predicted Board Grade</h4>
            <Sparkles className="w-4 h-4 text-blue-600" />
          </div>

          <div className="flex items-center gap-4">
            <div className={`text-4xl font-extrabold w-16 h-16 rounded-2xl flex items-center justify-center border-2 ${gradeColor} shrink-0 font-display`}>
              {predictedGrade}
            </div>
            <div>
              <p className="text-sm font-bold text-gray-850">Overall Mastery: {averagePercentage}%</p>
              <p className="text-xs text-slate-500 mt-1">Excellent standing. Tending towards an {predictedGrade} grade for CAIE Board Exams.</p>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200/50 rounded-xl p-3 text-xs text-slate-500">
            <span className="font-semibold text-slate-700 block mb-1">Target benchmark:</span>
            Consistent practice of paper-style questions will yield key assessment objectives.
          </div>
        </div>

        {/* Exam Readiness Scale */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">Exam Readiness Meter</h4>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-baseline text-xs font-bold text-slate-600">
              <span>Diagnostic Level</span>
              <span className="text-blue-600">82% Prepared</span>
            </div>

            {/* Preparation bar */}
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full animate-pulse" style={{ width: "82%" }}></div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed mt-2 block font-medium">
              Calculated based on timed practices, multiple-choice error weights, and mock structured papers.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 bg-blue-50/50 p-2.5 rounded-lg border border-blue-100/30">
            <Shield className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Exceeds national average by 14%</span>
          </div>
        </div>

        {/* Weekly study time chart (HTML/css driven) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">Weekly revision hours</h4>
            <Calendar className="w-4 h-4 text-blue-600" />
          </div>

          <div className="flex items-end justify-between h-20 pt-2 border-b border-slate-150">
            {mockWeeklyActivity.map((d, index) => {
              const heightPercentage = Math.round((d.hr / 3.0) * 100);
              return (
                <div key={index} className="flex flex-col items-center flex-1 group relative">
                  <div className="text-[9px] font-bold text-gray-500 mb-1 opacity-0 group-hover:opacity-100 absolute -top-5 bg-slate-900 text-white px-1 rounded transition duration-200">
                    {d.hr}h
                  </div>
                  <div
                    className={`w-3.5 rounded-t transition-all duration-500 ${
                      d.active ? "bg-blue-650 hover:bg-blue-700" : "bg-slate-200"
                    }`}
                    style={{ height: `${heightPercentage}%` }}
                  ></div>
                  <span className="text-[10px] text-slate-400 font-bold mt-1.5">{d.day}</span>
                </div>
              );
            })}
          </div>

          <p className="text-[10px] text-slate-400 text-center font-medium">Average study time: 1.3 hours/day</p>
        </div>
      </div>

      {/* Subject Coverage Progress and Advisory */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Class level mastery lists */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-extrabold text-slate-800 tracking-tight font-display">Syllabus Completion Checklist</h3>

          <div className="space-y-4 pt-2">
            {SUBJECTS.map(sub => {
              const completedTopics = progress.completedModules[sub.id] || [];
              const totalTopics = sub.topics.length;
              const coveragePercentage = Math.round((completedTopics.length / totalTopics) * 100);

              return (
                <div key={sub.id} className="space-y-1">
                  <div className="flex justify-between items-baseline text-xs leading-none">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-700">{sub.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">({sub.syllabusCode})</span>
                    </div>
                    <span className="font-bold text-slate-500 font-mono">{coveragePercentage}% ({completedTopics.length}/{totalTopics} Topics)</span>
                  </div>

                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all duration-500"
                      style={{ width: `${coveragePercentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Revision Advice & Notification */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-slate-850 text-slate-800 tracking-tight font-display font-display">AI Diagnostic Guardian Tips</h3>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">Recommendations on supporting Alex's study schedule at home.</p>
          </div>

          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-blue-50/50 border border-blue-105 border-blue-100 flex gap-2.5">
              <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5 animate-pulse" />
              <div>
                <h5 className="font-bold text-xs text-blue-900 leading-none">Chemistry: States of Matter</h5>
                <p className="text-[11px] text-slate-400 text-blue-800 leading-relaxed mt-1.5 font-medium">
                  Alex struggled with heating curve flatline responses recently. Encourage him to practice structured Paper 4 explanations using examiner keywords like "latent thermal fusion" and "vibrational resonance" over general descriptions.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-100 flex gap-2.5">
              <Sparkles className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <h5 className="font-bold text-xs text-emerald-950 leading-none">Biology: Palisade Cell Structure</h5>
                <p className="text-[11px] text-gray-500 text-emerald-800 leading-relaxed mt-1.5">
                  Excellent work! Alex has achieved 100% mastery on cell diagram questions. A positive reinforcement like celebrating his level up will maintain this focus for upcoming Physics wave modules!
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 text-[10px] text-slate-400 flex justify-between items-center bg-slate-50 p-2.5 rounded-lg">
            <span>Server notifications synced real-time</span>
            <span className="font-bold text-blue-700 hover:text-blue-850 hover:underline cursor-pointer">View detail history logs →</span>
          </div>
        </div>
      </div>
    </div>
  );
}
