var $=function(i){return document.getElementById(i)},ME=8;
var SECS=[['Personal details',[['name','Full name',60],['dob','Date of birth',30],['tob','Time of birth',20],['pob','Place of birth',60],['ht','Height',20],['cmp','Complexion',20],['rel','Religion',30],['lang','Languages known',60]]],
 ['Education and work',[['edu','Education',80],['occ','Occupation',60],['emp','Company / employer',60],['inc','Yearly income',40]]],
 ['Family details',[['fa','Father\'s name',60],['fo','Father\'s occupation',60],['mo','Mother\'s name',60],['mc','Mother\'s occupation',60],['sib','Brothers / sisters',80]]],
 ['Contact',[['ph','Phone',30],['em','Email',80],['ad','Address',160]]]];
function el(t,c,x){var e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e}
function mkInput(id,lab,ml){var w=el('div'),l=el('label','lbl',lab);l.setAttribute('for',id);var a=document.createElement('input');a.type='text';a.id=id;a.maxLength=ml;a.className='txt';a.addEventListener('input',render);w.appendChild(l);w.appendChild(a);return w}
SECS.forEach(function(s){var d=el('div','bd-sec');d.appendChild(el('p','lbl',s[0]));s[1].forEach(function(f){d.appendChild(mkInput('f_'+f[0],f[1],f[2]))});$('fields').appendChild(d)});
function addExtra(){if($('extra').children.length>=ME)return;var n=$('extra').children.length+1,r=el('div','bd-ex');
 var a=document.createElement('input');a.type='text';a.maxLength=30;a.className='txt';a.placeholder='Label';a.setAttribute('aria-label','Extra line '+n+' label');a.addEventListener('input',render);
 var b=document.createElement('input');b.type='text';b.maxLength=120;b.className='txt';b.placeholder='Details';b.setAttribute('aria-label','Extra line '+n+' details');b.addEventListener('input',render);
 var x=el('button',null,'Remove');x.type='button';x.onclick=function(){r.remove();$('adde').disabled=false;render()};r.appendChild(a);r.appendChild(b);r.appendChild(x);$('extra').appendChild(r);$('adde').disabled=$('extra').children.length>=ME}
var ok=false;
function render(){var sh=$('sheet'),st=$('st');sh.innerHTML='';var nm=$('f_name').value.trim();
 if(!nm){ok=false;$('pr').disabled=true;st.hidden=false;st.className='msg err';st.textContent='Type the full name to see the preview.';return}
 ok=true;$('pr').disabled=false;st.hidden=true;
 sh.appendChild(el('div','bd-t','BIODATA'));
 SECS.forEach(function(s){var rows=s[1].map(function(f){return [f[1],$('f_'+f[0]).value.trim()]}).filter(function(r){return r[1]});
  if(s[0]==='Personal details'&&!rows.length)return;
  if(!rows.length)return;sh.appendChild(el('h2','bd-h',s[0]));var t=el('table','bd-tb');rows.forEach(function(r){var tr=el('tr');tr.appendChild(el('th',null,r[0]));tr.appendChild(el('td',null,r[1]));t.appendChild(tr)});sh.appendChild(t)});
 var ex=[].map.call($('extra').children,function(r){return [r.children[0].value.trim(),r.children[1].value.trim()]}).filter(function(r){return r[0]&&r[1]});
 if(ex.length){sh.appendChild(el('h2','bd-h','Other details'));var t=el('table','bd-tb');ex.forEach(function(r){var tr=el('tr');tr.appendChild(el('th',null,r[0]));tr.appendChild(el('td',null,r[1]));t.appendChild(tr)});sh.appendChild(t)}}
$('adde').onclick=function(){addExtra();render()};$('pr').onclick=function(){if(ok)window.print()};
render();
