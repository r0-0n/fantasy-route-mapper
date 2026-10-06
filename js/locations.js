// Locaties zoeken, bewerken, plaatsen en verplaatsen.
// Klassiek script: gedeelde globale scope; laadvolgorde staat in index.html.


function filteredSortedMarkers(){
 let q=($("#locationSearch")?.value||"").trim().toLowerCase(),f=$("#locationTypeFilter")?.value||"all",sort=$("#locationSort")?.value||"name";
 let rows=state.markers.filter(m=>(f==="all"||m.type===f)&&(!q||[m.name,m.type,m.description,m.notes,m.owner,...(m.npcs||[]).flatMap(n=>[n.name,n.role,n.note])].some(v=>(v||"").toLowerCase().includes(q))));
 rows.sort((a,b)=>{
  if(sort==="type")return String(a.type||"").localeCompare(String(b.type||""))||String(a.name||"").localeCompare(String(b.name||""));
  if(sort==="recent")return state.markers.indexOf(b)-state.markers.indexOf(a);
  return String(a.name||"").localeCompare(String(b.name||""),undefined,{numeric:true})
 });
 return rows
}

function openLocationEditor(id){
 partySelected=false;
 let m=state.markers.find(x=>x.id===id);if(!m)return;
 clearRouteSelection();
 syncLocationTypes();
 $("#locationVisible").checked=m.visible!==false;$("#locationShowName").checked=m.labelMode!=="hide";$("#locationId").value=m.id;$("#locationName").value=m.name||"";$("#locationType").value=m.type||"Landmark";$("#locationDescription").value=locationNotesText(m);$("#locationNotes").value="";
 if(isCity()){$("#locationDescription").value=locationNotesText(m);$("#locationOwner").value=m.owner||"";renderCityNPCs(m)}
 selectedLocationId=id;showDetailPane("placesPane");$("#locationOverviewModal").classList.add("hidden");$("#noSelectedLocation").classList.add("hidden");
 $("#locationEditorTitle").textContent=m.name||"Locatie";$("#locationModal").classList.remove("hidden");render();
}

function markerById(id){return state.markers.find(m=>m.id===id)||null}

function locationName(id,fallback=""){let m=markerById(id);return m?m.name:fallback}

function findLocationByName(name){let n=(name||"").trim().toLowerCase();return state.markers.find(m=>(m.name||"").trim().toLowerCase()===n)||null}

function centerOnLocation(id){
 let m=markerById(id);if(!m||!runtimeImage)return;
 m.visible=true;save();selectedLocationId=id;flashingLocationId=state.iconEmphasis!==false?id:null;clearTimeout(locationFlashTimer);locationFlashTimer=setTimeout(()=>{flashingLocationId=null;render()},2200);
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
 if(e.button!==undefined&&e.button!==0)return;
 if(e.target.closest?.(".heroEmpty"))return;
 if(mode!=="moveLocation"||!movingLocationId)return;
 if(e.target.closest?.("#mapControls")||e.target.closest?.("#mapScaleStatus")||e.target.closest?.("#mapInstruction"))return;
 e.preventDefault();e.stopImmediatePropagation();
 let p=screenToMap(e),loc=state.markers.find(x=>x.id===movingLocationId);
 if(!loc){cancelLocationMove();return}
 const oldPoint={x:loc.x,y:loc.y};
 loc.x=Math.max(0,Math.min(map.naturalWidth||p.x,p.x));
 loc.y=Math.max(0,Math.min(map.naturalHeight||p.y,p.y));
 updateRoutesForMovedLocation(loc,oldPoint);movingLocationId=null;mode="pan";stage.classList.remove("moveLocationMode");save();render();openLocationEditor(loc.id);
}

