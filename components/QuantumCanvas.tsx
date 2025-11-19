import React, { useRef, useEffect } from 'react';
import { SimulationParams, WaveCoefficients } from '../types';
import { getWaveFunctionAt } from '../utils/physics';

interface QuantumCanvasProps {
  params: SimulationParams;
  coeffs: WaveCoefficients;
}

const QuantumCanvas: React.FC<QuantumCanvasProps> = ({ params, coeffs }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const timeRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      timeRef.current += 0.02; // Animation speed
      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      // Clear canvas
      ctx.fillStyle = '#0b0c15'; // Match bg-space-900
      ctx.fillRect(0, 0, width, height);

      // Coordinate Mapping
      // x range: -2 to +params.barrierWidth + 2
      const xMin = -3;
      const xMax = params.barrierWidth + 3;
      const xScale = width / (xMax - xMin);
      
      // y range: Amplitude is usually around 1-2. Scale to fit.
      const yScale = height / 4; 

      const mapX = (simX: number) => (simX - xMin) * xScale;
      const mapY = (simY: number) => centerY - simY * yScale;

      // 1. Draw Barrier (Potential V)
      ctx.fillStyle = 'rgba(255, 0, 60, 0.15)';
      ctx.strokeStyle = '#ff003c';
      ctx.lineWidth = 2;

      const barrierStart = mapX(0);
      const barrierEnd = mapX(params.barrierWidth);
      const barrierHeightPx = params.barrierHeight * (yScale / 5); // Scale potential visually distinct from wavefunction amplitude

      ctx.beginPath();
      ctx.moveTo(0, centerY); // Ground level
      ctx.lineTo(barrierStart, centerY);
      ctx.lineTo(barrierStart, centerY - barrierHeightPx);
      ctx.lineTo(barrierEnd, centerY - barrierHeightPx);
      ctx.lineTo(barrierEnd, centerY);
      ctx.lineTo(width, centerY);
      ctx.stroke();
      ctx.fill();

      // Label Barrier
      ctx.fillStyle = '#ff003c';
      ctx.font = '12px monospace';
      ctx.fillText(`V₀ = ${params.barrierHeight}`, barrierStart + 10, centerY - barrierHeightPx - 10);

      // 2. Draw Energy Level
      ctx.strokeStyle = '#0aff68'; // Green for Energy
      ctx.setLineDash([5, 5]);
      const energyY = params.energy * (yScale / 5);
      ctx.beginPath();
      ctx.moveTo(0, centerY - energyY);
      ctx.lineTo(width, centerY - energyY);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#0aff68';
      ctx.fillText(`E = ${params.energy}`, 10, centerY - energyY - 10);


      // 3. Draw Wave Function (Real Part - Animated)
      ctx.beginPath();
      ctx.strokeStyle = '#00f3ff'; // Neon Blue
      ctx.lineWidth = 2;
      
      // 4. Draw Probability Density (|psi|^2 - Filled)
      // We draw Probability first so it's behind the wave
      const probPath = new Path2D();
      
      // Iterate x pixels
      for (let px = 0; px <= width; px++) {
        const simX = xMin + (px / width) * (xMax - xMin);
        const { real, prob } = getWaveFunctionAt(simX, timeRef.current, params, coeffs);
        
        const pyReal = mapY(real);
        const pyProb = mapY(prob); // Probability is always positive, so it bumps up from centerline

        // Draw Real part line
        if (px === 0) ctx.moveTo(px, pyReal);
        else ctx.lineTo(px, pyReal);

        // Build Prob path
        if (px === 0) probPath.moveTo(px, centerY);
        probPath.lineTo(px, pyProb);
      }

      // Stroke Real Wave
      ctx.stroke();

      // Fill Probability
      probPath.lineTo(width, centerY);
      probPath.closePath();
      ctx.fillStyle = 'rgba(188, 19, 254, 0.2)'; // Purple transparent
      ctx.fill(probPath);
      
      // Probability Outline
      ctx.strokeStyle = 'rgba(188, 19, 254, 0.6)';
      ctx.lineWidth = 1;
      ctx.stroke(probPath);

      // Labels
      ctx.fillStyle = '#00f3ff';
      ctx.fillText("Re[Ψ(x,t)]", width - 80, centerY - 50);
      ctx.fillStyle = '#bc13fe';
      ctx.fillText("|Ψ(x)|²", width - 80, centerY - 30);

      animationRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [params, coeffs]);

  return (
    <div className="relative w-full h-96 bg-space-800 rounded-xl overflow-hidden border border-space-700 shadow-2xl">
      <canvas 
        ref={canvasRef} 
        width={1200} 
        height={600} 
        className="w-full h-full block"
      />
      <div className="absolute top-4 left-4 bg-space-900/80 backdrop-blur p-2 rounded border border-space-700 text-xs text-gray-400">
        <div>Region I: Incoming/Reflected</div>
        <div>Region II: Barrier</div>
        <div>Region III: Transmitted</div>
      </div>
    </div>
  );
};

export default QuantumCanvas;