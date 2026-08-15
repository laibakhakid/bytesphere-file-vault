import React, { useEffect, useRef } from 'react';

interface CyberSphere3DProps {
  className?: string;
  particleCount?: number;
  radius?: number;
}

export const CyberSphere3D: React.FC<CyberSphere3DProps> = ({
  className = '',
  particleCount = 260,
  radius = 170,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 600);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 600);

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener('resize', handleResize);

    // Mouse coordinates for interactive 3D rotation
    let targetRotationX = 0;
    let targetRotationY = 0;
    let rotationX = 0;
    let rotationY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left - width / 2;
      const y = e.clientY - rect.top - height / 2;
      targetRotationY = (x / width) * 2;
      targetRotationX = -(y / height) * 2;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Generate 3D Sphere Particles using Fibonacci lattice
    interface Point3D {
      x: number;
      y: number;
      z: number;
      baseX: number;
      baseY: number;
      baseZ: number;
      size: number;
      color: string;
      speed: number;
    }

    const points: Point3D[] = [];
    const phi = Math.PI * (3 - Math.sqrt(5)); // Golden ratio angle

    // Color palette from user image: Cream (#FFF4C6), Soft Pink (#F5C6EC), Lavender (#C4B5FD), Purple (#7C3AED)
    const colors = [
      'rgba(124, 58, 237, ', // Rich Purple/Violet
      'rgba(196, 181, 253, ', // Lavender
      'rgba(245, 198, 236, ', // Soft Pink
      'rgba(255, 220, 100, ', // Warm Gold / Cream
      'rgba(91, 33, 182, ', // Deep Violet
    ];

    for (let i = 0; i < particleCount; i++) {
      const y = 1 - (i / (particleCount - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const theta = phi * i;

      const x = Math.cos(theta) * r;
      const z = Math.sin(theta) * r;

      const colorBase = colors[i % colors.length];

      points.push({
        x: x * radius,
        y: y * radius,
        z: z * radius,
        baseX: x * radius,
        baseY: y * radius,
        baseZ: z * radius,
        size: Math.random() * 2.2 + 1.2,
        color: colorBase,
        speed: 0.005 + Math.random() * 0.003,
      });
    }

    // Outer Orbiting Satellites / Floating 3D Nodes
    const satellites = Array.from({ length: 6 }).map((_, i) => ({
      angle: (i * Math.PI * 2) / 6,
      distance: radius * 1.35,
      speed: 0.01 + (i % 2 === 0 ? 0.004 : -0.004),
      size: 4.5,
      color: i % 2 === 0 ? 'rgba(124, 58, 237, 0.9)' : 'rgba(245, 198, 236, 0.95)',
      trail: [] as { x: number; y: number }[],
    }));

    let baseAngle = 0;

    const render = () => {
      baseAngle += 0.006;
      rotationX += (targetRotationX - rotationX) * 0.05;
      rotationY += (targetRotationY - rotationY) * 0.05;

      const effectiveAngleY = baseAngle + rotationY;
      const effectiveAngleX = rotationX;

      const cosY = Math.cos(effectiveAngleY);
      const sinY = Math.sin(effectiveAngleY);
      const cosX = Math.cos(effectiveAngleX);
      const sinX = Math.sin(effectiveAngleX);

      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      // Soft center glow with pastel gradient
      const coreGlow = ctx.createRadialGradient(
        centerX,
        centerY,
        10,
        centerX,
        centerY,
        radius * 0.95
      );
      coreGlow.addColorStop(0, 'rgba(196, 181, 253, 0.25)');
      coreGlow.addColorStop(0.5, 'rgba(245, 198, 236, 0.15)');
      coreGlow.addColorStop(1, 'rgba(250, 248, 245, 0)');

      ctx.fillStyle = coreGlow;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 0.95, 0, Math.PI * 2);
      ctx.fill();

      // Transform and Project 3D points
      const projected = points.map((p) => {
        let x1 = p.baseX * cosY - p.baseZ * sinY;
        let z1 = p.baseZ * cosY + p.baseX * sinY;

        let y2 = p.baseY * cosX - z1 * sinX;
        let z2 = z1 * cosX + p.baseY * sinX;

        const fov = 400;
        const scale = fov / (fov + z2);
        const x2d = centerX + x1 * scale;
        const y2d = centerY + y2 * scale;
        const alpha = Math.max(0.2, Math.min(1, (z2 + radius) / (2 * radius)));

        return {
          x2d,
          y2d,
          z: z2,
          scale,
          alpha,
          color: p.color,
          size: p.size * scale,
        };
      });

      // Sort by Z for realistic depth
      projected.sort((a, b) => a.z - b.z);

      // Connecting web lines
      ctx.lineWidth = 0.6;
      for (let i = 0; i < projected.length; i += 3) {
        for (let j = i + 1; j < projected.length; j += 4) {
          const dx = projected[i].x2d - projected[j].x2d;
          const dy = projected[i].y2d - projected[j].y2d;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 42 && projected[i].z > -radius * 0.5) {
            const lineAlpha = (1 - dist / 42) * projected[i].alpha * 0.4;
            ctx.strokeStyle = `rgba(124, 58, 237, ${lineAlpha})`;
            ctx.beginPath();
            ctx.moveTo(projected[i].x2d, projected[i].y2d);
            ctx.lineTo(projected[j].x2d, projected[j].y2d);
            ctx.stroke();
          }
        }
      }

      // Draw Nodes
      projected.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x2d, p.y2d, Math.max(0.8, p.size), 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${p.alpha})`;
        ctx.shadowColor = '#7C3AED';
        ctx.shadowBlur = p.alpha > 0.6 ? 6 : 0;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Draw Satellites with trails
      satellites.forEach((sat) => {
        sat.angle += sat.speed;
        const satX = Math.cos(sat.angle) * sat.distance;
        const satZ = Math.sin(sat.angle) * sat.distance;
        const satY = Math.sin(sat.angle * 2) * (radius * 0.35);

        let rx = satX * cosY - satZ * sinY;
        let rz = satZ * cosY + satX * sinY;
        let ry = satY * cosX - rz * sinX;
        let rz2 = rz * cosX + satY * sinX;

        const fov = 400;
        const scale = fov / (fov + rz2);
        const x2d = centerX + rx * scale;
        const y2d = centerY + ry * scale;

        sat.trail.push({ x: x2d, y: y2d });
        if (sat.trail.length > 12) sat.trail.shift();

        if (sat.trail.length > 1) {
          ctx.beginPath();
          ctx.moveTo(sat.trail[0].x, sat.trail[0].y);
          for (let t = 1; t < sat.trail.length; t++) {
            ctx.lineTo(sat.trail[t].x, sat.trail[t].y);
          }
          ctx.strokeStyle = sat.color.replace('0.9', '0.25');
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        ctx.beginPath();
        ctx.arc(x2d, y2d, sat.size * scale, 0, Math.PI * 2);
        ctx.fillStyle = sat.color;
        ctx.shadowColor = '#7C3AED';
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [particleCount, radius]);

  return (
    <div
      className={`relative flex items-center justify-center pointer-events-none select-none ${className}`}
      style={{ pointerEvents: 'none' }}
    >
      <canvas ref={canvasRef} className="w-full h-full max-w-[700px] max-h-[700px] pointer-events-none" />
    </div>
  );
};
