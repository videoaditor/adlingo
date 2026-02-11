import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Send, ExternalLink, Check, X, ArrowRight, Mail, Zap, Eye, AlertTriangle } from 'lucide-react';

import robotStatic from './assets/adlingo robot static.png';
import robotThinking from './assets/adlingo robot thinking.png';
import robotDisappointed from './assets/adlingo robot dissapointed.png';

// ─── CONFIG ───
const WEBHOOK_URL = import.meta.env.VITE_WEBHOOK_URL || 'https://hooks.example.com/adlingo';
const BRAND_ORANGE = '#E85D26';
const BRAND_DARK = '#1A1A2E';

// ─── VISUAL QUIZ DATA ───
// Each question now has visual context: images, comparisons, annotated screenshots
const SKILL_QUESTIONS = [
  {
    id: 1,
    round: 1,
    // Visual: show the actual hook frame and ask what's wrong
    visual: {
      type: 'single-image',
      src: '/quiz-images/hook-example.jpg',
      caption: 'This is the opening frame of a video ad. What\'s the #1 problem?',
      mascotSays: '👆 Look at this hook...',
    },
    question: "This ad opens with a branded podcast setup. What's the biggest mistake?",
    options: [
      { text: "The lighting is too dark", correct: false },
      { text: "It leads with the brand — not the viewer's pain point", correct: true },
      { text: "The text overlay is too small", correct: false },
      { text: "It needs background music first", correct: false },
    ],
    note: "The first frame should filter for YOUR buyer by showing their problem. A branded setup attracts brand fans, not cold traffic.",
  },
  {
    id: 2,
    round: 1,
    // Visual: show 4 different hook styles as a grid, ask which uses confusion
    visual: {
      type: 'technique-grid',
      items: [
        { label: 'A: Mirror', icon: '🪞', desc: 'Show someone who looks like the viewer' },
        { label: 'B: Split Screen', icon: '⬜⬛', desc: 'Before vs after side by side' },
        { label: 'C: Blur/Pixelate', icon: '🔍', desc: 'Hide something to create curiosity', highlight: true },
        { label: 'D: Texture Close-up', icon: '🔬', desc: 'Extreme detail shot of product' },
      ],
      mascotSays: '🤔 Which technique weaponizes confusion?',
    },
    question: "Which visual hook technique uses confusion as a scroll-stopper?",
    options: [
      { text: "Target audience mirroring", correct: false },
      { text: "Split screen", correct: false },
      { text: "Pixelation / blur / question marks", correct: true },
      { text: "Close-up texture", correct: false },
    ],
    note: "Curiosity-gap mechanic. The brain MUST resolve what's hidden before scrolling away.",
  },
  {
    id: 3,
    round: 1,
    type: 'image-options',
    visual: {
      type: 'hook-text',
      hookText: '"Women are going CRAZY over this collagen..."',
      mascotSays: '🎯 How do you visualize this hook?',
    },
    question: "Pick the visual that best matches this hook:",
    imageOptions: [
      { imageSrc: '/quiz-images/ugc-gracen.png', label: 'Social proof grid — women holding the product', correct: true },
      { imageSrc: '/quiz-images/ugc-bokeh-mistake.png', label: 'Pixelated intrigue — blur/question marks', correct: false },
      { imageSrc: '/quiz-images/ugc-skeptic.png', label: 'Woman looking angry ("crazy" = rage)', correct: false },
      { imageSrc: '/quiz-images/product-badge.png', label: 'Product page with red circles', correct: false },
    ],
    note: '"Going crazy" means excitement, not anger. Show a GRID of women genuinely excited about the product. That\'s what makes viewers think "I need what they have."',
  },
  {
    id: 4,
    round: 1,
    // Visual: show a grid of real UGC avatars from our work
    visual: {
      type: 'ugc-grid',
      images: [
        '/quiz-images/ugc-executive.png',
        '/quiz-images/ugc-bokeh-mistake.png',
        '/quiz-images/ugc-skeptic.png',
        '/quiz-images/ugc-biohacker.png',
        '/quiz-images/ugc-gracen.png',
        '/quiz-images/ugc-pro.png',
      ],
      mascotSays: '👀 Real social proof. Which format converts best?',
    },
    question: "Social proof with no celebrity budget. Which visual format is strongest?",
    options: [
      { text: 'Text overlay: "10,000+ happy customers"', correct: false },
      { text: "Grid of 6-9 real people holding the product", correct: true },
      { text: "One stock photo of a smiling person", correct: false },
      { text: "A single 5-star review screenshot", correct: false },
    ],
    note: "Grid triggers herd mentality. Seeing 6+ real faces at once makes viewers think 'everyone has this — I'm missing out.'",
  },
  {
    id: 5,
    round: 1,
    // Visual: show a fake timeline with timing markers
    visual: {
      type: 'timeline',
      mascotSays: '⏱️ Look at this timeline. Something\'s off...',
    },
    question: "How often should visuals change in a rough cut?",
    options: [
      { text: "Every 5 seconds", correct: false },
      { text: "Every 2 seconds", correct: true },
      { text: "Only at transitions", correct: false },
      { text: "When the speaker pauses", correct: false },
    ],
    note: "The 2-Second Rule. Every 2-3 seconds needs a VISUAL change — zoom, cut, text pop, overlay. Audio changes alone don't reset attention.",
  },
  {
    id: 6,
    round: 1,
    // Visual: show a waveform/timeline with SFX markers
    visual: {
      type: 'waveform',
      mascotSays: '🔊 When do you add sound effects?',
    },
    question: "A text box slides on screen. A product zooms in. An arrow points. When do you add SFX?",
    options: [
      { text: "Only on transitions", correct: false },
      { text: "On every element that moves", correct: true },
      { text: "Just layer background music", correct: false },
      { text: "Only on the CTA", correct: false },
    ],
    note: "Movement Rule: Everything that moves needs a sound. Slide = whoosh. Pop-up = click. Movement without sound feels incomplete.",
  },
  {
    id: 7,
    round: 1,
    // Visual: show two-track music comparison
    visual: {
      type: 'music-split',
      mascotSays: '🎵 Problem section vs. solution section...',
    },
    question: "Music across problem vs solution sections?",
    options: [
      { text: "One track throughout", correct: false },
      { text: "Two tracks: darker for problem, uplifting for solution", correct: true },
      { text: "No music — let VO carry it", correct: false },
      { text: "High-energy from the start", correct: false },
    ],
    note: "Music break signals emotional change — the shift from dark to bright buys you 10 more seconds of attention.",
  },
  {
    id: 8,
    round: 1,
    // Visual: show the actual UGC image with bokeh background and circle the problem
    visual: {
      type: 'spot-the-error',
      src: '/quiz-images/ugc-bokeh-mistake.png',
      errorZone: { x: '50%', y: '70%', label: '???' },
      mascotSays: '🔎 This AI-generated UGC avatar has a common mistake. Can you spot it?',
    },
    question: "What's the prompting mistake in this AI-generated UGC avatar?",
    options: [
      { text: '"flat even lighting" — looks too studio', correct: false },
      { text: '"no phone visible" in the prompt', correct: false },
      { text: "Background is blurred/bokeh — iPhones don't do that in video", correct: true },
      { text: "9:16 aspect ratio is wrong", correct: false },
    ],
    note: "iPhones don't blur backgrounds in video mode. If your AI UGC has bokeh, it screams 'fake' to anyone who's filmed with a phone.",
  },
  {
    id: 9,
    round: 1,
    // Visual: show a product photo and ask about workflow
    visual: {
      type: 'workflow-comparison',
      productSrc: '/quiz-images/product-serum.png',
      mascotSays: '📸→🎬 You have this product photo. How do you turn it into video?',
    },
    question: "Product photo → high-fidelity video. Best workflow?",
    options: [
      { text: "Describe it in Sora from memory", correct: false },
      { text: "Kling frame mode with photo as input", correct: true },
      { text: "Just film it on an iPhone", correct: false },
      { text: "Runway with no reference image", correct: false },
    ],
    note: "Kling frame mode preserves the exact product appearance. Without a reference image, AI will hallucinate your product.",
  },
  {
    id: 10,
    round: 1,
    type: 'freetext',
    // Visual: show the actual AI-generated image
    visual: {
      type: 'prompt-test',
      src: '/quiz-images/ai-ugc-prompt-test.png',
      mascotSays: '✍️ Write the prompt to recreate this image.',
    },
    question: "Study this AI-generated image. Write the prompt you'd use to recreate it:",
    placeholder: "Describe the scene, subject, lighting, camera angle, style, imperfections... (280 chars max)",
    maxLength: 280,
    note: "Prompt engineering is the new art direction. The best prompts include: subject, setting, camera angle, lighting, mood, and intentional imperfections for realism.",
  },
];

