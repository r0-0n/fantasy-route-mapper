// Harptos-kalender, datumparser en kalenderdialoog.
// Klassiek script: gedeelde globale scope; laadvolgorde staat in index.html.

const HARPTOS_PERIODS=[['Hammer',30],['Midwinter',1],['Alturiak',30],['Ches',30],['Tarsakh',30],['Greengrass',1],['Mirtul',30],['Kythorn',30],['Flamerule',30],['Midsummer',1],['Shieldmeet',1],['Eleasis',30],['Eleint',30],['Highharvestide',1],['Marpenoth',30],['Uktar',30],['Feast of the Moon',1],['Nightal',30]];

function harptosPeriods(year){return HARPTOS_PERIODS.filter(p=>p[0]!=="Shieldmeet"||year%4===0)}

function parseHarptos(text){
 let m=String(text||"").trim().match(/^(?:(\d{1,2})\s+)?(.+?)\s+(\d{1,5})\s+DR$/i);if(!m)return null;
 let year=Number(m[3]),period=harptosPeriods(year).find(p=>p[0].toLowerCase()===m[2].toLowerCase()),day=Number(m[1]||1);
 return year>0&&period&&day>=1&&day<=period[1]?{year,period:period[0],day}:null;
}

function harptosOrdinal(date){
 let offset=365*(date.year-1)+Math.floor((date.year-1)/4);
 for(let [name,days] of harptosPeriods(date.year)){if(name===date.period)return offset+date.day-1;offset+=days}
 return NaN;
}

function harptosDuration(start,end){
 let a=parseHarptos(start),b=parseHarptos(end);return a&&b?harptosOrdinal(b)-harptosOrdinal(a):null;
}

function renderHarptos(){
 let year=Number($("#harptosYear").value),name=$("#harptosPeriod").value,day=$("#harptosDay").value;
 let periods=harptosPeriods(year);$("#harptosPeriod").innerHTML=periods.map(p=>`<option>${p[0]}</option>`).join("");
 $("#harptosPeriod").value=periods.some(p=>p[0]===name)?name:"Hammer";
 let count=periods.find(p=>p[0]===$("#harptosPeriod").value)[1];
 $("#harptosDay").innerHTML=Array.from({length:count},(_,i)=>`<option value="${i+1}">${i+1}</option>`).join("");
 $("#harptosDay").value=String(Math.min(count,Number(day)||1));$("#harptosDay").disabled=count===1;
}

// Registreer bediening; aangeroepen vanuit init.js.
function bindHarptosUI(){
document.querySelectorAll('[data-harptos-target]').forEach(b=>b.onclick=()=>{
 harptosTarget=$("#"+b.dataset.harptosTarget);
 let parsed=parseHarptos(harptosTarget.value)||parseHarptos($("#sessionGameStart").value)||{year:1491,period:"Hammer",day:1};
 $("#harptosYear").value=parsed.year;renderHarptos();$("#harptosPeriod").value=parsed.period;renderHarptos();$("#harptosDay").value=parsed.day;
 $("#harptosDialog").showModal();
});
$("#harptosYear").oninput=renderHarptos;$("#harptosPeriod").onchange=renderHarptos;
$("#harptosCancel").onclick=()=>$("#harptosDialog").close();
$("#harptosDialog").addEventListener("keydown",e=>{if(e.key==="Escape")e.stopPropagation()});
$("#harptosForm").onsubmit=e=>{
 e.preventDefault();let period=$("#harptosPeriod").value,year=Number($("#harptosYear").value),day=Number($("#harptosDay").value);
 let def=harptosPeriods(year).find(p=>p[0]===period);if(!def||!Number.isInteger(year)||year<1||year>99999)return;
 harptosTarget.value=(def[1]===1?"":day+" ")+period+" "+year+" DR";
 $("#harptosDialog").close();updateSessionDays();harptosTarget.focus();
};
}

function campaignCalendar(){return state.calendar==='gregorian'?'gregorian':'harptos'}
function entryCalendar(s){return s?.calendar||(/^\d{4}-\d{2}-\d{2}$/.test(s?.gameStart||'')?'gregorian':'harptos')}
function gameOrdinal(text,calendar){
 if(calendar!=='gregorian'){const d=parseHarptos(text);return d?harptosOrdinal(d):null}
 if(!/^\d{4}-\d{2}-\d{2}$/.test(text||''))return null;
 const d=new Date(text+'T00:00:00Z');return Number.isFinite(d.getTime())&&d.toISOString().slice(0,10)===text?d.getTime()/86400000:null;
}
function gameDateFromOrdinal(n,calendar){
 if(calendar==='gregorian'){const d=new Date(Math.floor(n)*86400000);return Number.isFinite(d.getTime())?d.toISOString().slice(0,10):''}
 if(n<0||n>36525000)return '';let year=Math.max(1,Math.floor(n/365.25)+1);
 while(harptosOrdinal({year,period:'Hammer',day:1})>n)year--;
 while(harptosOrdinal({year:year+1,period:'Hammer',day:1})<=n)year++;
 let left=Math.floor(n)-harptosOrdinal({year,period:'Hammer',day:1});
 for(const [period,days] of harptosPeriods(year)){if(left<days)return (days===1?'':(left+1)+' ')+period+' '+year+' DR';left-=days}return '';
}
function entryDuration(s){const cal=entryCalendar(s),a=gameOrdinal(s.gameStart||s.gameDate,cal),b=gameOrdinal(s.gameEnd,cal);return a===null||b===null?null:b-a+(Number(s.endHalf)||0)-(Number(s.startHalf)||0)}
function localToday(){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
let sessionCalendar='harptos';
function configureSessionCalendar(){
 $('#sessionCalendarLabel').textContent='Kalender: '+(sessionCalendar==='gregorian'?'Gregoriaans':'Harptos');
 for(const id of ['sessionGameStart','sessionGameEnd'])$('#'+id).type=sessionCalendar==='gregorian'?'date':'text';
 document.querySelectorAll('[data-harptos-target]').forEach(b=>b.hidden=sessionCalendar==='gregorian');
}

function setDayFraction(id,value){const n=Number(value)||0,el=$('#'+id);el.innerHTML='<option value="0">Begin van de dag</option><option value="0.5">Halverwege de dag</option>'+(n!==0&&n!==.5?'<option value="'+n+'">+'+n+' dag</option>':'');el.value=String(n)}
