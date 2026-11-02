var $=function(i){return document.getElementById(i)};
$('go').onclick=function(){var r=SkyMini.draw($('t').value,$('n').value),w=$('w'),st=$('st');w.innerHTML='';st.hidden=false;st.className='msg';
if(r.error){st.className='msg err';st.textContent=r.error;return}
st.textContent=r.winners.length+' winner'+(r.winners.length>1?'s':'')+' from '+r.total+' names:';r.winners.forEach(function(x){var li=document.createElement('li');li.textContent=x;w.appendChild(li)})};