// Registreer bediening; aangeroepen vanuit init.js.
function bindLocationPlacementUI(){
$("#cancelNewLocationBtn").onclick=()=>$("#newLocationDialog").close();
$("#newLocationDialog").addEventListener("close",()=>{pendingLocationPoint=null});
$("#newLocationForm").onsubmit=e=>{
 e.preventDefault();let name=$("#newLocationName").value.trim();
 if(!name||!pendingLocationPoint)return;
 let m={id:uid(),name,type:isCity()?"Overig":"Landmark",region:"",faction:"",description:"",notes:"",...pendingLocationPoint};
 pendingLocationPoint=null;state.markers.push(m);$("#newLocationDialog").close();
 save();render();openLocationEditor(m.id);
};
}

// Registreer bediening; aangeroepen vanuit init.js.
function bindLocationEditorUI(){


stage.addEventListener("pointerdown",commitLocationMove,true);
$("#moveLocationBtn").onclick=()=>{
 let id=$("#locationId").value;if(!runtimeImage)return alert("Laad eerst een kaart.");if(!id||!state.markers.some(x=>x.id===id))return;
 movingLocationId=id;drawing=false;insertMode=false;pan=null;mode="moveLocation";
 stage.classList.add("moveLocationMode");render();
};
$("#deleteLocationBtn").onclick=()=>{let id=$("#locationId").value;if(state.routes.some(r=>r.log?.fromLocationId===id||r.log?.toLocationId===id))return alert("Deze locatie is begin of einde van een route. Ontkoppel die route eerst, kies een andere locatie of verwijder de route.");if(id&&confirm("Deze locatie verwijderen?")){state.routes.forEach(r=>{if(r.log?.fromLocationId===id)r.log.fromLocationId=null;if(r.log?.toLocationId===id)r.log.toLocationId=null});state.sessions.forEach(s=>s.locationIds=(s.locationIds||[]).filter(x=>x!==id));state.markers=state.markers.filter(x=>x.id!==id);$("#locationModal").classList.add("hidden");save();render()}};
}

