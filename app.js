import {openAcademy} from './cockpit.js';
// AI-assisted implementation; see docs/SOURCES.md.
import {catalog,objectives,defaultDesign,simulate} from './simulation.js';
let design={...defaultDesign};
let lastResult=null;
let history=[];
let attempt=0;
const $=s=>document.querySelector(s),T=s=>window.MissionLang.t(s),arabic=()=>window.MissionLang.isArabic();
const groupNames={payload:'Scientific instrument',solar:'Solar power',battery:'Battery storage',radio:'Communications',launcher:'Launch vehicle',orbit:'Orbit selection'};
function renderChoices(){
 $('#objective').innerHTML=Object.entries(objectives).map(([id,o])=>`<option value="${id}">${T(o.name)}</option>`).join('');
 $('#equipment').innerHTML=Object.entries(catalog).map(([key,items])=>`<fieldset><legend>${T(groupNames[key])}</legend><div class="choices">${items.map(i=>`<label class="choice"><input type="radio" name="${key}" value="${i.id}"><span class="choice-content"><strong>${T(i.name)}</strong><small>${T(i.detail)}</small><span class="spec">${i.cost?`${i.cost} ${arabic()?'رصيد':'credits'}`:''}${i.mass?` · ${i.mass} ${arabic()?'كغ':'kg'}`:''}${i.power?` · ${i.power} ${arabic()?'واط أثناء التشغيل':'W active'}`:''}</span></span><span class="radio-dot"></span></label>`).join('')}</div></fieldset>`).join('');
}
renderChoices();
function meter(label,value,limit,unit,lowerBetter=true){const ok=lowerBetter?value<=limit:value>=limit;const units=arabic()?({'credits':'رصيد','kg':'كغ','Wh':'واط·ساعة','units':'وحدة'}[unit]||unit):unit;const detail=arabic()?`${value.toFixed(1)} ${units} / ${lowerBetter?'الحد الأقصى':'المطلوب'} ${limit.toFixed(1)}`:`${value.toFixed(1)} ${units} ${lowerBetter?"of":"vs"} ${limit.toFixed(1)} ${lowerBetter?"limit":"needed"}`;return `<div class="meter"><div><span>${T(label)}</span><strong class="${ok?'':'over'}">${detail}</strong></div><progress class="${ok?'':'over'}" max="${Math.max(limit,value,1)}" value="${value}" aria-label="${T(label)}"></progress></div>`;}
function render(preserveResult=false){
  $('#objective').value=design.objective;
  $('#objective-description').textContent=T(objectives[design.objective].description);
  for(const key of Object.keys(catalog)) document.querySelector(`input[name="${key}"][value="${design[key]}"]`).checked=true;
  const r=simulate(design);const orbit=catalog.orbit.find(o=>o.id===design.orbit);
  $('#altitude').textContent=`${orbit.altitude} ${arabic()?'كم':'km'}`;$('#period').textContent=`${r.period.toFixed(0)} ${arabic()?'دقيقة':'min'}`;$('#eclipse').textContent=`${r.eclipse.toFixed(0)} ${arabic()?'دقيقة':'min'}`;
  $('#orbit-label').textContent=arabic()?`${orbit.altitude} كم / مدار منخفض`:`${orbit.altitude} KM / LEO`;
  $('#resources').innerHTML=meter('Mission budget',r.cost,r.budget,'credits')+meter('Launch mass',r.mass,r.launchLimit,'kg')+meter('Orbit energy supply',r.energyGenerated,r.energyNeeded,'Wh',false)+meter('Eclipse storage',catalog.battery.find(x=>x.id===design.battery).capacity,r.eclipseNeeded,'Wh',false)+meter('Science data returned',r.dataReturned,objectives[design.objective].data,'units',false);
  if(lastResult&&!preserveResult){$('#results').hidden=true;lastResult=null;}
}
$('#objective').addEventListener('change',e=>{design.objective=e.target.value;render();});
$('#equipment').addEventListener('change',e=>{if(e.target.matches('input')){design[e.target.name]=e.target.value;render();}});
$('#reset').addEventListener('click',()=>{design={...defaultDesign};render();});
$('#example').addEventListener('click',()=>{const payload=objectives[design.objective].preferred;design={objective:design.objective,payload,solar:'extended',battery:'large',radio:'fast',launcher:'dedicated',orbit:'low'}; if(design.objective==='survey')design.launcher='rideshare';render();});
function checkMessage(c,r){if(!arabic())return c.message;
 switch(c.id){
  case 'budget':return `${r.cost} من أصل ${r.budget} رصيد متاح.`;
  case 'mass':return `كتلة المركبة ${r.mass} كغ، والحد المسموح للإطلاق ${r.launchLimit} كغ.`;
  case 'energy':return `تولّد المركبة ${r.energyGenerated.toFixed(1)} واط·ساعة وتستهلك ${r.energyNeeded.toFixed(1)} واط·ساعة في الدورة المدارية.`;
  case 'battery':return `البطارية تخزّن ${catalog.battery.find(x=>x.id===design.battery).capacity} واط·ساعة، وتحتاج المركبة إلى ${r.eclipseNeeded.toFixed(1)} واط·ساعة أثناء المرور في الظل.`;
  case 'data':return `يمكن إرسال ${r.dataReturned} من أصل ${objectives[design.objective].data} وحدة بيانات مطلوبة خلال كل دورة.`;
  default:return T(c.message);
 }
}
function checkFix(c){if(!arabic())return c.fix;if(c.id==='science')return `اختر ${T(catalog.payload.find(x=>x.id===objectives[design.objective].preferred).name)} لتتمكن من تحقيق الهدف العلمي.`;return T(c.fix);}
function drawHistory(){if(!history.length)return;$('#history').innerHTML=history.map(h=>`<article class="history-row"><span>#${h.attempt}</span><strong>${T(h.goal)}</strong><span>${T(h.result.success?'READY':'REVISE')} · ${h.result.passed}/6</span><span>${h.result.cost} ${arabic()?'رصيد':'credits'} · ${h.result.mass} ${arabic()?'كغ':'kg'}</span></article>`).join('');}
function drawResult(r){
 const passed=id=>r.checks.find(c=>c.id===id).pass;
 const stages=[['Launch review',passed('budget')&&passed('mass')],['Sunlight operations',passed('energy')],['Eclipse operations',passed('battery')],['Science downlink',passed('data')&&passed('science')]];
 let blocked=false;
 $('#timeline').innerHTML=stages.map(([label,ok],i)=>{const status=blocked?'BLOCKED':ok?'PASS':'REVISE';if(!ok)blocked=true;return `<div class="stage ${status.toLowerCase()}" style="--stage:${i}"><small>${arabic()?'المرحلة':'PHASE'} 0${i+1}</small><strong>${T(label)}</strong><span>${T(status)}</span></div>`;}).join('');
 $('#result-heading').textContent=T(r.success?'Mission ready for discovery.':'Your mission needs another iteration.');
 $('#score').textContent=arabic()?`نجحت في ${r.passed} من أصل 6 اختبارات`:`${r.passed}/6 checks passed`;
 $('#result-summary').textContent=arabic()?(r.success?`اجتاز التصميم جميع الشروط في هذا النموذج، وبلغ تقييم النتائج العلمية ${r.science}/100. جرّب تصميمًا أخف أو أقل تكلفة مع الحفاظ على جاهزية المهمة.`:`اجتاز التصميم ${r.passed} من أصل 6 شروط. راجع الملاحظات الهندسية، وعدّل اختياراتك، ثم أعد تشغيل المحاكاة.`):r.success?`All modeled constraints are satisfied. Science potential: ${r.science}/100. Try a lighter or less expensive design while preserving mission readiness.`:`Your design satisfies ${r.passed} of 6 modeled constraints. Review the engineering feedback, change your choices, and launch again.`;
 $('#checks').innerHTML=r.checks.map(c=>`<article class="check ${c.pass?'pass':'fail'}"><span class="check-status">${c.pass?'✓':'!'} ${T(c.pass?'PASS':'REVISE')}</span><h3>${T(c.title)}</h3><p>${checkMessage(c,r)}</p>${c.pass?'':`<p class="fix">${checkFix(c)}</p>`}</article>`).join('');
}
$('#launch').addEventListener('click',()=>{
 const r=simulate(design);lastResult=r;$('#results').hidden=false;
 attempt++;history.unshift({attempt,goal:objectives[design.objective].name,result:r});history=history.slice(0,5);
 drawHistory();drawResult(r);
 $('#results').focus();$('#results').scrollIntoView({behavior:'smooth',block:'start'});
});
$('#iterate').addEventListener('click',()=>{$('#objective').focus();$('#design-heading').scrollIntoView({behavior:'smooth'});});
render();

$('#clear-history').addEventListener('click',()=>{history=[];attempt=0;$('#history').innerHTML=`<p class="muted">${arabic()?'تم مسح السجل. يمكنك بدء مهمة جديدة.':'Mission log cleared. Your next launch starts a new log.'}</p>`;});

$('#academy').addEventListener('click',()=>openAcademy(design));

window.addEventListener('missionforge-language-change',()=>{renderChoices();render(true);drawHistory();if(lastResult&&!$('#results').hidden)drawResult(lastResult);});
