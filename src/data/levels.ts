import type { Level } from '../types/game';

export const LEVELS: Level[] = [
  {
    id: 1,
    name: 'Hello Pod',
    subtitle: 'The Atomic Unit of Kubernetes',
    k8sConcept: 'Pods & Containers',
    briefing:
      'Welcome to Kubernetes Fleet Control! A Pod is the smallest deployable computing unit in Kubernetes. It wraps one or more containers, storage volumes, and a dedicated network IP.\n\nYour cluster has 1 worker node, but zero pods running. Deploy your first Nginx pod to handle incoming user traffic!',
    explanation:
      'In Kubernetes, you rarely run bare containers directly on hosts. Instead, the kubelet manages Pods according to their declarative specification. When you scale up, the Kube-Scheduler finds a suitable node with sufficient CPU and Memory capacity.',
    initialYaml: `apiVersion: v1
kind: Pod
metadata:
  name: web-frontend
  labels:
    app: web
spec:
  containers:
  - name: nginx
    image: nginx:1.25
    ports:
    - containerPort: 80
    resources:
      requests:
        cpu: "100m"
        memory: "128Mi"`,
    hints: [
      'Click "+ Deploy Pod" or run `kubectl scale deployment web --replicas=1` in the terminal.',
      'Notice the Pod state transition from Pending -> Running.',
      'Check the incoming traffic packets routed to the new Pod.'
    ],
    targetTrafficRate: 4,
    objectives: [
      {
        id: 'pod-running',
        title: 'Deploy at least 1 Running Pod',
        description: 'Have 1 pod in "Running" status on Node-1',
        isCompleted: (state) => state.pods.some((p) => p.status === 'Running')
      },
      {
        id: 'serve-traffic',
        title: 'Serve 10 Successful Requests',
        description: 'Handle incoming HTTP packets with 200 OK',
        isCompleted: (state) => state.successfulRequests >= 10
      }
    ],
    initialState: {
      trafficRate: 4,
      nodes: [
        {
          id: 'node-1',
          name: 'worker-node-1',
          status: 'Ready',
          cpuCapacity: 1000,
          cpuAllocated: 0,
          memoryCapacity: 1024,
          memoryAllocated: 0
        }
      ],
      deployments: [
        {
          name: 'web',
          image: 'nginx:1.25',
          version: 'v1.0',
          desiredReplicas: 0,
          availableReplicas: 0,
          cpuRequest: 100,
          cpuLimit: 250,
          memoryRequest: 128,
          memoryLimit: 256,
          env: {},
          hasLivenessProbe: true,
          hasReadinessProbe: true,
          hpaEnabled: false
        }
      ],
      pods: [],
      services: [
        {
          name: 'web-service',
          type: 'ClusterIP',
          port: 80,
          targetPort: 80,
          selector: { app: 'web' },
          clusterIP: '10.96.0.12'
        }
      ],
      ingress: {
        name: 'main-ingress',
        rules: [{ path: '/', serviceName: 'web-service', servicePort: 80 }],
        enabled: true
      }
    }
  },
  {
    id: 2,
    name: 'Traffic Surge & ReplicaSets',
    subtitle: 'High Availability & Scaling',
    k8sConcept: 'Deployments & ReplicaSets',
    briefing:
      'Breaking News! Your website was featured on Hacker News, and traffic just spiked from 4 req/s to 35 req/s! A single pod cannot process this load and is hitting 100% CPU, resulting in HTTP 503 drops.\n\nDeployments declare desired state (e.g. `replicas: 3`). The ReplicaSet controller continuously monitors actual vs desired state and launches additional pods.',
    explanation:
      'Running a single pod is a Single Point of Failure (SPOF). Kubernetes Deployments manage ReplicaSets behind the scenes. If you declare `replicas: 3`, Kubernetes guarantees that 3 copies will stay running across your available worker nodes.',
    initialYaml: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: web
spec:
  replicas: 3 # Scale from 1 to 3 to absorb the traffic spike!
  selector:
    matchLabels:
      app: web
  template:
    metadata:
      labels:
        app: web
    spec:
      containers:
      - name: web
        image: web-app:1.0
        resources:
          limits:
            cpu: "250m"
            memory: "256Mi"`,
    hints: [
      'Scale your replicas to at least 3 pods.',
      'You can click the "+ Scale Up" button or type `kubectl scale deployment web --replicas=3`.',
      'Watch your CPU load distribute across all replicas.'
    ],
    targetTrafficRate: 30,
    objectives: [
      {
        id: 'scale-pods',
        title: 'Scale Replicas to 3+',
        description: 'Have at least 3 healthy running pods',
        isCompleted: (state) => state.pods.filter((p) => p.status === 'Running').length >= 3
      },
      {
        id: 'high-sla',
        title: 'Maintain SLA > 90%',
        description: 'Keep cluster Service Level Agreement healthy while handling 30 req/s',
        isCompleted: (state) => state.successfulRequests >= 30 && state.sla >= 90
      }
    ],
    initialState: {
      trafficRate: 25,
      nodes: [
        {
          id: 'node-1',
          name: 'worker-node-1',
          status: 'Ready',
          cpuCapacity: 1000,
          cpuAllocated: 100,
          memoryCapacity: 1024,
          memoryAllocated: 128
        },
        {
          id: 'node-2',
          name: 'worker-node-2',
          status: 'Ready',
          cpuCapacity: 1000,
          cpuAllocated: 0,
          memoryCapacity: 1024,
          memoryAllocated: 0
        }
      ],
      deployments: [
        {
          name: 'web',
          image: 'web-app:1.0',
          version: 'v1.0',
          desiredReplicas: 1,
          availableReplicas: 1,
          cpuRequest: 100,
          cpuLimit: 250,
          memoryRequest: 128,
          memoryLimit: 256,
          env: {},
          hasLivenessProbe: true,
          hasReadinessProbe: true,
          hpaEnabled: false
        }
      ],
      pods: [
        {
          id: 'pod-web-1',
          name: 'web-765d-x89f',
          deploymentName: 'web',
          nodeId: 'node-1',
          status: 'Running',
          version: 'v1.0',
          cpuRequest: 100,
          cpuLimit: 250,
          memoryRequest: 128,
          memoryLimit: 256,
          memoryUsage: 140,
          cpuUsage: 95,
          ready: true,
          restarts: 0,
          createdTime: Date.now(),
          logs: ['Listening on :80', 'High CPU load detected!'],
          env: {},
          livenessProbePassed: true,
          readinessProbePassed: true
        }
      ],
      services: [
        {
          name: 'web-service',
          type: 'ClusterIP',
          port: 80,
          targetPort: 80,
          selector: { app: 'web' },
          clusterIP: '10.96.0.12'
        }
      ],
      ingress: {
        name: 'main-ingress',
        rules: [{ path: '/', serviceName: 'web-service', servicePort: 80 }],
        enabled: true
      }
    }
  },
  {
    id: 3,
    name: 'Services & Load Balancing',
    subtitle: 'Stable Networking for Ephemeral Pods',
    k8sConcept: 'ClusterIP & Service Selectors',
    briefing:
      'Pods in Kubernetes are ephemeral—they are created and destroyed dynamically, and their IP addresses change constantly! If external clients talk directly to Pod IPs, everything breaks when pods restart.\n\nA Kubernetes Service provides a stable ClusterIP and load-balances incoming traffic across all pods matching a label selector (e.g. `app: web`). Connect the missing Service selector to revive traffic routing!',
    explanation:
      'The Kube-Proxy agent configures iptables or IPVS on every node so that requests to the Service ClusterIP automatically balance across the backend Pod endpoints. If the Service selector doesn’t match the Pod labels, zero endpoints are registered.',
    initialYaml: `apiVersion: v1
kind: Service
metadata:
  name: web-service
spec:
  type: ClusterIP
  selector:
    app: web # This matches labels on the pods!
  ports:
  - port: 80
    targetPort: 80`,
    hints: [
      'The Service is currently missing its label selector!',
      'Click "Connect Service Selector" or run `kubectl apply -f service.yaml`.',
      'Watch traffic start flowing across your pods via round-robin distribution.'
    ],
    targetTrafficRate: 20,
    objectives: [
      {
        id: 'service-connected',
        title: 'Connect Service Selector',
        description: 'Ensure Service selector matches `app: web`',
        isCompleted: (state) => {
          const svc = state.services.find((s) => s.name === 'web-service');
          return !!(svc && svc.selector['app'] === 'web');
        }
      },
      {
        id: 'process-traffic',
        title: 'Process 25 Packets',
        description: 'Successfully route 25 requests through the Service to healthy Pods',
        isCompleted: (state) => state.successfulRequests >= 25
      }
    ],
    initialState: {
      trafficRate: 20,
      nodes: [
        {
          id: 'node-1',
          name: 'worker-node-1',
          status: 'Ready',
          cpuCapacity: 1000,
          cpuAllocated: 200,
          memoryCapacity: 1024,
          memoryAllocated: 256
        },
        {
          id: 'node-2',
          name: 'worker-node-2',
          status: 'Ready',
          cpuCapacity: 1000,
          cpuAllocated: 100,
          memoryCapacity: 1024,
          memoryAllocated: 128
        }
      ],
      deployments: [
        {
          name: 'web',
          image: 'web-app:1.0',
          version: 'v1.0',
          desiredReplicas: 2,
          availableReplicas: 2,
          cpuRequest: 100,
          cpuLimit: 250,
          memoryRequest: 128,
          memoryLimit: 256,
          env: {},
          hasLivenessProbe: true,
          hasReadinessProbe: true,
          hpaEnabled: false
        }
      ],
      pods: [
        {
          id: 'pod-web-1',
          name: 'web-91a',
          deploymentName: 'web',
          nodeId: 'node-1',
          status: 'Running',
          version: 'v1.0',
          cpuRequest: 100,
          cpuLimit: 250,
          memoryRequest: 128,
          memoryLimit: 256,
          memoryUsage: 64,
          cpuUsage: 15,
          ready: true,
          restarts: 0,
          createdTime: Date.now(),
          logs: ['Ready to serve traffic'],
          env: {},
          livenessProbePassed: true,
          readinessProbePassed: true
        },
        {
          id: 'pod-web-2',
          name: 'web-91b',
          deploymentName: 'web',
          nodeId: 'node-2',
          status: 'Running',
          version: 'v1.0',
          cpuRequest: 100,
          cpuLimit: 250,
          memoryRequest: 128,
          memoryLimit: 256,
          memoryUsage: 64,
          cpuUsage: 15,
          ready: true,
          restarts: 0,
          createdTime: Date.now(),
          logs: ['Ready to serve traffic'],
          env: {},
          livenessProbePassed: true,
          readinessProbePassed: true
        }
      ],
      // Selector intentionally broken for the challenge
      services: [
        {
          name: 'web-service',
          type: 'ClusterIP',
          port: 80,
          targetPort: 80,
          selector: { app: 'unmatched' },
          clusterIP: '10.96.0.12'
        }
      ],
      ingress: {
        name: 'main-ingress',
        rules: [{ path: '/', serviceName: 'web-service', servicePort: 80 }],
        enabled: true
      }
    }
  },
  {
    id: 4,
    name: 'CrashLoopBackOff!',
    subtitle: 'Debugging Failing Pods & Environment Secrets',
    k8sConcept: 'Pod Diagnostics & ConfigMaps',
    briefing:
      'Emergency! The new backend microservice pod is stuck in a `CrashLoopBackOff` state! It repeatedly crashes, restarts, and pauses with exponential backoff delay.\n\nInspect the pod logs with `kubectl logs` or the visual inspector to find the root cause, inject the missing environment variable, and heal the pod.',
    explanation:
      '`CrashLoopBackOff` means a container repeatedly crashes right after starting (often with Exit Code 1). Common culprits include missing environment variables, failing database connections, or failed liveness probes. Kubernetes prevents hammering the node by introducing increasing delay between restarts (10s, 20s, 40s, up to 5m).',
    initialYaml: `apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  DB_HOST: "postgres-cluster.default.svc"
---
# In the Deployment:
spec:
  containers:
  - name: backend
    env:
    - name: DB_HOST
      value: "postgres-cluster.default.svc"`,
    hints: [
      'Click on the red blinking pod or run `kubectl logs backend-crash-pod`.',
      'Notice the error: "FATAL: DB_HOST environment variable not found".',
      'Click "Inject DB_HOST Config" or use the terminal to set the env.'
    ],
    targetTrafficRate: 15,
    objectives: [
      {
        id: 'inspect-logs',
        title: 'Inspect Pod Logs',
        description: 'Read the crash logs to diagnose the missing dependency',
        isCompleted: (state) =>
          state.terminalHistory.some((h) => h.text.includes('logs') || h.text.includes('DB_HOST'))
      },
      {
        id: 'fix-crashloop',
        title: 'Resolve CrashLoopBackOff',
        description: 'Configure DB_HOST environment variable so the pod achieves "Running" state',
        isCompleted: (state) => {
          const pod = state.pods.find((p) => p.deploymentName === 'backend');
          return !!(pod && pod.status === 'Running' && pod.env['DB_HOST']);
        }
      }
    ],
    initialState: {
      trafficRate: 15,
      nodes: [
        {
          id: 'node-1',
          name: 'worker-node-1',
          status: 'Ready',
          cpuCapacity: 1000,
          cpuAllocated: 200,
          memoryCapacity: 1024,
          memoryAllocated: 256
        }
      ],
      deployments: [
        {
          name: 'backend',
          image: 'backend-api:1.2',
          version: 'v1.2',
          desiredReplicas: 1,
          availableReplicas: 0,
          cpuRequest: 150,
          cpuLimit: 300,
          memoryRequest: 128,
          memoryLimit: 256,
          env: {}, // Missing DB_HOST!
          hasLivenessProbe: true,
          hasReadinessProbe: true,
          hpaEnabled: false
        }
      ],
      pods: [
        {
          id: 'pod-backend-1',
          name: 'backend-78b-crash',
          deploymentName: 'backend',
          nodeId: 'node-1',
          status: 'CrashLoopBackOff',
          version: 'v1.2',
          cpuRequest: 150,
          cpuLimit: 300,
          memoryRequest: 128,
          memoryLimit: 256,
          memoryUsage: 20,
          cpuUsage: 0,
          ready: false,
          restarts: 4,
          createdTime: Date.now() - 30000,
          logs: [
            '[Startup] Initializing API microservice v1.2...',
            '[DB Connector] Checking for database host...',
            'FATAL: DB_HOST environment variable not found!',
            'Process exited with status code 1. Restarting in 40s...'
          ],
          env: {},
          livenessProbePassed: false,
          readinessProbePassed: false
        }
      ],
      services: [
        {
          name: 'backend-service',
          type: 'ClusterIP',
          port: 80,
          targetPort: 80,
          selector: { app: 'backend' },
          clusterIP: '10.96.0.44'
        }
      ],
      ingress: {
        name: 'main-ingress',
        rules: [{ path: '/api', serviceName: 'backend-service', servicePort: 80 }],
        enabled: true
      }
    }
  },
  {
    id: 5,
    name: 'OOMKilled & Limits',
    subtitle: 'Linux Cgroups & Memory Eviction',
    k8sConcept: 'Requests vs Limits & Exit Code 137',
    briefing:
      'High payload traffic has arrived! The pods are terminating with `OOMKilled` (Exit Code 137). Why? Because the container exceeded its specified `limits.memory: 64Mi`.\n\nIn Kubernetes, if a container exceeds CPU limits, it is merely throttled. But if it exceeds its Memory limit, the Linux kernel OOM Killer immediately sends `SIGKILL`! Upgrade memory limits to 256Mi to withstand heavy traffic.',
    explanation:
      'Resource Requests determine where the Kube-Scheduler places the Pod. Resource Limits define the hard ceiling enforced by Linux cgroups. Memory cannot be throttled like CPU—exceeding the limit results in immediate termination (OOMKilled). Always allocate appropriate headroom!',
    initialYaml: `resources:
  requests:
    cpu: "100m"
    memory: "128Mi"
  limits:
    cpu: "500m"
    memory: "256Mi" # Increased from 64Mi to prevent OOMKilled!`,
    hints: [
      'The current memory limit is only 64Mi, while payloads require ~120Mi.',
      'Click "Increase Memory Limit (256Mi)" or run `kubectl set resources deployment web --limits=memory=256Mi`.',
      'Watch your pods stabilize without being killed by the OS.'
    ],
    targetTrafficRate: 20,
    objectives: [
      {
        id: 'increase-limits',
        title: 'Set Memory Limit to 256Mi+',
        description: 'Grant pods adequate memory capacity to process large payloads',
        isCompleted: (state) => {
          const dep = state.deployments.find((d) => d.name === 'web');
          return !!(dep && dep.memoryLimit >= 256);
        }
      },
      {
        id: 'zero-oom',
        title: 'Stabilize Cluster',
        description: 'Keep all pods Running with 0 OOMKilled events for 15 seconds',
        isCompleted: (state) =>
          state.pods.length >= 2 && state.pods.every((p) => p.status === 'Running') && state.successfulRequests >= 30
      }
    ],
    initialState: {
      trafficRate: 20,
      nodes: [
        {
          id: 'node-1',
          name: 'worker-node-1',
          status: 'Ready',
          cpuCapacity: 1000,
          cpuAllocated: 200,
          memoryCapacity: 1024,
          memoryAllocated: 128
        }
      ],
      deployments: [
        {
          name: 'web',
          image: 'data-cruncher:1.0',
          version: 'v1.0',
          desiredReplicas: 2,
          availableReplicas: 2,
          cpuRequest: 100,
          cpuLimit: 500,
          memoryRequest: 64,
          memoryLimit: 64, // Dangerously low!
          env: {},
          hasLivenessProbe: true,
          hasReadinessProbe: true,
          hpaEnabled: false
        }
      ],
      pods: [
        {
          id: 'pod-oom-1',
          name: 'web-crunch-1',
          deploymentName: 'web',
          nodeId: 'node-1',
          status: 'OOMKilled',
          version: 'v1.0',
          cpuRequest: 100,
          cpuLimit: 500,
          memoryRequest: 64,
          memoryLimit: 64,
          memoryUsage: 68,
          cpuUsage: 40,
          ready: false,
          restarts: 3,
          createdTime: Date.now(),
          logs: [
            '[Worker] Handling data batch payload (110MB)...',
            'Kernel: Out of Memory: Kill process 442 (data-cruncher). Exit code 137'
          ],
          env: {},
          livenessProbePassed: false,
          readinessProbePassed: false
        },
        {
          id: 'pod-oom-2',
          name: 'web-crunch-2',
          deploymentName: 'web',
          nodeId: 'node-1',
          status: 'Running',
          version: 'v1.0',
          cpuRequest: 100,
          cpuLimit: 500,
          memoryRequest: 64,
          memoryLimit: 64,
          memoryUsage: 59,
          cpuUsage: 60,
          ready: true,
          restarts: 2,
          createdTime: Date.now(),
          logs: ['[Worker] Memory usage at 92%! Approaching OOM threshold.'],
          env: {},
          livenessProbePassed: true,
          readinessProbePassed: true
        }
      ],
      services: [
        {
          name: 'web-service',
          type: 'ClusterIP',
          port: 80,
          targetPort: 80,
          selector: { app: 'web' },
          clusterIP: '10.96.0.12'
        }
      ],
      ingress: {
        name: 'main-ingress',
        rules: [{ path: '/', serviceName: 'web-service', servicePort: 80 }],
        enabled: true
      }
    }
  },
  {
    id: 6,
    name: 'Zero-Downtime Rolling Update',
    subtitle: 'Deploying v2 with Readiness Probes',
    k8sConcept: 'RollingUpdate & Readiness Probes',
    briefing:
      'Engineering has finished Version 2.0 of the app! Users are actively placing orders. You cannot take the service offline for maintenance.\n\nKubernetes executes Rolling Updates by spinning up new v2 pods first, validating their Readiness Probes, switching service traffic, and gradually terminating old v1 pods. Trigger the rollout and ensure 0 dropped requests!',
    explanation:
      'Readiness Probes tell the Service when a new container is ready to accept user connections (e.g. warming up caches, establishing DB connections). If traffic was routed before the pod is ready, users would receive 502 Bad Gateway errors.',
    initialYaml: `spec:
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  template:
    spec:
      containers:
      - name: web
        image: web-app:2.0 # Upgrade from v1.0 to v2.0
        readinessProbe:
          httpGet:
            path: /healthz
            port: 80
          initialDelaySeconds: 2`,
    hints: [
      'Click "Rollout v2.0 Update" or run `kubectl set image deployment web web=web-app:2.0`.',
      'Observe the new v2 pods launch, turn ready, and take over traffic before v1 pods terminate.',
      'Check SLA—no requests should be dropped!'
    ],
    targetTrafficRate: 25,
    objectives: [
      {
        id: 'rollout-v2',
        title: 'Upgrade to v2.0',
        description: 'Complete rolling update so all running pods run version v2.0',
        isCompleted: (state) => {
          const running = state.pods.filter((p) => p.status === 'Running');
          return running.length >= 3 && running.every((p) => p.version === 'v2.0');
        }
      },
      {
        id: 'zero-downtime',
        title: 'Maintain 98%+ SLA',
        description: 'Zero dropped requests during the entire rolling update transition',
        isCompleted: (state) => state.successfulRequests >= 40 && state.sla >= 98
      }
    ],
    initialState: {
      trafficRate: 25,
      nodes: [
        {
          id: 'node-1',
          name: 'worker-node-1',
          status: 'Ready',
          cpuCapacity: 1000,
          cpuAllocated: 300,
          memoryCapacity: 1024,
          memoryAllocated: 384
        },
        {
          id: 'node-2',
          name: 'worker-node-2',
          status: 'Ready',
          cpuCapacity: 1000,
          cpuAllocated: 150,
          memoryCapacity: 1024,
          memoryAllocated: 192
        }
      ],
      deployments: [
        {
          name: 'web',
          image: 'web-app:1.0',
          version: 'v1.0',
          desiredReplicas: 3,
          availableReplicas: 3,
          cpuRequest: 100,
          cpuLimit: 250,
          memoryRequest: 128,
          memoryLimit: 256,
          env: {},
          hasLivenessProbe: true,
          hasReadinessProbe: true,
          hpaEnabled: false
        }
      ],
      pods: [
        {
          id: 'pod-v1-1',
          name: 'web-v1-a1',
          deploymentName: 'web',
          nodeId: 'node-1',
          status: 'Running',
          version: 'v1.0',
          cpuRequest: 100,
          cpuLimit: 250,
          memoryRequest: 128,
          memoryLimit: 256,
          memoryUsage: 80,
          cpuUsage: 30,
          ready: true,
          restarts: 0,
          createdTime: Date.now(),
          logs: ['v1.0 running'],
          env: {},
          livenessProbePassed: true,
          readinessProbePassed: true
        },
        {
          id: 'pod-v1-2',
          name: 'web-v1-a2',
          deploymentName: 'web',
          nodeId: 'node-1',
          status: 'Running',
          version: 'v1.0',
          cpuRequest: 100,
          cpuLimit: 250,
          memoryRequest: 128,
          memoryLimit: 256,
          memoryUsage: 80,
          cpuUsage: 30,
          ready: true,
          restarts: 0,
          createdTime: Date.now(),
          logs: ['v1.0 running'],
          env: {},
          livenessProbePassed: true,
          readinessProbePassed: true
        },
        {
          id: 'pod-v1-3',
          name: 'web-v1-a3',
          deploymentName: 'web',
          nodeId: 'node-2',
          status: 'Running',
          version: 'v1.0',
          cpuRequest: 100,
          cpuLimit: 250,
          memoryRequest: 128,
          memoryLimit: 256,
          memoryUsage: 80,
          cpuUsage: 30,
          ready: true,
          restarts: 0,
          createdTime: Date.now(),
          logs: ['v1.0 running'],
          env: {},
          livenessProbePassed: true,
          readinessProbePassed: true
        }
      ],
      services: [
        {
          name: 'web-service',
          type: 'ClusterIP',
          port: 80,
          targetPort: 80,
          selector: { app: 'web' },
          clusterIP: '10.96.0.12'
        }
      ],
      ingress: {
        name: 'main-ingress',
        rules: [{ path: '/', serviceName: 'web-service', servicePort: 80 }],
        enabled: true
      }
    }
  },
  {
    id: 7,
    name: 'Chaos Monkey & Node Failure',
    subtitle: 'Self-Healing Control Plane',
    k8sConcept: 'Kubelet Heartbeats & Node Eviction',
    briefing:
      'Chaos strike! A datacenter power failure knocked Worker Node-2 completely offline (`NotReady`). The Kubelet stopped sending heartbeats to the API server.\n\nWatch the Kube-Controller-Manager and Kube-Scheduler automatically evict pods from the dead node and reschedule them onto healthy nodes to restore the desired replica count!',
    explanation:
      'Kubernetes is fundamentally a reconciliation loop. The node controller polls node heartbeats (lease objects). When a node fails for more than `pod-eviction-timeout` (default 5m), the controller marks it unreachable and instructs the scheduler to instantiate replacement pods on surviving nodes.',
    initialYaml: `# Kube-Controller-Manager logic:
# 1. Node 'worker-node-2' status -> NotReady
# 2. Replicas drop below desired (2 < 4)
# 3. Scheduler evaluates Node-1 and Node-3 resources
# 4. Pods rescheduled automatically!`,
    hints: [
      'Node-2 is down! Check Node-1 and Node-3 capacity.',
      'If nodes are overloaded, click "+ Add Worker Node".',
      'The scheduler will automatically balance the evicted pods.'
    ],
    targetTrafficRate: 35,
    objectives: [
      {
        id: 'survive-failure',
        title: 'Maintain 4 Running Pods',
        description: 'Ensure desired replica count is restored on healthy nodes',
        isCompleted: (state) => {
          const healthyNodes = state.nodes.filter((n) => n.status === 'Ready').map((n) => n.id);
          const healthyPods = state.pods.filter((p) => p.status === 'Running' && healthyNodes.includes(p.nodeId));
          return healthyPods.length >= 4;
        }
      },
      {
        id: 'maintain-uptime',
        title: 'Recover SLA above 92%',
        description: 'Successfully route 50 requests after the hardware crash',
        isCompleted: (state) => state.successfulRequests >= 50 && state.sla >= 92
      }
    ],
    initialState: {
      trafficRate: 35,
      chaosActive: true,
      activeChaosEvent: 'Worker Node-2 Hardware Failure (Power Loss)!',
      nodes: [
        {
          id: 'node-1',
          name: 'worker-node-1',
          status: 'Ready',
          cpuCapacity: 1000,
          cpuAllocated: 200,
          memoryCapacity: 1024,
          memoryAllocated: 256
        },
        {
          id: 'node-2',
          name: 'worker-node-2',
          status: 'NotReady',
          cpuCapacity: 1000,
          cpuAllocated: 0,
          memoryCapacity: 1024,
          memoryAllocated: 0,
          isCrashed: true
        },
        {
          id: 'node-3',
          name: 'worker-node-3',
          status: 'Ready',
          cpuCapacity: 1000,
          cpuAllocated: 100,
          memoryCapacity: 1024,
          memoryAllocated: 128
        }
      ],
      deployments: [
        {
          name: 'web',
          image: 'web-app:2.0',
          version: 'v2.0',
          desiredReplicas: 4,
          availableReplicas: 2,
          cpuRequest: 150,
          cpuLimit: 300,
          memoryRequest: 128,
          memoryLimit: 256,
          env: {},
          hasLivenessProbe: true,
          hasReadinessProbe: true,
          hpaEnabled: false
        }
      ],
      pods: [
        {
          id: 'pod-live-1',
          name: 'web-n1-a',
          deploymentName: 'web',
          nodeId: 'node-1',
          status: 'Running',
          version: 'v2.0',
          cpuRequest: 150,
          cpuLimit: 300,
          memoryRequest: 128,
          memoryLimit: 256,
          memoryUsage: 90,
          cpuUsage: 45,
          ready: true,
          restarts: 0,
          createdTime: Date.now(),
          logs: ['Healthy on node-1'],
          env: {},
          livenessProbePassed: true,
          readinessProbePassed: true
        },
        {
          id: 'pod-live-2',
          name: 'web-n3-a',
          deploymentName: 'web',
          nodeId: 'node-3',
          status: 'Running',
          version: 'v2.0',
          cpuRequest: 150,
          cpuLimit: 300,
          memoryRequest: 128,
          memoryLimit: 256,
          memoryUsage: 90,
          cpuUsage: 45,
          ready: true,
          restarts: 0,
          createdTime: Date.now(),
          logs: ['Healthy on node-3'],
          env: {},
          livenessProbePassed: true,
          readinessProbePassed: true
        }
      ],
      services: [
        {
          name: 'web-service',
          type: 'ClusterIP',
          port: 80,
          targetPort: 80,
          selector: { app: 'web' },
          clusterIP: '10.96.0.12'
        }
      ],
      ingress: {
        name: 'main-ingress',
        rules: [{ path: '/', serviceName: 'web-service', servicePort: 80 }],
        enabled: true
      }
    }
  },
  {
    id: 8,
    name: 'Horizontal Pod Autoscaler (HPA)',
    subtitle: 'Autonomous Elastic Scaling',
    k8sConcept: 'HPA & Metrics-Server',
    briefing:
      'Black Friday Super Sale! Unpredictable traffic waves are hitting your cluster—surging from 15 req/s to 100+ req/s and crashing down again. Manually scaling replicas with kubectl is too slow!\n\nEnable the Horizontal Pod Autoscaler (HPA). The HPA controller queries the Metrics Server every 15s and dynamically calculates: `desiredReplicas = ceil[currentReplicas * (currentMetric / targetMetric)]`.',
    explanation:
      'HPA allows your cluster to scale up when load surges and scale back down when quiet, preventing outages while saving cloud infrastructure costs. It pairs with Cluster Autoscaler (CA) to dynamically add or remove worker nodes.',
    initialYaml: `apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: web-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: web
  minReplicas: 2
  maxReplicas: 7
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 60`,
    hints: [
      'Click "Enable HPA (Autoscaler)" or run `kubectl autoscale deployment web --min=2 --max=7 --cpu-percent=60`.',
      'Watch pods automatically scale out during traffic peaks and scale in during valleys.',
      'Maintain cluster stability across all 3 wave cycles!'
    ],
    targetTrafficRate: 60,
    objectives: [
      {
        id: 'enable-hpa',
        title: 'Activate Horizontal Pod Autoscaler',
        description: 'Configure HPA with min 2, max 7, and target CPU threshold',
        isCompleted: (state) => {
          const dep = state.deployments.find((d) => d.name === 'web');
          return !!(dep && dep.hpaEnabled);
        }
      },
      {
        id: 'scale-out-peak',
        title: 'Auto-Scale to 5+ Pods on Spike',
        description: 'Witness HPA dynamically spin up 5 or more pods during traffic rush',
        isCompleted: (state) => state.pods.filter((p) => p.status === 'Running').length >= 5
      },
      {
        id: 'survive-black-friday',
        title: 'Process 100 High-Load Requests',
        description: 'Successfully process 100 requests with > 94% SLA',
        isCompleted: (state) => state.successfulRequests >= 100 && state.sla >= 94
      }
    ],
    initialState: {
      trafficRate: 40,
      trafficSpikeActive: true,
      nodes: [
        {
          id: 'node-1',
          name: 'worker-node-1',
          status: 'Ready',
          cpuCapacity: 1000,
          cpuAllocated: 200,
          memoryCapacity: 1024,
          memoryAllocated: 256
        },
        {
          id: 'node-2',
          name: 'worker-node-2',
          status: 'Ready',
          cpuCapacity: 1000,
          cpuAllocated: 200,
          memoryCapacity: 1024,
          memoryAllocated: 256
        },
        {
          id: 'node-3',
          name: 'worker-node-3',
          status: 'Ready',
          cpuCapacity: 1000,
          cpuAllocated: 200,
          memoryCapacity: 1024,
          memoryAllocated: 256
        }
      ],
      deployments: [
        {
          name: 'web',
          image: 'ecommerce-cart:3.0',
          version: 'v3.0',
          desiredReplicas: 2,
          availableReplicas: 2,
          cpuRequest: 150,
          cpuLimit: 300,
          memoryRequest: 128,
          memoryLimit: 256,
          env: {},
          hasLivenessProbe: true,
          hasReadinessProbe: true,
          hpaEnabled: false,
          hpaMinReplicas: 2,
          hpaMaxReplicas: 7,
          hpaTargetCpu: 60
        }
      ],
      pods: [
        {
          id: 'pod-hpa-1',
          name: 'web-cart-1',
          deploymentName: 'web',
          nodeId: 'node-1',
          status: 'Running',
          version: 'v3.0',
          cpuRequest: 150,
          cpuLimit: 300,
          memoryRequest: 128,
          memoryLimit: 256,
          memoryUsage: 110,
          cpuUsage: 85,
          ready: true,
          restarts: 0,
          createdTime: Date.now(),
          logs: ['Processing incoming checkouts...'],
          env: {},
          livenessProbePassed: true,
          readinessProbePassed: true
        },
        {
          id: 'pod-hpa-2',
          name: 'web-cart-2',
          deploymentName: 'web',
          nodeId: 'node-2',
          status: 'Running',
          version: 'v3.0',
          cpuRequest: 150,
          cpuLimit: 300,
          memoryRequest: 128,
          memoryLimit: 256,
          memoryUsage: 110,
          cpuUsage: 88,
          ready: true,
          restarts: 0,
          createdTime: Date.now(),
          logs: ['Processing incoming checkouts...'],
          env: {},
          livenessProbePassed: true,
          readinessProbePassed: true
        }
      ],
      services: [
        {
          name: 'web-service',
          type: 'ClusterIP',
          port: 80,
          targetPort: 80,
          selector: { app: 'web' },
          clusterIP: '10.96.0.12'
        }
      ],
      ingress: {
        name: 'main-ingress',
        rules: [{ path: '/', serviceName: 'web-service', servicePort: 80 }],
        enabled: true
      }
    }
  }
];
