const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(require('node:path').join(__dirname,'../js/init.js'),'utf8');
const nodes=new Map(),events={};
function node(id){if(!nodes.has(id)){const classes=new Set();nodes.set(id,{id,open:true,classList:{add:c=>classes.add(c),contains:c=>classes.has(c)},setAttribute(k,v){this[k]=v},addEventListener(t,f){events[id+':'+t]=f}})}return nodes.get(id)}
const context={document:{addEventListener(t,f){events[t]=f}},$:s=>node(s.slice(1))};vm.createContext(context);
vm.runInContext(source.slice(source.indexOf('function closeMapToolPanels'),source.indexOf('$("#projectMenuBtn").onclick')),context);
vm.runInContext("closeMapToolPanels('cityFilterControls')",context);
assert(node('cityFilterControls').open);assert(!node('mapNavigation').open);assert(node('projectMenu').classList.contains('hidden'));assert.equal(node('projectMenuBtn')['aria-expanded'],'false');
node('cityFilterControls').open=true;events.pointerdown({target:{closest(){return null}}});assert(!node('cityFilterControls').open);
node('mapNavigation').open=true;node('cityFilterControls').open=true;events.pointerdown({target:{closest(s){return s.startsWith('#projectMenu,')?node('mapNavigation'):null}}});assert(node('mapNavigation').open);assert(!node('cityFilterControls').open);
node('cityFilterControls').open=true;events.click({target:{closest(){return null}}});assert(!node('cityFilterControls').open);
console.log('PASS exclusive map panels and outside-map selection (simulated events)');
