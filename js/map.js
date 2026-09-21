// Kaartweergave, SVG, schaal, zoomen en pannen; bestaande centrale renderfunctie.
// Klassiek script: gedeelde globale scope; laadvolgorde staat in index.html.


function revokeRuntimeImage(){
 if(runtimeImage&&runtimeImage.startsWith("blob:"))URL.revokeObjectURL(runtimeImage);
 runtimeImage=null;
}

function applyView(){updateLocationLabels();world.style.transform=`translate(${state.view.x}px,${state.view.y}px) scale(${state.view.z})`}

function setMap(src){runtimeImage=src;
 map.onload=()=>{onboardingDismissed=true;$("#emptyState").classList.add("hidden");$("#missingMapState").classList.add("hidden");svg.setAttribute("width",map.naturalWidth);svg.setAttribute("height",map.naturalHeight);svg.setAttribute("viewBox",`0 0 ${map.naturalWidth} ${map.naturalHeight}`);$("#noMap").classList.add("hidden");$("#controls").classList.remove("hidden");$("#mapControls").classList.remove("hidden");$("#mapScaleStatus").classList.remove("hidden");if(fitOnNextMapLoad){fitOnNextMapLoad=false;fit()}else render();};
 map.onerror=()=>{alert("De kaartafbeelding kon niet worden geladen.");};
 map.src=src;
}

function zoomBy(factor){
 if(!map.naturalWidth)return;
 let cx=stage.clientWidth/2,cy=stage.clientHeight/2,old=state.view.z,n=Math.max(.08,Math.min(8,old*factor));
 state.view.x=cx-(cx-state.view.x)*(n/old);state.view.y=cy-(cy-state.view.y)*(n/old);state.view.z=n;applyView();save()
}

function fit(){if(!map.naturalWidth)return; let z=Math.min(stage.clientWidth/map.naturalWidth,stage.clientHeight/map.naturalHeight)*.94; state.view.z=z;state.view.x=(stage.clientWidth-map.naturalWidth*z)/2;state.view.y=(stage.clientHeight-map.naturalHeight*z)/2;applyView();save()}

function screenToMap(e){let r=stage.getBoundingClientRect();return{x:(e.clientX-r.left-state.view.x)/state.view.z,y:(e.clientY-r.top-state.view.y)/state.view.z}}

function d(a,b){return Math.hypot(a.x-b.x,a.y-b.y)}

function updateLocationLabels(){
 let showAll=$("#showAllLocationNames").checked;
 svg.querySelectorAll('[data-location-label]').forEach(el=>{
  el.style.display=showAll||state.view.z>=.8||el.dataset.locationLabel===selectedLocationId?"":"none";
 });
}

function cancelMapAction(){
 drawing=false;insertMode=false;movingLocationId=null;calibratePts=[];pan=null;draggingPoint=null;mode="pan";
 stage.classList.remove("moveLocationMode");render();
}

function updateMapInstruction(){
 updateBackupStatus();
 let text="",finish=drawing&&mode==="route";
 if(mode==="calibrate")text=calibratePts.length===0?"Schaal instellen · klik het eerste punt":calibratePts.length===1?"Schaal instellen · klik het tweede punt":"Schaal instellen · vul de afstand in";
 else if(mode==="marker")text="Locatie plaatsen · klik op de gewenste plek";
 else if(mode==="moveLocation")text="Locatie verplaatsen · klik op de nieuwe plek";
 else if(mode==="insert")text="Punt invoegen · klik op de gewenste plek langs de route";
 else if(finish)text="Route tekenen · klik om een punt toe te voegen";

 $("#mapInstructionText").textContent=text;
 $("#mapFinishAction").textContent="Tekenen afronden";
 $("#mapCancelAction").textContent=finish?"Stop tekenen (punten blijven)":"Annuleren (Esc)";
 $("#mapInstruction").classList.toggle("hidden",!text);
 $("#mapFinishAction").classList.toggle("hidden",!finish);
 $("#mapCancelAction").classList.toggle("hidden",mode==="pan");
}

