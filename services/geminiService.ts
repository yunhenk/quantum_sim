import { GoogleGenAI } from "@google/genai";
import { SimulationParams } from "../types";

// Initialize API client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const streamPhysicsExplanation = async (
  params: SimulationParams, 
  transmissionProb: number,
  userQuestion?: string
) => {
  const modelId = 'gemini-2.5-flash';
  
  const systemPrompt = `
    You are a Quantum Physics Professor AI. You are helpful, concise, and excellent at explaining complex topics to students.
    The user is looking at a 1D Quantum Tunneling simulation.
    
    Current Simulation Parameters:
    - Particle Energy (E): ${params.energy.toFixed(2)}
    - Barrier Potential (V0): ${params.barrierHeight.toFixed(2)}
    - Barrier Width (L): ${params.barrierWidth.toFixed(2)}
    - Particle Mass (m): ${params.mass.toFixed(2)}
    - Calculated Transmission Probability (T): ${(transmissionProb * 100).toFixed(4)}%

    Explain what is happening in the simulation. If T is low, explain why the barrier is stopping the particle.
    If T is high, explain how the particle tunnels or passes over.
    If Energy > Potential, explain it's scattering/transmission, not tunneling.
    If Energy < Potential, explain it is Quantum Tunneling (classically impossible).
    
    Keep the response visually structured with Markdown. Use LaTeX for math if needed (e.g. $E < V_0$).
    Keep it brief (under 200 words) unless asked a specific detailed question.
  `;

  const userMessage = userQuestion || "Explain the current state of the simulation.";

  try {
    const response = await ai.models.generateContentStream({
      model: modelId,
      contents: [
        { role: 'user', parts: [{ text: systemPrompt + "\n\nUser Question: " + userMessage }] }
      ],
      config: {
        temperature: 0.7,
      }
    });
    return response;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};