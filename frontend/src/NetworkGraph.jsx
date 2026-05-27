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

const [hopCount,setHopCount]=useState(0);

const [
deliveredPackets,
setDeliveredPackets
]=useState(0);

const [
failedPackets,
setFailedPackets
]=useState(0);

const [
routingTable,
setRoutingTable
]=useState([]);

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

label:e.label,

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

function updateVisualEdges(data){

const updated=

edges.map(e=>{

const match=

data.find(
x=>

(

x.source===e.source &&
x.target===e.target

)

||

(

x.source===e.target &&
x.target===e.source

)

);

if(
match?.disabled
)

return{

...e,

animated:false,

style:{

stroke:"#6b7280",

strokeDasharray:
"8 8",

strokeWidth:4

}

};

return{

...e,

style:{}

};

});

setEdges(
updated
);

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

nodes.forEach(n=>{

dist[n.id]=Infinity;

parent[n.id]=null;

});

dist[source]=0;

let pq=[
[0,source]
];

while(
pq.length
){

pq.sort(
(a,b)=>
a[0]-b[0]
);

const [
curDist,
u
]=pq.shift();

if(
curDist>
dist[u]
)
continue;

if(
!adj[u]
)
continue;

adj[u].forEach(v=>{

const nd=

curDist+

v.weight;

if(
nd<
dist[v.node]
){

dist[
v.node
]=nd;

parent[
v.node
]=u;

pq.push([
nd,
v.node
]);

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

setDistance("-");

setFailedPackets(
x=>x+1
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

setHopCount(
path.length-1
);

setDeliveredPackets(
x=>x+1
);

setRoutingTable(

path.map(
(node,index)=>({

hop:index,

router:node

})

)

);

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

const a=
path[i];

const b=
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

if(!failedEdge)
return;

let [a,b]=
failedEdge.split(
"-"
);

const updated=

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

);

setRawEdges(
updated
);

updateVisualEdges(
updated
);

setTimeout(
()=>routePacket(),
100
);

}

function restoreLink(){

if(!failedEdge)
return;

let [a,b]=
failedEdge.split(
"-"
);

const updated=

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

disabled:false

};

return e;

}

);

setRawEdges(
updated
);

updateVisualEdges(
updated
);

setTimeout(
()=>routePacket(),
100
);

}

function resetNetwork(){

const updated=

rawEdges.map(
e=>({

...e,

disabled:false

})

);

setRawEdges(
updated
);

updateVisualEdges(
updated);

setRoute([]);

setDistance("-");

setHopCount(0);

setPacketNode(
null
);

setRoutingTable([]);

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

width:360,

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
Link Control
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
rawEdges.map(
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

<button onClick={disableLink}>
Disable
</button>

<button onClick={restoreLink}>
Restore
</button>

<button onClick={resetNetwork}>
Reset
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
{distance}

<br/>

Hop Count:
{hopCount}

<hr/>

Delivered:
{deliveredPackets}

<br/>

Failed:
{failedPackets}

<br/>

Active Links:

{
rawEdges.filter(
e=>
!e.disabled
).length
}

<hr/>

Routing Table

{

routingTable.map(
r=>

<div>

Hop {
r.hop
}

→ Router {
r.router
}

</div>

)

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