// UI-koppelingen en opstarten. Laad als laatste, na alle functiedefinities.
// De volgorde van de bestaande eventregistraties is bewust behouden.

$("#sessionAutoDays").onchange=updateSessionDays;
$("#sessionGameStart").oninput=updateSessionDays;$("#sessionGameEnd").oninput=()=>{$("#sessionAutoDays").checked=true;updateSessionDays()};

bindHarptosUI();
bindImportPreviewUI();
$("#sessionTimeMode").onchange=e=>{$("#sessionAutoDays").checked=e.target.value==="harptos";updateSessionDays()};
$("#sessionGameDays").oninput=updateSessionDays;
$("#sessionStartHalf").onchange=updateSessionDays;$("#sessionEndHalf").onchange=()=>{$("#sessionAutoDays").checked=true;updateSessionDays()};

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

document.querySelectorAll(".tab[data-tab]").forEach(b=>b.onclick=()=>{setRouteOverviewOpen(false,false);$("#locationOverviewModal").classList.add("hidden");showDetailPane(b.dataset.tab);render()});


bindSessionEditorUI();

$("#sideMarkerBtn").onclick=()=>{placingExtraCityMarker=false;if(!runtimeImage)return alert("Selecteer eerst een kaart.");drawing=false;insertMode=false;mode="marker";render()};
$("#sideCalibrateBtn").onclick=()=>{if(!runtimeImage)return alert("Selecteer eerst een kaart.");$("#campaignSettingsDialog").close();$("#calibrateBtn").click()};
$("#sideExportBtn").onclick=()=>$("#exportBtn").click();

bindLocationEditorUI();

bindLogExportUI();

$("#projectMenuBtn").onclick=e=>{e.stopPropagation();$("#projectMenu").classList.toggle("hidden");$("#projectMenuBtn").setAttribute("aria-expanded",String(!$("#projectMenu").classList.contains("hidden")))};
document.addEventListener("click",e=>{if(!e.target.closest(".dropdown"))$("#projectMenu").classList.add("hidden")});

$("#cancelNewCampaignBtn").onclick=()=>$("#newCampaignDialog").close();
$("#newCampaignDialog").addEventListener("cancel",e=>{if(creatingCampaign)e.preventDefault()});
$("#newCampaignForm").onsubmit=async e=>{
 e.preventDefault();if(creatingCampaign)return;
 let name=$("#newCampaignName").value.trim();
 if(!name){$("#newCampaignError").textContent="Vul een naam in.";return}
 creatingCampaign=true;$("#createCampaignBtn").disabled=true;$("#cancelNewCampaignBtn").disabled=true;
 try{await createCampaign(name,newProjectKind);$("#newCampaignDialog").close();$("#campaignSettingsDialog").showModal()}
 catch(err){console.error(err);$("#newCampaignError").textContent="Aanmaken is niet gelukt. Controleer of lokale browseropslag beschikbaar is en probeer opnieuw."}
 finally{creatingCampaign=false;$("#createCampaignBtn").disabled=false;$("#cancelNewCampaignBtn").disabled=false}
};
$("#campaignSettingsBtn").onclick=()=>{
 if(!activeCampaignId)return;
 $("#projectMenu").classList.add("hidden");$("#campaignSettingsDialog").showModal();
};
$("#closeCampaignSettingsBtn").onclick=()=>$("#campaignSettingsDialog").close();
$("#projectName").onchange=e=>{state.projectName=(e.target.value||"").trim()||"Fantasy Campaign";e.target.value=state.projectName;save();render()};
$("#newProjectBtn").onclick=()=>newProject();$("#homeNewCampaignBtn").onclick=()=>newProject();$("#homeNewCityBtn").onclick=()=>newProject("city");
$("#closeEmptyState").onclick=()=>{onboardingDismissed=true;$("#emptyState").classList.add("hidden")};

