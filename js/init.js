// UI-koppelingen en opstarten. Laad als laatste, na alle functiedefinities.
// De volgorde van de bestaande eventregistraties is bewust behouden.

$("#sessionAutoDays").onchange=updateSessionDays;
$("#sessionGameStart").oninput=updateSessionDays;$("#sessionGameEnd").oninput=updateSessionDays;

bindHarptosUI();
bindImportPreviewUI();
$("#sessionTimeMode").onchange=e=>{$("#sessionAutoDays").checked=e.target.value==="harptos";updateSessionDays()};
$("#sessionGameDays").oninput=updateSessionTimeSummary;

bindMapInstructionUI();

bindRouteSearchUI();

$("#locationSort").onchange=()=>render();
$("#locationTypeFilter").onchange=()=>render();
bindSessionSearchUI();

bindRouteEditorUI();

$("#markerList").onclick=e=>{let el=e.target.closest("[data-marker]"),go=e.target.dataset.gomarker,edit=e.target.dataset.editmarker;if(go){e.stopPropagation();openLocationEditor(go);centerOnLocation(go);return}let id=edit||el?.dataset.marker;if(id)openLocationEditor(id)};
bindMapControlsUI();

bindLocationPlacementUI();

bindMapPointerUI();

bindCampaignFileUI();

document.querySelectorAll(".tab[data-tab]").forEach(b=>b.onclick=()=>{setRouteOverviewOpen(false,false);$("#locationOverviewModal").classList.add("hidden");showDetailPane(b.dataset.tab)});


bindSessionEditorUI();

$("#sideMarkerBtn").onclick=()=>{if(!runtimeImage)return alert("Selecteer eerst een kaart.");drawing=false;insertMode=false;mode="marker";render()};
$("#sideCalibrateBtn").onclick=()=>{if(!runtimeImage)return alert("Selecteer eerst een kaart.");$("#campaignSettingsDialog").close();$("#calibrateBtn").click()};
$("#sideExportBtn").onclick=()=>$("#exportBtn").click();

bindLocationEditorUI();

bindLogExportUI();

$("#projectMenuBtn").onclick=e=>{e.stopPropagation();$("#projectMenu").classList.toggle("hidden")};
document.addEventListener("click",e=>{if(!e.target.closest(".dropdown"))$("#projectMenu").classList.add("hidden")});

$("#cancelNewCampaignBtn").onclick=()=>$("#newCampaignDialog").close();
$("#newCampaignDialog").addEventListener("cancel",e=>{if(creatingCampaign)e.preventDefault()});
$("#newCampaignForm").onsubmit=async e=>{
 e.preventDefault();if(creatingCampaign)return;
 let name=$("#newCampaignName").value.trim();
 if(!name){$("#newCampaignError").textContent="Vul een campagnenaam in.";return}
 creatingCampaign=true;$("#createCampaignBtn").disabled=true;$("#cancelNewCampaignBtn").disabled=true;
 try{await createCampaign(name);$("#newCampaignDialog").close()}
 catch(err){console.error(err);$("#newCampaignError").textContent="Campagne maken is niet gelukt. Controleer of lokale browseropslag beschikbaar is en probeer opnieuw."}
 finally{creatingCampaign=false;$("#createCampaignBtn").disabled=false;$("#cancelNewCampaignBtn").disabled=false}
};
$("#campaignSettingsBtn").onclick=()=>{
 if(!activeCampaignId)return;
 $("#projectMenu").classList.add("hidden");$("#campaignSettingsDialog").showModal();
};
$("#closeCampaignSettingsBtn").onclick=()=>$("#campaignSettingsDialog").close();
$("#projectName").onchange=e=>{state.projectName=(e.target.value||"").trim()||"Fantasy Campaign";e.target.value=state.projectName;save();render()};
$("#newProjectBtn").onclick=newProject;$("#homeNewCampaignBtn").onclick=newProject;
$("#closeEmptyState").onclick=()=>{onboardingDismissed=true;$("#emptyState").classList.add("hidden")};

$("#campaignsBtn").onclick=showCampaignHome;$("#brandHome").onclick=showCampaignHome;

bindAllCampaignBackupUI();

$("#deleteAllCampaignsBtn").onclick=async()=>{
 let all=await dbGetAll();if(!all.length)return alert("Er zijn geen lokale campagnes om te wissen.");
 let first=confirm(`Alle ${all.length} lokale campagne${all.length===1?"":"s"} en bijbehorende kaarten uit deze browser verwijderen?\n\nMaak eerst een volledige backup als je ze later wilt kunnen herstellen.`);
 if(!first)return;
 if(!confirm("Dit kan niet ongedaan worden gemaakt. Definitief alles wissen?"))return;
 try{
  await deleteAllLocalCampaigns();activeCampaignId=null;state={routes:[],markers:[],sessions:[],view:{x:0,y:0,z:1}};revokeRuntimeImage();runtimeImageBlob=null;map.removeAttribute("src");svg.innerHTML="";
  await renderCampaignHome();alert("Alle lokaal opgeslagen campagnes en kaarten zijn verwijderd.");
 }catch(e){console.error(e);alert("Wissen is niet gelukt.")}
};

