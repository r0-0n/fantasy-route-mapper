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
run(`let cityTestRecords=new Map();dbPut=async rec=>cityTestRecords.set(rec.id,cloneJSON(rec));dbGet=async id=>cityTestRecords.get(id);dbGetAll=async()=>[...cityTestRecords.values()];flushSave=async()=>{};save=()=>{};bindCityUI();bindNpcOverview();`);
await run(`createCampaign('Waterdeep','city')`);
assert.equal(run('state.kind'),'city');assert.equal(run('isCity()'),true);
assert(nodes.get('#layout').classList.contains('cityMode'));
assert.equal(nodes.get('#timeSettingsBtn').hidden,true);
assert.equal(nodes.get('#locationType').options.length,12);
assert.equal(nodes.get('#campaignSettingsTitle').textContent,'Stadsinstellingen');
assert.equal(nodes.get('#brandHome')['aria-controls'],'campaignSettingsDialog');
run(`state.markers=[{id:'shop',x:120,y:170,name:'De <Draak>',type:'Herberg',description:'Taveerne',notes:'Geheime kelder',owner:'Anna',npcs:[{name:'<Bram>',role:'Waard',note:'Kent de haven'}],visible:true,labelMode:'hide'}];openLocationEditor('shop');`);
assert.equal(nodes.get('#locationDescription').value,'Taveerne\n\nGeheime kelder');
assert.equal(nodes.get('#locationOwner').value,'Anna');assert.equal(nodes.get('#locationShowName').checked,false);
assert(nodes.get('#cityNpcList').innerHTML.includes('&lt;Bram&gt;'));
assert(!nodes.get('#cityNpcList').innerHTML.includes('<Bram>'));
nodes.get('#locationDescription').value='Een gezellige herberg';nodes.get('#locationOwner').value='Elise';nodes.get('#locationVisible').checked=false;
run('saveLocationDetails()');assert.equal(run('state.markers[0].owner'),'Elise');assert.equal(run('state.markers[0].notes'),'');assert.equal(run('state.markers[0].labelMode'),'hide');assert.equal(run('state.markers[0].visible'),false);
run("$('#addCityNpc').click();$('#npcEditName').value='Fenna';saveNpcOverview({preventDefault(){}})");assert.equal(run('state.markers[0].npcs.length'),2);
run("state.markers[0].npcs[1]={name:'Fenna',role:'Smid',note:'Zoekt ijzer'}");
run("$('#locationSearch').value='Fenna';$('#locationTypeFilter').value='all'");assert.equal(run('filteredSortedMarkers().length'),1);
run(`const cityRoundtrip=unwrapCampaignImport(campaignExportEnvelope(projectData())).data;`);
assert.equal(run('cityRoundtrip.kind'),'city');assert.equal(run('cityRoundtrip.markers[0].npcs[1].role'),'Smid');assert.equal(run('cityRoundtrip.markers[0].labelMode'),'hide');
assert.throws(()=>run(`prepareCampaignData({...cityRoundtrip,markers:[{npcs:'bad'}]})`),/NPC/);
for(const name of run('CITY_TYPES')){const file=run(`locationIcon(${JSON.stringify(name)})`);assert(fs.existsSync(root+'/'+file));assert(fs.readFileSync(root+'/sw.js','utf8').includes('./'+file))}
run('state.markers[0].visible=true');
ctx.cityZip=await run(`makeBinaryBackup([{id:state.campaignId,data:projectData(),imageBlob:new Blob([new Uint8Array([12,34,56])],{type:'image/png'})}])`);
run(`previewImport=async()=>true;dbPut=async rec=>cityTestRecords.set(rec.id,rec)`);
await run('restoreBinaryBackup(cityZip)');
assert.equal(run('[...cityTestRecords.values()].at(-1).data.kind'),'city');
assert.equal(run('[...cityTestRecords.values()].at(-1).data.markers[0].npcs[1].name'),'Fenna');
assert.deepEqual([...new Uint8Array(await run('[...cityTestRecords.values()].at(-1).imageBlob.arrayBuffer()'))],[12,34,56]);
run('cityTestRecords.clear()');