const INTEL_QUESTIONS = [
  {
    id: 11,
    round: 2,
    type: 'multiselect',
    visual: {
      type: 'icon-grid',
      mascotSays: '📊 Help us understand your current workflow...',
    },
    question: "What video ad types are you currently testing?",
    options: [
      "UGC testimonials", "Product demos", "Before/after", "Talking head",
      "Animated explainer", "AI-generated", "Mashup/compilation", "None yet",
    ],
  },
  {
    id: 12,
    round: 2,
    type: 'multiselect',
    visual: {
      type: 'icon-grid',
      mascotSays: '🤖 What\'s in your AI toolkit?',
    },
    question: "Which AI tools are in your workflow?",
    options: [
      "ChatGPT / Claude", "Midjourney / DALL-E", "Runway / Kling", "Sora",
      "ElevenLabs", "Suno / Udio", "ComfyUI", "None",
    ],
  },
  {
    id: 13,
    round: 2,
    type: 'brandinfo',
    visual: {
      type: 'none',
      mascotSays: '🏷️ Almost done! Tell us about your brand.',
    },
    question: "Last step — tell us about your brand:",
  },
];

const ALL_QUESTIONS = [...SKILL_QUESTIONS, ...INTEL_QUESTIONS];
const TOTAL = ALL_QUESTIONS.length;

// ─── TIERS ───
const getTier = (score) => {
  if (score >= 8) return { name: 'Unicorn', emoji: '🦄', color: 'from-purple-500 to-pink-500', desc: "You're operating at an elite level. You understand that ads are psychology engines, not art projects. Media buyers dream of working with editors like you." };
  if (score >= 6) return { name: 'Scaling Specialist', emoji: '🚀', color: 'from-emerald-400 to-cyan-400', desc: "Serious chops. A few blind spots to clean up, but you're already dangerous. With the right system, you'd be printing money." };
  if (score >= 4) return { name: 'Breakeven Editor', emoji: '📊', color: 'from-orange-400 to-yellow-400', desc: "Your ads look good but don't convert. You're focused on aesthetics over psychology. The gap between you and profitable is smaller than you think." };
  return { name: 'Budget Burner', emoji: '🔥', color: 'from-red-500 to-orange-500', desc: "You're editing like a filmmaker, not a performance marketer. Every ad you ship burns budget. But hey — awareness is the first step." };
};

