import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Plus, Trash2, GripVertical, Save, ChevronDown, ChevronRight,
  Video, Image, FileText, CheckCircle, X, BookOpen, Map, Link, ExternalLink,
  Users, RefreshCw, Search
} from 'lucide-react';
import { getWorlds, saveWorlds, generateId } from '../data/courseData';
import { checkAdminPassword } from '../services/auth';
import { getAllPlayers } from '../services/airtable';

export default function Admin() {
  const navigate = useNavigate();
  const [authed, setAuthed] = useState(() => {
    // Check if previously authenticated as admin this session
    const adminSession = sessionStorage.getItem('adlingo_admin_authed');
    return adminSession === 'true';
  });
  const [password, setPassword] = useState('');
  const [pwError, setPwError] = useState(false);
  const [worlds, setWorlds] = useState([]);
  const [expandedWorld, setExpandedWorld] = useState(null);
  const [expandedLesson, setExpandedLesson] = useState(null);
  const [saved, setSaved] = useState(false);
  const [adminTab, setAdminTab] = useState('course'); // 'course', 'tests', or 'progress'
  const [players, setPlayers] = useState([]);
  const [playersLoading, setPlayersLoading] = useState(false);
  const [playerSearch, setPlayerSearch] = useState('');

  useEffect(() => {
    if (authed) setWorlds(getWorlds());
  }, [authed]);

  // Load players when Progress tab is selected
  const loadPlayers = async () => {
    setPlayersLoading(true);
    try {
      const data = await getAllPlayers();
      setPlayers(data);
    } catch (err) {
      console.error('Failed to load players:', err);
    }
    setPlayersLoading(false);
  };

  useEffect(() => {
    if (authed && adminTab === 'progress' && players.length === 0) {
      loadPlayers();
    }
  }, [authed, adminTab]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (checkAdminPassword(password)) {
      setAuthed(true);
      sessionStorage.setItem('adlingo_admin_authed', 'true');
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
    if (!world) {
      console.error('World not found:', worldId);
      return;
    }
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
    if (!world) {
      console.error('World not found:', worldId);
      return;
    }
    const updated = world.lessons.map((l) =>
      l.id === lessonId ? { ...l, [field]: value } : l
    );
    updateWorld(worldId, 'lessons', updated);
  };

  const deleteLesson = (worldId, lessonId) => {
    if (!confirm('Delete this lesson?')) return;
    const world = worlds.find((w) => w.id === worldId);
    if (!world) {
      console.error('World not found:', worldId);
      return;
    }
    updateWorld(worldId, 'lessons', world.lessons.filter((l) => l.id !== lessonId));
  };

  // Question CRUD
  const addQuestion = (worldId, lessonId, type = 'text') => {
    const world = worlds.find((w) => w.id === worldId);
    if (!world) {
      console.error('World not found:', worldId);
      return;
    }
    const lesson = world.lessons.find((l) => l.id === lessonId);
    if (!lesson) {
      console.error('Lesson not found:', lessonId);
      return;
    }
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
    if (!world) {
      console.error('World not found:', worldId);
      return;
    }
    const lesson = world.lessons.find((l) => l.id === lessonId);
    if (!lesson) {
      console.error('Lesson not found:', lessonId);
      return;
    }
    const updated = lesson.questions.map((q) =>
      q.id === qId ? { ...q, ...updates } : q
    );
    updateLesson(worldId, lessonId, 'questions', updated);
  };

  const deleteQuestion = (worldId, lessonId, qId) => {
    const world = worlds.find((w) => w.id === worldId);
    if (!world) {
      console.error('World not found:', worldId);
      return;
    }
    const lesson = world.lessons.find((l) => l.id === lessonId);
    if (!lesson) {
      console.error('Lesson not found:', lessonId);
      return;
    }
    updateLesson(worldId, lessonId, 'questions', lesson.questions.filter((q) => q.id !== qId));
  };

  const updateOption = (worldId, lessonId, qId, optIdx, field, value) => {
    const world = worlds.find((w) => w.id === worldId);
    if (!world) {
      console.error('World not found:', worldId);
      return;
    }
    const lesson = world.lessons.find((l) => l.id === lessonId);
    if (!lesson) {
      console.error('Lesson not found:', lessonId);
      return;
    }
    const q = lesson.questions.find((q) => q.id === qId);
    if (!q) {
      console.error('Question not found:', qId);
      return;
    }
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
      <div className="min-h-screen bg-[#0B0B0D] text-white flex items-center justify-center p-6">
        <form onSubmit={handleLogin} className="max-w-sm w-full bg-[#111114] border border-white/[0.06] rounded-2xl p-6">
          <div className="meta-label text-gray-500 mb-2">Restricted · Admin only</div>
          <h1 className="text-2xl font-bold mb-5 tracking-tight">Admin portal</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setPwError(false); }}
            placeholder="Enter admin password"
            className={`w-full px-4 py-3 bg-[#1C1C20] border rounded-xl text-white placeholder-gray-600 focus:outline-none mb-3 transition ${pwError ? 'border-red-500' : 'border-white/[0.08] focus:border-[#FF6B35]'}`}
            autoFocus
          />
          {pwError && <p className="text-red-400 text-sm mb-3">Wrong password</p>}
          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-br from-[#FF6B35] to-[#C44D1E] text-white font-bold rounded-xl uppercase tracking-wider text-sm border-b-[3px] border-[#8A2F0F] active:border-b-0 active:translate-y-[3px] shadow-brand-glow transition-all"
          >
            Enter
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0B0D] text-white">
      {/* Top bar */}
      <div className="sticky top-0 z-50 bg-[#0B0B0D]/95 backdrop-blur-xl border-b border-white/[0.06] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="p-2 rounded-lg hover:bg-white/[0.05] transition">
            <ArrowLeft size={20} className="text-gray-400" />
          </button>
          <div>
            <div className="meta-label text-gray-500 leading-none">Aditor · Vol 01</div>
            <h1 className="font-semibold text-[16px] tracking-tight leading-tight">Admin portal</h1>
          </div>
        </div>
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${
            saved
              ? 'bg-emerald-500 text-white'
              : 'bg-gradient-to-br from-[#FF6B35] to-[#C44D1E] text-white border-b-[3px] border-[#8A2F0F] active:border-b-0 active:translate-y-[3px] shadow-brand-glow'
          }`}
        >
          {saved ? <CheckCircle size={16} /> : <Save size={16} />}
          {saved ? 'Saved' : 'Save all'}
        </button>
      </div>

      {/* Tab toggle */}
      <div className="max-w-3xl mx-auto px-4 pt-4">
        <div className="flex gap-1 bg-[#111114] rounded-xl p-1 border border-white/[0.06]">
          <TabButton active={adminTab === 'course'} onClick={() => setAdminTab('course')} icon={BookOpen} label="Course videos" />
          <TabButton active={adminTab === 'tests'} onClick={() => setAdminTab('tests')} icon={Map} label="Test questions" />
          <TabButton active={adminTab === 'progress'} onClick={() => setAdminTab('progress')} icon={Users} label="Progress" />
        </div>
      </div>

      {/* Course Videos Tab */}
      {adminTab === 'course' && (
        <div className="max-w-3xl mx-auto p-4 space-y-4">
          <p className="text-gray-500 text-xs">Manage lessons, videos, and images. Supports Loom, YouTube, Tella, and Vimeo.</p>

          {worlds.sort((a, b) => a.order - b.order).map((world) => (
            <div key={world.id} className="bg-[#111114] rounded-2xl border border-white/[0.06] overflow-hidden">
              {/* World header */}
              <button
                onClick={() => setExpandedWorld(expandedWorld === world.id ? null : world.id)}
                className="w-full flex items-center gap-3 p-4 hover:bg-white/[0.04] transition text-left"
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

              {expandedWorld === world.id && (
                <div className="border-t border-white/[0.05]">
                  {/* World settings */}
                  <div className="px-4 pt-3 pb-2 space-y-2">
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 mb-1 block">World Name</label>
                      <input
                        value={world.name}
                        onChange={(e) => updateWorld(world.id, 'name', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-[#17171B] border border-white/[0.08] rounded-lg text-xs text-white focus:outline-none focus:border-[#FF6B35]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 mb-1 block">Description</label>
                      <input
                        value={world.description}
                        onChange={(e) => updateWorld(world.id, 'description', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-[#17171B] border border-white/[0.08] rounded-lg text-xs text-white focus:outline-none focus:border-[#FF6B35]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 mb-1 block">Image URL <span className="text-gray-600 font-normal">(optional)</span></label>
                      <input
                        value={world.imageUrl || ''}
                        onChange={(e) => updateWorld(world.id, 'imageUrl', e.target.value || null)}
                        placeholder="https://..."
                        className="w-full px-2.5 py-1.5 bg-[#17171B] border border-white/[0.08] rounded-lg text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#FF6B35]"
                      />
                    </div>
                  </div>

                  {/* Lessons */}
                  <div className="divide-y divide-gray-800/50">
                    {world.lessons.sort((a, b) => a.order - b.order).map((lesson) => (
                      <div key={lesson.id} className="px-4 py-3 space-y-2">
                        <div className="flex items-center gap-2">
                          <input
                            value={lesson.title}
                            onChange={(e) => updateLesson(world.id, lesson.id, 'title', e.target.value)}
                            placeholder="Lesson title..."
                            className="flex-1 px-2.5 py-1.5 bg-[#17171B] border border-white/[0.08] rounded-lg text-sm font-bold text-white placeholder-gray-600 focus:outline-none focus:border-[#FF6B35]"
                          />
                          <button onClick={() => deleteLesson(world.id, lesson.id)} className="p-1.5 text-gray-600 hover:text-red-400 transition shrink-0">
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <Video size={12} className="text-gray-600 shrink-0" />
                          <input
                            value={lesson.videoUrl || ''}
                            onChange={(e) => updateLesson(world.id, lesson.id, 'videoUrl', e.target.value || null)}
                            placeholder="Video URL (Loom, YouTube, Tella, Vimeo)..."
                            className="flex-1 px-2.5 py-1.5 bg-[#17171B] border border-white/[0.08] rounded-lg text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#FF6B35]"
                          />
                          {lesson.videoUrl && (
                            <a href={lesson.videoUrl} target="_blank" rel="noopener noreferrer" className="p-1 text-gray-500 hover:text-[#FF6B35] transition shrink-0">
                              <ExternalLink size={14} />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add/delete lesson + world */}
                  <div className="px-4 py-3 border-t border-white/[0.05]">
                    <button
                      onClick={() => addLesson(world.id)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-white/[0.1] bg-white/[0.02] text-[12px] font-semibold text-gray-300 hover:border-[#FF6B35]/50 hover:text-white hover:bg-[#FF6B35]/5 transition"
                    >
                      <Plus size={14} /> Add lesson
                    </button>
                    <button
                      onClick={() => deleteWorld(world.id)}
                      className="meta-label mt-3 text-red-400/60 hover:text-red-400 transition"
                    >
                      Delete world
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Add world button */}
          <button
            onClick={addWorld}
            className="w-full py-4 rounded-2xl border-2 border-dashed border-white/[0.08] text-gray-500 hover:border-[#FF6B35]/60 hover:text-[#FF6B35] transition flex items-center justify-center gap-2 font-semibold text-sm tracking-tight"
          >
            <Plus size={18} /> Add world
          </button>
        </div>
      )}

      {/* Tests Tab — existing full editor */}
      {adminTab === 'tests' && (
      <div className="max-w-3xl mx-auto p-4 space-y-4">
        {/* Worlds */}
        {worlds.sort((a, b) => a.order - b.order).map((world) => (
          <div key={world.id} className="bg-[#111114] rounded-2xl border border-white/[0.06] overflow-hidden">
            {/* World header */}
            <button
              onClick={() => setExpandedWorld(expandedWorld === world.id ? null : world.id)}
              className="w-full flex items-center gap-3 p-4 hover:bg-white/[0.04] transition text-left"
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
              <div className="px-4 pb-4 space-y-4 border-t border-white/[0.06]">
                {/* World settings */}
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1 block">World Name</label>
                    <input
                      value={world.name}
                      onChange={(e) => updateWorld(world.id, 'name', e.target.value)}
                      className="w-full px-3 py-2 bg-[#17171B] border border-white/[0.08] rounded-lg text-sm text-white focus:outline-none focus:border-[#FF6B35]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1 block">Subtitle</label>
                    <input
                      value={world.subtitle}
                      onChange={(e) => updateWorld(world.id, 'subtitle', e.target.value)}
                      className="w-full px-3 py-2 bg-[#17171B] border border-white/[0.08] rounded-lg text-sm text-white focus:outline-none focus:border-[#FF6B35]"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs font-bold text-gray-500 mb-1 block">Description</label>
                    <input
                      value={world.description}
                      onChange={(e) => updateWorld(world.id, 'description', e.target.value)}
                      className="w-full px-3 py-2 bg-[#17171B] border border-white/[0.08] rounded-lg text-sm text-white focus:outline-none focus:border-[#FF6B35]"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs font-bold text-gray-500 mb-1 block">Cover Image URL</label>
                    <input
                      value={world.imageUrl || ''}
                      onChange={(e) => updateWorld(world.id, 'imageUrl', e.target.value || null)}
                      placeholder="https://..."
                      className="w-full px-3 py-2 bg-[#17171B] border border-white/[0.08] rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#FF6B35]"
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
                              : 'border-white/[0.08] text-gray-400 hover:border-gray-500'
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
                      <div key={lesson.id} className="bg-white/[0.04] rounded-xl border border-white/[0.06] overflow-hidden">
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
                          <div className="px-3 pb-3 space-y-3 border-t border-white/[0.06]">
                            <div className="grid grid-cols-2 gap-2 mt-3">
                              <div>
                                <label className="text-[10px] font-bold text-gray-500 mb-1 block">Title</label>
                                <input
                                  value={lesson.title}
                                  onChange={(e) => updateLesson(world.id, lesson.id, 'title', e.target.value)}
                                  className="w-full px-2.5 py-1.5 bg-[#111114] border border-white/[0.08] rounded-lg text-xs text-white focus:outline-none focus:border-[#FF6B35]"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] font-bold text-gray-500 mb-1 block">Subtitle</label>
                                <input
                                  value={lesson.subtitle || ''}
                                  onChange={(e) => updateLesson(world.id, lesson.id, 'subtitle', e.target.value)}
                                  className="w-full px-2.5 py-1.5 bg-[#111114] border border-white/[0.08] rounded-lg text-xs text-white focus:outline-none focus:border-[#FF6B35]"
                                />
                              </div>
                              <div className="col-span-2">
                                <label className="text-[10px] font-bold text-gray-500 mb-1 block">Video URL (Loom, Tella, YouTube)</label>
                                <input
                                  value={lesson.videoUrl || ''}
                                  onChange={(e) => updateLesson(world.id, lesson.id, 'videoUrl', e.target.value || null)}
                                  placeholder="https://www.loom.com/share/..."
                                  className="w-full px-2.5 py-1.5 bg-[#111114] border border-white/[0.08] rounded-lg text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#FF6B35]"
                                />
                              </div>
                            </div>

                            {/* Questions */}
                            <div>
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-baseline gap-2">
                                  <span className="meta-label text-gray-500">Questions</span>
                                  <span className="font-mono text-[11px] tabular-nums text-gray-400 font-semibold">
                                    {lesson.questions.length.toString().padStart(2, '0')}
                                  </span>
                                </div>
                              </div>

                              {/* Empty state */}
                              {lesson.questions.length === 0 && (
                                <div className="text-center py-6 px-4 rounded-xl border border-dashed border-white/[0.08] mb-3">
                                  <FileText size={20} className="text-gray-700 mx-auto mb-2" />
                                  <p className="text-[12px] text-gray-500 mb-3">No questions yet — add your first.</p>
                                </div>
                              )}

                              <div className="space-y-3">
                                {lesson.questions.map((q, qIdx) => (
                                  <div key={q.id} className="bg-[#111114] rounded-xl p-3 border border-white/[0.05]">
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
                                      className="w-full px-2.5 py-1.5 bg-[#17171B] border border-white/[0.08] rounded-lg text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#FF6B35] resize-none mb-2"
                                    />

                                    {/* Options */}
                                    <div className="space-y-1.5">
                                      {q.options.map((opt, optIdx) => (
                                        <div key={optIdx} className="flex items-start gap-2">
                                          <button
                                            onClick={() => updateOption(world.id, lesson.id, q.id, optIdx, 'correct', true)}
                                            className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-1 transition ${
                                              opt.correct ? 'border-emerald-500 bg-emerald-500/20' : 'border-white/[0.12] hover:border-gray-400'
                                            }`}
                                          >
                                            {opt.correct && <CheckCircle size={10} className="text-emerald-400" />}
                                          </button>
                                          <div className="flex-1 space-y-1">
                                            <input
                                              value={opt.text}
                                              onChange={(e) => updateOption(world.id, lesson.id, q.id, optIdx, 'text', e.target.value)}
                                              placeholder={`Option ${String.fromCharCode(65 + optIdx)}...`}
                                              className="w-full px-2 py-1 bg-[#17171B] border border-white/[0.08] rounded text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#FF6B35]"
                                            />
                                            {q.type === 'image' && (
                                              <input
                                                value={opt.imageUrl || ''}
                                                onChange={(e) => updateOption(world.id, lesson.id, q.id, optIdx, 'imageUrl', e.target.value)}
                                                placeholder="Image URL..."
                                                className="w-full px-2 py-1 bg-[#17171B] border border-white/[0.08] rounded text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#8FB9E6]"
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
                                      className="w-full mt-2 px-2.5 py-1.5 bg-[#17171B] border border-white/[0.08] rounded-lg text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#FF6B35] resize-none"
                                    />
                                  </div>
                                ))}
                              </div>

                              {/* Prominent add question row — split by type */}
                              <div className="mt-3 grid grid-cols-2 gap-2">
                                <button
                                  onClick={() => addQuestion(world.id, lesson.id, 'text')}
                                  className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-white/[0.1] bg-white/[0.02] text-[12px] font-semibold text-gray-300 hover:border-[#FF6B35]/50 hover:text-white hover:bg-[#FF6B35]/5 transition"
                                >
                                  <Plus size={13} />
                                  <FileText size={12} />
                                  Text question
                                </button>
                                <button
                                  onClick={() => addQuestion(world.id, lesson.id, 'image')}
                                  className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-white/[0.1] bg-white/[0.02] text-[12px] font-semibold text-gray-300 hover:border-[#8FB9E6]/50 hover:text-white hover:bg-[#8FB9E6]/5 transition"
                                >
                                  <Plus size={13} />
                                  <Image size={12} />
                                  Image question
                                </button>
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
          className="w-full py-4 rounded-2xl border-2 border-dashed border-white/[0.08] text-gray-500 hover:border-[#FF6B35]/60 hover:text-[#FF6B35] transition flex items-center justify-center gap-2 font-bold text-sm"
        >
          <Plus size={18} /> Add World
        </button>
      </div>
      )}

      {/* Progress Tab — Player progress from Airtable */}
      {adminTab === 'progress' && (
        <div className="max-w-4xl mx-auto p-4 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-gray-500 text-xs">Live editor progress from Airtable. Shows completed lessons and scores.</p>
            <button
              onClick={loadPlayers}
              disabled={playersLoading}
              className="flex items-center gap-1.5 text-xs font-bold text-orange-400 hover:text-orange-300 transition disabled:opacity-50"
            >
              <RefreshCw size={13} className={playersLoading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              value={playerSearch}
              onChange={(e) => setPlayerSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-9 pr-3 py-2.5 bg-[#111114] border border-white/[0.06] rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#FF6B35]"
            />
          </div>

          {playersLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : players.length === 0 ? (
            <div className="text-center py-16 text-gray-600 text-sm">No players found in Airtable.</div>
          ) : (
            <div className="space-y-3">
              {players
                .filter((p) => {
                  if (!playerSearch) return true;
                  const q = playerSearch.toLowerCase();
                  return (p.name || '').toLowerCase().includes(q) || (p.email || '').toLowerCase().includes(q);
                })
                .sort((a, b) => (b.progress?.xp || 0) - (a.progress?.xp || 0))
                .map((player) => {
                  const prog = player.progress || {};
                  const completed = prog.completedLessons || [];
                  const scores = prog.scores || {};
                  const courseWorlds = getWorlds().sort((a, b) => a.order - b.order);
                  const totalLessons = courseWorlds.reduce((sum, w) => sum + w.lessons.length, 0);
                  const progressPercent = totalLessons > 0 ? Math.round((completed.length / totalLessons) * 100) : 0;

                  const allDone = progressPercent === 100;
                  return (
                    <div
                      key={player.id}
                      className={`rounded-2xl overflow-hidden bg-[#111114] border transition-colors ${
                        allDone ? 'border-emerald-500/30' : 'border-white/[0.06] hover:border-white/[0.08]'
                      }`}
                    >
                      <div className="p-3.5">
                        {/* Header row: avatar · name/email · XP · % */}
                        <div className="flex items-center gap-2.5 mb-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-sm shrink-0 ${
                            allDone
                              ? 'bg-gradient-to-br from-emerald-500 to-teal-500'
                              : 'bg-gradient-to-br from-[#FF6B35] to-[#C44D1E]'
                          }`}>
                            {(player.name || '?')[0].toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-[14px] text-white truncate tracking-tight">{player.name || 'Unknown'}</div>
                            <div className="text-[11px] text-gray-500 truncate">{player.email}</div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="font-mono text-[12px] font-semibold tabular-nums text-yellow-400">{prog.xp || 0}<span className="text-[9px] text-yellow-400/60 ml-0.5"> XP</span></div>
                            <div className={`font-mono text-[11px] font-semibold tabular-nums ${allDone ? 'text-emerald-400' : 'text-gray-400'}`}>{progressPercent}%</div>
                          </div>
                        </div>

                        {/* Per-world rows — one line each */}
                        <div className="space-y-1">
                          {courseWorlds.map((world) => {
                            const worldLessons = world.lessons.sort((a, b) => a.order - b.order);
                            const total = worldLessons.length;
                            const worldDone = worldLessons.filter((l) => completed.includes(l.id)).length;
                            const worldComplete = total > 0 && worldDone === total;
                            const percent = total > 0 ? Math.round((worldDone / total) * 100) : 0;

                            return (
                              <div
                                key={world.id}
                                className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[12px] ${
                                  worldComplete
                                    ? 'bg-emerald-500/10 border border-emerald-500/20'
                                    : worldDone > 0
                                      ? 'bg-orange-500/5 border border-orange-500/15'
                                      : 'bg-white/[0.03] border border-white/[0.06]'
                                }`}
                              >
                                {/* Status dot */}
                                <div className="w-2 h-2 rounded-full shrink-0" style={{
                                  background: worldComplete
                                    ? '#10B981'
                                    : worldDone > 0
                                      ? '#F97316'
                                      : '#374151',
                                  boxShadow: worldComplete
                                    ? '0 0 6px rgba(16,185,129,0.5)'
                                    : worldDone > 0
                                      ? '0 0 6px rgba(249,115,22,0.4)'
                                      : 'none',
                                }} />

                                {/* World name */}
                                <div className={`flex-1 font-medium truncate ${
                                  worldComplete ? 'text-emerald-200' : worldDone > 0 ? 'text-orange-200' : 'text-gray-500'
                                }`}>
                                  {world.name}
                                </div>

                                {/* Inline mini progress bar */}
                                <div className="w-14 h-1.5 bg-black/30 rounded-full overflow-hidden shrink-0">
                                  <div
                                    className={`h-full rounded-full transition-all ${
                                      worldComplete ? 'bg-emerald-400' : worldDone > 0 ? 'bg-orange-400' : 'bg-gray-700'
                                    }`}
                                    style={{ width: `${percent}%` }}
                                  />
                                </div>

                                {/* Count */}
                                <div className={`font-mono font-semibold tabular-nums text-[11px] shrink-0 w-10 text-right ${
                                  worldComplete ? 'text-emerald-400' : worldDone > 0 ? 'text-orange-400' : 'text-gray-600'
                                }`}>
                                  {worldDone}/{total}
                                </div>

                                {worldComplete && <CheckCircle size={12} className="text-emerald-400 shrink-0" />}
                              </div>
                            );
                          })}
                        </div>

                        {/* Footer — totals */}
                        <div className="mt-2.5 pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-[10px]">
                          <div className="text-gray-500">
                            <span className="font-mono font-semibold text-gray-300 tabular-nums">{completed.length}</span>
                            <span className="text-gray-600">/{totalLessons} lessons</span>
                          </div>
                          <div className="text-gray-600">
                            {prog.lastActivity ? `Last: ${prog.lastActivity}` : 'Never started'}
                          </div>
                        </div>
                      </div>
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

function TabButton({ active, onClick, icon: Icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[13px] font-semibold tracking-tight transition-all ${
        active
          ? 'bg-gradient-to-br from-[#FF6B35] to-[#C44D1E] text-white shadow-brand-glow'
          : 'text-gray-400 hover:text-white'
      }`}
    >
      <Icon size={14} />
      {label}
    </button>
  );
}
