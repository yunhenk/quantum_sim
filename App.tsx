import React, { useState, useMemo } from 'react';
import QuantumCanvas from './components/QuantumCanvas';
import Controls from './components/Controls';
import AITutor from './components/AITutor';
import { SimulationParams } from './types';
import { solveSchrodinger } from './utils/physics';

const App: React.FC = () => {
  const [params, setParams] = useState<SimulationParams>({
    energy: 4.5,
    barrierHeight: 6.0,
    barrierWidth: 1.2,
    mass: 1.0,
  });

  // Recalculate coefficients whenever params change
  // This is fast enough to be synchronous
  const coeffs = useMemo(() => solveSchrodinger(params), [params]);

  return (
    <div className="min-h-screen bg-space-900 text-white font-sans selection:bg-neon-purple selection:text-white">
      {/* Header */}
      <header className="border-b border-space-700 bg-space-900/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-neon-blue to-neon-purple rounded-lg animate-pulse"></div>
            <h1 className="text-2xl font-bold tracking-tight">
              <span className="text-white">Quantum</span>
              <span className="text-neon-blue">Lab</span>
            </h1>
          </div>
          <div className="text-xs text-gray-400 hidden sm:block">
            Simulating Time-Independent Schrödinger Equation
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Visualization & Stats */}
          <div className="lg:col-span-8 space-y-6">
            {/* Visualization Card */}
            <QuantumCanvas params={params} coeffs={coeffs} />
            
            {/* Stats Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-space-800 p-4 rounded-xl border border-space-700">
                <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">Condition</div>
                <div className={`text-lg font-bold ${coeffs.isTunneling ? 'text-neon-purple' : 'text-neon-green'}`}>
                  {coeffs.isTunneling ? 'Tunneling' : 'Scattering'}
                </div>
              </div>
              <div className="bg-space-800 p-4 rounded-xl border border-space-700">
                <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">Transmission (T)</div>
                <div className="text-lg font-bold text-white">
                  {(coeffs.transmissionProb * 100).toFixed(2)}%
                </div>
              </div>
               <div className="bg-space-800 p-4 rounded-xl border border-space-700">
                <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">Reflection (R)</div>
                <div className="text-lg font-bold text-gray-300">
                  {((1 - coeffs.transmissionProb) * 100).toFixed(2)}%
                </div>
              </div>
               <div className="bg-space-800 p-4 rounded-xl border border-space-700">
                <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">Wavelength (λ)</div>
                <div className="text-lg font-bold text-neon-blue">
                  {(2 * Math.PI / coeffs.k1).toFixed(2)} u
                </div>
              </div>
            </div>

            {/* Legend/Info Area */}
            <div className="bg-space-800/50 p-6 rounded-xl border border-space-700 text-sm text-gray-300 leading-relaxed">
                <p className="mb-2">
                    <strong className="text-neon-blue">The Blue Line</strong> represents the real part of the wave function {'$\\text{Re}(\\psi)$'}, animating to show phase evolution.
                </p>
                <p className="mb-2">
                    <strong className="text-neon-purple">The Purple Area</strong> represents the Probability Density $|\psi|^2$. This shows where the particle is likely to be found. Note how it decays exponentially inside the barrier during tunneling.
                </p>
                 <p>
                    <strong className="text-neon-red">The Red Block</strong> is the Potential Barrier ($V_0$). When Particle Energy ($E$) is less than $V_0$, classical physics says transmission is impossible (0%). Quantum Mechanics allows it.
                </p>
            </div>
          </div>

          {/* Right Column: Controls & AI */}
          <div className="lg:col-span-4 space-y-6 h-[calc(100vh-8rem)] flex flex-col">
             <div className="flex-none">
                <Controls params={params} setParams={setParams} />
             </div>
             <div className="flex-1 min-h-0">
                <AITutor params={params} transmissionProb={coeffs.transmissionProb} />
             </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;