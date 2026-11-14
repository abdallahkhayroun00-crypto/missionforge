import {outlines,moroccoContinuousOutline} from './country-outlines.js';
import {getCountry,pointFor,isObscured,localizedRegion,localizedCountry} from './country-missions.js';

// Dedicated north-up atlas view. Geography is anchored to approximate WGS84
// city coordinates. Gameplay traversal is intentionally NOT orbital physics.
const TWO_PI=Math.PI*2;
function roundRect(ctx,x,y,w,h,r){
  const q=Math.min(r,w/2,h/2);ctx.beginPath();
  ctx.moveTo(x+q,y);ctx.arcTo(x+w,y,x+w,y+h,q);ctx.arcTo(x+w,y+h,x,y+h,q);
  ctx.arcTo(x,y+h,x,y,q);ctx.arcTo(x,y,x+w,y,q);ctx.closePath();
}
// Fit the *whole* national silhouette (including the southern region), rather than
// using a fixed center/scale that accidentally shrank or cropped it on phones.
export function viewport(width,height,countryId,preview){
  const country=getCountry(countryId),mobile=width<820;
  const region=countryId==='morocco'
    ?moroccoContinuousOutline
    :outlines[countryId]||outlines.morocco;
  const coordinates=region.flat();
  const geoXs=coordinates.map(([lon,lat])=>pointFor(country,lat,lon).x);
  const geoYs=coordinates.map(([lon,lat])=>pointFor(country,lat,lon).z);
  const minX=Math.min(...geoXs),maxX=Math.max(...geoXs);
  const minY=Math.min(...geoYs),maxY=Math.max(...geoYs);
  // Approximate WGS84 aspect correction. The Morocco-only atlas gets a modest
  // portrait emphasis; every coastline vertex still remains inside the frame.
  const bounds=country.bounds;
  const meanLat=(bounds.north+bounds.south)*Math.PI/360;
  const geographicX=Math.cos(meanLat)*(350/(bounds.north-bounds.south))/(420/(bounds.east-bounds.west));
  const xFactor=countryId==='morocco'?geographicX*.95:geographicX;
  const yFactor=countryId==='morocco'?1.08:1;
  const panelWidth=mobile?0:width<1100?252:330;
  let left=mobile?14:26,right=mobile?width-14:width-panelWidth;
  let top=mobile?108:119,bottom=mobile?height-338:height-149;
  if(preview){
    left=mobile?18:width<1100?width*.51:width*.52;
    right=width-(mobile?18:35);
    top=mobile?106:88;bottom=height-(mobile?60:76);
  }
  const safeW=Math.max(80,right-left-22),safeH=Math.max(80,bottom-top-20);
  const scale=Math.max(.1,Math.min(safeW/((maxX-minX)*xFactor),safeH/((maxY-minY)*yFactor)));
  const centerX=(minX+maxX)/2,centerY=(minY+maxY)/2;
  const cx=(left+right)/2-centerX*scale*xFactor;
  const cy=(top+bottom)/2-centerY*scale*yFactor;
  return {
    mapW:(maxX-minX)*scale*xFactor,mapH:(maxY-minY)*scale*yFactor,scale,
    project(world){return {x:cx+world.x*scale*xFactor,y:cy+world.z*scale*yFactor};},
    fromGeo(country,lat,lon){return this.project(pointFor(country,lat,lon));},
    cx,cy,area:preview?width:mobile?width:right,mobile,height,top,bottom,
    rect:{left,right,top,bottom},
    shapeBounds:{minX,maxX,minY,maxY},
    // Exposed for deterministic geometry checks and regression tests.
    outlineBox(){
      const tl=this.project({x:minX,z:minY}),br=this.project({x:maxX,z:maxY});
      return {minX:Math.min(tl.x,br.x),maxX:Math.max(tl.x,br.x),minY:Math.min(tl.y,br.y),maxY:Math.max(tl.y,br.y)};
    }
  };
}
function traceOutline(ctx,shape,country,view){
  ctx.beginPath();
  for(const polygon of shape){
    polygon.forEach(([lon,lat],i)=>{
      const p=view.fromGeo(country,lat,lon);
      if(i===0)ctx.moveTo(p.x,p.y);else ctx.lineTo(p.x,p.y);
    });
    ctx.closePath();
  }
}
function drawCanvasBackdrop(ctx,width,height,country,ar,preview,view,seconds){
  const bg=ctx.createLinearGradient(0,0,width,height);
  bg.addColorStop(0,'#061b2b');bg.addColorStop(.65,'#0c2738');bg.addColorStop(1,'#102d38');
  ctx.fillStyle=bg;ctx.fillRect(0,0,width,height);
  const haze=ctx.createRadialGradient(view.cx,view.cy,70,view.cx,view.cy,Math.max(width,height)*.65);
  haze.addColorStop(0,'#28605b38');haze.addColorStop(1,'#07101d00');
  ctx.fillStyle=haze;ctx.fillRect(0,0,width,height);
  // Morocco uses a clean, uninterrupted silhouette without cartographic grid lines.
  if(country!==getCountry('morocco')){
    ctx.save();ctx.strokeStyle='#9bbdb810';ctx.lineWidth=1;
    for(let x=35;x<width;x+=48){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,height);ctx.stroke();}
    for(let y=20;y<height;y+=48){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(width,y);ctx.stroke();}
    ctx.restore();
  }
  ctx.save();ctx.fillStyle='#e9c797';ctx.textAlign='left';
  ctx.font='600 10px "DM Sans",sans-serif';
  const top=ar?'خريطة المهمة / أطلس فضائي':'MISSION CARTOGRAPHY / ATLAS 01';
  ctx.fillText(top,25,preview?38:70);
  ctx.fillStyle='#9ebfc8';ctx.font=ar?'500 12px "Noto Sans Arabic",sans-serif':'500 11px "DM Sans",sans-serif';
  ctx.fillText(ar?'المناطق الحقيقية · مسار تنقّل مبسّط':'REAL REGIONS  /  SIMULATED MISSION ROUTE',25,preview?59:89);
  ctx.restore();
}
function drawLand(ctx,countryId,country,view,seconds){
  // Draw a dissolved silhouette. Tracing two adjoining polygons used to
  // leave a solid internal line and a visible seam near Dakhla.
  const polygons=countryId==='morocco'
    ?moroccoContinuousOutline
    :outlines[countryId]||outlines.morocco;
  traceOutline(ctx,polygons,country,view);
  ctx.save();
  ctx.shadowColor='#6ecebb35';ctx.shadowBlur=34;
  const land=ctx.createLinearGradient(view.cx-view.mapW*.5,view.cy-view.mapH*.5,view.cx+view.mapW*.6,view.cy+view.mapH*.6);
  land.addColorStop(0,'#426f6b');land.addColorStop(.42,'#315d5e');land.addColorStop(1,'#243f46');
  ctx.fillStyle=land;ctx.fill();ctx.restore();
  ctx.save();
  traceOutline(ctx,polygons,country,view);
  ctx.clip();
  const light=ctx.createRadialGradient(view.cx-view.mapW*.32,view.cy-view.mapH*.3,5,view.cx,view.cy,view.mapH*.9);
  light.addColorStop(0,'#a9ccb81d');light.addColorStop(1,'#091e2828');ctx.fillStyle=light;
  ctx.fillRect(view.cx-view.mapW,view.cy-view.mapH,view.mapW*2,view.mapH*2);
  // Decorative graticules and crosshatching are omitted in the Morocco view.
  if(countryId!=='morocco'){
    // Contour-like diagonal strokes are purely decorative, not real terrain.
    ctx.strokeStyle='#cae6ce13';ctx.lineWidth=1;
    for(let n=-600;n<800;n+=35){
      ctx.beginPath();ctx.moveTo(view.cx+n,view.cy-view.mapH);
      ctx.lineTo(view.cx+n+view.mapH*.53,view.cy+view.mapH);ctx.stroke();
    }
    for(let lon=Math.ceil(country.bounds.west/2)*2;lon<country.bounds.east;lon+=2){
      const a=view.fromGeo(country,country.bounds.south,lon),b=view.fromGeo(country,country.bounds.north,lon);
      ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.strokeStyle='#c4e2d516';ctx.stroke();
    }
    for(let lat=Math.ceil(country.bounds.south/2)*2;lat<country.bounds.north;lat+=2){
      const a=view.fromGeo(country,lat,country.bounds.west),b=view.fromGeo(country,lat,country.bounds.east);
      ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.strokeStyle='#c4e2d516';ctx.stroke();
    }

  }
  ctx.restore();
  const outerLines=polygons;
  ctx.save();traceOutline(ctx,outerLines,country,view);ctx.lineWidth=2.6;ctx.strokeStyle='#c6e4ce99';ctx.stroke();
  traceOutline(ctx,outerLines,country,view);ctx.lineWidth=.75;ctx.strokeStyle='#ffffff55';ctx.stroke();ctx.restore();
}
function drawRoute(ctx,sites,relay,view,preview){
  const points=[...sites,relay].map(p=>view.project(p));
  if(points.length<2)return;
  ctx.save();ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));
  ctx.setLineDash([6,8]);ctx.lineWidth=1.7;ctx.strokeStyle='#f3d5a76a';ctx.stroke();
  ctx.setLineDash([]);ctx.fillStyle='#f9d6a2';
  for(const p of points){ctx.beginPath();ctx.arc(p.x,p.y,2.6,0,TWO_PI);ctx.fill();}
  ctx.restore();
}
function writePill(ctx,x,y,title,subtitle,ar,side,view,status){
  const font=ar?'600 12px "Noto Sans Arabic",sans-serif':'600 12px "DM Sans",sans-serif';
  const small=ar?'500 10px "Noto Sans Arabic",sans-serif':'500 10px "DM Sans",sans-serif';
  ctx.font=font;const tw=ctx.measureText(title).width;
  ctx.font=small;const sw=ctx.measureText(subtitle).width;
  const w=Math.max(100,Math.min(184,Math.max(tw,sw)+28)),h=43;
  let left=side==='left'?x-w-22:x+22,top=y-19;
  if(side==='top'){left=x-w*.5;top=y-66;}
  if(side==='bottom'){left=x-w*.5;top=y+23;}
  left=Math.max(12,Math.min(view.area-18-w,left));
  top=Math.max(120,Math.min(view.height-116-h,top));
  ctx.save();
  ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(side==='left'?left+w:side==='right'?left:Math.max(left,Math.min(left+w,x)),top+h/2);
  ctx.strokeStyle=status==='blocked'?'#f3c386cc':'#a9e4dacc';ctx.lineWidth=1;ctx.stroke();
  roundRect(ctx,left,top,w,h,8);
  ctx.fillStyle=status==='done'?'#18382eea':'#102b37f2';ctx.fill();
  ctx.strokeStyle=status==='blocked'?'#d6a16b9a':status==='done'?'#83c9a79a':'#4e82909c';ctx.stroke();
  ctx.textAlign='left';ctx.fillStyle='#f3f6ed';ctx.font=font;ctx.fillText(title,left+12,top+17);
  ctx.fillStyle=status==='blocked'?'#f4c28e':'#b4d1d4';ctx.font=small;ctx.fillText(subtitle,left+12,top+33);
  ctx.restore();
}
function drawTargets(ctx,flight,view,ar,preview){
  const c=getCountry(flight.countryId);
  const active=flight.sites.find(s=>s.remaining>0);
  flight.sites.forEach((site,i)=>{
    const p=view.project(site),blocked=isObscured(flight,site),done=site.remaining===0;
    const progress=site.initial-site.remaining,near=Math.hypot(flight.x-site.x,flight.z-site.z)<25;
    const color=done?'#92d5b0':blocked?'#efbf82':'#7de1e2';
    ctx.save();
    ctx.beginPath();ctx.arc(p.x,p.y,13,0,TWO_PI);ctx.fillStyle='#072332df';ctx.fill();
    ctx.lineWidth=2;ctx.strokeStyle='#274a4f';ctx.stroke();
    ctx.beginPath();ctx.arc(p.x,p.y,16,-Math.PI/2,-Math.PI/2+TWO_PI*progress/site.initial);
    ctx.lineWidth=3.5;ctx.strokeStyle=color;ctx.stroke();
    if(site===active&&!done){ctx.beginPath();ctx.arc(p.x,p.y,23+Math.sin(flight.elapsed*2)*2,0,TWO_PI);ctx.lineWidth=1.2;ctx.strokeStyle='#ead39c88';ctx.stroke();}
    ctx.fillStyle=color;ctx.font='700 13px "DM Sans",sans-serif';ctx.textAlign='center';ctx.fillText(done?'✓':blocked?'!':String(i+1),p.x,p.y+5);
    ctx.restore();
    const dir=site.id==='casablanca'?'right':site.id==='el-jadida'?'left':site.id==='berlin'?'left':site.id==='guelmim'?'right':'right';
    const label=localizedRegion(site,ar),second=done?(ar?'اكتمل الرصد':'SCAN COMPLETE'):blocked?(ar?'الرؤية محجوبة':'VISIBILITY BLOCKED'):progress+'/2  '+(ar?'حزم بيانات':'PACKETS');
    writePill(ctx,p.x,p.y,label,second,ar,dir,view,done?'done':blocked?'blocked':'ready');
    if(blocked){
      ctx.save();ctx.fillStyle='#f3c693bf';ctx.beginPath();ctx.arc(p.x+19,p.y-20,4,0,TWO_PI);ctx.fill();ctx.restore();
    }
    if(near&&!blocked&&!done){ctx.save();ctx.beginPath();ctx.arc(p.x,p.y,26,0,TWO_PI);ctx.lineWidth=2;ctx.strokeStyle='#e7dbadb3';ctx.stroke();ctx.restore();}
  });
  const p=view.project(flight.relay);
  ctx.save();ctx.beginPath();ctx.arc(p.x,p.y,23,0,TWO_PI);ctx.fillStyle='#513e2988';ctx.fill();ctx.strokeStyle='#efc686';ctx.lineWidth=2;ctx.stroke();
  ctx.fillStyle='#ffe0a1';ctx.textAlign='center';ctx.font='700 17px "DM Sans",sans-serif';ctx.fillText('⇧',p.x,p.y+5);ctx.restore();
  writePill(ctx,p.x,p.y,ar?'محطة إرسال البيانات':'DATA RELAY',ar?'اضغط E لإرسال البيانات':'HOLD E TO TRANSMIT',ar,'bottom',view,'ready');
}

