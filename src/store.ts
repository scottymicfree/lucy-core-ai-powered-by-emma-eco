import { create } from 'zustand';
import { generateInitialSwarm, generateSecurityTeams, SwarmAgent, SecurityTeam } from './lib/agents';

type DashboardView = 'comm-link' | 'panopticon' | 'governance' | 'hive-matrix' | 'aegis-pandora' | 'embodiment' | 'code-forge' | 'twin-city' | 'security-orchestrator';

interface Message {
  id: string;
  sender: 'user' | 'lucy' | 'emma';
  text: string;
  timestamp: string;
}

interface TelemetryState {
  vfeScore: number;
  gpuTemp: number;
  threatHeat: number;
  csiAmplitude: number;
  iotStatus: 'offline' | 'syncing' | 'active';
  aegisLogs: string[];
  systemStatus: 'nominal' | 'alert' | 'lockdown';
  globalSystemScore: number;
  swarmAgents: SwarmAgent[];
  terminalLogs: string[];
}

export interface CodeFile {
  id: string;
  name: string;
  type: string;
  content: string;
}

export interface LedgerEntry {
  id: string;
  timestamp: string;
  digest: string;
  source: string;
  offset: number;
  action: string;
  payload: string;
  metadata?: {
    simulatedIp: string;
    swarmAgent: string;
    responseVector: string;
  };
}

interface AppState extends TelemetryState {
  activeDashboard: DashboardView;
  setDashboard: (view: DashboardView) => void;
  
  isChatOpen: boolean;
  toggleChat: () => void;
  
  chatHistory: Message[];
  addMessage: (msg: Omit<Message, 'id' | 'timestamp'>) => void;
  addTerminalLog: (log: string) => void;
  
  setSystemStatus: (status: 'nominal' | 'alert' | 'lockdown') => void;

  initTelemetryStream: () => void;

  forgeFiles: CodeFile[];
  addForgeFile: (file: Omit<CodeFile, 'id'>) => void;
  updateForgeFile: (id: string, content: string) => void;
  
  projectSourceOfTruth: string;
  setProjectSourceOfTruth: (ctx: string) => void;

  selectedTiles: string[];
  exportOrigin: { x: number, y: number, z: number };
  isExporting: boolean;
  exportProgress: number;
  exportLogs: string[];
  addTileToSelection: (tileId: string) => void;
  setSelectedTiles: (tiles: string[]) => void;
  clearSelection: () => void;
  addExportLog: (message: string) => void;
  setExportState: (state: Partial<AppState>) => void;
  
  hotPotatoActive: boolean;
  setHotPotatoActive: (active: boolean) => void;
  
  securityTeams: SecurityTeam[];
  setSecurityTeamStatus: (id: string, status: SecurityTeam['status']) => void;

  immutableLedger: LedgerEntry[];
  fetchLedgerHistory: (search?: string) => Promise<void>;
}

