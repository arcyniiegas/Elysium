
import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Haptics } from '../utils/haptics';

interface AIReasonAssistantProps {
  onClose: () => void;
}

const AIReasonAssistant: React.FC<AIReasonAssistantProps> = ({ onClose }) => {
  const [prompt, setPrompt] = useState('');
  const [results, setResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const generateReasons = async () => {
    if (!prompt || isLoading) return;
    setIsLoading(true);
    Haptics.impactHeavy();

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `You are a cinematic noir poet. The user wants to generate "Reasons Why I Love You" for a romantic gift.
                  Context provided by user: "${prompt}"
                  Language: Lithuanian
                  Task: Generate 5 unique, short, atmospheric, and deeply romantic reasons (max 15 words each). 
                  Style: Noir, sophisticated, using metaphors of light, shadows, city, and time.
                  Format: Return as a simple JSON array of strings.`,
        config: {
          responseMimeType: "application/json"
        }
      });

      const data = JSON.parse(response.text || "[]");
      setResults(data);
      Haptics.notificationSuccess();
    } catch (e) {
      console.error(e);
      Haptics.notificationError();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] bg-black/90 backdrop-blur-2xl p-8 flex flex-col items-center justify-center animate-fade-in">
      <div className="w-full max-w-lg glass p-8 rounded-[40px] border-white/20">
        <h2 className="text-[10px] uppercase tracking-[0.8em] text-white/40 mb-8 text-center">Resonance Generator</h2>
        
        <p className="text-[12px] text-white/60 mb-6 text-center italic">
          Enter a memory or trait (e.g., "how she laughs at my jokes", "her love for old books") to distill it into noir fragments.
        </p>

        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter context..."
          className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-sm focus:outline-none focus:border-white/30 transition-all mb-6 h-24 resize-none"
        />

        <button
          onClick={generateReasons}
          disabled={isLoading || !prompt}
          className={`w-full py-4 rounded-full text-[10px] uppercase tracking-[0.6em] transition-all duration-500 ${
            isLoading ? 'bg-white/10 text-white/20' : 'bg-white text-black font-bold active:scale-95'
          }`}
        >
          {isLoading ? 'Distilling Memories...' : 'Generate Echoes'}
        </button>

        {results.length > 0 && (
          <div className="mt-8 space-y-4 animate-fade-in">
            {results.map((res, i) => (
              <div key={i} className="p-4 bg-white/5 rounded-xl border border-white/5 group relative">
                <p className="text-white/80 font-serif text-sm italic pr-8">{res}</p>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(res);
                    Haptics.selection();
                  }}
                  className="absolute top-4 right-4 text-white/20 hover:text-white transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 4H6a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2v-2M16 4h2a2 2 0 012 2v4M16 4v12" /></svg>
                </button>
              </div>
            ))}
            <p className="text-[8px] text-white/20 text-center uppercase tracking-widest mt-4">Tap icon to copy to clipboard</p>
          </div>
        )}

        <button onClick={onClose} className="w-full mt-8 text-[9px] uppercase tracking-[0.4em] text-white/30 hover:text-white transition-all">
          Exit Assistant
        </button>
      </div>
    </div>
  );
};

export default AIReasonAssistant;
