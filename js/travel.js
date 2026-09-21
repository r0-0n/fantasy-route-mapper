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
 let auto=$("#sessionAutoDays").checked,el=$("#sessionGameDays"),help=$("#sessionDaysHelp");el.readOnly=auto;$("#sessionTimeMode").value=auto?"harptos":"manual";
 if(!auto){help.textContent="Totale verstreken in-game dagen, inclusief reizen en rust. De geschatte reistijd wordt hier niet bij opgeteld.";updateSessionTimeSummary();return true}
 let days=harptosDuration($("#sessionGameStart").value,$("#sessionGameEnd").value);
 if(days===null||days<0){el.value="";help.textContent=days<0?"De einddatum moet op of na de begindatum liggen.":"Kies een geldige begin- en einddatum om de duur te berekenen.";updateSessionTimeSummary();return false}
 el.value=days;help.textContent=`${days} verstreken dagen, inclusief reizen. Dezelfde datum telt als 0 dagen; reistijd wordt niet nogmaals opgeteld.`;updateSessionTimeSummary();return true;
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
 }).join(""):`<div class="small" role="status">${state.routes.length?"Geen andere routes gevonden.":"Nog geen routes in deze campagne. Teken eerst een route op de kaart."}</div>`;
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
 $("#sessionAutoDays").checked=s?s.timeMode==="harptos":true;
 $("#sessionId").value=s?.id||"";$("#sessionNumber").value=s?.number||"";$("#sessionRealDate").value=s?.realDate||"";$("#sessionTitle").value=s?.title||"";$("#sessionGameStart").value=s?.gameStart||s?.gameDate||"";$("#sessionGameEnd").value=s?.gameEnd||"";$("#sessionGameDays").value=s?.gameDays??"";$("#sessionNotes").value=s?.notes||"";
 $("#sessionEditorTitle").textContent=s?"Reis bewerken":"Reis toevoegen";$("#deleteSessionBtn").style.visibility=s?"visible":"hidden";
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
 if(same)return old.travelSnapshot;
 let routes=(entry.routeIds||[]).map(routeById).filter(Boolean),placeIds=new Set(entry.locationIds||[]);
 routes.forEach(r=>{if(r.log?.fromLocationId)placeIds.add(r.log.fromLocationId);if(r.log?.toLocationId)placeIds.add(r.log.toLocationId)});
 let valid=!!state.scale&&routes.length===(entry.routeIds||[]).length&&routes.length>0;
 let distance=valid?routes.reduce((sum,r)=>sum+routeDistance(r),0):null;
 let duration=valid&&routes.every(r=>Number(r.log?.pace||24)>0)?routes.reduce((sum,r)=>sum+routeDistance(r)/Number(r.log?.pace||24),0):null;
 return {name:routes.map(r=>r.name||'Naamloze route').join(' / ')||'Oude registratie zonder route',distance,duration,unit:state.unit||'mi',places:[...placeIds].map(id=>({id,name:markerById(id)?.name||'Verwijderde plaats'}))};
}

function travelRows(){
 return state.sessions.map(entry=>{let snap=validTravelSnapshot(entry.travelSnapshot)?entry.travelSnapshot:makeTravelSnapshot(entry,null),start=parseHarptos(entry.gameStart||entry.gameDate),end=parseHarptos(entry.gameEnd);
 return {entry,snap,start:start?harptosOrdinal(start):null,end:end?harptosOrdinal(end):null};});
}

function filteredTravelRows(){
 let q=$('#sessionSearch').value.trim().toLowerCase(),filter=$('#sessionFilter').value;
 let fromText=$('#travelFrom').value.trim(),untilText=$('#travelUntil').value.trim(),from=parseHarptos(fromText),until=parseHarptos(untilText);
 let invalid=(fromText&&!from)||(untilText&&!until)||(from&&until&&harptosOrdinal(from)>harptosOrdinal(until));
 $('#travelFilterError').textContent=invalid?'Gebruik geldige Harptos-datums; de einddatum moet op of na de begindatum liggen.':'';
 if(invalid)return [];
 let rows=travelRows().filter(r=>(!q||[r.entry.number?'Sessie '+r.entry.number:'',r.entry.realDate||'',r.snap.name,...r.snap.places.map(p=>p.name)].join(' ').toLowerCase().includes(q))&&(filter!=='travel'||r.entry.routeIds?.length)&&(filter!=='noTravel'||!r.entry.routeIds?.length)&&(filter!=='location'||r.snap.places.length)&&(!from||(r.start!==null&&(r.end??r.start)>=harptosOrdinal(from)))&&(!until||(r.start!==null&&r.start<=harptosOrdinal(until))));
 return rows.sort((a,b)=>{let sort=$('#sessionSort').value;
 if(sort==='sessionAsc'){let x=String(a.entry.number||''),y=String(b.entry.number||'');if(!x||!y)return x?-1:y?1:0;return x.localeCompare(y,undefined,{numeric:true})}
 if(sort==='playedDesc'){let x=a.entry.realDate||'',y=b.entry.realDate||'';if(!x||!y)return x?-1:y?1:0;return y.localeCompare(x)}
 if(a.start===null)return b.start===null?0:1;if(b.start===null)return -1;return (a.start-b.start)*($('#sessionSort').value==='dateDesc'?-1:1)});
}

