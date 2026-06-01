import React from 'react';
import { Plus, Trash2, FileText, Image as ImageIcon, CheckCircle } from 'lucide-react';
import { generateId } from '../data/courseData';

// Controlled editor for a list of quiz questions.
// Props: questions (array), onChange (newQuestions) => void
export default function QuestionEditor({ questions = [], onChange }) {
  const addQuestion = (type = 'text') => {
    const newQ = {
      id: 'q' + generateId(),
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
    onChange([...questions, newQ]);
  };

  const updateQuestion = (qId, updates) =>
    onChange(questions.map((q) => (q.id === qId ? { ...q, ...updates } : q)));

  const deleteQuestion = (qId) =>
    onChange(questions.filter((q) => q.id !== qId));

  const updateOption = (qId, optIdx, field, value) =>
    onChange(
      questions.map((q) => {
        if (q.id !== qId) return q;
        const options = q.options.map((o, i) => {
          if (field === 'correct') return { ...o, correct: i === optIdx };
          return i === optIdx ? { ...o, [field]: value } : o;
        });
        return { ...q, options };
      })
    );

  return (
    <div>
      {questions.length === 0 && (
        <div className="text-center py-6 px-4 rounded-xl border border-dashed border-white/[0.08] mb-3">
          <FileText size={20} className="text-gray-700 mx-auto mb-2" />
          <p className="text-[12px] text-gray-500 mb-3">No questions yet — add your first.</p>
        </div>
      )}

      <div className="space-y-3">
        {questions.map((q, qIdx) => (
          <div key={q.id} className="bg-[#111114] rounded-xl p-3 border border-white/[0.05]">
            <div className="flex items-start justify-between mb-2">
              <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${q.type === 'image' ? 'text-cyan-400 bg-cyan-400/10' : 'text-orange-400 bg-orange-400/10'}`}>
                {q.type === 'image' ? 'Image Q' : 'Text Q'} #{qIdx + 1}
              </span>
              <button onClick={() => deleteQuestion(q.id)} className="text-gray-600 hover:text-red-400 transition">
                <Trash2 size={12} />
              </button>
            </div>

            <textarea
              value={q.question}
              onChange={(e) => updateQuestion(q.id, { question: e.target.value })}
              placeholder="Enter question..."
              rows={2}
              className="w-full px-2.5 py-1.5 bg-[#17171B] border border-white/[0.08] rounded-lg text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#FF6B35] resize-none mb-2"
            />

            <div className="space-y-1.5">
              {q.options.map((opt, optIdx) => (
                <div key={optIdx} className="flex items-start gap-2">
                  <button
                    onClick={() => updateOption(q.id, optIdx, 'correct', true)}
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-1 transition ${opt.correct ? 'border-emerald-500 bg-emerald-500/20' : 'border-white/[0.12] hover:border-gray-400'}`}
                  >
                    {opt.correct && <CheckCircle size={10} className="text-emerald-400" />}
                  </button>
                  <div className="flex-1 space-y-1">
                    <input
                      value={opt.text}
                      onChange={(e) => updateOption(q.id, optIdx, 'text', e.target.value)}
                      placeholder={`Option ${String.fromCharCode(65 + optIdx)}...`}
                      className="w-full px-2 py-1 bg-[#17171B] border border-white/[0.08] rounded text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#FF6B35]"
                    />
                    {q.type === 'image' && (
                      <input
                        value={opt.imageUrl || ''}
                        onChange={(e) => updateOption(q.id, optIdx, 'imageUrl', e.target.value)}
                        placeholder="Image URL..."
                        className="w-full px-2 py-1 bg-[#17171B] border border-white/[0.08] rounded text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#8FB9E6]"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>

            <textarea
              value={q.directorNote}
              onChange={(e) => updateQuestion(q.id, { directorNote: e.target.value })}
              placeholder="Director's Note (shown after answering)..."
              rows={2}
              className="w-full mt-2 px-2.5 py-1.5 bg-[#17171B] border border-white/[0.08] rounded-lg text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#FF6B35] resize-none"
            />
          </div>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          onClick={() => addQuestion('text')}
          className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-white/[0.1] bg-white/[0.02] text-[12px] font-semibold text-gray-300 hover:border-[#FF6B35]/50 hover:text-white hover:bg-[#FF6B35]/5 transition"
        >
          <Plus size={13} /> <FileText size={12} /> Text question
        </button>
        <button
          onClick={() => addQuestion('image')}
          className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-white/[0.1] bg-white/[0.02] text-[12px] font-semibold text-gray-300 hover:border-[#8FB9E6]/50 hover:text-white hover:bg-[#8FB9E6]/5 transition"
        >
          <Plus size={13} /> <ImageIcon size={12} /> Image question
        </button>
      </div>
    </div>
  );
}
