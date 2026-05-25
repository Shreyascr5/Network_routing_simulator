import React, { useEffect, useState } from "react";

import dagre from "dagre";

import {
  ReactFlow,
  Controls,
  MiniMap,
  Background
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";

export default function NetworkGraph() {

const [nodes,setNodes]=useState([]);
const [edges,setEdges]=useState([]);
const [rawEdges,setRawEdges]=useState([]);

const [packetNode,setPacketNode]=useState(null);

const [source,setSource]=useState("");
const [destination,setDestination]=useState("");

const [route,setRoute]=useState([]);
const [distance,setDistance]=useState("-");

const [failedEdge,setFailedEdge]=useState("");

useEffect(()=>{
loadGraph();
},[]);

function layoutGraph(nodes,edges){

const g=
new dagre.graphlib.Graph();

g.setGraph({

rankdir:"LR",

nodesep:120,

ranksep:180

});

g.setDefaultEdgeLabel(
()=>({})
);

nodes.forEach(n=>{

g.setNode(
n.id,
{
width:180,
height:90
}
);

});

edges.forEach(e=>{

g.setEdge(
e.source,
e.target
);

});

dagre.layout(g);

return nodes.map(n=>{

const p=
g.node(n.id);

return{

...n,

position:{
x:p.x,
y:p.y
}

};

});

}

function loadGraph(){

fetch("/network.json")

.then(r=>r.json())

.then(data=>{

setRawEdges(
data.edges
);

let ns=
data.nodes.map(
n=>({

id:n.id,

data:{
label:n.label
},

style:{

background:"#172554",

color:"white",

border:
"2px solid #38bdf8",

borderRadius:"18px",

width:180,

fontSize:"18px"

},

position:{
x:0,
y:0
}

})

);

let es=
data.edges.map(
(e,index)=>({

id:"e"+index,

source:e.source,

target:e.target,

label:`${e.label}`,

labelStyle:{
fill:"white",
fontSize:16,
fontWeight:700
},

labelBgStyle:{
fill:"#0f172a"
},

type:"smoothstep"

})

);

ns=
layoutGraph(
ns,
es
);

setNodes(ns);

setEdges(es);

});

}

async function animatePacket(path){

for(let n of path){

setPacketNode(n);

await new Promise(
r=>
setTimeout(
r,
700
)
);

}

}

function routePacket(){

if(
!source ||
!destination
)
return;

let adj={};

rawEdges.forEach(e=>{

if(
e.disabled
)
return;

if(
!adj[e.source]
)
adj[e.source]=[];

if(
!adj[e.target]
)
adj[e.target]=[];

adj[e.source].push({

node:e.target,

weight:Number(
e.label
)

});

adj[e.target].push({

node:e.source,

weight:Number(
e.label
)

});

});

let dist={};

let parent={};

let visited={};

nodes.forEach(n=>{

dist[n.id]=Infinity;

parent[n.id]=null;

visited[n.id]=false;

});

dist[source]=0;

while(true){

let u=null;

let best=Infinity;

Object.keys(dist)
.forEach(k=>{

if(
!visited[k] &&
dist[k]<best
){

best=dist[k];

u=k;

}

});

if(u===null)
break;

visited[u]=true;

if(!adj[u])
continue;

adj[u].forEach(v=>{

let nd=
dist[u]+
v.weight;

if(
nd<
dist[v.node]
){

dist[v.node]=nd;

parent[v.node]=u;

}

});

}

if(
dist[destination]
===Infinity
){

setRoute([
"No Route Found"
]);

setDistance(
"-"
);

return;

}

setDistance(
dist[destination]
);

let path=[];

let cur=
destination;

while(
cur!==null
){

path.unshift(
cur
);

cur=
parent[cur];

}

setRoute(path);

animatePacket(path);

const updated=
edges.map(e=>{

let active=
false;

for(
let i=0;
i<path.length-1;
i++
){

let a=
path[i];

let b=
path[i+1];

if(

(e.source===a &&
e.target===b)

||

(e.source===b &&
e.target===a)

)

active=true;

}

return{

...e,

animated:
active,

style:

active

?

{

stroke:
"#22c55e",

strokeWidth:
5

}

:

e.style || {}

};

});

setEdges(
updated
);

}

function disableLink(){

if(
!failedEdge
)
return;

let [a,b]=
failedEdge.split(
"-"
);

setRawEdges(

rawEdges.map(
e=>{

if(

(e.source===a &&
e.target===b)

||

(e.source===b &&
e.target===a)

)

return{

...e,

disabled:true

};

return e;

}

)

);

setEdges(

edges.map(e=>{

if(

(e.source===a &&
e.target===b)

||

(e.source===b &&
e.target===a)

)

return{

...e,

style:{

stroke:"#6b7280",

strokeDasharray:
"8 8",

strokeWidth:4

}

};

return e;

})

);

setTimeout(
()=>routePacket(),
100
);

}

const displayNodes=
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

top:25,

left:25,

zIndex:100,

width:340,

background:
"rgba(15,23,42,.92)",

padding:20,

borderRadius:18,

color:"white"

}}
>

<h2>
Network Control
</h2>

<p>Source</p>

<select
value={source}
onChange={e=>
setSource(
e.target.value
)}
>
<option/>
{
nodes.map(n=>

<option
key={n.id}
>

{n.id}

</option>

)
}
</select>

<p>
Destination
</p>

<select
value={destination}
onChange={e=>
setDestination(
e.target.value
)}
>
<option/>
{
nodes.map(n=>

<option
key={n.id}
>

{n.id}

</option>

)
}
</select>

<br/><br/>

<button
onClick={
routePacket
}
>

Route Packet

</button>

<hr/>

<p>
Fail Link
</p>

<select
value={failedEdge}
onChange={e=>
setFailedEdge(
e.target.value
)}
>

<option/>

{

rawEdges
.filter(
e=>
e.disabled!==true
)

.map(
e=>

<option>

{e.source}
-
{e.target}

</option>

)

}

</select>

<br/><br/>

<button
onClick={
disableLink
}
>

Disable Link

</button>

<hr/>

Route:

{
route.join(
" → "
)
}

<br/><br/>

Distance:

{
distance
}

</div>

<ReactFlow

nodes={
displayNodes
}

edges={
edges
}

fitView

fitViewOptions={{
padding:.35
}}

>

<MiniMap/>

<Controls/>

<Background/>

</ReactFlow>

</div>

);

}