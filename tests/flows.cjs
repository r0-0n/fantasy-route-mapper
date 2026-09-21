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
tabs[0].click();assert(!nodes.get('#routeOverviewPanel').classList.contains('hidden'));
tabs[1].click();assert(!nodes.get('#locationOverviewModal').classList.contains('hidden'));assert(nodes.get('#routeOverviewPanel').classList.contains('hidden'));
nodes.get('#logbookBtn').click();assert(!nodes.get('#logModal').classList.contains('hidden'));assert(nodes.get('#locationOverviewModal').classList.contains('hidden'));
// Use actual overview/editor handlers; editor lives in the sidebar.
run(`setRouteOverviewOpen(true)`);assert.equal(nodes.get('#routeOverviewPanel').classList.contains('hidden'),false);assert(nodes.get('#routeList').innerHTML.includes('<table'));
run(`chooseOverviewRoute(state.active)`);assert.equal(nodes.get('#routeOverviewPanel').classList.contains('hidden'),true);assert(nodes.get('#routePane').classList.contains('active'));
run(`openLocationOverview()`);assert(!nodes.get('#locationOverviewModal').classList.contains('hidden'));assert(nodes.get('#markerList').innerHTML.includes('<table'));
run(`openLocationEditor('a')`);assert(nodes.get('#locationOverviewModal').classList.contains('hidden'));assert(nodes.get('#placesPane').classList.contains('active'));assert(!nodes.get('#locationModal').classList.contains('hidden'));
nodes.get('#locationName').value='Nieuwe haven';nodes.get('#locationName').dispatch('input');assert.equal(run(`markerById('a').name`),'Nieuwe haven');assert.equal(run('activeRoute().log.from'),'Nieuwe haven');
nodes.get('#moveLocationBtn').click();assert.equal(run('mode'),'moveLocation');assert(!nodes.get('#locationModal').classList.contains('hidden'));
run(`state.view={x:0,y:0,z:1};commitLocationMove({clientX:30,clientY:40,target:{closest:()=>null},preventDefault(){},stopImmediatePropagation(){}})`);assert.equal(run(`markerById('a').x`),30);assert.equal(run('activeRoute().points[0].x'),30);assert.equal(run('mode'),'pan');
const count=run('state.markers.length');nodes.get('#deleteLocationBtn').click();assert.equal(run('state.markers.length'),count);assert(alerts.pop().includes('begin of einde'));
// Drawing starts anchored and finishes at the chosen destination, preserving bends.
run(`createRouteBetween('a','b',true);appendRouteDrawPoint({x:50,y:80});finishRouteDrawing()`);assert.equal(run('activeRoute().points.length'),3);assert.equal(run('activeRoute().points[2].x'),100);assert.equal(run('activeRoute().log.toLocationId'),'b');
// Legacy first/last-point snapping; no synthetic location migration.
run(`state.routes.push({id:'legacy',name:'Oud',points:[],log:{}});state.active='legacy';drawing=true;mode='route';appendRouteDrawPoint({x:31,y:41});appendRouteDrawPoint({x:101,y:201});finishRouteDrawing()`);assert.equal(run('activeRoute().log.fromLocationId'),'a');assert.equal(run('activeRoute().log.toLocationId'),'b');
run(`selectedPoint=0`);nodes.get('#deletePointBtn').click();assert.equal(run('activeRoute().points[0].x'),30);assert(alerts.pop().includes('gekoppeld'));
run(`createRouteBetween('a','a')`);assert.equal(run('activeRoute().log.fromLocationId'),run('activeRoute().log.toLocationId'));
assert.equal(alerts.length,0);
console.log('PASS integration: overview tables, sidebar selection/autosave/movement, required route endpoints, straight/drawn routes, legacy snapping, intermediate points and protected linked endpoints (simulated DOM).');
