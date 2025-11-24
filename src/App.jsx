import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { 
  Zap, Heart, Trophy, BookOpen, CheckCircle, XCircle, 
  Flame, Loader, AlertCircle, User, Play
} from 'lucide-react';

// Assets
import robotStatic from './assets/adlingo robot static.png';
import robotThinking from './assets/adlingo robot thinking.png';
import robotDisappointed from './assets/adlingo robot dissapointed.png';

// --- FIREBASE CONFIG ---
// For this prototype, we are using mock data, but the structure is ready for Firebase.
const firebaseConfig = {
  apiKey: "Paste_Your_API_Key_Here",
  authDomain: "project.firebaseapp.com",
  projectId: "project",
};

// Init Firebase (Safe check for re-initialization)
// const app = initializeApp(firebaseConfig);
// const auth = getAuth(app);
// const db = getFirestore(app);

// --- 🛠️ IMPROVED CURRICULUM DATA 🛠️ ---
const COURSE_DATA = [
  {
    id: 1,
    title: "Unit 1: The Hook (0-3s)",
    description: "Stop the scroll or die trying.",
    color: "bg-green-500",
    levels: [
      {
        id: "l1",
        title: "Visual Pacing",
        icon: "⚡",
        description: "Identify slow cuts.",
        xOffset: 0, // Center
        questions: [
          {
            type: "video_choice",
            question: "Which clip has better retention pacing?",
            media: {
              a: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM2Q.../giphy.gif", // Placeholder
              b: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjEx.../giphy.gif"
            },
            options: [
              { text: "Clip A (Slow Zoom)", correct: false },
              { text: "Clip B (Snap Zoom)", correct: true }
            ],
            directorNote: "Clip A is too passive. Clip B uses a 'Snap Zoom' which forces the eye to refocus, resetting the user's attention span."
          },
          {
            type: "choice",
            question: "What is the max duration for a static frame?",
            options: [
              { text: "2 Seconds", correct: true },
              { text: "5 Seconds", correct: false }
            ],
            directorNote: "On TikTok/Reels, anything over 2s without movement causes a 40% drop-off."
          }
        ]
      },
      {
        id: "l2",
        title: "Pattern Interrupts",
        icon: "🪝",
        description: "Breaking expectations.",
        xOffset: 40, // Shift Right
        questions: []
      },
      {
        id: "l3",
        title: "Audio Swells",
        icon: "🔊",
        description: "Using SFX to hide cuts.",
        xOffset: -40, // Shift Left
        questions: []
      }
    ]
  },
  {
    id: 2,
    title: "Unit 2: The Hold (3-15s)",
    description: "Structuring the narrative payoff.",
    color: "bg-purple-500",
    levels: [
      { id: "l4", title: "B-Roll Timing", icon: "🎞️", xOffset: 0, questions: [] },
      { id: "l5", title: "Text Stacking", icon: "T", xOffset: 40, questions: [] },
    ]
  }
];

const RANKS = [
  { name: "Intern", minXp: 0, bonus: "Base Rate" },
  { name: "Jr. Editor", minXp: 100, bonus: "+5% Bonus" },
  { name: "Retention God", minXp: 500, bonus: "+20% & RevShare" },
];

