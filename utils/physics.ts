import { SimulationParams, WaveCoefficients } from '../types';

// Using complex number arithmetic helpers since JS doesn't have built-in Complex types
interface Complex { re: number; im: number }

const add = (a: Complex, b: Complex): Complex => ({ re: a.re + b.re, im: a.im + b.im });
const sub = (a: Complex, b: Complex): Complex => ({ re: a.re - b.re, im: a.im - b.im });
const mul = (a: Complex, b: Complex): Complex => ({ re: a.re * b.re - a.im * b.im, im: a.re * b.im + a.im * b.re });
const div = (a: Complex, b: Complex): Complex => {
  const denom = b.re * b.re + b.im * b.im;
  if (denom === 0) return { re: 0, im: 0 }; // Safety guard
  return {
    re: (a.re * b.re + a.im * b.im) / denom,
    im: (a.im * b.re - a.re * b.im) / denom
  };
};
const exp = (a: Complex): Complex => {
  const ea = Math.exp(a.re);
  return { re: ea * Math.cos(a.im), im: ea * Math.sin(a.im) };
};

// Simplified solver for 1D Rectangular Barrier
export const solveSchrodinger = (params: SimulationParams): WaveCoefficients => {
  let { energy: E, barrierHeight: V0, barrierWidth: L, mass: m } = params;
  
  // Avoid numerical singularity at E = V0
  if (Math.abs(E - V0) < 1e-4) {
    E += 1e-3;
  }

  // Constants (normalized for visualization)
  const hbar = 1; 

  // Region 1 & 3 Wave vector
  const k1 = Math.sqrt(2 * m * E) / hbar;

  let r: Complex, t: Complex, c1: Complex, c2: Complex;
  let k2 = 0; // Wave vector or decay constant inside barrier
  let isTunneling = false;
  let T_prob = 0;

  if (E < V0) {
    // Tunneling case (E < V0)
    isTunneling = true;
    const kappa = Math.sqrt(2 * m * (V0 - E)) / hbar;
    k2 = kappa; // Storing kappa in k2 variable for simplicity

    // T = 1 / (1 + (V0^2 * sinh^2(kappa * L)) / (4 * E * (V0 - E)))
    const term = (V0 * V0 * Math.pow(Math.sinh(kappa * L), 2)) / (4 * E * (V0 - E));
    T_prob = 1 / (1 + term);

    // Denominator D
    const kappaL = kappa * L;
    const coshKL = Math.cosh(kappaL);
    const sinhKL = Math.sinh(kappaL);
    const gamma = (k1*k1 - kappa*kappa) / (2*k1*kappa);
    
    // D = cosh(kL) - i * gamma * sinh(kL)
    const D: Complex = { re: coshKL, im: -gamma * sinhKL };
    
    // t = e^{-i k1 L} / D
    const num: Complex = { re: Math.cos(-k1 * L), im: Math.sin(-k1 * L) };
    t = div(num, D);
    
    // r calculation
    const gamma_plus = (kappa*kappa + k1*k1) / (2*k1*kappa);
    const r_num: Complex = { re: 0, im: gamma_plus * sinhKL };
    r = div(r_num, D);

    // Inside coefficients c1, c2 (psi = c1 e^-kx + c2 e^kx)
    const onePlusR = add({re: 1, im: 0}, r);
    const term2 = mul({re: 0, im: k1/kappa}, sub({re:1, im:0}, r)); // i(k1/kappa)(1-r)
    
    const twoC2 = add(onePlusR, term2);
    const twoC1 = sub(onePlusR, term2);
    
    c2 = { re: twoC2.re / 2, im: twoC2.im / 2 };
    c1 = { re: twoC1.re / 2, im: twoC1.im / 2 };

  } else {
    // Scattering case (E > V0)
    isTunneling = false;
    const k_prime = Math.sqrt(2 * m * (E - V0)) / hbar; // This is real k inside
    k2 = k_prime;

    // Transmission Probability
    if (k_prime === 0) {
        T_prob = 0; 
    } else {
        const term = (V0 * V0 * Math.pow(Math.sin(k_prime * L), 2)) / (4 * E * (E - V0));
        T_prob = 1 / (1 + term);
    }
    
    // Coefficients
    const kL = k_prime * L;
    const cosKL = Math.cos(kL);
    const sinKL = Math.sin(kL);
    const gamma = (k1*k1 + k_prime*k_prime) / (2*k1*k_prime);
    
    // D = cos(k'L) - i * gamma * sin(k'L)
    const D: Complex = { re: cosKL, im: -gamma * sinKL };
    
    // t = e^{-i k1 L} / D
    const num_t: Complex = { re: Math.cos(-k1 * L), im: Math.sin(-k1 * L) };
    t = div(num_t, D);
    
    // r = i * gamma_minus * sin(k'L) / D
    const gamma_minus = (k1*k1 - k_prime*k_prime) / (2*k1*k_prime);
    const num_r: Complex = { re: 0, im: gamma_minus * sinKL };
    r = div(num_r, D);
    
    // Inside: c1 e^{ik'x} + c2 e^{-ik'x}
    const term2 = mul({re: k1/k_prime, im: 0}, sub({re:1, im:0}, r));
    const onePlusR = add({re: 1, im: 0}, r);
    
    const twoC1 = add(onePlusR, term2);
    const twoC2 = sub(onePlusR, term2);
    
    c1 = { re: twoC1.re / 2, im: twoC1.im / 2 };
    c2 = { re: twoC2.re / 2, im: twoC2.im / 2 };
  }

  return { r, t, c1, c2, k1, k2, isTunneling, transmissionProb: T_prob };
};

