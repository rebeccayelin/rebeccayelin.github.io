(()=>{
 const NS='http://www.w3.org/2000/svg',records=[...document.querySelectorAll('.thread-route,.reduction-route')].map(path=>{
  const dot=document.createElementNS(NS,'circle');dot.setAttribute('class','thread-leading-dot');dot.setAttribute('fill','#feae00');dot.setAttribute('stroke','white');dot.setAttribute('pointer-events','none');dot.setAttribute('aria-hidden','true');dot.setAttribute('opacity','0');if(path.hasAttribute('transform'))dot.setAttribute('transform',path.getAttribute('transform'));path.parentElement.appendChild(dot);return {path,dot,length:path.getTotalLength(),slide:path.closest('.slide')};
 });
 function update(){
  for(const r of records){if(!r.slide.classList.contains('visible')){r.dot.setAttribute('opacity','0');continue;}
   const style=getComputedStyle(r.path),unit=Number(r.path.getAttribute('pathLength'))||r.length,p=1-parseFloat(style.strokeDashoffset)/unit;
   const active=p>0.0001&&p<0.9999&&style.visibility!=='hidden';r.dot.setAttribute('opacity',active?'1':'0');if(!active)continue;
   const point=r.path.getPointAtLength(p*r.length),width=parseFloat(style.strokeWidth)||1;r.dot.setAttribute('cx',point.x);r.dot.setAttribute('cy',point.y);r.dot.setAttribute('r',width*1.25);r.dot.setAttribute('stroke-width',width*.4);
  }
  requestAnimationFrame(update);
 }
 requestAnimationFrame(update);
})();
