
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { GameView, UserState, Prize } from './types';
import { MUSEUMS, REASONS_WHY_I_LOVE_YOU, RIDDLES, CONTACT_CONFIG } from './constants';
import { loadState, saveState, canSpinToday, getCurrentJourneyDay } from './storage';
import { Haptics } from './haptics';

import BackgroundVideo from './BackgroundVideo';
import WheelOfFortune from './WheelOfFortune';
import CollectionBoard from './CollectionBoard';
import VoiceEchoScreen from './VoiceEchoScreen';
import MuseumScheduler from './MuseumScheduler';
import BackgroundMusic, { BackgroundMusicRef } from './BackgroundMusic';
import AIReasonAssistant from './AIReasonAssistant';
import RecordingStudio from './RecordingStudio';

const SCHEDULE: Record<number, { type: 'relic' | 'echo', id: number }> = {
  1: { type: 'relic', id: 1 }, 2: { type: 'echo', id: 0 }, 3: { type: 'echo', id: 1 }, 4: { type: 'echo', id: 2 },
  5: { type: 'echo', id: 3 }, 6: { type: 'echo', id: 4 }, 7: { type: 'relic', id: 2 }, 8: { type: 'echo', id: 5 },
  9: { type: 'echo', id: 6 }, 10: { type: 'echo', id: 7 }, 11: { type: 'echo', id: 8 }, 12: { type: 'echo', id: 9 },
  13: { type: 'relic', id: 3 }, 14: { type: 'echo', id: 10 }, 15: { type: 'echo', id: 11 }, 16: { type: 'echo', id: 12 },
  17: { type: 'echo', id: 13 }, 18: { type: 'echo', id: 14 }, 19: { type: 'relic', id: 4 }, 20: { type: 'echo', id: 15 },
  21: { type: 'echo', id: 16 }, 22: { type: 'echo', id: 17 }, 23: { type: 'echo', id: 18 }, 24: { type: 'echo', id: 19 },
  25: { type: 'relic', id: 5 }
};

