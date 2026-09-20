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
