import React, { useState } from 'react';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { haptic } from '../services/haptics';

export default function QuizEngine({ questions, onComplete }) {
  const [qIndex, setQIndex] = useState(0);
  const [status, setStatus] = useState('idle');
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [correctCount, setCorrectCount] = useState(0);

  if (!questions || questions.length === 0) {
    return <div className="text-center p-8">No questions available</div>;
  }

  const q = questions[qIndex];
  const progress = questions.length > 0 ? ((qIndex) / questions.length) * 100 : 0;
  const isLastQuestion = qIndex + 1 >= questions.length;

  const handleCheck = () => {
    if (selectedOpt === null) return;
    const isCorrect = q.options[selectedOpt].correct;
    setStatus(isCorrect ? 'correct' : 'wrong');
    haptic(isCorrect ? 'success' : 'error');
    if (isCorrect) setCorrectCount((c) => c + 1);
  };

  const handleNext = () => {
    haptic('nav');
    if (isLastQuestion) {
      onComplete(correctCount, questions.length);
    } else {
      setQIndex((i) => i + 1);
      setStatus('idle');
      setSelectedOpt(null);
    }
  };

  const isImageOption = q.type === 'image' || q.options.some((o) => o.imageUrl);

  return (
    <div className="flex flex-col min-h-0 flex-1">
      {/* Pip progress — one dot per question */}
      <div className="px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <div className="flex-1 flex items-center gap-1.5">
            {questions.map((_, i) => {
              const done = i < qIndex;
              const current = i === qIndex;
              return (
                <motion.div
                  key={i}
                  layout
                  initial={false}
                  animate={{
                    flex: current ? 2.2 : 1,
                    backgroundColor: done
                      ? 'rgba(52,211,153,0.9)'
                      : current
                        ? 'rgba(249,115,22,0.95)'
                        : 'rgba(255,255,255,0.08)',
                  }}
                  transition={{ type: 'spring', damping: 20, stiffness: 240 }}
                  className="h-2 rounded-full"
                  style={{
                    boxShadow: current
                      ? '0 0 12px rgba(249,115,22,0.5)'
                      : done
                        ? '0 0 8px rgba(52,211,153,0.35)'
                        : 'none',
                  }}
                />
              );
            })}
          </div>
          <span className="text-gray-400 text-xs font-bold tabular-nums font-display">
            {qIndex + 1}/{questions.length}
          </span>
        </div>
      </div>

      {/* Question content */}
      <div className="flex-1 overflow-y-auto px-4 pb-52 hide-scrollbar">
        <div className="max-w-lg mx-auto card-halo">
          <AnimatePresence mode="wait">
            <motion.div
              key={qIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <h2 className="font-display text-[20px] font-bold text-center mb-6 leading-snug text-white mt-2 px-2 tracking-tight">
                {q.question}
              </h2>

              {/* Options */}
              <div className={isImageOption ? 'grid grid-cols-2 gap-2.5' : 'space-y-2.5'}>
                {q.options.map((opt, idx) => {
                  const letter = String.fromCharCode(65 + idx);
                  const isSelected = selectedOpt === idx;
                  const isCorrectOpt = opt.correct;
                  const showCorrect = status !== 'idle' && isCorrectOpt;
                  const showWrong = status === 'wrong' && isSelected;

                  let optStyle = { backgroundColor: '#2a3370', borderColor: '#4a52a0', boxShadow: '0 3px 0 0 #1e2555' };
                  let textColor = 'text-white';
                  let letterBg = 'bg-white/20';
                  let letterColor = 'text-gray-100';

                  if (isSelected && status === 'idle') {
                    optStyle = { backgroundColor: 'rgba(249,115,22,0.15)', borderColor: 'rgba(249,115,22,0.6)', boxShadow: '0 3px 0 0 rgba(194,65,12,0.3)' };
                    textColor = 'text-orange-100';
                    letterBg = 'bg-orange-500/20';
                    letterColor = 'text-orange-400';
                  } else if (showCorrect) {
                    optStyle = { backgroundColor: 'rgba(16,185,129,0.15)', borderColor: 'rgba(16,185,129,0.6)', boxShadow: '0 3px 0 0 rgba(5,150,105,0.3)' };
                    textColor = 'text-emerald-200';
                    letterBg = 'bg-emerald-500/20';
                    letterColor = 'text-emerald-400';
                  } else if (showWrong) {
                    optStyle = { backgroundColor: 'rgba(239,68,68,0.15)', borderColor: 'rgba(239,68,68,0.6)', boxShadow: '0 3px 0 0 rgba(185,28,28,0.3)' };
                    textColor = 'text-red-200';
                    letterBg = 'bg-red-500/20';
                    letterColor = 'text-red-400';
                  }

                  return (
                    <motion.button
                      key={idx}
                      disabled={status !== 'idle'}
                      onClick={() => { haptic('select'); setSelectedOpt(idx); }}
                      whileTap={status === 'idle' ? { scale: 0.97, y: 2 } : {}}
                      style={optStyle}
                      className={`
                        w-full rounded-2xl border-2 text-left font-medium transition-all
                        ${isImageOption ? 'p-2.5' : 'p-3.5'}
                        ${textColor}
                        active:shadow-none active:translate-y-[3px]
                      `}
                    >
                      {opt.imageUrl && (
                        <img
                          src={opt.imageUrl}
                          alt={`Option ${letter}`}
                          className="w-full aspect-square object-cover rounded-xl mb-2"
                        />
                      )}
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${letterBg} ${letterColor}`}>
                          {showCorrect ? (
                            <CheckCircle size={16} strokeWidth={2.5} />
                          ) : showWrong ? (
                            <XCircle size={16} strokeWidth={2.5} />
                          ) : (
                            letter
                          )}
                        </div>
                        <span className="text-[14px] pt-1 leading-snug font-semibold">
                          {opt.text}
                        </span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom action bar */}
      <div
        className={`fixed bottom-0 left-0 right-0 border-t-2 transition-all duration-300 ${
          status === 'correct'
            ? 'bg-[#0a1f15] border-emerald-500/30'
            : status === 'wrong'
              ? 'bg-[#1f0a0a] border-red-500/30'
              : 'bg-[#0f1328]/98 border-white/5'
        } backdrop-blur-xl`}
      >
        <div className="max-w-lg mx-auto p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          {/* Feedback */}
          {status !== 'idle' && q.directorNote && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-3"
            >
              <div className={`flex items-center gap-2 mb-1.5 text-xs font-black uppercase tracking-wider ${
                status === 'correct' ? 'text-emerald-400' : 'text-red-400'
              }`}>
                {status === 'correct' ? (
                  <><CheckCircle size={15} strokeWidth={2.5} /> Correct!</>
                ) : (
                  <><AlertCircle size={15} strokeWidth={2.5} /> Director's Note</>
                )}
              </div>
              <p className={`text-[13px] leading-relaxed rounded-xl p-3 font-medium ${
                status === 'correct'
                  ? 'text-emerald-200/90 bg-emerald-500/10 border border-emerald-500/15'
                  : 'text-red-200/90 bg-red-500/10 border border-red-500/15'
              }`}>
                {q.directorNote}
              </p>
            </motion.div>
          )}

          {/* Action button */}
          <motion.button
            onClick={status === 'idle' ? handleCheck : handleNext}
            disabled={selectedOpt === null && status === 'idle'}
            whileTap={{ scale: 0.97, y: 2 }}
            className={`
              w-full py-4 rounded-2xl font-black text-[15px] uppercase tracking-wider transition-all
              border-b-[4px] active:border-b-0 active:translate-y-[4px]
              ${status === 'idle'
                ? selectedOpt !== null
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white border-orange-700 shadow-lg shadow-orange-500/25'
                  : 'bg-[#2a3370] text-gray-300 border-[#222860] cursor-not-allowed'
                : 'bg-white text-gray-900 border-gray-300 shadow-lg'}
            `}
          >
            {status === 'idle'
              ? 'Check'
              : isLastQuestion
                ? 'Complete'
                : 'Continue'}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