$("#campaignsBtn").onclick=showCampaignHome;
$("#importAllCampaignsBtn").onclick=()=>$("#importAllCampaignsInput").click();

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
$("#campaignGrid").onclick=async e=>{let b=e.target.closest("button");if(!b)return;if(b.dataset.open)await loadCampaign(b.dataset.open);if(b.dataset.dup)await duplicateCampaign(b.dataset.dup);if(b.dataset.del){let rec=await dbGet(b.dataset.del),name=rec?.data?.projectName||"";if(confirm(`Kaart “${name}” verwijderen uit deze browser? Exporteer eerst een backup als je hem wilt bewaren.`)){await dbDelete(b.dataset.del);if(activeCampaignId===b.dataset.del){activeCampaignId=null;revokeRuntimeImage();runtimeImageBlob=null;map.removeAttribute("src");svg.innerHTML=""}await renderCampaignHome()}}};
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
  else{render();await renderCampaignHome();$("#campaignHome").classList.remove("hidden");syncCampaignHeader()}
 }catch(e){
  console.error(e);render();$("#campaignHome").classList.remove("hidden");syncCampaignHeader();setSaveStatus("Opslagfout",true);
  alert("De lokale browseropslag kon niet worden geopend. Projectbestanden kunnen nog wel handmatig worden gebruikt.");
 }
})();
document.addEventListener("keydown",e=>{
 if(e.key!=="Escape")return;
 if(!$("#hourEditor").classList.contains("hidden"))return;
 if(dmTool||dmDraft){stopDM();return}
 if(partyDrag||mode==="party"){cancelMapAction();return}
 if(routeOverviewOpen){setRouteOverviewOpen(false);return}
 if(mode==="moveLocation"){cancelLocationMove();return}
 ["#locationModal","#sessionModal","#logModal","#playerMapModal","#locationOverviewModal","#routeOverviewPanel"].forEach(sel=>$(sel)?.classList.add("hidden"));
 if(mode==="marker"||mode==="insert"||mode==="calibrate"||mode==="cityMeasure"){mode="pan";insertMode=false;calibratePts=[];render()}
});

bindPlayerMapUI();

// Travel records reuse the existing sessions array so old backups retain all fields.
$('#travelFrom').oninput=renderLogbook;$('#travelUntil').oninput=renderLogbook;
$('#logModal').onclick=e=>{if(e.target===$('#logModal')){$('#logModal').classList.add('hidden');return}let mapBtn=e.target.closest('[data-travel-map]');if(mapBtn){let s=state.sessions.find(x=>x.id===mapBtn.dataset.travelMap),routes=(s?.routeIds||[]).map(routeById).filter(Boolean),points=routes.flatMap(r=>r.points||[]);if(!points.length||!runtimeImage){mapBtn.textContent='Geen kaart/route beschikbaar';return}cancelMapAction();routes.forEach(r=>r.visible=true);selectMapRoute(routes[0].id);let xs=points.map(p=>p.x),ys=points.map(p=>p.y),minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys);let z=Math.max(.08,Math.min(3,stage.clientWidth*.8/Math.max(1,maxX-minX),stage.clientHeight*.7/Math.max(1,maxY-minY)));state.view={z,x:stage.clientWidth/2-(minX+maxX)/2*z,y:stage.clientHeight/2-(minY+maxY)/2*z};$('#logModal').classList.add('hidden');render();save();return}let edit=e.target.closest('[data-editsession]');if(edit)openHourlyEditor(edit.dataset.editsession)};


bindOverviewUI();

$('#iconSize').onchange=e=>{state.iconSize=Number(e.target.value);save();render()};
$('#transport').onchange=e=>{const r=activeRoute();if(r){r.log.transport=e.target.value||'Lopend';if(r.log.pacePreset==='custom')r.log.pacePreset='normal';applyTransportPace(r);save();render()}};
$('#campaignCalendar').onchange=e=>{state.calendar=e.target.value;$('#travelFrom').value='';$('#travelUntil').value='';save();render()};
$('#placePartyBtn').onclick=()=>{if(!runtimeImage)return alert('Laad eerst een kaart.');cancelMapAction();mode='party';$('#partySettingsDialog').close();render()};
$('#removePartyBtn').onclick=()=>{state.party=null;save();render()};

$('#routePalette').onchange=e=>$('#routeColor').oninput(e);
$('#iconEmphasis').onchange=e=>{state.iconEmphasis=e.target.checked;save();render()};

bindLocalExportAssets();

$('#mapFullBtn').onclick=e=>{e.stopPropagation();fit()};
$('#aboutBtn').onclick=()=>$('#aboutDialog').showModal();$('#closeAboutBtn').onclick=()=>$('#aboutDialog').close();

bindDMUI();

$('#routeFollowRoads').onchange=e=>{const r=activeRoute();if(!r)return;r.log.followRoads=e.target.checked;r.log.roadRoutingStatus='';state.followRoads=e.target.checked;save();render()};

// Keep native file pickers keyboard accessible from the campaign menu.
$("#chooseMapMenuBtn").onclick=()=>$("#imageInput").click();
$("#brandHome").onclick=()=>isCity()?openSettingsDialog("campaignSettingsDialog"):$("#logbookBtn").click();
const openCampaignLogbook=$("#logbookBtn").onclick;
$("#logbookBtn").onclick=()=>{$("#projectMenu").classList.add("hidden");$("#projectMenuBtn").setAttribute("aria-expanded","false");openCampaignLogbook()};
$("#importCampaignMenuBtn").onclick=()=>$("#sideImportInput").click();

