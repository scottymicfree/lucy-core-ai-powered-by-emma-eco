export function CommLink() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center text-neutral-500 border border-neutral-800 bg-neutral-900/20 rounded-xl overflow-hidden relative">
        <h2 className="font-mono text-xl text-neutral-300 mb-2 uppercase tracking-[0.2em] z-10">Comm-Link Activity Log</h2>
        <p className="font-mono text-xs z-10 max-w-sm text-center">Execute commands via the Chat Console to establish connection with Ring 0 Governance and Ring 1 Lucy Core.</p>
        
        <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_0,transparent_50%)]" />
    </div>
  );
}
