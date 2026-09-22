// Routes, afstanden, selectie en gekoppelde locaties.
// Klassiek script: gedeelde globale scope; laadvolgorde staat in index.html.


function activeRoute(){return state.routes.find(r=>r.id===state.active)}

function routeDistance(r){if(!state.scale||r.points.length<2)return 0;let px=0;for(let i=1;i<r.points.length;i++)px+=d(r.points[i-1],r.points[i]);return px*state.scale.perPixel}

function routeDuration(r){let pace=Number(r.log?.pace);return state.scale&&r.points.length>1&&pace>0?routeDistance(r)/pace:null}

function routeById(id){return state.routes.find(r=>r.id===id)}

function filteredSortedRoutes(){
 let q=($("#routeSearch")?.value||"").trim().toLowerCase(),f=$("#routeFilter")?.value||"all",sort=$("#routeSort")?.value||"name";
 let rows=state.routes.filter(r=>(f==="all"||r.status===f)&&(!q||[r.name,r.log?.from,r.log?.to,r.log?.note].some(v=>(v||"").toLowerCase().includes(q))));
 rows.sort((a,b)=>{
  if(sort==="status")return String(a.status||"").localeCompare(String(b.status||""))||String(a.name||"").localeCompare(String(b.name||""));
  if(sort.startsWith("duration")){let x=routeDuration(a),y=routeDuration(b);return x===null?(y===null?0:1):y===null?-1:(x-y)*(sort==="durationDesc"?-1:1)}
  if(sort==="distance")return routeDistance(b)-routeDistance(a);
  if(sort==="recent")return state.routes.indexOf(b)-state.routes.indexOf(a);
  return String(a.name||"").localeCompare(String(b.name||""),undefined,{numeric:true})
 });
 return rows
}

function startRouteFromLocation(id){openNewRouteDialog(id)}

function syncRouteLocationLinks(r){
 if(!r)return;
 let fm=findLocationByName($("#logFrom").value),tm=findLocationByName($("#logTo").value);
 r.log=r.log||{};r.log.from=$("#logFrom").value;r.log.to=$("#logTo").value;
 r.log.fromLocationId=fm?fm.id:null;r.log.toLocationId=tm?tm.id:null;
 if(fm)r.log.from=fm.name;if(tm)r.log.to=tm.name;
}

function selectMapRoute(id){
 if(!state.routes.some(r=>r.id===id))return;
 state.active=id;selectedPoint=null;selectedLocationId=null;
 $("#routeSearch").value="";$("#routeFilter").value="all";
 showDetailPane("routePane");render();save();
}

function addRoute(){openNewRouteDialog()}

function autosaveTravelData(){
 let r=activeRoute();if(!r)return;
 syncRouteLocationLinks(r);r.log=r.log||{};r.log.note=$("#logNote").value;r.log.pace=parseFloat($("#pace").value)||0;r.log.pacePreset=$("#pacePreset").value;save();render()
}

// Registreer bediening; aangeroepen vanuit init.js.
function bindRouteSearchUI(){
$("#routeOverviewToggle").onclick=()=>setRouteOverviewOpen(!routeOverviewOpen);
$("#closeRouteOverview").onclick=()=>setRouteOverviewOpen(false);
$("#routeOverviewPanel").addEventListener("keydown",e=>{if(e.key==="Escape"){e.preventDefault();e.stopPropagation();setRouteOverviewOpen(false)}});

$("#routeSelect").onchange=e=>{let id=e.target.value;if(!id){clearRouteSelection();return;}if(state.routes.some(r=>r.id===id)){state.active=id;selectedLocationId=null;selectedPoint=null;drawing=false;insertMode=false;mode="pan";render();save()}};
$("#routeSearch").oninput=()=>render();
$("#clearRouteSearch").onclick=()=>{$("#routeSearch").value="";render();$("#routeSearch").focus()};
$("#routeList").onclick=e=>{
 const button=e.target.closest("button[data-route-action]");if(!button)return;
 if(button.dataset.routeAction==="show")showOverviewRoute(button.dataset.routeId);
 else chooseOverviewRoute(button.dataset.routeId);
};
$("#routeSort").onchange=()=>render();
$("#routeFilter").onchange=()=>render();
}

