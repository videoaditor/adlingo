import React, { useState } from 'react';
import { Flame, ArrowRight, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { checkAppPassword } from '../services/auth';

export default function Login({ onLogin, loading, error }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pwError, setPwError] = useState(false);
  const [step, setStep] = useState('email'); // 'email' or 'password'

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setStep('password');
    }
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    setPwError(false);
    if (checkAppPassword(password)) {
      onLogin(email.trim().toLowerCase());
    } else {
      setPwError(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white flex flex-col items-center justify-center p-6">
      <div className="max-w-sm w-full bg-[#111630] rounded-3xl p-6 border border-white/10 shadow-2xl">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 15 }}
          className="text-center mb-10"
        >
          <div className="w-20 h-20 rounded-[22px] bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center mx-auto mb-5 border-b-[4px] border-red-700 shadow-2xl shadow-orange-500/40">
            <Flame size={38} className="text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white">
            AdLingo
          </h1>
          <p className="text-gray-400 text-[13px] font-medium mt-1">Editor Training Platform</p>
        </motion.div>

        {step === 'email' ? (
          /* Step 1: Email */
          <motion.form
            onSubmit={handleEmailSubmit}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="space-y-4"
          >
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-2 ml-1">
                Your Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="editor@aditor.ai"
                style={{ backgroundColor: '#252d65', borderColor: '#3a4280' }}
                className="w-full px-4 py-4 rounded-2xl text-white text-[15px] placeholder-gray-500 focus:outline-none focus:!border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition font-medium border-2"
                required
                autoFocus
              />
            </div>

            <motion.button
              type="submit"
              whileTap={{ scale: 0.97, y: 3 }}
              className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-black rounded-2xl uppercase tracking-wider text-[14px] border-b-[4px] border-orange-700 active:border-b-0 active:translate-y-[4px] shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2"
            >
              Continue
              <ArrowRight size={16} strokeWidth={2.5} />
            </motion.button>

            <p className="text-center text-gray-600 text-[11px] mt-8 font-medium">
              Use the email registered in your Aditor profile
            </p>
          </motion.form>
        ) : (
          /* Step 2: Password */
          <motion.form
            onSubmit={handlePasswordSubmit}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2 px-1 mb-1">
              <span className="text-gray-400 text-[13px]">{email}</span>
              <button
                type="button"
                onClick={() => { setStep('email'); setPassword(''); setPwError(false); }}
                className="text-orange-400 text-[11px] font-bold hover:text-orange-300 transition"
              >
                Change
              </button>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-2 ml-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setPwError(false); }}
                placeholder="Enter password"
                style={{ backgroundColor: '#252d65', borderColor: pwError ? '#ef4444' : '#3a4280' }}
                className="w-full px-4 py-4 rounded-2xl text-white text-[15px] placeholder-gray-500 focus:outline-none focus:!border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition font-medium border-2"
                required
                autoFocus
              />
            </div>

            {pwError && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-400 text-[13px] font-medium bg-red-500/10 border border-red-500/20 rounded-2xl px-4 py-3"
              >
                Wrong password
              </motion.p>
            )}

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-400 text-[13px] font-medium bg-red-500/10 border border-red-500/20 rounded-2xl px-4 py-3"
              >
                {error}
              </motion.p>
            )}

            <motion.button
              type="submit"
              disabled={loading}
              whileTap={{ scale: 0.97, y: 3 }}
              className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-black rounded-2xl uppercase tracking-wider text-[14px] border-b-[4px] border-orange-700 active:border-b-0 active:translate-y-[4px] shadow-lg shadow-orange-500/25 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Looking you up...
                </>
              ) : (
                <>
                  Enter Training
                  <Lock size={14} strokeWidth={2.5} />
                </>
              )}
            </motion.button>
          </motion.form>
        )}
      </div>
    </div>
  );
}
