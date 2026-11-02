var $=function(i){return document.getElementById(i)},DN=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],cells={},clr=0;
function el(t,c,x){var e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e}
function nd(){return +$('dy').value}function np(){return +$('np').value}
function tm(m){m=m%1440;var h=Math.floor(m/60),n=m%60,a=h>=12?'PM':'AM';h=h%12||12;return h+':'+(n<10?'0':'')+n+' '+a}
function t0(){var v=$('t0').value||'16:00',p=v.split(':');return (+p[0])*60+(+p[1])}
function lab(p){var s=t0()+p*+$('ln').value;return tm(s)+' - '+tm(s+ +$('ln').value)}
function grid(){var g=$('gw');g.textContent='';var t=el('table','gt'),h=el('tr');h.appendChild(el('th',null,'Time'));
 for(var d=0;d<nd();d++)h.appendChild(el('th',null,DN[d]));t.appendChild(h);
 for(var p=0;p<np();p++){var r=el('tr');r.appendChild(el('th','tt',lab(p)));
  for(var d=0;d<nd();d++){var td=el('td'),i=el('input','cin');i.type='text';i.maxLength=20;i.value=cells[p+'_'+d]||'';i.setAttribute('aria-label',DN[d]+' '+lab(p));
   (function(k){i.oninput=function(){cells[k]=this.value;if(clr){clr=0;msg('')}rs()}})(p+'_'+d);td.appendChild(i);r.appendChild(td)}
  t.appendChild(r)}
 g.appendChild(t)}
function rs(){var s=$('sheet');s.textContent='';s.className=np()>=7?'dn2':np()>=5?'dn':'';var ti=$('ti').value.trim();if(ti)s.appendChild(el('h2',null,ti));
 var t=el('table'),h=el('tr');h.appendChild(el('th',null,'Time'));for(var d=0;d<nd();d++)h.appendChild(el('th',null,DN[d]));t.appendChild(h);
 for(var p=0;p<np();p++){var r=el('tr');r.appendChild(el('th',null,lab(p)));for(var d=0;d<nd();d++)r.appendChild(el('td',null,(cells[p+'_'+d]||'').trim()));t.appendChild(r)}
 s.appendChild(t)}
function msg(x){var m=$('st');m.textContent=x;m.hidden=!x}
function all(){clr=0;grid();rs()}
for(var i=1;i<=10;i++){var o=el('option',null,i);o.value=i;if(i==5)o.selected=true;$('np').appendChild(o)}
['dy','np','ln'].forEach(function(i){$(i).onchange=function(){msg('');all()}});
$('t0').oninput=function(){if(!this.value){msg('Start time was empty. Showing 4:00 PM until you pick a time.');clr=0;grid();rs();return}msg('');all()};$('t0').onchange=function(){if(!this.value){this.value='16:00';msg('Start time was empty, so it is back to 4:00 PM.');all()}};$('ti').oninput=function(){clr=0;rs()};
$('fl').onclick=function(){clr=0;var l=$('sb').value.split('\n').map(function(x){return x.trim().slice(0,20)}).filter(Boolean).slice(0,12);
 if(!l.length){msg('Type at least one subject first.');return}
 var n=0,k=0;for(var d=0;d<nd();d++)for(var p=0;p<np();p++){var key=p+'_'+d;if(!(cells[key]||'').trim()){cells[key]=l[k%l.length];k++;n++}}
 msg(n?n+' empty boxes filled. Change any box you like.':'No empty boxes to fill.');all()};
$('cl').onclick=function(){if(!clr){clr=1;msg('Click "Clear all boxes" again to remove everything you typed, including boxes that are not shown now.');return}cells={};clr=0;msg('Boxes cleared.');all()};
$('pr').onclick=function(){window.print()};
all();
