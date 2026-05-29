import React from 'react';
import { useAppStore } from '../store';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Map, Layers, Download, Image as ImageIcon } from 'lucide-react';

const MOCK_TILES = [
  { id: 'city_block_01', position: [-2.1, 0, -2.1] },
  { id: 'city_block_02', position: [0, 0, -2.1] },
  { id: 'city_block_03', position: [2.1, 0, -2.1] },
  { id: 'city_block_04', position: [-2.1, 0, 0] },
  { id: 'city_block_05', position: [0, 0, 0] },
  { id: 'city_block_06', position: [2.1, 0, 0] },
  { id: 'city_block_07', position: [-2.1, 0, 2.1] },
  { id: 'city_block_08', position: [0, 0, 2.1] },
  { id: 'city_block_09', position: [2.1, 0, 2.1] },
];

function TileSelector({ tileData }: { tileData: typeof MOCK_TILES[0] }) {
  const { selectedTiles, addTileToSelection } = useAppStore();
  const isSelected = selectedTiles.includes(tileData.id);

  const handlePointerDown = (e: any) => {
    e.stopPropagation();
    addTileToSelection(tileData.id);
  };

  return (
    <mesh 
      position={tileData.position as [number, number, number]}
      onPointerDown={handlePointerDown} 
    >
      <boxGeometry args={[2, 0.5, 2]} />
      <meshStandardMaterial 
        color={isSelected ? '#3b82f6' : '#27272a'} 
        emissive={isSelected ? '#1d4ed8' : '#000000'}
        emissiveIntensity={isSelected ? 0.8 : 0} 
        wireframe={!isSelected}
      />
    </mesh>
  );
}

