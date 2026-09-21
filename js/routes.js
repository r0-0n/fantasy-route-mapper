// Routes, afstanden, selectie en gekoppelde locaties.
// Klassiek script: gedeelde globale scope; laadvolgorde staat in index.html.


function activeRoute(){return state.routes.find(r=>r.id===state.active)}

function routeDistance(r){if(!state.scale||r.points.length<2)return 0;let px=0;for(let i=1;i<r.points.length;i++)px+=d(r.points[i-1],r.points[i]);return px*state.scale.perPixel}

function routeById(id){return state.routes.find(r=>r.id===id)}

function filteredSortedRoutes(){
 let q=($("#routeSearch")?.value||"").trim().toLowerCase(),f=$("#routeFilter")?.value||"all",sort=$("#routeSort")?.value||"name";
 let rows=state.routes.filter(r=>(f==="all"||r.status===f)&&(!q||[r.name,r.log?.from,r.log?.to,r.log?.note].some(v=>(v||"").toLowerCase().includes(q))));
 rows.sort((a,b)=>{
  if(sort==="status")return String(a.status||"").localeCompare(String(b.status||""))||String(a.name||"").localeCompare(String(b.name||""));
  if(sort==="distance")return routeDistance(b)-routeDistance(a);
  if(sort==="recent")return state.routes.indexOf(b)-state.routes.indexOf(a);
  return String(a.name||"").localeCompare(String(b.name||""),undefined,{numeric:true})
 });
 return rows
}

function startRouteFromLocation(id){
 let m=markerById(id);if(!m)return;
 let rid=uid(),n=state.routes.length+1;
 state.routes.push({id:rid,name:`${m.name} → ?`,color:"#e05252",status:"planned",visible:true,log:{session:"",date:"",from:m.name,to:"",note:"",pace:24,pacePreset:"normal",fromLocationId:m.id,toLocationId:null},points:[{x:m.x,y:m.y}]});
 state.active=rid;selectedPoint=null;drawing=true;insertMode=false;mode="route";
 $("#locationModal").classList.add("hidden");document.querySelector('[data-tab="routePane"]')?.click();save();render()
}

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
 document.querySelector('[data-tab="routePane"]').click();render();save();
}

function addRoute(){
 if(!runtimeImage)return alert("Selecteer eerst een kaart via Project → Kaart selecteren.");
 let id=uid(),n=state.routes.length+1;
 state.routes.push({id,name:`Route ${n}`,color:"#e05252",status:"planned",visible:true,log:{session:"",date:"",from:"",to:"",note:"",pace:24,pacePreset:"normal",fromLocationId:null,toLocationId:null},points:[]});
 state.active=id;selectedPoint=null;drawing=true;insertMode=false;mode="route";render();save()
}

function autosaveTravelData(){
 let r=activeRoute();if(!r)return;
 syncRouteLocationLinks(r);r.log=r.log||{};r.log.note=$("#logNote").value;r.log.pace=parseFloat($("#pace").value)||0;r.log.pacePreset=$("#pacePreset").value;save();render()
}

// Registreer bediening; aangeroepen vanuit init.js.
function bindRouteSearchUI(){
$("#routeSelect").onchange=e=>{let id=e.target.value;if(!id)return;if(state.routes.some(r=>r.id===id)){state.active=id;selectedPoint=null;drawing=false;insertMode=false;mode="pan";render();save()}};
$("#routeSearch").oninput=()=>render();
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
$("#panelNewRouteBtn").onclick=addRoute;
$("#finishBtn").onclick=()=>{let r=activeRoute();if(!r)return;if(drawing&&mode==="route"){drawing=false;mode="pan";let p=r.points[r.points.length-1];let near=p?state.markers.map(m=>({m,d:Math.hypot(m.x-p.x,m.y-p.y)})).sort((a,b)=>a.d-b.d)[0]:null;if(near&&near.d<25/(state.view.z||1)&&confirm(`Bestemming koppelen aan “${near.m.name}”?`)){r.log=r.log||{};r.log.toLocationId=near.m.id;r.log.to=near.m.name;r.points[r.points.length-1]={x:near.m.x,y:near.m.y};if(r.log.fromLocationId)r.name=`${locationName(r.log.fromLocationId,r.log.from||"")} → ${near.m.name}`}save()}else{drawing=true;insertMode=false;mode="route"}render()};
$("#insertBtn").onclick=()=>{let r=activeRoute();if(!r)return alert("Selecteer eerst een route.");if(r.points.length<2)return alert("Een route heeft minimaal twee punten nodig.");drawing=false;insertMode=true;mode="insert";render()};
$("#undoBtn").onclick=()=>{let r=activeRoute();if(!r||!r.points.length)return;r.points.pop();selectedPoint=null;save();render()};
$("#deletePointBtn").onclick=()=>{let r=activeRoute();if(!r)return;if(selectedPoint===null)return alert("Klik eerst op een routepunt.");r.points.splice(selectedPoint,1);selectedPoint=null;save();render()};
$("#duplicateBtn").onclick=()=>{let r=activeRoute();if(!r)return;let copy=JSON.parse(JSON.stringify(r));copy.id=uid();copy.name=(r.name||"Route")+" — kopie";copy.points=copy.points.map(p=>({x:p.x+10,y:p.y+10}));state.routes.push(copy);state.active=copy.id;selectedPoint=null;drawing=false;mode="pan";save();render()};
$("#deleteBtn").onclick=()=>{let r=activeRoute();if(!r)return;if(confirm(`Route “${r.name}” verwijderen?`)){state.routes=state.routes.filter(x=>x.id!==r.id);state.sessions.forEach(s=>s.routeIds=(s.routeIds||[]).filter(id=>id!==r.id));state.active=state.routes[0]?.id||null;selectedPoint=null;drawing=false;mode="pan";save();render()}};
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
 const rows=filteredSortedRoutes();
 $("#routeSelect").innerHTML=rows.length?rows.map(r=>`<option value="${esc(r.id)}">${esc(routeOverviewLabel(r))}</option>`).join(""):`<option value="">${state.routes.length?"Geen routes gevonden":"Nog geen routes"}</option>`;
 $("#routeSelect").value=rows.some(r=>r.id===state.active)?state.active:"";
 $("#routeList").innerHTML=rows.length?rows.map(r=>{
 const label=routeOverviewLabel(r),ends=routeEndpoints(r),selected=r.id===state.active;
 return `<div class="routeItem sidebarRouteCard${selected?" selectedRoute":""}"><div class="routeTop"><button type="button" class="routeOverviewName" data-route-action="edit" data-route-id="${esc(r.id)}" aria-pressed="${selected}">${esc(label)}</button><button type="button" data-route-action="show" data-route-id="${esc(r.id)}" ${!runtimeImage||!r.points?.length?'disabled title="Laad een kaart en voeg routepunten toe"':`title="Toon ${esc(label)} op de kaart"`}>Toon</button></div>${ends&&ends!==label?`<div class="placeDetails">${esc(ends)}</div>`:""}</div>`;
 }).join(""):`<div class="small" role="status">${state.routes.length?"Geen routes gevonden. Pas je zoekopdracht of filter aan.":"Nog geen routes. Maak je eerste route met + Nieuwe route."}</div>`;
}
function chooseOverviewRoute(id){
 if(!routeById(id))return;
 // Keep the search/filter in place while browsing the list.
 drawing=false;insertMode=false;movingLocationId=null;calibratePts=[];pan=null;draggingPoint=null;mode="pan";
 stage.classList.remove("moveLocationMode");state.active=id;selectedPoint=null;selectedLocationId=null;render();save();
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