function showDetailPane(id){
 $("#dmMenuBtn").classList.remove("active");
 if(id){dmOpen=false;dmTool=null;dmDraft=null;dmShowTerrain=false;dmShowRoads=false;$("#dmPanel").classList.add("hidden")}
 if(id){partySelected=false;$("#partyDetails").classList.add("hidden")}
 document.querySelectorAll('.tabpane').forEach(p=>p.classList.toggle('active',p.id===id));
 document.querySelectorAll('.tab[data-tab]').forEach(b=>b.classList.toggle('active',b.dataset.tab===id));
 syncSidebarModes();
 if(sidebarCollapsed)setSidebarCollapsed(false);
}
function renderLocationOverview(){
 $("#locationCount").textContent=`${state.markers.length} ${state.markers.length===1?"locatie":"locaties"}`;
 if(!selectedLocationId||!markerById($("#locationId").value)){$("#locationModal").classList.add("hidden");$("#noSelectedLocation").classList.remove("hidden")}
 const rows=filteredSortedMarkers();
 $('#markerList').innerHTML=`<div class="travelTableWrap"><table class="travelTable"><thead><tr>${['Locatie','Type','Omschrijving','Acties'].map(x=>`<th scope="col">${x}</th>`).join('')}</tr></thead><tbody>${rows.map(m=>`<tr data-marker="${esc(m.id)}"><td><button data-editmarker="${esc(m.id)}">${esc(m.name||'Naamloze locatie')}</button></td><td><img class="locationTypeIcon" src="${locationIcon(m.type)}" alt=""> ${esc(m.type||'Landmark')}</td><td>${esc(m.description||'—')}</td><td><button data-editmarker="${esc(m.id)}">Bewerken</button> <button data-gomarker="${esc(m.id)}" ${runtimeImage?'':'disabled'}>Toon op kaart</button></td></tr>`).join('')||'<tr><td colspan="4">Geen locaties gevonden.</td></tr>'}</tbody></table></div>`;
}
function openLocationOverview(){
 setRouteOverviewOpen(false,false);$('#logModal').classList.add('hidden');render();$('#locationOverviewModal').classList.remove('hidden');$('#locationSearch').focus();
}
function saveLocationDetails(){
 const m=markerById($('#locationId').value);if(!m)return;
 m.visible=$('#locationVisible').checked;m.labelMode=$('#locationShowName').checked?'show':'hide';m.name=$('#locationName').value;m.type=$('#locationType').value;m.description=$('#locationDescription').value;m.notes='';if(isCity())m.owner=$('#locationOwner').value;
 state.routes.forEach(r=>{if(r.log?.fromLocationId===m.id)r.log.from=m.name;if(r.log?.toLocationId===m.id)r.log.to=m.name});
 $('#locationEditorTitle').textContent=m.name||'Locatie';save();render();
}
function bindOverviewUI(){
 $("#clearLocationSelectionBtn").onclick=clearLocationSelection;
 $('#overviewNewRouteBtn').onclick=()=>openNewRouteDialog();
 $('#locationOverviewBtn').onclick=openLocationOverview;
 $('#closeLocationOverview').onclick=()=>{$('#locationOverviewModal').classList.add('hidden')};
 $('#locationOverviewModal').onclick=e=>{if(e.target===$('#locationOverviewModal'))$('#locationOverviewModal').classList.add('hidden')};
 $('#routeOverviewPanel').addEventListener('click',e=>{if(e.target===$('#routeOverviewPanel'))setRouteOverviewOpen(false)});
 $('#overviewNewLocationBtn').onclick=()=>{$('#locationOverviewModal').classList.add('hidden');showDetailPane('placesPane');$('#sideMarkerBtn').click()};
 $('#cancelNewRoute').onclick=()=>$('#newRouteDialog').close();
 $('#newRouteForm').onsubmit=e=>{e.preventDefault();try{state.followRoads=$('#newRouteFollowRoads').checked;createRouteBetween($('#newRouteStart').value,$('#newRouteEnd').value,false,$('#newRouteTransport').value||'Lopend');$('#newRouteDialog').close()}catch(err){$('#newRouteError').textContent=err.message}};
 $('#applyRouteEndpoints').onclick=()=>{const r=activeRoute();if(!r)return;try{linkRouteViaNetwork(r,$('#routeStartLocation').value,$('#routeEndLocation').value);drawing=false;mode='pan';save();render()}catch(err){$('#routeEndpointHelp').textContent=err.message}};
 for(const id of ['locationVisible','locationShowName','locationName','locationType','locationDescription','locationNotes','locationOwner'])$('#'+id).addEventListener('input',saveLocationDetails);
 $('#logbookBtn').onclick=()=>{setRouteOverviewOpen(false,false);$('#locationOverviewModal').classList.add('hidden');$('#logModal').classList.remove('hidden');renderLogbook()};
}

function clearLocationSelection(){
 selectedLocationId=null;$("#locationId").value="";
 $("#locationModal").classList.add("hidden");$("#noSelectedLocation").classList.remove("hidden");
 if(mode==="moveLocation"){movingLocationId=null;mode="pan";stage.classList.remove("moveLocationMode")}
 render();
}

let flashingLocationId=null,locationFlashTimer=null;

