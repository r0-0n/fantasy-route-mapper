// Locaties zoeken, bewerken, plaatsen en verplaatsen.
// Klassiek script: gedeelde globale scope; laadvolgorde staat in index.html.


function filteredSortedMarkers(){
 let q=($("#locationSearch")?.value||"").trim().toLowerCase(),f=$("#locationTypeFilter")?.value||"all",sort=$("#locationSort")?.value||"name";
 let rows=state.markers.filter(m=>!isLooseMarker(m)&&(f==="all"||m.type===f)&&(!q||[m.name,m.type,isCity()?cityCategory(m.type):'',m.description,m.notes,m.owner,...(m.npcs||[]).flatMap(n=>[n.name,n.role,n.note])].some(v=>(v||"").toLowerCase().includes(q))));
 rows.sort((a,b)=>{
  if(sort==="type")return String(a.type||"").localeCompare(String(b.type||""))||String(a.name||"").localeCompare(String(b.name||""));
  if(sort==="recent")return state.markers.indexOf(b)-state.markers.indexOf(a);
  return String(a.name||"").localeCompare(String(b.name||""),undefined,{numeric:true})
 });
 return rows
}

function openLocationEditor(id){
 partySelected=false;
 let m=state.markers.find(x=>x.id===id);if(!m)return;if(isLooseMarker(m)){openLooseMarker(id);return;}
 clearRouteSelection();
 syncLocationTypes();selectCityType(m.type);$("#cityLabelMode").value=["show","hover","hide"].includes(m.labelMode)?m.labelMode:"show";
 $("#locationVisible").checked=m.visible!==false;$("#locationShowName").checked=m.labelMode!=="hide";$("#locationId").value=m.id;$("#locationName").value=m.name||"";$("#locationType").value=m.type||"Landmark";$("#locationDescription").value=locationNotesText(m);$("#locationNotes").value="";
 if(isCity()){$("#locationDescription").value=locationNotesText(m);$("#locationOwner").value=m.owner||"";renderCityNPCs(m)}
 $('#locationCategoryDisclosure').open=!m.type||['Overig','Custom'].includes(m.type);$('#locationCategorySummary').textContent=m.type?locationCategory(m.type)+' · '+cityTypeLabel(m.type):'Categorie kiezen';
 selectedLocationId=id;refreshMapLinks();showDetailPane("placesPane");$("#locationOverviewModal").classList.add("hidden");$("#noSelectedLocation").classList.add("hidden");
 $("#locationEditorTitle").textContent=m.name||"Locatie";$("#locationModal").classList.remove("hidden");render();
}

function markerById(id){return state.markers.find(m=>m.id===id)||null}

function locationName(id,fallback=""){let m=markerById(id);return m?m.name:fallback}

function findLocationByName(name){let n=(name||"").trim().toLowerCase();return state.markers.find(m=>(m.name||"").trim().toLowerCase()===n)||null}

function centerOnLocation(id){
 let m=markerById(id);if(!m||!runtimeImage)return;
 if(!isCity()){m.visible=true;save()}else{cityHiddenTypes.delete(m.type);cityHiddenTypes.delete(cityCategory(m.type));if(m.visible===false)openLocationEditor(id)}selectedLocationId=id;flashingLocationId=(isCity()||state.iconEmphasis!==false)?id:null;clearTimeout(locationFlashTimer);locationFlashTimer=setTimeout(()=>{flashingLocationId=null;render()},2200);
 let rect=$("#stage").getBoundingClientRect(),z=Math.max(.35,Math.min(3,state.view.z||1));
 state.view.z=z;state.view.x=rect.width/2-m.x*z;state.view.y=rect.height/2-m.y*z;applyView();render()
}

