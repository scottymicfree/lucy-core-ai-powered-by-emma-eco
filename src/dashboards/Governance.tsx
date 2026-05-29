import { useEffect, useState } from 'react';
import { useAppStore } from '../store';

export function Governance() {
  const { immutableLedger, fetchLedgerHistory } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchLedgerHistory(searchTerm);
  }, [fetchLedgerHistory, searchTerm]);

  return (
    <div className="w-full h-full flex flex-col">
       <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="font-mono text-2xl text-emerald-400/90 tracking-[0.2em] uppercase font-light">Emma Governance</h2>
            <p className="font-mono text-xs text-emerald-900/80 uppercase tracking-widest mt-1">Ring 0 Core & Immutable Ledger</p>
          </div>
          <input 
             type="text" 
             placeholder="SEARCH LEDGER..." 
             className="bg-emerald-900/20 border border-emerald-900/40 text-emerald-400 placeholder:text-emerald-900/60 font-mono text-xs px-3 py-1.5 focus:outline-none w-64"
             value={searchTerm}
             onChange={e => setSearchTerm(e.target.value)}
          />
       </div>
       <div className="flex-1 border border-emerald-900/30 bg-emerald-950/10 rounded-xl p-6 relative overflow-hidden flex flex-col">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-800/50 to-transparent opacity-50" />
          <div className="flex flex-col font-mono flex-1 overflow-hidden">
              <div className="grid grid-cols-12 text-xs uppercase tracking-widest text-emerald-700/80 mb-4 pb-2 border-b border-emerald-900/30 shrink-0">
                 <div className="col-span-2">Timestamp</div>
                 <div className="col-span-2">Digest Sign</div>
                 <div className="col-span-2">Source IP / Agent</div>
                 <div className="col-span-1 border-x border-emerald-900/30 text-center">Offset</div>
                 <div className="col-span-2 text-center">Response Vector</div>
                 <div className="col-span-3 text-right">Intent / Verification</div>
              </div>
              <div className="flex-1 flex flex-col gap-1 overflow-y-auto pr-2 custom-scrollbar">
                  {immutableLedger.map((entry) => (
                    <LedgerRow 
                      key={entry.id}
                      entry={entry}
                    />
                  ))}
                  {immutableLedger.length === 0 && (
                     <div className="text-center text-xs text-emerald-800 mt-4 uppercase tracking-widest">Awaiting transactions...</div>
                  )}
              </div>
              <div className="mt-4 border-t border-emerald-900/30 pt-4 flex justify-between text-[10px] uppercase tracking-widest text-emerald-700/60 shrink-0">
                 <span>TLA+ INVARIANT ENFORCER: ONLINE</span>
                 <span>PEDESTRIAN BIAS: SECURE</span>
              </div>
          </div>
       </div>
    </div>
  );
}

function LedgerRow({ entry }: { entry: any }) {
  const time = new Date(entry.timestamp).toISOString().split('T')[1].replace('Z', '');
  const hash = entry.digest.substring(0, 16);
  const metadata = entry.metadata || {};
  const { simulatedIp = entry.source, swarmAgent = 'N/A', responseVector = entry.action } = metadata;
  
  return (
    <div className="grid grid-cols-12 text-[10px] text-emerald-400 font-medium py-1.5 items-center hover:bg-emerald-900/10 cursor-default border-b border-emerald-900/10 last:border-0 shrink-0 gap-x-2">
       <div className="col-span-2 text-emerald-600/70 truncate">{time}</div>
       <div className="col-span-2 font-bold text-emerald-700 truncate tracking-tight">{hash}</div>
       <div className="col-span-2 truncate flex flex-col justify-center">
         <span className="text-emerald-500/80">{simulatedIp}</span>
         {swarmAgent !== 'N/A' && <span className="text-[8px] text-emerald-700">{swarmAgent}</span>}
       </div>
       <div className={`col-span-1 text-center font-bold ${entry.offset === -1 ? 'text-red-500' : 'text-emerald-500'}`}>{entry.offset}</div>
       <div className="col-span-2 text-center truncate text-emerald-600/60 font-bold">{responseVector}</div>
       <div className={`col-span-3 text-right truncate ${entry.offset === -1 ? 'text-red-500/80' : 'text-emerald-400'}`} title={entry.action}>{entry.action}</div>
    </div>
  )
}
