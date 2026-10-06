// Gedeelde applicatiestatus, algemene helpers en campagne-interface.
// Klassiek script: gedeelde globale scope; laadvolgorde staat in index.html.


const $=s=>document.querySelector(s), stage=$("#stage"), world=$("#world"), map=$("#map"), svg=$("#overlay");
let state={campaignId:null,imageName:"",projectName:"Fantasy Campaign",scale:null,unit:"mi",routes:[],markers:[],sessions:[],active:null,view:{x:0,y:0,z:1}}; let runtimeImage=null, runtimeImageBlob=null; let activeCampaignId=null;
let onboardingDismissed=false;
let mode="pan", drawing=false, calibratePts=[], draggingPoint=null, selectedPoint=null, pan=null, insertMode=false;
let movingLocationId=null, fitOnNextMapLoad=false; let sessionPickerDraft=null;
const colors=["#e05252","#4f8fd8","#5fb66c","#d5a343","#9b6bd3","#55b8b0"];



const APP_VERSION="1.33.0";
const CURRENT_DATA_VERSION=1;
const CURRENT_BACKUP_VERSION=1;
const BACKUP_FORMAT="fantasy-route-mapper";

function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,8)}

function esc(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}

async function renderCampaignHome(){
 let idx=await campaignList();
 $("#campaignGrid").innerHTML=idx.length?idx.map(c=>`<div class="campaignCard"><div class="campaignCardOrnament" aria-hidden="true">✦</div><span class="mapKind">${c.kind==="city"?"Stad":"Campagne"}</span><h3>${esc(c.name)}</h3><div class="campaignMeta">${c.imageName?`Kaart: ${esc(c.imageName)}<br>`:"Geen kaart geselecteerd<br>"}${c.kind==="city"?`${c.locations||0} locaties`:`${c.sessions||0} sessie${c.sessions===1?"":"s"}`}</div><div class="campaignButtons"><button class="primary" data-icon="route" data-open="${c.id}">Openen</button><details class="campaignMore"><summary title="Kaart beheren" aria-label="Acties voor ${esc(c.name)}">⋯</summary><div class="campaignMoreItems"><button data-icon="download" data-save-campaign="${c.id}">Exporteren</button><button data-icon="copy" data-dup="${c.id}">Dupliceer</button><button class="danger" data-icon="trash" data-del="${c.id}">Verwijder</button></div></details></div></div>`).join(""):`<div class="empty">Nog geen kaarten. Maak een campagne of stad aan.</div>`;
}

async function showCampaignHome(){resetDM();$("#dmPanel").classList.add("hidden");$("#terrainCanvas").style.display="none";$("#locationOverviewModal").classList.add("hidden");setRouteOverviewOpen(false,false);await flushSave();await renderCampaignHome();$("#campaignHome").classList.remove("hidden");syncCampaignHeader();$("#projectMenu").classList.add("hidden")}

