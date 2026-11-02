var $=function(i){return document.getElementById(i)},SR=44100,MAXF=8,MAXB=4*1048576,MAXS=300,items=[],url=null,busy=false,gen=0;
function msg(t,err){var s=$('st');s.hidden=false;s.className='msg'+(err?' err':'');s.textContent=t}
function reset(){$('dl').hidden=true;if(url){URL.revokeObjectURL(url);url=null}}
function el(t,c,x){var e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e}
function btn(t,lab,fn,dis){var b=el('button',null,t);b.type='button';b.setAttribute('aria-label',lab);b.disabled=!!dis;b.onclick=fn;return b}
function fmt(s){return (Math.round(s*100)/100)+' s'}
function num(v){var n=parseFloat(String(v).replace(',','.'));return isFinite(n)?n:NaN}
function range(it){var a=num(it.s.value),b=num(it.e.value);return {a:a,b:b,ok:a>=0&&b>a&&b<=it.dur+0.005}}
function draw(){var l=$('list');l.innerHTML='';
 items.forEach(function(it,i){var box=el('div','ip-row');box.style.flexWrap='wrap';box.style.gap='6px';var nm=el('span',null,(i+1)+'. '+it.name+' ('+fmt(it.dur)+')');nm.style.flex='1 1 100%';box.appendChild(nm);
  var s=document.createElement('input');s.type='text';s.inputMode='decimal';s.className='txt';s.style.width='6em';s.value=it.s?it.s.value:'0';s.setAttribute('aria-label','Start in seconds for '+it.name);
  var e=document.createElement('input');e.type='text';e.inputMode='decimal';e.className='txt';e.style.width='6em';e.value=it.e?it.e.value:String(Math.round(it.dur*100)/100);e.setAttribute('aria-label','End in seconds for '+it.name);
  it.s=s;it.e=e;s.oninput=e.oninput=function(){reset();check()};
  var ls=el('label','lbl','Start (s)'),le=el('label','lbl','End (s)');box.appendChild(ls);box.appendChild(s);box.appendChild(le);box.appendChild(e);
  box.appendChild(btn('Up','Move '+it.name+' up',function(){if(i>0){items.splice(i-1,0,items.splice(i,1)[0]);reset();draw()}},busy||i===0));
  box.appendChild(btn('Down','Move '+it.name+' down',function(){if(i<items.length-1){items.splice(i+1,0,items.splice(i,1)[0]);reset();draw()}},busy||i===items.length-1));
  box.appendChild(btn('Remove','Remove '+it.name,function(){items.splice(i,1);reset();draw()},busy));l.appendChild(box)});
 check()}
function total(){var t=0;for(var i=0;i<items.length;i++){var r=range(items[i]);if(!r.ok)return -1;t+=r.b-r.a}return t}
function check(){var t=total();$('go').disabled=busy||!items.length||t<=0||t>MAXS;
 if(!items.length)return;if(t<0)msg('Check the start and end of each file. The start must be before the end, and the end cannot be after the file length.',1);
 else if(t>MAXS)msg('The joined result is '+fmt(t)+'. The limit is 5 minutes (300 s). Shorten the parts.',1);else msg('Joined length: '+fmt(t)+'. Press Make WAV.')}

function u32(d,o,le){return d.getUint32(o,le)}
// Exact length from the real bytes, never from tags that the file can forge. Only WAV (PCM) and MP3 are read.
function probe(ab){var d=new DataView(ab),n=ab.byteLength,t=function(o,s){for(var i=0;i<s.length;i++)if(o+i>=n||d.getUint8(o+i)!==s.charCodeAt(i))return false;return true};
 try{
 if(t(0,'RIFF')&&t(8,'WAVE')){var o=12,sr=0,ch=0,bits=0,fm=0;while(o+8<=n){var id=String.fromCharCode(d.getUint8(o),d.getUint8(o+1),d.getUint8(o+2),d.getUint8(o+3)),sz=u32(d,o+4,true);
   if(id==='fmt '&&o+24<=n){fm=d.getUint16(o+8,true);ch=d.getUint16(o+10,true);sr=u32(d,o+12,true);bits=d.getUint16(o+22,true)}
   if(id==='data'){if(!((fm===1&&(bits===8||bits===16||bits===24||bits===32))||(fm===3&&(bits===32||bits===64)))||ch<1||ch>2||sr<3000||sr>384000)return null;
    var fr=Math.floor(Math.min(sz,n-(o+8))/(ch*bits/8));return fr/sr}o+=8+sz+(sz&1)}return null}
 var st=0;if(t(0,'ID3'))st=10+((d.getUint8(6)<<21)|(d.getUint8(7)<<14)|(d.getUint8(8)<<7)|d.getUint8(9));
 var tot=0,pos=st,frames=0,sr2=0;
 while(pos+4<=n){var h=u32(d,pos,false);
  if((h>>>21)===0x7FF){var ver=(h>>19)&3,lay=(h>>17)&3,bi=(h>>12)&15,sri=(h>>10)&3,pad=(h>>9)&1;
   if(ver!==1&&lay===1&&bi!==0&&bi!==15&&sri!==3){var m1=ver===3,rates=m1?[44100,48000,32000]:(ver===2?[22050,24000,16000]:[11025,12000,8000]),sr3=rates[sri],
     tb=m1?[0,32,40,48,56,64,80,96,112,128,160,192,224,256,320]:[0,8,16,24,32,40,48,56,64,80,96,112,128,144,160],len=Math.floor((m1?144000:72000)*tb[bi]/sr3)+pad;
     if(len>=24&&pos+len<=n){frames++;tot+=m1?1152:576;if(!sr2)sr2=sr3;if(sr3!==sr2)return null;pos+=len;continue}}}
  pos++}
 if(frames<2||!sr2)return null;return tot/sr2
 }catch(e){}
 return null}
