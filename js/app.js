// Gedeelde applicatiestatus, algemene helpers en campagne-interface.
// Klassiek script: gedeelde globale scope; laadvolgorde staat in index.html.


const $=s=>document.querySelector(s), stage=$("#stage"), world=$("#world"), map=$("#map"), svg=$("#overlay");
let state={campaignId:null,imageName:"",projectName:"Fantasy Campaign",scale:null,unit:"mi",routes:[],markers:[],sessions:[],active:null,view:{x:0,y:0,z:1}}; let runtimeImage=null, runtimeImageBlob=null; let activeCampaignId=null;
let onboardingDismissed=false;
let mode="pan", drawing=false, calibratePts=[], draggingPoint=null, selectedPoint=null, pan=null, insertMode=false;
let movingLocationId=null, fitOnNextMapLoad=false; let sessionPickerDraft=null;
const colors=["#e05252","#4f8fd8","#5fb66c","#d5a343","#9b6bd3","#55b8b0"];



const APP_VERSION="1.40.0";
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
const LOCATION_ICONS={"Cave":"assets/Cave.svg","Camp":"assets/Camp.svg","City": "assets/City.png", "Custom": "assets/Custom.png", "Dungeon": "assets/Dungeon.png", "Encounter": "assets/Encounter.png", "Inn": "assets/Inn.png", "Landmark": "assets/Landmark.png", "Ruin": "assets/Ruin.png", "Stronghold": "assets/Stronghold.png", "Town": "assets/Town.png", "Village": "assets/Village.png", "Party": "assets/Party.svg"};
LOCATION_ICONS["Herberg"]="assets/city-category-0.svg";
LOCATION_ICONS["Winkel"]="assets/city-category-1.svg";
LOCATION_ICONS["Tempel"]="assets/city-category-3.svg";
LOCATION_ICONS["Woning"]="assets/city-category-6.svg";
LOCATION_ICONS["Markt"]="assets/city-category-2.svg";
LOCATION_ICONS["Gilde"]="assets/city-category-7.svg";
LOCATION_ICONS["Bestuur"]="assets/city-category-4.svg";
LOCATION_ICONS["Kazerne"]="assets/city-category-5.svg";
LOCATION_ICONS["Poort"]="assets/city-category-8.svg";
LOCATION_ICONS["Haven"]="assets/city-category-8.svg";
LOCATION_ICONS["Bezienswaardigheid"]="assets/city-category-10.svg";
LOCATION_ICONS["Overig"]="assets/city-category-11.svg";
function locationIcon(type){return (isCity()&&CITY_TYPE_ICONS[type])||(!isCity()&&worldTypeIcon(type))||LOCATION_ICONS[type==="Village / Inn"?"Village":type==="Ruins"?"Ruin":type]||LOCATION_ICONS.Landmark}
function iconSize(){return [24,32,48].includes(state.iconSize)?state.iconSize:32}

function syncCampaignHeader(){const home=!$("#campaignHome").classList.contains("hidden");$("#campaignHeader").classList.toggle("hidden",home||!activeCampaignId);$("#aboutBtn").classList.toggle("hidden",!home&&!!activeCampaignId);$("#homeInstallBtn").classList.toggle("hidden",!home&&!!activeCampaignId);$("#homeUpdateBtn").classList.toggle("hidden",!home&&!!activeCampaignId);if(home){$("#projectMenu").classList.add("hidden");$("#projectMenuBtn").setAttribute("aria-expanded","false")}}

