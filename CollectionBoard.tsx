
import React, { useMemo, useState, useEffect } from 'react';
import { MUSEUMS, REASONS_WHY_I_LOVE_YOU } from './constants';
import { Haptics } from './haptics';

interface CollectionBoardProps {
  spinHistory: string[];
  scheduledDates: Record<number, string>;
  voiceRecordings: Record<number, string>;
  onBack: () => void;
  onItemClick: (type: 'win' | 'reason', id: number) => void;
}

const CollectionBoard: React.FC<CollectionBoardProps> = ({ spinHistory, scheduledDates, voiceRecordings, onBack, onItemClick }) => {
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>('default');
  const [isTesting, setIsTesting] = useState(false);
  const [swStatus, setSwStatus] = useState<'checking' | 'active' | 'missing'>('checking');

  useEffect(() => {
    if ('Notification' in window) {
      setNotifPermission(Notification.permission);
    }
    
    // Check if Service Worker is actually ready
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(() => setSwStatus('active')).catch(() => setSwStatus('missing'));
    } else {
      setSwStatus('missing');
    }
  }, []);

  const requestNotifications = async () => {
    if (!('Notification' in window)) {
      alert("This device is shielded from external frequencies. (Browser doesn't support Notifications)");
      return;
    }

    if (swStatus !== 'active') {
      alert("Resonance Engine is still warming up. Please wait a moment or restart the app.");
      return;
    }
    
    Haptics.selection();
    try {
      const permission = await Notification.requestPermission();
      setNotifPermission(permission);
      if (permission === 'granted') {
        Haptics.notificationSuccess();
      } else if (permission === 'denied') {
        alert("Link Blocked. Please enable notifications for Elysium in your iPhone Settings > Notifications.");
      }
    } catch (e) {
      console.error("Permission error", e);
    }
  };

  const triggerTestNotification = (delay: boolean = true) => {
    if (notifPermission !== 'granted') {
      alert("You must Establish Link first.");
      return;
    }
    
    setIsTesting(true);
    Haptics.impactHeavy();
    
    const send = () => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(registration => {
          registration.showNotification('Elysium', {
            body: 'Nepamiršk, kad myliu tave.',
            icon: 'https://images.unsplash.com/photo-1514306191717-452ec28c7814?q=80&w=192&h=192&auto=format&fit=crop',
            vibrate: [200, 100, 200],
            tag: 'test'
          } as any);
          setIsTesting(false);
        });
      }
    };

    if (delay) {
      // 5 second delay to let the user lock the screen
      setTimeout(send, 5000);
    } else {
      send();
    }
  };

  const vaultGrid = useMemo(() => {
    const grid = new Array(25).fill(null);
    spinHistory.forEach((entry, idx) => {
      const parts = entry.split(':');
      const type = parts[0];
      const itemId = parseInt(parts[1]);
      const day = spinHistory.length - idx;
      if (type === 'WIN') {
        const m = MUSEUMS.find( museum => museum.id === itemId);
        grid[day - 1] = { type: 'win', itemId, title: m?.name, image: m?.image };
      } else {
        grid[day - 1] = { type: 'reason', itemId, content: REASONS_WHY_I_LOVE_YOU[itemId], hasVoice: !!voiceRecordings[itemId] };
      }
    });
    return grid;
  }, [spinHistory, voiceRecordings]);

  return (
    <div className="relative z-10 w-full min-h-screen bg-black pt-safe pb-24 overflow-x-hidden">
      <header className="sticky top-0 z-[100] bg-black/90 backdrop-blur-3xl p-6 flex justify-between items-center border-b border-white/5">
        <h2 className="text-[10px] uppercase tracking-[0.8em] text-white/30 font-bold">Memory Vault</h2>
        <button onClick={onBack} className="px-6 py-2 glass rounded-full text-[8px] uppercase tracking-widest text-white active:scale-95 transition-all">Return</button>
      </header>

      <div className="p-6 space-y-8">
        {/* Diagnostic Frequency Sync Card */}
        <section className="p-8 glass rounded-[40px] border-white/10 relative overflow-hidden">
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4 justify-center">
                <div className={`w-1.5 h-1.5 rounded-full ${swStatus === 'active' ? 'bg-emerald-500 shadow-[0_0_8px_emerald]' : 'bg-red-500 shadow-[0_0_8px_red]'}`}></div>
                <span className="text-[7px] uppercase tracking-widest text-white/20">
                  {swStatus === 'active' ? 'Engine Online' : 'Engine Offline'}
                </span>
              </div>
              <h3 className="text-[9px] uppercase tracking-[0.6em] text-white/40 mb-2">Frequency Synchronization</h3>
              <p className="text-xl font-serif italic text-white/90">"Nepamiršk, kad myliu tave."</p>
            </div>

            <p className="text-[10px] text-white/40 leading-relaxed mb-8 max-w-[240px]">
              {notifPermission === 'denied' 
                ? "Resonance Blocked. Enable notifications in your iPhone system settings to proceed." 
                : "The heavens will whisper to you at unpredictable moments."}
            </p>

            <div className="flex flex-col gap-3 w-full max-w-[200px]">
              {notifPermission !== 'granted' ? (
                <button 
                  onClick={requestNotifications}
                  className="w-full py-4 bg-white text-black text-[9px] uppercase tracking-widest font-bold rounded-full active:scale-95 transition-all shadow-xl"
                >
                  Establish Link
                </button>
              ) : (
                <>
                  <div className="py-3 px-6 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-[8px] uppercase tracking-widest flex items-center justify-center gap-2">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Link Active
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => triggerTestNotification(true)}
                      disabled={isTesting}
                      className="flex-1 text-[8px] uppercase tracking-[0.4em] text-white/30 hover:text-white transition-all py-3 glass rounded-xl border-white/5"
                    >
                      {isTesting ? 'Locked...' : 'Test (Lock Screen)'}
                    </button>
                    <button 
                      onClick={() => triggerTestNotification(false)}
                      className="flex-1 text-[8px] uppercase tracking-[0.4em] text-white/30 hover:text-white transition-all py-3 glass rounded-xl border-white/5"
                    >
                      Instant
                    </button>
                  </div>
                  <p className="text-[7px] text-white/20 mt-2 uppercase tracking-widest">Wait 5s after clicking Test</p>
                </>
              )}
            </div>
          </div>
        </section>

        <div className="grid grid-cols-2 gap-4">
          {vaultGrid.map((item, idx) => (
            <div 
              key={idx} 
              onClick={() => item && onItemClick(item.type, item.itemId)} 
              className={`relative rounded-[32px] border border-white/5 flex flex-col items-center justify-center overflow-hidden min-h-[160px] transition-all duration-700 ${!item ? 'bg-white/[0.01] opacity-10' : 'cursor-pointer hover:bg-white/5 bg-white/[0.02]'}`}
            >
              {!item ? (
                <span className="text-[7px] font-mono text-white/40 tracking-widest uppercase">Locked</span>
              ) : (
                item.type === 'win' ? (
                  <div className="absolute inset-0 w-full h-full group">
                    <img src={item.image} className="w-full h-full object-cover grayscale brightness-[0.3] group-hover:brightness-50 transition-all duration-1000" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent flex items-end p-5">
                       <span className="text-[8px] uppercase tracking-widest text-white/60 font-medium">{item.title}</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 flex flex-col items-center gap-4">
                    <div className={`w-1 h-1 rounded-full ${item.hasVoice ? 'bg-white shadow-[0_0_8px_white]' : 'bg-white/10'}`}></div>
                    <p className="text-[10px] italic text-center text-white/40 leading-relaxed font-serif">
                      "{item.content.substring(0, 45)}..."
                    </p>
                  </div>
                )
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CollectionBoard;
