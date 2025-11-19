import React from 'react';
import { SimulationParams } from '../types';

interface ControlsProps {
  params: SimulationParams;
  setParams: React.Dispatch<React.SetStateAction<SimulationParams>>;
}

const Slider: React.FC<{
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (val: number) => void;
  colorClass: string;
}> = ({ label, value, min, max, step, onChange, colorClass }) => (
  <div className="mb-6">
    <div className="flex justify-between mb-2 text-sm font-mono">
      <span className="text-gray-300">{label}</span>
      <span className={colorClass}>{value.toFixed(2)}</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className={`w-full h-2 bg-space-700 rounded-lg appearance-none cursor-pointer accent-${colorClass.split('-')[1]}-500 hover:bg-space-600 transition-colors`}
    />
  </div>
);

const Controls: React.FC<ControlsProps> = ({ params, setParams }) => {
  const handleChange = (key: keyof SimulationParams, value: number) => {
    setParams(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="p-6 bg-space-800 rounded-xl border border-space-700 shadow-lg h-full">
      <h2 className="text-xl font-bold text-white mb-6 flex items-center">
        <span className="w-2 h-8 bg-neon-blue mr-3 rounded-full"></span>
        Lab Controls
      </h2>

      <Slider
        label="Particle Energy (E)"
        value={params.energy}
        min={0.1}
        max={10}
        step={0.1}
        onChange={(v) => handleChange('energy', v)}
        colorClass="text-neon-green"
      />

      <Slider
        label="Barrier Height (V₀)"
        value={params.barrierHeight}
        min={0}
        max={10}
        step={0.1}
        onChange={(v) => handleChange('barrierHeight', v)}
        colorClass="text-neon-red"
      />

      <Slider
        label="Barrier Width (L)"
        value={params.barrierWidth}
        min={0.2}
        max={4.0}
        step={0.1}
        onChange={(v) => handleChange('barrierWidth', v)}
        colorClass="text-neon-purple"
      />
      
      <div className="mt-8 p-4 bg-space-900 rounded border border-space-700">
        <h3 className="text-sm text-gray-400 mb-2 font-mono uppercase tracking-wider">Quick Presets</h3>
        <div className="flex gap-2">
          <button 
            onClick={() => setParams(p => ({ ...p, energy: 4, barrierHeight: 6, barrierWidth: 1.0 }))}
            className="flex-1 py-2 px-3 bg-space-700 hover:bg-space-600 text-xs rounded text-white transition"
          >
            Tunneling
          </button>
          <button 
            onClick={() => setParams(p => ({ ...p, energy: 7, barrierHeight: 5, barrierWidth: 1.5 }))}
            className="flex-1 py-2 px-3 bg-space-700 hover:bg-space-600 text-xs rounded text-white transition"
          >
            Transmission
          </button>
           <button 
            onClick={() => setParams(p => ({ ...p, energy: 4, barrierHeight: 10, barrierWidth: 2.0 }))}
            className="flex-1 py-2 px-3 bg-space-700 hover:bg-space-600 text-xs rounded text-white transition"
          >
            Block
          </button>
        </div>
      </div>
    </div>
  );
};

export default Controls;