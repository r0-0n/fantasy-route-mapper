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
   if(routeDuration(r)!==null)travelDays+=routeDuration(r)
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
 el.readOnly=auto;end.readOnly=false;document.querySelectorAll('[data-harptos-target="sessionGameEnd"]').forEach(b=>b.disabled=false);$('#sessionEndHalf').disabled=false;$('#sessionTimeMode').value=auto?'harptos':'manual';
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
   let dist=state.scale?routeDistance(r):0,pace=Number(r.log?.pace||24),days=routeDuration(r)??0,u=state.unit||"mi";
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
 if(!s){const previous=orderedSessions().filter(x=>entryCalendar(x)===sessionCalendar&&gameOrdinal(x.gameEnd,sessionCalendar)!==null).at(-1);if(previous){$("#sessionGameStart").value=previous.gameEnd;setDayFraction("sessionStartHalf",previous.endHalf||0)}}
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
 let duration=valid&&routes.every(r=>routeDuration(r)!==null)?routes.reduce((sum,r)=>sum+routeDuration(r),0):null;
 return {name:routes.map(r=>r.name||'Naamloze route').join(' / ')||entry.title||'Registratie zonder reis',distance:routes.length?distance:0,duration:routes.length?duration:0,unit:state.unit||'mi',places:[...placeIds].map(id=>({id,name:markerById(id)?.name||'Verwijderde plaats'}))};
}

function travelRows(){
 return state.sessions.map(entry=>{let snap=validTravelSnapshot(entry.travelSnapshot)?entry.travelSnapshot:makeTravelSnapshot(entry,null),start=gameOrdinal(entry.gameStart||entry.gameDate,entryCalendar(entry)),end=gameOrdinal(entry.gameEnd,entryCalendar(entry));
 return {entry,snap,start,end};});
}

