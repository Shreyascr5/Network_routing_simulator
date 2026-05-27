import React, { useEffect, useState } from "react";
import dagre from "dagre";

import {
ReactFlow,
Controls,
MiniMap,
Background
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";

export default function NetworkGraph(){

const [nodes,setNodes]=useState([]);
const [edges,setEdges]=useState([]);
const [rawEdges,setRawEdges]=useState([]);

const [packetNode,setPacketNode]=useState(null);

const [source,setSource]=useState("");
const [destination,setDestination]=useState("");

const [route,setRoute]=useState([]);
const [distance,setDistance]=useState("-");

const [failedEdge,setFailedEdge]=useState("");

const [selectedLink,setSelectedLink]=useState("");
const [newWeight,setNewWeight]=useState("");

const [hopCount,setHopCount]=useState(0);

const [delivered,setDelivered]=useState(0);

const [failed,setFailed]=useState(0);

const [routingTable,setRoutingTable]=useState([]);

useEffect(()=>{
loadGraph();
},[]);

function edgeColor(w){

w=Number(w);

if(w>=8)
return "#ef4444";

if(w>=4)
return "#eab308";

return "#22c55e";

}

function layoutGraph(nodes,edges){

const g=
new dagre.graphlib.Graph();

g.setGraph({

rankdir:"LR",

nodesep:150,

ranksep:200

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

const ns=

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

width:180

},

position:{
x:0,
y:0
}

})

);

const es=

data.edges.map(
(e,index)=>({

id:"e"+index,

source:e.source,

target:e.target,

label:e.label,

labelStyle:{

fill:"white",

fontWeight:700

},

labelBgStyle:{
fill:"#0f172a"
},

style:{

stroke:
edgeColor(
e.label
),

strokeWidth:3

},

type:"smoothstep"

})

);

setNodes(
layoutGraph(
ns,
es
)
);

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

setFailed(
x=>x+1
);

setRoute([
"No Route Found"
]);

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

setDelivered(
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

setEdges(

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

stroke:"#22c55e",

strokeWidth:5

}

:

e.style

};

})

);

}

function disableLink(){

if(!failedEdge)
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

})

);

setTimeout(
routePacket,
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

disabled:false

};

return e;

})

);

}

function resetNetwork(){

setRawEdges(

rawEdges.map(
e=>({

...e,

disabled:false

})

)

);

setRoute([]);

setDistance("-");

setHopCount(0);

}

function updateLatency(){

if(
!selectedLink ||
!newWeight
)
return;

let [a,b]=
selectedLink.split(
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

label:
Number(
newWeight
)

};

return e;

}

);

setRawEdges(
updated
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

label:newWeight,

style:{

stroke:
edgeColor(
newWeight
),

strokeWidth:4

}

};

return e;

})

);

setTimeout(
routePacket,
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

left:20,

top:20,

width:360,

zIndex:100,

background:
"rgba(15,23,42,.95)",

padding:20,

borderRadius:20,

color:"white"

}}
>

<h1>
Network Dashboard
</h1>

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

<option key={n.id}>
{n.id}
</option>

)
}
</select>

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

<option key={n.id}>
{n.id}
</option>

)
}
</select>

<button onClick={routePacket}>
Route Packet
</button>

<hr/>

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

<h3>
Latency Control
</h3>

<select
value={selectedLink}
onChange={e=>
setSelectedLink(
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

<input
value={newWeight}
onChange={e=>
setNewWeight(
e.target.value
)}
placeholder="Latency"
/>

<button onClick={updateLatency}>
Update
</button>

<hr/>

Route:
{route.join(" → ")}

<br/>

Distance:
{distance}

<br/>

Hop Count:
{hopCount}

<hr/>

Delivered:
{delivered}

<br/>

Failed:
{failed}

<hr/>

Routing Table

{
routingTable.map(
r=>

<div key={r.hop}>

Hop {r.hop}
→ Router {r.router}

</div>

)
}

</div>

<div
style={{
marginLeft:"420px",
height:"100vh"
}}
>

<ReactFlow

nodes={displayNodes}

edges={edges}

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

</div>

);

}