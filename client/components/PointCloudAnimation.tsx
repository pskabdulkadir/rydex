import React, { useEffect, useRef } from 'react';

/**
 * Three.js Point Cloud Animasyonu
 * Cyberpunk-Luxury tema için arka plan
 */
export function PointCloudAnimation() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Canvas oluştur
    const canvas = document.createElement('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    containerRef.current.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Nokta bulutu ayarları
    const particles: Array<{
      x: number;
      y: number;
      z: number;
      vx: number;
      vy: number;
      vz: number;
    }> = [];

    const particleCount = 200;
    const speed = 0.5;

    // Noktaları oluştur
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width - canvas.width / 2,
        y: Math.random() * canvas.height - canvas.height / 2,
        z: Math.random() * 1000 - 500,
        vx: (Math.random() - 0.5) * speed,
        vy: (Math.random() - 0.5) * speed,
        vz: (Math.random() - 0.5) * speed
      });
    }

    let animationId: number;

    const animate = () => {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Noktaları güncelle ve çiz
      particles.forEach((particle, index) => {
        // Hareketi güncelle
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.z += particle.vz;

        // Sınırlı alan içinde kalması sağla
        const boundX = canvas.width / 2;
        const boundY = canvas.height / 2;
        const boundZ = 500;

        if (particle.x > boundX) particle.x = -boundX;
        if (particle.x < -boundX) particle.x = boundX;
        if (particle.y > boundY) particle.y = -boundY;
        if (particle.y < -boundY) particle.y = boundY;
        if (particle.z > boundZ) particle.z = -boundZ;
        if (particle.z < -boundZ) particle.z = boundZ;

        // Derinliğe göre boyut hesapla
        const scale = 500 / (500 + particle.z);
        const x2d = canvas.width / 2 + particle.x * scale;
        const y2d = canvas.height / 2 + particle.y * scale;

        // Renk: derinliğe göre farklı tonlar
        const opacity = (particle.z + 500) / 1000 * 0.6;
        const hue = (index * 360 / particleCount + performance.now() * 0.01) % 360;

        // Altın sarısı (#D4AF37) ve neon mavi (#00F3FF) karışımı
        if (index % 2 === 0) {
          // Altın sarısı noktalar
          ctx.fillStyle = `hsla(45, 100%, 56%, ${opacity * 0.8})`;
        } else {
          // Neon mavi noktalar
          ctx.fillStyle = `hsla(184, 100%, 50%, ${opacity * 0.8})`;
        }

        // Noktayı çiz
        const pointSize = Math.max(0.5, scale * 2);
        ctx.fillRect(x2d, y2d, pointSize, pointSize);

        // Bağlantı çizgileri (bazı noktalar arasında)
        if (index % 5 === 0) {
          const nextIndex = (index + 1) % particles.length;
          const next = particles[nextIndex];
          const nextScale = 500 / (500 + next.z);
          const nextX2d = canvas.width / 2 + next.x * nextScale;
          const nextY2d = canvas.height / 2 + next.y * nextScale;

          const dist = Math.sqrt(
            Math.pow(nextX2d - x2d, 2) + Math.pow(nextY2d - y2d, 2)
          );

          if (dist < 100) {
            ctx.strokeStyle = `rgba(212, 175, 55, ${0.2 * opacity})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(x2d, y2d);
            ctx.lineTo(nextX2d, nextY2d);
            ctx.stroke();
          }
        }
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    // Resize handler
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      canvas.remove();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}
