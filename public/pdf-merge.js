/* SKY PDF Merge — device-only; pdf-lib (MIT), vendored locally */
(function(){
'use strict';
function $(id){return document.getElementById(id);}
function say(el,msg,cls){el.textContent=msg;el.className='status'+(cls?' '+cls:'');}
function dl(name,blob){var a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove();},4000);}
var st=$('pmStatus'),files=[],outPdf=null,busy=false;

function kb(n){return Math.round(n/1024)+' KB';}
function totalPages(){return files.reduce(function(s,f){return s+(f.pages||0);},0);}

function render(){
  var list=$('pmList');list.innerHTML='';
  files.forEach(function(f,i){
    var row=document.createElement('div');row.className='pm-row';
    var nm=document.createElement('div');nm.className='pm-name';nm.textContent=(i+1)+'. '+f.name;row.appendChild(nm);
    var pg=document.createElement('div');pg.className='pm-pages';pg.textContent=f.pages?f.pages+' page'+(f.pages>1?'s':''):'';row.appendChild(pg);
    var up=document.createElement('button');up.type='button';up.className='pm-btn';up.textContent='▲';up.title='Move up';up.disabled=(i===0);
    up.onclick=function(){var t=files[i-1];files[i-1]=files[i];files[i]=t;outPdf=null;$('pmDl').classList.add('file-hidden');render();};
    var dn=document.createElement('button');dn.type='button';dn.className='pm-btn';dn.textContent='▼';dn.title='Move down';dn.disabled=(i===files.length-1);
    dn.onclick=function(){var t=files[i+1];files[i+1]=files[i];files[i]=t;outPdf=null;$('pmDl').classList.add('file-hidden');render();};
    var rm=document.createElement('button');rm.type='button';rm.className='pm-btn';rm.textContent='✕';rm.title='Remove';
    rm.onclick=function(){files.splice(i,1);outPdf=null;$('pmDl').classList.add('file-hidden');render();say(st,files.length?files.length+' PDF(s), '+totalPages()+' pages total':'','');};
    row.appendChild(up);row.appendChild(dn);row.appendChild(rm);
    if(f.error){var er=document.createElement('div');er.className='pm-err';er.textContent='cannot be read (password-protected or damaged) — remove it';row.appendChild(er);}
    list.appendChild(row);
  });
  $('pmControls').classList.toggle('file-hidden',files.length===0);
}

$('pmFile').addEventListener('change',function(e){
  var picked=Array.prototype.slice.call(e.target.files||[]);e.target.value='';
  if(!picked.length)return;
  outPdf=null;$('pmDl').classList.add('file-hidden');
  var pending=picked.length;
  say(st,'Reading '+pending+' file(s)...','');
  picked.forEach(function(f){
    if(f.type!=='application/pdf'&&!/\.pdf$/i.test(f.name)){pending--;files.push({name:f.name,pages:0,error:true,bytes:null});if(!pending)done();return;}
    f.arrayBuffer().then(function(buf){
      return PDFLib.PDFDocument.load(buf).then(function(doc){
        files.push({name:f.name,pages:doc.getPageCount(),error:false,bytes:buf});
      });
    }).catch(function(){
      files.push({name:f.name,pages:0,error:true,bytes:null});
    }).finally(function(){pending--;if(!pending)done();});
  });
  function done(){
    render();
    var bad=files.filter(function(f){return f.error;}).length;
    var good=files.length-bad;
    say(st,(bad?bad+' file(s) cannot be read. ':'')+(good?good+' PDF(s) ready, '+totalPages()+' pages total — set the order, then tap Merge':''),bad?'err':'ok');
  }
});

$('pmGo').addEventListener('click',function(){
  if(busy)return;
  var good=files.filter(function(f){return !f.error;});
  if(good.length<2){say(st,'Pick at least 2 readable PDFs to merge','err');return;}
  busy=true;say(st,'Merging '+good.length+' PDFs...','');
  PDFLib.PDFDocument.create().then(function(dst){
    var chain=Promise.resolve();
    good.forEach(function(f){
      chain=chain.then(function(){
        return PDFLib.PDFDocument.load(f.bytes.slice(0)).then(function(src){
          return dst.copyPages(src,src.getPageIndices()).then(function(copied){
            copied.forEach(function(p){dst.addPage(p);});
          });
        });
      });
    });
    return chain.then(function(){return dst.save();});
  }).then(function(bytes){
    outPdf=new Blob([bytes],{type:'application/pdf'});
    $('pmDl').classList.remove('file-hidden');
    say(st,'Merged ✓ '+good.length+' files, '+totalPages()+' pages, '+kb(outPdf.size)+' — tap Download','ok');
  }).catch(function(){
    say(st,'Merge failed — one of the files may be protected or damaged','err');
  }).finally(function(){busy=false;});
});

$('pmDl').addEventListener('click',function(){
  if(!outPdf){say(st,'Tap Merge first','err');return;}
  dl('sky-merged.pdf',outPdf);
});
$('pmClear').addEventListener('click',function(){
  files=[];outPdf=null;$('pmDl').classList.add('file-hidden');render();say(st,'','');
});
})();