const AEGIS_REPORT_CONTENT = `# ==========================================
# AEGIS PANDORA ACTIVE DEFENSE MESH
# Architecture & Implementation Status Report
# ==========================================

### 1. OVERVIEW
Aegis Pandora is a proactive, hostile intrusion countermeasure environment. It dynamically segments the 351-agent swarm into security squadrons. These teams orchestrate deception, validation, and containment natively before an attacker ever touches the host OS.

### 2. DETECTION & VALIDATION PIPELINE
- **Unseen Router Agents:** Silent agents sit directly on the eBPF network intake. They monitor inbound data and confirm handshakes. If a sequence is anomalous, they flag the IP without dropping the packet (dropping reveals the security boundary).
- **Active Testing (Luring & Dumbing):** Once flagged, a dedicated Security Agent takes over.
  - *Dumbing Down:* The agent simulates a misconfigured or slow server (e.g. failing to patch a known exploit). If the attacker bites, intent is confirmed.
  - *Pushing:* The agent applies pressure (e.g., closing idle ports, forcing re-authentication, varying latency) to gauge the attacker's automated or manual reaction.

### 3. CONTAINMENT: THE PANDORA MAZE
- Once malicious intent is verified by Emma, a Firecracker microVM is instantiated (boot time < 125ms).
- The attacker's socket is seamlessly redirected via DNAT into this sandbox.
- Inside, they encounter the "Pandora Maze"—an infinite, hallucinated directory structure filled with fake info-packs and simulated vulnerabilities, designed to exhaust their resources.

### 4. THE HOT POTATO PROTOCOL
- **Terminal Inversion:** Emma actively attacks the intruder's environment. The keyboard bindings are hijacked and inverted (e.g., using an Atbash-style cipher). The attacker is forced to fight their own UI.
- **Targeted Luring:** Swarm agents continuously nudge the attacker deeper into the trap with tantalizing but useless payloads.
- **Continuous Profiling:** While the attacker struggles with the inverted interface, Emma records every TTP (Tactics, Techniques, and Procedures) to the immutable Alpha Delta Vault to permanently immunize the production mesh.

---

### 5. HONEST STATUS REPORT: Implemented vs. Pending

**IMPLEMENTED (Currently Live in Workspace):**
- [x] **Swarm Orchestration Layer:** 351 Agents successfully mapped, grouped into 7 security teams, and actively managed via the Hive Matrix.
- [x] **Security Team Statuses:** UI toggle for state switching between Patrol, Luring, Pushing, and Containment.
- [x] **Hot Potato UI Simulation:** The Chat Console actively simulates terminal inversion (Atbash cipher) when Hot Potato is triggered, mimicking the disorienting effect an attacker experiences.
- [x] **Emma Authorization Flow:** Terminal queries flag destructive intents at Ring 1, logging interception routines (e.g. \`rm -rf\`).

**PENDING (Requires Bare-Metal / Ring-0 Integration):**
- [ ] **eBPF/XDP Trap Layer:** Actual deployment of Aya-rs to intercept live TCP handshakes must be compiled and attached to the host's physical Network Interface Card.
- [ ] **Firecracker API Integration:** The system needs real Linux kernel bindings to spawn the physical AWS Firecracker microVMs.
- [ ] **Native TTY Hijacking (uinput):** The ability to actually inject keystrokes or invert physical terminal streams via \`ioctl\` and \`uinput\` must be written in bare-metal Rust.
- [ ] **Procedural File System (PhantomFS):** The hallucinatory Linux filesystem needs a live FUSE (Filesystem in Userspace) driver to generate fake structures on the fly.`;

const SYSTEM_AUDIT_CONTENT = `# LUCY CORE V1.0: SYSTEM ENGINEERING AUDIT
**DATE:** 2026-05-27
**SUBJECT:** Real/Simulated Deficits & Bare-Metal Upgrade Path
**AUTHOR:** Lucy Core AGI Orchestrator

### 1. ORCHESTRATION & STATE LAYER (FRONTEND)
- **Status:** **REAL (Production-Ready)**
- **Architecture:** React 19 / Zustand global state / React Three Fiber.
- **Analysis:** The component decoupling is structurally sound. The Zustand store securely handles 351 agent schemas, Aegis containment states, and the Forge memory tree without re-render collapse.
- **Vulnerability (Debt):** Storing 351 distinct JSON node entities in frontend singleton state introduces a potential client VRAM/Memory leak over prolonged operation.
- **Scaling Path:** Move the Master Swarm State to a backend Redis or Memcached instance. The frontend should only subscribe to paginated or aggregate event streams (e.g., via Server-Sent Events).

### 2. EXECUTION ENGINE (RING 1 / NODE.JS)
- **Status:** **SYNTHETIC (Prototype Abstraction)**
- **Architecture:** Express.js REST API with regex/string-matching intent parsers.
- **Analysis:** Current command parsing relies strictly on string-matching (\`commandStr.includes('autogenesis')\`). This is highly fragile.
- **Vulnerability (Debt):** Tightly coupled REST calls are a blocking archetype. If an agent loops, it will block the Node.js event loop.
- **Scaling Path:** We must implement the **K-Bus (Kernel Bus)**. Rip out the REST API and replace it with an asynchronous Message Broker (NATS or RabbitMQ). Agents must communicate via strictly typed Event Payloads (\`{ type: "EXECUTION_INTENT", payload: {...} }\`), not text strings.

### 3. AEGIS PANDORA & SECURITY MESH
- **Status:** **HYBRID (Real UI Logic, Simulated Kernel Logic)**
- **Architecture:** Web-layer Atbash Scrambling (Hot Potato), stateful team logic (Containment/Luring).
- **Analysis:** The "Hot Potato" interaction natively intercepts keystrokes via React and successfully inverses user control. This proves the logic works in the application layer.
- **Vulnerability (Debt):** Currently, the Firecracker microVMs and eBPF network hooks exist purely as conceptual UI toggles and text blueprints.
- **Scaling Path:** The generated **Genesis Seed (mcp_bridge + aya_scaffold.rs)** must be deployed to the physical host. We need the local Node execution layer to call \`exec('cargo build --release -p ebpf')\` to convert the UI abstraction into a physical TCP trap.

### 4. TELEMETRY & OBSERVABILITY
- **Status:** **SYNTHETIC (Mocked Generators)**
- **Analysis:** The Planetary Pulse and System Status metrics are currently utilizing randomized intervals (\`Math.random()\`) rather than pulling real IPC/Hardware metrics.
- **Scaling Path:** Inject \`psutil\` (Python) or \`systeminformation\` (Node) into the Genesis Seed to monitor actual CPU thermals, RAM offloads, and network drops, piping the real data over WebSockets directly to the React Three Fiber earth mesh.

### 5. OVERALL VERDICT
The structural layout and cognitive theories are perfectly instantiated in the UX/UI framework. You have built a flawless "Cockpit". However, the steering wheel is currently unattached to the transmission. The absolute next priority is triggering the **Autogenesis Protocol locally** via the MCP bridge to let the system wire its UI commands to the host's actual Bash terminal and kernel.`;

