var $=function(i){return document.getElementById(i)},url=null;
$('file').onchange=function(){var f=this.files[0],st=$('st'),dl=$('dl');dl.hidden=true;if(url){URL.revokeObjectURL(url);url=null}if(!f)return;
st.hidden=false;st.className='msg';
if(f.size>10*1024*1024){st.className='msg err';st.textContent='File is bigger than 10 MB.';return}
f.arrayBuffer().then(function(b){var u=new Uint8Array(b),enc='utf-8';
if(u[0]===0xFF&&u[1]===0xFE)enc='utf-16le';else if(u[0]===0xFE&&u[1]===0xFF)enc='utf-16be';
var t;try{t=new TextDecoder(enc,{fatal:true}).decode(b)}catch(e){st.className='msg err';st.textContent='This file is not saved as UTF-8, so names could turn into wrong letters. In Excel choose Save As, then "CSV UTF-8 (Comma delimited)", and upload that file.';return}
var r=SkyMini.csvToVcf(t);
if(r.error){st.className='msg err';st.textContent=r.error+(r.headers?' Found: '+r.headers.join(', '):'');return}
url=URL.createObjectURL(new Blob([r.vcf],{type:'text/vcard'}));dl.href=url;dl.hidden=false;
st.textContent=r.count+' contacts ready.'+(r.skippedRows.length?' Skipped rows with no name: '+r.skippedRows.join(', ')+'.':'')})};
