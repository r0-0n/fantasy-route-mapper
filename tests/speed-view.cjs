const vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');const c=vm.createContext({state:{scale:{perPixel:1},unit:'mi',roads:[],terrain:{version:1,width:100,height:1,cols:100,rows:1,runs:[[0,50,7],[50,50,5]]}},map:{naturalWidth:100,naturalHeight:1},routeDistance:r=>r.points.slice(1).reduce((sum,b,i)=>sum+Math.hypot(b.x-r.points[i].x,b.y-r.points[i].y),0)});vm.runInContext(fs.readFileSync(path.join(__dirname,'../js/terrain.js'),'utf8'),c);vm.runInContext(`
const r={points:[{x:0,y:.5},{x:100,y:.5}],log:{terrainMode:'terrain',transport:'Lopend',terrainPace:'fast',pace:24}};
const result=terrainRouteAnalysis(r),parts=speedParts(r);
if(parts.length!==2||parts[0].pace!==18||parts[1].pace!==30)throw Error('speeds');
if(parts[0].points.at(-1).x!==50||parts[1].points[0].x!==50)throw Error('boundary geometry');
if(Math.abs(parts.reduce((s,p)=>s+p.days,0)-result.days)>1e-9)throw Error('time totals');
if(parts.reduce((s,p)=>s+p.distance,0)!==100)throw Error('distance totals');
const red=speedColor(18);state.unit='km';if(speedColor(18*1.609344)!==red)throw Error('unit colors');
r.log.transport='Boot';r.log.pace=48;const boat=speedParts(r);if(boat.length!==1||!boat[0].manual||boat[0].pace!==48)throw Error('boat speed');
state.scale=null;if(speedParts(r).length)throw Error('missing scale');
`,c);console.log('PASS speed boundaries, geometry continuity, totals, unit colors, boat and missing scale');
