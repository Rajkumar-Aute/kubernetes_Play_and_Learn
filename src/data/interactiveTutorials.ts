import type { GameState } from '../types/game';

export interface TutorialStep {
  id: string;
  stepNumber: number;
  totalSteps: number;
  mentorMood: 'neutral' | 'happy' | 'alert' | 'thinking' | 'celebrate';
  dialogue: string;
  actionPrompt: string;
  actionButtonLabel: string;
  highlightTarget: 'scale' | 'test-request' | 'service' | 'env' | 'limits' | 'rollout' | 'hpa' | 'node' | 'inspect-pod' | 'none';
  educationalTakeaway: string;
  isComplete: (state: GameState) => boolean;
  successFeedback: string;
}

export interface MissionTutorial {
  levelId: number;
  title: string;
  conceptName: string;
  storyGoal: string;
  steps: TutorialStep[];
}

export const MISSION_TUTORIALS: Record<number, MissionTutorial> = {
  1: {
    levelId: 1,
    title: 'Hello Pod',
    conceptName: 'Pods & Scheduling',
    storyGoal: 'Get our first web application running on Kubernetes so users can visit the site!',
    steps: [
      {
        id: 'm1-step-1',
        stepNumber: 1,
        totalSteps: 3,
        mentorMood: 'neutral',
        dialogue:
          'Welcome to the cluster, Captain! 👋 Notice on the right: we have a worker node, but ZERO Pods running. In Kubernetes, applications cannot run as raw bare processes—they must live inside a Pod!',
        actionPrompt: 'Click the blue "+ Scale 1" button below to deploy your first Nginx Pod.',
        actionButtonLabel: '+ Scale 1',
        highlightTarget: 'scale',
        educationalTakeaway:
          'A Pod is the smallest deployable computing unit in Kubernetes. It encapsulates your container, network IP, and storage.',
        isComplete: (state) => state.pods.some((p) => p.status === 'Running'),
        successFeedback:
          'Boom! 🚀 The Kube-Scheduler assigned the Pod to worker-node-1, and the Kubelet started the container!'
      },
      {
        id: 'm1-step-2',
        stepNumber: 2,
        totalSteps: 3,
        mentorMood: 'happy',
        dialogue:
          'Look at that green glowing Pod! It is now in "Running" status. Let’s test if external users can reach it.',
        actionPrompt: 'Click the "🚀 Send Test Request" button to fire a single HTTP request into the cluster!',
        actionButtonLabel: '🚀 Send Test Request',
        highlightTarget: 'test-request',
        educationalTakeaway:
          'Traffic enters through the Ingress controller, passes through the Service (ClusterIP), and is routed to the Pod.',
        isComplete: (state) => state.successfulRequests >= 1,
        successFeedback:
          'HTTP 200 OK! 🎉 Did you see the packet travel? Ingress &rarr; Service &rarr; Pod!'
      },
      {
        id: 'm1-step-3',
        stepNumber: 3,
        totalSteps: 3,
        mentorMood: 'celebrate',
        dialogue:
          'Awesome! Now turn on Auto-Traffic or click Send Request a few more times to serve 10 successful requests and complete your mission.',
        actionPrompt: 'Serve at least 10 successful requests to verify cluster stability.',
        actionButtonLabel: 'Auto Traffic ON',
        highlightTarget: 'none',
        educationalTakeaway:
          'Kubernetes continuously monitors pod health to ensure requests are served reliably.',
        isComplete: (state) => state.successfulRequests >= 10,
        successFeedback:
          'Mission 1 Complete! You now understand what a Pod is and how traffic reaches it!'
      }
    ]
  },
  2: {
    levelId: 2,
    title: 'Traffic Surge & ReplicaSets',
    conceptName: 'Scaling & High Availability',
    storyGoal: 'Our website got featured on the news! Protect the single pod from collapsing under heavy traffic.',
    steps: [
      {
        id: 'm2-step-1',
        stepNumber: 1,
        totalSteps: 2,
        mentorMood: 'alert',
        dialogue:
          'Uh oh! ⚠️ Incoming traffic jumped to 25+ requests per second! Look at our single pod: its CPU meter is redlining at 95%!',
        actionPrompt: 'Click "+ Scale 1" until you have at least 3 Replicas running across the cluster nodes.',
        actionButtonLabel: '+ Scale 1',
        highlightTarget: 'scale',
        educationalTakeaway:
          'A single Pod is a Single Point of Failure (SPOF). Deployments manage ReplicaSets to ensure multiple pod copies share the workload.',
        isComplete: (state) => state.pods.filter((p) => p.status === 'Running').length >= 3,
        successFeedback:
          'Great scaling! Notice how the 3 pods are automatically distributed across Node-1 and Node-2!'
      },
      {
        id: 'm2-step-2',
        stepNumber: 2,
        totalSteps: 2,
        mentorMood: 'happy',
        dialogue:
          'Notice how CPU load dropped on each pod? The Service is balancing traffic evenly using Round-Robin load balancing!',
        actionPrompt: 'Maintain high SLA (>90%) while serving 30 requests to complete the mission.',
        actionButtonLabel: 'Serve Traffic',
        highlightTarget: 'none',
        educationalTakeaway:
          'Kubernetes Deployments provide declarative horizontal scaling. When replicas increase, the service automatically registers new endpoints.',
        isComplete: (state) => state.successfulRequests >= 30 && state.sla >= 90,
        successFeedback:
          'Mission 2 Cleared! You learned how ReplicaSets provide horizontal scaling and high availability!'
      }
    ]
  },
  3: {
    levelId: 3,
    title: 'Services & Load Balancing',
    conceptName: 'ClusterIP & Label Selectors',
    storyGoal: 'Pod IP addresses change constantly! Connect the Service selector so traffic can reach our pods.',
    steps: [
      {
        id: 'm3-step-1',
        stepNumber: 1,
        totalSteps: 2,
        mentorMood: 'alert',
        dialogue:
          'Look closely! We have 2 healthy pods running, BUT all incoming user requests are failing with 503 errors! Why? Because Pod IPs are temporary, and the Service selector does not match the Pod labels!',
        actionPrompt: 'Click "Link Service" to connect the Service selector to `app: web`.',
        actionButtonLabel: 'Link Service',
        highlightTarget: 'service',
        educationalTakeaway:
          'A Service provides a permanent virtual IP (ClusterIP). It finds backend pods using Label Selectors (e.g. app: web).',
        isComplete: (state) => {
          const svc = state.services.find((s) => s.name === 'web-service');
          return !!(svc && svc.selector['app'] === 'web');
        },
        successFeedback:
          'Endpoints Connected! 🔗 The Service just registered both Pod IPs in its routing table!'
      },
      {
        id: 'm3-step-2',
        stepNumber: 2,
        totalSteps: 2,
        mentorMood: 'happy',
        dialogue:
          'Now watch the traffic! Packets reach the Service ClusterIP (10.96.0.12), and the service splits them between Pod A and Pod B.',
        actionPrompt: 'Process 25 requests successfully through the Service.',
        actionButtonLabel: 'Process Packets',
        highlightTarget: 'none',
        educationalTakeaway:
          'Services decouple clients from ephemeral pod instances. Even if a pod restarts and gets a new IP, the Service handles it seamlessly.',
        isComplete: (state) => state.successfulRequests >= 25,
        successFeedback:
          'Mission 3 Cleared! You now understand Kubernetes Services and label selectors!'
      }
    ]
  },
  4: {
    levelId: 4,
    title: 'CrashLoopBackOff!',
    conceptName: 'Debugging & ConfigMaps',
    storyGoal: 'Diagnose why a newly deployed backend pod is repeatedly crashing on startup and heal it.',
    steps: [
      {
        id: 'm4-step-1',
        stepNumber: 1,
        totalSteps: 2,
        mentorMood: 'thinking',
        dialogue:
          '🚨 Red Alert! Our backend pod is stuck in CrashLoopBackOff! It starts, crashes with Exit Code 1, and the kubelet pauses with exponential backoff delay.',
        actionPrompt: 'Click on the red blinking pod to inspect its live container logs and find the error.',
        actionButtonLabel: 'Inspect Pod Logs',
        highlightTarget: 'inspect-pod',
        educationalTakeaway:
          'CrashLoopBackOff means the container died immediately after boot. Checking `kubectl logs` is always step #1.',
        isComplete: (state) =>
          state.terminalHistory.some((h) => h.text.includes('DB_HOST') || h.text.includes('logs')) ||
          state.selectedPodId !== undefined,
        successFeedback:
          'Found the culprit! Line 3 of logs: "FATAL: DB_HOST environment variable not found!"'
      },
      {
        id: 'm4-step-2',
        stepNumber: 2,
        totalSteps: 2,
        mentorMood: 'alert',
        dialogue:
          'The application crashed because it needs the database host address. In Kubernetes, we inject configuration using ConfigMaps or environment variables.',
        actionPrompt: 'Click "Fix DB_HOST" to inject the missing environment variable from our ConfigMap.',
        actionButtonLabel: 'Fix DB_HOST',
        highlightTarget: 'env',
        educationalTakeaway:
          'ConfigMaps and Secrets store configuration outside container images, keeping your Docker containers reusable across environments.',
        isComplete: (state) => {
          const pod = state.pods.find((p) => p.deploymentName === 'backend');
          return !!(pod && pod.status === 'Running' && pod.env['DB_HOST']);
        },
        successFeedback:
          'Healed! 💚 DB_HOST was injected, the container connected to postgres, and the pod is now Running!'
      }
    ]
  },
  5: {
    levelId: 5,
    title: 'OOMKilled & Limits',
    conceptName: 'Linux Cgroups & Memory Limits',
    storyGoal: 'Large batch payloads are causing pods to crash with OOMKilled. Fix the resource limits.',
    steps: [
      {
        id: 'm5-step-1',
        stepNumber: 1,
        totalSteps: 2,
        mentorMood: 'alert',
        dialogue:
          '💀 Danger! Incoming requests contain heavy data payloads (110MB+), but our pod memory limit is set to only 64MiB! The Linux kernel Out-Of-Memory Killer is terminating our pods with Exit Code 137 (SIGKILL)!',
        actionPrompt: 'Click "Fix OOM" below (or type `kubectl set resources deployment web --limits=memory=256Mi`) to grant pods more RAM.',
        actionButtonLabel: 'Fix OOM',
        highlightTarget: 'limits',
        educationalTakeaway:
          'CPU exceeding limits is throttled gracefully, but Memory exceeding limits results in immediate process termination (OOMKilled).',
        isComplete: (state) => {
          const dep = state.deployments.find((d) => d.name === 'web');
          return !!(dep && dep.memoryLimit >= 256);
        },
        successFeedback:
          'Memory limit upgraded to 256MiB! The Linux kernel no longer terminates the containers!'
      },
      {
        id: 'm5-step-2',
        stepNumber: 2,
        totalSteps: 2,
        mentorMood: 'happy',
        dialogue:
          'Now watch the memory meters! The pods comfortably process the heavy data batches without crashing.',
        actionPrompt: 'Process 30 requests to confirm the cluster is stable with zero OOM errors.',
        actionButtonLabel: 'Stabilize Cluster',
        highlightTarget: 'none',
        educationalTakeaway:
          'Always set realistic resource Requests (for scheduling) and Limits (for cgroup enforcement) with headroom for peaks.',
        isComplete: (state) =>
          state.pods.length >= 2 && state.pods.every((p) => p.status === 'Running') && state.successfulRequests >= 30,
        successFeedback:
          'Mission 5 Cleared! You now master the difference between CPU throttling and memory OOMKilled!'
      }
    ]
  },
  6: {
    levelId: 6,
    title: 'Zero-Downtime Rolling Update',
    conceptName: 'RollingUpdate & Readiness Probes',
    storyGoal: 'Upgrade from version v1.0 to v2.0 live while active users are placing orders!',
    steps: [
      {
        id: 'm6-step-1',
        stepNumber: 1,
        totalSteps: 2,
        mentorMood: 'thinking',
        dialogue:
          'Engineering just shipped Version 2.0! In legacy architectures, you had to schedule downtime at 2 AM. In Kubernetes, we execute a **Rolling Update** with zero downtime!',
        actionPrompt: 'Click "Rollout v2" to upgrade the image to web-app:2.0.',
        actionButtonLabel: 'Rollout v2',
        highlightTarget: 'rollout',
        educationalTakeaway:
          'RollingUpdate starts replacement v2 pods first, waits for Readiness Probes to confirm they are ready, switches traffic, and then deletes old v1 pods.',
        isComplete: (state) => {
          const running = state.pods.filter((p) => p.status === 'Running');
          return running.length >= 3 && running.every((p) => p.version === 'v2.0');
        },
        successFeedback:
          'Rollout Complete! Notice that not a single user request was dropped during the upgrade!'
      },
      {
        id: 'm6-step-2',
        stepNumber: 2,
        totalSteps: 2,
        mentorMood: 'celebrate',
        dialogue:
          'Notice how Readiness Probes prevented users from hitting warming-up containers? Zero 502/503 errors!',
        actionPrompt: 'Serve 40 requests with 98%+ SLA to verify the new v2.0 deployment.',
        actionButtonLabel: 'Confirm 98% SLA',
        highlightTarget: 'none',
        educationalTakeaway:
          'Readiness probes tell Kubernetes when a container is ready to accept user connections.',
        isComplete: (state) => state.successfulRequests >= 40 && state.sla >= 98,
        successFeedback:
          'Mission 6 Cleared! You executed a zero-downtime rolling update like a senior SRE!'
      }
    ]
  },
  7: {
    levelId: 7,
    title: 'Chaos Monkey & Node Failure',
    conceptName: 'Self-Healing & Node Controller',
    storyGoal: 'A datacenter power outage knocked Worker Node-2 offline. Watch Kubernetes self-heal.',
    steps: [
      {
        id: 'm7-step-1',
        stepNumber: 1,
        totalSteps: 2,
        mentorMood: 'alert',
        dialogue:
          '💥 Disaster strike! Worker Node-2 had a hardware power failure and is `NotReady`! Half of our pods died with it.',
        actionPrompt: 'Observe the Kube-Scheduler automatically evict pods and reschedule them onto surviving nodes (Node-1 & Node-3). If nodes get full, click "+ Node"!',
        actionButtonLabel: '+ Node (Optional)',
        highlightTarget: 'node',
        educationalTakeaway:
          'The Node Controller polls kubelet heartbeats. When a node stops responding, the controller reconciles desired state by launching replacement pods elsewhere.',
        isComplete: (state) => {
          const healthyNodes = state.nodes.filter((n) => n.status === 'Ready').map((n) => n.id);
          const healthyPods = state.pods.filter((p) => p.status === 'Running' && healthyNodes.includes(p.nodeId));
          return healthyPods.length >= 4;
        },
        successFeedback:
          'Self-Healing in action! The cluster recovered all 4 desired pods without manual intervention!'
      },
      {
        id: 'm7-step-2',
        stepNumber: 2,
        totalSteps: 2,
        mentorMood: 'happy',
        dialogue:
          'This is the core promise of Kubernetes: declarative state reconciliation. Even when hardware melts, your service survives.',
        actionPrompt: 'Process 50 requests with >92% SLA to confirm recovery.',
        actionButtonLabel: 'Complete Mission',
        highlightTarget: 'none',
        educationalTakeaway:
          'Kubernetes continuously reconciles current state toward declared desired state.',
        isComplete: (state) => state.successfulRequests >= 50 && state.sla >= 92,
        successFeedback:
          'Mission 7 Cleared! You saw true Kubernetes self-healing resilience!'
      }
    ]
  },
  8: {
    levelId: 8,
    title: 'Horizontal Pod Autoscaler (HPA)',
    conceptName: 'Autonomous Elastic Scaling',
    storyGoal: 'Survive Black Friday traffic rushes with autonomous CPU-based autoscaling.',
    steps: [
      {
        id: 'm8-step-1',
        stepNumber: 1,
        totalSteps: 2,
        mentorMood: 'alert',
        dialogue:
          '🛒 Black Friday is here! Traffic surges from 15 req/s to 100+ req/s unpredictably. Scaling pods manually with kubectl is way too slow!',
        actionPrompt: 'Click "Enable HPA" to turn on the Horizontal Pod Autoscaler with target 60% CPU utilization.',
        actionButtonLabel: 'Enable HPA',
        highlightTarget: 'hpa',
        educationalTakeaway:
          'HPA queries the Metrics Server every 15s and scales replicas automatically: desiredReplicas = ceil[currentReplicas * (currentCpu / targetCpu)].',
        isComplete: (state) => {
          const dep = state.deployments.find((d) => d.name === 'web');
          return !!(dep && dep.hpaEnabled);
        },
        successFeedback:
          'HPA Activated! 📈 Watch the cluster automatically breathe—scaling up when traffic surges, and scaling down when quiet!'
      },
      {
        id: 'm8-step-2',
        stepNumber: 2,
        totalSteps: 2,
        mentorMood: 'celebrate',
        dialogue:
          'Look at the pods automatically multiplying to absorb the traffic spike, saving your SLA without human intervention!',
        actionPrompt: 'Serve 100 high-load requests with >94% SLA to complete the entire Kubernetes Academy!',
        actionButtonLabel: 'Survive Surge',
        highlightTarget: 'none',
        educationalTakeaway:
          'Autonomous scaling balances reliability with cloud cost optimization.',
        isComplete: (state) => state.successfulRequests >= 100 && state.sla >= 94,
        successFeedback:
          '🏆 CONGRATULATIONS! You have graduated as a Kubernetes Fleet Master! You understand Pods, Deployments, Services, Debugging, Cgroups, Rolling Updates, Self-Healing, and Autoscaling!'
      }
    ]
  }
};
