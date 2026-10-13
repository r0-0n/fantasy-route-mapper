const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),catalog=JSON.parse(fs.readFileSync(path.join(root,'docs/icon-catalog.json'))),context={};
vm.createContext(context);vm.runInContext(fs.readFileSync(path.join(root,'js/world-icons.js'),'utf8'),context);
const art=vm.runInContext('LOCATION_ART',context),hashes=new Set(),worker=fs.readFileSync(path.join(root,'sw.js'),'utf8');
assert.equal(catalog.length,127);assert.equal(Object.keys(art).length,catalog.length);
for(const item of catalog){const bytes=Buffer.from(art[item.type].split(',')[1],'base64');assert.equal(bytes.subarray(1,4).toString(),'PNG');assert.equal(bytes.readUInt32BE(16),48,item.type);assert.equal(bytes.readUInt32BE(20),48,item.type);assert.equal(art[item.type],'data:image/png;base64,'+bytes.toString('base64'));hashes.add(crypto.createHash('sha256').update(bytes).digest('hex'));assert(worker.includes('./js/world-icons.js'),'Embedded catalog cached offline');}
assert.equal(hashes.size,catalog.length,'Each subtype has its own image');
console.log('PASS all 127 distinct 48px images, embedded export data and offline assets');

assert(!fs.existsSync(path.join(root,'assets/location-art')),'No duplicate image files');
assert(fs.readFileSync(path.join(root,'docs/location-art.html'),'utf8').includes('im.src=LOCATION_ART[im.dataset.art]'));
