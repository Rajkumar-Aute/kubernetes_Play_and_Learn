import type { WireLevel } from './types';

export const WIRE_LEVELS: WireLevel[] = [
  // --- Level 1 ---
  {
    id: 1,
    title: 'Level 1: Labels & Selectors',
    subtitle: 'The First Connection',
    objective: 'Wire Ingress -> Web Service -> Matching Web Pod. Deliver 15 web packets.',
    targetDeliveries: 15,
    maxWires: 4,
    nodes: [
      {
        id: 'ingress-1',
        type: 'ingress',
        name: 'Ingress',
        subtitle: 'Entrypoint',
        x: 140,
        y: 270,
        radius: 36,
        acceptedPacketTypes: ['web'],
        queue: [],
        maxQueue: 10,
        processingSpeed: 1.2,
        lastProcessTime: 0,
        color: '#38bdf8',
        icon: '🌐'
      },
      {
        id: 'svc-web',
        type: 'service',
        name: 'web-service',
        subtitle: 'selector: app=web',
        x: 480,
        y: 270,
        radius: 36,
        labelKey: 'app',
        labelValue: 'web',
        acceptedPacketTypes: ['web'],
        queue: [],
        maxQueue: 10,
        processingSpeed: 2.0,
        lastProcessTime: 0,
        color: '#818cf8',
        icon: '🔄'
      },
      {
        id: 'pod-web-1',
        type: 'pod',
        name: 'pod-web-1',
        subtitle: 'labels: {app: web}',
        x: 820,
        y: 200,
        radius: 34,
        labelKey: 'app',
        labelValue: 'web',
        acceptedPacketTypes: ['web'],
        queue: [],
        maxQueue: 10,
        processingSpeed: 1.2,
        lastProcessTime: 0,
        color: '#34d399',
        icon: '📦'
      },
      {
        id: 'pod-db',
        type: 'pod',
        name: 'pod-db',
        subtitle: 'labels: {app: db}',
        x: 820,
        y: 360,
        radius: 34,
        labelKey: 'app',
        labelValue: 'db',
        acceptedPacketTypes: [],
        queue: [],
        maxQueue: 10,
        processingSpeed: 1.0,
        lastProcessTime: 0,
        color: '#f87171',
        icon: '💾'
      }
    ],
    spawns: [{ type: 'web', sourceNodeId: 'ingress-1', ratePerSec: 0.9 }],
    k8sConceptTitle: 'Labels & Selectors in Kubernetes',
    k8sConceptExplanation:
      'Kubernetes does not use fixed IP addresses to find Pods because Pods are mortal and can be replaced at any time. Instead, a Service looks for Pods with matching labels using "spec.selector".',
    k8sAnalogy:
      'Think of labels like employee name tags. When the manager (Service) calls for "Cashier", any worker wearing the "Cashier" tag steps up to handle the customer!',
    k8sYamlSnippet: `apiVersion: v1
kind: Service
metadata:
  name: web-service
spec:
  selector:
    app: web   # <-- Wires to Pods with label app: web
  ports:
    - port: 80
      targetPort: 8080`
  },

  // --- Level 2 ---
  {
    id: 2,
    title: 'Level 2: Path-Based Ingress Routing',
    subtitle: 'Traffic Splitting by URL Path',
    objective: 'Route /web (Cyan) to Web Pod and /api (Purple) to API Pod. Deliver 25 packets.',
    targetDeliveries: 25,
    maxWires: 6,
    nodes: [
      {
        id: 'ingress-main',
        type: 'ingress',
        name: 'Ingress Gateway',
        subtitle: '/web & /api',
        x: 130,
        y: 270,
        radius: 38,
        acceptedPacketTypes: ['web', 'api'],
        queue: [],
        maxQueue: 12,
        processingSpeed: 1.8,
        lastProcessTime: 0,
        color: '#c084fc',
        icon: '🚪'
      },
      {
        id: 'svc-web',
        type: 'service',
        name: 'web-svc',
        subtitle: 'path: /web',
        x: 460,
        y: 160,
        radius: 34,
        labelKey: 'app',
        labelValue: 'web',
        acceptedPacketTypes: ['web'],
        queue: [],
        maxQueue: 10,
        processingSpeed: 2.0,
        lastProcessTime: 0,
        color: '#38bdf8',
        icon: '🔄'
      },
      {
        id: 'svc-api',
        type: 'service',
        name: 'api-svc',
        subtitle: 'path: /api',
        x: 460,
        y: 380,
        radius: 34,
        labelKey: 'app',
        labelValue: 'api',
        acceptedPacketTypes: ['api'],
        queue: [],
        maxQueue: 10,
        processingSpeed: 2.0,
        lastProcessTime: 0,
        color: '#a855f7',
        icon: '🔄'
      },
      {
        id: 'pod-web',
        type: 'pod',
        name: 'pod-web',
        subtitle: 'app: web',
        x: 820,
        y: 160,
        radius: 34,
        labelKey: 'app',
        labelValue: 'web',
        acceptedPacketTypes: ['web'],
        queue: [],
        maxQueue: 10,
        processingSpeed: 1.4,
        lastProcessTime: 0,
        color: '#34d399',
        icon: '📦'
      },
      {
        id: 'pod-api',
        type: 'pod',
        name: 'pod-api',
        subtitle: 'app: api',
        x: 820,
        y: 380,
        radius: 34,
        labelKey: 'app',
        labelValue: 'api',
        acceptedPacketTypes: ['api'],
        queue: [],
        maxQueue: 10,
        processingSpeed: 1.4,
        lastProcessTime: 0,
        color: '#e879f9',
        icon: '📦'
      }
    ],
    spawns: [
      { type: 'web', sourceNodeId: 'ingress-main', ratePerSec: 0.8 },
      { type: 'api', sourceNodeId: 'ingress-main', ratePerSec: 0.8 }
    ],
    k8sConceptTitle: 'Ingress Path-Based Routing',
    k8sConceptExplanation:
      'An Ingress controller inspects the HTTP request URL. It forwards requests matching /web to the web-svc, and requests matching /api to the api-svc on a single public IP address.',
    k8sAnalogy:
      'Like an airport concierge: Domestic passengers are directed to Terminal A, while International passengers are directed to Terminal B.',
    k8sYamlSnippet: `apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: app-ingress
spec:
  rules:
    - http:
        paths:
          - path: /web
            pathType: Prefix
            backend:
              service:
                name: web-svc
                port: { number: 80 }
          - path: /api
            pathType: Prefix
            backend:
              service:
                name: api-svc
                port: { number: 80 }`
  },

  // --- Level 3 ---
  {
    id: 3,
    title: 'Level 3: Scaling Replicas',
    subtitle: 'High-Volume Load Balancing',
    objective:
      'Heavy traffic rush! Wire web-svc to all 3 Pod replicas to divide bandwidth. Deliver 40 packets without queue overflow.',
    targetDeliveries: 40,
    maxWires: 6,
    nodes: [
      {
        id: 'ingress-fast',
        type: 'ingress',
        name: 'Ingress Gateway',
        subtitle: 'High Traffic Rush',
        x: 120,
        y: 270,
        radius: 38,
        acceptedPacketTypes: ['web'],
        queue: [],
        maxQueue: 12,
        processingSpeed: 2.8,
        lastProcessTime: 0,
        color: '#38bdf8',
        icon: '🌐'
      },
      {
        id: 'svc-roundrobin',
        type: 'service',
        name: 'web-lb-svc',
        subtitle: 'Round-Robin Dispatcher',
        x: 420,
        y: 270,
        radius: 38,
        labelKey: 'app',
        labelValue: 'web',
        acceptedPacketTypes: ['web'],
        queue: [],
        maxQueue: 16,
        processingSpeed: 3.5,
        lastProcessTime: 0,
        color: '#818cf8',
        icon: '🔄'
      },
      {
        id: 'pod-rep-1',
        type: 'pod',
        name: 'pod-web-1',
        subtitle: 'Replica #1',
        x: 820,
        y: 130,
        radius: 32,
        labelKey: 'app',
        labelValue: 'web',
        acceptedPacketTypes: ['web'],
        queue: [],
        maxQueue: 8,
        processingSpeed: 1.0,
        lastProcessTime: 0,
        color: '#34d399',
        icon: '📦'
      },
      {
        id: 'pod-rep-2',
        type: 'pod',
        name: 'pod-web-2',
        subtitle: 'Replica #2',
        x: 820,
        y: 270,
        radius: 32,
        labelKey: 'app',
        labelValue: 'web',
        acceptedPacketTypes: ['web'],
        queue: [],
        maxQueue: 8,
        processingSpeed: 1.0,
        lastProcessTime: 0,
        color: '#34d399',
        icon: '📦'
      },
      {
        id: 'pod-rep-3',
        type: 'pod',
        name: 'pod-web-3',
        subtitle: 'Replica #3',
        x: 820,
        y: 410,
        radius: 32,
        labelKey: 'app',
        labelValue: 'web',
        acceptedPacketTypes: ['web'],
        queue: [],
        maxQueue: 8,
        processingSpeed: 1.0,
        lastProcessTime: 0,
        color: '#34d399',
        icon: '📦'
      }
    ],
    spawns: [{ type: 'web', sourceNodeId: 'ingress-fast', ratePerSec: 2.2 }],
    k8sConceptTitle: 'Load Balancing Across Replicas',
    k8sConceptExplanation:
      'When you scale a Deployment to 3 replicas, Kubernetes kube-proxy/IPVS automatically configures round-robin load balancing across all 3 healthy pod IP endpoints.',
    k8sAnalogy:
      'If only 1 grocery checkout lane is open during rush hour, customers wait in a huge line. Opening 3 lanes divides the line and keeps the queue moving quickly!',
    k8sYamlSnippet: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-app
spec:
  replicas: 3   # <-- 3 identical pods created automatically
  selector:
    matchLabels:
      app: web
  template:
    metadata:
      labels:
        app: web`
  },

  // --- Level 4 ---
  {
    id: 4,
    title: 'Level 4: Secrets & Database Persistence',
    subtitle: 'Secure Multi-Tier Data Pipeline',
    objective:
      'Auth Pod needs Secret credentials to write to the Database. Wire Ingress -> Auth Svc -> Auth Pod -> DB, AND wire Secret -> Auth Pod! Deliver 30 records.',
    targetDeliveries: 30,
    maxWires: 6,
    nodes: [
      {
        id: 'ingress-auth',
        type: 'ingress',
        name: 'Ingress',
        subtitle: 'Incoming /auth',
        x: 120,
        y: 180,
        radius: 36,
        acceptedPacketTypes: ['auth'],
        queue: [],
        maxQueue: 10,
        processingSpeed: 1.5,
        lastProcessTime: 0,
        color: '#fbbf24',
        icon: '🚪'
      },
      {
        id: 'svc-auth',
        type: 'service',
        name: 'auth-svc',
        subtitle: 'auth-clusterip',
        x: 360,
        y: 180,
        radius: 36,
        labelKey: 'app',
        labelValue: 'auth',
        acceptedPacketTypes: ['auth'],
        queue: [],
        maxQueue: 10,
        processingSpeed: 2.0,
        lastProcessTime: 0,
        color: '#f59e0b',
        icon: '🔄'
      },
      {
        id: 'pod-auth',
        type: 'pod',
        name: 'auth-pod',
        subtitle: 'requires secret',
        x: 580,
        y: 180,
        radius: 36,
        labelKey: 'app',
        labelValue: 'auth',
        acceptedPacketTypes: ['auth'],
        queue: [],
        maxQueue: 10,
        processingSpeed: 1.5,
        lastProcessTime: 0,
        color: '#34d399',
        icon: '🔐'
      },
      {
        id: 'secret-vault',
        type: 'secret',
        name: 'db-secret',
        subtitle: 'Password Vault',
        x: 360,
        y: 380,
        radius: 34,
        acceptedPacketTypes: ['auth'],
        queue: [],
        maxQueue: 10,
        processingSpeed: 2.0,
        lastProcessTime: 0,
        color: '#ec4899',
        icon: '🔑'
      },
      {
        id: 'postgres-db',
        type: 'database',
        name: 'postgres-db',
        subtitle: 'Persistent Volume',
        x: 840,
        y: 280,
        radius: 38,
        acceptedPacketTypes: ['auth'],
        queue: [],
        maxQueue: 12,
        processingSpeed: 2.0,
        lastProcessTime: 0,
        color: '#06b6d4',
        icon: '💾'
      }
    ],
    spawns: [{ type: 'auth', sourceNodeId: 'ingress-auth', ratePerSec: 1.1 }],
    k8sConceptTitle: 'Kubernetes Secrets & Databases',
    k8sConceptExplanation:
      'Applications should never hard-code database passwords inside Docker images. Kubernetes "Secret" objects store sensitive tokens securely and mount them directly into Pods as files or environment variables.',
    k8sAnalogy:
      'Like a hotel safe key: The receptionist (Pod) gets the master key from the vault (Secret) before unlocking the VIP room (Database).',
    k8sYamlSnippet: `apiVersion: v1
kind: Secret
metadata:
  name: db-secret
type: Opaque
data:
  password: c3VwZXJzZWNyZXQ= # base64 encoded
---
# Mounted inside Pod:
env:
  - name: DB_PASSWORD
    valueFrom:
      secretKeyRef:
        name: db-secret
        key: password`
  },

  // --- Level 5 ---
  {
    id: 5,
    title: 'Level 5: NetworkPolicy Firewall',
    subtitle: 'Zero-Trust Cluster Security',
    objective:
      'Malicious exploit packets are arriving! Wire traffic through the NetworkPolicy filter to safeguard the Database. Deliver 30 safe packets.',
    targetDeliveries: 30,
    maxWires: 6,
    nodes: [
      {
        id: 'ingress-safe',
        type: 'ingress',
        name: 'Public Ingress',
        subtitle: 'Normal Visitors',
        x: 120,
        y: 170,
        radius: 36,
        acceptedPacketTypes: ['web'],
        queue: [],
        maxQueue: 10,
        processingSpeed: 1.5,
        lastProcessTime: 0,
        color: '#38bdf8',
        icon: '🌐'
      },
      {
        id: 'ingress-hacker',
        type: 'ingress',
        name: 'Rogue Botnet',
        subtitle: 'Exploit Scanner',
        x: 120,
        y: 370,
        radius: 36,
        acceptedPacketTypes: ['malicious'],
        queue: [],
        maxQueue: 10,
        processingSpeed: 1.0,
        lastProcessTime: 0,
        color: '#ef4444',
        icon: '👾'
      },
      {
        id: 'svc-frontend',
        type: 'service',
        name: 'fe-svc',
        subtitle: 'Verified Traffic',
        x: 380,
        y: 170,
        radius: 34,
        labelKey: 'app',
        labelValue: 'frontend',
        acceptedPacketTypes: ['web'],
        queue: [],
        maxQueue: 10,
        processingSpeed: 2.0,
        lastProcessTime: 0,
        color: '#818cf8',
        icon: '🔄'
      },
      {
        id: 'netpolicy-filter',
        type: 'netpolicy',
        name: 'NetworkPolicy',
        subtitle: 'Firewall (Drop Rogue)',
        x: 560,
        y: 270,
        radius: 36,
        acceptedPacketTypes: ['web'],
        queue: [],
        maxQueue: 12,
        processingSpeed: 2.5,
        lastProcessTime: 0,
        color: '#10b981',
        icon: '🛡️'
      },
      {
        id: 'core-database',
        type: 'database',
        name: 'financial-db',
        subtitle: 'Zero-Trust Core',
        x: 840,
        y: 270,
        radius: 38,
        acceptedPacketTypes: ['web'],
        queue: [],
        maxQueue: 10,
        processingSpeed: 2.0,
        lastProcessTime: 0,
        color: '#06b6d4',
        icon: '💎'
      }
    ],
    spawns: [
      { type: 'web', sourceNodeId: 'ingress-safe', ratePerSec: 1.2 },
      { type: 'malicious', sourceNodeId: 'ingress-hacker', ratePerSec: 0.7 }
    ],
    k8sConceptTitle: 'Zero-Trust Security with NetworkPolicies',
    k8sConceptExplanation:
      'By default, all pods in a Kubernetes cluster can communicate with every other pod. NetworkPolicies act as packet-filtering firewalls (using CNI plugins like Calico or Cilium) to prevent unauthorized pods from reaching internal databases.',
    k8sAnalogy:
      'Like a security badge door in a corporate building: Only employees with "Finance" clearance can open the vault doors.',
    k8sYamlSnippet: `apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: isolate-db
spec:
  podSelector:
    matchLabels:
      app: financial-db
  ingress:
    - from:
        - podSelector:
            matchLabels:
              role: frontend # <-- Only frontend allowed!`
  },

  // --- Level 6 ---
  {
    id: 6,
    title: 'Level 6: Canary Deployment Splitter',
    subtitle: '80% Stable vs 20% Canary Testing',
    objective:
      'Use the Canary Splitter to send 80% traffic to v1 and 20% to v2 without breaking customer connections. Deliver 35 packets.',
    targetDeliveries: 35,
    maxWires: 6,
    nodes: [
      {
        id: 'ingress-traffic',
        type: 'ingress',
        name: 'Ingress Gateway',
        subtitle: '100% Production',
        x: 120,
        y: 270,
        radius: 38,
        acceptedPacketTypes: ['web'],
        queue: [],
        maxQueue: 12,
        processingSpeed: 2.0,
        lastProcessTime: 0,
        color: '#38bdf8',
        icon: '🚪'
      },
      {
        id: 'canary-splitter',
        type: 'canary',
        name: 'Canary Splitter',
        subtitle: 'Weight: 80% / 20%',
        x: 420,
        y: 270,
        radius: 38,
        acceptedPacketTypes: ['web'],
        queue: [],
        maxQueue: 14,
        processingSpeed: 3.0,
        lastProcessTime: 0,
        color: '#f59e0b',
        icon: '⚖️'
      },
      {
        id: 'pod-v1-stable',
        type: 'pod',
        name: 'pod-v1-stable',
        subtitle: 'Stable 80% (v1.0)',
        x: 780,
        y: 160,
        radius: 34,
        labelKey: 'version',
        labelValue: 'v1.0',
        acceptedPacketTypes: ['web'],
        queue: [],
        maxQueue: 10,
        processingSpeed: 1.8,
        lastProcessTime: 0,
        color: '#38bdf8',
        icon: '📦'
      },
      {
        id: 'pod-v2-canary',
        type: 'pod',
        name: 'pod-v2-canary',
        subtitle: 'Canary 20% (v2.0-beta)',
        x: 780,
        y: 380,
        radius: 34,
        labelKey: 'version',
        labelValue: 'v2.0',
        acceptedPacketTypes: ['web'],
        queue: [],
        maxQueue: 10,
        processingSpeed: 1.2,
        lastProcessTime: 0,
        color: '#a855f7',
        icon: '🧪'
      }
    ],
    spawns: [{ type: 'web', sourceNodeId: 'ingress-traffic', ratePerSec: 1.8 }],
    k8sConceptTitle: 'Canary Releases in Production',
    k8sConceptExplanation:
      'A canary release gradually introduces a new software version to a small subset of real users (e.g. 20%) before rolling it out to 100%. If bugs occur, only a tiny fraction of users are impacted.',
    k8sAnalogy:
      'Like a chef testing a new spicy sauce on 2 out of 10 tables first to make sure customers like it before changing the whole menu!',
    k8sYamlSnippet: `# Ingress Canary Annotation:
nginx.ingress.kubernetes.io/canary: "true"
nginx.ingress.kubernetes.io/canary-weight: "20"`
  },

  // --- Level 7 ---
  {
    id: 7,
    title: 'Level 7: Cross-Namespace Mesh',
    subtitle: 'Cluster Internal DNS Discovery',
    objective:
      'Wire the entire microservices topology: Ingress -> Frontend -> Backend -> Core DB. Deliver 40 packets.',
    targetDeliveries: 40,
    maxWires: 8,
    nodes: [
      {
        id: 'ingress-public',
        type: 'ingress',
        name: 'Ingress',
        subtitle: 'Public Entry',
        x: 100,
        y: 270,
        radius: 36,
        acceptedPacketTypes: ['web'],
        queue: [],
        maxQueue: 10,
        processingSpeed: 1.8,
        lastProcessTime: 0,
        color: '#38bdf8',
        icon: '🌐'
      },
      {
        id: 'svc-frontend',
        type: 'service',
        name: 'frontend-svc',
        subtitle: 'ns: frontend',
        x: 300,
        y: 200,
        radius: 34,
        labelKey: 'app',
        labelValue: 'frontend',
        acceptedPacketTypes: ['web'],
        queue: [],
        maxQueue: 10,
        processingSpeed: 2.2,
        lastProcessTime: 0,
        color: '#818cf8',
        icon: '🔄'
      },
      {
        id: 'pod-frontend',
        type: 'pod',
        name: 'frontend-pod',
        subtitle: 'UI Renderer',
        x: 480,
        y: 200,
        radius: 34,
        labelKey: 'app',
        labelValue: 'frontend',
        acceptedPacketTypes: ['web'],
        queue: [],
        maxQueue: 10,
        processingSpeed: 1.8,
        lastProcessTime: 0,
        color: '#34d399',
        icon: '📦'
      },
      {
        id: 'svc-backend',
        type: 'service',
        name: 'backend-svc',
        subtitle: 'ns: backend',
        x: 660,
        y: 340,
        radius: 34,
        labelKey: 'app',
        labelValue: 'backend',
        acceptedPacketTypes: ['web'],
        queue: [],
        maxQueue: 10,
        processingSpeed: 2.2,
        lastProcessTime: 0,
        color: '#a855f7',
        icon: '🔄'
      },
      {
        id: 'pod-backend',
        type: 'pod',
        name: 'backend-pod',
        subtitle: 'Business Logic',
        x: 820,
        y: 340,
        radius: 34,
        labelKey: 'app',
        labelValue: 'backend',
        acceptedPacketTypes: ['web'],
        queue: [],
        maxQueue: 10,
        processingSpeed: 1.8,
        lastProcessTime: 0,
        color: '#e879f9',
        icon: '📦'
      }
    ],
    spawns: [{ type: 'web', sourceNodeId: 'ingress-public', ratePerSec: 1.4 }],
    k8sConceptTitle: 'Cluster Internal DNS Discovery',
    k8sConceptExplanation:
      'Every Kubernetes service gets an automatic internal DNS record from CoreDNS in the format: <service-name>.<namespace>.svc.cluster.local. Pods communicate across namespaces without needing hardcoded IP addresses.',
    k8sAnalogy:
      'Like dialing an internal office phone extension (e.g. #304 for Accounting) instead of a 10-digit public number.',
    k8sYamlSnippet: `// Inside frontend-pod:
fetch("http://backend-svc.backend.svc.cluster.local:8080/data")`
  },

  // --- Level 8 ---
  {
    id: 8,
    title: 'Level 8: The Production Grid (Mastery)',
    subtitle: 'Endless Flow Simulation',
    objective:
      'The ultimate architectural challenge! Balance web, api, and auth traffic across all tiers. Deliver 60 packets.',
    targetDeliveries: 60,
    maxWires: 10,
    nodes: [
      {
        id: 'ingress-mega',
        type: 'ingress',
        name: 'Global Ingress',
        subtitle: 'All Routes Active',
        x: 100,
        y: 270,
        radius: 38,
        acceptedPacketTypes: ['web', 'api', 'auth'],
        queue: [],
        maxQueue: 16,
        processingSpeed: 3.0,
        lastProcessTime: 0,
        color: '#38bdf8',
        icon: '🌐'
      },
      {
        id: 'svc-web',
        type: 'service',
        name: 'web-svc',
        subtitle: 'path: /web',
        x: 380,
        y: 120,
        radius: 34,
        labelKey: 'app',
        labelValue: 'web',
        acceptedPacketTypes: ['web'],
        queue: [],
        maxQueue: 10,
        processingSpeed: 2.5,
        lastProcessTime: 0,
        color: '#38bdf8',
        icon: '🔄'
      },
      {
        id: 'svc-api',
        type: 'service',
        name: 'api-svc',
        subtitle: 'path: /api',
        x: 380,
        y: 270,
        radius: 34,
        labelKey: 'app',
        labelValue: 'api',
        acceptedPacketTypes: ['api'],
        queue: [],
        maxQueue: 10,
        processingSpeed: 2.5,
        lastProcessTime: 0,
        color: '#a855f7',
        icon: '🔄'
      },
      {
        id: 'svc-auth',
        type: 'service',
        name: 'auth-svc',
        subtitle: 'path: /auth',
        x: 380,
        y: 420,
        radius: 34,
        labelKey: 'app',
        labelValue: 'auth',
        acceptedPacketTypes: ['auth'],
        queue: [],
        maxQueue: 10,
        processingSpeed: 2.5,
        lastProcessTime: 0,
        color: '#fbbf24',
        icon: '🔄'
      },
      {
        id: 'pod-web',
        type: 'pod',
        name: 'pod-web',
        subtitle: 'app: web',
        x: 720,
        y: 120,
        radius: 34,
        labelKey: 'app',
        labelValue: 'web',
        acceptedPacketTypes: ['web'],
        queue: [],
        maxQueue: 10,
        processingSpeed: 1.8,
        lastProcessTime: 0,
        color: '#34d399',
        icon: '📦'
      },
      {
        id: 'pod-api',
        type: 'pod',
        name: 'pod-api',
        subtitle: 'app: api',
        x: 720,
        y: 270,
        radius: 34,
        labelKey: 'app',
        labelValue: 'api',
        acceptedPacketTypes: ['api'],
        queue: [],
        maxQueue: 10,
        processingSpeed: 1.8,
        lastProcessTime: 0,
        color: '#e879f9',
        icon: '📦'
      },
      {
        id: 'pod-auth',
        type: 'pod',
        name: 'pod-auth',
        subtitle: 'app: auth',
        x: 720,
        y: 420,
        radius: 34,
        labelKey: 'app',
        labelValue: 'auth',
        acceptedPacketTypes: ['auth'],
        queue: [],
        maxQueue: 10,
        processingSpeed: 1.8,
        lastProcessTime: 0,
        color: '#facc15',
        icon: '📦'
      },
      {
        id: 'db-cluster',
        type: 'database',
        name: 'core-database',
        subtitle: 'Master DB',
        x: 900,
        y: 270,
        radius: 38,
        acceptedPacketTypes: ['web', 'api', 'auth'],
        queue: [],
        maxQueue: 14,
        processingSpeed: 2.5,
        lastProcessTime: 0,
        color: '#06b6d4',
        icon: '💾'
      }
    ],
    spawns: [
      { type: 'web', sourceNodeId: 'ingress-mega', ratePerSec: 0.9 },
      { type: 'api', sourceNodeId: 'ingress-mega', ratePerSec: 0.9 },
      { type: 'auth', sourceNodeId: 'ingress-mega', ratePerSec: 0.8 }
    ],
    k8sConceptTitle: 'The Production Kubernetes Architecture',
    k8sConceptExplanation:
      'In real production, hundreds of services and pods communicate through Ingress controllers, Services, and NetworkPolicies with zero downtime and automatic self-healing.',
    k8sAnalogy:
      'You are now a certified Kubernetes Network Architect! Your cluster routes high-concurrency traffic with surgical precision.',
    k8sYamlSnippet: `# Production Best Practice:
spec:
  topologySpreadConstraints:
    - maxSkew: 1
      topologyKey: topology.kubernetes.io/zone
      whenUnsatisfiable: DoNotSchedule`
  }
];