// --- COMPONENTS ---
const App = () => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('home');
  const [activeLevel, setActiveLevel] = useState(null);

  // Auth & Data Sync Logic
  useEffect(() => {
    // Mock User for MVP
    const mockUser = {
        xp: 120, streak: 3, hearts: 5, completedLevels: ['l1'], 
        displayName: "Demo Editor", email: "editor@agency.com"
    };
    setUserData(mockUser);
    setUser({ uid: '123' });
    setLoading(false);
  }, []);

  const updateStats = (newStats) => {
    setUserData(prev => ({...prev, ...newStats}));
    // In real app: setDoc(doc(db, "editors", user.uid), newStats, { merge: true });
  };

  if (loading) return <div className="h-screen bg-gray-900 flex items-center justify-center text-white"><Loader className="animate-spin"/></div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans mx-auto border-x border-gray-800 relative flex flex-col max-w-md md:max-w-3xl lg:max-w-4xl">
      
      {/* HEADER */}
      {view !== 'lesson' && (
        <header className="sticky top-0 z-20 bg-gray-900/95 backdrop-blur border-b border-gray-800 p-4 flex justify-between items-center shadow-md">
          <div className="flex items-center space-x-2">
             {/* Small Logo Robot */}
             <img src={robotStatic} alt="Adlingo Bot" className="w-10 h-10 object-contain" />
             <div className="font-black text-xl tracking-tighter italic bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
              ADLINGO
            </div>
          </div>
          <div className="flex space-x-4 font-bold text-sm">
             <div className="text-orange-500 flex items-center" title="Day Streak"><Flame size={18} className="mr-1 fill-current"/>{userData?.streak || 0}</div>
             <div className="text-blue-400 flex items-center" title="CPM (Coins Per Minute)"><Zap size={18} className="mr-1 fill-current"/>{userData?.xp || 0}</div>
             <div className="text-red-500 flex items-center" title="Render Credits"><Heart size={18} className="mr-1 fill-current"/>{userData?.hearts || 5}</div>
          </div>
        </header>
      )}

      {/* MAIN VIEW SWITCHER */}
      <main className="flex-1 overflow-y-auto pb-24 scrollbar-hide">
        {view === 'home' && (
          <HomeView 
            courseData={COURSE_DATA} 
            userData={userData} 
            onStartLevel={(lvl) => { setActiveLevel(lvl); setView('lesson'); }} 
          />
        )}
        {view === 'lesson' && activeLevel && (
           <LessonEngine 
             level={activeLevel} 
             userData={userData}
             onComplete={(xp) => {
               updateStats({ 
                 xp: userData.xp + xp, 
                 completedLevels: [...new Set([...userData.completedLevels, activeLevel.id])] 
               });
               setView('home');
             }} 
             onExit={() => setView('home')} 
             loseHeart={() => updateStats({ hearts: Math.max(0, userData.hearts - 1) })}
           /> 
        )}
        {view === 'profile' && <ProfileView userData={userData} user={user} />}
      </main>

      {/* BOTTOM NAV */}
      {view !== 'lesson' && (
        <nav className="fixed bottom-0 w-full max-w-md md:max-w-3xl lg:max-w-4xl bg-gray-900 border-t border-gray-800 flex justify-around p-4 pb-6 z-30 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] backdrop-blur-md bg-opacity-95">
          <NavBtn icon={BookOpen} active={view === 'home'} onClick={() => setView('home')} />
          <NavBtn icon={Trophy} active={false} onClick={() => {}} />
          <NavBtn icon={User} active={view === 'profile'} onClick={() => setView('profile')} />
        </nav>
      )}
    </div>
  );
};