const App: React.FC = () => {
  const [state, setState] = useState<UserState>(loadState());
  const [view, setView] = useState<GameView>(GameView.LOGIN);
  const [riddleInput, setRiddleInput] = useState('');
  const [isWrongAnswer, setIsWrongAnswer] = useState(false);
  const [currentWin, setCurrentWin] = useState<Prize | null>(null);
  const [currentReasonId, setCurrentReasonId] = useState<number | null>(null);
  const [isHoldingPulse, setIsHoldingPulse] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [isFromArchive, setIsFromArchive] = useState(false);
  const [mediaUnlocked, setMediaUnlocked] = useState(false);
  
  const [debugMode, setDebugMode] = useState(false); 
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [debugClicks, setDebugClicks] = useState(0);

  const musicRef = useRef<BackgroundMusicRef>(null);
  
  const journeyDay = useMemo(() => getCurrentJourneyDay(state), [state.spinHistory]);
  const isComplete = state.spinHistory.length >= 25;
  const canSpin = useMemo(() => canSpinToday(state), [state.lastSpinDate, state.spinHistory.length]);

  const currentRiddle = useMemo(() => {
    if (isComplete) return { question: "The vault is open. The memories are yours forever.", answer: "always" };
    const index = (journeyDay - 1) % RIDDLES.length;
    return RIDDLES[index];
  }, [journeyDay, isComplete]);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const progress = debugMode ? 1.0 : Math.min(state.spinHistory.length / 25, 1);

  useEffect(() => {
    if (state.isLoggedIn) {
      setView(state.hasSeenIntro ? GameView.WHEEL : GameView.INTRO);
    }
  }, []);

  const unlockMedia = () => {
    if (mediaUnlocked) return;
    setMediaUnlocked(true);
    if (musicRef.current) {
      musicRef.current.unlock();
    }
    Haptics.impactHeavy();
  };

  // Aggressive unlock for iOS Safari
  useEffect(() => {
    const handleTouch = () => {
      unlockMedia();
      window.removeEventListener('touchstart', handleTouch);
      window.removeEventListener('mousedown', handleTouch);
    };
    window.addEventListener('touchstart', handleTouch, { passive: false });
    window.addEventListener('mousedown', handleTouch);
    return () => {
      window.removeEventListener('touchstart', handleTouch);
      window.removeEventListener('mousedown', handleTouch);
    };
  }, [mediaUnlocked]);

  const handleRiddleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    unlockMedia(); 
    const input = riddleInput.toLowerCase().trim();
    if (input === currentRiddle.answer || (isComplete && input.length > 0)) {
      Haptics.notificationSuccess();
      setState(prev => ({ ...prev, isLoggedIn: true }));
      setView(state.hasSeenIntro ? GameView.WHEEL : GameView.INTRO);
    } else {
      setIsWrongAnswer(true);
      Haptics.notificationError();
      setTimeout(() => {
        setIsWrongAnswer(false);
        setRiddleInput('');
      }, 500);
    }
  };

  const handleDebugClick = () => {
    setDebugClicks(prev => {
      const next = prev + 1;
      if (next >= 5) {
        setDebugMode(!debugMode);
        Haptics.impactHeavy();
        return 0;
      }
      return next;
    });
  };

  const handleSpinComplete = () => {
    const day = journeyDay;
    const reward = SCHEDULE[day] || { type: 'echo', id: 0 };
    const now = new Date().toISOString();
    setIsFromArchive(false);
    Haptics.notificationSuccess();

    if (reward.type === 'relic') {
      const prize = MUSEUMS.find(m => m.id === reward.id)!;
      setCurrentWin(prize);
      setState(prev => ({
        ...prev,
        lastSpinDate: now,
        spinHistory: [`WIN:${prize.id}:${now}`, ...prev.spinHistory],
        collectedPrizes: Array.from(new Set([...prev.collectedPrizes, prize.id]))
      }));
      setTimeout(() => setView(GameView.WIN_SCREEN), 1000);
    } else {
      setCurrentReasonId(reward.id);
      setState(prev => ({
        ...prev,
        lastSpinDate: now,
        spinHistory: [`LOSS:${reward.id}:${now}`, ...prev.spinHistory],
        collectedReasons: Array.from(new Set([...prev.collectedReasons, reward.id]))
      }));
      setTimeout(() => setView(GameView.VOICE_ECHO), 1000);
    }
  };

  const saveRecording = (id: number, base64: string) => {
    setState(prev => ({
      ...prev,
      voiceRecordings: { ...prev.voiceRecordings, [id]: base64 }
    }));
  };

  const handleScheduleDate = (date: Date) => {
    if (!currentWin) return;
    const dateIso = date.toISOString();
    Haptics.selection();
    setState(prev => ({
      ...prev,
      scheduledDates: { ...prev.scheduledDates, [currentWin.id]: dateIso }
    }));
    setIsScheduling(false);
    const text = `I would like to request the tickets to *${currentWin.name}* on the date of *${date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}*.\n\nPlease prepare the entry.\n\nLove.`;
    window.open(`https://wa.me/${CONTACT_CONFIG.phone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <main className={`min-h-[100dvh] w-full relative bg-black text-white ${view === GameView.COLLECTION || view === GameView.RECORDING_STUDIO ? 'overflow-y-auto' : 'h-[100dvh] overflow-hidden touch-none'} transition-all duration-1000`}>
      <BackgroundVideo progress={progress} forcePlay={mediaUnlocked} />
      <BackgroundMusic 
        ref={musicRef} 
        progress={progress} 
        shouldPlay={mediaUnlocked} 
        isDucked={isHoldingPulse} 
      />

      {view === GameView.LOGIN && (
        <div className="relative z-10 flex flex-col items-center justify-start h-full p-6 pt-safe pb-safe">
          <div className={`w-full max-w-sm flex flex-col items-center mt-[15vh] ${isWrongAnswer ? 'animate-shake' : 'animate-fade-in'}`}>
            <p onClick={handleDebugClick} className="text-xl md:text-2xl font-serif text-white/90 mb-12 text-center leading-relaxed px-6 italic cursor-default select-none transition-colors duration-500">
              "{currentRiddle.question}"
            </p>
            <form onSubmit={handleRiddleSubmit} className="flex flex-col items-center w-full">
              <div className="w-full max-w-[200px] relative mb-12 group">
                <input 
                  type="text" 
                  autoFocus 
                  inputMode="text" 
                  autoComplete="off" 
                  value={riddleInput} 
                  onChange={(e) => { setRiddleInput(e.target.value); }} 
                  className="w-full bg-transparent text-center text-2xl tracking-[0.6em] focus:outline-none font-light text-white transition-all placeholder:opacity-0" 
                  style={{ WebkitTextSecurity: 'disc' } as any} 
                />
                <div className="absolute -bottom-2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
              </div>
              <button type="submit" className={`text-[10px] uppercase tracking-[0.6em] py-4 px-10 rounded-full border border-white/20 glass transition-all duration-700 ${riddleInput.length > 0 ? 'opacity-100 active:scale-95 shadow-lg' : 'opacity-0 translate-y-4 pointer-events-none'}`}>Authorize</button>
            </form>
          </div>
        </div>
      )}

      {view === GameView.INTRO && (
        <div className="relative z-10 flex flex-col items-center justify-center h-full p-8 max-w-lg mx-auto pt-safe pb-safe">
          <div className="flex flex-col items-center gap-16 animate-fade-in">
            <div className="space-y-12 text-center px-6">
              <p className="text-xl md:text-2xl font-serif italic leading-relaxed text-white/70">I built this world because I couldn't carry our future in just a thought.</p>
              <p className="text-[11px] font-light leading-relaxed text-white/40 tracking-[0.15em] max-w-[280px] mx-auto">Every spin, the heavens shift. They offer <span className="text-white/60">Relics</span> of where we go and <span className="text-white/60">Echoes</span> of why you are my home.</p>
            </div>
            <button onClick={() => { Haptics.selection(); setState(prev => ({ ...prev, hasSeenIntro: true, startDate: new Date().toISOString() })); setView(GameView.WHEEL); }} className="px-10 py-3.5 glass rounded-full text-[9px] uppercase tracking-[0.6em] text-white/40 hover:text-white transition-all duration-700 border-white/10 active:scale-95 shadow-xl">Begin</button>
          </div>
        </div>
      )}

      {view === GameView.WHEEL && (
        <div className="relative z-10 flex flex-col items-center justify-center h-full p-6 pt-safe pb-safe animate-fade-in">
          <div className="mb-10 text-center flex flex-col items-center">
             <h2 className="text-3xl md:text-5xl font-serif text-white">{isComplete ? "Legacy Secured" : `Sequence ${state.spinHistory.length + 1}`}</h2>
             <p className="text-[8px] uppercase tracking-[0.8em] text-white/20 mt-4 font-mono">
              {isComplete ? "System Offline — Archive Active" : canSpin ? "Consulting Probabilities..." : "Atmosphere Recharging..."}
             </p>
          </div>

          <div className="relative flex items-center justify-center">
             <WheelOfFortune onSpinComplete={handleSpinComplete} canSpin={canSpin} forceWinType={SCHEDULE[journeyDay]?.type || 'echo'} />
          </div>
          
          {!canSpin && !isComplete && (
            <div className="mt-12 flex flex-col items-center animate-fade-in w-full">
              <div className="h-px w-12 bg-white/10 mb-6"></div>
              <p className="text-[8px] uppercase tracking-[0.4em] text-white/50 text-center max-w-[280px] leading-loose px-4">
                The next sequence will be available <br/> when a new light emerges tomorrow.
              </p>
            </div>
          )}

          <div className="mt-14 flex flex-col items-center gap-6">
            <button onClick={() => { Haptics.selection(); setView(GameView.COLLECTION); }} className="text-[10px] uppercase tracking-[0.6em] text-white/60 hover:text-white transition-all font-light py-4 px-10 glass rounded-full shadow-2xl">Access Archive</button>
          </div>
        </div>
      )}

      {view === GameView.RECORDING_STUDIO && (
        <RecordingStudio 
          recordings={state.voiceRecordings} 
          onSave={saveRecording} 
          onBack={() => setView(GameView.WHEEL)} 
        />
      )}

      {view === GameView.VOICE_ECHO && currentReasonId !== null && (
        <VoiceEchoScreen 
          id={currentReasonId}
          text={REASONS_WHY_I_LOVE_YOU[currentReasonId]} 
          existingAudio={state.voiceRecordings[currentReasonId]}
          onHoldingChange={setIsHoldingPulse}
          onSaveAudio={(base64) => saveRecording(currentReasonId, base64)}
          onClose={() => { setIsHoldingPulse(false); setView(isFromArchive ? GameView.COLLECTION : GameView.WHEEL); }} 
        />
      )}

      {view === GameView.WIN_SCREEN && currentWin && (
        <div className="relative z-20 flex flex-col items-center justify-center min-h-[100dvh] p-6 pt-safe pb-safe animate-fade-in bg-black/90 backdrop-blur-3xl">
          <div className="max-w-sm w-full glass p-8 rounded-[40px] text-center shadow-[0_0_100px_rgba(255,255,255,0.03)] border border-white/20">
             <div className="aspect-[1/1] w-full rounded-[28px] overflow-hidden mb-8 shadow-2xl">
                <img src={currentWin.image} className="w-full h-full object-cover grayscale brightness-90" alt={currentWin.name} />
             </div>
             <h2 className="text-3xl font-serif mb-3 text-white">{currentWin.name}</h2>
             {state.scheduledDates[currentWin.id] && (
               <div className="mb-6 bg-white/[0.03] py-4 rounded-2xl border border-white/10">
                 <p className="text-[7px] uppercase tracking-[0.5em] text-white/30 mb-1">Authorization Confirmed</p>
                 <p className="text-sm text-white/90 font-serif">{new Date(state.scheduledDates[currentWin.id]).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
               </div>
             )}
             <p className="text-[13px] text-white/50 mb-10 leading-relaxed font-light italic px-4">"{currentWin.description}"</p>
             <div className="flex flex-col gap-4">
               <button onClick={() => { Haptics.selection(); setIsScheduling(true); }} className="w-full bg-white text-black text-[10px] uppercase tracking-[0.6em] py-4 rounded-full font-bold active:scale-95 transition-all">{state.scheduledDates[currentWin.id] ? "Reschedule" : "Plan Trip"}</button>
               <button onClick={() => { Haptics.selection(); setView(isFromArchive ? GameView.COLLECTION : GameView.WHEEL); }} className="text-[9px] uppercase tracking-[0.5em] text-white/20 hover:text-white transition-all py-2">Return</button>
             </div>
          </div>
          {isScheduling && <MuseumScheduler museumName={currentWin.name} selectedDate={state.scheduledDates[currentWin.id]} onSelect={handleScheduleDate} onCancel={() => setIsScheduling(false)} />}
        </div>
      )}

      {view === GameView.COLLECTION && (
        <div className="absolute inset-0 z-50 bg-black animate-in fade-in duration-500 overflow-y-auto">
          <CollectionBoard 
            spinHistory={state.spinHistory} 
            scheduledDates={state.scheduledDates}
            voiceRecordings={state.voiceRecordings}
            onBack={() => { Haptics.selection(); setView(GameView.WHEEL); }} 
            onItemClick={(type, id) => {
              Haptics.selection();
              setIsFromArchive(true);
              if (type === 'win') { 
                setCurrentWin(MUSEUMS.find(m => m.id === id)!); 
                setView(GameView.WIN_SCREEN); 
              } else { 
                setCurrentReasonId(id);
                setView(GameView.VOICE_ECHO); 
              }
            }}
          />
        </div>
      )}

      {debugMode && (
        <div className="fixed bottom-10 right-10 z-[250] flex flex-col gap-4">
          <button onClick={() => setView(GameView.RECORDING_STUDIO)} className="p-4 glass rounded-full text-[8px] uppercase tracking-widest text-emerald-500 font-bold border-emerald-500/20">Studio</button>
          <button onClick={() => setShowAIAssistant(true)} className="p-4 glass rounded-full text-[8px] uppercase tracking-widest text-white/40">AI</button>
          <button onClick={() => { if(confirm("Clear Progress?")) { localStorage.clear(); window.location.reload(); } }} className="p-4 glass rounded-full text-[8px] uppercase tracking-widest text-red-500/40">Reset</button>
        </div>
      )}

      {showAIAssistant && <AIReasonAssistant onClose={() => setShowAIAssistant(false)} />}
    </main>
  );
};

export default App;