function openSettingsDialog(id){if(!activeCampaignId)return;$("#projectMenu").classList.add("hidden");$("#projectMenuBtn").setAttribute("aria-expanded","false");$("#"+id).showModal()}
$("#campaignSettingsBtn").onclick=()=>openSettingsDialog("campaignSettingsDialog");
$("#timeSettingsBtn").onclick=()=>openSettingsDialog("timeSettingsDialog");
$("#partySettingsBtn").onclick=()=>openSettingsDialog("partySettingsDialog");
$("#closeTimeSettingsBtn").onclick=()=>$("#timeSettingsDialog").close();
$("#closePartySettingsBtn").onclick=()=>$("#partySettingsDialog").close();

$("#rebuildBoatRouteBtn").onclick=rebuildBoatRoute;

$("#speedViewBtn").onclick=()=>{speedView=!speedView;render()};

$("#defaultTerrainMode").onchange=e=>{state.defaultTerrainMode=["terrain","dnd2014"].includes(e.target.value)?e.target.value:"manual";save();render()};

// PWA is optional. Classic file:// usage never registers a service worker.
(() => {
 let installPrompt=null;
 const report=text=>{for(const id of ['installAppStatus','homeInstallStatus'])$('#'+id).textContent=text};
 const standalone=()=>window.matchMedia?.('(display-mode: standalone)').matches||navigator.standalone;
 const install=async()=>{
  if(standalone()){report('FRM is al als app geopend.');return}
  if(location.protocol==='file:'){report('Installeren kan via de HTTPS-website. Lokale HTML-bestanden blijven via dubbelklikken werken.');return}
  if(installPrompt){const prompt=installPrompt;installPrompt=null;await prompt.prompt();const result=await prompt.userChoice;report(result.outcome==='accepted'?'Installatie aangevraagd.':'Installatie geannuleerd.');return}
  report('Chrome / Edge: kies Installeren in de adresbalk of het browsermenu. Safari op Mac: Archief → Voeg toe aan Dock. Op iPhone/iPad: Deel → Zet op beginscherm. Een geïnstalleerde app kan eigen opslag hebben; zet zo nodig een volledige backup terug.');
 };
 $('#installAppBtn').onclick=install;$('#homeInstallBtn').onclick=install;
 if(typeof window.addEventListener==='function'){
  window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e});
  window.addEventListener('appinstalled',()=>{installPrompt=null;report('FRM is geïnstalleerd.')});
 }
 bindAppUpdates(report);
})();

$('#stopDrawingNow').onclick=cancelMapAction;
$('#homeBackupBtn').onclick=()=>$('#exportAllCampaignsBtn').click();
$('#homeRestoreBtn').onclick=()=>$('#importAllCampaignsBtn').click();
$('#homeExportChooseBtn').onclick=async()=>{await flushSave();const records=await dbGetAll();if(!records.length)return alert('Geen campagnes om te exporteren.');$('#exportCampaignChoice').innerHTML=records.map(rec=>`<option value="${esc(rec.id)}">${esc(rec.data.projectName||'Naamloze campagne')}</option>`).join('');$('#exportCampaignDialog').showModal()};
$('#closeExportChoice').onclick=()=>$('#exportCampaignDialog').close();
$('#downloadCampaignChoice').onclick=async()=>{const rec=await dbGet($('#exportCampaignChoice').value);if(rec){downloadBlob(new Blob([JSON.stringify(campaignExportEnvelope(rec.data))],{type:'application/json'}),'campagne.json');$('#exportCampaignDialog').close()}};
$('#routeColorButtons').onclick=e=>{const b=e.target.closest('[data-color]');if(!b)return;$('#routePalette').value=b.dataset.color;$('#routePalette').dispatchEvent(new Event('change',{bubbles:true}))};
$('#quickLocationSearch').oninput=renderQuickLocations;
$('#quickLocationResults').onclick=e=>{const b=e.target.closest('[data-quick-location]');if(!b)return;const m=markerById(b.dataset.quickLocation);if(!m)return;openLocationEditor(m.id);$('#centerLocationBtn').click()};
const originalCampaignClick=$('#campaignGrid').onclick;
$('#campaignGrid').onclick=async e=>{const b=e.target.closest('[data-save-campaign]');if(!b)return originalCampaignClick(e);await flushSave();const rec=await dbGet(b.dataset.saveCampaign);if(rec)downloadBlob(new Blob([JSON.stringify(campaignExportEnvelope(rec.data))],{type:'application/json'}),'campagne.json')};

bindBinaryBackups();

// Native details menus support keyboard activation; close after action or Escape.
document.addEventListener('click',e=>{document.querySelectorAll('.campaignMore[open],.homeActionMenu[open]').forEach(menu=>{if(!menu.contains(e.target)||e.target.closest('button'))menu.removeAttribute('open')})});
document.addEventListener('keydown',e=>{if(e.key==='Escape')document.querySelectorAll('.campaignMore[open],.homeActionMenu[open]').forEach(menu=>{menu.removeAttribute('open');menu.querySelector('summary')?.focus()})});

