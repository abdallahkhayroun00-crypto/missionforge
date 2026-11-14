// AI-assisted implementation; see docs/SOURCES.md.
import {catalog,objectives,defaultDesign,simulate} from './simulation.js';
let design={...defaultDesign};
let lastResult=null;
const $=s=>document.querySelector(s);
const groupNames={payload:'Scientific instrument',solar:'Solar power',battery:'Battery storage',radio:'Communications',launcher:'Launch vehicle',orbit:'Orbit selection'};
$('#objective').innerHTML=Object.entries(objectives).map(([id,o])=>`<option value="${id}">${o.name}</option>`).join('');
$('#equipment').innerHTML=Object.entries(catalog).map(([key,items])=>`<fieldset><legend>${groupNames[key]}</legend><div class="choices">${items.map(i=>`<label class="choice"><input type="radio" name="${key}" value="${i.id}"><span class="choice-content"><strong>${i.name}</strong><small>${i.detail}</small><span class="spec">${i.cost?`${i.cost} credits`:''}${i.mass?` · ${i.mass} kg`:''}${i.power?` · ${i.power} W active`:''}</span></span><span class="radio-dot"></span></label>`).join('')}</div></fieldset>`).join('');
function meter(label,value,limit,unit,lowerBetter=true){const ok=lowerBetter?value<=limit:value>=limit;return `<div class="meter"><div><span>${label}</span><strong class="${ok?'':'over'}">${value.toFixed(1)} / ${limit.toFixed(1)} ${unit}</strong></div><progress class="${ok?'':'over'}" max="${Math.max(limit,value,1)}" value="${value}" aria-label="${label}"></progress></div>`;}
function render(){
  $('#objective').value=design.objective;
  $('#objective-description').textContent=objectives[design.objective].description;
  for(const key of Object.keys(catalog)) document.querySelector(`input[name="${key}"][value="${design[key]}"]`).checked=true;
  const r=simulate(design);const orbit=catalog.orbit.find(o=>o.id===design.orbit);
  $('#altitude').textContent=`${orbit.altitude} km`;$('#period').textContent=`${r.period.toFixed(0)} min`;$('#eclipse').textContent=`${r.eclipse.toFixed(0)} min`;
  $('#orbit-label').textContent=`${orbit.altitude} KM / LEO`;
  $('#resources').innerHTML=meter('Mission budget',r.cost,r.budget,'credits')+meter('Launch mass',r.mass,r.launchLimit,'kg')+meter('Orbit energy supply',r.energyGenerated,r.energyNeeded,'Wh',false)+meter('Eclipse storage',catalog.battery.find(x=>x.id===design.battery).capacity,r.eclipseNeeded,'Wh',false);
  if(lastResult){$('#results').hidden=true;lastResult=null;}
}
$('#objective').addEventListener('change',e=>{design.objective=e.target.value;render();});
$('#equipment').addEventListener('change',e=>{if(e.target.matches('input')){design[e.target.name]=e.target.value;render();}});
$('#reset').addEventListener('click',()=>{design={...defaultDesign};render();});
$('#example').addEventListener('click',()=>{const payload=objectives[design.objective].preferred;design={objective:design.objective,payload,solar:'extended',battery:'large',radio:'fast',launcher:'dedicated',orbit:'low'}; if(design.objective==='survey')design.launcher='rideshare';render();});
$('#launch').addEventListener('click',()=>{
  const r=simulate(design);lastResult=r;$('#results').hidden=false;
  $('#result-heading').textContent=r.success?'Mission ready for discovery.':'Your mission needs another iteration.';
  $('#score').textContent=`${r.passed}/6 checks passed`;
  $('#result-summary').textContent=r.success?`All modeled constraints are satisfied. Science potential: ${r.science}/100. Try a lighter or less expensive design while preserving mission readiness.`:`Your design satisfies ${r.passed} of 6 modeled constraints. Review the engineering feedback, change your choices, and launch again.`;
  $('#checks').innerHTML=r.checks.map(c=>`<article class="check ${c.pass?'pass':'fail'}"><span class="check-status">${c.pass?'✓ PASS':'! REVISE'}</span><h3>${c.title}</h3><p>${c.message}</p>${c.pass?'':`<p class="fix">${c.fix}</p>`}</article>`).join('');
  $('#results').focus();$('#results').scrollIntoView({behavior:'smooth',block:'start'});
});
$('#iterate').addEventListener('click',()=>{$('#objective').focus();$('#design-heading').scrollIntoView({behavior:'smooth'});});
render();
