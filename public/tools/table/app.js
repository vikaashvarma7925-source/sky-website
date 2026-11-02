var $=function(i){return document.getElementById(i)},LIMIT=45000,MAXB=15*1048576,STEP=200;
var data=null,cur=0,shown=STEP,busy=false,worker=null,timer=null;
var ERR={ole:'This looks like an old .xls file or a password-protected file. This tool opens .xlsx and .csv only. In Excel or Google Sheets, use Save as .xlsx (without a password), then try again.',
notzip:'This does not look like a valid .xlsx file.',notxlsx:'This does not look like a valid .xlsx file.',zip64:'This file is too big or uses a format this tool does not support.',multidisk:'Split files are not supported.',manyentries:'This file has too many parts.',
damaged:'This file looks damaged.',overlap:'This file looks damaged.',encrypted:'Password-protected files are not supported.',totalbig:'This file is too large once opened.',toobig:'This file is too large once opened.',
unsupported:'This file uses a compression method this tool does not support.',mismatch:'This file failed its own checksum, so it looks damaged. It was not shown.',toomany:'This file has too many text values for this tool.',
fail:'This file could not be read.',nosupport:'This browser cannot run this tool. Try an up to date Chrome.'};
function msg(t,err){var s=$('st');s.hidden=false;s.className='msg'+(err?' err':'');s.textContent=t}
function finish(){busy=false;clearTimeout(timer);if(worker){worker.terminate();worker=null}$('f').disabled=false}
function clear(){data=null;$('ctl').hidden=true;$('wrap').hidden=true;$('more').hidden=true;$('tb').innerHTML='';$('tabs').innerHTML='';$('q').value=''}
$('f').onchange=function(){if(busy)return;var f=this.files[0];this.value='';clear();if(!f)return;
 var nm=f.name.toLowerCase(),kind=/\.csv$/.test(nm)||f.type==='text/csv'?'csv':(/\.xlsx$/.test(nm)?'xlsx':'');
 if(!kind){msg(/\.xls$/.test(nm)?ERR.ole:'Please choose an .xlsx or .csv file.',1);return}
 if(f.size>MAXB){msg('This file is bigger than 15 MB.',1);return}
 busy=true;$('f').disabled=true;msg('Opening file...');
 f.arrayBuffer().then(function(ab){
  try{worker=new Worker('worker.js')}catch(e){msg(ERR.nosupport,1);finish();return}
  timer=setTimeout(function(){msg('This is taking too long, so it was stopped. The file may be damaged or too complex.',1);finish()},LIMIT);
  worker.onerror=function(){msg(ERR.fail,1);finish()};
  worker.onmessage=function(ev){var r=ev.data;
   if(r.code!=='ok'){msg(ERR[r.code]||ERR.fail,1);finish();return}
   data=r;cur=0;for(var i=0;i<r.sheets.length;i++)if(!r.sheets[i].hidden&&r.sheets[i].totalRows>0){cur=i;break}
   finish();draw(true)};
  worker.postMessage({kind:kind,bytes:ab},[ab])}).catch(function(){msg(ERR.fail,1);finish()})};
function tabs(){var t=$('tabs');t.innerHTML='';if(data.sheets.length<2){t.hidden=true;return}t.hidden=false;
 data.sheets.forEach(function(s,i){var b=document.createElement('button');b.type='button';b.textContent=s.name+(s.hidden?' (hidden sheet)':'');b.setAttribute('aria-pressed',i===cur?'true':'false');
  b.onclick=function(){cur=i;shown=STEP;$('q').value='';draw(true)};t.appendChild(b)})}
function isNum(v){return /^-?\d+(\.\d+)?$/.test(v)}
function draw(full){if(!data)return;var s=data.sheets[cur];$('ctl').hidden=false;if(full)tabs();
 var q=$('q').value.trim().toLowerCase(),rows=[];
 s.rows.forEach(function(r,i){if(!q||r.some(function(c){return c&&c.toLowerCase().indexOf(q)>=0}))rows.push([i,r])});
 var tb=$('tb');tb.innerHTML='';var cols=Math.min(s.totalCols,50);
 var th=document.createElement('thead'),hr=document.createElement('tr'),c0=document.createElement('th');c0.className='rn';c0.scope='col';c0.textContent='#';hr.appendChild(c0);
 for(var c=0;c<cols;c++){var h=document.createElement('th');h.scope='col';h.textContent=colName(c);hr.appendChild(h)}
 th.appendChild(hr);tb.appendChild(th);var body=document.createElement('tbody');
 rows.slice(0,shown).forEach(function(p){var tr=document.createElement('tr'),rn=document.createElement('th');rn.className='rn';rn.scope='row';rn.textContent=p[0]+1;tr.appendChild(rn);
  for(var c=0;c<cols;c++){var td=document.createElement('td'),v=p[1][c]||'';td.textContent=v;if(isNum(v))td.className='num';tr.appendChild(td)}body.appendChild(tr)});
 tb.appendChild(body);
 var empty=!s.totalRows;$('wrap').hidden=empty;
 var parts=[];parts.push(empty?'This sheet has no data.':(s.stated?'Sheet "'+s.name+'": data up to row '+s.totalRows+' and column '+colName(s.totalCols-1)+' (positions as written in the file).':'Sheet "'+s.name+'": '+s.totalRows+' row'+(s.totalRows===1?'':'s')+', '+s.totalCols+' column'+(s.totalCols===1?'':'s')+' (counted from the whole file).'));
 if(s.rowsCap)parts.push('Only the first 1000 rows are loaded here.');if(s.colsCap)parts.push('Only the first 50 columns are shown.');
 if(q)parts.push(rows.length+' of the loaded rows match.');else if(rows.length>shown)parts.push('Showing '+shown+' rows.');
 if(s.delim)parts.push('Separator found: '+(s.delim==='tab'?'tab':'"'+s.delim+'"')+'.');
 if(s.unclosedQuote)parts.push('A quote mark in this file is never closed, so the end of the file may look joined together.');
 if(s.fmtd)parts.push(s.fmtd+' number cell'+(s.fmtd===1?' is':'s are')+' shown with its percent, decimals or currency format (thousands in groups of three).');if(s.unf)parts.push(s.unf+' number cell'+(s.unf===1?' uses':'s use')+' a format this tool does not apply, so the stored number is shown.');
 if(s.nofv)parts.push(s.nofv+' formula cell'+(s.nofv===1?' has':'s have')+' no saved result and show a note instead.');
 if(s.missing)parts.push('This sheet could not be found inside the file.');
 $('info').textContent=parts.join(' ');
 msg(data.sheets.length>1?data.sheets.length+' sheets in this file.':'File opened.');
 var m=$('more');m.hidden=rows.length<=shown}
function colName(i){var s='';i++;while(i>0){var r=(i-1)%26;s=String.fromCharCode(65+r)+s;i=Math.floor((i-1)/26)}return s}
$('more').onclick=function(){shown+=STEP;draw(false)};
$('q').oninput=function(){shown=STEP;draw(false)};
