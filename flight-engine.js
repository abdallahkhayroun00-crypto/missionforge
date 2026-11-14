import {analyzeCraft} from './craft.js';
import {missionSites,isObscured,getCountry,pointFor} from './country-missions.js';
// Educational mission model: time, distances, eclipses, and threats are scaled
// for gameplay. City waypoints are real approximate geographic coordinates.
export const equipment={
 sensor:{wide:{name:'Wide-field camera',cost:20,mass:8,scan:3,power:4},precision:{name:'Precision imager',cost:35,mass:18,scan:2,power:7}},
 solar:{compact:{name:'Compact wings',cost:15,mass:6,charge:3},extended:{name:'Extended wings',cost:25,mass:12,charge:5}},
 battery:{light:{name:'Light battery',cost:10,mass:4,capacity:55},endurance:{name:'Endurance battery',cost:25,mass:9,capacity:90}}
};
export const initialLoadout={sensor:'wide',solar:'compact',battery:'light'};
export function stats(loadout){
 const fitted=Object.entries(equipment).map(([kind,options])=>{
  if(!options[loadout[kind]])throw new Error('Invalid loadout');
  return options[loadout[kind]];
 });
 return {cost:30+fitted.reduce((n,p)=>n+p.cost,0),mass:10+fitted.reduce((n,p)=>n+p.mass,0),
  capacity:fitted[2].capacity,charge:fitted[1].charge,scan:fitted[0].scan,scanPower:fitted[0].power};
}
export const distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
// Night/day is a mission-time cycle, not a fake country-specific shadow strip.
export function isEclipse(s){return (s.elapsed%131)>=115;}
export function createFlight(loadout,craft=null,countryId='morocco'){
 const analysis=craft?analyzeCraft(craft):null;
 if(analysis&&!analysis.ready)throw new Error('Spacecraft is not launch-ready');
 const spec=analysis?analysis.spec:stats(loadout);
 if(!craft&&spec.cost>105)throw new Error('Launch budget exceeded');
 const country=getCountry(countryId),sites=missionSites(countryId),first=sites[0];
 const relay={...pointFor(country,country.relay.lat,country.relay.lon),name:country.relay.name,ar:country.relay.ar};
 const targets=sites.reduce((n,site)=>n+site.initial,0);
 const hazard=(a,b,offset,phase)=>{const dx=b.x-a.x,dz=b.z-a.z,len=Math.hypot(dx,dz)||1;return {x:(a.x+b.x)/2-dz/len*offset,z:(a.z+b.z)/2+dx/len*offset,phase};};
 return {
  countryId:countryId in {morocco:1,turkiye:1,germany:1}?countryId:'morocco',
  spec,x:Math.max(-225,first.x-25),z:Math.min(180,first.z+15),
  headingX:0,headingZ:-1,
  eclipse:false,energy:spec.capacity,health:spec.hull||3,time:300,
  elapsed:0,scan:0,scanTarget:null,link:0,
  stored:0,sent:0,required:targets,invincible:0,status:'playing',
  message:'Scan every regional target, then send the data to the relay.',
  sites,relay,
  debris:[
   hazard(sites[0],sites[1],28,0.7),
   hazard(sites[1],sites[2],-28,2.2),
   hazard(sites[2],relay,50,4)
  ],
  trail:[],trailClock:0
 };
}
export const station={x:0,z:-170};
export function tick(s,input,dt){
 if(s.status!=='playing')return;
 dt=Math.max(0,Math.min(.05,dt));
 s.time=Math.max(0,s.time-dt);
 s.elapsed+=dt;
 s.eclipse=isEclipse(s);
 s.invincible=Math.max(0,s.invincible-dt);
 let dx=input.x||0,dz=input.z||0;
 const length=Math.hypot(dx,dz);if(length>1){dx/=length;dz/=length;}
 const moving=Math.hypot(dx,dz)>.05;
 if(moving){s.headingX=dx;s.headingZ=dz;}
 const speed=8.2/(1+s.spec.mass/90)*(s.spec.speedFactor||1);
 s.x=Math.max(-237,Math.min(237,s.x+dx*speed*dt));
 s.z=Math.max(-198,Math.min(198,s.z+dz*speed*dt));
 if(moving){
  s.trailClock+=dt;
  if(s.trailClock>.34){s.trail.push({x:s.x,z:s.z});s.trailClock=0;if(s.trail.length>160)s.trail.shift();}
 }
 let consumption=(s.spec.bus??.7)+(moving?1.35:0.2);
 const target=s.sites.filter(site=>site.remaining>0).find(site=>distance(s,site)<20);
 if(input.scan&&target&&!moving){
  if(s.scanTarget!==target.id){s.scan=0;s.scanTarget=target.id;}
  if(isObscured(s,target)){
   s.scan=0;
   s.message='Optical scan blocked by simulated clouds, haze or dust. Wait for clearer visibility.';
  }else{
   consumption+=s.spec.scanPower*.72;
   s.scan+=dt;
   s.message=s.eclipse?'Scanning in eclipse uses stored battery energy.':'Scanning regional target… hold position.';
   const scanTime=Math.max(3.8,s.spec.scan*1.85);
   if(s.scan>=scanTime){
    s.scan=0;target.remaining--;s.stored++;
    s.message=target.remaining?'Regional data packet acquired. Keep scanning for a second packet.':'Region scanned. Visit the next target or downlink at the relay.';
   }
  }
 }else{
  s.scan=0;s.scanTarget=null;
  if(input.scan)s.message=moving?'Stabilize before scanning: release movement controls.':'Move inside a target circle and hold SCAN to collect its data.';
 }
 if(input.link&&distance(s,s.relay)<26&&!moving&&s.stored){
  consumption+=2.1;
  s.link+=dt;s.message='Downlink active. Stored data is becoming delivered science.';
  if(s.link>=1.9){s.link=0;s.stored--;s.sent++;}
 }else{
  s.link=0;
  if(input.link)s.message=s.stored?'Reach the relay ring and stop to send stored packets.':'No stored packets. Scan a region first.';
 }
 s.energy=Math.max(0,Math.min(s.spec.capacity,s.energy+((s.eclipse?0:s.spec.charge)-consumption)*dt));
 // Slow moving hazards are arcade representations of debris, not known tracks.
 for(const d of s.debris){
  d.x+=Math.cos(s.elapsed*.24+d.phase)*4*dt;
  d.z+=Math.sin(s.elapsed*.27+d.phase)*3*dt;
  if(distance(s,d)<12&&s.invincible<=0){
   s.health--;s.invincible=5.5;
   s.message='Debris impact! Give tumbling objects a wider berth.';
  }
 }
 if(s.sent>=s.required){s.status='won';s.message='All regional data packets delivered. Mission accomplished!';}
 else if(s.health<=0){s.status='lost';s.message='Spacecraft damaged beyond operation. Avoid debris and try a new route.';}
 else if(s.energy<=0){s.status='lost';s.message='Battery depleted. Spend more time in sunlight, or fit better power hardware.';}
 else if(s.time<=0){s.status='lost';s.message='Mission window closed. Plan a shorter route and downlink before time runs out.';}
}