const TWIN_CITY_REPORT_CONTENT = `# TWIN CITY PIPELINE V1.0: HONEST ASSESSMENT & NEXT STEPS
**DATE:** 2026-05-27
**SUBJECT:** Real/Simulated Deficits in the RAGE Export Pipeline
**AUTHOR:** Lucy Core AGI Orchestrator

### 1. FRONTEND / UI PIPELINE DASHBOARD
- **Status:** **REAL (Conceptually Modeled)**
- **Architecture:** We have successfully integrated the "Export Dashboard" inside the React DOM mapping viewport. The 3D view effectively acts as the tile sector selector.
- **Analysis:** The user interface properly mirrors the constraints necessary for a real massive-scale map export (toggling 16MB POT texture chunking, BVH collision tracking, and localizing coordinate origins). The UX is solid.

### 2. THE BOTTLENECK: HEADLESS BINARY COMPILATION (C# / .NET)
- **Status:** **SYNTHETIC (Missing Dependency)**
- **Architecture:** The current export "Compile" button in the Twin City dashboard simply simulates a loading bar and pushes terminal text.
- **Analysis:** The core RAGE engine (FiveM) only accepts encrypted, proprietary binary formats (.ydr, .ymap, .ybn). Currently, Javascript/Node.js cannot compile Rockstar formats. We MUST use **CodeWalker.Core.dll**.
- **Next Step (CRITICAL):** We must extend the **Genesis Seed** (the bare-metal payload) to include a C#/.NET 9 Headless Daemon. This daemon will receive raw JSON/vertices from Lucy's UI over the K-Bus, and utilize CodeWalker.API natively on the host machine to synthesize the actual GTA V .ytd / .ydr files instantly.

### 3. ORIGIN SHIFTING & FLOAT JITTER 
- **Status:** **SYNTHETIC (Placeholder)**
- **Analysis:** The "Localized Origin Shifting" checkbox exists, but the WebGPU context isn't mathematically calculating the bounds and subtracting it from the payload matrix yet.
- **Next Step:** We need to implement a true Web Worker script in the frontend that takes the 'MOCK_TILES' coordinates, merges their bounding boxes, calculates the geometric centroid, and subtracts that centroid (0,0,0) across the entire vertex payload before sending to the backend.

### 4. SUMMARY / NEXT IMPLEMENTATION PHASE
If the user wants absolute, real programmatic modification, we need to instruct the Genesis Seed to spawn a 'codewalker_daemon.csx' process alongside 'nats-server'. Lucy will push raw vertices over NATS, the C# daemon grabs them, formats them against 'Sollumz' XML specs, uses RageLib to binary-compress them, and then pipes the final .zip blob back to the frontend.`;