// ─── CONFETTI ───
const Confetti = ({ active }) => {
  if (!active) return null;
  const pieces = Array.from({ length: 30 }, (_, i) => ({
    id: i, x: Math.random() * 100, delay: Math.random() * 0.3,
    duration: 0.8 + Math.random() * 0.6,
    color: ['#E85D26', '#FFD700', '#00FF88', '#FF69B4', '#00BFFF'][Math.floor(Math.random() * 5)],
    size: 4 + Math.random() * 6,
  }));
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map(p => (
        <motion.div key={p.id}
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
const Mascot = ({ state, size = 'md', speech }) => {
  const src = state === 'happy' ? robotStatic : state === 'sad' ? robotDisappointed : robotThinking;
  const sizeClass = size === 'lg' ? 'w-28 h-28' : size === 'sm' ? 'w-14 h-14' : 'w-20 h-20';
  return (
    <div className="flex flex-col items-center">
      <motion.div key={state} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 15 }} className={sizeClass}>
        <img src={src} alt="AdLingo mascot" className="w-full h-full object-contain" />
      </motion.div>
      {speech && (
        <motion.div
          initial={{ opacity: 0, y: -5, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-2 px-4 py-2 bg-white/10 rounded-xl text-sm text-white/70 font-medium text-center max-w-[280px] relative"
        >
          <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white/10 rotate-45" />
          {speech}
        </motion.div>
      )}
    </div>
  );
};

// ─── PROGRESS BAR ───
const ProgressBar = ({ current, total }) => (
  <div className="flex items-center gap-3 px-4 py-3">
    <div className="flex-1 h-2.5 bg-white/10 rounded-full overflow-hidden">
      <motion.div className="h-full rounded-full" style={{ background: `linear-gradient(90deg, ${BRAND_ORANGE}, #FF8A50)` }} initial={false} animate={{ width: `${(current / total) * 100}%` }} transition={{ duration: 0.5, ease: 'easeOut' }} />
    </div>
    <span className="text-xs font-bold text-white/50 tabular-nums whitespace-nowrap">Q{current} of {total}</span>
  </div>
);

// ─── VISUAL COMPONENTS ───

// Single image with optional annotation
const VisualSingleImage = ({ src, caption }) => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
    <div className="rounded-2xl overflow-hidden border-2 border-white/10 relative">
      <img src={src} alt="" className="w-full object-cover max-h-[280px]" loading="eager" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      {caption && <p className="absolute bottom-3 left-3 right-3 text-xs text-white/80 font-medium">{caption}</p>}
    </div>
  </motion.div>
);

// Grid of UGC avatars — shows real social proof
const VisualUGCGrid = ({ images }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4">
    <div className="grid grid-cols-3 gap-1.5 rounded-2xl overflow-hidden border-2 border-white/10">
      {images.map((src, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.05 * i }}
          className="aspect-[3/4] overflow-hidden"
        >
          <img src={src} alt="" className="w-full h-full object-cover" loading="eager" />
        </motion.div>
      ))}
    </div>
    <p className="text-center text-xs text-white/30 mt-2">Real AI-generated UGC avatars from our production pipeline</p>
  </motion.div>
);

// Technique grid — 4 hook types with icons
const VisualTechniqueGrid = ({ items }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4 grid grid-cols-2 gap-2">
    {items.map((item, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 * i }}
        className={`p-3 rounded-xl border-2 ${item.highlight ? 'border-orange-500/50 bg-orange-500/5' : 'border-white/10 bg-white/[0.03]'} text-center`}
      >
        <div className="text-2xl mb-1">{item.icon}</div>
        <div className="text-xs font-bold text-white/70">{item.label}</div>
        <div className="text-[10px] text-white/40 mt-0.5">{item.desc}</div>
      </motion.div>
    ))}
  </motion.div>
);

// Fake editing timeline
const VisualTimeline = () => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
    <div className="bg-[#1a1a2a] rounded-2xl border-2 border-white/10 p-4 overflow-hidden">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 rounded-full bg-red-500" /><div className="w-2 h-2 rounded-full bg-yellow-500" /><div className="w-2 h-2 rounded-full bg-green-500" />
        <span className="text-[10px] text-white/30 ml-2 font-mono">timeline.prproj</span>
      </div>
      {/* Time markers */}
      <div className="flex justify-between text-[9px] text-white/20 font-mono mb-1 px-0.5">
        {['0s','2s','4s','6s','8s','10s','12s'].map(t => <span key={t}>{t}</span>)}
      </div>
      {/* Playhead */}
      <div className="relative mb-2">
        <div className="h-px bg-white/10 w-full" />
        <motion.div animate={{ left: ['0%', '100%'] }} transition={{ duration: 4, repeat: Infinity, ease: 'linear' }} className="absolute top-0 w-0.5 h-20 bg-red-500/60" style={{ top: '-2px' }} />
      </div>
      {/* Video track */}
      <div className="mb-1.5">
        <div className="text-[9px] text-white/30 mb-1">V1 — Talking Head</div>
        <div className="h-8 rounded bg-blue-900/40 border border-blue-500/20 flex">
          <div className="flex-1 border-r border-white/5 flex items-center justify-center text-[8px] text-blue-300/50">clip</div>
          <div className="flex-1 border-r border-white/5 flex items-center justify-center text-[8px] text-blue-300/50">clip</div>
          <div className="flex-[3] flex items-center justify-center text-[8px] text-red-400/70 relative">
            <span>⚠️ 6 sec — no cut</span>
            <motion.div animate={{ opacity: [0.3, 0.8, 0.3] }} transition={{ duration: 1.5, repeat: Infinity }} className="absolute inset-0 border-2 border-red-500/40 rounded" />
          </div>
          <div className="flex-1 flex items-center justify-center text-[8px] text-blue-300/50">clip</div>
        </div>
      </div>
      {/* B-roll track */}
      <div className="mb-1.5">
        <div className="text-[9px] text-white/30 mb-1">V2 — B-roll</div>
        <div className="h-6 rounded bg-green-900/30 border border-green-500/20 flex">
          <div className="flex-[0.8] border-r border-white/5 bg-green-800/30" />
          <div className="flex-[0.8] border-r border-white/5 bg-green-800/30" />
          <div className="flex-[3] opacity-20 flex items-center justify-center text-[8px] text-white/30">empty — no b-roll</div>
          <div className="flex-[0.8] bg-green-800/30" />
        </div>
      </div>
      {/* Audio track */}
      <div>
        <div className="text-[9px] text-white/30 mb-1">A1 — Music</div>
        <div className="h-4 rounded bg-purple-900/30 border border-purple-500/20 overflow-hidden flex items-center">
          {Array.from({ length: 40 }).map((_, i) => (
            <div key={i} className="flex-1 mx-px" style={{ height: `${30 + Math.random() * 70}%`, background: 'rgba(168,85,247,0.3)' }} />
          ))}
        </div>
      </div>
    </div>
    <p className="text-center text-xs text-white/30 mt-2">This timeline has a retention-killing problem. Can you spot it?</p>
  </motion.div>
);

