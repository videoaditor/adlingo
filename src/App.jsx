import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { ChevronRight, Send, ExternalLink, Sparkles, Check, X, ArrowRight, Mail, Zap } from 'lucide-react';

import robotStatic from './assets/adlingo robot static.png';
import robotThinking from './assets/adlingo robot thinking.png';
import robotDisappointed from './assets/adlingo robot dissapointed.png';

// ─── CONFIG ───
const WEBHOOK_URL = import.meta.env.VITE_WEBHOOK_URL || 'https://hooks.example.com/adlingo';
const BRAND_ORANGE = '#E85D26';
const BRAND_DARK = '#1A1A2E';

// ─── QUIZ DATA ───
const SKILL_QUESTIONS = [
  {
    id: 1,
    round: 1,
    question: "Your ad has 2 seconds. What's the highest-priority element in your opening frame?",
    options: [
      { text: "Brand logo + tagline", correct: false },
      { text: "The problem/pain point", correct: true },
      { text: "A benefit claim", correct: false },
      { text: "Product shot", correct: false },
    ],
    note: "Leading with pain filters for your buyer.",
  },
  {
    id: 2,
    round: 1,
    question: "Which visual hook technique uses confusion as a scroll-stopper?",
    options: [
      { text: "Target audience mirroring", correct: false },
      { text: "Split screen", correct: false },
      { text: "Pixelation / blur / question marks", correct: true },
      { text: "Close-up texture", correct: false },
    ],
    note: "Curiosity-gap mechanic.",
  },
  {
    id: 3,
    round: 1,
    question: "Social proof, no celebrity. Strongest visual?",
    options: [
      { text: 'Text: "10,000+ customers"', correct: false },
      { text: "Grid of 6-9 real people holding product", correct: true },
      { text: "Stock photo smile", correct: false },
      { text: "One 5-star review", correct: false },
    ],
    note: "Grid triggers herd mentality.",
  },
  {
    id: 4,
    round: 1,
    question: "How often should visuals change in rough cut?",
    options: [
      { text: "Every 5 seconds", correct: false },
      { text: "Every 2 seconds", correct: true },
      { text: "Only at transitions", correct: false },
      { text: "When speaker pauses", correct: false },
    ],
    note: "The 2-Second Rule.",
  },
  {
    id: 5,
    round: 1,
    question: "When to add sound effects?",
    options: [
      { text: "Only on transitions", correct: false },
      { text: "On every element that moves", correct: true },
      { text: "Just background music", correct: false },
      { text: "Only CTA", correct: false },
    ],
    note: "Movement Rule: Everything that moves needs SFX.",
  },
  {
    id: 6,
    round: 1,
    question: "Music across problem vs solution sections?",
    options: [
      { text: "One track throughout", correct: false },
      { text: "Two tracks: darker for problem, uplifting for solution", correct: true },
      { text: "No music", correct: false },
      { text: "High-energy from start", correct: false },
    ],
    note: "Music break signals change — buys 10 more seconds.",
  },
  {
    id: 7,
    round: 1,
    question: "UGC avatar prompting — common mistake?",
    options: [
      { text: '"flat even lighting"', correct: false },
      { text: '"no phone visible"', correct: false },
      { text: "Leaving background blurred/bokeh", correct: true },
      { text: "Setting 9:16", correct: false },
    ],
    note: "iPhones don't blur in video mode.",
  },
  {
    id: 8,
    round: 1,
    question: "Product photo → high-fidelity video. Best workflow?",
    options: [
      { text: "Describe in Sora", correct: false },
      { text: "Kling frame mode with photo as input", correct: true },
      { text: "Film on iPhone", correct: false },
      { text: "Runway no reference", correct: false },
    ],
    note: "Kling frame mode for high-fidelity product shots.",
  },
  {
    id: 9,
    round: 1,
    type: 'freetext',
    question: "Write the prompt you'd use to recreate this AI-generated product shot:",
    placeholder: "Describe the scene, lighting, angle, style... (280 chars max)",
    maxLength: 280,
    imageDescription: "A sleek matte-black wireless earbud floating against a gradient purple-to-orange background, with soft reflections and dramatic rim lighting, shot in a commercial product photography style",
    note: "Prompt engineering is the new art direction.",
  },
];

