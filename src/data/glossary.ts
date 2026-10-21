export interface GlossaryItem {
  term: string;
  category: 'Workloads' | 'Networking' | 'Cluster Architecture' | 'Configuration' | 'Troubleshooting';
  summary: string;
  analogy: string;
  keyCommand: string;
}

export const GLOSSARY: GlossaryItem[] = [
  {
    term: 'Pod',
    category: 'Workloads',
    summary:
      'The smallest deployable unit in Kubernetes. Represents a single instance of a running process in your cluster, encapsulating one or more tightly coupled containers, shared network namespaces, and volumes.',
    analogy: 'A pod of whales or a pea pod: a tight protective shell containing one or more cooperating entities.',
    keyCommand: 'kubectl get pods -o wide'
  },
  {
    term: 'Deployment',
    category: 'Workloads',
    summary:
      'A declarative controller that manages ReplicaSets to provide declarative updates for Pods. It enables automated rollouts, rollbacks, and self-healing scaling.',
    analogy: 'The factory manager: ensures the desired number of identical widgets are always on the shelf, replacing damaged ones automatically.',
    keyCommand: 'kubectl scale deployment web --replicas=3'
  },
  {
    term: 'Service (ClusterIP)',
    category: 'Networking',
    summary:
      'An abstract way to expose an application running on a set of Pods as a network service. Provides a stable virtual IP address and round-robin load balances requests across healthy pods matching label selectors.',
    analogy: 'A company front-desk phone number that forwards callers to available receptionist desk extensions.',
    keyCommand: 'kubectl get svc'
  },
  {
    term: 'Ingress',
    category: 'Networking',
    summary:
      'An API object that manages external access to the services in a cluster, typically HTTP/HTTPS. Ingress can provide load balancing, SSL termination, and name-based virtual hosting.',
    analogy: 'The airport security and gate boarding gatekeeper routing passengers to their designated flight concourses.',
    keyCommand: 'kubectl get ingress'
  },
  {
    term: 'CrashLoopBackOff',
    category: 'Troubleshooting',
    summary:
      'A pod status indicating that a container repeatedly starts, fails/crashes, and restarts with an exponential backoff delay (10s, 20s, 40s...) to avoid overloading the node.',
    analogy: 'An engine stalling immediately upon ignition, forcing the starter motor to pause before retrying.',
    keyCommand: 'kubectl logs <pod-name> --previous'
  },
  {
    term: 'OOMKilled (Exit Code 137)',
    category: 'Troubleshooting',
    summary:
      'Occurs when a container exceeds its configured memory limit (`resources.limits.memory`). The host Linux kernel Out-Of-Memory Killer abruptly terminates the process using SIGKILL (signal 9 + 128 = 137).',
    analogy: 'A glass overflowing with water that instantly shatters when capacity is exceeded.',
    keyCommand: 'kubectl describe pod <pod-name> | grep -i oom'
  },
  {
    term: 'Horizontal Pod Autoscaler (HPA)',
    category: 'Workloads',
    summary:
      'Automatically updates a workload resource (like a Deployment or StatefulSet), with the aim of automatically scaling the workload up or down to match demand based on observed CPU/Memory utilization.',
    analogy: 'An accordion expanding when more air is pumped in, and contracting when quiet.',
    keyCommand: 'kubectl autoscale deployment web --min=2 --max=10 --cpu-percent=70'
  },
  {
    term: 'ConfigMap & Secret',
    category: 'Configuration',
    summary:
      'API objects used to store non-confidential (ConfigMap) or sensitive (Secret, e.g. passwords/tokens) key-value configuration data, keeping container images portable across staging and production.',
    analogy: 'Plugging in different memory cards with game settings without rewriting the game cartridge.',
    keyCommand: 'kubectl create configmap app-cfg --from-literal=ENV=prod'
  },
  {
    term: 'Liveness & Readiness Probes',
    category: 'Troubleshooting',
    summary:
      'Health checks executed periodically by kubelet. Liveness probe knows when to restart a container; Readiness probe knows when a container is ready to start accepting network traffic.',
    analogy: 'Liveness = pulse check (alive or dead). Readiness = is the chef finished prepping ingredients to take orders?',
    keyCommand: 'kubectl describe pod <pod-name> | grep -A 5 -i probe'
  },
  {
    term: 'Kubelet & Kube-Scheduler',
    category: 'Cluster Architecture',
    summary:
      'The Kube-Scheduler watches for unscheduled Pods and assigns them to optimal Worker Nodes based on resource availability. The Kubelet is the node agent that communicates with the container runtime to launch and monitor pods.',
    analogy: 'The dispatcher (Scheduler) assigning delivery packages to trucks, and the driver (Kubelet) carrying out the delivery.',
    keyCommand: 'kubectl get nodes -o wide'
  }
];
