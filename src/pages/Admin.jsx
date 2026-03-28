import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Plus, Trash2, GripVertical, Save, ChevronDown, ChevronRight,
  Video, Image, FileText, CheckCircle, X, BookOpen, Map, Link, ExternalLink
} from 'lucide-react';
import { getWorlds, saveWorlds, generateId } from '../data/courseData';
import { checkAdminPassword, getStoredAuth } from '../services/auth';

export default function Admin() {
  const navigate = useNavigate();
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState('');
  const [pwError, setPwError] = useState(false);
  const [worlds, setWorlds] = useState([]);
  const [expandedWorld, setExpandedWorld] = useState(null);
  const [expandedLesson, setExpandedLesson] = useState(null);
  const [saved, setSaved] = useState(false);
  const [adminTab, setAdminTab] = useState('course'); // 'course' or 'tests'

  useEffect(() => {
    // Auto-auth if logged in as admin email
    const auth = getStoredAuth();
    if (auth?.email?.endsWith('@aditor.ai')) {
      setAuthed(true);
    }
  }, []);

  useEffect(() => {
    if (authed) setWorlds(getWorlds());
  }, [authed]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (checkAdminPassword(password)) {
      setAuthed(true);
    } else {
      setPwError(true);
    }
  };

  const handleSave = () => {
    saveWorlds(worlds);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // World CRUD
  const addWorld = () => {
    const id = 'w' + generateId();
    const newWorld = {
      id,
      name: 'New World',
      subtitle: 'SUBTITLE',
      themeColor: 'from-orange-600 to-amber-500',
      bgColor: 'bg-gradient-to-br from-orange-900/40 to-amber-900/20',
      borderColor: 'border-orange-500/30',
      accentColor: 'text-orange-400',
      order: worlds.length + 1,
      imageUrl: null,
      description: '',
      unlockAfterWorld: worlds.length > 0 ? worlds[worlds.length - 1].id : null,
      lessons: [],
    };
    setWorlds([...worlds, newWorld]);
    setExpandedWorld(id);
  };

  const updateWorld = (worldId, field, value) => {
    setWorlds(worlds.map((w) => (w.id === worldId ? { ...w, [field]: value } : w)));
  };

  const deleteWorld = (worldId) => {
    if (!confirm('Delete this world and all its lessons?')) return;
    setWorlds(worlds.filter((w) => w.id !== worldId));
  };

  // Lesson CRUD
  const addLesson = (worldId) => {
    const world = worlds.find((w) => w.id === worldId);
    const id = 'l' + generateId();
    const newLesson = {
      id,
      title: 'New Lesson',
      subtitle: '',
      order: world.lessons.length + 1,
      videoUrl: null,
      videoType: null,
      questions: [],
    };
    updateWorld(worldId, 'lessons', [...world.lessons, newLesson]);
    setExpandedLesson(id);
  };

  const updateLesson = (worldId, lessonId, field, value) => {
    const world = worlds.find((w) => w.id === worldId);
    const updated = world.lessons.map((l) =>
      l.id === lessonId ? { ...l, [field]: value } : l
    );
    updateWorld(worldId, 'lessons', updated);
  };

  const deleteLesson = (worldId, lessonId) => {
    if (!confirm('Delete this lesson?')) return;
    const world = worlds.find((w) => w.id === worldId);
    updateWorld(worldId, 'lessons', world.lessons.filter((l) => l.id !== lessonId));
  };

  // Question CRUD
  const addQuestion = (worldId, lessonId, type = 'text') => {
    const world = worlds.find((w) => w.id === worldId);
    const lesson = world.lessons.find((l) => l.id === lessonId);
    const id = 'q' + generateId();
    const newQ = {
      id,
      type,
      question: '',
      options: [
        { text: '', correct: true, imageUrl: type === 'image' ? '' : undefined },
        { text: '', correct: false, imageUrl: type === 'image' ? '' : undefined },
        { text: '', correct: false, imageUrl: type === 'image' ? '' : undefined },
        { text: '', correct: false, imageUrl: type === 'image' ? '' : undefined },
      ],
      directorNote: '',
    };
    updateLesson(worldId, lessonId, 'questions', [...lesson.questions, newQ]);
  };

  const updateQuestion = (worldId, lessonId, qId, updates) => {
    const world = worlds.find((w) => w.id === worldId);
    const lesson = world.lessons.find((l) => l.id === lessonId);
    const updated = lesson.questions.map((q) =>
      q.id === qId ? { ...q, ...updates } : q
    );
    updateLesson(worldId, lessonId, 'questions', updated);
  };

  const deleteQuestion = (worldId, lessonId, qId) => {
    const world = worlds.find((w) => w.id === worldId);
    const lesson = world.lessons.find((l) => l.id === lessonId);
    updateLesson(worldId, lessonId, 'questions', lesson.questions.filter((q) => q.id !== qId));
  };

  const updateOption = (worldId, lessonId, qId, optIdx, field, value) => {
    const world = worlds.find((w) => w.id === worldId);
    const lesson = world.lessons.find((l) => l.id === lessonId);
    const q = lesson.questions.find((q) => q.id === qId);
    const updatedOpts = q.options.map((o, i) => {
      if (field === 'correct') {
        return { ...o, correct: i === optIdx };
      }
      return i === optIdx ? { ...o, [field]: value } : o;
    });
    updateQuestion(worldId, lessonId, qId, { options: updatedOpts });
  };

  // Theme presets
  const THEMES = [
    { label: 'Orange', themeColor: 'from-orange-600 to-amber-500', bgColor: 'bg-gradient-to-br from-orange-900/40 to-amber-900/20', borderColor: 'border-orange-500/30', accentColor: 'text-orange-400' },
    { label: 'Cyan', themeColor: 'from-cyan-600 to-blue-500', bgColor: 'bg-gradient-to-br from-cyan-900/40 to-blue-900/20', borderColor: 'border-cyan-500/30', accentColor: 'text-cyan-400' },
    { label: 'Purple', themeColor: 'from-purple-600 to-violet-500', bgColor: 'bg-gradient-to-br from-purple-900/40 to-violet-900/20', borderColor: 'border-purple-500/30', accentColor: 'text-purple-400' },
    { label: 'Pink', themeColor: 'from-pink-600 to-rose-500', bgColor: 'bg-gradient-to-br from-pink-900/40 to-rose-900/20', borderColor: 'border-pink-500/30', accentColor: 'text-pink-400' },
    { label: 'Green', themeColor: 'from-emerald-600 to-green-500', bgColor: 'bg-gradient-to-br from-emerald-900/40 to-green-900/20', borderColor: 'border-emerald-500/30', accentColor: 'text-emerald-400' },
    { label: 'Red', themeColor: 'from-red-600 to-rose-500', bgColor: 'bg-gradient-to-br from-red-900/40 to-rose-900/20', borderColor: 'border-red-500/30', accentColor: 'text-red-400' },
  ];

  // Password gate
  if (!authed) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-6">
        <form onSubmit={handleLogin} className="max-w-sm w-full">
          <h1 className="text-2xl font-black mb-6 text-center">Admin Portal</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setPwError(false); }}
            placeholder="Enter admin password"
            className={`w-full px-4 py-3 bg-gray-900 border rounded-xl text-white placeholder-gray-600 focus:outline-none mb-3 ${pwError ? 'border-red-500' : 'border-gray-700 focus:border-orange-500'}`}
            autoFocus
          />
          {pwError && <p className="text-red-400 text-sm mb-3">Wrong password</p>}
          <button
            type="submit"
            className="w-full py-3 bg-orange-500 text-white font-black rounded-xl uppercase tracking-wider text-sm"
          >
            Enter
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Top bar */}
      <div className="sticky top-0 z-50 bg-gray-950/95 backdrop-blur-xl border-b border-gray-800/50 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="p-2 rounded-lg hover:bg-gray-800 transition">
            <ArrowLeft size={20} className="text-gray-400" />
          </button>
          <h1 className="font-black text-lg">Admin Portal</h1>
        </div>
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${
            saved ? 'bg-emerald-500 text-white' : 'bg-orange-500 hover:bg-orange-400 text-white'
          }`}
        >
          {saved ? <CheckCircle size={16} /> : <Save size={16} />}
          {saved ? 'Saved!' : 'Save All'}
        </button>
      </div>

      {/* Tab toggle */}
      <div className="max-w-3xl mx-auto px-4 pt-4">
        <div className="flex gap-1 bg-gray-900 rounded-xl p-1 border border-gray-800">
          <button
            onClick={() => setAdminTab('course')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${
              adminTab === 'course'
                ? 'bg-orange-500 text-white shadow-lg'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <BookOpen size={15} />
            Course Videos
          </button>
          <button
            onClick={() => setAdminTab('tests')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${
              adminTab === 'tests'
                ? 'bg-orange-500 text-white shadow-lg'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Map size={15} />
            Test Questions
          </button>
        </div>
      </div>

      {/* Course Videos Tab */}
      {adminTab === 'course' && (
        <div className="max-w-3xl mx-auto p-4 space-y-4">
          <p className="text-gray-500 text-xs">Add video URLs for each lesson. Supports Loom, YouTube, Tella, and Vimeo.</p>

          {worlds.sort((a, b) => a.order - b.order).map((world) => (
            <div key={world.id} className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
              {/* World header */}
              <div className="flex items-center gap-3 p-4 border-b border-gray-800/50">
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${world.themeColor} flex items-center justify-center text-xs font-black text-white`}>
                  {world.order}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-sm">{world.name}</div>
                  <div className="text-xs text-gray-500">{world.lessons.length} lessons</div>
                </div>
              </div>

              {/* Lesson video list */}
              <div className="divide-y divide-gray-800/50">
                {world.lessons.sort((a, b) => a.order - b.order).map((lesson) => (
                  <div key={lesson.id} className="px-4 py-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{lesson.title}</span>
                      {lesson.videoUrl ? (
                        <span className="text-[9px] font-bold text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded uppercase">has video</span>
                      ) : (
                        <span className="text-[9px] font-bold text-gray-500 bg-gray-800 px-1.5 py-0.5 rounded uppercase">no video</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Link size={12} className="text-gray-600 shrink-0" />
                      <input
                        value={lesson.videoUrl || ''}
                        onChange={(e) => updateLesson(world.id, lesson.id, 'videoUrl', e.target.value || null)}
                        placeholder="Paste video URL (Loom, YouTube, Tella, Vimeo)..."
                        className="flex-1 px-2.5 py-2 bg-gray-800 border border-gray-700 rounded-lg text-xs text-white placeholder-gray-600 focus:outline-none focus:border-orange-500"
                      />
                      {lesson.videoUrl && (
                        <a
                          href={lesson.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-gray-500 hover:text-orange-400 transition shrink-0"
                        >
                          <ExternalLink size={14} />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tests Tab — existing full editor */}
      {adminTab === 'tests' && (
      <div className="max-w-3xl mx-auto p-4 space-y-4">
        {/* Worlds */}
        {worlds.sort((a, b) => a.order - b.order).map((world) => (
          <div key={world.id} className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
            {/* World header */}
            <button
              onClick={() => setExpandedWorld(expandedWorld === world.id ? null : world.id)}
              className="w-full flex items-center gap-3 p-4 hover:bg-gray-800/50 transition text-left"
            >
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${world.themeColor} flex items-center justify-center text-xs font-black text-white`}>
                {world.order}
              </div>
              <div className="flex-1">
                <div className="font-bold text-sm">{world.name}</div>
                <div className="text-xs text-gray-500">{world.lessons.length} lessons</div>
              </div>
              {expandedWorld === world.id ? <ChevronDown size={16} className="text-gray-500" /> : <ChevronRight size={16} className="text-gray-500" />}
            </button>

            {/* World expanded content */}
            {expandedWorld === world.id && (
              <div className="px-4 pb-4 space-y-4 border-t border-gray-800">
                {/* World settings */}
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1 block">World Name</label>
                    <input
                      value={world.name}
                      onChange={(e) => updateWorld(world.id, 'name', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1 block">Subtitle</label>
                    <input
                      value={world.subtitle}
                      onChange={(e) => updateWorld(world.id, 'subtitle', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs font-bold text-gray-500 mb-1 block">Description</label>
                    <input
                      value={world.description}
                      onChange={(e) => updateWorld(world.id, 'description', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs font-bold text-gray-500 mb-1 block">Cover Image URL</label>
                    <input
                      value={world.imageUrl || ''}
                      onChange={(e) => updateWorld(world.id, 'imageUrl', e.target.value || null)}
                      placeholder="https://..."
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs font-bold text-gray-500 mb-2 block">Theme</label>
                    <div className="flex gap-2 flex-wrap">
                      {THEMES.map((t) => (
                        <button
                          key={t.label}
                          onClick={() => {
                            updateWorld(world.id, 'themeColor', t.themeColor);
                            updateWorld(world.id, 'bgColor', t.bgColor);
                            updateWorld(world.id, 'borderColor', t.borderColor);
                            updateWorld(world.id, 'accentColor', t.accentColor);
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                            world.themeColor === t.themeColor
                              ? 'border-white bg-white/10 text-white'
                              : 'border-gray-700 text-gray-400 hover:border-gray-500'
                          }`}
                        >
                          <span className={`inline-block w-2 h-2 rounded-full bg-gradient-to-r ${t.themeColor} mr-1.5`} />
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Lessons */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Lessons</h3>
                    <button
                      onClick={() => addLesson(world.id)}
                      className="flex items-center gap-1 text-xs font-bold text-orange-400 hover:text-orange-300 transition"
                    >
                      <Plus size={14} /> Add Lesson
                    </button>
                  </div>

                  <div className="space-y-2">
                    {world.lessons.sort((a, b) => a.order - b.order).map((lesson) => (
                      <div key={lesson.id} className="bg-gray-800/50 rounded-xl border border-gray-700/50 overflow-hidden">
                        {/* Lesson header */}
                        <div className="flex items-center gap-2 p-3">
                          <button
                            onClick={() => setExpandedLesson(expandedLesson === lesson.id ? null : lesson.id)}
                            className="flex-1 flex items-center gap-2 text-left"
                          >
                            {expandedLesson === lesson.id ? <ChevronDown size={14} className="text-gray-500" /> : <ChevronRight size={14} className="text-gray-500" />}
                            <span className="text-sm font-bold">{lesson.title}</span>
                            <span className="text-xs text-gray-600">{lesson.questions.length}q</span>
                            {lesson.videoUrl && <Video size={12} className="text-orange-400" />}
                          </button>
                          <button onClick={() => deleteLesson(world.id, lesson.id)} className="p-1 text-gray-600 hover:text-red-400 transition">
                            <Trash2 size={14} />
                          </button>
                        </div>

                        {/* Lesson expanded */}
                        {expandedLesson === lesson.id && (
                          <div className="px-3 pb-3 space-y-3 border-t border-gray-700/50">
                            <div className="grid grid-cols-2 gap-2 mt-3">
                              <div>
                                <label className="text-[10px] font-bold text-gray-500 mb-1 block">Title</label>
                                <input
                                  value={lesson.title}
                                  onChange={(e) => updateLesson(world.id, lesson.id, 'title', e.target.value)}
                                  className="w-full px-2.5 py-1.5 bg-gray-900 border border-gray-700 rounded-lg text-xs text-white focus:outline-none focus:border-orange-500"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] font-bold text-gray-500 mb-1 block">Subtitle</label>
                                <input
                                  value={lesson.subtitle || ''}
                                  onChange={(e) => updateLesson(world.id, lesson.id, 'subtitle', e.target.value)}
                                  className="w-full px-2.5 py-1.5 bg-gray-900 border border-gray-700 rounded-lg text-xs text-white focus:outline-none focus:border-orange-500"
                                />
                              </div>
                              <div className="col-span-2">
                                <label className="text-[10px] font-bold text-gray-500 mb-1 block">Video URL (Loom, Tella, YouTube)</label>
                                <input
                                  value={lesson.videoUrl || ''}
                                  onChange={(e) => updateLesson(world.id, lesson.id, 'videoUrl', e.target.value || null)}
                                  placeholder="https://www.loom.com/share/..."
                                  className="w-full px-2.5 py-1.5 bg-gray-900 border border-gray-700 rounded-lg text-xs text-white placeholder-gray-600 focus:outline-none focus:border-orange-500"
                                />
                              </div>
                            </div>

                            {/* Questions */}
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Questions</h4>
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => addQuestion(world.id, lesson.id, 'text')}
                                    className="flex items-center gap-1 text-[10px] font-bold text-orange-400 hover:text-orange-300 bg-orange-400/10 px-2 py-1 rounded-lg transition"
                                  >
                                    <FileText size={10} /> Text Q
                                  </button>
                                  <button
                                    onClick={() => addQuestion(world.id, lesson.id, 'image')}
                                    className="flex items-center gap-1 text-[10px] font-bold text-cyan-400 hover:text-cyan-300 bg-cyan-400/10 px-2 py-1 rounded-lg transition"
                                  >
                                    <Image size={10} /> Image Q
                                  </button>
                                </div>
                              </div>

                              <div className="space-y-3">
                                {lesson.questions.map((q, qIdx) => (
                                  <div key={q.id} className="bg-gray-900 rounded-xl p-3 border border-gray-700/30">
                                    <div className="flex items-start justify-between mb-2">
                                      <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${q.type === 'image' ? 'text-cyan-400 bg-cyan-400/10' : 'text-orange-400 bg-orange-400/10'}`}>
                                        {q.type === 'image' ? 'Image Q' : 'Text Q'} #{qIdx + 1}
                                      </span>
                                      <button onClick={() => deleteQuestion(world.id, lesson.id, q.id)} className="text-gray-600 hover:text-red-400 transition">
                                        <Trash2 size={12} />
                                      </button>
                                    </div>

                                    <textarea
                                      value={q.question}
                                      onChange={(e) => updateQuestion(world.id, lesson.id, q.id, { question: e.target.value })}
                                      placeholder="Enter question..."
                                      rows={2}
                                      className="w-full px-2.5 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-xs text-white placeholder-gray-600 focus:outline-none focus:border-orange-500 resize-none mb-2"
                                    />

                                    {/* Options */}
                                    <div className="space-y-1.5">
                                      {q.options.map((opt, optIdx) => (
                                        <div key={optIdx} className="flex items-start gap-2">
                                          <button
                                            onClick={() => updateOption(world.id, lesson.id, q.id, optIdx, 'correct', true)}
                                            className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-1 transition ${
                                              opt.correct ? 'border-emerald-500 bg-emerald-500/20' : 'border-gray-600 hover:border-gray-400'
                                            }`}
                                          >
                                            {opt.correct && <CheckCircle size={10} className="text-emerald-400" />}
                                          </button>
                                          <div className="flex-1 space-y-1">
                                            <input
                                              value={opt.text}
                                              onChange={(e) => updateOption(world.id, lesson.id, q.id, optIdx, 'text', e.target.value)}
                                              placeholder={`Option ${String.fromCharCode(65 + optIdx)}...`}
                                              className="w-full px-2 py-1 bg-gray-800 border border-gray-700 rounded text-xs text-white placeholder-gray-600 focus:outline-none focus:border-orange-500"
                                            />
                                            {q.type === 'image' && (
                                              <input
                                                value={opt.imageUrl || ''}
                                                onChange={(e) => updateOption(world.id, lesson.id, q.id, optIdx, 'imageUrl', e.target.value)}
                                                placeholder="Image URL..."
                                                className="w-full px-2 py-1 bg-gray-800 border border-gray-700 rounded text-xs text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500"
                                              />
                                            )}
                                          </div>
                                        </div>
                                      ))}
                                    </div>

                                    {/* Director Note */}
                                    <textarea
                                      value={q.directorNote}
                                      onChange={(e) => updateQuestion(world.id, lesson.id, q.id, { directorNote: e.target.value })}
                                      placeholder="Director's Note (shown after answering)..."
                                      rows={2}
                                      className="w-full mt-2 px-2.5 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-xs text-white placeholder-gray-600 focus:outline-none focus:border-orange-500 resize-none"
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => deleteWorld(world.id)}
                  className="text-xs text-red-400/60 hover:text-red-400 transition"
                >
                  Delete World
                </button>
              </div>
            )}
          </div>
        ))}

        {/* Add world button */}
        <button
          onClick={addWorld}
          className="w-full py-4 rounded-2xl border-2 border-dashed border-gray-700 text-gray-500 hover:border-orange-500/50 hover:text-orange-400 transition flex items-center justify-center gap-2 font-bold text-sm"
        >
          <Plus size={18} /> Add World
        </button>
      </div>
      )}
    </div>
  );
}
