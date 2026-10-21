import type { GameState } from '../types/game';

export interface FresherDetail {
  analogy: string;
  whatIsHappening: string[];
  whyItMatters: string;
  interviewTip: string;
  keyTerms: Array<{ term: string; explanation: string }>;
}

export interface TutorialStep {
  id: string;
  stepNumber: number;
  totalSteps: number;
  mentorMood: 'neutral' | 'happy' | 'alert' | 'thinking' | 'celebrate';
  dialogue: string;
  actionPrompt: string;
  actionButtonLabel: string;
  highlightTarget: 'scale' | 'test-request' | 'auto-traffic' | 'service' | 'env' | 'limits' | 'rollout' | 'hpa' | 'node' | 'inspect-pod' | 'none';
  educationalTakeaway: string;
  isComplete: (state: GameState) => boolean;
  successFeedback: string;
  fresherDetail: FresherDetail;
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
    conceptName: 'Pods, Containers & Scheduling',
    storyGoal: 'Get our first web application running on Kubernetes so real users can visit our website!',
    steps: [
      {
        id: 'm1-step-1',
        stepNumber: 1,
        totalSteps: 3,
        mentorMood: 'neutral',
        dialogue:
          'Welcome to Kubernetes! 👋 Right now, our cluster has 1 Worker Node (a virtual server), but ZERO Pods running. If a user visits our website, nothing responds because there is no application code running to handle the request!',
        actionPrompt: 'Click the blue "+ Scale 1" button below to tell Kubernetes to deploy 1 Pod.',
        actionButtonLabel: '+ Scale 1',
        highlightTarget: 'scale',
        educationalTakeaway:
          'In Kubernetes, you cannot run bare code or raw containers on the host. Every container must be scheduled inside a Pod.',
        isComplete: (state) => state.pods.some((p) => p.status === 'Running'),
        successFeedback:
          'Boom! 🚀 Look at worker-node-1 on the right: a new Pod (web-xxx) was scheduled, image pulled, and is now glowing green ("Running")!',
        fresherDetail: {
          analogy:
            'Think of a Worker Node like an apartment building floor, and a Pod like an apartment unit. You cannot leave tenants (your Docker containers) sleeping out in the hallway; you must assign them an apartment unit (a Pod) with its own door, IP address, and storage!',
          whatIsHappening: [
            '1. You issued a desired state: "I want 1 replica of the web application".',
            '2. Kube-API Server registered this request in the cluster database (etcd).',
            '3. Kube-Scheduler evaluated worker nodes and chose worker-node-1 (it had free CPU and RAM).',
            '4. Kubelet (the node agent) talked to the container runtime (Docker/containerd) to pull the nginx image and start the container.'
          ],
          whyItMatters:
            'Instead of manually logging into servers via SSH and running commands, Kubernetes automates application deployment declaratively.',
          interviewTip:
            'Interview Question: "Why does Kubernetes use Pods instead of running containers directly?" -> Answer: "A Pod is an abstraction that wraps one or more tightly coupled containers sharing the same Linux network namespace (localhost) and shared storage volumes."',
          keyTerms: [
            { term: 'Pod', explanation: 'The smallest deployable unit in Kubernetes that wraps your containerized application.' },
            { term: 'Worker Node', explanation: 'A physical server or cloud VM (e.g. AWS EC2 instance) with CPU & RAM where pods execute.' },
            { term: 'Kube-Scheduler', explanation: 'The control plane component that decides which node has enough space for a new pod.' }
          ]
        }
      },
      {
        id: 'm1-step-2',
        stepNumber: 2,
        totalSteps: 3,
        mentorMood: 'happy',
        dialogue:
          'Awesome! Your Pod is Running and ready. But how do internet users actually reach it? That is where Networking comes in! Let’s fire a single test user request to watch how traffic travels into your cluster.',
        actionPrompt: 'Click the "🚀 Send 1 Request" button to send an HTTP GET request into the cluster.',
        actionButtonLabel: '🚀 Send 1 Request',
        highlightTarget: 'test-request',
        educationalTakeaway:
          'Traffic enters through the Ingress controller from the internet, gets balanced by the Service, and hits the target Pod.',
        isComplete: (state) => state.successfulRequests >= 1,
        successFeedback:
          'HTTP 200 OK! 🎉 Did you see the glowing packet travel? Ingress (Gateway) -> Service (Load Balancer) -> Pod (Nginx container)!',
        fresherDetail: {
          analogy:
            'Ingress is like the front entrance security gate of a company building. The Service is the front-desk receptionist who knows where people sit. The Pod is the actual employee answering the phone!',
          whatIsHappening: [
            '1. A user browser sends an HTTP GET request to our domain.',
            '2. The Ingress Gateway accepts it on external ports 80/443.',
            '3. The Ingress forwards it to the internal ClusterIP Service.',
            '4. The Service finds our ready Pod and delivers the packet. The Pod processes it and returns HTTP 200 OK.'
          ],
          whyItMatters:
            'Pods are ephemeral—they can be destroyed and recreated anytime. Services give them a permanent, reliable virtual IP so external users never notice internal IP changes.',
          interviewTip:
            'Interview Question: "What is the difference between Ingress and Service?" -> Answer: "A Service operates at Layer 4 (TCP/UDP) inside the cluster. An Ingress operates at Layer 7 (HTTP/HTTPS) to route external hostnames and paths (like /api vs /web) into internal services."',
          keyTerms: [
            { term: 'HTTP Request', explanation: 'A message sent by a web browser (e.g. Chrome) asking a server for data or a webpage.' },
            { term: 'HTTP 200 OK', explanation: 'Standard HTTP status code meaning the server successfully handled the request.' },
            { term: 'Service', explanation: 'A stable virtual IP that load-balances traffic across matching healthy pods.' }
          ]
        }
      },
      {
        id: 'm1-step-3',
        stepNumber: 3,
        totalSteps: 3,
        mentorMood: 'celebrate',
        dialogue:
          'Now let’s test cluster stability! In real life, users do not arrive one at a time. The [Auto: OFF/ON] switch simulates continuous real-world web traffic (4 visitors per second). Turn it ON or send requests to serve 10 successful requests!',
        actionPrompt: 'Click "Auto: ON" (or click "Send 1 Request" multiple times) until you reach 10 successful requests.',
        actionButtonLabel: 'Auto: ON',
        highlightTarget: 'auto-traffic',
        educationalTakeaway:
          'Continuous traffic tests whether your pod has sufficient CPU/memory resources and health checks to maintain uptime without crashing.',
        isComplete: (state) => state.successfulRequests >= 10,
        successFeedback:
          'Mission 1 Complete! 🏆 You successfully deployed a Pod, routed web traffic to it, and verified cluster stability!',
        fresherDetail: {
          analogy:
            'Testing 1 request is like turning on a light switch once. Testing 10 continuous requests is like leaving the light on all day to make sure the wiring does not overheat and blow a fuse!',
          whatIsHappening: [
            '1. Simulated users are sending requests continuously.',
            '2. The Pod receives each packet, uses a tiny slice of CPU and RAM, and replies with 200 OK.',
            '3. The cluster metrics bar tracks your SLA (Service Level Agreement uptime percentage).'
          ],
          whyItMatters:
            'In production DevOps, we benchmark and load test services before launch to guarantee they do not crash when thousands of customers arrive simultaneously.',
          interviewTip:
            'Interview Question: "What is SLA in cloud infrastructure?" -> Answer: "SLA (Service Level Agreement) is the promised percentage of uptime (e.g. 99.9% uptime = less than 8.7 hours of downtime per year)."',
          keyTerms: [
            { term: 'Auto-Traffic', explanation: 'Simulated stream of real-world internet users continuously visiting your website.' },
            { term: 'SLA (Uptime)', explanation: 'Percentage of requests successfully handled without error (Target: >99%).' },
            { term: 'Stability', explanation: 'Ensuring servers remain running smoothly under continuous workloads without crashing.' }
          ]
        }
      }
    ]
  },
  2: {
    levelId: 2,
    title: 'Traffic Surge & ReplicaSets',
    conceptName: 'Horizontal Scaling & Deployments',
    storyGoal: 'Our website got featured on the news! A single pod is hitting 95% CPU. Scale to 3 pods to share the load.',
    steps: [
      {
        id: 'm2-step-1',
        stepNumber: 1,
        totalSteps: 2,
        mentorMood: 'alert',
        dialogue:
          'Breaking news! ⚠️ Traffic surged from 4 to 25+ requests per second! Look at our single pod on worker-node-1: its CPU usage is redlining at 95%! A single server cannot handle this volume alone.',
        actionPrompt: 'Click "+ Scale 1" until you have at least 3 Replicas running across the cluster nodes.',
        actionButtonLabel: '+ Scale 1',
        highlightTarget: 'scale',
        educationalTakeaway:
          'Running only 1 pod is a Single Point of Failure (SPOF). Kubernetes Deployments manage ReplicaSets to ensure multiple pod instances share the load.',
        isComplete: (state) => state.pods.filter((p) => p.status === 'Running').length >= 3,
        successFeedback:
          'Awesome! 3 Replicas are now running and automatically distributed across worker-node-1 and worker-node-2!',
        fresherDetail: {
          analogy:
            'Imagine a grocery store with only 1 cashier. When 50 customers arrive, the line stretches out the door and the cashier collapses from exhaustion! Opening 2 more checkout counters (scaling replicas from 1 to 3) shares the line so everyone gets served quickly.',
          whatIsHappening: [
            '1. You scaled desired replicas from 1 to 3.',
            '2. The ReplicaSet controller detected: desired (3) != actual (1).',
            '3. It requested 2 additional pods.',
            '4. Kube-Scheduler placed Pod 2 on Node-1 and Pod 3 on Node-2 to balance hardware resources.'
          ],
          whyItMatters:
            'Horizontal scaling (adding more small pods) is cheaper, more fault-tolerant, and more elastic than vertical scaling (buying a giant expensive machine).',
          interviewTip:
            'Interview Question: "What is the relationship between Deployment and ReplicaSet?" -> Answer: "A Deployment manages ReplicaSets, and a ReplicaSet manages Pods. Deployments provide declarative updates and rollback capabilities for ReplicaSets."',
          keyTerms: [
            { term: 'ReplicaSet', explanation: 'A Kubernetes controller that ensures a specified number of identical pod copies are running at all times.' },
            { term: 'Horizontal Scaling', explanation: 'Adding more instances/pods of an application to distribute workload.' },
            { term: 'SPOF', explanation: 'Single Point of Failure—a component whose failure halts the entire system.' }
          ]
        }
      },
      {
        id: 'm2-step-2',
        stepNumber: 2,
        totalSteps: 2,
        mentorMood: 'happy',
        dialogue:
          'Notice how CPU load dropped from 95% down to ~30% per pod? The Service is distributing incoming requests across all 3 pods using Round-Robin load balancing!',
        actionPrompt: 'Maintain high SLA (>90%) while serving 30 requests to complete the mission.',
        actionButtonLabel: 'Serve 30 Packets',
        highlightTarget: 'none',
        educationalTakeaway:
          'Because the Service automatically discovers new pod endpoints, you can scale pods up or down dynamically with zero code changes.',
        isComplete: (state) => state.successfulRequests >= 30 && state.sla >= 90,
        successFeedback:
          'Mission 2 Cleared! 🏆 You learned how Kubernetes Deployments and ReplicaSets absorb traffic spikes!',
        fresherDetail: {
          analogy:
            'Round-Robin load balancing is like dealing a deck of cards: Player 1 gets a card, Player 2 gets a card, Player 3 gets a card, then back to Player 1. Every pod does an equal share of the work!',
          whatIsHappening: [
            '1. Traffic arrives at the Service ClusterIP.',
            '2. The Kube-Proxy iptables/IPVS rules alternate packets across Pod 1, Pod 2, and Pod 3.',
            '3. Individual pod CPU stays healthy and cool.'
          ],
          whyItMatters:
            'Load balancing prevents any single pod from choking, guaranteeing fast response times (low latency) for end users.',
          interviewTip:
            'Interview Question: "How does a Service know which pods to send traffic to?" -> Answer: "A Service uses label selectors to find pods. It creates an Endpoints object containing the private IP addresses of all healthy pods matching that label."',
          keyTerms: [
            { term: 'Round-Robin', explanation: 'An algorithm that cycles through a list of servers sequentially to distribute incoming work equally.' },
            { term: 'Endpoints', explanation: 'The list of IP addresses of ready pods currently registered behind a Kubernetes Service.' }
          ]
        }
      }
    ]
  },
  3: {
    levelId: 3,
    title: 'Services & Load Balancing',
    conceptName: 'ClusterIP & Label Selectors',
    storyGoal: 'Pods have ephemeral IPs that change! Connect the Service selector so traffic can reach our pods.',
    steps: [
      {
        id: 'm3-step-1',
        stepNumber: 1,
        totalSteps: 2,
        mentorMood: 'alert',
        dialogue:
          'Look closely! We have 2 healthy pods running, BUT all incoming user requests are failing with 503 errors! Why? Because Pod IPs are temporary, and our Service selector does not match the Pod labels!',
        actionPrompt: 'Click "Link Service" below to configure the Service selector to match `app: web`.',
        actionButtonLabel: 'Link Service',
        highlightTarget: 'service',
        educationalTakeaway:
          'A Kubernetes Service acts as a stable reverse-proxy. It connects to pods using key-value Label Selectors.',
        isComplete: (state) => {
          const svc = state.services.find((s) => s.name === 'web-service');
          return !!(svc && svc.selector['app'] === 'web');
        },
        successFeedback:
          'Endpoints Connected! 🔗 The Service registered both Pods into its endpoint list and traffic is now flowing!',
        fresherDetail: {
          analogy:
            'Imagine employees at a company who change desks every day. You cannot give clients individual employee extension numbers. Instead, you give them a main office phone number (the Service) with a department directory (the Label Selector: "Department = Sales"). The receptionist forwards the call to whoever is at a sales desk today!',
          whatIsHappening: [
            '1. Pods were labeled: app=web.',
            '2. The Service was previously looking for app=unmatched, finding 0 pods.',
            '3. When you fixed the selector to app=web, the Endpoint controller immediately registered both pod IPs.',
            '4. Traffic packets immediately began flowing to the pods.'
          ],
          whyItMatters:
            'In cloud environments, pods are destroyed during autoscaling, node upgrades, and crashes. Without Services, you would have to manually reconfigure firewall and IP rules every time a pod restarts!',
          interviewTip:
            'Interview Question: "What are the 3 main types of Kubernetes Services?" -> Answer: "1. ClusterIP (internal only, default), 2. NodePort (exposes static port on every node IP), 3. LoadBalancer (provisions cloud load balancer like AWS ALB or GCP Load Balancer)."',
          keyTerms: [
            { term: 'Labels', explanation: 'Key-value pairs attached to Kubernetes objects (e.g. app=web, tier=backend) for identification.' },
            { term: 'Selector', explanation: 'A query filter in a Service that specifies which labeled pods should receive traffic.' },
            { term: 'ClusterIP', explanation: 'A private virtual IP accessible only from within the Kubernetes cluster.' }
          ]
        }
      },
      {
        id: 'm3-step-2',
        stepNumber: 2,
        totalSteps: 2,
        mentorMood: 'happy',
        dialogue:
          'Now watch the network lines! Packets enter the Service ClusterIP (10.96.0.12), and the service smoothly routes them across Pod A and Pod B.',
        actionPrompt: 'Process 25 requests successfully through the Service.',
        actionButtonLabel: 'Process 25 Packets',
        highlightTarget: 'none',
        educationalTakeaway:
          'Services decouple clients from ephemeral pod instances. Even if a pod restarts and gets a new IP, the Service handles it seamlessly.',
        isComplete: (state) => state.successfulRequests >= 25,
        successFeedback:
          'Mission 3 Cleared! 🏆 You now understand Kubernetes Service networking and label selectors!',
        fresherDetail: {
          analogy:
            'If a waiter leaves the restaurant floor, the restaurant does not shut down. The host simply assigns new orders to other active waiters. That host is the Kubernetes Service!',
          whatIsHappening: [
            '1. Each incoming HTTP request hits the Service.',
            '2. The Service inspects its active endpoints.',
            '3. It routes packets to Pod 1, then Pod 2, verifying HTTP 200 responses.'
          ],
          whyItMatters:
            'Decoupling networking from physical machines is the core reason Kubernetes revolutionized cloud computing.',
          interviewTip:
            'Interview Question: "What is Kube-Proxy?" -> Answer: "Kube-Proxy is a network proxy that runs on each node in the cluster, maintaining network rules to allow network communication to your Pods from network sessions inside or outside of your cluster."',
          keyTerms: [
            { term: 'Kube-Proxy', explanation: 'The Kubernetes network component running on each node that implements Services using iptables or IPVS.' },
            { term: 'Ephemeral', explanation: 'Short-lived and disposable. Kubernetes pods are designed to be created and destroyed without warning.' }
          ]
        }
      }
    ]
  },
  4: {
    levelId: 4,
    title: 'CrashLoopBackOff!',
    conceptName: 'Debugging, Logs & ConfigMaps',
    storyGoal: 'A new backend pod keeps crashing on boot! Inspect logs with kubectl, diagnose the missing ENV, and fix it.',
    steps: [
      {
        id: 'm4-step-1',
        stepNumber: 1,
        totalSteps: 2,
        mentorMood: 'thinking',
        dialogue:
          '🚨 Red Alert! Our backend API pod is stuck in CrashLoopBackOff! Look at its pulsing red badge. It starts, crashes immediately, and restarts with an increasing backoff timer delay (10s, 20s, 40s...).',
        actionPrompt: 'Click on the red blinking pod to inspect its live container logs (stdout/stderr).',
        actionButtonLabel: 'Inspect Pod Logs',
        highlightTarget: 'inspect-pod',
        educationalTakeaway:
          'CrashLoopBackOff means the container died immediately after boot. Checking `kubectl logs` is always the first troubleshooting step.',
        isComplete: (state) =>
          state.terminalHistory.some((h) => h.text.includes('DB_HOST') || h.text.includes('logs')) ||
          state.selectedPodId !== undefined,
        successFeedback:
          'Found the bug! Look at line 3 of the logs: "FATAL: DB_HOST environment variable not found! Exit Code 1".',
        fresherDetail: {
          analogy:
            'CrashLoopBackOff is like trying to start a car with no gasoline in the tank. The engine turns over, sputters, and dies immediately. Trying to turn the ignition 100 times per second would ruin the battery, so the driver pauses longer between each attempt (exponential backoff)!',
          whatIsHappening: [
            '1. The container process booted and tried to read process.env.DB_HOST.',
            '2. The variable was missing/undefined.',
            '3. The application threw an unhandled exception and exited with Exit Code 1.',
            '4. Kubelet saw the exit, waited a backoff delay, and tried restarting it.'
          ],
          whyItMatters:
            'CrashLoopBackOff is the single most common error fresh DevOps engineers encounter in production. Knowing how to read container logs immediately isolates the root cause.',
          interviewTip:
            'Interview Question: "What are the common causes of CrashLoopBackOff?" -> Answer: "1. Missing environment variables or configuration, 2. Port already in use or database unreachable, 3. Wrong container command/entrypoint, 4. Failed liveness probe, 5. Application runtime error on boot."',
          keyTerms: [
            { term: 'CrashLoopBackOff', explanation: 'A pod state where a container crashes immediately upon launch and Kubernetes retries with increasing delay.' },
            { term: 'Exit Code 1', explanation: 'Standard Linux exit status code indicating a general application runtime crash or fatal error.' },
            { term: 'kubectl logs', explanation: 'Command used to view the stdout and stderr console output of a container.' }
          ]
        }
      },
      {
        id: 'm4-step-2',
        stepNumber: 2,
        totalSteps: 2,
        mentorMood: 'alert',
        dialogue:
          'The pod crashed because it could not find its database host address! In Kubernetes, we inject configuration into pods using ConfigMaps or Environment variables.',
        actionPrompt: 'Click "Fix DB_HOST" below to inject DB_HOST="postgres-cluster" into the deployment.',
        actionButtonLabel: 'Fix DB_HOST',
        highlightTarget: 'env',
        educationalTakeaway:
          'ConfigMaps and Secrets store configuration outside container images, keeping your Docker containers reusable across dev, staging, and production.',
        isComplete: (state) => {
          const pod = state.pods.find((p) => p.deploymentName === 'backend');
          return !!(pod && pod.status === 'Running' && pod.env['DB_HOST']);
        },
        successFeedback:
          'Healed! 💚 The container found DB_HOST, connected to postgres, and transitioned to Running!',
        fresherDetail: {
          analogy:
            'Hardcoding database URLs inside your Docker image is like printing your home address directly onto your car door. If you move houses, you have to buy a new car! Using ConfigMaps is like plugging a GPS into the dashboard—the car stays identical, but the destination changes easily.',
          whatIsHappening: [
            '1. You added env: [{ name: "DB_HOST", value: "postgres-cluster" }] to the Deployment spec.',
            '2. The deployment controller triggered a pod restart with the new environment variables.',
            '3. The container booted, connected to postgres, and passed its health check.'
          ],
          whyItMatters:
            '12-Factor App methodology mandates storing configuration in the environment, not in code or images.',
          interviewTip:
            'Interview Question: "What is the difference between ConfigMap and Secret?" -> Answer: "ConfigMaps store non-sensitive plain-text configuration (like URLs, ports, log levels). Secrets store confidential data (like passwords, API keys, certificates) encoded in Base64 or encrypted at rest in etcd."',
          keyTerms: [
            { term: 'ConfigMap', explanation: 'An API object used to store non-confidential key-value configuration data.' },
            { term: 'Secret', explanation: 'An API object used to store sensitive data like tokens, passwords, and SSH keys.' }
          ]
        }
      }
    ]
  },
  5: {
    levelId: 5,
    title: 'OOMKilled & Limits',
    conceptName: 'Linux Cgroups & Memory Ceilings',
    storyGoal: 'Heavy payload traffic causes pods to crash with Exit Code 137 OOMKilled. Fix resource limits.',
    steps: [
      {
        id: 'm5-step-1',
        stepNumber: 1,
        totalSteps: 2,
        mentorMood: 'alert',
        dialogue:
          '💀 Danger! Incoming requests contain heavy batch payloads (110MB+), but our pod memory limit is set to only 64MiB! The Linux kernel Out-Of-Memory Killer abruptly terminates our pods with Exit Code 137 (SIGKILL)!',
        actionPrompt: 'Click "Fix OOM" below (or type `kubectl set resources deployment web --limits=memory=256Mi`) to grant pods more RAM.',
        actionButtonLabel: 'Fix OOM',
        highlightTarget: 'limits',
        educationalTakeaway:
          'CPU exceeding limits is throttled gracefully, but Memory exceeding limits results in immediate process termination (OOMKilled - Exit Code 137).',
        isComplete: (state) => {
          const dep = state.deployments.find((d) => d.name === 'web');
          return !!(dep && dep.memoryLimit >= 256);
        },
        successFeedback:
          'Memory limit upgraded to 256MiB! The Linux kernel no longer terminates the containers!',
        fresherDetail: {
          analogy:
            'Think of a computer with a tiny 64MB glass of water. If a 110MB pitcher of water is poured in, the water overflows. Unlike CPU (which is like a traffic jam where cars just slow down), memory overflow causes the operating system to pull the emergency kill switch instantly!',
          whatIsHappening: [
            '1. Container memory limit was set to 64MiB in cgroups.',
            '2. High traffic requests allocated ~120MiB of RAM.',
            '3. The Linux Kernel detected the violation and sent SIGKILL (Signal 9, 128 + 9 = Exit Code 137).',
            '4. Increasing limits to 256MiB gives the application enough breathing room.'
          ],
          whyItMatters:
            'Properly sizing memory limits prevents cascading outages across a production cluster.',
          interviewTip:
            'Interview Question: "What does Exit Code 137 mean?" -> Answer: "Exit Code 137 indicates the container was terminated by the operating system due to receiving SIGKILL (signal 9), almost always caused by the Linux Out-Of-Memory (OOM) Killer when memory limits are exceeded."',
          keyTerms: [
            { term: 'OOMKilled', explanation: 'Out Of Memory Killed—termination of a process by the Linux kernel when it exceeds its allocated memory ceiling.' },
            { term: 'Exit Code 137', explanation: '128 + Signal 9 (SIGKILL). The universal signature of an OOMKilled container.' },
            { term: 'cgroups', explanation: 'Control Groups—the Linux kernel feature that isolates and limits CPU/Memory resources for containers.' }
          ]
        }
      },
      {
        id: 'm5-step-2',
        stepNumber: 2,
        totalSteps: 2,
        mentorMood: 'happy',
        dialogue:
          'Now watch the memory meters! The pods comfortably process the heavy data batches without crashing.',
        actionPrompt: 'Process 30 requests to confirm the cluster is stable with zero OOM errors.',
        actionButtonLabel: 'Confirm Stability',
        highlightTarget: 'none',
        educationalTakeaway:
          'Always set realistic resource Requests (for scheduling) and Limits (for cgroup enforcement) with headroom for peaks.',
        isComplete: (state) =>
          state.pods.length >= 2 && state.pods.every((p) => p.status === 'Running') && state.successfulRequests >= 30,
        successFeedback:
          'Mission 5 Cleared! 🏆 You now master the difference between CPU throttling and memory OOMKilled!',
        fresherDetail: {
          analogy:
            'Requests are what you ask for when booking a hotel room ("I need a bed"). Limits are the maximum rules ("No more than 4 guests in this room"). Kubernetes uses requests to pick a hotel, and limits to enforce the rules.',
          whatIsHappening: [
            '1. Requests dictate which node the Kube-Scheduler places the pod on.',
            '2. Limits prevent a rogue pod with a memory leak from taking down the entire physical server.'
          ],
          whyItMatters:
            'Resource requests and limits are mandatory best practices in enterprise Kubernetes environments.',
          interviewTip:
            'Interview Question: "What is the difference between Resource Requests and Limits?" -> Answer: "Requests guarantee minimum resources for scheduling; Limits define the hard maximum ceiling a container is allowed to consume on a node."',
          keyTerms: [
            { term: 'Requests', explanation: 'The minimum guaranteed CPU and RAM required to schedule and run a container.' },
            { term: 'Limits', explanation: 'The maximum ceiling of CPU and RAM a container is allowed to consume.' }
          ]
        }
      }
    ]
  },
  6: {
    levelId: 6,
    title: 'Zero-Downtime Rolling Update',
    conceptName: 'RollingUpdate & Readiness Probes',
    storyGoal: 'Upgrade from version v1.0 to v2.0 live while active users are placing orders without dropping a single packet!',
    steps: [
      {
        id: 'm6-step-1',
        stepNumber: 1,
        totalSteps: 2,
        mentorMood: 'thinking',
        dialogue:
          'Engineering just shipped Version 2.0 of our app! In legacy servers, you had to schedule a 2 AM maintenance outage. In Kubernetes, we execute a **Rolling Update** with zero downtime!',
        actionPrompt: 'Click "Rollout v2" to upgrade the image to web-app:2.0.',
        actionButtonLabel: 'Rollout v2',
        highlightTarget: 'rollout',
        educationalTakeaway:
          'RollingUpdate starts replacement v2 pods first, waits for Readiness Probes to confirm they are ready, switches traffic, and only then terminates v1 pods.',
        isComplete: (state) => {
          const running = state.pods.filter((p) => p.status === 'Running');
          return running.length >= 3 && running.every((p) => p.version === 'v2.0');
        },
        successFeedback:
          'Rollout Complete! Notice that not a single user request was dropped during the upgrade!',
        fresherDetail: {
          analogy:
            'Replacing an airplane engine while in mid-air! You do not turn off the engine and glide; you start up the backup engine, verify it is generating full thrust (Readiness Probe), transfer power, and only then shut down the old engine.',
          whatIsHappening: [
            '1. Deployment controller creates a new ReplicaSet for v2.0.',
            '2. It spins up 1 new v2 pod.',
            '3. Kubelet performs Readiness Probes (e.g. HTTP GET /healthz).',
            '4. Once healthy, the Service routes traffic to v2, and terminates 1 old v1 pod. It repeats until all pods are v2.'
          ],
          whyItMatters:
            'Zero-downtime deployments allow companies like Netflix, Amazon, and Uber to deploy software dozens of times per day without customer disruption.',
          interviewTip:
            'Interview Question: "What are Readiness and Liveness probes?" -> Answer: "A Liveness probe detects if a container is dead/stuck and needs to be restarted. A Readiness probe detects if a container is temporarily unready to receive network traffic (e.g. warming up caches)."',
          keyTerms: [
            { term: 'RollingUpdate', explanation: 'A deployment strategy that gradually replaces old pods with new pods without downtime.' },
            { term: 'Readiness Probe', explanation: 'A health check that tells Kubernetes when a container is ready to accept user network traffic.' }
          ]
        }
      },
      {
        id: 'm6-step-2',
        stepNumber: 2,
        totalSteps: 2,
        mentorMood: 'celebrate',
        dialogue:
          'Notice how Readiness Probes prevented users from hitting warming-up containers? Zero 502/503 errors!',
        actionPrompt: 'Serve 40 requests with 98%+ SLA to verify the new v2.0 deployment.',
        actionButtonLabel: 'Verify 98% SLA',
        highlightTarget: 'none',
        educationalTakeaway:
          'Readiness probes tell Kubernetes when a container is ready to accept user connections.',
        isComplete: (state) => state.successfulRequests >= 40 && state.sla >= 98,
        successFeedback:
          'Mission 6 Cleared! 🏆 You executed a zero-downtime rolling update like a senior SRE!',
        fresherDetail: {
          analogy:
            'A restaurant host does not seat customers at a table while the busboy is still wiping it down. They wait until the table is clean and set. The Readiness Probe is the busboy giving the thumbs up!',
          whatIsHappening: [
            '1. All running pods now display badge v2.0.',
            '2. Incoming packets hit only healthy, warmed-up v2 endpoints.'
          ],
          whyItMatters:
            'Eliminates maintenance windows and enables continuous delivery pipelines.',
          interviewTip:
            'Interview Question: "What are maxSurge and maxUnavailable?" -> Answer: "maxSurge defines how many extra pods can be created above desired replicas during rollout; maxUnavailable defines how many pods can be unavailable during the update process."',
          keyTerms: [
            { term: 'maxSurge', explanation: 'The maximum number of pods that can be created above the desired replica count during rollout.' },
            { term: 'maxUnavailable', explanation: 'The maximum number of pods that can be unavailable during the update.' }
          ]
        }
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
          '💥 Catastrophic failure! Worker Node-2 suffered a hardware crash and entered status `NotReady`! Half our pods died with it.',
        actionPrompt: 'Watch the Kube-Controller-Manager automatically detect the dead node and reschedule replacement pods onto surviving nodes (Node-1 & Node-3). If capacity runs out, click "+ Node"!',
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
          'Self-Healing in action! The cluster recovered all 4 desired pods without manual intervention!',
        fresherDetail: {
          analogy:
            'A delivery fleet dispatcher. If Delivery Van #2 breaks down on the highway, the dispatcher does not cancel the orders; they assign those packages to Van #1 and Van #3 immediately.',
          whatIsHappening: [
            '1. Worker Node-2 stopped sending heartbeat leases to the API server.',
            '2. Node controller marked Node-2 as NotReady.',
            '3. Pod eviction timeout triggered.',
            '4. ReplicaSet controller saw desired (4) != actual healthy (2).',
            '5. Kube-Scheduler scheduled 2 replacement pods onto Node-1 and Node-3.'
          ],
          whyItMatters:
            'Self-healing automation means engineers do not get woken up by pagers in the middle of the night for routine server hardware crashes.',
          interviewTip:
            'Interview Question: "How does Kubernetes detect node failure?" -> Answer: "Kubelet on each node continuously updates a Lease object in the kube-node-lease namespace. If the control plane misses heartbeats for node-monitor-grace-period (default 40s), the node is marked NotReady."',
          keyTerms: [
            { term: 'Heartbeat (Lease)', explanation: 'A periodic ping sent by kubelet to the API server confirming the node is healthy and alive.' },
            { term: 'Eviction', explanation: 'The process of terminating pods from an unhealthy node and rescheduling them elsewhere.' },
            { term: 'Self-Healing', explanation: 'The automated capability of Kubernetes to recover from container, pod, and node failures.' }
          ]
        }
      },
      {
        id: 'm7-step-2',
        stepNumber: 2,
        totalSteps: 2,
        mentorMood: 'happy',
        dialogue:
          'This is the core promise of Kubernetes: declarative state reconciliation. Even when physical hardware dies, your web service survives.',
        actionPrompt: 'Process 50 requests with >92% SLA to confirm recovery.',
        actionButtonLabel: 'Confirm Recovery',
        highlightTarget: 'none',
        educationalTakeaway:
          'Kubernetes continuously reconciles current state toward declared desired state.',
        isComplete: (state) => state.successfulRequests >= 50 && state.sla >= 92,
        successFeedback:
          'Mission 7 Cleared! 🏆 You witnessed true enterprise-grade self-healing resilience!',
        fresherDetail: {
          analogy:
            'A thermostat. You set desired temperature to 72°F. If someone opens a window (current state changes), the furnace automatically kicks on until it reaches 72°F again.',
          whatIsHappening: [
            '1. The reconciliation loop continuously compares Desired State vs Actual State.',
            '2. Any discrepancy is automatically corrected.'
          ],
          whyItMatters:
            'Guarantees high availability for mission-critical banking, e-commerce, and healthcare systems.',
          interviewTip:
            'Interview Question: "What is a Kubernetes Controller?" -> Answer: "A controller is a non-terminating loop that monitors the current state of cluster objects via the API server, compares it to the desired state in the spec, and makes changes until the two match."',
          keyTerms: [
            { term: 'Reconciliation Loop', explanation: 'The continuous control loop comparing actual state to desired state.' },
            { term: 'Desired State', explanation: 'The target configuration specified in your YAML manifests.' }
          ]
        }
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
          '🛒 Black Friday is here! Traffic surges from 15 req/s to 100+ req/s unpredictably. Manually running `kubectl scale` is too slow—you need autonomous elasticity!',
        actionPrompt: 'Click "Enable HPA" below to turn on the Horizontal Pod Autoscaler with target 60% CPU utilization.',
        actionButtonLabel: 'Enable HPA',
        highlightTarget: 'hpa',
        educationalTakeaway:
          'HPA queries the Metrics Server every 15s and scales replicas automatically: desiredReplicas = ceil[currentReplicas * (currentCpu / targetCpu)].',
        isComplete: (state) => {
          const dep = state.deployments.find((d) => d.name === 'web');
          return !!(dep && dep.hpaEnabled);
        },
        successFeedback:
          'HPA Activated! 📈 Watch the cluster automatically breathe—scaling up when traffic surges, and scaling down when quiet!',
        fresherDetail: {
          analogy:
            'An accordion expanding when more air is pumped in, and contracting when quiet. Or an automatic sliding door that opens wider when a crowd walks through, then closes when people pass.',
          whatIsHappening: [
            '1. You created an HPA object targeting the web deployment.',
            '2. The HPA controller queries the Metrics Server for pod CPU usage.',
            '3. When average CPU exceeds 60%, it calculates the required replica count and scales out.',
            '4. When traffic calms down, it cools down and scales in to save cloud costs.'
          ],
          whyItMatters:
            'Saves millions in cloud hosting costs by preventing over-provisioning during quiet nights while protecting against crashes during viral traffic spikes.',
          interviewTip:
            'Interview Question: "How does HPA calculate how many replicas to create?" -> Answer: "desiredReplicas = ceil[currentReplicas * (currentMetricValue / targetMetricValue)]. For example, 2 replicas at 90% CPU with target 60% -> ceil[2 * (90/60)] = 3 replicas."',
          keyTerms: [
            { term: 'HPA', explanation: 'Horizontal Pod Autoscaler—an automated controller that adjusts pod replica count based on CPU, memory, or custom metrics.' },
            { term: 'Metrics Server', explanation: 'A cluster add-on that collects resource metrics from kubelets and exposes them via the Metrics API.' },
            { term: 'Cooldown (Stabilization)', explanation: 'A delay preventing rapid thrashing (scaling up and down too frequently).' }
          ]
        }
      },
      {
        id: 'm8-step-2',
        stepNumber: 2,
        totalSteps: 2,
        mentorMood: 'celebrate',
        dialogue:
          'Look at the pods automatically multiplying to absorb the traffic spike, saving your SLA without human intervention!',
        actionPrompt: 'Serve 100 high-load requests with >94% SLA to complete the entire Kubernetes Academy!',
        actionButtonLabel: 'Complete Academy',
        highlightTarget: 'none',
        educationalTakeaway:
          'Autonomous scaling balances reliability with cloud cost optimization.',
        isComplete: (state) => state.successfulRequests >= 100 && state.sla >= 94,
        successFeedback:
          '🏆 CONGRATULATIONS! You have graduated as a Kubernetes Fleet Master! You understand Pods, Deployments, Services, Debugging, Cgroups, Rolling Updates, Self-Healing, and Autoscaling!',
        fresherDetail: {
          analogy:
            'You are now the captain of an autonomous starship! The engines, life support, and shields balance themselves in real time.',
          whatIsHappening: [
            '1. HPA actively dynamically scales pods between min 2 and max 7.',
            '2. Cluster uptime stays rock solid above 94% SLA.'
          ],
          whyItMatters:
            'Mastery of these 8 principles is what distinguishes a junior developer from a capable DevOps engineer.',
          interviewTip:
            'Interview Question: "Can HPA scale worker nodes too?" -> Answer: "No, HPA only scales Pods. To scale physical or virtual worker nodes, you pair HPA with the Cluster Autoscaler (CA) or Karpenter, which provision new cloud VMs when pods are Pending due to insufficient node capacity."',
          keyTerms: [
            { term: 'Cluster Autoscaler', explanation: 'A separate controller that adds or removes physical/VM worker nodes when pods cannot be scheduled.' },
            { term: 'Karpenter', explanation: 'A modern, high-speed open-source node autoscaler designed for Kubernetes.' }
          ]
        }
      }
    ]
  }
};
