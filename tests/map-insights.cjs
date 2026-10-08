// Integration of the actual event handlers against a minimal DOM double.
// This does not claim browser layout or real IndexedDB coverage.
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),html=fs.readFileSync(root+'/index.html','utf8'),nodes=new Map(),alerts=[];
function el(id=''){
 const classes=new Set(),events={};let markup='',value='';
 const n={id,dataset:{},style:{},checked:false,disabled:false,textContent:'',options:[],naturalWidth:1000,naturalHeight:800,clientWidth:1000,clientHeight:800,
 classList:{add(...a){a.forEach(x=>classes.add(x))},remove(...a){a.forEach(x=>classes.delete(x))},contains:x=>classes.has(x),toggle(x,v){v=v??!classes.has(x);v?classes.add(x):classes.delete(x);return v}},
 setAttribute(k,v){this[k]=v},removeAttribute(){},setPointerCapture(){},appendChild(){},cloneNode(){return el()},querySelectorAll(){return []},getBoundingClientRect(){return {left:0,top:0,width:1000,height:800}},
 showModal(){this.open=true},close(){this.open=false;events.close?.forEach(f=>f({target:this}))},focus(){},select(){},click(){return this.onclick?.({target:this,preventDefault(){},stopPropagation(){}})},addEventListener(t,f){(events[t]??=[]).push(f)},dispatch(t,detail={}){events[t]?.forEach(f=>f({target:this,...detail}))}};
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
run(`save=()=>{};state={kind:'city',campaignId:'city-test',projectName:'Stad',unit:'km',scale:{unit:'km',perPixel:.001},markers:[{id:'inn',name:'Copper Cup',type:'Herberg',owner:'Mara',description:'Een herberg',npcs:[{name:'Durgan',role:'Smid'}],x:1000,y:0,visible:true,labelMode:'show'}],routes:[],sessions:[],party:null,view:{x:0,y:0,z:1}};normalize();bindCityExtensions();`);
assert.equal(run('state.cityWalk.speedKmh'),5);assert.equal(run('state.cityWalk.routeFactor'),1.3);
assert.equal(run('cityWalkBetween(state.party,state.markers[0])'),null);
run('state.party={x:0,y:0}');assert(Math.abs(run('cityWalkBetween(state.party,state.markers[0]).minutes')-15.6)<1e-9);
assert.equal(run('cityWalkText(cityWalkBetween(state.party,state.markers[0]))'),'± 16 min lopen');
assert.equal(run('cityWalkText({minutes:63})'),'± 1 uur 5 min lopen');assert.equal(run('cityWalkText({minutes:3.7})'),'± 4 min lopen');
run('state.party.x=500');assert(Math.abs(run('cityWalkBetween(state.party,state.markers[0]).minutes')-7.8)<1e-9);
run('state.markers[0].x=1500');assert(Math.abs(run('cityWalkBetween(state.party,state.markers[0]).minutes')-15.6)<1e-9);
run("$('#cityRouteFactor').value='1.5';$('#cityWalkSpeed').value='6';$('#cityWalkSpeed').onchange()");assert.equal(run('cityWalkBetween(state.party,state.markers[0]).minutes'),15);
run("$('#cityWalkSpeed').value='0';$('#cityWalkSpeed').onchange()");assert.equal(run('state.cityWalk.speedKmh'),6);
for(const q of ['copper','herberg','durgan'])assert(run(`locationMatchesSearch(state.markers[0],${JSON.stringify(q)})`));
run("const cityBefore=JSON.stringify(projectData());cityHiddenTypes.add('Herberg')");assert.equal(run('mapLocationVisible(state.markers[0])'),false);assert.equal(run('JSON.stringify(projectData())===cityBefore'),true);
run('cityHiddenTypes.clear();state.markers[0].visible=false;runtimeImage="test";centerOnLocation("inn")');assert.equal(run('state.markers[0].visible'),false);
run('state.markers[0].visible=true;state.markers[0].labelMode="hover";cityHoverId=null');assert.equal(run('locationLabelVisible(state.markers[0])'),false);
run('cityHoverId="inn"');assert.equal(run('locationLabelVisible(state.markers[0])'),true);
run('state.markers[0].labelMode="hide"');assert.equal(run('locationLabelVisible(state.markers[0])'),false);
run('state.markers[0].labelMode="show";state.cityWalk={speedKmh:5,routeFactor:1.3};state.scale={perPixel:.001/1.609344,unit:"mi"};state.unit="mi"');assert(Math.abs(run('cityWalkBetween(state.party,state.markers[0]).minutes')-15.6)<1e-9);
run('const citySaved=unwrapCampaignImport(campaignExportEnvelope(projectData())).data;state=citySaved;normalize()');assert.equal(run('state.party.x'),500);assert.equal(run('state.cityWalk.routeFactor'),1.3);
// Real binary backup functions, using an in-memory database only.
run('dbGetAll=async()=>[];let restored=null;dbPut=async r=>{restored=r};previewImport=async()=>true');ctx.bundle=await run(`makeBinaryBackup([{id:'city',data:projectData(),imageBlob:new Blob([new Uint8Array([1,2,3])],{type:'image/png'})}])`);await run('restoreBinaryBackup(bundle)');assert.equal(run('restored.data.cityWalk.speedKmh'),5);assert.equal(run('restored.data.markers[0].npcs[0].name'),'Durgan');

ctx.hoverGroup=el();run("bindCityMarkerHover(hoverGroup,state.markers[0]);hoverGroup.dispatch('pointerenter',{clientX:100,clientY:100})");
assert.equal(nodes.get('#cityLocationTooltip').hidden,false);assert(nodes.get('#cityLocationTooltip').innerHTML.includes('lopen'));
run("hoverGroup.dispatch('pointerleave')");assert.equal(nodes.get('#cityLocationTooltip').hidden,true);
run('cityMeasurePoints=[];cityMeasureClick({x:0,y:0});cityMeasureClick({x:1000,y:0})');assert.equal(run('mode'),'pan');assert(nodes.get('#cityMeasureResult').textContent.includes('16 min'));
run('state.scale=null');assert.equal(run('cityWalkBetween(state.party,state.markers[0])'),null);
run('state.kind="campaign";state.scale={perPixel:1,unit:"mi"};state.unit="mi";state.cityWalk={routeFactor:9,speedKmh:.1};state.markers=[{id:"a",name:"A"},{id:"b",name:"B"},{id:"c",name:"C"}];state.party=null;state.sessions=[];state.hourlyTimeline=null;state.routes=[{id:"ab",name:"A → B",points:[{x:0,y:0},{x:60,y:0}],status:"planned",log:{fromLocationId:"a",toLocationId:"b",transport:"Lopend",pace:24,terrainMode:"manual"}}];normalize()');
assert.equal(run('cityWalkBetween({x:0,y:0},{x:1,y:0})'),null);assert.equal(run('worldRouteForecast(state.routes[0]).result'),null);assert.equal(run('worldRouteForecast(state.routes[0]).travel'),20);
assert.equal(run('worldLocationVisits("b").count'),0);
run('state.hourlyTimeline={version:1,calendar:"harptos",date:"30 Nightal 1491 DR",hour:8,dailyStart:8,dailyHours:8}');
run('const forecast=worldRouteForecast(state.routes[0]);const actual=calculateHourly([{id:"s",activities:[forecast.activity]}],forecast.settings)');
assert.equal(run('forecast.result.end'),run('actual.end'));assert.equal(run('forecast.block.rest'),32);assert.equal(run('forecast.block.restCount'),2);
assert.notEqual(run('hourDate(actual.end,"harptos").indexOf("1492")'),-1);
for(const date of ['30 Ches 1492 DR','30 Nightal 1491 DR']){
 run(`state.hourlyTimeline.date=${JSON.stringify(date)};const testSchedule=worldRouteForecast(state.routes[0])` .replace('const testSchedule=','var testSchedule='));
 assert.equal(run('testSchedule.result.end-testSchedule.result.start'),52);
 assert.equal(run('testSchedule.result.end'),run('calculateHourly([{activities:[testSchedule.activity]}],testSchedule.settings).end'));
}
run('state.hourlyTimeline={version:1,calendar:"gregorian",date:"2024-02-28",hour:8,dailyStart:8,dailyHours:8};var greg=worldRouteForecast(state.routes[0])');assert(run('hourDate(greg.result.end,"gregorian").includes("2024-03-01")'));
// Arrival, stay, next departure is one visit to B. Snapshots keep direction after a route is edited.
run(`state.hourlyTimeline={version:1,calendar:'harptos',date:'1 Hammer 1492 DR',hour:8,dailyStart:8,dailyHours:8};const first=worldRouteForecast(state.routes[0]).activity;state.routes.push({id:'bc',name:'B → C',points:[{x:0,y:0},{x:12,y:0}],status:'planned',log:{fromLocationId:'b',toLocationId:'c',transport:'Lopend',pace:24,terrainMode:'manual'}});const second={...worldRouteForecast(state.routes[1]).activity,id:'second'};state.sessions=[{id:'s1',number:1,activities:[first,{id:'rest',kind:'stay',label:'Verblijf',hours:24},second]}];`);
assert.equal(run('worldLocationVisits("b").count'),1);assert.equal(run('worldLocationVisits("a").count'),1);assert.equal(run('worldLocationVisits("c").count'),1);
assert(run('worldLocationVisits("b").first.time!==null'));
run('state.routes[0].log.toLocationId="c"');assert.equal(run('worldLocationVisits("b").count'),1);
run('state.sessions[0].activities.push({...first,id:"repeat",trip:2})');assert.equal(run('worldLocationVisits("b").count'),2);
run('state.sessions=[];state.routes=[{id:"old",status:"done",log:{},points:[]}];');assert.equal(run('worldLocationVisits("b").count'),0);
run('state.routes[0].log={fromLocationId:"a",toLocationId:"b"}');assert.equal(run('worldLocationVisits("b").count'),0);assert.equal(run('worldLocationVisits("b").unlogged'),1);assert.equal(run('worldLocationVisits("b").first'),null);
run('state.kind="city";syncCityUI();renderWorldInsights()');assert.equal(nodes.get('#worldTravelForecast').hidden,true);assert.equal(nodes.get('#worldLocationHistory').hidden,true);assert.equal(run('worldRouteForecast(state.routes[0])'),null);
run('state.kind="campaign";syncCityUI()');for(const id of ['cityWalkSettings','cityFilterControls','cityMeasureControls','cityLabelControls','npcTab'])assert.equal(nodes.get('#'+id).hidden,true,id);
console.log('PASS city estimates/defaults/scales/search/filter/visibility/labels/backup, world forecast/logbook consistency/rest/calendar rollovers/visit deduplication and mode isolation. Simulated DOM/storage.');
})().catch(e=>{console.error(e);process.exitCode=1});