// Audio waveform with SFX markers
const VisualWaveform = () => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
    <div className="bg-[#1a1a2a] rounded-2xl border-2 border-white/10 p-4">
      <div className="text-[10px] text-white/30 mb-3 font-mono">SFX Layer — ad_draft_v3.mp4</div>
      <div className="relative h-16 flex items-end gap-px mb-2">
        {Array.from({ length: 60 }).map((_, i) => {
          const height = 20 + Math.sin(i * 0.5) * 30 + Math.random() * 30;
          const isMovement = [8, 15, 23, 31, 42, 50].includes(i);
          return (
            <div key={i} className="flex-1 rounded-t relative" style={{ height: `${height}%`, background: isMovement ? BRAND_ORANGE : 'rgba(255,255,255,0.1)' }}>
              {isMovement && (
                <motion.div animate={{ y: [0, -3, 0] }} transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.1 }} className="absolute -top-4 left-1/2 -translate-x-1/2 text-[8px]">
                  🔊
                </motion.div>
              )}
            </div>
          );
        })}
      </div>
      <div className="flex gap-1 flex-wrap">
        {['text slides in', 'product zooms', 'arrow points', 'badge pops', 'CTA button', 'logo'].map((label, i) => (
          <span key={i} className="text-[9px] px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400/70 border border-orange-500/20">{label}</span>
        ))}
      </div>
    </div>
    <p className="text-center text-xs text-white/30 mt-2">Every orange spike = an element moving on screen. Where should SFX go?</p>
  </motion.div>
);

// Music split visualization
const VisualMusicSplit = () => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
    <div className="bg-[#1a1a2a] rounded-2xl border-2 border-white/10 p-4">
      <div className="flex gap-1 mb-3">
        <div className="flex-1 text-center">
          <div className="text-[10px] text-red-400/70 font-bold uppercase tracking-wider mb-2">Problem Section</div>
          <div className="h-10 rounded-lg bg-red-900/30 border border-red-500/20 flex items-center justify-center overflow-hidden relative">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="flex-1 mx-px rounded-t" style={{ height: `${20 + Math.random() * 50}%`, background: 'rgba(239,68,68,0.3)' }} />
            ))}
            <span className="absolute text-[10px] text-red-300/60 font-medium">🎵 Dark / Tense</span>
          </div>
        </div>
        <div className="flex items-center">
          <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="w-6 h-6 rounded-full bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-[10px]">
            ⚡
          </motion.div>
        </div>
        <div className="flex-1 text-center">
          <div className="text-[10px] text-emerald-400/70 font-bold uppercase tracking-wider mb-2">Solution Section</div>
          <div className="h-10 rounded-lg bg-emerald-900/30 border border-emerald-500/20 flex items-center justify-center overflow-hidden relative">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="flex-1 mx-px rounded-t" style={{ height: `${30 + Math.random() * 60}%`, background: 'rgba(52,211,153,0.3)' }} />
            ))}
            <span className="absolute text-[10px] text-emerald-300/60 font-medium">🎵 Uplifting</span>
          </div>
        </div>
      </div>
      <div className="text-center text-[10px] text-white/30">The music break = emotional permission to believe the solution works</div>
    </div>
  </motion.div>
);

// Spot-the-error image with pulsing circle
const VisualSpotError = ({ src }) => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
    <div className="rounded-2xl overflow-hidden border-2 border-white/10 relative">
      <img src={src} alt="" className="w-full object-cover max-h-[320px]" loading="eager" />
      {/* Pulsing annotation around background area */}
      <motion.div
        animate={{ scale: [1, 1.08, 1], opacity: [0.5, 0.9, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute top-[15%] right-[5%] w-24 h-24 rounded-full border-2 border-red-500 flex items-center justify-center"
      >
        <AlertTriangle className="text-red-400" size={20} />
      </motion.div>
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
        <div className="flex items-center gap-2">
          <Eye size={14} className="text-orange-400" />
          <span className="text-xs text-white/70">Spot the AI prompting mistake</span>
        </div>
      </div>
    </div>
  </motion.div>
);

// Product photo → video workflow
const VisualWorkflow = ({ productSrc }) => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
    <div className="flex items-center gap-3">
      <div className="flex-1 rounded-xl overflow-hidden border-2 border-white/10">
        <img src={productSrc} alt="" className="w-full aspect-square object-cover" loading="eager" />
        <div className="bg-white/5 py-1.5 text-center text-[10px] text-white/40 font-bold">📸 PHOTO</div>
      </div>
      <motion.div animate={{ x: [0, 5, 0] }} transition={{ duration: 1, repeat: Infinity }}>
        <ArrowRight className="text-orange-400" size={24} />
      </motion.div>
      <div className="flex-1 rounded-xl border-2 border-dashed border-white/20 aspect-square flex flex-col items-center justify-center bg-white/[0.02]">
        <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity }} className="text-3xl mb-1">🎬</motion.div>
        <span className="text-[10px] text-white/30 font-bold">VIDEO</span>
        <span className="text-[9px] text-white/20">How?</span>
      </div>
    </div>
  </motion.div>
);

// Prompt test — show the actual AI image
const VisualPromptTest = ({ src }) => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
    <div className="rounded-2xl overflow-hidden border-2 border-orange-500/30 relative">
      <img src={src} alt="" className="w-full object-cover max-h-[320px]" loading="eager" />
      <div className="absolute top-3 left-3 px-3 py-1.5 bg-black/70 backdrop-blur rounded-full text-[10px] font-bold text-orange-400 flex items-center gap-1.5">
        <Zap size={10} /> AI GENERATED — Write the prompt
      </div>
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
        <span className="text-xs text-white/50">Describe everything you see: subject, setting, camera, lighting, imperfections</span>
      </div>
    </div>
  </motion.div>
);