// Registreer bediening; aangeroepen vanuit init.js.
function bindRouteEditorUI(){
$("#clearRouteSelectionBtn").onclick=clearRouteSelection;
$("#panelNewRouteBtn").onclick=addRoute;
$("#finishBtn").onclick=toggleRouteDrawing;
$("#insertBtn").onclick=()=>{if(mode==="insert"){cancelMapAction();return}let r=activeRoute();if(!r)return alert("Selecteer eerst een route.");if(r.points.length<2)return alert("Een route heeft minimaal twee punten nodig.");drawing=false;insertMode=true;mode="insert";render()};
$("#undoBtn").onclick=()=>{let r=activeRoute();if(!r||!r.points.length)return;if(isLinkedEndpoint(r,r.points.length-1))return alert("Dit punt is gekoppeld aan een locatie. Wijzig de eindlocatie via Begin en einde.");r.points.pop();selectedPoint=null;save();render()};
$("#deletePointBtn").onclick=()=>{let r=activeRoute();if(!r)return;if(selectedPoint===null)return alert("Klik eerst op een routepunt.");if(isLinkedEndpoint(r,selectedPoint))return alert("Dit punt is gekoppeld aan een locatie. Wijzig de koppeling via Begin en einde.");r.points.splice(selectedPoint,1);selectedPoint=null;save();render()};
$("#duplicateBtn").onclick=()=>{let r=activeRoute();if(!r)return;let copy=JSON.parse(JSON.stringify(r));copy.id=uid();copy.name=(r.name||"Route")+" — kopie";copy.points=copy.points.map(p=>({...p}));state.routes.push(copy);state.active=copy.id;selectedPoint=null;drawing=false;mode="pan";save();render()};
$("#deleteBtn").onclick=()=>{let r=activeRoute();if(!r)return;if(confirm(`Route “${r.name}” verwijderen?`)){state.routes=state.routes.filter(x=>x.id!==r.id);state.sessions.forEach(s=>s.routeIds=(s.routeIds||[]).filter(id=>id!==r.id));state.active=null;insertMode=false;selectedPoint=null;drawing=false;mode="pan";save();render()}};
$("#routeName").oninput=e=>{let r=activeRoute();if(r){r.name=e.target.value;save();let o=$("#routeSelect").selectedOptions[0];if(o)o.textContent=routeOverviewLabel(r);renderRouteOverview()}};
$("#routeColor").oninput=e=>{let r=activeRoute();if(r){r.color=e.target.value;save();render()}};
$("#routeStatus").onchange=e=>{let r=activeRoute();if(r){r.status=e.target.value;save();render()}};
$("#routeVisible").onchange=e=>{let r=activeRoute();if(r){r.visible=e.target.checked;save();render()}};
$("#unit").onchange=e=>{let old=state.unit||"mi",nu=e.target.value;if(old!==nu){let factor=nu==="km"?1.609344:1/1.609344;if(state.scale){state.scale.perPixel*=factor;state.scale.unit=nu;}state.routes.forEach(r=>{if(r.log?.pace)r.log.pace*=factor});state.unit=nu;save()}render()};
$("#pace").oninput=()=>{let r=activeRoute();$("#pacePreset").value="custom";if(r){r.log=r.log||{};r.log.pace=parseFloat($("#pace").value)||0;r.log.pacePreset="custom";save()}render()};
$("#pacePreset").onchange=e=>{let vals={slow:18,normal:24,fast:30};if(vals[e.target.value]){let v=vals[e.target.value];if((state.unit||"mi")==="km")v*=1.609344;$("#pace").value=v.toFixed((state.unit||"mi")==="km"?1:0);let r=activeRoute();if(r){r.log=r.log||{};r.log.pace=parseFloat($("#pace").value);r.log.pacePreset=e.target.value;save()}render()}};
$("#logFrom").onchange=autosaveTravelData;
$("#logTo").onchange=autosaveTravelData;
$("#logNote").onchange=autosaveTravelData;
$("#saveLogBtn").onclick=()=>{let r=activeRoute();if(!r)return;syncRouteLocationLinks(r);r.log.session=r.log?.session||"";r.log.date=r.log?.date||"";r.log.note=$("#logNote").value;r.log.pace=parseFloat($("#pace").value)||0;r.log.pacePreset=$("#pacePreset").value;save();render()};
}

