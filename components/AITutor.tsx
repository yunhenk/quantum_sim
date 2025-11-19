import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, ChatRole, SimulationParams } from '../types';
import { streamPhysicsExplanation } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

interface AITutorProps {
  params: SimulationParams;
  transmissionProb: number;
}

const AITutor: React.FC<AITutorProps> = ({ params, transmissionProb }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleAnalyze = async () => {
    setIsLoading(true);
    const userMsg: ChatMessage = { role: ChatRole.USER, text: "Analyze current simulation state" };
    setMessages(prev => [...prev, userMsg]);
    
    try {
      const stream = await streamPhysicsExplanation(params, transmissionProb);
      
      let fullResponse = "";
      const modelMsg: ChatMessage = { role: ChatRole.MODEL, text: "" };
      setMessages(prev => [...prev, modelMsg]); // Placeholder

      for await (const chunk of stream) {
          const chunkText = chunk.text || "";
          fullResponse += chunkText;
          setMessages(prev => {
             const newHistory = [...prev];
             newHistory[newHistory.length - 1].text = fullResponse;
             return newHistory;
          });
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: ChatRole.MODEL, text: "Error connecting to the Quantum Network." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    const currentInput = input;
    setInput('');
    setIsLoading(true);
    
    const userMsg: ChatMessage = { role: ChatRole.USER, text: currentInput };
    setMessages(prev => [...prev, userMsg]);

    try {
      const stream = await streamPhysicsExplanation(params, transmissionProb, currentInput);
       let fullResponse = "";
       const modelMsg: ChatMessage = { role: ChatRole.MODEL, text: "" };
       setMessages(prev => [...prev, modelMsg]);

      for await (const chunk of stream) {
          const chunkText = chunk.text || "";
          fullResponse += chunkText;
           setMessages(prev => {
             const newHistory = [...prev];
             newHistory[newHistory.length - 1].text = fullResponse;
             return newHistory;
          });
      }
    } catch (err) {
        setMessages(prev => [...prev, { role: ChatRole.MODEL, text: "Error connecting to AI." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-space-800 rounded-xl border border-space-700 shadow-lg overflow-hidden">
      <div className="p-4 border-b border-space-700 bg-space-900 flex justify-between items-center">
        <h2 className="text-lg font-bold text-neon-purple flex items-center">
           <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
           AI Physics Tutor
        </h2>
        <button 
          onClick={handleAnalyze}
          disabled={isLoading}
          className="text-xs bg-neon-blue/20 text-neon-blue hover:bg-neon-blue/30 px-3 py-1 rounded transition"
        >
          Analyze Now
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-space-800">
        {messages.length === 0 && (
            <div className="text-center text-gray-500 mt-10">
                <p>Ask me about Quantum Tunneling!</p>
                <p className="text-xs mt-2">Try changing parameters and clicking "Analyze Now".</p>
            </div>
        )}
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === ChatRole.USER ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3 rounded-lg text-sm ${
              msg.role === ChatRole.USER 
                ? 'bg-space-700 text-white rounded-br-none' 
                : 'bg-space-900 text-gray-200 border border-space-700 rounded-bl-none'
            }`}>
              <ReactMarkdown 
                remarkPlugins={[remarkMath]} 
                rehypePlugins={[rehypeKatex]}
                components={{
                    p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                    code: ({node, ...props}) => <code className="bg-black/30 rounded px-1 text-neon-green" {...props} />
                }}
              >
                {msg.text}
              </ReactMarkdown>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-space-700 bg-space-900">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Why does the wave decay?"
            className="flex-1 bg-space-800 border border-space-700 rounded px-4 py-2 text-sm text-white focus:outline-none focus:border-neon-purple transition"
            disabled={isLoading}
          />
          <button 
            type="submit" 
            disabled={isLoading}
            className="bg-neon-purple hover:bg-purple-600 text-white px-4 py-2 rounded text-sm font-bold transition disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default AITutor;