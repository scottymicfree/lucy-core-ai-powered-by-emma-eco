/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HexStage } from './HexStage';
import { Sidebar } from './Sidebar';
import { ChatConsole } from './ChatConsole';
import { useAppStore } from './store';
import { useEffect } from 'react';

export default function App() {
  const { initTelemetryStream } = useAppStore();

  useEffect(() => {
    initTelemetryStream();
  }, [initTelemetryStream]);

  return (
    <div className="flex flex-col w-full bg-black text-neutral-200 overflow-hidden font-sans" style={{ height: '100vh', touchAction: 'none' }}>
      <div className="flex h-full w-full relative">
        <Sidebar />
        <HexStage />
        <ChatConsole />
      </div>
    </div>
  );
}
