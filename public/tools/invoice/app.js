var $=function(i){return document.getElementById(i)},MAXI=30;
function paise(v){ // parse a decimal string to integer paise, exactly; null if invalid
  v=String(v).trim().replace(/,/g,'');if(!/^\d{1,7}(\.\d{1,2})?$/.test(v))return null; // rate max 99,99,999.99
  var p=v.split('.');return Number(p[0])*100+(p[1]?Number((p[1]+'0').slice(0,2)):0)}
function qty(v){v=String(v).trim();if(!/^\d{1,4}(\.\d{1,3})?$/.test(v))return null;var p=v.split('.');return Number(p[0])*1000+(p[1]?Number((p[1]+'00').slice(0,3)):0)} // thousandths
function fmt(n,cur){var neg=n<0;n=Math.abs(n);var r=Math.floor(n/100),f=String(n%100).padStart(2,'0');
  var s=String(r),last=s.slice(-3),rest=s.slice(0,-3);if(rest)last=rest.replace(/\B(?=(\d{2})+(?!\d))/g,',')+','+last;return (neg?'-':'')+cur+last+'.'+f}
function lineTotal(qm,rp){ // qm thousandths, rp paise: round half up to paise, integer math
  return Number((BigInt(qm)*BigInt(rp)+500n)/1000n)} // BigInt: product can exceed 2^53; result <= 1e13 so Number is exact
function taxOf(sub,pct){ // pct as string decimal up to 2 places -> basis points; round half up
  pct=String(pct).trim();if(!/^\d{1,3}(\.\d{1,2})?$/.test(pct))return null;var p=pct.split('.'),bp=Number(p[0])*100+(p[1]?Number((p[1]+'0').slice(0,2)):0);
  if(bp>10000)return null;return Number((BigInt(sub)*BigInt(bp)+5000n)/10000n)} // sub <= 30*1e13, exact
function addRow(d,q,r){var n=$('items').children.length;if(n>=MAXI)return;var row=document.createElement('div');row.className='inv-in';
 var a=document.createElement('input');a.type='text';a.maxLength=80;a.className='txt';a.placeholder='Item';a.setAttribute('aria-label','Item '+(n+1)+' description');a.value=d||'';
 var b=document.createElement('input');b.type='text';b.inputMode='decimal';b.className='txt';b.placeholder='Qty';b.setAttribute('aria-label','Item '+(n+1)+' quantity');b.value=q||'1';
 var c=document.createElement('input');c.type='text';c.inputMode='decimal';c.className='txt';c.placeholder='Rate';c.setAttribute('aria-label','Item '+(n+1)+' rate');c.value=r||'';
 var x=document.createElement('button');x.type='button';x.textContent='Remove';x.setAttribute('aria-label','Remove item '+(n+1));x.onclick=function(){row.remove();relabel();render()};
 [a,b,c].forEach(function(e){e.addEventListener('input',render)});row.appendChild(a);row.appendChild(b);row.appendChild(c);row.appendChild(x);$('items').appendChild(row);relabel()}
function relabel(){Array.prototype.forEach.call($('items').children,function(r,i){var k=r.children;k[0].setAttribute('aria-label','Item '+(i+1)+' description');k[1].setAttribute('aria-label','Item '+(i+1)+' quantity');k[2].setAttribute('aria-label','Item '+(i+1)+' rate');k[3].setAttribute('aria-label','Remove item '+(i+1))});$('add').disabled=$('items').children.length>=MAXI}
function el(t,c,x){var e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e}
var ok=false;
function render(){var sh=$('sheet'),st=$('st');sh.innerHTML='';var cur=$('cur').value,rows=[],err=null,sub=0;
 Array.prototype.forEach.call($('items').children,function(r,i){var d=r.children[0].value.trim(),q=r.children[1].value,rt=r.children[2].value;
  if(!d&&!rt.trim())return;var qm=qty(q),rp=paise(rt);
  if(!d){err='Item '+(i+1)+' needs a description.';return}
  if(qm===null||qm===0){err='Item '+(i+1)+': quantity must be above 0 and up to 9999.999 (3 decimals).';return}
  if(rp===null){err='Item '+(i+1)+': rate must be a number up to 99,99,999.99 with at most 2 decimals, like 250 or 99.50.';return}
  var lt=lineTotal(qm,rp);if(!Number.isSafeInteger(lt)||!Number.isSafeInteger(sub+lt)){err='Item '+(i+1)+': amount is too large.';return}sub+=lt;rows.push({d:d,q:q.trim(),rp:rp,lt:lt})});
 var tx=taxOf(sub,$('tax').value);if(tx===null&&!err)err='Tax percent must be between 0 and 100 with at most 2 decimals.';
 if(!rows.length&&!err)err='Add at least one item with a description and a rate.';
 if(err){ok=false;$('pr').disabled=true;st.hidden=false;st.className='msg err';st.textContent=err;return}
 ok=true;$('pr').disabled=false;st.hidden=true;
 var h=el('div','inv-h');h.appendChild(el('div','inv-t','INVOICE'));var m=el('div','inv-m');m.appendChild(el('div',null,'No.: '+($('no').value.trim()||'-')));m.appendChild(el('div',null,'Date: '+($('dt').value||'-')));h.appendChild(m);sh.appendChild(h);
 var p=el('div','inv-p');var f=el('div'),t=el('div');f.appendChild(el('b',null,'From'));f.appendChild(el('div','inv-pre',$('from').value.trim()||'-'));t.appendChild(el('b',null,'To'));t.appendChild(el('div','inv-pre',$('to').value.trim()||'-'));p.appendChild(f);p.appendChild(t);sh.appendChild(p);
 var tb=el('table','inv-tb'),th0=el('thead'),hd=el('tr');['#','Item','Qty','Rate','Amount'].forEach(function(x,i){var th=el('th',i>1?'r':null,x);hd.appendChild(th)});th0.appendChild(hd);tb.appendChild(th0);var tbd=el('tbody');tb.appendChild(tbd);
 rows.forEach(function(r,i){var tr=el('tr');tr.appendChild(el('td',null,String(i+1)));tr.appendChild(el('td',null,r.d));tr.appendChild(el('td','r',r.q));tr.appendChild(el('td','r',fmt(r.rp,cur)));tr.appendChild(el('td','r',fmt(r.lt,cur)));tbd.appendChild(tr)});sh.appendChild(tb);
 var tt=el('table','inv-tot');function tr2(a,b,c){var r=el('tr',c);r.appendChild(el('td',null,a));r.appendChild(el('td','r',b));tt.appendChild(r)}
 tr2('Subtotal',fmt(sub,cur));if(tx>0)tr2('Tax ('+String($('tax').value).trim()+'%)',fmt(tx,cur));tr2('Total',fmt(sub+tx,cur),'g');sh.appendChild(tt);
 if($('note').value.trim()){sh.appendChild(el('b','inv-nb','Note'));sh.appendChild(el('div','inv-pre',$('note').value.trim()))}
 sh.dataset.total=String(sub+tx)}
['from','to','no','dt','tax','cur','note'].forEach(function(i){$(i).addEventListener('input',render)});
$('add').onclick=function(){addRow();render()};$('pr').onclick=function(){if(ok)window.print()};
addRow('','1','');addRow('','1','');render();