const VisualHookText = ({ hookText }) => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
    <div className="rounded-2xl border-2 border-orange-500/20 bg-gradient-to-br from-orange-500/10 to-transparent p-5 text-center">
      <p className="text-xs text-orange-400/70 font-semibold mb-2 uppercase tracking-wider">📝 The Hook</p>
      <p className="text-xl font-black text-white leading-snug">{hookText}</p>
      <p className="text-xs text-white/40 mt-3">Pick the best visual below ↓</p>
    </div>
  </motion.div>
);

// Render the right visual for each question
const QuestionVisual = ({ visual }) => {
  if (!visual || visual.type === 'none') return null;
  switch (visual.type) {
    case 'single-image': return <VisualSingleImage src={visual.src} caption={visual.caption} />;
    case 'ugc-grid': return <VisualUGCGrid images={visual.images} />;
    case 'technique-grid': return <VisualTechniqueGrid items={visual.items} />;
    case 'timeline': return <VisualTimeline />;
    case 'waveform': return <VisualWaveform />;
    case 'music-split': return <VisualMusicSplit />;
    case 'spot-the-error': return <VisualSpotError src={visual.src} />;
    case 'workflow-comparison': return <VisualWorkflow productSrc={visual.productSrc} />;
    case 'prompt-test': return <VisualPromptTest src={visual.src} />;
    case 'hook-text': return <VisualHookText hookText={visual.hookText} />;
    default: return null;
  }
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

  if (status === 'idle' && isSelected) { borderColor = 'border-orange-500'; bg = 'bg-orange-500/10'; textColor = 'text-orange-300'; }
  else if (isCorrect) { borderColor = 'border-emerald-500'; bg = 'bg-emerald-500/10'; textColor = 'text-emerald-300'; }
  else if (isWrong) { borderColor = 'border-red-500'; bg = 'bg-red-500/10'; textColor = 'text-red-300'; }

  return (
    <motion.button
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.05 + index * 0.06, type: 'spring', stiffness: 300, damping: 25 }}
      onClick={() => !disabled && onSelect(index)}
      disabled={disabled}
      className={`w-full p-3.5 rounded-xl border-2 ${borderColor} ${bg} text-left transition-all active:scale-[0.98] ${disabled ? '' : 'cursor-pointer'}`}
    >
      <div className="flex items-start gap-3">
        <motion.div
          animate={isWrong ? { x: [0, -4, 4, -4, 4, 0] } : {}}
          transition={{ duration: 0.4 }}
          className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center text-xs font-black shrink-0 ${
            isCorrect ? 'border-emerald-500 text-emerald-400 bg-emerald-500/20' :
            isWrong ? 'border-red-500 text-red-400 bg-red-500/20' :
            isSelected ? 'border-orange-500 text-orange-400' : 'border-white/20 text-white/30'
          }`}
        >
          {isCorrect && status !== 'idle' ? <Check size={12} strokeWidth={3} /> : isWrong ? <X size={12} strokeWidth={3} /> : letters[index]}
        </motion.div>
        <span className={`pt-0.5 ${textColor} font-medium text-[14px] leading-snug`}>{text}</span>
      </div>
    </motion.button>
  );
};

// ─── IMAGE OPTION BUTTON (for visual answer questions) ───
const ImageOptionButton = ({ imageSrc, label, index, selected, correct, status, onSelect, disabled }) => {
  const letters = ['A', 'B', 'C', 'D'];
  const isSelected = selected === index;
  const isCorrect = status !== 'idle' && correct;
  const isWrong = status === 'wrong' && isSelected;

  let borderColor = 'border-white/10';
  let ringColor = '';
  if (status === 'idle' && isSelected) { borderColor = 'border-orange-500'; ringColor = 'ring-2 ring-orange-500/30'; }
  else if (isCorrect) { borderColor = 'border-emerald-500'; ringColor = 'ring-2 ring-emerald-500/30'; }
  else if (isWrong) { borderColor = 'border-red-500'; ringColor = 'ring-2 ring-red-500/30'; }

  return (
    <motion.button
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.05 + index * 0.08, type: 'spring', stiffness: 300, damping: 25 }}
      onClick={() => !disabled && onSelect(index)}
      disabled={disabled}
      className={`relative rounded-xl border-2 ${borderColor} ${ringColor} overflow-hidden transition-all active:scale-[0.97] ${disabled ? '' : 'cursor-pointer'}`}
    >
      <img src={imageSrc} alt={label} className="w-full aspect-square object-cover" loading="eager" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
      <motion.div
        animate={isWrong ? { x: [0, -4, 4, -4, 4, 0] } : {}}
        transition={{ duration: 0.4 }}
        className={`absolute top-2 left-2 w-7 h-7 rounded-lg border-2 flex items-center justify-center text-xs font-black ${
          isCorrect ? 'border-emerald-500 text-emerald-400 bg-emerald-500/80' :
          isWrong ? 'border-red-500 text-red-400 bg-red-500/80' :
          isSelected ? 'border-orange-500 text-orange-400 bg-orange-500/80' : 'border-white/40 text-white bg-black/60'
        }`}
      >
        {isCorrect && status !== 'idle' ? <Check size={12} strokeWidth={3} /> : isWrong ? <X size={12} strokeWidth={3} /> : letters[index]}
      </motion.div>
      <p className="absolute bottom-2 left-2 right-2 text-[11px] font-semibold text-white/90 leading-tight">{label}</p>
    </motion.button>
  );
};

// ─── CHIP SELECT ───
const ChipSelect = ({ options, selected, onToggle }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="flex flex-wrap gap-2 justify-center">
    {options.map((opt, i) => {
      const active = selected.includes(opt);
      return (
        <motion.button key={opt} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.04 * i, type: 'spring', stiffness: 400, damping: 20 }}
          onClick={() => onToggle(opt)}
          className={`px-4 py-2.5 rounded-full text-sm font-semibold transition-all active:scale-95 ${active ? 'bg-orange-500 text-white border-2 border-orange-400' : 'bg-white/5 text-white/60 border-2 border-white/10 hover:border-white/20'}`}
        >
          {active && <Check size={12} className="inline mr-1 -mt-0.5" />}{opt}
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
      <input type="text" value={brandName} onChange={(e) => onChange('brandName', e.target.value)} placeholder="Acme Inc." className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/20 focus:border-orange-500 focus:outline-none transition-colors text-[15px]" />
    </div>
    <div>
      <label className="text-white/40 text-xs font-bold uppercase tracking-wider mb-2 block">Website URL</label>
      <input type="url" value={brandUrl} onChange={(e) => onChange('brandUrl', e.target.value)} placeholder="https://acme.com" className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/20 focus:border-orange-500 focus:outline-none transition-colors text-[15px]" />
    </div>
  </motion.div>
);

// ─── LANDING PAGE ───
const Landing = ({ onStart, onPathB }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-[100dvh] flex flex-col items-center justify-center px-6 py-12" style={{ background: `linear-gradient(180deg, ${BRAND_DARK} 0%, #0D0D1A 100%)` }}>
    <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="text-center max-w-sm w-full">
      <Mascot state="happy" size="lg" />
      <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="text-4xl font-black mt-6 mb-2 tracking-tight">
        <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">AD</span>
        <span className="text-white">LINGO</span>
      </motion.h1>
      <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="text-white/50 text-sm mb-3">
        How sharp is your ad creative eye?
      </motion.p>
      {/* Preview strip of visual content */}
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6 }} className="flex gap-1.5 justify-center mb-8 px-4">
        {['/quiz-images/hook-example.jpg', '/quiz-images/ugc-bokeh-mistake.png', '/quiz-images/product-serum.png', '/quiz-images/ai-ugc-prompt-test.png'].map((src, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 + i * 0.1 }} className="w-16 h-16 rounded-lg overflow-hidden border border-white/10 opacity-60">
            <img src={src} alt="" className="w-full h-full object-cover" />
          </motion.div>
        ))}
      </motion.div>

      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.9 }} className="space-y-3">
        <button onClick={onStart} className="w-full py-4 rounded-2xl font-black text-lg text-white relative overflow-hidden group active:scale-[0.98] transition-transform" style={{ background: `linear-gradient(135deg, ${BRAND_ORANGE}, #FF4500)` }}>
          <span className="relative z-10 flex items-center justify-center gap-2">Test My Skills <Zap size={18} /></span>
          <div className="absolute inset-0 bg-white/10 opacity-0 group-active:opacity-100 transition-opacity" />
        </button>
        <button onClick={onPathB} className="w-full py-3.5 rounded-2xl font-bold text-sm text-white/60 border border-white/10 hover:border-white/20 hover:text-white/80 transition-all active:scale-[0.98]">
          I'm sending this to someone else →
        </button>
      </motion.div>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }} className="text-white/20 text-xs mt-8">
        12 visual questions · 3 minutes · Free personalized audit
      </motion.p>
    </motion.div>
  </motion.div>
);