let placingExtraCityMarker=false;
function beginLocationPlacement(p){
 pendingLocationPoint={x:Math.max(0,Math.min(map.naturalWidth,p.x)),y:Math.max(0,Math.min(map.naturalHeight,p.y))};
 mode="pan";render();$("#newLocationName").value="";
 $("#extraMarkerKindField").hidden=!(isCity()&&placingExtraCityMarker);$("#newLocationTitle").textContent=placingExtraCityMarker?"Extra marker plaatsen":"Locatie op deze plek toevoegen";$("#newLocationDialog").showModal();$("#newLocationName").focus();
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
$("#newLocationDialog").addEventListener("close",()=>{pendingLocationPoint=null;placingExtraCityMarker=false});
$("#newLocationForm").onsubmit=e=>{
 e.preventDefault();let name=$("#newLocationName").value.trim();
 if(!name||!pendingLocationPoint)return;
 let m={id:uid(),name,type:isCity()?"Overig":"Landmark",region:"",faction:"",description:"",notes:"",...pendingLocationPoint};
 if(isCity()&&placingExtraCityMarker)m.type=$('#extraMarkerKind').value==='Tijdelijke plek'?'Tijdelijke plek':'Persoon (marker)';m.labelMode=(isCity()?state.cityDefaultLabelMode:state.defaultLabelMode)||'show';pendingLocationPoint=null;state.markers.push(m);$("#newLocationDialog").close();
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
 $("#locationCount").textContent=`${state.markers.filter(m=>!isLooseMarker(m)).length} ${state.markers.filter(m=>!isLooseMarker(m)).length===1?"locatie":"locaties"}`;
 if(!selectedLocationId||!markerById($("#locationId").value)){$("#locationModal").classList.add("hidden");$("#noSelectedLocation").classList.remove("hidden")}
 const rows=filteredSortedMarkers();
 $('#markerList').innerHTML=`<div class="travelTableWrap"><table class="travelTable"><thead><tr>${['Locatie','Type',...(isCity()?['NPC’s']:[]),'Omschrijving','Acties'].map(x=>`<th scope="col">${x}</th>`).join('')}</tr></thead><tbody>${rows.map(m=>`<tr data-marker="${esc(m.id)}"><td><button data-editmarker="${esc(m.id)}">${esc(m.name||'Naamloze locatie')}</button></td><td><img class="locationTypeIcon" src="${locationIcon(m.type)}" alt=""> ${esc(isCity()?cityTypeDescription(m.type):m.type||'Landmark')}</td>${isCity()?`<td>${(m.npcs||[]).map(n=>esc(n.name||'Naamloze NPC')).join(', ')||'—'}</td>`:''}<td>${esc(m.description||'—')}</td><td><button data-editmarker="${esc(m.id)}">Bewerken</button> <button data-gomarker="${esc(m.id)}" ${runtimeImage?'':'disabled'}>Toon op kaart</button></td></tr>`).join('')||'<tr><td colspan="4">Geen locaties gevonden.</td></tr>'}</tbody></table></div>`;
}
function openLocationOverview(){
 setRouteOverviewOpen(false,false);$('#logModal').classList.add('hidden');render();$('#locationOverviewModal').classList.remove('hidden');$('#locationSearch').focus();
}
function saveLocationDetails(){
 const m=markerById($('#locationId').value);if(!m)return;
 m.visible=$('#locationVisible').checked;m.labelMode=isCity()?$('#cityLabelMode').value:$('#locationShowName').checked?'show':'hide';m.name=$('#locationName').value;m.type=$('#locationType').value;$('#locationCategorySummary').textContent=locationCategory(m.type)+' · '+cityTypeLabel(m.type);m.description=$('#locationDescription').value;m.notes='';if(isCity())setLocationOwner(m,$('#locationOwner').value);
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
 for(const id of ['locationVisible','locationShowName','locationName','locationType','locationDescription','locationNotes','locationOwner','cityLabelMode'])$('#'+id).addEventListener('input',saveLocationDetails);
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
 $('#quickLocationResults').innerHTML=query?state.markers.filter(m=>!isLooseMarker(m)&&locationMatchesSearch(m,query)).slice(0,12).map(m=>`<button type="button" data-quick-location="${esc(m.id)}">${esc(m.name)}${isCity()&&m.visible===false?' · verborgen':''}</button>`).join('')||'<p class="small">Geen locaties gevonden.</p>':'';
}
function locationNotesText(marker){return [marker.description,marker.notes].filter(Boolean).join('\n\n')}
function renderCityNPCs(marker){
 normalizeCityNpcs(state);renderOwnerChoices(marker);
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
 normalizeCityNpcs(state);const seen=new Set();
 return state.markers.filter(m=>!isLooseMarker(m)).flatMap(marker=>(marker.npcs||[]).map((npc,index)=>({marker,npc,index}))).filter(row=>{if(seen.has(row.npc.id))return false;seen.add(row.npc.id);return true})
  .filter(({marker,npc})=>!query||[...npcLocations(npc).map(m=>m.name),npc.name,npc.role,npc.note].some(v=>(v||'').toLocaleLowerCase().includes(query)))
  .sort((a,b)=>(a.npc.name||'').localeCompare(b.npc.name||'', 'nl',{numeric:true}));
}
function renderNpcOverview(){
 const rows=npcOverviewRows();
 $('#newOverviewNpc').disabled=!state.markers.length;
 $('#npcOverviewHint').textContent=state.markers.length?'Eén NPC kan aan meerdere locaties gekoppeld zijn. Wijzigingen gelden voor alle koppelingen.':'Maak eerst een locatie op de kaart om er NPC’s aan toe te voegen.';
 $('#npcOverviewTable').innerHTML=`<table class="travelTable"><thead><tr><th>Naam</th><th>Rol</th><th>Locatie</th><th>Opmerkingen</th><th>Acties</th></tr></thead><tbody>${rows.map(({marker,npc,index})=>`<tr><td>${esc(npc.name||'Naamloze NPC')}</td><td>${esc(npc.role||'—')}</td><td>${npcLocations(npc).map(m=>esc(m.name||'Naamloze locatie')).join(', ')}</td><td class="npcNoteCell">${esc(npc.note||'—')}</td><td><button type="button" data-edit-npc-location="${esc(marker.id)}" data-edit-npc-index="${index}">Bewerken</button></td></tr>`).join('')||'<tr><td colspan="5">Geen NPC’s gevonden.</td></tr>'}</tbody></table>`;
}
function openNpcOverview(){
 if(!isCity())return;
 $('#npcSearch').value='';
 renderNpcOverview();$('#npcOverviewDialog').showModal();$('#npcSearch').focus();
}
function openNpcForm(markerId=null,index=null){
 if(!isCity())return;
 $('#npcOverviewDialog').close();showDetailPane('npcPane');const sidebar=$('aside');if(sidebar)sidebar.scrollTop=0;
 normalizeCityNpcs(state);const marker=markerById(markerId),npc=marker?.npcs?.[index];
 npcEditTarget=npc?{markerId,npc}:null;
 $('#npcEditTitle').textContent=npc?(npc.name||'NPC bewerken'):'NPC toevoegen';
 $('#deleteSelectedNpc').hidden=!npc;$('#noSelectedNpc').classList.add('hidden');
 $('#npcEditLocation').innerHTML=state.markers.filter(m=>!isLooseMarker(m)).sort((a,b)=>(a.name||'').localeCompare(b.name||'','nl')).map(m=>`<option value="${esc(m.id)}">${esc(m.name||'Naamloze locatie')}</option>`).join('');
 if(marker)$('#npcEditLocation').value=marker.id;
 else if(markerById(selectedLocationId))$('#npcEditLocation').value=selectedLocationId;
 $('#npcExtraLocations').innerHTML=state.markers.filter(m=>!isLooseMarker(m)&&m.id!==$('#npcEditLocation').value).map(m=>`<label class="inlineCheck"><input type="checkbox" data-npc-extra="${esc(m.id)}" ${npc&&m.npcs?.includes(npc)?'checked':''}> <span>${esc(m.name)}</span></label>`).join('');
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
 }else{npc={id:uid()};(destination.npcs??=[]).push(npc)}
 Object.assign(npc,{name,role:$('#npcEditRole').value.trim(),note:$('#npcEditNote').value});
 const ids=new Set([destination.id,...Array.from(document.querySelectorAll('[data-npc-extra]:checked')).map(el=>el.dataset.npcExtra)]);
 for(const m of state.markers){m.npcs=(m.npcs||[]).filter(n=>n.id!==npc.id);if(ids.has(m.id))m.npcs.push(npc);if(m.ownerNpcId===npc.id){if(ids.has(m.id))m.owner=npc.name;else{delete m.ownerNpcId;m.owner=''}}}
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
 $('#npcCount').textContent=npcOverviewRows('').length+' NPC’s';
 $('#sideNewNpc').disabled=!state.markers.length;
 $('#quickNpcResults').innerHTML=!$('#quickNpcSearch').value.trim()?'':rows.slice(0,8).map(({marker,npc,index})=>`<button type="button" data-npc-marker="${esc(marker.id)}" data-npc-index="${index}"><strong>${esc(npc.name||'Naamloze NPC')}</strong><span class="small">${esc([npc.role,marker.name].filter(Boolean).join(' · '))}</span></button>`).join('')||'<p class="small">Geen NPC’s gevonden.</p>';
 if($('#quickNpcSearch').value.trim()&&rows.length>8)$('#quickNpcResults').innerHTML+=`<p class="small">8 van ${rows.length} resultaten. Verfijn je zoekopdracht of open het NPC-overzicht.</p>`;
 $('#noSelectedNpc').classList.toggle('hidden',!$('#npcEditForm').hidden);
}
function clearNpcSelection(){npcEditTarget=null;$('#npcEditForm').hidden=true;renderNpcSidebar()}
function deleteSelectedNpc(){
 const target=npcEditTarget,marker=target&&markerById(target.markerId),index=marker?.npcs?.indexOf(target.npc)??-1;
 if(index<0)return;
 if(!confirm(`NPC “${target.npc.name||'Naamloze NPC'}” verwijderen?`))return;
 for(const m of state.markers){m.npcs=(m.npcs||[]).filter(n=>n.id!==target.npc.id);if(m.ownerNpcId===target.npc.id){delete m.ownerNpcId;m.owner=''}}clearNpcSelection();save();renderNpcOverview();
 const selected=markerById($('#locationId').value);if(selected)renderCityNPCs(selected);
}

