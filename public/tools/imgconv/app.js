var $=function(i){return document.getElementById(i)},MAXN=10,MAXOUT=120*1048576,MAXB=15*1024*1024,MAXPX=40e6,EXT={'image/jpeg':'jpg','image/png':'png','image/webp':'webp'};
var files=[],urls=[],busy=false,gen=0,outb=0;
function dims(u){var v=new DataView(u.buffer,u.byteOffset,u.byteLength),n=u.length,i;
 if(n>24&&v.getUint32(0)===0x89504E47){return[v.getUint32(16),v.getUint32(20)]}
 if(n>30&&v.getUint32(0)===0x52494646&&v.getUint32(8)===0x57454250){var t=v.getUint32(12);
  if(t===0x56503820)return[v.getUint16(26,true)&0x3fff,v.getUint16(28,true)&0x3fff];
  if(t===0x5650384C){var b=v.getUint32(21,true);return[(b&0x3fff)+1,((b>>14)&0x3fff)+1]}
  if(t===0x56503858)return[(u[24]|u[25]<<8|u[26]<<16)+1,(u[27]|u[28]<<8|u[29]<<16)+1];return null}
 if(n>4&&u[0]===0xFF&&u[1]===0xD8){i=2;while(i+9<n){if(u[i]!==0xFF){i++;continue}var m=u[i+1];if(m===0xFF){i++;continue}if(m>=0xC0&&m<=0xCF&&m!==0xC4&&m!==0xC8&&m!==0xCC)return[v.getUint16(i+7),v.getUint16(i+5)];i+=2+v.getUint16(i+2)}}
 return null}
function msg(t,err){var s=$('st');s.hidden=!t;s.className='msg'+(err?' err':'');s.textContent=t||''}
function lock(b){busy=b;['file','fm','q'].forEach(function(i){$(i).disabled=b})}
function clear(){outb=0;urls.forEach(URL.revokeObjectURL.bind(URL));urls=[];$('out').innerHTML=''}
function mb(n){return n<1048576?Math.max(1,Math.round(n/1024))+' KB':(n/1048576).toFixed(1)+' MB'}
function list(){var l=$('out');l.innerHTML='';$('go').disabled=busy||!files.length;files.forEach(function(f){var r=document.createElement('div');r.className='ip-row';var n=document.createElement('span');n.textContent=f.name+' ('+mb(f.size)+')';r.appendChild(n);l.appendChild(r)})}
$('q').oninput=function(){if(busy)return;$('qv').textContent=this.value;clear();list()};
$('fm').onchange=function(){if(busy)return;$('qw').hidden=this.value==='image/png';clear();list()};
$('file').onchange=function(){if(busy){this.value='';return}clear();msg('');var add=[].slice.call(this.files),bad=[];files=[];
 add.forEach(function(f){if(!/^image\/(jpeg|png|webp)$/.test(f.type))bad.push(f.name+' (not JPG, PNG or WebP)');else if(f.size>MAXB)bad.push(f.name+' (bigger than 15 MB)');else if(files.length>=MAXN)bad.push(f.name+' (limit 10 photos)');else files.push(f)});
 this.value='';list();if(bad.length)msg('Not added: '+bad.join('; ')+'.',1)};
function conv(f,type,q){return f.slice(0,2097152).arrayBuffer().then(function(ab){var dm=dims(new Uint8Array(ab));if(!dm||!dm[0]||!dm[1])throw 'size';if(dm[0]*dm[1]>MAXPX)throw 'big';return createImageBitmap(f,{imageOrientation:'from-image'})}).then(function(b){
  var c=document.createElement('canvas');c.width=b.width;c.height=b.height;var x=c.getContext('2d');if(type==='image/jpeg'){x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height)}x.drawImage(b,0,0);b.close();
  return new Promise(function(res,rej){c.toBlob(function(o){if(!o)rej('fail');else if(o.type!==type)rej('type');else res(o)},type,q)})})}
$('go').onclick=function(){if(busy||!files.length)return;if(!window.createImageBitmap){msg('This browser cannot open photos safely. Try a current Chrome, Edge, Firefox or Safari.',1);return}
 var my=++gen;clear();lock(true);$('go').disabled=true;var type=$('fm').value,q=+$('q').value/100,i=0,ok=0,fails=[];msg('Working...');
 function next(){if(my!==gen)return;if(i>=files.length){lock(false);$('go').disabled=!files.length;msg(ok+' of '+files.length+' converted.'+(fails.length?' Not converted: '+fails.join('; ')+'.':'')+(ok?' Check each file after you download it.':''),!ok);return}
  var f=files[i++];msg('Converting '+i+' of '+files.length+'...');
  if(outb>=MAXOUT){fails.push(f.name+' (output memory limit reached, convert fewer photos at a time)');next();return}
  conv(f,type,q).then(function(o){if(my!==gen)return;outb+=o.size;var u=URL.createObjectURL(o);urls.push(u);var r=document.createElement('div');r.className='ip-row';var n=document.createElement('span');n.textContent=f.name+' \u2192 '+EXT[type].toUpperCase()+' ('+mb(o.size)+')';r.appendChild(n);var a=document.createElement('a');a.className='dl';a.href=u;a.download=f.name.replace(/\.[^.]*$/,'')+'.'+EXT[type];a.textContent='Download';r.appendChild(a);$('out').appendChild(r);ok++;next()},function(e){if(my!==gen)return;fails.push(f.name+(e==='big'?' (over 40 megapixels)':e==='type'?' (this browser cannot make '+EXT[type].toUpperCase()+')':' (could not be read or saved)'));next()})}
 next()};
