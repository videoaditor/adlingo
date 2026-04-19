const PATTERNS = {
  light: 8,
  tap: 12,
  select: [0, 10],
  nav: 18,
  success: [0, 25, 40, 25],
  error: [0, 45, 60, 45],
  celebrate: [0, 20, 40, 20, 40, 60],
  unlock: [0, 15, 30, 15, 60, 80],
};

function reducedMotion() {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function haptic(kind = 'light') {
  if (reducedMotion()) return;
  if (typeof navigator === 'undefined' || !navigator.vibrate) return;
  const pattern = PATTERNS[kind] ?? PATTERNS.light;
  try {
    navigator.vibrate(pattern);
  } catch {
    /* silent */
  }
}
