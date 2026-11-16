import { useEffect, useRef } from 'react';

const COLORS = ['#84d4ab', '#fb9cbb', '#a8e3c4', '#ffbcd1', '#5fc190', '#f17ca3', '#ffe7ef', '#e0f6ea'];

export default function Confetti({ active, duration = 3200 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!active) return undefined;

    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const context = canvas.getContext('2d');
    let frame = 0;
    let animationId = 0;
    let running = true;
    const particles = [];
    const startedAt = performance.now();

    function resize() {
      canvas.width = window.innerWidth * devicePixelRatio;
      canvas.height = window.innerHeight * devicePixelRatio;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    }

    function spawnBurst() {
      const originX = window.innerWidth / 2;
      const originY = window.innerHeight * 0.28;
      for (let index = 0; index < 90; index += 1) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 4 + Math.random() * 9;
        particles.push({
          x: originX + (Math.random() - 0.5) * 40,
          y: originY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 6,
          size: 5 + Math.random() * 7,
          rotation: Math.random() * Math.PI,
          spin: (Math.random() - 0.5) * 0.35,
          color: COLORS[index % COLORS.length],
          life: 1,
        });
      }
    }

    function tick(now) {
      if (!running) return;
      context.clearRect(0, 0, window.innerWidth, window.innerHeight);

      if (now - startedAt < 700 && frame % 8 === 0) spawnBurst();

      for (const particle of particles) {
        particle.vy += 0.22;
        particle.vx *= 0.99;
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.rotation += particle.spin;
        particle.life -= 0.008;

        if (particle.life <= 0) continue;
        context.save();
        context.translate(particle.x, particle.y);
        context.rotate(particle.rotation);
        context.globalAlpha = Math.max(particle.life, 0);
        context.fillStyle = particle.color;
        context.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size * 0.6);
        context.restore();
      }

      frame += 1;
      if (now - startedAt < duration) animationId = requestAnimationFrame(tick);
      else context.clearRect(0, 0, window.innerWidth, window.innerHeight);
    }

    resize();
    spawnBurst();
    animationId = requestAnimationFrame(tick);
    window.addEventListener('resize', resize);

    return () => {
      running = false;
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
      context.clearRect(0, 0, window.innerWidth, window.innerHeight);
    };
  }, [active, duration]);

  if (!active) return null;
  return <canvas ref={canvasRef} className="confetti" aria-hidden="true" />;
}
