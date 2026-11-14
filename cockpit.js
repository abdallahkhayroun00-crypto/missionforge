// AI-assisted engineering flight classroom. Uses the same simulation as the builder.
import {simulate,objectives} from './simulation.js';
const questions=[
 {title:'Launch readiness',ids:['budget','mass'],prompt:'Your spacecraft is too heavy for the launch allowance. What actually fixes this?',answers:['Add a larger battery','Reduce mass or select a higher-capacity launcher','Choose a faster radio'],correct:1,lesson:'The launch allowance constrains spacecraft mass. Batteries and radios also contribute mass; more hardware is not automatically better.'},
 {title:'Sunlight operations',ids:['energy'],prompt:'The satellite consumes more energy each orbit than it generates. Will a larger battery fix that indefinitely?',answers:['Yes, storage creates extra energy','Yes, a battery replaces the solar array','No — increase generation or reduce consumption'],correct:2,lesson:'Energy balance and energy storage are different constraints. A larger battery delays depletion, but cannot fix a recurring energy deficit.'},
 {title:'Into Earth’s shadow',ids:['battery'],prompt:'Why can an energy-positive spacecraft still fail in eclipse?',answers:['It may lack enough stored energy for the dark interval','Solar panels keep generating full power in darkness','Its launch budget changes in orbit'],correct:0,lesson:'During eclipse, the model uses stored battery energy. Required storage = average power × eclipse duration. Power in W multiplied by time in hours gives energy in Wh.'},
 {title:'Science downlink',ids:['data','science'],prompt:'You doubled the radio data rate. What else determines how much data reaches Earth?',answers:['Only the satellite’s name','Battery mass alone','Ground-contact duration and a suitable scientific instrument'],correct:2,lesson:'Returned data = link rate × contact duration. Useful science also requires the right instrument: thermal sensing and optical imagery answer different questions.'}
];
let design,step=0,answered=false,correctCount=0;
const completed=new Set();
const dialog=document.createElement('dialog');dialog.id='cockpit';dialog.setAttribute('aria-labelledby','flight-title');
dialog.innerHTML=`<div class="cockpit-top"><span>ATLAS TECH / FLIGHT ACADEMY</span><button id="close-flight" aria-label="Close flight academy">✕</button></div><div class="flight-scene" aria-hidden="true"><div class="flight-earth"></div><div class="flight-track"><span>🛰</span></div><div class="scene-caption">ILLUSTRATIVE ORBIT · TIME COMPRESSED</div></div><div class="cockpit-body"><p id="flight-phase" class="eyebrow"></p><h2 id="flight-title"></h2><p id="flight-fact"></p><div id="flight-question"></div><p id="flight-feedback" role="status"></p><button id="next-flight" class="launch-button" disabled>Continue →</button></div>`;
document.body.append(dialog);
const q=s=>dialog.querySelector(s);
function showStep(){
 answered=false;const stage=questions[step];const r=simulate(design);const checks=r.checks.filter(c=>stage.ids.includes(c.id));
 q('#flight-phase').textContent=`FLIGHT ACADEMY / ${step+1} OF 4`;
 q('#flight-title').textContent=stage.title;
 q('#flight-fact').textContent=checks.map(c=>`${c.pass?'✓':'!'} ${c.message}`).join(' ');
 q('.flight-scene').dataset.phase=String(step);
 q('#flight-question').innerHTML=`<h3>${stage.prompt}</h3><div class="flight-answers">${stage.answers.map((a,i)=>`<button data-answer="${i}">${String.fromCharCode(65+i)} / ${a}</button>`).join('')}</div>`;
 q('#flight-feedback').textContent='Predict the engineering outcome. Choose an answer to continue.';
 q('#next-flight').disabled=true;q('#next-flight').textContent=step===3?'Finish flight academy →':'Continue →';
}
q('#flight-question').addEventListener('click',e=>{const b=e.target.closest('[data-answer]');if(!b||answered)return;answered=true;const stage=questions[step],right=Number(b.dataset.answer)===stage.correct;if(right)correctCount++;b.classList.add(right?'answer-correct':'answer-wrong');for(const a of q('#flight-question').querySelectorAll('button')){a.disabled=true;if(Number(a.dataset.answer)===stage.correct)a.classList.add('answer-correct');}q('#flight-feedback').textContent=(right?'Exactly. ':'Here’s the engineering lesson. ')+stage.lesson;q('#next-flight').disabled=false;});
q('#next-flight').addEventListener('click',()=>{if(!answered)return;if(step<3){step++;showStep();return;}const r=simulate(design);if(r.success)completed.add(design.objective);q('#flight-phase').textContent='FLIGHT ACADEMY / DEBRIEF';q('#flight-title').textContent=r.success?'Mission accomplished.':'Your next design starts here.';q('#flight-fact').textContent=`${correctCount}/4 engineering answers correct · ${r.passed}/6 design constraints passed. ${completed.size}/3 mission badges earned this session.`;q('#flight-question').innerHTML=`<div class="academy-badge">${r.success?'✦ '+objectives[design.objective].name:'↻ Design iteration needed'}</div><p>${r.success?'Try a different science objective to earn another mission badge.':'Return to the builder and use the failed-check feedback to improve the spacecraft.'}</p>`;q('#flight-feedback').textContent='Badges reward viable designs. Quiz answers measure learning and never change the physics.';q('#next-flight').hidden=true;document.querySelector('#academy-progress').textContent=`${completed.size}/3 mission badges · Latest quiz ${correctCount}/4`;});
q('#close-flight').addEventListener('click',()=>dialog.close());
export function openAcademy(current){design={...current};step=0;correctCount=0;q('#next-flight').hidden=false;showStep();dialog.showModal();}
