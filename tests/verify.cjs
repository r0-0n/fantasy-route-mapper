// Development-only checks; running the application does not require Node.js.
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const root=path.resolve(__dirname,'..'),html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const files=[...html.matchAll(/<script src="([^"]+)"/g)].map(m=>m[1]);
const scripts=files.map(f=>fs.readFileSync(path.join(root,f),'utf8'));
const all=scripts.join('\n');
for(let i=0;i<scripts.length;i++)new vm.Script(scripts[i],{filename:files[i]});
assert(!html.includes('type="module"'));assert(!/<script>/.test(html));
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(ids.length,new Set(ids).size);
for(const m of all.matchAll(/\$\(['"]#([\w-]+)['"]\)/g))assert(ids.includes(m[1]),m[1]);
assert(html.includes('v1.0.0'));assert(!html.includes('0.9.8'));
function harness(){
 const nodes=new Map(),events=[],alerts=[],records=new Map(),local=new Map();
 function node(id){if(nodes.has(id))return nodes.get(id);let classes=new Set();let n={id,value:'',checked:false,textContent:'',innerHTML:'',style:{},dataset:{},options:[],selectedOptions:[{}],naturalWidth:0,naturalHeight:0,clientWidth:1000,clientHeight:800,
 classList:{add(...x){x.forEach(v=>classes.add(v))},remove(...x){x.forEach(v=>classes.delete(v))},contains:x=>classes.has(x),toggle(x,v){if(v??!classes.has(x))classes.add(x);else classes.delete(x)}},
 addEventListener(t,f,c){events.push([id,t,String(f),c])},cloneNode(){return {...this,style:{},dataset:{}}},setAttribute(){},removeAttribute(){},appendChild(){},querySelectorAll(){return []},showModal(){this.open=true},close(){this.open=false},focus(){},select(){},click(){return this.onclick?.({target:this,stopPropagation(){}})},getBoundingClientRect(){return {left:0,top:0}}};nodes.set(id,n);return n;}
 for(const id of ids)node('#'+id);
 function request(value){const r={result:value};queueMicrotask(()=>r.onsuccess?.());return r;}
 const db={objectStoreNames:{contains:()=>true},transaction(){const tx={objectStore(){return {get:id=>request(records.get(id)),getAll:()=>request([...records.values()]),put:r=>records.set(r.id,structuredClone(r)),delete:id=>records.delete(id),clear:()=>records.clear()}}};queueMicrotask(()=>tx.oncomplete?.());return tx;}};
 const ctx=vm.createContext({console,Blob,URL,atob,btoa,Uint8Array,structuredClone,setTimeout(){return 1},clearTimeout(){},alert:x=>alerts.push(x),confirm:()=>true,localStorage:{getItem:k=>local.get(k)??null,setItem:(k,v)=>local.set(k,String(v))},indexedDB:{open(name,version){assert.equal(name,'FantasyRouteMapper');assert.equal(version,1);return request(db)}},document:{querySelector:s=>node(s),querySelectorAll:()=>[],addEventListener:(t,f)=>events.push(['document',t,String(f)]),createElement:()=>node('created'),createElementNS:()=>node('svg-created')},window:{addEventListener:(t,f)=>events.push(['window',t,String(f)])}});
 return {ctx,nodes,events,alerts,records,local,run:x=>vm.runInContext(x,ctx)};
}
async function settle(){for(let i=0;i<40;i++)await Promise.resolve();}
(async()=>{
 const h=harness();for(const s of scripts)vm.runInContext(s,h.ctx);await settle();
 assert.deepEqual(h.alerts,[]);assert.equal(h.run('APP_VERSION'),'1.0.0');
 assert.equal(h.run('CURRENT_DATA_VERSION'),1);assert.equal(h.run('CURRENT_BACKUP_VERSION'),1);
 if(process.argv[2]){
  const original=fs.readFileSync(process.argv[2],'utf8'),old=harness();vm.runInContext(original.match(/<script>([\s\S]*?)<\/script>/)[1],old.ctx);await settle();
  const names=[...original.matchAll(/^(?:async )?function (\w+)/gm)].map(m=>m[1]);
  for(const n of names)assert.equal(h.run(`${n}.toString()`),old.run(`${n}.toString()`),n);
  const handlers=x=>[...x.nodes].flatMap(([id,n])=>Object.keys(n).filter(k=>/^on/.test(k)).map(k=>[id,k,String(n[k])])).sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b)));
  assert.deepEqual(handlers(h),handlers(old));assert.deepEqual(h.events,old.events);
  assert.equal(fs.readFileSync(path.join(root,'css/app.css'),'utf8'),original.match(/<style>([\s\S]*?)<\/style>/)[1]);
  const strip=s=>s.replace(/<style>[\s\S]*?<\/style>/,'').replace(/<link rel="stylesheet" href="css\/app.css">/,'').replace(/<script[\s\S]*?<\/script>/g,'').replace(/<!-- Gewone scripts:[\s\S]*?-->/,'').replaceAll('v0.9.8 Beta','v1.0.0').replaceAll('0.9.8 Beta','1.0.0').replace(/\s+/g,' ');
  assert.equal(strip(html),strip(original));console.log(`PASS ${names.length} original functions, all event handlers/listener order, CSS and HTML equivalence`);
 }
 const r=h.run;
 for(const [a,b,n] of [['30 Hammer 1491 DR','1 Alturiak 1491 DR',2],['Midsummer 1492 DR','1 Eleasis 1492 DR',2],['Midsummer 1491 DR','1 Eleasis 1491 DR',1],['1 Hammer 1492 DR','1 Hammer 1493 DR',366],['30 Nightal 1491 DR','1 Hammer 1492 DR',1]])assert.equal(r(`harptosDuration(${JSON.stringify(a)},${JSON.stringify(b)})`),n);
 assert.equal(r("parseHarptos('Shieldmeet 1491 DR')"),null);
 assert.equal(r("parseHarptos('31 Hammer 1491 DR')"),null);
 for(const [entry,days] of [[{gameDays:6},6],[{gameDays:0},0],[{gameDays:'0'},0],[{gameDays:''},5.5],[{},5.5],[{timeMode:'harptos',gameDays:100,gameStart:'1 Hammer 1491 DR',gameEnd:'7 Hammer 1491 DR'},6]])assert.equal(r(`travelElapsed({entry:${JSON.stringify(entry)},snap:{duration:5.5}}).days`),days);
 await r('createCampaign("Testcampagne")');await settle();assert.equal(h.records.size,1);
 r(`state.scale={perPixel:0.5,unit:'mi'};state.routes=[{id:'r',name:'Route',points:[{x:0,y:0},{x:100,y:0}],log:{pace:25}}];state.markers=[{id:'m',name:'Stad',x:0,y:0}];state.sessions=[{id:'s',number:'12',realDate:'2026-09-20',gameDays:6,routeIds:['r'],locationIds:['m']}];normalize()`);
 assert.equal(r('routeDistance(state.routes[0])'),50);
 assert.equal(r('makeTravelSnapshot(state.sessions[0]).duration'),2);
 assert.equal(r('travelTotals(travelRows()).duration'),6);
 assert(r('travelTable(travelRows()).includes("Sessie 12")'));
 assert(r('logbookMarkdown().includes("Speeldatum")'));
 const before=r('JSON.stringify(projectData())');await r('flushSave()');await r('loadCampaign(activeCampaignId)');assert.equal(r('JSON.stringify(projectData())'),before);
 const backup=await r('buildAllCampaignsBackup()');assert.equal(backup.appVersion,'1.0.0');assert.equal(backup.backupVersion,1);
 h.ctx.backup=backup;await r('restoreAllCampaignsBackup(backup)');assert.equal(h.records.size,2);
 assert.equal(r('JSON.stringify(unwrapCampaignImport(campaignExportEnvelope(projectData())).data)'),r('JSON.stringify(projectData())'));
 assert.equal(r('unwrapCampaignImport({formatVersion:13,routes:[],markers:[]}).data.dataVersion'),1);
 assert.throws(()=>r('prepareCampaignData({dataVersion:2})'));
 const size=h.records.size;await assert.rejects(r('restoreAllCampaignsBackup({...backup,campaigns:[backup.campaigns[0],{data:{routes:"invalid"}}]})'));assert.equal(h.records.size,size);
 // Exercise bound scale UI against a minimal DOM, without pretending this is a browser test.
 r(`addScalePoint({x:0,y:0});addScalePoint({x:100,y:0});$('#scaleDistance').value='12,5';$('#scaleForm').onsubmit({preventDefault(){}})`);assert.equal(r('state.scale.perPixel'),.125);
 for(const input of ['0','-5','abc','12abc','Infinity']){r(`addScalePoint({x:0,y:0});addScalePoint({x:100,y:0});$('#scaleDistance').value=${JSON.stringify(input)};$('#scaleForm').onsubmit({preventDefault(){}})`);assert.equal(r('state.scale.perPixel'),.125);r('cancelScaleEntry()');}
 const legacy=harness();legacy.local.set('fantasy-route-mapper-v9',JSON.stringify({projectName:'Legacy',routes:[],markers:[],sessions:[]}));for(const s of scripts)vm.runInContext(s,legacy.ctx);await settle();assert.equal(legacy.records.size,1);assert.equal(legacy.local.get('frm-indexeddb-migration-complete'),'1');await legacy.run('migrateLegacy()');assert.equal(legacy.records.size,1);
 assert.deepEqual(h.alerts,[]);assert.deepEqual(legacy.alerts,[]);
 console.log('PASS separate-script loading/startup (mock DOM/IndexedDB), selectors, calendar, travel totals, scale UI, save/reload, campaign/all backups, legacy migration and invalid/future data rejection');
 console.log('NOTE: These are source and simulated regression checks, not a real browser or real IndexedDB test.');
})().catch(e=>{console.error(e);process.exitCode=1});
