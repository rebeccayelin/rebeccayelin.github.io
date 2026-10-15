(()=>{
'use strict';
const $=s=>document.querySelector(s), slides=deck.slides;
const key='research-overview-drafts-v1';
let drafts={notes:{},edits:{}},storageOK=true,editing=false,presenting=false,priorNotes=false,priorSidebar=true;
try{const value=JSON.parse(localStorage.getItem(key)||'null');if(value&&value.notes&&value.edits)drafts=value;}catch{storageOK=false;}
const base=new Map();
for(const el of document.querySelectorAll('.slide [data-edit]')){base.set(el.dataset.edit,el.textContent);const entry=drafts.edits[el.dataset.edit];if(entry&&entry.base===el.textContent&&typeof entry.text==='string')el.textContent=entry.text;}
const ui=document.createElement('div');ui.innerHTML=`
<nav id="deck-tools" aria-label="Presentation controls">
<button id="tools-slides" aria-expanded="false" aria-controls="slide-sidebar">☰ Slides</button><span class="brand">Research overview</span>
<button id="tools-prev" aria-label="Previous slide or build" title="Previous (←)">←</button><span class="position" id="tools-position"></span><button id="tools-next" aria-label="Next slide or build" title="Next (→)">→</button>
<button id="tools-replay" title="Replay this slide (R)">Replay</button><button id="tools-notes" aria-pressed="false" aria-controls="deck-notes">Notes</button><button id="tools-edit" aria-pressed="false">Edit text</button><button id="tools-style" aria-expanded="false">Style</button><button id="tools-help" title="Instructions (?)">Help</button><button id="tools-present" class="primary" title="Full-screen presentation (F)">Present ↗</button>
</nav>
<aside id="deck-notes" aria-label="Presenter notes" hidden><header><h2>Notes</h2><span id="note-label"></span><p id="note-title"></p><span id="draft-state" role="status"></span><button id="notes-close" aria-label="Hide presenter notes">×</button></header><textarea id="note-content" aria-label="Notes for this slide" placeholder="Speaking notes…"></textarea></aside>
<dialog id="deck-help" aria-labelledby="help-title"><header><h2 id="help-title">Controls</h2><button id="help-close" aria-label="Close instructions">×</button></header><dl><dt><kbd>←</kbd> <kbd>→</kbd> / <kbd>Space</kbd></dt><dd>Slides and animation builds</dd><dt><kbd>S</kbd></dt><dd>Slide list</dd><dt><kbd>N</kbd></dt><dd>Notes</dd><dt><kbd>E</kbd></dt><dd>Edit outlined text</dd><dt><kbd>R</kbd></dt><dd>Replay slide</dd><dt><kbd>F</kbd> / <kbd>Esc</kbd></dt><dd>Enter / exit presentation</dd><dt><kbd>?</kbd></dt><dd>Help</dd></dl><p>Notes and text edits save in this browser only.</p><p class="footnote">Present hides all panels. Move the pointer to show Exit.</p></dialog>
<button id="deck-exit" hidden>Exit presentation · Esc</button><div id="deck-toast" role="status"></div>`;
document.body.append(ui);
let noticeTimer;function notice(text){$('#deck-toast').textContent=text;clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>$('#deck-toast').textContent='',4200);}
function save(){try{localStorage.setItem(key,JSON.stringify(drafts));storageOK=true;}catch{storageOK=false;}$('#draft-state').textContent=storageOK?'Saved locally':'Unable to save locally';}
const slideKey=()=>slides[deck.currentSlide].getAttribute('aria-label');
let rendered=-1;
function sync(){const i=deck.currentSlide;$('#tools-position').textContent=`${i+1} / ${slides.length}`;$('#tools-prev').disabled=i===0;$('#tools-next').disabled=i===slides.length-1;$('#tools-slides').setAttribute('aria-expanded',String(!document.body.classList.contains('nav-collapsed')));
 if(rendered!==i){rendered=i;$('#note-label').textContent=`${i+1} / ${slides.length}`;$('#note-title').textContent=slideKey();$('#note-content').value=typeof drafts.notes[slideKey()]==='string'?drafts.notes[slideKey()]:'';applyEditing();}
}
function applyEditing(){for(const el of document.querySelectorAll('.slide [data-edit]')){if(editing&&el.closest('.slide')===slides[deck.currentSlide]){el.setAttribute('contenteditable','true');el.setAttribute('spellcheck','true');}else el.removeAttribute('contenteditable');}}
function setEditing(on){editing=on;deck.editing=on;document.body.classList.toggle('deck-editing',on);$('#tools-edit').textContent=on?'Done editing':'Edit text';$('#tools-edit').setAttribute('aria-pressed',String(on));applyEditing();if(on){const count=slides[deck.currentSlide].querySelectorAll('[data-edit]').length;notice(count?'Click outlined text to edit. Saved locally.':'No editable text on this slide.');}}
function setNotes(on){if(presenting)return;$('#deck-notes').hidden=!on;$('#tools-notes').setAttribute('aria-pressed',String(on));deck.scale();}
function next(d){if(editing)setEditing(false);deck.showSlide(deck.currentSlide+d);sync();}
function replay(){if(editing)setEditing(false);$('#replay').click();sync();}
deck.scale=function(){const mobile=innerWidth<=700;const top=presenting?0:(mobile?104:60);const left=presenting||mobile||document.body.classList.contains('nav-collapsed')?0:264;const notes=!$('#deck-notes').hidden&&!presenting;const bottom=notes?$('#deck-notes').getBoundingClientRect().height:0;const width=innerWidth-left,height=innerHeight-top-bottom;const factor=Math.max(.01,Math.min(width/1920,height/1080));this.stage.style.transform=`translate(${left+(width-1920*factor)/2}px,${top+(height-1080*factor)/2}px) scale(${factor})`;};
function closeStyle(){document.body.classList.remove('show-tuning');$('.tuning').open=false;$('#tools-style').setAttribute('aria-expanded','false');}
function exitPresent(){if(!presenting)return;presenting=false;document.body.classList.remove('deck-presenting','present-controls');$('#deck-tools').hidden=false;$('#deck-exit').hidden=true;setSidebarCollapsed(priorSidebar);setNotes(priorNotes);if(document.fullscreenElement)document.exitFullscreen().catch(()=>{});deck.scale();$('#tools-present').focus();}
let pointerTimer;function showExit(){if(!presenting)return;document.body.classList.add('present-controls');clearTimeout(pointerTimer);pointerTimer=setTimeout(()=>document.body.classList.remove('present-controls'),2200);}
async function present(){clearTimeout(noticeTimer);$('#deck-toast').textContent='';if(presenting){exitPresent();return;}setEditing(false);closeStyle();$('#deck-help').close();priorNotes=!$('#deck-notes').hidden;priorSidebar=document.body.classList.contains('nav-collapsed');setNotes(false);setSidebarCollapsed(true);presenting=true;document.body.classList.add('deck-presenting');$('#deck-tools').hidden=true;$('#deck-exit').hidden=false;deck.scale();showExit();if(document.documentElement.requestFullscreen){try{await document.documentElement.requestFullscreen();}catch{notice('Presentation fills this page. Browser full-screen is unavailable.');}}}
$('#tools-slides').onclick=()=>{setSidebarCollapsed(!document.body.classList.contains('nav-collapsed'));sync();};
$('#tools-prev').onclick=()=>next(-1);$('#tools-next').onclick=()=>next(1);$('#tools-replay').onclick=replay;
$('#tools-notes').onclick=()=>setNotes($('#deck-notes').hidden);$('#notes-close').onclick=()=>{setNotes(false);$('#tools-notes').focus();};
$('#tools-edit').onclick=()=>setEditing(!editing);$('#tools-present').onclick=present;$('#deck-exit').onclick=exitPresent;
$('#tools-style').onclick=()=>{const open=!document.body.classList.contains('show-tuning');document.body.classList.toggle('show-tuning',open);$('.tuning').open=open;$('#tools-style').setAttribute('aria-expanded',String(open));};
$('#tools-help').onclick=()=>$('#deck-help').showModal();$('#help-close').onclick=()=>$('#deck-help').close();
$('#note-content').oninput=()=>{drafts.notes[slideKey()]=$('#note-content').value;save();};
document.addEventListener('input',e=>{const el=e.target.closest('.slide [data-edit]');if(!el||!editing)return;drafts.edits[el.dataset.edit]={base:base.get(el.dataset.edit),text:el.textContent};save();});
document.addEventListener('paste',e=>{if(!editing||!e.target.closest('.slide [data-edit]'))return;e.preventDefault();document.execCommand('insertText',false,e.clipboardData.getData('text/plain'));});
// Stop legacy slide navigation while using panels or text fields.
document.addEventListener('keydown',e=>{const input=e.target.closest('input,textarea,select,[contenteditable=true]');if(input){if(e.key==='Escape'&&editing){e.preventDefault();setEditing(false);$('#tools-edit').focus();}e.stopImmediatePropagation();return;}if($('#deck-help').open){e.stopImmediatePropagation();return;}if(e.metaKey||e.ctrlKey||e.altKey)return;const k=e.key.toLowerCase();let action;if(k==='escape')action=()=>{if(presenting)exitPresent();else if(editing)setEditing(false);else{setNotes(false);closeStyle();}};else if(k==='f')action=present;else if(presenting&&['n','s','e','?'].includes(k))return;else if(k==='n')action=()=>setNotes($('#deck-notes').hidden);else if(k==='s')action=()=>$('#tools-slides').click();else if(k==='e')action=()=>setEditing(!editing);else if(k==='r')action=replay;else if(k==='?')action=()=>$('#deck-help').showModal();else if(['arrowright','arrowdown','pagedown',' '].includes(k)&&!(e.target.closest('button,summary')&&k===' '))action=()=>next(1);else if(['arrowleft','arrowup','pageup'].includes(k))action=()=>next(-1);if(action){e.preventDefault();e.stopImmediatePropagation();action();}},true);
for(const event of ['wheel','touchstart','touchend'])document.addEventListener(event,e=>{if(e.target.closest('#deck-tools,#deck-notes,#deck-help,.tuning')||editing)e.stopImmediatePropagation();},{capture:true,passive:true});
document.addEventListener('fullscreenchange',()=>{if(!document.fullscreenElement&&presenting)exitPresent();deck.scale();});document.addEventListener('pointermove',showExit);document.addEventListener('touchstart',showExit,{passive:true});
let pending=false;new MutationObserver(()=>{if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;sync();});}).observe($('.deck-stage'),{subtree:true,attributes:true,attributeFilter:['class']});
window.addEventListener('hashchange',()=>{const n=Number(location.hash.slice(1));if(Number.isInteger(n)&&n>=0&&n<slides.length&&n!==deck.currentSlide){document.querySelector(`.sidebar-tree [data-slide="${n}"]`).click();sync();}});
sync();deck.scale();$('#draft-state').textContent=storageOK?'Saved locally':'Unable to save locally';
})();