$('af').onchange=function(){if(busy){this.value='';msg('Please wait until the files already chosen are read.',1);return}reset();var fs=[].slice.call(this.files),bad=[],my=++gen;this.value='';busy=true;$('af').disabled=true;draw();msg('Reading files...');
 var p=Promise.resolve();fs.forEach(function(f){p=p.then(function(){
  if(items.length>=MAXF){bad.push(f.name+' (limit 8 files)');return}
  if(f.size>MAXB){bad.push(f.name+' (bigger than 4 MB)');return}
  return f.arrayBuffer().then(function(ab){var pd=probe(ab);if(pd===null){bad.push(f.name+' (cannot check the length of this file safely, so it was not opened. only WAV (PCM) and MP3 files can be checked safely)');return 'skip'}if(pd>MAXS){bad.push(f.name+' (longer than 5 minutes)');return 'skip'}var held=items.reduce(function(a,x){return a+x.dur},0);if(held+pd>MAXS){bad.push(f.name+' (all files together may hold at most 5 minutes of audio; remove a file first)');return 'skip'}var ctx=new OfflineAudioContext(2,1,SR);return ctx.decodeAudioData(ab)}).then(function(buf){
   if(buf==='skip')return;if(!buf||!buf.length||buf.duration>MAXS){bad.push(f.name+(buf&&buf.duration>MAXS?' (longer than 5 minutes)':' (empty)'));return}
   items.push({name:f.name,buf:buf,dur:buf.duration})}).catch(function(){bad.push(f.name+' (this browser cannot read this audio file)')})})});
 p.catch(function(){bad.push('a file could not be read')}).then(function(){busy=false;$('af').disabled=false;draw();if(bad.length)msg('Not added: '+bad.join('; ')+'.',1)})};
function wav(parts){var n=0;parts.forEach(function(p){n+=p.n});var ab=new ArrayBuffer(44+n*4),dv=new DataView(ab);
 function w(o,s){for(var i=0;i<s.length;i++)dv.setUint8(o+i,s.charCodeAt(i))}
 w(0,'RIFF');dv.setUint32(4,36+n*4,true);w(8,'WAVE');w(12,'fmt ');dv.setUint32(16,16,true);dv.setUint16(20,1,true);dv.setUint16(22,2,true);dv.setUint32(24,SR,true);dv.setUint32(28,SR*4,true);dv.setUint16(32,4,true);dv.setUint16(34,16,true);w(36,'data');dv.setUint32(40,n*4,true);
 var o=44;parts.forEach(function(p){var L=p.buf.getChannelData(0),R=p.buf.numberOfChannels>1?p.buf.getChannelData(1):L;
  for(var i=0;i<p.n;i++){var a=Math.max(-1,Math.min(1,L[p.s+i])),b=Math.max(-1,Math.min(1,R[p.s+i]));dv.setInt16(o,a<0?a*32768:a*32767,true);dv.setInt16(o+2,b<0?b*32768:b*32767,true);o+=4}});
 return new Blob([ab],{type:'audio/wav'})}
$('go').onclick=function(){if(busy||!items.length)return;var parts=[],t=0;
 for(var i=0;i<items.length;i++){var it=items[i],r=range(it);if(!r.ok){check();return}var s=Math.round(r.a*SR),n=Math.min(Math.round(r.b*SR),it.buf.length)-s;if(n<=0){check();return}parts.push({buf:it.buf,s:s,n:n});t+=n}
 if(t>MAXS*SR){check();return}
 reset();var b=wav(parts);url=URL.createObjectURL(b);var d=$('dl');d.href=url;d.download='joined.wav';d.textContent='Download joined.wav ('+Math.round(b.size/1048576*10)/10+' MB)';d.hidden=false;
 msg('Done. '+items.length+' part'+(items.length>1?'s':'')+', '+fmt(t/SR)+'. Play it once after saving to check it.')};
draw();
