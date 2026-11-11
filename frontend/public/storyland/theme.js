/* Seasonal themes shared with the WeWIN site (keep in sync with forest-background/themes.ts). */
(() => {
 'use strict';
 const KEY='wewin_forest_theme',MSG='wewin:forest-theme',DEFAULT='wewin';
 const THEMES=[
  {id:'spring',label:'Xuân',icon:'🌸',accent:'#FFB7C5'},
  {id:'summer',label:'Hạ',icon:'☀️',accent:'#FFC857'},
  {id:'autumn',label:'Thu',icon:'🍂',accent:'#E67E22'},
  {id:'winter',label:'Đông',icon:'❄️',accent:'#A8D8EA'},
  {id:'wewin',label:'WeWin',icon:'🏆',accent:'#D4AF37'}
 ];
 const embedded=window.parent!==window;
 const isTheme=v=>THEMES.some(t=>t.id===v);
 const read=()=>{try{const v=localStorage.getItem(KEY);return isTheme(v)?v:DEFAULT;}catch{return DEFAULT;}};
 let current=read();

 function apply(id){
  if(!isTheme(id))return;
  current=id;
  document.documentElement.dataset.season=id;
  const t=THEMES.find(x=>x.id===id);
  document.querySelectorAll('[data-season-switch]').forEach(root=>{
   const toggle=root.querySelector('.season-toggle');
   toggle.querySelector('span').textContent=t.icon;
   toggle.title=`Chủ đề ${t.label}`;
   toggle.style.setProperty('--season-accent',t.accent);
   root.querySelectorAll('.season-option').forEach(b=>b.setAttribute('aria-checked',String(b.dataset.season===id)));
  });
 }

 function choose(id){
  apply(id);
  if(embedded)window.parent.postMessage({type:MSG,theme:id},location.origin);
  else try{localStorage.setItem(KEY,id);}catch{/* private mode: theme still applies for this session */}
 }

 function closeAll(except){
  document.querySelectorAll('[data-season-switch]').forEach(root=>{
   if(root===except)return;
   root.querySelector('.season-menu').hidden=true;
   root.querySelector('.season-toggle').setAttribute('aria-expanded','false');
  });
 }

 function render(){
  document.querySelectorAll('[data-season-switch]').forEach(root=>{
   root.innerHTML=`<button type="button" class="icon-button season-toggle" aria-label="Chọn chủ đề" aria-expanded="false"><span aria-hidden="true"></span></button><div class="season-menu" role="radiogroup" aria-label="Chọn chủ đề" hidden>${THEMES.map(t=>`<button type="button" class="season-option" role="radio" data-season="${t.id}" aria-label="Chủ đề ${t.label}" title="${t.label}" style="--season-accent:${t.accent}"><span aria-hidden="true">${t.icon}</span></button>`).join('')}</div>`;
   const toggle=root.querySelector('.season-toggle'),menu=root.querySelector('.season-menu');
   toggle.addEventListener('click',()=>{const open=menu.hidden;closeAll(root);menu.hidden=!open;toggle.setAttribute('aria-expanded',String(open));});
   menu.addEventListener('click',e=>{const b=e.target.closest('.season-option');if(!b)return;choose(b.dataset.season);closeAll();});
  });
  document.addEventListener('pointerdown',e=>{if(!e.target.closest('[data-season-switch]'))closeAll();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeAll();});
  apply(current);
 }

 document.documentElement.dataset.season=current;
 window.addEventListener('message',e=>{
  if(e.origin!==location.origin||e.source!==window.parent)return;
  if(e.data&&e.data.type===MSG)apply(e.data.theme);
 });
 window.addEventListener('storage',e=>{if(e.key===KEY&&isTheme(e.newValue))apply(e.newValue);});
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',render);else render();
})();