// --- SUB-VIEWS ---
const HomeView = ({ courseData, userData, onStartLevel }) => {
  return (
    <div className="p-4 md:p-8 space-y-8 md:space-y-12 relative">
      {/* Current Rank Banner */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-800/50 p-4 md:p-6 rounded-xl border border-gray-700 shadow-lg max-w-2xl mx-auto relative overflow-hidden">
        <div className="relative z-10 flex justify-between items-center">
          <div>
            <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">Current Rate</div>
            <div className="text-lg font-black text-white">
              {RANKS.findLast(r => userData.xp >= r.minXp)?.bonus || "Base Rate"}
            </div>
          </div>
          <div className="h-12 w-12 bg-yellow-500 rounded-full flex items-center justify-center text-yellow-900 font-bold text-xl shadow-lg shadow-yellow-500/20">
            $
          </div>
        </div>
        {/* Decorative Robot */}
         <img src={robotThinking} className="absolute -right-4 -bottom-8 w-24 h-24 opacity-20 rotate-12 object-contain grayscale" />
      </div>

      {courseData.map((unit) => (
        <div key={unit.id} className="relative max-w-2xl mx-auto">
           {/* Unit Header */}
           <div className={`p-6 rounded-2xl mb-10 ${unit.color} text-white shadow-[0_6px_0_0_rgba(0,0,0,0.2)] border-b-4 border-black/10 relative overflow-hidden`}>
             <div className="relative z-10">
                <h2 className="font-black text-xl uppercase tracking-wider">{unit.title}</h2>
                <p className="opacity-90 text-sm font-medium mt-1">{unit.description}</p>
             </div>
             <Zap size={80} className="absolute -right-4 -bottom-4 opacity-20 rotate-12 text-black" />
           </div>

           {/* The Winding Path */}
           <div className="flex flex-col items-center relative pb-10">
              {/* SVG Connector Line Layer */}
              <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-0 overflow-visible">
                <path 
                  d={generatePath(unit.levels)} 
                  fill="none" 
                  stroke="#374151" 
                  strokeWidth="8" 
                  strokeLinecap="round"
                  strokeDasharray="16 16"
                  className="drop-shadow-md"
                />
              </svg>

              {/* Level Nodes */}
              {unit.levels.map((level, idx) => {
                const isCompleted = userData.completedLevels.includes(level.id);
                // Check if locked: locked if not completed AND previous level in this unit is not completed
                const isLocked = !isCompleted && idx > 0 && !userData.completedLevels.includes(unit.levels[idx-1].id);
                
                return (
                  <div 
                    key={level.id} 
                    style={{ 
                        transform: `translateX(${level.xOffset}px)`,
                        marginTop: idx === 0 ? '0' : '2rem' 
                    }} 
                    className="z-10 relative group flex flex-col items-center"
                  >
                    <button 
                      onClick={() => !isLocked && onStartLevel(level)}
                      disabled={isLocked}
                      className={`
                        w-24 h-24 rounded-[2rem] flex items-center justify-center text-3xl
                        transition-all duration-150 active:translate-y-2 active:shadow-none
                        ${isCompleted 
                          ? 'bg-yellow-400 border-b-8 border-yellow-600 shadow-[0_8px_0_0_rgba(202,138,4,1)]' 
                          : isLocked
                            ? 'bg-gray-700 border-b-8 border-gray-800 shadow-[0_8px_0_0_rgba(31,41,55,1)] opacity-70 cursor-not-allowed'
                            : 'bg-green-500 border-b-8 border-green-700 shadow-[0_8px_0_0_rgba(21,128,61,1)] hover:bg-green-400'}
                      `}
                    >
                      {isCompleted ? <CheckCircle className="text-yellow-900" size={36} strokeWidth={3} /> : level.icon}
                    </button>
                    
                    {/* Floating Label */}
                    <div className="mt-3 bg-gray-900/90 border border-gray-700 px-3 py-1.5 rounded-lg shadow-lg backdrop-blur-sm">
                      <span className={`text-xs font-bold uppercase tracking-wide ${isLocked ? 'text-gray-500' : 'text-white'}`}>
                        {level.title}
                      </span>
                    </div>
                  </div>
                );
              })}
           </div>
        </div>
      ))}
    </div>
  );
};

// --- INTERACTIVE LESSON ENGINE ---
const LessonEngine = ({ level, onComplete, onExit, loseHeart, userData }) => {
  const [qIndex, setQIndex] = useState(0);
  const [status, setStatus] = useState('idle'); // idle, success, error
  const [selectedOpt, setSelectedOpt] = useState(null);
  
  // Safety check for empty levels
  if (!level.questions || level.questions.length === 0) {
    return (
      <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col items-center justify-center p-8 text-center">
        <h2 className="text-2xl font-bold mb-4 text-white">Under Construction 🚧</h2>
        <p className="text-gray-400 mb-6">This module is being edited by the Chief Editor.</p>
        <button onClick={onExit} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-500 transition">Go Back</button>
      </div>
    );
  }

  const q = level.questions[qIndex];
  const progress = ((qIndex) / level.questions.length) * 100;

  const handleCheck = () => {
    if (selectedOpt === null) return;
    const isCorrect = q.options[selectedOpt].correct;
    setStatus(isCorrect ? 'success' : 'error');
    if (!isCorrect) loseHeart();
  };

  const handleNext = () => {
    if (qIndex + 1 < level.questions.length) {
      setQIndex(i => i + 1);
      setStatus('idle');
      setSelectedOpt(null);
    } else {
      onComplete(20); // XP Reward
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-gray-900 flex flex-col font-sans text-white">
      {/* Top Bar */}
      <div className="px-4 py-6 flex items-center gap-4 max-w-4xl mx-auto w-full">
        <button onClick={onExit} className="p-2 hover:bg-gray-800 rounded-full transition"><XCircle className="text-gray-400 hover:text-white" size={28} /></button>
        <div className="flex-1 h-4 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
          <div className="h-full bg-green-500 transition-all duration-500 ease-out" style={{ width: `${progress}%` }}></div>
        </div>
        <div className="text-red-500 font-bold flex items-center bg-red-500/10 px-3 py-1 rounded-full"><Heart size={20} className="mr-2 fill-current"/>{userData.hearts}</div>
      </div>

      {/* Content Scroll Area */}
      <div className="flex-1 overflow-y-auto p-6 pb-40 max-w-2xl mx-auto w-full">
        
        {/* Robot Reaction Area */}
        <div className="flex justify-center mb-6">
           <div className="w-32 h-32 relative">
              {/* Standard State (Thinking/Waiting) */}
              <img 
                src={robotThinking} 
                className={`w-full h-full object-contain transition-all duration-300 ${status !== 'idle' ? 'opacity-0 scale-90 absolute' : 'opacity-100 scale-100'}`}
              />
              
              {/* Success State (Using Static Happy) */}
              <img 
                src={robotStatic} 
                className={`w-full h-full object-contain transition-all duration-300 ${status === 'success' ? 'opacity-100 scale-110 animate-bounce' : 'opacity-0 scale-90 absolute'}`}
              />

              {/* Error State */}
              <img 
                src={robotDisappointed} 
                className={`w-full h-full object-contain transition-all duration-300 ${status === 'error' ? 'opacity-100 scale-100 animate-shake' : 'opacity-0 scale-90 absolute'}`}
              />
           </div>
        </div>

        <h2 className="text-2xl md:text-3xl font-black text-center mb-8 leading-tight">{q.question}</h2>

        {/* Video Type Handling */}
        {q.type === 'video_choice' && (
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-black rounded-2xl aspect-video flex items-center justify-center border-2 border-gray-700 relative overflow-hidden group cursor-pointer hover:border-gray-500 transition">
               <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                   <Play size={40} className="text-gray-500 opacity-50" />
               </div>
               <span className="absolute bottom-2 left-2 bg-black/70 px-2 py-1 rounded text-gray-300 font-bold text-xs">CLIP A</span>
            </div>
            <div className="bg-black rounded-2xl aspect-video flex items-center justify-center border-2 border-gray-700 relative overflow-hidden group cursor-pointer hover:border-gray-500 transition">
               <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                   <Play size={40} className="text-gray-500 opacity-50" />
               </div>
               <span className="absolute bottom-2 left-2 bg-black/70 px-2 py-1 rounded text-gray-300 font-bold text-xs">CLIP B</span>
            </div>
          </div>
        )}

        {/* Options */}
        <div className="space-y-4">
          {q.options.map((opt, idx) => (
            <button
              key={idx}
              disabled={status !== 'idle'}
              onClick={() => setSelectedOpt(idx)}
              className={`
                w-full p-5 rounded-2xl border-b-4 text-left font-bold text-lg transition-all transform active:scale-[0.98]
                ${selectedOpt === idx 
                  ? 'border-blue-500 bg-blue-500/10 text-blue-300' 
                  : 'border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-750 hover:border-gray-600'}
                ${status === 'success' && opt.correct ? '!border-green-500 !bg-green-500/20 !text-green-400' : ''}
                ${status === 'error' && selectedOpt === idx ? '!border-red-500 !bg-red-500/20 !text-red-400' : ''}
              `}
            >
              <div className="flex items-center">
                 <div className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center mr-4 text-base font-black
                    ${selectedOpt === idx ? 'border-blue-500 text-blue-500' : 'border-gray-600 text-gray-600'}
                    ${status === 'success' && opt.correct ? '!border-green-500 !text-green-500' : ''}
                    ${status === 'error' && selectedOpt === idx ? '!border-red-500 !text-red-500' : ''}
                 `}>
                   {String.fromCharCode(65+idx)}
                 </div>
                 {opt.text}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Action Sheet (Contextual Feedback) */}
      <div className={`fixed bottom-0 w-full border-t transition-colors duration-300 z-50 ${
        status === 'success' ? 'bg-green-900/90 border-green-600' : 
        status === 'error' ? 'bg-red-900/90 border-red-600' : 'bg-gray-900/95 border-gray-800'
      } backdrop-blur-lg`}>
        
        <div className="max-w-2xl mx-auto p-4 md:p-6">
            {status === 'error' && q.directorNote && (
            <div className="mb-6 animate-fade-in-up">
                <div className="font-bold text-red-200 flex items-center mb-2"><AlertCircle size={20} className="mr-2"/> Creative Director's Note:</div>
                <p className="text-base text-red-100 bg-red-950/50 p-4 rounded-xl border border-red-800/50 leading-relaxed">
                "{q.directorNote}"
                </p>
            </div>
            )}
            {status === 'success' && (
            <div className="mb-6 text-green-300 font-black text-xl flex items-center animate-bounce">
                <CheckCircle className="mr-3 w-8 h-8" /> Clean Cut! Great job.
            </div>
            )}
            <button 
            onClick={status === 'idle' ? handleCheck : handleNext}
            disabled={selectedOpt === null}
            className={`
                w-full py-4 rounded-2xl font-black text-lg tracking-widest uppercase shadow-lg transition-all
                ${status === 'idle' 
                ? 'bg-green-500 hover:bg-green-400 text-white shadow-green-900 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed'
                : status === 'success' ? 'bg-white text-green-700 shadow-white/20' : 'bg-white text-red-700 shadow-white/20'
                }
            `}
            >
            {status === 'idle' ? 'Check Edit' : 'Next Clip'}
            </button>
        </div>
      </div>
    </div>
  );
};

const ProfileView = ({ userData, user }) => (
  <div className="p-8 max-w-2xl mx-auto">
    <div className="flex items-center space-x-4 mb-8">
         <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center border-4 border-blue-400 shadow-xl overflow-hidden">
            <img src={robotStatic} className="w-full h-full object-contain p-2" />
         </div>
         <div>
             <h1 className="text-3xl font-black">Editor One</h1>
             <p className="text-gray-400">Joined September 2025</p>
         </div>
    </div>
    
    <h1 className="text-xl font-black mb-4 uppercase text-gray-500 tracking-wider">Live Stats</h1>
    <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-xl overflow-hidden">
        <pre className="text-xs text-green-400 font-mono overflow-auto">{JSON.stringify(userData, null, 2)}</pre>
    </div>
    <div className="mt-8 text-center text-gray-500 text-sm">
        Synced with HQ Database
    </div>
  </div>
);

// --- UTILS ---
const NavBtn = ({ icon: Icon, active, onClick }) => (
  <button onClick={onClick} className={`p-3 rounded-2xl transition-all duration-200 transform active:scale-90 ${active ? 'bg-blue-500/20 text-blue-400' : 'text-gray-500 hover:bg-gray-800 hover:text-gray-300'}`}>
    <Icon size={28} strokeWidth={active ? 3 : 2.5} />
  </button>
);

// Improved Path Generator
const generatePath = (levels) => {
  if (!levels || levels.length < 2) return "";
  
  // Constants matching our CSS layout
  // Button height 96px (h-24) + Gap 32px (2rem) = ~128px vertical step
  // Center is 50% of container width.
  
  // We can't easily know the width in pixels in this helper without passing refs.
  // So we use percentage for X and relative units for Y? 
  // SVG paths don't mix % and px well in 'd'. 
  // We will assume a standard width coordinate system where 0 is center, 
  // or we assume the SVG viewBox is e.g. 0 0 200 1000 where 100 is center.
  
  // Let's assume a coordinate system of 100 units wide, centered at 50.
  const CENTER_X = 50; 
  const VERTICAL_STEP = 130; // Approx pixels per level
  const X_SCALE = 0.5; // Scale the xOffset to fit in our 100-unit width system

  let path = "";
  
  levels.forEach((lvl, i) => {
    if (i === 0) return;
    const prev = levels[i-1];
    
    const startX = CENTER_X + (prev.xOffset * X_SCALE);
    const startY = (i - 1) * VERTICAL_STEP + 48; // +48 to start from center of button (h-24/2)
    
    const endX = CENTER_X + (lvl.xOffset * X_SCALE);
    const endY = i * VERTICAL_STEP + 48;
    
    // Control points for Bezier curve (S-shape)
    const cp1X = startX;
    const cp1Y = startY + (VERTICAL_STEP * 0.5);
    const cp2X = endX;
    const cp2Y = endY - (VERTICAL_STEP * 0.5);
    
    if (i === 1) {
        path += `M ${startX} ${startY} `;
    }
    
    path += `C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${endX} ${endY} `;
  });
  
  return path;
};

export default App;
