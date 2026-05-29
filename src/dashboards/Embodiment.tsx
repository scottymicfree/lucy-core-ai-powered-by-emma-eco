import { useAppStore } from '../store';
import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Tooltip } from 'recharts';

export function Embodiment() {
  const { csiAmplitude, iotStatus } = useAppStore();
  const [dataPoints, setDataPoints] = useState<{ time: string, amplitude: number }[]>([]);

  useEffect(() => {
     if (iotStatus !== 'offline') {
         setDataPoints(prev => {
            const newData = [...prev, { time: new Date().toISOString(), amplitude: csiAmplitude }];
            if (newData.length > 50) return newData.slice(newData.length - 50);
            return newData;
         });
     }
  }, [csiAmplitude, iotStatus]);

  return (
    <div className="w-full h-full flex flex-col">
       <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="font-mono text-2xl text-amber-200/90 tracking-[0.2em] uppercase font-light">Embodiment</h2>
            <p className="font-mono text-xs text-amber-600 uppercase tracking-widest mt-1">Physical Layer & Wi-Fi CSI Backscatter</p>
          </div>
          <div className={`font-mono text-[10px] uppercase tracking-widest px-3 py-1 rounded border ${iotStatus === 'offline' ? 'bg-amber-950/40 text-amber-500/50 border-amber-900/30' : 'bg-amber-900/40 text-amber-400 border-amber-500/50 animate-pulse'}`}>
             Node WebSocket: {iotStatus}
          </div>
       </div>
       
       {iotStatus === 'offline' ? (
         <div className="flex-1 border border-amber-900/30 bg-amber-950/10 rounded-xl flex items-center justify-center relative overflow-hidden">
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.05)_0,transparent_60%)]" />
           <div className="relative z-10 flex flex-col items-center justify-center p-8 text-center max-w-md">
              <div className="w-24 h-24 mb-6 relative">
                 <div className="absolute inset-0 border-2 border-amber-500/20 rounded-full animate-ping [animation-duration:3s]" />
                 <div className="absolute inset-2 border border-amber-500/40 rounded-full animate-ping [animation-duration:2s]" />
                 <div className="absolute inset-4 border border-amber-500/80 rounded-full flex items-center justify-center bg-amber-950/50">
                    <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.8)]" />
                 </div>
              </div>
              <h3 className="font-mono text-amber-500 font-semibold tracking-widest uppercase mb-2">ESP32-S3 Node Offline</h3>
              <p className="font-mono text-xs text-amber-700/80">
                 Wi-Fi CSI subcarrier amplitude processor requires physical hardware connection. 
                 Awaiting WebSocket handshake from Home Assistant bridge for environmental rendering.
              </p>
           </div>
         </div>
       ) : (
         <div className="flex-1 border border-amber-900/30 bg-amber-950/10 rounded-xl flex flex-col relative overflow-hidden p-6 gap-4">
            <div className="flex items-center gap-4 text-xs font-mono text-amber-400">
               <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-full border border-amber-900/40">
                  <span className="w-1.5 h-1.5 rounded-full animate-[ping_0.5s_cubic-bezier(0,0,0.2,1)_infinite] bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
                  Amplitude Frame: {(csiAmplitude).toFixed(2)}
               </div>
               <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-full border border-amber-900/40">
                  Subcarrier Tracking: Active 54k FPS
               </div>
            </div>
            
            <div className="flex-1 border border-amber-900/20 bg-black/50 p-4">
              <ResponsiveContainer width="100%" height="100%">
                 <LineChart data={dataPoints} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                   <XAxis dataKey="time" hide />
                   <YAxis domain={[0, 40]} hide />
                   <CartesianGrid strokeDasharray="3 3" stroke="#451a03" vertical={false} />
                   <Tooltip 
                       contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid #78350f', fontSize: '12px', fontFamily: 'monospace' }} 
                       itemStyle={{ color: '#fbbf24' }}
                       labelStyle={{ display: 'none' }}
                       isAnimationActive={false}
                   />
                   <Line type="monotone" dataKey="amplitude" stroke="#fbbf24" strokeWidth={2} dot={false} isAnimationActive={false} />
                 </LineChart>
              </ResponsiveContainer>
            </div>
         </div>
       )}
    </div>
  );
}
