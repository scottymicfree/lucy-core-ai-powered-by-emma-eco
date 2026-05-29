import { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../store';
import { Folder, FileJson, FileCode, File, Upload, Download, TerminalSquare, ChevronUp, ChevronDown, Play, FileTerminal, Network } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-lua';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-typescript';
import 'prismjs/themes/prism-tomorrow.css'; // Dark theme for highlighting

// Helper to determine prism language
const getLanguage = (type: string) => {
  switch (type) {
    case 'rust': return Prism.languages.rust || Prism.languages.clike;
    case 'c': return Prism.languages.c || Prism.languages.clike;
    case 'python': return Prism.languages.python || Prism.languages.clike;
    case 'lua': return Prism.languages.lua || Prism.languages.clike;
    case 'markdown': return Prism.languages.markdown || Prism.languages.clike;
    case 'bash': return Prism.languages.bash || Prism.languages.clike;
    case 'typescript': return Prism.languages.typescript || Prism.languages.clike;
    default: return Prism.languages.javascript || Prism.languages.clike; // basic fallback
  }
};

export function CodeForge() {
  const { terminalLogs, addTerminalLog, forgeFiles, updateForgeFile, projectSourceOfTruth } = useAppStore();
  const [activeFileId, setActiveFileId] = useState<string>('1');
  const [isTerminalOpen, setIsTerminalOpen] = useState(true);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  const activeFile = forgeFiles.find(f => f.id === activeFileId) || forgeFiles[0];

  useEffect(() => {
    if (isTerminalOpen) {
      terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [terminalLogs, isTerminalOpen]);

  const handleExecute = () => {
    if (!activeFile) return;
    addTerminalLog(`> run ${activeFile.name}`);
    addTerminalLog(`[+] Spawning LL033 ACTION node...`);
    
    // Simulate fake execution delay
    setTimeout(() => {
      addTerminalLog(`[+] Swarm Agent LL252 CODE_WEAVER assigned.`);
      addTerminalLog(`[+] Compiled ${activeFile.name} successfully.`);
      addTerminalLog(`[+] STDOUT: Execution completed without invariant faults.`);
    }, 600);
  };

  const handleContentChange = (content: string) => {
    if (activeFile) {
       updateForgeFile(activeFile.id, content);
    }
  };
  
  const lineCount = activeFile ? activeFile.content.split('\n').length : 1;
  const lines = Array.from({ length: Math.max(10, lineCount) }, (_, i) => i + 1);

  return (
    <div className="w-full h-full flex flex-col bg-zinc-950 border border-neutral-800 rounded-xl overflow-hidden shadow-2xl relative">
       {/* IDE Header */}
       <div className="h-12 border-b border-neutral-800 bg-neutral-900 flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-2 text-indigo-400">
             <Code2Icon className="w-5 h-5" />
             <h2 className="font-mono text-sm tracking-[0.2em] uppercase font-semibold">Blueprint Forge</h2>
          </div>
          <div className="flex items-center gap-2">
             <button onClick={() => addTerminalLog('[+] Saved changes to Logic Core.')} className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 font-mono text-[10px] uppercase tracking-widest transition-colors group">
               <Upload className="w-3 h-3 group-hover:-translate-y-0.5 transition-transform" /> Save
             </button>
             <button onClick={() => addTerminalLog('[+] Exported Master Folder to FiveM Server instance.')} className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-indigo-900/30 border border-indigo-500/30 hover:bg-indigo-900/50 text-indigo-300 font-mono text-[10px] uppercase tracking-widest transition-colors group">
               <Download className="w-3 h-3 group-hover:translate-y-0.5 transition-transform" /> FiveM Node
             </button>
             <button onClick={() => {
                addTerminalLog('[AGP] Genesis Seed packaged as lucy_baremetal_bootstrap.sh');
                
                let scriptContent = `#!/bin/bash\necho "Initializing Lucy Core Bare-Metal Seed Deployment"\nmkdir -p genesis_seed\n\n`;
                forgeFiles.forEach(file => {
                  if (file.name.startsWith('genesis_seed/') || file.name === 'AEGIS_REPORT.md' || file.name === 'SYSTEM_AUDIT_REPORT.md') {
                    scriptContent += `cat << 'EOF_LUCY' > ${file.name}\n${file.content}\nEOF_LUCY\n\n`;
                  }
                });
                scriptContent += `chmod +x genesis_seed/setup.sh\necho "Genesis Seed deployed. Review then run genesis_seed/setup.sh to launch."\n`;
                
                const blob = new Blob([scriptContent], { type: 'text/x-shellscript' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'lucy_baremetal_bootstrap.sh';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                
                addTerminalLog('[AGP] Awaiting local execution on Bare-Metal host to initiate MCP Bridge.');
             }} className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-900/30 border border-emerald-500/50 hover:bg-emerald-900/60 text-emerald-300 font-mono text-[10px] uppercase tracking-widest transition-colors group">
               <Download className="w-3 h-3 group-hover:translate-y-0.5 transition-transform" /> Download Genesis Seed
             </button>
          </div>
       </div>

       <div className="flex-1 flex overflow-hidden">
          {/* File Explorer Sidebar */}
          <div className="w-56 border-r border-neutral-800 bg-black/40 flex flex-col hidden md:flex shrink-0">
             <div className="p-3 font-mono text-[10px] uppercase tracking-widest text-neutral-500 font-semibold border-b border-neutral-800">
                FiveM Server Workspace
             </div>
             <div className="flex-1 overflow-y-auto py-2">
                <div className="px-2 cursor-pointer flex items-center gap-1.5 text-neutral-300 font-mono text-xs mb-1 hover:text-white">
                   <Folder className="w-3.5 h-3.5 text-indigo-400 fill-indigo-400/20" /> 
                   <span>/resources/[lucy]</span>
                </div>
                {forgeFiles.map(f => (
                  <div 
                    key={f.id} 
                    onClick={() => setActiveFileId(f.id)}
                    className={`pl-6 pr-2 py-1.5 cursor-pointer flex items-center gap-2 font-mono text-xs transition-colors ${activeFileId === f.id ? 'bg-indigo-900/20 text-indigo-300 border-r-2 border-indigo-500' : 'text-neutral-500 hover:text-neutral-300 hover:bg-neutral-900'}`}
                  >
                     {f.name.endsWith('.rs') ? <FileCode className="w-3 h-3 text-orange-400" /> : 
                      f.name.endsWith('.c') ? <FileCode className="w-3 h-3 text-blue-400" /> :
                      f.name.endsWith('.py') ? <FileTerminal className="w-3 h-3 text-yellow-400" /> :
                      f.name.endsWith('.lua') ? <FileCode className="w-3 h-3 text-blue-500" /> :
                      f.name.endsWith('.md') ? <File className="w-3 h-3 text-slate-300" /> :
                      f.name.endsWith('.sh') ? <TerminalSquare className="w-3 h-3 text-emerald-400" /> :
                      f.name.endsWith('.ts') ? <FileCode className="w-3 h-3 text-blue-400" /> :
                      <FileJson className="w-3 h-3 text-emerald-400" />}
                     <span className="truncate">{f.name}</span>
                  </div>
                ))}
             </div>
             
             {/* Source of Truth Panel */}
             <div className="p-3 border-t border-neutral-800 bg-[#1e1e1e]/50 flex flex-col gap-2">
                <div className="font-mono text-[9px] uppercase tracking-widest text-indigo-400/80 font-bold flex items-center gap-1">
                  <Network className="w-3 h-3" /> Project Source of Truth
                </div>
                <div className="font-mono text-[10px] leading-relaxed text-neutral-400 whitespace-pre-wrap line-clamp-6">
                  {projectSourceOfTruth}
                </div>
             </div>
          </div>

          {/* Main Editor Area */}
          <div className="flex-1 flex flex-col overflow-hidden bg-[#1e1e1e]">
             {/* Open Files Bar */}
             <div className="h-9 flex bg-[#252526] border-b border-[#3c3c3c]">
                {activeFile && (
                   <div className="px-4 flex items-center gap-2 bg-[#1e1e1e] border-t border-indigo-500 text-indigo-300 font-mono text-[11px] h-full justify-center min-w-[120px]">
                      <span className="truncate">{activeFile.name}</span>
                   </div>
                )}
                <div className="flex-1" />
                <button onClick={handleExecute} className="px-4 flex items-center justify-center gap-1.5 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-900/20 transition-colors font-mono text-[10px] uppercase tracking-widest border-l border-[#3c3c3c]">
                  <Play className="w-3 h-3" /> Build & Run
                </button>
             </div>

             {/* Code Editor Space */}
             <div className="flex-1 flex overflow-hidden relative group">
                {/* Gutter */}
                <div className="w-12 bg-[#1e1e1e] text-[#6e7681] text-[13px] font-mono select-none flex flex-col py-4 text-right pr-3 border-r border-[#3c3c3c] overflow-hidden shrink-0">
                   {lines.map(l => (
                     <div key={l} className="leading-6 opacity-50">{l}</div>
                   ))}
                </div>
                {/* Editor Component */}
                <div className="flex-1 overflow-auto bg-transparent relative custom-scrollbar">
                  <Editor
                    value={activeFile?.content || ''}
                    onValueChange={handleContentChange}
                    highlight={code => Prism.highlight(code, getLanguage(activeFile?.type || ''), activeFile?.type || 'plain')}
                    padding={16}
                    style={{
                      fontFamily: '"JetBrains Mono", ui-monospace, SFMono-Regular, monospace',
                      fontSize: 13,
                      lineHeight: '24px',
                      outline: 'none',
                      backgroundColor: 'transparent',
                      color: '#d4d4d4'
                    }}
                    textareaClassName="focus:outline-none"
                  />
                </div>
             </div>
          </div>
       </div>

       {/* Collapsible Terminal */}
       <div className="border-t border-[#3c3c3c] bg-[#181818] flex flex-col shrink-0 z-10 transition-all duration-300">
          <div 
             className="h-9 flex items-center justify-between px-4 cursor-pointer hover:bg-[#2a2d2e] transition-colors"
             onClick={() => setIsTerminalOpen(!isTerminalOpen)}
          >
             <div className="flex items-center gap-2 text-neutral-400 font-mono text-[10px] uppercase tracking-widest">
                <TerminalSquare className="w-3.5 h-3.5" />
                Terminal
             </div>
             {isTerminalOpen ? <ChevronDown className="w-4 h-4 text-neutral-500" /> : <ChevronUp className="w-4 h-4 text-neutral-500" />}
          </div>
          
          <AnimatePresence initial={false}>
             {isTerminalOpen && (
                <motion.div 
                   initial={{ height: 0, opacity: 0 }}
                   animate={{ height: 220, opacity: 1 }}
                   exit={{ height: 0, opacity: 0 }}
                   transition={{ duration: 0.2 }}
                   className="border-t border-[#2d2d2d] bg-[#000000] p-3 overflow-y-auto font-mono text-xs text-neutral-300"
                >
                   {terminalLogs.map((log, i) => (
                      <div key={i} className={`whitespace-pre-wrap leading-relaxed ${log.includes('CRITICAL') ? 'text-red-500' : log.includes('error') ? 'text-amber-500' : log.startsWith('[+]') ? 'text-indigo-400' : 'text-neutral-300'}`}>
                         {log}
                      </div>
                   ))}
                   <div ref={terminalEndRef} />
                </motion.div>
             )}
          </AnimatePresence>
       </div>
    </div>
  );
}

function Code2Icon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}