function drawPreviewSites(ctx,country,view,ar){
  // Show real target positions before launch as well as while playing.
  const siteLabels=country.regions||[];
  for(let i=0;i<siteLabels.length;i++){
    const site=siteLabels[i],p=view.fromGeo(country,site.lat,site.lon);
    ctx.save();
    ctx.beginPath();ctx.arc(p.x,p.y,8,0,TWO_PI);
    ctx.fillStyle='#0b2836';ctx.fill();ctx.strokeStyle='#b6efdc';ctx.lineWidth=2;ctx.stroke();
    ctx.beginPath();ctx.arc(p.x,p.y,2.5,0,TWO_PI);ctx.fillStyle='#e9c993';ctx.fill();
    ctx.restore();
    let side=site.id==='el-jadida'?'left':site.id==='casablanca'?'right':'right';
    writePill(ctx,p.x,p.y,localizedRegion(site,ar),(ar?'منطقة الرصد ':'SURVEY AREA ')+(i+1),ar,side,view,'ready');
  }
  if(country.relay){
    const p=view.fromGeo(country,country.relay.lat,country.relay.lon);
    ctx.save();ctx.beginPath();ctx.arc(p.x,p.y,5,0,TWO_PI);
    ctx.fillStyle='#f5c88c';ctx.fill();ctx.restore();
  }
}
function drawShip(ctx,flight,view,ar){
  const p=view.project(flight);
  const angle=Math.atan2(flight.headingZ||-1,flight.headingX||1)+Math.PI/2;
  ctx.save();ctx.translate(p.x,p.y);ctx.rotate(angle);ctx.shadowColor='#7ef9e4';ctx.shadowBlur=20;
  ctx.fillStyle='#0e2833';ctx.strokeStyle='#a9f5dc';ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(0,-17);ctx.lineTo(11,13);ctx.lineTo(0,8);ctx.lineTo(-11,13);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.shadowBlur=0;ctx.fillStyle='#4c98a7';ctx.fillRect(-22,3,12,11);ctx.fillRect(10,3,12,11);
  ctx.strokeStyle='#e4c58b';ctx.strokeRect(-22,3,12,11);ctx.strokeRect(10,3,12,11);
  ctx.restore();
  ctx.save();ctx.beginPath();ctx.arc(p.x,p.y,30,0,TWO_PI);ctx.strokeStyle='#9ce1d744';ctx.lineWidth=1.5;ctx.stroke();
  ctx.fillStyle='#e4eade';ctx.font=ar?'600 11px "Noto Sans Arabic",sans-serif':'700 10px "DM Sans",sans-serif';
  ctx.textAlign='center';ctx.fillText(ar?'مركبتك':'YOUR CRAFT',p.x,p.y+43);ctx.restore();
}
function drawTrail(ctx,flight,view){
 if(flight.trail.length<2)return;
 ctx.save();ctx.beginPath();flight.trail.forEach((world,i)=>{const p=view.project(world);if(i===0)ctx.moveTo(p.x,p.y);else ctx.lineTo(p.x,p.y)});
 ctx.setLineDash([3,8]);ctx.strokeStyle='#8dedda7b';ctx.lineWidth=2;ctx.stroke();ctx.restore();
}
function drawDebris(ctx,flight,view){
  for(const d of flight.debris){
    const p=view.project(d);
    ctx.save();ctx.translate(p.x,p.y);ctx.rotate(d.phase+flight.elapsed*.36);
    ctx.fillStyle='#ca815766';ctx.strokeStyle='#e7a68199';ctx.lineWidth=1.2;
    ctx.beginPath();ctx.moveTo(-7,-9);ctx.lineTo(6,-7);ctx.lineTo(10,2);ctx.lineTo(2,10);ctx.lineTo(-9,4);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();
  }
}
export function renderCountryAtlas(ctx,width,height,flight,previewCountry,ar,preview=false){
  const countryId=flight?.countryId||previewCountry||'morocco',country=getCountry(countryId);
  const view=viewport(width,height,countryId,preview);
  drawCanvasBackdrop(ctx,width,height,country,ar,preview,view,flight?.elapsed||0);
  drawLand(ctx,countryId,country,view,flight?.elapsed||0);
  if(!flight){
    drawPreviewSites(ctx,country,view,ar);
    ctx.save();
    ctx.font=ar?'700 15px "Noto Sans Arabic",sans-serif':'700 15px "DM Sans",sans-serif';
    ctx.textAlign='center';ctx.fillStyle='#d9eadfa6';
    ctx.fillText(country.flag+' '+localizedCountry(country,ar),view.cx,view.rect.bottom-16);
    ctx.restore();
    return;
  }
  // No route or trail stripes over Morocco's solid land shape.
  if(countryId!=='morocco'){
    drawRoute(ctx,flight.sites,flight.relay,view,preview);
    drawTrail(ctx,flight,view);
  }
  drawDebris(ctx,flight,view);
  drawTargets(ctx,flight,view,ar,preview);
  drawShip(ctx,flight,view,ar);
  // The night phase applies to the entire spacecraft, not a western strip of geography.
  if(flight.eclipse){
    ctx.fillStyle='#04101f50';ctx.fillRect(0,0,width,height);
    ctx.textAlign='left';ctx.font=ar?'600 11px "Noto Sans Arabic",sans-serif':'600 11px "DM Sans",sans-serif';ctx.fillStyle='#efc08c';
    ctx.fillText(ar?'في ظلّ الأرض · الطاقة الشمسية متوقفة':'ECLIPSE · SOLAR CHARGING OFF',28,height-116);
  }
  ctx.save();ctx.fillStyle='#91b0b8';ctx.textAlign='left';ctx.font=ar?'500 10px "Noto Sans Arabic",sans-serif':'500 10px "DM Sans",sans-serif';
  ctx.fillText(ar?'الخريطة للعبة · الإحداثيات تقريبية':'MAP FOR GAMEPLAY · APPROXIMATE COORDINATES',22,height-15);ctx.restore();
}
