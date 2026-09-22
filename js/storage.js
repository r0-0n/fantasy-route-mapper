// IndexedDB, opslag, normalisatie, migraties en backupformaten.
// Klassiek script: gedeelde globale scope; laadvolgorde staat in index.html.

const DB_NAME="FantasyRouteMapper";
const DB_VERSION=1;
const STORE="campaigns";
let dbPromise=null, saveTimer=null, saveInFlight=false, pendingSave=false, savePromise=Promise.resolve();

function projectData(){
 let x=JSON.parse(JSON.stringify(state));delete x.image;
 x.formatVersion=13;x.dataVersion=1;
 if(state.scale&&Number.isFinite(Number(state.scale.perPixel))){
   x.scale={perPixel:Number(state.scale.perPixel),unit:state.scale.unit||state.unit||"mi"};
 }
 return x
}

function cloneJSON(x){return JSON.parse(JSON.stringify(x))}

function migrateCampaignData(raw){
 if(!raw||typeof raw!=="object"||Array.isArray(raw))throw new Error("Ongeldige campagnegegevens.");
 let x=cloneJSON(raw);
 let v=Number(x.dataVersion||0);
 // Pre-beta development exports (including formatVersion 13) are accepted as legacy v0.
 if(v> CURRENT_DATA_VERSION)throw new Error(`Deze campagne gebruikt dataversie ${v}, maar deze versie ondersteunt maximaal ${CURRENT_DATA_VERSION}.`);
 if(v===0){
   x.dataVersion=1;
 }
 // Future migrations are chained here, e.g. v1 -> v2 -> v3.
 return x;
}

function validateCampaignData(x){
 if(!x||typeof x!=="object"||Array.isArray(x))throw new Error("Geen geldige campagne.");
 if(!Array.isArray(x.routes)&&x.routes!==undefined)throw new Error("Routes hebben een ongeldig formaat.");
 if(!Array.isArray(x.markers)&&x.markers!==undefined)throw new Error("Locaties hebben een ongeldig formaat.");
 if(!Array.isArray(x.sessions)&&x.sessions!==undefined)throw new Error("Sessies hebben een ongeldig formaat.");
 return true;
}

function prepareCampaignData(raw){
 let x=migrateCampaignData(raw);validateCampaignData(x);return x;
}

function campaignExportEnvelope(data){
 return {format:BACKUP_FORMAT,backupType:"campaign",backupVersion:CURRENT_BACKUP_VERSION,appVersion:APP_VERSION,exportedAt:new Date().toISOString(),campaign:cloneJSON(data)};
}

function unwrapCampaignImport(raw){
 if(raw?.format===BACKUP_FORMAT){
   let bv=Number(raw.backupVersion||0);
   if(bv>CURRENT_BACKUP_VERSION)throw new Error(`Deze backup gebruikt backupversie ${bv}, maar deze app ondersteunt maximaal ${CURRENT_BACKUP_VERSION}.`);
   if(raw.backupType!=="campaign"||!raw.campaign)throw new Error("Dit bestand is geen individuele campagnebackup.");
   return {data:prepareCampaignData(raw.campaign),image:raw.image||null};
 }
 return {data:prepareCampaignData(raw),image:raw?.image||null}; // legacy pre-beta export
}

async function buildAllCampaignsBackup(){
 await flushSave();
 let records=await dbGetAll(),campaigns=[];
 for(let rec of records){
   let item={id:rec.id,data:prepareCampaignData(rec.data||{}),image:null};
   if(rec.imageBlob)item.image=await blobToDataURL(rec.imageBlob);
   campaigns.push(item);
 }
 return {format:BACKUP_FORMAT,backupType:"all-campaigns",backupVersion:CURRENT_BACKUP_VERSION,appVersion:APP_VERSION,exportedAt:new Date().toISOString(),campaigns};
}

