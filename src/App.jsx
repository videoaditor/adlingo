import React, { useState, useEffect } from 'react';
import { 
  Zap, Heart, Trophy, BookOpen, CheckCircle, XCircle, 
  Flame, Loader, AlertCircle, User, Play, Copy, Share2, RotateCcw
} from 'lucide-react';

// Assets
import robotStatic from './assets/adlingo robot static.png';
import robotThinking from './assets/adlingo robot thinking.png';
import robotDisappointed from './assets/adlingo robot dissapointed.png';

// --- 🛠️ ALL QUIZ QUESTIONS (13 Total) 🛠️ ---
const ALL_QUESTIONS = [
  // Level 1: Core Philosophy (3 questions)
  {
    id: "q1",
    category: "Core Philosophy",
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
    id: "q2",
    category: "Core Philosophy",
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
    id: "q3",
    category: "Core Philosophy",
    question: "A junior editor spends 4 hours creating a complex 'Masking Transition' between scenes. How does a Performance Editor evaluate this?",
    options: [
      { text: "Great work, high production value builds trust", correct: false },
      { text: "Good, but make it faster", correct: false },
      { text: "Waste of time. A simple cut with a Social Proof element (like a testimonial) converts better", correct: true },
      { text: "Essential. Transitions are the #1 driver of Retention", correct: false }
    ],
    directorNote: "Time spent on 'cool' transitions is time NOT spent on conversion elements. A $0 jump cut + a trust badge outperforms a $500 motion graphics package every time."
  },
  // Level 2: Anatomy of the Ad (4 questions)
  {
    id: "q4",
    category: "Anatomy of the Ad",
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
    id: "q5",
    category: "Anatomy of the Ad",
    question: "Why are Split Screens (showing two videos side-by-side) scientifically effective for increasing watch time?",
    options: [
      { text: "They allow you to show the product from more angles", correct: false },
      { text: "They look more premium than single video layers", correct: false },
      { text: "The human brain takes longer to process two distinct inputs, artificially creating a 'pause' in scrolling behavior", correct: true },
      { text: "They are the default format for Instagram Reels", correct: false }
    ],
    directorNote: "Dual processing = doubled cognitive load. The brain literally cannot scroll until it has processed BOTH images. This buys you 1-2 extra seconds of attention."
  },
  {
    id: "q6",
    category: "Anatomy of the Ad",
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
    id: "q7",
    category: "Anatomy of the Ad",
    question: "Which of the following is a high-converting visual format for 'Social Proof' (beyond just a talking head)?",
    options: [
      { text: "A cinematic shot of the product on a table", correct: false },
      { text: "A 'Grid View' (2x2 or 3x3) of multiple customers holding the product simultaneously", correct: true },
      { text: "A slow-motion shot of the founder smiling", correct: false },
      { text: "An animated text overlay saying '5 Stars'", correct: false }
    ],
    directorNote: "Grid layouts imply volume and community. Seeing 4-9 real people at once triggers 'Everyone has this, I'm missing out' (FOMO). It's the visual equivalent of a crowd."
  },
  // Level 3: Technical Workflow (4 questions)
  {
    id: "q8",
    category: "Technical Workflow",
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
    id: "q9",
    category: "Technical Workflow",
    question: "You are performing the 'Scrub Test' (dragging the playhead rapidly). What specific spatial consistency are you checking for?",
    options: [
      { text: "That the color grading is consistent across clips", correct: false },
      { text: "That the audio levels don't peak into the red", correct: false },
      { text: "That the viewer's focal point (eyes) stays in the center/same area to prevent eye fatigue", correct: true },
      { text: "That there are no black frames between cuts", correct: false }
    ],
    directorNote: "If the 'eye anchor' jumps around the frame, the viewer experiences micro-stress. The Scrub Test visually reveals if you're making them 'work' too hard."
  },
  {
    id: "q10",
    category: "Technical Workflow",
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
    id: "q11",
    category: "Technical Workflow",
    question: "How should the music track evolve over the course of a 60-second Problem/Solution ad?",
    options: [
      { text: "Use one high-energy track to keep momentum up", correct: false },
      { text: "Use a sad track to build empathy", correct: false },
      { text: "Start with a 'Problem' track (monotone/dark), then hard cut to a 'Solution' track (uplifting) when the product is introduced", correct: true },
      { text: "No music, only ASMR sounds", correct: false }
    ],
    directorNote: "The audio arc mirrors the emotional journey. Dark → Light. This subconsciously tells the viewer: 'Your life is bad now, but the product will fix it.'"
  },
  // Level 4: Scenarios (2 questions)
  {
    id: "q12",
    category: "Scenarios (Mastery)",
    question: "Scenario: You are editing a scene showing a person rubbing their back in pain. The client wants to make the pain feel 'real.' What audio layer do you add?",
    options: [
      { text: "Sad violin music", correct: false },
      { text: "A voiceover saying 'Ouch'", correct: false },
      { text: "A visceral 'Crunch,' 'Crack,' or deep 'Rumble' sound effect underneath the movement", correct: true },
      { text: "Louder ambient room noise", correct: false }
    ],
    directorNote: "Visceral SFX trigger a physical empathy response. The viewer 'feels' the crunch in their own body. This is 100x more effective than sad music."
  },
  {
    id: "q13",
    category: "Scenarios (Mastery)",
    question: "Scenario: You are designing the final 5 seconds (CTA). You have the logo and the URL. What else do you add to psychologically force the click?",
    options: [
      { text: "A complex animation of the logo spinning", correct: false },
      { text: "Visual cue (Arrow), Urgency (Countdown/Timer), and Value (Discount/Guarantee)", correct: true },
      { text: "A 'Thank You for Watching' text", correct: false },
      { text: "A fade to black", correct: false }
    ],
    directorNote: "The CTA is a stack: Direction (where to look) + Scarcity (why now) + Value (what they get). Missing any one of these reduces CTR by 30-50%."
  }
];

