var $=function(i){return document.getElementById(i)},ok=false;
function el(t,c,x){var e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e}
function render(){var sh=$('sheet'),st=$('st');sh.innerHTML='';var t=$('t').value.trim(),n=$('n').value.trim();
 if(!t||!n){ok=false;$('pr').disabled=true;st.hidden=false;st.className='msg err';st.textContent='Type the title and the name of the person to see the preview.';return}
 ok=true;$('pr').disabled=false;st.hidden=true;
 sh.appendChild(el('div','ct-t',t));sh.appendChild(el('div','ct-p','Presented to'));sh.appendChild(el('div','ct-n',n));
 var b=$('b').value.trim();if(b)sh.appendChild(el('div','ct-b',b));
 var d=$('d').value.trim(),i=$('i').value.trim(),r=$('r').value.trim();
 if(d||i){var f=el('div','ct-f');f.appendChild(el('div',null,d?'Date: '+d:''));var s=el('div',null,i);if(r){s.appendChild(document.createElement('br'));s.appendChild(el('small',null,r))}f.appendChild(i?s:el('div'));sh.appendChild(f)}}
['t','n','b','d','i','r'].forEach(function(k){$(k).addEventListener('input',render)});
$('pr').onclick=function(){if(ok)window.print()};render();
