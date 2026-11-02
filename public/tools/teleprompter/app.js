var $=function(i){return document.getElementById(i)},run=false,pos=0,last=0,raf=0;
var view=$('view'),txt=$('txt');
function upd(){$('go').disabled=!$('t').value.trim();$('spv').textContent=$('sp').value;$('fsv').textContent=$('fs').value;txt.style.fontSize=$('fs').value+'px';txt.style.transform=$('mir').checked?'scaleX(-1)':'none'}
['t','sp','fs','mir'].forEach(function(i){$(i).addEventListener('input',upd)});upd();
function max(){return Math.max(0,view.scrollHeight-view.clientHeight)}
function sync(){if(Math.abs(view.scrollTop-pos)>2)pos=view.scrollTop}
view.addEventListener('scroll',sync,{passive:true});
['touchstart','touchend','wheel','pointerdown'].forEach(function(n){view.addEventListener(n,sync,{passive:true})});
function tick(ts){if(!run)return;sync();var dt=last?Math.min(ts-last,100):0;last=ts;
 pos+= (Number($('sp').value)*12)*dt/1000; // px per second = speed*12
 if(pos>=max()){pos=max();view.scrollTop=pos;setRun(false);$('hint').textContent='End of script.';return}
 view.scrollTop=pos;raf=requestAnimationFrame(tick)}
function setRun(r){run=r;$('pp').textContent=r?'Pause':'Play';last=0;cancelAnimationFrame(raf);if(r)raf=requestAnimationFrame(tick)}
$('go').onclick=function(){txt.textContent=$('t').value;$('setup').hidden=true;$('stage').hidden=false;pos=0;view.scrollTop=0;$('hint').textContent='Space = pause or play. Up/Down arrows move the text. Speed changes while it runs.';setRun(true);view.focus()};
$('pp').onclick=function(){sync();if(!run&&pos>=max()&&max()>0){pos=0;view.scrollTop=0}setRun(!run)};
$('back5').onclick=function(){sync();pos=Math.max(0,pos-120);view.scrollTop=pos};
$('rs').onclick=function(){pos=0;view.scrollTop=0;$('hint').textContent='Space = pause or play. Up/Down arrows move the text. Speed changes while it runs.';setRun(true)};
$('ed').onclick=function(){setRun(false);$('stage').hidden=true;$('setup').hidden=false};
view.addEventListener('keydown',function(e){if(e.key===' '){e.preventDefault();$('pp').click()}else if(e.key==='ArrowDown'){e.preventDefault();sync();pos=Math.min(max(),pos+60);view.scrollTop=pos}else if(e.key==='ArrowUp'){e.preventDefault();sync();pos=Math.max(0,pos-60);view.scrollTop=pos}});
document.addEventListener('visibilitychange',function(){if(document.hidden&&run){setRun(false);$('hint').textContent='Paused because the page was hidden.'}});
$('sp').addEventListener('input',function(){/* speed applies on next frame */});
