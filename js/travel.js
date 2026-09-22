// Sessies, reissnapshots, filters, berekeningen en reislogboek.
// Klassiek script: gedeelde globale scope; laadvolgorde staat in index.html.


function loggedRoutes(){return state.sessions||[]}

function orderedSessions(){
 let rows=[...(state.sessions||[])];
 rows.sort((a,b)=>{
   let an=parseFloat(a.number),bn=parseFloat(b.number);
   if(!isNaN(an)&&!isNaN(bn)&&an!==bn)return an-bn;
   if(!isNaN(an)&&isNaN(bn))return -1;
   if(isNaN(an)&&!isNaN(bn))return 1;
   return String(a.realDate||"").localeCompare(String(b.realDate||""));
 });
 return rows
}

function campaignTimeFromSessions(rows=orderedSessions()){
 let sessionDays=rows.reduce((sum,s)=>sum+(s.timeMode==="harptos"?Math.max(0,harptosDuration(s.gameStart,s.gameEnd)??0):(s.gameDays!==""&&s.gameDays!==undefined&&s.gameDays!==null?(Number(s.gameDays)||0):0)),0);
 let travelDays=0,routeIds=new Set(),includedRoutes=new Set();
 rows.filter(s=>s.timeMode==="harptos").forEach(s=>(s.routeIds||[]).forEach(id=>includedRoutes.add(id)));
 rows.forEach(s=>(s.routeIds||[]).forEach(id=>routeIds.add(id)));
 routeIds.forEach(id=>{
   if(includedRoutes.has(id))return;
   let r=state.routes.find(x=>x.id===id);if(!r)return;
   let dist=routeDistance(r),pace=Number(r.log?.pace||24);
   if(Number.isFinite(dist)&&Number.isFinite(pace)&&pace>0)travelDays+=dist/pace
 });
 let totalDays=sessionDays+travelDays;
 let hasDays=sessionDays>0||travelDays>0||rows.some(s=>s.gameDays!==""&&s.gameDays!==undefined&&s.gameDays!==null);
 return {sessionDays,travelDays,totalDays,hasDays,uniqueRouteCount:routeIds.size}
}

function visibleLogSessions(){
 let rows=orderedSessions(),q=($("#sessionSearch")?.value||"").trim().toLowerCase(),filter=$("#sessionFilter")?.value||"all",sort=$("#sessionSort")?.value||"numberAsc";
 if(filter==="travel")rows=rows.filter(s=>(s.routeIds||[]).length);
 else if(filter==="noTravel")rows=rows.filter(s=>!(s.routeIds||[]).length);
 else if(filter==="location")rows=rows.filter(s=>(s.locationIds||[]).length);
 if(q)rows=rows.filter(s=>{
   let places=(s.locationIds||[]).map(id=>state.markers.find(m=>m.id===id)?.name||"");
   let routes=(s.routeIds||[]).map(id=>routeById(id)?.name||"");
   return [s.number,s.title,s.realDate,s.gameStart,s.gameEnd,s.notes,...places,...routes].some(v=>String(v||"").toLowerCase().includes(q))
 });
 if(sort==="numberDesc")rows.reverse();
 else if(sort==="dateDesc")rows.sort((a,b)=>String(b.realDate||"").localeCompare(String(a.realDate||"")));
 else if(sort==="dateAsc")rows.sort((a,b)=>String(a.realDate||"").localeCompare(String(b.realDate||"")));
 return rows
}

