/* SKY Studio tools batch 5 — PDF to images via pdfjs-dist 6.4.299 (Apache-2.0, patched vs CVE-2024-4367 & CVE-2026-16633), vendored locally; render-only usage, no viewer sandbox */
import * as pdfjsLib from './vendor/pdf.min.mjs';
(function(){
'use strict';
if(document.body.getAttribute('data-tool')!=='pdf2img')return;
function $(id){return document.getElementById(id);}
function say(el,msg,cls){el.textContent=msg;el.className='status'+(cls?' '+cls:'');}
var st=$('piStatus'),pdfBytes=null,pageCount=0,blobs=[];
pdfjsLib.GlobalWorkerOptions.workerSrc='vendor/pdf.worker.min.mjs';
$('piFile').onchange=function(){var f=this.files[0];if(!f)return;
  say(st,'Reading PDF…','');
  f.arrayBuffer().then(function(buf){pdfBytes=buf;return pdfjsLib.getDocument({data:buf.slice(0)}).promise;}).then(function(doc){pageCount=doc.numPages;$('piGo').classList.remove('file-hidden');$('piList').innerHTML='';blobs=[];say(st,'Loaded ✓ '+pageCount+' pages — tap Convert','ok');}).catch(function(){say(st,'Could not read that PDF (encrypted or damaged?)','err');});};
$('piGo').onclick=function(){if(!pdfBytes){say(st,'Choose a PDF first','err');return;}
  if(pageCount>30){say(st,'This PDF has '+pageCount+' pages — keep it to 30 pages on phone','err');return;}
  say(st,'Converting page 1 of '+pageCount+'…','');
  $('piList').innerHTML='';blobs=[];
  pdfjsLib.getDocument({data:pdfBytes.slice(0)}).promise.then(function(doc){
    var chain=Promise.resolve();
    var _loop=function(n){chain=chain.then(function(){return doc.getPage(n).then(function(page){
      var vp=page.getViewport({scale:2});
      var c=document.createElement('canvas');c.width=vp.width;c.height=vp.height;
      return page.render({canvasContext:c.getContext('2d'),viewport:vp}).promise.then(function(){
        return new Promise(function(res){c.toBlob(function(b){
          blobs.push(b);
          var row=document.createElement('div');row.className='tt-row';
          var btn=document.createElement('button');btn.className='gold-action';btn.textContent='⬇ Page '+n+' ('+Math.round(b.size/1024)+' KB)';
          btn.onclick=function(){var a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='sky-page-'+n+'.jpg';document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove();},4000);};
          row.appendChild(btn);$('piList').appendChild(row);
          say(st,'Converting page '+(n+1)+' of '+pageCount+'…','');
          res();},'image/jpeg',0.9);});});});});};
    for(var n=1;n<=pageCount;n++)_loop(n);
    return chain.then(function(){say(st,'Done ✓ '+pageCount+' image(s) ready — tap each to download','ok');});
  }).catch(function(){say(st,'Conversion failed','err');});};
})();
