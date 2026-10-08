const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.join(__dirname,'..');
const source=fs.readFileSync(path.join(root,'js/init.js'),'utf8').split('function bindAppUpdates(report){')[1];
async function scenario({waiting=true,save=true,other=false,local=false}={}){
 const button={classList:{toggle(){}},textContent:''},mapButton={},events={},reports=[];let saved=0,sent=0,reloaded=0;
 const worker={postMessage(data,ports){sent++;ports[0].peer.onmessage({data:{ok:!other}})}};
 const reg={waiting:waiting?worker:null,addEventListener(){},async update(){}};
 const ctx={document:{querySelector:()=>null},$:s=>s==='#mapUpdateBtn'?mapButton:button,location:{protocol:local?'file:':'https:',reload(){reloaded++}},window:{isSecureContext:true,addEventListener(){}},navigator:{serviceWorker:{register:async()=>reg,addEventListener(n,f){events[n]=f}}},flushSave:async()=>{saved++;return save},setTimeout,clearTimeout,setInterval(){},MessageChannel:class{constructor(){this.port1={close(){}};this.port2={peer:this.port1}}}};
 vm.createContext(ctx);vm.runInContext('function bindAppUpdates(report){'+source,ctx);ctx.bindAppUpdates(s=>reports.push(s));await Promise.resolve();await button.onclick();
 return {button,mapButton,events,reports,saved,sent,get reloaded(){return reloaded}};
}
(async()=>{
 let s=await scenario();assert.equal(s.saved,1);assert.equal(s.sent,1);assert.equal(s.mapButton.hidden,false);s.events.controllerchange();assert.equal(s.reloaded,1);
 s=await scenario({save:false});assert.equal(s.sent,0);s.events.controllerchange();assert.equal(s.reloaded,0);
 s=await scenario({other:true});s.events.controllerchange();assert.equal(s.reloaded,0);assert.equal(s.button.disabled,false);
 s=await scenario({waiting:false});assert.equal(s.sent,0);assert.equal(s.button.hidden,true);assert.equal(s.mapButton.hidden,true);assert.match(s.reports.at(-1),/Geen nieuwe/);
 s=await scenario({local:true});assert.equal(s.saved,0);assert.match(s.reports[0],/lokale download/);
 const handlers={};let skipped=0,deleted=[];
 const context={self:{registration:{scope:'https://example.test/frm/'},clients:{matchAll:async()=>[{url:'https://example.test/frm/'}]},addEventListener(n,f){handlers[n]=f},skipWaiting:async()=>{skipped++}},caches:{keys:async()=>['other','frm-shell-https://example.test/frm/old'],delete:async k=>deleted.push(k)},URL};
 vm.createContext(context);vm.runInContext(fs.readFileSync(path.join(root,'sw.js'),'utf8'),context);
 let pending,reply;const event={data:{type:'FRM_APPLY_UPDATE'},ports:[{postMessage:r=>reply=r}],waitUntil:p=>pending=p};handlers.message(event);await pending;assert.equal(skipped,1);assert.equal(reply.ok,true);
 context.self.clients.matchAll=async()=>[{url:'https://example.test/frm/'},{url:'https://example.test/frm/index.html'}];handlers.message(event);await pending;assert.equal(skipped,1);assert.equal(reply.ok,false);
 handlers.activate({waitUntil:p=>pending=p});await pending;assert.deepEqual(deleted,['frm-shell-https://example.test/frm/old']);
 console.log('Update controls: save gate, local mode, waiting worker, multiple windows and scoped cache cleanup passed (simulated).');
})().catch(e=>{console.error(e);process.exit(1)});
