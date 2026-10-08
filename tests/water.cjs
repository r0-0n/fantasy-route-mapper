const vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');const c=vm.createContext({state:{roads:[{width:3,points:[{x:0,y:0},{x:50,y:30},{x:100,y:0}]},{kind:'water',width:3,points:[{x:0,y:0},{x:50,y:-30},{x:100,y:0}]}]},d:(a,b)=>Math.hypot(a.x-b.x,a.y-b.y)});
for(const f of ['road-routing.js','terrain.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../js',f),'utf8'),c);
vm.runInContext(`
const start={x:0,y:0},end={x:100,y:0};
if(!findRoadPath(start,end).some(p=>p.y===30))throw Error('legacy land');
if(!findRoadPath(start,end,'water').some(p=>p.y===-30))throw Error('water network');
const boat={points:[start],log:{followRoads:true,transport:'Boot'}};appendFollowingRoad(boat,end);
if(!boat.points.some(p=>p.y===-30))throw Error('boat');
if(followsRoad({x:25,y:-15},50,-30))throw Error('water terrain bonus');
validateDM(JSON.parse(JSON.stringify(state)));
state.roads=state.roads.filter(r=>r.kind==='water');if(findRoadPath(start,end))throw Error('land uses water');
`,c);console.log('PASS water routing, legacy land, boat selection, no terrain bonus, serialized validation, network isolation');
vm.runInContext(`
state.roads=[{kind:'water',width:3,points:[{x:0,y:0},{x:50,y:-30},{x:100,y:0}]}];
const shoreA={x:0,y:40},shoreB={x:100,y:40};
if(findRoadPath(shoreA,shoreB,'water'))throw Error('click tolerance changed');
const shorePath=waterPathBetweenLocations(shoreA,shoreB);
if(!shorePath||!shorePath.some(p=>p.y===-30)||shorePath[0].y!==40||shorePath.at(-1).y!==40)throw Error('shore access');
state.roads=[{kind:'water',width:2,points:[{x:0,y:0},{x:10,y:0}]},{kind:'water',width:2,points:[{x:90,y:0},{x:100,y:0}]}];
if(waterPathBetweenLocations(shoreA,shoreB))throw Error('disconnected water joined');
`,c);console.log('PASS shore access and disconnected water rejection');