function updateSessionDays(){
 const auto=$('#sessionAutoDays').checked,el=$('#sessionGameDays'),end=$('#sessionGameEnd'),help=$('#sessionDaysHelp');
 el.readOnly=auto;end.readOnly=!auto;document.querySelectorAll('[data-harptos-target="sessionGameEnd"]').forEach(b=>b.disabled=!auto);$('#sessionEndHalf').disabled=!auto;$('#sessionTimeMode').value=auto?'harptos':'manual';
 const startText=$('#sessionGameStart').value,endText=end.value,start=gameOrdinal(startText,sessionCalendar),finish=gameOrdinal(endText,sessionCalendar),half=Number($('#sessionStartHalf').value)||0;
 let error='';
 if(auto){
  const days=start===null||finish===null?null:finish-start+(Number($('#sessionEndHalf').value)||0)-half;
  if(days===null||days<0){el.value='';error='Vul geldige datums in; het einde moet op of na het begin liggen.'}else el.value=days;
 }else{
  const raw=el.value,days=raw===''?null:Number(raw);
  if(days!==null&&(!Number.isFinite(days)||days<0))error='Vul een positief aantal dagen of 0 in.';
  else if(startText&&start===null)error='Vul een geldige begindatum in.';
  else if(start!==null&&days!==null){const result=start+half+days;end.value=gameDateFromOrdinal(result,sessionCalendar);setDayFraction('sessionEndHalf',Number((result-Math.floor(result)).toFixed(6)))}
  else {end.value='';$('#sessionEndHalf').value='0'}
 }
 help.textContent=error||(auto?'Duur berekend uit de datums en dagdelen.':'Einddatum wordt berekend uit begindatum en dagen. Halve dagen zijn mogelijk.');
 $('#travelEditorError').textContent=error;updateSessionTimeSummary();return !error;
}
function fillSessionRouteDuration(){
 const routes=[...(sessionPickerDraft?.routeIds||[])].map(routeById).filter(Boolean);
 if(!routes.length)return;
 const days=routes.map(routeDuration);if(days.some(d=>d===null))return;
 $('#sessionAutoDays').checked=false;
 $('#sessionGameDays').value=Number(days.reduce((a,b)=>a+b,0).toFixed(2));
 updateSessionDays();
}

function renderSessionPickers(s){
 updateSessionTimeSummary();
 let rq=($("#sessionRouteSearch")?.value||"").trim().toLowerCase(),lq=($("#sessionLocationSearch")?.value||"").trim().toLowerCase();
 let chosen=sessionPickerDraft?.routeIds||new Set(s?.routeIds||[]),chosenLocations=sessionPickerDraft?.locationIds||new Set(s?.locationIds||[]);
 let routes=[...state.routes].sort((a,b)=>String(a.name||"").localeCompare(String(b.name||""),undefined,{numeric:true}))
   .filter(r=>!chosen.has(r.id)&&(!rq||[r.name,r.log?.from,r.log?.to].some(v=>(v||"").toLowerCase().includes(rq))));
 let markers=[...state.markers].sort((a,b)=>String(a.name||"").localeCompare(String(b.name||""),undefined,{numeric:true}))
   .filter(m=>!chosenLocations.has(m.id)&&(!lq||[m.name,m.type,m.region].some(v=>(v||"").toLowerCase().includes(lq))));
 let rs=$("#sessionRouteSelect"),ls=$("#sessionLocationSelect");
 rs.innerHTML=routes.length?routes.slice(0,sessionResultLimits.route).map(r=>{
   let dist=state.scale?routeDistance(r):0,pace=Number(r.log?.pace||24),days=state.scale&&pace?dist/pace:0,u=state.unit||"mi";
   let extra=state.scale?` · ${dist.toFixed(1)} ${u==="mi"?"mi":"km"} · ${days.toFixed(1)} dagen`:"";
   return `<button type="button" data-add-route="${esc(r.id)}">+ ${esc(r.name)}${extra}</button>`
 }).join(""):`<div class="small" role="status">${state.routes.length?"Geen andere routes gevonden.":"Nog geen routes in deze campagne. Een registratie zonder reis is ook mogelijk."}</div>`;
 ls.innerHTML=markers.length?markers.slice(0,sessionResultLimits.location).map(m=>`<button type="button" data-add-location="${esc(m.id)}">+ ${esc(m.name)}${m.type?` · ${esc(m.type)}`:""}${m.region?` · ${esc(m.region)}`:""}</button>`).join(""):`<div class="small" role="status">${state.markers.length?"Geen andere locaties gevonden.":"Nog geen locaties in deze campagne. Plaats eerst een locatie op de kaart."}</div>`;
 for(let [kind,rows,el,q] of [["route",routes,rs,rq],["location",markers,ls,lq]]){
  if(!q&&rows.length>6){el.innerHTML=`<div class="small">${rows.length} beschikbaar. Typ een naam om te zoeken.</div><button type="button" data-browse="${kind}">Bladeren door ${kind==="route"?"routes":"locaties"}</button>`;if(sessionResultLimits[kind]===6)continue;
   // Re-render the requested first page once browsing has been opened.
   sessionResultLimits[kind]=Math.max(12,sessionResultLimits[kind]);
   el.innerHTML=rows.slice(0,sessionResultLimits[kind]).map(x=>`<button type="button" data-add-${kind}="${esc(x.id)}">+ ${esc(x.name)}${kind==="location"&&x.region?` · ${esc(x.region)}`:""}</button>`).join("");
  }
  if(rows.length>sessionResultLimits[kind])el.innerHTML+=`<button type="button" data-more="${kind}">Meer tonen (${Math.min(sessionResultLimits[kind],rows.length)} van ${rows.length})</button>`;
 }
 $("#sessionRoutes").innerHTML=chosen.size?[...chosen].map(id=>routeById(id)).filter(Boolean).map(r=>`<span class="selectedChip">${esc(r.name)}<button type="button" data-remove-route="${r.id}" title="Verwijderen">×</button></span>`).join(""):`<span class="small">Geen reizen gekoppeld.</span>`;
 $("#sessionLocations").innerHTML=chosenLocations.size?[...chosenLocations].map(id=>state.markers.find(m=>m.id===id)).filter(Boolean).map(m=>`<span class="selectedChip">${esc(m.name)}<button type="button" data-remove-location="${m.id}" title="Verwijderen">×</button></span>`).join(""):`<span class="small">Geen locaties gekoppeld.</span>`;
}

