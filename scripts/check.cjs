const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const version=JSON.parse(read('package.json')).version,html=read('index.html'),app=read('js/app.js');
assert.match(version,/^\d+\.\d+\.\d+$/);
assert(html.includes(`<title>Fantasy Route Mapper v${version}</title>`),'HTML title version');
assert(html.includes(`>v${version}</div>`),'visible version');
assert(app.includes(`APP_VERSION="${version}"`),'APP_VERSION');
assert(read('README.md').startsWith(`# Fantasy Route Mapper ${version}\n`),'README version');
for(const link of ['https://r0-0n.github.io/fantasy-route-mapper/','https://github.com/r0-0n/fantasy-route-mapper/archive/refs/heads/main.zip'])assert(read('README.md').includes(link),'README link');
const scripts=[...html.matchAll(/<script\b([^>]*)><\/script>/g)];assert.equal(scripts.length,9);
for(const [,attrs] of scripts){assert(!/\b(?:async|defer|type)\s*(?:=|$)/.test(attrs));const src=attrs.match(/src="([^"]+)"/)[1];const [file,query]=src.split("?");assert.equal(query,`v=${version}`);assert(/^js\/[\w-]+\.js$/.test(file));new vm.Script(read(file),{filename:file});}
assert(html.includes(`href="css/app.css?v=${version}"`));read('css/app.css');
console.log('PASS release versions, README links, classic local scripts and syntax');
