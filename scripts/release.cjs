// Dependency-free ZIP writer (uncompressed ZIP, standard CRC32).
const fs=require('node:fs'),path=require('node:path'),{execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
for(const file of ['scripts/check.cjs','tests/verify.cjs'])execFileSync(process.execPath,[path.join(root,file)],{cwd:root,stdio:'inherit'});
const version=JSON.parse(fs.readFileSync(path.join(root,'package.json'))).version;
const prefix=`fantasy-route-mapper-v${version}`,out=path.join(root,'dist',prefix+'.zip');
if(fs.existsSync(out))throw new Error('Release bestaat al: '+out+'. Verplaats die eerst om overschrijven te voorkomen.');
function files(dir){return fs.readdirSync(path.join(root,dir),{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name)).flatMap(e=>{const p=path.posix.join(dir,e.name);if(e.isSymbolicLink())throw new Error('Geen symlinks in release: '+p);return e.isDirectory()?files(p):[p]})}
const names=['index.html','README.md','AGENTS.md','BROWSER_TESTS.md','package.json','.gitignore',...files('css'),...files('js'),...files('scripts'),...files('tests')];
if(fs.existsSync(path.join(root,'LICENSE')))names.push('LICENSE');
function crc32(b){let c=0xffffffff;for(const x of b){c^=x;for(let i=0;i<8;i++)c=(c>>>1)^((c&1)?0xedb88320:0)}return (c^0xffffffff)>>>0}
let offset=0,locals=[],central=[];
for(const file of names.sort()){
 const data=fs.readFileSync(path.join(root,file)),name=Buffer.from(prefix+'/'+file),crc=crc32(data);
 const h=Buffer.alloc(30);h.writeUInt32LE(0x04034b50);h.writeUInt16LE(20,4);h.writeUInt16LE(0x800,6);h.writeUInt16LE(33,12);h.writeUInt32LE(crc,14);h.writeUInt32LE(data.length,18);h.writeUInt32LE(data.length,22);h.writeUInt16LE(name.length,26);
 const c=Buffer.alloc(46);c.writeUInt32LE(0x02014b50);c.writeUInt16LE(20,4);c.writeUInt16LE(20,6);c.writeUInt16LE(0x800,8);c.writeUInt16LE(33,14);c.writeUInt32LE(crc,16);c.writeUInt32LE(data.length,20);c.writeUInt32LE(data.length,24);c.writeUInt16LE(name.length,28);c.writeUInt32LE(offset,42);
 locals.push(h,name,data);central.push(c,name);offset+=h.length+name.length+data.length;
}
const directory=Buffer.concat(central),end=Buffer.alloc(22);end.writeUInt32LE(0x06054b50);end.writeUInt16LE(names.length,8);end.writeUInt16LE(names.length,10);end.writeUInt32LE(directory.length,12);end.writeUInt32LE(offset,16);
fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,Buffer.concat([...locals,directory,end]),{flag:'wx'});console.log('Release gemaakt: '+out);
