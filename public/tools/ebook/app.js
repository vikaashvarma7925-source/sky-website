var $=function(i){return document.getElementById(i)},MC=30,MCH=100000,MT=500000,url=null,ok=false;
function el(t,c,x){var e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e}
function msg(t,err){var s=$('st');s.hidden=!t;s.className='msg'+(err?' err':'');s.textContent=t||''}
function reset(){$('dl').hidden=true;if(url){URL.revokeObjectURL(url);url=null}}
function esc(s){return s.replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function clean(s){return s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFE\uFFFF]/g,'').replace(/\r\n?/g,'\n')} // remove characters XML cannot hold
function addCh(){if($('chs').children.length>=MC)return;var n=$('chs').children.length+1,b=el('div');b.className='ip-row';b.style.flexDirection='column';b.style.alignItems='stretch';
 var t=document.createElement('input');t.type='text';t.className='txt';t.maxLength=100;t.placeholder='Chapter '+n+' title';t.setAttribute('aria-label','Chapter '+n+' title');
 var a=document.createElement('textarea');a.className='txt';a.rows=5;a.placeholder='Chapter '+n+' text';a.setAttribute('aria-label','Chapter '+n+' text');
 var x=el('button',null,'Remove chapter '+n);x.type='button';x.onclick=function(){b.remove();$('addc').disabled=false;upd()};
 [t,a].forEach(function(e){e.addEventListener('input',upd)});b.appendChild(t);b.appendChild(a);b.appendChild(x);$('chs').appendChild(b);$('addc').disabled=$('chs').children.length>=MC}
function chapters(){return [].map.call($('chs').children,function(b){return {t:clean(b.children[0].value).trim(),x:clean(b.children[1].value).trim()}}).filter(function(c){return c.t||c.x})}
function upd(){reset();var cs=chapters(),tot=cs.reduce(function(a,c){return a+c.x.length},0),ti=$('ti').value.trim(),au=$('au').value.trim();
 var miss=cs.some(function(c){return !c.t||!c.x});
 var over=cs.find(function(c){return c.x.length>MCH});
 ok=!!ti&&!!au&&cs.length>0&&!miss&&!over&&tot<=MT;$('go').disabled=!ok;
 if(!ti||!au)msg('Type the book title and the author name.');else if(!cs.length)msg('Add at least one chapter with a title and text.');else if(miss)msg('Every chapter needs both a title and text.',1);else if(over)msg('The chapter "'+over.t.slice(0,40)+'" has '+over.x.length+' characters. One chapter can have up to 100,000.',1);else if(tot>MT)msg('The book has '+tot+' characters. The limit is 500,000.',1);else msg('Ready: '+cs.length+' chapter'+(cs.length>1?'s':'')+', '+tot+' characters.')}
