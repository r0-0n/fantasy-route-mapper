// Integration of the actual event handlers against a minimal DOM double.
// This does not claim browser layout or real IndexedDB coverage.
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),html=fs.readFileSync(root+'/index.html','utf8'),nodes=new Map(),alerts=[];
function el(id=''){
 const classes=new Set(),events={};let markup='',value='';
 const n={id,dataset:{},style:{},checked:false,disabled:false,textContent:'',options:[],naturalWidth:1000,naturalHeight:800,clientWidth:1000,clientHeight:800,
 classList:{add(...a){a.forEach(x=>classes.add(x))},remove(...a){a.forEach(x=>classes.delete(x))},contains:x=>classes.has(x),toggle(x,v){v=v??!classes.has(x);v?classes.add(x):classes.delete(x);return v}},
 setAttribute(k,v){this[k]=v},removeAttribute(){},setPointerCapture(){},appendChild(){},cloneNode(){return el()},querySelectorAll(){return []},getBoundingClientRect(){return {left:0,top:0,width:1000,height:800}},
 showModal(){this.open=true},close(){this.open=false;events.close?.forEach(f=>f({target:this}))},focus(){},select(){},click(){return this.onclick?.({target:this,preventDefault(){},stopPropagation(){}})},addEventListener(t,f){(events[t]??=[]).push(f)},dispatch(t){events[t]?.forEach(f=>f({target:this}))}};
 Object.defineProperty(n,'innerHTML',{get:()=>markup,set:s=>{markup=s;n.options=[...s.matchAll(/<option(?: value="([^"]*)")?([^>]*)>([^<]*)<\/option>/g)].map(m=>({value:m[1]??m[3],textContent:m[3],selected:m[2].includes('selected')}));if(n.options.length)value=(n.options.find(x=>x.selected)||n.options[0]).value}});
 Object.defineProperty(n,'value',{get:()=>value,set:x=>{value=String(x)}});Object.defineProperty(n,'selectedOptions',{get:()=>n.options.filter(x=>x.value===value)});return n;
}
for(const m of html.matchAll(/<([\w-]+)\b([^>]*\bid="([^"]+)"[^>]*)>/g)){
 const n=el(m[3]);for(const c of (m[2].match(/class="([^"]+)"/)?.[1]||'').split(' '))n.classList.add(c);n.value=m[2].match(/value="([^"]*)"/)?.[1]||'';nodes.set('#'+m[3],n);
}
for(const m of html.matchAll(/<select\b[^>]*id="([^"]+)"[^>]*>([\s\S]*?)<\/select>/g))nodes.get('#'+m[1]).innerHTML=m[2];
const tabs=['routePane','placesPane'].map(id=>{const n=el();n.dataset.tab=id;return n}),panes=tabs.map(t=>nodes.get('#'+t.dataset.tab));
const query=s=>s.startsWith('[data-tab=')?tabs.find(t=>s.includes(t.dataset.tab)):nodes.get(s)||null;
const document={querySelector:query,querySelectorAll:s=>s==='.tab[data-tab]'||s==='.tab'?tabs:s==='.tabpane'?panes:[],createElement:()=>el(),createElementNS:()=>el(),addEventListener(){}};
const ctx=vm.createContext({document,window:{addEventListener(){}},console,Blob,URL,atob,Uint8Array,localStorage:{getItem:()=>null,setItem(){}},setTimeout:()=>0,clearTimeout(){},alert:x=>alerts.push(x),confirm:()=>true});
const run=s=>vm.runInContext(s,ctx),files=[...html.matchAll(/<script src="([^?"]+)[^"]*"/g)].map(x=>x[1]);
for(const f of files.filter(f=>!f.endsWith('init.js')))run(fs.readFileSync(root+'/'+f,'utf8'));
run(`save=()=>{};runtimeImage='test';activeCampaignId='test';state.campaignId='test';state.markers=[{id:'a',name:'Haven',x:10,y:20,type:'Town'},{id:'b',name:'Bos',x:100,y:200,type:'Landmark'},{id:'c',name:'Berg',x:400,y:500,type:'Landmark'}];bindRouteSearchUI();bindRouteEditorUI();bindLocationPlacementUI();bindLocationEditorUI();bindMapPointerUI();bindOverviewUI();render()`);
run(`createRouteBetween('a','b')`);assert.equal(run('state.routes.length'),1);assert.equal(run('activeRoute().points.length'),2);assert.equal(run('activeRoute().log.fromLocationId'),'a');assert.equal(run('activeRoute().log.toLocationId'),'b');assert.equal(run('mode'),'pan');
assert.throws(()=>run(`createRouteBetween('missing','b')`));assert.equal(run('state.routes.length'),1);
// Endpoint changes preserve bends; moving the endpoint follows the location.
run(`activeRoute().points.splice(1,0,{x:55,y:60});setRouteEndpoints(activeRoute(),'a','c')`);assert.equal(run('activeRoute().points[1].x'),55);assert.equal(run('activeRoute().points[2].x'),400);
run(`markerById('c').x=450;updateRoutesForMovedLocation(markerById('c'))`);assert.equal(run('activeRoute().points[2].x'),450);assert.equal(run('activeRoute().points[1].x'),55);
run('migrateLegacy=async()=>{};campaignList=async()=>[];renderCampaignHome=async()=>{};flushSave=async()=>{}');
run(fs.readFileSync(root+'/js/init.js','utf8'));
tabs[0].click();assert(nodes.get('#routeOverviewPanel').classList.contains('hidden'));assert(nodes.get('#routePane').classList.contains('active'));assert(!nodes.get('#placesPane').classList.contains('active'));
tabs[1].click();assert(nodes.get('#locationOverviewModal').classList.contains('hidden'));assert(nodes.get('#routeOverviewPanel').classList.contains('hidden'));assert(nodes.get('#placesPane').classList.contains('active'));assert(!nodes.get('#routePane').classList.contains('active'));
nodes.get('#locationOverviewBtn').click();assert(!nodes.get('#locationOverviewModal').classList.contains('hidden'));
tabs[0].click();nodes.get('#routeOverviewToggle').click();assert(!nodes.get('#routeOverviewPanel').classList.contains('hidden'));
nodes.get('#logbookBtn').click();assert(!nodes.get('#logModal').classList.contains('hidden'));assert(nodes.get('#locationOverviewModal').classList.contains('hidden'));
// Use actual overview/editor handlers; editor lives in the sidebar.
run(`setRouteOverviewOpen(true)`);assert.equal(nodes.get('#routeOverviewPanel').classList.contains('hidden'),false);assert(nodes.get('#routeList').innerHTML.includes('<table'));
run(`chooseOverviewRoute(state.active)`);assert.equal(nodes.get('#routeOverviewPanel').classList.contains('hidden'),true);assert(nodes.get('#routePane').classList.contains('active'));
run(`openLocationOverview()`);assert(!nodes.get('#locationOverviewModal').classList.contains('hidden'));assert(nodes.get('#markerList').innerHTML.includes('<table'));
run(`openLocationEditor('a')`);assert(nodes.get('#locationOverviewModal').classList.contains('hidden'));assert(nodes.get('#placesPane').classList.contains('active'));assert(!nodes.get('#locationModal').classList.contains('hidden'));
nodes.get('#locationName').value='Nieuwe haven';nodes.get('#locationName').dispatch('input');assert.equal(run(`markerById('a').name`),'Nieuwe haven');assert.equal(run('state.routes[0].log.from'),'Nieuwe haven');
nodes.get('#moveLocationBtn').click();assert.equal(run('mode'),'moveLocation');assert(!nodes.get('#locationModal').classList.contains('hidden'));
run(`state.view={x:0,y:0,z:1};commitLocationMove({clientX:30,clientY:40,target:{closest:()=>null},preventDefault(){},stopImmediatePropagation(){}})`);assert.equal(run(`markerById('a').x`),30);assert.equal(run('state.routes[0].points[0].x'),30);assert.equal(run('mode'),'pan');
const count=run('state.markers.length');nodes.get('#deleteLocationBtn').click();assert.equal(run('state.markers.length'),count);assert(alerts.pop().includes('begin of einde'));
// Drawing starts anchored and finishes at the chosen destination, preserving bends.
run(`createRouteBetween('a','b',true);appendRouteDrawPoint({x:50,y:80});finishRouteDrawing()`);assert.equal(run('activeRoute().points.length'),2);assert.equal(run('activeRoute().points[1].x'),50);assert.equal(run('activeRoute().log.toLocationId'),'b');
// Legacy first/last-point snapping; no synthetic location migration.
run(`state.routes.push({id:'legacy',name:'Oud',points:[],log:{}});state.active='legacy';drawing=true;mode='route';appendRouteDrawPoint({x:31,y:41});appendRouteDrawPoint({x:101,y:201});finishRouteDrawing()`);assert.equal(run('activeRoute().log.fromLocationId'),'a');assert.equal(run('activeRoute().log.toLocationId'),'b');
run(`selectedPoint=0`);nodes.get('#deletePointBtn').click();assert.equal(run('activeRoute().points[0].x'),30);assert(alerts.pop().includes('gekoppeld'));
run(`createRouteBetween('a','a')`);assert.equal(run('activeRoute().log.fromLocationId'),run('activeRoute().log.toLocationId'));
assert.equal(alerts.length,0);
// Optional endpoints and stop-without-extension.
run(`createRouteBetween('','');appendRouteDrawPoint({x:600,y:600});appendRouteDrawPoint({x:700,y:650})`);
const freePoints=run('JSON.stringify(activeRoute().points)');run('finishRouteDrawing()');assert.equal(run('JSON.stringify(activeRoute().points)'),freePoints);assert.equal(run('activeRoute().log.fromLocationId'),null);
run(`setRouteEndpoints(activeRoute(),'a','b')`);assert.equal(run('activeRoute().log.fromLocationId'),'a');run(`setRouteEndpoints(activeRoute(),'','')`);assert.equal(run('activeRoute().log.toLocationId'),null);
run(`createRouteBetween('a','b',true);appendRouteDrawPoint({x:60,y:70});finishRouteDrawing()`);const unfinished=run('JSON.stringify(activeRoute().points)');run(`const oldB={...markerById('b')};markerById('b').x+=10;updateRoutesForMovedLocation(markerById('b'),oldB)`);assert.equal(run('JSON.stringify(activeRoute().points)'),unfinished);
// A normal click only selects. Insertion is an explicit persistent toggle.
run(`state.routes.push({id:'insert',points:[{x:0,y:0},{x:100,y:0}],log:{}});state.active='insert';mode='pan'`);
run(`stage.onpointerdown({target:{closest:s=>s==='[data-route-id]'?{dataset:{routeId:'insert'}}:null},clientX:30,clientY:0})`);
assert.equal(run('activeRoute().points.length'),2);nodes.get('#insertBtn').click();assert.equal(run('mode'),'insert');
run(`stage.onpointerdown({target:{closest:s=>s==='[data-route-id]'?{dataset:{routeId:'insert'}}:null},clientX:30,clientY:0})`);
run(`stage.onpointerdown({target:{closest:s=>s==='[data-route-id]'?{dataset:{routeId:'insert'}}:null},clientX:70,clientY:0})`);assert.equal(run('activeRoute().points.length'),4);assert.equal(run('mode'),'insert');nodes.get('#insertBtn').click();assert.equal(run('mode'),'pan');
// Campaign conversion changes all routes and new-route pace; travel time stays equal.
run(`state.scale={perPixel:1,unit:'mi'};state.unit='mi';state.routes.forEach(r=>{r.log.pace=24});`);
const oldDistance=run('routeDistance(activeRoute())');nodes.get('#unit').onchange({target:{value:'km'}});assert(Math.abs(run('routeDistance(activeRoute())')-oldDistance*1.609344)<1e-8);
run(`createRouteBetween('a','b')`);assert.equal(run('activeRoute().log.pace'),24*1.609344);
// Explicit hide wins over zoom/selection/global automatic-name display.
run(`openLocationEditor('a');$('#locationShowName').checked=false;$('#locationType').value='Encounter';saveLocationDetails();state.view.z=3`);
assert.equal(run(`locationLabelVisible(markerById('a'))`),false);assert.equal(run(`markerById('a').type`),'Encounter');
run(`$('#locationShowName').checked=true;saveLocationDetails();state.view.z=.1`);assert.equal(run(`locationLabelVisible(markerById('a'))`),true);
assert(run(`JSON.stringify(projectData()).includes('"labelMode":"show"')`));
// Route creation no longer has a separate mode selector.
assert(!html.includes('id="newRouteMode"'));assert(!html.includes('id="showAllLocationNames"'));
run(`openNewRouteDialog();$('#newRouteStart').value='';$('#newRouteEnd').value='';$('#newRouteForm').onsubmit({preventDefault(){}})`);assert.equal(run('drawing'),true);assert.equal(run('activeRoute().points.length'),0);
run(`openNewRouteDialog();$('#newRouteStart').value='a';$('#newRouteEnd').value='b';$('#newRouteForm').onsubmit({preventDefault(){}})`);assert.equal(run('drawing'),false);assert.equal(run('activeRoute().points.length'),2);
run(`$('#campaignSettingsDialog').showModal();$('#sideCalibrateBtn').click()`);assert.equal(nodes.get('#campaignSettingsDialog').open,false);assert.equal(run('mode'),'calibrate');
run(`markerById('a').labelMode='auto';state.view.z=.1`);assert.equal(run(`locationLabelVisible(markerById('a'))`),true);
run(`openLocationEditor('a');markerById('a').region='Oude regio';markerById('a').faction='Oude factie';$('#locationName').value='Gewijzigd';saveLocationDetails()`);
assert.equal(run(`markerById('a').region`),'Oude regio');assert.equal(run(`markerById('a').faction`),'Oude factie');
assert(!nodes.get('#markerList').innerHTML.includes('<th scope="col">Regio</th>'));
run(`$('#routeSearch').value='xyz';$('#clearRouteSearch').click()`);assert.equal(nodes.get('#routeSearch').value,'');
for(const id of ['saveLocationBtn','closeLocationBtn','locationRegion','locationFaction'])assert(!html.includes('id="'+id+'"'));
// Deselecting preserves routes, hides the editor and survives campaign normalization.
run(`createRouteBetween('a','b');mode='insert';insertMode=true;selectedPoint=1`);
const beforeDeselect=run('JSON.stringify(state.routes)');nodes.get('#clearRouteSelectionBtn').click();
assert.equal(run('state.active'),null);assert.equal(run('mode'),'pan');assert.equal(run('selectedPoint'),null);assert.equal(run('insertMode'),false);assert.equal(run('JSON.stringify(state.routes)'),beforeDeselect);
assert(nodes.get('#activeRouteCompact').classList.contains('hidden'));assert(!nodes.get('#noActiveRoute').classList.contains('hidden'));
run('state=prepareCampaignData(JSON.parse(JSON.stringify(projectData())));normalize();render()');assert.equal(run('state.active'),null);
run('chooseOverviewRoute(state.routes[0].id)');assert(!nodes.get('#activeRouteCompact').classList.contains('hidden'));assert.equal(run('state.active'),run('state.routes[0].id'));
run(`openLocationEditor('a')`);assert.equal(run('state.active'),null);assert.equal(run('selectedLocationId'),'a');assert(!nodes.get('#locationModal').classList.contains('hidden'));
const markersBefore=run('JSON.stringify(state.markers)');nodes.get('#clearLocationSelectionBtn').click();assert.equal(run('selectedLocationId'),null);assert.equal(run('JSON.stringify(state.markers)'),markersBefore);assert(nodes.get('#locationModal').classList.contains('hidden'));assert(!nodes.get('#noSelectedLocation').classList.contains('hidden'));
run(`openLocationEditor('a');chooseOverviewRoute(state.routes[0].id)`);assert.equal(run('selectedLocationId'),null);assert(nodes.get('#locationModal').classList.contains('hidden'));assert(!nodes.get('#activeRouteCompact').classList.contains('hidden'));
console.log('PASS deselect without data loss, editor visibility, stopped edit mode, normalized backup roundtrip and reselection');
console.log('PASS selection without insertion, persistent insertion toggle, optional route form, campaign calibration entry and checkbox compatibility');
console.log('PASS optional endpoints, unchanged geometry on stop, repeated line clicks, campaign units/new pace, encounter and persistent per-location name settings');
console.log('PASS integration: overview tables, sidebar selection/autosave/movement, route endpoint linking, straight/drawn routes, legacy snapping, intermediate points and protected linked endpoints (simulated DOM).');

// 1.8: no-route registrations, ordering, artwork and persisted campaign settings.
run(`state.sessions=[];openSessionEditor(null)`);
nodes.get('#sessionTitle').value='Rustdag';nodes.get('#sessionNotes').value='In de herberg';nodes.get('#sessionGameDays').value='2';nodes.get('#saveSessionBtn').click();
assert.equal(run('state.sessions.length'),1);assert.equal(run('state.sessions[0].routeIds.length'),0);assert.equal(run('state.sessions[0].travelSnapshot.name'),'Rustdag');assert.equal(run('travelDistance(travelRows()[0])'),0);assert.equal(run('travelElapsed(travelRows()[0]).days'),2);
run(`openSessionEditor(state.sessions[0].id)`);nodes.get('#sessionTitle').value='Rust en overleg';nodes.get('#saveSessionBtn').click();assert.equal(run('state.sessions[0].travelSnapshot.name'),'Rust en overleg');
run(`state.scale={perPixel:1};state.routes=[{id:'short',name:'Kort',points:[{x:0,y:0},{x:24,y:0}],log:{pace:24}},{id:'long',name:'Lang',points:[{x:0,y:0},{x:96,y:0}],log:{pace:24}},{id:'unknown',name:'Onbekend',points:[],log:{pace:0}}]`);
nodes.get('#routeSearch').value='';nodes.get('#routeFilter').value='all';nodes.get('#routeSort').value='durationAsc';assert.equal(run('filteredSortedRoutes().map(r=>r.id).join()'),'short,long,unknown');nodes.get('#routeSort').value='durationDesc';assert.equal(run('filteredSortedRoutes().map(r=>r.id).join()'),'long,short,unknown');
run(`state.markers.push({id:'region',type:'Region',name:'Regio',x:0,y:0});normalize()`);assert.equal(run(`markerById('region').type`),'Landmark');assert.equal(run(`locationIcon('Ruins')===LOCATION_ICONS.Ruin`),true);
nodes.get('#placePartyBtn').click();assert.equal(run('mode'),'party');run(`state.view={x:0,y:0,z:1};stage.onpointerdown({target:{closest:()=>null},clientX:70,clientY:80})`);assert.equal(run('state.party.x'),70);assert.equal(run('mode'),'pan');
nodes.get('#iconSize').onchange({target:{value:'48'}});run(`state=JSON.parse(JSON.stringify(state));normalize()`);assert.equal(run('iconSize()'),48);assert.equal(run('state.party.y'),80);
run(`chooseOverviewRoute('short')`);nodes.get('#transport').onchange({target:{value:'Paard'}});assert.equal(run('activeRoute().log.transport'),'Paard');assert.equal(run('activeRoute().log.pace'),24*1.609344);
nodes.get('#removePartyBtn').click();assert.equal(run('state.party'),null);
console.log('PASS 1.8 no-travel create/edit, duration ordering, Region migration, icon mapping, party placement/removal and persistence, transport change with campaign-unit conversion (simulated DOM)');

// 1.9 calendar arithmetic: leap days, festivals, half days, storage and both editor modes.
assert.equal(run("gameDateFromOrdinal(gameOrdinal('2024-02-28','gregorian')+2,'gregorian')"),'2024-03-01');
assert.equal(run("gameOrdinal('2023-02-29','gregorian')"),null);
assert.equal(run("gameDateFromOrdinal(gameOrdinal('Midsummer 1492 DR','harptos')+1,'harptos')"),'Shieldmeet 1492 DR');
run("state.calendar='gregorian';state.sessions=[];openSessionEditor(null)");assert.equal(nodes.get('#sessionRealDate').value,run('localToday()'));assert.equal(nodes.get('#sessionGameStart').type,'date');
nodes.get('#sessionGameStart').value='2024-02-28';nodes.get('#sessionGameDays').value='2.5';run('updateSessionDays()');assert.equal(nodes.get('#sessionGameEnd').value,'2024-03-01');assert.equal(nodes.get('#sessionEndHalf').value,'0.5');nodes.get('#saveSessionBtn').click();assert.equal(run('state.sessions[0].gameDays'),2.5);assert.equal(run('entryDuration(state.sessions[0])'),2.5);
run("state.calendar='harptos';openSessionEditor(state.sessions[0].id)");assert.equal(run('sessionCalendar'),'gregorian');nodes.get('#sessionAutoDays').checked=true;nodes.get('#sessionGameEnd').value='2024-03-02';run('updateSessionDays()');assert.equal(nodes.get('#sessionGameDays').value,'3.5');nodes.get('#saveSessionBtn').click();assert.equal(run('travelElapsed(travelRows()[0]).days'),3.5);
run("openSessionEditor(null)");nodes.get('#sessionGameStart').value='Midsummer 1492 DR';nodes.get('#sessionGameDays').value='1.5';run('updateSessionDays()');assert.equal(nodes.get('#sessionGameEnd').value,'Shieldmeet 1492 DR');nodes.get('#saveSessionBtn').click();assert.equal(run('state.sessions[1].calendar'),'harptos');
run("state.unit='mi';createRouteBetween(null,null);activeRoute().points=[{x:0,y:0},{x:60,y:0}];state.scale={perPixel:1};activeRoute().log.transport='Lopend';activeRoute().log.pacePreset='normal';applyTransportPace(activeRoute());openSessionEditor(null);sessionPickerDraft.routeIds.add(state.active);fillSessionRouteDuration()");assert.equal(nodes.get('#sessionGameDays').value,'2.5');
run("activeRoute().log.transport='Paard';applyTransportPace(activeRoute())");assert.equal(run('activeRoute().log.pace'),24);run("activeRoute().log.pacePreset='fast';applyTransportPace(activeRoute())");assert.equal(run('activeRoute().log.pace'),30);run("activeRoute().log.transport='Boot';applyTransportPace(activeRoute())");assert.equal(run('activeRoute().log.pace'),48);
// Real pointer handlers: offset-preserving drag, no second-click jump, cancel restores original.
run("state.party={x:100,y:100};state.view={x:0,y:0,z:2};stage.onpointerdown({pointerId:1,clientX:210,clientY:210,target:{closest:s=>s==='[data-party]'?{}:null}})");assert.equal(run('partySelected'),true);assert(!nodes.get('#partyDetails').classList.contains('hidden'));run("stage.onpointermove({clientX:250,clientY:270});stage.onpointerup({pointerId:1})");assert.equal(run('state.party.x'),120);assert.equal(run('state.party.y'),130);assert.equal(run('mode'),'pan');
run("stage.onpointerdown({pointerId:2,clientX:240,clientY:260,target:{closest:s=>s==='[data-party]'?{}:null}});stage.onpointermove({clientX:400,clientY:400});stage.onpointercancel()");assert.equal(run('state.party.x'),120);
run("state.routes=[{id:'done',status:'done',points:[{x:200,y:200},{x:400,y:300}]},{id:'planned',status:'planned',points:[{x:0,y:0},{x:990,y:790}]}];state.sessions=[]");
assert.equal(run("JSON.stringify(playerCropBounds(new Set(['done','planned']),1000,800))"),JSON.stringify({x:120,y:120,width:360,height:260}));assert.equal(run("playerCropBounds(new Set(['planned']),1000,800).width"),1000);assert.equal(run("playerCropBounds(new Set(['done']),1000,800,false).width"),1000);
console.log('PASS 1.9 calendars/leap days/half days, existing calendar retention, route duration autofill, transport paces, party pointer drag/cancel/sidebar and traveled-area crop (simulated DOM)');
// 1.10 campaign title, independent party pane and shared canvas painter.
run("state.routes=[];state.sessions=[];state.projectName='Dragon Campaign';activeCampaignId='test';render()");assert.equal(document.title,'Dragon Campaign');
nodes.get('#projectName').onchange({target:{value:'New Campaign'}});assert.equal(document.title,'New Campaign');
run("state.party={x:100,y:100};stage.onpointerdown({pointerId:1,clientX:200,clientY:200,target:{closest:s=>s==='[data-party]'?{}:null}});stage.onpointerup({pointerId:1})");assert(tabs.every(t=>!t.classList.contains('active')));assert(panes.every(p=>!p.classList.contains('active')));assert(!nodes.get('#partyDetails').classList.contains('hidden'));tabs[1].click();assert(nodes.get('#partyDetails').classList.contains('hidden'));
assert(html.includes('rel="icon" type="image/png" href="assets/logo.png"'));assert(!html.includes('data:image/png;base64,'));
run("state.markers=[{id:'inn',type:'Inn',name:'Inn',x:10,y:10},{id:'village',type:'Village',name:'Village',x:20,y:20}];normalize()");assert.equal(run("state.markers.every(m=>m.type==='Village / Inn')"),true);assert.equal(run("locationIcon('Village / Inn')===LOCATION_ICONS.Village"),true);
run("createRouteBetween(null,null)");nodes.get('#routeColor').oninput({target:{value:'#4e90df'}});run("createRouteBetween(null,null)");assert.equal(run('activeRoute().color'),'#4e90df');assert.equal(run('ROUTE_COLORS.length'),10);nodes.get('#iconEmphasis').onchange({target:{checked:false}});assert.equal(run('state.iconEmphasis'),false);run('state=JSON.parse(JSON.stringify(state));normalize()');assert.equal(run('state.routeColor'),'#4e90df');assert.equal(run('state.iconEmphasis'),false);run('state.iconEmphasis=true');
// 1.12 chained dates and end-date entry.
run("state.calendar='gregorian';state.sessions=[{id:'s1',number:'1',calendar:'gregorian',gameStart:'2024-02-28',gameEnd:'2024-02-29',gameDays:1,routeIds:[],locationIds:[]},{id:'s2',number:'2',calendar:'gregorian',gameStart:'2024-03-01',gameEnd:'2024-03-03',gameDays:2,routeIds:[],locationIds:[]}];openSessionEditor(null)");assert.equal(nodes.get('#sessionGameStart').value,'2024-03-03');
run("openSessionEditor('s1')");nodes.get('#sessionGameEnd').value='2024-03-01';nodes.get('#sessionGameEnd').oninput();assert.equal(nodes.get('#sessionGameDays').value,'2');nodes.get('#saveSessionBtn').click();assert.equal(run('state.sessions[1].gameStart'),'2024-03-02');assert.equal(run('state.sessions[1].gameEnd'),'2024-03-04');assert.equal(run('state.sessions[1].gameDays'),2);
run("state.routes=[];state.markers=[{x:100,y:100},{x:300,y:300}];state.party=null;fitCreatedContent()");assert.equal(run('200*state.view.z+state.view.x'),500);assert.equal(run('200*state.view.z+state.view.y'),400);
nodes.get('#aboutBtn').click();assert(nodes.get('#aboutDialog').open);nodes.get('#closeAboutBtn').click();assert(!nodes.get('#aboutDialog').open);
console.log('PASS 1.12 previous endpoint default, editable end date, subsequent dates shifted preserving duration/gaps, map overview and about dialog');
(async()=>{
 const contexts=[];
 document.createElement=type=>{if(type!=='canvas')return el();const calls=[],context={calls,getImageData(){return {}},save(){},restore(){},drawImage(...a){calls.push(['image',...a])},setLineDash(){},beginPath(){},moveTo(){},lineTo(){},stroke(){},arc(...a){calls.push(['arc',...a])},fill(){},strokeText(){},fillText(...a){calls.push(['text',this.font,...a])}};contexts.push(context);return {width:0,height:0,getContext:()=>context}};
 document.querySelectorAll=s=>s==='[data-player-location]:checked'?[{dataset:{playerLocation:'icon-test'}}]:[];
 run("state.party=null;state.markers=[{id:'icon-test',name:'Town',type:'Town',x:200,y:200}];loadPlayerIcon=async()=>({});");
 nodes.get('#playerCrop').checked=false;nodes.get('#playerTextSize').value='20';nodes.get('#playerIconSize').value='64';
 const canvas=await run('paintPlayerMap()');assert.equal(canvas.width,1000);assert.equal(canvas.height,800);assert(contexts[0].calls.some(x=>x[0]==='arc'&&x[3]===21.875));assert(contexts[0].calls.some(x=>x[0]==='text'&&x[1]==='600 12.5px sans-serif'));
 nodes.get('#playerTextSize').value='40';nodes.get('#playerIconSize').value='128';await run('paintPlayerMap()');assert(contexts[2].calls.some(x=>x[0]==='arc'&&x[3]===41.875));assert(contexts[2].calls.some(x=>x[0]==='text'&&x[1]==='600 25px sans-serif'));
 run("state.markers[0].visible=false;state.routes=[]");await run('paintPlayerMap()');assert(!contexts[4].calls.some(x=>x[0]==='arc'||x[0]==='text'));
 run("state.markers[0].visible=true;state.markers[0].labelMode='hide';state.iconEmphasis=false");await run('paintPlayerMap()');assert(!contexts[6].calls.some(x=>x[0]==='arc'||x[0]==='text'));assert(contexts[6].calls.filter(x=>x[0]==='image').length===2);
 console.log('PASS 1.11 category migration, remembered palette choice, saved emphasis preference and export visibility/name/badge settings');
 console.log('PASS 1.10 campaign tab title, standalone party selection, embedded favicon and independent export text/icon sliders (simulated canvas)');
})().catch(e=>{console.error(e);process.exitCode=1});