fillHourOptions(["hourStartHour", "hourDailyStart"]);
bindHourlyUI();

$('#rebuildLandRouteBtn').onclick=rebuildLinkedRoute;

fillHourOptions(["timelineHour", "timelineDailyStart"]);
bindTimelineSettings();

fillHourOptions(["activityEndHour"]);

// Shared 24-hour selector: keep all timeline and session controls consistent.
function fillHourOptions(ids) {
 const options = Array.from({ length: 24 }, (_, hour) =>
  `<option value="${hour}">${String(hour).padStart(2, "0")}:00</option>`
 ).join("");
 for (const id of ids) $("#" + id).innerHTML = options;
}

bindCityUI();
bindNpcOverview();
bindCityExtensions();
bindCityCategories();


// Updates change only the app shell, never campaign storage.
bindMapConnections();
$('#extraCityMarkerBtn').onclick=()=>{if(!isCity())return;$('#sideMarkerBtn').click();if(mode==='marker')placingExtraCityMarker=true};
function bindAppUpdates(report){
 const button=$('#homeUpdateBtn');
 if(typeof location==='undefined'||location.protocol==='file:'||!window.isSecureContext||!('serviceWorker' in navigator)){
  button.onclick=()=>report('Automatisch bijwerken werkt op de HTTPS-website. Open bij een lokale download index.html uit de nieuwe versie.');
  return;
 }
 const sw=navigator.serviceWorker;
 let registration=null,applying=false,checking=false;
 const ready=()=>{button.hidden=!registration?.waiting;if(!applying){button.textContent=registration?.waiting?'Nieuwe versie — Bijwerken':'Controleren op updates';button.classList.toggle('primary',!!registration?.waiting)}};
 const observe=()=>{
  ready();
  const worker=registration.installing;
  if(worker)worker.addEventListener('statechange',()=>{
   if(worker.state==='installed'){ready();if(registration.waiting)report('Nieuwe versie beschikbaar. Klik op Bijwerken; je kaarten blijven bewaard.');}
  });
 };
 sw.addEventListener('controllerchange',()=>{if(applying)location.reload()});
 const registrationPromise=sw.register('./sw.js',{scope:'./',updateViaCache:'none'}).then(reg=>{
  registration=reg;reg.addEventListener('updatefound',observe);observe();return reg;
 }).catch(()=>{report('Updates controleren lukt nu niet. Probeer opnieuw wanneer je online bent.');return null});
 let lastCheck=0;
 const autoCheck=async()=>{if(applying||Date.now()-lastCheck<60000)return;lastCheck=Date.now();try{const reg=await registrationPromise;if(reg){await reg.update();observe()}}catch(e){/* Offline: try again on focus or reconnect. */}};
 window.addEventListener('focus',autoCheck);window.addEventListener('online',autoCheck);
 setInterval(autoCheck,15*60*1000);autoCheck();
 button.onclick=async()=>{
  if(applying||checking)return;
  checking=true;button.disabled=true;
  try{
   registration=await registrationPromise;
   if(!registration){report('Heropen de website wanneer je online bent om updates te controleren.');return;}
   if(!registration.waiting){
    await registration.update();observe();
    report(registration.waiting?'Nieuwe versie beschikbaar. Klik op Bijwerken.':registration.installing?'Nieuwe versie wordt gedownload. De knop verandert zodra deze klaarstaat.':'Geen nieuwe versie gevonden.');
    return;
   }
   // The control is on the home screen: no open editor may lose a draft.
   if(document.querySelector('dialog[open]')){report('Sluit eerst het geopende venster en bewaar je wijzigingen.');return;}
   if(await flushSave()===false){report('Bijwerken gestopt: je wijzigingen konden niet worden opgeslagen. Maak eerst een backup.');return;}
   const worker=registration.waiting;
   if(!worker){report('De update is intussen verwerkt. Open de website opnieuw.');return;}
   applying=true;button.textContent='Bijwerken…';
   const result=await new Promise((resolve,reject)=>{
    const channel=new MessageChannel();
    const timer=setTimeout(()=>{channel.port1.close();reject(new Error('timeout'))},12000);
    channel.port1.onmessage=e=>{clearTimeout(timer);channel.port1.close();resolve(e.data)};
    worker.postMessage({type:'FRM_APPLY_UPDATE'},[channel.port2]);
   });
   if(!result?.ok){applying=false;report('Sluit eerst andere FRM-tabbladen en de geïnstalleerde app. Klik daarna hier opnieuw op Bijwerken.');}
  }catch(e){applying=false;report('Bijwerken is niet gelukt. Je saves zijn niet gewist. Probeer opnieuw wanneer je online bent.');}
  finally{checking=false;if(!applying){button.disabled=false;ready()}}
 };
}