// City-only display state is transient; it never enters projectData or backups.
let cityHiddenTypes=new Set(),cityHoverId=null,cityMeasurePoints=[];
function cityWalkSettings(data=state){
 const v=data.cityWalk||{},speed=Number(v.speedKmh),factor=Number(v.routeFactor);
 return {speedKmh:Number.isFinite(speed)&&speed>=.1&&speed<=100?speed:5,routeFactor:Number.isFinite(factor)&&factor>=1&&factor<=10?factor:1.3};
}
function resetCityView(){cityHiddenTypes.clear();cityHoverId=null;cityMeasurePoints=[];hideCityTooltip()}
function mapLocationVisible(m){return m.visible!==false&&(!isCity()||!cityHiddenTypes.has(m.type)&&!cityHiddenTypes.has(cityCategory(m.type)))}
function locationMatchesSearch(m,query){
 const values=isCity()?[m.name,m.type,cityCategory(m.type),m.owner,...(m.npcs||[]).flatMap(n=>[n.name,n.role])]:[m.name];
 return values.some(v=>(v||'').toLocaleLowerCase().includes(query));
}
function cityWalkBetween(a,b){
 if(!isCity()||!a||!b||!state.scale||!(state.scale.perPixel>0))return null;
 const unit=state.scale.unit||state.unit||'mi',straightKm=d(a,b)*state.scale.perPixel*(unit==='ft'?0.0003048:unit==='km'?1:1.609344),settings=cityWalkSettings();
 const distanceKm=straightKm*settings.routeFactor;
 return {straightKm,distanceKm,minutes:distanceKm/settings.speedKmh*60};
}
function cityWalkText(result){
 if(!result)return '';
 let minutes=result.minutes<60?Math.round(result.minutes):Math.round(result.minutes/5)*5;
 return '± '+(minutes>=60?Math.floor(minutes/60)+' uur'+(minutes%60?' '+minutes%60+' min':''):minutes+' min')+' lopen';
}
function syncCityExtensions(){
 const city=isCity();$('#feetUnitOption').hidden=!city;$('#extraCityMarkerBtn').hidden=!city;$('#cityPartyBtn').hidden=!city||!!state.party;$('#cityPartyBtn').textContent=state.party?'Party verplaatsen':'Party plaatsen';$('#cityAllLabelSettings').hidden=false;$('#cityAllLabels').checked=(city?state.cityDefaultLabelMode:state.defaultLabelMode)!=='hide';$('#cityAllLabels').indeterminate=state.markers.some(m=>m.labelMode==='hide')&&state.markers.some(m=>m.labelMode!=='hide');for(const id of ['cityWalkSettings','cityFilterControls','cityLabelControls'])$('#'+id).hidden=!city;
 $('#cityMeasureControls').hidden=true;$('#cityCategoryField').hidden=false;$('#worldNameToggle').hidden=city;$('#locationTypeCaption').textContent='Subcategorie';
 if(!city)return;
 const settings=cityWalkSettings();$('#cityRouteFactor').value=settings.routeFactor;$('#cityWalkSpeed').value=settings.speedKmh;
 const types=Object.keys(CITY_CATEGORIES);$('#cityShowAllTypes').textContent=types.every(t=>!cityHiddenTypes.has(t))?'Alle typen verbergen':'Alle typen tonen';
 $('#cityTypeFilters').innerHTML=types.map(t=>`<label class="inlineCheck"><input type="checkbox" data-city-type="${esc(t)}" ${cityHiddenTypes.has(t)?'':'checked'}><span>${esc(t)}</span></label>`).join('');
}
function renderCityWalkInfo(){
 const el=$('#cityLocationWalk'),m=markerById(selectedLocationId);el.hidden=!isCity()||!m||!state.party;
 if(el.hidden)return;
 const result=cityWalkBetween(state.party,m);el.textContent=result?cityWalkText(result)+' · ca. '+result.distanceKm.toLocaleString('nl-NL',{maximumFractionDigits:1})+' km (inschatting)':'Stel de kaartschaal in om de looptijd vanaf de party te schatten.';
}
function refreshCityHoverLabels(){svg.querySelectorAll('[data-location-label]').forEach(el=>{const m=markerById(el.dataset.locationLabel);el.style.display=locationLabelVisible(m)?'':'none'})}
function hideCityTooltip(){cityHoverId=null;const el=$('#cityLocationTooltip');if(el)el.hidden=true;if(isCity())refreshCityHoverLabels()}
function bindCityMarkerHover(group,m){
 group.addEventListener('pointerenter',e=>{
  if(!mapLocationVisible(m)||partyDrag||pan)return;
  cityHoverId=m.id;if(isCity())refreshCityHoverLabels();const el=$('#cityLocationTooltip'),walk=cityWalkBetween(state.party,m);
  const note=locationNotesText(m).replace(/\s+/g,' ').slice(0,125);
  el.innerHTML=`<strong>${esc(m.name||'Locatie')}</strong><span>${esc(cityTypeDescription(m.type))}</span>${m.owner?`<span>${esc(m.owner)}, eigenaar / beheerder</span>`:''}${note?`<span>${esc(note)}</span>`:''}${walk?`<strong>${esc(cityWalkText(walk))}</strong><small>Geschat, zonder straten te volgen</small>`:''}`;
  if(!isCity())el.innerHTML=worldLocationHoverText(m).split('\n').map((line,i)=>i===0?`<strong>${esc(line)}</strong>`:`<span>${esc(line)}</span>`).join('');
  el.hidden=false;const rect=stage.getBoundingClientRect();el.style.left=Math.max(8,Math.min(rect.width-260,e.clientX-rect.left+14))+'px';el.style.top=Math.max(8,Math.min(rect.height-190,e.clientY-rect.top+14))+'px';
 });
 group.addEventListener('pointerleave',hideCityTooltip);
}
function cityMeasureClick(point){
 if(cityMeasurePoints.length>=2)cityMeasurePoints=[];
 cityMeasurePoints.push(point);if(cityMeasurePoints.length===2)mode='pan';render();
}
function renderCityMeasurement(){
 if(!isCity())return;
 $('#cityMeasureBtn').textContent=mode==='cityMeasure'?'Meten stoppen':'Looptijd meten';
 const result=cityMeasurePoints.length===2?cityWalkBetween(...cityMeasurePoints):null;
 $('#cityMeasureResult').textContent=result?cityWalkText(result)+' · ca. '+result.distanceKm.toLocaleString('nl-NL',{maximumFractionDigits:1})+' km geschatte loopafstand.':mode==='cityMeasure'?'Klik twee punten op de kaart. Escape stopt meten.':'Hemelsbreed meten met routefactor; geen routeplanning.';
 if(cityMeasurePoints.length===2){const [a,b]=cityMeasurePoints,line=document.createElementNS('http://www.w3.org/2000/svg','line');Object.entries({x1:a.x,y1:a.y,x2:b.x,y2:b.y,stroke:'#efdcac','stroke-width':2/state.view.z,'stroke-dasharray':6/state.view.z}).forEach(([k,v])=>line.setAttribute(k,v));line.style.pointerEvents='none';svg.appendChild(line)}
}
function bindCityExtensions(){
 function updateWalk(){
  if(!isCity())return;const speed=Number($('#cityWalkSpeed').value),factor=Number($('#cityRouteFactor').value);
  if(!Number.isFinite(speed)||speed<.1||speed>100||!Number.isFinite(factor)||factor<1||factor>10){$('#cityWalkError').textContent='Kies een loopsnelheid van 0,1–100 km/u en routefactor van 1–10.';return}
  state.cityWalk={speedKmh:speed,routeFactor:factor};$('#cityWalkError').textContent='';save();render();
 }
 $('#cityWalkSpeed').onchange=updateWalk;$('#cityRouteFactor').onchange=updateWalk;
 $('#cityTypeFilters').addEventListener('change',e=>{const type=e.target.dataset.cityType;if(!isCity()||!type)return;e.target.checked?cityHiddenTypes.delete(type):cityHiddenTypes.add(type);render()});
 $('#cityShowAllTypes').onclick=()=>{const all=Object.keys(CITY_CATEGORIES).every(t=>!cityHiddenTypes.has(t));cityHiddenTypes.clear();if(all)Object.keys(CITY_CATEGORIES).forEach(t=>cityHiddenTypes.add(t));render()};
 $('#cityMeasureBtn').onclick=()=>{if(mode==='cityMeasure'){mode='pan';render();return}if(!runtimeImage||!state.scale)return alert('Laad een kaart en stel eerst de schaal in via de kaartinstellingen.');cancelMapAction();cityMeasurePoints=[];mode='cityMeasure';render()};
 stage.addEventListener('pointerleave',hideCityTooltip);
}

