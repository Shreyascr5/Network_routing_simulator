import React from "react";
import { ReactFlow } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

const nodes = [
  {
    id: "0",
    position: { x: 0, y: 100 },
    data: { label: "Router 0" }
  },

  {
    id: "1",
    position: { x: 150, y: 0 },
    data: { label: "Router 1" }
  },

  {
    id: "2",
    position: { x: 150, y: 200 },
    data: { label: "Router 2" }
  },

  {
    id: "4",
    position: { x: 300, y: 100 },
    data: { label: "Router 4" }
  }
];

const edges = [
  {
    id: "e01",
    source: "0",
    target: "1",
    label: "2"
  },

  {
    id: "e12",
    source: "1",
    target: "2",
    label: "1"
  },

  {
    id: "e24",
    source: "2",
    target: "4",
    label: "1"
  }
];

export default function NetworkGraph() {
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
      />
    </div>
  );
}