function renderQuickLocations(){
 const query=$('#quickLocationSearch').value.trim().toLocaleLowerCase();
 $('#quickLocationResults').innerHTML=query?state.markers.filter(m=>(m.name||'').toLocaleLowerCase().includes(query)).slice(0,12).map(m=>`<button type="button" data-quick-location="${esc(m.id)}">${esc(m.name)}</button>`).join('')||'<p class="small">Geen locaties gevonden.</p>':'';
}
function locationNotesText(marker){return [marker.description,marker.notes].filter(Boolean).join('\n\n')}
function renderCityNPCs(marker){
 $('#cityNpcList').innerHTML=(marker.npcs||[]).map((npc,i)=>`<button type="button" class="compactNpc" data-open-location-npc="${i}"><strong>${esc(npc.name||'Naamloze NPC')}</strong><span class="small">${esc(npc.role||'')}</span></button>`).join('')||'<p class="small">Nog geen NPC’s bij deze locatie.</p>';
}
function bindCityUI(){
 $('#mapProjectName').onchange=e=>{const name=e.target.value.trim();if(!name){e.target.value=state.projectName;return}state.projectName=name;save();render()};
 $('#addCityNpc').onclick=()=>openNpcForm($('#locationId').value);
 $('#cityNpcList').addEventListener('click',e=>{const b=e.target.closest('[data-open-location-npc]');if(b)openNpcForm($('#locationId').value,Number(b.dataset.openLocationNpc))});
}

// The overview edits the same nested NPC objects as the location sidebar.
let npcEditTarget=null;
function npcOverviewRows(search=$('#npcSearch').value){
 const query=search.trim().toLocaleLowerCase();
 return state.markers.flatMap(marker=>(marker.npcs||[]).map((npc,index)=>({marker,npc,index})))
  .filter(({marker,npc})=>!query||[marker.name,npc.name,npc.role,npc.note].some(v=>(v||'').toLocaleLowerCase().includes(query)))
  .sort((a,b)=>(a.npc.name||'').localeCompare(b.npc.name||'', 'nl',{numeric:true}));
}
function renderNpcOverview(){
 const rows=npcOverviewRows();
 $('#newOverviewNpc').disabled=!state.markers.length;
 $('#npcOverviewHint').textContent=state.markers.length?'NPC’s horen bij een locatie. Wijzigingen zijn ook zichtbaar bij die locatie.':'Maak eerst een locatie op de kaart om er NPC’s aan toe te voegen.';
 $('#npcOverviewTable').innerHTML=`<table class="travelTable"><thead><tr><th>Naam</th><th>Rol</th><th>Locatie</th><th>Opmerkingen</th><th>Acties</th></tr></thead><tbody>${rows.map(({marker,npc,index})=>`<tr><td>${esc(npc.name||'Naamloze NPC')}</td><td>${esc(npc.role||'—')}</td><td>${esc(marker.name||'Naamloze locatie')}</td><td class="npcNoteCell">${esc(npc.note||'—')}</td><td><button type="button" data-edit-npc-location="${esc(marker.id)}" data-edit-npc-index="${index}">Bewerken</button></td></tr>`).join('')||'<tr><td colspan="5">Geen NPC’s gevonden.</td></tr>'}</tbody></table>`;
}
function openNpcOverview(){
 if(!isCity())return;
 $('#npcSearch').value='';
 renderNpcOverview();$('#npcOverviewDialog').showModal();$('#npcSearch').focus();
}
function openNpcForm(markerId=null,index=null){
 if(!isCity())return;
 $('#npcOverviewDialog').close();showDetailPane('npcPane');const sidebar=$('aside');if(sidebar)sidebar.scrollTop=0;
 const marker=markerById(markerId),npc=marker?.npcs?.[index];
 npcEditTarget=npc?{markerId,npc}:null;
 $('#npcEditTitle').textContent=npc?(npc.name||'NPC bewerken'):'NPC toevoegen';
 $('#deleteSelectedNpc').hidden=!npc;$('#noSelectedNpc').classList.add('hidden');
 $('#npcEditLocation').innerHTML=[...state.markers].sort((a,b)=>(a.name||'').localeCompare(b.name||'','nl')).map(m=>`<option value="${esc(m.id)}">${esc(m.name||'Naamloze locatie')}</option>`).join('');
 if(marker)$('#npcEditLocation').value=marker.id;
 else if(markerById(selectedLocationId))$('#npcEditLocation').value=selectedLocationId;
 $('#npcEditName').value=npc?.name||'';$('#npcEditRole').value=npc?.role||'';$('#npcEditNote').value=npc?.note||'';$('#npcEditError').textContent='';$('#npcEditForm').hidden=false;$('#npcEditName').focus();
}
function saveNpcOverview(e){
 e.preventDefault();if(!isCity())return;
 const destination=markerById($('#npcEditLocation').value),name=$('#npcEditName').value.trim();
 if(!name||!destination){$('#npcEditError').textContent='Vul een naam in en kies een locatie.';return}
 let npc=npcEditTarget?.npc;
 if(npc){
  const source=markerById(npcEditTarget.markerId),index=source?.npcs?.indexOf(npc)??-1;
  if(index<0){$('#npcEditError').textContent='Deze NPC bestaat niet meer. Open het overzicht opnieuw.';return}
  if(source!==destination){source.npcs.splice(index,1);(destination.npcs??=[]).push(npc)}
 }else{npc={};(destination.npcs??=[]).push(npc)}
 Object.assign(npc,{name,role:$('#npcEditRole').value.trim(),note:$('#npcEditNote').value});
 npcEditTarget={markerId:destination.id,npc};save();renderNpcOverview();renderNpcSidebar();$('#deleteSelectedNpc').hidden=false;$('#npcEditTitle').textContent=npc.name;
 const selected=markerById($('#locationId').value);if(selected)renderCityNPCs(selected);
}
function bindNpcOverview(){
 $('#npcOverviewBtn').onclick=openNpcOverview;
 $('#closeNpcOverview').onclick=()=>$('#npcOverviewDialog').close();
 $('#npcSearch').oninput=renderNpcOverview;
 $('#newOverviewNpc').onclick=()=>openNpcForm();
 $('#cancelNpcEdit').onclick=clearNpcSelection;
 $('#npcEditForm').onsubmit=saveNpcOverview;
 $('#sideNewNpc').onclick=()=>openNpcForm();
 $('#quickNpcSearch').oninput=renderNpcSidebar;
 $('#quickNpcResults').addEventListener('click',e=>{const b=e.target.closest('[data-npc-marker]');if(b)openNpcForm(b.dataset.npcMarker,Number(b.dataset.npcIndex))});
 $('#deleteSelectedNpc').onclick=deleteSelectedNpc;
 $('#npcOverviewTable').addEventListener('click',e=>{const b=e.target.closest('[data-edit-npc-location]');if(b)openNpcForm(b.dataset.editNpcLocation,Number(b.dataset.editNpcIndex))});
}