function cityCategory(type){return Object.keys(CITY_CATEGORIES).find(group=>CITY_CATEGORIES[group].includes(type))||'Overig'}
function cityTypeLabel(type){return String(type||'Overig').endsWith(' · Overig')?'Overig':type||'Overig'}
function cityTypeDescription(type){const group=cityCategory(type);return group==='Overig'?cityTypeLabel(type):group+' · '+cityTypeLabel(type)}
function cityTypeOptions(group,type=null){
 const categories=locationCategories();const types=[...(categories[group]||categories.Overig)];if(type&&!types.includes(type))types.push(type);
 return types.map(t=>`<option value="${esc(t)}">${esc(cityTypeLabel(t))}</option>`).join('');
}
function selectCityType(type){
 const group=locationCategory(type);$('#cityLocationCategory').innerHTML=Object.keys(locationCategories()).map(g=>`<option>${esc(g)}</option>`).join('');$('#cityLocationCategory').value=group;
 $('#locationType').innerHTML=cityTypeOptions(group,type);$('#locationType').value=type||'Overig';
}
function migrateCityType(marker){
 const old={Winkel:'Algemene winkel',Gilde:'Gilden · Overig',Bestuur:'Bestuur · Overig',Bezienswaardigheid:'Bezienswaardigheden · Overig'};
 if(old[marker.type])marker.type=old[marker.type];
}
function bindCityCategories(){
 $('#cityLocationCategory').onchange=()=>{
  const group=$('#cityLocationCategory').value;
  $('#locationType').innerHTML=cityTypeOptions(group);
  // Choosing a group should not silently claim a specific kind of building.
  $('#locationType').value=isCity()?(group==='Overig'?'Overig':group+' · Overig'):locationCategories()[group][0];
  saveLocationDetails();
 };
}