export const getWaveFunctionAt = (x: number, time: number, params: SimulationParams, coeffs: WaveCoefficients): { real: number, prob: number, V: number } => {
  const { k1, k2, r, t, c1, c2, isTunneling } = coeffs;
  const { barrierWidth: L, barrierHeight: V0, energy: E } = params;
  
  // Time evolution factor e^{-iEt/hbar}
  const omega = E; // hbar=1
  const timePhase: Complex = { re: Math.cos(-omega * time), im: Math.sin(-omega * time) };
  
  let psi: Complex = { re: 0, im: 0 };
  let V = 0;

  if (x < 0) {
    // Region 1: e^{ik1 x} + r e^{-ik1 x}
    const inc: Complex = { re: Math.cos(k1 * x), im: Math.sin(k1 * x) };
    const refArg = -k1 * x;
    const refPart = mul(r, { re: Math.cos(refArg), im: Math.sin(refArg) });
    psi = add(inc, refPart);
    V = 0;
  } else if (x >= 0 && x <= L) {
    // Region 2
    V = V0;
    if (isTunneling) {
      // c1 e^{-kappa x} + c2 e^{kappa x}
      const term1 = mul(c1, { re: Math.exp(-k2 * x), im: 0 });
      const term2 = mul(c2, { re: Math.exp(k2 * x), im: 0 });
      psi = add(term1, term2);
    } else {
      // c1 e^{ik'x} + c2 e^{-ik'x}
      const arg1 = k2 * x;
      const term1 = mul(c1, { re: Math.cos(arg1), im: Math.sin(arg1) });
      const arg2 = -k2 * x;
      const term2 = mul(c2, { re: Math.cos(arg2), im: Math.sin(arg2) });
      psi = add(term1, term2);
    }
  } else {
    // Region 3: t e^{ik1 x}
    // Standard derivation assumes incident from left.
    const arg = k1 * x; 
    const transPart = mul(t, { re: Math.cos(arg), im: Math.sin(arg) });
    psi = transPart;
    V = 0;
  }

  // Apply time dependence
  const psiT = mul(psi, timePhase);

  return {
    real: psiT.re,
    prob: psiT.re * psiT.re + psiT.im * psiT.im,
    V
  };
};