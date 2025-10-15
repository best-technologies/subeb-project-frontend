import React, { useState, useEffect } from "react";
import { Check } from "lucide-react";

interface ConfettiParticle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  speedX: number;
  speedY: number;
  rotation: number;
  rotationSpeed: number;
}

interface ConfettiCheckmarkProps {
  size?: number;
  checkColor?: string;
  circleColor?: string;
  confettiColors?: string[];
  particleCount?: number;
  duration?: number;
  autoPlay?: boolean;
  onComplete?: () => void;
  className?: string;
}

export default function ConfettiCheckmark({
  size = 80,
  checkColor = "#ffffff",
  circleColor = "#10b981",
  confettiColors = [
    "#ff6b6b",
    "#4ecdc4",
    "#45b7d1",
    "#f9ca24",
    "#f0932b",
    "#eb4d4b",
    "#6c5ce7",
  ],
  particleCount = 40,
  duration = 2000,
  autoPlay = true,
  onComplete,
  className = "",
}: ConfettiCheckmarkProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [confetti, setConfetti] = useState<ConfettiParticle[]>([]);
  const [showCheck, setShowCheck] = useState(false);

  const trigger = () => {
    if (isAnimating) return;

    setIsAnimating(true);
    setShowCheck(true);

    const particles: ConfettiParticle[] = [];
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount;
      const velocity = 3 + Math.random() * 4;
      particles.push({
        id: i,
        x: 0,
        y: 0,
        color:
          confettiColors[Math.floor(Math.random() * confettiColors.length)],
        size: 6 + Math.random() * 8,
        speedX: Math.cos(angle) * velocity,
        speedY: Math.sin(angle) * velocity,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
      });
    }
    setConfetti(particles);

    setTimeout(() => {
      setIsAnimating(false);
      setConfetti([]);
      onComplete?.();
    }, duration);
  };

  useEffect(() => {
    if (autoPlay) {
      trigger();
    }
  }, [autoPlay]);

  useEffect(() => {
    if (!isAnimating || confetti.length === 0) return;

    const interval = setInterval(() => {
      setConfetti((prev) =>
        prev.map((particle) => ({
          ...particle,
          x: particle.x + particle.speedX,
          y: particle.y + particle.speedY + 0.3,
          speedY: particle.speedY + 0.15,
          rotation: particle.rotation + particle.rotationSpeed,
        }))
      );
    }, 16);

    return () => clearInterval(interval);
  }, [isAnimating, confetti.length]);

  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <div
        className="relative flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <div
          className={`absolute inset-0 rounded-full transition-all duration-500 ${
            showCheck ? "scale-100 opacity-100" : "scale-0 opacity-0"
          }`}
          style={{ backgroundColor: circleColor }}
        />

        <div
          className={`relative z-10 transition-all duration-500 delay-200 ${
            showCheck ? "scale-100 opacity-100" : "scale-0 opacity-0"
          }`}
        >
          <Check size={size * 0.5} color={checkColor} strokeWidth={3} />
        </div>

        <div className="absolute inset-0 pointer-events-none overflow-visible">
          {confetti.map((particle) => (
            <div
              key={particle.id}
              className="absolute rounded-sm transition-opacity duration-300"
              style={{
                left: "50%",
                top: "50%",
                width: particle.size,
                height: particle.size,
                backgroundColor: particle.color,
                transform: `translate(${particle.x}px, ${particle.y}px) rotate(${particle.rotation}deg) translate(-50%, -50%)`,
                opacity: Math.max(0, 1 - Math.abs(particle.y) / 200),
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