const INTEL_QUESTIONS = [
  {
    id: 10,
    round: 2,
    type: 'multiselect',
    question: "What video ad types are you currently testing?",
    options: [
      "UGC testimonials", "Product demos", "Before/after", "Talking head",
      "Animated explainer", "AI-generated", "Mashup/compilation", "None yet",
    ],
  },
  {
    id: 11,
    round: 2,
    type: 'multiselect',
    question: "Which AI tools are in your workflow?",
    options: [
      "ChatGPT/Claude", "Midjourney/DALL-E", "Runway/Kling", "Sora",
      "ElevenLabs", "Suno/Udio", "ComfyUI", "None",
    ],
  },
  {
    id: 12,
    round: 2,
    type: 'brandinfo',
    question: "Last step — tell us about your brand:",
  },
];

const ALL_QUESTIONS = [...SKILL_QUESTIONS, ...INTEL_QUESTIONS];
const TOTAL = ALL_QUESTIONS.length;

// ─── TIER SYSTEM ───
const getTier = (score) => {
  if (score >= 8) return { name: 'Unicorn', emoji: '🦄', color: 'from-purple-500 to-pink-500', bg: 'bg-purple-500/20', border: 'border-purple-500/50', desc: "You're operating at an elite level. You understand that ads are psychology engines, not art projects. Media buyers dream of working with editors like you." };
  if (score >= 6) return { name: 'Scaling Specialist', emoji: '🚀', color: 'from-emerald-400 to-cyan-400', bg: 'bg-emerald-500/20', border: 'border-emerald-500/50', desc: "You've got serious chops. A few blind spots to clean up, but you're already dangerous. With the right system, you'd be printing money." };
  if (score >= 4) return { name: 'Breakeven Editor', emoji: '📊', color: 'from-orange-400 to-yellow-400', bg: 'bg-orange-500/20', border: 'border-orange-500/50', desc: "Your ads look good but don't convert. You're focused on aesthetics over psychology. The gap between you and profitable is smaller than you think." };
  return { name: 'Budget Burner', emoji: '🔥', color: 'from-red-500 to-orange-500', bg: 'bg-red-500/20', border: 'border-red-500/50', desc: "You're editing like a filmmaker, not a performance marketer. Every ad you ship burns budget. But hey — awareness is the first step." };
};

// ─── CONFETTI ───
const Confetti = ({ active }) => {
  if (!active) return null;
  const pieces = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 0.3,
    duration: 0.8 + Math.random() * 0.6,
    color: ['#E85D26', '#FFD700', '#00FF88', '#FF69B4', '#00BFFF'][Math.floor(Math.random() * 5)],
    size: 4 + Math.random() * 6,
  }));
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map(p => (
        <motion.div
          key={p.id}
          initial={{ y: -20, x: `${p.x}vw`, opacity: 1, rotate: 0 }}
          animate={{ y: '110vh', opacity: 0, rotate: 360 + Math.random() * 360 }}
          transition={{ duration: p.duration, delay: p.delay, ease: 'easeIn' }}
          style={{ position: 'absolute', width: p.size, height: p.size, borderRadius: Math.random() > 0.5 ? '50%' : '2px', backgroundColor: p.color }}
        />
      ))}
    </div>
  );
};

// ─── MASCOT ───
const Mascot = ({ state, size = 'md' }) => {
  const src = state === 'happy' ? robotStatic : state === 'sad' ? robotDisappointed : robotThinking;
  const sizeClass = size === 'lg' ? 'w-28 h-28' : size === 'sm' ? 'w-16 h-16' : 'w-20 h-20';
  return (
    <motion.div
      key={state}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
      className={`${sizeClass} mx-auto`}
    >
      <img src={src} alt="AdLingo mascot" className="w-full h-full object-contain" />
    </motion.div>
  );
};

