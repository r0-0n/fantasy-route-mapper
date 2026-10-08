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
run(`state.scale={perPixel:1};state.unit='mi';state.routes=[];state.markers=[];state.terrain=null;
state.roads=[{width:8,points:[{x:0,y:0},{x:100,y:0},{x:100,y:100}]}];
const r={log:{terrainMode:'manual',pace:24,transport:'Lopend'}};
const path=landPathBetweenLocations({x:0,y:-80},{x:160,y:100},r);`);
assert.equal(run('path[0].y'),-80);assert.equal(run('path.at(-1).x'),160);assert(run('path.some(p=>p.x===100&&p.y===0)'));
// No road inference from the underlying image, and no water network for land travel.
run('state.roads[0].kind="water"');assert.equal(run('landPathBetweenLocations({x:0,y:-80},{x:160,y:100},r)'),null);
assert(run('waterPathBetweenLocations({x:0,y:-80},{x:160,y:100})'));
// Travel-time costs prefer the slightly longer, faster road when rules are enabled.
run(`state.roads=[{width:1,points:[{x:0,y:0},{x:100,y:0}]},{width:1,points:[{x:0,y:0},{x:0,y:10},{x:100,y:10},{x:100,y:0}]}];
state.terrain=createTerrain(101,20);fillTerrainPolygon([{x:0,y:0},{x:101,y:0},{x:101,y:2},{x:0,y:2}],7);
const fast={log:{transport:'Lopend',terrainMode:'terrain',terrainPace:'fast',pace:30}};
const terrainPath=landPathBetweenLocations({x:0,y:0},{x:100,y:0},fast);`);
assert(run('terrainPath.some(p=>p.y===10)'));
assert(!run('landPathBetweenLocations({x:0,y:0},{x:100,y:0},r).some(p=>p.y===10)'));
// Icons retain their category through a save/import and resolve to local files.
run(`state.markers=[{id:'c',name:'Grot',type:'Cave',x:1,y:1},{id:'t',name:'Kamp',type:'Camp',x:2,y:2}];const imported=prepareCampaignData(projectData());`);
assert.equal(run('imported.markers[0].type'),'Cave');
for(const type of ['Cave','Camp']){const file=run(`locationIcon('${type}')`);assert(fs.existsSync(root+'/'+file));assert(fs.readFileSync(root+'/sw.js','utf8').includes('./'+file))}
assert(!fs.readFileSync(root+'/js/terrain.js','utf8').includes('stroke-dasharray'));
console.log('PASS off-road access, bends preserved, separate water networks, terrain-aware road choice, icon roundtrip and offline assets.');
// Automatic 2024 pace: road through forest Fast, forest away from road Normal.
run(`state.terrain=createTerrain(101,30);fillTerrainPolygon([{x:0,y:0},{x:101,y:0},{x:101,y:30},{x:0,y:30}],4);state.roads=[{width:1,points:[{x:0,y:10},{x:50,y:10}]}];const automatic={points:[{x:0,y:10},{x:100,y:10}],log:{terrainMode:'terrain',terrainPace:'auto',transport:'Lopend',pace:24}};const autoResult=terrainRouteAnalysis(automatic);`);
assert(run('autoResult.parts.some(p=>p.road&&p.pace===30)'));
assert(run('autoResult.parts.some(p=>!p.road&&p.pace===24)'));
assert(run(`terrainRouteAnalysis({...automatic,log:{...automatic.log,terrainPace:'normal'}}).parts.every(p=>p.pace===24)`));
assert(run(`terrainRouteAnalysis({...automatic,log:{...automatic.log,slowTravelers:true}}).parts.every(p=>p.pace===18)`));
run(`state.terrain=null;invalidateTerrain();`);
assert(run('terrainRouteAnalysis(automatic).parts.some(p=>p.road&&p.pace===30)'));
assert(run('terrainRouteAnalysis(automatic).parts.some(p=>!p.road&&p.pace===24)'));
assert(run(`terrainRouteAnalysis({...automatic,log:{...automatic.log,terrainPace:'normal'}}).parts.every(p=>p.pace===24)`));
assert(run(`terrainRouteAnalysis({...automatic,log:{...automatic.log,slowTravelers:true}}).parts.every(p=>p.pace===18)`));
run(`state.sessions=[];state.routes=[automatic];const autoSaved=prepareCampaignData(projectData());`);
assert.equal(run('autoSaved.routes[0].log.terrainPace'),'auto');
console.log('PASS automatic 2024 road/forest speeds, explicit Normal cap, slower group, unknown terrain and save roundtrip.');

run("state.unit='mi'");assert.equal(run('speedColor(18)'),'#e77d70');assert.equal(run('speedColor(24)'),'#e2ba64');assert.equal(run('speedColor(30)'),'#87ce91');assert.equal(run('speedColor(21)'),'#e59c6a');assert.notEqual(run('speedColor(27)'),run('speedColor(24)'));assert.equal(run('speedColor(9)'),run('speedColor(18)'));assert.equal(run('speedColor(48)'),run('speedColor(30)'));assert.equal(run('speedColor(0)'),'#aeb7b0');run("state.unit='km'");assert.equal(run('speedColor(21*1.609344)'),'#e59c6a');console.log('PASS continuous speed gradient, endpoints, intermediate values and kilometer conversion');
run(`state.unit='mi';state.terrain=null;state.roads=[{width:8,kind:'water',points:[{x:0,y:0},{x:50,y:0},{x:50,y:50},{x:100,y:50}]}];state.markers=[{id:'port',name:'Haven',x:0,y:0},{id:'end',name:'Einde',x:100,y:50}];const drawn={points:[{x:50,y:50},{x:60,y:60},{x:80,y:50}],log:{transport:'Boot',followRoads:true}};linkRouteViaNetwork(drawn,'port','end');`);
assert(run('drawn.points.some(p=>p.x===50&&p.y===0)'));assert(run('drawn.points.some(p=>p.x===60&&p.y===60)'));assert.equal(run('drawn.points[0].x'),0);assert.equal(run('drawn.points.at(-1).x'),100);
const linked=run('JSON.stringify(drawn)');run("linkRouteViaNetwork(drawn,'port','end')");assert.equal(run('JSON.stringify(drawn)'),linked);
run('state.roads=[]');assert.throws(()=>run(`linkRouteViaNetwork(drawn,'end','port')`));assert.equal(run('JSON.stringify(drawn)'),linked);
console.log('PASS linking drawn water route preserves bends, follows network, repeat is stable, failure is atomic');
