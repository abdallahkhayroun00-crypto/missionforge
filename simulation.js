// AI-assisted code. All component values are illustrative educational assumptions.
export const catalog = {
  payload: [
    {id:'survey',name:'Survey camera',detail:'Wide coverage, modest detail',cost:16,mass:8,power:12,science:65},
    {id:'precision',name:'Precision imager',detail:'Sharper images, greater resource demand',cost:32,mass:18,power:30,science:95},
    {id:'thermal',name:'Thermal sensor',detail:'Observe surface heat and wildfire signatures',cost:25,mass:12,power:22,science:85}
  ],
  solar: [
    {id:'compact',name:'Compact array',detail:'Lightweight • 35 W in sunlight',cost:10,mass:6,generation:35},
    {id:'extended',name:'Extended array',detail:'More power • 75 W in sunlight',cost:20,mass:12,generation:75}
  ],
  battery: [
    {id:'small',name:'Standard battery',detail:'15 Wh usable storage',cost:6,mass:4,capacity:15},
    {id:'large',name:'Endurance battery',detail:'35 Wh usable storage',cost:12,mass:9,capacity:35}
  ],
  radio: [
    {id:'basic',name:'Basic radio',detail:'Low demand • 1 data unit per contact minute',cost:6,mass:3,power:5,rate:1},
    {id:'fast',name:'High-rate radio',detail:'More throughput • 3 data units per minute',cost:14,mass:6,power:12,rate:3}
  ],
  launcher: [
    {id:'rideshare',name:'Rideshare launch',detail:'Affordable • 52 kg payload allowance',cost:18,limit:52},
    {id:'dedicated',name:'Dedicated launch',detail:'Flexible • 90 kg payload allowance',cost:35,limit:90}
  ],
  orbit: [
    {id:'low',name:'Low orbit · 400 km',detail:'Sharper imagery • shorter ground contacts',altitude:400,contact:7,resolution:1},
    {id:'high',name:'Higher orbit · 700 km',detail:'Longer contacts • less surface detail',altitude:700,contact:12,resolution:0.7}
  ]
};
export const objectives = {
  mapping:{name:'Map changing coastlines',description:'Return detailed optical images to track coastal change.',budget:125,data:20,preferred:'precision'},
  wildfire:{name:'Track wildfire heat',description:'Return thermal observations to help identify surface heat.',budget:125,data:15,preferred:'thermal'},
  survey:{name:'Survey Earth’s surface',description:'Return broad optical observations with an affordable spacecraft.',budget:100,data:10,preferred:'survey'}
};
export const defaultDesign = {objective:'mapping',payload:'precision',solar:'compact',battery:'small',radio:'basic',launcher:'rideshare',orbit:'low'};
export function simulate(design) {
  const objective=objectives[design.objective];
  if(!objective) throw new Error('Unknown mission objective');
  const c=Object.fromEntries(Object.entries(catalog).map(([key,items])=>{
    const item=items.find(x=>x.id===design[key]);
    if(!item) throw new Error(`Unknown ${key} option`);
    return [key,item];
  }));
  const cost=Object.values(c).reduce((n,x)=>n+(x.cost||0),8);
  const mass=Object.values(c).reduce((n,x)=>n+(x.mass||0),10);
  const period=2*Math.PI*Math.sqrt((6371+c.orbit.altitude)**3/398600.4418)/60;
  const eclipse=period*Math.asin(6371/(6371+c.orbit.altitude))/Math.PI;
  const sunlight=period-eclipse;
  // Simplified orbit-average demand: bus always on, payload 40%, radio 10%.
  const demand=8+c.payload.power*0.4+c.radio.power*0.1;
  const energyGenerated=c.solar.generation*sunlight/60*0.8;
  const energyNeeded=demand*period/60;
  const eclipseNeeded=demand*eclipse/60;
  const dataReturned=c.radio.rate*c.orbit.contact;
  const compatible=design.objective==='survey' ? c.payload.id!=='thermal' : c.payload.id===objective.preferred;
  const checks=[
    {id:'budget',pass:cost<=objective.budget,title:'Mission budget',message:`${cost} / ${objective.budget} budget credits.`,fix:'Choose less costly hardware or a rideshare launch.'},
    {id:'mass',pass:mass<=c.launcher.limit,title:'Launch capacity',message:`${mass} / ${c.launcher.limit} kg launch allowance.`,fix:'Reduce spacecraft mass or choose a dedicated launch.'},
    {id:'energy',pass:energyGenerated>=energyNeeded,title:'Energy balance',message:`${energyGenerated.toFixed(1)} Wh generated vs ${energyNeeded.toFixed(1)} Wh used per orbit.`,fix:'Choose the extended solar array or reduce equipment power demand.'},
    {id:'battery',pass:c.battery.capacity>=eclipseNeeded,title:'Survive the eclipse',message:`${c.battery.capacity} Wh stored vs ${eclipseNeeded.toFixed(1)} Wh needed in darkness.`,fix:'Choose the endurance battery or reduce power demand.'},
    {id:'data',pass:dataReturned>=objective.data,title:'Return science data',message:`${dataReturned} / ${objective.data} data units returned per orbit.`,fix:'Choose a high-rate radio or an orbit with longer contact time.'},
    {id:'science',pass:compatible,title:'Scientific compatibility',message:compatible?'The instrument supports your scientific objective.':'The instrument does not match the required observations.',fix:`Select the ${catalog.payload.find(x=>x.id===objective.preferred).name.toLowerCase()} for this objective.`}
  ];
  const success=checks.every(x=>x.pass);
  const science=Math.round(c.payload.science*c.orbit.resolution*(compatible?1:0.2)*Math.min(1,dataReturned/objective.data));
  return {cost,mass,period,eclipse,demand,energyGenerated,energyNeeded,eclipseNeeded,dataReturned,checks,success,science,passed:checks.filter(x=>x.pass).length,budget:objective.budget,launchLimit:c.launcher.limit};
}
