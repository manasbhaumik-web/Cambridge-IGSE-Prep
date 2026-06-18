import React from "react";
import { UserRole } from "../types";
import { GraduationCap, Users, User, Settings, ShieldAlert } from "lucide-react";

interface RoleSwitcherProps {
  currentRole: UserRole;
  onChangeRole: (role: UserRole) => void;
}

export default function RoleSwitcher({ currentRole, onChangeRole }: RoleSwitcherProps) {
  const roles = [
    {
      id: UserRole.STUDENT,
      name: "Student Portal",
      description: "Practice questions, view badges, and chat with AI Tutor",
      icon: GraduationCap,
      color: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
      activeColor: "bg-emerald-600 text-white shadow-emerald-200/50"
    },
    {
      id: UserRole.TEACHER,
      name: "Teacher Portal",
      description: "Manage assignments, grade papers, and view student analytics",
      icon: Users,
      color: "bg-indigo-50 text-indigo-700 hover:bg-indigo-100",
      activeColor: "bg-indigo-600 text-white shadow-indigo-200/50"
    },
    {
      id: UserRole.PARENT,
      name: "Parent Dashboard",
      description: "Track predicted grades, streaks, and focus progress",
      icon: User,
      color: "bg-amber-50 text-amber-700 hover:bg-amber-100",
      activeColor: "bg-amber-600 text-white shadow-amber-200/50"
    },
    {
      id: UserRole.ADMIN,
      name: "Admin Desk",
      description: "Inspect curriculum modules and approval workflows",
      icon: Settings,
      color: "bg-rose-50 text-rose-700 hover:bg-rose-100",
      activeColor: "bg-rose-600 text-white shadow-rose-200/50"
    }
  ];

  return (
    <div id="role-switcher-container" className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm mb-6">
      <div className="flex items-center gap-2 mb-3">
        <ShieldAlert className="w-5 h-5 text-gray-500 animate-pulse" />
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
          Evaluator Sandbox Interface: Switch User Roles
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {roles.map((role) => {
          const Icon = role.icon;
          const isActive = currentRole === role.id;

          return (
            <button
              key={role.id}
              id={`role-btn-${role.id}`}
              onClick={() => onChangeRole(role.id)}
              className={`flex items-start text-left p-3 rounded-xl border border-transparent transition-all duration-300 ${
                isActive
                  ? `${role.activeColor} shadow-md scale-[1.02]`
                  : `${role.color} cursor-pointer`
              }`}
            >
              <div className={`p-2 rounded-lg mr-3 ${isActive ? "bg-white/20" : "bg-white"}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm tracking-tight">{role.name}</h4>
                <p className={`text-xs mt-0.5 leading-relaxed ${isActive ? "text-white/80" : "text-gray-500"}`}>
                  {role.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
