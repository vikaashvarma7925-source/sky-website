(() => {
const img=document.getElementById('frame'),status=document.getElementById('labStatus');let timer=null,gen=0;
const sets={blink:[],mouth:[]};for(const name of Object.keys(sets))for(let i=0;i<7;i++){const x=new Image();x.src=`${name}-${i}.jpg`;sets[name].push(x);}
function reset(){gen++;clearTimeout(timer);if(window.speechSynthesis)window.speechSynthesis.cancel();img.src='../talk/base.jpg';status.textContent='Stopped. Original static photo.';}
async function sequence(name,loop=false){const id=++gen;let i=0;await Promise.all(sets[name].map(x=>x.decode().catch(()=>{})));if(id!==gen)return;
 const step=()=>{if(id!==gen)return;img.src=sets[name][i].src;i++;if(i<7||loop){i%=7;timer=setTimeout(step,name==='blink'?400:240);}else{timer=setTimeout(()=>{if(id===gen){img.src='../talk/base.jpg';status.textContent='Test finished. Original static photo.';}},150);}};step();}
document.getElementById('blink').onclick=()=>{reset();status.textContent='Blink test: pre-rendered 2D face.';sequence('blink');};
document.getElementById('mouth').onclick=()=>{reset();status.textContent='Mouth test: basic open/close, no audio sync.';sequence('mouth');};
document.getElementById('voice').onclick=()=>{reset();if(!window.speechSynthesis){status.textContent='Speech output not available in this browser.';return;}const u=new SpeechSynthesisUtterance('Namaste! Main AURA hoon. Aapki madad ke liye yahan hoon.');u.lang='hi-IN';const v=window.speechSynthesis.getVoices().find(v=>/^hi[-_]/i.test(v.lang));if(v)u.voice=v;let started=false;const timeout=setTimeout(()=>{if(!started){reset();status.textContent='Speech did not start in this browser. Voice test unverified; use animation buttons.';}},5000);u.onstart=()=>{started=true;clearTimeout(timeout);status.textContent='Browser voice speaking. Basic mouth cycle, not lip sync.';sequence('mouth',true);};u.onend=()=>{clearTimeout(timeout);reset();};u.onerror=()=>{clearTimeout(timeout);reset();status.textContent='Browser speech failed. Animation buttons still work.';};window.speechSynthesis.speak(u);};
document.getElementById('stop').onclick=reset;document.addEventListener('visibilitychange',()=>{if(document.hidden)reset();});
})();