async function restoreAllCampaignsBackup(raw){
 if(!raw||raw.format!==BACKUP_FORMAT||raw.backupType!=="all-campaigns"||!Array.isArray(raw.campaigns))throw new Error("Dit is geen geldige volledige Fantasy Route Mapper-backup.");
 let bv=Number(raw.backupVersion||0);
 if(bv>CURRENT_BACKUP_VERSION)throw new Error(`Deze backup gebruikt backupversie ${bv}, maar deze app ondersteunt maximaal ${CURRENT_BACKUP_VERSION}.`);
 // Validate and migrate EVERYTHING before writing anything.
 let prepared=raw.campaigns.map(item=>{
   if(!item||typeof item!=="object")throw new Error("Ongeldige campagne in backup.");
   return {oldId:item.id||"",data:prepareCampaignData(item.data||{}),image:item.image||null};
 });
 for(let item of prepared){
   let nid=uid(),data=cloneJSON(item.data);data.campaignId=nid;data.dataVersion=CURRENT_DATA_VERSION;
   let imageBlob=item.image?dataUrlToBlob(item.image):null;
   await dbPut({id:nid,data,imageBlob,meta:metaFor(data,nid)});
 }
 return prepared.length;
}

async function deleteAllLocalCampaigns(){
 let db=await openDB();
 return new Promise((resolve,reject)=>{
   let tx=db.transaction(STORE,"readwrite");tx.objectStore(STORE).clear();
   tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);
 });
}

function setSaveStatus(text,isError=false){
 let el=$("#saveStatus");if(!el)return;el.textContent=text==="Opgeslagen"?"✓ Opgeslagen":text;el.style.color=isError?"#e58b8b":"#aaa";
}

function openDB(){
 if(dbPromise)return dbPromise;
 dbPromise=new Promise((resolve,reject)=>{
  let req=indexedDB.open(DB_NAME,DB_VERSION);
  req.onupgradeneeded=()=>{let db=req.result;if(!db.objectStoreNames.contains(STORE))db.createObjectStore(STORE,{keyPath:"id"})};
  req.onsuccess=()=>resolve(req.result);
  req.onerror=()=>reject(req.error);
 });
 return dbPromise;
}

async function dbGet(id){
 let db=await openDB();return new Promise((resolve,reject)=>{let tx=db.transaction(STORE,"readonly"),r=tx.objectStore(STORE).get(id);r.onsuccess=()=>resolve(r.result||null);r.onerror=()=>reject(r.error)});
}

async function dbGetAll(){
 let db=await openDB();return new Promise((resolve,reject)=>{let tx=db.transaction(STORE,"readonly"),r=tx.objectStore(STORE).getAll();r.onsuccess=()=>resolve(r.result||[]);r.onerror=()=>reject(r.error)});
}

async function dbPut(rec){
 let db=await openDB();return new Promise((resolve,reject)=>{let tx=db.transaction(STORE,"readwrite");tx.objectStore(STORE).put(rec);tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error)});
}

async function dbDelete(id){
 let db=await openDB();return new Promise((resolve,reject)=>{let tx=db.transaction(STORE,"readwrite");tx.objectStore(STORE).delete(id);tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error)});
}

function dataUrlToBlob(dataUrl){
 if(!dataUrl)return null;let [head,b64]=dataUrl.split(","),mime=(head.match(/data:([^;]+)/)||[])[1]||"application/octet-stream",bin=atob(b64),arr=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)arr[i]=bin.charCodeAt(i);return new Blob([arr],{type:mime});
}

function blobToDataURL(blob){return new Promise((resolve,reject)=>{let r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=()=>reject(r.error);r.readAsDataURL(blob)})}

function metaFor(data,id){
 return {id,name:data.projectName||"Naamloze campagne",imageName:data.imageName||"",sessions:(data.sessions||[]).length,updated:new Date().toISOString()};
}

async function campaignList(){
 let all=await dbGetAll();return all.map(r=>r.meta||metaFor(r.data||{},r.id)).sort((a,b)=>String(b.updated||"").localeCompare(String(a.updated||"")));
}

function save(){
 if(!activeCampaignId)return;
 state.campaignId=activeCampaignId;
 pendingSave=true;setSaveStatus("Opslaan…");
 clearTimeout(saveTimer);saveTimer=setTimeout(flushSave,180);
}