export function TwinCity() {
  const { selectedTiles, isExporting, exportProgress, exportLogs, addExportLog, setExportState } = useAppStore();

  const handleCompile = () => {
    if (selectedTiles.length === 0) return;
    
    setExportState({ isExporting: true, exportProgress: 10 });
    addExportLog("Initializing FiveM Export Pipeline...");
    addExportLog(`Origin shifted to: X:0, Y:0`);
    
    setTimeout(() => setExportState({ exportProgress: 30 }), 500);
    setTimeout(() => addExportLog("Transmitting geometry to CodeWalker.API (.NET 9)..."), 1000);
    setTimeout(() => setExportState({ exportProgress: 60 }), 1500);
    setTimeout(() => {
       addExportLog("Serialization formatting to .ydr, .ybn, .ytyp, .ymap applied.");
       setExportState({ exportProgress: 85 });
    }, 2000);
    
    setTimeout(() => {
       setExportState({ exportProgress: 100, isExporting: false, selectedTiles: [] });
       addExportLog("Compilation Success. Archive stream prepared for RAGE ingestion.");
    }, 3500);
  };

  return (
    <div className="w-full h-full flex flex-col md:flex-row gap-4">
      {/* 3D Canvas Area */}
      <div className="flex-[3] border border-blue-900/40 bg-zinc-950 rounded-xl relative overflow-hidden flex flex-col">
         <div className="absolute top-4 left-4 z-10 pointer-events-none">
            <h2 className="font-mono text-2xl text-blue-400 tracking-[0.2em] uppercase font-light drop-shadow-md flex items-center gap-2">
               <Layers className="w-6 h-6" /> Twin City
            </h2>
            <p className="font-mono text-xs text-blue-500/70 uppercase tracking-widest mt-1">Geospatial Matrix Export</p>
         </div>
         <div className="absolute top-4 right-4 z-10 font-mono text-[10px] text-blue-500/50 uppercase tracking-widest text-right">
             <span className="block">WebGPU Context</span>
             <span className="block">Google Maps 3D Tiles</span>
         </div>
         
         <Canvas camera={{ position: [0, 8, 8], fov: 45 }}>
            <color attach="background" args={['#09090b']} />
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 5]} intensity={1} />
            
            <gridHelper args={[20, 20, '#1e3a8a', '#1e293b']} position={[0, -0.25, 0]} />
            
            {MOCK_TILES.map(tile => <TileSelector key={tile.id} tileData={tile} />)}
            
            <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 2.1} />
         </Canvas>
      </div>

      {/* Export Dashboard UI */}
      <div className="flex-[2] md:max-w-md w-full bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col text-slate-200">
         <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-3">
            <Map className="w-5 h-5 text-blue-400" />
            <h2 className="text-sm font-mono tracking-widest uppercase font-bold text-blue-400">FiveM RAGE Exporter</h2>
         </div>
         
         <div className="flex-1 overflow-y-auto mb-4 flex flex-col min-h-[100px]">
           <h3 className="text-[11px] font-mono tracking-widest uppercase text-slate-500 mb-2 font-semibold">Selected Sectors ({selectedTiles.length})</h3>
           {selectedTiles.length === 0 ? (
             <div className="text-xs font-mono text-slate-600 italic">No tiles selected in viewport.</div>
           ) : (
             <ul className="text-xs font-mono mt-1 space-y-1.5 flex-1 overflow-y-auto custom-scrollbar pr-2">
               {selectedTiles.map(id => (
                 <li key={id} className="text-blue-300 bg-blue-900/20 px-2 py-1.5 rounded border border-blue-900/40 flex justify-between">
                    <span>{id}</span>
                    <span className="text-slate-500 opacity-50">WGS84</span>
                 </li>
               ))}
             </ul>
           )}
         </div>

         <div className="mb-4 bg-slate-950 p-2.5 rounded border border-slate-800/80">
            <h3 className="text-[10px] font-mono tracking-widest uppercase text-slate-500 mb-2.5 font-bold">Pipeline Attributes</h3>
            <div className="space-y-2.5">
               <label className="flex items-start gap-2 text-xs font-mono text-slate-400 cursor-pointer group">
                  <input type="checkbox" defaultChecked className="mt-0.5 bg-slate-800 border-slate-700 rounded text-blue-500 focus:ring-blue-500/20" />
                  <div>
                     <span className="block text-slate-300 group-hover:text-white transition-colors">Enforce POT 16MB Chunking</span>
                     <span className="block text-[9px] text-slate-600 mt-0.5">Applies BC1/BC5/BC7 texture chunking. Prevents RAGE VRAM loss.</span>
                  </div>
               </label>
               <label className="flex items-start gap-2 text-xs font-mono text-slate-400 cursor-pointer group">
                  <input type="checkbox" defaultChecked className="mt-0.5 bg-slate-800 border-slate-700 rounded text-blue-500 focus:ring-blue-500/20" />
                  <div>
                     <span className="block text-slate-300 group-hover:text-white transition-colors">Localized Origin Shifting</span>
                     <span className="block text-[9px] text-slate-600 mt-0.5">Recalculates centroids to prevent 32-bit float physics jitter.</span>
                  </div>
               </label>
               <label className="flex items-start gap-2 text-xs font-mono text-slate-400 cursor-pointer group">
                  <input type="checkbox" defaultChecked className="mt-0.5 bg-slate-800 border-slate-700 rounded text-blue-500 focus:ring-blue-500/20" />
                  <div>
                     <span className="block text-slate-300 group-hover:text-white transition-colors">BVH Collision Extents (.ybn)</span>
                     <span className="block text-[9px] text-slate-600 mt-0.5">Bakes BoundsPolyMesh to prevent world fall-through.</span>
                  </div>
               </label>
               <label className="flex items-start gap-2 text-xs font-mono text-slate-400 cursor-pointer group">
                  <input type="checkbox" defaultChecked className="mt-0.5 bg-slate-800 border-slate-700 rounded text-blue-500 focus:ring-blue-500/20" />
                  <div>
                     <span className="block text-slate-300 group-hover:text-white transition-colors">AI Routing NavMesh (.ynv)</span>
                     <span className="block text-[9px] text-slate-600 mt-0.5">Serializes .onv to .ynv for entity/pedestrian pathfinding.</span>
                  </div>
               </label>
            </div>
         </div>

         <div className="mb-4 bg-slate-950 p-2.5 rounded border border-slate-800/80">
            <h3 className="text-[10px] font-mono tracking-widest uppercase text-slate-500 mb-2 font-bold flex items-center gap-1.5"><ImageIcon className="w-3 h-3 text-blue-400" /> DDS Compression Preview</h3>
            <div className="h-24 bg-black rounded border border-slate-800 relative overflow-hidden flex items-center justify-center">
              {selectedTiles.length > 0 ? (
                <>
                  <Canvas orthographic camera={{ zoom: 40, position: [0, 0, 5] }}>
                    <ambientLight intensity={1} />
                    <mesh>
                      <planeGeometry args={[4, 4]} />
                      <meshStandardMaterial color="#475569" wireframe={false} />
                    </mesh>
                    <gridHelper args={[4, 4, '#334155', '#1e293b']} rotation={[Math.PI / 2, 0, 0]} />
                  </Canvas>
                  <div className="absolute top-1 left-2 pointer-events-none">
                     <span className="text-[8px] font-mono text-emerald-500 bg-emerald-950/80 px-1 py-0.5 rounded block">BC7_UNORM</span>
                     <span className="text-[8px] font-mono text-blue-400 bg-blue-950/80 px-1 py-0.5 rounded block mt-0.5">2048x2048</span>
                  </div>
                </>
              ) : (
                <span className="text-[9px] font-mono text-slate-600 block">NO_TEXTURE_LOADED</span>
              )}
            </div>
         </div>

         {isExporting && (
           <div className="w-full bg-slate-800 rounded-full h-1.5 mb-4 overflow-hidden border border-slate-700">
             <div className="bg-blue-500 h-full transition-all duration-300 ease-out" style={{ width: `${exportProgress}%` }}></div>
           </div>
         )}

         <div className="h-40 bg-black/60 border border-slate-800 overflow-y-auto text-xs p-3 rounded mb-4 font-mono text-emerald-400/90 custom-scrollbar flex flex-col gap-1.5">
           {exportLogs.map((log, i) => (
             <div key={i} className="leading-relaxed opacity-90"><span className="text-slate-500 mr-1">{'>'}</span> {log}</div>
           ))}
         </div>

         <button 
           onClick={handleCompile} 
           disabled={isExporting || selectedTiles.length === 0}
           className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed py-3 rounded font-mono text-xs tracking-widest uppercase font-bold transition-colors flex items-center justify-center gap-2 group border border-blue-700 disabled:border-slate-700"
         >
           <Download className="w-4 h-4 group-hover:scale-110 transition-transform" /> {isExporting ? 'Compiling Binaries...' : 'Compile to .YMAP / .YDR'}
         </button>
      </div>
    </div>
  );
}
