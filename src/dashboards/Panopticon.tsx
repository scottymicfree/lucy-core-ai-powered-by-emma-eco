import { useAppStore } from '../store';
import { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Tooltip } from 'recharts';

export function Panopticon() {
  const { vfeScore, systemStatus, threatHeat } = useAppStore();
  const [dataPoints, setDataPoints] = useState<{ time: string, vfe: number, threat: number }[]>([]);

  useEffect(() => {
     setDataPoints(prev => {
        const newData = [...prev, { time: new Date().toISOString(), vfe: vfeScore, threat: threatHeat }];
        if (newData.length > 50) return newData.slice(newData.length - 50);
        return newData;
     });
  }, [vfeScore, threatHeat]);

  return (
    <div className="w-full h-full flex flex-col">
       <div className="mb-6">
          <h2 className="font-mono text-2xl text-neutral-200 tracking-[0.2em] uppercase font-light">The Panopticon</h2>
          <p className="font-mono text-xs text-neutral-500 uppercase tracking-widest mt-1">Lucy Cognitive Core & Telemetry</p>
       </div>
       <div className="flex-1 border border-neutral-800 bg-neutral-900/30 rounded-xl p-6 flex flex-col gap-6 relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-neutral-700 to-transparent opacity-50" />
          <div className="flex items-center gap-4 text-xs font-mono text-neutral-400">
             <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-full border border-neutral-800">
                <span className={`w-1.5 h-1.5 rounded-full animate-[ping_0.5s_cubic-bezier(0,0,0.2,1)_infinite] ${systemStatus === 'alert' ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]' : 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]'}`} />
                Variational Free Energy (VFE)
             </div>
             <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-full border border-neutral-800">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.6)]" />
                Perception Channel Active
             </div>
          </div>
          <div className="flex-1 flex flex-col border-t border-b border-neutral-800/50 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(255,255,255,0.02)_2px,rgba(255,255,255,0.02)_4px)] relative p-2">
             <div className="absolute top-4 left-4 z-10 flex gap-6">
                <div>
                   <div className="font-mono text-[10px] text-neutral-500 uppercase tracking-widest">LIVE VFE SCORE</div>
                   <div className={`font-mono text-xl font-bold tracking-wider ${systemStatus === 'alert' ? 'text-rose-400' : 'text-indigo-400'}`}>
                      {vfeScore.toFixed(3)}
                   </div>
                </div>
                <div>
                   <div className="font-mono text-[10px] text-orange-500/80 uppercase tracking-widest">THREAT HEAT</div>
                   <div className="font-mono text-xl font-bold tracking-wider text-orange-400">
                      {threatHeat.toFixed(1)}°
                   </div>
                </div>
             </div>
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={dataPoints} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                 <defs>
                   <linearGradient id="colorVfe" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor={systemStatus === 'alert' ? '#f43f5e' : '#6366f1'} stopOpacity={0.8}/>
                     <stop offset="95%" stopColor={systemStatus === 'alert' ? '#f43f5e' : '#6366f1'} stopOpacity={0}/>
                   </linearGradient>
                   <linearGradient id="colorThreat" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#f97316" stopOpacity={0.6}/>
                     <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                   </linearGradient>
                 </defs>
                 <XAxis dataKey="time" hide />
                 <YAxis domain={[0, 100]} hide />
                 <Tooltip 
                   contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid #333', fontSize: '12px', fontFamily: 'monospace' }} 
                   itemStyle={{ color: '#fff' }}
                   labelStyle={{ display: 'none' }}
                   isAnimationActive={false}
                 />
                 <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                 <Area type="monotone" dataKey="threat" stroke="#f97316" fillOpacity={1} fill="url(#colorThreat)" isAnimationActive={false} />
                 <Area type="monotone" dataKey="vfe" stroke={systemStatus === 'alert' ? '#f43f5e' : '#6366f1'} fillOpacity={1} fill="url(#colorVfe)" isAnimationActive={false} />
               </AreaChart>
             </ResponsiveContainer>
          </div>
       </div>
    </div>
  );
}
