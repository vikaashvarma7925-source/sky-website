/* SKY liquid-glass hero: refractive lens over flowing purple-gold waves.
   Free, self-hosted WebGL - no external service. Falls back silently to CSS aurora. */
(function () {
  const host = document.querySelector('.hero');
  if (!host) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const canvas = document.createElement('canvas');
  canvas.className = 'fx-liquid';
  canvas.setAttribute('aria-hidden', 'true');
  host.insertBefore(canvas, host.firstChild);
  const scrim = document.createElement('div');
  scrim.className = 'fx-liquid-scrim';
  scrim.setAttribute('aria-hidden', 'true');
  host.insertBefore(scrim, canvas.nextSibling);
  const gl = canvas.getContext('webgl', { alpha: false, antialias: false, powerPreference: 'low-power' });
  if (!gl) { canvas.remove(); return; }

  const VS = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
  const FS = `
precision mediump float;
uniform vec2 u_res;uniform float u_t;uniform vec2 u_lens;uniform float u_lr;
float lineAt(float y,float pos,float w){return exp(-pow((y-pos)/w,2.0));}
vec3 scene(vec2 uv,float t){
  float w1=sin(uv.x*3.0+t*.45)*.16;
  float w2=sin((uv.x+uv.y)*4.2-t*.32)*.11;
  float w3=sin(uv.y*5.0-t*.22)*.05;
  float y=uv.y+w1+w2+w3;
  vec3 deep=vec3(.030,.014,.062);
  vec3 purple=vec3(.40,.12,.70);
  vec3 violet=vec3(.58,.28,.90);
  vec3 c=mix(deep,purple,smoothstep(.10,.60,y));
  c=mix(c,violet,smoothstep(.45,.85,y)*.4);
  /* crisp luminous wave lines - their bending is what reads as glass */
  c+=vec3(.96,.79,.42)*lineAt(y,.34+.06*sin(t*.30),.015)*.7;
  c+=vec3(.78,.52,1.0)*lineAt(y,.52+.07*sin(t*.24+1.7),.013)*.6;
  c+=vec3(1.0,.93,.80)*lineAt(y,.70+.06*sin(t*.40+3.1),.010)*.4;
  c+=vec3(.96,.79,.42)*lineAt(y,.86+.05*sin(t*.34+5.0),.011)*.3;
  c*= (1.0 - uv.y*.42);
  return c;
}
void main(){
  vec2 uv=gl_FragCoord.xy/u_res;
  float asp=u_res.x/u_res.y;
  vec2 p=vec2(uv.x*asp,uv.y);
  vec2 lp=vec2(u_lens.x*asp,u_lens.y);
  vec2 dv=p-lp;
  float d=length(dv);
  vec3 col;
  if(d<u_lr){
    float k=1.0-d/u_lr;
    vec2 n=dv/max(d,1e-4);
    /* magnify toward lens center + radial displacement = glass */
    vec2 base=lp+(dv/u_lr)*u_lr*(1.0-.20*k);
    vec2 buv=vec2(base.x/asp,base.y);
    vec2 off=n*k*k*.10;
    col=scene(buv-off,u_t);
    col*=1.0+.20*k;
    col+=vec3(.012,.006,.024)*k;
    col+=vec3(1.0,.95,.85)*pow(k,6.0)*.06;
    /* edge shadow inside glass */
    col*=1.0-exp(-pow((d-u_lr)/.010,2.0))*.15;
  }else{
    col=scene(uv,u_t);
  }
  /* directional glass edge: light catch on one side, shade opposite */
  vec2 L=normalize(vec2(-.55,.84));
  float eband=exp(-pow((d-u_lr)/.0085,2.0));
  if(d<u_lr || d<u_lr+.02){
    float el=dot(dv/max(d,1e-4),L);
    col+=vec3(1.0,.96,.84)*eband*max(el,0.0)*.30;
    col*=1.0-eband*max(-el,0.0)*.10;
  }
  /* soft specular streak across the dome */
  if(d<u_lr){
    float k2=1.0-d/u_lr;
    float streak=exp(-pow((dv.x+dv.y*.9)/(.42*u_lr),2.0))*k2;
    col+=vec3(1.0,.97,.90)*streak*.09;
  }
  gl_FragColor=vec4(col,1.0);
}`;
  function sh(type, src) { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { throw gl.getShaderInfoLog(s); } return s; }
  let prog;
  try {
    prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw 'link';
  } catch (e) { canvas.remove(); return; }
  gl.useProgram(prog);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'p');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const uRes = gl.getUniformLocation(prog, 'u_res');
  const uT = gl.getUniformLocation(prog, 'u_t');
  const uLens = gl.getUniformLocation(prog, 'u_lens');
  const uLr = gl.getUniformLocation(prog, 'u_lr');

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, innerWidth <= 700 ? 1.0 : 1.25);
    const w = Math.max(1, Math.round(host.clientWidth * dpr));
    const h = Math.max(1, Math.round(host.clientHeight * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w; canvas.height = h;
      gl.viewport(0, 0, w, h);
    }
  }
  resize();
  addEventListener('resize', resize);

  let visible = true, raf = 0, lastDraw = 0, frozen = false;
  let ticks = 0, sampleStart = 0, sampledOnce = false;
  const t0 = performance.now();
  function frame(now) {
    raf = 0;
    if (!visible || frozen) return;
    resize();
    /* measure real rAF cadence (not draws) for 2.5s; weak renderers get a static premium frame instead of stutter */
    if (!sampleStart) sampleStart = now;
    ticks++;
    if (now - sampleStart > 2500) {
      const fps = ticks / ((now - sampleStart) / 1000);
      sampleStart = 0; ticks = 0;
      if (innerWidth <= 700 && fps < 45) {
        /* two consecutive weak windows required - one bad window can be page-load jank */
        if (sampledOnce) {
          if (fps < 24) document.body.classList.add('fx-slow');
          draw(now); frozen = true; return;
        }
        sampledOnce = true;
      }
    }
    /* freeze while the user is actively scrolling - scroll frames win over ambient motion */
    if (document.body.classList.contains('scrolling')) { raf = requestAnimationFrame(frame); return; }
    /* phones: draw at ~30fps - halves GPU cost, wall-clock t keeps drift speed identical */
    if (innerWidth <= 700 && now - lastDraw < 33) { raf = requestAnimationFrame(frame); return; }
    lastDraw = now;
    draw(now);
  }
  function draw(now) {
    const t = (now - t0) / 1000;
    const lx = .5 + .3 * Math.sin(t * .35);
    const ly = .52 + .22 * Math.sin(t * .5 + 1.3);
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform1f(uT, t);
    gl.uniform2f(uLens, lx, 1.0 - ly);
    gl.uniform1f(uLr, .19);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    if (!frozen) raf = requestAnimationFrame(frame);
  }
  function play() { if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame); }
  new IntersectionObserver(es => { visible = es[0].isIntersecting; play(); }).observe(host);
  document.addEventListener('visibilitychange', play);
  play();
})();
