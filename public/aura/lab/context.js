(() => {
const check=document.getElementById('faceEnabled'),image=document.getElementById('talkImg'),note=document.getElementById('faceNote'),stage=document.getElementById('stage');
let loaded=false,timer=null,blink=null,state='idle',generation=0;const urls={blink:[],mouth:[],happy:[]};
function original(){image.src='../talk/base.jpg';}
function stop(){generation++;clearTimeout(timer);clearTimeout(blink);original();}
async function preload(){if(loaded)return;const list=[];for(const n of ['blink','mouth'])for(let i=0;i<7;i++){let x=new Image();x.src=`${n}-${i}.jpg`;urls[n].push(x);list.push(x.decode());}const h=new Image();h.src='happy.jpg';urls.happy=[h];list.push(h.decode());await Promise.all(list);loaded=true;}
function run(name,loop=false){const g=++generation;clearTimeout(timer);let i=0;const step=()=>{if(g!==generation||!check.checked||document.hidden)return;image.src=urls[name][i].src;i++;if(i<urls[name].length||loop){i%=urls[name].length;timer=setTimeout(step,name==='blink'?90:180);}else timer=setTimeout(()=>{if(g===generation)original();},250);};step();}
function idle(){clearTimeout(blink);if(!check.checked||document.hidden)return;blink=setTimeout(()=>{if(state==='idle')run('blink');idle();},7000);}
check.onchange=async()=>{stop();if(!check.checked){note.textContent='Face clips off. Static reference.';return;}note.textContent='Loading local face clips...';try{await preload();if(!check.checked)return;note.textContent='Face clips on. Body remains static; reply tone describes AURA, not your mood.';state=stage.dataset.state||'idle';if(state==='speaking')run('mouth',true);else idle();}catch(e){check.checked=false;stop();note.textContent='Face clips could not load. Static reference retained.';}};
window.addEventListener('aura-state',e=>{state=e.detail.state;if(!check.checked||!loaded)return;stop();if(state==='speaking'){note.textContent='Browser speech started: basic mouth cycle, not lip sync.';run('mouth',true);}else{note.textContent=state==='thinking'?'AI is generating. Body is static.':state==='listening'?'Microphone listening state; face/body gestures not implemented.':'Ready. Face clips enabled, body static.';idle();}});
window.addEventListener('aura-reply',e=>{if(!check.checked||!loaded)return;if(['happy','excited','playful'].includes(e.detail.tone)){note.textContent='AURA reply tone: friendly. Reconstructed face, static body.';run('happy');}});
document.addEventListener('visibilitychange',()=>{stop();if(!document.hidden)idle();});
})();
