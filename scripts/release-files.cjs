const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
function releaseFiles(root){
 const names=JSON.parse(fs.readFileSync(path.join(root,'release-files.json'),'utf8'));
 assert.equal(new Set(names).size,names.length,'Duplicate release path');
 for(const name of names){
  assert(typeof name==='string'&&!path.isAbsolute(name)&&!name.split('/').some(p=>p==='..'||p==='dist'||p==='node_modules'||p==='__MACOSX'||(p.startsWith('.')&&p!=='.gitignore')),'Unsafe or unwanted release path: '+name);
  const parts=name.split('/');for(let i=1;i<=parts.length;i++)assert(!fs.lstatSync(path.join(root,...parts.slice(0,i))).isSymbolicLink(),'Symlink in release');
  assert(fs.statSync(path.join(root,name)).isFile(),'Missing release file: '+name);
 }
 const worker=fs.readFileSync(path.join(root,'sw.js'),'utf8'),assets=JSON.parse(worker.match(/const ASSETS=(\[.*?\]);/s)[1]);
 for(const asset of assets)assert(names.includes(asset.replace(/^\.\//,'').split('?')[0]),'Offline dependency missing from release: '+asset);
 return names;
}
module.exports={releaseFiles};