function filteredTravelRows(){
 let q=$('#sessionSearch').value.trim().toLowerCase(),filter=$('#sessionFilter').value;
 let fromText=$('#travelFrom').value.trim(),untilText=$('#travelUntil').value.trim(),from=gameOrdinal(fromText,state.hourlyTimeline?.calendar||campaignCalendar()),until=gameOrdinal(untilText,state.hourlyTimeline?.calendar||campaignCalendar());
 let invalid=(fromText&&from===null)||(untilText&&until===null)||(from!==null&&until!==null&&from>until);
 $('#travelFilterError').textContent=invalid?'Gebruik geldige datums voor de campagnekalender; de einddatum moet op of na de begindatum liggen.':'';
 if(invalid)return [];
 let rows=travelRows().filter(r=>(!q||[r.entry.number?'Sessie '+r.entry.number:'',r.entry.realDate||'',r.snap.name,r.entry.title,r.entry.notes,...(r.entry.activities||[]).map(a=>a.label),...r.snap.places.map(p=>p.name)].join(' ').toLowerCase().includes(q))&&(filter!=='travel'||r.entry.routeIds?.length)&&(filter!=='noTravel'||!r.entry.routeIds?.length)&&(filter!=='location'||r.snap.places.length)&&(from===null||(entryCalendar(r.entry)===(state.hourlyTimeline?.calendar||campaignCalendar())&&r.start!==null&&(r.end??r.start)>=from))&&(until===null||(entryCalendar(r.entry)===(state.hourlyTimeline?.calendar||campaignCalendar())&&r.start!==null&&r.start<=until)));
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

function travelPeriod(r){if(r.entry.hourlyVersion)return r.entry.gameStart+' '+hourClock(Math.round(r.entry.startHalf*24))+' → '+r.entry.gameEnd+' '+hourClock(Math.round(r.entry.endHalf*24));return [r.entry.gameStart||r.entry.gameDate,r.entry.gameEnd].filter(Boolean).map((d,i)=>d+((i?r.entry.endHalf:r.entry.startHalf)?((i?r.entry.endHalf:r.entry.startHalf)===.5?' (middag)':' (+'+(i?r.entry.endHalf:r.entry.startHalf)+' dag)'):'')).join(' → ')||'Datum onbekend'}

function travelCells(r){return [r.entry.number?'Sessie '+r.entry.number:'—',r.entry.realDate||'—',travelPeriod(r),[r.entry.title,r.snap.name].filter((v,i,a)=>v&&a.indexOf(v)===i).join(' — '),travelDistance(r)===null?'Onbekend':travelDistance(r).toFixed(1)+' '+(state.unit||'mi'),travelElapsed(r).days!==null?travelElapsed(r).days.toFixed(1)+' dagen'+(travelElapsed(r).estimated?' (geschat)':''):'Onbekend',r.snap.places.map(p=>p.name).join(', ')||'—']}

function travelTable(rows,interactive=false){let totals=travelTotals(rows);return `<div class="travelTableWrap"><table class="travelTable"><thead><tr>${['Sessie','Speeldatum','In-game periode','Reis','Afstand','In-game dagen','Plaatsen',...(interactive?['Acties']:[])].map(x=>`<th scope="col">${x}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr ${interactive?`data-editsession="${esc(r.entry.id)}"`:''}>${travelCells(r).map(x=>`<td>${esc(x)}</td>`).join('')}${interactive?`<td><button data-editsession="${esc(r.entry.id)}">Bewerk</button> <button data-travel-map="${esc(r.entry.id)}">Toon op kaart</button></td>`:''}</tr>`).join('')||`<tr><td colspan="${interactive?8:7}">Geen reizen gevonden.</td></tr>`}</tbody><tfoot><tr><td colspan="4">Totaal (${rows.length} registraties${totals.unknown?', bekende waarden':''})</td><td>${totals.distance.toFixed(1)} ${esc(state.unit||'mi')}</td><td>${totals.duration.toFixed(1)} dagen</td><td>${totals.places} plaatsen</td>${interactive?'<td></td>':''}</tr></tfoot></table></div>`}

function renderLogbook(){for(const id of ['travelFrom','travelUntil'])$('#'+id).type=(state.hourlyTimeline?.calendar||campaignCalendar())==='gregorian'?'date':'text';let rows=filteredTravelRows(),t=travelTotals(rows);$('#logbookTitle').textContent=(state.projectName||'Campagne')+' — Reislogboek';$('#campaignSessionCount').textContent=rows.length;$('#campaignRouteCount').textContent=t.distance.toFixed(1)+' '+(state.unit||'mi')+(t.unknown?' *':'');$('#campaignLocationCount').textContent=t.places;$('#campaignTimeDays').textContent=t.duration.toFixed(1)+' dagen'+(t.unknown?' *':'');$('#journeyList').innerHTML=travelTable(rows,true)+(t.unknown?'<p class="small">* Alleen bekende afstanden en reistijden zijn opgeteld.</p>':'');renderHourlyOverview()}

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
$("#logModal").onclick=e=>{if(e.target===$("#logModal"))$("#logModal").classList.add("hidden");let b=e.target.closest("[data-editsession]");if(b)openHourlyEditor(b.dataset.editsession)};
$("#newSessionBtn").onclick=()=>openSessionEditor(null);
$("#closeSessionBtn").onclick=()=>{sessionPickerDraft=null;$("#sessionModal").classList.add("hidden")};
$("#sessionModal").onclick=e=>{if(e.target===$("#sessionModal"))$("#sessionModal").classList.add("hidden")};
$("#saveSessionBtn").onclick=()=>{if(!updateSessionDays())return;let id=$("#sessionId").value||uid(),routeIds=sessionPickerDraft?[...sessionPickerDraft.routeIds]:[],locationIds=sessionPickerDraft?[...sessionPickerDraft.locationIds]:[],obj={id,calendar:sessionCalendar,startHalf:Number($("#sessionStartHalf").value)||0,endHalf:Number($("#sessionEndHalf").value)||0,timeMode:$("#sessionAutoDays").checked?"harptos":"manual",number:$("#sessionNumber").value,realDate:$("#sessionRealDate").value,title:$("#sessionTitle").value,gameStart:$("#sessionGameStart").value.trim(),gameEnd:$("#sessionGameEnd").value.trim(),gameDays:$("#sessionGameDays").value===""?"":Math.max(0,Number($("#sessionGameDays").value)||0),notes:$("#sessionNotes").value,routeIds,locationIds};obj.travelSnapshot=makeTravelSnapshot(obj,state.sessions.find(x=>x.id===id));let i=state.sessions.findIndex(x=>x.id===id);if(i>=0){shiftFollowingSessions(state.sessions[i],obj);state.sessions[i]=obj;}else state.sessions.push(obj);sessionPickerDraft=null;$("#sessionModal").classList.add("hidden");save();renderLogbook();render()};
$("#deleteSessionBtn").onclick=()=>{let id=$("#sessionId").value;if(id&&confirm("Deze reisregistratie verwijderen?")){state.sessions=state.sessions.filter(x=>x.id!==id);$("#sessionModal").classList.add("hidden");save();renderLogbook();render()}};
}

