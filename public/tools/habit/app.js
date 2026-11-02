var $=function(i){return document.getElementById(i)},MN=['January','February','March','April','May','June','July','August','September','October','November','December'],WD=['Su','Mo','Tu','We','Th','Fr','Sa'],ticks={},arm=0;
function el(t,c,x){var e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e}
function msg(x){var m=$('st');m.textContent=x;m.hidden=!x}
function raw(){return $('hb').value.split('\n').map(function(x){return x.trim()}).filter(Boolean)}
function nk(x){return x.toLowerCase()}
function hab(){var seen={},out=[];raw().forEach(function(x){var k=nk(x.slice(0,24));if(!seen[k]){seen[k]=1;out.push(x.slice(0,24))}});return out.slice(0,10)}
function dups(){var seen={},d=[];raw().forEach(function(x){var k=nk(x.slice(0,24));if(seen[k])d.push(x.slice(0,24));seen[k]=1});return d}
function orph(){var cur={};hab().forEach(function(h){cur[nk(h)]=1});var n=0;Object.keys(ticks).forEach(function(k){var p=JSON.parse(k);if(!cur[p[1]])n++});return n}
function lim(){var r=raw(),n=[],u=dups();if(u.length)n.push('Same habit typed twice, so the repeat is ignored: '+u.slice(0,3).join(', ')+'.');if(hab().length<r.length-u.length)n.push('Only the first 10 habits are used.');if(r.some(function(x){return x.length>24}))n.push('Habit names longer than 24 characters are cut short.');var o=orph();if(o)n.push(o+' tick'+(o>1?'s are':' is')+' saved under a habit name that is not in the list now. If you type that name again, they come back.');return n.join(' ')}
function key(){return $('yr').value+'-'+$('mo').value}
function dim(){return new Date(+$('yr').value,+$('mo').value+1,0).getDate()}
function render(){var g=$('gw');g.textContent='';var h=hab();if(!h.length){g.appendChild(el('p','small','Type at least one habit above to see the sheet.'));$('pr').disabled=true;return}
 $('pr').disabled=false;var t=el('table','ht'),cap=el('caption',null,MN[+$('mo').value]+' '+$('yr').value);t.appendChild(cap);
 var n=dim(),r1=el('tr');r1.appendChild(el('th','hn','Habit'));
 for(var d=1;d<=n;d++){var w=new Date(+$('yr').value,+$('mo').value,d).getDay(),th=el('th',w==0||w==6?'we':'',d);th.appendChild(el('span','wd',WD[w]));r1.appendChild(th)}
 t.appendChild(r1);
 h.forEach(function(name,ri){var r=el('tr');r.appendChild(el('th','hn',name));
  for(var d=1;d<=n;d++){var w=new Date(+$('yr').value,+$('mo').value,d).getDay(),td=el('td',w==0||w==6?'we':''),b=el('button','tk');b.type='button';
   var k=JSON.stringify([key(),nk(name),d]);b.setAttribute('aria-pressed',ticks[k]?'true':'false');b.setAttribute('aria-label',name+', day '+d);b.textContent=ticks[k]?'\u2713':'';
   (function(k,b){b.onclick=function(){if(ticks[k])delete ticks[k];else ticks[k]=1;arm=0;msg(lim());b.setAttribute('aria-pressed',ticks[k]?'true':'false');b.textContent=ticks[k]?'\u2713':''}})(k,b);td.appendChild(b);r.appendChild(td)}
  t.appendChild(r)});
 g.appendChild(t)}
MN.forEach(function(m,i){var o=el('option',null,m);o.value=i;$('mo').appendChild(o)});
var y=new Date().getFullYear();for(var i=y-1;i<=y+2;i++){var o=el('option',null,i);o.value=i;$('yr').appendChild(o)}
$('mo').value=new Date().getMonth();$('yr').value=y;
$('mo').onchange=$('yr').onchange=function(){arm=0;msg(lim());render()};
$('hb').oninput=function(){arm=0;msg(lim());render()};
$('cl').onclick=function(){if(!arm){arm=1;msg('Click "Remove all ticks" again to remove every tick in every month.');return}ticks={};arm=0;msg('All ticks removed.');render()};
$('pr').onclick=function(){window.print()};
render();
