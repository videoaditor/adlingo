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

// --- 🛠️ PERFORMANCE VIDEO EDITOR CERTIFICATION 🛠️ ---
const COURSE_DATA = [
  {
    id: 1,
    title: "Level 1: The Core Philosophy",
    description: "Mindset shift from filmmaker to performance editor.",
    color: "bg-green-500",
    levels: [
      {
        id: "l1",
        title: "Algorithm Psychology",
        icon: "🧠",
        description: "How to think about viewers.",
        xOffset: 0,
        questions: [
          {
            type: "choice",
            question: "In performance marketing, what is the primary algorithmic goal regarding viewers who are NOT your target customer?",
            options: [
              { text: "Entertain them anyway to increase the video's overall 'Viral Score'", correct: false },
              { text: "Actively disqualify them immediately so the algorithm stops wasting impressions on them", correct: true },
              { text: "Use clickbait to trick them into visiting the website to retarget them later", correct: false },
              { text: "Keep the hook vague to appeal to the widest possible audience", correct: false }
            ],
            directorNote: "The algorithm learns from engagement. If non-buyers watch your ad, it shows it to MORE non-buyers. Disqualification saves budget and trains the algo to find real customers."
          },
          {
            type: "choice",
            question: "When a viewer is in 'AFK Mode' (mindless scrolling), what is their primary biological limitation that you must accommodate?",
            options: [
              { text: "They cannot read text, so everything must be voiceover", correct: false },
              { text: "They are colorblind to pastel colors", correct: false },
              { text: "Their eyes struggle to track complex movement; they need the focal point to remain static", correct: true },
              { text: "They will only stop for high-budget, cinematic footage", correct: false }
            ],
            directorNote: "In passive scroll mode, the brain conserves energy. Complex eye-tracking causes cognitive load → swipe. Keep the focal point (usually eyes or text) center-screen and static."
          },
          {
            type: "choice",
            question: "A junior editor spends 4 hours creating a complex 'Masking Transition' between scenes. How does a Performance Editor evaluate this?",
            options: [
              { text: "Great work, high production value builds trust", correct: false },
              { text: "Good, but make it faster", correct: false },
              { text: "Waste of time. A simple cut with a Social Proof element (like a testimonial) converts better", correct: true },
              { text: "Essential. Transitions are the #1 driver of Retention", correct: false }
            ],
            directorNote: "Time spent on 'cool' transitions is time NOT spent on conversion elements. A $0 jump cut + a trust badge outperforms a $500 motion graphics package every time."
          }
        ]
      }
    ]
  },
  {
    id: 2,
    title: "Level 2: Anatomy of the Ad",
    description: "The science behind what makes people stop and watch.",
    color: "bg-purple-500",
    levels: [
      {
        id: "l2",
        title: "Curiosity Hooks",
        icon: "👁️",
        description: "Stop the scroll with intrigue.",
        xOffset: 0,
        questions: [
          {
            type: "choice",
            question: "You decide to pixelate a strange object or show a 'gross' close-up (like a toenail) in the first 3 seconds. What is the psychological mechanism at play here?",
            options: [
              { text: "Shock Value: Scaring the customer into buying", correct: false },
              { text: "Intrigue/Curiosity: Forcing the viewer to stop scrolling just to figure out what the image is", correct: true },
              { text: "Brand Recall: Making the brand memorable through disgust", correct: false },
              { text: "Filtering: Only people with that specific problem will watch", correct: false }
            ],
            directorNote: "The 'What IS that?' reflex is hardwired. The brain MUST resolve ambiguity before it can move on. Pixelation and strange visuals exploit this biological pause."
          },
          {
            type: "choice",
            question: "Why are Split Screens (showing two videos side-by-side) scientifically effective for increasing watch time?",
            options: [
              { text: "They allow you to show the product from more angles", correct: false },
              { text: "They look more premium than single video layers", correct: false },
              { text: "The human brain takes longer to process two distinct inputs, artificially creating a 'pause' in scrolling behavior", correct: true },
              { text: "They are the default format for Instagram Reels", correct: false }
            ],
            directorNote: "Dual processing = doubled cognitive load. The brain literally cannot scroll until it has processed BOTH images. This buys you 1-2 extra seconds of attention."
          }
        ]
      },
      {
        id: "l3",
        title: "Target Mirroring",
        icon: "🪞",
        description: "Show them themselves.",
        xOffset: 40,
        questions: [
          {
            type: "choice",
            question: "You are selling a weight loss supplement for women over 40. You have high-quality footage of a 20-year-old fitness model. Do you use it?",
            options: [
              { text: "Yes, she represents the 'aspiration' (what they want to become)", correct: false },
              { text: "Yes, high-quality footage always performs better than low-quality footage", correct: false },
              { text: "No, you must use the 'Target Audience Mirror' rule: Show a 40-year-old so the viewer relates instantly", correct: true },
              { text: "No, because she is not wearing the brand colors", correct: false }
            ],
            directorNote: "Aspiration is for brand ads. In Direct Response, instant RECOGNITION converts. The viewer must see themselves in the first 2 seconds or they scroll."
          },
          {
            type: "choice",
            question: "Which of the following is a high-converting visual format for 'Social Proof' (beyond just a talking head)?",
            options: [
              { text: "A cinematic shot of the product on a table", correct: false },
              { text: "A 'Grid View' (2x2 or 3x3) of multiple customers holding the product simultaneously", correct: true },
              { text: "A slow-motion shot of the founder smiling", correct: false },
              { text: "An animated text overlay saying '5 Stars'", correct: false }
            ],
            directorNote: "Grid layouts imply volume and community. Seeing 4-9 real people at once triggers 'Everyone has this, I'm missing out' (FOMO). It's the visual equivalent of a crowd."
          }
        ]
      }
    ]
  },
  {
    id: 3,
    title: "Level 3: Technical Workflow",
    description: "The rules of the timeline.",
    color: "bg-blue-500",
    levels: [
      {
        id: "l4",
        title: "The 2-Second Rule",
        icon: "⏱️",
        description: "Visual rhythm mastery.",
        xOffset: 0,
        questions: [
          {
            type: "choice",
            question: "The '2-Second Rule' states that audio alone is not enough to hold attention. What must happen on the timeline every 2 seconds?",
            options: [
              { text: "The music beat must drop", correct: false },
              { text: "A visual change must occur (Cut, Zoom, Overlay, or Jump Cut)", correct: true },
              { text: "The subtitles must change color", correct: false },
              { text: "The logo must flash", correct: false }
            ],
            directorNote: "The human attention span in passive mode resets every ~2 seconds. A visual change (any change) acts like a 'refresh' button, resetting the timer."
          },
          {
            type: "choice",
            question: "You are performing the 'Scrub Test' (dragging the playhead rapidly). What specific spatial consistency are you checking for?",
            options: [
              { text: "That the color grading is consistent across clips", correct: false },
              { text: "That the audio levels don't peak into the red", correct: false },
              { text: "That the viewer's focal point (eyes) stays in the center/same area to prevent eye fatigue", correct: true },
              { text: "That there are no black frames between cuts", correct: false }
            ],
            directorNote: "If the 'eye anchor' jumps around the frame, the viewer experiences micro-stress. The Scrub Test visually reveals if you're making them 'work' too hard."
          }
        ]
      },
      {
        id: "l5",
        title: "Sound Design Rules",
        icon: "🔊",
        description: "Audio-visual synchronization.",
        xOffset: -40,
        questions: [
          {
            type: "choice",
            question: "What is the 'Movement Rule' regarding Sound Design?",
            options: [
              { text: "Music should be louder than the voiceover", correct: false },
              { text: "Only use sound effects for transitions", correct: false },
              { text: "If an element moves on screen (slide-in, text pop, transition), it must have a corresponding sound effect", correct: true },
              { text: "Never use cartoon sound effects in serious ads", correct: false }
            ],
            directorNote: "Movement without sound feels 'incomplete' to the brain. The SFX confirms the action happened and adds subconscious weight to the visual."
          },
          {
            type: "choice",
            question: "How should the music track evolve over the course of a 60-second Problem/Solution ad?",
            options: [
              { text: "Use one high-energy track to keep momentum up", correct: false },
              { text: "Use a sad track to build empathy", correct: false },
              { text: "Start with a 'Problem' track (monotone/dark), then hard cut to a 'Solution' track (uplifting) when the product is introduced", correct: true },
              { text: "No music, only ASMR sounds", correct: false }
            ],
            directorNote: "The audio arc mirrors the emotional journey. Dark → Light. This subconsciously tells the viewer: 'Your life is bad now, but the product will fix it.'"
          }
        ]
      }
    ]
  },
  {
    id: 4,
    title: "Level 4: Scenarios (Mastery)",
    description: "Real-world editing decisions.",
    color: "bg-orange-500",
    levels: [
      {
        id: "l6",
        title: "Pain Visualization",
        icon: "💥",
        description: "Making problems feel real.",
        xOffset: 0,
        questions: [
          {
            type: "choice",
            question: "Scenario: You are editing a scene showing a person rubbing their back in pain. The client wants to make the pain feel 'real.' What audio layer do you add?",
            options: [
              { text: "Sad violin music", correct: false },
              { text: "A voiceover saying 'Ouch'", correct: false },
              { text: "A visceral 'Crunch,' 'Crack,' or deep 'Rumble' sound effect underneath the movement", correct: true },
              { text: "Louder ambient room noise", correct: false }
            ],
            directorNote: "Visceral SFX trigger a physical empathy response. The viewer 'feels' the crunch in their own body. This is 100x more effective than sad music."
          }
        ]
      },
      {
        id: "l7",
        title: "CTA Engineering",
        icon: "🎯",
        description: "Force the click.",
        xOffset: 40,
        questions: [
          {
            type: "choice",
            question: "Scenario: You are designing the final 5 seconds (CTA). You have the logo and the URL. What else do you add to psychologically force the click?",
            options: [
              { text: "A complex animation of the logo spinning", correct: false },
              { text: "Visual cue (Arrow), Urgency (Countdown/Timer), and Value (Discount/Guarantee)", correct: true },
              { text: "A 'Thank You for Watching' text", correct: false },
              { text: "A fade to black", correct: false }
            ],
            directorNote: "The CTA is a stack: Direction (where to look) + Scarcity (why now) + Value (what they get). Missing any one of these reduces CTR by 30-50%."
          }
        ]
      }
    ]
  }
];

const RANKS = [
  { name: "Content Creator", minXp: 0, bonus: "Base Rate", desc: "Risk of burning budget" },
  { name: "Junior Ad Editor", minXp: 180, bonus: "+10% Bonus", desc: "Solid foundation" },
  { name: "Senior Performance Editor", minXp: 240, bonus: "+20% & RevShare", desc: "Ready to scale" },
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
    // Mock User for MVP - Start fresh for certification
    const mockUser = {
        xp: 0, streak: 1, hearts: 5, completedLevels: [], 
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
