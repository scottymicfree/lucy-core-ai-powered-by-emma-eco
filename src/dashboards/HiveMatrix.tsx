import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Instances, Instance } from '@react-three/drei';
import * as THREE from 'three';
import { useAppStore } from '../store';
import { SwarmAgent } from '../lib/agents';

const AGENT_COUNT = 351;

function SwarmNodes({ agents }: { agents: SwarmAgent[] }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  
  // Use React.useMemo safely since we import it
  const { positions, colors } = useMemo(() => {
    const pos = [];
    const col = [];
    const colorGen = new THREE.Color();
    for (let i = 0; i < AGENT_COUNT; i++) {
        // Spherical distribution
        const r = 4 + Math.random() * 6;
        const theta = Math.random() * 2 * Math.PI;
        const phi = Math.acos(2 * Math.random() - 1);
        pos.push(
            r * Math.sin(phi) * Math.cos(theta),
            r * Math.sin(phi) * Math.sin(theta),
            r * Math.cos(phi)
        );
        
        const agent = agents[i];
        if (agent) {
          // Color based on mapped lobe
          if (agent.lobe.includes('Frontal')) colorGen.setHex(0x6366f1); // Indigo
          else if (agent.lobe.includes('Temporal')) colorGen.setHex(0xa855f7); // Purple
          else if (agent.lobe.includes('Parietal')) colorGen.setHex(0x06b6d4); // Cyan
          else if (agent.lobe.includes('Occipital')) colorGen.setHex(0x3b82f6); // Blue
          else if (agent.lobe.includes('Limbic')) colorGen.setHex(0xf43f5e); // Rose
          else if (agent.lobe.includes('Cerebellum')) colorGen.setHex(0xeab308); // Yellow
          else colorGen.setHex(0x10b981); // Emerald (Brain Stem)

          // Very high scores get a brightness boost or override
          if (agent.ssScore > 1500) {
            colorGen.setHex(0xffffff);
          }
        } else {
           colorGen.setHex(0x555555);
        }

        col.push(colorGen.r, colorGen.g, colorGen.b);
    }
    return { positions: new Float32Array(pos), colors: new Float32Array(col) };
  }, [agents]);

  useFrame((state) => {
    if (ref.current) {
       ref.current.rotation.y = state.clock.elapsedTime * 0.05;
       ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
    }
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, AGENT_COUNT]}>
      <sphereGeometry args={[0.08, 16, 16]}>
         <instancedBufferAttribute attach="attributes-position" args={[positions, 3]} />
      </sphereGeometry>
      <meshBasicMaterial transparent opacity={0.8} />
      <Instances range={AGENT_COUNT}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshBasicMaterial toneMapped={false} vertexColors />
        {Array.from({ length: AGENT_COUNT }).map((_, i) => (
          <Instance
            key={i}
            position={[positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]]}
            color={new THREE.Color(colors[i * 3], colors[i * 3 + 1], colors[i * 3 + 2])}
          />
        ))}
      </Instances>
    </instancedMesh>
  );
}

export function HiveMatrix() {
  const { globalSystemScore, swarmAgents } = useAppStore();
  
  // Sort and get top performing agents
  const topAgents = [...swarmAgents].sort((a, b) => b.ssScore - a.ssScore).slice(0, 10);

  return (
    <div className="w-full h-full flex flex-col">
       <div className="mb-6 flex justify-between items-end relative z-10 pointer-events-none">
          <div>
            <h2 className="font-mono text-2xl text-cyan-200 tracking-[0.2em] uppercase font-light">Hive Matrix</h2>
            <p className="font-mono text-xs text-cyan-500/70 uppercase tracking-widest mt-1">351-Agent Swarm Orchestrator</p>
          </div>
          <div className="text-right">
             <div className="font-mono text-[10px] text-cyan-500/70 uppercase tracking-widest">Base Level OS SS#</div>
             <div className="font-mono text-2xl font-bold text-cyan-300">{globalSystemScore.toFixed(0)}</div>
          </div>
       </div>
       
       <div className="flex-1 flex flex-col md:flex-row gap-4 relative">
         <div className="flex-[3] border border-cyan-900/30 bg-black rounded-xl relative overflow-hidden h-[300px] md:h-auto">
            <Canvas camera={{ position: [0, 0, 15], fov: 45 }}>
               <color attach="background" args={['#000000']} />
               <ambientLight intensity={0.5} />
               <SwarmNodes agents={swarmAgents} />
               <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
            </Canvas>
            <div className="absolute bottom-4 left-4 font-mono text-[10px] text-cyan-500/50 uppercase tracking-widest pointer-events-none">
               NVMe KV Cache: Streaming
               <br />
               GPU VRAM Locality: Active
            </div>
         </div>
         
         <div className="flex-[2] border border-cyan-900/30 bg-cyan-950/10 rounded-xl overflow-hidden flex flex-col">
            <div className="p-3 border-b border-cyan-900/30 font-mono text-[10px] uppercase tracking-widest text-cyan-500 bg-cyan-900/20 text-center">
               Dynamic SS# Reward Ledger (Top 10)
            </div>
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
               {topAgents.map((agent, i) => (
                 <div key={agent.id} className="flex flex-col gap-1 p-2 rounded bg-black/40 border border-cyan-900/20">
                    <div className="flex justify-between items-center font-mono text-xs text-cyan-300">
                       <span className="font-bold">{agent.name}</span>
                       <span className="text-emerald-400">§ {agent.ssScore}</span>
                    </div>
                    <div className="font-mono text-[9px] uppercase tracking-wider text-cyan-600/70">
                       {agent.lobe}
                    </div>
                 </div>
               ))}
            </div>
         </div>
       </div>
    </div>
  );
}
