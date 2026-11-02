(function(){
'use strict';

/* ================= 360 spin viewer =================
   Pre-rendered views from the user's own reference video. Interactive
   rotation/zoom over 48 stills - honestly disclosed as not a true 3D model.
   No fake "alive" motion: the character does not animate while talking. */
var FRAMES=48;
var stage=document.getElementById('spinStage'),spinBox=document.getElementById('spinBox'),
spinImg=document.getElementById('spinImg'),statePill=document.getElementById('statePill'),
playBtn=document.getElementById('spinPlay'),resetBtn=document.getElementById('spinReset'),
zoomInBtn=document.getElementById('zoomIn'),zoomOutBtn=document.getElementById('zoomOut'),
spinProg=document.getElementById('spinProg');

var loaded=[],cache=[],loadedCount=0,cur=0,playing=false,timer=null,zoom=1,dragging=false;
for(var i0=0;i0<FRAMES;i0++)loaded.push(false);
function frameUrl(n){return 'spin/f'+('00'+(n+1)).slice(-3)+'.webp';}
var ORDER=[0,8,16,24,32,40,4,12,20,28,36,44,2,6,10,14,18,22,26,30,34,38,42,46];
for(var r0=0;r0<FRAMES;r0++){if(ORDER.indexOf(r0)<0)ORDER.push(r0);}
var oi=0;
function nearestLoaded(k){
  k=((k%FRAMES)+FRAMES)%FRAMES;
  for(var d=0;d<FRAMES;d++){
    if(loaded[(k+d)%FRAMES])return (k+d)%FRAMES;
    if(loaded[(k-d+FRAMES)%FRAMES])return (k-d+FRAMES)%FRAMES;
  }
  return -1;
}
function render(k){
  cur=((k%FRAMES)+FRAMES)%FRAMES;
  var n=nearestLoaded(cur);
  if(n>=0&&cache[n])spinImg.src=cache[n].src;
}
function loadWorker(){
  if(oi>=ORDER.length)return;
  var n=ORDER[oi++];
  var im=new Image();
  im.onload=function(){
    loaded[n]=true;cache[n]=im;loadedCount++;
    if(spinProg)spinProg.textContent=loadedCount<FRAMES?('Loading 360\u00B0 views\u2026 '+loadedCount+'/'+FRAMES):'';
    if(n===nearestLoaded(cur))render(cur);
    loadWorker();
  };
  im.onerror=function(){loadWorker();};
  im.src=frameUrl(n);
}
for(var w0=0;w0<4;w0++)loadWorker();

function setPlaying(p){
  playing=p;
  if(playBtn){playBtn.textContent=p?'Pause rotation':'Auto-rotate';playBtn.setAttribute('aria-pressed',p?'true':'false');}
  if(timer){clearInterval(timer);timer=null;}
  if(p)timer=setInterval(function(){if(!dragging)render(cur+1);},140);
}
playBtn&&playBtn.addEventListener('click',function(){setPlaying(!playing);});
resetBtn&&resetBtn.addEventListener('click',function(){render(0);});
function applyZoom(){spinImg.style.transform='scale('+zoom+')';}
zoomInBtn&&zoomInBtn.addEventListener('click',function(){zoom=Math.min(2.5,zoom+0.25);applyZoom();});
zoomOutBtn&&zoomOutBtn.addEventListener('click',function(){zoom=Math.max(1,zoom-0.25);applyZoom();});
spinBox.addEventListener('wheel',function(e){
  e.preventDefault();
  zoom=Math.min(2.5,Math.max(1,zoom+(e.deltaY<0?0.12:-0.12)));
  applyZoom();
},{passive:false});

var dragX=0,dragStart=0;
spinBox.addEventListener('pointerdown',function(e){
  dragging=true;dragX=e.clientX;dragStart=cur;
  if(timer){clearInterval(timer);timer=null;}
  spinBox.setPointerCapture(e.pointerId);
});
spinBox.addEventListener('pointermove',function(e){
  if(!dragging)return;
  var step=Math.round((e.clientX-dragX)/9);
  render(dragStart+step);
});
function endDrag(){
  if(!dragging)return;
  dragging=false;
  if(playing)setPlaying(true);
}
spinBox.addEventListener('pointerup',endDrag);
spinBox.addEventListener('pointercancel',endDrag);

/* app status indicator (UI only - not character animation) */
var STATE_TXT={idle:'Ready',listening:'Listening\u2026',thinking:'Thinking\u2026',speaking:'Speaking'};
var curEmo='';
function setState(s,emo){
  stage.dataset.state=s;
  curEmo=emo||'';
  statePill.textContent=(STATE_TXT[s]||s)+(s==='speaking'&&curEmo?' \u00B7 '+curEmo:'');
}
var reducedMotion=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
setPlaying(!reducedMotion);

/* ================= chat ================= */
var log=document.getElementById('log'),input=document.getElementById('input'),sendBtn=document.getElementById('sendBtn'),
stopBtn=document.getElementById('stopBtn'),form=document.getElementById('chatForm'),statusBox=document.getElementById('status'),
provSel=document.getElementById('provider'),provState=document.getElementById('provState'),
clearBtn=document.getElementById('clearBtn'),micBtn=document.getElementById('micBtn'),
ttsToggle=document.getElementById('ttsToggle'),provList=document.getElementById('provList');
var KEY='aura.history.v1',history=[],busy=false,PROVIDERS={},ctrl=null,lastFailed=null;

function loadHistory(){try{var h=JSON.parse(localStorage.getItem(KEY)||'[]');if(Array.isArray(h))history=h.slice(-40);}catch(e){history=[]}}
function saveHistory(){try{localStorage.setItem(KEY,JSON.stringify(history.slice(-40)));}catch(e){}}
function addMsg(role,text,meta,isErr){
  var d=document.createElement('div');d.className='msg '+(role==='user'?'user':'aura')+(isErr?' error':'');
  d.appendChild(document.createTextNode(text));
  if(meta){var m=document.createElement('span');m.className='meta';m.textContent=meta;d.appendChild(m);}
  log.appendChild(d);log.scrollTop=log.scrollHeight;return d;
}
function setBubbleText(d,t){d.childNodes[0].nodeValue=t;log.scrollTop=log.scrollHeight;}
function setStatus(t,withRetry){
  statusBox.innerHTML='';
  if(!t){statusBox.hidden=true;return;}
  statusBox.hidden=false;
  statusBox.appendChild(document.createTextNode(t));
  if(withRetry&&lastFailed){
    var b=document.createElement('button');b.type='button';b.className='retrybtn';b.textContent='Retry';
    b.addEventListener('click',function(){
      if(busy)return;
      var f=lastFailed;lastFailed=null;
      if(f.errBubble&&f.errBubble.parentNode)f.errBubble.parentNode.removeChild(f.errBubble);
      setStatus('');send(f.text,f.userBubble);
    });
    statusBox.appendChild(b);
  }
}
function setProvState(cls,txt){provState.className='pill '+cls;provState.textContent=txt;}

function refreshProviderUI(){
  var curP=provSel.value;
  provSel.innerHTML='';
  Object.keys(PROVIDERS).forEach(function(id){
    var p=PROVIDERS[id],o=document.createElement('option');
    o.value=id;o.textContent=p.label+(p.connected?'':' (not connected)');
    o.disabled=!p.connected;provSel.appendChild(o);
  });
  if(PROVIDERS[curP]&&PROVIDERS[curP].connected)provSel.value=curP;
  var sel=PROVIDERS[provSel.value];
  if(sel&&sel.connected)setProvState('ok','Connected: '+sel.label);
  else setProvState('err','No AI provider connected');
  if(provList){
    provList.innerHTML='';
    Object.keys(PROVIDERS).forEach(function(id){
      var p=PROVIDERS[id],li=document.createElement('li');
      li.textContent=p.label+' ('+p.model+'): '+(p.connected?'Connected':'Not configured yet - no key added');
      provList.appendChild(li);
    });
  }
}
function loadStatus(){
  return fetch('/api/aura/status',{method:'GET'}).then(function(r){return r.json();}).then(function(s){
    PROVIDERS=s.providers||{};
    refreshProviderUI();
  }).catch(function(){
    PROVIDERS={};provSel.innerHTML='';setProvState('err','Status check failed');
  });
}

/* ================= voice out (with per-reply tone) ================= */
var voiceSel=document.getElementById('voiceSel'),rateCtl=document.getElementById('rateCtl'),stopSpeak=document.getElementById('stopSpeak');
var VOICES=[],voicePref=localStorage.getItem('aura.voice')||'';
var EMO_VOICE={neutral:{rate:1.0,pitch:1.05},happy:{rate:1.03,pitch:1.14},excited:{rate:1.08,pitch:1.2},concerned:{rate:0.94,pitch:0.98},thinking:{rate:0.96,pitch:1.0}};
function loadVoices(){
  if(!('speechSynthesis' in window))return;
  VOICES=speechSynthesis.getVoices();
  voiceSel.innerHTML='';
  var auto=document.createElement('option');auto.value='';auto.textContent='Auto (match reply language)';voiceSel.appendChild(auto);
  var pref=VOICES.filter(function(v){return /^(hi|en)(-|_)/i.test(v.lang);});
  var rest=VOICES.filter(function(v){return pref.indexOf(v)<0;});
  pref.concat(rest).forEach(function(v){
    var o=document.createElement('option');o.value=v.voiceURI;
    o.textContent=v.name.replace('Microsoft ','').replace('Google ','')+' ('+v.lang+')';
    voiceSel.appendChild(o);
  });
  voiceSel.value=voicePref;
}
if('speechSynthesis' in window){loadVoices();speechSynthesis.onvoiceschanged=loadVoices;}
voiceSel&&voiceSel.addEventListener('change',function(){
  voicePref=voiceSel.value;
  try{localStorage.setItem('aura.voice',voicePref);}catch(e){}
});
stopSpeak&&stopSpeak.addEventListener('click',function(){try{speechSynthesis.cancel();}catch(e){}setState('idle');});

function pickVoiceFor(text){
  if(voicePref){var v0=VOICES.find(function(x){return x.voiceURI===voicePref;});if(v0)return v0;}
  var hindi=/[\u0900-\u097F]/.test(text);
  var cand=null;
  if(hindi){
    cand=VOICES.find(function(v){return /^hi/i.test(v.lang)&&/google/i.test(v.name);})
      ||VOICES.find(function(v){return /^hi/i.test(v.lang);});
  }
  if(!cand){
    cand=VOICES.find(function(v){return /female|heera|kalpana|madhur|swara|lekha|samantha|zira|sonia|veena/i.test(v.name);})
      ||VOICES.find(function(v){return /^en[-_]IN/i.test(v.lang);})
      ||VOICES.find(function(v){return /^en/i.test(v.lang);});
  }
  return cand||VOICES[0]||null;
}
function speak(text,emo){
  if(!ttsToggle.checked)return;
  if(!('speechSynthesis' in window)){setStatus('Voice output is not supported by this browser.');return;}
  try{
    speechSynthesis.cancel();
    var u=new SpeechSynthesisUtterance(text);
    var v=pickVoiceFor(text);
    if(v)u.voice=v;
    u.lang=v?v.lang:(/[\u0900-\u097F]/.test(text)?'hi-IN':'en-IN');
    var tone=EMO_VOICE[emo]||EMO_VOICE.neutral;
    u.rate=(parseFloat(rateCtl.value)||0.95)*tone.rate;
    u.pitch=tone.pitch;
    u.onstart=function(){setState('speaking',emo);};
    u.onend=function(){setState('idle');};
    u.onerror=function(){setState('idle');};
    speechSynthesis.speak(u);
  }catch(e){setState('idle');}
}

/* ================= send (streaming when available) ================= */
function splitEmotion(t){
  var m=/^\s*\[(neutral|happy|concerned|thinking|excited)\]\s*/i.exec(t);
  if(m)return{emo:m[1].toLowerCase(),text:t.slice(m[0].length)};
  return{emo:'neutral',text:t};
}
function visibleStreamText(raw){
  if(raw.charAt(0)==='['){
    var close=raw.indexOf(']');
    if(close>=0&&close<24)return raw.slice(close+1).replace(/^\s+/,'');
    if(raw.length<24)return '';
    return raw;
  }
  return raw;
}
function setBusy(b){
  busy=b;
  sendBtn.disabled=b||input.value.trim()==='';
  stopBtn.hidden=!b;
}
function fail(text,userBubble,msg){
  if(userBubble)userBubble.classList.add('failed');
  var errB=addMsg('aura',msg,'Error',true);
  lastFailed={text:text,userBubble:userBubble,errBubble:errB};
  setStatus('That did not go through.',true);
  setState('idle');
}
function send(text,existingUserBubble){
  if(busy)return;
  setBusy(true);
  setStatus('AURA is thinking\u2026');
  setState('thinking');
  var userBubble=existingUserBubble||addMsg('user',text);
  if(existingUserBubble)existingUserBubble.classList.remove('failed');
  var msgs=history.map(function(m){return{role:m.role,content:m.content};});
  msgs.push({role:'user',content:text});
  ctrl=new AbortController();
  var timer=setTimeout(function(){try{ctrl.abort();}catch(e){}},60000);
  fetch('/api/aura/chat',{method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({messages:msgs,provider:provSel.value,stream:true}),signal:ctrl.signal})
  .then(function(r){
    var ct=r.headers.get('Content-Type')||'';
    if(r.ok&&ct.indexOf('text/event-stream')>=0)return {stream:r};
    return r.json().then(function(j){return{ok:r.ok,body:j};});
  })
  .then(function(res){
    if(res.stream)return consumeStream(res.stream,text,userBubble,timer);
    clearTimeout(timer);
    finishJson(res,text,userBubble);
  })
  .catch(function(err){
    clearTimeout(timer);
    setStatus('');
    if(err&&err.name==='AbortError'){
      addMsg('aura','Stopped.','AURA',false);
      setState('idle');
    }else{
      fail(text,userBubble,'Network problem - please check your connection and try again.');
    }
  })
  .finally(function(){
    clearTimeout(timer);
    setBusy(false);
    sendBtn.disabled=input.value.trim()==='';
    input.focus();
  });
}
function finishJson(res,text,userBubble){
  setStatus('');
  if(res.ok&&res.body&&res.body.reply){
    lastFailed=null;
    var split=splitEmotion(res.body.reply);
    var emo=res.body.emotion||split.emo;
    history.push({role:'user',content:text},{role:'assistant',content:split.text});
    saveHistory();
    addMsg('aura',split.text,'AURA \u00B7 '+res.body.model+' \u00B7 tone: '+emo+' \u00B7 AI answer, not an action');
    if(ttsToggle.checked)speak(split.text,emo);else setState('idle');
  }else{
    var e=(res.body&&res.body.error)||'Something went wrong. Please try again.';
    fail(text,userBubble,e);
  }
}
function consumeStream(r,text,userBubble,timer){
  var model=r.headers.get('X-AURA-Model')||'Cloudflare Workers AI';
  var bubble=addMsg('aura','\u2026','AURA \u00B7 '+model+' \u00B7 streaming');
  var raw='',reader=r.body.getReader(),dec=new TextDecoder(),buf='';
  setStatus('');
  function pump(){
    return reader.read().then(function(chunk){
      if(chunk.done){done(false,false);return;}
      buf+=dec.decode(chunk.value,{stream:true});
      var parts=buf.split('\n\n');
      buf=parts.pop();
      parts.forEach(function(evt){
        evt.split('\n').forEach(function(line){
          if(line.indexOf('data:')!==0)return;
          var payload=line.slice(5).trim();
          if(payload==='[DONE]'||!payload)return;
          try{
            var j=JSON.parse(payload);
            if(typeof j.response==='string'){raw+=j.response;setBubbleText(bubble,visibleStreamText(raw)||'\u2026');}
          }catch(e){}
        });
      });
      return pump();
    }).catch(function(err){
      if(err&&err.name==='AbortError'){done(true,false);return;}
      if(raw){done(false,true);}
      else fail(text,userBubble,'The reply was interrupted. Please try again.');
    });
  }
  function done(stopped,interrupted){
    clearTimeout(timer);
    var split=splitEmotion(raw);
    var acc=split.text,emo=split.emo;
    if(acc){
      var shown=acc;
      if(stopped)shown+='\n\u2026(stopped)';
      else if(interrupted)shown+='\n\u2026(interrupted - reply may be incomplete)';
      setBubbleText(bubble,shown);
      if(!stopped){
        history.push({role:'user',content:text},{role:'assistant',content:acc});
        saveHistory();
        lastFailed=null;
      }
      if(ttsToggle.checked&&!stopped)speak(acc,emo);else setState('idle');
    }else if(stopped){
      if(bubble.parentNode)bubble.parentNode.removeChild(bubble);
      setState('idle');
    }
  }
  return pump();
}

form.addEventListener('submit',function(e){
  e.preventDefault();
  var t=input.value.trim();
  if(!t||busy)return;
  input.value='';autoGrow();
  lastFailed=null;setStatus('');
  send(t);
});
stopBtn.addEventListener('click',function(){if(ctrl){try{ctrl.abort();}catch(e){}}});
input.addEventListener('input',function(){autoGrow();sendBtn.disabled=input.value.trim()===''||busy;});
input.addEventListener('keydown',function(e){if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();form.requestSubmit();}});
function autoGrow(){input.style.height='auto';input.style.height=Math.min(input.scrollHeight,140)+'px';}

clearBtn.addEventListener('click',function(){
  history=[];try{localStorage.removeItem(KEY);}catch(e){}
  log.innerHTML='';greet();
  setStatus('Your history in this browser was cleared.');
  setTimeout(function(){setStatus('');},3000);
});

/* voice input: shown only when the browser really supports it */
var SR=window.SpeechRecognition||window.webkitSpeechRecognition;
if(SR){
  micBtn.hidden=false;
  var rec=null,listening=false;
  micBtn.addEventListener('click',function(){
    if(listening){try{rec.stop();}catch(e){}return;}
    try{
      rec=new SR();rec.lang='hi-IN';rec.interimResults=false;rec.maxAlternatives=1;
      rec.onresult=function(ev){
        var t=ev.results[0][0].transcript;
        input.value=(input.value?input.value+' ':'')+t;
        autoGrow();sendBtn.disabled=false;
      };
      rec.onend=function(){listening=false;micBtn.classList.remove('rec');micBtn.title='Voice input';setState('idle');};
      rec.onerror=function(ev){
        listening=false;micBtn.classList.remove('rec');
        setStatus(ev.error==='not-allowed'?'Microphone permission was denied.':'Voice input did not work: '+ev.error);
        setTimeout(function(){setStatus('');},4000);setState('idle');
      };
      rec.start();listening=true;micBtn.classList.add('rec');micBtn.title='Listening\u2026 tap to stop';setState('listening');
    }catch(e){setStatus('Voice input could not start in this browser.');setTimeout(function(){setStatus('');},4000);}
  });
}

function greet(){
  if(log.children.length===0)addMsg('aura','Namaste! Main AURA hoon, SKY Studio ki AI assistant. Hindi ya English mein baat kar sakti hoon. How can I help you today?','AURA \u00B7 ready');
}

loadHistory();
history.forEach(function(m){addMsg(m.role,m.content,m.role==='assistant'?'AURA':null);});
greet();
loadStatus();
sendBtn.disabled=true;
})();