// ─── PATH B ───
const PathB = ({ onBack }) => {
  const [copied, setCopied] = useState(false);
  const link = `${window.location.origin}${window.location.pathname}`;
  const copy = () => { navigator.clipboard.writeText(link); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-[100dvh] flex flex-col items-center justify-center px-6" style={{ background: `linear-gradient(180deg, ${BRAND_DARK} 0%, #0D0D1A 100%)` }}>
      <div className="max-w-sm w-full text-center">
        <Mascot state="thinking" size="lg" />
        <h2 className="text-2xl font-black text-white mt-6 mb-2">Share This Quiz</h2>
        <p className="text-white/50 text-sm mb-8">Send this link to your editor or team member. They'll get a personalized audit.</p>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-3 mb-4">
          <span className="text-white/70 text-sm truncate flex-1">{link}</span>
          <button onClick={copy} className="shrink-0 px-4 py-2 rounded-lg font-bold text-sm transition-all text-white" style={{ background: copied ? '#22c55e' : BRAND_ORANGE }}>{copied ? 'Copied!' : 'Copy'}</button>
        </div>
        <button onClick={onBack} className="text-white/40 text-sm hover:text-white/60 transition">← Back</button>
      </div>
    </motion.div>
  );
};

// ─── ROUND TRANSITION ───
const RoundTransition = ({ onContinue, score }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-[100dvh] flex flex-col items-center justify-center px-6" style={{ background: `linear-gradient(180deg, ${BRAND_DARK} 0%, #0D0D1A 100%)` }}>
    <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} transition={{ type: 'spring', stiffness: 200 }} className="text-center max-w-sm">
      <Mascot state="happy" size="lg" />
      <h2 className="text-2xl font-black text-white mt-6 mb-2">Skills Assessed! 🔥</h2>
      <div className="text-4xl font-black mb-4">
        <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">{score}</span>
        <span className="text-white/20 text-xl">/9</span>
      </div>
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
  const [phase, setPhase] = useState(0);
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      current++;
      setDisplayScore(current);
      if (current >= score) { clearInterval(interval); setTimeout(() => setPhase(1), 400); setTimeout(() => setPhase(2), 1200); }
    }, 100);
    return () => clearInterval(interval);
  }, [score]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-[100dvh] flex flex-col items-center justify-center px-6" style={{ background: `linear-gradient(180deg, ${BRAND_DARK} 0%, #0D0D1A 100%)` }}>
      <Confetti active={phase >= 1} />
      <div className="text-center max-w-sm w-full">
        <motion.div animate={{ scale: phase >= 1 ? [1, 1.2, 1] : 1 }} transition={{ duration: 0.5 }}>
          <Mascot state={score >= 6 ? 'happy' : score >= 4 ? 'thinking' : 'sad'} size="lg" />
        </motion.div>
        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.3, type: 'spring' }} className="mt-6">
          <div className="text-6xl font-black tabular-nums">
            <span className={`bg-gradient-to-r ${tier.color} bg-clip-text text-transparent`}>{displayScore}</span>
            <span className="text-white/20 text-3xl">/9</span>
          </div>
        </motion.div>
        <AnimatePresence>
          {phase >= 1 && (
            <motion.div initial={{ y: 30, opacity: 0, scale: 0.8 }} animate={{ y: 0, opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 15 }} className="mt-6">
              <div className={`inline-block px-6 py-3 rounded-2xl bg-gradient-to-r ${tier.color} text-white font-black text-2xl tracking-tight`}>
                {tier.emoji} {tier.name}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {phase >= 2 && (
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="mt-6">
              <p className="text-white/50 text-sm leading-relaxed mb-8">{tier.desc}</p>
              <button onClick={onContinue} className="w-full py-4 rounded-2xl font-black text-white text-lg active:scale-[0.98] transition-transform" style={{ background: `linear-gradient(135deg, ${BRAND_ORANGE}, #FF4500)` }}>
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
const EmailGate = ({ onSubmit, loading }) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-[100dvh] flex flex-col items-center justify-center px-6" style={{ background: `linear-gradient(180deg, ${BRAND_DARK} 0%, #0D0D1A 100%)` }}>
      <div className="max-w-sm w-full text-center">
        <Mascot state="happy" size="md" />
        <h2 className="text-2xl font-black text-white mt-4 mb-1">Your Audit Is Ready</h2>
        <p className="text-white/40 text-sm mb-8">Personalized recommendations based on your answers. No spam — just one fire email.</p>
        <div className="space-y-3 text-left mb-6">
          <input type="text" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/20 focus:border-orange-500 focus:outline-none transition-colors" />
          <input type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/20 focus:border-orange-500 focus:outline-none transition-colors" />
        </div>
        <button onClick={() => email && name && onSubmit({ email, name })} disabled={!email || !name || loading} className="w-full py-4 rounded-2xl font-black text-white text-lg active:scale-[0.98] transition-transform disabled:opacity-40" style={{ background: `linear-gradient(135deg, ${BRAND_ORANGE}, #FF4500)` }}>
          {loading ? '⏳ Sending...' : <>Send My Audit <Send size={16} className="inline ml-1" /></>}
        </button>
        <p className="text-white/15 text-xs mt-4">We respect your inbox. Unsubscribe anytime.</p>
      </div>
    </motion.div>
  );
};

// ─── THANK YOU ───
const ThankYou = ({ tier }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-[100dvh] flex flex-col items-center justify-center px-6" style={{ background: `linear-gradient(180deg, ${BRAND_DARK} 0%, #0D0D1A 100%)` }}>
    <Confetti active />
    <div className="max-w-sm w-full text-center">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}><Mascot state="happy" size="lg" /></motion.div>
      <motion.h2 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="text-3xl font-black text-white mt-6 mb-2">Check Your Inbox! 📬</motion.h2>
      <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="text-white/50 text-sm mb-6">Your personalized {tier.name} audit report is being generated.</motion.p>
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.7 }} className="space-y-3">
        <a href="https://whop.com/aditor-wisdom/ai-ads-masterclass-ecom/" target="_blank" rel="noopener noreferrer" className="block w-full py-4 rounded-2xl font-bold text-white border-2 transition-all active:scale-[0.98]" style={{ background: `linear-gradient(135deg, ${BRAND_ORANGE} 0%, #FF7A45 100%)`, borderColor: BRAND_ORANGE }}>
          🔥 Steal Our AI Ads Workflows <ExternalLink size={14} className="inline ml-1" />
        </a>
        <a href="https://aditor.ai" target="_blank" rel="noopener noreferrer" className="block w-full py-3 rounded-2xl font-medium text-white/50 border border-white/10 hover:border-white/20 transition-all active:scale-[0.98] text-sm">
          Visit Aditor.ai
        </a>
      </motion.div>
    </div>
  </motion.div>
);

