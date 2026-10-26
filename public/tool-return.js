/* Preserve the category a visitor used to enter a standalone tool. */
(function(){
'use strict';
var names={photo:'Photo tools',pdf:'PDF tools',text:'Text tools',ai:'AI Studio',money:'Money tools',dev:'Dev & code tools'};
var category=new URLSearchParams(location.search).get('skyCategory');if(!names[category])return;
var a=document.createElement('a');a.href='/home-preview?toolbox='+category;a.textContent='← Back to '+names[category];a.className='sky-tool-return';document.body.appendChild(a);
var css=document.createElement('style');css.textContent='.sky-tool-return{position:fixed;z-index:1000;top:12px;left:12px;display:inline-flex;align-items:center;min-height:44px;padding:10px 15px;border:1px solid rgba(246,201,105,.55);border-radius:24px;background:linear-gradient(145deg,#392449,#160e23);color:#ffe6a0;text-decoration:none;font:600 13px/1.3 Inter,Arial,sans-serif;box-shadow:inset 0 1px 0 #ffffff30,0 4px 15px #0005}.sky-tool-return:focus-visible{outline:2px solid #ffe6a0;outline-offset:3px}.topbar .brand-mini,.topbar .backlink{visibility:hidden}';document.head.appendChild(css);
})();
