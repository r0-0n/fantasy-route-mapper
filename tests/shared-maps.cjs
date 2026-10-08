const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto').webcrypto;
const source=fs.readFileSync(__dirname+'/../js/storage.js','utf8');
const records=new Map();
const db={transaction(){
 const tx={};let pending=0;
 const enqueue=fn=>{pending++;queueMicrotask(()=>{fn();if(!--pending)queueMicrotask(()=>{if(!pending)tx.oncomplete?.()})})};
 const store={getAll(){const req={};enqueue(()=>{req.result=[...records.values()];req.onsuccess?.()});return req},put(rec){enqueue(()=>records.set(rec.id,structuredClone(rec)))},delete(id){enqueue(()=>records.delete(id))}};
 tx.objectStore=()=>store;return tx;
}};
const ctx={crypto,Blob,Uint8Array,openDB:async()=>db,STORE:'campaigns'};vm.createContext(ctx);
vm.runInContext(source.slice(source.indexOf('function isMapAsset'),source.indexOf('function dataUrlToBlob')),ctx);
(async()=>{
 const blob=new Blob(['same map'],{type:'image/png'}),a={id:'a',data:{imageName:'map.png'},imageBlob:blob};
 await ctx.dbPut(a);await ctx.dbPut({...a,id:'b'});
 assert.equal([...records.values()].filter(r=>r.recordType).length,1);
 assert.equal((await ctx.dbGetAll()).length,2);
 assert.equal(await (await ctx.dbGet('b')).imageBlob.text(),'same map');
 await ctx.dbDelete('a');assert.equal(await (await ctx.dbGet('b')).imageBlob.text(),'same map');
 await ctx.dbPut({...a,id:'b',imageBlob:new Blob(['replacement'])});assert.equal([...records.values()].filter(r=>r.recordType).length,1);
 records.set('old',{...a,id:'old'});assert.equal(await (await ctx.dbGet('old')).imageBlob.text(),'same map');
 await ctx.dbDelete('b');assert.equal([...records.values()].filter(r=>r.recordType).length,0);assert((await ctx.dbGet('old')).imageBlob);
 console.log('PASS shared map storage, resolving legacy records, replacing maps and deleting references (simulated transactions).');
})().catch(e=>{console.error(e);process.exitCode=1});
