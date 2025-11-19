export interface SimulationParams {
  energy: number;       // Particle Energy (E)
  barrierHeight: number;// Potential Barrier Height (V0)
  barrierWidth: number; // Width of barrier (L)
  mass: number;         // Particle Mass (m)
}

export interface WaveCoefficients {
  r: { re: number; im: number };     // Reflection coefficient
  t: { re: number; im: number };     // Transmission coefficient
  c1: { re: number; im: number };    // Barrier coeff 1
  c2: { re: number; im: number };    // Barrier coeff 2
  k1: number;
  k2: number; // or kappa if tunneling
  isTunneling: boolean;
  transmissionProb: number;
}

export enum ChatRole {
  USER = 'user',
  MODEL = 'model'
}

export interface ChatMessage {
  role: ChatRole;
  text: string;
}