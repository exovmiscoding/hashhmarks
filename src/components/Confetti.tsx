import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  rot: number;
  vr: number;
  color: string;
  life: number;
  ttl: number;
}

/** Paper-strip confetti in team colours: two corner cannons plus a curtain from above. */
export function Confetti({ colors }: { colors: string[] }) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = window.innerWidth;
    let height = window.innerHeight;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const palette = [...colors, '#111110', '#f0ece2', '#c9a227'];
    const pick = () => palette[Math.floor(Math.random() * palette.length)];
    const parts: Particle[] = [];

    const cannon = (originX: number, originY: number, direction: number, count: number) => {
      for (let i = 0; i < count; i += 1) {
        const angle = -Math.PI / 2 + direction * (0.12 + Math.random() * 0.6);
        const speed = 8 + Math.random() * 12;
        parts.push({
          x: originX,
          y: originY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          w: 4 + Math.random() * 6,
          h: 9 + Math.random() * 11,
          rot: Math.random() * Math.PI,
          vr: (Math.random() - 0.5) * 0.4,
          color: pick(),
          life: 0,
          ttl: 120 + Math.random() * 90,
        });
      }
    };

    cannon(width * 0.06, height * 0.95, 1, 78);
    cannon(width * 0.94, height * 0.95, -1, 78);

    for (let i = 0; i < 52; i += 1) {
      parts.push({
        x: Math.random() * width,
        y: -40 - Math.random() * height * 0.55,
        vx: (Math.random() - 0.5) * 1.6,
        vy: 2 + Math.random() * 3,
        w: 4 + Math.random() * 5,
        h: 7 + Math.random() * 9,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.22,
        color: pick(),
        life: 0,
        ttl: 150 + Math.random() * 90,
      });
    }

    let raf = 0;
    const start = performance.now();

    const frame = (now: number) => {
      const dt = Math.min((now - start) / 16.667, 2.5);
      ctx.clearRect(0, 0, width, height);

      for (const piece of parts) {
        piece.life += dt;
        piece.vy += 0.34 * dt;
        piece.vx *= 0.995;
        piece.x += piece.vx * dt;
        piece.y += piece.vy * dt;
        piece.rot += piece.vr * dt;

        const alpha = Math.max(0, Math.min(1, 1 - (piece.life - piece.ttl * 0.7) / (piece.ttl * 0.3)));
        if (alpha <= 0 || piece.y > height + 80) continue;

        ctx.save();
        ctx.translate(piece.x, piece.y);
        ctx.rotate(piece.rot);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = piece.color;
        ctx.fillRect(-piece.w / 2, -piece.h / 2, piece.w, piece.h);
        ctx.restore();
      }

      if (now - start < 4300) raf = requestAnimationFrame(frame);
      else ctx.clearRect(0, 0, width, height);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      ctx.clearRect(0, 0, width, height);
    };
  }, [colors]);

  return <canvas ref={ref} className="confetti-canvas" aria-hidden="true" />;
}
