import { useAppStore } from '../store';
import { Shield, ShieldAlert, Crosshair, Network, Cpu, TerminalSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function SecurityOrchestrator() {
  const { securityTeams, setSecurityTeamStatus, hotPotatoActive, setHotPotatoActive, addTerminalLog, setSystemStatus } = useAppStore();

  const handleToggleHotPotato = () => {
    const newState = !hotPotatoActive;
    setHotPotatoActive(newState);
    
    if (newState) {
      addTerminalLog('[ALERT] Hot Potato Protocol ACTIVE. Attacker terminal keybinds inverted (Atbash Shift). Sandbox isolation initiated.');
      setSystemStatus('lockdown');
      // Set some teams to containment
      if (securityTeams[0]) setSecurityTeamStatus(securityTeams[0].id, 'containment');
      if (securityTeams[1]) setSecurityTeamStatus(securityTeams[1].id, 'luring');
    } else {
      addTerminalLog('[INFO] Hot Potato Protocol DEACTIVATED. Terminating sandbox container.');
      setSystemStatus('nominal');
      securityTeams.forEach(t => setSecurityTeamStatus(t.id, 'patrol'));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'patrol': return 'text-emerald-400 border-emerald-500/30 bg-emerald-950/20';
      case 'luring': return 'text-amber-400 border-amber-500/30 bg-amber-950/20';
      case 'pushing': return 'text-orange-400 border-orange-500/30 bg-orange-950/20';
      case 'containment': return 'text-rose-400 border-rose-500/30 bg-rose-950/20';
      default: return 'text-neutral-400 border-neutral-500/30 bg-neutral-900/30';
    }
  };

  const getStatusAnimation = (status: string) => {
    switch (status) {
      case 'luring':
      case 'pushing': return 'animate-pulse';
      case 'containment': return 'animate-bounce';
      default: return '';
    }
  };

  return (
    <div className="w-full h-full flex flex-col md:flex-row gap-4">
      {/* Active Teams Overview */}
      <div className="flex-[3] border border-red-900/40 bg-zinc-950 rounded-xl flex flex-col overflow-hidden relative">
        <div className="p-6 border-b border-red-900/30 flex items-center justify-between z-10 relative">
           <div>
             <h2 className="font-mono text-2xl text-red-400 tracking-[0.2em] uppercase font-light drop-shadow-md flex items-center gap-2">
                <ShieldAlert className="w-6 h-6" /> Threat Orchestrator
             </h2>
             <p className="font-mono text-xs text-red-500/70 uppercase tracking-widest mt-1">Swarm Security Teams (351 Agent Distribution)</p>
           </div>
           
           <div className={`px-4 py-2 rounded-md font-mono text-xs uppercase tracking-widest border transition-colors ${hotPotatoActive ? 'bg-red-900/40 border-red-500 text-red-300 animate-pulse' : 'bg-green-900/20 border-green-500/50 text-green-400'}`}>
              Sandbox Trap: {hotPotatoActive ? 'ACTIVE (Hot Potato)' : 'DORMANT'}
           </div>
        </div>

        <div className="flex-1 p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto custom-scrollbar z-10 relative">
           {securityTeams.map(team => (
              <div key={team.id} className={`p-4 rounded-lg flex flex-col justify-between border transition-all ${getStatusColor(team.status)}`}>
                 <div>
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-mono text-[10px] uppercase tracking-widest opacity-70">{team.id}</div>
                      <div className={`w-2 h-2 rounded-full bg-current ${getStatusAnimation(team.status)}`} />
                    </div>
                    <div className="font-mono font-bold tracking-wider mb-1">{team.name}</div>
                    <div className="font-mono text-[11px] opacity-80 flex items-center gap-1.5 mt-2">
                       <Shield className="w-3.5 h-3.5" /> Lead: {team.securityAgent}
                    </div>
                    <div className="font-mono text-[11px] opacity-80 flex items-center gap-1.5 mt-1">
                       <Network className="w-3.5 h-3.5" /> {team.memberCount} Proxies attached
                    </div>
                 </div>
                 
                 <div className="mt-4 pt-3 border-t border-current/20 flex justify-between items-center">
                    <span className="font-mono text-[10px] uppercase tracking-widest font-bold">STATE: </span>
                    <select 
                       value={team.status}
                       onChange={(e) => setSecurityTeamStatus(team.id, e.target.value as any)}
                       className="bg-transparent font-mono text-[10px] uppercase font-bold outline-none cursor-pointer"
                    >
                       <option value="patrol" className="bg-neutral-900">Patrol (Passive)</option>
                       <option value="luring" className="bg-neutral-900">Luring (Decoy)</option>
                       <option value="pushing" className="bg-neutral-900">Pushing (Pressure)</option>
                       <option value="containment" className="bg-neutral-900">Containment (Trap)</option>
                    </select>
                 </div>
              </div>
           ))}
        </div>
        
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.03)_0,transparent_70%)] pointer-events-none" />
      </div>

      {/* Control Sandbox Panel */}
      <div className="flex-[2] md:max-w-md w-full bg-[#141416] border border-red-900/30 rounded-xl p-4 flex flex-col text-slate-200 shadow-2xl relative overflow-hidden">
         <div className="flex items-center gap-2 mb-4 border-b border-red-900/30 pb-3">
            <Crosshair className="w-5 h-5 text-red-500" />
            <h2 className="text-sm font-mono tracking-widest uppercase font-bold text-red-500">Adversary Sandbox</h2>
         </div>
         
         <div className="flex-1 flex flex-col gap-4 text-xs font-mono text-neutral-400 leading-relaxed overflow-y-auto">
            <p>
               When a suspected intruder navigates past outer routing nodes, Emma generates a dedicated Firecracker microVM. 
               The orchestrator uses active <strong className="text-orange-400">"Luring"</strong> and <strong className="text-purple-400">"Pushing"</strong> tactics via the swarm agents to confirm intent.
            </p>
            <p>
               Once confirmed, Emma activates the <strong className="text-red-400">Hot Potato Protocol</strong>. 
               This intentionally disrupts the adversary's connection by selectively inverting key payload streams (e.g., keyboard bindings shift to Atbash or invert entirely). 
               The attacker fights the UI, giving Lucy's threat analyzers time to safely map the vector.
            </p>
            
            {hotPotatoActive && (
              <motion.div 
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="p-4 mt-auto border border-red-500/40 bg-red-950/20 rounded-md"
              >
                  <div className="text-red-400 font-bold mb-2 flex items-center gap-2">
                     <TerminalSquare className="w-4 h-4 animate-pulse" /> LIVE TRAP ACTIVE
                  </div>
                  <ul className="space-y-1 text-[10px] text-red-300/80">
                     <li>{'>'} Isolating attacker process space</li>
                     <li>{'>'} Deploying fake target payload directories...</li>
                     <li>{'>'} Keyboard input parser inverted. Try typing in the Chat Console to experience the scramble effect.</li>
                  </ul>
              </motion.div>
            )}
         </div>

         <button 
           onClick={handleToggleHotPotato}
           className={`w-full mt-4 py-3 rounded font-mono text-xs tracking-widest uppercase font-bold transition-all flex items-center justify-center gap-2 border ${
             hotPotatoActive 
               ? 'bg-red-900/50 hover:bg-red-900 text-red-200 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]' 
               : 'bg-red-950 hover:bg-red-900 text-red-400 border-red-900/50'
           }`}
         >
           {hotPotatoActive ? 'Terminate Sandbox & Purge' : 'Trigger "Hot Potato" Simulation'}
         </button>
      </div>
    </div>
  );
}