// Keep the overview and compact picker free of distance/status metadata.
function routeEndpoints(r){
 const from=locationName(r.log?.fromLocationId,r.log?.from||"").trim();
 const to=locationName(r.log?.toLocationId,r.log?.to||"").trim();
 return from||to?`${from||"?"} → ${to||"?"}`:"";
}
function routeOverviewLabel(r){return r.name?.trim()||routeEndpoints(r)||"Naamloze route"}
function renderRouteOverview(){
 const rows=filteredSortedRoutes(),status={planned:"Gepland",traveling:"Onderweg",done:"Afgelegd"};
 $("#routeSelect").innerHTML='<option value="">Geen route geselecteerd</option>'+(rows.length?rows.map(r=>`<option value="${esc(r.id)}">${esc(routeOverviewLabel(r))}</option>`).join(""):'');
 $("#routeSelect").value=rows.some(r=>r.id===state.active)?state.active:"";
 $("#routeSummary").textContent=`${rows.length} van ${state.routes.length} routes`;
 $("#routeList").innerHTML=`<div class="travelTableWrap"><table class="travelTable"><thead><tr>${["Route","Beginlocatie","Eindlocatie","Afstand","Tijdsduur (geschat)","Tempo","Vervoermiddel","Status","Acties"].map(x=>`<th scope="col">${x}</th>`).join("")}</tr></thead><tbody>${rows.map(r=>`<tr><td><button data-route-action="edit" data-route-id="${esc(r.id)}" aria-pressed="${r.id===state.active}">${esc(routeOverviewLabel(r))}</button></td><td>${esc(locationName(r.log?.fromLocationId,r.log?.from||"Niet gekoppeld"))}</td><td>${esc(locationName(r.log?.toLocationId,r.log?.to||"Niet gekoppeld"))}</td><td>${state.scale?routeDistance(r).toFixed(1)+" "+esc(state.unit):"Onbekend"}</td><td>${routeDuration(r)===null?"Onbekend":routeDuration(r).toFixed(1)+" dagen"}</td><td>${esc(({slow:"Slow",normal:"Normal",fast:"Fast",custom:"Custom"})[r.log?.pacePreset]||"Custom")}</td><td>${esc(r.log?.transport||"Niet opgegeven")}</td><td>${status[r.status]||"Gepland"}</td><td><button data-route-action="edit" data-route-id="${esc(r.id)}">Bewerken</button> <button data-route-action="show" data-route-id="${esc(r.id)}" ${!runtimeImage||!r.points?.length?"disabled":""}>Toon op kaart</button></td></tr>`).join("")||`<tr><td colspan="9">${state.routes.length?"Geen routes gevonden":"Nog geen routes"}</td></tr>`}</tbody></table></div>`;
}

function chooseOverviewRoute(id){
 if(!routeById(id))return;
 // Keep the search/filter in place while browsing the list.
 drawing=false;insertMode=false;movingLocationId=null;calibratePts=[];pan=null;draggingPoint=null;mode="pan";
 stage.classList.remove("moveLocationMode");state.active=id;selectedPoint=null;selectedLocationId=null;showDetailPane("routePane");setRouteOverviewOpen(false,false);render();save();
}
function routeViewForPoints(points,width,height){
 if(!points.length||!width||!height)return null;
 let minX=Infinity,maxX=-Infinity,minY=Infinity,maxY=-Infinity;
 for(const p of points){if(!Number.isFinite(p.x)||!Number.isFinite(p.y))return null;minX=Math.min(minX,p.x);maxX=Math.max(maxX,p.x);minY=Math.min(minY,p.y);maxY=Math.max(maxY,p.y)}
 const z=Math.max(.08,Math.min(3,width*.8/Math.max(1,maxX-minX),height*.8/Math.max(1,maxY-minY)));
 return {z,x:width/2-(minX+maxX)/2*z,y:height/2-(minY+maxY)/2*z};
}
function showOverviewRoute(id){
 const r=routeById(id);if(!r||!runtimeImage)return;
 const view=routeViewForPoints(r.points||[],stage.clientWidth,stage.clientHeight);if(!view)return;
 r.visible=true;state.view=view;chooseOverviewRoute(id);
}

