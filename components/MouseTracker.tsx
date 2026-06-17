import React, { useEffect, useRef } from 'react';

const CRYPTO_LOGOS = [
  '/crypto-logos/bnb.svg',
  '/crypto-logos/eth.svg',
  '/crypto-logos/polygon.svg',
  '/crypto-logos/solana.svg',
  '/crypto-logos/chainlink.svg',
  '/crypto-logos/cardano.svg',
  '/crypto-logos/polkadot.svg',
  '/crypto-logos/avalanche.svg',
];

const LOGO_SIZE = 36;
const LIFETIME_MS = 900;
const THROTTLE_MS = 50;
const MAX_PARTICLES = 20;

const MouseTracker: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const lastSpawn = useRef(0);
  const pool = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMove = (e: MouseEvent) => {
      const now = Date.now();
      if (now - lastSpawn.current < THROTTLE_MS) return;
      lastSpawn.current = now;

      if (pool.current.length >= MAX_PARTICLES) {
        const oldest = pool.current.shift();
        oldest?.remove();
      }

      const logo = CRYPTO_LOGOS[Math.floor(Math.random() * CRYPTO_LOGOS.length)];
      const driftX = (Math.random() - 0.5) * 50;
      const driftY = -(40 + Math.random() * 60);

      const el = document.createElement('div');
      el.style.cssText = `
        position: fixed;
        left: ${e.clientX - LOGO_SIZE / 2}px;
        top: ${e.clientY - LOGO_SIZE / 2}px;
        width: ${LOGO_SIZE}px;
        height: ${LOGO_SIZE}px;
        pointer-events: none;
        z-index: 99999;
        will-change: transform, opacity;
      `;

      const img = document.createElement('img');
      img.src = logo;
      img.draggable = false;
      img.style.cssText = `width: 100%; height: 100%; filter: drop-shadow(0 0 6px rgba(147, 51, 234, 0.5));`;
      el.appendChild(img);

      container.appendChild(el);
      pool.current.push(el);

      // Fade out with JS animation instead of CSS transition (no layout delay)
      const startTime = performance.now();
      const animate = (time: number) => {
        const elapsed = time - startTime;
        const progress = Math.min(elapsed / LIFETIME_MS, 1);
        const eased = 1 - progress * progress; // ease-out quad
        el.style.transform = `translate(${driftX * progress}px, ${driftY * progress}px) scale(${0.3 + 0.7 * eased})`;
        el.style.opacity = String(eased);
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          el.remove();
          pool.current = pool.current.filter((p) => p !== el);
        }
      };
      requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', handleMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMove);
      pool.current.forEach((p) => p.remove());
      pool.current = [];
    };
  }, []);

  return <div ref={containerRef} className="fixed inset-0 pointer-events-none z-[99999]" />;
};

export default MouseTracker;