const TOTAL_QUESTIONS = ALL_QUESTIONS.length;

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

// --- COMPONENTS ---
const App = () => {
  const [view, setView] = useState('home'); // home, quiz, results
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({}); // { q1: true, q2: false, ... }
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [status, setStatus] = useState('idle'); // idle, correct, wrong
  const [copied, setCopied] = useState(false);

  const startQuiz = () => {
    setView('quiz');
    setCurrentQ(0);
    setAnswers({});
    setSelectedOpt(null);
    setStatus('idle');
  };

  const handleCheck = () => {
    if (selectedOpt === null) return;
    const q = ALL_QUESTIONS[currentQ];
    const isCorrect = q.options[selectedOpt].correct;
    setStatus(isCorrect ? 'correct' : 'wrong');
    setAnswers(prev => ({ ...prev, [q.id]: isCorrect }));
  };

  const handleNext = () => {
    if (currentQ + 1 < TOTAL_QUESTIONS) {
      setCurrentQ(i => i + 1);
      setStatus('idle');
      setSelectedOpt(null);
    } else {
      setView('results');
    }
  };

  const correctCount = Object.values(answers).filter(Boolean).length;
  const score = Math.round((correctCount / TOTAL_QUESTIONS) * 100);
  const tierData = getTierData(score);

  const copyResult = () => {
    const text = `I just scored ${score}/100 (${tierData.tier} ${tierData.emoji}) on the Ad Editor Crash Course. Can you beat my ROAS? https://adlingo.onrender.com`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // --- HOME SCREEN ---
  if (view === 'home') {
    return (
      <div className="min-h-screen bg-gray-900 text-white font-sans flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          {/* Logo & Robot */}
          <div className="mb-8">
            <img src={robotStatic} alt="Adlingo Bot" className="w-40 h-40 mx-auto mb-4 drop-shadow-2xl" />
            <h1 className="text-4xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
              ADLINGO
            </h1>
            <p className="text-gray-400 mt-2 font-medium">Performance Video Editor Certification</p>
          </div>

          {/* Stats Preview */}
          <div className="bg-gray-800 rounded-2xl p-6 mb-8 border border-gray-700 shadow-xl">
            <div className="flex justify-around text-center">
              <div>
                <div className="text-3xl font-black text-blue-400">{TOTAL_QUESTIONS}</div>
                <div className="text-xs text-gray-500 uppercase font-bold">Questions</div>
              </div>
              <div className="w-px bg-gray-700"></div>
              <div>
                <div className="text-3xl font-black text-green-400">4</div>
                <div className="text-xs text-gray-500 uppercase font-bold">Levels</div>
              </div>
              <div className="w-px bg-gray-700"></div>
              <div>
                <div className="text-3xl font-black text-purple-400">100</div>
                <div className="text-xs text-gray-500 uppercase font-bold">Max Score</div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <button 
            onClick={startQuiz}
            className="w-full py-5 bg-gradient-to-r from-green-500 to-emerald-400 text-white font-black text-xl rounded-2xl shadow-lg shadow-green-900/50 border-b-4 border-green-700 active:translate-y-1 active:shadow-none transition-all uppercase tracking-widest"
          >
            Start Certification
          </button>

          <p className="text-gray-500 text-sm mt-6">
            ⚠️ Traditional "filmmaking" logic often leads to the wrong answer here.
          </p>
        </div>
      </div>
    );
  }

  // --- QUIZ SCREEN ---
  if (view === 'quiz') {
    const q = ALL_QUESTIONS[currentQ];
    const progress = ((currentQ) / TOTAL_QUESTIONS) * 100;

    return (
      <div className="min-h-screen bg-gray-900 text-white font-sans flex flex-col">
        {/* Top Bar */}
        <div className="px-4 py-4 flex items-center gap-4 border-b border-gray-800">
          <button onClick={() => setView('home')} className="p-2 hover:bg-gray-800 rounded-full transition">
            <XCircle className="text-gray-400 hover:text-white" size={24} />
          </button>
          <div className="flex-1 h-3 bg-gray-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 ease-out" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="text-gray-400 font-bold text-sm">{currentQ + 1}/{TOTAL_QUESTIONS}</div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 pb-48">
          <div className="max-w-2xl mx-auto">
            {/* Category Tag */}
            <div className="text-center mb-4">
              <span className="bg-gray-800 text-gray-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-gray-700">
                {q.category}
              </span>
            </div>

            {/* Robot */}
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

            {/* Question */}
            <h2 className="text-xl md:text-2xl font-black text-center mb-8 leading-tight">{q.question}</h2>

            {/* Options */}
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

        {/* Bottom Action Sheet */}
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
                <CheckCircle className="mr-2" size={20} /> Correct! +{Math.round(100 / TOTAL_QUESTIONS)} points
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
              {status === 'idle' ? 'Check Answer' : currentQ + 1 < TOTAL_QUESTIONS ? 'Next Question' : 'See Results'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- RESULTS SCREEN (The Ad Account Dashboard) ---
  if (view === 'results') {
    return (
      <div className={`min-h-screen ${tierData.bgColor} text-white font-sans flex flex-col`}>
        {/* Screenshot-Friendly Result Card */}
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="max-w-sm w-full">
            
            {/* The "Ads Manager" Card */}
            <div className={`bg-gray-900 rounded-3xl p-6 border-2 ${tierData.borderColor} shadow-2xl relative overflow-hidden`}>
              
              {/* Fake Ads Manager Header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-800">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center font-black text-xs">AD</div>
                  <span className="font-bold text-gray-400 text-sm">Campaign Results</span>
                </div>
                <div className={`px-2 py-1 rounded text-xs font-bold ${tierData.textColor} bg-black/30`}>
                  CERTIFIED
                </div>
              </div>

              {/* Big Score */}
              <div className="text-center mb-6">
                <div className={`text-7xl font-black bg-gradient-to-r ${tierData.color} bg-clip-text text-transparent`}>
                  {score}
                </div>
                <div className="text-gray-500 font-bold text-sm uppercase tracking-widest">/ 100 ROAS Score</div>
              </div>

              {/* Tier Badge */}
              <div className={`bg-gradient-to-r ${tierData.color} rounded-2xl p-4 text-center mb-6`}>
                <div className="text-4xl mb-1">{tierData.emoji}</div>
                <div className="font-black text-xl uppercase tracking-wider">{tierData.tier}</div>
              </div>

              {/* Headline & Body */}
              <div className="text-center mb-6">
                <h2 className="text-xl font-black mb-2">{tierData.headline}</h2>
                <p className="text-gray-400 text-sm leading-relaxed">{tierData.body}</p>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-2 text-center bg-black/30 rounded-xl p-3">
                <div>
                  <div className="text-green-400 font-black text-lg">{correctCount}</div>
                  <div className="text-gray-500 text-xs uppercase">Correct</div>
                </div>
                <div>
                  <div className="text-red-400 font-black text-lg">{TOTAL_QUESTIONS - correctCount}</div>
                  <div className="text-gray-500 text-xs uppercase">Wrong</div>
                </div>
                <div>
                  <div className="text-blue-400 font-black text-lg">{TOTAL_QUESTIONS}</div>
                  <div className="text-gray-500 text-xs uppercase">Total</div>
                </div>
              </div>

              {/* Watermark */}
              <div className="mt-4 text-center">
                <span className="text-gray-600 text-xs font-bold">adlingo.onrender.com</span>
              </div>
            </div>

            {/* Action Buttons (Outside the screenshot card) */}
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
                onClick={startQuiz}
                className="w-full py-4 rounded-xl font-bold uppercase tracking-wider bg-gray-800 text-gray-300 hover:bg-gray-700 transition-all flex items-center justify-center border border-gray-700"
              >
                <RotateCcw size={20} className="mr-2" /> Retake Quiz
              </button>
            </div>

          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default App;