// The extra panel overlays the map, leaving the route editor available on desktop.
let routeOverviewOpen=false;
function setRouteOverviewOpen(open,restoreFocus=true){
 routeOverviewOpen=!!open;
 $("#routeOverviewPanel").classList.toggle("hidden",!routeOverviewOpen);
 $("#routeOverviewToggle").setAttribute("aria-expanded",String(routeOverviewOpen));
 $("#routeOverviewToggle").textContent=routeOverviewOpen?"Routeoverzicht sluiten":"Routeoverzicht openen";
 if(routeOverviewOpen){$("#locationOverviewModal").classList.add("hidden");$("#logModal").classList.add("hidden");renderRouteOverview();$("#routeSearch").focus()}
 else if(restoreFocus)$("#routeOverviewToggle").focus();
}

function locationOptions(selected=""){
 return '<option value="">Geen koppeling (optioneel)</option>'+[...state.markers].sort((a,b)=>String(a.name).localeCompare(String(b.name))).map(m=>`<option value="${esc(m.id)}" ${m.id===selected?"selected":""}>${esc(m.name)}</option>`).join("");
}
function openNewRouteDialog(fromId=""){
 if(!runtimeImage)return alert("Laad eerst een kaart.");
 setRouteOverviewOpen(false,false);$("#locationOverviewModal").classList.add("hidden");
 $("#newRouteStart").innerHTML=locationOptions(fromId);$("#newRouteEnd").innerHTML=locationOptions();
 $("#newRouteError").textContent="Begin en einde mogen leeg blijven.";
 $("#newRouteDialog").showModal();
}
function setRouteEndpoints(r,fromId,toId){
 const from=fromId?markerById(fromId):null,to=toId?markerById(toId):null;
 if(fromId&&!from||toId&&!to)throw new Error("De gekozen locatie bestaat niet meer.");
 r.log=r.log||{};Object.assign(r.log,{fromLocationId:from?.id||null,toLocationId:to?.id||null,from:from?.name||"",to:to?.name||""});
 // Explicitly applying a link moves only the corresponding endpoint; bends stay.
 r.points=r.points||[];
 if(from){if(r.points.length)r.points[0]={x:from.x,y:from.y};else r.points.push({x:from.x,y:from.y})}
 if(to){if(r.points.length>=2)r.points[r.points.length-1]={x:to.x,y:to.y};else r.points.push({x:to.x,y:to.y})}
}

function createRouteBetween(fromId,toId,draw=false){
 const from=fromId?markerById(fromId):null,to=toId?markerById(toId):null;
 if(fromId&&!from||toId&&!to)throw new Error("De gekozen locatie bestaat niet meer.");
 const freehand=draw||!from||!to;
 const r={id:uid(),name:from&&to?`${from.name} → ${to.name}`:`Route ${state.routes.length+1}`,color:"#e05252",status:"planned",visible:true,points:[],log:{pace:(state.unit==='km'?24*1.609344:24),pacePreset:"normal",session:"",date:"",note:"",fromLocationId:from?.id||null,toLocationId:to?.id||null,from:from?.name||"",to:to?.name||""}};
 if(from)r.points.push({x:from.x,y:from.y});
 if(!freehand)r.points.push({x:to.x,y:to.y});
 state.routes.push(r);state.active=r.id;selectedLocationId=null;selectedPoint=null;insertMode=false;drawing=freehand;mode=freehand?"route":"pan";
 showDetailPane("routePane");save();render();return r;
}