function openSessionEditor(id){
 let s=id?state.sessions.find(x=>x.id===id):null;
 $("#travelEditorError").textContent="";
 sessionCalendar=s?entryCalendar(s):campaignCalendar();configureSessionCalendar();
 setDayFraction('sessionStartHalf',s?.startHalf||0);setDayFraction('sessionEndHalf',s?.endHalf||0);
 $("#sessionAutoDays").checked=s?s.timeMode==="harptos":false;
 $("#sessionId").value=s?.id||"";$("#sessionNumber").value=s?.number||"";$("#sessionRealDate").value=s?s.realDate||"":localToday();$("#sessionTitle").value=s?.title||"";$("#sessionGameStart").value=s?.gameStart||s?.gameDate||"";$("#sessionGameEnd").value=s?.gameEnd||"";$("#sessionGameDays").value=s?.gameDays??"";$("#sessionNotes").value=s?.notes||"";
 $("#sessionEditorTitle").textContent=s?"Registratie bewerken":"Registratie toevoegen";$("#deleteSessionBtn").style.visibility=s?"visible":"hidden";
 updateSessionDays();
 sessionResultLimits={route:6,location:6};
 $("#sessionRouteSearch").value="";$("#sessionLocationSearch").value="";
 sessionPickerDraft={routeIds:new Set(s?.routeIds||[]),locationIds:new Set(s?.locationIds||[])};
 renderSessionPickers({routeIds:[...sessionPickerDraft.routeIds],locationIds:[...sessionPickerDraft.locationIds]});
 $("#sessionModal").classList.remove("hidden");
}

function validTravelSnapshot(x){return !!x&&typeof x.name==='string'&&['mi','km'].includes(x.unit)&&(x.distance===null||Number.isFinite(x.distance)&&x.distance>=0)&&(x.duration===null||Number.isFinite(x.duration)&&x.duration>=0)&&Array.isArray(x.places)&&x.places.every(p=>p&&typeof p.id==='string'&&typeof p.name==='string')}

function makeTravelSnapshot(entry,old){
 let same=validTravelSnapshot(old?.travelSnapshot)&&JSON.stringify(old.routeIds||[])===JSON.stringify(entry.routeIds||[])&&JSON.stringify(old.locationIds||[])===JSON.stringify(entry.locationIds||[]);
 if(same&&(entry.routeIds||[]).length)return old.travelSnapshot;
 let routes=(entry.routeIds||[]).map(routeById).filter(Boolean),placeIds=new Set(entry.locationIds||[]);
 routes.forEach(r=>{if(r.log?.fromLocationId)placeIds.add(r.log.fromLocationId);if(r.log?.toLocationId)placeIds.add(r.log.toLocationId)});
 let valid=!!state.scale&&routes.length===(entry.routeIds||[]).length&&routes.length>0;
 let distance=valid?routes.reduce((sum,r)=>sum+routeDistance(r),0):null;
 let duration=valid&&routes.every(r=>Number(r.log?.pace||24)>0)?routes.reduce((sum,r)=>sum+routeDistance(r)/Number(r.log?.pace||24),0):null;
 return {name:routes.map(r=>r.name||'Naamloze route').join(' / ')||entry.title||'Registratie zonder reis',distance:routes.length?distance:0,duration:routes.length?duration:0,unit:state.unit||'mi',places:[...placeIds].map(id=>({id,name:markerById(id)?.name||'Verwijderde plaats'}))};
}