function xhtml(title,lang,body){return '<?xml version="1.0" encoding="utf-8"?>\n<!DOCTYPE html>\n<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="'+lang+'" xml:lang="'+lang+'"><head><meta charset="utf-8"/><title>'+esc(title)+'</title><link rel="stylesheet" type="text/css" href="style.css"/></head><body>'+body+'</body></html>'}
function uuid(){var b=crypto.getRandomValues(new Uint8Array(16));b[6]=b[6]&15|64;b[8]=b[8]&63|128;var h=[].map.call(b,function(x){return ('0'+x.toString(16)).slice(-2)}).join('');return h.slice(0,8)+'-'+h.slice(8,12)+'-'+h.slice(12,16)+'-'+h.slice(16,20)+'-'+h.slice(20)}
function build(ti,au,lang,cs){var id='urn:uuid:'+uuid(),enc=new TextEncoder(),f={},now=new Date().toISOString().replace(/\.\d+Z$/,'Z');
 f['mimetype']=[enc.encode('application/epub+zip'),{level:0}];
 f['META-INF/container.xml']=enc.encode('<?xml version="1.0"?>\n<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>');
 f['OEBPS/style.css']=enc.encode('body{line-height:1.5;margin:1em}h1{font-size:1.5em;margin:1em 0}p{margin:0 0 .8em}.t{text-align:center;margin-top:30%}');
 var man='<item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/><item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/><item id="css" href="style.css" media-type="text/css"/><item id="title" href="title.xhtml" media-type="application/xhtml+xml"/>',sp='<itemref idref="title"/>',navl='',ncx='';
 f['OEBPS/title.xhtml']=enc.encode(xhtml(ti,lang,'<h1 class="t">'+esc(ti)+'</h1><p style="text-align:center">'+esc(au)+'</p>'));
 cs.forEach(function(c,i){var n=i+1,fn='ch'+n+'.xhtml',body='<h1>'+esc(c.t)+'</h1>'+c.x.split(/\n\s*\n/).map(function(p){return '<p>'+esc(p.trim()).replace(/\n/g,'<br/>')+'</p>'}).join('');
  f['OEBPS/'+fn]=enc.encode(xhtml(c.t,lang,body));man+='<item id="c'+n+'" href="'+fn+'" media-type="application/xhtml+xml"/>';sp+='<itemref idref="c'+n+'"/>';
  navl+='<li><a href="'+fn+'">'+esc(c.t)+'</a></li>';ncx+='<navPoint id="n'+n+'" playOrder="'+n+'"><navLabel><text>'+esc(c.t)+'</text></navLabel><content src="'+fn+'"/></navPoint>'});
 f['OEBPS/nav.xhtml']=enc.encode(xhtml('Contents',lang,'<nav epub:type="toc" id="toc"><h1>Contents</h1><ol>'+navl+'</ol></nav>'));
 f['OEBPS/toc.ncx']=enc.encode('<?xml version="1.0" encoding="utf-8"?>\n<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1"><head><meta name="dtb:uid" content="'+id+'"/><meta name="dtb:depth" content="1"/><meta name="dtb:totalPageCount" content="0"/><meta name="dtb:maxPageNumber" content="0"/></head><docTitle><text>'+esc(ti)+'</text></docTitle><navMap>'+ncx+'</navMap></ncx>');
 f['OEBPS/content.opf']=enc.encode('<?xml version="1.0" encoding="utf-8"?>\n<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="uid" xml:lang="'+lang+'"><metadata xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:identifier id="uid">'+id+'</dc:identifier><dc:title>'+esc(ti)+'</dc:title><dc:creator>'+esc(au)+'</dc:creator><dc:language>'+lang+'</dc:language><meta property="dcterms:modified">'+now+'</meta></metadata><manifest>'+man+'</manifest><spine toc="ncx">'+sp+'</spine></package>');
 var order=['mimetype'].concat(Object.keys(f).filter(function(k){return k!=='mimetype'})),o={};order.forEach(function(k){o[k]=f[k]});
 return fflate.zipSync(o,{level:6})}
function fname(t){var s=t.replace(/[\\\/:*?"<>|\u0000-\u001F]/g,'').replace(/\s+/g,' ').trim().slice(0,50);return (s||'book')+'.epub'}
$('go').onclick=function(){if(!ok)return;reset();var ti=clean($('ti').value).trim(),au=clean($('au').value).trim(),cs=chapters();
 var z=build(ti,au,$('lg').value,cs);
 // check our own output: first entry is the stored mimetype and every file reads back
 try{var u=fflate.unzipSync(z);if(new TextDecoder().decode(u['mimetype'])!=='application/epub+zip'||z[30]!==109)throw 0;for(var i=0;i<cs.length;i++)if(!u['OEBPS/ch'+(i+1)+'.xhtml'])throw 0}catch(e){msg('Something went wrong while making the file. Nothing was saved.',1);return}
 var b=new Blob([z],{type:'application/epub+zip'});url=URL.createObjectURL(b);var d=$('dl');d.href=url;d.download=fname(ti);d.textContent='Download '+fname(ti)+' ('+Math.max(1,Math.round(b.size/1024))+' KB)';d.hidden=false;msg('Done. Download it, then open it in an e-book reader app to check.')};
['ti','au'].forEach(function(i){$(i).addEventListener('input',upd)});$('lg').onchange=upd;$('addc').onclick=function(){addCh();upd()};
addCh();addCh();upd();
