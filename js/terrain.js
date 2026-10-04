// DM terrain: a single-valued raster, RLE-encoded in campaign data. New fills
// replace cell values, rather than stacking overlapping transparent polygons.
const TERRAIN_TYPES=[
 ['Unknown','#000000','◌',2],['Arctic','#bddfed','❄',2],['Coastal','#62bfc6','≈',1],
 ['Desert','#e3bd65','☀',1],['Forest','#398b54','♣',1],['Grassland','#a4bd59','❀',2],
 ['Hill','#a99663','⌁',1],['Mountain','#969aa7','▲',0],['Swamp','#687e48','≋',0],
 ['Underdark','#8c689f','◆',1],['Urban','#b98269','▦',1]
];
let speedView=false;
let mapEditTab="terrain";
let dmOpen=false,dmTool=null,dmDraft=null,dmShowTerrain=false,dmShowRoads=false;
let dmHideObjects=false;
let dmUndoStack=[],terrainCache=null,terrainPaintKey=null,dmCampaign=null,terrainRevision=0;
const terrainDurationCache=new WeakMap();
function validateDM(data){
 if(!data||typeof data!=='object')throw new Error('Ongeldige campagnegegevens.');
 const t=data.terrain;if(t){
  if(t.version!==1||!Number.isInteger(t.cols)||!Number.isInteger(t.rows)||t.cols<1||t.rows<1||t.cols>2048||t.rows>2048||!Number.isFinite(t.width)||!Number.isFinite(t.height)||t.width<=0||t.height<=0||!Array.isArray(t.runs)||t.runs.length>t.cols*t.rows)throw new Error('Ongeldige terreinkaart.');
  let end=0;for(const run of t.runs){if(!Array.isArray(run)||run.length!==3||!run.every(Number.isInteger)||run[0]<end||run[1]<1||run[0]+run[1]>t.cols*t.rows||run[2]<1||run[2]>=TERRAIN_TYPES.length)throw new Error('Ongeldige terreinvlakken.');end=run[0]+run[1]}
 }
 if(data.roads!==undefined){if(!Array.isArray(data.roads)||data.roads.length>10000)throw new Error('Ongeldige wegen.');for(const road of data.roads){if((road.kind!==undefined&&!['land','water'].includes(road.kind))||!Number.isFinite(road.width)||road.width<=0||!Array.isArray(road.points)||road.points.length<2||road.points.length>10000||road.points.some(p=>!Number.isFinite(p.x)||!Number.isFinite(p.y)))throw new Error('Ongeldige weg.')}}
}
function terrainGrid(){
 const t=state.terrain;if(!t)return null;if(terrainCache?.source===t)return terrainCache;
 const cells=new Uint8Array(t.cols*t.rows);for(const [start,length,value] of t.runs)cells.fill(value,start,start+length);
 return terrainCache={source:t,cells};
}
function createTerrain(width,height){const factor=Math.min(1,2048/Math.max(width,height));return {version:1,width,height,cols:Math.max(1,Math.ceil(width*factor)),rows:Math.max(1,Math.ceil(height*factor)),runs:[]}}
function encodeTerrain(cells){const runs=[];for(let i=0;i<cells.length;){const type=cells[i],start=i;while(i<cells.length&&cells[i]===type)i++;if(type)runs.push([start,i-start,type])}return runs}
function pointInTerrainPolygon(p,points){let inside=false;for(let i=0,j=points.length-1;i<points.length;j=i++){const a=points[i],b=points[j];if((a.y>p.y)!==(b.y>p.y)&&p.x<(b.x-a.x)*(p.y-a.y)/(b.y-a.y)+a.x)inside=!inside}return inside}
function fillTerrainPolygon(points,type){
 if(points.length<3||!Number.isInteger(type)||type<0||type>=TERRAIN_TYPES.length)return false;
 if(!state.terrain)state.terrain=createTerrain(map.naturalWidth,map.naturalHeight);
 const t=state.terrain,cells=terrainGrid().cells.slice(),sx=t.width/t.cols,sy=t.height/t.rows;
 // Scanline fill at cell centres, even-odd rule; self-crossing outlines are predictable.
 const low=Math.max(0,Math.floor(Math.min(...points.map(p=>p.y))/sy)),high=Math.min(t.rows-1,Math.floor(Math.max(...points.map(p=>p.y))/sy));let changed=false;
 for(let row=low;row<=high;row++){const y=(row+.5)*sy,cross=[];for(let i=0,j=points.length-1;i<points.length;j=i++){const a=points[i],b=points[j];if((a.y>y)!==(b.y>y))cross.push(a.x+(y-a.y)*(b.x-a.x)/(b.y-a.y))}cross.sort((a,b)=>a-b);
  for(let k=0;k+1<cross.length;k+=2){const from=Math.max(0,Math.ceil(cross[k]/sx-.5)),to=Math.min(t.cols-1,Math.ceil(cross[k+1]/sx-.5)-1);for(let col=from;col<=to;col++){const i=row*t.cols+col;if(cells[i]!==type){cells[i]=type;changed=true}}}
 }
 if(changed){state.terrain={...t,runs:encodeTerrain(cells)};invalidateTerrain()}return changed;
}
function invalidateTerrain(){terrainRevision++;terrainCache=null;terrainPaintKey=null}
function terrainAt(p){const t=state.terrain;if(!t||p.x<0||p.y<0||p.x>=t.width||p.y>=t.height)return 0;return terrainGrid().cells[Math.floor(p.y*t.rows/t.height)*t.cols+Math.floor(p.x*t.cols/t.width)]||0}
function distanceToRoadSegment(p,a,b){const dx=b.x-a.x,dy=b.y-a.y,len=dx*dx+dy*dy;if(!len)return Infinity;const t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/len));return Math.hypot(p.x-a.x-t*dx,p.y-a.y-t*dy)}
function followsRoad(p,dx,dy){const length=Math.hypot(dx,dy);if(!length)return false;return (state.roads||[]).filter(r=>r.kind!=="water").some(road=>road.points.some((b,i)=>{if(!i)return false;const a=road.points[i-1],rx=b.x-a.x,ry=b.y-a.y,rl=Math.hypot(rx,ry);return rl>0&&Math.abs((dx*rx+dy*ry)/(length*rl))>=.94&&distanceToRoadSegment(p,a,b)<=road.width/2}))}
function terrainRouteAnalysis(r){
 const distance=routeDistance(r),fallback=Number(r.log?.pace),unitFactor=state.unit==='km'?1.609344:1;
 if(!state.scale||!r.points||r.points.length<2)return {days:null,parts:[]};
 const rules2014=r.log?.terrainMode==='dnd2014';
 const enabled=['terrain','dnd2014'].includes(r.log?.terrainMode)&&['Lopend','Paard','Te voet','',...(rules2014?['Wagen']:[])].includes(r.log?.transport||'');
 if(!enabled)return {days:fallback>0?distance/fallback:null,parts:[],bypass:['terrain','dnd2014'].includes(r.log?.terrainMode)};
 const key=JSON.stringify([r.points,r.log,state.scale,state.unit,terrainRevision,state.difficult2014Types]);const cached=terrainDurationCache.get(r);if(cached?.key===key&&cached.terrain===state.terrain&&cached.roads===state.roads)return cached.value;
 const desired={slow:0,normal:1,fast:2}[r.log.terrainPace]??1,t=state.terrain;
 const step=t?Math.min(t.width/t.cols,t.height/t.rows)/2:Math.max(1,Math.max(map.naturalWidth||1000,map.naturalHeight||1000)/2048);
 const parts=[];let total=0,unknown=false;
 for(let i=1;i<r.points.length;i++){const a=r.points[i-1],b=r.points[i],dx=b.x-a.x,dy=b.y-a.y,length=Math.hypot(dx,dy);if(!length)continue;const n=Math.max(1,Math.ceil(length/step)),dist=length/n*state.scale.perPixel;
  for(let j=0;j<n;j++){const p={x:a.x+dx*(j+.5)/n,y:a.y+dy*(j+.5)/n},type=terrainAt(p),road=followsRoad(p,dx,dy);let max=TERRAIN_TYPES[type][3];if(type===1&&!r.log.arcticEquipment)max=1;if(road)max=Math.min(2,max+1);if(type===1&&!r.log.arcticEquipment)max=Math.min(1,max);
   const difficult=rules2014&&!road&&(state.difficult2014Types||[]).includes(type);
   if(!rules2014&&r.log.slowTravelers)max=0;
   const pace=rules2014?[18,24,30][desired]*unitFactor/(difficult?2:1):type?[18,24,30][Math.min(desired,max)]*unitFactor:(r.log.slowTravelers?18*unitFactor:fallback),days=pace>0?dist/pace:null;if(days===null)unknown=true;else total+=days;
   const segStart={x:a.x+dx*j/n,y:a.y+dy*j/n},segEnd={x:a.x+dx*(j+1)/n,y:a.y+dy*(j+1)/n};
   const last=parts.at(-1);if(last&&last.type===type&&last.road===road&&last.pace===pace){last.points.push(segEnd);last.distance+=dist;last.days=last.days===null||days===null?null:last.days+days}else parts.push({type,road,pace,difficult,distance:dist,days,points:[segStart,segEnd]});
  }
 }
 const value={days:unknown?null:total,parts};terrainDurationCache.set(r,{key,value,terrain:state.terrain,roads:state.roads});return value;
}
function pushDMUndo(){dmUndoStack.push(JSON.stringify({terrain:state.terrain||null,roads:state.roads||[]}));if(dmUndoStack.length>20)dmUndoStack.shift()}
function undoDM(){const old=dmUndoStack.pop();if(!old)return;const data=JSON.parse(old);state.terrain=data.terrain;state.roads=data.roads;invalidateTerrain();save();render()}
function stopDM(){dmTool=null;dmDraft=null;render()}
function resetDM(){speedView=false;dmHideObjects=false;dmOpen=false;dmTool=null;dmDraft=null;dmShowTerrain=false;dmShowRoads=false;dmUndoStack=[];invalidateTerrain()}
function startDMTool(tool){if(!runtimeImage||!map.naturalWidth){alert('Laad eerst een kaart.');return}cancelMapAction();dmTool=tool;dmDraft=null;dmShowRoads=true;dmShowTerrain=true;render()}
function dmPoint(e){const p=screenToMap(e);return {x:Math.max(0,Math.min(map.naturalWidth,p.x)),y:Math.max(0,Math.min(map.naturalHeight,p.y))}}
function nearestDMRoadEnd(p,kind="land"){
 let found=null,best=18/(state.view.z||1);
 for(const road of (state.roads||[]).filter(r=>(r.kind||"land")===kind))for(const atStart of [true,false]){const point=atStart?road.points[0]:road.points.at(-1),distance=d(p,point);if(distance<best){best=distance;found={road,atStart,point:{...point}}}}
 return found;
}
function commitDMRoad(draft){
 if(!draft.points.some(p=>d(p,draft.points[0])>.01))return false;
 const end=nearestDMRoadEnd(draft.points.at(-1),draft.kind||"land");if(end)draft.points[draft.points.length-1]=end.point;
 const start=draft.attach;
 if(start){const points=start.atStart?[...draft.points.slice(1).reverse(),...start.road.points]:[...start.road.points,...draft.points.slice(1)];state.roads=state.roads.map(r=>r===start.road?{...r,points}:r)}
 else state.roads=[...(state.roads||[]),{id:uid(),kind:draft.kind||"land",width:draft.width,points:draft.points}];
 invalidateTerrain();return true;
}
function dmPointerDown(e){
 if(!dmOpen||!dmTool)return false;if(e.button!==undefined&&e.button!==0)return true;e.preventDefault?.();const p=dmPoint(e);
 if(dmTool==='roadErase'){let nearest=null,best=Infinity;for(const road of (state.roads||[]).filter(r=>(r.kind||"land")===($("#dmRoadKind").value||"land")))for(let i=1;i<road.points.length;i++){const dist=distanceToRoadSegment(p,road.points[i-1],road.points[i]);if(dist<Math.max(road.width/2,10/state.view.z)&&dist<best){best=dist;nearest=road}}if(nearest){pushDMUndo();state.roads=state.roads.filter(r=>r!==nearest);invalidateTerrain();save();render()}return true}
 const attach=dmTool==='road'?nearestDMRoadEnd(p,$('#dmRoadKind').value||'land'):null;dmDraft={kind:$('#dmRoadKind').value||'land',pointer:e.pointerId,points:[attach?attach.point:p],attach,tool:dmTool,type:Number($('#dmTerrain').value)||1,width:attach?attach.road.width:(Number($('#dmRoadWidth').value)||10)};stage.setPointerCapture(e.pointerId);render();return true;
}
function dmPointerMove(e){if(!dmDraft||e.pointerId!==dmDraft.pointer)return false;const p=dmPoint(e),last=dmDraft.points.at(-1);if(d(last,p)>=2/(state.view.z||1)&&dmDraft.points.length<10000)dmDraft.points.push(p);renderDMDraft();return true}
function dmPointerUp(e){if(!dmDraft||e.pointerId!==dmDraft.pointer)return false;const draft=dmDraft;if(draft.points.length<10000)draft.points.push(dmPoint(e));dmDraft=null;if(draft.points.length>=(draft.tool==='road'?2:3)){pushDMUndo();if(draft.tool==='road'){if(!commitDMRoad(draft))dmUndoStack.pop()}else if(!fillTerrainPolygon(draft.points,draft.tool==='erase'?0:draft.type))dmUndoStack.pop();save()}render();return true}
function svgDM(tag,attrs){const el=document.createElementNS('http://www.w3.org/2000/svg',tag);for(const [k,v] of Object.entries(attrs))el.setAttribute(k,v);return el}
function renderDMDraft(){const old=svg.querySelector?.('[data-dm-draft]');old?.remove();if(!dmDraft)return;svg.appendChild(svgDM('polyline',{'data-dm-draft':'true',points:dmDraft.points.map(p=>p.x+','+p.y).join(' '),fill:'none',stroke:dmDraft.tool==='road'?(dmDraft.kind==='water'?'#69c8ee':'#ffe0a3'):TERRAIN_TYPES[dmDraft.type][1],'stroke-width':dmDraft.tool==='road'?dmDraft.width:2/state.view.z,'pointer-events':'none'}))}
function renderDMLayers(){
 const canvas=$('#terrainCanvas');canvas.style.display=dmShowTerrain?'block':'none';const t=state.terrain;
 if(dmShowTerrain&&t&&terrainPaintKey!==t){const ctx=canvas.getContext?.('2d');if(ctx){canvas.width=t.cols;canvas.height=t.rows;canvas.style.width=t.width+'px';canvas.style.height=t.height+'px';const img=ctx.createImageData(t.cols,t.rows),cells=terrainGrid().cells;
  for(let i=0;i<cells.length;i++){if(!cells[i])continue;const color=TERRAIN_TYPES[cells[i]][1];img.data[i*4]=parseInt(color.slice(1,3),16);img.data[i*4+1]=parseInt(color.slice(3,5),16);img.data[i*4+2]=parseInt(color.slice(5,7),16);img.data[i*4+3]=155}ctx.putImageData(img,0,0);
  ctx.font='10px sans-serif';ctx.textAlign='center';ctx.fillStyle='#172017';for(let y=8;y<t.rows;y+=16)for(let x=8;x<t.cols;x+=16){const type=cells[y*t.cols+x];if(type)ctx.fillText(TERRAIN_TYPES[type][2],x,y)}terrainPaintKey=t;
 }}else if(dmShowTerrain&&!t){canvas.getContext?.('2d')?.clearRect(0,0,canvas.width,canvas.height)}
 if(dmShowRoads)for(const road of state.roads||[])svg.appendChild(svgDM('polyline',{points:road.points.map(p=>p.x+','+p.y).join(' '),fill:'none',stroke:road.kind==='water'?'#69c8ee':'#f9cc84','stroke-dasharray':road.kind==='water'?`${road.width*2} ${road.width*1.5}`:'none','stroke-opacity':'.75','stroke-width':road.width,'stroke-linecap':'round','stroke-linejoin':'round','pointer-events':'none'}));renderDMDraft();
}
function renderDM(){
 document.querySelectorAll("[data-difficult2014]").forEach(el=>el.checked=(state.difficult2014Types||[]).includes(Number(el.dataset.difficult2014)));
 $('#dmToggleLayers').textContent=dmShowTerrain?'Terrein en wegen verbergen':'Terrein en wegen tonen';
 $('#dmToggleLayers').setAttribute('aria-pressed',String(dmShowTerrain));
 $('#dmToggleObjects').textContent=dmHideObjects?'Routes en locaties tonen':'Routes en locaties verbergen';
 $('#dmToggleObjects').setAttribute('aria-pressed',String(dmHideObjects));

 for(const [id,tool] of [['dmPaint','paint'],['dmErase','erase'],['dmRoad','road'],['dmRoadErase','roadErase']]){const button=$('#'+id);button.classList.toggle('is-mode',dmTool===tool);button.setAttribute('aria-pressed',String(dmTool===tool))}
 if(dmCampaign!==activeCampaignId){dmCampaign=activeCampaignId;resetDM()}
 syncSidebarModes();$('#dmMenuBtn').classList.toggle('active',dmOpen&&mapEditTab==='terrain');$('#roadsTabBtn').classList.toggle('active',dmOpen&&mapEditTab==='roads');$('#terrainTools').classList.toggle('hidden',mapEditTab!=='terrain');$('#roadTools').classList.toggle('hidden',mapEditTab!=='roads');$('#dmPanelTitle').textContent=mapEditTab==='roads'?'Wegen':'Terrein';$('#dmPanel').classList.toggle('hidden',!dmOpen);$('#dmShowTerrain').checked=dmShowTerrain;$('#dmShowRoads').checked=dmShowRoads;$('#dmUndo').disabled=!dmUndoStack.length;
 $('#dmStatus').textContent=dmTool?({paint:'Teken een omtrek; loslaten vult het gebied.',erase:'Teken een omtrek om terrein te wissen.',road:'Sleep langs de weg. Loslaten slaat de weg op.',roadErase:'Klik een getekende weg om deze te verwijderen.'}[dmTool]):'Tekenen uit. Kaart verschuiven en zoomen is mogelijk.';
 const r=activeRoute();$('#terrainMode').value=r?.log?.terrainMode||'manual';$('#terrainPace').value=r?.log?.terrainPace||'normal';$('#arcticEquipment').checked=!!r?.log?.arcticEquipment;$('#slowTravelers').checked=!!r?.log?.slowTravelers;$('#terrainRouteOptions').classList.toggle('hidden',!['terrain','dnd2014'].includes(r?.log?.terrainMode));
 if(['terrain','dnd2014'].includes(r?.log?.terrainMode)){const result=terrainRouteAnalysis(r);$('#terrainBreakdown').innerHTML=result.bypass?'Dit vervoermiddel gebruikt de ingestelde dagsnelheid.':result.parts.map(p=>`<div>${TERRAIN_TYPES[p.type][2]} ${TERRAIN_TYPES[p.type][0]}${p.road?' · weg':''}: ${p.distance.toFixed(1)} ${esc(state.unit)} · ${p.days===null?'onbekend':p.days.toFixed(2)+' dagen'}</div>`).join('')}
}
function bindDMUI(){
 $('#difficult2014Types').innerHTML=TERRAIN_TYPES.slice(1).map((t,i)=>`<label class="inlineCheck"><input type="checkbox" data-difficult2014="${i+1}"> ${t[0]}</label>`).join('');
 $('#difficult2014Types').onchange=e=>{const value=Number(e.target.dataset?.difficult2014);if(!value)return;const types=new Set(state.difficult2014Types||[]);e.target.checked?types.add(value):types.delete(value);state.difficult2014Types=[...types];invalidateTerrain();save();render()};

 $("#dmRoadKind").onchange=()=>{dmDraft=null;render()};
 $('#dmToggleLayers').onclick=()=>{dmShowTerrain=!dmShowTerrain;dmShowRoads=dmShowTerrain;if(!dmShowTerrain){dmTool=null;dmDraft=null}render()};
 $('#dmToggleObjects').onclick=()=>{dmHideObjects=!dmHideObjects;render()};

 $('#dmTerrain').innerHTML=TERRAIN_TYPES.map((t,i)=>({t,i})).slice(1).sort((a,b)=>a.t[0].localeCompare(b.t[0])).map(({t,i})=>`<option value="${i}">${t[2]} ${t[0]}</option>`).join('');
 $('#dmMenuBtn').onclick=()=>openMapEditor('terrain');
 $('#roadsTabBtn').onclick=()=>openMapEditor('roads');
 $('#editMapModeBtn').onclick=()=>openMapEditor(mapEditTab);
 $('#planModeBtn').onclick=()=>{cancelMapAction();showDetailPane('placesPane');render()};
 $('#dmClose').onclick=()=>{dmOpen=false;dmTool=null;dmDraft=null;dmShowTerrain=false;dmShowRoads=false;showDetailPane('placesPane');render()};
 for(const [id,tool] of [['dmPaint','paint'],['dmErase','erase'],['dmRoad','road'],['dmRoadErase','roadErase']])$('#'+id).onclick=()=>startDMTool(tool);
 $('#dmStop').onclick=stopDM;$('#dmUndo').onclick=undoDM;
 $('#dmShowTerrain').onchange=e=>{dmShowTerrain=e.target.checked;if(!dmShowTerrain&&['paint','erase'].includes(dmTool)){dmTool=null;dmDraft=null}render()};
 $('#dmShowRoads').onchange=e=>{dmShowRoads=e.target.checked;if(!dmShowRoads&&['road','roadErase'].includes(dmTool)){dmTool=null;dmDraft=null}render()};
 for(const id of ['terrainMode','terrainPace','arcticEquipment','slowTravelers'])$('#'+id).onchange=()=>{const r=activeRoute();if(!r)return;r.log.terrainMode=$('#terrainMode').value;r.log.terrainPace=$('#terrainPace').value;r.log.arcticEquipment=$('#arcticEquipment').checked;r.log.slowTravelers=$('#slowTravelers').checked;save();render()};
}

