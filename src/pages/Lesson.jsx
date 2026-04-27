import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy, Star, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import { getLessonById } from '../data/courseData';
import VideoPlayer from '../components/VideoPlayer';
import QuizEngine from '../components/QuizEngine';
import ConfettiBurst from '../components/ConfettiBurst';
import { haptic } from '../services/haptics';

export default function Lesson({ onLessonComplete }) {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const { lesson, world } = getLessonById(lessonId);
  const [phase, setPhase] = useState('quiz');
  const [result, setResult] = useState(null);

  if (!lesson || !world) {
    return (
      <div className="min-h-screen bg-[#0B0B0D] text-white flex items-center justify-center">
        <p className="text-gray-500">Lesson not found</p>
      </div>
    );
  }

  const handleQuizComplete = (correct, total) => {
    const score = { correct, total };
    setResult(score);
    setPhase('result');
    onLessonComplete(lessonId, score);
  };

  // Video phase
  if (phase === 'video') {
    return (
      <div className="min-h-screen bg-[#0B0B0D] text-white flex flex-col">
        <div className="px-4 py-3 flex items-center gap-3 border-b border-white/5">
          <button onClick={() => navigate('/')} className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition border border-white/5">
            <ArrowLeft size={18} className="text-gray-400" />
          </button>
          <div className="flex-1 min-w-0">
            <div className={`meta-label ${world.accentColor}`}>{world.name}</div>
            <div className="text-[14px] font-semibold text-white truncate tracking-tight">{lesson.title}</div>
          </div>
        </div>

        <div className="flex-1 p-4 flex flex-col">
          <div className="max-w-lg mx-auto w-full flex-1 flex flex-col">
            <VideoPlayer url={lesson.videoUrl} title={lesson.title} />
            <div className="mt-6 text-center flex-1 flex flex-col items-center justify-center">
              <p className="text-gray-400 text-[14px] mb-5 font-medium">
                Watch the lesson, then test your knowledge
              </p>
              <motion.button
                onClick={() => setPhase('quiz')}
                whileTap={{ scale: 0.97, y: 3 }}
                className="w-full max-w-xs py-4 bg-gradient-to-br from-[#FF6B35] to-[#C44D1E] text-white font-black rounded-2xl uppercase tracking-wider text-[14px] border-b-[4px] border-[#8A2F0F] active:border-b-0 active:translate-y-[4px] shadow-brand-glow"
              >
                Start Quiz
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Quiz phase
  if (phase === 'quiz') {
    return (
      <div className="min-h-screen bg-[#0B0B0D] text-white flex flex-col">
        <div className="px-4 py-3 flex items-center gap-3 border-b border-white/5">
          <button onClick={() => navigate('/')} className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition border border-white/5">
            <ArrowLeft size={18} className="text-gray-400" />
          </button>
          <div className="flex-1 min-w-0">
            <div className={`meta-label ${world.accentColor}`}>{world.name}</div>
            <div className="text-[14px] font-semibold text-white truncate tracking-tight">{lesson.title}</div>
          </div>
        </div>
        <QuizEngine questions={lesson.questions} onComplete={handleQuizComplete} />
      </div>
    );
  }

  // Result phase
  if (phase === 'result' && result) {
    const percent = Math.round((result.correct / result.total) * 100);
    const passed = percent >= 60;
    const xpEarned = result.correct * 10;

    return <LessonResult passed={passed} result={result} xpEarned={xpEarned} lesson={lesson} lessonId={lessonId} navigate={navigate} onRetry={() => { setPhase('quiz'); setResult(null); }} />;
  }

  return null;
}

function LessonResult({ passed, result, xpEarned, lesson, lessonId, navigate, onRetry }) {
  const hasVideo = Boolean(lesson.videoUrl);
  useEffect(() => {
    haptic(passed ? 'celebrate' : 'error');
  }, [passed]);

  return (
    <div className="min-h-screen bg-[#0B0B0D] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {passed && (
        <div className="absolute inset-0 flex items-start justify-center pt-20 pointer-events-none">
          <ConfettiBurst count={40} spread={320} duration={1.8} />
        </div>
      )}
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 15 }}
        className="max-w-sm w-full text-center relative"
      >
        {/* Trophy */}
        <motion.div
          initial={{ y: -20, rotate: -12 }}
          animate={passed ? { y: [0, -6, 0], rotate: [0, 4, -4, 0] } : { y: 0, rotate: 0 }}
          transition={passed
            ? { y: { type: 'spring', damping: 10, delay: 0.2 }, rotate: { duration: 0.6, delay: 0.4 } }
            : { type: 'spring', damping: 10, delay: 0.2 }}
          className={`w-24 h-24 rounded-3xl mx-auto mb-5 flex items-center justify-center border-b-[4px] ${
            passed
              ? 'bg-gradient-to-br from-yellow-400 to-amber-500 border-yellow-600 shadow-xl shadow-yellow-500/30'
              : 'bg-gradient-to-br from-gray-600 to-gray-700 border-gray-800 shadow-xl shadow-gray-500/10'
          }`}
        >
          {passed ? (
            <Star size={40} className="text-yellow-900" fill="currentColor" />
          ) : (
            <Trophy size={40} className="text-gray-400" />
          )}
        </motion.div>

        <h2 className="font-display text-[34px] leading-[1.05] tracking-tight mb-1">
          {passed ? (
            <>Lesson <em className="font-display-italic text-orange-400">complete</em></>
          ) : (
            <>Keep <em className="font-display-italic text-orange-400">practicing</em></>
          )}
        </h2>
        <p className="text-gray-500 text-[13px] font-medium mb-6">
          {lesson.title}
        </p>

        {/* Score card */}
        <div className={`rounded-3xl p-6 border-2 ${
          passed ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20'
        }`}>
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 12, delay: 0.3 }}
            className={`font-display text-[88px] leading-none tracking-tight ${passed ? 'text-emerald-400' : 'text-red-400'}`}
          >
            {result.correct}/{result.total}
          </motion.div>
          <p className="text-gray-500 text-[13px] font-medium mt-1">correct answers</p>
          {passed && xpEarned > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 14, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', damping: 12, delay: 0.7 }}
              className="mt-3 flex items-center justify-center gap-1.5 text-yellow-400 font-bold text-sm"
            >
              <Star size={14} fill="currentColor" />
              +{xpEarned} XP earned
            </motion.div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-6 space-y-3">
          <motion.button
            onClick={() => { haptic('nav'); navigate('/'); }}
            whileTap={{ scale: 0.97, y: 3 }}
            className="w-full py-4 bg-gradient-to-br from-[#FF6B35] to-[#C44D1E] text-white font-black rounded-2xl uppercase tracking-wider text-[14px] border-b-[4px] border-[#8A2F0F] active:border-b-0 active:translate-y-[4px] shadow-brand-glow"
          >
            Continue
          </motion.button>
          {!passed && (
            <motion.button
              onClick={() => { haptic('tap'); onRetry(); }}
              whileTap={{ scale: 0.97 }}
              className="w-full py-4 bg-[#17171B] text-gray-300 font-bold rounded-2xl text-[14px] border-2 border-white/[0.06] flex items-center justify-center gap-2"
            >
              <RotateCcw size={16} /> Retry lesson
            </motion.button>
          )}
          {passed && hasVideo && (
            <motion.button
              onClick={() => { haptic('light'); navigate(`/course?lesson=${lessonId}`); }}
              whileTap={{ scale: 0.97 }}
              className="w-full py-3 bg-transparent text-gray-400 hover:text-gray-200 text-[13px] font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <span className="meta-label">Re-watch lesson</span>
            </motion.button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
