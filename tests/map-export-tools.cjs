const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const read=name=>fs.readFileSync(__dirname+'/../js/'+name,'utf8');
const exp=read('export.js'),storage=read('storage.js'),init=read('init.js');
const ctx=vm.createContext({});
vm.runInContext(read('app.js').slice(read('app.js').indexOf('function routeDashPattern')),ctx);
assert.deepEqual(Array.from(ctx.routeDashPattern('planned',4)),[0,12]);assert.deepEqual(Array.from(ctx.routeDashPattern('traveling',4)),[12,8]);assert.deepEqual(Array.from(ctx.routeDashPattern('done',4)),[]);
vm.runInContext(exp.slice(exp.indexOf('function originalMapExportName')),ctx);
vm.runInContext(exp.slice(exp.indexOf('function customPlayerBounds'),exp.indexOf('async function paintPlayerMap')),ctx);
const crop=(...a)=>JSON.parse(JSON.stringify(ctx.customPlayerBounds(...a)));
assert.deepEqual(crop(4000,2000,4,100,0),{x:3000,y:0,width:1000,height:500});
assert.deepEqual(crop(4000,2000,1,50,50),{x:0,y:0,width:4000,height:2000});
assert.deepEqual(crop(4000,2000,2,50,100),{x:1000,y:1000,width:2000,height:1000});
vm.runInContext(storage.slice(storage.indexOf('function renamedMapFilename')),ctx);
assert.equal(ctx.renamedMapFilename('old.PNG','New map'),'New map.PNG');assert.equal(ctx.renamedMapFilename('old.webp','City.jpg'),'City.webp');assert.equal(ctx.renamedMapFilename('old.jpeg','New'),'New.jpeg');
assert.throws(()=>ctx.renamedMapFilename('old.jpg','../bad'));assert.throws(()=>ctx.renamedMapFilename('old.jpg',''));assert.throws(()=>ctx.renamedMapFilename('old.svg','New'));
(async()=>{
 let exported;ctx.downloadBlob=(blob,name)=>exported={blob,name};ctx.campaignSlug=n=>n;ctx.flushSave=async()=>true;const raw={type:'image/webp'};ctx.dbGet=async id=>({data:{imageName:'Hernoemde stad.webp',projectName:'Phandalin'},imageBlob:raw});await ctx.exportStoredMapImage('city');assert.equal(exported.blob,raw);assert.equal(exported.name,'Hernoemde stad.webp');assert.equal(ctx.originalMapExportName({imageName:'test.PNG'},{type:'image/png'}),'test.PNG');assert.equal(ctx.originalMapExportName({imageName:'test.jpeg'},{type:'image/jpeg'}),'test.jpeg');ctx.dbGet=async()=>null;await assert.rejects(()=>ctx.exportStoredMapImage('missing'));ctx.flushSave=async()=>false;await assert.rejects(()=>ctx.exportStoredMapImage('city'));
 let saved,rendered=0;const blob={};ctx.state={imageName:'active.png'};ctx.activeCampaignId='world';ctx.flushSave=async()=>true;ctx.dbGet=async()=>({id:'city',data:{imageName:'Phandalin.webp'},imageBlob:blob});ctx.metaFor=()=>({});ctx.dbPut=async r=>saved=r;ctx.render=()=>rendered++;
 await ctx.renameStoredMap('city','Village');assert.equal(saved.data.imageName,'Village.webp');assert.equal(saved.imageBlob,blob);assert.equal(ctx.state.imageName,'active.png');assert.equal(rendered,0);
 ctx.activeCampaignId='city';await ctx.renameStoredMap('city','Town');assert.equal(ctx.state.imageName,'Town.webp');assert.equal(rendered,1);
 ctx.flushSave=async()=>false;await assert.rejects(()=>ctx.renameStoredMap('city','Lost'));
 const pwa=init.slice(init.indexOf('// PWA is optional.'),init.indexOf("$('#stopDrawingNow')"));
 for(const scenario of ['local','unsupported','accepted','cancelled','failed','standalone']){
  const nodes={},events={};const node=id=>nodes[id]??={textContent:'',showModal(){this.open=true},close(){this.open=false}};
  const c=vm.createContext({$:node,window:{matchMedia:()=>({matches:scenario==='standalone'}),addEventListener:(n,f)=>events[n]=f},location:{protocol:scenario==='local'?'file:':'https:'},bindAppUpdates(){}});
  vm.runInContext(pwa,c);
  if(['accepted','cancelled','failed'].includes(scenario))events.beforeinstallprompt({preventDefault(){},prompt:async()=>{if(scenario==='failed')throw Error('failure')},userChoice:Promise.resolve({outcome:scenario==='accepted'?'accepted':'dismissed'})});
  await nodes['#homeInstallBtn'].onclick();
  if(['local','unsupported','failed'].includes(scenario))assert(nodes['#installHelpDialog'].open);
  if(scenario==='accepted')assert.match(nodes['#homeInstallStatus'].textContent,/aangevraagd/);
  if(scenario==='cancelled')assert.match(nodes['#homeInstallStatus'].textContent,/geannuleerd/);
  if(scenario==='standalone')assert(nodes['#homeInstallBtn'].hidden);
 }
 console.log('PASS export crop edges, rename formats/selected record/save gate, install help and prompt outcomes (simulated)');
})().catch(e=>{console.error(e);process.exitCode=1});
