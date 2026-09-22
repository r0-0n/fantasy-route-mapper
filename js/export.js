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
 $("#projectMenu").classList.add("hidden");$("#playerMapModal").classList.remove("hidden");requestPlayerPreview();
};
$("#closePlayerMapBtn").onclick=()=>$("#playerMapModal").classList.add("hidden");
$("#playerMapModal").onclick=e=>{if(e.target===$("#playerMapModal"))$("#playerMapModal").classList.add("hidden")};
$('#playerMapModal').addEventListener('input',requestPlayerPreview);
$('#playerMapModal').addEventListener('change',requestPlayerPreview);
$('#exportPlayerMapBtn').onclick=()=>{
 const canvas=playerPreviewCanvas;if(!canvas||$('#exportPlayerMapBtn').disabled)return;
 canvas.toBlob(blob=>{if(!blob){$('#playerPreviewStatus').textContent='PNG maken is niet gelukt.';return}const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`${campaignSlug()}-spelerskaart.png`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);$('#playerMapModal').classList.add('hidden')},'image/png');
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

function playerCropBounds(routeIds,width,height,enabled=true){
 const pts=enabled?state.routes.filter(r=>routeIds.has(String(r.id))&&(r.status==='done'||(state.sessions||[]).some(s=>(s.routeIds||[]).includes(r.id)))).flatMap(r=>r.points||[]).filter(p=>Number.isFinite(p.x)&&Number.isFinite(p.y)):[];
 if(!pts.length)return {x:0,y:0,width,height};
 let left=width,top=height,right=0,bottom=0;for(const p of pts){left=Math.min(left,p.x);top=Math.min(top,p.y);right=Math.max(right,p.x);bottom=Math.max(bottom,p.y)}
 const margin=Math.max(80,Math.max(right-left,bottom-top)*.1),x=Math.max(0,Math.floor(left-margin)),y=Math.max(0,Math.floor(top-margin)),endX=Math.min(width,Math.ceil(right+margin)),endY=Math.min(height,Math.ceil(bottom+margin));
 return endX>x&&endY>y?{x,y,width:endX-x,height:endY-y}:{x:0,y:0,width,height};
}

async function paintPlayerMap(){
  if(!map.naturalWidth)throw new Error("Geen kaart geladen.");
  let c=document.createElement("canvas"),ctx=c.getContext("2d");c.width=map.naturalWidth;c.height=map.naturalHeight;
  ctx.drawImage(map,0,0,c.width,c.height);
  let routeIds=new Set(state.routes.filter(r=>r.visible!==false).map(r=>String(r.id)));
  let locationIds=new Set(state.markers.filter(m=>m.visible!==false).map(m=>String(m.id)));
  const bounds=playerCropBounds(routeIds,c.width,c.height,$('#playerCrop').checked);
  const sizeFactor=bounds.width/1600,exportIconSize=Number($('#playerIconSize').value)||64,exportTextSize=Number($('#playerTextSize').value)||20;
  state.routes.forEach(r=>{
   if(!routeIds.has(String(r.id))||!Array.isArray(r.points)||r.points.length<2)return;
   ctx.save();ctx.strokeStyle=r.color||"#e05252";ctx.lineWidth=Math.max(3,c.width/900);ctx.lineJoin="round";ctx.lineCap="round";
   if(r.status==="planned")ctx.setLineDash([12,9]);else if(r.status==="traveling")ctx.setLineDash([20,6]);
   ctx.beginPath();ctx.moveTo(r.points[0].x,r.points[0].y);r.points.slice(1).forEach(p=>ctx.lineTo(p.x,p.y));ctx.stroke();ctx.restore();
  });
  let showNames=true,fontSize=Math.max(1,sizeFactor*exportTextSize);
  const iconImages={};for(const type of new Set(state.markers.filter(m=>locationIds.has(String(m.id))).map(m=>m.type).concat(state.party?["Party"]:[]))){iconImages[type]=await loadPlayerIcon(type)}
  state.markers.forEach(m=>{
   if(!locationIds.has(String(m.id)))return;
   let radius=sizeFactor*exportIconSize/2;ctx.save();
   if(state.iconEmphasis!==false){ctx.beginPath();ctx.arc(m.x,m.y,radius+sizeFactor*3,0,Math.PI*2);ctx.fillStyle="#172023";ctx.fill();ctx.strokeStyle="#e2dac4";ctx.lineWidth=sizeFactor*1.5;ctx.stroke();}
   ctx.drawImage(iconImages[m.type],m.x-radius,m.y-radius,radius*2,radius*2);
   if(showNames&&m.labelMode!=="hide"){
    ctx.font=`600 ${fontSize}px sans-serif`;ctx.lineWidth=Math.max(1,fontSize/6);ctx.strokeStyle="#111";ctx.fillStyle="#fff";ctx.textBaseline="bottom";
    let tx=m.x+radius+4,ty=m.y-radius-2;ctx.strokeText(m.name||"",tx,ty);ctx.fillText(m.name||"",tx,ty);
   }ctx.restore();
  });
  if(state.party)ctx.drawImage(iconImages.Party,state.party.x-sizeFactor*exportIconSize/2,state.party.y-sizeFactor*exportIconSize/2,sizeFactor*exportIconSize,sizeFactor*exportIconSize);
  const cropped=document.createElement('canvas');cropped.width=bounds.width;cropped.height=bounds.height;cropped.getContext('2d').drawImage(c,bounds.x,bounds.y,bounds.width,bounds.height,0,0,bounds.width,bounds.height);

 cropped.getContext("2d").getImageData(0,0,1,1);
 return cropped;
}

