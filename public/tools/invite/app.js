var $=function(i){return document.getElementById(i)},ok=false,hdTouched=false;
var OC={bd:{en:['Birthday party','You are invited to the birthday of'],hi:['जन्मदिन समारोह','आप सादर आमंत्रित हैं']},
 wd:{en:['Wedding or family function','With joy, we invite you to'],hi:['विवाह या पारिवारिक समारोह','सहर्ष आमंत्रण']},
 sh:{en:['Shop or business opening','You are invited to the opening of'],hi:['दुकान या व्यवसाय का शुभारंभ','आप सादर आमंत्रित हैं']},
 pj:{en:['Puja or religious event','You are warmly invited to'],hi:['पूजा या धार्मिक कार्यक्रम','आपको सादर आमंत्रित किया जाता है']},
 ev:{en:['Other event','You are invited to'],hi:['अन्य कार्यक्रम','आप सादर आमंत्रित हैं']}};
var W={en:{d:'Date: ',t:'Time: ',p:'Venue:',f:'From: ',c:'Contact: '},hi:{d:'दिनांक: ',t:'समय: ',p:'स्थान:',f:'आपका स्नेही: ',c:'संपर्क: '}};
var order=['bd','wd','sh','pj','ev'];
function lang(){return document.querySelector('input[name=lg]:checked').value}
function el(t,c,x){var e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e}
function opts(){var s=$('oc'),v=s.value||'bd';s.innerHTML='';order.forEach(function(k){var o=document.createElement('option');o.value=k;o.textContent=OC[k][lang()][0];s.appendChild(o)});s.value=v}
function head(sw){if(!hdTouched){$('hd').value=OC[$('oc').value][lang()][1];$('hn').hidden=true}else if(sw){$('hn').hidden=false}}
var K=1,fits=true;
function fit(){var sh=$('sheet'),old=$('mz');if(old)old.remove();var m=sh.cloneNode(true);m.id='mz';document.body.appendChild(m);
 var k=1;fits=false;
 for(;k>=0.45;k-=0.05){m.style.setProperty('--k',k.toFixed(2));var cs=getComputedStyle(m),f=m.firstElementChild.getBoundingClientRect(),l=m.lastElementChild.getBoundingClientRect(),room=m.clientHeight-parseFloat(cs.paddingTop)-parseFloat(cs.paddingBottom);if(l.bottom-f.top<=room-(sh.classList.contains('b')?50:6)){fits=true;break}}
 m.remove();K=Math.max(k,0.45);sh.style.setProperty('--k',K.toFixed(2));$('pr').disabled=!fits;
 if(!fits){var st=$('st');st.hidden=false;st.className='msg err';st.textContent='The text is too long to fit one page. Shorten some lines.'}}
function render(){var sh=$('sheet'),st=$('st'),w=W[lang()];sh.innerHTML='';sh.className='iv '+$('st2').value;
 var nm=$('nm').value.trim(),dt=$('dt').value.trim(),pl=$('pl').value.trim();
 if(!nm||!dt||!pl){ok=false;$('pr').disabled=true;st.hidden=false;st.className='msg err';st.textContent='Type the name of the event, the date and the place to see the card.';return}
 ok=true;$('pr').disabled=false;st.hidden=true;
 var hd=$('hd').value.trim();if(hd)sh.appendChild(el('div','iv-h',hd));
 sh.appendChild(el('div','iv-n',nm));var ex=$('ex').value.trim();if(ex)sh.appendChild(el('div','iv-x',ex));
 sh.appendChild(el('div','iv-r'));
 var tm=$('tm').value.trim();sh.appendChild(el('div','iv-d',w.d+dt+(tm?'\n'+w.t+tm:'')));
 sh.appendChild(el('div','iv-p',w.p+'\n'+pl));
 var ho=$('ho').value.trim(),ct=$('ct').value.trim();if(ho||ct)sh.appendChild(el('div','iv-f',(ho?w.f+ho:'')+(ho&&ct?'\n':'')+(ct?w.c+ct:'')));
 sh.querySelector('.iv-d').style.whiteSpace='pre-wrap';fit()}
$('oc').onchange=function(){head(1);render()};
document.querySelectorAll('input[name=lg]').forEach(function(r){r.onchange=function(){opts();head(1);render()}});
$('hd').addEventListener('input',function(){hdTouched=$('hd').value.trim()!=='';if(!hdTouched)head();render()});
['st2','nm','ex','dt','tm','pl','ho','ct'].forEach(function(k){$(k).addEventListener('input',render);$(k).addEventListener('change',render)});
$('pr').onclick=function(){if(ok)window.print()};
opts();head();render();
