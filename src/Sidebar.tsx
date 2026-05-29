import { 
  Activity, 
  ShieldAlert, 
  TerminalSquare, 
  Box, 
  Network, 
  Cpu,
  Code2,
  Map as MapIcon,
  ShieldCheck
} from 'lucide-react';
import { useAppStore } from './store';
import clsx from 'clsx';

const DASHBOARDS = [
  { id: 'comm-link', icon: TerminalSquare, label: 'Comm-Link' },
  { id: 'code-forge', icon: Code2, label: 'Blueprint Forge' },
  { id: 'panopticon', icon: Activity, label: 'Panopticon' },
  { id: 'twin-city', icon: MapIcon, label: 'Twin City' },
  { id: 'security-orchestrator', icon: ShieldCheck, label: 'Security Orchestrator' },
  { id: 'governance', icon: Cpu, label: 'Emma Governance' },
  { id: 'hive-matrix', icon: Box, label: 'Hive Matrix' },
  { id: 'aegis-pandora', icon: ShieldAlert, label: 'Aegis Pandora' },
  { id: 'embodiment', icon: Network, label: 'Physical Embodiment' },
] as const;

export function Sidebar() {
  const { activeDashboard, setDashboard, systemStatus } = useAppStore();

  return (
    <aside className="w-16 md:w-64 border-r border-neutral-800 bg-black/50 backdrop-blur-md flex flex-col items-center md:items-stretch py-6 z-50 overflow-hidden shrink-0 transition-all duration-300">
      <div className="flex items-center gap-3 px-0 md:px-6 mb-12 relative">
        <div className={clsx(
          "w-3 h-3 rounded-full shrink-0 shadow-lg transition-colors duration-1000",
          systemStatus === 'nominal' ? "bg-emerald-500 shadow-emerald-500/50" : 
          systemStatus === 'alert' ? "bg-amber-500 shadow-amber-500/50" : "bg-rose-600 shadow-rose-600/50 animate-pulse"
        )} />
        <h1 className="font-mono text-sm tracking-widest uppercase hidden md:block text-neutral-300 font-semibold truncate">
          Lucy OS [Ring 0]
        </h1>
      </div>

      <nav className="flex flex-col gap-2 px-2 md:px-4 w-full">
        {DASHBOARDS.map(({ id, icon: Icon, label }) => {
          const isActive = activeDashboard === id;
          return (
            <button
              key={id}
              onClick={() => setDashboard(id)}
              className={clsx(
                "group relative flex items-center justify-center md:justify-start gap-4 px-3 md:px-4 py-3 rounded-md transition-all duration-300 overflow-hidden",
                isActive 
                  ? "bg-neutral-800/80 text-white" 
                  : "text-neutral-500 hover:text-neutral-300 hover:bg-neutral-900/50"
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-neutral-200" />
              )}
              <Icon className="w-5 h-5 shrink-0" strokeWidth={1.5} />
              <span className="text-xs tracking-wider uppercase font-medium hidden md:block truncate">
                {label}
              </span>
            </button>
          );
        })}
      </nav>
      
      <div className="mt-auto px-6 hidden md:flex flex-col gap-1 text-[10px] uppercase tracking-widest text-neutral-700 font-mono">
        <span>Pulse: 12.5 Hz</span>
        <span>Modulation: Alpha</span>
      </div>
    </aside>
  );
}