function renderRouteEndpointControls(){
 const r=activeRoute();
 $("#routeStartLocation").innerHTML=locationOptions(r?.log?.fromLocationId);
 $("#routeEndLocation").innerHTML=locationOptions(r?.log?.toLocationId);
 $("#applyRouteEndpoints").disabled=!r;
 $("#routeEndpointHelp").textContent=!r?"Selecteer eerst een route.":!markerById(r.log?.fromLocationId)||!markerById(r.log?.toLocationId)?"Koppelingen zijn optioneel. Je kunt ze hier later toevoegen of verwijderen.":"Kies een lege optie om te ontkoppelen. Schakel Punt invoegen in en klik daarna op de routelijn.";
}
function nearestRouteLocation(p){
 return state.markers.map(m=>({m,d:d(m,p)})).filter(x=>x.d<25/(state.view.z||1)).sort((a,b)=>a.d-b.d)[0]?.m||null;
}
function appendRouteDrawPoint(p){
 const r=activeRoute();if(!r)return;r.log=r.log||{};
 const near=nearestRouteLocation(p);
 if(!r.points.length&&near&&confirm(`Beginlocatie koppelen aan “${near.name}”?`)){r.log.fromLocationId=near.id;r.log.from=near.name;p={x:near.x,y:near.y}}
 else if(r.points.length&&near&&confirm(`Dit punt koppelen aan eindlocatie “${near.name}”?`)){r.log.toLocationId=near.id;r.log.to=near.name;p={x:near.x,y:near.y}}
 r.points.push(p);save();render();
}

function finishRouteDrawing(){
 const r=activeRoute();if(!r)return false;
 // Stopping never adds, moves or snaps a point.
 drawing=false;mode="pan";selectedPoint=null;save();render();return true;
}

function toggleRouteDrawing(){
 if(!activeRoute())return;
 if(drawing&&mode==="route"){finishRouteDrawing();return}
 drawing=true;insertMode=false;mode="route";render();
}
function isLinkedEndpoint(r,index){
 if(!r?.points?.[index])return false;
 const m=index===0?markerById(r.log?.fromLocationId):index===r.points.length-1?markerById(r.log?.toLocationId):null;
 return !!m&&d(r.points[index],m)<1e-8;
}

function updateRoutesForMovedLocation(m,oldPoint){
 state.routes.forEach(r=>{
 if(!r.points?.length)return;
 // A chosen destination that has not been drawn to is not a geometric endpoint.
 if(r.log?.fromLocationId===m.id&&(!oldPoint||d(r.points[0],oldPoint)<1e-8))r.points[0]={x:m.x,y:m.y};
 if(r.log?.toLocationId===m.id&&r.points.length>1&&(!oldPoint||d(r.points[r.points.length-1],oldPoint)<1e-8))r.points[r.points.length-1]={x:m.x,y:m.y};
 });
}

function insertPointOnRoute(id,p){
 if(mode!=="insert")return false;
 const r=routeById(id);if(!r||r.points.length<2)return false;
 let best=null;
 for(let i=0;i<r.points.length-1;i++){
 const a=r.points[i],b=r.points[i+1],dx=b.x-a.x,dy=b.y-a.y;
 const t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy||1)));
 const q={x:a.x+t*dx,y:a.y+t*dy},distance=d(q,p);
 if(!best||distance<best.distance)best={i,q,distance};
 }
 if(!best)return false;
 // Avoid duplicating an existing vertex when the user clicks its endpoint.
 if(d(best.q,r.points[best.i])<1e-8||d(best.q,r.points[best.i+1])<1e-8)return false;
 state.active=id;r.points.splice(best.i+1,0,best.q);selectedPoint=best.i+1;drawing=false;insertMode=true;mode="insert";
 showDetailPane("routePane");save();render();return true;
}

function clearRouteSelection(){
 state.active=null;selectedPoint=null;draggingPoint=null;
 if(mode==="route"||mode==="insert"){mode="pan";drawing=false;insertMode=false}
 render();save();
}