// ─── PROGRESS BAR ───
const ProgressBar = ({ current, total }) => (
  <div className="flex items-center gap-3 px-4 py-3">
    <div className="flex-1 h-2.5 bg-white/10 rounded-full overflow-hidden">
      <motion.div
        className="h-full rounded-full"
        style={{ background: `linear-gradient(90deg, ${BRAND_ORANGE}, #FF8A50)` }}
        initial={false}
        animate={{ width: `${(current / total) * 100}%` }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      />
    </div>
    <span className="text-xs font-bold text-white/50 tabular-nums">{current}/{total}</span>
  </div>
);

// ─── LANDING PAGE ───
const Landing = ({ onStart, onPathB }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="min-h-[100dvh] flex flex-col items-center justify-center px-6 py-12"
    style={{ background: `linear-gradient(180deg, ${BRAND_DARK} 0%, #0D0D1A 100%)` }}
  >
    <motion.div
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="text-center max-w-sm w-full"
    >
      <Mascot state="happy" size="lg" />
      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-4xl font-black mt-6 mb-2 tracking-tight"
      >
        <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">AD</span>
        <span className="text-white">LINGO</span>
      </motion.h1>
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-white/50 text-sm mb-10"
      >
        How sharp is your ad creative eye?
      </motion.p>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="space-y-3"
      >
        <button
          onClick={onStart}
          className="w-full py-4 rounded-2xl font-black text-lg text-white relative overflow-hidden group active:scale-[0.98] transition-transform"
          style={{ background: `linear-gradient(135deg, ${BRAND_ORANGE}, #FF4500)` }}
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            Test My Skills <Zap size={18} />
          </span>
          <div className="absolute inset-0 bg-white/10 opacity-0 group-active:opacity-100 transition-opacity" />
        </button>

        <button
          onClick={onPathB}
          className="w-full py-3.5 rounded-2xl font-bold text-sm text-white/60 border border-white/10 hover:border-white/20 hover:text-white/80 transition-all active:scale-[0.98]"
        >
          I'm sending this to someone else →
        </button>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-white/20 text-xs mt-8"
      >
        12 questions · 3 minutes · Free audit report
      </motion.p>
    </motion.div>
  </motion.div>
);

// ─── PATH B ───
const PathB = ({ onBack }) => {
  const [copied, setCopied] = useState(false);
  const link = `${window.location.origin}${window.location.pathname}`;
  const copy = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-[100dvh] flex flex-col items-center justify-center px-6"
      style={{ background: `linear-gradient(180deg, ${BRAND_DARK} 0%, #0D0D1A 100%)` }}
    >
      <div className="max-w-sm w-full text-center">
        <Mascot state="thinking" size="lg" />
        <h2 className="text-2xl font-black text-white mt-6 mb-2">Share This Quiz</h2>
        <p className="text-white/50 text-sm mb-8">Send this link to your editor or team member. They'll take the quiz and get a personalized audit.</p>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-3 mb-4">
          <span className="text-white/70 text-sm truncate flex-1">{link}</span>
          <button onClick={copy} className="shrink-0 px-4 py-2 rounded-lg font-bold text-sm transition-all" style={{ background: copied ? '#22c55e' : BRAND_ORANGE, color: 'white' }}>
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <button onClick={onBack} className="text-white/40 text-sm hover:text-white/60 transition">← Back</button>
      </div>
    </motion.div>
  );
};