function travelDistance(row){let d=row.snap.distance;if(d===null||!Number.isFinite(d))return null;return row.snap.unit===(state.unit||'mi')?d:row.snap.unit==='mi'?d*1.609344:d/1.609344}

function travelElapsed(row){
 const entry=row.entry, dated=harptosDuration(entry.gameStart||entry.gameDate,entry.gameEnd);
 if(entry.timeMode==='harptos'&&dated!==null&&dated>=0)return {days:dated,estimated:false};
 const raw=entry.gameDays;
 if(raw!==undefined&&raw!==null&&String(raw).trim()!==''&&Number.isFinite(Number(raw))&&Number(raw)>=0)return {days:Number(raw),estimated:false};
 if(dated!==null&&dated>=0)return {days:dated,estimated:false};
 return {days:Number.isFinite(row.snap.duration)&&row.snap.duration>=0?row.snap.duration:null,estimated:true};
}

function travelTotals(rows){return {distance:rows.reduce((n,r)=>n+(travelDistance(r)??0),0),duration:rows.reduce((n,r)=>n+(travelElapsed(r).days??0),0),unknown:rows.some(r=>travelDistance(r)===null||travelElapsed(r).days===null),places:new Set(rows.flatMap(r=>r.snap.places.map(p=>p.id))).size}}

function travelPeriod(r){return [r.entry.gameStart||r.entry.gameDate,r.entry.gameEnd].filter(Boolean).join(' → ')||'Datum onbekend'}

function travelCells(r){return [r.entry.number?'Sessie '+r.entry.number:'—',r.entry.realDate||'—',travelPeriod(r),r.snap.name,travelDistance(r)===null?'Onbekend':travelDistance(r).toFixed(1)+' '+(state.unit||'mi'),travelElapsed(r).days!==null?travelElapsed(r).days.toFixed(1)+' dagen'+(travelElapsed(r).estimated?' (geschat)':''):'Onbekend',r.snap.places.map(p=>p.name).join(', ')||'—']}

function travelTable(rows,interactive=false){let totals=travelTotals(rows);return `<div class="travelTableWrap"><table class="travelTable"><thead><tr>${['Sessie','Speeldatum','Periode (Harptos)','Reis','Afstand','In-game dagen','Plaatsen',...(interactive?['Acties']:[])].map(x=>`<th scope="col">${x}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr ${interactive?`data-editsession="${esc(r.entry.id)}"`:''}>${travelCells(r).map(x=>`<td>${esc(x)}</td>`).join('')}${interactive?`<td><button data-editsession="${esc(r.entry.id)}">Bewerk</button> <button data-travel-map="${esc(r.entry.id)}">Toon op kaart</button></td>`:''}</tr>`).join('')||`<tr><td colspan="${interactive?8:7}">Geen reizen gevonden.</td></tr>`}</tbody><tfoot><tr><td colspan="4">Totaal (${rows.length} registraties${totals.unknown?', bekende waarden':''})</td><td>${totals.distance.toFixed(1)} ${esc(state.unit||'mi')}</td><td>${totals.duration.toFixed(1)} dagen</td><td>${totals.places} plaatsen</td>${interactive?'<td></td>':''}</tr></tfoot></table></div>`}

function renderLogbook(){let rows=filteredTravelRows(),t=travelTotals(rows);$('#logbookTitle').textContent=(state.projectName||'Campagne')+' — Reislogboek';$('#campaignSessionCount').textContent=rows.length;$('#campaignRouteCount').textContent=t.distance.toFixed(1)+' '+(state.unit||'mi')+(t.unknown?' *':'');$('#campaignLocationCount').textContent=t.places;$('#campaignTimeDays').textContent=t.duration.toFixed(1)+' dagen'+(t.unknown?' *':'');$('#journeyList').innerHTML=travelTable(rows,true)+(t.unknown?'<p class="small">* Alleen bekende afstanden en reistijden zijn opgeteld.</p>':'')}

