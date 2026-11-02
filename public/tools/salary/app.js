var $=function(i){return document.getElementById(i)},ok=false,MAXR=8,MAXP=9999999999;
function el(t,c,x){var e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e}
function okNum(v){return /^\d+(\.\d{1,2})?$/.test(v)||/^\d{1,3}(,\d{3})+(\.\d{1,2})?$/.test(v)||/^\d{1,2}(,\d{2})+,\d{3}(\.\d{1,2})?$/.test(v)}
function parseAmt(s){s=String(s).trim();if(s==='')return 0;if(!okNum(s))return null;var p=s.replace(/,/g,'').split('.');var v=parseInt(p[0],10)*100+(p[1]?parseInt((p[1]+'0').slice(0,2),10):0);return v>MAXP?null:v}
function fmt(v){var neg=v<0;v=Math.abs(v);var r=Math.floor(v/100),p=v%100,s=String(r),o;if(s.length>3){var l=s.slice(-3),h=s.slice(0,-3);o=h.replace(/\B(?=(\d{2})+(?!\d))/g,',')+','+l}else o=s;return (neg?'-':'')+'Rs. '+o+'.'+(p<10?'0':'')+p}
var ON=['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen'],TN=['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
function two(n){return n<20?ON[n]:TN[Math.floor(n/10)]+(n%10?' '+ON[n%10]:'')}
function three(n){var s='';if(n>=100){s=ON[Math.floor(n/100)]+' Hundred';n%=100;if(n)s+=' '}return s+(n?two(n):'')}
function words(r){if(r===0)return 'Zero';var p=[],c=Math.floor(r/10000000);r%=10000000;var l=Math.floor(r/100000);r%=100000;var t=Math.floor(r/1000);r%=1000;
 if(c)p.push(three(c)+' Crore');if(l)p.push(two(l)+' Lakh');if(t)p.push(two(t)+' Thousand');if(r)p.push(three(r));return p.join(' ')}
function inWords(v){var r=Math.floor(v/100),p=v%100;return 'Rupees '+words(r)+(p?' and '+two(p)+' Paise':'')+' only'}
function addRow(box,a,b){if(box.children.length>=MAXR)return;var d=el('div','rw'),x=el('input','txt a'),y=el('input','txt b');x.type='text';x.maxLength=30;x.placeholder='Name';x.value=a||'';y.type='text';y.inputMode='decimal';y.maxLength=15;y.placeholder='Amount';y.value=b||'';y.setAttribute('aria-label','Amount');x.setAttribute('aria-label','Name');
 var rm=el('button','alt','\u00d7');rm.type='button';rm.setAttribute('aria-label','Remove row');rm.onclick=function(){d.remove();btns();render()};d.appendChild(x);d.appendChild(y);d.appendChild(rm);box.appendChild(d);x.addEventListener('input',render);y.addEventListener('input',render);btns()}
function btns(){$('ae').disabled=$('er').children.length>=MAXR;$('ad2').disabled=$('dr').children.length>=MAXR}
function rows(box,err){var out=[],tot=0;[].forEach.call(box.children,function(d){var n=d.children[0].value.trim(),a=d.children[1].value.trim();if(!n&&!a)return;var v=parseAmt(a);if(v===null){err.push('Amount "'+a+'" is not valid. Use numbers like 25000, 25,000 or 2,50,000.50.');return}if(!n){err.push('Type a name for the amount '+a+'.');return}if(!a){err.push('Type the amount for "'+n+'", or remove the row.');return}out.push([n,v]);tot+=v});return[out,tot]}
function card(h,list,tot,label){var c=el('div','sl-c');c.appendChild(el('h3',null,h));list.forEach(function(x){var r=el('div','sl-r');r.appendChild(el('span',null,x[0]));r.appendChild(el('span',null,fmt(x[1])));c.appendChild(r)});var t=el('div','sl-r tot');t.appendChild(el('span',null,label));t.appendChild(el('span',null,fmt(tot)));c.appendChild(t);return c}
function monthName(v){var m=/^(\d{4})-(\d{2})$/.exec(v);if(!m)return '';var N=['January','February','March','April','May','June','July','August','September','October','November','December'];return N[parseInt(m[2],10)-1]+' '+m[1]}
function fit(){var sh=$('sheet'),old=$('mz');if(old)old.remove();var m=sh.cloneNode(true);m.id='mz';$('main').appendChild(m);var pr=document.createElement('div');pr.style.cssText='position:absolute;left:-9999px;height:262mm;width:1px';document.body.appendChild(pr);var room=pr.getBoundingClientRect().height,k=1,fits=false;
 for(;k>=0.5;k-=0.05){m.style.setProperty('--k',k.toFixed(2));if(m.getBoundingClientRect().height<=room){fits=true;break}}
 m.remove();pr.remove();K=Math.max(k,0.5);sh.style.setProperty('--k',K.toFixed(2));
 if(!fits){ok=false;$('pr').disabled=true;var st=$('st');st.hidden=false;st.className='msg err';st.textContent='There is too much text to fit on one A4 page. Shorten the names or remove some rows.'}}
var K=1;
function render(){var sh=$('sheet'),st=$('st');sh.innerHTML='';var err=[];
 var co=$('co').value.trim(),en=$('en').value.trim(),mo=monthName($('mo').value);
 if(!co||!en||!mo){ok=false;$('pr').disabled=true;st.hidden=false;st.className='msg err';st.textContent='Type the employer name, the pay month and the employee name to see the slip.';return}
 var E=rows($('er'),err),D=rows($('dr'),err);
 if(err.length){ok=false;$('pr').disabled=true;st.hidden=false;st.className='msg err';st.textContent=err[0];return}
 if(!E[0].length){ok=false;$('pr').disabled=true;st.hidden=false;st.className='msg err';st.textContent='Add at least one earning, for example Basic pay.';return}
 var net=E[1]-D[1];
 if(net<0){ok=false;$('pr').disabled=true;st.hidden=false;st.className='msg err';st.textContent='Deductions are more than earnings, so the net pay would be below zero. Check the amounts.';return}
 ok=true;$('pr').disabled=false;st.hidden=true;
 var h=el('div','sl-h');h.appendChild(el('div','sl-co',co));var ad=$('ad').value.trim();if(ad)h.appendChild(el('div','sl-ad',ad));h.appendChild(el('div','sl-t','Salary slip for '+mo));sh.appendChild(h);
 var g=el('div','sl-i');function kv(k,v){if(!v)return;var d=el('div');d.appendChild(el('b',null,k+': '));d.appendChild(document.createTextNode(v));g.appendChild(d)}
 kv('Employee',en);kv('Employee ID',$('ei').value.trim());kv('Designation',$('de').value.trim());kv('Days paid',$('dp').value.trim());sh.appendChild(g);
 var gr=el('div','sl-g');gr.appendChild(card('Earnings',E[0],E[1],'Total earnings'));gr.appendChild(card('Deductions',D[0],D[1],'Total deductions'));sh.appendChild(gr);
 var ft=el('div','sl-f');var n=el('div','sl-n');n.appendChild(el('span',null,'Net pay'));n.appendChild(el('span',null,fmt(net)));ft.appendChild(n);
 ft.appendChild(el('div','sl-w',inWords(net)));
 var s=el('div','sl-s');s.appendChild(el('span',null,'Employer signature'));s.appendChild(el('span',null,'Employee signature'));ft.appendChild(s);sh.appendChild(ft);fit()}
['co','ad','mo','en','ei','de','dp'].forEach(function(k){$(k).addEventListener('input',render);$(k).addEventListener('change',render)});
$('ae').onclick=function(){addRow($('er'),'','');render()};$('ad2').onclick=function(){addRow($('dr'),'','');render()};
$('pr').onclick=function(){if(ok)window.print()};
addRow($('er'),'Basic pay','');addRow($('er'),'House rent allowance','');addRow($('dr'),'Provident fund','');addRow($('dr'),'Income tax','');render();