// Cities share storage, map controls and export with campaigns, but have no travel UI.
const CITY_TYPE_ICONS={"Herberg": "assets/city-category-0.svg", "Taveerne": "assets/city-category-0.svg", "Restaurant": "assets/city-category-0.svg", "Bakkerij": "assets/city-category-0.svg", "Brouwerij": "assets/city-category-0.svg", "Eten en verblijf · Overig": "assets/city-category-0.svg", "Algemene winkel": "assets/city-category-1.svg", "Smederij": "assets/city-category-1.svg", "Harnasmaker": "assets/city-category-1.svg", "Wapenwinkel": "assets/city-category-1.svg", "Magische winkel": "assets/city-category-1.svg", "Toverdrankenwinkel": "assets/city-category-1.svg", "Alchemist": "assets/city-category-1.svg", "Boekhandel": "assets/city-category-1.svg", "Kledingwinkel": "assets/city-category-1.svg", "Juwelier": "assets/city-category-1.svg", "Winkels · Overig": "assets/city-category-1.svg", "Markt": "assets/city-category-2.svg", "Handelspost": "assets/city-category-2.svg", "Pakhuis": "assets/city-category-2.svg", "Werkplaats": "assets/city-category-2.svg", "Stal": "assets/city-category-2.svg", "Handel en ambacht · Overig": "assets/city-category-2.svg", "Tempel": "assets/city-category-3.svg", "Heiligdom": "assets/city-category-3.svg", "Klooster": "assets/city-category-3.svg", "Begraafplaats": "assets/city-category-3.svg", "Religie · Overig": "assets/city-category-3.svg", "Stadhuis": "assets/city-category-4.svg", "Raadszaal": "assets/city-category-4.svg", "Gerechtshof": "assets/city-category-4.svg", "Ambassade": "assets/city-category-4.svg", "Bestuur · Overig": "assets/city-category-4.svg", "Wachthuis": "assets/city-category-5.svg", "Kazerne": "assets/city-category-5.svg", "Arsenaal": "assets/city-category-5.svg", "Gevangenis": "assets/city-category-5.svg", "Wachttoren": "assets/city-category-5.svg", "Veiligheid en leger · Overig": "assets/city-category-5.svg", "Woning": "assets/city-category-6.svg", "Herenhuis": "assets/city-category-6.svg", "Landgoed": "assets/city-category-6.svg", "Paleis": "assets/city-category-6.svg", "Wonen · Overig": "assets/city-category-6.svg", "Avonturiersgilde": "assets/city-category-7.svg", "Handelaarsgilde": "assets/city-category-7.svg", "Magiërsgilde": "assets/city-category-7.svg", "Dievengilde": "assets/city-category-7.svg", "Ambachtsgilde": "assets/city-category-7.svg", "Gilden · Overig": "assets/city-category-7.svg", "Poort": "assets/city-category-8.svg", "Haven": "assets/city-category-8.svg", "Dok": "assets/city-category-8.svg", "Scheepswerf": "assets/city-category-8.svg", "Brug": "assets/city-category-8.svg", "Riool": "assets/city-category-8.svg", "Infrastructuur · Overig": "assets/city-category-8.svg", "Plein": "assets/city-category-9.svg", "Badhuis": "assets/city-category-9.svg", "Bibliotheek": "assets/city-category-9.svg", "Academie": "assets/city-category-9.svg", "Theater": "assets/city-category-9.svg", "Arena": "assets/city-category-9.svg", "Park": "assets/city-category-9.svg", "Openbaar en ontspanning · Overig": "assets/city-category-9.svg", "Monument": "assets/city-category-10.svg", "Fontein": "assets/city-category-10.svg", "Standbeeld": "assets/city-category-10.svg", "Ruïne": "assets/city-category-10.svg", "Bezienswaardigheden · Overig": "assets/city-category-10.svg", "Overig": "assets/city-category-11.svg", "Woontoren": "assets/city-category-6.svg", "Tovenaarstoren": "assets/city-category-6.svg", "Boerderij": "assets/city-category-2.svg", "Boomgaard": "assets/city-category-2.svg", "Persoon (marker)": "assets/extra-person.svg", "Tijdelijke plek": "assets/extra-place.svg"};
const CITY_CATEGORIES={"Eten en verblijf": ["Herberg", "Taveerne", "Restaurant", "Bakkerij", "Brouwerij", "Eten en verblijf · Overig"], "Winkels": ["Algemene winkel", "Smederij", "Harnasmaker", "Wapenwinkel", "Magische winkel", "Toverdrankenwinkel", "Alchemist", "Boekhandel", "Kledingwinkel", "Juwelier", "Winkels · Overig"], "Handel en ambacht": ["Markt", "Handelspost", "Pakhuis", "Werkplaats", "Stal", "Boerderij", "Boomgaard", "Handel en ambacht · Overig"], "Religie": ["Tempel", "Heiligdom", "Klooster", "Begraafplaats", "Religie · Overig"], "Bestuur": ["Stadhuis", "Raadszaal", "Gerechtshof", "Ambassade", "Bestuur · Overig"], "Veiligheid en leger": ["Wachthuis", "Kazerne", "Arsenaal", "Gevangenis", "Wachttoren", "Veiligheid en leger · Overig"], "Wonen": ["Woning", "Herenhuis", "Landgoed", "Paleis", "Woontoren", "Tovenaarstoren", "Wonen · Overig"], "Gilden": ["Avonturiersgilde", "Handelaarsgilde", "Magiërsgilde", "Dievengilde", "Ambachtsgilde", "Gilden · Overig"], "Infrastructuur": ["Poort", "Haven", "Dok", "Scheepswerf", "Brug", "Riool", "Infrastructuur · Overig"], "Openbaar en ontspanning": ["Plein", "Badhuis", "Bibliotheek", "Academie", "Theater", "Arena", "Park", "Openbaar en ontspanning · Overig"], "Bezienswaardigheden": ["Monument", "Fontein", "Standbeeld", "Ruïne", "Bezienswaardigheden · Overig"], "Overig": ["Persoon (marker)", "Tijdelijke plek", "Overig"]};
const CITY_TYPES=Object.values(CITY_CATEGORIES).flat();
const WORLD_TYPE_OPTIONS=$('#locationType').innerHTML;
let lastProjectUI=null;
function isCity(){return state.kind==='city'}
function syncLocationTypes(){
 const select=$('#locationType'),kind=isCity()?'city':'campaign';
 if(select.dataset.kind===kind)return;
 select.innerHTML=isCity()?cityTypeOptions('Overig'):WORLD_TYPE_OPTIONS;
 select.dataset.kind=kind;
}
function syncCityUI(){
 const city=isCity(),key=(state.campaignId||'')+':'+city;
 for(const id of ['layout','campaignSettingsDialog','partySettingsDialog'])$('#'+id).classList.toggle('cityMode',city);
 syncLocationTypes();
 if(lastProjectUI!==key){
  lastProjectUI=key;resetCityView();
  npcEditTarget=null;$('#npcEditForm').hidden=true;
  if(city){dmOpen=false;dmTool=null;dmDraft=null;dmShowTerrain=false;dmShowRoads=false;speedView=false;showDetailPane('placesPane')}
 }
 $('#timeSettingsBtn').hidden=city;
 if($('#playerCropLabel'))$('#playerCropLabel').hidden=city;
 $('#projectSettingsHeading').textContent=city?'Stadsinstellingen':'Campagne-instellingen';
 $('#campaignSettingsTitle').textContent=city?'Stadsinstellingen':'Kaart en Schaal';
 $('#campaignSettingsBtn').textContent=city?'Kaart, schaal en looptijd':'Kaart en Schaal';
 $('#brandHome').title=city?'Stadsinstellingen':'Campagnelogboek';
 $('#brandHome').setAttribute('aria-controls',city?'campaignSettingsDialog':'logModal');
 const symbol=$('.brandLogLabel');if(symbol)symbol.innerHTML=city?'<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M4 7h16M4 17h16M8 4v6M16 14v6"/></svg>':'<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M12 5v15M12 5C9 3 5 3 2 4v15c3-1 7-1 10 1 3-2 7-2 10-1V4c-3-1-7-1-10 1Z"/></svg>';
 $('#mapProjectName').value=state.projectName||'';
 $('#locationDescriptionLabel').textContent='Notities';
 $('#npcTab').hidden=!city;
 renderNpcSidebar();
 $('#cityLocationFields').hidden=!city;
 syncCityExtensions();
 $('#emptyMapTitle').textContent=city?'Nieuwe stad':'Nieuwe campagne';
 $('#emptyMapDescription').textContent=city?'Selecteer je stadskaart en markeer gebouwen en belangrijke plekken.':'Selecteer een wereldkaart om met deze campagne te beginnen.';
 $('#emptySelectMapBtn').textContent=city?'Stadskaart selecteren':'Wereldkaart selecteren';
 $('#emptyMapSteps').innerHTML=city?'1. Selecteer je stadskaart<br>2. Voeg locaties toe<br>3. Plaats je party<br>4. Exporteer een spelerskaart':'1. Selecteer je wereldkaart<br>2. Stel één keer de schaal in<br>3. Voeg routes en locaties toe<br>4. Houd je sessies bij';
 $('#partyDetailsHelp').textContent=city?'Sleep het icoon om de party te verplaatsen.':'Totalen uit het volledige logboek. Sleep het icoon om de party te verplaatsen.';
}

const WORLD_CATEGORIES={"Nederzettingen": ["City", "Town", "Village", "Hamlet", "Outpost"], "Vestingwerken": ["Castle", "Keep", "Fort", "Citadel", "Watchtower", "Stronghold"], "Kerkers": ["Dungeon", "Crypt", "Tomb", "Temple", "Lair", "Mine"], "Wildernis": ["Forest", "Mountain", "Swamp", "Desert", "Plains", "Hills"], "Water": ["River", "Lake", "Sea", "Waterfall", "Spring"], "Grotten": ["Cave", "Grotto", "Cavern", "Underdark Entrance"], "Kampen": ["Camp", "Military Camp", "Bandit Camp", "Caravan Camp"], "Ruïnes": ["Ruins", "Abandoned Settlement", "Fallen Keep", "Ancient Site"], "Bezienswaardigheden": ["Monument", "Standing Stones", "Giant Tree", "Crater", "Natural Wonder", "Landmark"], "Ontmoetingen": ["Combat", "Creature", "NPC", "Event", "Encounter"], "Reizen": ["Road", "Bridge", "Pass", "Crossing", "Portal"], "Overig": ["Custom", "Village / Inn", "Inn"]};
