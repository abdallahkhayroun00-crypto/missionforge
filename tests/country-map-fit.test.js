import test from 'node:test';
import assert from 'node:assert/strict';
import {viewport} from '../country-renderer.js';
import {getCountry,missionSites,pointFor} from '../country-missions.js';

for(const [width,height] of [[390,980],[430,1000],[768,1000],[1100,940],[1535,770],[1535,940],[1920,1000]]){
 for(const preview of [false,true]){
  test(`Full Morocco map and all mission locations fit ${width}×${height} (preview=${preview})`,()=>{
   const view=viewport(width,height,'morocco',preview);
   const box=view.outlineBox(),r=view.rect,epsilon=1e-7;
   assert.ok(box.minX>=r.left-epsilon,`westernmost outline at ${box.minX}, frame ${r.left}`);
   assert.ok(box.maxX<=r.right+epsilon,`easternmost outline at ${box.maxX}, frame ${r.right}`);
   assert.ok(box.minY>=r.top-epsilon,`northernmost outline at ${box.minY}, frame ${r.top}`);
   assert.ok(box.maxY<=r.bottom+epsilon,`southernmost outline at ${box.maxY}, frame ${r.bottom}`);
   assert.ok(view.mapH>0&&view.mapW>0);
   const c=getCountry('morocco');
   for(const city of missionSites('morocco')){
     const p=view.fromGeo(c,city.lat,city.lon);
     assert.ok(p.x>=r.left-epsilon&&p.x<=r.right+epsilon,`${city.name} X outside map`);
     assert.ok(p.y>=r.top-epsilon&&p.y<=r.bottom+epsilon,`${city.name} Y outside map`);
   }
   // The approximate Natural Earth southernmost coordinate must be visible.
   const south=view.fromGeo(c,20.9998,-17.0634);
   assert.ok(south.x>=r.left-epsilon&&south.x<=r.right+epsilon);
   assert.ok(south.y>=r.top-epsilon&&south.y<=r.bottom+epsilon);
  });
 }
}