async function flushSave(){
 if(!activeCampaignId)return;
 clearTimeout(saveTimer);saveTimer=null;
 pendingSave=true;
 if(saveInFlight)return savePromise;
 savePromise=(async()=>{
  saveInFlight=true;
  try{
   while(pendingSave&&activeCampaignId){
    pendingSave=false;
    let id=activeCampaignId,data=projectData(),existing=null;
    try{
     existing=await dbGet(id);
     let imageBlob=runtimeImageBlob||(existing&&existing.imageBlob)||null;
     await dbPut({id,data,imageBlob,meta:metaFor(data,id)});
     setSaveStatus("Opgeslagen");
    }catch(e){
     console.error("Opslaan mislukt",e);setSaveStatus("Opslaan mislukt",true);
     alert("De campagne kon niet lokaal worden opgeslagen. Exporteer voor de zekerheid via Campagne → Campagne exporteren.");
     pendingSave=false;
    }
   }
  }finally{
   saveInFlight=false;
  }
 })();
 return savePromise;
}

async function loadCampaign(id){
 selectedLocationId=null;
 $("#locationModal").classList.add("hidden");$("#noSelectedLocation").classList.remove("hidden");$("#locationOverviewModal").classList.add("hidden");
 setRouteOverviewOpen(false,false);
 try{
  if(activeCampaignId)await flushSave();
  let rec=await dbGet(id);if(!rec)return false;
  state=prepareCampaignData(rec.data||{});activeCampaignId=id;state.campaignId=id;
  if(!state.projectName&&rec.meta?.name)state.projectName=rec.meta.name;
  revokeRuntimeImage();runtimeImageBlob=rec.imageBlob||null;onboardingDismissed=true;
  normalize();$("#campaignHome").classList.add("hidden");
  if(runtimeImageBlob){
   runtimeImage=URL.createObjectURL(runtimeImageBlob);setMap(runtimeImage);
  }else{
   map.removeAttribute("src");$("#noMap").classList.remove("hidden");$("#controls").classList.remove("hidden");render();
  }
  renderLogbook();render();setSaveStatus("Opgeslagen");return true;
 }catch(e){console.error(e);alert("Deze campagne kon niet uit de browseropslag worden geladen.");return false}
}

async function migrateLegacy(){
 try{
  if(localStorage.getItem("frm-indexeddb-migration-complete")==="1")return;
  let existing=await dbGetAll();if(existing.length){localStorage.setItem("frm-indexeddb-migration-complete","1");return;}
  let idx=[];try{idx=JSON.parse(localStorage.getItem("frm-campaign-index")||"[]")}catch(e){}
  if(idx.length){
   for(let m of idx){
    try{
     let raw=localStorage.getItem(`frm-campaign-${m.id}`);if(!raw)continue;
     let data=JSON.parse(raw),img=localStorage.getItem(`frm-image-${m.id}`)||null;delete data.image;
     await dbPut({id:m.id,data,imageBlob:img?dataUrlToBlob(img):null,meta:metaFor(data,m.id)});
    }catch(e){console.warn("Campagne migratie overgeslagen",m.id,e)}
   }
   localStorage.setItem("frm-indexeddb-migration-complete","1");return;
  }
  let raw=localStorage.getItem("fantasy-route-mapper-v9")||localStorage.getItem("fantasy-route-mapper");
  if(raw){
   let data=JSON.parse(raw),id=uid(),img=localStorage.getItem("fantasy-route-map-image")||data.image||null;delete data.image;data.campaignId=id;
   await dbPut({id,data,imageBlob:img?dataUrlToBlob(img):null,meta:metaFor(data,id)});
  }
  localStorage.setItem("frm-indexeddb-migration-complete","1");
 }catch(e){console.warn("Migratie oude opslag mislukt",e)}
}

