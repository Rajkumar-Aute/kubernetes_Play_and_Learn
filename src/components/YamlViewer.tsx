import React, { useState } from 'react';
import { FileCode, Copy, Check, Info } from 'lucide-react';
import type { GameState } from '../types/game';
import { soundEngine } from '../services/soundEngine';

interface YamlViewerProps {
  state: GameState;
}

export const YamlViewer: React.FC<YamlViewerProps> = ({ state }) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'deployment' | 'service' | 'hpa'>('deployment');

  const dep = state.deployments[0];
  const svc = state.services[0];

  const deploymentYaml = `apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${dep?.name || 'web'}
  labels:
    app: ${dep?.name || 'web'}
spec:
  replicas: ${dep?.desiredReplicas ?? 1}
  selector:
    matchLabels:
      app: ${dep?.name || 'web'}
  template:
    metadata:
      labels:
        app: ${dep?.name || 'web'}
    spec:
      containers:
      - name: ${dep?.name || 'web'}
        image: ${dep?.image || 'web-app:1.0'}
        ports:
        - containerPort: 80
        resources:
          requests:
            cpu: "${dep?.cpuRequest || 100}m"
            memory: "${dep?.memoryRequest || 128}Mi"
          limits:
            cpu: "${dep?.cpuLimit || 250}m"
            memory: "${dep?.memoryLimit || 256}Mi"
        env:${
          dep?.env && Object.keys(dep.env).length > 0
            ? Object.entries(dep.env)
                .map(([k, v]) => `\n        - name: ${k}\n          value: "${v}"`)
                .join('')
            : ' []'
        }
        readinessProbe:
          httpGet:
            path: /healthz
            port: 80
          initialDelaySeconds: 2`;

  const serviceYaml = `apiVersion: v1
kind: Service
metadata:
  name: ${svc?.name || 'web-service'}
spec:
  type: ${svc?.type || 'ClusterIP'}
  selector:
    app: ${svc?.selector['app'] || 'none'}
  ports:
  - port: ${svc?.port || 80}
    targetPort: ${svc?.targetPort || 80}
    protocol: TCP`;

  const hpaYaml = `apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: ${dep?.name || 'web'}-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: ${dep?.name || 'web'}
  minReplicas: ${dep?.hpaMinReplicas || 2}
  maxReplicas: ${dep?.hpaMaxReplicas || 7}
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: ${dep?.hpaTargetCpu || 60}`;

  const currentYaml =
    activeTab === 'deployment'
      ? deploymentYaml
      : activeTab === 'service'
      ? serviceYaml
      : hpaYaml;

  const handleCopy = () => {
    soundEngine.playClick();
    navigator.clipboard.writeText(currentYaml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-950/95 border border-slate-800 rounded-xl flex flex-col h-[320px] md:h-full min-h-[300px] shadow-xl overflow-hidden font-mono">
      {/* Tab Header */}
      <div className="bg-slate-900 px-3 py-1.5 border-b border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <FileCode className="w-3.5 h-3.5 text-cyan-400" />
          <div className="flex bg-slate-950 p-0.5 rounded border border-slate-800">
            <button
              onClick={() => {
                soundEngine.playClick();
                setActiveTab('deployment');
              }}
              className={`px-2 py-0.5 rounded text-[11px] transition ${
                activeTab === 'deployment'
                  ? 'bg-cyan-600 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              deployment.yaml
            </button>
            <button
              onClick={() => {
                soundEngine.playClick();
                setActiveTab('service');
              }}
              className={`px-2 py-0.5 rounded text-[11px] transition ${
                activeTab === 'service'
                  ? 'bg-cyan-600 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              service.yaml
            </button>
            <button
              onClick={() => {
                soundEngine.playClick();
                setActiveTab('hpa');
              }}
              className={`px-2 py-0.5 rounded text-[11px] transition ${
                activeTab === 'hpa'
                  ? 'bg-cyan-600 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              hpa.yaml
            </button>
          </div>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* YAML Content */}
      <div className="flex-1 p-3 overflow-y-auto text-xs text-slate-300 select-text leading-relaxed whitespace-pre font-mono">
        {currentYaml}
      </div>

      {/* Helpful educational hint at bottom */}
      <div className="bg-slate-900/80 px-3 py-1 border-t border-slate-800 text-[10px] text-slate-400 flex items-center gap-1.5">
        <Info className="w-3 h-3 text-cyan-400 shrink-0" />
        <span>This live YAML reflects your cluster state in real time!</span>
      </div>
    </div>
  );
};