function travelRows(){
 return state.sessions.map(entry=>{let snap=validTravelSnapshot(entry.travelSnapshot)?entry.travelSnapshot:makeTravelSnapshot(entry,null),start=gameOrdinal(entry.gameStart||entry.gameDate,entryCalendar(entry)),end=gameOrdinal(entry.gameEnd,entryCalendar(entry));
 return {entry,snap,start,end};});
}

function filteredTravelRows(){
 let q=$('#sessionSearch').value.trim().toLowerCase(),filter=$('#sessionFilter').value;
 let fromText=$('#travelFrom').value.trim(),untilText=$('#travelUntil').value.trim(),from=gameOrdinal(fromText,campaignCalendar()),until=gameOrdinal(untilText,campaignCalendar());
 let invalid=(fromText&&from===null)||(untilText&&until===null)||(from!==null&&until!==null&&from>until);
 $('#travelFilterError').textContent=invalid?'Gebruik geldige datums voor de campagnekalender; de einddatum moet op of na de begindatum liggen.':'';
 if(invalid)return [];
 let rows=travelRows().filter(r=>(!q||[r.entry.number?'Sessie '+r.entry.number:'',r.entry.realDate||'',r.snap.name,r.entry.title,r.entry.notes,...r.snap.places.map(p=>p.name)].join(' ').toLowerCase().includes(q))&&(filter!=='travel'||r.entry.routeIds?.length)&&(filter!=='noTravel'||!r.entry.routeIds?.length)&&(filter!=='location'||r.snap.places.length)&&(from===null||(entryCalendar(r.entry)===campaignCalendar()&&r.start!==null&&(r.end??r.start)>=from))&&(until===null||(entryCalendar(r.entry)===campaignCalendar()&&r.start!==null&&r.start<=until)));
 return rows.sort((a,b)=>{let sort=$('#sessionSort').value;
 if(sort==='sessionAsc'){let x=String(a.entry.number||''),y=String(b.entry.number||'');if(!x||!y)return x?-1:y?1:0;return x.localeCompare(y,undefined,{numeric:true})}
 if(sort==='playedDesc'){let x=a.entry.realDate||'',y=b.entry.realDate||'';if(!x||!y)return x?-1:y?1:0;return y.localeCompare(x)}
 if(entryCalendar(a.entry)!==entryCalendar(b.entry))return entryCalendar(a.entry).localeCompare(entryCalendar(b.entry));
 if(a.start===null)return b.start===null?0:1;if(b.start===null)return -1;return (a.start-b.start)*($('#sessionSort').value==='dateDesc'?-1:1)});
}

function travelDistance(row){let d=row.snap.distance;if(d===null||!Number.isFinite(d))return null;return row.snap.unit===(state.unit||'mi')?d:row.snap.unit==='mi'?d*1.609344:d/1.609344}

function travelElapsed(row){
 const entry=row.entry, dated=entryDuration(entry);
 if(entry.timeMode==='harptos'&&dated!==null&&dated>=0)return {days:dated,estimated:false};
 const raw=entry.gameDays;
 if(raw!==undefined&&raw!==null&&String(raw).trim()!==''&&Number.isFinite(Number(raw))&&Number(raw)>=0)return {days:Number(raw),estimated:false};
 if(dated!==null&&dated>=0)return {days:dated,estimated:false};
 return {days:Number.isFinite(row.snap.duration)&&row.snap.duration>=0?row.snap.duration:null,estimated:true};
}

function travelTotals(rows){return {distance:rows.reduce((n,r)=>n+(travelDistance(r)??0),0),duration:rows.reduce((n,r)=>n+(travelElapsed(r).days??0),0),unknown:rows.some(r=>travelDistance(r)===null||travelElapsed(r).days===null),places:new Set(rows.flatMap(r=>r.snap.places.map(p=>p.id))).size}}

