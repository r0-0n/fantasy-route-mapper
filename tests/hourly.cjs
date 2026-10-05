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
run(`save=()=>{};render=()=>{};renderLogbook=()=>{};state.sessions=[];state.calendar='gregorian';state.unit='mi';state.routes=[];state.markers=[];
 const settings={version:1,calendar:'gregorian',date:'2024-02-28',hour:8,dailyStart:8,dailyHours:8};
 const snap={name:'Weg <test>',transport:'Lopend',segments:[{distanceMi:24,hours:8},{distanceMi:24,hours:16}]};
 const trip=(id,from,to)=>({id,kind:'travel',label:'Reis',routeId:'r1',trip:1,from,to,dailyHours:8,extraHours:0,hoursOverride:null,snapshot:snap});
 const stay=(id,h)=>({id,kind:'stay',label:'Verblijf',hours:h});
 const entries=[{id:'s1',hourlyVersion:1,number:'1',realDate:'2026-10-01',title:'Eerste',activities:[trip('a',0,50),stay('b',2)]},{id:'s2',hourlyVersion:1,number:'2',realDate:'2026-10-02',title:'Tweede',activities:[trip('c',50,100)]}];
 validateHourlySessions(entries);const calc=calculateHourly(entries,settings);`);
assert.equal(run('calc.travel'),24);assert.equal(run('calc.distanceMi'),48);
assert.equal(run('calc.rows[0].end-calc.rows[0].start'),10);
assert.equal(run('hourDate(calc.end,settings.calendar)'),'2024-03-01 · 16:00');
assert.equal(run('calc.other'),32); // Two explicit hours + 30 hours rest.
assert.equal(run('routeHourPortion(snap,50,100).hours'),16); // terrain-based portion, not a percentage of time
// Cumulative rounding means split portions sum to the full trip.
assert.equal(run(`[routeHourPortion(snap,0,33.33),routeHourPortion(snap,33.33,66.67),routeHourPortion(snap,66.67,100)].reduce((n,p)=>n+p.hours,0)`),24);
assert.throws(()=>run(`validateHourlySessions([...entries,{id:'bad',activities:[trip('bad',25,75)]}])`),/al geregistreerd/);
run(`const repeated=trip('repeat',0,100);repeated.trip=2;validateHourlySessions([...entries,{id:'again',activities:[repeated]}])`);
// Continuous sailing crosses midnight without inserting overnight rest.
assert.equal(run('scheduleHourTravel(22,30,8,24).end'),52);
assert.equal(run('scheduleHourTravel(22,30,8,24).rest'),0);
// Overnight departure window: 20:00–04:00.
assert.equal(run('scheduleHourTravel(23,6,20,8).end'),29);
// Edit and delete recompute every later timestamp; real play dates are unaffected.
run(`commitHourly(entries,settings);const oldEnd=state.sessions[1].gameEnd;const modified=hourlySessions();modified[0].activities[1].hours=26;commitHourly(modified,settings);`);
assert.equal(run('state.sessions[1].gameEnd'),'2024-03-02');
assert.equal(run('state.sessions[1].realDate'),'2026-10-02');
run(`commitHourly(hourlySessions().slice(1),settings)`);
assert.equal(run('state.sessions[0].gameStart'),'2024-02-28');
// JSON backup roundtrip preserves hourly settings, fractions, route snapshots and validation.
run(`const roundtrip=unwrapCampaignImport(campaignExportEnvelope(projectData())).data;`);
assert.equal(run('roundtrip.hourlyTimeline.hour'),8);
assert.equal(run('roundtrip.sessions[0].activities[0].from'),50);
assert.throws(()=>run(`const broken=cloneJSON(roundtrip);broken.sessions[0].activities[0].extraHours=-1;prepareCampaignData(broken)`));
// Harptos Midsummer -> Shieldmeet -> Eleasis.
assert.equal(run(`hourDate(gameOrdinal('Midsummer 1492 DR','harptos')*24+48,'harptos')`),'1 Eleasis 1492 DR · 00:00');
// Legacy total/snapshot preserved without pretending all time was active travel.
run(`state.sessions=[{id:'old',number:'1',calendar:'gregorian',gameStart:'2024-01-01',gameEnd:'2024-01-03',timeMode:'manual',gameDays:2,routeIds:[],locationIds:[],travelSnapshot:{name:'Oud',distance:12,duration:1,unit:'mi',places:[]}}];const migration=hourlySessions();commitHourly(migration,settings);`);
assert.equal(run('state.sessions[0].gameDays'),2);assert.equal(run('state.sessions[0].legacyOriginal.gameStart'),'2024-01-01');
assert.equal(run('calculateHourly(hourlySessions(),settings).unclassified'),48);
assert.equal(run('state.sessions[0].travelSnapshot.distance'),12);
// Actual UI event handlers: add, edit, save, reopening, and cancellation.
run(`state.sessions=[];state.hourlyTimeline=settings;state.scale={perPixel:1};state.routes=[{id:'r1',name:'Test route',points:[{x:0,y:0},{x:24,y:0}],log:{transport:'Lopend',pace:24,terrainMode:'manual'}}];bindHourlyUI();openHourlyEditor(null);openHourActivity('travel');`);
nodes.get('#hourRoute').value='r1';run('hourSuggestRange()');nodes.get('#hourTo').value='50';run('saveHourActivity()');
assert.equal(run('hourDraft.activities.length'),1,nodes.get('#hourActivityError').textContent);assert.equal(run('hourDraft.activities[0].to'),50);
run(`openHourActivity('stay');`);nodes.get('#hourStayHours').value='3';run('saveHourActivity()');
nodes.get('#hourSave').click();assert.equal(run('state.sessions.length'),1);assert.equal(run('state.sessions[0].gameDays'),7/24);
run('openHourlyEditor(null);openHourActivity("travel");');nodes.get('#hourRoute').value='r1';run('hourSuggestRange()');assert.equal(nodes.get('#hourFrom').value,'50');run('saveHourActivity()');nodes.get('#hourSave').click();assert.equal(run('state.sessions.length'),2);
run('openHourlyEditor(state.sessions[0].id);openHourActivity("",1)');nodes.get('#hourStayHours').value='27';run('saveHourActivity()');nodes.get('#hourSave').click();assert.equal(run('state.sessions[1].gameStart'),'2024-02-29');
run('openHourlyEditor(state.sessions[0].id)');nodes.get('#hourTitle').value='Discarded';nodes.get('#hourCancel').click();assert.notEqual(run('state.sessions[0].title'),'Discarded');
run(`$('#sessionSearch').value='';$('#sessionFilter').value='all';$('#sessionSort').value='sessionAsc';$('#travelFrom').value='';$('#travelUntil').value='';`);
assert(run('logbookMarkdown()').includes('Reisuren'));assert(run('logbookHtml()').includes('In-game van'));
assert(!run('logbookHtml()').includes('<test>'));
console.log('PASS hourly scheduling, leap dates, partial terrain trips, overlap prevention, repeated trips, cumulative rounding, migration, shifting, backup validation and real UI handlers (simulated DOM).');
// Campaign timeline settings: invalid input must not mutate saved sessions.
run('bindTimelineSettings();');nodes.get('#openTimelineSettings').click();
const savedBefore=run('JSON.stringify(state.sessions)');nodes.get('#timelineDailyHours').value='0';nodes.get('#saveTimelineSettings').click();assert.equal(run('JSON.stringify(state.sessions)'),savedBefore);assert(nodes.get('#timelineSettingsError').textContent);
nodes.get('#timelineDailyHours').value='8';nodes.get('#timelineDate').value='2024-03-10';nodes.get('#saveTimelineSettings').click();assert.equal(run('state.sessions[0].gameStart'),'2024-03-10');
run('openHourlyEditor(state.sessions[0].id)');assert.equal(nodes.get('#hourInitialSettings').hidden,true);assert(nodes.get('#hourActivities').innerHTML.includes('<table'));assert(nodes.get('#hourPreview').innerHTML.includes('<table'));assert.equal(nodes.get('#hourTimelineDetails').open,false);
console.log('PASS timeline settings validation and propagation; compact session tables retain calculated data');
assert.equal(run('scheduleHourTravel(22,8,8,8).rest'),0);
assert.equal(run('scheduleHourTravel(22,8,8,8).end'),30);
assert(run('scheduleHourTravel(22,9,8,8).rest')>0);
run('openHourlyEditor(state.sessions[0].id);openHourActivity("stay");const endTarget=hourActivityStart()+29;');
nodes.get('#activityTimeMode').value='end';nodes.get('#activityEndDate').value=run('gameDateFromOrdinal(Math.floor(endTarget/24),hourlySettings().calendar)');nodes.get('#activityEndHour').value=run('endTarget%24');run('saveHourActivity()');assert.equal(run('hourDraft.activities.at(-1).hours'),29);
const countBefore=run('hourDraft.activities.length');run('openHourActivity("stay")');nodes.get('#activityTimeMode').value='end';nodes.get('#activityEndDate').value='1900-01-01';nodes.get('#activityEndHour').value='0';run('saveHourActivity()');assert.equal(run('hourDraft.activities.length'),countBefore);assert(nodes.get('#hourActivityError').textContent.includes('eindtijd'));
console.log('PASS short journey has no automatic rest, long journey retains roster, end-time duration across midnight and invalid end rejected');