// ─── MAIN APP ───
const App = () => {
  const [view, setView] = useState('landing');
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [status, setStatus] = useState('idle');
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
  const isImageOptionsQ = q && q.type === 'image-options';
  const isSkillQ = q && q.round === 1 && q.type !== 'freetext' && q.type !== 'image-options';
  const isFreetextQ = q && q.type === 'freetext';
  const isMultiQ = q && q.type === 'multiselect';
  const isBrandQ = q && q.type === 'brandinfo';

  const handleSelect = (idx) => { if (status !== 'idle') return; setSelected(idx); };

  const advance = () => {
    const nextIdx = qIndex + 1;
    if (nextIdx >= TOTAL) { setView('tierReveal'); return; }
    if (q.round === 1 && ALL_QUESTIONS[nextIdx].round === 2) { setView('roundTransition'); return; }
    setQIndex(nextIdx); setSelected(null); setStatus('idle'); setMascotState('thinking'); setMultiSelected([]); setFreeText('');
  };

  const handleCheck = () => {
    if (isImageOptionsQ) {
      if (selected === null) return;
      const isCorrect = q.imageOptions[selected].correct;
      setStatus(isCorrect ? 'correct' : 'wrong');
      setMascotState(isCorrect ? 'happy' : 'sad');
      if (isCorrect) { setScore(s => s + 1); setShowConfetti(true); setTimeout(() => setShowConfetti(false), 1500); }
      setAnswers(prev => ({ ...prev, [q.id]: { selected: q.imageOptions[selected].label, correct: isCorrect } }));
    } else if (isSkillQ) {
      if (selected === null) return;
      const isCorrect = q.options[selected].correct;
      setStatus(isCorrect ? 'correct' : 'wrong');
      setMascotState(isCorrect ? 'happy' : 'sad');
      if (isCorrect) { setScore(s => s + 1); setShowConfetti(true); setTimeout(() => setShowConfetti(false), 1500); }
      setAnswers(prev => ({ ...prev, [q.id]: { selected: q.options[selected].text, correct: isCorrect } }));
    } else if (isFreetextQ) {
      setAnswers(prev => ({ ...prev, [q.id]: { text: freeText } })); advance(); return;
    } else if (isMultiQ) {
      setAnswers(prev => ({ ...prev, [q.id]: { selected: multiSelected } })); advance(); return;
    } else if (isBrandQ) {
      setAnswers(prev => ({ ...prev, [q.id]: { brandName, brandUrl } })); setView('tierReveal'); return;
    }
  };

  const handleEmailSubmit = async ({ email, name }) => {
    setLoading(true);
    const payload = { name, email, score, tier: getTier(score).name, answers, timestamp: new Date().toISOString() };
    try { await fetch(WEBHOOK_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }); } catch (e) { console.error('Webhook failed:', e); }
    setLoading(false); setView('thankyou');
  };

  const tier = getTier(score);

  if (view === 'landing') return <Landing onStart={() => setView('quiz')} onPathB={() => setView('pathB')} />;
  if (view === 'pathB') return <PathB onBack={() => setView('landing')} />;
  if (view === 'roundTransition') return <RoundTransition score={score} onContinue={() => { setQIndex(SKILL_QUESTIONS.length); setSelected(null); setStatus('idle'); setMascotState('thinking'); setMultiSelected([]); setView('quiz'); }} />;
  if (view === 'tierReveal') return <TierReveal tier={tier} score={score} onContinue={() => setView('emailGate')} />;
  if (view === 'emailGate') return <EmailGate onSubmit={handleEmailSubmit} loading={loading} />;
  if (view === 'thankyou') return <ThankYou tier={tier} />;

  // ─── QUIZ VIEW ───
  return (
    <div className="min-h-[100dvh] flex flex-col" style={{ background: `linear-gradient(180deg, ${BRAND_DARK} 0%, #0D0D1A 100%)` }}>
      <Confetti active={showConfetti} />
      <ProgressBar current={qIndex + 1} total={TOTAL} />

      <div className="flex-1 overflow-y-auto px-5 pb-40">
        <div className="max-w-lg mx-auto pt-2">
          {/* Round label */}
          <div className="text-center mb-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/25">
              {q.round === 1 ? 'Round 1 · Skill Check' : 'Round 2 · Brand Intel'}
            </span>
          </div>

          {/* Mascot with speech bubble */}
          {q.visual?.mascotSays && (
            <div className="mb-3">
              <Mascot state={mascotState} size="sm" speech={q.visual.mascotSays} />
            </div>
          )}

          {/* VISUAL CONTENT — the hero of each question */}
          <AnimatePresence mode="wait">
            <motion.div key={q.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <QuestionVisual visual={q.visual} />
            </motion.div>
          </AnimatePresence>

          {/* Question text */}
          <AnimatePresence mode="wait">
            <motion.h2 key={q.id} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }} transition={{ duration: 0.25 }}
              className="text-[16px] font-black text-white text-center mt-2 mb-4 leading-snug"
            >
              {q.question}
            </motion.h2>
          </AnimatePresence>

          {/* Free text for Q9 */}
          {isFreetextQ && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4">
              <textarea value={freeText} onChange={e => setFreeText(e.target.value.slice(0, q.maxLength))} placeholder={q.placeholder} maxLength={q.maxLength} rows={3}
                className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:border-orange-500 focus:outline-none transition-colors text-[15px] resize-none"
              />
              <div className="text-right text-white/20 text-xs mt-1">{freeText.length}/{q.maxLength}</div>
            </motion.div>
          )}

          {/* Standard options */}
          {isSkillQ && (
            <div className="space-y-2">
              {q.options.map((opt, idx) => (
                <OptionButton key={`${q.id}-${idx}`} text={opt.text} index={idx} selected={selected} correct={opt.correct} status={status} onSelect={handleSelect} disabled={status !== 'idle'} />
              ))}
            </div>
          )}

          {/* Image Options (visual answers) */}
          {isImageOptionsQ && (
            <div className="grid grid-cols-2 gap-2">
              {q.imageOptions.map((opt, idx) => (
                <ImageOptionButton key={`${q.id}-img-${idx}`} imageSrc={opt.imageSrc} label={opt.label} index={idx} selected={selected} correct={opt.correct} status={status} onSelect={handleSelect} disabled={status !== 'idle'} />
              ))}
            </div>
          )}

          {/* Multi-select */}
          {isMultiQ && <ChipSelect options={q.options} selected={multiSelected} onToggle={(opt) => setMultiSelected(prev => prev.includes(opt) ? prev.filter(o => o !== opt) : [...prev, opt])} />}

          {/* Brand info */}
          {isBrandQ && <BrandInfoForm brandName={brandName} brandUrl={brandUrl} onChange={(f, v) => f === 'brandName' ? setBrandName(v) : setBrandUrl(v)} />}

          {/* Director's Note */}
          <AnimatePresence>
            {status !== 'idle' && q.note && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden mt-3">
                <div className={`p-3 rounded-xl border ${status === 'correct' ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-white/40 mb-1">💡 Why?</p>
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
            <button onClick={handleCheck}
              disabled={(isSkillQ || isImageOptionsQ) ? selected === null : isFreetextQ ? !freeText.trim() : isMultiQ ? multiSelected.length === 0 : isBrandQ ? !brandName.trim() : true}
              className="w-full py-4 rounded-2xl font-black text-white text-base uppercase tracking-wider active:scale-[0.98] transition-all disabled:opacity-30"
              style={{ background: `linear-gradient(135deg, ${BRAND_ORANGE}, #FF4500)` }}
            >
              {(isSkillQ || isImageOptionsQ) ? 'Check' : 'Continue'}
            </button>
          ) : (
            <motion.button initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} onClick={advance}
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
