// AI-assisted engineering flight classroom. Uses the same simulation as the builder.
import {simulate,objectives,catalog} from './simulation.js';
const T=s=>window.MissionLang.t(s),arabic=()=>window.MissionLang.isArabic();
const questions=[
 {title:'Launch readiness',ids:['budget','mass'],prompt:'Your spacecraft is too heavy for the launch allowance. What actually fixes this?',answers:['Add a larger battery','Reduce mass or select a higher-capacity launcher','Choose a faster radio'],correct:1,lesson:'The launch allowance constrains spacecraft mass. Batteries and radios also contribute mass; more hardware is not automatically better.'},
 {title:'Sunlight operations',ids:['energy'],prompt:'The satellite consumes more energy each orbit than it generates. Will a larger battery fix that indefinitely?',answers:['Yes, storage creates extra energy','Yes, a battery replaces the solar array','No — increase generation or reduce consumption'],correct:2,lesson:'Energy balance and energy storage are different constraints. A larger battery delays depletion, but cannot fix a recurring energy deficit.'},
 {title:'Into Earth’s shadow',ids:['battery'],prompt:'Why can an energy-positive spacecraft still fail in eclipse?',answers:['It may lack enough stored energy for the dark interval','Solar panels keep generating full power in darkness','Its launch budget changes in orbit'],correct:0,lesson:'During eclipse, the model uses stored battery energy. Required storage = average power × eclipse duration. Power in W multiplied by time in hours gives energy in Wh.'},
 {title:'Science downlink',ids:['data','science'],prompt:'You doubled the radio data rate. What else determines how much data reaches Earth?',answers:['Only the satellite’s name','Battery mass alone','Ground-contact duration and a suitable scientific instrument'],correct:2,lesson:'Returned data = link rate × contact duration. Useful science also requires the right instrument: thermal sensing and optical imagery answer different questions.'}
];
let design,step=0,answered=false,correctCount=0,chosen=-1,finished=false;
const completed=new Set();
const dialog=document.createElement('dialog');dialog.id='cockpit';dialog.setAttribute('aria-labelledby','flight-title');
dialog.innerHTML=`<div class="cockpit-top"><span>${T('ATLAS TECH / FLIGHT ACADEMY')}</span><button id="close-flight" aria-label="${T('Close flight academy')}">✕</button></div><div class="flight-scene" aria-hidden="true"><div class="flight-earth"></div><div class="flight-track"><span>🛰</span></div><div class="scene-caption">${T('ILLUSTRATIVE ORBIT · TIME COMPRESSED')}</div></div><div class="cockpit-body"><p id="flight-phase" class="eyebrow"></p><h2 id="flight-title"></h2><p id="flight-fact"></p><div id="flight-question"></div><p id="flight-feedback" role="status"></p><button id="next-flight" class="launch-button" disabled>${T('Continue →')}</button></div>`;
document.body.append(dialog);
const q=s=>dialog.querySelector(s);
function localizedCheck(c,r){if(!arabic())return c.message;
 switch(c.id){
  case 'budget':return `تكلفة التصميم ${r.cost} من أصل ${r.budget} رصيد.`;
  case 'mass':return `الكتلة ${r.mass} كغ، والحد المسموح ${r.launchLimit} كغ.`;
  case 'energy':return `الطاقة المولّدة ${r.energyGenerated.toFixed(1)} واط·ساعة، والمطلوبة ${r.energyNeeded.toFixed(1)}.`;
  case 'battery':return `البطارية ${catalog.battery.find(x=>x.id===design.battery).capacity} واط·ساعة، والمطلوب أثناء الظل ${r.eclipseNeeded.toFixed(1)}.`;
  case 'data':return `البيانات المُرسلة ${r.dataReturned} من أصل ${objectives[design.objective].data} وحدة.`;
  default:return T(c.message);
 }
}
function showStep(reset=true){
 if(reset){answered=false;chosen=-1;}
 const stage=questions[step];const r=simulate(design);const checks=r.checks.filter(c=>stage.ids.includes(c.id));
 q('#flight-phase').textContent=arabic()?`أكاديمية الطيران / المرحلة ${step+1} من 4`:`FLIGHT ACADEMY / ${step+1} OF 4`;
 q('#flight-title').textContent=T(stage.title);
 q('#flight-fact').textContent=checks.map(c=>`${c.pass?'✓':'!'} ${localizedCheck(c,r)}`).join(' ');
 q('.flight-scene').dataset.phase=String(step);
 q('#flight-question').innerHTML=`<h3>${T(stage.prompt)}</h3><div class="flight-answers">${stage.answers.map((a,i)=>`<button data-answer="${i}">${String.fromCharCode(65+i)} / ${T(a)}</button>`).join('')}</div>`;
 q('#next-flight').textContent=T(step===3?'Finish flight academy →':'Continue →');
 q('#next-flight').disabled=!answered;
 if(answered){
  for(const button of q('#flight-question').querySelectorAll('button')){const idx=Number(button.dataset.answer);button.disabled=true;if(idx===stage.correct)button.classList.add('answer-correct');else if(idx===chosen)button.classList.add('answer-wrong');}
  q('#flight-feedback').textContent=(chosen===stage.correct?T('Exactly. '):T('Here’s the engineering lesson. '))+T(stage.lesson);
 }else q('#flight-feedback').textContent=T('Predict the engineering outcome. Choose an answer to continue.');
}
function showDebrief(){const r=simulate(design);q('#flight-phase').textContent=T('FLIGHT ACADEMY / DEBRIEF');q('#flight-title').textContent=T(r.success?'Mission accomplished.':'Your next design starts here.');q('#flight-fact').textContent=arabic()?`${correctCount}/4 إجابات هندسية صحيحة · ${r.passed}/6 اختبارات تصميم ناجحة · ${completed.size}/3 شارات مكتسبة في هذه الجلسة.`:`${correctCount}/4 engineering answers correct · ${r.passed}/6 design constraints passed. ${completed.size}/3 mission badges earned this session.`;q('#flight-question').innerHTML=`<div class="academy-badge">${r.success?'✦ '+T(objectives[design.objective].name):'↻ '+T('Design iteration needed')}</div><p>${T(r.success?'Try a different science objective to earn another mission badge.':'Return to the builder and use the failed-check feedback to improve the spacecraft.')}</p>`;q('#flight-feedback').textContent=T('Badges reward viable designs. Quiz answers measure learning and never change the physics.');q('#next-flight').hidden=true;document.querySelector('#academy-progress').textContent=arabic()?`${completed.size}/3 شارات مهمة · آخر اختبار ${correctCount}/4`:`${completed.size}/3 mission badges · Latest quiz ${correctCount}/4`;}
q('#flight-question').addEventListener('click',e=>{const b=e.target.closest('[data-answer]');if(!b||answered)return;answered=true;chosen=Number(b.dataset.answer);if(chosen===questions[step].correct)correctCount++;showStep(false);});
q('#next-flight').addEventListener('click',()=>{if(!answered)return;if(step<3){step++;showStep();return;}const r=simulate(design);if(r.success)completed.add(design.objective);finished=true;showDebrief();});
q('#close-flight').addEventListener('click',()=>dialog.close());
export function openAcademy(current){design={...current};step=0;correctCount=0;finished=false;q('#next-flight').hidden=false;showStep();dialog.showModal();}
window.addEventListener('missionforge-language-change',()=>{q('.cockpit-top span').textContent=T('ATLAS TECH / FLIGHT ACADEMY');q('#close-flight').setAttribute('aria-label',T('Close flight academy'));q('.scene-caption').textContent=T('ILLUSTRATIVE ORBIT · TIME COMPRESSED');if(dialog.open){if(finished)showDebrief();else showStep(false);}});