// Preview uses the same snapshot and elapsed-days rules as the saved logbook.
function updateSessionTimeSummary(){
 const el=$('#sessionTimeSummary');if(!el)return;
 const routes=[...(sessionPickerDraft?.routeIds||[])].map(routeById).filter(Boolean),durations=routes.map(routeDuration);
 const estimate=durations.length&&durations.every(d=>d!==null)?durations.reduce((a,b)=>a+b,0).toFixed(1)+' dagen':'—';
 el.textContent='Route-inschatting: '+estimate+' · Verstreken: '+Number($('#sessionGameDays').value||0).toFixed(1)+' dagen. Reistijd wordt bij routekeuze ingevuld; daarna aanpasbaar, ook met halve dagen.';
}

function shiftFollowingSessions(old,updated){
 const cal=entryCalendar(old);if(entryCalendar(updated)!==cal)return;
 const a=gameOrdinal(old.gameEnd,cal),b=gameOrdinal(updated.gameEnd,cal);if(a===null||b===null)return;
 const delta=b+(Number(updated.endHalf)||0)-a-(Number(old.endHalf)||0);if(!delta)return;
 const ordered=orderedSessions(),index=ordered.findIndex(s=>s.id===old.id);
 for(const entry of ordered.slice(index+1)){if(entryCalendar(entry)!==cal)continue;
  for(const [date,half] of [['gameStart','startHalf'],['gameEnd','endHalf']]){const value=gameOrdinal(entry[date],cal);if(value===null)continue;const next=value+(Number(entry[half])||0)+delta;entry[date]=gameDateFromOrdinal(next,cal);entry[half]=Number((next-Math.floor(next)).toFixed(6))}
 }
}