function updateStatus(){
 let el=$("#status");if(!el)return;
 if(!activeCampaignId){el.textContent="Geen campagne geopend";return}
 if(mode==="calibrate"){el.textContent="SCHAAL INSTELLEN · klik twee punten met bekende afstand";return}
 if(mode==="marker"){el.textContent="LOCATIE PLAATSEN ACTIEF · klik op de kaart";return};
 if(mode==="moveLocation"&&movingLocationId){el.textContent="LOCATIE VERPLAATSEN ACTIEF · klik op de nieuwe positie · Esc annuleert";return}
 if(drawing&&mode==="route"){el.textContent="TEKENEN ACTIEF · klik op de kaart";return}
 if(insertMode||mode==="insert"){el.textContent="PUNT INVOEGEN ACTIEF · klik op een routesegment";return}
 el.textContent="";
}

function render(){
 $("#brandProject").textContent=activeCampaignId?(state.projectName||"Naamloze campagne"):"Geen campagne";
 updateStatus();updateMapInstruction();
 let mapUiVisible=!!map.naturalWidth;$("#mapControls").classList.toggle("hidden",!mapUiVisible);$("#mapScaleStatus").classList.toggle("hidden",!activeCampaignId);
 if(map.naturalWidth)applyView(); svg.innerHTML="";
 state.routes.forEach(r=>{
   if(r.visible!==false && r.points.length){
    let pl=document.createElementNS("http://www.w3.org/2000/svg","polyline");
    pl.setAttribute("points",r.points.map(p=>`${p.x},${p.y}`).join(" "));pl.setAttribute("fill","none");pl.setAttribute("stroke",r.color);pl.setAttribute("stroke-width",4/state.view.z);pl.setAttribute("stroke-linejoin","round");pl.setAttribute("stroke-linecap","round");
    if(r.status==="planned")pl.setAttribute("stroke-dasharray",`${10/state.view.z} ${8/state.view.z}`);
    if(r.status==="traveling")pl.setAttribute("stroke-dasharray",`${18/state.view.z} ${5/state.view.z}`);
    let routeTip=document.createElementNS("http://www.w3.org/2000/svg","title");
    let distance=routeDistance(r),pace=Number(r.log?.pace||24);
    routeTip.textContent=(r.name||"Naamloze route")+" · "+(state.scale?`${distance.toFixed(1)} ${state.unit||"mi"}`:"Schaal niet ingesteld")+(state.scale&&pace>0?` · ${(distance/pace).toFixed(2)} reisdagen`:"");
    pl.dataset.routeId=r.id;pl.style.cursor="pointer";
    if(r.id===state.active){let halo=pl.cloneNode(false);halo.removeAttribute("data-route-id");halo.setAttribute("stroke","#fff");halo.setAttribute("stroke-opacity",".5");halo.setAttribute("stroke-width",8/state.view.z);halo.style.pointerEvents="none";svg.appendChild(halo)}
    pl.appendChild(routeTip);svg.appendChild(pl);
    if(r.id===state.active)r.points.forEach((p,i)=>{let c=document.createElementNS("http://www.w3.org/2000/svg","circle");c.setAttribute("cx",p.x);c.setAttribute("cy",p.y);c.setAttribute("r",(selectedPoint===i?9:7)/state.view.z);c.setAttribute("fill",r.color);c.setAttribute("stroke",selectedPoint===i?"#ffd86b":"#fff");c.setAttribute("stroke-width",2/state.view.z);c.dataset.idx=i;c.dataset.role="route-point";svg.appendChild(c)})
   }
 });
 state.markers.forEach(m=>{
   let g=document.createElementNS("http://www.w3.org/2000/svg","g");g.dataset.markerid=m.id;g.style.cursor="pointer";
   let c=document.createElementNS("http://www.w3.org/2000/svg","circle");c.setAttribute("cx",m.x);c.setAttribute("cy",m.y);
   let sizes={City:8,Town:7,Village:5,Inn:5,Dungeon:6,Landmark:6,Custom:6};c.setAttribute("r",(sizes[m.type]||6)/state.view.z);c.setAttribute("fill",m.type==="Dungeon"?"#d38ad3":m.type==="Inn"?"#e7b95d":"#ffd86b");c.setAttribute("stroke","#222");c.setAttribute("stroke-width",2/state.view.z);
   let t=document.createElementNS("http://www.w3.org/2000/svg","text");t.setAttribute("x",m.x+9/state.view.z);t.setAttribute("y",m.y-8/state.view.z);t.setAttribute("fill","#fff");t.setAttribute("stroke","#111");t.setAttribute("stroke-width",3/state.view.z);t.setAttribute("paint-order","stroke");t.setAttribute("font-size",14/state.view.z);t.textContent=m.name;
   let locationTip=document.createElementNS("http://www.w3.org/2000/svg","title");
   locationTip.textContent=[m.name||"Naamloze locatie",m.type,m.region].filter(Boolean).join(" · ");
   t.dataset.locationLabel=m.id;
   t.style.display=$("#showAllLocationNames").checked||state.view.z>=.8||m.id===selectedLocationId?"":"none";
   if(m.id===selectedLocationId){c.setAttribute("stroke","#fff");c.setAttribute("stroke-width",4/state.view.z)}
   g.appendChild(locationTip);g.appendChild(c);g.appendChild(t);svg.appendChild(g);
 });
 if(calibratePts.length){calibratePts.forEach(p=>{let c=document.createElementNS("http://www.w3.org/2000/svg","circle");c.setAttribute("cx",p.x);c.setAttribute("cy",p.y);c.setAttribute("r",8/state.view.z);c.setAttribute("fill","#ffd86b");c.dataset.role="scale-point";svg.appendChild(c)});if(calibratePts.length===2){let l=document.createElementNS("http://www.w3.org/2000/svg","line");Object.entries({x1:calibratePts[0].x,y1:calibratePts[0].y,x2:calibratePts[1].x,y2:calibratePts[1].y,stroke:"#ffd86b","stroke-width":3/state.view.z}).forEach(([k,v])=>l.setAttribute(k,v));svg.appendChild(l)}}
 let r=activeRoute();
 $("#projectName").value=state.projectName||"";
 $("#routeName").value=r?.name||""; $("#routeColor").value=r?.color||"#e05252";$("#unit").value=state.unit||"mi";
 $("#routeStatus").value=r?.status||"planned"; $("#routeVisible").checked=r?.visible!==false;
 if(r?.log?.pace){$("#pace").value=r.log.pace;$("#pacePreset").value=r.log.pacePreset||"custom"}
 let lg=r?.log||{};
 let fromName=locationName(lg.fromLocationId,lg.from||""),toName=locationName(lg.toLocationId,lg.to||"");
 $("#logFrom").value=fromName;$("#logTo").value=toName;$("#logNote").value=lg.note||"";
 let locationNamesEl=$("#locationNames");if(locationNamesEl)locationNamesEl.innerHTML=state.markers.map(m=>`<option value="${esc(m.name)}"></option>`).join("");
 let dist=r?routeDistance(r):0, u=state.unit||"mi";$("#distance").textContent=state.scale?`${dist.toFixed(dist<100?1:0)} ${u==="mi"?"miles":"km"}`:"—";
 let pace=parseFloat($("#pace").value)||0;let travelDays=state.scale&&pace?dist/pace:0;
 $("#days").textContent=state.scale&&pace?`${travelDays.toFixed(1)} reisdagen`:"";
 $("#paceHint").textContent=`${pace||0} ${u==="mi"?"miles":"km"} per dag`;
 $("#logSummary").innerHTML=r&&state.scale?`Routeafstand: <b>${dist.toFixed(1)} ${u==="mi"?"mi":"km"}</b>${pace?` · geschatte reistijd: <b>${travelDays.toFixed(1)} dagen</b>`:""}`:"";
 $("#scaleInfo").textContent=state.scale&&Number.isFinite(Number(state.scale.perPixel))?`1 pixel = ${Number(state.scale.perPixel).toFixed(4)} ${u==="mi"?"miles":"km"}`:"Nog niet ingesteld";
 let statusName={planned:"Gepland",traveling:"Onderweg",done:"Afgelegd"};
 $("#routeCount").textContent=`${state.routes.length} ${state.routes.length===1?"route":"routes"}`;
 renderRouteOverview();
 let types=[...new Set(state.markers.map(m=>m.type||"Landmark"))].sort();let tf=$("#locationTypeFilter"),oldTf=tf.value||"all";tf.innerHTML=`<option value="all">Alle typen</option>`+types.map(t=>`<option value="${esc(t)}">${esc(t)}</option>`).join("");if([...tf.options].some(o=>o.value===oldTf))tf.value=oldTf;
 let visibleMarkers=filteredSortedMarkers();
 $("#markerList").innerHTML=visibleMarkers.length?visibleMarkers.map(m=>`<div class="routeItem" data-marker="${m.id}"><div class="routeTop"><span class="swatch" style="background:#ffd86b"></span><b>${esc(m.name)}</b><button data-gomarker="${m.id}" style="margin-left:auto;padding:2px 7px">Toon</button><button data-editmarker="${m.id}" style="padding:2px 7px">Bewerk</button></div><div class="placeDetails">${esc(m.type||"Landmark")}${m.region?` · ${esc(m.region)}`:""}${m.faction?` · ${esc(m.faction)}`:""}</div>${m.description?`<div class="placeDesc">${esc(m.description)}</div>`:""}</div>`).join(""):(state.markers.length?`<div class="small">Geen locaties gevonden.</div>`:`<div class="small">Nog geen locaties.</div>`);
 let hasCampaignData=!!(state.imageName||state.scale||state.routes.length||state.markers.length||state.sessions.length);
 let trulyNew=!!activeCampaignId&&!runtimeImage&&!state.imageName&&!state.scale&&!state.routes.length&&!state.markers.length&&!state.sessions.length;
 $("#emptyState").classList.toggle("hidden",!trulyNew||onboardingDismissed);
 $("#missingMapState").classList.toggle("hidden",!activeCampaignId||!!runtimeImage||!hasCampaignData);
 $("#missingMapCampaign").textContent=state.projectName||"deze campagne";
 $("#missingMapFilename").textContent=state.imageName?`Verwachte kaart: ${state.imageName}`:"Selecteer de wereldkaart die bij deze campagne hoort.";
 $("#mapFileInfo").textContent=state.imageName?`Kaart: ${state.imageName}${runtimeImage?"":" (opnieuw selecteren)"}`:"Nog geen kaart geselecteerd";
 $("#scaleWarning").classList.toggle("hidden",!!state.scale);
 $("#noActiveRoute").classList.toggle("hidden",!!r);
 $("#finishBtn").classList.toggle("is-on",drawing&&mode==="route");
 $("#finishBtn").textContent=drawing&&mode==="route"?"Tekenen afronden":"Route tekenen";
 $("#routeActionHint").textContent=mode==="insert"?"Klik op de kaart om een punt tussen bestaande punten in te voegen. Esc annuleert.":drawing&&mode==="route"?"Klik op de kaart om punten toe te voegen. Klik daarna op Tekenen afronden.":"Sleep een routepunt om het te verplaatsen. Klik op een punt om het te selecteren.";

 $("#sideMarkerBtn").classList.toggle("is-on",mode==="marker");
 $("#insertBtn").classList.toggle("is-mode",mode==="insert");

 let si=$("#scaleInfo");if(si)si.textContent=state.scale?`Schaal geladen · 1 px = ${Number(state.scale.perPixel).toFixed(4)} ${state.scale.unit||state.unit}`:"Schaal nog niet ingesteld";
 let mss=$("#mapScaleStatus"),mst=$("#mapScaleText");
 if(mss&&mst){if(state.scale){mss.classList.add("hasScale");mst.textContent=`Schaal ingesteld · ${state.scale.unit==="km"?"km":"miles"}`;}else{mss.classList.remove("hasScale");mst.textContent="Schaal niet ingesteld";}}
}