function speedParts(r){
 const analysis=terrainRouteAnalysis(r);
 if(analysis.parts.length)return analysis.parts;
 if(!state.scale||r.points.length<2)return [];
 const pace=Number(r.log?.pace),distance=routeDistance(r);
 return [{type:0,road:false,pace,distance,days:pace>0?distance/pace:null,points:r.points,manual:true}];
}
function speedColor(pace){const miles=pace/(state.unit==='km'?1.609344:1);return !(miles>0)?'#aeb7b0':miles<24?'#e77d70':miles<30?'#e2ba64':'#87ce91'}
function speedPartLabel(p){return p.manual?'Ingestelde dagsnelheid':`${TERRAIN_TYPES[p.type][0]}${p.road?' · landweg':''}${p.difficult?' · moeilijk terrein':''}${!p.type?' · ingestelde dagsnelheid':''}`}
function renderSpeedUI(){
 const r=activeRoute(),el=$('#speedSummary');$('#speedViewBtn').setAttribute('aria-pressed',String(speedView));$('#speedViewBtn').textContent=speedView?'Reissnelheid verbergen':'Reissnelheid tonen';el.classList.toggle('hidden',!speedView);
 if(!speedView)return;
 if(!state.scale){el.textContent='Stel eerst de kaartschaal in.';return}
 const factor=state.unit==='km'?1.609344:1,unit=state.unit||'mi',fmt=n=>Number(n.toFixed(1));
 const routes=state.routes.filter(route=>route.visible!==false),parts=[],groups=new Map();for(const p of parts){const key=speedPartLabel(p)+'|'+p.pace;const old=groups.get(key);if(old){old.distance+=p.distance;old.days=old.days===null||p.days===null?null:old.days+p.days}else groups.set(key,{...p})}
 el.innerHTML=`<h3>Berekende reissnelheid</h3><p class="small">Alle zichtbare routes (${routes.length})</p><div class="speedLegend"><span style="color:#e77d70">● &lt; ${fmt(24*factor)}</span> <span style="color:#e2ba64">● ${fmt(24*factor)}–&lt;${fmt(30*factor)}</span> <span style="color:#87ce91">● ≥ ${fmt(30*factor)}</span> ${esc(unit)}/dag</div><p class="small">Schatting, zonder pauzes uit het logboek. Wijs een gekleurd routestuk aan voor details.</p>`+(r?[...groups.values()]:[]).map(p=>`<div class="speedRow"><strong>${esc(speedPartLabel(p))}</strong><br>${p.pace>0?fmt(p.pace)+' '+esc(unit)+'/dag':'Snelheid onbekend'} · ${fmt(p.distance)} ${esc(unit)} · ${p.days===null?'onbekend':p.days.toFixed(2)+' dagen'}</div>`).join('');
}
function renderSpeedRoute(r){
 if(!speedView)return;
 for(const p of speedParts(r)){const line=svgDM('polyline',{points:p.points.map(p=>p.x+','+p.y).join(' '),fill:'none',stroke:speedColor(p.pace),'stroke-width':6/state.view.z,'stroke-linecap':'round','stroke-linejoin':'round'});line.dataset.routeId=r.id;line.style.cursor='pointer';const title=svgDM('title',{});title.textContent=speedPartLabel(p)+' · '+(p.pace>0?p.pace.toFixed(1)+' '+(state.unit||'mi')+'/dag':'Snelheid onbekend')+' · '+p.distance.toFixed(1)+' '+(state.unit||'mi')+' · '+(p.days===null?'Reistijd onbekend':p.days.toFixed(2)+' dagen');line.appendChild(title);svg.appendChild(line)}
}

function syncSidebarModes(){
 $('#planTabs').classList.toggle('hidden',dmOpen);$('#mapEditTabs').classList.toggle('hidden',!dmOpen);
 $('#planModeBtn').setAttribute('aria-pressed',String(!dmOpen));$('#editMapModeBtn').setAttribute('aria-pressed',String(dmOpen));
}
function openMapEditor(tab){
 if(!activeCampaignId)return;
 cancelMapAction();dmTool=null;dmDraft=null;mapEditTab=tab;dmOpen=true;dmShowTerrain=true;dmShowRoads=true;partySelected=false;
 $('#projectMenu').classList.add('hidden');showDetailPane(null);render();
}
