// Route geometry follows user-drawn DM roads. Map artwork is not interpreted.
function roadProjection(p,a,b){const dx=b.x-a.x,dy=b.y-a.y,len=dx*dx+dy*dy,t=len?Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/len)):0;const point={x:a.x+t*dx,y:a.y+t*dy};return {t,point,distance:Math.hypot(p.x-point.x,p.y-point.y)}}
function roadSegments(kind="land"){const segments=[];for(const [roadIndex,road] of (state.roads||[]).filter(r=>(r.kind||"land")===kind).entries())for(let i=1;i<road.points.length;i++){const a=road.points[i-1],b=road.points[i];if(d(a,b)<1e-7)continue;segments.push({a,b,roadIndex,width:road.width,first:i===1,last:i===road.points.length-1,cuts:[0,1],minX:Math.min(a.x,b.x),maxX:Math.max(a.x,b.x),minY:Math.min(a.y,b.y),maxY:Math.max(a.y,b.y)})}return segments}
function nearestRoadAttachment(p,segments,allowAccess=false){let best=null;for(const segment of segments){const projection=roadProjection(p,segment.a,segment.b);if((allowAccess||projection.distance<=Math.max(12,segment.width))&&(!best||projection.distance<best.distance))best={...projection,segment}}return best}
function roadCrossing(a,b){
 const ax=a.b.x-a.a.x,ay=a.b.y-a.a.y,bx=b.b.x-b.a.x,by=b.b.y-b.a.y,dx=b.a.x-a.a.x,dy=b.a.y-a.a.y,den=ax*by-ay*bx;
 if(Math.abs(den)<1e-9)return null;const t=(dx*by-dy*bx)/den,u=(dx*ay-dy*ax)/den;return t>=-1e-9&&t<=1+1e-9&&u>=-1e-9&&u<=1+1e-9?[Math.max(0,Math.min(1,t)),Math.max(0,Math.min(1,u))]:null;
}
function findRoadPath(start,end,kind="land",allowAccess=false){
 const segments=roadSegments(kind);if(!segments.length)return null;
 const source=nearestRoadAttachment(start,segments,allowAccess),target=nearestRoadAttachment(end,segments,allowAccess);if(!source||!target)return null;
 source.segment.cuts.push(source.t);target.segment.cuts.push(target.t);
 const connectors=[],ordered=[...segments].sort((a,b)=>a.minX-b.minX),margin=segments.reduce((max,s)=>Math.max(max,s.width/2+2),2);
 // Sweep bounding boxes: split real crossings, and attach near road ends to a road.
 for(let i=0;i<ordered.length;i++){const a=ordered[i];for(let j=i+1;j<ordered.length&&ordered[j].minX<=a.maxX+margin;j++){const b=ordered[j];if(b.minY>a.maxY+margin||b.maxY<a.minY-margin)continue;
  const cross=roadCrossing(a,b);if(cross){a.cuts.push(cross[0]);b.cuts.push(cross[1])}
  // Collinear overlaps must also connect. Nearby parallel interiors never snap.
  for(const [s,t] of [[a,b],[b,a]])for(const [fraction,p,isEnd] of [[0,s.a,s.first],[1,s.b,s.last]]){const hit=roadProjection(p,t.a,t.b),exact=hit.distance<1e-7,near=s.roadIndex!==t.roadIndex&&isEnd&&hit.distance<=Math.max(s.width,t.width)/2+2;
   if(exact||near){s.cuts.push(fraction);t.cuts.push(hit.t);connectors.push([p,hit.point])}
  }
 }}
 const nodes=[],ids=new Map(),edges=[];
 function node(p){const key=Math.round(p.x*1e6)+','+Math.round(p.y*1e6);if(!ids.has(key)){ids.set(key,nodes.length);nodes.push({x:p.x,y:p.y});edges.push([])}return ids.get(key)}
 function edge(a,b){const x=node(a),y=node(b);if(x===y)return;const weight=d(a,b);edges[x].push([y,weight]);edges[y].push([x,weight])}
 for(const s of segments){const cuts=[...new Set(s.cuts)].sort((a,b)=>a-b),point=t=>({x:s.a.x+(s.b.x-s.a.x)*t,y:s.a.y+(s.b.y-s.a.y)*t});for(let i=1;i<cuts.length;i++)edge(point(cuts[i-1]),point(cuts[i]))}
 for(const [a,b] of connectors)edge(a,b);
 const first=node(source.point),last=node(target.point),distances=nodes.map(()=>Infinity),previous=nodes.map(()=>-1),heap=[];
 const push=(item)=>{heap.push(item);let i=heap.length-1;while(i){const parent=(i-1)>>1;if(heap[parent][0]<=item[0])break;heap[i]=heap[parent];i=parent}heap[i]=item};
 const pop=()=>{const top=heap[0],tail=heap.pop();if(heap.length){let i=0;while(i*2+1<heap.length){let child=i*2+1;if(child+1<heap.length&&heap[child+1][0]<heap[child][0])child++;if(heap[child][0]>=tail[0])break;heap[i]=heap[child];i=child}heap[i]=tail}return top};
 distances[first]=0;push([0,first]);while(heap.length){const [cost,id]=pop();if(cost!==distances[id])continue;if(id===last)break;for(const [next,w] of edges[id])if(cost+w<distances[next]){distances[next]=cost+w;previous[next]=id;push([cost+w,next])}}
 if(!Number.isFinite(distances[last]))return null;const route=[];for(let at=last;at!==-1;at=previous[at])route.push(nodes[at]);route.reverse();
 // Preserve actual location coordinates: small access legs join them to the road.
 const points=[{x:start.x,y:start.y},...route,{x:end.x,y:end.y}].filter((p,i,all)=>!i||d(p,all[i-1])>1e-7);
 return points;
}
function appendFollowingRoad(r,p){
 const path=r.log?.followRoads&&r.log?.transport!=="Vliegend"&&r.points.length?findRoadPath(r.points.at(-1),p,r.log?.transport==="Boot"?"water":"land"):null;
 if(path){r.points.push(...path.slice(1));r.log.roadRoutingStatus='Weg gevolgd.'}else{r.points.push(p);if(r.log?.followRoads)r.log.roadRoutingStatus=r.points.length>1?'Geen verbonden weg bij deze punten; rechtstreeks verbonden.':'Kies het volgende punt bij een weg.'}
}

// Linked ports can be on shore, outside the narrow drawing snap corridor.
function waterPathBetweenLocations(from,to){return findRoadPath(from,to,'water',true)}
function rebuildBoatRoute(){
 const r=activeRoute();if(!r||r.log?.transport!=='Boot')return;
 const from=markerById(r.log.fromLocationId),to=markerById(r.log.toLocationId);
 if(!from||!to){alert('Koppel eerst een begin- en eindlocatie.');return}
 const points=waterPathBetweenLocations(from,to);
 if(!points){alert('Geen verbonden vaarroute gevonden tussen deze locaties. Controleer of de getekende vaarroutes op elkaar aansluiten.');return}
 if(r.points.length>2&&!confirm('De bestaande routepunten vervangen door de vaarroute?'))return;
 r.points=points;r.log.followRoads=true;r.log.roadRoutingStatus='Vaarroute gevolgd via de dichtstbijzijnde aansluitingen. Controleer de verbindingsstukken vanaf de locaties.';save();render();
}
