import {analyzeCraft} from './craft.js';
import {missionSites,isObscured,getCountry} from './country-missions.js';
// AI-assisted educational arcade model. Units and times are deliberately scaled.
export const equipment={sensor:{wide:{name:'Wide-field camera',cost:20,mass:8,scan:3,power:4},precision:{name:'Precision imager',cost:35,mass:18,scan:2,power:7}},solar:{compact:{name:'Compact wings',cost:15,mass:6,charge:3},extended:{name:'Extended wings',cost:25,mass:12,charge:5}},battery:{light:{name:'Light battery',cost:10,mass:4,capacity:55},endurance:{name:'Endurance battery',cost:25,mass:9,capacity:90}}};
export const initialLoadout={sensor:'wide',solar:'compact',battery:'light'};
export function stats(loadout){const parts=Object.entries(equipment).map(([key,v])=>{if(!v[loadout[key]])throw new Error('Invalid loadout');return v[loadout[key]];});return {cost:30+parts.reduce((v,p)=>v+p.cost,0),mass:10+parts.reduce((v,p)=>v+p.mass,0),capacity:parts[2].capacity,charge:parts[1].charge,scan:parts[0].scan,scanPower:parts[0].power};}
export function createFlight(loadout,craft=null,countryId='morocco'){
 const analysis=craft?analyzeCraft(craft):null;
 if(analysis&&!analysis.ready)throw new Error('Spacecraft is not launch-ready');
 const spec=analysis?analysis.spec:stats(loadout);
 if(!craft&&spec.cost>105)throw new Error('Launch budget exceeded');
 const country=getCountry(countryId),sites=missionSites(countryId),first=sites[0];
 return {
  countryId:Object.keys({morocco:1,turkiye:1,germany:1}).includes(countryId)?countryId:'morocco',
  spec,x:Math.max(-225,first.x-36),z:Math.min(185,first.z+20),
  shadowEdge:countryId==='turkiye'?-150:countryId==='germany'?-60:-95,
  energy:spec.capacity,health:spec.hull||3,time:240,elapsed:0,scan:0,scanTarget:null,link:0,
  stored:0,sent:0,required:sites.reduce((sum,site)=>sum+site.initial,0),
  invincible:0,status:'playing',
  message:'Scan every regional target, then send the data to the relay.',
  sites,relay:{x:207,z:-163},
  debris:[{x:countryId==='turkiye'?10:-60,z:countryId==='turkiye'?10:-45,phase:0},{x:74,z:105,phase:1.5},{x:183,z:-104,phase:3},{x:-195,z:-92,phase:4}],
  trail:[]
 };
}
export const distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
export const station={x:0,z:-170};
export function tick(s,input,dt){
 if(s.status!=='playing')return;
 dt=Math.max(0,Math.min(.05,dt));
 s.time=Math.max(0,s.time-dt);s.elapsed+=dt;s.invincible=Math.max(0,s.invincible-dt);
 let dx=input.x||0,dz=input.z||0;
 const length=Math.hypot(dx,dz);if(length>1){dx/=length;dz/=length;}
 const moving=Math.hypot(dx,dz)>.05;
 const speed=100/(1+s.spec.mass/90)*(s.spec.speedFactor||1);
 s.x=Math.max(-245,Math.min(245,s.x+dx*speed*dt));
 s.z=Math.max(-210,Math.min(210,s.z+dz*speed*dt));
 const shadow=s.x<s.shadowEdge;
 let consumption=(s.spec.bus??.7)+(moving?1.2:0);
 const target=s.sites.filter(p=>p.remaining>0).sort((a,b)=>distance(s,a)-distance(s,b)).find(p=>distance(s,p)<25);
 if(input.scan&&target&&!moving){
  if(s.scanTarget!==target.id){s.scan=0;s.scanTarget=target.id;}
  if(isObscured(s,target)){
   s.scan=0;s.message='Optical scan blocked by simulated clouds, haze or dust. Wait for clearer visibility.';
  }else{
   consumption+=s.spec.scanPower;s.scan+=dt;
   s.message=shadow?'Scanning in eclipse uses stored battery energy.':'Scanning regional target… hold position.';
   if(s.scan>=s.spec.scan){
    s.scan=0;target.remaining--;s.stored++;
    s.message=target.remaining?'Regional data packet acquired. Keep scanning for a second packet.':'Region scanned. Visit the next target or downlink at the relay.';
   }
  }
 }else{
  s.scan=0;s.scanTarget=null;
  if(input.scan)s.message=moving?'Stabilize before scanning: release movement controls.':'Move inside a target circle and hold SCAN to collect its data.';
 }
 const relay=s.relay||station;
 if(input.link&&distance(s,relay)<40&&!moving&&s.stored){
  consumption+=2;s.link+=dt;
  s.message='Downlink active. Stored data is becoming delivered science.';
  if(s.link>=1){s.link=0;s.stored--;s.sent++;}
 }else{
  s.link=0;if(input.link)s.message=s.stored?'Reach the relay ring and stop to send stored packets.':'No stored packets. Scan a region first.';
 }
 s.energy=Math.max(0,Math.min(s.spec.capacity,s.energy+((shadow?0:s.spec.charge)-consumption)*dt));
 for(const d of s.debris){
  d.x+=Math.cos(s.elapsed*.6+d.phase)*12*dt;
  d.z+=Math.sin(s.elapsed*.5+d.phase)*10*dt;
  if(distance(s,d)<22&&s.invincible<=0){s.health--;s.invincible=2;s.message='Debris impact! Give tumbling objects a wider berth.';}
 }
 if(s.sent>=s.required){s.status='won';s.message='All regional data packets delivered. Mission accomplished!';}
 else if(s.health<=0){s.status='lost';s.message='Spacecraft damaged beyond operation. Avoid debris and try a new route.';}
 else if(s.energy<=0){s.status='lost';s.message='Battery depleted. Spend more time in sunlight, or fit better power hardware.';}
 else if(s.time<=0){s.status='lost';s.message='Mission window closed. Plan a shorter route and downlink before time runs out.';}
}
