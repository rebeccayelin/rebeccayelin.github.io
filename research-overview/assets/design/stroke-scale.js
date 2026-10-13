/* Constellations stroke weights in native 1920 × 1080 deck pixels.
   Geometry, path lengths and opacity are preserved; markers use density tiers. */
(()=>{
 const weights={graph:1.6,motif:1.6,tiling:1.6,frame:1.6,packing:1.6,guide:1.2,subdivision:2.4};
 const cache=new WeakMap(),vertexCache=new WeakMap();
 const shapes='path,line,polyline,polygon,circle,ellipse,rect';
 function role(e,stroke){
  if(e.closest('clipPath,marker,pattern'))return null;
  if(e.closest('.feature-highlight'))return null;
  if(e.matches('.radial-added-edge,.radial-operation-dotted'))return 'subdivision';
  if(e.matches('.pattern-border,.detail-pattern-frame,.exploration-panel-outline')||e.matches('rect[fill="none"]')&&stroke==='rgb(145, 161, 159)')return 'frame';
  if(e.closest('.atlas-construction-guides'))return 'guide';
  if(e.closest('[id$="-construction"]'))return 'tiling';
  if(e.closest('[id$="-pattern"],.pipeline-motif,.atlas-pattern,.radial-layer-motif,.refine-pattern,.refine-final-pattern'))return 'motif';
  if(e.closest('.pipeline-patch'))return 'tiling';
  if(e.closest('.pipeline-packing,.atlas-packing,.radial-layer-packing,.refine-packing,.refine-final-packing')||e.matches('.atlas-circle-draw')||e.tagName.toLowerCase()==='circle'&&stroke==='rgb(145, 161, 159)')return 'packing';
  if(stroke==='rgb(184, 109, 70)')return 'tiling';
  return 'graph';
 }
 function entries(slide){
  if(cache.has(slide))return cache.get(slide);
  const result=[];
  slide.querySelectorAll(shapes).forEach(e=>{
   const c=getComputedStyle(e);
   if(c.stroke==='none'||Number.parseFloat(c.strokeWidth)===0)return;
   const r=role(e,c.stroke);if(!r)return;
   // White reveal-mask strokes must remain wider than the strokes they reveal.
   const mask=!!e.closest('mask');
   result.push({e,r,mask,original:Number.parseFloat(c.strokeWidth),last:0});
   if(!mask)e.dataset.strokeRole=r;
  });
  cache.set(slide,result);return result;
 }
 function vertices(slide){
  if(vertexCache.has(slide))return vertexCache.get(slide);
  const radius=slide.matches('.uniform-layered')?2:slide.matches('.radial-exploration,.refinement')?2.5:4;
  const nodes=[...slide.querySelectorAll('circle')].filter(e=>{
   if(e.closest('defs,mask,clipPath,.feature-highlight'))return false;
   const fill=getComputedStyle(e).fill;
   return e.matches('.pipeline-node,.contact-node')||['rgb(23, 43, 45)','rgb(145, 161, 159)'].includes(fill);
  }).map(e=>{e.style.stroke='none';e.dataset.vertexDeckDiameter=String(radius*2);return {e,radius};});
  vertexCache.set(slide,nodes);return nodes;
 }
 function apply(slide){
  const stage=document.querySelector('.deck-stage');
  const stageMatrix=new DOMMatrix(getComputedStyle(stage).transform);
  const deckScale=Math.hypot(stageMatrix.a,stageMatrix.b)||1;
  for(const {e,radius} of vertices(slide)){
   const m=e.getScreenCTM();if(!m)continue;
   const scale=Math.sqrt(Math.hypot(m.a,m.b)*Math.hypot(m.c,m.d))/deckScale;
   if(scale>0){e.style.r=String(radius/scale);e.dataset.vertexScale=String(scale);}
  }
  let count=0;
  for(const item of entries(slide)){
   const m=item.e.getScreenCTM();if(!m)continue;
   const sx=Math.hypot(m.a,m.b)/deckScale,sy=Math.hypot(m.c,m.d)/deckScale;
   const scale=Math.sqrt(sx*sy);if(!(scale>0))continue;
   const w=item.mask?Math.max(item.original,weights[item.r]*1.5/scale):weights[item.r]/scale;
   if(Math.abs(w-item.last)>1e-7){item.e.style.strokeWidth=String(w);item.last=w;}
   if(!item.mask){item.e.dataset.strokeDeckPx=String(weights[item.r]);item.e.dataset.strokeScale=String(scale);count++;}
  }
  slide.dataset.strokeNormalized=String(count);
 }
 let frame=0,until=0;
 function tick(){
  const s=document.querySelector('.slide.active[data-design="constellations"]');
  if(s)apply(s);
  if(s?.classList.contains("rosette-detail")&&performance.now()<until)frame=requestAnimationFrame(tick);else frame=0;
 }
 function schedule(){until=performance.now()+2100;if(!frame)frame=requestAnimationFrame(tick);}
 // Includes the rosette zoom and procedure copy transforms, not just static SVGs.
 new MutationObserver(schedule).observe(document.querySelector('.deck-stage'),{subtree:true,attributes:true,attributeFilter:['class','data-explore','data-detail-step']});
 window.addEventListener('resize',schedule);
 document.querySelector('#sidebar-toggle')?.addEventListener('click',schedule);
 schedule();
})();