let newProjectKind="campaign";
function newProject(kind="campaign"){
 newProjectKind=kind==="city"?"city":"campaign";
 const city=newProjectKind==="city";
 $("#newCampaignTitle").textContent=city?"Nieuwe stad":"Nieuwe campagne";
 $("#newProjectNameLabel").textContent=city?"Naam van de stad":"Naam van de campagne";
 $("#createCampaignBtn").textContent=city?"Stad maken":"Campagne maken";
 $("#newProjectHelp").textContent=city?"Kies na het aanmaken je stadskaart en voeg locaties toe.":"Kies na het aanmaken je wereldkaart via Kaart en Schaal.";
 $("#projectMenu").classList.add("hidden");
 $("#newCampaignError").textContent="";$("#newCampaignName").value=city?"Nieuwe stad":"Nieuwe campagne";
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

// Original artwork is bundled as separate PNG files in assets/.
const LOCATION_ICONS={"Cave":"assets/Cave.svg","Camp":"assets/Camp.svg","City": "assets/City.png", "Custom": "assets/Custom.png", "Dungeon": "assets/Dungeon.png", "Encounter": "assets/Encounter.png", "Inn": "assets/Inn.png", "Landmark": "assets/Landmark.png", "Ruin": "assets/Ruin.png", "Stronghold": "assets/Stronghold.png", "Town": "assets/Town.png", "Village": "assets/Village.png", "Party": "assets/Party.png"};
LOCATION_ICONS["Herberg"]="assets/city-0.svg";
LOCATION_ICONS["Winkel"]="assets/city-1.svg";
LOCATION_ICONS["Tempel"]="assets/city-2.svg";
LOCATION_ICONS["Woning"]="assets/city-3.svg";
LOCATION_ICONS["Markt"]="assets/city-4.svg";
LOCATION_ICONS["Gilde"]="assets/city-5.svg";
LOCATION_ICONS["Bestuur"]="assets/city-6.svg";
LOCATION_ICONS["Kazerne"]="assets/city-7.svg";
LOCATION_ICONS["Poort"]="assets/city-8.svg";
LOCATION_ICONS["Haven"]="assets/city-9.svg";
LOCATION_ICONS["Bezienswaardigheid"]="assets/city-10.svg";
LOCATION_ICONS["Overig"]="assets/city-11.svg";
function locationIcon(type){return LOCATION_ICONS[type==="Village / Inn"?"Village":type==="Ruins"?"Ruin":type]||LOCATION_ICONS.Landmark}
function iconSize(){return [24,32,48].includes(state.iconSize)?state.iconSize:32}

function syncCampaignHeader(){const home=!$("#campaignHome").classList.contains("hidden");$("#campaignHeader").classList.toggle("hidden",home||!activeCampaignId);$("#aboutBtn").classList.toggle("hidden",!home&&!!activeCampaignId);$("#homeInstallBtn").classList.toggle("hidden",!home&&!!activeCampaignId);if(home){$("#projectMenu").classList.add("hidden");$("#projectMenuBtn").setAttribute("aria-expanded","false")}}

// Cities share storage, map controls and export with campaigns, but have no travel UI.
const CITY_TYPES=['Herberg','Winkel','Tempel','Woning','Markt','Gilde','Bestuur','Kazerne','Poort','Haven','Bezienswaardigheid','Overig'];
const WORLD_TYPE_OPTIONS=$('#locationType').innerHTML;
let lastProjectUI=null;
function isCity(){return state.kind==='city'}
function syncLocationTypes(){
 const select=$('#locationType'),kind=isCity()?'city':'campaign';
 if(select.dataset.kind===kind)return;
 select.innerHTML=isCity()?CITY_TYPES.map(t=>`<option>${t}</option>`).join(''):WORLD_TYPE_OPTIONS;
 select.dataset.kind=kind;
}
function syncCityUI(){
 const city=isCity(),key=(state.campaignId||'')+':'+city;
 for(const id of ['layout','campaignSettingsDialog','partySettingsDialog'])$('#'+id).classList.toggle('cityMode',city);
 syncLocationTypes();
 if(lastProjectUI!==key){
  lastProjectUI=key;
  npcEditTarget=null;$('#npcEditForm').hidden=true;
  if(city){dmOpen=false;dmTool=null;dmDraft=null;dmShowTerrain=false;dmShowRoads=false;speedView=false;showDetailPane('placesPane')}
 }
 $('#timeSettingsBtn').hidden=city;
 if($('#playerCropLabel'))$('#playerCropLabel').hidden=city;
 $('#projectSettingsHeading').textContent=city?'Stadsinstellingen':'Campagne-instellingen';
 $('#campaignSettingsTitle').textContent=city?'Stadsinstellingen':'Kaart en Schaal';
 $('#campaignSettingsBtn').textContent=city?'Kaart en iconen':'Kaart en Schaal';
 $('#brandHome').title=city?'Stadsinstellingen':'Campagnelogboek';
 $('#brandHome').setAttribute('aria-controls',city?'campaignSettingsDialog':'logModal');
 const symbol=$('.brandLogLabel');if(symbol)symbol.innerHTML=city?'<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M4 7h16M4 17h16M8 4v6M16 14v6"/></svg>':'<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M12 5v15M12 5C9 3 5 3 2 4v15c3-1 7-1 10 1 3-2 7-2 10-1V4c-3-1-7-1-10 1Z"/></svg>';
 $('#mapProjectName').value=state.projectName||'';
 $('#locationDescriptionLabel').textContent='Notities';
 $('#npcTab').hidden=!city;
 renderNpcSidebar();
 $('#cityLocationFields').hidden=!city;
 $('#emptyMapTitle').textContent=city?'Nieuwe stad':'Nieuwe campagne';
 $('#emptyMapDescription').textContent=city?'Selecteer je stadskaart en markeer gebouwen en belangrijke plekken.':'Selecteer een wereldkaart om met deze campagne te beginnen.';
 $('#emptySelectMapBtn').textContent=city?'Stadskaart selecteren':'Wereldkaart selecteren';
 $('#emptyMapSteps').innerHTML=city?'1. Selecteer je stadskaart<br>2. Voeg locaties toe<br>3. Plaats je party<br>4. Exporteer een spelerskaart':'1. Selecteer je wereldkaart<br>2. Stel één keer de schaal in<br>3. Voeg routes en locaties toe<br>4. Houd je sessies bij';
 $('#partyDetailsHelp').textContent=city?'Sleep het icoon om de party te verplaatsen.':'Totalen uit het volledige logboek. Sleep het icoon om de party te verplaatsen.';
}