function normalize(){
 state.iconSize=[24,32,48].includes(state.iconSize)?state.iconSize:32;
 if(!state.party||!Number.isFinite(state.party.x)||!Number.isFinite(state.party.y))state.party=null;
 state=state||{};
 state.routes=Array.isArray(state.routes)?state.routes:[];
 state.markers=Array.isArray(state.markers)?state.markers:[];
 state.sessions=Array.isArray(state.sessions)?state.sessions:[];
 state.sessions.forEach(s=>{if(s.gameStart===undefined)s.gameStart=s.gameDate||"";if(s.gameEnd===undefined)s.gameEnd="";if(s.gameDays===undefined)s.gameDays="";});
 state.projectName=state.projectName||"Fantasy Campaign";
 state.unit=state.unit==="km"?"km":"mi";
 state.view=state.view&&Number.isFinite(Number(state.view.z))?state.view:{x:0,y:0,z:1};
 state.view.x=Number(state.view.x)||0;state.view.y=Number(state.view.y)||0;state.view.z=Number(state.view.z)||1;
 if(state.scale!==null&&state.scale!==undefined){
   if(typeof state.scale==="number")state.scale={perPixel:state.scale,unit:state.unit};
   if(state.scale.distancePerPixel!==undefined&&state.scale.perPixel===undefined)state.scale.perPixel=state.scale.distancePerPixel;
   if(state.scale.unitsPerPixel!==undefined&&state.scale.perPixel===undefined)state.scale.perPixel=state.scale.unitsPerPixel;
   let pp=Number(state.scale.perPixel);
   if(Number.isFinite(pp)&&pp>0){state.scale={perPixel:pp,unit:state.scale.unit==="km"?"km":state.unit};state.unit=state.scale.unit}
   else state.scale=null;
 }
 if(state.active&&!state.routes.some(r=>r.id===state.active))state.active=null;
 if(!state.active)state.active=null;
 state.routes.forEach((r,i)=>{if(!r.id)r.id=uid();if(!r.name)r.name=`Route ${i+1}`;if(!Array.isArray(r.points))r.points=[];if(r.visible===undefined)r.visible=true;if(!r.status)r.status="planned";if(!r.log)r.log={session:"",date:"",from:"",to:"",note:"",pace:24,pacePreset:"normal",fromLocationId:null,toLocationId:null};if(r.log.pace===undefined)r.log.pace=24;if(!r.log.pacePreset)r.log.pacePreset="normal";if(r.log.fromLocationId===undefined)r.log.fromLocationId=null;if(r.log.toLocationId===undefined)r.log.toLocationId=null});
 state.markers.forEach(m=>{if(!m.type||m.type==="Region")m.type="Landmark";if(m.region===undefined)m.region="";if(m.faction===undefined)m.faction="";if(m.description===undefined)m.description="";if(m.notes===undefined)m.notes=""});
 state.sessions.forEach(s=>{if(!s.routeIds)s.routeIds=[];if(!s.locationIds)s.locationIds=[]});
 // Oude routegegevens worden hier niet opnieuw naar sessies geconverteerd.
 // Anders zouden bewust verwijderde sessies na herladen terugkomen.
}

async function createCampaign(name){
 await flushSave();
 let id=uid(),data={dataVersion:CURRENT_DATA_VERSION,campaignId:id,imageName:"",projectName:name||"Nieuwe campagne",scale:null,unit:"mi",routes:[],markers:[],sessions:[],active:null,view:{x:0,y:0,z:1}};
 // Commit storage before replacing the currently open campaign.
 await dbPut({id,data,imageBlob:null,meta:metaFor(data,id)});
 revokeRuntimeImage();activeCampaignId=id;state=data;runtimeImageBlob=null;
 map.removeAttribute("src");svg.innerHTML="";
 drawing=false;insertMode=false;movingLocationId=null;pan=null;draggingPoint=null;selectedPoint=null;calibratePts=[];mode="pan";
 stage.classList.remove("moveLocationMode");onboardingDismissed=false;
 $("#campaignHome").classList.add("hidden");render();setSaveStatus("Opgeslagen");
}

async function duplicateCampaign(id){
 let rec=await dbGet(id);if(!rec)return;let nid=uid(),data=prepareCampaignData(rec.data);data.campaignId=nid;data.dataVersion=CURRENT_DATA_VERSION;data.projectName=(data.projectName||"Campagne")+" — kopie";await dbPut({id:nid,data,imageBlob:rec.imageBlob||null,meta:metaFor(data,nid)});await renderCampaignHome()
}
