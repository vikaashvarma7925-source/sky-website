var $=function(i){return document.getElementById(i)},MG=6,MI=15,ok=false;
function el(t,c,x){var e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e}
function inp(ph,ml,lab){var a=document.createElement('input');a.type='text';a.className='txt';a.maxLength=ml;a.placeholder=ph;a.setAttribute('aria-label',lab);a.addEventListener('input',render);return a}
function addItem(g){var items=g.querySelector('.mg-items');if(items.children.length>=MI)return;var n=items.children.length+1,gi=[].indexOf.call($('groups').children,g)+1;
 var r=el('div','mg-i');r.appendChild(inp('Item name',60,'Group '+gi+' item '+n+' name'));r.appendChild(inp('Price',16,'Group '+gi+' item '+n+' price'));items.appendChild(r);g.querySelector('.mg-add').disabled=items.children.length>=MI}
function addGroup(){if($('groups').children.length>=MG)return;var g=el('div','mg'),n=$('groups').children.length+1;
 g.appendChild(inp('Group name, for example Tea and Coffee',40,'Group '+n+' name'));g.appendChild(el('div','mg-items'));
 var a=el('button','mg-add','Add item');a.type='button';a.onclick=function(){addItem(g);render()};g.appendChild(a);
 var x=el('button',null,'Remove group');x.type='button';x.onclick=function(){g.remove();$('addg').disabled=false;render()};g.appendChild(x);
 $('groups').appendChild(g);for(var i=0;i<3;i++)addItem(g);$('addg').disabled=$('groups').children.length>=MG}
function render(){var sh=$('sheet'),st=$('st');sh.innerHTML='';var nm=$('shop').value.trim(),any=false;
 var gs=[].map.call($('groups').children,function(g){var h=g.firstChild.value.trim();var it=[].map.call(g.querySelector('.mg-items').children,function(r){return [r.children[0].value.trim(),r.children[1].value.trim()]}).filter(function(r){return r[0]});return [h,it]}).filter(function(g){return g[1].length});
 if(!nm||!gs.length){ok=false;$('pr').disabled=true;st.hidden=false;st.className='msg err';st.textContent='Type the shop name and at least one item to see the preview.';return}
 ok=true;$('pr').disabled=false;st.hidden=true;
 sh.appendChild(el('div','mn-t',nm));var tg=$('tag').value.trim();if(tg)sh.appendChild(el('div','mn-s',tg));
 gs.forEach(function(g){if(g[0])sh.appendChild(el('h2','mn-h',g[0]));g[1].forEach(function(r){var d=el('div','mn-r');d.appendChild(el('span',null,r[0]));d.appendChild(el('span',null,r[1]));sh.appendChild(d)})});
 var f=$('foot').value.trim();if(f)sh.appendChild(el('div','mn-f',f))}
['shop','tag','foot'].forEach(function(i){$(i).addEventListener('input',render)});
$('addg').onclick=function(){addGroup();render()};$('pr').onclick=function(){if(ok)window.print()};
addGroup();render();
