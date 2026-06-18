import React, { useState } from "react";
import { ForumPost, UserRole, Subject } from "../types";
import { FORUM_THREADS, SUBJECTS } from "../mockData";
import { MessageSquare, Heart, Send, Plus, Award, Share2 } from "lucide-react";

interface StudentForumProps {
  currentRole: UserRole;
  userName: string;
}

export default function StudentForum({ currentRole, userName }: StudentForumProps) {
  const [threads, setThreads] = useState<ForumPost[]>(FORUM_THREADS);
  const [selectedSubject, setSelectedSubject] = useState<string | undefined>(undefined);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newPostSubject, setNewPostSubject] = useState<string>("");
  const [activeReplyThreadId, setActiveReplyThreadId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleLike = (threadId: string) => {
    setThreads(prev =>
      prev.map(t => {
        if (t.id === threadId) {
          const alreadyLiked = t.likedBy.includes(userName);
          const newLikedBy = alreadyLiked
            ? t.likedBy.filter(u => u !== userName)
            : [...t.likedBy, userName];
          return {
            ...t,
            likes: alreadyLiked ? t.likes - 1 : t.likes + 1,
            likedBy: newLikedBy
          };
        }
        return t;
      })
    );
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const newPost: ForumPost = {
      id: `post-${Date.now()}`,
      subjectId: newPostSubject ? newPostSubject : undefined,
      title: newTitle,
      content: newContent,
      authorName: userName,
      authorRole: currentRole,
      createdAt: new Date().toISOString(),
      likes: 0,
      likedBy: [],
      replies: []
    };

    setThreads([newPost, ...threads]);
    setNewTitle("");
    setNewContent("");
    setNewPostSubject("");
    setShowCreateForm(false);
  };

  const handleAddReply = (threadId: string) => {
    if (!replyText.trim()) return;

    setThreads(prev =>
      prev.map(t => {
        if (t.id === threadId) {
          return {
            ...t,
            replies: [
              ...t.replies,
              {
                id: `rep-${Date.now()}`,
                authorName: userName,
                authorRole: currentRole,
                content: replyText,
                createdAt: new Date().toISOString()
              }
            ]
          };
        }
        return t;
      })
    );
    setReplyText("");
    setActiveReplyThreadId(null);
  };

  const filteredThreads = selectedSubject
    ? threads.filter(t => t.subjectId === selectedSubject)
    : threads;

  return (
    <div id="forum-parent" className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-blue-700 via-blue-900 to-slate-900 p-6 rounded-2xl text-white shadow-md">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight font-display">Cambridge Study Circle</h2>
          <p className="text-blue-105 text-blue-105 text-blue-100 text-sm mt-1 font-medium">
            Exchange revision tips, peer-explain past paper answers, and share expert insights.
          </p>
        </div>
        <button
          id="btn-trigger-new-post"
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="flex items-center gap-2 bg-white hover:bg-slate-100 text-blue-900 font-bold text-sm px-4 py-2.5 rounded-xl shadow-sm hover:scale-102 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 text-blue-600" />
          Create Theme Topic
        </button>
      </div>

      {/* Filter Categories */}
      <div className="flex flex-wrap items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
        <button
          key="all"
          id="filter-all-btn"
          onClick={() => setSelectedSubject(undefined)}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
            selectedSubject === undefined
              ? "bg-blue-600 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-150/70"
          }`}
        >
          All Discussions
        </button>
        {SUBJECTS.map(sub => (
          <button
            key={sub.id}
            id={`filter-${sub.id}-btn`}
            onClick={() => setSelectedSubject(sub.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              selectedSubject === sub.id
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-150/70"
            }`}
          >
            {sub.name} ({sub.syllabusCode})
          </button>
        ))}
      </div>

      {showCreateForm && (
        <form onSubmit={handleCreatePost} className="bg-white border text-xs border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 animate-fadeIn">
          <div className="flex justify-between items-center pb-2 border-b border-slate-200">
            <h3 className="font-extrabold text-slate-800 font-display">Start new Revision Thread</h3>
            <span className="text-xs bg-blue-50 text-blue-700 font-semibold px-2.5 py-0.5 rounded-full font-mono">
              Publishing as {userName} ({currentRole})
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">Subject Link (Optional)</label>
              <select
                id="select-post-sub"
                value={newPostSubject}
                onChange={e => setNewPostSubject(e.target.value)}
                className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">General (General study hacks & support)</option>
                {SUBJECTS.map(s => (
                  <option key={s.id} value={s.id}>{s.name} (Syllabus {s.syllabusCode})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">Engaging Question Heading</label>
              <input
                id="input-post-title"
                type="text"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                placeholder="e.g. Best way to solve electrolysis calculations?"
                className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">Discussion Body / Paste Code or Formula</label>
            <textarea
              id="input-post-content"
              value={newContent}
              onChange={e => setNewContent(e.target.value)}
              placeholder="Break down your struggles, attach mock screenshots details or copy formula steps."
              rows={4}
              className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            ></textarea>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="px-4 py-2 text-xs text-slate-500 hover:bg-slate-100 rounded-lg font-bold cursor-pointer font-sans"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer shadow-md shadow-blue-600/10"
            >
              <Send className="w-4 h-4" />
              Publish Thread
            </button>
          </div>
        </form>
      )}

      {/* Threads List */}
      <div className="space-y-4">
        {filteredThreads.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400 font-medium">
            <MessageSquare className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p className="font-bold text-slate-600">No topics under this subject yet.</p>
            <p className="text-xs mt-1">Be the first to raise a question or request revision support!</p>
          </div>
        ) : (
          filteredThreads.map(thread => {
            const subject = SUBJECTS.find(s => s.id === thread.subjectId);
            const userLiked = thread.likedBy.includes(userName);

            return (
              <div
                key={thread.id}
                id={`thread-post-${thread.id}`}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:border-blue-300 hover:shadow-xs transition-all animate-fadeIn"
              >
                {/* Meta details */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-extrabold tracking-wide text-slate-550 text-slate-500 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded">
                      {subject ? `${subject.name} (${subject.syllabusCode})` : "General Study Guide"}
                    </span>
                    <span className="text-xs text-slate-400">Published by</span>
                    <span className="text-xs font-bold text-slate-700">{thread.authorName}</span>
                    <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded uppercase ${
                      thread.authorRole === UserRole.TEACHER
                        ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                        : thread.authorRole === UserRole.PARENT
                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                        : "bg-blue-50 text-blue-700 border border-blue-200"
                    }`}>
                      {thread.authorRole}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">
                    {new Date(thread.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </span>
                </div>

                {/* Content */}
                <h3 className="text-lg font-bold text-slate-900 tracking-tight leading-snug font-display">
                  {thread.title}
                </h3>
                <p className="text-sm text-slate-600 mt-2 whitespace-pre-wrap leading-relaxed">
                  {thread.content}
                </p>

                {/* Engagement counts */}
                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-100">
                  <button
                    id={`btn-like-${thread.id}`}
                    onClick={() => handleLike(thread.id)}
                    className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      userLiked
                        ? "bg-rose-50 text-rose-600 border border-rose-100"
                        : "bg-slate-50 text-slate-500 border border-transparent hover:bg-slate-100"
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${userLiked ? "fill-current" : ""}`} />
                    {thread.likes} {thread.likes === 1 ? "Like" : "Likes"}
                  </button>

                  <button
                    id={`btn-reply-toggle-${thread.id}`}
                    onClick={() => {
                      setActiveReplyThreadId(activeReplyThreadId === thread.id ? null : thread.id);
                      setReplyText("");
                    }}
                    className="flex items-center gap-1.5 bg-blue-50 text-blue-800 border border-blue-100 hover:bg-blue-100 text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4" />
                    {thread.replies.length} {thread.replies.length === 1 ? "Reply" : "Replies"}
                  </button>
                </div>

                {/* Replies container */}
                {thread.replies.length > 0 && (
                  <div className="mt-4 pl-4 border-l-2 border-slate-200 space-y-4">
                    {thread.replies.map(rep => (
                      <div key={rep.id} className="bg-slate-50/70 p-3 rounded-xl border border-slate-200/50 hover:bg-slate-50 transition-colors">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-700">{rep.authorName}</span>
                            <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase ${
                              rep.authorRole === UserRole.TEACHER
                                ? "bg-indigo-50 text-indigo-700"
                                : rep.authorRole === UserRole.PARENT
                                ? "bg-amber-50 text-amber-700"
                                : "bg-blue-50 text-blue-700"
                            }`}>
                              {rep.authorRole}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {new Date(rep.createdAt).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit"
                            })}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 mt-1 whitespace-pre-wrap leading-relaxed font-sans">
                          {rep.content}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Write reply */}
                {activeReplyThreadId === thread.id && (
                  <div className="mt-4 flex items-center gap-2 pt-3 border-t border-slate-100">
                    <input
                      id={`input-reply-${thread.id}`}
                      type="text"
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      placeholder="Type your academic reply / explanatory feedback..."
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
                      onKeyDown={e => e.key === "Enter" && handleAddReply(thread.id)}
                    />
                    <button
                      id={`btn-send-reply-${thread.id}`}
                      onClick={() => handleAddReply(thread.id)}
                      className="bg-blue-600 text-white p-2 rounded-lg hover:scale-105 cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