$("#duplicateCampaignBtn").onclick=async()=>{if(activeCampaignId){await duplicateCampaign(activeCampaignId);await showCampaignHome()}};
$("#campaignGrid").onclick=async e=>{let b=e.target.closest("button");if(!b)return;if(b.dataset.open)await loadCampaign(b.dataset.open);if(b.dataset.dup)await duplicateCampaign(b.dataset.dup);if(b.dataset.del){let rec=await dbGet(b.dataset.del),name=rec?.data?.projectName||"";if(confirm(`Campagne “${name}” verwijderen uit deze browser? Exporteer eerst een backup als je hem wilt bewaren.`)){await dbDelete(b.dataset.del);if(activeCampaignId===b.dataset.del){activeCampaignId=null;revokeRuntimeImage();runtimeImageBlob=null;map.removeAttribute("src");svg.innerHTML=""}await renderCampaignHome()}}};
bindFullBackupUI();

$("#routeFromLocationBtn").onclick=()=>startRouteFromLocation($("#locationId").value);
$("#centerLocationBtn").onclick=()=>{let id=$("#locationId").value;centerOnLocation(id)};
$("#locationSearch")?.addEventListener("input",()=>render());
$("#clearLocationSearch")?.addEventListener("click",()=>{$("#locationSearch").value="";render()});

$("#sidebarToggle").onclick=()=>setSidebarCollapsed(!sidebarCollapsed);

window.addEventListener("keydown",e=>{if(e.key==="Escape"&&!$("#emptyState").classList.contains("hidden")){onboardingDismissed=true;$("#emptyState").classList.add("hidden")}});
window.onresize=()=>applyView();window.addEventListener("pagehide",()=>{if(activeCampaignId)flushSave()});
(async function startup(){
 try{
  await migrateLegacy();
  setSidebarCollapsed(sidebarCollapsed);
  let list=await campaignList();
  if(list.length===1)await loadCampaign(list[0].id);
  else{render();await renderCampaignHome();$("#campaignHome").classList.remove("hidden")}
 }catch(e){
  console.error(e);render();$("#campaignHome").classList.remove("hidden");setSaveStatus("Opslagfout",true);
  alert("De lokale browseropslag kon niet worden geopend. Projectbestanden kunnen nog wel handmatig worden gebruikt.");
 }
})();
document.addEventListener("keydown",e=>{
 if(e.key!=="Escape")return;
 if(routeOverviewOpen){setRouteOverviewOpen(false);return}
 if(mode==="moveLocation"){cancelLocationMove();return}
 ["#locationModal","#sessionModal","#logModal","#playerMapModal","#locationOverviewModal","#routeOverviewPanel"].forEach(sel=>$(sel)?.classList.add("hidden"));
 if(mode==="marker"||mode==="insert"||mode==="calibrate"){mode="pan";insertMode=false;calibratePts=[];render()}
});

bindPlayerMapUI();

// Travel records reuse the existing sessions array so old backups retain all fields.
$('#travelFrom').oninput=renderLogbook;$('#travelUntil').oninput=renderLogbook;
$('#logModal').onclick=e=>{if(e.target===$('#logModal')){$('#logModal').classList.add('hidden');return}let mapBtn=e.target.closest('[data-travel-map]');if(mapBtn){let s=state.sessions.find(x=>x.id===mapBtn.dataset.travelMap),routes=(s?.routeIds||[]).map(routeById).filter(Boolean),points=routes.flatMap(r=>r.points||[]);if(!points.length||!runtimeImage){mapBtn.textContent='Geen kaart/route beschikbaar';return}cancelMapAction();routes.forEach(r=>r.visible=true);selectMapRoute(routes[0].id);let xs=points.map(p=>p.x),ys=points.map(p=>p.y),minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys);let z=Math.max(.08,Math.min(3,stage.clientWidth*.8/Math.max(1,maxX-minX),stage.clientHeight*.7/Math.max(1,maxY-minY)));state.view={z,x:stage.clientWidth/2-(minX+maxX)/2*z,y:stage.clientHeight/2-(minY+maxY)/2*z};$('#logModal').classList.add('hidden');render();save();return}let edit=e.target.closest('[data-editsession]');if(edit)openSessionEditor(edit.dataset.editsession)};


bindOverviewUI();

$('#iconSize').onchange=e=>{state.iconSize=Number(e.target.value);save();render()};
$('#transport').oninput=e=>{const r=activeRoute();if(r){r.log.transport=e.target.value;save();renderRouteOverview()}};
$('#placePartyBtn').onclick=()=>{if(!runtimeImage)return alert('Laad eerst een kaart.');cancelMapAction();mode='party';$('#campaignSettingsDialog').close();render()};
$('#removePartyBtn').onclick=()=>{state.party=null;save();render()};