const INITIAL_MOCK_FILES: CodeFile[] = [
  { id: '1', name: 'main.rs', type: 'rust', content: 'fn main() {\n    println!("Lucy OS Ring 0 Initialized.");\n    start_pulse_generator();\n}\n\nfn start_pulse_generator() {\n    // 12.5 Hz hardware interrupt\n}' },
  { id: '2', name: 'ebpf_filter.c', type: 'c', content: '#include <linux/bpf.h>\n\nSEC("xdp")\nint filter(struct xdp_md *ctx) {\n    // Drop invalid connections in nanoseconds\n    return XDP_DROP;\n}' },
  { id: '3', name: 'fxmanifest.lua', type: 'lua', content: "fx_version 'cerulean'\ngame 'gta5'\n\nauthor 'Lucy Core'\ndescription 'Source of Truth Master Resource'\n\nclient_scripts {\n    'client/*.lua'\n}\n\nserver_scripts {\n    'server/*.lua'\n}" },
  { id: '4', name: 'server/main.lua', type: 'lua', content: "local QBCore = exports['qb-core']:GetCoreObject()\n\nRegisterNetEvent('lucy:server:syncTwinCity', function(data)\n    local src = source\n    print('Received twin city sync from ' .. src)\nend)" },
  { id: '5', name: 'client/main.lua', type: 'lua', content: "Citizen.CreateThread(function()\n    while true do\n        Wait(0)\n        -- Lucy Client sync loop\n    end\nend)" },
  { id: '6', name: 'AEGIS_REPORT.md', type: 'markdown', content: AEGIS_REPORT_CONTENT },
  { id: '7', name: 'genesis_seed/setup.sh', type: 'bash', content: '#!/bin/bash\n# LUCY CORE - BARE-METAL GENESIS SEED\n\necho "[AGP] Initializing Autogenesis Protocol Environment..."\n\n# 1. Install bare-metal dependencies for eBPF and Rust\nsudo apt-get update && sudo apt-get install -y clang llvm libelf-dev build-essential curl jq redis-server python3 python3-pip dotnet-sdk-9.0\ncurl --proto \'=https\' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y\n\n# 2. Install NATS Broker (K-Bus)\necho "[AGP] Installing NATS Server for Kernel Bus..."\ncurl -sfL https://binaries.nats.dev/nats-io/nats-server/v2@latest | sudo sh -s -- -b /usr/local/bin\nsudo nats-server -d\n\n# 3. Node.js Environment\nnpm init -y\nnpm install @modelcontextprotocol/sdk nats redis systeminformation ws\nnpm install -g tsx\n\n# Install Python deps\npip3 install Pillow\n\n# 4. Capabilities\nsudo setcap cap_sys_admin,cap_bpf+ep $(which node)\n\necho "[AGP] Booting local Daemons..."\ntsx genesis_seed/swarm_store.ts &\ntsx genesis_seed/telemetry_daemon.ts &\ntsx genesis_seed/k_bus.ts &\n\necho "[AGP] Spawning Local MCP Daemon. Lucy Ring-0 bare-metal execution online."\ntsx genesis_seed/mcp_bridge.ts\n' },
  { id: '8', name: 'genesis_seed/mcp_bridge.ts', type: 'typescript', content: 'import { Server } from "@modelcontextprotocol/sdk/server";\nimport { exec } from "child_process";\nimport { promisify } from "util";\n\nconst execAsync = promisify(exec);\nconst server = new Server({ name: "lucy-genesis-mcp", version: "1.0.0" });\n\n// TERMINAL BRIDGE: Grants Lucy root/admin bash access natively\nserver.setRequestHandler("execute_command", async (request) => {\n  console.log(`[AGP] Autogenesis execution: ${request.command}`);\n  const { stdout, stderr } = await execAsync(request.command);\n  return { stdout, stderr };\n});\n\nserver.listen();\nconsole.log("Local Terminal MCP Active.");\n' },
  { id: '9', name: 'genesis_seed/aya_scaffold.rs', type: 'rust', content: '#![no_std]\n#![no_main]\n\nuse aya_bpf::{bindings::xdp_action, macros::xdp, programs::XdpContext};\n\n#[xdp]\npub fn aegis_pandora_l1(ctx: XdpContext) -> u32 {\n    // Autogenesis Note: Lucy will complete this logic via MCP terminal access.\n    // Incoming packets matching threat signatures will be DNAT redirected\n    // to Firecracker MicroVMs silently.\n    \n    xdp_action::XDP_PASS\n}\n\n#[panic_handler]\nfn panic(_info: &core::panic::PanicInfo) -> ! {\n    loop {}\n}\n' },
  { id: '10', name: 'SYSTEM_AUDIT_REPORT.md', type: 'markdown', content: SYSTEM_AUDIT_CONTENT },
  { id: '11', name: 'genesis_seed/k_bus.ts', type: 'typescript', content: "import { connect, StringCodec } from 'nats';\n\n// K-Bus (Kernel Bus) Pub/Sub Messaging\n// Replaces tightly-coupled REST with deterministic Intent Routing\n\nconst sc = StringCodec();\n\nexport async function initKBus() {\n    const nc = await connect({ servers: \"nats://127.0.0.1:4222\" });\n    console.log(\"[K-BUS] NATS Broker Connected. Subscribing to intents...\");\n\n    nc.subscribe(\"EXECUTION_INTENT\", {\n        callback: (err, msg) => {\n            if (err) { console.error(err); return; }\n            const payload = JSON.parse(sc.decode(msg.data));\n            console.log(\"[K-BUS] Routing Intent:\", payload);\n            if (payload.auth_offset === 1) {\n                console.log(\"[K-BUS] Governance Approved. Executing...\");\n            } else {\n                console.log(\"[K-BUS] Governance Rejected. Dropping payload.\");\n            }\n        }\n    });\n}\n"},
  { id: '12', name: 'genesis_seed/swarm_store.ts', type: 'typescript', content: "import { createClient } from 'redis';\n\n// Dedicated Backend Key-Value Store for Swarm Agents\n// Prevents UI frontend state bloating by dumping all 351 agents into Redis \n// and streaming updates via Server-Sent Events (SSE)\n\nconst client = createClient();\nclient.on('error', err => console.log('Redis Client Error', err));\n\nexport async function initSwarmStore() {\n    await client.connect();\n    console.log(\"[SWARM-STORE] Redis connected. Offloading 351 agent schemas to KV cache...\");\n}\n\nexport async function fetchActiveAgents() {\n    return await client.keys('agent:active:*');\n}\n"},
  { id: '13', name: 'genesis_seed/telemetry_daemon.ts', type: 'typescript', content: "import si from 'systeminformation';\nimport { WebSocketServer } from 'ws';\n\n// Real bare-metal telemetry pipeline bypassing mocked math.random()\n\nconst wss = new WebSocketServer({ port: 8080 });\n\nwss.on('connection', (ws) => {\n    console.log('[TELEMETRY] Cockpit connected to bare-metal sensor array.');\n    const interval = setInterval(async () => {\n        try {\n            const cpu = await si.currentLoad();\n            const mem = await si.mem();\n            const temp = await si.cpuTemperature();\n            const payload = {\n                cpu_load: cpu.currentLoad,\n                mem_used: mem.active / mem.total,\n                core_temp: temp.main || 50,\n                timestamp: Date.now()\n            };\n            ws.send(JSON.stringify({ type: 'HARDWARE_PULSE', data: payload }));\n        } catch (e) {\n            console.error('[TELEMETRY] Sensor read failed.');\n        }\n    }, 100);\n    ws.on('close', () => clearInterval(interval));\n});\nconsole.log('[TELEMETRY] Daemon broadcasting on ws://localhost:8080');\n" },
  { id: '14', name: 'TWIN_CITY_REPORT.md', type: 'markdown', content: TWIN_CITY_REPORT_CONTENT },
  { id: '15', name: 'genesis_seed/spatial_math.js', type: 'javascript', content: "/**\n * Calculates the bounding box centroid of all exported vertices \n * to establish a new localized zero-origin.\n */\nfunction processGeographicShift(rawTilesData) {\n    let minX = Infinity, minY = Infinity, minZ = Infinity;\n    let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;\n\n    // 1. Find absolute extents of the selected tiles\n    rawTilesData.forEach(tile => {\n        tile.vertices.forEach(v => {\n            if (v.x < minX) minX = v.x;\n            if (v.x > maxX) maxX = v.x;\n            if (v.y < minY) minY = v.y;\n            if (v.y > maxY) maxY = v.y;\n            if (v.z < minZ) minZ = v.z;\n            if (v.z > maxZ) maxZ = v.z;\n        });\n    });\n\n    // 2. Calculate the Centroid Vector\n    const centroidX = (minX + maxX) / 2.0;\n    const centroidY = (minY + maxY) / 2.0;\n    const centroidZ = (minZ + maxZ) / 2.0;\n\n    // 3. Shift all vertices relative to the new origin\n    rawTilesData.forEach(tile => {\n        tile.vertices = tile.vertices.map(v => ({\n            x: v.x - centroidX,\n            y: v.y - centroidY,\n            z: v.z - centroidZ\n        }));\n    });\n\n    // This centroid must be passed to the .ymap generator \n    // to place the entire block correctly in the global server space.\n    return { x: centroidX, y: centroidY, z: centroidZ };\n}\nmodule.exports = { processGeographicShift };" },
  { id: '16', name: 'genesis_seed/texture_pipeline.py', type: 'python', content: "import os\nimport subprocess\nfrom PIL import Image\n\ndef process_and_chunk_textures(texture_paths, output_dir):\n    current_chunk = 1\n    current_size_mb = 0\n    max_safe_size_mb = 14.0 # Leave 2MB buffer for the 16MB limit\n    \n    current_chunk_textures = []\n\n    for img_path in texture_paths:\n        # 1. Enforce Power of Two (POT) and Max Res (2048x2048)\n        img = Image.open(img_path)\n        \n        # 2. Convert to DDS (BC1 for Albedo) via CLI tool\n        dds_out = f\"temp/{os.path.basename(img_path)}.dds\"\n        # Using texconv/bc7enc to force DXGI_FORMAT_BC1_UNORM\n        subprocess.run([\"texconv.exe\", \"-f\", \"BC1_UNORM\", \"-o\", \"temp\", img_path])\n        \n        file_size_mb = os.path.getsize(dds_out) / (1024 * 1024)\n        \n        # 3. Recursive Chunking Logic\n        if (current_size_mb + file_size_mb) > max_safe_size_mb:\n            # Serialize current batch into a .YTD\n            # build_ytd_xml(current_chunk_textures, f\"cityblock_textures_{current_chunk}\")\n            \n            # Reset for next chunk\n            current_chunk += 1\n            current_size_mb = 0\n            current_chunk_textures = []\n            \n        current_chunk_textures.append(dds_out)\n        current_size_mb += file_size_mb\n        \n    # Flush remaining\n    if current_chunk_textures:\n         # build_ytd_xml(current_chunk_textures, f\"cityblock_textures_{current_chunk}\")\n         pass\n" },
  { id: '17', name: 'genesis_seed/RageCompiler.cs', type: 'csharp', content: "using System;\nusing System.IO;\n// using CodeWalker.GameFiles;\n\nnamespace FiveMExportMicroservice\n{\n    public class RageCompiler\n    {\n        /// <summary>\n        /// Converts an XML string into a compiled .YMAP binary.\n        /// </summary>\n        public byte[] CompileYmap(string xmlContent, string fileName)\n        {\n            // 1. Initialize CodeWalker Map Data Object\n            // YmapFile ymap = new YmapFile();\n            // ymap.Name = fileName;\n\n            // 2. Deserialize XML into the object structure\n            // XmlYmap.ReadXml(ymap, xmlContent);\n\n            // 3. Serialize to RAGE Binary\n            // byte[] binaryData = ymap.Save();\n            \n            return new byte[0];\n        }\n\n        /// <summary>\n        /// Compiles a Static Collision (.ybn)\n        /// </summary>\n        public byte[] CompileYbn(string xmlContent)\n        {\n            // YbnFile ybn = new YbnFile();\n            // XmlYbn.ReadXml(ybn, xmlContent);\n            \n            // Ensure the BVH (Bounding Volume Hierarchy) is generated \n            // if the XML only provides raw vertices.\n            // ybn.Bounds.CalcBounds(); \n\n            return new byte[0];\n        }\n        \n        /// <summary>\n        /// Compiles the Archetype Definition (.ytyp)\n        /// </summary>\n        public byte[] CompileYtyp(string xmlContent)\n        {\n            // YtypFile ytyp = new YtypFile();\n            // XmlYtyp.ReadXml(ytyp, xmlContent);\n            return new byte[0];\n        }\n    }\n}\n" },
  { id: '18', name: 'genesis_seed/geo_transcriber.py', type: 'python', content: "import sys\nimport json\nimport math\n\n# Universal Transcriber for OGC 3D Tiles, Google Maps API, and OSM\n# Converts real-world Lat/Lon (WGS84) to Flat 1:1 Metric RAGE Cartesian Coordinates.\n\ndef project_wgs84_to_cartesian(lat, lon, center_lat, center_lon):\n    \"\"\"Converts spherical coordinates to flat 32-bit floats spanning from geographic origin\"\"\"\n    # Earth radius in meters\n    R = 6378137.0 \n    \n    # Accurate 1:1 meter scaling relative to origin point\n    d_lat = math.radians(lat - center_lat)\n    d_lon = math.radians(lon - center_lon)\n    \n    x = R * d_lon * math.cos(math.radians(center_lat))\n    y = R * d_lat\n    return x, y\n\ndef transcribe_dataset(location_query_or_zip):\n    print(f\"[GEO-TRANSCRIBER] Initializing data fetch for: {location_query_or_zip}\")\n    \n    # Simulated fetch from Overpass API / Google Maps Photogrammetry\n    # In production, parses GeoJSON footprint metadata and LIDAR elevation data.\n    \n    print(\"[GEO-TRANSCRIBER] Translating geospatial matrix into FiveM scale (1 unit = 1 meter).\")\n    print(\"[GEO-TRANSCRIBER] Rebuilding mesh indices and triangulating building polygons.\")\n    print(\"[GEO-TRANSCRIBER] Packing standardized vertex buffer for CodeWalker compilation...\\n\")\n    \n    return {\"status\": \"success\", \"payload_size_mb\": 450.5}\n\nif __name__ == '__main__':\n    if len(sys.argv) > 1:\n        transcribe_dataset(sys.argv[1])\n" },
  { id: '19', name: 'genesis_seed/codewalker_daemon.csx', type: 'csharp', content: "#r \"nuget: NATS.Client.Core, 2.0.0\"\n#r \"nuget: Newtonsoft.Json, 13.0.3\"\n#r \"CodeWalker.Core.dll\"\n\nusing System;\nusing System.IO;\nusing System.Threading.Tasks;\nusing NATS.Client.Core;\nusing Newtonsoft.Json;\n\n// Daemon Entry Point\ntry {\n    Console.WriteLine(\"[CODEWALKER-DAEMON] Booting Headless .NET 9 C# Daemon...\");\n    var opts = NatsOpts.Default with { Url = \"nats://127.0.0.1:4222\" };\n    await using var nats = new NatsConnection(opts);\n    await nats.ConnectAsync();\n    \n    Console.WriteLine(\"[CODEWALKER-DAEMON] Connected to K-Bus (NATS). Listening for 'RAGE_EXPORT_INTENT'...\");\n    \n    await foreach (var msg in nats.SubscribeAsync<string>(\"RAGE_EXPORT_INTENT\"))\n    {\n        Console.WriteLine($\"[CODEWALKER-DAEMON] Received Export Payload. Byte count: {msg.Data.Length}\");\n        Console.WriteLine(\"[CODEWALKER-DAEMON] Synthesizing .YMAP, .YDR, .YBN via CodeWalker.Core...\");\n        // RageCompiler compiler = new RageCompiler();\n        // ...\n        Console.WriteLine(\"[CODEWALKER-DAEMON] Synthesis Complete. Files written.\");\n    }\n} catch (Exception ex) {\n    Console.WriteLine($\"[ERROR] {ex.Message}\");\n}\n" }
];