// Registreer bediening; aangeroepen vanuit init.js.
function bindSessionSearchUI(){
$("#sessionSearch").oninput=()=>renderLogbook();
$("#sessionSort").onchange=()=>renderLogbook();
$("#sessionFilter").onchange=()=>renderLogbook();
$("#sessionRouteSearch").oninput=()=>{sessionResultLimits.route=6;renderSessionPickers({routeIds:[...(sessionPickerDraft?.routeIds||[])],locationIds:[...(sessionPickerDraft?.locationIds||[])]})};
$("#sessionLocationSearch").oninput=()=>{sessionResultLimits.location=6;renderSessionPickers({routeIds:[...(sessionPickerDraft?.routeIds||[])],locationIds:[...(sessionPickerDraft?.locationIds||[])]})};
$("#sessionRouteSelect").onclick=e=>{if(e.target.closest("[data-more],[data-browse]")){sessionResultLimits.route+=6;renderSessionPickers();return}let b=e.target.closest("[data-add-route]");if(b&&sessionPickerDraft){if(!$("#sessionId").value)sessionPickerDraft.routeIds.clear();sessionPickerDraft.routeIds.add(b.dataset.addRoute);$("#sessionRouteSearch").value="";renderSessionPickers();$("#sessionRouteSearch").focus()}};
$("#sessionLocationSelect").onclick=e=>{if(e.target.closest("[data-more],[data-browse]")){sessionResultLimits.location+=6;renderSessionPickers();return}let b=e.target.closest("[data-add-location]");if(b&&sessionPickerDraft){sessionPickerDraft.locationIds.add(b.dataset.addLocation);$("#sessionLocationSearch").value="";renderSessionPickers();$("#sessionLocationSearch").focus()}};
$("#sessionRoutes").onclick=e=>{let b=e.target.closest("[data-remove-route]");if(b&&sessionPickerDraft){sessionPickerDraft.routeIds.delete(b.dataset.removeRoute);renderSessionPickers()}};
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
$("#saveSessionBtn").onclick=()=>{if(!sessionPickerDraft?.routeIds.size&&!$("#sessionId").value){$("#travelEditorError").textContent="Kies eerst een afgelegde route.";return}if(!updateSessionDays())return;let id=$("#sessionId").value||uid(),routeIds=sessionPickerDraft?[...sessionPickerDraft.routeIds]:[],locationIds=sessionPickerDraft?[...sessionPickerDraft.locationIds]:[],obj={id,timeMode:$("#sessionAutoDays").checked?"harptos":"manual",number:$("#sessionNumber").value,realDate:$("#sessionRealDate").value,title:$("#sessionTitle").value,gameStart:$("#sessionGameStart").value.trim(),gameEnd:$("#sessionGameEnd").value.trim(),gameDays:$("#sessionGameDays").value===""?"":Math.max(0,Math.floor(Number($("#sessionGameDays").value)||0)),notes:$("#sessionNotes").value,routeIds,locationIds};obj.travelSnapshot=makeTravelSnapshot(obj,state.sessions.find(x=>x.id===id));let i=state.sessions.findIndex(x=>x.id===id);if(i>=0)state.sessions[i]=obj;else state.sessions.push(obj);sessionPickerDraft=null;$("#sessionModal").classList.add("hidden");save();renderLogbook();render()};
$("#deleteSessionBtn").onclick=()=>{let id=$("#sessionId").value;if(id&&confirm("Deze reisregistratie verwijderen?")){state.sessions=state.sessions.filter(x=>x.id!==id);$("#sessionModal").classList.add("hidden");save();renderLogbook();render()}};
}

// Preview uses the same snapshot and elapsed-days rules as the saved logbook.
function updateSessionTimeSummary(){
 const el=$("#sessionTimeSummary");if(!el)return;
 const old=state.sessions.find(s=>s.id===$("#sessionId").value);
 const entry={routeIds:[...(sessionPickerDraft?.routeIds||[])],locationIds:[...(sessionPickerDraft?.locationIds||[])],gameDays:$("#sessionGameDays").value,gameStart:$("#sessionGameStart").value,gameEnd:$("#sessionGameEnd").value,timeMode:$("#sessionAutoDays").checked?"harptos":"manual"};
 const snap=makeTravelSnapshot(entry,old),elapsed=travelElapsed({entry,snap});
 const estimate=Number.isFinite(snap.duration)?snap.duration.toFixed(1)+" dagen":"onbekend (kies een route met schaal)";
 const actual=elapsed.days===null?"onbekend":elapsed.days.toFixed(1)+" dagen";
 const invalid=entry.timeMode==="harptos"&&(harptosDuration(entry.gameStart,entry.gameEnd)===null||harptosDuration(entry.gameStart,entry.gameEnd)<0);
 el.textContent="Route-inschatting: "+estimate+" · "+(invalid?"Kies geldige Harptos-datums.":elapsed.estimated?"Voor het totaal: "+actual+" (geschat; vul dagen in voor de werkelijke duur).":"Verstreken: "+actual+" — dit telt mee in het logboek.");
}