function renderNpcSidebar(){
 const rows=npcOverviewRows($('#quickNpcSearch').value);
 $('#npcCount').textContent=state.markers.reduce((n,m)=>n+(m.npcs||[]).length,0)+' NPC’s';
 $('#sideNewNpc').disabled=!state.markers.length;
 $('#quickNpcResults').innerHTML=rows.map(({marker,npc,index})=>`<button type="button" data-npc-marker="${esc(marker.id)}" data-npc-index="${index}"><strong>${esc(npc.name||'Naamloze NPC')}</strong><span class="small">${esc([npc.role,marker.name].filter(Boolean).join(' · '))}</span></button>`).join('')||'<p class="small">Geen NPC’s gevonden.</p>';
 $('#noSelectedNpc').classList.toggle('hidden',!$('#npcEditForm').hidden);
}
function clearNpcSelection(){npcEditTarget=null;$('#npcEditForm').hidden=true;renderNpcSidebar()}
function deleteSelectedNpc(){
 const target=npcEditTarget,marker=target&&markerById(target.markerId),index=marker?.npcs?.indexOf(target.npc)??-1;
 if(index<0)return;
 if(!confirm(`NPC “${target.npc.name||'Naamloze NPC'}” verwijderen?`))return;
 marker.npcs.splice(index,1);clearNpcSelection();save();renderNpcOverview();
 const selected=markerById($('#locationId').value);if(selected)renderCityNPCs(selected);
}
