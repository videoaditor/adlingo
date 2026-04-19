import React from 'react';
import { motion } from 'framer-motion';
import logoUrl from '/aditor-logo.png';

export default function AditorLogo({ size = 36, animate = false, className = '', glow = true }) {
  const img = (
    <img
      src={logoUrl}
      alt="Aditor"
      width={size}
      height={size}
      draggable={false}
      style={{
        width: size,
        height: size,
        filter: glow ? 'drop-shadow(0 4px 12px rgba(249,115,22,0.35))' : undefined,
        userSelect: 'none',
      }}
      className={className}
    />
  );

  if (!animate) return img;

  return (
    <motion.div
      initial={{ scale: 0.7, rotate: -8, opacity: 0 }}
      animate={{ scale: 1, rotate: 0, opacity: 1 }}
      transition={{ type: 'spring', damping: 12, stiffness: 180 }}
      whileHover={{ scale: 1.05, rotate: 2 }}
      whileTap={{ scale: 0.92, rotate: -4 }}
      style={{ display: 'inline-flex', cursor: 'pointer' }}
    >
      {img}
    </motion.div>
  );
}
