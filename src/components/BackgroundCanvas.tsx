import React, { useEffect, useRef } from 'react';
import { GraphicsSettings } from '../types';

interface BackgroundCanvasProps {
  graphics: GraphicsSettings;
}

export const BackgroundCanvas: React.FC<BackgroundCanvasProps> = ({ graphics }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Particle system setup
    const particleCount = graphics.quality === 'ULTRA' ? 90 : graphics.quality === 'HIGH' ? 60 : 30;
    const particles: Array<{
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      color: string;
      alpha: number;
      pulse: number;
    }> = [];

    const colors = ['#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#f97316'];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 3 + 1,
        speedX: (Math.random() - 0.5) * 0.8,
        speedY: (Math.random() - 0.5) * 0.8 - 0.3,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.6 + 0.2,
        pulse: Math.random() * Math.PI,
      });
    }

    let gridOffset = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Deep space atmospheric gradient
      const bgGradient = ctx.createRadialGradient(
        width / 2,
        height * 0.4,
        50,
        width / 2,
        height / 2,
        Math.max(width, height)
      );

      if (graphics.screenFilter === 'CYBER') {
        bgGradient.addColorStop(0, '#0f172a');
        bgGradient.addColorStop(0.5, '#090d16');
        bgGradient.addColorStop(1, '#020617');
      } else if (graphics.screenFilter === 'RETRO') {
        bgGradient.addColorStop(0, '#180e29');
        bgGradient.addColorStop(0.6, '#0f051d');
        bgGradient.addColorStop(1, '#05010a');
      } else if (graphics.screenFilter === 'WARM') {
        bgGradient.addColorStop(0, '#1c1917');
        bgGradient.addColorStop(0.6, '#0c0a09');
        bgGradient.addColorStop(1, '#000000');
      } else {
        bgGradient.addColorStop(0, '#111827');
        bgGradient.addColorStop(1, '#030712');
      }

      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, width, height);

      // Perspective Grid Lines
      if (graphics.particlesEnabled) {
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.08)';
        ctx.lineWidth = 1;

        const horizonY = height * 0.65;
        gridOffset = (gridOffset + 0.5) % 40;

        // Draw perspective grid below horizon
        const lines = 16;
        for (let i = 0; i <= lines; i++) {
          const x = (width / lines) * i;
          ctx.beginPath();
          ctx.moveTo(x, height);
          ctx.lineTo(width / 2 + (x - width / 2) * 0.1, horizonY);
          ctx.stroke();
        }

        // Horizontal grid lines moving down
        for (let y = horizonY; y < height; y += 15 + (y - horizonY) * 0.1) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }

        // Draw ambient glow orb behind logo area
        const glowGradient = ctx.createRadialGradient(
          width / 2,
          height * 0.35,
          10,
          width / 2,
          height * 0.35,
          280
        );
        glowGradient.addColorStop(0, 'rgba(6, 182, 212, 0.18)');
        glowGradient.addColorStop(0.5, 'rgba(139, 92, 246, 0.08)');
        glowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(width / 2, height * 0.35, 280, 0, Math.PI * 2);
        ctx.fill();

        // Particle rendering
        particles.forEach((p) => {
          p.x += p.speedX;
          p.y += p.speedY;
          p.pulse += 0.02;

          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;
          if (p.y < 0) p.y = height;
          if (p.y > height) p.y = 0;

          const currentAlpha = p.alpha * (0.6 + 0.4 * Math.sin(p.pulse));

          ctx.fillStyle = p.color;
          ctx.globalAlpha = currentAlpha;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();

          if (graphics.bloomEnabled) {
            ctx.shadowBlur = 8;
            ctx.shadowColor = p.color;
          }
        });
        ctx.globalAlpha = 1.0;
        ctx.shadowBlur = 0;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [graphics]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
    />
  );
};
