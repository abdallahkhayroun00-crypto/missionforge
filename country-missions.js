// Geographic waypoints are approximate real city coordinates; clouds and hazards are fictional educational scenarios.
// The game is a route-planning arcade metaphor, not a physically accurate orbital dynamics simulator.
export const countries={
 morocco:{
  name:'Morocco',ar:'المغرب',flag:'🇲🇦',subtitle:'Atlantic coast & southern landscapes',subtitleAr:'الساحل الأطلسي ومشاهد الجنوب',
  bounds:{west:-17.4,east:-0.8,south:20.8,north:36.15},
  relay:{name:'Tangier',ar:'طنجة',lat:35.67,lon:-5.81},
  palette:['#305c61','#1f414b'],
  regions:[
   {id:'dakhla',name:'Dakhla',ar:'الداخلة',lat:23.72,lon:-15.95,task:'Observe the coastal lagoon',taskAr:'رصد التغيرات في البحيرة الساحلية',hazard:'haze',phase:20,period:38,blockedFor:12},
   {id:'guelmim',name:'Guelmim',ar:'كلميم',lat:28.99,lon:-10.06,task:'Map desert-edge land cover',taskAr:'رسم خريطة الغطاء الأرضي عند أطراف الصحراء',hazard:'dust',phase:10,period:33,blockedFor:11},
   {id:'el-jadida',name:'El Jadida',ar:'الجديدة',lat:33.23,lon:-8.50,task:'Monitor changes along the coast',taskAr:'متابعة التغيّرات على امتداد الساحل',hazard:'cloud',phase:14,period:32,blockedFor:12},
   {id:'casablanca',name:'Casablanca',ar:'الدار البيضاء',lat:33.57,lon:-7.59,task:'Study the expanding urban area',taskAr:'دراسة توسّع المجال الحضري',hazard:'cloud',phase:3,period:30,blockedFor:9}
  ]
 },
 turkiye:{
  name:'Türkiye',ar:'تركيا',flag:'🇹🇷',subtitle:'Cities, coasts & land cover',subtitleAr:'المدن والسواحل والغطاء الأرضي',
  bounds:{west:25.5,east:45.2,south:35.4,north:42.65},relay:{name:'Trabzon',ar:'طرابزون',lat:41.00,lon:39.74},palette:['#365d62','#1f4548'],
  regions:[
   {id:'izmir',name:'İzmir',ar:'إزمير',lat:38.42,lon:27.14,task:'Map the Aegean coastline',taskAr:'رسم خريطة الساحل على بحر إيجة',hazard:'cloud',phase:16,period:34,blockedFor:11},
   {id:'istanbul',name:'Istanbul',ar:'إسطنبول',lat:41.01,lon:28.95,task:'Observe urban growth',taskAr:'رصد توسّع المناطق العمرانية',hazard:'haze',phase:9,period:30,blockedFor:10},
   {id:'ankara',name:'Ankara',ar:'أنقرة',lat:39.93,lon:32.86,task:'Survey land-use patterns',taskAr:'مسح أنماط استخدام الأراضي',hazard:'dust',phase:19,period:36,blockedFor:11},
   {id:'antalya',name:'Antalya',ar:'أنطاليا',lat:36.91,lon:30.70,task:'Track coastal development',taskAr:'متابعة التطوّر العمراني الساحلي',hazard:'cloud',phase:4,period:32,blockedFor:10}
  ]
 },
 germany:{
  name:'Germany',ar:'ألمانيا',flag:'🇩🇪',subtitle:'City systems & landscapes',subtitleAr:'المدن والأنظمة البيئية',
  bounds:{west:5.5,east:15.5,south:47.0,north:55.3},relay:{name:'Bremen',ar:'بريمن',lat:53.08,lon:8.80},palette:['#2c5862','#1e3b49'],
  regions:[
   {id:'hamburg',name:'Hamburg',ar:'هامبورغ',lat:53.55,lon:9.99,task:'Monitor the port and estuary',taskAr:'رصد الميناء ومصبّ النهر',hazard:'cloud',phase:4,period:30,blockedFor:12},
   {id:'berlin',name:'Berlin',ar:'برلين',lat:52.52,lon:13.41,task:'Observe urban land cover',taskAr:'رصد الغطاء الأرضي داخل المدينة',hazard:'haze',phase:17,period:35,blockedFor:10},
   {id:'frankfurt',name:'Frankfurt',ar:'فرانكفورت',lat:50.11,lon:8.68,task:'Map the transport corridors',taskAr:'رسم خريطة محاور النقل',hazard:'cloud',phase:13,period:32,blockedFor:10},
   {id:'munich',name:'Munich',ar:'ميونخ',lat:48.14,lon:11.58,task:'Compare urban and green zones',taskAr:'مقارنة المناطق العمرانية والمساحات الخضراء',hazard:'cloud',phase:7,period:33,blockedFor:11}
  ]
 }
};
export function getCountry(id){return countries[id]||countries.morocco;}
export function pointFor(country,lat,lon){
 const {west,east,south,north}=country.bounds;
 return {x:-210+(lon-west)/(east-west)*420,z:-175+(north-lat)/(north-south)*350};
}
export function missionSites(countryId){
 const country=getCountry(countryId);
 return country.regions.map(r=>({...r,...pointFor(country,r.lat,r.lon),remaining:2,initial:2}));
}
export function isObscured(flight,site){
 return flight && site.remaining>0 && ((flight.elapsed+site.phase)%site.period)<site.blockedFor*1.3;
}
export function localizedCountry(country,arabic){return arabic?country.ar:country.name;}
export function localizedRegion(site,arabic){return arabic?site.ar:site.name;}
export function localizedTask(site,arabic){return arabic?site.taskAr:site.task;}
export function hazardName(hazard,arabic){
 const words={cloud:['Cloud cover','غيوم كثيفة'],haze:['Coastal haze','ضباب ساحلي'],dust:['Dust plume','غبار عالق']};
 return (words[hazard]||words.cloud)[arabic?1:0];
}
