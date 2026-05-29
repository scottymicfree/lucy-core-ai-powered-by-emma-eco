import { useAppStore } from './store';
import { AnimatePresence, motion } from 'framer-motion';

// Dashboard Views (Stubs)
import { Panopticon } from './dashboards/Panopticon';
import { CommLink } from './dashboards/CommLink';
import { Governance } from './dashboards/Governance';
import { HiveMatrix } from './dashboards/HiveMatrix';
import { AegisPandora } from './dashboards/AegisPandora';
import { Embodiment } from './dashboards/Embodiment';
import { CodeForge } from './dashboards/CodeForge';
import { TwinCity } from './dashboards/TwinCity';
import { useQuantumMusic } from './lib/audio';

export function HexStage() {
  const { activeDashboard, systemStatus } = useAppStore();
  
  // Auditory Telemetry Hook
  useQuantumMusic(systemStatus);

  const dashMap = {
    'comm-link': <CommLink />,
    'panopticon': <Panopticon />,
    'governance': <Governance />,
    'hive-matrix': <HiveMatrix />,
    'aegis-pandora': <AegisPandora />,
    'embodiment': <Embodiment />,
    'code-forge': <CodeForge />,
    'twin-city': <TwinCity />
  };

  return (
    <div className="flex-1 h-full relative overflow-hidden bg-zinc-950">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 z-0 opacity-10 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:32px_32px]" />
      
      {/* Radial Gradient overlay */}
      <div className="absolute inset-0 bg-radial-gradient from-transparent to-zinc-950 z-0 opacity-80" />

      <div className="w-full h-full relative z-10 flex flex-col h-full overflow-hidden p-6 md:p-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeDashboard}
            initial={{ opacity: 0, scale: 0.98, filter: 'blur(4px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 1.02, filter: 'blur(4px)' }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="w-full h-full flex flex-col"
          >
            {dashMap[activeDashboard]}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