// ─── OPTION BUTTON ───
const OptionButton = ({ text, index, selected, correct, status, onSelect, disabled }) => {
  const letters = ['A', 'B', 'C', 'D'];
  const isSelected = selected === index;
  const isCorrect = status !== 'idle' && correct;
  const isWrong = status === 'wrong' && isSelected;

  let borderColor = 'border-white/10';
  let bg = 'bg-white/[0.03]';
  let textColor = 'text-white/80';

  if (status === 'idle' && isSelected) {
    borderColor = 'border-orange-500';
    bg = 'bg-orange-500/10';
    textColor = 'text-orange-300';
  } else if (isCorrect) {
    borderColor = 'border-emerald-500';
    bg = 'bg-emerald-500/10';
    textColor = 'text-emerald-300';
  } else if (isWrong) {
    borderColor = 'border-red-500';
    bg = 'bg-red-500/10';
    textColor = 'text-red-300';
  }

  return (
    <motion.button
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.1 + index * 0.08, type: 'spring', stiffness: 300, damping: 25 }}
      onClick={() => !disabled && onSelect(index)}
      disabled={disabled}
      className={`w-full p-4 rounded-xl border-2 ${borderColor} ${bg} text-left transition-all active:scale-[0.98] ${disabled ? '' : 'cursor-pointer'}`}
    >
      <div className="flex items-start gap-3">
        <motion.div
          animate={isWrong ? { x: [0, -4, 4, -4, 4, 0] } : {}}
          transition={{ duration: 0.4 }}
          className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center text-sm font-black shrink-0 ${
            isCorrect ? 'border-emerald-500 text-emerald-400 bg-emerald-500/20' :
            isWrong ? 'border-red-500 text-red-400 bg-red-500/20' :
            isSelected ? 'border-orange-500 text-orange-400' : 'border-white/20 text-white/30'
          }`}
        >
          {isCorrect && status !== 'idle' ? <Check size={14} strokeWidth={3} /> : isWrong ? <X size={14} strokeWidth={3} /> : letters[index]}
        </motion.div>
        <span className={`pt-0.5 ${textColor} font-medium text-[15px] leading-snug`}>{text}</span>
      </div>
    </motion.button>
  );
};

// ─── MULTI-SELECT CHIPS ───
const ChipSelect = ({ options, selected, onToggle }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 0.2 }}
    className="flex flex-wrap gap-2 justify-center"
  >
    {options.map((opt, i) => {
      const active = selected.includes(opt);
      return (
        <motion.button
          key={opt}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.05 * i, type: 'spring', stiffness: 400, damping: 20 }}
          onClick={() => onToggle(opt)}
          className={`px-4 py-2.5 rounded-full text-sm font-semibold transition-all active:scale-95 ${
            active
              ? 'bg-orange-500 text-white border-2 border-orange-400'
              : 'bg-white/5 text-white/60 border-2 border-white/10 hover:border-white/20'
          }`}
        >
          {active && <Check size={12} className="inline mr-1 -mt-0.5" />}
          {opt}
        </motion.button>
      );
    })}
  </motion.div>
);

// ─── BRAND INFO FORM ───
const BrandInfoForm = ({ brandName, brandUrl, onChange }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-4 max-w-sm mx-auto">
    <div>
      <label className="text-white/40 text-xs font-bold uppercase tracking-wider mb-2 block">Brand Name</label>
      <input
        type="text"
        value={brandName}
        onChange={(e) => onChange('brandName', e.target.value)}
        placeholder="Acme Inc."
        className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/20 focus:border-orange-500 focus:outline-none transition-colors text-[15px]"
      />
    </div>
    <div>
      <label className="text-white/40 text-xs font-bold uppercase tracking-wider mb-2 block">Website URL</label>
      <input
        type="url"
        value={brandUrl}
        onChange={(e) => onChange('brandUrl', e.target.value)}
        placeholder="https://acme.com"
        className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/20 focus:border-orange-500 focus:outline-none transition-colors text-[15px]"
      />
    </div>
  </motion.div>
);

// ─── ROUND TRANSITION ───
const RoundTransition = ({ onContinue }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="min-h-[100dvh] flex flex-col items-center justify-center px-6"
    style={{ background: `linear-gradient(180deg, ${BRAND_DARK} 0%, #0D0D1A 100%)` }}
  >
    <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} transition={{ type: 'spring', stiffness: 200 }} className="text-center max-w-sm">
      <Mascot state="happy" size="lg" />
      <h2 className="text-2xl font-black text-white mt-6 mb-2">Skills Assessed! 🔥</h2>
      <p className="text-white/50 text-sm mb-8">Now let's learn about your brand so we can generate your personalized audit report.</p>
      <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}>
        <button onClick={onContinue} className="px-8 py-4 rounded-2xl font-black text-white text-lg active:scale-95 transition-transform" style={{ background: `linear-gradient(135deg, ${BRAND_ORANGE}, #FF4500)` }}>
          Continue <ArrowRight size={18} className="inline ml-1" />
        </button>
      </motion.div>
    </motion.div>
  </motion.div>
);