function travelPeriod(r){return [r.entry.gameStart||r.entry.gameDate,r.entry.gameEnd].filter(Boolean).map((d,i)=>d+((i?r.entry.endHalf:r.entry.startHalf)?((i?r.entry.endHalf:r.entry.startHalf)===.5?' (middag)':' (+'+(i?r.entry.endHalf:r.entry.startHalf)+' dag)'):'')).join(' → ')||'Datum onbekend'}

function travelCells(r){return [r.entry.number?'Sessie '+r.entry.number:'—',r.entry.realDate||'—',travelPeriod(r),[r.entry.title,r.snap.name].filter((v,i,a)=>v&&a.indexOf(v)===i).join(' — '),travelDistance(r)===null?'Onbekend':travelDistance(r).toFixed(1)+' '+(state.unit||'mi'),travelElapsed(r).days!==null?travelElapsed(r).days.toFixed(1)+' dagen'+(travelElapsed(r).estimated?' (geschat)':''):'Onbekend',r.snap.places.map(p=>p.name).join(', ')||'—']}

function travelTable(rows,interactive=false){let totals=travelTotals(rows);return `<div class="travelTableWrap"><table class="travelTable"><thead><tr>${['Sessie','Speeldatum','In-game periode','Reis','Afstand','In-game dagen','Plaatsen',...(interactive?['Acties']:[])].map(x=>`<th scope="col">${x}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr ${interactive?`data-editsession="${esc(r.entry.id)}"`:''}>${travelCells(r).map(x=>`<td>${esc(x)}</td>`).join('')}${interactive?`<td><button data-editsession="${esc(r.entry.id)}">Bewerk</button> <button data-travel-map="${esc(r.entry.id)}">Toon op kaart</button></td>`:''}</tr>`).join('')||`<tr><td colspan="${interactive?8:7}">Geen reizen gevonden.</td></tr>`}</tbody><tfoot><tr><td colspan="4">Totaal (${rows.length} registraties${totals.unknown?', bekende waarden':''})</td><td>${totals.distance.toFixed(1)} ${esc(state.unit||'mi')}</td><td>${totals.duration.toFixed(1)} dagen</td><td>${totals.places} plaatsen</td>${interactive?'<td></td>':''}</tr></tfoot></table></div>`}

function renderLogbook(){for(const id of ['travelFrom','travelUntil'])$('#'+id).type=campaignCalendar()==='gregorian'?'date':'text';let rows=filteredTravelRows(),t=travelTotals(rows);$('#logbookTitle').textContent=(state.projectName||'Campagne')+' — Reislogboek';$('#campaignSessionCount').textContent=rows.length;$('#campaignRouteCount').textContent=t.distance.toFixed(1)+' '+(state.unit||'mi')+(t.unknown?' *':'');$('#campaignLocationCount').textContent=t.places;$('#campaignTimeDays').textContent=t.duration.toFixed(1)+' dagen'+(t.unknown?' *':'');$('#journeyList').innerHTML=travelTable(rows,true)+(t.unknown?'<p class="small">* Alleen bekende afstanden en reistijden zijn opgeteld.</p>':'')}

// Registreer bediening; aangeroepen vanuit init.js.
function bindSessionSearchUI(){
$("#sessionSearch").oninput=()=>renderLogbook();
$("#sessionSort").onchange=()=>renderLogbook();
$("#sessionFilter").onchange=()=>renderLogbook();
$("#sessionRouteSearch").oninput=()=>{sessionResultLimits.route=6;renderSessionPickers({routeIds:[...(sessionPickerDraft?.routeIds||[])],locationIds:[...(sessionPickerDraft?.locationIds||[])]})};
$("#sessionLocationSearch").oninput=()=>{sessionResultLimits.location=6;renderSessionPickers({routeIds:[...(sessionPickerDraft?.routeIds||[])],locationIds:[...(sessionPickerDraft?.locationIds||[])]})};
$("#sessionRouteSelect").onclick=e=>{if(e.target.closest("[data-more],[data-browse]")){sessionResultLimits.route+=6;renderSessionPickers();return}let b=e.target.closest("[data-add-route]");if(b&&sessionPickerDraft){if(!$("#sessionId").value)sessionPickerDraft.routeIds.clear();sessionPickerDraft.routeIds.add(b.dataset.addRoute);fillSessionRouteDuration();$("#sessionRouteSearch").value="";renderSessionPickers();$("#sessionRouteSearch").focus()}};
$("#sessionLocationSelect").onclick=e=>{if(e.target.closest("[data-more],[data-browse]")){sessionResultLimits.location+=6;renderSessionPickers();return}let b=e.target.closest("[data-add-location]");if(b&&sessionPickerDraft){sessionPickerDraft.locationIds.add(b.dataset.addLocation);$("#sessionLocationSearch").value="";renderSessionPickers();$("#sessionLocationSearch").focus()}};
$("#sessionRoutes").onclick=e=>{let b=e.target.closest("[data-remove-route]");if(b&&sessionPickerDraft){sessionPickerDraft.routeIds.delete(b.dataset.removeRoute);fillSessionRouteDuration();renderSessionPickers()}};
$("#sessionLocations").onclick=e=>{let b=e.target.closest("[data-remove-location]");if(b&&sessionPickerDraft){sessionPickerDraft.locationIds.delete(b.dataset.removeLocation);renderSessionPickers()}};
}

