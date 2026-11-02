var $=function(i){return document.getElementById(i)};
$('go').onclick=function(){var r=SkyMini.dedupe($('t').value,{ignoreCase:$('ic').checked,trim:$('tr').checked,removeBlank:$('rb').checked,sort:$('so').checked});
$('o').value=r.text;$('st').hidden=false;$('st').textContent='Kept '+r.kept+' lines. Removed '+r.removedDuplicates+' repeated and '+r.removedBlank+' empty lines.'};
$('cp').onclick=function(){var o=$('o');o.select();var ok=false;try{ok=document.execCommand('copy')}catch(e){}
$('st').hidden=false;$('st').textContent=ok?'Copied.':'Could not copy. Select the result and copy it yourself.'};