await run(`dbPut({id:state.campaignId,data:projectData(),meta:metaFor(state,state.campaignId)});duplicateCampaign(state.campaignId)`);
assert.equal(run('cityTestRecords.size'),2);assert.equal(run('[...cityTestRecords.values()][1].data.markers[0].npcs.length'),2);
await run('renderCampaignHome()');assert(nodes.get('#campaignGrid').innerHTML.includes('Stad'));assert(nodes.get('#campaignGrid').innerHTML.includes('1 locaties'));
await run(`loadCampaign([...cityTestRecords.keys()][1])`);assert.equal(run('isCity()'),true);assert.equal(run('state.markers[0].owner'),'Elise');
await run(`createCampaign('Sword Coast')`);assert.equal(run('isCity()'),false);assert(!nodes.get('#layout').classList.contains('cityMode'));assert.equal(nodes.get('#timeSettingsBtn').hidden,false);assert(nodes.get('#locationType').options.some(o=>o.value==='Landmark'));
assert.equal(nodes.get('#brandHome')['aria-controls'],'logModal');
run(`state={...cityRoundtrip,kind:undefined};normalize()`);assert.equal(run('state.kind'),'campaign');

run(`state={...cityRoundtrip,kind:'city',markers:cloneJSON(cityRoundtrip.markers)};state.markers.push({id:'temple',name:'Tempel',type:'Tempel',description:'',notes:'',x:10,y:20});bindNpcOverview();openLocationEditor('shop');openNpcOverview()`);
assert.equal(nodes.get('#npcOverviewDialog').open,true);
run("openNpcForm();$('#npcEditName').value='Mira';$('#npcEditRole').value='Priester';$('#npcEditLocation').value='temple';$('#npcEditNote').value='<geheim>';saveNpcOverview({preventDefault(){}})");
assert.equal(run("markerById('temple').npcs[0].name"),'Mira');
assert(nodes.get('#npcOverviewTable').innerHTML.includes('&lt;geheim&gt;'));
run("openNpcForm('temple',0);$('#npcEditName').value='Mirabel';$('#npcEditLocation').value='shop';saveNpcOverview({preventDefault(){}})");
assert.equal(run("markerById('temple').npcs.length"),0);
assert.equal(run("markerById('shop').npcs.at(-1).name"),'Mirabel');
assert(nodes.get('#cityNpcList').innerHTML.includes('Mirabel'));
run("openNpcForm('shop',2);$('#npcEditName').value='Niet bewaren';$('#cancelNpcEdit').click()");assert.equal(run("markerById('shop').npcs[2].name"),'Mirabel');
run("$('#npcSearch').value='priester'");assert.equal(run('npcOverviewRows().length'),1);
run("markerById('shop').description='Omschrijving';markerById('shop').notes='DM notities';openLocationEditor('shop');saveLocationDetails();openLocationEditor('shop')");
assert.equal(nodes.get('#locationDescription').value,'Omschrijving\n\nDM notities');
assert.equal(run("markerById('shop').notes"),'');
run("const npcSaved=unwrapCampaignImport(campaignExportEnvelope(projectData())).data");assert.equal(run("npcSaved.markers[0].npcs.at(-1).name"),'Mirabel');
run("openNpcForm('shop',2)");assert(nodes.get('#npcPane').classList.contains('active'));
assert(!nodes.get('#placesPane').classList.contains('active'));
const beforeDelete=run("markerById('shop').npcs.length");
ctx.confirm=()=>false;run('deleteSelectedNpc()');assert.equal(run("markerById('shop').npcs.length"),beforeDelete);
ctx.confirm=()=>true;run('deleteSelectedNpc()');assert.equal(run("markerById('shop').npcs.length"),beforeDelete-1);
assert(!nodes.get('#cityNpcList').innerHTML.includes('Mirabel'));assert(nodes.get('#npcEditForm').hidden);
assert(!nodes.get('#cityNpcList').innerHTML.includes('<fieldset'));assert(!nodes.get('#cityNpcList').innerHTML.includes('<textarea'));
console.log('PASS NPC tab selection, compact location list, delete cancel/confirm and synchronized removal');
console.log('PASS NPC overview create/edit/move/cancel/search, shared sidebar records, escaped content, merged notes preserved without duplication and export roundtrip (simulated DOM).');
console.log('PASS city creation, categories/icons, private context, name visibility, search, validation, export/import, duplication, reload and campaign switching (simulated DOM/storage).');
})().catch(e=>{console.error(e);process.exitCode=1});