function locationCategories(){return isCity()?CITY_CATEGORIES:WORLD_CATEGORIES}
function locationCategory(type){return Object.keys(locationCategories()).find(g=>locationCategories()[g].includes(type))||'Overig'}
function worldTypeIcon(type){
 const group=Object.keys(WORLD_CATEGORIES).find(g=>WORLD_CATEGORIES[g].includes(type));
 const icons={'Nederzettingen':'City','Vestingwerken':'Stronghold','Kerkers':'Dungeon','Wildernis':'Landmark','Water':'Landmark','Grotten':'Cave','Kampen':'Camp','Ruïnes':'Ruin','Bezienswaardigheden':'Landmark','Ontmoetingen':'Encounter','Reizen':'Landmark','Overig':'Custom'};
 return LOCATION_ICONS[type==="Village / Inn"?"Village":type==="Ruins"?"Ruin":type]||LOCATION_ICONS[icons[group]];
}


// Shared NPC identity stays within the existing location records. Old NPCs
// receive independent ids; matching names are never merged automatically.
function normalizeCityNpcs(data){
 if(data.kind!=='city')return;
 const byId=new Map();
 for(const m of data.markers||[]){
  m.npcs=(m.npcs||[]).map(n=>{if(!n.id)n.id=uid();if(!byId.has(n.id))byId.set(n.id,n);return byId.get(n.id)});
  if(m.ownerNpcId){const owner=m.npcs.find(n=>n.id===m.ownerNpcId);if(owner)m.owner=owner.name;else delete m.ownerNpcId}
 }
}
function npcLocations(npc){return state.markers.filter(m=>(m.npcs||[]).some(n=>n.id===npc.id))}
function renderOwnerChoices(marker){
 const legacy=marker.owner&&!marker.ownerNpcId?`<option value="${esc(marker.owner)}">${esc(marker.owner)} (bestaand)</option>`:'';
 $('#locationOwner').innerHTML='<option value="">Geen eigenaar gekozen</option>'+legacy+(marker.npcs||[]).map(n=>`<option value="npc:${esc(n.id)}">${esc(n.name)}</option>`).join('');
 $('#locationOwner').value=marker.ownerNpcId?'npc:'+marker.ownerNpcId:marker.owner||'';
 $('#linkExistingNpc').innerHTML='<option value="">Kies een NPC…</option>'+npcOverviewRows('').filter(r=>!marker.npcs?.some(n=>n.id===r.npc.id)).map(r=>`<option value="${esc(r.npc.id)}">${esc(r.npc.name)} · ${esc(r.marker.name)}</option>`).join('');
}
function setLocationOwner(marker,value){
 const npc=(marker.npcs||[]).find(n=>'npc:'+n.id===value);
 if(npc){marker.ownerNpcId=npc.id;marker.owner=npc.name}else{delete marker.ownerNpcId;marker.owner=value}
}
function bindMapConnections(){
 $('#cityAllLabels').onchange=()=>{const labelMode=$('#cityAllLabels').checked?'show':'hide';if(isCity())state.cityDefaultLabelMode=labelMode;else state.defaultLabelMode=labelMode;state.markers.forEach(m=>m.labelMode=labelMode);$('#cityLabelMode').value=labelMode;$('#locationShowName').checked=labelMode==='show';save();render()};
 $('#linkExistingNpcBtn').onclick=()=>{if(!isCity())return;const m=markerById($('#locationId').value),npc=npcOverviewRows('').find(r=>r.npc.id===$('#linkExistingNpc').value)?.npc;if(m&&npc&&!m.npcs?.includes(npc)){(m.npcs??=[]).push(npc);save();renderCityNPCs(m);render()}};
 $('#linkedCitySelect').onchange=()=>{const m=markerById(selectedLocationId);if(!m||isCity())return;m.linkedCityId=$('#linkedCitySelect').value;save();refreshMapLinks()};
 $('#openLinkedCity').onclick=async()=>{const m=markerById(selectedLocationId);if(!m?.linkedCityId)return;const rec=await dbGet(m.linkedCityId);if(!rec||rec.data.kind!=='city'){alert('Deze stadskaart is niet beschikbaar. Koppel een bestaande stadskaart.');return}if(await flushSave()===false)return;cityReturnOrigins.set(rec.id,{id:activeCampaignId,markerId:m.id});await loadCampaign(rec.id)};
 $('#worldReturnSelect').onchange=()=>{const value=JSON.parse($('#worldReturnSelect').value||'null');if(value)cityReturnOrigins.set(activeCampaignId,value)};
 $('#returnToWorld').onclick=async()=>{const selected=JSON.parse($('#worldReturnSelect').value||'null');if(!selected)return;if(await flushSave()===false)return;if(await loadCampaign(selected.id))openLocationEditor(selected.markerId)};
}
const cityReturnOrigins=new Map();
async function refreshMapLinks(){
 const campaign=activeCampaignId,city=isCity(),markerId=selectedLocationId;
 $('#linkedCityControls').hidden=city||!markerId;$('#worldReturnControls').hidden=true;$('#mapNavigation').hidden=true;
 try{
  const records=await dbGetAll();if(campaign!==activeCampaignId||markerId!==selectedLocationId)return;
  if(city){
   const links=records.filter(r=>r.data.kind!=='city').flatMap(r=>(r.data.markers||[]).filter(m=>m.linkedCityId===campaign).map(m=>({id:r.id,markerId:m.id,name:(r.data.projectName||'Wereldkaart')+' · '+m.name})));
   $('#worldReturnControls').hidden=!links.length;$('#mapNavigation').hidden=!links.length;$('#worldReturnSelect').innerHTML=links.map(l=>`<option value="${esc(JSON.stringify({id:l.id,markerId:l.markerId}))}">${esc(l.name)}</option>`).join('');
   const origin=cityReturnOrigins.get(campaign);if(origin&&links.some(l=>l.id===origin.id&&l.markerId===origin.markerId))$('#worldReturnSelect').value=JSON.stringify(origin);
  }else{
   const m=markerById(markerId);if(!m)return;const cities=records.filter(r=>r.data.kind==='city');const found=cities.some(r=>r.id===m.linkedCityId);
   $('#linkedCitySelect').innerHTML='<option value="">Geen stadskaart gekoppeld</option>'+cities.map(r=>`<option value="${esc(r.id)}">${esc(r.data.projectName||'Stadskaart')}</option>`).join('')+(!found&&m.linkedCityId?`<option value="${esc(m.linkedCityId)}">Ontbrekende stadskaart</option>`:'');
   $('#linkedCitySelect').value=m.linkedCityId||'';$('#openLinkedCity').disabled=!found;
   $('#linkedCityStatus').textContent=!found&&m.linkedCityId?'De gekoppelde kaart ontbreekt. Koppel opnieuw of herstel een volledige backup.':cities.length?'Kies een stadskaart uit Mijn kaarten.':'Maak eerst een stadskaart via Mijn kaarten.';
  }
 }catch(e){$('#linkedCityStatus').textContent='Kaarten konden niet worden geladen.'}
}

function isLooseMarker(m){return isCity()&&['Persoon (marker)','Tijdelijke plek'].includes(m.type)}
let looseMarkerDrag=null,looseMarkerEditId=null;
function openLooseMarker(id){const m=markerById(id);if(!m)return;looseMarkerEditId=id;$('#looseMarkerName').value=m.name||'';$('#looseMarkerDialog').showModal()}
function bindLooseMarkers(){
 $('#looseMarkerClose').onclick=()=>$('#looseMarkerDialog').close();
 $('#looseMarkerSave').onclick=()=>{const m=markerById(looseMarkerEditId);if(m)m.name=$('#looseMarkerName').value.trim();save();render();$('#looseMarkerDialog').close()};
 $('#looseMarkerDelete').onclick=()=>{state.markers=state.markers.filter(m=>m.id!==looseMarkerEditId);save();render();$('#looseMarkerDialog').close()};
}
