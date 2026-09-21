// Gedeelde applicatiestatus, algemene helpers en campagne-interface.
// Klassiek script: gedeelde globale scope; laadvolgorde staat in index.html.


const $=s=>document.querySelector(s), stage=$("#stage"), world=$("#world"), map=$("#map"), svg=$("#overlay");
let state={campaignId:null,imageName:"",projectName:"Fantasy Campaign",scale:null,unit:"mi",routes:[],markers:[],sessions:[],active:null,view:{x:0,y:0,z:1}}; let runtimeImage=null, runtimeImageBlob=null; let activeCampaignId=null;
let onboardingDismissed=false;
let mode="pan", drawing=false, calibratePts=[], draggingPoint=null, selectedPoint=null, pan=null, insertMode=false;
let movingLocationId=null, fitOnNextMapLoad=false; let sessionPickerDraft=null;
const colors=["#e05252","#4f8fd8","#5fb66c","#d5a343","#9b6bd3","#55b8b0"];



const APP_VERSION="1.3.2";
const CURRENT_DATA_VERSION=1;
const CURRENT_BACKUP_VERSION=1;
const BACKUP_FORMAT="fantasy-route-mapper";

function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,8)}

function esc(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}

async function renderCampaignHome(){
 let idx=await campaignList();
 $("#campaignGrid").innerHTML=idx.length?idx.map(c=>`<div class="campaignCard"><h3>${esc(c.name)}</h3><div class="campaignMeta">${c.imageName?`Kaart: ${esc(c.imageName)}<br>`:"Geen kaart geselecteerd<br>"}${c.sessions||0} sessie${c.sessions===1?"":"s"}</div><div class="campaignButtons"><button class="primary" data-open="${c.id}">Open</button><button data-dup="${c.id}">Dupliceer</button><button class="danger" data-del="${c.id}">Verwijder</button></div></div>`).join(""):`<div class="empty">Nog geen campagnes. Maak je eerste campagne aan.</div>`;
}

async function showCampaignHome(){setRouteOverviewOpen(false,false);await flushSave();await renderCampaignHome();$("#campaignHome").classList.remove("hidden");$("#projectMenu").classList.add("hidden")}

function newProject(){
 $("#projectMenu").classList.add("hidden");
 $("#newCampaignError").textContent="";$("#newCampaignName").value="Nieuwe campagne";
 $("#newCampaignDialog").showModal();$("#newCampaignName").select();
}

function setSidebarCollapsed(v){
 if(v)setRouteOverviewOpen(false,false);
 sidebarCollapsed=!!v;localStorage.setItem("frm-ui-sidebar-collapsed",sidebarCollapsed?"1":"0");
 $("#layout").classList.toggle("sidebarCollapsed",sidebarCollapsed);
 $("#sidebarToggle").textContent=sidebarCollapsed?"‹":"›";
 $("#sidebarToggle").title=sidebarCollapsed?"Zijpaneel openen":"Zijpaneel inklappen";
 setTimeout(()=>applyView(),200);
}

// Gedeelde tijdelijke UI-status.
let harptosTarget=null;
let sessionResultLimits={route:6,location:6};
let selectedLocationId=null;
let pendingLocationPoint=null;
let creatingCampaign=false;
let sidebarCollapsed=localStorage.getItem("frm-ui-sidebar-collapsed")==="1";