// ─── TIER REVEAL ───
const TierReveal = ({ tier, score, onContinue }) => {
  const [phase, setPhase] = useState(0); // 0=counting, 1=tier, 2=full
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    // Count up score
    let current = 0;
    const interval = setInterval(() => {
      current++;
      setDisplayScore(current);
      if (current >= score) {
        clearInterval(interval);
        setTimeout(() => setPhase(1), 400);
        setTimeout(() => setPhase(2), 1200);
      }
    }, 80);
    return () => clearInterval(interval);
  }, [score]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-[100dvh] flex flex-col items-center justify-center px-6"
      style={{ background: `linear-gradient(180deg, ${BRAND_DARK} 0%, #0D0D1A 100%)` }}
    >
      <Confetti active={phase >= 1} />
      <div className="text-center max-w-sm w-full">
        <motion.div
          animate={{ scale: phase >= 1 ? [1, 1.2, 1] : 1 }}
          transition={{ duration: 0.5 }}
        >
          <Mascot state={score >= 6 ? 'happy' : score >= 4 ? 'thinking' : 'sad'} size="lg" />
        </motion.div>

        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, type: 'spring' }}
          className="mt-6"
        >
          <div className="text-6xl font-black tabular-nums">
            <span className={`bg-gradient-to-r ${tier.color} bg-clip-text text-transparent`}>{displayScore}</span>
            <span className="text-white/20 text-3xl">/9</span>
          </div>
        </motion.div>

        <AnimatePresence>
          {phase >= 1 && (
            <motion.div
              initial={{ y: 30, opacity: 0, scale: 0.8 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="mt-6"
            >
              <div className={`inline-block px-6 py-3 rounded-2xl bg-gradient-to-r ${tier.color} text-white font-black text-2xl tracking-tight`}>
                {tier.emoji} {tier.name}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {phase >= 2 && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-6"
            >
              <p className="text-white/50 text-sm leading-relaxed mb-8">{tier.desc}</p>
              <button
                onClick={onContinue}
                className="w-full py-4 rounded-2xl font-black text-white text-lg active:scale-[0.98] transition-transform"
                style={{ background: `linear-gradient(135deg, ${BRAND_ORANGE}, #FF4500)` }}
              >
                Get My Free Audit Report <Mail size={18} className="inline ml-1" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// ─── EMAIL GATE ───
const EmailGate = ({ tier, onSubmit, loading }) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-[100dvh] flex flex-col items-center justify-center px-6"
      style={{ background: `linear-gradient(180deg, ${BRAND_DARK} 0%, #0D0D1A 100%)` }}
    >
      <div className="max-w-sm w-full text-center">
        <Mascot state="happy" size="md" />
        <h2 className="text-2xl font-black text-white mt-4 mb-1">Your Audit Is Ready</h2>
        <p className="text-white/40 text-sm mb-8">We'll send a personalized video ad audit based on your answers. No spam — just one fire email.</p>
        <div className="space-y-3 text-left mb-6">
          <input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/20 focus:border-orange-500 focus:outline-none transition-colors"
          />
          <input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/20 focus:border-orange-500 focus:outline-none transition-colors"
          />
        </div>
        <button
          onClick={() => email && name && onSubmit({ email, name })}
          disabled={!email || !name || loading}
          className="w-full py-4 rounded-2xl font-black text-white text-lg active:scale-[0.98] transition-transform disabled:opacity-40"
          style={{ background: `linear-gradient(135deg, ${BRAND_ORANGE}, #FF4500)` }}
        >
          {loading ? (
            <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>⏳</motion.span>
          ) : (
            <>Send My Audit <Send size={16} className="inline ml-1" /></>
          )}
        </button>
        <p className="text-white/15 text-xs mt-4">We respect your inbox. Unsubscribe anytime.</p>
      </div>
    </motion.div>
  );
};

// ─── THANK YOU ───
const ThankYou = ({ tier }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="min-h-[100dvh] flex flex-col items-center justify-center px-6"
    style={{ background: `linear-gradient(180deg, ${BRAND_DARK} 0%, #0D0D1A 100%)` }}
  >
    <Confetti active />
    <div className="max-w-sm w-full text-center">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
        <Mascot state="happy" size="lg" />
      </motion.div>
      <motion.h2 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="text-3xl font-black text-white mt-6 mb-2">
        Check Your Inbox! 📬
      </motion.h2>
      <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="text-white/50 text-sm mb-8">
        Your personalized {tier.name} audit report is being generated and will hit your inbox in a few minutes.
      </motion.p>
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.7 }} className="space-y-3">
        <a
          href="https://aditor.ai"
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full py-4 rounded-2xl font-bold text-white/70 border-2 border-white/10 hover:border-white/20 transition-all active:scale-[0.98]"
        >
          Visit Aditor.ai <ExternalLink size={14} className="inline ml-1" />
        </a>
      </motion.div>
    </div>
  </motion.div>
);

// ─── MAIN APP ───
const App = () => {
  const mode = new URLSearchParams(window.location.search).get('mode');
  const isCert = mode === 'cert';

  const [view, setView] = useState('landing'); // landing, pathB, quiz, roundTransition, tierReveal, emailGate, thankyou
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [status, setStatus] = useState('idle'); // idle, correct, wrong
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showConfetti, setShowConfetti] = useState(false);
  const [multiSelected, setMultiSelected] = useState([]);
  const [freeText, setFreeText] = useState('');
  const [brandName, setBrandName] = useState('');
  const [brandUrl, setBrandUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [mascotState, setMascotState] = useState('thinking');

  const q = ALL_QUESTIONS[qIndex];
  const isSkillQ = q && q.round === 1 && q.type !== 'freetext';
  const isFreetextQ = q && q.type === 'freetext';
  const isMultiQ = q && q.type === 'multiselect';
  const isBrandQ = q && q.type === 'brandinfo';

  const handleSelect = (idx) => {
    if (status !== 'idle') return;
    setSelected(idx);
  };

  const handleCheck = () => {
    if (isSkillQ) {
      if (selected === null) return;
      const isCorrect = q.options[selected].correct;
      setStatus(isCorrect ? 'correct' : 'wrong');
      setMascotState(isCorrect ? 'happy' : 'sad');
      if (isCorrect) {
        setScore(s => s + 1);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 1500);
      }
      setAnswers(prev => ({ ...prev, [q.id]: { selected: q.options[selected].text, correct: isCorrect } }));
    } else if (isFreetextQ) {
      // Free text always "passes" — scored by AI later
      setAnswers(prev => ({ ...prev, [q.id]: { text: freeText } }));
      advance();
      return;
    } else if (isMultiQ) {
      setAnswers(prev => ({ ...prev, [q.id]: { selected: multiSelected } }));
      advance();
      return;
    } else if (isBrandQ) {
      setAnswers(prev => ({ ...prev, [q.id]: { brandName, brandUrl } }));
      // This is the last question — go to tier reveal
      const tier = getTier(score);
      setView('tierReveal');
      return;
    }
  };

  const advance = () => {
    const nextIdx = qIndex + 1;
    if (nextIdx >= TOTAL) {
      setView('tierReveal');
      return;
    }
    // Check for round transition (after Q9, before Q10)
    if (q.round === 1 && ALL_QUESTIONS[nextIdx].round === 2) {
      setView('roundTransition');
      return;
    }
    setQIndex(nextIdx);
    setSelected(null);
    setStatus('idle');
    setMascotState('thinking');
    setMultiSelected([]);
    setFreeText('');
  };

  const handleNext = () => {
    advance();
  };

  const handleMultiToggle = (opt) => {
    setMultiSelected(prev => prev.includes(opt) ? prev.filter(o => o !== opt) : [...prev, opt]);
  };

  const handleBrandChange = (field, value) => {
    if (field === 'brandName') setBrandName(value);
    else setBrandUrl(value);
  };

  const handleEmailSubmit = async ({ email, name }) => {
    setLoading(true);
    const payload = {
      name,
      email,
      score,
      tier: getTier(score).name,
      answers,
      timestamp: new Date().toISOString(),
      mode: isCert ? 'cert' : 'self',
    };
    try {
      await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (e) {
      console.error('Webhook failed:', e);
    }
    setLoading(false);
    setView('thankyou');
  };

  const tier = getTier(score);

  // ─── RENDER ───
  if (view === 'landing') return <Landing onStart={() => setView('quiz')} onPathB={() => setView('pathB')} />;
  if (view === 'pathB') return <PathB onBack={() => setView('landing')} />;
  if (view === 'roundTransition') return <RoundTransition onContinue={() => { setQIndex(SKILL_QUESTIONS.length); setSelected(null); setStatus('idle'); setMascotState('thinking'); setMultiSelected([]); setView('quiz'); }} />;
  if (view === 'tierReveal') return <TierReveal tier={tier} score={score} onContinue={() => setView('emailGate')} />;
  if (view === 'emailGate') return <EmailGate tier={tier} onSubmit={handleEmailSubmit} loading={loading} />;
  if (view === 'thankyou') return <ThankYou tier={tier} />;

  // ─── QUIZ VIEW ───
  return (
    <div className="min-h-[100dvh] flex flex-col" style={{ background: `linear-gradient(180deg, ${BRAND_DARK} 0%, #0D0D1A 100%)` }}>
      <Confetti active={showConfetti} />
      <ProgressBar current={qIndex + 1} total={TOTAL} />

      <div className="flex-1 overflow-y-auto px-5 pb-36">
        <div className="max-w-lg mx-auto pt-4">
          {/* Round indicator */}
          <motion.div
            key={`round-${q.round}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center mb-3"
          >
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/25">
              {q.round === 1 ? 'Round 1 · Skill Check' : 'Round 2 · Brand Intel'}
            </span>
          </motion.div>

          {/* Mascot */}
          {isSkillQ && <Mascot state={mascotState} />}

          {/* Question */}
          <AnimatePresence mode="wait">
            <motion.h2
              key={q.id}
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -15, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="text-lg font-black text-white text-center mt-4 mb-6 leading-snug"
            >
              {q.question}
            </motion.h2>
          </AnimatePresence>

          {/* Q9 image description */}
          {isFreetextQ && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                <div className="text-4xl mb-2">🖼️</div>
                <p className="text-white/50 text-xs italic">{q.imageDescription}</p>
              </div>
              <textarea
                value={freeText}
                onChange={e => setFreeText(e.target.value.slice(0, q.maxLength))}
                placeholder={q.placeholder}
                maxLength={q.maxLength}
                rows={3}
                className="w-full mt-4 bg-white/5 border-2 border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:border-orange-500 focus:outline-none transition-colors text-[15px] resize-none"
              />
              <div className="text-right text-white/20 text-xs mt-1">{freeText.length}/{q.maxLength}</div>
            </motion.div>
          )}

          {/* Standard options */}
          {isSkillQ && (
            <div className="space-y-2.5">
              {q.options.map((opt, idx) => (
                <OptionButton
                  key={`${q.id}-${idx}`}
                  text={opt.text}
                  index={idx}
                  selected={selected}
                  correct={opt.correct}
                  status={status}
                  onSelect={handleSelect}
                  disabled={status !== 'idle'}
                />
              ))}
            </div>
          )}

          {/* Multi-select */}
          {isMultiQ && (
            <ChipSelect options={q.options} selected={multiSelected} onToggle={handleMultiToggle} />
          )}

          {/* Brand info */}
          {isBrandQ && (
            <BrandInfoForm brandName={brandName} brandUrl={brandUrl} onChange={handleBrandChange} />
          )}

          {/* Director's Note */}
          <AnimatePresence>
            {status !== 'idle' && q.note && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden mt-4"
              >
                <div className={`p-4 rounded-xl border ${status === 'correct' ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                  <p className="text-xs font-bold uppercase tracking-wider text-white/40 mb-1">💡 Why?</p>
                  <p className={`text-sm ${status === 'correct' ? 'text-emerald-300' : 'text-red-300'}`}>{q.note}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0D0D1A]/95 backdrop-blur-xl border-t border-white/5">
        <div className="max-w-lg mx-auto p-4">
          {status === 'idle' ? (
            <button
              onClick={handleCheck}
              disabled={isSkillQ ? selected === null : isFreetextQ ? !freeText.trim() : isMultiQ ? multiSelected.length === 0 : isBrandQ ? (!brandName.trim()) : true}
              className="w-full py-4 rounded-2xl font-black text-white text-base uppercase tracking-wider active:scale-[0.98] transition-all disabled:opacity-30"
              style={{ background: `linear-gradient(135deg, ${BRAND_ORANGE}, #FF4500)` }}
            >
              {isSkillQ ? 'Check' : 'Continue'}
            </button>
          ) : (
            <motion.button
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              onClick={handleNext}
              className="w-full py-4 rounded-2xl font-black text-base uppercase tracking-wider active:scale-[0.98] transition-transform bg-white text-gray-900"
            >
              {qIndex + 1 < TOTAL ? 'Continue' : 'See Results'}
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
