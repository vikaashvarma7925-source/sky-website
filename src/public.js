var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/public.js
var SEC_HEADERS = {
  "Content-Security-Policy": "default-src 'self'; script-src 'self'; style-src 'self'; style-src-attr 'unsafe-inline'; font-src 'self'; img-src 'self' data: blob:; media-src 'self' blob:; connect-src 'self'; worker-src 'self' blob:; frame-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'self'; form-action 'self'; upgrade-insecure-requests",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "SAMEORIGIN",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), geolocation=(), microphone=()",
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains"
};
function wrap(resp) {
  var r = new Response(resp.body, resp);
  for (var k of Object.keys(SEC_HEADERS)) r.headers.set(k, SEC_HEADERS[k]);
  return r;
}
__name(wrap, "wrap");
function plain(status, text, allow) {
  return wrap(new Response(text, { status, headers: Object.assign({ "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" }, allow ? { Allow: allow } : {}) }));
}
__name(plain, "plain");
function cleanPath(raw) {
  let p = raw;
  if (/%(2e|2f|5c|00|25)/i.test(p) || p.indexOf("\\") >= 0 || p.indexOf("\0") >= 0) return null;
  try {
    p = decodeURIComponent(p);
  } catch (e) {
    return null;
  }
  if (p.charAt(0) !== "/" || p.indexOf("//") >= 0) return null;
  const segs = p.split("/");
  for (let i = 1; i < segs.length; i++) {
    const s = segs[i];
    if (s === ".." || s === "." || s.charAt(0) === "." || s.charAt(0) === "_") return null;
  }
  if (/\.(map|md|sh|toml|jsonc?|env|bak|orig|txt\.gz)$/i.test(p) && p !== "/robots.txt") return null;
  return p;
}
__name(cleanPath, "cleanPath");
var public_default = {
  async fetch(request, env) {
    if (request.method !== "GET" && request.method !== "HEAD") return plain(405, "Method not allowed", "GET, HEAD");
    var url = new URL(request.url);
    var cp = cleanPath(url.pathname);
    if (cp === null || /^\/(api|admin)(\/|$)/i.test(cp)) return plain(404, "Not found");
    url.pathname = cp;
    return wrap(await env.ASSETS.fetch(new Request(url.toString(), request)));
  }
};
export {
  public_default as default
};
//# sourceMappingURL=public.js.map