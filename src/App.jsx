import React, { useState, useEffect } from 'react';
import { 
  Zap, Heart, Trophy, BookOpen, CheckCircle, XCircle, 
  Flame, Loader, AlertCircle, User, Play, Copy, RotateCcw, Lock, GraduationCap, Dumbbell
} from 'lucide-react';

// Assets
import robotStatic from './assets/adlingo robot static.png';
import robotThinking from './assets/adlingo robot thinking.png';
import robotDisappointed from './assets/adlingo robot dissapointed.png';

// --- MODE DETECTION ---
const getMode = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get('mode') === 'test' ? 'test' : 'train';
};

// --- 🛠️ COURSE DATA WITH LEVELS 🛠️ ---
const COURSE_DATA = [
  {
    id: 1,
    title: "Level 1: Core Philosophy",
    description: "Mindset shift from filmmaker to performance editor.",
    color: "bg-green-500",
    levels: [
      {
        id: "l1",
        title: "Algorithm Psychology",
        icon: "🧠",
        xOffset: 0,
        questions: [
          {
            question: "In performance marketing, what is the primary algorithmic goal regarding viewers who are NOT your target customer?",
            options: [
              { text: "Filter them out gradually by showing product benefits mid-video so only interested viewers remain", correct: false },
              { text: "Actively disqualify them immediately so the algorithm stops wasting impressions on them", correct: true },
              { text: "Maximize total watch time to boost the video's organic reach and lower CPM", correct: false },
              { text: "Hook everyone first, then let the landing page qualify the real buyers", correct: false }
            ],
            directorNote: "The algorithm learns from engagement. If non-buyers watch your ad, it shows it to MORE non-buyers. Disqualification saves budget and trains the algo to find real customers."
          },
          {
            question: "When a viewer is in 'AFK Mode' (mindless scrolling), what is their primary biological limitation that you must accommodate?",
            options: [
              { text: "Their eyes need constant movement to stay engaged, so use dynamic panning shots", correct: false },
              { text: "They respond best to pattern interrupts, so rapidly change the focal point every second", correct: false },
              { text: "Their eyes struggle to track complex movement; they need the focal point to remain static", correct: true },
              { text: "They are drawn to faces, so always start with a close-up of someone talking", correct: false }
            ],
            directorNote: "In passive scroll mode, the brain conserves energy. Complex eye-tracking causes cognitive load → swipe. Keep the focal point (usually eyes or text) center-screen and static."
          },
          {
            question: "A junior editor spends 4 hours creating a complex 'Masking Transition' between scenes. How does a Performance Editor evaluate this?",
            options: [
              { text: "Worth it if the transition includes the product reveal—production value increases perceived value", correct: false },
              { text: "Smart investment. Smooth transitions increase watch time which lowers CPM", correct: false },
              { text: "Waste of time. A simple cut with a Social Proof element (like a testimonial) converts better", correct: true },
              { text: "Good technique, but only use it once per video to avoid fatigue", correct: false }
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
        xOffset: 0,
        questions: [
          {
            question: "You decide to pixelate a strange object or show a 'gross' close-up (like a toenail) in the first 3 seconds. What is the psychological mechanism at play here?",
            options: [
              { text: "Pattern Interrupt: The unexpected visual breaks the scroll trance and grabs attention", correct: false },
              { text: "Intrigue/Curiosity: Forcing the viewer to stop scrolling just to figure out what the image is", correct: true },
              { text: "Emotional Trigger: Disgust is a high-arousal emotion that increases memory encoding", correct: false },
              { text: "Relatability: People who have this problem will immediately recognize it and stop", correct: false }
            ],
            directorNote: "The 'What IS that?' reflex is hardwired. The brain MUST resolve ambiguity before it can move on. Pixelation and strange visuals exploit this biological pause."
          },
          {
            question: "Why are Split Screens (showing two videos side-by-side) scientifically effective for increasing watch time?",
            options: [
              { text: "They create visual variety which prevents boredom and keeps viewers engaged longer", correct: false },
              { text: "They show before/after simultaneously, making the transformation more believable", correct: false },
              { text: "The human brain takes longer to process two distinct inputs, artificially creating a 'pause' in scrolling behavior", correct: true },
              { text: "They double the content density, giving viewers more value per second", correct: false }
            ],
            directorNote: "Dual processing = doubled cognitive load. The brain literally cannot scroll until it has processed BOTH images. This buys you 1-2 extra seconds of attention."
          }
        ]
      },
      {
        id: "l3",
        title: "Target Mirroring",
        icon: "🪞",
        xOffset: 40,
        questions: [
          {
            question: "You are selling a weight loss supplement for women over 40. You have high-quality footage of a 20-year-old fitness model. Do you use it?",
            options: [
              { text: "Yes, she represents the end-state transformation that motivates the viewer to buy", correct: false },
              { text: "Yes, but only in the 'After' section—use a relatable person for the 'Before'", correct: false },
              { text: "No, you must use the 'Target Audience Mirror' rule: Show a 40-year-old so the viewer relates instantly", correct: true },
              { text: "Yes, aspirational content performs better because it triggers desire", correct: false }
            ],
            directorNote: "Aspiration is for brand ads. In Direct Response, instant RECOGNITION converts. The viewer must see themselves in the first 2 seconds or they scroll."
          },
          {
            question: "Which of the following is a high-converting visual format for 'Social Proof' (beyond just a talking head)?",
            options: [
              { text: "A scrolling ticker of 5-star reviews with customer names", correct: false },
              { text: "A 'Grid View' (2x2 or 3x3) of multiple customers holding the product simultaneously", correct: true },
              { text: "A single emotional testimonial with high production value and B-roll", correct: false },
              { text: "Screenshot of the product's Amazon rating overlaid on the video", correct: false }
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
        xOffset: 0,
        questions: [
          {
            question: "The '2-Second Rule' states that audio alone is not enough to hold attention. What must happen on the timeline every 2 seconds?",
            options: [
              { text: "New information must be introduced—either a new claim, stat, or benefit", correct: false },
              { text: "A visual change must occur (Cut, Zoom, Overlay, or Jump Cut)", correct: true },
              { text: "The speaker must change their vocal inflection or tone to re-engage", correct: false },
              { text: "A sound effect or audio cue must play to reset the attention cycle", correct: false }
            ],
            directorNote: "The human attention span in passive mode resets every ~2 seconds. A visual change (any change) acts like a 'refresh' button, resetting the timer."
          },
          {
            question: "You are performing the 'Scrub Test' (dragging the playhead rapidly). What specific spatial consistency are you checking for?",
            options: [
              { text: "That the visual pacing feels consistent and doesn't have jarring speed changes", correct: false },
              { text: "That each cut introduces enough visual change to maintain novelty", correct: false },
              { text: "That the viewer's focal point (eyes) stays in the center/same area to prevent eye fatigue", correct: true },
              { text: "That the subject remains in frame and isn't cropped awkwardly between cuts", correct: false }
            ],
            directorNote: "If the 'eye anchor' jumps around the frame, the viewer experiences micro-stress. The Scrub Test visually reveals if you're making them 'work' too hard."
          }
        ]
      },
      {
        id: "l5",
        title: "Sound Design Rules",
        icon: "🔊",
        xOffset: -40,
        questions: [
          {
            question: "What is the 'Movement Rule' regarding Sound Design?",
            options: [
              { text: "Sound effects should match the emotional tone of the scene to reinforce the message", correct: false },
              { text: "Every visual element needs audio support, including static text and background images", correct: false },
              { text: "If an element moves on screen (slide-in, text pop, transition), it must have a corresponding sound effect", correct: true },
              { text: "Sound design should be subtle—viewers shouldn't consciously notice the SFX", correct: false }
            ],
            directorNote: "Movement without sound feels 'incomplete' to the brain. The SFX confirms the action happened and adds subconscious weight to the visual."
          },
          {
            question: "How should the music track evolve over the course of a 60-second Problem/Solution ad?",
            options: [
              { text: "Build gradually from soft to intense, peaking at the CTA for maximum urgency", correct: false },
              { text: "Keep the music consistent so it doesn't distract from the voiceover message", correct: false },
              { text: "Start with a 'Problem' track (monotone/dark), then hard cut to a 'Solution' track (uplifting) when the product is introduced", correct: true },
              { text: "Start upbeat to hook attention, then soften during testimonials for authenticity", correct: false }
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
        xOffset: 0,
        questions: [
          {
            question: "Scenario: You are editing a scene showing a person rubbing their back in pain. The client wants to make the pain feel 'real.' What audio layer do you add?",
            options: [
              { text: "Tense, minor-key music that mirrors the discomfort the viewer should feel", correct: false },
              { text: "A sharp inhale or wince sound from the person to show authentic pain reaction", correct: false },
              { text: "A visceral 'Crunch,' 'Crack,' or deep 'Rumble' sound effect underneath the movement", correct: true },
              { text: "Silence—let the visual speak for itself so the pain moment has more weight", correct: false }
            ],
            directorNote: "Visceral SFX trigger a physical empathy response. The viewer 'feels' the crunch in their own body. This is 100x more effective than sad music."
          }
        ]
      },
      {
        id: "l7",
        title: "CTA Engineering",
        icon: "🎯",
        xOffset: 40,
        questions: [
          {
            question: "Scenario: You are designing the final 5 seconds (CTA). You have the logo and the URL. What else do you add to psychologically force the click?",
            options: [
              { text: "A bold 'Shop Now' button animation with satisfying click sound effect", correct: false },
              { text: "Visual cue (Arrow), Urgency (Countdown/Timer), and Value (Discount/Guarantee)", correct: true },
              { text: "Customer testimonial quote reinforcing the key benefit one more time", correct: false },
              { text: "Clean, minimal design—let the product speak for itself without pressure", correct: false }
            ],
            directorNote: "The CTA is a stack: Direction (where to look) + Scarcity (why now) + Value (what they get). Missing any one of these reduces CTR by 30-50%."
          }
        ]
      }
    ]
  }
];

// Flatten all questions for test mode
const ALL_QUESTIONS = COURSE_DATA.flatMap(unit => 
  unit.levels.flatMap(level => 
    level.questions.map(q => ({ ...q, levelTitle: level.title, unitTitle: unit.title }))
  )
);

const TOTAL_QUESTIONS = ALL_QUESTIONS.length;

// Get all level IDs in order
const ALL_LEVEL_IDS = COURSE_DATA.flatMap(unit => unit.levels.map(l => l.id));

// --- TIER CONFIGURATION ---
const getTierData = (score) => {
  if (score >= 94) {
    return {
      tier: "The Unicorn",
      emoji: "🦄",
      color: "from-purple-600 to-pink-500",
      bgColor: "bg-purple-900",
      borderColor: "border-purple-500",
      textColor: "text-purple-300",
      headline: "Money Printer Go Brrr!",
      body: "You are a Direct Response God. You understand that editing is 90% psychology and 10% buttons. Media buyers fight to work with you. Name your price."
    };
  } else if (score >= 80) {
    return {
      tier: "Scaling Specialist",
      emoji: "🚀",
      color: "from-green-500 to-emerald-400",
      bgColor: "bg-green-900",
      borderColor: "border-green-500",
      textColor: "text-green-300",
      headline: "Ready to Spend $10k/Day",
      body: "You are profitable and dangerous. You know the rules of engagement. With a little more focus on deep-psychology diagnostics, you'll be unstoppable."
    };
  } else if (score >= 60) {
    return {
      tier: "Breakeven Editor",
      emoji: "📉",
      color: "from-orange-500 to-yellow-500",
      bgColor: "bg-orange-900",
      borderColor: "border-orange-500",
      textColor: "text-orange-300",
      headline: "You Keep the Lights On... Barely.",
      body: "You make ads that look nice, but they don't print cash. You're relying too much on visuals and not enough on disqualification and hooks. Go review the 'Eye-Tracing' module."
    };
  } else {
    return {
      tier: "Budget Burner",
      emoji: "🔥",
      color: "from-red-600 to-red-500",
      bgColor: "bg-red-900",
      borderColor: "border-red-500",
      textColor: "text-red-300",
      headline: "You Owe Mark Zuckerberg Money.",
      body: "Stop! Turn off the ads! You are editing for 'cinematography' or 'likes,' not for sales. You need to completely unlearn your filmmaking habits and start fresh."
    };
  }
};

// --- MAIN APP ---
const App = () => {
  const [mode] = useState(getMode()); // 'test' or 'train'
  const [view, setView] = useState('home'); // home, lesson, results, test
  const [activeLevel, setActiveLevel] = useState(null);
  const [completedLevels, setCompletedLevels] = useState([]);
  const [levelScores, setLevelScores] = useState({});
  const [copied, setCopied] = useState(false);
  
  // Test mode state
  const [testAnswers, setTestAnswers] = useState({});
  const [currentTestQ, setCurrentTestQ] = useState(0);
  const [selectedTestOpt, setSelectedTestOpt] = useState(null);

  // Check if all levels are completed
  const allComplete = ALL_LEVEL_IDS.every(id => completedLevels.includes(id));

  // Calculate total score (works for both modes)
  const totalCorrect = mode === 'test' 
    ? Object.values(testAnswers).filter(Boolean).length
    : Object.values(levelScores).reduce((acc, s) => acc + s.correct, 0);
  const score = Math.round((totalCorrect / TOTAL_QUESTIONS) * 100);
  const tierData = getTierData(score);

  const startLevel = (level, isLocked) => {
    if (isLocked) return;
    setActiveLevel(level);
    setView('lesson');
  };

  const completeLevel = (levelId, correct, total) => {
    setCompletedLevels(prev => [...new Set([...prev, levelId])]);
    setLevelScores(prev => ({ ...prev, [levelId]: { correct, total } }));
    
    const newCompleted = [...new Set([...completedLevels, levelId])];
    if (ALL_LEVEL_IDS.every(id => newCompleted.includes(id))) {
      setView('results');
    } else {
      setView('home');
    }
  };

  const resetQuiz = () => {
    setCompletedLevels([]);
    setLevelScores({});
    setTestAnswers({});
    setCurrentTestQ(0);
    setSelectedTestOpt(null);
    setView('home');
  };

  const startTest = () => {
    setTestAnswers({});
    setCurrentTestQ(0);
    setSelectedTestOpt(null);
    setView('test');
  };

  const submitTestAnswer = () => {
    if (selectedTestOpt === null) return;
    const q = ALL_QUESTIONS[currentTestQ];
    const isCorrect = q.options[selectedTestOpt].correct;
    setTestAnswers(prev => ({ ...prev, [currentTestQ]: isCorrect }));
    
    if (currentTestQ + 1 < TOTAL_QUESTIONS) {
      setCurrentTestQ(i => i + 1);
      setSelectedTestOpt(null);
    } else {
      setView('results');
    }
  };

  const copyResult = () => {
    const modeLabel = mode === 'test' ? 'Certification Test' : 'Training';
    const text = `I just scored ${score}/100 (${tierData.tier} ${tierData.emoji}) on the Adlingo ${modeLabel}. Can you beat my ROAS? https://adlingo.onrender.com${mode === 'test' ? '?mode=test' : ''}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ============================================
  // TEST MODE - HOME SCREEN
  // ============================================
  if (mode === 'test' && view === 'home') {
    return (
      <div className="min-h-screen bg-gray-900 text-white font-sans flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <img src={robotStatic} alt="Adlingo Bot" className="w-32 h-32 mx-auto mb-6" />
          <h1 className="text-3xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-red-500 mb-2">
            ADLINGO
          </h1>
          <p className="text-gray-400 mb-8">Performance Editor Certification Test</p>

          <div className="bg-gray-800 rounded-2xl p-6 mb-8 border border-gray-700 text-left">
            <div className="flex items-center mb-4">
              <GraduationCap className="text-orange-400 mr-3" size={24} />
              <span className="font-bold text-lg">Exam Rules</span>
            </div>
            <ul className="text-gray-400 text-sm space-y-2">
              <li>• {TOTAL_QUESTIONS} questions total</li>
              <li>• No feedback until the end</li>
              <li>• Your final score will be revealed after submission</li>
              <li>• Results are screenshot-ready for sharing</li>
            </ul>
          </div>

          <button 
            onClick={startTest}
            className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-black text-lg rounded-2xl shadow-lg border-b-4 border-orange-700 active:translate-y-1 active:shadow-none transition-all uppercase tracking-widest"
          >
            Begin Certification
          </button>

          <a 
            href="/"
            className="block mt-6 text-gray-500 hover:text-gray-300 text-sm transition"
          >
            ← Switch to Training Mode
          </a>
        </div>
      </div>
    );
  }

  // ============================================
  // TEST MODE - QUIZ FLOW (No Feedback)
  // ============================================
  if (mode === 'test' && view === 'test') {
    const q = ALL_QUESTIONS[currentTestQ];
    const progress = ((currentTestQ) / TOTAL_QUESTIONS) * 100;

    return (
      <div className="min-h-screen bg-gray-900 text-white font-sans flex flex-col">
        {/* Top Bar */}
        <div className="px-4 py-4 flex items-center gap-4 border-b border-gray-800">
          <div className="flex-1 h-3 bg-gray-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-gray-400 font-bold text-sm">{currentTestQ + 1}/{TOTAL_QUESTIONS}</div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 pb-32">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-4">
              <span className="bg-gray-800 text-gray-500 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-gray-700">
                {q.unitTitle}
              </span>
            </div>

            <h2 className="text-xl font-black text-center mb-8 leading-tight">{q.question}</h2>

            <div className="space-y-3">
              {q.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedTestOpt(idx)}
                  className={`
                    w-full p-4 rounded-xl border-2 text-left font-medium transition-all
                    ${selectedTestOpt === idx 
                      ? 'border-orange-500 bg-orange-500/10 text-orange-300' 
                      : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600'}
                  `}
                >
                  <div className="flex items-start">
                    <div className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center mr-3 text-sm font-black shrink-0
                      ${selectedTestOpt === idx ? 'border-orange-500 text-orange-500' : 'border-gray-600 text-gray-600'}
                    `}>
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <span className="pt-1">{opt.text}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="fixed bottom-0 w-full bg-gray-900/98 border-t border-gray-800 backdrop-blur-lg">
          <div className="max-w-2xl mx-auto p-4">
            <button 
              onClick={submitTestAnswer}
              disabled={selectedTestOpt === null}
              className="w-full py-4 rounded-xl font-black text-base uppercase tracking-wider transition-all bg-orange-500 hover:bg-orange-400 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {currentTestQ + 1 < TOTAL_QUESTIONS ? 'Next Question' : 'Submit & See Results'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // TRAINING MODE - HOME (The Map)
  // ============================================
  if (mode === 'train' && view === 'home') {
    return (
      <div className="min-h-screen bg-gray-900 text-white font-sans">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-gray-900/95 backdrop-blur border-b border-gray-800 p-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <img src={robotStatic} alt="Adlingo Bot" className="w-10 h-10 object-contain" />
            <div className="font-black text-xl tracking-tighter italic bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-red-500">
              ADLINGO
            </div>
          </div>
          <div className="flex items-center space-x-3 text-sm font-bold">
            <a 
              href="?mode=test" 
              className="text-gray-500 hover:text-orange-400 flex items-center bg-gray-800 px-3 py-1 rounded-full border border-gray-700 transition"
            >
              <GraduationCap size={14} className="mr-1" /> Test
            </a>
            <div className="text-orange-400 flex items-center bg-orange-500/10 px-3 py-1 rounded-full">
              <Trophy size={16} className="mr-1" /> {completedLevels.length}/{ALL_LEVEL_IDS.length}
            </div>
          </div>
        </header>

        {/* Progress Banner */}
        <div className="p-4">
          <div className="max-w-2xl mx-auto bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-bold text-gray-400 flex items-center">
                <Dumbbell size={14} className="mr-2" /> Training Progress
              </span>
              <span className="text-sm font-bold text-orange-400">{Math.round((completedLevels.length / ALL_LEVEL_IDS.length) * 100)}%</span>
            </div>
            <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-500"
                style={{ width: `${(completedLevels.length / ALL_LEVEL_IDS.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Course Map */}
        <div className="p-4 pb-24 space-y-8">
          {COURSE_DATA.map((unit) => (
            <div key={unit.id} className="max-w-2xl mx-auto">
              <div className={`p-5 rounded-2xl mb-8 ${unit.color} text-white shadow-lg border-b-4 border-black/20 relative overflow-hidden`}>
                <div className="relative z-10">
                  <h2 className="font-black text-lg uppercase tracking-wider">{unit.title}</h2>
                  <p className="opacity-90 text-sm mt-1">{unit.description}</p>
                </div>
                <Zap size={70} className="absolute -right-2 -bottom-2 opacity-20 rotate-12 text-black" />
              </div>

              <div className="flex flex-col items-center space-y-6">
                {unit.levels.map((level) => {
                  const isCompleted = completedLevels.includes(level.id);
                  const globalLevelIndex = ALL_LEVEL_IDS.indexOf(level.id);
                  const prevLevelId = globalLevelIndex > 0 ? ALL_LEVEL_IDS[globalLevelIndex - 1] : null;
                  const isLocked = !isCompleted && prevLevelId && !completedLevels.includes(prevLevelId);
                  const levelScore = levelScores[level.id];

                  return (
                    <div 
                      key={level.id}
                      style={{ transform: `translateX(${level.xOffset}px)` }}
                      className="flex flex-col items-center"
                    >
                      <button
                        onClick={() => startLevel(level, isLocked)}
                        disabled={isLocked}
                        className={`
                          w-20 h-20 rounded-[1.5rem] flex items-center justify-center text-2xl
                          transition-all duration-150 active:translate-y-1 active:shadow-none
                          ${isCompleted 
                            ? 'bg-yellow-400 border-b-6 border-yellow-600 shadow-[0_6px_0_0_rgba(202,138,4,1)]' 
                            : isLocked
                              ? 'bg-gray-700 border-b-6 border-gray-800 shadow-[0_6px_0_0_rgba(31,41,55,1)] opacity-60 cursor-not-allowed'
                              : 'bg-green-500 border-b-6 border-green-700 shadow-[0_6px_0_0_rgba(21,128,61,1)] hover:bg-green-400 cursor-pointer'}
                        `}
                      >
                        {isCompleted ? (
                          <CheckCircle className="text-yellow-900" size={28} strokeWidth={3} />
                        ) : isLocked ? (
                          <Lock className="text-gray-500" size={24} />
                        ) : (
                          <span>{level.icon}</span>
                        )}
                      </button>
                      
                      <div className="mt-2 text-center">
                        <div className={`text-xs font-bold uppercase tracking-wide ${isLocked ? 'text-gray-600' : 'text-white'}`}>
                          {level.title}
                        </div>
                        {levelScore && (
                          <div className="text-xs text-green-400 font-bold mt-1">
                            {levelScore.correct}/{levelScore.total} correct
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {allComplete && (
            <div className="max-w-2xl mx-auto pt-8">
              <button
                onClick={() => setView('results')}
                className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-black text-lg rounded-2xl shadow-lg border-b-4 border-purple-700 active:translate-y-1 active:shadow-none transition-all uppercase tracking-widest"
              >
                🎓 View Your Certification
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ============================================
  // TRAINING MODE - LESSON
  // ============================================
  if (view === 'lesson' && activeLevel) {
    return (
      <LessonEngine
        level={activeLevel}
        onComplete={(correct, total) => completeLevel(activeLevel.id, correct, total)}
        onExit={() => setView('home')}
      />
    );
  }

  // ============================================
  // RESULTS VIEW (Both Modes)
  // ============================================
  if (view === 'results') {
    return (
      <div className={`min-h-screen ${tierData.bgColor} text-white font-sans flex flex-col`}>
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="max-w-sm w-full">
            
            <div className={`bg-gray-900 rounded-3xl p-6 border-2 ${tierData.borderColor} shadow-2xl relative overflow-hidden`}>
              
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-800">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center font-black text-xs">AD</div>
                  <span className="font-bold text-gray-400 text-sm">
                    {mode === 'test' ? 'Certification Exam' : 'Training Complete'}
                  </span>
                </div>
                <div className={`px-2 py-1 rounded text-xs font-bold ${tierData.textColor} bg-black/30`}>
                  {mode === 'test' ? 'CERTIFIED' : 'TRAINED'}
                </div>
              </div>

              <div className="text-center mb-6">
                <div className={`text-7xl font-black bg-gradient-to-r ${tierData.color} bg-clip-text text-transparent`}>
                  {score}
                </div>
                <div className="text-gray-500 font-bold text-sm uppercase tracking-widest">/ 100 ROAS Score</div>
              </div>

              <div className={`bg-gradient-to-r ${tierData.color} rounded-2xl p-4 text-center mb-6`}>
                <div className="text-4xl mb-1">{tierData.emoji}</div>
                <div className="font-black text-xl uppercase tracking-wider">{tierData.tier}</div>
              </div>

              <div className="text-center mb-6">
                <h2 className="text-xl font-black mb-2">{tierData.headline}</h2>
                <p className="text-gray-400 text-sm leading-relaxed">{tierData.body}</p>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center bg-black/30 rounded-xl p-3">
                <div>
                  <div className="text-green-400 font-black text-lg">{totalCorrect}</div>
                  <div className="text-gray-500 text-xs uppercase">Correct</div>
                </div>
                <div>
                  <div className="text-red-400 font-black text-lg">{TOTAL_QUESTIONS - totalCorrect}</div>
                  <div className="text-gray-500 text-xs uppercase">Wrong</div>
                </div>
                <div>
                  <div className="text-blue-400 font-black text-lg">{TOTAL_QUESTIONS}</div>
                  <div className="text-gray-500 text-xs uppercase">Total</div>
                </div>
              </div>

              <div className="mt-4 text-center">
                <span className="text-gray-600 text-xs font-bold">adlingo.onrender.com</span>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <button 
                onClick={copyResult}
                className={`w-full py-4 rounded-xl font-black uppercase tracking-wider flex items-center justify-center transition-all ${
                  copied 
                    ? 'bg-green-500 text-white' 
                    : 'bg-white text-gray-900 hover:bg-gray-100'
                }`}
              >
                {copied ? (
                  <><CheckCircle size={20} className="mr-2" /> Copied!</>
                ) : (
                  <><Copy size={20} className="mr-2" /> Copy Result</>
                )}
              </button>
              
              <button 
                onClick={resetQuiz}
                className="w-full py-4 rounded-xl font-bold uppercase tracking-wider bg-gray-800 text-gray-300 hover:bg-gray-700 transition-all flex items-center justify-center border border-gray-700"
              >
                <RotateCcw size={20} className="mr-2" /> {mode === 'test' ? 'Retake Exam' : 'Reset Training'}
              </button>

              {mode === 'test' && (
                <a 
                  href="/"
                  className="block text-center text-gray-500 hover:text-orange-400 text-sm transition mt-4"
                >
                  → Try Training Mode (with corrections)
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

// --- LESSON ENGINE COMPONENT (Training Mode Only) ---
const LessonEngine = ({ level, onComplete, onExit }) => {
  const [qIndex, setQIndex] = useState(0);
  const [status, setStatus] = useState('idle');
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [correctCount, setCorrectCount] = useState(0);

  const q = level.questions[qIndex];
  const progress = ((qIndex) / level.questions.length) * 100;

  const handleCheck = () => {
    if (selectedOpt === null) return;
    const isCorrect = q.options[selectedOpt].correct;
    setStatus(isCorrect ? 'correct' : 'wrong');
    if (isCorrect) setCorrectCount(c => c + 1);
  };

  const handleNext = () => {
    if (qIndex + 1 < level.questions.length) {
      setQIndex(i => i + 1);
      setStatus('idle');
      setSelectedOpt(null);
    } else {
      onComplete(correctCount + (status === 'correct' ? 0 : 0), level.questions.length);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans flex flex-col">
      <div className="px-4 py-4 flex items-center gap-4 border-b border-gray-800">
        <button onClick={onExit} className="p-2 hover:bg-gray-800 rounded-full transition">
          <XCircle className="text-gray-400 hover:text-white" size={24} />
        </button>
        <div className="flex-1 h-3 bg-gray-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-gray-400 font-bold text-sm">{qIndex + 1}/{level.questions.length}</div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 pb-48">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-4">
            <span className="bg-gray-800 text-gray-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-gray-700">
              {level.title}
            </span>
          </div>

          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 relative">
              <img 
                src={robotThinking} 
                className={`w-full h-full object-contain transition-all duration-300 ${status !== 'idle' ? 'opacity-0 scale-90 absolute' : 'opacity-100 scale-100'}`}
              />
              <img 
                src={robotStatic} 
                className={`w-full h-full object-contain transition-all duration-300 ${status === 'correct' ? 'opacity-100 scale-110' : 'opacity-0 scale-90 absolute'}`}
              />
              <img 
                src={robotDisappointed} 
                className={`w-full h-full object-contain transition-all duration-300 ${status === 'wrong' ? 'opacity-100 scale-100' : 'opacity-0 scale-90 absolute'}`}
              />
            </div>
          </div>

          <h2 className="text-xl font-black text-center mb-8 leading-tight">{q.question}</h2>

          <div className="space-y-3">
            {q.options.map((opt, idx) => (
              <button
                key={idx}
                disabled={status !== 'idle'}
                onClick={() => setSelectedOpt(idx)}
                className={`
                  w-full p-4 rounded-xl border-2 text-left font-medium transition-all
                  ${selectedOpt === idx 
                    ? 'border-blue-500 bg-blue-500/10 text-blue-300' 
                    : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600'}
                  ${status === 'correct' && opt.correct ? '!border-green-500 !bg-green-500/20 !text-green-400' : ''}
                  ${status === 'wrong' && selectedOpt === idx ? '!border-red-500 !bg-red-500/20 !text-red-400' : ''}
                  ${status === 'wrong' && opt.correct ? '!border-green-500/50 !bg-green-500/10 !text-green-400/70' : ''}
                `}
              >
                <div className="flex items-start">
                  <div className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center mr-3 text-sm font-black shrink-0
                    ${selectedOpt === idx ? 'border-blue-500 text-blue-500' : 'border-gray-600 text-gray-600'}
                    ${status === 'correct' && opt.correct ? '!border-green-500 !text-green-500' : ''}
                    ${status === 'wrong' && selectedOpt === idx ? '!border-red-500 !text-red-500' : ''}
                  `}>
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <span className="pt-1">{opt.text}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={`fixed bottom-0 w-full border-t transition-colors duration-300 ${
        status === 'correct' ? 'bg-green-900/95 border-green-700' : 
        status === 'wrong' ? 'bg-red-900/95 border-red-700' : 'bg-gray-900/98 border-gray-800'
      } backdrop-blur-lg`}>
        <div className="max-w-2xl mx-auto p-4">
          {status === 'wrong' && q.directorNote && (
            <div className="mb-4">
              <div className="font-bold text-red-300 flex items-center mb-2 text-sm">
                <AlertCircle size={16} className="mr-2"/> Director's Note:
              </div>
              <p className="text-sm text-red-200 bg-red-950/50 p-3 rounded-xl border border-red-800/50">
                {q.directorNote}
              </p>
            </div>
          )}
          {status === 'correct' && (
            <div className="mb-4 text-green-300 font-bold flex items-center">
              <CheckCircle className="mr-2" size={20} /> Correct!
            </div>
          )}
          <button 
            onClick={status === 'idle' ? handleCheck : handleNext}
            disabled={selectedOpt === null && status === 'idle'}
            className={`
              w-full py-4 rounded-xl font-black text-base uppercase tracking-wider transition-all
              ${status === 'idle' 
                ? 'bg-green-500 hover:bg-green-400 text-white disabled:opacity-50 disabled:cursor-not-allowed'
                : 'bg-white text-gray-900'
              }
            `}
          >
            {status === 'idle' ? 'Check Answer' : qIndex + 1 < level.questions.length ? 'Next Question' : 'Complete Level'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
