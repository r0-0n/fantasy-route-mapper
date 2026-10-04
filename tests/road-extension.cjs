const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
const c=vm.createContext({state:{view:{z:1},roads:[]},d:(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),uid:()=> 'new'});
vm.runInContext(fs.readFileSync(require('node:path').join(__dirname,'../js/terrain.js'),'utf8'),c);
vm.runInContext(`
state.roads=[{id:'a',width:9,points:[{x:10,y:10},{x:100,y:10}]}];
const a=nearestDMRoadEnd({x:108,y:10});
if(!a||a.atStart)throw Error('end snap');
commitDMRoad({attach:a,width:2,points:[a.point,{x:150,y:20}]});
if(state.roads.length!==1||state.roads[0].width!==9||state.roads[0].points.at(-1).x!==150)throw Error('extension width or geometry');
const b=nearestDMRoadEnd({x:12,y:10});
commitDMRoad({attach:b,width:2,points:[b.point,{x:-30,y:10}]});
if(state.roads[0].points[0].x!==-30||state.roads[0].points.at(-1).x!==150)throw Error('reverse extension');
state.view.z=4;
if(nearestDMRoadEnd({x:160,y:20}))throw Error('screen tolerance');
if(!nearestDMRoadEnd({x:153,y:20}))throw Error('zoom snap');
`,c);
console.log('PASS road extension at both ends, inherited width, screen-space snapping');
