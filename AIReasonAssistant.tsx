
import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Haptics } from './haptics';

const AIReasonAssistant: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [prompt, setPrompt] = useState('');
  const [results, setResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const generate = async () => {
    setIsLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const res = await ai.models.generateContent({ model: 'gemini-3-pro-preview', contents: `Lithuanian romantic noir reasons: ${prompt}` });
      setResults([res.text || 'Error']);
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-[300] bg-black p-8 flex flex-col items-center justify-center">
      <textarea value={prompt} onChange={e => setPrompt(e.target.value)} className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-4 text-white mb-4" />
      <button onClick={generate} className="w-full py-4 bg-white text-black rounded-full font-bold">Generate</button>
      <button onClick={onClose} className="mt-8 text-white/30">Close</button>
    </div>
  );
};

export default AIReasonAssistant;