// Hourly logbook. Saved blocks contain travel snapshots; rendering never mutates data.
let hourDraft=null;
function hourInt(n,min=0,max=1000000){return Number.isInteger(n)&&n>=min&&n<=max}
function hourText(n){return `${Math.floor(n/24)} d ${n%24} u`}
function hourClock(n){return String(((n%24)+24)%24).padStart(2,'0')+':00'}
function hourDate(n,cal){return gameDateFromOrdinal(Math.floor(n/24),cal)+' · '+hourClock(n)}
function hourlySettings(){
 if(state.hourlyTimeline)return {...state.hourlyTimeline};
 const first=orderedSessions().find(s=>gameOrdinal(s.gameStart,entryCalendar(s))!==null),cal=first?entryCalendar(first):campaignCalendar();
 return {version:1,calendar:cal,date:first?.gameStart||(cal==='gregorian'?localToday():'1 Hammer 1491 DR'),hour:first?Math.round((Number(first.startHalf)||0)*24)%24:8,dailyStart:8,dailyHours:8};
}
function legacyHourBlocks(s){
 if(Array.isArray(s.activities))return cloneJSON(s.activities);
 const snap=validTravelSnapshot(s.travelSnapshot)?s.travelSnapshot:makeTravelSnapshot(s,null);
 const elapsed=travelElapsed({entry:s,snap}).days;
 // Old entries do not distinguish active travel from rest. Keep their total intact.
 return [{id:s.id+'-legacy',kind:'legacy',label:s.title||snap.name||'Bestaande registratie',hours:Math.round((elapsed||0)*24),distanceMi:snap.distance===null?null:snap.distance/(snap.unit==='km'?1.609344:1),routeIds:s.routeIds||[],places:snap.places||[],unknown:elapsed===null||snap.distance===null}];
}
function hourlySessions(){return orderedSessions().map(s=>({...s,activities:legacyHourBlocks(s)}))}
function routeHourSnapshot(route,dailyHours){
 if(!state.scale||!(Number(route.log?.pace)>0)||routeDuration(route)===null)throw Error('Stel eerst de kaartschaal en een geldige routesnelheid in.');
 const factor=state.unit==='km'?1.609344:1,analysis=terrainRouteAnalysis(route);
 const parts=!analysis.parts.length?[{distance:routeDistance(route),days:routeDuration(route)}]:analysis.parts;
 const segments=parts.map(p=>({distanceMi:p.distance/factor,hours:p.days*(route.log?.transport==='Boot'?24:8)}));
 if(!segments.length||segments.some(p=>!Number.isFinite(p.hours)||p.hours<0)||segments.reduce((n,p)=>n+p.distanceMi,0)<=0)throw Error('Deze route heeft nog geen berekenbare afstand.');
 return {name:route.name||'Route',transport:route.log?.transport||'Lopend',segments,places:[route.log?.fromLocationId,route.log?.toLocationId].filter(Boolean).map(id=>({id,name:markerById(id)?.name||'Plaats'}))};
}
function routeHourPortion(snapshot,from,to){
 const total=snapshot.segments.reduce((n,p)=>n+p.distanceMi,0),a=total*from/100,b=total*to/100;
 let offset=0,before=0,through=0;
 for(const p of snapshot.segments){if(p.distanceMi>0){before+=p.hours*Math.max(0,Math.min(a-offset,p.distanceMi))/p.distanceMi;through+=p.hours*Math.max(0,Math.min(b-offset,p.distanceMi))/p.distanceMi}offset+=p.distanceMi}
 return {distanceMi:b-a,hours:Math.round(through)-Math.round(before)};
}
function scheduleHourTravel(start,hours,dailyStart,dailyHours){
 let cursor=start,left=hours,rest=0;
 if(dailyHours===24)return {end:start+hours,rest:0};
 while(left>0){
  const day=Math.floor((cursor-dailyStart)/24),windowStart=day*24+dailyStart,windowEnd=windowStart+dailyHours;
  if(cursor>=windowEnd){const wait=windowStart+24-cursor;rest+=wait;cursor+=wait;continue}
  const used=Math.min(left,windowEnd-cursor);cursor+=used;left-=used;
 }
 return {end:cursor,rest};
}
function calculateHourly(sessions,settings){
 const date=gameOrdinal(settings.date,settings.calendar);
 if(date===null||!hourInt(settings.hour,0,23)||!hourInt(settings.dailyStart,0,23)||!hourInt(settings.dailyHours,1,24))throw Error('Kies een geldige begindatum, startuur en reisrooster.');
 let cursor=date*24+settings.hour;
 const rows=[];
 for(const session of sessions){
  const row={session,start:cursor,end:cursor,travel:0,other:0,unclassified:0,distanceMi:0,unknown:false,blocks:[]};
  for(const a of session.activities){
   const block={...a,start:cursor,rest:0,travel:0,other:0,distanceMi:0};
   if(a.kind==='travel'){
    const p=routeHourPortion(a.snapshot,a.from,a.to),hours=a.hoursOverride===null?p.hours:a.hoursOverride;
    const journey=scheduleHourTravel(cursor,hours,settings.dailyStart,a.dailyHours);
    block.rest=journey.rest;block.travel=hours;block.other=journey.rest+a.extraHours;block.distanceMi=p.distanceMi;cursor=journey.end+a.extraHours;
   }else{cursor+=a.hours;block.other=a.kind==='legacy'?0:a.hours;block.distanceMi=a.kind==='legacy'?(a.distanceMi||0):0;if(a.kind==='legacy'){row.unclassified+=a.hours;row.unknown ||= a.unknown}}
   block.end=cursor;row.travel+=block.travel;row.other+=block.other;row.distanceMi+=block.distanceMi;row.blocks.push(block);
  }
  row.end=cursor;rows.push(row);
 }
 return {rows,start:date*24+settings.hour,end:cursor,travel:rows.reduce((n,r)=>n+r.travel,0),other:rows.reduce((n,r)=>n+r.other,0),unclassified:rows.reduce((n,r)=>n+r.unclassified,0),distanceMi:rows.reduce((n,r)=>n+r.distanceMi,0)};
}
function validateHourlySessions(sessions){
 const occupied=new Map();
 for(const s of sessions)for(const a of s.activities||[])if(a.kind==='legacy')for(const id of a.routeIds||[])occupied.set(JSON.stringify([id,1]),[{from:0,to:100}]);
 for(const s of sessions){
  if(!Array.isArray(s.activities)||s.activities.length>1000)throw Error('Ongeldige activiteitenlijst.');
  for(const a of s.activities){
   if(!a||typeof a.id!=='string'||typeof a.label!=='string')throw Error('Ongeldige activiteit.');
   if(a.kind==='travel'){
    if(typeof a.routeId!=='string'||!hourInt(a.trip,1)||!Number.isFinite(a.from)||!Number.isFinite(a.to)||a.from<0||a.to>100||a.from>=a.to||!hourInt(a.dailyHours,1,24)||!hourInt(a.extraHours)||!(a.hoursOverride===null||hourInt(a.hoursOverride)))throw Error('Controleer het routedeel, reisuren en extra tijd.');
    if(!a.snapshot||typeof a.snapshot.name!=='string'||!Array.isArray(a.snapshot.segments)||!a.snapshot.segments.length||a.snapshot.segments.length>100000||a.snapshot.segments.some(p=>!Number.isFinite(p.distanceMi)||p.distanceMi<0||!Number.isFinite(p.hours)||p.hours<0))throw Error('Ongeldige routeberekening.');
    const key=JSON.stringify([a.routeId,a.trip]),ranges=occupied.get(key)||[];
    if(ranges.some(p=>a.from<p.to-1e-8&&a.to>p.from+1e-8))throw Error('Dit routedeel is al geregistreerd. Kies het resterende deel of een nieuwe tocht.');
    ranges.push(a);occupied.set(key,ranges);
   }else if(!['stay','delay','legacy'].includes(a.kind)||!hourInt(a.hours)||(a.kind==='legacy'&&a.distanceMi!==null&&(!Number.isFinite(a.distanceMi)||a.distanceMi<0)))throw Error('Vul een geheel, positief aantal uren of 0 in.');
  }
 }
}
function validateHourlyData(data){
 const entries=(data.sessions||[]).filter(s=>s.activities!==undefined);validateHourlySessions(entries);
 if(data.hourlyTimeline){const t=data.hourlyTimeline;if(t.version!==1||!['harptos','gregorian'].includes(t.calendar))throw Error('Onbekende tijdlijninstelling.');calculateHourly([],t)}
}
function commitHourly(sessions,settings){
 validateHourlySessions(sessions);const result=calculateHourly(sessions,settings);
 // Build everything before replacing state. Preserve original legacy records for recovery.
 const entries=result.rows.map(r=>{
  const s={...r.session};if(!s.hourlyVersion&&!s.legacyOriginal)s.legacyOriginal=cloneJSON((state.sessions||[]).find(x=>x.id===s.id)||s);
  s.hourlyVersion=1;s.calendar=settings.calendar;s.timeMode='manual';s.gameDays=(r.end-r.start)/24;s.gameStart=gameDateFromOrdinal(Math.floor(r.start/24),settings.calendar);s.gameEnd=gameDateFromOrdinal(Math.floor(r.end/24),settings.calendar);s.startHalf=(r.start%24+24)%24/24;s.endHalf=(r.end%24+24)%24/24;
  s.routeIds=[...new Set(s.activities.flatMap(a=>a.kind==='travel'?[a.routeId]:a.routeIds||[]))];
  s.travelSnapshot={name:s.title||'Speelsessie',distance:r.unknown?null:r.distanceMi,duration:r.travel/24,unit:'mi',places:[...new Map([...(s.travelSnapshot?.places||[]),...s.activities.flatMap(a=>a.snapshot?.places||a.places||[])].map(p=>[p.id,p])).values()]};
  return s;
 });
 state.sessions=entries;state.hourlyTimeline={...settings};
 return result;
}
function hourSettingsFromForm(){const settings=hourlySettings();return {...settings,date:$('#hourStartDate').value.trim(),hour:Number($('#hourStartHour').value),dailyStart:Number($('#hourDailyStart').value),dailyHours:Number($('#hourDailyHours').value)}}
function hourlyCandidate(){
 const sessions=hourlySessions(),entry={...hourDraft,number:$('#hourNumber').value.trim(),realDate:$('#hourPlayed').value,title:$('#hourTitle').value.trim()};
 const i=sessions.findIndex(s=>s.id===entry.id);if(i<0)sessions.push(entry);else sessions[i]=entry;
 return sessions.sort((a,b)=>{const x=parseFloat(a.number),y=parseFloat(b.number);if(Number.isFinite(x)&&Number.isFinite(y)&&x!==y)return x-y;if(Number.isFinite(x)!==Number.isFinite(y))return Number.isFinite(x)?-1:1;return String(a.realDate||'').localeCompare(String(b.realDate||''))});
}
function renderHourlyDraft(){
 if(!hourDraft)return;
 $('#hourActivities').innerHTML=hourDraft.activities.map((a,i)=>`<div class="hourActivity"><div><strong>${esc(a.kind==='travel'?a.snapshot.name:a.label||'Tijd zonder reizen')}</strong><div class="small">${a.kind==='travel'?`${a.from}% → ${a.to}% · tocht ${a.trip} · ${a.hoursOverride===null?routeHourPortion(a.snapshot,a.from,a.to).hours:a.hoursOverride} reisuren · ${a.extraHours} u extra`:`${a.hours} uur${a.kind==='legacy'?' · oude registratie, verdeling onbekend':''}`}</div></div><div class="hourActions"><button type="button" data-hour-edit="${i}" title="Activiteit bewerken">Bewerk</button><button type="button" data-hour-up="${i}" title="Eerder" ${i===0?'disabled':''}>↑</button><button type="button" data-hour-down="${i}" title="Later" ${i===hourDraft.activities.length-1?'disabled':''}>↓</button><button type="button" data-hour-remove="${i}" title="Activiteit verwijderen">×</button></div></div>`).join('')||'<p class="small">Voeg een reis, verblijf of extra tijd toe.</p>';
 try{const result=calculateHourly(hourlyCandidate(),hourSettingsFromForm()),r=result.rows.find(r=>r.session.id===hourDraft.id);$('#hourPreview').innerHTML=`<strong>${esc(hourDate(r.start,hourlySettings().calendar))} → ${esc(hourDate(r.end,hourlySettings().calendar))}</strong><p>${r.travel} u reizen · ${r.other} u zonder reizen${r.unclassified?` · ${r.unclassified} u oude registratie`:''} · totaal ${hourText(r.end-r.start)} · ${(r.distanceMi*(state.unit==='km'?1.609344:1)).toFixed(1)} ${esc(state.unit||'mi')}</p><ol>${r.blocks.map(b=>`<li>${esc(hourDate(b.start,hourlySettings().calendar))} → ${esc(hourDate(b.end,hourlySettings().calendar))}: ${esc(b.label||b.snapshot?.name||'Activiteit')}${b.rest?` (inclusief ${b.rest} u rust buiten reisrooster)`:''}</li>`).join('')}</ol><p class="small">Einde campagne: ${esc(hourDate(result.end,hourlySettings().calendar))}. Latere sessies schuiven mee.</p>`;}catch(e){$('#hourPreview').textContent=e.message}
}
function openHourlyEditor(id){
 const original=id?(state.sessions||[]).find(s=>s.id===id):null,settings=hourlySettings();
 hourDraft=original?{...cloneJSON(original),activities:legacyHourBlocks(original)}:{id:uid(),hourlyVersion:1,number:String(Math.max(0,...(state.sessions||[]).map(s=>Number(s.number)||0))+1),realDate:localToday(),title:'',activities:[]};
 $('#hourNumber').value=hourDraft.number||'';$('#hourPlayed').value=hourDraft.realDate||'';$('#hourTitle').value=hourDraft.title||'';
 $('#hourStartDate').type=settings.calendar==='gregorian'?'date':'text';$('#hourStartDate').value=settings.date;$('#hourStartHour').value=settings.hour;$('#hourDailyStart').value=settings.dailyStart;$('#hourDailyHours').value=settings.dailyHours;
 $('#hourCalendarLabel').textContent='Kalender: '+(settings.calendar==='gregorian'?'Gregoriaans':'Harptos')+'. Dit beginmoment geldt voor de hele tijdlijn.';
 $('#hourPickDate').hidden=settings.calendar!=='harptos';$('#hourDelete').hidden=!original;$('#hourError').textContent='';$('#hourMigration').hidden=!(state.sessions||[]).some(s=>!s.hourlyVersion);
 $('#hourActivityForm').hidden=true;$('#hourEditor').classList.remove('hidden');renderHourlyDraft();
}
function hourRouteChoices(){return state.routes.map(r=>`<option value="${esc(r.id)}">${esc(r.name||'Route')}</option>`).join('')}
function hourSuggestRange(){
 const id=$('#hourRoute').value,all=hourlyCandidate().flatMap(s=>s.activities).flatMap(a=>a.kind==='legacy'?(a.routeIds||[]).map(routeId=>({kind:'travel',routeId,trip:1,from:0,to:100})):a).filter(a=>a.kind==='travel'&&a.routeId===id&&a.id!==$('#hourActivityId').value);
 let trip=Math.max(1,...all.map(a=>a.trip));if($('#hourNewTrip').checked)trip=all.length?trip+1:1;
 const end=Math.max(0,...all.filter(a=>a.trip===trip).map(a=>a.to));$('#hourTrip').value=trip;$('#hourFrom').value=end;$('#hourTo').value=100;
 const route=routeById(id);$('#hourTravelDay').value=route?.log?.transport==='Boot'?24:Number($('#hourDailyHours').value)||8;$('#hourOverride').value='';hourEstimate();
}
function hourEstimate(){
 try{const existing=hourDraft.activities.find(a=>a.id===$('#hourActivityId').value),id=$('#hourRoute').value,day=Number($('#hourTravelDay').value),snapshot=existing?.routeId===id?existing.snapshot:routeHourSnapshot(routeById(id),day);const p=routeHourPortion(snapshot,Number($('#hourFrom').value),Number($('#hourTo').value));$('#hourEstimate').textContent=`Berekend: ${p.hours} reisuren · ${(p.distanceMi*(state.unit==='km'?1.609344:1)).toFixed(1)} ${state.unit||'mi'}. Uren worden eenmaal afgerond voor dit routedeel.`;}catch(e){$('#hourEstimate').textContent='Kies een route met schaal en snelheid.'}
}
function openHourActivity(kind,index){
 const a=index===undefined?null:hourDraft.activities[index];$('#hourActivityId').value=a?.id||'';$('#hourKind').value=a?.kind||kind;
 const travel=(a?.kind||kind)==='travel';$('#hourTravelFields').hidden=!travel;$('#hourStayFields').hidden=travel;$('#hourRoute').innerHTML=hourRouteChoices();$('#hourNewTrip').checked=false;
 $('#hourActivityLabel').value=a?.label||'';$('#hourStayHours').value=a?.hours??1;$('#hourExtra').value=a?.extraHours||0;
 if(travel){if(a){if(!routeById(a.routeId))$('#hourRoute').innerHTML+=`<option value="${esc(a.routeId)}">${esc(a.snapshot.name)} (bewaarde route)</option>`;$('#hourRoute').value=a.routeId;$('#hourFrom').value=a.from;$('#hourTo').value=a.to;$('#hourTrip').value=a.trip;$('#hourTravelDay').value=a.dailyHours;$('#hourOverride').value=a.hoursOverride??'';hourEstimate()}else hourSuggestRange()}
 $('#hourActivityForm').hidden=false;$('#hourActivityError').textContent='';
}
function saveHourActivity(){
 try{
  const old=hourDraft.activities.find(a=>a.id===$('#hourActivityId').value),kind=$('#hourKind').value;
  let a={id:old?.id||uid(),kind,label:$('#hourActivityLabel').value.trim()};
  if(kind==='travel'){
   const id=$('#hourRoute').value,day=Number($('#hourTravelDay').value),snapshot=old?.routeId===id?old.snapshot:routeHourSnapshot(routeById(id),day);
   a={...a,label:a.label||snapshot.name,routeId:id,trip:Number($('#hourTrip').value),from:Number($('#hourFrom').value),to:Number($('#hourTo').value),dailyHours:day,extraHours:Number($('#hourExtra').value),hoursOverride:$('#hourOverride').value===''?null:Number($('#hourOverride').value),snapshot};
  }else a={...old,...a,label:a.label||(kind==='delay'?'Extra tijd':'Verblijf / rust'),hours:Number($('#hourStayHours').value)};
  const previous=hourDraft.activities.slice(),i=previous.findIndex(x=>x.id===a.id);if(i<0)hourDraft.activities.push(a);else hourDraft.activities[i]=a;
  try{validateHourlySessions(hourlyCandidate())}catch(e){hourDraft.activities=previous;throw e}
  $('#hourActivityForm').hidden=true;renderHourlyDraft();
 }catch(e){$('#hourActivityError').textContent=e.message}
}
function hourlyVisibleRows(result){const byId=new Map(result.rows.map(r=>[r.session.id,r]));return filteredTravelRows().map(r=>byId.get(r.entry.id)).filter(Boolean)}
function hourlyTimelineHTML(rows,cal){return rows.map(r=>`<details class="hourSession" open><summary><strong>Sessie ${esc(r.session.number||'—')}</strong> · ${esc(r.session.realDate||'Geen speeldatum')} · ${esc(r.session.title||'Reis en tijd')}</summary><p>${esc(hourDate(r.start,cal))} → ${esc(hourDate(r.end,cal))}</p><p>${r.travel} u reizen · ${r.other} u zonder reizen${r.unclassified?` · ${r.unclassified} u niet uitgesplitst`:''} · <strong>${hourText(r.end-r.start)}</strong> · ${(r.distanceMi*(state.unit==='km'?1.609344:1)).toFixed(1)} ${esc(state.unit||'mi')}</p><ol>${r.blocks.map(b=>`<li><span class="small">${esc(hourDate(b.start,cal))} → ${esc(hourDate(b.end,cal))}</span><br>${esc(b.label||b.snapshot?.name||'Activiteit')}${b.rest?` · ${b.rest} u automatische rust`:''}</li>`).join('')}</ol><button data-hour-session="${esc(r.session.id)}">Sessie bewerken</button></details>`).join('')||'<p>Nog geen sessies in dit overzicht.</p>'}
function renderHourlyOverview(){
 const el=$('#hourOverview');if(!el)return;
 try{const settings=hourlySettings(),result=calculateHourly(hourlySessions(),settings),rows=hourlyVisibleRows(result);el.innerHTML=`<div class="hourTotals"><div><span>Speelsessies</span><strong>${result.rows.length}</strong></div><div><span>Reizen</span><strong>${result.travel} uur</strong></div><div><span>Zonder reizen</span><strong>${result.other} uur</strong></div><div><span>Totaal in-game</span><strong>${hourText(result.end-result.start)}</strong></div><div><span>Totale afstand</span><strong>${(result.distanceMi*(state.unit==='km'?1.609344:1)).toFixed(1)} ${esc(state.unit||'mi')}</strong></div></div><p>Huidige in-game tijd: <strong>${esc(hourDate(result.end,settings.calendar))}</strong></p>${result.unclassified?'<p class="notice">Oude registraties hebben nog geen splitsing tussen reizen en verblijf. Hun totale tijd blijft behouden; bewerk ze om de activiteiten te verdelen. De aaneengesloten tijdlijn wordt bij de eerste sessie-opslag vastgelegd; oorspronkelijke datums blijven intern bewaard.</p>':''}<p class="small">Totalen hierboven gelden voor de hele campagne. De tijdlijn en exports volgen de filters. Sessienummers bepalen de volgorde.</p>${result.rows.some(r=>r.unknown)?'<p class="notice">Oude registraties bevatten onbekende waarden. Alleen bekende afstanden en tijden zijn opgeteld.</p>':''}${hourlyTimelineHTML(rows,settings.calendar)}`;}catch(e){el.textContent=e.message}
}
function bindHourlyUI(){
 $('#newSessionBtn').onclick=()=>openHourlyEditor(null);
 $('#hourCancel').onclick=()=>{$('#hourEditor').classList.add('hidden');hourDraft=null};
 $('#hourSave').onclick=()=>{try{if(!hourInt(Number($('#hourNumber').value),1))throw Error('Vul een geldig sessienummer in.');if((state.sessions||[]).some(s=>s.id!==hourDraft.id&&Number(s.number)===Number($('#hourNumber').value)))throw Error('Dit sessienummer bestaat al.');if(!$('#hourActivityForm').hidden)throw Error('Voeg de geopende activiteit eerst toe of annuleer die.');commitHourly(hourlyCandidate(),hourSettingsFromForm());$('#hourEditor').classList.add('hidden');hourDraft=null;save();render();renderLogbook()}catch(e){$('#hourError').textContent=e.message}};
 $('#hourDelete').onclick=()=>{if(confirm('Deze sessie verwijderen? Latere in-game tijden schuiven terug.')){try{commitHourly(hourlySessions().filter(s=>s.id!==hourDraft.id),hourSettingsFromForm());$('#hourEditor').classList.add('hidden');hourDraft=null;save();render();renderLogbook()}catch(e){$('#hourError').textContent=e.message}}};
 $('#hourAddTravel').onclick=()=>openHourActivity('travel');$('#hourAddStay').onclick=()=>openHourActivity('stay');$('#hourAddDelay').onclick=()=>openHourActivity('delay');$('#hourAddActivity').onclick=saveHourActivity;$('#hourCancelActivity').onclick=()=>$('#hourActivityForm').hidden=true;
 $('#hourRoute').onchange=hourSuggestRange;$('#hourNewTrip').onchange=hourSuggestRange;
 for(const id of ['hourFrom','hourTo','hourTravelDay'])$('#'+id).oninput=hourEstimate;
 for(const id of ['hourNumber','hourPlayed','hourTitle','hourStartDate','hourStartHour','hourDailyStart','hourDailyHours'])$('#'+id).oninput=renderHourlyDraft;
 $('#hourActivities').onclick=e=>{const b=e.target.closest('button');if(!b)return;for(const [key,action] of [['hourEdit',i=>openHourActivity('',i)],['hourRemove',i=>{hourDraft.activities.splice(i,1);renderHourlyDraft()}],['hourUp',i=>{if(i>0)[hourDraft.activities[i-1],hourDraft.activities[i]]=[hourDraft.activities[i],hourDraft.activities[i-1]];renderHourlyDraft()}],['hourDown',i=>{if(i<hourDraft.activities.length-1)[hourDraft.activities[i+1],hourDraft.activities[i]]=[hourDraft.activities[i],hourDraft.activities[i+1]];renderHourlyDraft()}]])if(b.dataset[key]!==undefined)action(Number(b.dataset[key]))};
 $('#hourOverview').onclick=e=>{const b=e.target.closest('[data-hour-session]');if(b)openHourlyEditor(b.dataset.hourSession)};
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('#hourEditor').classList.contains('hidden')&&!$('#harptosDialog').open){$('#hourEditor').classList.add('hidden');hourDraft=null}});
}
