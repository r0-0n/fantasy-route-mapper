// Bestandsimport, downloads, reisoverzichten en spelerskaartkiezer.
// Klassiek script: gedeelde globale scope; laadvolgorde staat in index.html.


function downloadText(filename,text,type){let blob=new Blob([text],{type}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}

function campaignSlug(){return (state.projectName||"fantasy-campaign").replace(/[^a-z0-9]+/gi,"-").replace(/^-|-$/g,"")}

function importProjectFile(f){if(!f)return;let rd=new FileReader();rd.onload=async()=>{try{
 let parsed=JSON.parse(rd.result);if(!await previewImport(parsed,false))return;
 await flushSave();
 let prepared=unwrapCampaignImport(parsed),incoming=prepared.data,legacyImage=prepared.image||null,nid=uid();
 delete incoming.image;incoming.campaignId=nid;incoming.dataVersion=CURRENT_DATA_VERSION;
 // No existing browser record is touched until parsing, migration and validation have succeeded.
 let imageBlob=legacyImage?dataUrlToBlob(legacyImage):null;
 await dbPut({id:nid,data:incoming,imageBlob,meta:metaFor(incoming,nid)});
 state=incoming;activeCampaignId=nid;onboardingDismissed=true;normalize();
 revokeRuntimeImage();runtimeImageBlob=imageBlob;runtimeImage=runtimeImageBlob?URL.createObjectURL(runtimeImageBlob):null;
 $("#campaignHome").classList.add("hidden");if(runtimeImage)setMap(runtimeImage);else{map.removeAttribute("src");render()}
 renderLogbook();render();setSaveStatus("Opgeslagen");
}catch(err){console.error(err);alert("Importeren is niet gelukt. "+(err?.message||"Het bestand is ongeldig.")+" Bestaande campagnes zijn niet gewijzigd.")}};rd.readAsText(f)}

function renderPlayerMapPicker(){
 let rl=$("#playerRouteList"),ml=$("#playerLocationList");
 rl.innerHTML=state.routes.length?state.routes.map(r=>`<label style="display:block"><input type="checkbox" data-player-route="${esc(r.id)}" checked> ${esc(r.name||"Naamloze route")}</label>`).join(""):'<div class="small">Geen routes</div>';
 ml.innerHTML=state.markers.length?state.markers.map(m=>`<label style="display:block"><input type="checkbox" data-player-location="${esc(m.id)}" checked> ${esc(m.name||"Naamloze locatie")}</label>`).join(""):'<div class="small">Geen locaties</div>';
 $("#playerAllRoutes").checked=true;$("#playerAllLocations").checked=true;$("#playerLocationNames").checked=true;
}

function logbookMarkdown(){let rows=filteredTravelRows(),t=travelTotals(rows),clean=x=>String(x).replace(/\|/g,'\\|').replace(/[\r\n]+/g,' ').replace(/</g,'&lt;');return '# '+clean(state.projectName||'Campagne')+' — Reisoverzicht\n\n| Sessie | Speeldatum | Periode | Reis | Afstand | In-game dagen | Plaatsen |\n|---|---|---|---|---:|---:|---|\n'+rows.map(r=>'| '+travelCells(r).map(clean).join(' | ')+' |').join('\n')+`\n\nTotaal: ${t.distance.toFixed(1)} ${state.unit||'mi'} · ${t.duration.toFixed(1)} in-game dagen · ${t.places} plaatsen.${t.unknown?' Alleen bekende waarden.':''}\n`}

function logbookHtml(){return '<!doctype html><html lang="nl"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Reisoverzicht</title><style>body{font:15px system-ui;margin:30px;color:#222}table{width:100%;border-collapse:collapse}td,th{padding:10px;border-bottom:1px solid #ccc;text-align:left}tfoot{font-weight:bold}.travelTableWrap{overflow:auto}@media print{body{margin:0}tr{break-inside:avoid}}</style><h1>'+esc(state.projectName||'Campagne')+' — Reisoverzicht</h1>'+travelTable(filteredTravelRows())+'</html>'}

// Registreer bediening; aangeroepen vanuit init.js.
function bindCampaignFileUI(){
$("#exportBtn").onclick=async()=>{if(!activeCampaignId)return alert("Open eerst een campagne.");await flushSave();let blob=new Blob([JSON.stringify(campaignExportEnvelope(projectData()),null,2)],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);let slug=(state.projectName||"fantasy-campaign").replace(/[^a-z0-9]+/gi,"-").replace(/^-|-$/g,"");let today=new Date().toISOString().slice(0,10);a.download=`${slug}-${today}.json`;a.click();URL.revokeObjectURL(a.href)}
$("#importInput").onchange=e=>{let f=e.target.files[0];e.target.value="";importProjectFile(f)};
$("#sideImportInput").onchange=e=>{let f=e.target.files[0];e.target.value="";importProjectFile(f)};
}

// Registreer bediening; aangeroepen vanuit init.js.
function bindLogExportUI(){
$("#exportLogMdBtn").onclick=()=>downloadText(`${campaignSlug()}-campagnelogboek.md`,logbookMarkdown(),"text/markdown;charset=utf-8");
$("#exportLogHtmlBtn").onclick=()=>downloadText(`${campaignSlug()}-campagnelogboek.html`,logbookHtml(),"text/html;charset=utf-8");
}

// Registreer bediening; aangeroepen vanuit init.js.
function bindAllCampaignBackupUI(){
$("#exportAllCampaignsBtn").onclick=async()=>{
 try{
  let backup=await buildAllCampaignsBackup();
  if(!backup.campaigns.length)return alert("Er zijn geen lokale campagnes om te exporteren.");
  let blob=new Blob([JSON.stringify(backup)],{type:"application/json"}),a=document.createElement("a");
  a.href=URL.createObjectURL(blob);a.download=`fantasy-route-mapper-alle-campagnes-${new Date().toISOString().slice(0,10)}.json`;a.click();recordBackupRequest("all");
  setTimeout(()=>URL.revokeObjectURL(a.href),1000);
 }catch(e){console.error(e);alert("Volledige backup maken is niet gelukt. Er is niets verwijderd.")}
};
$("#importAllCampaignsInput").onchange=async e=>{
 let f=e.target.files?.[0];e.target.value="";if(!f)return;
 try{
  let raw=JSON.parse(await f.text());
  if(!await previewImport(raw,true))return;
  // restoreAll validates all campaigns before it writes any of them.
  let count=await restoreAllCampaignsBackup(raw);await renderCampaignHome();
  alert(`${count} campagne${count===1?"":"s"} uit de backup geïmporteerd. Bestaande campagnes zijn behouden.`);
 }catch(err){console.error(err);alert("Volledige backup importeren is niet gelukt. "+(err?.message||"Het bestand is ongeldig."))}
};
}

// Registreer bediening; aangeroepen vanuit init.js.
function bindFullBackupUI(){
$("#fullBackupBtn").onclick=async()=>{
 if(!runtimeImageBlob)return alert("Selecteer eerst de kaart. Een volledige backup bevat het project én de kaart.");
 try{let x=campaignExportEnvelope(projectData());x.image=await blobToDataURL(runtimeImageBlob);let blob=new Blob([JSON.stringify(x)],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`${campaignSlug()}-volledige-backup.json`;a.click();recordBackupRequest(activeCampaignId);setTimeout(()=>URL.revokeObjectURL(a.href),1000)}catch(e){alert("De volledige backup kon niet worden gemaakt.")}
};
}

// Registreer bediening; aangeroepen vanuit init.js.
function bindPlayerMapUI(){
$("#playerMapBtn").onclick=()=>{
 if(!runtimeImage||!map.naturalWidth)return alert("Selecteer eerst een wereldkaart.");
 renderPlayerMapPicker();$("#projectMenu").classList.add("hidden");$("#playerMapModal").classList.remove("hidden");
};
$("#closePlayerMapBtn").onclick=()=>$("#playerMapModal").classList.add("hidden");
$("#playerMapModal").onclick=e=>{if(e.target===$("#playerMapModal"))$("#playerMapModal").classList.add("hidden")};
$("#playerAllRoutes").onchange=e=>document.querySelectorAll("[data-player-route]").forEach(x=>x.checked=e.target.checked);
$("#playerAllLocations").onchange=e=>document.querySelectorAll("[data-player-location]").forEach(x=>x.checked=e.target.checked);
$("#playerRouteList").onchange=()=>{$("#playerAllRoutes").checked=[...document.querySelectorAll("[data-player-route]")].every(x=>x.checked)};
$("#playerLocationList").onchange=()=>{$("#playerAllLocations").checked=[...document.querySelectorAll("[data-player-location]")].every(x=>x.checked)};
$("#exportPlayerMapBtn").onclick=async()=>{
 try{
  if(!map.naturalWidth)throw new Error("Geen kaart geladen.");
  let c=document.createElement("canvas"),ctx=c.getContext("2d");c.width=map.naturalWidth;c.height=map.naturalHeight;
  ctx.drawImage(map,0,0,c.width,c.height);
  let routeIds=new Set([...document.querySelectorAll("[data-player-route]:checked")].map(x=>x.dataset.playerRoute));
  let locationIds=new Set([...document.querySelectorAll("[data-player-location]:checked")].map(x=>x.dataset.playerLocation));
  state.routes.forEach(r=>{
   if(!routeIds.has(String(r.id))||!Array.isArray(r.points)||r.points.length<2)return;
   ctx.save();ctx.strokeStyle=r.color||"#e05252";ctx.lineWidth=Math.max(3,c.width/900);ctx.lineJoin="round";ctx.lineCap="round";
   if(r.status==="planned")ctx.setLineDash([12,9]);else if(r.status==="traveling")ctx.setLineDash([20,6]);
   ctx.beginPath();ctx.moveTo(r.points[0].x,r.points[0].y);r.points.slice(1).forEach(p=>ctx.lineTo(p.x,p.y));ctx.stroke();ctx.restore();
  });
  let showNames=$("#playerLocationNames").checked,fontSize=Math.max(14,Math.round(c.width/90));
  state.markers.forEach(m=>{
   if(!locationIds.has(String(m.id)))return;
   let radius=Math.max(6,c.width/350);ctx.save();
   ctx.beginPath();ctx.arc(m.x,m.y,radius,0,Math.PI*2);ctx.fillStyle="#ffd86b";ctx.fill();ctx.lineWidth=Math.max(2,c.width/1200);ctx.strokeStyle="#222";ctx.stroke();
   if(showNames&&m.labelMode!=="hide"){
    ctx.font=`600 ${fontSize}px sans-serif`;ctx.lineWidth=Math.max(3,fontSize/4);ctx.strokeStyle="#111";ctx.fillStyle="#fff";ctx.textBaseline="bottom";
    let tx=m.x+radius+4,ty=m.y-radius-2;ctx.strokeText(m.name||"",tx,ty);ctx.fillText(m.name||"",tx,ty);
   }ctx.restore();
  });
  c.toBlob(blob=>{
   if(!blob)return alert("PNG maken is niet gelukt.");
   let a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`${campaignSlug()}-spelerskaart.png`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);
   $("#playerMapModal").classList.add("hidden");
  },"image/png");
 }catch(e){console.error(e);alert("Spelerskaart exporteren is niet gelukt. "+(e?.message||""))}
};
}

let pendingImportPreview=null;
function importPreviewItems(raw,all){
 if(!all){const item=unwrapCampaignImport(raw);if(item.image)dataUrlToBlob(item.image);return [{data:item.data,image:item.image}]}
 if(raw?.format!==BACKUP_FORMAT||raw.backupType!=="all-campaigns"||!Array.isArray(raw.campaigns))throw new Error("Geen geldige backup van alle campagnes.");
 if(Number(raw.backupVersion||0)>CURRENT_BACKUP_VERSION)throw new Error("Deze backupversie wordt niet ondersteund.");
 if(!raw.campaigns.length)throw new Error("Deze backup bevat geen campagnes.");
 return raw.campaigns.map(item=>{if(!item||typeof item!=="object")throw new Error("Ongeldige campagne.");const data=prepareCampaignData(item.data||{});if(item.image)dataUrlToBlob(item.image);return {data,image:item.image}});
}
function previewImport(raw,all){
 if(pendingImportPreview)throw new Error("Rond eerst de openstaande import af.");
 const items=importPreviewItems(raw,all);
 $("#importPreviewContent").innerHTML=items.map(({data,image})=>`<section class="importItem"><h3>${esc(data.projectName||"Naamloze campagne")}</h3><p>${(data.routes||[]).length} routes · ${(data.markers||[]).length} locaties · ${(data.sessions||[]).length} reisregistraties</p><p>${image?"Kaart inbegrepen":"Geen kaart inbegrepen; selecteer de kaart na import"}</p></section>`).join("");
 $("#importPreviewError").textContent="";
 $("#importPreviewDialog").showModal();
 return new Promise(resolve=>{pendingImportPreview=resolve});
}
function finishImportPreview(accepted){
 const resolve=pendingImportPreview;pendingImportPreview=null;
 $("#importPreviewDialog").close();if(resolve)resolve(accepted);
}
function bindImportPreviewUI(){
 $("#confirmImportBtn").onclick=()=>finishImportPreview(true);
 $("#cancelImportBtn").onclick=()=>finishImportPreview(false);
 $("#importPreviewDialog").addEventListener("cancel",e=>{e.preventDefault();finishImportPreview(false)});
 $("#importPreviewDialog").addEventListener("close",()=>{if(pendingImportPreview)finishImportPreview(false)});
}
function recordBackupRequest(scope){
 try{localStorage.setItem("frm-backup-request-"+scope,new Date().toISOString())}catch(e){console.warn("Backupdatum kon niet worden bewaard",e)}
 updateBackupStatus();
}
function updateBackupStatus(){
 const el=$("#backupStatus");if(!el)return;
 let date=null;try{date=localStorage.getItem("frm-backup-request-"+(activeCampaignId||"all"))}catch(e){}
 const parsed=date?new Date(date):null;
 el.textContent=parsed&&Number.isFinite(parsed.getTime())?"Backupdownload gestart: "+parsed.toLocaleString("nl-NL",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"}):"Nog geen backupdownload geregistreerd";
 el.title=""+(activeCampaignId?"Volledige backup van deze campagne. ":"Backup van alle campagnes. ")+"De browser kan niet bevestigen of het bestand is bewaard. Controleer je downloads. Lokale opslag is geen online backup.";
}