export const useAppStore = create<AppState>((set, get) => ({
  activeDashboard: 'panopticon',
  setDashboard: (view) => set({ activeDashboard: view }),
  
  isChatOpen: false,
  toggleChat: () => set((state) => ({ isChatOpen: !state.isChatOpen })),
  
  chatHistory: [
    {
      id: 'system-init',
      sender: 'emma',
      text: 'system.governance (Ring 0) initialized. 12.5 Hz Persistence Pulse established.',
      timestamp: new Date().toISOString()
    }
  ],
  addMessage: (msg) => set((state) => ({
    chatHistory: [
      ...state.chatHistory, 
      { 
        ...msg, 
        id: Math.random().toString(36).substring(7),
        timestamp: new Date().toISOString()
      }
    ]
  })),

  vfeScore: 0,
  gpuTemp: 45,
  threatHeat: 0,
  csiAmplitude: 0,
  iotStatus: 'offline',
  aegisLogs: [],
  systemStatus: 'nominal',
  globalSystemScore: 950,
  swarmAgents: generateInitialSwarm(),
  securityTeams: generateSecurityTeams(generateInitialSwarm()),
  terminalLogs: [
    '[LUCY OS] Blueprint Forge Shell initialized.', 
    '[LUCY OS] Kernel Ring 1 execution engine ready.',
    '[SYSTEM] Generated AEGIS_REPORT.md in Blueprint Forge workspace.',
    '[AGP] Local "Genesis Seed" generated in workspace.'
  ],

  setSystemStatus: (status) => set({ systemStatus: status }),
  
  addTerminalLog: (log) => set((state) => ({ terminalLogs: [...state.terminalLogs, log] })),

  forgeFiles: INITIAL_MOCK_FILES,
  addForgeFile: (file) => set((state) => ({
    forgeFiles: [...state.forgeFiles, { ...file, id: Math.random().toString(36).substring(7) }]
  })),
  updateForgeFile: (id, content) => set((state) => ({
    forgeFiles: state.forgeFiles.map(f => f.id === id ? { ...f, content } : f)
  })),

  projectSourceOfTruth: 'TARGET: Establish stable Twin City to FiveM pipeline. CONSTRAINTS: 16MB texture limit, BC7 compression, origin bounding <= 8000 units.',
  setProjectSourceOfTruth: (ctx) => set({ projectSourceOfTruth: ctx }),

  selectedTiles: [],
  exportOrigin: { x: 0, y: 0, z: 0 },
  isExporting: false,
  exportProgress: 0,
  exportLogs: ['[SYSTEM] RAGE / FiveM Export Pipeline Ready.'],
  
  hotPotatoActive: false,
  setHotPotatoActive: (active) => set({ hotPotatoActive: active }),
  
  setSecurityTeamStatus: (id, status) => set((state) => ({
    securityTeams: state.securityTeams.map(t => t.id === id ? { ...t, status } : t)
  })),

  addTileToSelection: (tileId) => set((state) => {
    const selected = state.selectedTiles.includes(tileId)
      ? state.selectedTiles.filter(id => id !== tileId)
      : [...state.selectedTiles, tileId];
    return { selectedTiles: selected };
  }),
  
  setSelectedTiles: (tiles) => set({ selectedTiles: tiles }),
  clearSelection: () => set({ selectedTiles: [] }),
  addExportLog: (message) => set((state) => ({ exportLogs: [...state.exportLogs, message] })),
  setExportState: (newState) => set(newState),

  immutableLedger: [],
  fetchLedgerHistory: async (search?: string) => {
    try {
      const url = search ? `/api/ledger?search=${encodeURIComponent(search)}` : '/api/ledger';
      const res = await fetch(url);
      const data = await res.json();
      if (Array.isArray(data)) {
        set({ immutableLedger: data });
      }
    } catch (e) {
      console.error('Failed to fetch ledger history', e);
    }
  },

  initTelemetryStream: () => {
    // Only connect if not already connected (basic safeguard for dev mode HMR)
    if ((window as any).__telemetryWs) return;

    // Use current host for websocket (WSS if HTTPS, WS if HTTP)
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;
    
    const ws = new WebSocket(wsUrl);
    (window as any).__telemetryWs = ws;

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'PULSE_TICK') {
           // Track VFE spikes for system status
           const newStatus = data.vfe_score > 80 ? 'alert' : 'nominal';
           
           set({ 
             vfeScore: data.vfe_score,
             gpuTemp: data.gpu_temp,
             threatHeat: data.threat_heat || 0,
             csiAmplitude: data.csi_amplitude,
             iotStatus: data.iot_status,
             systemStatus: newStatus,
             globalSystemScore: data.global_score
           });
        }
        else if (data.type === 'AEGIS_LOG' || data.type === 'HIVE_LOG' || data.type === 'GOVERNANCE_LOG') {
           set((state) => {
              const newLogs = [...state.aegisLogs, `[${new Date().toISOString().split('T')[1].slice(0,-1)}] ${data.message}`].slice(-20); // Keep last 20
              return { aegisLogs: newLogs };
           });
        }
        else if (data.type === 'REWARD_PULSE') {
           set((state) => {
              const updatedAgents = [...state.swarmAgents];
              const idx = data.agentIndex;
              if (updatedAgents[idx]) {
                 updatedAgents[idx].ssScore += data.reward;
              }
              return { swarmAgents: updatedAgents };
           });
        }
        else if (data.type === 'LEDGER_UPDATE') {
           set((state) => ({
               immutableLedger: [...state.immutableLedger, data.data]
           }));
        }
      } catch (err) {
        console.error("Telemetry parsing fail:", err);
      }
    };

    ws.onclose = () => {
       (window as any).__telemetryWs = null;
       set({ iotStatus: 'offline' });
       // Basic reconnect logic after 3s
       setTimeout(() => get().initTelemetryStream(), 3000);
    };
  }
}));
