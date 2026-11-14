import {parts,validateCraft} from './craft.js';
import {equipment,initialLoadout,stats,createFlight,tick,distance} from './flight-engine.js';
import {countries,getCountry,isObscured,localizedCountry,localizedRegion,localizedTask,hazardName} from './country-missions.js';
import {renderCountryAtlas} from './country-renderer.js';
const T=s=>window.MissionLang.t(s),arabic=()=>window.MissionLang.isArabic();
const $=s=>document.querySelector(s),canvas=$('#world'),ctx=canvas.getContext('2d');
// The mission is now drawn against an upright country silhouette, not the Earth photo.
let width=0,height=0,scale=1,flight=null,paused=false,loadout={...initialLoadout},last=0,mode='briefing',customCraft=null;
const COUNTRY_KEY='missionforge.country';
let countryId='morocco';try{countryId=localStorage.getItem(COUNTRY_KEY)||countryId;}catch{}
const fromUrl=new URLSearchParams(location.search).get('country');if(Object.hasOwn(countries,fromUrl))countryId=fromUrl;
if(!Object.hasOwn(countries,countryId))countryId='morocco';
let routeCache='';
const keys=new Set(),touch=new Set(),hold={scan:false,link:false};
const motion=matchMedia('(prefers-reduced-motion: reduce)').matches;
function renderCountries(){
 const country=getCountry(countryId),ar=arabic();
 $('#country-options').innerHTML=Object.entries(countries).map(([id,item])=>`<button type="button" class="country-option ${id===countryId?'selected':''}" data-country="${id}" aria-pressed="${id===countryId}"><span class="flag" aria-hidden="true">${item.flag}</span><strong>${localizedCountry(item,ar)}</strong></button>`).join('');
 $('#country-summary').textContent=ar?`${country.subtitleAr} · ${country.regions.length} مواقع حقيقية، مع تحديات رؤية مُحاكاة.`:`${country.subtitle} · ${country.regions.length} real locations, simulated visibility challenges.`;
 $('#destination').textContent=country.flag+' '+localizedCountry(country,ar);
}
function chooseCountry(id){if(!Object.hasOwn(countries,id))return;countryId=id;try{localStorage.setItem(COUNTRY_KEY,id)}catch{}renderCountries()}
$('#country-options').addEventListener('click',e=>{const b=e.target.closest('[data-country]');if(b)chooseCountry(b.dataset.country)});
renderCountries();
function renderRoute(){if(!flight)return;const ar=arabic(),s=flight,done=s.sites.filter(site=>site.remaining===0).length;
 $('#route-country').textContent=getCountry(s.countryId).flag+' '+localizedCountry(getCountry(s.countryId),ar);
 $('#route-count').textContent=`${done}/${s.sites.length}`;
 const html=s.sites.map(site=>{const cloudy=isObscured(s,site),completed=site.remaining===0;const state=completed?(ar?'تم الرصد':'Scanned'):cloudy?hazardName(site.hazard,ar):(ar?'جاهز للرصد':'Visible');return `<div class="route-stop ${completed?'complete':cloudy?'obscured':''}"><span class="route-dot" aria-hidden="true">${completed?'✓':cloudy?'☁':'◎'}</span><div title="${site.lat.toFixed(2)}°, ${site.lon.toFixed(2)}°"><strong>${localizedRegion(site,ar)}</strong><small>${localizedTask(site,ar)}</small><small class="route-condition">${state}</small></div><span class="route-data">${site.initial-site.remaining}/${site.initial}</span></div>`;}).join('');
 if(routeCache!==html){$('#route-items').innerHTML=html;routeCache=html;}
 $('#route-note').textContent=ar?'الغيوم والغبار والحطام تحديات مُحاكاة، وليست أحوال طقس مباشرة.':'Clouds, dust and debris are simulated obstacles, not live conditions.';
}
function drawMissionChart(s){
 // These are latitude/longitude-anchored waypoints on an illustrated arcade map, not an orbit prediction.
 const p0=project(-238,-198),p1=project(235,-198),p2=project(235,205),p3=project(-238,205);
 path([p0,p1,p2,p3],'#17405438','#7aafb633');
 ctx.save();ctx.setLineDash([5,8]);ctx.strokeStyle='#9adfe34f';ctx.lineWidth=1.5;
 ctx.beginPath();s.sites.forEach((site,i)=>{const p=project(site.x,site.z);if(i===0)ctx.moveTo(p.x,p.y);else ctx.lineTo(p.x,p.y)});ctx.stroke();
 ctx.setLineDash([]);
 s.sites.forEach(site=>{const p=project(site.x,site.z);ctx.beginPath();ctx.arc(p.x,p.y,Math.max(3,3*scale),0,Math.PI*2);ctx.fillStyle='#e4d0a6';ctx.fill();});
 ctx.restore();
}
function resize(){width=canvas.clientWidth;height=canvas.clientHeight;const dpr=Math.min(devicePixelRatio||1,2);canvas.width=width*dpr;canvas.height=height*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);scale=Math.min(width/(width<700?700:780),(height-250)/440);}
new ResizeObserver(resize).observe(canvas);
function draw(t){
 ctx.clearRect(0,0,width,height);
 renderCountryAtlas(ctx,width,height,mode==='flight'?flight:null,countryId,arabic(),mode!=='flight');
}
function input(){return {x:(keys.has('d')||keys.has('ArrowRight')||touch.has('right')?1:0)-(keys.has('a')||keys.has('ArrowLeft')||touch.has('left')?1:0),z:(keys.has('s')||keys.has('ArrowDown')||touch.has('down')?1:0)-(keys.has('w')||keys.has('ArrowUp')||touch.has('up')?1:0),scan:hold.scan||keys.has(' '),link:hold.link||keys.has('e')};}
function clearInput(){keys.clear();touch.clear();hold.scan=hold.link=false;document.querySelectorAll('[data-hold].active,[data-move].active').forEach(b=>b.classList.remove('active'));}
function setPause(v){if(mode!=='flight'||flight.status!=='playing')return;paused=v;$('#paused').hidden=!v;clearInput();}
function frame(now){const dt=last?Math.min(.05,(now-last)/1000):0;last=now;if(mode==='flight'&&!paused){tick(flight,input(),dt);updateHUD();if(flight.status!=='playing')finish();}draw(now);requestAnimationFrame(frame);}
function updateHUD(){const s=flight;$('#clock').textContent=`${Math.floor(Math.ceil(s.time)/60).toString().padStart(2,'0')}:${(Math.ceil(s.time)%60).toString().padStart(2,'0')}`;$('#power').textContent=`${Math.round(s.energy)} / ${s.spec.capacity}`;$('#battery-meter').value=s.energy/s.spec.capacity*100;$('#science').textContent=`${s.sent} / ${s.required}`;renderRoute();$('#hull').textContent='● '.repeat(Math.max(0,s.health));if($('#radio-message').textContent!==T(s.message))$('#radio-message').textContent=T(s.message);$('#zone').textContent=arabic()?`${s.eclipse?'في ظلّ الأرض · الشحن الشمسي متوقف':'في ضوء الشمس · الألواح تشحن البطارية'} / ${s.stored} حزم بيانات على متن المركبة`:`${s.eclipse?'ECLIPSE · solar charging off':'SUNLIGHT · solar charging'} / ${s.stored} packets onboard`;}
function setMode(next){mode=next;for(const id of ['briefing','hangar','finish'])$('#'+id).hidden=id!==next;document.querySelectorAll('.hud,.flight-footer,.dpad').forEach(el=>el.hidden=next!=='flight');$('#mission-route').hidden=next!=='flight';if(next==='flight'){routeCache='';renderRoute();}$('#paused').hidden=true;clearInput();}
function renderFinish(){if(!flight)return;$('#finish-title').textContent=T(flight.status==='won'?'Discovery delivered.':'Every flight teaches.');$('#finish-reason').textContent=T(flight.message);$('#finish-stats').textContent=arabic()?`${flight.sent}/${flight.required} حزم مُرسلة · ${Math.round(flight.energy)} وحدة طاقة متبقية · ${Math.round(flight.elapsed)} ثانية طيران`:`${flight.sent}/${flight.required} delivered · ${Math.round(flight.energy)} battery remaining · ${Math.round(flight.elapsed)} seconds flown`;}
function finish(){setMode('finish');renderFinish();}
function renderLoadout(){const spec=stats(loadout);$('#budget').textContent=arabic()?`${spec.cost} / 105 رصيد للإطلاق`:`${spec.cost} / 105 launch credits`;$('#mass').textContent=arabic()?`${spec.mass} كغ · سرعة ${Math.round(100/(1+spec.mass/90))}`:`${spec.mass} kg · ${Math.round(100/(1+spec.mass/90))} speed units`;$('#launch-game').disabled=spec.cost>105;$('#loadout-note').textContent=arabic()?(spec.cost>105?'تجاوزت الميزانية. استبدل أحد التجهيزات بخيار أقل تكلفة.':'المركبة جاهزة. اختر بين التصوير الأسرع، وسعة البطارية الأكبر، والوزن الأخف.'):spec.cost>105?'Over budget. Trade one upgrade for a lighter option.':'Ready to fly. Scan faster, store more energy, or stay light — your choice.';}
function renderLoadoutChoices(){
 $('#loadout').innerHTML=Object.entries(equipment).map(([category,items])=>`<fieldset><legend>${T(category)}</legend><div class="options">${Object.entries(items).map(([id,p])=>`<label class="part"><input type="radio" name="${category}" value="${id}" ${loadout[category]===id?'checked':''}><span><strong>${T(p.name)}</strong><small>${arabic()?`${p.cost} رصيد · ${p.mass} كغ`:`${p.cost} credits · ${p.mass} kg`}<br>${p.scan?(arabic()?`${p.scan} ث/رصد · ${p.power} طاقة`:`${p.scan}s / scan · ${p.power} power`):p.charge?(arabic()?`+${p.charge} طاقة شمسية/ث`:`+${p.charge} solar / sec`):arabic()?`${p.capacity} وحدة طاقة مخزّنة`:`${p.capacity} energy storage`}</small></span></label>`).join('')}</div></fieldset>`).join('');
}
renderLoadoutChoices();
$('#loadout').addEventListener('change',e=>{loadout[e.target.name]=e.target.value;renderLoadout();});
$('#configure').onclick=()=>{location.href='shipyard.html?country='+encodeURIComponent(countryId);};$('#quick-start').onclick=()=>{customCraft=null;setMode('hangar');renderLoadout();};$('#retry').onclick=()=>{if(customCraft){location.href='shipyard.html?edit=flight';return;}setMode('hangar');renderLoadout();};$('#launch-game').onclick=()=>{flight=createFlight(loadout,null,countryId);paused=false;setMode('flight');canvas.focus();};$('#pause').onclick=()=>setPause(true);$('#resume').onclick=()=>setPause(false);
$('#help').onclick=()=>{setPause(true);$('#instructions').showModal();};$('#close-help').onclick=()=>$('#instructions').close();
window.addEventListener('keydown',e=>{if(mode!=='flight'||$('#instructions').open)return;const k=e.key.length===1?e.key.toLowerCase():e.key;if([' ','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','a','s','d','e'].includes(k)){e.preventDefault();if(!paused)keys.add(k);}if(k==='Escape')setPause(!paused);});window.addEventListener('keyup',e=>keys.delete(e.key.length===1?e.key.toLowerCase():e.key));window.addEventListener('blur',()=>setPause(true));document.addEventListener('visibilitychange',()=>{if(document.hidden)setPause(true);});
for(const b of document.querySelectorAll('[data-hold],[data-move]')){const off=()=>{if(b.dataset.hold)hold[b.dataset.hold]=false;else touch.delete(b.dataset.move);b.classList.remove('active');};b.addEventListener('pointerdown',e=>{if(paused||mode!=='flight')return;e.preventDefault();if(e.isTrusted)b.setPointerCapture(e.pointerId);if(b.dataset.hold)hold[b.dataset.hold]=true;else touch.add(b.dataset.move);b.classList.add('active');});b.addEventListener('pointerup',off);b.addEventListener('pointercancel',off);b.addEventListener('lostpointercapture',off);}
resize();requestAnimationFrame(frame);

if(new URLSearchParams(location.search).has('custom')){try{customCraft=validateCraft(JSON.parse(sessionStorage.getItem('missionforge.flightCraft')||'null'));if(!customCraft)throw Error('Missing design');flight=createFlight(initialLoadout,customCraft,countryId);paused=false;setMode('flight');canvas.focus();}catch{customCraft=null;setMode('briefing');document.querySelector('.footnote').textContent=T('This design could not be loaded. Open the workshop and launch a connected craft.');}}

window.addEventListener('missionforge-language-change',()=>{renderCountries();renderLoadoutChoices();renderLoadout();routeCache='';if(mode==='flight')updateHUD();if(mode==='finish')renderFinish();});