function chooseWorldMap(){ $("#imageInput").click() }

function cancelScaleEntry(){
 calibratePts=[];mode="pan";$("#scaleDialog").close();render();
}

function addScalePoint(p){
 if($("#scaleDialog").open||calibratePts.length>=2)return;
 calibratePts.push(p);render();
 if(calibratePts.length!==2)return;
 $("#scaleDistance").value="";
 $("#scaleDistanceLabel").textContent=`Afstand tussen de twee punten (${state.unit==="km"?"km":"miles"})`;
 $("#scaleError").textContent=d(calibratePts[0],calibratePts[1])>0?"":"De punten liggen op dezelfde plek. Annuleer en kies twee verschillende punten.";
 $("#scaleDialog").showModal();$("#scaleDistance").focus();
}

// Registreer bediening; aangeroepen vanuit init.js.
function bindMapInstructionUI(){
$("#mapInstruction").onpointerdown=e=>e.stopPropagation();
$("#mapCancelAction").onclick=cancelMapAction;
$("#mapFinishAction").onclick=()=>$("#finishBtn").click();
$("#showAllLocationNames").onchange=updateLocationLabels;
}

// Registreer bediening; aangeroepen vanuit init.js.
function bindMapControlsUI(){
$("#emptySelectMapBtn").onclick=chooseWorldMap;
$("#missingSelectMapBtn").onclick=chooseWorldMap;
// Overlay controls are not part of map drawing, dragging or location moving.
document.querySelectorAll(".heroEmpty").forEach(el=>el.addEventListener("pointerdown",e=>e.stopPropagation()));
$("#imageInput").onchange=e=>{let f=e.target.files[0];if(!f)return;onboardingDismissed=true;$("#emptyState").classList.add("hidden");if(state.imageName&&state.imageName!==f.name&&(state.routes.length||state.markers.length)&&!confirm(`Dit project verwacht “${state.imageName}”. Je selecteert “${f.name}”. Routes en locaties blijven op dezelfde coördinaten staan. Toch doorgaan?`)){e.target.value="";return}runtimeImageBlob=f;state.imageName=f.name;revokeRuntimeImage();runtimeImage=URL.createObjectURL(f);fitOnNextMapLoad=true;setMap(runtimeImage);save();render();e.target.value=""}
$("#calibrateBtn").onclick=()=>{if(!runtimeImage)return alert("Selecteer eerst een kaart.");$("#projectMenu").classList.add("hidden");movingLocationId=null;stage.classList.remove("moveLocationMode");pan=null;draggingPoint=null;mode="calibrate";drawing=false;insertMode=false;calibratePts=[];render()}
$("#fitBtn").onclick=fit;
$("#mapFitBtn").onclick=e=>{e.stopPropagation();fit()};
$("#zoomInBtn").onclick=e=>{e.stopPropagation();zoomBy(1.25)};
$("#zoomOutBtn").onclick=e=>{e.stopPropagation();zoomBy(0.8)};
$("#mapControls").onpointerdown=e=>e.stopPropagation();
}

