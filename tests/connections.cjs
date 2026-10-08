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
const tabs=['routePane','placesPane','npcPane'].map(id=>{const n=el();n.dataset.tab=id;return n}),panes=tabs.map(t=>nodes.get('#'+t.dataset.tab));
const query=s=>s.startsWith('[data-tab=')?tabs.find(t=>s.includes(t.dataset.tab)):nodes.get(s)||null;
const document={querySelector:query,querySelectorAll:s=>s==='.tab[data-tab]'||s==='.tab'?tabs:s==='.tabpane'?panes:[],createElement:()=>el(),createElementNS:()=>el(),addEventListener(){}};
const ctx=vm.createContext({TextEncoder,TextDecoder,DataView,document,window:{addEventListener(){}},console,Blob,URL,atob,Uint8Array,localStorage:{getItem:()=>null,setItem(){}},setTimeout:()=>0,clearTimeout(){},alert:x=>alerts.push(x),confirm:()=>true});
const run=s=>vm.runInContext(s,ctx),files=[...html.matchAll(/<script src="([^?"]+)[^"]*"/g)].map(x=>x[1]);
for(const f of files.filter(f=>!f.endsWith('init.js')))run(fs.readFileSync(root+'/'+f,'utf8'));


(async()=>{
run(`let records38=new Map();dbPut=async rec=>records38.set(rec.id,cloneJSON(rec));dbGet=async id=>records38.get(id);dbGetAll=async()=>[...records38.values()];flushSave=async()=>true;save=()=>{};bindCityUI();bindNpcOverview();bindCityExtensions();bindMapConnections();bindLocationPlacementUI();bindLooseMarkers();bindMapPointerUI();`);
run(`state={kind:'city',campaignId:'city',markers:[{id:'a',name:'Winkel',type:'Algemene winkel',x:1,y:1,npcs:[{name:'Mara',role:'Winkelier'}]},{id:'b',name:'Woning',type:'Woning',x:2,y:2,npcs:[]}],routes:[],sessions:[],view:{x:0,y:0,z:1}};activeCampaignId='city';normalize();openLocationEditor('a')`);
const npcId=run('state.markers[0].npcs[0].id');assert(npcId);
run(`openLocationEditor('b');$('#linkExistingNpc').value=state.markers[0].npcs[0].id;$('#linkExistingNpcBtn').click()`);
assert.equal(run('state.markers[0].npcs[0]===state.markers[1].npcs[0]'),true);
assert.equal(run("npcOverviewRows('').length"),1);
run(`$('#locationOwner').value='npc:'+state.markers[1].npcs[0].id;saveLocationDetails()`);assert.equal(run('state.markers[1].owner'),'Mara');
run(`openNpcForm('a',0);$('#npcEditName').value='Mara Nieuw'`);
const oldQuery=document.querySelectorAll;document.querySelectorAll=s=>s==='[data-npc-extra]:checked'?[{dataset:{npcExtra:'b'}}]:oldQuery(s);
run('saveNpcOverview({preventDefault(){}})');document.querySelectorAll=oldQuery;
assert.equal(run('state.markers[1].npcs[0].name'),'Mara Nieuw');assert.equal(run('state.markers[1].owner'),'Mara Nieuw');
run(`$('#npcSearch').value='';renderNpcOverview();renderLocationOverview()`);assert(nodes.get('#npcOverviewTable').innerHTML.includes('Winkel, Woning'));assert(nodes.get('#markerList').innerHTML.includes('Mara Nieuw'));
run('state=prepareCampaignData(projectData())');assert.equal(run('state.markers[0].npcs[0]===state.markers[1].npcs[0]'),true);
run(`$('#quickNpcSearch').value='';renderNpcSidebar()`);assert.equal(nodes.get('#quickNpcResults').innerHTML,'');
run(`state.markers[0].npcs.push(...Array.from({length:100},(_,i)=>({name:'Test '+i})));$('#quickNpcSearch').value='Test';renderNpcSidebar()`);
assert.equal((nodes.get('#quickNpcResults').innerHTML.match(/data-npc-marker=/g)||[]).length,8);
run(`cityHiddenTypes.clear();$('#cityShowAllTypes').click()`);assert.equal(run('cityHiddenTypes.size'),12);run(`$('#cityShowAllTypes').click()`);assert.equal(run('cityHiddenTypes.size'),0);
run(`$('#cityAllLabels').checked=false;$('#cityAllLabels').onchange();pendingLocationPoint={x:4,y:4};$('#newLocationName').value='Nieuwe plek';$('#newLocationForm').onsubmit({preventDefault(){}})`);assert.equal(run('state.markers.at(-1).labelMode'),'hide');assert.equal(run('state.markers.every(m=>m.labelMode==="hide")'),true);
run(`openNpcForm('a',0);deleteSelectedNpc()`);assert.equal(run('state.markers[1].npcs.length'),0);assert.equal(run('state.markers[1].owner'),'');
for(const type of ['Woontoren','Tovenaarstoren','Boerderij','Boomgaard','Heiligdom'])assert(run(`CITY_TYPES.includes(${JSON.stringify(type)})`));
run(`records38.clear();records38.set('world',{id:'world',data:{kind:'campaign',projectName:'Wereld',routes:[],sessions:[],markers:[{id:'town',name:'Stad',x:1,y:1,linkedCityId:'city'}]}});records38.set('city',{id:'city',data:{kind:'city',projectName:'Stad',routes:[],sessions:[],markers:[]}});state=prepareCampaignData(records38.get('world').data);activeCampaignId='world';selectedLocationId='town'`);
await run('refreshMapLinks()');assert.equal(nodes.get('#linkedCitySelect').value,'city');assert.equal(nodes.get('#openLinkedCity').disabled,false);
run(`state=prepareCampaignData(records38.get('city').data);activeCampaignId='city';selectedLocationId=null`);await run('refreshMapLinks()');assert.equal(nodes.get('#worldReturnControls').hidden,false);assert(nodes.get('#worldReturnSelect').innerHTML.includes('Wereld'));
// Real full-backup serializers and restore, with test-only in-memory DB.
run(`const original38=[...records38.values()];previewImport=async()=>true;renderCampaignHome=async()=>{};`);
const zip=await run('makeBinaryBackup(original38)');ctx.zip38=zip;await run('restoreBinaryBackup(zip38)');
assert.equal(run(`(()=>{const restored=[...records38.values()].filter(r=>!['world','city'].includes(r.id));return restored.length===2&&restored.find(r=>r.data.kind==='campaign').data.markers[0].linkedCityId===restored.find(r=>r.data.kind==='city').id})()`),true);
run(`records38.clear();const json38={format:BACKUP_FORMAT,backupVersion:CURRENT_BACKUP_VERSION,backupType:'all-campaigns',campaigns:original38.map(r=>({id:r.id,data:r.data}))}`);await run('restoreAllCampaignsBackup(json38)');
assert.equal(run(`(()=>{const restored=[...records38.values()];return restored.find(r=>r.data.kind==='campaign').data.markers[0].linkedCityId===restored.find(r=>r.data.kind==='city').id})()`),true);
run(`state={kind:'campaign',markers:[{id:'missing',linkedCityId:'gone'}]};activeCampaignId='missing-world';selectedLocationId='missing'`);await run('refreshMapLinks()');assert.equal(nodes.get('#openLinkedCity').disabled,true);
run(`state={kind:'city',markers:[],routes:[],sessions:[],view:{x:0,y:0,z:1},cityDefaultLabelMode:'hide'};normalize();placingExtraCityMarker=true;beginLocationPlacement({x:25,y:30});$('#newLocationName').value='Reiziger';$('#extraMarkerKind').value='Persoon (marker)';$('#newLocationForm').onsubmit({preventDefault(){}})`);
assert.equal(run('state.markers[0].type'),'Persoon (marker)');assert.equal(run('state.markers[0].labelMode'),'hide');assert.equal(run('state.markers[0].x'),25);
assert.equal(run('prepareCampaignData(projectData()).markers[0].name'),'Reiziger');
assert.equal(run('placingExtraCityMarker'),false);
run(`placingExtraCityMarker=true;beginLocationPlacement({x:30,y:40});$('#cancelNewLocationBtn').click()`);assert.equal(run('state.markers.length'),1);assert.equal(run('placingExtraCityMarker'),false);
assert.equal(run('filteredSortedMarkers().length'),0);
run(`mode='pan';runtimeImage='test';stage.onpointerdown({pointerId:1,clientX:25,clientY:30,target:{closest:s=>s==='[data-markerid]'?{dataset:{markerid:state.markers[0].id}}:null}});stage.onpointermove({clientX:45,clientY:50});stage.onpointerup({pointerId:1})`);
assert.equal(run('state.markers[0].x'),45);assert.equal(run('state.markers[0].y'),50);
run(`openLooseMarker(state.markers[0].id);$('#looseMarkerName').value='Nieuwe naam';$('#looseMarkerSave').click()`);assert.equal(run('state.markers[0].name'),'Nieuwe naam');
run(`state.unit='mi';calibratePts=[{x:0,y:0},{x:100,y:0}];$('#calibrationUnit').value='ft';$('#scaleDistance').value='5280';$('#scaleForm').onsubmit({preventDefault(){}})`);
assert(Math.abs(run('state.scale.perPixel')-.01)<1e-10);
assert.equal(run('LOCATION_ICONS.Party'),'assets/Party.svg');
console.log('PASS shared NPC edit/delete/owner/reload, 100-NPC search, labels/defaults, filters, city links and ZIP/JSON link remapping (simulated DOM/storage).');
})().catch(e=>{console.error(e);process.exitCode=1});