// Registreer bediening; aangeroepen vanuit init.js.
function bindSessionEditorUI(){
$("#logbookBtn").onclick=()=>{$("#logModal").classList.remove("hidden");renderLogbook()}
$("#closeLogBtn").onclick=()=>$("#logModal").classList.add("hidden");
$("#logModal").onclick=e=>{if(e.target===$("#logModal"))$("#logModal").classList.add("hidden");let b=e.target.closest("[data-editsession]");if(b)openSessionEditor(b.dataset.editsession)};
$("#newSessionBtn").onclick=()=>openSessionEditor(null);
$("#closeSessionBtn").onclick=()=>{sessionPickerDraft=null;$("#sessionModal").classList.add("hidden")};
$("#sessionModal").onclick=e=>{if(e.target===$("#sessionModal"))$("#sessionModal").classList.add("hidden")};
$("#saveSessionBtn").onclick=()=>{if(!updateSessionDays())return;let id=$("#sessionId").value||uid(),routeIds=sessionPickerDraft?[...sessionPickerDraft.routeIds]:[],locationIds=sessionPickerDraft?[...sessionPickerDraft.locationIds]:[],obj={id,calendar:sessionCalendar,startHalf:Number($("#sessionStartHalf").value)||0,endHalf:Number($("#sessionEndHalf").value)||0,timeMode:$("#sessionAutoDays").checked?"harptos":"manual",number:$("#sessionNumber").value,realDate:$("#sessionRealDate").value,title:$("#sessionTitle").value,gameStart:$("#sessionGameStart").value.trim(),gameEnd:$("#sessionGameEnd").value.trim(),gameDays:$("#sessionGameDays").value===""?"":Math.max(0,Number($("#sessionGameDays").value)||0),notes:$("#sessionNotes").value,routeIds,locationIds};obj.travelSnapshot=makeTravelSnapshot(obj,state.sessions.find(x=>x.id===id));let i=state.sessions.findIndex(x=>x.id===id);if(i>=0)state.sessions[i]=obj;else state.sessions.push(obj);sessionPickerDraft=null;$("#sessionModal").classList.add("hidden");save();renderLogbook();render()};
$("#deleteSessionBtn").onclick=()=>{let id=$("#sessionId").value;if(id&&confirm("Deze reisregistratie verwijderen?")){state.sessions=state.sessions.filter(x=>x.id!==id);$("#sessionModal").classList.add("hidden");save();renderLogbook();render()}};
}

// Preview uses the same snapshot and elapsed-days rules as the saved logbook.
function updateSessionTimeSummary(){
 const el=$('#sessionTimeSummary');if(!el)return;
 const routes=[...(sessionPickerDraft?.routeIds||[])].map(routeById).filter(Boolean),durations=routes.map(routeDuration);
 const estimate=durations.length&&durations.every(d=>d!==null)?durations.reduce((a,b)=>a+b,0).toFixed(1)+' dagen':'—';
 el.textContent='Route-inschatting: '+estimate+' · Verstreken: '+Number($('#sessionGameDays').value||0).toFixed(1)+' dagen. Reistijd wordt bij routekeuze ingevuld; daarna aanpasbaar, ook met halve dagen.';
}