// Registreer bediening; aangeroepen vanuit init.js.
function bindMapPointerUI(){
$("#cancelScaleBtn").onclick=cancelScaleEntry;
$("#scaleDialog").addEventListener("cancel",e=>{e.preventDefault();cancelScaleEntry()});
$("#scaleDialog").addEventListener("keydown",e=>{if(e.key==="Escape")e.stopPropagation()});
$("#scaleForm").onsubmit=e=>{
 e.preventDefault();
 let raw=$("#scaleDistance").value.trim().replace(",","."),val=Number(raw);
 let pixels=calibratePts.length===2?d(calibratePts[0],calibratePts[1]):0;
 if(!Number.isFinite(val)||val<=0||pixels<=0){$("#scaleError").textContent=pixels<=0?"Kies twee verschillende kaartpunten. Annuleer om opnieuw te beginnen.":"Vul een geldige afstand groter dan 0 in.";return}
 state.scale={perPixel:val/pixels,unit:state.unit||"mi"};
 calibratePts=[];mode="pan";$("#scaleDialog").close();save();render();
};
stage.onpointerdown=e=>{
 if(e.target.closest?.(".heroEmpty"))return;
 if(e.target.closest?.("#mapControls")||e.target.closest?.("#mapScaleStatus")||e.target.closest?.("#mapInstruction"))return;
 if(mode==="marker"){beginLocationPlacement(screenToMap(e));return}
 if(mode==="calibrate"){addScalePoint(screenToMap(e));return}
 let mg=e.target.closest?.("[data-markerid]");if(mg){selectedLocationId=mg.dataset.markerid;render();openLocationEditor(mg.dataset.markerid);return}

 if(e.target.dataset?.role==="route-point"&&e.target.dataset.idx!==undefined){selectedPoint=+e.target.dataset.idx;draggingPoint={idx:selectedPoint};stage.setPointerCapture(e.pointerId);render();return}

 if(mode==="insert"){let r=activeRoute(),p=screenToMap(e);if(r&&r.points.length>=2){let best=0,bestD=Infinity;for(let i=0;i<r.points.length-1;i++){let a=r.points[i],b=r.points[i+1],vx=b.x-a.x,vy=b.y-a.y,wx=p.x-a.x,wy=p.y-a.y,t=Math.max(0,Math.min(1,(wx*vx+wy*vy)/(vx*vx+vy*vy||1))),q={x:a.x+t*vx,y:a.y+t*vy},dd=d(p,q);if(dd<bestD){bestD=dd;best=i}}r.points.splice(best+1,0,p);selectedPoint=best+1;save();}insertMode=false;mode="pan";render();return}

 if(drawing&&mode==="route"&&activeRoute()){activeRoute().points.push(screenToMap(e));save();render();return}
 let routeHit=e.target.closest?.("[data-route-id]");if(routeHit&&mode==="pan"){selectMapRoute(routeHit.dataset.routeId);return}
 pan={sx:e.clientX,sy:e.clientY,x:state.view.x,y:state.view.y};stage.setPointerCapture(e.pointerId)
}
stage.onpointermove=e=>{if(draggingPoint){let r=activeRoute(),p=screenToMap(e);r.points[draggingPoint.idx]=p;render();return}if(pan){state.view.x=pan.x+e.clientX-pan.sx;state.view.y=pan.y+e.clientY-pan.sy;applyView()}}
stage.onpointerup=e=>{let movedRoutePoint=!!draggingPoint;draggingPoint=null;if(movedRoutePoint)save();if(pan){pan=null;save()}}
stage.onwheel=e=>{e.preventDefault();if(!map.naturalWidth)return;let rect=stage.getBoundingClientRect(),mx=e.clientX-rect.left,my=e.clientY-rect.top,old=state.view.z,n=Math.max(.08,Math.min(8,old*Math.exp(-e.deltaY*.001)));state.view.x=mx-(mx-state.view.x)*(n/old);state.view.y=my-(my-state.view.y)*(n/old);state.view.z=n;render()},{passive:false}
}