let playerPreviewCanvas=null,playerPreviewGeneration=0,playerPreviewTimer=null;
const playerIconCache=new Map(),localExportIconUrls=new Map();
function loadPlayerIcon(type){const path=locationIcon(type),src=localExportIconUrls.get(path)||path;if(!playerIconCache.has(src))playerIconCache.set(src,new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>{playerIconCache.delete(src);reject(new Error('Icoon niet geladen'))};im.src=src}));return playerIconCache.get(src)}
function requestPlayerPreview(){
 const generation=++playerPreviewGeneration;clearTimeout(playerPreviewTimer);playerPreviewCanvas=null;$('#exportPlayerMapBtn').disabled=true;$('#playerPreviewStatus').textContent='Voorbeeld wordt bijgewerkt…';$('#playerTextSizeValue').textContent=$('#playerTextSize').value;$('#playerIconSizeValue').textContent=$('#playerIconSize').value;
 playerPreviewTimer=setTimeout(async()=>{try{const canvas=await paintPlayerMap();if(generation!==playerPreviewGeneration)return;playerPreviewCanvas=canvas;const preview=$('#playerPreview');preview.width=Math.min(1200,canvas.width);preview.height=Math.round(canvas.height*preview.width/canvas.width);preview.getContext('2d').drawImage(canvas,0,0,preview.width,preview.height);$('#playerPreviewStatus').textContent=canvas.width+' × '+canvas.height+' pixels';$('#exportPlayerMapBtn').disabled=false}catch(e){if(generation===playerPreviewGeneration){$('#playerPreviewStatus').textContent=e.name==='SecurityError'?'Kies de afbeeldingenmap om de lokale PNG-export mogelijk te maken.':'Voorbeeld maken mislukt: '+e.message;if(e.name==='SecurityError')$('#localExportAssets').classList.remove('hidden')}}},120);
}

function bindLocalExportAssets(){
 $('#localExportAssetsInput').onchange=e=>{
  const files=[...e.target.files],needed=new Set(Object.values(LOCATION_ICONS));
  for(const path of needed){const file=files.find(f=>f.name===path.split('/').pop());if(!file){$('#playerPreviewStatus').textContent='Kies de complete assets-map; '+path.split('/').pop()+' ontbreekt.';return}}
  for(const url of localExportIconUrls.values())URL.revokeObjectURL(url);localExportIconUrls.clear();playerIconCache.clear();
  for(const path of needed){const file=files.find(f=>f.name===path.split('/').pop());localExportIconUrls.set(path,URL.createObjectURL(file))}
  $('#localExportAssets').classList.add('hidden');e.target.value='';requestPlayerPreview();
 };
}
