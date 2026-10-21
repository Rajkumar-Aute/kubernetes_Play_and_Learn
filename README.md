# 🚀 KubeDefender: Play & Learn Kubernetes

> **Interactive Kubernetes Strategy & Simulation Game — Built for Web & YouTube Playables.**
> Master Kubernetes architecture, debugging, networking, and scaling by running, defending, and healing a live production cluster!

---

## 🎮 Game Overview

**KubeDefender** transforms complex DevOps and Cloud Native concepts into an intuitive, high-adrenaline interactive game. Players manage traffic waves, deploy pods, balance microservice networking, diagnose `CrashLoopBackOff` errors, fix memory `OOMKilled` crashes, execute zero-downtime rolling updates, and withstand datacenter chaos.

### 🌟 Core Game Modes

1. **Campaign Missions (Play & Learn)**:
   - **Mission 1: Hello Pod** — The atomic unit of Kubernetes, containers, ports, and scheduling.
   - **Mission 2: Traffic Surge & ReplicaSets** — Managing high availability and scaling pods under load.
   - **Mission 3: Services & Load Balancing** — Stable ClusterIP networking, endpoints, and label selectors (`app: web`).
   - **Mission 4: CrashLoopBackOff!** — Debugging container boot failures, checking `kubectl logs`, and injecting ConfigMaps/environment secrets.
   - **Mission 5: OOMKilled & Limits** — Linux cgroups, memory limits vs CPU throttling, and Exit Code 137.
   - **Mission 6: Zero-Downtime Rolling Update** — Upgrading to `v2.0` with Readiness Probes without dropping a single packet.
   - **Mission 7: Chaos Monkey & Node Failure** — Worker node power loss, kubelet heartbeats, and controller-manager self-healing.
   - **Mission 8: Horizontal Pod Autoscaler (HPA)** — Autonomous elastic scaling driven by real-time CPU metric thresholds.

2. **Chaos Arcade Mode (High Score / Survival)**:
   - Endless waves of unpredictable microservice traffic.
   - Sudden hardware crashes, network partitions, and payload memory spikes.
   - High score engine with SLA multipliers (99.99% SLA = 3x score boost), integrated with **YouTube Playables Leaderboard API**.

---

## 🛠️ YouTube Playables SDK Integration

This game complies fully with all **YouTube Playables** technical specifications:

- **SDK Loaded First**: `<script src="https://www.youtube.com/game_api/v1"></script>` included in `<head>`.
- **Lifecycle Integration**:
  - `ytgame.game.firstFrameReady()`: Dispatched on initial frame render.
  - `ytgame.game.gameReady()`: Dispatched after assets and simulation engine are initialized.
  - `ytgame.system.onPause` & `ytgame.system.onResume`: Pauses simulation and mutes audio when YouTube overlays appear.
  - `ytgame.system.isAudioEnabled` & `ytgame.system.onAudioEnabledChange`: Keeps audio synchronized with YouTube UI toggles.
  - `ytgame.game.saveData` & `ytgame.game.loadData`: Cloud state persistence for user level unlocks.
  - `ytgame.engagement.sendScore`: Submits player scores to YouTube Playables.
- **Pure Web Audio API**: No external MP3/WAV dependencies; sound effects are procedurally generated in code for instant zero-latency playback.
- **Adaptive Responsive Design**: Supports portrait (9:16) on mobile phones, landscape (16:9) on desktops/tablets, with touch and keyboard controls.
- **Ultra-lightweight Bundle**: Zero bloat, ~100 kB gzipped total bundle size for instant loading.

---

## 💻 Tech Stack

- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler**: [Vite](https://vite.dev/) (relative base path `./` for seamless embedding in webviews and iframes)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) + Custom Cyberpunk / K8s Theme
- **Icons**: [Lucide React](https://lucide.dev/)
- **Audio**: Web Audio API Procedural Synthesizer
- **Particles**: Canvas-Confetti

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm or pnpm

### Run Locally

```bash
# Install dependencies
npm install

# Start local development server
npm run dev
```

Open your browser at `http://localhost:5173`.

### Build for Production & YouTube Playables

```bash
# Build optimized production bundle
npm run build
```

The output will be generated inside the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

---

## 📦 Packaging for YouTube Playables

To submit your game to the **YouTube Playables** program:
1. Run `npm run build`.
2. Zip the contents of the `dist/` directory (make sure `index.html` is at the root of the `.zip` archive).
3. Submit the zip archive via the [YouTube Playables Submission Portal](https://support.google.com/youtube/answer/13838048).

---

## 📜 Interactive `kubectl` Cheatsheet Included in Game

| Command | Action |
|---|---|
| `kubectl get pods` | View pod statuses (`Running`, `CrashLoopBackOff`, `Pending`, `OOMKilled`) |
| `kubectl get nodes` | Check worker nodes condition (`Ready` / `NotReady`) |
| `kubectl get svc` | Inspect ClusterIP Services and ports |
| `kubectl scale deployment web --replicas=3` | Scale replicas up or down |
| `kubectl logs <pod-name>` | Stream pod container logs |
| `kubectl describe pod <pod-name>` | Inspect pod events and diagnostics |
| `kubectl set resources deployment web --limits=memory=256Mi` | Fix memory limits to avoid OOM |
| `kubectl set image deployment web web=web-app:2.0` | Execute zero-downtime rolling update |
| `kubectl autoscale deployment web --min=2 --max=7 --cpu-percent=60` | Enable Horizontal Pod Autoscaler |

---

## 📄 License

MIT License. Crafted for engineers and learners who love Kubernetes!
