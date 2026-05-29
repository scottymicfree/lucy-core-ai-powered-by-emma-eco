import { useAppStore } from './store';
import { AnimatePresence, motion } from 'framer-motion';
import { Send, X, MessageSquare, ShieldCheck } from 'lucide-react';
import { useState } from 'react';

export function ChatConsole() {
  const { isChatOpen, toggleChat, chatHistory, addMessage, addTerminalLog, addForgeFile, setDashboard, hotPotatoActive } = useAppStore();
  const [input, setInput] = useState('');

  // Atbash cipher or reverse string used to simulate Hot Potato keybind scrambling
  const applyHotPotatoScramble = (text: string) => {
     if (!hotPotatoActive || !text) return text;
     // Simple Atbash cipher (a<->z, b<->y) to simulate keyboard inversion
     return text.split('').map(c => {
        const code = c.charCodeAt(0);
        if (code >= 97 && code <= 122) return String.fromCharCode(122 - (code - 97)); // lowercase
        if (code >= 65 && code <= 90) return String.fromCharCode(90 - (code - 65));   // uppercase
        return c; // keep spaces / punctuation
     }).join('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     // If hot potato is active, intercept the user's typing and scramble it
     if (hotPotatoActive) {
        // We only want to scramble the new character added, so we process the whole string
        setInput(applyHotPotatoScramble(e.target.value));
     } else {
        setInput(e.target.value);
     }
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userText = input;
    setInput('');
    addMessage({ sender: 'user', text: userText });
    
    try {
      const res = await fetch('/api/intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload: userText, sender: 'user', type: 'INTENT_PROPOSAL' })
      });
      const data = await res.json();
      
      if (data.status === 'TERMINAL_ACTIVE' && data.terminal_payload) {
         addTerminalLog(data.terminal_payload);
      }
      
      if (data.status === 'CODE_GENERATED' && data.generated_code) {
         addForgeFile(data.generated_code);
         setDashboard('code-forge');
         addTerminalLog(`[+] CODE_WEAVER synthesized ${data.generated_code.name}`);
      }
      
      if (data.status === 'FIVEM_SEARCH') {
         addTerminalLog(`[+] FiveM Docs Synced: Absorbed latest native syntax.`);
      }

      if (data.status === 'TWIN_CITY_TRIGGERED') {
         setDashboard('twin-city');
      }

      if (data.status === 'TWIN_CITY_ADJUSTMENT' || data.status === 'GEO_MAP_GENERATION') {
         setDashboard('twin-city');
         if (data.tiles) {
            useAppStore.getState().setSelectedTiles(data.tiles);
         }
         addTerminalLog(data.status === 'GEO_MAP_GENERATION' ? '[+] Photogrammetry dataset ingested. Viewport shifted to target coordinates.' : '[+] Structural layout calculated and pushed to viewport.');
         
         if (data.status === 'GEO_MAP_GENERATION') {
            setTimeout(() => {
               addTerminalLog('[+] Autogenesis: Initiating full compilation pipeline automatically for requested region.');
               useAppStore.getState().setExportState({ isExporting: true, exportProgress: 10, exportLogs: ['[AUTOGENESIS] Initializing FiveM automated export pipeline from chat query...'] });
               
               setTimeout(() => {
                  useAppStore.getState().setExportState({ exportProgress: 30 });
                  useAppStore.getState().addExportLog('[AUTOGENESIS] Transcriber converting WGS84 Lat/Lon to Flat Cartesian Plane...');
               }, 1500);

               setTimeout(() => {
                  useAppStore.getState().setExportState({ exportProgress: 50 });
                  useAppStore.getState().addExportLog('[AUTOGENESIS] Filtering POT Textures & BC1/BC7 Compressing (max 16MB dictionaries)...');
               }, 3000);

               setTimeout(() => {
                   useAppStore.getState().setExportState({ exportProgress: 75 });
                   useAppStore.getState().addExportLog('[AUTOGENESIS] CodeWalker.Core C# backend generating binary .YMAP/.YDR/.YBN...');
               }, 4500);

               setTimeout(() => {
                   useAppStore.getState().setExportState({ exportProgress: 100, isExporting: false });
                   useAppStore.getState().addExportLog('[AUTOGENESIS] Compilation Success. Headless synthesis complete.');
                   addTerminalLog('[+] Headless compilation synthesized. The final FiveM resource archive is ready for deployment.');
               }, 6000);
            }, 1000);
         }
      }

      if (data.status === 'AUTOGENESIS_TRIGGERED' || data.status === 'AUDIT_COMPLETE' || data.status === 'FIVEM_SYNC') {
         setDashboard('code-forge');
      }

      setTimeout(() => {
        addMessage({
          sender: 'emma',
          text: `INTENT EVALUATION: ${data.status}. Offset evaluated at ${data.offset}.`
        });
        setTimeout(() => {
          if (data.status === 'APPROVED' || data.status === 'INVERSION_TRIGGERED' || data.status === 'TARPIT_ACTIVE' || data.status === 'TERMINAL_ACTIVE' || data.status === 'CODE_GENERATED' || data.status === 'TWIN_CITY_TRIGGERED' || data.status === 'FIVEM_SEARCH' || data.status === 'AUTOGENESIS_TRIGGERED' || data.status === 'AUDIT_COMPLETE' || data.status === 'FIVEM_SYNC' || data.status === 'TWIN_CITY_ADJUSTMENT' || data.status === 'GEO_MAP_GENERATION') {
            addMessage({
              sender: 'lucy',
              text: data.message + (data.firecracker_schema ? '\n\n' + JSON.stringify(data.firecracker_schema, null, 2) : '') + (data.inversion_payload ? '\n\nPayload: ' + data.inversion_payload : '') + (data.tarpit_schema ? '\n\n' + JSON.stringify(data.tarpit_schema, null, 2) : '')
            });
          } else {
            addMessage({
              sender: 'lucy',
              text: `Operation halted by Ring 0: ${data.message}`
            });
          }
        }, 600);
      }, 400);

    } catch (err) {
      setTimeout(() => {
        addMessage({ sender: 'emma', text: '500 ERROR: K-Bus disconnected.' });
      }, 400);
    }
  };

  return (
    <>
      <button 
        onClick={toggleChat}
        className="fixed bottom-6 right-6 bg-neutral-100 hover:bg-white text-black p-4 rounded-full shadow-2xl z-50 transition-all hover:scale-105 active:scale-95"
      >
        {isChatOpen ? <X className="w-5 h-5 border-black stroke-2" /> : <MessageSquare className="w-5 h-5 border-black stroke-2" />}
      </button>

      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="fixed bottom-24 right-6 w-[400px] h-[550px] bg-neutral-900 border border-neutral-800 rounded-lg shadow-2xl z-50 flex flex-col overflow-hidden font-mono text-sm"
          >
            <div className="border-b border-neutral-800 bg-black/40 p-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-neutral-400">
                <TerminalIcon />
                <span className="text-xs uppercase tracking-widest font-semibold text-neutral-200">Comm-Link [Level 7]</span>
              </div>
              <ShieldCheck className="w-4 h-4 text-emerald-600/80" />
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-black/20 to-transparent">
              {chatHistory.map((msg) => (
                <div key={msg.id} className="flex flex-col">
                   <span className="text-[9px] uppercase tracking-wider text-neutral-600 mb-1">
                      {msg.sender === 'user' ? 'Operator' : msg.sender === 'emma' ? 'Emma [Ring 0]' : 'Lucy [Ring 1]'} // {new Date(msg.timestamp).toLocaleTimeString()}
                   </span>
                   <div className={`p-2 rounded max-w-[85%] border whitespace-pre-wrap ${
                      msg.sender === 'user' 
                        ? 'bg-neutral-800 border-neutral-700 text-neutral-200 self-end ml-auto rounded-tr-none' 
                        : msg.sender === 'emma'
                        ? 'bg-zinc-950 border-emerald-900/40 text-emerald-400 self-start rounded-tl-none font-medium'
                        : 'bg-zinc-950 border-indigo-900/40 text-indigo-300 self-start rounded-tl-none'
                   }`}>
                      {msg.text}
                   </div>
                </div>
              ))}
            </div>

            <div className="p-3 bg-black/40 border-t border-neutral-800 flex items-center gap-2">
              <span className="text-neutral-500 font-bold ml-1">{'>'}</span>
              <input 
                type="text" 
                value={input}
                onChange={handleChange}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="SUBMIT INTENT_PROPOSAL"
                className="flex-1 bg-transparent text-neutral-200 placeholder:text-neutral-700 focus:outline-none text-xs tracking-wide"
              />
              <button 
                onClick={handleSend}
                className="p-2 bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white rounded-md transition-colors"
              >
                <Send className="w-3 h-3" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function TerminalIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4 17 10 11 4 5"></polyline>
      <line x1="12" y1="19" x2="20" y2="19"></line>
    </svg>
  );
}
