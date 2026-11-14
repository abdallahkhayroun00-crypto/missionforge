import test from 'node:test';
import assert from 'node:assert/strict';
import {outlines,moroccoContinuousOutline} from '../country-outlines.js';
import {viewport,renderCountryAtlas} from '../country-renderer.js';

test('Morocco atlas consists of one closed exterior boundary, not two overlaid polygons',()=>{
  assert.equal(moroccoContinuousOutline.length,1);
  const ring=moroccoContinuousOutline[0];
  assert.deepEqual(ring[0],ring[ring.length-1]);
  assert.ok(ring.length>40);
  const internal=[...outlines.morocco[0].slice(22,35)];
  // The former shared Morocco/Western Sahara edge must not be drawn.
  for(const p of internal)assert.ok(!ring.some(q=>q[0]===p[0]&&q[1]===p[1]),'former interior boundary vertex leaked');
});
test('Morocco preview has no dashed lines and stays fully framed',()=>{
  const width=390,height=980;
  let dashCalls=0;
  const ctx=new Proxy({
    canvas:{width,height},
    createLinearGradient:()=>({addColorStop(){}}),
    createRadialGradient:()=>({addColorStop(){}}),
    measureText:x=>({width:String(x).length*7})
  },{
    get(o,k){if(k in o)return o[k];if(k==='setLineDash')return values=>{if(values.length)dashCalls++;};return ()=>{};},
    set(o,k,v){o[k]=v;return true;}
  });
  renderCountryAtlas(ctx,width,height,null,'morocco',false,true);
  assert.equal(dashCalls,0);
  const frame=viewport(width,height,'morocco',true),box=frame.outlineBox();
  assert.ok(box.minX>=frame.rect.left&&box.maxX<=frame.rect.right);
  assert.ok(box.minY>=frame.rect.top&&box.maxY<=frame.rect.bottom);
});
