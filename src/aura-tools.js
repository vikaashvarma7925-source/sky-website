/* Explicit, allowlisted tool dispatcher. Model text cannot invoke tools.
   No network, filesystem, account writes or eval. Future effectful tools must
   add authenticated ownership and a parameter-bound confirmation workflow. */
export const TOOL_REGISTRY = {
  calculate: { label: 'Calculator', effect: 'none', input: 'Arithmetic expression, max 200 characters' },
  text_stats: { label: 'Text analysis', effect: 'none', input: 'Pasted text, max 16000 characters' }
};
export function calculate(input) {
  if (input.length > 200 || /[^\d\s.()+*/%\-]/.test(input)) throw Error('Use numbers and + - * / % ( ) only.');
  const tokens=input.match(/\d*\.?\d+|[()+*/%\-]/g)||[];let pos=0,depth=0;
  function atom(){if(++depth>30)throw Error('Expression too deep.');let t=tokens[pos++],v;
    if(t==='+'||t==='-')v=(t==='-'?-1:1)*atom();
    else if(t==='('){v=sum();if(tokens[pos++]!==')')throw Error('Missing closing parenthesis.');}
    else if(t!==undefined&&/^\d*\.?\d+$/.test(t))v=Number(t);else throw Error('Invalid expression.');
    depth--;return v;}
  function product(){let n=atom();while(['*','/','%'].includes(tokens[pos])){let op=tokens[pos++],r=atom();if((op==='/'||op==='%')&&r===0)throw Error('Cannot divide by zero.');n=op==='*'?n*r:op==='/'?n/r:n%r;}return n;}
  function sum(){let n=product();while(['+','-'].includes(tokens[pos])){let op=tokens[pos++],r=product();n=op==='+'?n+r:n-r;}return n;}
  let value=sum();if(pos!==tokens.length||!Number.isFinite(value))throw Error('Invalid or out-of-range expression.');return {value};
}
export function runTool(id,input){
  if(!Object.hasOwn(TOOL_REGISTRY,id))throw Error('Unknown tool.');
  if(typeof input!=='string'||!input.trim()||input.length>16000)throw Error('Enter 1 to 16000 characters.');
  if(id==='calculate')return calculate(input);
  return {characters:[...input].length,words:input.trim().split(/\s+/u).length,lines:input.split(/\r?\n/).length};
}
