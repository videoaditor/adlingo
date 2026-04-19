import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

const COLORS = ['#F97316', '#EF4444', '#FBBF24', '#10B981', '#3B82F6', '#F472B6'];

export default function ConfettiBurst({ count = 28, spread = 240, duration = 1.4 }) {
  const pieces = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => {
      const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
      const distance = spread * (0.55 + Math.random() * 0.45);
      return {
        id: i,
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance - 40,
        color: COLORS[i % COLORS.length],
        size: 6 + Math.random() * 6,
        rotate: Math.random() * 540 - 270,
        shape: Math.random() > 0.5 ? 'square' : 'circle',
        delay: Math.random() * 0.06,
      };
    });
  }, [count, spread]);

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-visible">
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          initial={{ x: 0, y: 0, opacity: 1, scale: 0.6, rotate: 0 }}
          animate={{ x: p.x, y: p.y, opacity: 0, scale: 1, rotate: p.rotate }}
          transition={{ duration, delay: p.delay, ease: [0.2, 0.7, 0.3, 1] }}
          style={{
            position: 'absolute',
            width: p.size,
            height: p.size,
            background: p.color,
            borderRadius: p.shape === 'circle' ? '50%' : '2px',
            boxShadow: `0 0 8px ${p.color}55`,
          }}
        />
      ))}
    </div>
  );
}
