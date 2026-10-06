import * as THREE from './three-0.169.0.mjs';
import { parts } from './parts.js?v=e6ff734bc41a';

const root = document.querySelector('#tide-viewer');
const stage = root.querySelector('.model-stage');
const slider = root.querySelector('#explode');
const full = root.querySelector('#full-height');
const cutaway = root.querySelector('#cutaway');
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
} catch {
  root.querySelector('.model-loading').textContent = '3D is unavailable in this browser. Follow the assembly instructions below or open the cutting PDF.';
}
if (renderer) init();

function init() {
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  stage.querySelector('.model-loading').remove();
  stage.append(renderer.domElement);
  renderer.domElement.setAttribute('aria-hidden', 'true');
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera();
  scene.add(new THREE.HemisphereLight(0xffffff, 0x8c8174, 2));
  const light = new THREE.DirectionalLight(0xffffff, 2.4);
  light.position.set(-200, 350, 200); scene.add(light);
  const palette = { wood:0xb58a60, rib:0xb58a60, deck:0xb58a60, led:0xd3a544, acrylic:0x8cabb4, battery:0x555b56 };
  const materials = {};
  for (const [name,color] of Object.entries(palette)) {
    materials[name] = new THREE.MeshStandardMaterial({ color, roughness:.8,
      transparent:name === 'acrylic', opacity:name === 'acrylic' ? .15 : 1,
      depthWrite:name !== 'acrylic', side:THREE.DoubleSide });
  }
  const edges = new THREE.LineBasicMaterial({ color:0x343c3a, transparent:true, opacity:.3 });
  const groups = {};
  for (const key of ['front','rear','left','right','lid','deck','floor','ribs','led','acrylic','battery']) {
    groups[key] = new THREE.Group(); scene.add(groups[key]);
  }
  function mesh(geometry, material, group, x=0, y=0, z=0) {
    const object = new THREE.Mesh(geometry, materials[material]);
    object.position.set(x,y,z); group.add(object);
    object.add(new THREE.LineSegments(new THREE.EdgesGeometry(geometry),edges));
    return object;
  }
  function shape(part, transform) {
    const outline = new THREE.Shape();
    part.polys.forEach((poly,i) => {
      const path = i ? new THREE.Path() : outline;
      poly.forEach((point,j) => { const [x,y] = transform(point); j ? path.lineTo(x,y) : path.moveTo(x,y); });
      path.closePath(); if(i) outline.holes.push(path);
    });
    for (const [cx,cy,r] of part.circles || []) {
      const [x,y] = transform([cx,cy]); const hole = new THREE.Path();
      hole.absarc(x,y,r,0,Math.PI*2,true); outline.holes.push(hole);
    }
    return new THREE.ExtrudeGeometry(outline,{depth:3,bevelEnabled:false});
  }
  for (const p of parts) {
    if (p.kind === 'plate') {
      const key = p.name === 'lid' ? 'lid' : p.name === 'battery-slab' ? 'deck' : 'floor';
      const m = mesh(shape(p,([x,y])=>[x-139.7,y-47.5]),key==='deck'?'deck':'wood',groups[key],0,p.top,0);
      m.rotation.x = Math.PI/2;
    } else if (p.kind === 'post') {
      const m = mesh(shape(p,([x,y])=>[x+p.z_offset,y]),'rib',groups.ribs,p.station_x+1.5,22,0);
      m.rotation.y = -Math.PI/2;
    } else if (p.kind === 'wall-long') {
      mesh(shape(p,([x,y])=>[x-139.7,45-y]),'wood',groups[p.name],0,0,p.name==='front'?44.5:-47.5);
    } else {
      const m = mesh(shape(p,([x,y])=>[x-47.5,45-y]),'wood',groups[p.name],p.name==='left'?-139.7:136.7,0,0);
      m.rotation.y = Math.PI/2;
    }
  }
  const acrylic = [];
  for (const z of [-16,0,16]) {
    acrylic.push(mesh(new THREE.BoxGeometry(254,60,3),'acrylic',groups.acrylic,0,60,z));
    mesh(new THREE.BoxGeometry(254,2,8),'led',groups.led,0,26,z);
  }
  mesh(new THREE.BoxGeometry(160,14,79),'battery',groups.battery,0,10,0);
  let az=.55, el=.52;
  const state = { amount:Number(slider.defaultValue)/100 };
  function update() {
    const t = state.amount;
    groups.front.position.z = t*65; groups.rear.position.z = -t*65;
    groups.left.position.x = -t*45; groups.right.position.x = t*45;
    groups.floor.position.y = -t*38; groups.battery.position.y = -t*15;
    groups.deck.position.y = t*25; groups.led.position.y = t*25;
    groups.ribs.position.y = t*62; groups.lid.position.y = t*112;
    groups.acrylic.position.y = t*150;
    groups.front.visible = !cutaway.checked;
    for (const m of acrylic) { const h=full.checked?279.4:60; m.scale.y=h/60; m.position.y=30+h/2; }
    root.querySelector('#explode-value').value = `${Math.round(t*100)}%`;
    slider.setAttribute('aria-valuetext',t===0?'Fully assembled':t===1?'Fully separated':`${Math.round(t*100)} percent separated`);
    root.dataset.explode = String(Math.round(t*100));
    draw();
  }
  function draw() {
    const w=stage.clientWidth, h=stage.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w,h,false);
    const t=state.amount;
    const half=Math.max((full.checked?195+t*80:105+t*95), (185+t*65)*h/w);
    camera.left=-half*w/h; camera.right=half*w/h; camera.top=half; camera.bottom=-half;
    camera.near=.1; camera.far=2000; camera.updateProjectionMatrix();
    const target=new THREE.Vector3(0,full.checked?154.7+t*55:44+t*60,0);
    camera.position.copy(target).add(new THREE.Vector3(600*Math.sin(az)*Math.cos(el),600*Math.sin(el),600*Math.cos(az)*Math.cos(el)));
    camera.lookAt(target); renderer.render(scene,camera);
  }
  slider.disabled=full.disabled=cutaway.disabled=false;
  root.querySelector('#reset-view').disabled=false;
  slider.addEventListener('input',()=>{state.amount=Number(slider.value)/100;update();});
  full.addEventListener('change',update); cutaway.addEventListener('change',update);
  root.querySelector('#reset-view').addEventListener('click',()=>{az=.55;el=.52;slider.value=slider.defaultValue;state.amount=Number(slider.defaultValue)/100;full.checked=false;cutaway.checked=false;update();});
  let last=null;
  stage.addEventListener('pointerdown',e=>{if(e.button!==0)return;last=[e.clientX,e.clientY];stage.setPointerCapture(e.pointerId);});
  stage.addEventListener('pointermove',e=>{if(!last)return;az-=(e.clientX-last[0])*.008;el=Math.max(-.35,Math.min(1.4,el+(e.clientY-last[1])*.008));last=[e.clientX,e.clientY];draw();});
  for (const event of ['pointerup','pointercancel','lostpointercapture']) stage.addEventListener(event,()=>{last=null;});
  stage.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;e.preventDefault();az+=e.key==='ArrowLeft'?.1:e.key==='ArrowRight'?-.1:0;el=Math.max(-.35,Math.min(1.4,el+(e.key==='ArrowUp'?.1:e.key==='ArrowDown'?-.1:0)));draw();});
  renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();stage.setAttribute('aria-label','3D rendering was interrupted. Reload the page to restore the model.');});
  new ResizeObserver(draw).observe(stage);
  update();
}
