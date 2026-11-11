/* WEWIN STORYLAND — no framework, no API key, no simulated word timing.
 * Natural speech uses real SpeechSynthesis word-boundary events.
 * The optional word-by-word mode synchronises each word to utterance.onstart.
 * Recorded audio uses supplied, validated word timestamps only. */
(() => {
 'use strict';
 const $=id=>document.getElementById(id);
 const iconPaths={play:'<path d="m9 5 11 7-11 7Z" fill="currentColor" stroke="none"/>',pause:'<path d="M8 5v14M16 5v14" stroke-width="4"/>',back:'<path d="m14 6-6 6 6 6M8 12h12"/>',left:'<path d="m14 6-6 6 6 6"/>',right:'<path d="m10 6 6 6-6 6"/>',previous:'<path d="M6 5v14m12-14L8 12l10 7Z"/>',next:'<path d="M18 5v14M6 5l10 7-10 7Z"/>',close:'<path d="m6 6 12 12M6 18 18 6"/>',bookmark:'<path d="M6 4h12v17l-6-4-6 4Z"/>',search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',repeat:'<path d="m17 2 4 4-4 4M3 10V8a2 2 0 0 1 2-2h16M7 22l-4-4 4-4m14 0v2a2 2 0 0 1-2 2H3"/>',settings:'<path d="m10 3-.6 2.1-2 .9-2-.8L3 8l1.4 1.8-.2 2.2L2.5 14 4 17l2.3-.1 1.6 1.4.4 2.3h3.4l.8-2 2.2-.7 2 .9 2.3-2.6-1.2-2 .3-2.2 1.7-1.5-1.3-3.1-2.4-.2-1.5-1.5-.1-2.3Z"/><circle cx="11" cy="12" r="3"/>',translate:'<path d="M3 5h12M9 3v2M5 5c1 6 5 8 9 10M13 5c-1 6-5 8-10 11m12 5 4-10 4 10m-6-3h4"/>'};
 const icon=(name,size=18)=>`<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${iconPaths[name]||iconPaths.play}</svg>`;
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const norm=s=>String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase();
 const clamp=(v,min,max)=>Math.max(min,Math.min(max,Number(v)||0));
 const fmt=s=>{s=Math.max(0,Math.floor(s||0));return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;};
 const storage={get(k,d){try{return JSON.parse(localStorage.getItem('wewin-storyland-'+k))??d;}catch{return d;}},set(k,v){try{localStorage.setItem('wewin-storyland-'+k,JSON.stringify(v));}catch{/* File/private mode or storage quota: reading continues. */}}};
 function tokenize(text){return Array.from(text.matchAll(/\S+/g),m=>({text:m[0],start:m.index,end:m.index+m[0].length}));}
 function validateData(d){
  if(!d||!Array.isArray(d.stories)||!d.stories.length||d.stories.length>500||!d.assets||typeof d.assets!=='object')throw Error('File dữ liệu thiếu danh sách truyện hoặc tranh.');
  const seen=new Set();
  for(const s of d.stories){
   if(typeof s.id!=='string'||seen.has(s.id)||!s.titleEn||!s.titleVi||!Array.isArray(s.scenes)||!s.scenes.length||s.scenes.length>300)throw Error('Truyện thiếu thông tin hoặc trùng mã.');
   seen.add(s.id);
   for(const sc of s.scenes)if(typeof sc.en!=='string'||!sc.en.trim()||typeof sc.vi!=='string'||!sc.vi.trim()||!d.assets[sc.image])throw Error(`Thiếu câu hoặc tranh trong ${s.titleEn}.`);
  }
  return d;
 }
 let data;
 try{data=validateData(window.STORYLAND_DATA);}catch(e){$('storyGrid').textContent=e.message;return;}
 let settings={voice:'',rate:1,font:22,volume:1,follow:true,wordMode:false,dark:false,translation:true,...storage.get('settings',{})};
 settings.rate=clamp(settings.rate,.5,2);settings.font=clamp(settings.font,17,32);settings.volume=clamp(settings.volume,0,1);
 const savedValue=storage.get('saved',[]),progressValue=storage.get('progress',{});
 let saved=new Set(Array.isArray(savedValue)?savedValue:[]),progress=progressValue&&typeof progressValue==='object'&&!Array.isArray(progressValue)?progressValue:{},recent=storage.get('recent',null);
 let category='all',level='all',query='',story=null,model=[],offsets=[],totalWords=0,sceneNodes=[],wordNodes=[];
 let state={scene:0,word:0,playing:false,readOnly:false,repeat:false,finished:false,mode:'tts',epoch:0,elapsed:0,clockStart:0};
 let utterance=null,chainTimer=null,toastTimer=null,lastWordNode=null,voices=[],voiceBoundaries=null;
 const synth=window.speechSynthesis||null,audio=$('recordedAudio'),recordings=new Map();
 const asset=k=>data.assets[k]||'';
 const safeSrc=s=>/^(data:image\/(?:png|jpeg|jpg|webp|gif);base64,|https?:\/\/|(?:\.\.?\/)?assets\/)/i.test(s||'')?s:'';
 function fillIcons(root=document){root.querySelectorAll('[data-icon]').forEach(el=>{el.innerHTML=icon(el.dataset.icon);});}
 function toast(message){clearTimeout(toastTimer);$('toast').textContent=message;$('toast').hidden=false;$('toast').classList.toggle('library-toast',!story);toastTimer=setTimeout(()=>$('toast').hidden=true,6500);}
 function persistSettings(){storage.set('settings',settings);}
 function applySettings(){
  document.documentElement.dataset.theme=settings.dark?'dark':'light';
  document.documentElement.style.setProperty('--reader-size',clamp(settings.font,17,32)+'px');
  document.body.classList.toggle('hide-translation',!settings.translation);
  $('translateBtn').setAttribute('aria-pressed',String(settings.translation));$('translateBtn').lastElementChild.textContent=settings.translation?'Ẩn bản dịch':'Hiện bản dịch';
  $('fontSize').value=settings.font;$('fontSizeLabel').textContent=settings.font;$('rate').value=settings.rate;$('volume').value=settings.volume;
  $('followRead').checked=settings.follow;$('wordMode').checked=settings.wordMode;$('darkMode').checked=settings.dark;
  audio.volume=clamp(settings.volume,0,1);audio.playbackRate=clamp(settings.rate,.5,2);
 }
 function renderLibrary(){
  const stories=data.stories.filter(s=>(category==='all'||(category==='saved'?saved.has(s.id):s.category===category))&&(level==='all'||s.level===level)&&(!query||norm(s.titleEn+' '+s.titleVi+' '+s.category).includes(norm(query))));
  $('storyCount').textContent=data.stories.length+' truyện song ngữ';$('statStories').textContent=data.stories.length;$('statRead').textContent=data.stories.filter(s=>progress[s.id]?.completed).length;$('savedCount').textContent=saved.size;
  $('resultLabel').textContent=`${stories.length} câu chuyện${category==='saved'?' đã lưu':''} · Chọn truyện và bắt đầu khám phá`;
  $('storyGrid').innerHTML=stories.length?stories.map(s=>`<article class="book-card"><button class="book-open" data-open="${esc(s.id)}" aria-label="Đọc ${esc(s.titleVi)}"><div class="cover-wrap"><img src="${esc(safeSrc(asset(s.cover||s.scenes[0].image)))}" alt="Minh họa ${esc(s.titleVi)}" loading="lazy" decoding="async"><span class="level" data-level="${esc(s.level)}">${esc(s.level)}</span></div><div class="card-content"><span class="category-label">${esc(s.category)}</span><h3>${esc(s.titleEn)}</h3><p>${esc(s.titleVi)}</p><div class="card-meta"><span>${s.scenes.length} cảnh · Anh–Việt</span><span class="${progress[s.id]?.completed?'read-tag':''}">${progress[s.id]?.completed?'✓ Đã đọc':progress[s.id]?'Đang đọc':'Khám phá →'}</span></div></div></button><button class="bookmark-card" data-save="${esc(s.id)}" aria-label="${saved.has(s.id)?'Bỏ lưu':'Lưu'} ${esc(s.titleVi)}" aria-pressed="${saved.has(s.id)}">${icon('bookmark',15)}</button></article>`).join(''):'<div class="empty">Chưa tìm thấy truyện phù hợp.<br>Thử tên khác hoặc chọn “Tất cả”.</div>';
  $('continueLabel').textContent=recent&&data.stories.some(s=>s.id===recent)?'Tiếp tục câu chuyện của con':'Bắt đầu khám phá';
 }
 function saveProgress(completed=false){
  if(!story)return;
  progress[story.id]={scene:state.scene,word:state.word,completed:completed||!!progress[story.id]?.completed,updated:Date.now()};storage.set('progress',progress);recent=story.id;storage.set('recent',recent);
 }
 function toggleSave(id){if(saved.has(id))saved.delete(id);else saved.add(id);storage.set('saved',[...saved]);renderLibrary();if(story?.id===id)updateSaveButton();}
 function updateSaveButton(){const on=saved.has(story?.id);$('saveBtn').setAttribute('aria-pressed',String(on));$('saveBtn').lastElementChild.textContent=on?'Đã lưu':'Lưu truyện';}
 function currentRecording(){return story?recordings.get(story.id):null;}
 function clearWord(){if(lastWordNode)lastWordNode.classList.remove('current');lastWordNode=null;}
 function focusWord(si,wi,highlight=true){
  if(!story||!model[si])return;
  const changed=state.scene!==si;state.scene=si;state.word=clamp(wi,0,model[si].length-1);
  sceneNodes.forEach((el,i)=>el.classList.toggle('active',i===si));
  clearWord();if(highlight){lastWordNode=wordNodes[si]?.[state.word];if(lastWordNode)lastWordNode.classList.add('current');}
  if(changed||!$('sceneImage').src){$('sceneImage').src=safeSrc(asset(story.scenes[si].image));$('sceneImage').alt=`${story.titleVi} — cảnh ${si+1}: ${story.scenes[si].vi}`;}
  $('sceneLabel').textContent=`Cảnh ${si+1} / ${story.scenes.length}`;
  $('imageCaption').textContent=story.category==='WEWIN Original'?'WEWIN Original · Truyện và minh họa WeWIN':'Minh họa WEWIN STORYLAND';
  $('imagePrev').disabled=si===0;$('imageNext').disabled=si===story.scenes.length-1;
  if(settings.follow&&state.playing&&changed)sceneNodes[si]?.scrollIntoView({block:'nearest',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
  updatePlayer();
 }
 function activeSeconds(){return state.elapsed+(state.playing&&state.mode==='tts'?(performance.now()-state.clockStart)/1000:0);}
 function updatePlayer(){
  $('playBtn').innerHTML=icon(state.playing?'pause':'play',22);$('playBtn').setAttribute('aria-label',state.playing?'Tạm dừng':'Phát truyện');
  if(!story)return;
  $('prevBtn').disabled=state.scene===0;$('nextBtn').disabled=state.scene===story.scenes.length-1;
  $('progressStart').textContent='Cảnh '+(state.scene+1);$('progressEnd').textContent=story.scenes.length+' cảnh';
  const rec=currentRecording();
  if(state.mode==='recorded'&&rec){
   const dur=Number.isFinite(audio.duration)?audio.duration:0;
   $('seek').value=dur?Math.round(audio.currentTime/dur*1000):0;$('elapsed').textContent=fmt(audio.currentTime)+(dur?' / '+fmt(dur):'');$('timeNote').textContent='· Bản thu âm';$('syncBadge').textContent=rec.cues?'MP3 · Theo từ':rec.sceneCues?'MP3 · Theo cảnh':'MP3 · Chưa có mốc từ';
  }else{
   $('seek').value=state.finished?1000:Math.round(((offsets[state.scene]||0)+state.word)/Math.max(totalWords,1)*1000);
   $('elapsed').textContent='Đã nghe '+fmt(activeSeconds());$('timeNote').textContent='· Giọng đọc thiết bị';$('syncBadge').textContent=settings.wordMode?'Đọc từng từ':voiceBoundaries===false?'Theo câu':voiceBoundaries===true?'Theo từng từ':'Nghe & đọc theo';
  }
  $('playbackStatus').textContent=state.finished?'Đã đến cuối truyện':state.playing?'Đang đọc · '+(state.scene+1)+'/'+story.scenes.length:'Chạm Phát để nghe';
 }
 function halt(save=true){
  state.epoch++;clearTimeout(chainTimer);chainTimer=null;
  if(state.playing&&state.mode==='tts')state.elapsed=activeSeconds();
  state.playing=false;
  if(utterance){utterance.onend=utterance.onerror=utterance.onboundary=utterance.onstart=null;utterance=null;}
  if(synth)synth.cancel();audio.pause();clearWord();
  if(save)saveProgress();updatePlayer();
 }
 function finish(){halt(false);state.finished=true;state.scene=story.scenes.length-1;state.word=model[state.scene].length-1;saveProgress(true);$('completePanel').hidden=false;updatePlayer();toast('Con đã nghe đến cuối truyện. Thử kể lại bằng lời của mình nhé!');}
 function selectedVoice(){return voices.find(v=>v.voiceURI===settings.voice)||voices.find(v=>/^en-US/i.test(v.lang))||voices[0]||null;}
 function nextAfterScene(si,epoch){
  if(epoch!==state.epoch||!state.playing)return;
  if(state.repeat){speakScene(si,0,epoch);return;}
  if(si+1>=story.scenes.length){finish();return;}
  speakScene(si+1,0,epoch);
 }
 function speechError(event,epoch){
  if(epoch!==state.epoch)return;
  if(['canceled','interrupted'].includes(event.error))return;
  halt();toast('Không phát được giọng đọc này. Hãy chọn một giọng tiếng Anh khác trong Cài đặt.');
 }
 function speakScene(si,wi,epoch){
  if(epoch!==state.epoch||!state.playing||!story)return;
  const tokens=model[si];if(!tokens?.length){nextAfterScene(si,epoch);return;}
  wi=clamp(wi,0,tokens.length-1);focusWord(si,wi,false);saveProgress();
  const wordMode=!!settings.wordMode,startChar=tokens[wi].start;
  const text=wordMode?tokens[wi].text:story.scenes[si].en.slice(startChar);
  const u=new SpeechSynthesisUtterance(text);utterance=u;
  const voice=selectedVoice();if(voice)u.voice=voice;u.lang=voice?.lang||'en-US';u.rate=clamp(settings.rate,.5,2);u.volume=clamp(settings.volume,0,1);u.pitch=1;
  let boundaries=0;
  u.onstart=()=>{if(epoch===state.epoch&&state.playing)focusWord(si,wi,wordMode);};
  u.onboundary=e=>{
   if(epoch!==state.epoch||!state.playing||wordMode||e.name==='sentence')return;
   const charIndex=startChar+e.charIndex;
   const index=tokens.findIndex(t=>charIndex>=t.start&&charIndex<t.end);
   if(index>=0){boundaries++;voiceBoundaries=true;focusWord(si,index,true);}
  };
  u.onerror=e=>speechError(e,epoch);
  u.onend=()=>{
   if(epoch!==state.epoch||!state.playing)return;
   if(!wordMode&&!boundaries)voiceBoundaries=false;
   if(wordMode&&wi+1<tokens.length){chainTimer=setTimeout(()=>speakScene(si,wi+1,epoch),25);}
   else chainTimer=setTimeout(()=>nextAfterScene(si,epoch),120);
  };
  try{synth.speak(u);}catch(e){speechError({error:'synthesis-failed'},epoch);}
 }
 function startPlayback(){
  if(!story)return;if(state.readOnly)setReadMode(false);
  if(state.finished){state.finished=false;state.scene=0;state.word=0;state.elapsed=0;$('completePanel').hidden=true;focusWord(0,0,false);}
  const rec=currentRecording();
  if(state.mode==='recorded'&&rec){
   if(audio.src!==new URL(rec.url,location.href).href)audio.src=rec.url;
   state.playing=true;const epoch=state.epoch;audio.playbackRate=settings.rate;
   audio.play().then(()=>{if(epoch!==state.epoch)audio.pause();updatePlayer();}).catch(()=>{if(epoch===state.epoch){state.playing=false;updatePlayer();toast('Chưa mở được bản thu âm. Kiểm tra file hoặc chọn giọng đọc thiết bị.');}});updatePlayer();return;
  }
  if(!synth||!window.SpeechSynthesisUtterance){toast('Trình duyệt này chưa hỗ trợ giọng đọc. Bạn vẫn có thể đọc truyện hoặc tải một bản thu âm riêng.');return;}
  state.playing=true;state.clockStart=performance.now();const epoch=state.epoch;updatePlayer();speakScene(state.scene,state.word,epoch);
 }
 function readFrom(si,wi=0,play=true){
  halt();state.finished=false;$('completePanel').hidden=true;focusWord(si,wi,false);
  const rec=currentRecording();
  if(state.mode==='recorded'&&rec?.cues){const cue=rec.cues.find(c=>c.scene===si&&c.word===wi);if(cue)audio.currentTime=cue.start;}
  else if(state.mode==='recorded'&&rec?.sceneCues){audio.currentTime=rec.sceneCues[si]||0;}
  else if(state.mode==='recorded'&&rec&&!rec.cues&&play){toast('Bản thu này chưa có mốc từ. Hãy dùng thanh thời gian để chọn vị trí nghe.');return;}
  if(play)startPlayback();
 }
 function buildReader(){
  model=story.scenes.map(s=>tokenize(s.en));offsets=[];totalWords=0;model.forEach(x=>{offsets.push(totalWords);totalWords+=x.length;});
  const container=$('storyText');container.replaceChildren();sceneNodes=[];wordNodes=[];
  story.scenes.forEach((sc,si)=>{
   const section=document.createElement('article');section.className='scene';section.dataset.scene=si;
   const label=document.createElement('div');label.className='scene-number';label.innerHTML=`<span>SCENE ${String(si+1).padStart(2,'0')}</span><button class="scene-read" aria-label="Đọc cảnh ${si+1}" data-read-scene="${si}">${icon('play',12)}</button>`;
   const p=document.createElement('p');p.className='english';p.lang='en';let end=0;const words=[];
   model[si].forEach((t,wi)=>{p.appendChild(document.createTextNode(sc.en.slice(end,t.start)));const span=document.createElement('span');span.className='word';span.textContent=t.text;span.dataset.word=wi;span.title='Nghe từ đây';p.appendChild(span);words.push(span);end=t.end;});p.appendChild(document.createTextNode(sc.en.slice(end)));
   p.addEventListener('click',e=>{const target=e.target.closest('.word');readFrom(si,target?Number(target.dataset.word):0,true);});
   const vi=document.createElement('p');vi.className='vietnamese';vi.lang='vi';vi.textContent=sc.vi;
   section.append(label,p,vi);container.appendChild(section);sceneNodes.push(section);wordNodes.push(words);
  });
  $('vocabList').replaceChildren();$('vocabPanel').hidden=!story.vocab?.length;
  (story.vocab||[]).forEach(([en,vi])=>{const b=document.createElement('button');b.className='vocab-word';b.append(document.createTextNode(en));const small=document.createElement('small');small.textContent=vi;b.append(small);b.onclick=()=>pronounce(en);$('vocabList').append(b);});
  $('lessonPanel').hidden=!story.lesson?.length;$('lessonPanel').innerHTML=story.lesson?.length?`<strong>${esc(story.lesson[0])}</strong><small>${esc(story.lesson[1]||'')}</small>`:'';
  $('storyNote').textContent=story.note||'';
 }
 function openStory(id){
  const next=data.stories.find(s=>s.id===id);if(!next)return;
  if(story?.id===id&&!$('readerView').hidden)return;
  halt();story=next;state.finished=false;state.elapsed=0;state.readOnly=false;voiceBoundaries=null;
  $('libraryView').hidden=true;$('readerView').hidden=false;document.body.classList.remove('reader-only');
  $('readerTitle').textContent=story.titleEn;$('readerSubtitle').textContent=story.titleVi;$('readerLevel').textContent=story.level;$('readerLevel').dataset.level=story.level;
  buildReader();const p=progress[id]||{};state.scene=clamp(p.scene,0,story.scenes.length-1);state.word=clamp(p.word,0,model[state.scene].length-1);
  if(!recordings.has(id)&&story.audioSrc)recordings.set(id,{url:story.audioSrc,cues:story.wordCues||null,sceneCues:Array.isArray(story.sceneCues)&&story.sceneCues.length===story.scenes.length?story.sceneCues:null});
  const rec=currentRecording();state.mode=rec?'recorded':'tts';if(rec)audio.src=rec.url;else audio.removeAttribute('src');
  $('sceneImage').removeAttribute('src');focusWord(state.scene,state.word,false);updateSaveButton();setReadMode(false);$('completePanel').hidden=true;
  recent=id;storage.set('recent',id);document.title=story.titleEn+' | WEWIN STORYLAND';window.scrollTo(0,0);$('textPane').scrollTop=0;
  if(state.scene>0)sceneNodes[state.scene]?.scrollIntoView({block:'start'});
  try{history.replaceState(null,'','#story='+encodeURIComponent(id));}catch{}
 }
 function backToLibrary(){halt();story=null;$('readerView').hidden=true;$('libraryView').hidden=false;document.body.classList.remove('reader-only');document.title='WEWIN STORYLAND — Thư viện truyện song ngữ';renderLibrary();try{history.replaceState(null,'',location.pathname+location.search);}catch{}window.scrollTo(0,0);}
 function setReadMode(readOnly){if(readOnly)halt();state.readOnly=readOnly;document.body.classList.toggle('reader-only',readOnly);$('readMode').classList.toggle('active',readOnly);$('listenMode').classList.toggle('active',!readOnly);$('readMode').setAttribute('aria-pressed',String(readOnly));$('listenMode').setAttribute('aria-pressed',String(!readOnly));}
 function pronounce(text){halt();if(!synth||!window.SpeechSynthesisUtterance){toast('Thiết bị chưa có giọng đọc.');return;}const u=new SpeechSynthesisUtterance(text);utterance=u;const v=selectedVoice();if(v)u.voice=v;u.lang=v?.lang||'en-US';u.rate=settings.rate;u.volume=settings.volume;synth.speak(u);toast('Nghe phát âm: '+text);}
 function loadVoices(){
  voices=(synth?.getVoices()||[]).filter(v=>/^en(?:-|_)/i.test(v.lang)||v.lang==='en').sort((a,b)=>Number(b.localService)-Number(a.localService)||a.name.localeCompare(b.name));
  $('voiceSelect').innerHTML='<option value="">Giọng tiếng Anh mặc định</option>'+voices.map(v=>`<option value="${esc(v.voiceURI)}">${esc(v.name)} · ${esc(v.lang)}${v.localService?' · thiết bị':' · trực tuyến'}</option>`).join('');
  if(voices.some(v=>v.voiceURI===settings.voice))$('voiceSelect').value=settings.voice;
  $('voiceHint').textContent=voices.length?'Một số giọng cần Internet. Chọn giọng rõ ràng, phù hợp với con.':'Thiết bị chưa cung cấp danh sách giọng tiếng Anh. Thử Chrome/Edge với giọng tiếng Anh đã cài, hoặc dùng bản thu âm riêng.';
 }
 function validateCues(input){
  const a=Array.isArray(input)?input:input?.cues;
  if(!Array.isArray(a)||a.length!==totalWords)throw Error(`Cần đủ ${totalWords} mốc từ của truyện này, tính theo các nhóm ký tự cách nhau bằng khoảng trắng.`);
  let lastEnd=0;const seen=new Set();
  const result=a.map((c,i)=>{
   if(!Number.isInteger(c.scene)||!Number.isInteger(c.word)||!model[c.scene]?.[c.word]||!Number.isFinite(c.start)||!Number.isFinite(c.end)||c.start<0||c.end<=c.start||c.start<lastEnd-.02)throw Error('Mốc từ không đúng thứ tự hoặc không khớp câu chuyện.');
   if(offsets[c.scene]+c.word!==i)throw Error('Mốc từ phải theo đúng thứ tự câu và từ trong truyện.');
   const k=c.scene+':'+c.word;if(seen.has(k))throw Error('Có mốc từ bị lặp.');seen.add(k);lastEnd=c.end;return {scene:c.scene,word:c.word,start:c.start,end:c.end};
  });
  if(Number.isFinite(audio.duration)&&lastEnd>audio.duration+.5)throw Error('Mốc cuối vượt quá độ dài bản thu.');
  return result;
 }
 function tick(){
  if(state.playing&&story){
   if(state.mode==='recorded'){
    const rec=currentRecording(),cues=rec?.cues,t=audio.currentTime;
    if(!cues?.length&&rec?.sceneCues){let si=0;while(si+1<rec.sceneCues.length&&rec.sceneCues[si+1]<=t)si++;if(state.scene!==si)focusWord(si,0,false);}
    else if(cues?.length){let lo=0,hi=cues.length-1,best=0;while(lo<=hi){const m=(lo+hi)>>1;if(cues[m].start<=t){best=m;lo=m+1;}else hi=m-1;}const q=cues[best];if(t>=q.start&&t<=q.end){if(state.scene!==q.scene||state.word!==q.word||!lastWordNode)focusWord(q.scene,q.word,true);}else clearWord();}
   }
   updatePlayer();
  }
  requestAnimationFrame(tick);
 }
 // Events. No timers are used to guess when the next word is spoken.
 $('storyGrid').addEventListener('click',e=>{const s=e.target.closest('[data-save]');if(s){toggleSave(s.dataset.save);return;}const o=e.target.closest('[data-open]');if(o)openStory(o.dataset.open);});
 $('filters').addEventListener('click',e=>{const b=e.target.closest('[data-category]');if(!b)return;category=b.dataset.category;$('filters').querySelectorAll('[data-category]').forEach(x=>x.classList.toggle('active',x===b));renderLibrary();});
 $('searchInput').addEventListener('input',e=>{query=e.target.value;renderLibrary();});$('levelFilter').onchange=e=>{level=e.target.value;renderLibrary();};
 $('continueBtn').onclick=()=>openStory(data.stories.some(s=>s.id===recent)?recent:data.stories[0].id);
 $('backBtn').onclick=backToLibrary;$('saveBtn').onclick=()=>toggleSave(story.id);
 $('playBtn').onclick=()=>state.playing?halt():startPlayback();$('replayBtn').onclick=()=>{state.finished=true;startPlayback();};
 $('prevBtn').onclick=$('imagePrev').onclick=()=>readFrom(Math.max(0,state.scene-1),0,state.playing);
 $('nextBtn').onclick=$('imageNext').onclick=()=>readFrom(Math.min(story.scenes.length-1,state.scene+1),0,state.playing);
 $('storyText').addEventListener('click',e=>{const b=e.target.closest('[data-read-scene]');if(b)readFrom(Number(b.dataset.readScene),0,true);});
 $('translateBtn').onclick=()=>{settings.translation=!settings.translation;applySettings();persistSettings();};
 $('readMode').onclick=()=>setReadMode(true);$('listenMode').onclick=()=>setReadMode(false);
 $('repeatBtn').onclick=()=>{state.repeat=!state.repeat;$('repeatBtn').setAttribute('aria-pressed',String(state.repeat));$('repeatBtn').style.background=state.repeat?'var(--word)':'';toast(state.repeat?'Đang bật lặp lại cảnh này.':'Đã tắt lặp lại cảnh.');};
 $('rate').onchange=e=>{const was=state.playing;if(state.mode==='tts')halt();settings.rate=Number(e.target.value);applySettings();persistSettings();if(was&&state.mode==='tts')startPlayback();};
 $('seek').addEventListener('change',e=>{
  if(!story)return;const was=state.playing,ratio=Number(e.target.value)/1000;
  if(state.mode==='recorded'&&Number.isFinite(audio.duration)){audio.currentTime=ratio*audio.duration;state.finished=false;updatePlayer();return;}
  const target=Math.min(totalWords-1,Math.floor(ratio*totalWords));let si=offsets.length-1;while(si>0&&offsets[si]>target)si--;readFrom(si,target-offsets[si],was);
 });
 document.querySelectorAll('[data-action=settings]').forEach(b=>b.onclick=()=>{loadVoices();$('audioImportStatus').textContent=story?currentRecording()?'Đã chọn bản thu âm cho phiên này.':'Đang dùng giọng đọc thiết bị.':'Mở một truyện trước khi tải bản thu âm.';$('settingsDialog').showModal();});
 $('closeSettings').onclick=()=>$('settingsDialog').close();
 $('fontSize').oninput=e=>{settings.font=Number(e.target.value);applySettings();persistSettings();};$('volume').oninput=e=>{settings.volume=Number(e.target.value);applySettings();persistSettings();if(utterance)utterance.volume=settings.volume;};
 $('followRead').onchange=e=>{settings.follow=e.target.checked;persistSettings();};$('darkMode').onchange=e=>{settings.dark=e.target.checked;applySettings();persistSettings();};
 $('wordMode').onchange=e=>{const was=state.playing;halt();settings.wordMode=e.target.checked;persistSettings();voiceBoundaries=null;if(was)startPlayback();};
 $('voiceSelect').onchange=e=>{const was=state.playing;halt();settings.voice=e.target.value;persistSettings();voiceBoundaries=null;if(was)startPlayback();};
 $('audioFile').onchange=e=>{
  if(!story){toast('Mở một truyện trước khi chọn bản thu âm.');e.target.value='';return;}
  const f=e.target.files[0];if(!f)return;halt();const old=currentRecording();if(old?.local)URL.revokeObjectURL(old.url);
  const rec={url:URL.createObjectURL(f),cues:null,local:true};recordings.set(story.id,rec);state.mode='recorded';state.finished=false;audio.src=rec.url;audio.load();$('audioImportStatus').textContent='Đã tải bản thu cho phiên này. Thêm mốc từ JSON nếu muốn tô theo từng từ.';updatePlayer();
 };
 $('cueFile').onchange=async e=>{try{if(!story||!currentRecording())throw Error('Chọn bản thu âm trước.');const f=e.target.files[0];if(!f)return;const cues=validateCues(JSON.parse(await f.text()));currentRecording().cues=cues;$('audioImportStatus').textContent=`Đã ghép ${cues.length} mốc từ. Nhấn Phát để nghe và đọc theo.`;updatePlayer();}catch(err){toast(err.message);e.target.value='';}};
 $('useDeviceVoice').onclick=()=>{if(!story)return;halt();const rec=currentRecording();if(rec?.local)URL.revokeObjectURL(rec.url);recordings.delete(story.id);state.mode='tts';audio.removeAttribute('src');$('audioImportStatus').textContent='Đã chuyển về giọng đọc thiết bị.';updatePlayer();};
 $('dataFile').onchange=async e=>{try{const f=e.target.files[0];if(!f)return;const d=validateData(JSON.parse(await f.text()));halt();backToLibrary();data=d;saved=new Set([...saved].filter(id=>data.stories.some(s=>s.id===id)));category='all';level='all';query='';$('searchInput').value='';$('levelFilter').value='all';initBrand();renderLibrary();$('settingsDialog').close();toast('Đã nạp '+data.stories.length+' truyện. Tải lại trang để trở về bộ gốc.');}catch(err){toast(err.message);e.target.value='';}};
 audio.addEventListener('loadedmetadata',updatePlayer);audio.addEventListener('pause',()=>{if(state.mode==='recorded'&&state.playing&&audio.paused&&!audio.ended){state.playing=false;saveProgress();updatePlayer();}});
 audio.addEventListener('ended',()=>{if(state.mode!=='recorded'||!story||!audio.ended)return;if(state.repeat&&currentRecording()?.cues){readFrom(state.scene,0,true);}else finish();});
 audio.addEventListener('error',()=>{if(state.mode==='recorded'){halt();toast('Không mở được bản thu âm. Chọn lại file hoặc dùng giọng đọc thiết bị.');}});
 document.addEventListener('keydown',e=>{if(!story||$('settingsDialog').open||/^(INPUT|SELECT|TEXTAREA|BUTTON)$/.test(e.target.tagName))return;if(e.code==='Space'){e.preventDefault();state.playing?halt():startPlayback();}if(e.key==='ArrowRight')$('nextBtn').click();if(e.key==='ArrowLeft')$('prevBtn').click();});
 window.addEventListener('pagehide',()=>halt());window.addEventListener('hashchange',()=>{const id=decodeURIComponent(location.hash.replace(/^#story=/,''));if(id)openStory(id);else if(story)backToLibrary();});
 function initBrand(){
  $('brandLogo').src=safeSrc(data.logo)||safeSrc(asset(data.stories[0].cover));
  for(const [id,idx] of [['heroOne',0],['heroTwo',2],['heroThree',18]]){const s=data.stories[Math.min(idx,data.stories.length-1)];$(id).src=safeSrc(asset(s.cover||s.scenes[0].image));}
 }
 fillIcons();applySettings();initBrand();renderLibrary();loadVoices();
 if(synth?.addEventListener)synth.addEventListener('voiceschanged',loadVoices);else if(synth)synth.onvoiceschanged=loadVoices;
 const initial=location.hash.startsWith('#story=')?decodeURIComponent(location.hash.slice(7)):null;if(initial)openStory(initial);
 requestAnimationFrame(tick);
 // Read-only diagnostics for integration and automated tests.
 window.STORYLAND_APP={getCatalog:()=>data.stories.map(s=>({id:s.id,en:s.titleEn,vi:s.titleVi,scenes:s.scenes.length,category:s.category})),getState:()=>({...state,storyId:story?.id||null,totalWords}),tokenize,validateData};
})();
