(function(){
'use strict';
var log=document.getElementById('log'),input=document.getElementById('input'),sendBtn=document.getElementById('sendBtn'),
form=document.getElementById('chatForm'),statusBox=document.getElementById('status'),provSel=document.getElementById('provider'),
provState=document.getElementById('provState'),clearBtn=document.getElementById('clearBtn'),micBtn=document.getElementById('micBtn'),
ttsToggle=document.getElementById('ttsToggle');
var KEY='aura.history.v1',history=[],busy=false;
var PROVIDERS={};

function loadHistory(){try{var h=JSON.parse(localStorage.getItem(KEY)||'[]');if(Array.isArray(h))history=h.slice(-40);}catch(e){history=[]}}
function saveHistory(){try{localStorage.setItem(KEY,JSON.stringify(history.slice(-40)));}catch(e){}}
function addMsg(role,text,meta,isErr){
  var d=document.createElement('div');d.className='msg '+(role==='user'?'user':'aura')+(isErr?' error':'');
  d.textContent=text;
  if(meta){var m=document.createElement('span');m.className='meta';m.textContent=meta;d.appendChild(m);}
  log.appendChild(d);log.scrollTop=log.scrollHeight;return d;
}
function setStatus(t){if(!t){statusBox.hidden=true;statusBox.textContent='';}else{statusBox.hidden=false;statusBox.textContent=t;}}
function setProvState(cls,txt){provState.className='pill '+cls;provState.textContent=txt;}

function refreshProviderUI(){
  var cur=provSel.value;
  provSel.innerHTML='';
  Object.keys(PROVIDERS).forEach(function(id){
    var p=PROVIDERS[id],o=document.createElement('option');
    o.value=id;o.textContent=p.label+(p.connected?'':' (not connected)');
    o.disabled=!p.connected;provSel.appendChild(o);
  });
  if(PROVIDERS[cur]&&PROVIDERS[cur].connected)provSel.value=cur;
  var sel=PROVIDERS[provSel.value];
  if(sel&&sel.connected)setProvState('ok','Connected: '+sel.label);
  else setProvState('err','No AI provider connected');
}

function loadStatus(){
  return fetch('/api/aura/status',{method:'GET'}).then(function(r){return r.json();}).then(function(s){
    PROVIDERS=s.providers||{};
    refreshProviderUI();
  }).catch(function(){
    PROVIDERS={};provSel.innerHTML='';setProvState('err','Status check failed');
  });
}

var voiceSel=document.getElementById('voiceSel'),rateCtl=document.getElementById('rateCtl'),stopSpeak=document.getElementById('stopSpeak');
var VOICES=[],voicePref=localStorage.getItem('aura.voice')||'';
function aura3d(m){try{if(window.AURA3D&&AURA3D.ready)AURA3D.setState(m);}catch(e){}}
function loadVoices(){
  if(!('speechSynthesis' in window))return;
  VOICES=speechSynthesis.getVoices();
  voiceSel.innerHTML='';
  var pref=VOICES.filter(function(v){return /^(hi|en)(-|_)/i.test(v.lang);});
  var rest=VOICES.filter(function(v){return pref.indexOf(v)<0;});
  pref.concat(rest).forEach(function(v){
    var o=document.createElement('option');o.value=v.voiceURI;
    o.textContent=v.name.replace('Microsoft ','').replace('Google ','')+' ('+v.lang+')';
    voiceSel.appendChild(o);
  });
  if(voicePref&&VOICES.some(function(v){return v.voiceURI===voicePref;}))voiceSel.value=voicePref;
  else{
    var pick=VOICES.find(function(v){return /female|heera|kalpana|madhur|swara|lekha|samantha|zira|sonia/i.test(v.name);})
      ||VOICES.find(function(v){return /^hi/i.test(v.lang);})
      ||VOICES.find(function(v){return /^en[-_]IN/i.test(v.lang);})||VOICES[0];
    if(pick)voiceSel.value=pick.voiceURI;
  }
}
if('speechSynthesis' in window){loadVoices();speechSynthesis.onvoiceschanged=loadVoices;}
voiceSel&&voiceSel.addEventListener('change',function(){voicePref=voiceSel.value;try{localStorage.setItem('aura.voice',voicePref);}catch(e){}});
stopSpeak&&stopSpeak.addEventListener('click',function(){try{speechSynthesis.cancel();}catch(e){}aura3d('idle');});

function speak(text){
  if(!ttsToggle.checked)return;
  if(!('speechSynthesis' in window)){setStatus('Voice output is not supported by this browser.');return;}
  try{
    speechSynthesis.cancel();
    var u=new SpeechSynthesisUtterance(text);
    var v=VOICES.find(function(x){return x.voiceURI===voiceSel.value;});
    if(v)u.voice=v;
    u.lang=v?v.lang:(/[\u0900-\u097F]/.test(text)?'hi-IN':'en-IN');
    u.rate=parseFloat(rateCtl.value)||0.95;u.pitch=1.05;
    u.onstart=function(){aura3d('speaking');};
    u.onend=function(){aura3d('happy');setTimeout(function(){aura3d('idle');},900);};
    u.onerror=function(){aura3d('idle');};
    speechSynthesis.speak(u);
  }catch(e){aura3d('idle');}
}

function send(text){
  if(busy)return;busy=true;sendBtn.disabled=true;input.disabled=true;
  setStatus('AURA is thinking…');aura3d('thinking');
  var msgs=history.map(function(m){return{role:m.role,content:m.content};});
  msgs.push({role:'user',content:text});
  var ctrl=new AbortController();var timer=setTimeout(function(){ctrl.abort();},45000);
  fetch('/api/aura/chat',{method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({messages:msgs,provider:provSel.value}),signal:ctrl.signal})
  .then(function(r){return r.json().then(function(j){return{ok:r.ok,status:r.status,body:j};});})
  .then(function(res){
    clearTimeout(timer);setStatus('');
    if(res.ok&&res.body&&res.body.reply){
      history.push({role:'user',content:text},{role:'assistant',content:res.body.reply});
      saveHistory();
      addMsg('user',text);
      addMsg('aura',res.body.reply,'AURA · '+res.body.model+' · AI answer, not an action');
      speak(res.body.reply);if(!ttsToggle.checked){aura3d('happy');setTimeout(function(){aura3d('idle');},1200);}
    }else{
      var e=(res.body&&res.body.error)||'Something went wrong. Please try again.';
      addMsg('aura',e,'Error',true);
    }
  })
  .catch(function(err){
    clearTimeout(timer);setStatus('');
    addMsg('aura',err.name==='AbortError'?'AURA took too long to answer. Please try again.':'Network problem - please check your connection and try again.','Error',true);
  })
  .finally(function(){if(ttsToggle.checked===false)aura3d('idle');busy=false;input.disabled=false;sendBtn.disabled=input.value.trim()==='';input.focus();});
}

form.addEventListener('submit',function(e){e.preventDefault();var t=input.value.trim();if(!t||busy)return;input.value='';autoGrow();sendBtn.disabled=true;send(t);});
input.addEventListener('input',function(){autoGrow();sendBtn.disabled=input.value.trim()===''||busy;});
input.addEventListener('keydown',function(e){if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();form.requestSubmit();}});
function autoGrow(){input.style.height='auto';input.style.height=Math.min(input.scrollHeight,140)+'px';}

clearBtn.addEventListener('click',function(){
  history=[];try{localStorage.removeItem(KEY);}catch(e){}
  log.innerHTML='';greet();setStatus('Your history in this browser was cleared.');setTimeout(function(){setStatus('');},3000);
});

/* Voice input: shown only when the browser really supports it */
var SR=window.SpeechRecognition||window.webkitSpeechRecognition;
if(SR){
  micBtn.hidden=false;
  var rec=null,listening=false;
  micBtn.addEventListener('click',function(){
    if(listening){try{rec.stop();}catch(e){}return;}
    try{
      rec=new SR();rec.lang='hi-IN';rec.interimResults=false;rec.maxAlternatives=1;
      rec.onresult=function(ev){var t=ev.results[0][0].transcript;input.value=(input.value?input.value+' ':'')+t;autoGrow();sendBtn.disabled=false;};
      rec.onend=function(){listening=false;micBtn.classList.remove('rec');micBtn.title='Voice input';aura3d('idle');};
      rec.onerror=function(ev){listening=false;micBtn.classList.remove('rec');setStatus(ev.error==='not-allowed'?'Microphone permission was denied.':'Voice input did not work: '+ev.error);setTimeout(function(){setStatus('');},4000);};
      rec.start();listening=true;micBtn.classList.add('rec');micBtn.title='Listening… tap to stop';aura3d('listening');
    }catch(e){setStatus('Voice input could not start in this browser.');setTimeout(function(){setStatus('');},4000);}
  });
}

function greet(){
  if(log.children.length===0)addMsg('aura','Namaste! Main AURA hoon, SKY Studio ki AI assistant. Hindi ya English mein baat kar sakti hoon. How can I help you today?','AURA · ready');
}

loadHistory();
history.forEach(function(m){addMsg(m.role,m.content,m.role==='assistant'?'AURA':null);});
greet();
loadStatus();
sendBtn.disabled=true;
})();

;(function(){
  var btn=document.getElementById('demo3dBtn'),panel=document.getElementById('demo3dPanel');
  if(!btn||!panel)return;
  var loaded=false;
  var CLOSED="Show experimental 3D demo (stand-in model, not AURA's real face)",OPEN='Hide experimental 3D demo';
  btn.addEventListener('click',function(){
    var open=panel.hasAttribute('hidden');
    if(open){
      panel.removeAttribute('hidden');btn.setAttribute('aria-expanded','true');btn.textContent=OPEN;
      if(!loaded){loaded=true;var s=document.createElement('script');s.src='vendor-aura3d.js';document.body.appendChild(s);}
      else if(window.AURA3D&&AURA3D.pause)AURA3D.pause(false);
    }else{
      panel.setAttribute('hidden','');btn.setAttribute('aria-expanded','false');btn.textContent=CLOSED;
      if(window.AURA3D&&AURA3D.pause)AURA3D.pause(true);
    }
  });
})();
