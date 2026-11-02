var $=function(i){return document.getElementById(i)},cards=[],order=[],pos=0,shown=false;
function el(t,c,x){var e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e}
var SG=(typeof Intl!=='undefined'&&Intl.Segmenter)?new Intl.Segmenter(undefined,{granularity:'grapheme'}):null;
function gs(s){if(SG){var o=[];for(var x of SG.segment(s))o.push(x.segment);return o}return Array.from(s)}
function glen(s){return gs(s).length}
function gcut(s,n){var g=gs(s);return g.length>n?g.slice(0,n).join(''):s}
function parse(){var ok=[],bad=[],over=0,lines=$('tx').value.split('\n');
 lines.forEach(function(l,i){if(!l.trim())return;var j=l.indexOf('|');if(j<0){bad.push(i+1);return}var f=l.slice(0,j).trim(),b=l.slice(j+1).trim();if(!f||!b){bad.push(i+1);return}if(ok.length>=40){over++;return}ok.push({f:gcut(f,60),b:gcut(b,120),cut:glen(f)>60||glen(b)>120})});
 return {ok:ok,bad:bad,over:over}}
function upd(){var r=parse(),n=[];cards=r.ok;
 if(r.bad.length)n.push('Line'+(r.bad.length>1?'s ':' ')+r.bad.slice(0,8).join(', ')+(r.bad.length>8?' and more':'')+' not used: each card needs text on both sides of the | sign.');
 if(r.over)n.push(r.over+' card'+(r.over>1?'s':'')+' after the first 40 not used.');
 var c=cards.filter(function(x){return x.cut}).length;if(c)n.push(c+' card'+(c>1?'s have':' has')+' text that is too long and is cut short (front 60, back 120 characters).');
 var m=$('st');m.textContent=n.join(' ');m.hidden=!n.length;
 if(order.length!==cards.length){order=cards.map(function(_,i){return i});pos=0;shown=false}if(pos>=cards.length)pos=0;study();sheet()}
function study(){$('study').hidden=!cards.length;$('pr').disabled=!cards.length;if(!cards.length)return;
 var c=cards[order[pos]];$('cd').textContent=shown?c.b:c.f;$('cd').className='card'+(shown?' back':'');
 $('cn').textContent='Card '+(pos+1)+' of '+cards.length+(shown?' (answer)':' (front)');$('fl').textContent=shown?'Show front':'Show answer'}
function sheet(){var s=$('sheet');s.textContent='';cards.forEach(function(c){var d=el('div','pc');d.appendChild(el('div','pf',c.f));d.appendChild(el('div','pb',c.b));s.appendChild(d)})}
$('tx').oninput=upd;
$('fl').onclick=function(){shown=!shown;study()};
$('nx').onclick=function(){pos=(pos+1)%cards.length;shown=false;study()};
$('pv').onclick=function(){pos=(pos-1+cards.length)%cards.length;shown=false;study()};
$('sh').onclick=function(){for(var i=order.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),t=order[i];order[i]=order[j];order[j]=t}pos=0;shown=false;study()};
$('pr').onclick=function(){window.print()};
upd();
