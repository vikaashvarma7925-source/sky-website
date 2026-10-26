/* Short category lists use only tools already present on this site. */
(function(){
'use strict';
var groups={
photo:{title:'Photo tools',tools:[['Compress to target KB','#tool-photo-compress'],['Passport photo','#tool-passport'],['Screenshot text editor','screenshot-editor.html'],['Image resizer','image-resizer.html'],['Image cropper','image-cropper.html'],['Image converter','image-converter.html'],['Blur & pixelate','blur-pixelate.html'],['Metadata remover','metadata-remover.html'],['OCR text extract','ocr-tool.html'],['Image to PDF','image-to-pdf.html']]},
pdf:{title:'PDF tools',tools:[['Merge & reorder PDFs','pdf-merge.html'],['Remove PDF password','#tool-pdf-unlock'],['Split PDF','pdf-split.html'],['Image to PDF','image-to-pdf.html'],['Rotate PDF','pdf-rotate.html'],['PDF to images','pdf-to-images.html'],['Compress PDF','pdf-compress.html']]},
text:{title:'Text tools',tools:[['Word counter','word-counter.html'],['Case converter','case-converter.html'],['Password generator','password-generator.html'],['Encoder tools','encoder-tools.html'],['OCR text extract','ocr-tool.html']]},
ai:{title:'AI Studio',tools:[['AI Chat','#assistant','chat'],['Image generator','#assistant','image']]},
money:{title:'Money tools',tools:[['GST calculator','gst-calculator.html'],['EMI calculator','emi-calculator.html']]},
dev:{title:'Dev & code tools',tools:[['JSON formatter','json-formatter.html'],['JSON to CSV','json-to-csv.html'],['QR generator','qr-generator.html'],['Barcode generator','barcode-generator.html'],['Encoder tools','encoder-tools.html']]}
};
var dialog=document.getElementById('toolPicker'),list=document.getElementById('toolPickerList'),title=document.getElementById('toolPickerTitle');
if(!dialog)return;
var origin=null,inlineBack=null;
function showReturn(category){
 if(!inlineBack){inlineBack=document.createElement('button');inlineBack.type='button';inlineBack.className='sky-tool-return';document.body.appendChild(inlineBack);}
 inlineBack.textContent='← Back to '+groups[category].title;
 inlineBack.onclick=function(){inlineBack.remove();inlineBack=null;restoreCategory(category);};
}
function restoreCategory(category){
 var button=document.querySelector('[data-category="'+category+'"]');if(!button)return;
 var wrap=document.getElementById('stageWrap');scrollTo({top:wrap.getBoundingClientRect().top+scrollY+2*Math.round(innerHeight*.7),behavior:'instant'});
 button.click();
}

document.querySelectorAll('[data-category]').forEach(function(button){button.addEventListener('click',function(){
 var group=groups[button.dataset.category];if(!group)return;
 if(inlineBack){inlineBack.remove();inlineBack=null;}
 origin=button;title.textContent=group.title;list.replaceChildren();
 group.tools.forEach(function(tool){var a=document.createElement('a');a.className='picker-tool';a.href=tool[1].charAt(0)==='#'?tool[1]:tool[1]+'?skyCategory='+button.dataset.category;a.textContent=tool[0];
 a.addEventListener('click',function(ev){dialog.close();if(tool[1].charAt(0)==='#'){
  ev.preventDefault();showReturn(button.dataset.category);var dest=document.querySelector(tool[1]);if(!dest)return;
  if(dest.classList.contains('tool-card')&&!dest.classList.contains('tool-open')){var toggle=dest.querySelector('.tool-toggle');if(toggle)toggle.click();}
  var search=document.getElementById('toolSearch');if(search&&search.value){search.value='';search.dispatchEvent(new Event('input'));}
  if(tool[2]){var mode=document.querySelector('.mode-btn[data-mode="'+tool[2]+'"]');if(mode)mode.click();}
  dest.scrollIntoView({behavior:'instant',block:'start'});dest.setAttribute('tabindex','-1');dest.focus({preventScroll:true});
 }});list.appendChild(a);});
 document.body.classList.add('picker-open');dialog.showModal();dialog.querySelector('.picker-close').focus();
});});
document.getElementById('closeToolPicker').addEventListener('click',function(){dialog.close();});
dialog.addEventListener('click',function(ev){if(ev.target===dialog){var r=dialog.getBoundingClientRect();if(ev.clientX<r.left||ev.clientX>r.right||ev.clientY<r.top||ev.clientY>r.bottom)dialog.close();}});
dialog.addEventListener('close',function(){document.body.classList.remove('picker-open');if(origin)origin.focus({preventScroll:true});});
var restore=new URLSearchParams(location.search).get('toolbox');if(groups[restore]){requestAnimationFrame(function(){restoreCategory(restore);});}
})();
