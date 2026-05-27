# Network Routing Simulator using Graph Data Structures and Dijkstra Algorithm

An interactive **Network Routing Simulator** built using **C++**, **React**, and **Graph Data Structures** to simulate packet routing, network failures, congestion, and adaptive routing using **Dijkstra’s Shortest Path Algorithm**.

## Features

- Shortest path routing using **Dijkstra Algorithm**
- Interactive network topology visualization
- Packet routing simulation with animated traversal
- Dynamic link failure simulation and recovery
- Congestion simulation using latency updates
- Adaptive rerouting based on network conditions
- Edge weight visualization
- Routing table generation
- Packet delivery statistics
- Hop count and distance analytics
- Interactive dashboard for monitoring network state

---

## Tech Stack

### Backend

- C++
- STL
- Graph Data Structures
- Dijkstra Algorithm

### Frontend

- React
- ReactFlow
- Dagre

### Concepts Used

- Computer Networks
- Packet Routing
- Congestion Handling
- Failure Recovery
- Shortest Path Algorithms
- Network Visualization

---

## Project Architecture

```text
                    +----------------------+
                    |     React Dashboard  |
                    |----------------------|
                    | Routing Analytics    |
                    | Packet Simulation    |
                    | Congestion Control   |
                    +----------+-----------+
                               |
                               |
                               v
                    +----------------------+
                    |  Network Topology    |
                    | (ReactFlow + Dagre)  |
                    +----------+-----------+
                               |
                               |
                               v
                    +----------------------+
                    | C++ Routing Engine   |
                    |----------------------|
                    | Graph DS             |
                    | Dijkstra Algorithm   |
                    | Failure Recovery     |
                    +----------------------+
```
