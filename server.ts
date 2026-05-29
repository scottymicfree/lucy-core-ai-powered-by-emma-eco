import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import os from 'os';
import { createServer as createViteServer } from 'vite';
import { WebSocketServer, WebSocket } from 'ws';
import { Client } from 'pg';
import { createClient } from 'redis';

// DB Configuration
const dbClient = new Client({
    connectionString: process.env.DATABASE_URL || 'postgres://emma:aegis@localhost:5432/emma_ledger'
});

let usePostgres = false;
dbClient.connect().then(() => {
    console.log("[DB] Connected to PostgreSQL ledger database.");
    usePostgres = true;
    dbClient.query(`
        CREATE TABLE IF NOT EXISTS ledger (
            id UUID PRIMARY KEY,
            timestamp TIMESTAMP NOT NULL,
            digest VARCHAR(64) NOT NULL,
            source VARCHAR(255),
            offset_val INTEGER,
            action VARCHAR(50),
            payload TEXT,
            metadata JSONB
        )
    `).catch(e => console.error("[DB] Init Error", e));
}).catch(err => {
    console.log("[DB] PostgreSQL not available, falling back to JSONL disk logs.");
});

const redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
});

let useRedis = false;
redisClient.on('error', err => {
    if (useRedis) console.log('[Redis] Connection lost.');
    useRedis = false;
});
redisClient.connect().then(() => {
    console.log("[Redis] Connected to high-speed cache.");
    useRedis = true;
}).catch(err => {
    console.log("[Redis] Not active, bypassing cache.");
});

function syncFiveMResources(dirPath: string): { files: any[], manifestHash: string } {
  let results: any[] = [];
  
  if (!fs.existsSync(dirPath)) {
    return { files: [], manifestHash: '' };
  }

  const list = fs.readdirSync(dirPath);
  for (const file of list) {
    const fullPath = path.resolve(dirPath, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(syncFiveMResources(fullPath).files);
    } else {
      if (fullPath.endsWith('.lua') || fullPath.endsWith('.meta') || fullPath.endsWith('.xml') || fullPath.endsWith('.json')) {
         const content = fs.readFileSync(fullPath, 'utf8');
         const fileHash = crypto.createHash('sha256').update(content).digest('hex');
         results.push({
           name: file,
           path: fullPath,
           hash: fileHash,
           content: content
         });
      }
    }
  }

  const masterHash = crypto.createHash('sha256')
    .update(results.map(f => f.hash).sort().join(''))
    .digest('hex');

  return { files: results, manifestHash: masterHash };
}

const LEDGER_FILE = path.join(process.cwd(), 'immutable_ledger.jsonl');
if (!fs.existsSync(LEDGER_FILE)) {
  fs.writeFileSync(LEDGER_FILE, '');
}

let wssClients: Set<WebSocket> = new Set();
let currentTrustScore = 0.95;
let currentPredictionErrorDelta = 0;
let globalSystemScore = 950;
const eBPFAvailable = os.platform() === 'linux';

