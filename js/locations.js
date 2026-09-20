// Locaties zoeken, bewerken, plaatsen en verplaatsen.
// Klassiek script: gedeelde globale scope; laadvolgorde staat in index.html.


function filteredSortedMarkers(){
 let q=($("#locationSearch")?.value||"").trim().toLowerCase(),f=$("#locationTypeFilter")?.value||"all",sort=$("#locationSort")?.value||"name";
 let rows=state.markers.filter(m=>(f==="all"||m.type===f)&&(!q||[m.name,m.type,m.region,m.faction,m.description,m.notes].some(v=>(v||"").toLowerCase().includes(q))));
 rows.sort((a,b)=>{
  if(sort==="type")return String(a.type||"").localeCompare(String(b.type||""))||String(a.name||"").localeCompare(String(b.name||""));
  if(sort==="region")return String(a.region||"").localeCompare(String(b.region||""))||String(a.name||"").localeCompare(String(b.name||""));
  if(sort==="recent")return state.markers.indexOf(b)-state.markers.indexOf(a);
  return String(a.name||"").localeCompare(String(b.name||""),undefined,{numeric:true})
 });
 return rows
}

function openLocationEditor(id){
 let m=state.markers.find(x=>x.id===id);if(!m)return;
 $("#locationId").value=m.id;$("#locationName").value=m.name||"";$("#locationType").value=m.type||"Landmark";$("#locationRegion").value=m.region||"";$("#locationFaction").value=m.faction||"";$("#locationDescription").value=m.description||"";$("#locationNotes").value=m.notes||"";
 $("#locationEditorTitle").textContent=m.name||"Locatie";$("#locationModal").classList.remove("hidden");
}

function markerById(id){return state.markers.find(m=>m.id===id)||null}

function locationName(id,fallback=""){let m=markerById(id);return m?m.name:fallback}

function findLocationByName(name){let n=(name||"").trim().toLowerCase();return state.markers.find(m=>(m.name||"").trim().toLowerCase()===n)||null}

function centerOnLocation(id){
 let m=markerById(id);if(!m||!runtimeImage)return;
 selectedLocationId=id;
 let rect=$("#stage").getBoundingClientRect(),z=Math.max(.35,Math.min(3,state.view.z||1));
 state.view.z=z;state.view.x=rect.width/2-m.x*z;state.view.y=rect.height/2-m.y*z;applyView();render()
}

function beginLocationPlacement(p){
 pendingLocationPoint={x:Math.max(0,Math.min(map.naturalWidth,p.x)),y:Math.max(0,Math.min(map.naturalHeight,p.y))};
 mode="pan";render();$("#newLocationName").value="";
 $("#newLocationDialog").showModal();$("#newLocationName").focus();
}

function cancelLocationMove(){
 movingLocationId=null;if(mode==="moveLocation")mode="pan";stage.classList.remove("moveLocationMode");render();
}

function commitLocationMove(e){
 if(e.target.closest?.(".heroEmpty"))return;
 if(mode!=="moveLocation"||!movingLocationId)return;
 if(e.target.closest?.("#mapControls")||e.target.closest?.("#mapScaleStatus")||e.target.closest?.("#mapInstruction"))return;
 e.preventDefault();e.stopImmediatePropagation();
 let p=screenToMap(e),loc=state.markers.find(x=>x.id===movingLocationId);
 if(!loc){cancelLocationMove();return}
 loc.x=Math.max(0,Math.min(map.naturalWidth||p.x,p.x));
 loc.y=Math.max(0,Math.min(map.naturalHeight||p.y,p.y));
 movingLocationId=null;mode="pan";stage.classList.remove("moveLocationMode");save();render();
}

// Registreer bediening; aangeroepen vanuit init.js.
function bindLocationPlacementUI(){
$("#cancelNewLocationBtn").onclick=()=>$("#newLocationDialog").close();
$("#newLocationDialog").addEventListener("close",()=>{pendingLocationPoint=null});
$("#newLocationForm").onsubmit=e=>{
 e.preventDefault();let name=$("#newLocationName").value.trim();
 if(!name||!pendingLocationPoint)return;
 let m={id:uid(),name,type:"Landmark",region:"",faction:"",description:"",notes:"",...pendingLocationPoint};
 pendingLocationPoint=null;state.markers.push(m);$("#newLocationDialog").close();
 save();render();openLocationEditor(m.id);
};
}

// Registreer bediening; aangeroepen vanuit init.js.
function bindLocationEditorUI(){
$("#closeLocationBtn").onclick=()=>$("#locationModal").classList.add("hidden");
$("#locationModal").onclick=e=>{if(e.target===$("#locationModal"))$("#locationModal").classList.add("hidden")};

stage.addEventListener("pointerdown",commitLocationMove,true);
$("#moveLocationBtn").onclick=()=>{
 let id=$("#locationId").value;if(!id||!state.markers.some(x=>x.id===id))return;
 movingLocationId=id;drawing=false;insertMode=false;pan=null;mode="moveLocation";
 stage.classList.add("moveLocationMode");$("#locationModal").classList.add("hidden");render();
};
$("#saveLocationBtn").onclick=()=>{let m=state.markers.find(x=>x.id===$("#locationId").value);if(!m)return;m.name=$("#locationName").value;m.type=$("#locationType").value;m.region=$("#locationRegion").value;m.faction=$("#locationFaction").value;m.description=$("#locationDescription").value;m.notes=$("#locationNotes").value;state.routes.forEach(r=>{if(r.log?.fromLocationId===m.id)r.log.from=m.name;if(r.log?.toLocationId===m.id)r.log.to=m.name});$("#locationModal").classList.add("hidden");save();render()};
$("#deleteLocationBtn").onclick=()=>{let id=$("#locationId").value;if(id&&confirm("Deze locatie verwijderen?")){state.routes.forEach(r=>{if(r.log?.fromLocationId===id)r.log.fromLocationId=null;if(r.log?.toLocationId===id)r.log.toLocationId=null});state.sessions.forEach(s=>s.locationIds=(s.locationIds||[]).filter(x=>x!==id));state.markers=state.markers.filter(x=>x.id!==id);$("#locationModal").classList.add("hidden");save();render()}};
}
