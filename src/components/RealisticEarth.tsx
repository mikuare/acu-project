import { useEffect, useRef } from 'react';

const RealisticEarth = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const canvasWidth = 400;
    const canvasHeight = 400;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    let rotation = 0;
    const rotationSpeed = 0.005;

    // Earth parameters
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;
    const radius = 180;

    // Create realistic ocean gradient
    const createOceanGradient = (ctx: CanvasRenderingContext2D) => {
      const gradient = ctx.createRadialGradient(
        centerX - radius * 0.3, centerY - radius * 0.2, 0,
        centerX, centerY, radius
      );
      gradient.addColorStop(0, '#87CEEB'); // Light blue
      gradient.addColorStop(0.3, '#4682B4'); // Steel blue
      gradient.addColorStop(0.7, '#1E3A8A'); // Dark blue
      gradient.addColorStop(1, '#0F172A'); // Very dark blue
      return gradient;
    };

    // Draw realistic continents with proper shapes
    const drawContinents = (ctx: CanvasRenderingContext2D, rotation: number) => {
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(rotation);

      // Set continent color with gradient
      const continentGradient = ctx.createLinearGradient(-radius, -radius, radius, radius);
      continentGradient.addColorStop(0, '#228B22'); // Forest green
      continentGradient.addColorStop(0.5, '#32CD32'); // Lime green
      continentGradient.addColorStop(1, '#228B22'); // Forest green

      ctx.fillStyle = continentGradient;
      ctx.strokeStyle = '#1F4E1F';
      ctx.lineWidth = 1;

      // Africa (more realistic shape)
      ctx.beginPath();
      ctx.moveTo(-20, -50);
      ctx.bezierCurveTo(-30, -60, -35, -40, -25, -30);
      ctx.bezierCurveTo(-20, -20, -15, -10, -10, -20);
      ctx.bezierCurveTo(-5, -30, -5, -40, -10, -50);
      ctx.bezierCurveTo(-15, -60, -20, -50, -20, -50);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Europe
      ctx.beginPath();
      ctx.moveTo(-15, -45);
      ctx.bezierCurveTo(-10, -50, -5, -48, 0, -45);
      ctx.bezierCurveTo(5, -42, 8, -40, 5, -35);
      ctx.bezierCurveTo(2, -30, -5, -32, -10, -35);
      ctx.bezierCurveTo(-15, -38, -15, -45, -15, -45);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Asia
      ctx.beginPath();
      ctx.moveTo(10, -40);
      ctx.bezierCurveTo(30, -45, 50, -40, 60, -35);
      ctx.bezierCurveTo(65, -30, 60, -25, 55, -20);
      ctx.bezierCurveTo(50, -15, 40, -10, 30, -15);
      ctx.bezierCurveTo(20, -20, 15, -30, 10, -40);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // North America
      ctx.beginPath();
      ctx.moveTo(-80, -20);
      ctx.bezierCurveTo(-90, -30, -85, -40, -75, -45);
      ctx.bezierCurveTo(-65, -50, -55, -45, -50, -35);
      ctx.bezierCurveTo(-45, -25, -50, -15, -60, -10);
      ctx.bezierCurveTo(-70, -5, -80, -10, -80, -20);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // South America
      ctx.beginPath();
      ctx.moveTo(-50, 10);
      ctx.bezierCurveTo(-55, 0, -50, -10, -45, -15);
      ctx.bezierCurveTo(-40, -20, -35, -15, -30, -10);
      ctx.bezierCurveTo(-25, -5, -25, 5, -30, 15);
      ctx.bezierCurveTo(-35, 25, -40, 30, -45, 25);
      ctx.bezierCurveTo(-50, 20, -50, 10, -50, 10);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Australia
      ctx.beginPath();
      ctx.moveTo(40, 30);
      ctx.bezierCurveTo(50, 25, 60, 30, 65, 40);
      ctx.bezierCurveTo(70, 50, 65, 60, 55, 65);
      ctx.bezierCurveTo(45, 70, 35, 65, 30, 55);
      ctx.bezierCurveTo(25, 45, 30, 35, 40, 30);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.restore();
    };

    // Draw clouds
    const drawClouds = (ctx: CanvasRenderingContext2D, rotation: number) => {
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(rotation * 1.3); // Clouds move slightly faster

      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.lineWidth = 1;

      // Cloud 1
      ctx.beginPath();
      ctx.arc(-30, -20, 15, 0, Math.PI * 2);
      ctx.arc(-20, -25, 12, 0, Math.PI * 2);
      ctx.arc(-10, -20, 10, 0, Math.PI * 2);
      ctx.arc(-15, -15, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Cloud 2
      ctx.beginPath();
      ctx.arc(20, 10, 18, 0, Math.PI * 2);
      ctx.arc(30, 5, 15, 0, Math.PI * 2);
      ctx.arc(40, 10, 12, 0, Math.PI * 2);
      ctx.arc(25, 15, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Cloud 3
      ctx.beginPath();
      ctx.arc(50, -30, 12, 0, Math.PI * 2);
      ctx.arc(60, -35, 10, 0, Math.PI * 2);
      ctx.arc(55, -25, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.restore();
    };

    // Draw atmosphere glow
    const drawAtmosphere = (ctx: CanvasRenderingContext2D) => {
      const atmosphereGradient = ctx.createRadialGradient(
        centerX, centerY, radius,
        centerX, centerY, radius + 30
      );
      atmosphereGradient.addColorStop(0, 'rgba(135, 206, 250, 0)');
      atmosphereGradient.addColorStop(0.7, 'rgba(135, 206, 250, 0.1)');
      atmosphereGradient.addColorStop(1, 'rgba(135, 206, 250, 0)');

      ctx.fillStyle = atmosphereGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius + 30, 0, Math.PI * 2);
      ctx.fill();
    };

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      // Draw atmosphere
      drawAtmosphere(ctx);

      // Draw ocean background
      ctx.fillStyle = createOceanGradient(ctx);
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fill();

      // Draw continents
      drawContinents(ctx, rotation);

      // Draw clouds
      drawClouds(ctx, rotation);

      // Add realistic lighting effect
      const lightingGradient = ctx.createRadialGradient(
        centerX - radius * 0.3, centerY - radius * 0.3, 0,
        centerX, centerY, radius
      );
      lightingGradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
      lightingGradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.1)');
      lightingGradient.addColorStop(0.7, 'rgba(255, 255, 255, 0)');
      lightingGradient.addColorStop(1, 'rgba(0, 0, 0, 0.2)');

      ctx.fillStyle = lightingGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fill();

      // Add subtle shadow
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 20;
      ctx.strokeStyle = 'rgba(100, 149, 237, 0.5)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;

      rotation += rotationSpeed;
      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      // Cleanup if needed
    };
  }, []);

  return (
    <div className="relative flex items-center justify-center">
      <canvas
        ref={canvasRef}
        className="w-80 h-80"
        style={{ 
          filter: 'drop-shadow(0 0 30px rgba(59, 130, 246, 0.4))',
          borderRadius: '50%'
        }}
      />
    </div>
  );
};

export default RealisticEarth;