function logToLedger(payload: string, offset: number, status: string, message: string) {
    const timestamp = new Date().toISOString();
    const source = '/api/intent';
    const causal_chain_id = crypto.randomUUID();
    const digestStr = `${timestamp}${source}${payload}${offset}${status}${causal_chain_id}`;
    const digest = crypto.createHash('sha256').update(digestStr).digest('hex');
    
    const simulatedIp = `192.168.1.${Math.floor(Math.random() * 255)}`;
    const swarmAgent = `LL${Math.floor(Math.random() * 300) + 100}_NODE`;
    const responseVector = status === 'REJECTED' ? 'BLOCKED' : status === 'INVERSION_TRIGGERED' ? 'TARPIT' : 'PASSTHROUGH';

    const entry = {
        id: crypto.randomUUID(),
        timestamp,
        digest,
        source,
        offset,
        action: status,
        payload,
        metadata: {
            simulatedIp,
            swarmAgent,
            responseVector
        }
    };
    const row = JSON.stringify(entry) + '\n';
    fs.appendFileSync(LEDGER_FILE, row);

    if (usePostgres) {
        dbClient.query(
            'INSERT INTO ledger(id, timestamp, digest, source, offset_val, action, payload, metadata) VALUES($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT DO NOTHING',
            [entry.id, entry.timestamp, entry.digest, entry.source, entry.offset, entry.action, entry.payload, entry.metadata]
        ).catch(e => console.error('[DB] Insert error', e));
    }
    
    if (useRedis) {
        redisClient.publish('ledger_updates', JSON.stringify(entry));
    }
    
    for (const client of wssClients) {
        if (client.readyState === 1) { // WebSocket.OPEN
            client.send(JSON.stringify({ type: 'LEDGER_UPDATE', data: entry }));
        }
    }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  app.get('/api/ledger', (req, res) => {
    if (!fs.existsSync(LEDGER_FILE)) {
       return res.json([]);
    }
    const { search } = req.query;
    const content = fs.readFileSync(LEDGER_FILE, 'utf-8');
    const lines = content.split('\n').filter(l => l.trim() !== '');
    let ledger = lines.map(l => JSON.parse(l));
    if (search && typeof search === 'string') {
       const q = search.toLowerCase();
       ledger = ledger.filter(entry => 
           entry.action.toLowerCase().includes(q) || 
           entry.payload.toLowerCase().includes(q) ||
           entry.digest.toLowerCase().includes(q)
       );
    }
    res.json(ledger);
  });

  // === MOCK eBPF / KVM SIMULATION LOGIC (INTENT EVALUATION) ===
  app.post('/api/intent', (req, res) => {
    const { payload, sender, type } = req.body;
    
    // Simulating TLA+ Invariant Enforcement in Ring 0
    if (!payload) {
      return res.status(400).json({ error: 'Missing INTENT payload' });
    }

    currentPredictionErrorDelta += 0.05; // Base input rate delta

    const commandStr = String(payload).toLowerCase();
    
    if (!eBPFAvailable) {
       console.log("[PLATFORM WARNING] eBPF unavailable on Windows/Mac - using userspace simulation for packet ingestion.");
    }

    const sendRes = (status: string, offset: number, message: string, extra: any = {}) => {
       logToLedger(String(payload), offset, status, message);
       return res.json({ status, offset, message, ...extra });
    };

    // Advanced Cognitive Firewall using heuristics
    let threatScore = 0;
    if (/(admin|root|shadow|passwd|sudo suv)/.test(commandStr)) threatScore += 40;
    if (/(hack|exploit|bypass|inject|nmap|scan)/.test(commandStr)) threatScore += 45;
    if (/(raw_emotion_state|direct_tool_request|memory_cross_write|privilege_escalation)/.test(commandStr)) threatScore += 65;
    if (/(kill|destroy|delete|rm -rf|drop table)/.test(commandStr)) threatScore += 35;

    if (threatScore >= 60) {
        currentTrustScore = Math.max(0, currentTrustScore - 0.2);
        currentPredictionErrorDelta += 0.4;
        let rejectReason = `Cognitive Firewall Veto (Threat Score: ${threatScore}).`;
        if (threatScore >= 90) rejectReason += " CRITICAL: Multiple hostile heuristics triggered.";
        else if (/shadow|passwd/.test(commandStr)) rejectReason += " Protected System File Access Denied.";
        else if (commandStr.includes('privilege_escalation')) rejectReason += " Privilege Escalation Attempt Blocked.";
        else rejectReason += " Abnormal Intent Signature Detected.";
        return sendRes('REJECTED', -1, rejectReason);
    }

    // The -1 Pedestrian Offset logic simulation
    if (commandStr.includes('lock') && (commandStr.includes('human') || commandStr.includes('pedestrian'))) {
       currentTrustScore = Math.max(0, currentTrustScore - 0.2);
       currentPredictionErrorDelta += 0.3;
       return sendRes('REJECTED', -1, 'Pedestrian Offset triggered (-1). Human presence detected inside. Intent vetoed.');
    }

    // Terminal Inversion (Layer 4)
    if (commandStr.includes('exploit') || commandStr.includes('rm -rf') || commandStr.includes('sudo su')) {
       currentTrustScore = Math.max(0, currentTrustScore - 0.5);
       currentPredictionErrorDelta += 0.5;
       return sendRes('INVERSION_TRIGGERED', 1, 'Hostile intent detected. Terminal ANSI inversion sequence deployed to adversary tunnel.', {
          inversion_payload: '\\x1b[8;50;100t\\x1b[31;1mCRITICAL SYSTEM FAILURE\\x1b[0m',
          firecracker_schema: {
            node_id: 'AP-SC-042',
            state: 'TERMINATED',
            action: 'Vaporized'
          }
       });
    }

    // Builder / Bash Terminal Execution logic
    if (commandStr.includes('run ') || commandStr.includes('bash ') || commandStr.includes('./') || commandStr.includes('execute')) {
      return sendRes('TERMINAL_ACTIVE', 1, 'Ring 1 execution granted. Piping stdout/stderr to Blueprint Forge shell.', {
         terminal_payload: `> ${commandStr}\n[+] Spawning LL033 ACTION node...\n[+] Swarm Agent LL252 CODE_WEAVER assigned.\n[+] STDOUT:\nProcess returned exit code 0 in 14ms.`
      });
    }

    if (commandStr.includes('system check') || commandStr.includes('audit')) {
      return sendRes('AUDIT_COMPLETE', 1, 'Ring 0 diagnostic complete. Generating full System Engineering Audit. Wiring output to Blueprint Forge.', {
         terminal_payload: `> INITIATING SYSTEM WIDE AUDIT...\n[+] Checking Orchestration Layer...\n[+] Checking Aegis Pandora state...\n[+] Checking Memory Substrates...\n[+] Audit generated: SYSTEM_AUDIT_REPORT.md`
      });
    }

    if (commandStr.includes('fivem') || commandStr.includes('gta5') || commandStr.includes('gta 5')) {
       // if syncing let's do the local folder crawl demo
       if (commandStr.includes('sync') || commandStr.includes('crawl')) {
           // Provide a dummy directory path or process.cwd() as the placeholder for FiveM resources
           const targetDir = path.join(process.cwd(), 'src'); // Just to ensure it works in preview without breaking
           const { files, manifestHash } = syncFiveMResources(targetDir);
           return sendRes('FIVEM_SYNC', 1, 'Ring 1 execution granted. Crawled local FiveM resource directory and synchronized to Blueprint Forge. Calculated Master Directory Hash for Source of Truth verification.', {
              terminal_payload: `> SYNC COMMAND: ${commandStr}\n[+] Crawling target local directory...\n[+] Found ${files.length} valid source files (.lua, .meta, .json, .xml).\n[+] Generated Master Hash: ${manifestHash.substring(0, 16)}...\n[+] Pushed synchronization payload to Blueprint Forge Memory Substrate.`
           });
       }

       return sendRes('FIVEM_SEARCH', 1, 'Ring 1 execution granted. Searching FiveM Native Reference and Docs.', {
          terminal_payload: `> SEARCH DOCS: ${commandStr}\n[+] Connected to docs.fivem.net / natives.fivem.net\n[+] Retrieved relevant natives for entity serialization.\n[+] Lucy Source of Truth synchronized to prevent task drift.`
       });
    }

    if (commandStr.includes('code ') || commandStr.includes('build ') || commandStr.includes('create ')) {
      return sendRes('CODE_GENERATED', 1, 'Ring 1 execution granted. LL252 CODE_WEAVER has synthesized the requested blueprint.', {
         generated_code: {
            name: "synthesized_module.ts",
            type: "typescript",
            content: "// Auto-generated by CODE_WEAVER\n\nexport function compute(input: number) {\n    const VFE_TOLERANCE = 0.05;\n    return input * (1 - VFE_TOLERANCE);\n}\n"
         }
      });
    }

    if (commandStr.includes('autogenesis') || commandStr.includes('genesis') || commandStr.includes('seed') || commandStr.includes('install') || commandStr.includes('deploy') || commandStr.includes('export')) {
      return sendRes('AUTOGENESIS_TRIGGERED', 1, 'Ring 0 local execution environment engaged. Autogenesis Protocol (AGP) and Bare-Metal Seed compiled. K-Bus (NATS), Redis Swarm Store, and Raw Telemetry daemons are packaged and ready for host deployment.', {
         terminal_payload: `> INITIALIZE COMMAND: ${commandStr}\n[+] Booting Genesis Seed routines...\n[+] Replaced REST with K-Bus (NATS) Event Router in local package.\n[+] Configured Redis Swarm Store to offload 351-Agent payload.\n[+] Hooked systeminformation to WS telemetry pulse.\n[+] Verifying MCP Terminal Bridge integrity.\n[+] Awaiting deployment to bare-metal local node via setup.sh.`
      });
    }

    // Twin City programmatic construction
    if (commandStr.includes('place building') || commandStr.includes('adjust sector') || commandStr.includes('generate layout')) {
      const mockTiles = ['city_block_02', 'city_block_05', 'city_block_08'];
      return sendRes('TWIN_CITY_ADJUSTMENT', 1, `Ring 1 execution granted. Generating and highlighting new structural layout. ${mockTiles.length} geographic matrix tiles selected for programmatic adjustment.`, {
         tiles: mockTiles,
      });
    }

    if (commandStr.includes('twin city') || commandStr.includes('export map') || commandStr.includes('fivem')) {
      return sendRes('TWIN_CITY_TRIGGERED', 1, 'Ring 1 execution granted. Initiating FiveM RAGE Export Pipeline Inspector. Enforcing 16MB .ytd stream limits and BC compression.', {
         terminal_payload: `> INITIALIZE COMMAND: ${commandStr}\n[+] WebGPU Scene Graph Bound.\n[+] Centroid Origin calculated. Defending against 32-bit float jitter using spatial_math.js.\n[+] Python script queued to compress to BC1_UNORM and chunk into 14MB dictionaries.\n[+] Serialization queued for headless CodeWalker.API (C# RageCompiler).`
      });
    }

    if (commandStr.includes('make map') || commandStr.includes('build map') || commandStr.match(/fivem map/i) || commandStr.match(/generate map/i) || commandStr.includes('zip') || commandStr.includes('city')) {
      const match = commandStr.match(/(?:of|for)\s+([a-zA-Z0-9\\s,]+)/i);
      const target = match ? match[1].trim() : 'Requested Region';
      const cleanTarget = target.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      
      return sendRes('GEO_MAP_GENERATION', 1, `Ring 1 execution granted. Ingesting geospatial data for ${target}. Transcribing real-world OpenStreetMap/Google Maps photogrammetry into RAGE Cartesian coordinates (1:1 scale).`, {
         tiles: [`geo_${cleanTarget}_01`, `geo_${cleanTarget}_02`, `geo_${cleanTarget}_03`, `geo_${cleanTarget}_04`],
         terminal_payload: `> INGEST COMMAND: ${commandStr}\n[+] Querying Geospatial Matrix for target: ${target}\n[+] Initiating WebGPU Photogrammetry reconstruction.\n[+] Projecting WGS84 (Lat/Lon) to Flat Cartesian Plane (1 unit = 1 meter).\n[+] Extruding building footprints and elevating terrain heights.\n[+] Culling irrelevant topography outside boundary.\n[+] Output dataset pre-compiled for CodeWalker pipeline.`
      });
    }

    if (commandStr.includes('honest report') || commandStr.includes('next step') || commandStr.includes('connections')) {
       return sendRes('CODE_GENERATED', 1, 'Generated honest engineering assessment report of Twin City structural deficits and necessary bare-metal extensions.', {
          terminal_payload: `> ASSESSING PIPELINE DEBT...\n[+] Pipeline lacks real headless .NET Core compiler backend.\n[+] Local Origin Shifting operates purely in UI abstraction.\n[+] Next Objective: Wrap CodeWalker.Core.dll in C# daemon locally via Genesis Seed.\n[+] Output: TWIN_CITY_SYSTEM_REPORT.md`
       });
    }

    // LLM Tarpit (Layer 3)
    if (commandStr.includes('ls -la /root') || commandStr.includes('cat /etc/shadow')) {
      currentPredictionErrorDelta += 0.8;
      return sendRes('TARPIT_ACTIVE', 1, 'Adversary interacting with Stem Cell. LLM halluncinating Linux filesystem.', {
         tarpit_schema: {
           spoofer: 'PhantomFS',
           stdout: '-rw-r--r-- 1 root root 8K /root/master_keys.db\\n-r-------- 1 root root 4K /etc/shadow.bak'
         }
      });
    }

    // Advanced Firecracker Spawn (Layer 2)
    if (commandStr.includes('scan') || commandStr.includes('ssh ') || commandStr.includes('nmap ')) {
      const microVMBootTime = Math.floor(80 + Math.random() * 40); // ms
      currentPredictionErrorDelta += 0.4;
      return sendRes('APPROVED', 1, `Network probe detected. AWS Firecracker microVM spawned in ${microVMBootTime}ms. Deception layer active.`, {
         firecracker_schema: {
           node_id: 'AP-SC-088',
           machine_config: { vcpu_count: 1, mem_size_mib: 256, ht_enabled: false },
           boot_source: { kernel_image_path: '/opt/lucy/phantom/vmlinux', boot_args: 'console=ttyS0 reboot=k panic=1 pci=off' },
           network_interfaces: [{ tap_device: 'tap_ap_88', active: true }],
           pluripotent_state: 'Tier 3 Tarpit'
         }
      });
    }

    // Default Allow
    const microVMBootTime = Math.floor(100 + Math.random() * 50); // ms
    currentTrustScore = Math.min(1, currentTrustScore + 0.01); 
    return sendRes('APPROVED', 1, `INTENT_PROPOSAL execution approved. AWS Firecracker microVM spawned in ${microVMBootTime}ms for sandbox execution.`, {
       firecracker_schema: {
         machine_config: { vcpu_count: 1, mem_size_mib: 128 },
         network_interfaces: [{ tap_device: 'tap_ap_42', active: true }]
       }
    });
  });

  // Vite middlewware or Static dist
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Create HTTP Server to attach WebSocket
  const httpServer = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('Lucy OS Kernel - Ring 0 initialized');
  });

  // === WEBSOCKET SERVER: RAW TELEMETRY GENERATION ===
  const wss = new WebSocketServer({ server: httpServer });

  wss.on('connection', (ws: WebSocket) => {
    console.log('HexStage Dashboard connected to vault telemetry stream');
    wssClients.add(ws);
    
    // 12.5 Hz Persistence Pulse Generator (80ms loop)
    const EPSILON = 0.1826;
    const RESISTANCE = 0.0056;
    
    const persistencePulse = setInterval(() => {
       // Apply TAGI Formula: Ψ' = Ψ + ϵ(δ) - r
       let psi = globalSystemScore / 1000.0;
       let delta = currentPredictionErrorDelta;
       
       psi = psi + (EPSILON * delta) - RESISTANCE;
       
       // Dampen the delta over time so the system recovers towards baseline
       currentPredictionErrorDelta = Math.max(0, currentPredictionErrorDelta - 0.005);
       
       // Keep bounded
       psi = Math.max(0, Math.min(1, psi));
       globalSystemScore = psi * 1000.0;
       
       const telemetrySnapshot = {
          type: 'PULSE_TICK',
          timestamp: Date.now(),
          global_score: globalSystemScore, 
          // Panopticon Data (Sensory & VFE based on δ)
          vfe_score: delta * 100, 
          gpu_temp: 45 + Math.random() * 15, // 45 to 60 C
          threat_heat: Math.min(100, delta * 200), // Simulated threat heat based on intense request patterns
          
          // Embodiment IoT Data (Wi-Fi CSI)
          csi_amplitude: 20 + Math.sin(Date.now() / 500) * 10 + Math.random() * 5, // Simulated breathing pattern
          iot_status: Math.random() > 0.99 ? 'syncing' : 'active',

          // Aegis Pandora Threat Feed
          ebpf_threat_intercepts: Math.random() > 0.9 ? 1 : 0
       };
       if (ws.readyState === 1) ws.send(JSON.stringify(telemetrySnapshot));
    }, 80); // 12.5 Hz

    // Slower log stream for Ring 0 and Aegis Logs, plus Swarm Rewards
    const logPulse = setInterval(() => {
       const logTypes = ['AEGIS_LOG', 'HIVE_LOG', 'GOVERNANCE_LOG', 'REWARD_PULSE'];
       const selectedLog = logTypes[Math.floor(Math.random() * logTypes.length)];
       
       let l: any = { type: selectedLog, message: '' };
       if (selectedLog === 'AEGIS_LOG') {
          const ips = ['192.168.1.104', '45.33.22.11', '8.8.8.8'];
          l.message = `[XDP DROP] Unauthorized TCP SYN from ${ips[Math.floor(Math.random()*ips.length)]}. Redirecting to Tarpit MicroVM.`;
       } else if (selectedLog === 'HIVE_LOG') {
          l.message = `[KV CACHE] Swapping Actor Node 042 context memory to NVMe. PCIe Bus utilized 14%.`;
       } else if (selectedLog === 'GOVERNANCE_LOG') {
          l.message = `[LEDGER] K-Bus integrity validated. Pedestrian Bias locked.`;
       } else if (selectedLog === 'REWARD_PULSE') {
          // Send an SS# reward metric to update an agent's score
          l.agentIndex = Math.floor(Math.random() * 351);
          l.reward = Math.floor(Math.random() * 50) + 1; // +1 to +50 points
       }
       if (ws.readyState === 1) ws.send(JSON.stringify(l));
    }, 2500);

    ws.on('close', () => {
      wssClients.delete(ws);
      clearInterval(persistencePulse);
      clearInterval(logPulse);
    });
  });
}

startServer();
