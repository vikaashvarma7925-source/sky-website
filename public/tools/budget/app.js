var $=function(i){return document.getElementById(i)},MI=15,ME=30,ok=false;
function el(t,c,x){var e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e}
function okNum(v){return /^\d+(\.\d{1,2})?$/.test(v)||/^\d{1,3}(,\d{3})+(\.\d{1,2})?$/.test(v)||/^\d{1,2}(,\d{2})+,\d{3}(\.\d{1,2})?$/.test(v)}
function paise(v){v=String(v).trim();if(!okNum(v))return null;v=v.replace(/,/g,'');if(!/^\d{1,7}(\.\d{1,2})?$/.test(v))return null;var p=v.split('.');return Number(p[0])*100+(p[1]?Number((p[1]+'0').slice(0,2)):0)}
function fmt(n){var neg=n<0;n=Math.abs(n);var r=Math.floor(n/100),f=String(n%100).padStart(2,'0'),s=String(r),last=s.slice(-3),rest=s.slice(0,-3);if(rest)last=rest.replace(/\B(?=(\d{2})+(?!\d))/g,',')+','+last;return (neg?'-':'')+'\u20B9'+last+'.'+f}
function pct(a,b){if(!b)return '';var t=(BigInt(a)*2000n+BigInt(b))/(2n*BigInt(b));var n=Number(t);return Math.floor(n/10)+'.'+(n%10)+'%'} // a/b*100 to 1 decimal, round half up, exact integers
function inp(ph,ml,lab,mode){var a=document.createElement('input');a.type='text';a.className='txt';a.maxLength=ml;a.placeholder=ph;a.setAttribute('aria-label',lab);if(mode)a.inputMode=mode;a.addEventListener('input',render);return a}
function addLine(box,max,kind,btnId){var c=box.children.length;if(c>=max)return;var n=c+1,r=el('div','bl');r.appendChild(inp(kind+' name',40,kind+' '+n+' name'));r.appendChild(inp('Amount',12,kind+' '+n+' amount','decimal'));
 var x=el('button',null,'Remove');x.type='button';x.setAttribute('aria-label','Remove '+kind+' line '+n);x.onclick=function(){r.remove();$(btnId).disabled=false;render()};r.appendChild(x);box.appendChild(r);$(btnId).disabled=box.children.length>=max}
function rows(box){var out=[],bad=0;[].forEach.call(box.children,function(r){var nm=r.children[0].value.trim(),v=r.children[1].value.trim();if(!nm&&!v)return;var p=paise(v);if(p===null||!nm){bad++;return}out.push([nm,p])});return {rows:out,bad:bad}}
function render(){var sh=$('sheet'),st=$('st');sh.innerHTML='';var I=rows($('inc')),E=rows($('exp'));
 if(I.bad||E.bad){ok=false;$('pr').disabled=true;st.hidden=false;st.className='msg err';st.textContent='Check '+(I.bad+E.bad)+' line'+(I.bad+E.bad>1?'s':'')+'. Each line needs a name and an amount like 1500 or 1,500.50 (up to 99,99,999.99).';return}
 if(!I.rows.length&&!E.rows.length){ok=false;$('pr').disabled=true;st.hidden=false;st.className='msg';st.textContent='Add at least one income or expense line to see the summary.';return}
 ok=true;$('pr').disabled=false;st.hidden=true;
 var ti=I.rows.reduce(function(a,r){return a+r[1]},0),te=E.rows.reduce(function(a,r){return a+r[1]},0),bal=ti-te;
 sh.appendChild(el('div','bg-t','BUDGET'));var tt=$('ttl').value.trim();if(tt)sh.appendChild(el('div','bg-s',tt));
 function sec(h,list,withPct){if(!list.length)return;sh.appendChild(el('h2','bg-h',h));list.forEach(function(r){var d=el('div','bg-r');d.appendChild(el('span',null,r[0]));d.appendChild(el('span',null,fmt(r[1])));d.appendChild(el('span',null,withPct&&ti>0?pct(r[1],ti):''));sh.appendChild(d)})}
 sec('Income',I.rows,false);sec('Expenses',E.rows,true);
 var s=el('div','bg-sum');function line(a,b,c,note){var d=el('div','bg-r'+(c?' bg-over':''));d.appendChild(el('span',null,a));d.appendChild(el('span',null,b));s.appendChild(d);if(note)s.appendChild(el('div','bg-note',note))}
 line('Total income',fmt(ti));line('Total expenses',fmt(te),false,ti>0&&te?pct(te,ti)+' of income':'');
 line(bal<0?'Over budget by':'Left over',fmt(Math.abs(bal)),bal<0);sh.appendChild(s)}
$('ttl').addEventListener('input',render);
$('addi').onclick=function(){addLine($('inc'),MI,'Income','addi');render()};$('adde').onclick=function(){addLine($('exp'),ME,'Expense','adde');render()};
$('pr').onclick=function(){if(ok)window.print()};
addLine($('inc'),MI,'Income','addi');for(var i=0;i<4;i++)addLine($('exp'),ME,'Expense','adde');render();
