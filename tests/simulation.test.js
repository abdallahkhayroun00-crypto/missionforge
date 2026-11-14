import test from 'node:test';
import assert from 'node:assert/strict';
import {simulate,defaultDesign,catalog,objectives} from '../simulation.js';
const viable={...defaultDesign,solar:'extended',battery:'large',radio:'fast',launcher:'dedicated'};
test('initial mapping design exposes power and downlink trade-offs',()=>{const r=simulate(defaultDesign);assert.equal(r.success,false);for(const id of ['energy','data'])assert.equal(r.checks.find(c=>c.id===id).pass,false,id);});
test('every objective has a design that satisfies every constraint',()=>{for(const [objective,o] of Object.entries(objectives)){const d={...viable,objective,payload:o.preferred,launcher:objective==='survey'?'rideshare':'dedicated'};assert.equal(simulate(d).success,true,objective);}});
test('thermal instrument is required for wildfire science',()=>{const r=simulate({...viable,objective:'wildfire'});assert.equal(r.checks.find(c=>c.id==='science').pass,false);});
test('higher orbit increases period and contact data but reduces resolution',()=>{const a=simulate(viable),b=simulate({...viable,orbit:'high'});assert.ok(b.period>a.period);assert.ok(b.dataReturned>a.dataReturned);assert.ok(b.science<a.science);});
test('energy conservation uses sunlight only and eclipse storage is separate',()=>{const r=simulate(viable);assert.ok(Math.abs(r.energyGenerated-75*(r.period-r.eclipse)/60*0.8)<1e-9);assert.ok(Math.abs(r.eclipseNeeded-r.demand*r.eclipse/60)<1e-9);});
test('invalid component and objective are rejected',()=>{assert.throws(()=>simulate({...viable,radio:'unknown'}));assert.throws(()=>simulate({...viable,objective:'unknown'}));});
test('all 288 mission configurations produce finite bounded outputs',()=>{let count=0;function visit(d,keys){if(!keys.length){const r=simulate(d);assert.ok(Number.isFinite(r.energyGenerated));assert.ok(r.science>=0&&r.science<=100);assert.equal(r.success,r.checks.every(c=>c.pass));count++;return;}const [key,...rest]=keys;for(const item of catalog[key])visit({...d,[key]:item.id},rest);}for(const objective of Object.keys(objectives))visit({objective},Object.keys(catalog));assert.equal(count,288);});

test('heavy hardware exceeds rideshare capacity',()=>assert.equal(simulate({...viable,launcher:'rideshare'}).checks.find(c=>c.id==='mass').pass,false));
