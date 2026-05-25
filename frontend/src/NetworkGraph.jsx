import React, { useEffect, useState } from "react";

import { ReactFlow } from "@xyflow/react";

import "@xyflow/react/dist/style.css";

export default function NetworkGraph() {

  const [nodes, setNodes] = useState([]);

  const [edges, setEdges] = useState([]);

  const [rawEdges, setRawEdges] = useState([]);

  const [selected, setSelected] = useState([]);

  const [packetNode, setPacketNode] = useState(null);

  useEffect(() => {

    fetch("/network.json")

      .then(r => r.json())

      .then(data => {

        setRawEdges(data.edges);

        const visualNodes =
          data.nodes.map((n,index)=>({

            id:n.id,

            position:{
              x:index*180,
              y:150
            },

            data:{
              label:n.label
            }

          }));

        const visualEdges =
          data.edges.map((e,index)=>({

            id:"e"+index,

            source:e.source,

            target:e.target,

            label:e.label
          }));

        setNodes(visualNodes);

        setEdges(visualEdges);

      });

  },[]);

  async function animatePacket(path){

    for(let node of path){

      setPacketNode(node);

      await new Promise(
        r=>setTimeout(r,1000)
      );

    }

  }

  function highlightPath(path){

    const newEdges=
      edges.map(e=>{

        let active=false;

        for(
          let i=0;
          i<path.length-1;
          i++
        ){

          let a=path[i];

          let b=path[i+1];

          if(

            (e.source===a &&
             e.target===b)

            ||

            (e.source===b &&
             e.target===a)

          ){

            active=true;

          }

        }

        return{

          ...e,

          animated:active,

          style:active?

          {
            stroke:"red",
            strokeWidth:4
          }

          :{}

        };

      });

    setEdges(newEdges);

    animatePacket(path);

  }

  function runDijkstra(source,destination){

    let adj={};

    rawEdges.forEach(e=>{

      if(!adj[e.source])
        adj[e.source]=[];

      if(!adj[e.target])
        adj[e.target]=[];

      adj[e.source].push({
        node:e.target,
        weight:Number(e.label)
      });

      adj[e.target].push({
        node:e.source,
        weight:Number(e.label)
      });

    });

    let dist={};

    let parent={};

    nodes.forEach(n=>{

      dist[n.id]=Infinity;

      parent[n.id]=null;

    });

    dist[source]=0;

    let pq=[[0,source]];

    while(pq.length){

      pq.sort(
        (a,b)=>a[0]-b[0]
      );

      let [d,u]=pq.shift();

      if(!adj[u]) continue;

      adj[u].forEach(v=>{

        let nd=d+v.weight;

        if(
          nd<dist[v.node]
        ){

          dist[v.node]=nd;

          parent[v.node]=u;

          pq.push([
            nd,
            v.node
          ]);

        }

      });

    }

    let path=[];

    let cur=destination;

    while(cur!==null){

      path.push(cur);

      cur=parent[cur];

    }

    path.reverse();

    highlightPath(path);

  }

  function handleNodeClick(
    event,
    node
  ){

    let next=[
      ...selected
    ];

    if(next.length===2)
      next=[];

    next.push(node.id);

    setSelected(next);

    if(next.length===2){

      runDijkstra(
        next[0],
        next[1]
      );

    }

  }

  const animatedNodes=
    nodes.map(n=>({

      ...n,

      data:{

        label:
          packetNode===n.id

          ?

          `📦 ${n.data.label}`

          :

          n.data.label

      }

    }));

  return(

    <div
      style={{
        width:"100vw",
        height:"100vh"
      }}
    >

      <div
        style={{
          position:"absolute",

          zIndex:10,

          background:"white",

          padding:"10px"
        }}
      >

        Route:

        {selected.join(
          " → "
        )}

      </div>

      <ReactFlow

        nodes={
          animatedNodes
        }

        edges={edges}

        fitView

        onNodeClick={
          handleNodeClick
        }

      />

    </div>

  );

}