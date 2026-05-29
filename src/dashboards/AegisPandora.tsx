import { useAppStore } from '../store';
import { useEffect, useRef } from 'react';

export function AegisPandora() {
  const { aegisLogs } = useAppStore();
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aegisLogs]);

  return (
    <div className="w-full h-full flex flex-col">
       <div className="mb-6">
          <h2 className="font-mono text-2xl text-rose-500/90 tracking-[0.2em] uppercase font-light">Aegis Pandora</h2>
          <p className="font-mono text-xs text-rose-800 uppercase tracking-widest mt-1">Active Defense Mesh & Deception Warden</p>
       </div>
       <div className="flex-1 border border-rose-900/40 bg-rose-950/10 rounded-xl p-6 relative overflow-hidden flex flex-col gap-6">
          <div className="grid grid-cols-4 gap-4 h-32">
             <LayerBox level="Layer 1" title="XDP/eBPF" active={true} desc="Deep Packet Inspection at < 12ns" />
             <LayerBox level="Layer 2" title="Firecracker" active={true} desc="MicroVM containment allocated" />
             <LayerBox level="Layer 3" title="LLM Tarpit" active={false} desc="Decoy bash simulation dormant" />
             <LayerBox level="Layer 4" title="Inversion" active={false} desc="Terminal ANSI burst primed" />
          </div>
          <div className="flex-1 border border-rose-900/20 bg-black/80 rounded flex flex-col overflow-hidden">
              <div className="p-3 border-b border-rose-900/20 uppercase font-mono text-[10px] tracking-widest text-rose-500 flex justify-between items-center bg-rose-950/10">
                 <span>Deception Weaver Live Log</span>
                 <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" /> Monitoring TAP_AP_42</span>
              </div>
              <div className="flex-1 p-4 font-mono text-xs text-rose-500/80 overflow-y-auto space-y-2">
                  {aegisLogs.length === 0 && (
                     <div className="text-neutral-600">Awaiting anomalous intent proposals via eBPF XDP hook...</div>
                  )}
                  {aegisLogs.map((log, i) => (
                    <div key={i} className="flex gap-2">
                      <span className="text-rose-900">{'>'}</span>
                      <span className={log.includes('[XDP DROP]') ? 'text-rose-400 font-semibold' : ''}>{log}</span>
                    </div>
                  ))}
                  <div ref={logsEndRef} />
              </div>
          </div>
       </div>
    </div>
  );
}

function LayerBox({ level, title, desc, active }: { level: string, title: string, desc: string, active: boolean }) {
  return (
    <div className={`p-4 rounded-md border flex flex-col justify-between transition-colors ${active ? 'border-rose-700/50 bg-rose-900/10 shadow-[0_0_15px_rgba(159,18,57,0.1)]' : 'border-neutral-800 bg-neutral-900/30'}`}>
       <div>
         <div className="font-mono text-[10px] text-neutral-500 uppercase tracking-widest mb-1">{level}</div>
         <div className={`font-mono font-bold tracking-widest ${active ? 'text-rose-400' : 'text-neutral-400'}`}>{title}</div>
       </div>
       <div className={`font-mono text-[9px] uppercase tracking-wider ${active ? 'text-rose-600 animate-pulse' : 'text-neutral-600'}`}>
         {active ? '» ACTIVE' : '» DORMANT'}
       </div>
    </div>
  )
}
