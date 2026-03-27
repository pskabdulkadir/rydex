import { useEffect, useRef, useState } from 'react';
import { AlertCircle } from 'lucide-react';

interface RadarScannerProps {
  activityScore: number;
  isActive: boolean;
  onThresholdReached?: () => void;
}

export default function RadarScanner({
  activityScore,
  isActive,
  onThresholdReached,
}: RadarScannerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [isLocked, setIsLocked] = useState(false);
  const centerVibrationRef = useRef(0);
  const rotationRef = useRef(0);
  const detectionRef = useRef({
    angle: 0,
    intensity: 0,
    detected: false,
  });

  // Play radar sound
  const playRadarSound = (frequency: number) => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = frequency;
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (e) {
      // Audio context not available, skip
    }
  };

  // Trigger vibration
  const triggerVibration = (duration: number | number[]) => {
    if (navigator.vibrate) {
      navigator.vibrate(duration);
    }
  };

  useEffect(() => {
    if (!canvasRef.current || !isActive) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const maxRadius = Math.min(centerX, centerY) - 20;

    const animate = () => {
      // Clear canvas
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Background gradient
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, maxRadius);
      gradient.addColorStop(0, '#1e293b');
      gradient.addColorStop(1, '#0f172a');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw concentric rings (intensity rings)
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1;
      const ringCount = 5;
      for (let i = 1; i <= ringCount; i++) {
        const radius = (maxRadius / ringCount) * i;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Draw crosshairs
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(centerX - 20, centerY);
      ctx.lineTo(centerX + 20, centerY);
      ctx.moveTo(centerX, centerY - 20);
      ctx.lineTo(centerX, centerY + 20);
      ctx.stroke();

      // Rotating radar beam
      if (!isLocked) {
        rotationRef.current += 2; // Rotation speed
        if (rotationRef.current >= 360) {
          rotationRef.current = 0;
        }
      }

      const beamAngle = (rotationRef.current * Math.PI) / 180;

      // Radar beam
      const beamColor = isLocked ? '#ef4444' : '#22c55e';
      ctx.strokeStyle = beamColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(
        centerX + Math.cos(beamAngle) * maxRadius,
        centerY + Math.sin(beamAngle) * maxRadius
      );
      ctx.stroke();

      // Sweep gradient
      const sweepGradient = ctx.createLinearGradient(
        centerX,
        centerY,
        centerX + Math.cos(beamAngle) * maxRadius,
        centerY + Math.sin(beamAngle) * maxRadius
      );
      sweepGradient.addColorStop(0, `rgba(34, 197, 94, 0.3)`);
      sweepGradient.addColorStop(1, `rgba(34, 197, 94, 0)`);
      ctx.fillStyle = sweepGradient;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(
        centerX + Math.cos(beamAngle) * maxRadius,
        centerY + Math.sin(beamAngle) * maxRadius
      );
      ctx.lineTo(
        centerX + Math.cos(beamAngle + 0.3) * maxRadius,
        centerY + Math.sin(beamAngle + 0.3) * maxRadius
      );
      ctx.closePath();
      ctx.fill();

      // Detection point (if score is high)
      if (activityScore > 40) {
        const detectionDistance = (activityScore / 100) * maxRadius;
        const detectionAngle = (Math.random() * Math.PI * 2);
        detectionRef.current.angle = detectionAngle;
        detectionRef.current.intensity = activityScore / 100;

        const detectionX = centerX + Math.cos(detectionAngle) * detectionDistance;
        const detectionY = centerY + Math.sin(detectionAngle) * detectionDistance;

        // Detection glow
        const glowGradient = ctx.createRadialGradient(
          detectionX,
          detectionY,
          0,
          detectionX,
          detectionY,
          20
        );
        glowGradient.addColorStop(0, `rgba(239, 68, 68, 0.8)`);
        glowGradient.addColorStop(0.5, `rgba(239, 68, 68, 0.3)`);
        glowGradient.addColorStop(1, `rgba(239, 68, 68, 0)`);
        ctx.fillStyle = glowGradient;
        ctx.fillRect(detectionX - 20, detectionY - 20, 40, 40);

        // Detection point
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(detectionX, detectionY, 5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Update center vibration (pulse effect)
      const pulse = Math.sin(Date.now() / 100) * 2 + 2;
      centerVibrationRef.current = pulse * (activityScore / 100);

      // Center point with vibration
      const centerSize = 8 + centerVibrationRef.current;
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(centerX, centerY, centerSize, 0, Math.PI * 2);
      ctx.fill();

      // Center glow
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.5;
      ctx.beginPath();
      ctx.arc(centerX, centerY, centerSize * 1.5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;

      // Detection feedback
      if (activityScore > 75 && !isLocked) {
        setIsLocked(true);
        playRadarSound(1000 + (activityScore * 5)); // Higher score = higher frequency
        triggerVibration([100, 50, 100]); // Vibration pattern
        onThresholdReached?.();
      }

      if (activityScore <= 50 && isLocked) {
        setIsLocked(false);
      }

      // Play periodic radar ping
      if (Math.floor(Date.now() / 500) % 2 === 0) {
        playRadarSound(400 + (activityScore * 2));
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive, onThresholdReached]);

  // Canvas resize handler
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  if (!isActive) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-900">
        <div className="text-center text-slate-400">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Radar tarayıcısını başlatmak için tarama yapınız</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative bg-slate-900">
      <canvas
        ref={canvasRef}
        className={`w-full h-full block transition-all ${isLocked ? 'filter drop-shadow-lg' : ''}`}
        style={{
          filter: isLocked ? `drop-shadow(0 0 20px #ef4444)` : 'none',
        }}
      />

      {/* Status indicator */}
      <div className="absolute top-4 right-4 bg-slate-800/80 backdrop-blur rounded-lg p-3 border border-slate-700">
        <div className="text-xs text-slate-400 mb-1">Skor</div>
        <div className="text-2xl font-bold text-white">{activityScore}</div>
        {isLocked && (
          <div className="mt-2 text-xs font-semibold text-red-400 animate-pulse">
            ◆ KILITLENDI
          </div>
        )}
      </div>

      {/* Info */}
      <div className="absolute bottom-4 left-4 bg-slate-800/80 backdrop-blur rounded-lg p-3 border border-slate-700 text-xs text-slate-300">
        <div>✓ 360° dönen radar</div>
        <div>✓ Yoğunluk halkaları</div>
        <div>✓ Merkezde titreşim</div>
        <div>✓ Ses frekansı: {Math.round(400 + activityScore * 2)} Hz</div>
      </div>
    </div>
  );
}
