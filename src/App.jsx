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
    description: "How to think like a performance editor.",
    color: "bg-green-500",
    levels: [
      {
        id: "l1",
        title: "Mindset Shift",
        icon: "🧠",
        xOffset: 0,
        questions: [
          {
            question: "A teenager watches your entire ad for a luxury watch brand targeting 45-year-old executives. What happens to your ad account?",
            options: [
              { text: "It helps! More watch time means the algorithm shows it to more people", correct: false },
              { text: "It hurts. The algorithm learns to find MORE teenagers who also won't buy", correct: true },
              { text: "Neutral. The algorithm only tracks clicks, not who watches", correct: false },
              { text: "It helps build brand awareness for when they're older", correct: false }
            ],
            directorNote: "The algorithm learns from who watches. If wrong people watch, it finds MORE wrong people. You want non-buyers to scroll away FAST."
          },
          {
            question: "What is the GOAL of a performance ad?",
            options: [
              { text: "Get as many views as possible to build awareness", correct: false },
              { text: "Go viral so people share it with friends", correct: false },
              { text: "Get purchases from the RIGHT people—even if total views are low", correct: true },
              { text: "Collect likes and comments to boost engagement", correct: false }
            ],
            directorNote: "We don't want views. We want RESULTS. 1,000 views with 50 sales beats 1 million views with 10 sales."
          },
          {
            question: "You finish editing an ad. It looks rough, but the message is clear and clips show the problem well. What do you do?",
            options: [
              { text: "Spend more time polishing—ugly ads hurt the brand", correct: false },
              { text: "Add smooth transitions to look more professional", correct: false },
              { text: "Ship it. Rough ads that sell beat pretty ads that don't", correct: true },
              { text: "Send to client and warn them it needs more work", correct: false }
            ],
            directorNote: "Production value doesn't sell products. Psychology does. Some of the best-performing ads look 'cheap'—and that's fine."
          },
          {
            question: "When someone scrolls on autopilot (zoned out), what can't their brain do well?",
            options: [
              { text: "Read text—they can only process audio", correct: false },
              { text: "See bright colors—everything looks gray", correct: false },
              { text: "Track movement—their eyes want to stay in one spot", correct: true },
              { text: "Hear sounds—audio doesn't register until they stop", correct: false }
            ],
            directorNote: "Zoned-out brains save energy. Making eyes chase things around the screen is tiring—they swipe. Keep the main thing in the center."
          }
        ]
      }
    ]
  },
  {
    id: 2,
    title: "Level 2: The Hook",
    description: "The first 3 seconds decide everything.",
    color: "bg-purple-500",
    levels: [
      {
        id: "l2",
        title: "Disqualification",
        icon: "🚫",
        xOffset: 0,
        questions: [
          {
            question: "You're selling a sleep supplement. Your hook shows someone tossing and turning at 3am, staring at the ceiling. Why is this GOOD?",
            options: [
              { text: "Dark bedroom footage is cinematic and eye-catching", correct: false },
              { text: "People who sleep fine will scroll away, so the algorithm finds insomniacs faster", correct: true },
              { text: "It creates drama that makes everyone curious", correct: false },
              { text: "Nighttime content performs well on all platforms", correct: false }
            ],
            directorNote: "You WANT good sleepers to scroll away. That teaches the algorithm to stop showing them your ad and find people with sleep problems instead."
          },
          {
            question: "Your hook shows a blurred object being unwrapped. Why does this stop the scroll?",
            options: [
              { text: "Blur effects look premium and professional", correct: false },
              { text: "The brain HAS TO figure out what's hidden before it can move on", correct: true },
              { text: "It builds brand mystery and anticipation", correct: false },
              { text: "Unboxing content is trending on social media", correct: false }
            ],
            directorNote: "The brain can't handle not knowing. When something is hidden, your brain MUST solve it before scrolling. This buys you 1-2 extra seconds."
          }
        ]
      },
      {
        id: "l3",
        title: "POV & Mirroring",
        icon: "🪞",
        xOffset: 40,
        questions: [
          {
            question: "You're making an ad for a hair growth serum. What camera angle works best in the hook?",
            options: [
              { text: "Professional studio shot of a model with perfect hair", correct: false },
              { text: "Someone looking at their hairline in the bathroom mirror (selfie angle)", correct: true },
              { text: "Wide shot showing before/after side by side", correct: false },
              { text: "Close-up of the product bottle with sleek lighting", correct: false }
            ],
            directorNote: "POV means 'Point of View.' Show what the viewer actually SEES when checking their own hairline. That's the bathroom mirror angle."
          },
          {
            question: "You're selling running shoes to weekend joggers in their 30s. You have footage of an Olympic sprinter. Should you use it?",
            options: [
              { text: "Yes—elite athletes inspire people to buy", correct: false },
              { text: "Yes—athletic content gets more engagement", correct: false },
              { text: "No—show a regular person jogging so viewers think 'that's me'", correct: true },
              { text: "Yes—but only in slow motion for dramatic effect", correct: false }
            ],
            directorNote: "People scroll past anyone who doesn't look like them. In 2 seconds, they need to think 'that's ME.' Regular joggers sell to regular joggers."
          }
        ]
      }
    ]
  },
  {
    id: 3,
    title: "Level 3: The Body",
    description: "Building trust and showing the problem.",
    color: "bg-blue-500",
    levels: [
      {
        id: "l4",
        title: "Making Problems Visible",
        icon: "🔦",
        xOffset: 0,
        questions: [
          {
            question: "A mattress brand claims their foam 'distributes pressure evenly.' You can't see pressure. How do you show it?",
            options: [
              { text: "Just explain it in the voiceover—no visual needed", correct: false },
              { text: "Show someone sleeping comfortably and smiling", correct: false },
              { text: "Use a thermal camera or pressure map animation that SHOWS the pressure points", correct: true },
              { text: "Skip this claim and focus on other benefits", correct: false }
            ],
            directorNote: "Your job is making invisible things visible. Thermal cameras, X-rays, 3D animations—these 'prove' claims that words alone can't."
          },
          {
            question: "Why do 3D explainer animations (like showing ingredients entering cells) build trust?",
            options: [
              { text: "They're expensive, so people think the brand has money", correct: false },
              { text: "People link them with real science and research—they feel factual", correct: true },
              { text: "Animations are trending on social media right now", correct: false },
              { text: "They're easier to understand than real footage", correct: false }
            ],
            directorNote: "We're trained to trust scientific animations because documentaries and doctors use them. When viewers see that style, they assume real research happened."
          }
        ]
      },
      {
        id: "l5",
        title: "Social Proof & Trust",
        icon: "👥",
        xOffset: -40,
        questions: [
          {
            question: "You're selling a meal prep container. What's the BEST way to show it's popular?",
            options: [
              { text: "Display '500,000+ sold' as text on screen", correct: false },
              { text: "Show a grid of 6-9 different people using it in their kitchens", correct: true },
              { text: "Have one customer give an emotional 30-second testimonial", correct: false },
              { text: "Show the Amazon rating and review count", correct: false }
            ],
            directorNote: "Multiple faces on screen triggers 'everyone has this.' A grid of real people works better than any number or single testimonial."
          },
          {
            question: "You want viewers to feel they're not alone with their problem. What works best?",
            options: [
              { text: "Say 'millions of people struggle with this' in voiceover", correct: false },
              { text: "Show many different people experiencing the same problem at once", correct: true },
              { text: "Display a statistic like '73% of adults have this issue'", correct: false },
              { text: "Have one person describe how common it is", correct: false }
            ],
            directorNote: "When viewers SEE many people with their problem, they feel understood. Numbers and stats don't create that feeling—faces do."
          }
        ]
      }
    ]
  },
  {
    id: 4,
    title: "Level 4: Timeline Rules",
    description: "The technical rules of editing.",
    color: "bg-cyan-500",
    levels: [
      {
        id: "l6",
        title: "The 2-Second Rule",
        icon: "⏱️",
        xOffset: 0,
        questions: [
          {
            question: "Attention resets every 2-3 seconds. What KIND of change keeps people watching?",
            options: [
              { text: "New information—say something different", correct: false },
              { text: "Visual change—cut, zoom, overlay, or move something", correct: true },
              { text: "Audio change—switch the music or add a sound", correct: false },
              { text: "Color shift—change the filter or tones", correct: false }
            ],
            directorNote: "A visual change (anything you can SEE) resets the attention timer. Audio alone won't do it—it must be visible."
          },
          {
            question: "The 'Scrub Test' means dragging quickly through your timeline. What are you looking for?",
            options: [
              { text: "That the pacing feels smooth and not choppy", correct: false },
              { text: "That there's enough variety in your clips", correct: false },
              { text: "That the viewer's focal point stays in the SAME spot across cuts", correct: true },
              { text: "That there are no black frames or gaps", correct: false }
            ],
            directorNote: "If the main subject keeps jumping around the frame, it tires viewers out. The scrub test reveals if you're making their eyes work too hard."
          },
          {
            question: "Where should captions be placed on a talking-head video?",
            options: [
              { text: "At the top so they don't cover the face", correct: false },
              { text: "Just below the chin, near the center", correct: true },
              { text: "On the left side where reading starts", correct: false },
              { text: "Wherever there's empty space", correct: false }
            ],
            directorNote: "The focal point is usually the face. Put text just below the chin so eyes don't have to travel. Everything stays in one spot."
          }
        ]
      },
      {
        id: "l7",
        title: "Sound Design",
        icon: "🔊",
        xOffset: 40,
        questions: [
          {
            question: "A text box slides onto the screen. Does it need a sound effect?",
            options: [
              { text: "Only if the message is important", correct: false },
              { text: "No—sound effects feel cheap", correct: false },
              { text: "Yes—anything that MOVES needs a matching sound", correct: true },
              { text: "Only if there's no music playing", correct: false }
            ],
            directorNote: "Movement without sound feels incomplete. When something moves, add a sound. Slide = woosh. Pop = click. This is the 'Movement Rule.'"
          },
          {
            question: "Your ad shows a problem, then the product as the solution. How should the music change?",
            options: [
              { text: "Stay consistent so it's not distracting", correct: false },
              { text: "Build louder toward the end for urgency", correct: false },
              { text: "Start tense/dark for the problem, switch to upbeat when the product appears", correct: true },
              { text: "Start upbeat to grab attention, then soften for credibility", correct: false }
            ],
            directorNote: "Music tells an emotional story. Dark = 'life is hard.' Bright = 'the product fixes it.' The switch happens exactly when the product is revealed."
          },
          {
            question: "The ad shows someone with a stiff, aching neck. What sound makes viewers FEEL it?",
            options: [
              { text: "Gentle, sad piano music", correct: false },
              { text: "A cracking or creaking sound effect", correct: true },
              { text: "The person saying 'ow' or wincing", correct: false },
              { text: "Silence so the visual has more weight", correct: false }
            ],
            directorNote: "Use sounds that match the body part. Neck/back = crack. Stomach = rumble. Joints = creak. These sounds make viewers feel it in their own body."
          }
        ]
      }
    ]
  },
  {
    id: 5,
    title: "Level 5: The CTA",
    description: "Making them click.",
    color: "bg-orange-500",
    levels: [
      {
        id: "l8",
        title: "CTA Engineering",
        icon: "🎯",
        xOffset: 0,
        questions: [
          {
            question: "The last 5 seconds of your ad need to drive action. You have the logo and link. What 3 elements must you add?",
            options: [
              { text: "Animated logo, music swell, brand slogan", correct: false },
              { text: "Arrow pointing where to click, countdown timer, discount offer", correct: true },
              { text: "Final testimonial, product close-up, 'thank you' text", correct: false },
              { text: "Keep it minimal—busy CTAs feel desperate", correct: false }
            ],
            directorNote: "CTAs need three things: Direction (where to look), Urgency (why act now), Value (what they get). Missing one = 30-50% fewer clicks."
          },
          {
            question: "Why show the actual landing page or checkout screen in your CTA?",
            options: [
              { text: "It looks more professional and official", correct: false },
              { text: "It proves the website exists and isn't a scam", correct: false },
              { text: "Viewers see what's coming, so they're more ready to click", correct: true },
              { text: "It fills empty space in the final frame", correct: false }
            ],
            directorNote: "When people see the landing page, they know what to expect. No surprises = more confidence = more clicks. They're mentally ready."
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
      headline: "You Get It.",
      body: "You know editing is about psychology, not fancy effects. Media buyers want to work with you. You make ads that print money."
    };
  } else if (score >= 80) {
    return {
      tier: "Scaling Specialist",
      emoji: "🚀",
      color: "from-green-500 to-emerald-400",
      bgColor: "bg-green-900",
      borderColor: "border-green-500",
      textColor: "text-green-300",
      headline: "Almost There.",
      body: "You know the basics well. A few more details about attention and psychology and you'll be unstoppable."
    };
  } else if (score >= 60) {
    return {
      tier: "Breakeven Editor",
      emoji: "📉",
      color: "from-orange-500 to-yellow-500",
      bgColor: "bg-orange-900",
      borderColor: "border-orange-500",
      textColor: "text-orange-300",
      headline: "Not Bad, But...",
      body: "Your ads look nice but don't make money. You're focused on pretty visuals instead of what makes people buy. Review the training!"
    };
  } else {
    return {
      tier: "Budget Burner",
      emoji: "🔥",
      color: "from-red-600 to-red-500",
      bgColor: "bg-red-900",
      borderColor: "border-red-500",
      textColor: "text-red-300",
      headline: "Time to Learn!",
      body: "You're editing like a filmmaker, not a salesperson. That burns ad budget. Go through the training mode to learn the rules."
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
