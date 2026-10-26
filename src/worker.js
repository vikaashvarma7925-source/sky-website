var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/worker.js
var __name2 = /* @__PURE__ */ __name(function(fn, name) {
  return fn;
}, "__name");
var CHAT_MODEL = "@cf/qwen/qwen3-30b-a3b-fp8";
var IMAGE_MODEL = "@cf/black-forest-labs/flux-1-schnell";
var CHAT_DAILY_IP = 30;
var CHAT_DAILY_GLOBAL = 500;
var IMG_DAILY_IP = 5;
var IMG_DAILY_GLOBAL = 15;
var MAX_MSG_CHARS = 500;
var MAX_HISTORY = 10;
var MAX_TOKENS = 300;
var CF_CHAT_MAX_TOKENS = 900;
var GROQ_MODEL = "openai/gpt-oss-120b";
var MODE_HINTS = {
  chat: "General friendly chat.",
  research: "Discuss the topic with the visitor: share what you know, key questions, and suggest what they could explore next on their own. You cannot browse the web - never claim to look things up live.",
  create: "Help the visitor create text: ideas, outlines, short drafts.",
  automate: "Help the visitor plan: break their task into simple steps they can follow themselves. You cannot perform actions - never claim you will do anything for them."
};
var BUSY = "SKY abhi thoda busy hai. Thodi der mein phir try karna.";
var CHAT_IP_LIMIT_MSG = "Your daily limit is over. Let's talk again tomorrow.";
var CHAT_GLOBAL_LIMIT_MSG = "SKY's free limit is over for today. Try again tomorrow.";
var IMG_IP_LIMIT_MSG = "Your photo limit for today is over (5 photos a day). Make more tomorrow.";
var IMG_GLOBAL_LIMIT_MSG = "SKY's photo limit is over for today. Try again tomorrow.";
function dayKey() {
  return (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
}
__name(dayKey, "dayKey");
__name2(dayKey, "dayKey");
async function incr(kv, key) {
  const cur = parseInt(await kv.get(key) || "0", 10);
  await kv.put(key, String(cur + 1), { expirationTtl: 172800 });
  return cur + 1;
}
__name(incr, "incr");
__name2(incr, "incr");
async function hashText(text, secret) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(text));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
__name(hashText, "hashText");
__name2(hashText, "hashText");
async function checkLimits(env, ip, day, prefix, ipCap, globalCap, ipMsg, globalMsg) {
  const gKey = prefix + "-g:" + day;
  const g = parseInt(await env.RATE.get(gKey) || "0", 10);
  if (g >= globalCap) return globalMsg;
  const iKey = prefix + "-ip2:" + await hashText(ip + ":" + day, env.RATE_HMAC_KEY) + ":" + day;
  const c = parseInt(await env.RATE.get(iKey) || "0", 10);
  if (c >= ipCap) return ipMsg;
  await incr(env.RATE, gKey);
  await incr(env.RATE, iKey);
  return null;
}
__name(checkLimits, "checkLimits");
__name2(checkLimits, "checkLimits");
function sanitizeHistory(body) {
  if (!body || !Array.isArray(body.history)) return [];
  return body.history.filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string").slice(-MAX_HISTORY).map((m) => ({ role: m.role, content: m.content.slice(0, MAX_MSG_CHARS) }));
}
__name(sanitizeHistory, "sanitizeHistory");
__name2(sanitizeHistory, "sanitizeHistory");
async function groqChat(env, messages) {
  if (!env.GROQ_API_KEY) return null;
  try {
    const resp = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": "Bearer " + env.GROQ_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ model: GROQ_MODEL, messages, max_completion_tokens: MAX_TOKENS, reasoning_effort: "low" }),
      signal: AbortSignal.timeout(2e4)
    });
    if (!resp.ok) return null;
    const data = await resp.json();
    const txt = data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
    return txt ? String(txt).trim() || null : null;
  } catch (e) {
    return null;
  }
}
__name(groqChat, "groqChat");
__name2(groqChat, "groqChat");
async function handleChat(request, env) {
  const limited = /* @__PURE__ */ __name2((msg) => Response.json({ reply: msg, limited: true }), "limited");
  try {
    const day = dayKey();
    const ip = request.headers.get("cf-connecting-ip") || "unknown";
    let body;
    try {
      body = await request.json();
    } catch {
      return Response.json({ error: "bad request" }, { status: 400 });
    }
    const msgLimit = MAX_MSG_CHARS;
    const message = String(body && body.message || "").slice(0, msgLimit).trim();
    if (!message) return Response.json({ error: "empty message" }, { status: 400 });
    const hint = MODE_HINTS[body.mode] || MODE_HINTS.chat;
    if (!env.RATE_HMAC_KEY) return limited(BUSY);
    const blocked = await checkLimits(env, ip, day, "chat", CHAT_DAILY_IP, CHAT_DAILY_GLOBAL, CHAT_IP_LIMIT_MSG, CHAT_GLOBAL_LIMIT_MSG);
    if (blocked) return limited(blocked);
    const history = sanitizeHistory(body);
    const messages = [
      { role: "system", content: "You are SKY, the friendly AI assistant on Vikas's SKY website. Reply in the SAME language and style the visitor writes in (Hindi, Hinglish, or English). Keep replies short (2-6 sentences), warm and practical. You can see the current conversation in this chat window and can use it. Strict honesty rules: you do NOT remember any earlier chats or visits - only this conversation - so never claim otherwise, and never say you will always be with the user. You cannot browse the internet, install apps, remember people between visits, or take any real-world action - never claim you can or will. The SKY website really offers ONLY these: this AI text chat on any topic, AI image generation, free on-device tools (photo, PDF, text, QR/barcode, and money calculators), and document guides for Indian forms. If asked what you or this site can do, name ONLY from that list - never invent features (no games, voice calls, video generation, or anything else). " + hint },
      ...history,
      { role: "user", content: message }
    ];
    let reply = await groqChat(env, messages);
    if (!reply) {
      const out = await env.AI.run(CHAT_MODEL, { messages, max_tokens: CF_CHAT_MAX_TOKENS });
      reply = out && out.response ? String(out.response).trim() : "";
    }
    if (!reply) return limited(BUSY);
    reply = reply.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
    if (!reply) return limited(BUSY);
    return Response.json({ reply });
  } catch (e) {
    return limited(BUSY);
  }
}
__name(handleChat, "handleChat");
__name2(handleChat, "handleChat");
async function handleImage(request, env) {
  const limited = /* @__PURE__ */ __name2((msg) => Response.json({ reply: msg, limited: true }), "limited");
  try {
    const day = dayKey();
    const ip = request.headers.get("cf-connecting-ip") || "unknown";
    let body;
    try {
      body = await request.json();
    } catch {
      return Response.json({ error: "bad request" }, { status: 400 });
    }
    const prompt = String(body && body.prompt || "").slice(0, 300).trim();
    if (!prompt) return Response.json({ error: "empty prompt" }, { status: 400 });
    if (!env.RATE_HMAC_KEY) return limited(BUSY);
    const blocked = await checkLimits(env, ip, day, "img", IMG_DAILY_IP, IMG_DAILY_GLOBAL, IMG_IP_LIMIT_MSG, IMG_GLOBAL_LIMIT_MSG);
    if (blocked) return limited(blocked);
    const out = await env.AI.run(IMAGE_MODEL, { prompt, steps: 4 });
    if (!out || !out.image) return limited("Could not create the photo. Try describing it a little differently.");
    return Response.json({ image: "data:image/jpeg;base64," + out.image });
  } catch (e) {
    return limited("Could not create the photo. Try again in a bit.");
  }
}
__name(handleImage, "handleImage");
__name2(handleImage, "handleImage");
var SEC_HEADERS = {
  "Content-Security-Policy": "default-src 'self'; script-src 'self' 'wasm-unsafe-eval' https://cdn.jsdelivr.net; style-src 'self' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob:; connect-src 'self' https://cdn.jsdelivr.net https://tessdata.projectnaptha.com; worker-src 'self' blob: https://cdn.jsdelivr.net; object-src 'none'; base-uri 'self'; frame-ancestors 'self'; form-action 'self'",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "SAMEORIGIN",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), geolocation=(), microphone=(self)",
  "Strict-Transport-Security": "max-age=15552000; includeSubDomains"
};
function withSecurityHeaders(resp) {
  const r = new Response(resp.body, resp);
  for (const [k, v] of Object.entries(SEC_HEADERS)) r.headers.set(k, v);
  return r;
}
__name(withSecurityHeaders, "withSecurityHeaders");
__name2(withSecurityHeaders, "withSecurityHeaders");
var worker_default = {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/chat" && request.method === "POST") return withSecurityHeaders(await handleChat(request, env));
    if (url.pathname === "/api/image" && request.method === "POST") return withSecurityHeaders(await handleImage(request, env));
    if (url.pathname.startsWith("/api/")) return withSecurityHeaders(Response.json({ error: "not found" }, { status: 404 }));
    if (url.pathname === "/googlec3eab17f9e90a79e.html") return withSecurityHeaders(new Response("google-site-verification: googlec3eab17f9e90a79e.html\n", { headers: { "content-type": "text/html; charset=utf-8" } }));
    return withSecurityHeaders(await env.ASSETS.fetch(request));
  }
};
export {
  worker_default as default
};
//# sourceMappingURL=worker.js.map
