var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});

// node_modules/onnxruntime-web/dist/ort.wasm.bundle.min.mjs
var nr = Object.defineProperty;
var hs = Object.getOwnPropertyDescriptor;
var ws = Object.getOwnPropertyNames;
var bs = Object.prototype.hasOwnProperty;
var or = ((r) => typeof __require < "u" ? __require : typeof Proxy < "u" ? new Proxy(r, { get: (t, a) => (typeof __require < "u" ? __require : t)[a] }) : r)(function(r) {
  if (typeof __require < "u") return __require.apply(this, arguments);
  throw Error('Dynamic require of "' + r + '" is not supported');
});
var M = (r, t, a) => () => {
  if (a) throw a[0];
  try {
    return r && (t = r(r = 0)), t;
  } catch (u) {
    throw a = [u], u;
  }
};
var pt = (r, t) => {
  for (var a in t) nr(r, a, { get: t[a], enumerable: true });
};
var ys = (r, t, a, u) => {
  if (t && typeof t == "object" || typeof t == "function") for (let o of ws(t)) !bs.call(r, o) && o !== a && nr(r, o, { get: () => t[o], enumerable: !(u = hs(t, o)) || u.enumerable });
  return r;
};
var ar = (r) => ys(nr({}, "__esModule", { value: true }), r);
var Qe;
var Le;
var gn;
var et;
var En;
var Tn;
var Sn;
var mt = M(() => {
  "use strict";
  Qe = /* @__PURE__ */ new Map(), Le = [], gn = /* @__PURE__ */ new WeakMap(), et = (r, t, a) => {
    if (t && typeof t.init == "function" && typeof t.createInferenceSessionHandler == "function") {
      let u = Qe.get(r);
      if (u === void 0) Qe.set(r, { backend: t, priority: a });
      else {
        if (u.priority > a) return;
        if (u.priority === a && u.backend !== t) throw new Error(`cannot register backend "${r}" using priority ${a}`);
      }
      if (a >= 0) {
        let o = Le.indexOf(r);
        o !== -1 && Le.splice(o, 1);
        for (let d = 0; d < Le.length; d++) if (Qe.get(Le[d]).priority <= a) {
          Le.splice(d, 0, r);
          return;
        }
        Le.push(r);
      }
      return;
    }
    throw new TypeError("not a valid backend");
  }, En = async (r) => {
    let t = Qe.get(r);
    if (!t) return "backend not found.";
    if (t.initialized) return t.backend;
    if (t.aborted) return t.error;
    {
      let a = !!t.initPromise;
      try {
        if (!a) {
          let u = t.backend, o = gn.get(u);
          t.initPromise = o ? o.then(async () => u.init(r), async () => u.init(r)) : u.init(r), gn.set(u, t.initPromise);
        }
        return await t.initPromise, t.initialized = true, t.backend;
      } catch (u) {
        return a || (t.error = `${u}`, t.aborted = true), t.error;
      } finally {
        delete t.initPromise;
      }
    }
  }, Tn = async (r) => {
    let t = r.executionProviders || [], a = t.map((l) => typeof l == "string" ? l : l.name), u = a.length === 0 ? Le : a, o, d = [], w = /* @__PURE__ */ new Set();
    for (let l of u) {
      let m = await En(l);
      typeof m == "string" ? d.push({ name: l, err: m }) : (o || (o = m), o === m && w.add(l));
    }
    if (!o) throw new Error(`no available backend found. ERR: ${d.map((l) => `[${l.name}] ${l.err}`).join(", ")}`);
    for (let { name: l, err: m } of d) a.includes(l) && console.warn(`removing requested execution provider "${l}" from session options because it is not available: ${m}`);
    let c = t.filter((l) => w.has(typeof l == "string" ? l : l.name));
    return [o, new Proxy(r, { get: (l, m) => m === "executionProviders" ? c : Reflect.get(l, m) })];
  }, Sn = async () => {
    let r = [];
    for (let a of Le) {
      if (typeof Qe.get(a).backend.createLoraAdapterHandler != "function") continue;
      let u = await En(a);
      if (typeof u != "string") return u;
      r.push({ name: a, err: u });
    }
    let t = r.length === 0 ? "" : ` ERR: ${r.map((a) => `[${a.name}] ${a.err}`).join(", ")}`;
    throw new Error(`no available backend supports LoRA adapters.${t}`);
  };
});
var vn = M(() => {
  "use strict";
  mt();
});
var An;
var On = M(() => {
  "use strict";
  An = "1.31.1";
});
var In;
var K;
var sr = M(() => {
  "use strict";
  On();
  In = "warning", K = { wasm: {}, webgl: {}, webgpu: {}, versions: { common: An }, set logLevel(r) {
    if (r !== void 0) {
      if (typeof r != "string" || ["verbose", "info", "warning", "error", "fatal"].indexOf(r) === -1) throw new Error(`Unsupported logging level: ${r}`);
      In = r;
    }
  }, get logLevel() {
    return In;
  } };
  Object.defineProperty(K, "logLevel", { enumerable: true });
});
var Y;
var Ln = M(() => {
  "use strict";
  sr();
  Y = K;
});
var Bn;
var _n;
var de;
var le;
var De;
var Pe;
var ht = M(() => {
  "use strict";
  sr();
  Bn = (r, t) => {
    (typeof K.trace > "u" ? !K.wasm.trace : !K.trace) || console.timeStamp(`${r}::ORT::${t}`);
  }, _n = (r, t) => {
    let a = new Error().stack?.split(/\r\n|\r|\n/g) || [], u = false;
    for (let o = 0; o < a.length; o++) {
      if (u && !a[o].includes("TRACE_FUNC")) {
        let d = `FUNC_${r}::${a[o].trim().split(" ")[1]}`;
        t && (d += `::${t}`), Bn("CPU", d);
        return;
      }
      a[o].includes("TRACE_FUNC") && (u = true);
    }
  }, de = (r) => {
    (typeof K.trace > "u" ? !K.wasm.trace : !K.trace) || _n("BEGIN", r);
  }, le = (r) => {
    (typeof K.trace > "u" ? !K.wasm.trace : !K.trace) || _n("END", r);
  }, De = (r) => {
    (typeof K.trace > "u" ? !K.wasm.trace : !K.trace) || console.time(`ORT::${r}`);
  }, Pe = (r) => {
    (typeof K.trace > "u" ? !K.wasm.trace : !K.trace) || console.timeEnd(`ORT::${r}`);
  };
});
var We;
var ir = M(() => {
  "use strict";
  mt();
  ht();
  We = class r {
    constructor(t, a) {
      this.backend = t, this.handler = a;
    }
    static async create(t) {
      if (de(), typeof t != "string" && !(t instanceof Uint8Array)) throw new TypeError("Unexpected argument[0]: must be 'path' or 'buffer'.");
      let a = await Sn(), u = await a.createLoraAdapterHandler(t);
      return le(), new r(a, u);
    }
    async release() {
      return this.handler.dispose();
    }
  };
});
var Dn;
var Pn;
var xn = M(() => {
  "use strict";
  Dn = (r, t) => {
    let a = typeof document < "u" ? document.createElement("canvas") : new OffscreenCanvas(1, 1);
    a.width = r.dims[3], a.height = r.dims[2];
    let u = a.getContext("2d");
    if (u != null) {
      let o, d;
      t?.tensorLayout !== void 0 && t.tensorLayout === "NHWC" ? (o = r.dims[2], d = r.dims[3]) : (o = r.dims[3], d = r.dims[2]);
      let w = t?.format !== void 0 ? t.format : "RGB", c = t?.norm, l, m;
      c === void 0 || c.mean === void 0 ? l = [255, 255, 255, 255] : typeof c.mean == "number" ? l = [c.mean, c.mean, c.mean, c.mean] : (l = [c.mean[0], c.mean[1], c.mean[2], 0], c.mean[3] !== void 0 && (l[3] = c.mean[3])), c === void 0 || c.bias === void 0 ? m = [0, 0, 0, 0] : typeof c.bias == "number" ? m = [c.bias, c.bias, c.bias, c.bias] : (m = [c.bias[0], c.bias[1], c.bias[2], 0], c.bias[3] !== void 0 && (m[3] = c.bias[3]));
      let h = d * o, g = 0, y = h, T = h * 2, S = -1;
      w === "RGBA" ? (g = 0, y = h, T = h * 2, S = h * 3) : w === "RGB" ? (g = 0, y = h, T = h * 2) : w === "RBG" && (g = 0, T = h, y = h * 2);
      for (let U = 0; U < d; U++) for (let $2 = 0; $2 < o; $2++) {
        let v = (r.data[g++] - m[0]) * l[0], O = (r.data[y++] - m[1]) * l[1], R = (r.data[T++] - m[2]) * l[2], C = S === -1 ? 255 : (r.data[S++] - m[3]) * l[3];
        u.fillStyle = "rgba(" + v + "," + O + "," + R + "," + C + ")", u.fillRect($2, U, 1, 1);
      }
      if ("toDataURL" in a) return a.toDataURL();
      throw new Error("toDataURL is not supported");
    } else throw new Error("Can not access image data");
  }, Pn = (r, t) => {
    let a = typeof document < "u" ? document.createElement("canvas").getContext("2d") : new OffscreenCanvas(1, 1).getContext("2d"), u;
    if (a != null) {
      let o, d, w;
      t?.tensorLayout !== void 0 && t.tensorLayout === "NHWC" ? (o = r.dims[2], d = r.dims[1], w = r.dims[3]) : (o = r.dims[3], d = r.dims[2], w = r.dims[1]);
      let c = t !== void 0 && t.format !== void 0 ? t.format : "RGB", l = t?.norm, m, h;
      l === void 0 || l.mean === void 0 ? m = [255, 255, 255, 255] : typeof l.mean == "number" ? m = [l.mean, l.mean, l.mean, l.mean] : (m = [l.mean[0], l.mean[1], l.mean[2], 255], l.mean[3] !== void 0 && (m[3] = l.mean[3])), l === void 0 || l.bias === void 0 ? h = [0, 0, 0, 0] : typeof l.bias == "number" ? h = [l.bias, l.bias, l.bias, l.bias] : (h = [l.bias[0], l.bias[1], l.bias[2], 0], l.bias[3] !== void 0 && (h[3] = l.bias[3]));
      let g = d * o;
      if (t !== void 0 && (t.format !== void 0 && w === 4 && t.format !== "RGBA" || w === 3 && t.format !== "RGB" && t.format !== "BGR")) throw new Error("Tensor format doesn't match input tensor dims");
      let y = 4, T = 0, S = 1, U = 2, $2 = 3, v = 0, O = g, R = g * 2, C = -1;
      c === "RGBA" ? (v = 0, O = g, R = g * 2, C = g * 3) : c === "RGB" ? (v = 0, O = g, R = g * 2) : c === "RBG" && (v = 0, R = g, O = g * 2), u = a.createImageData(o, d);
      for (let G = 0; G < d * o; T += y, S += y, U += y, $2 += y, G++) u.data[T] = (r.data[v++] - h[0]) * m[0], u.data[S] = (r.data[O++] - h[1]) * m[1], u.data[U] = (r.data[R++] - h[2]) * m[2], u.data[$2] = C === -1 ? 255 : (r.data[C++] - h[3]) * m[3];
    } else throw new Error("Can not access image data");
    return u;
  };
});
var ur;
var Un;
var Cn;
var Mn;
var Rn;
var Nn;
var Fn = M(() => {
  "use strict";
  wt();
  ur = (r, t) => {
    if (r === void 0) throw new Error("Image buffer must be defined");
    if (t.height === void 0 || t.width === void 0) throw new Error("Image height and width must be defined");
    if (t.tensorLayout === "NHWC") throw new Error("NHWC Tensor layout is not supported yet");
    let { height: a, width: u } = t, o = t.norm ?? { mean: 255, bias: 0 }, d, w;
    typeof o.mean == "number" ? d = [o.mean, o.mean, o.mean, o.mean] : d = [o.mean[0], o.mean[1], o.mean[2], o.mean[3] ?? 255], typeof o.bias == "number" ? w = [o.bias, o.bias, o.bias, o.bias] : w = [o.bias[0], o.bias[1], o.bias[2], o.bias[3] ?? 0];
    let c = t.format !== void 0 ? t.format : "RGBA", l = t.tensorFormat !== void 0 && t.tensorFormat !== void 0 ? t.tensorFormat : "RGB", m = a * u, h = l === "RGBA" ? new Float32Array(m * 4) : new Float32Array(m * 3), g = 4, y = 0, T = 1, S = 2, U = 3, $2 = 0, v = m, O = m * 2, R = -1;
    c === "RGB" && (g = 3, y = 0, T = 1, S = 2, U = -1), l === "RGBA" ? R = m * 3 : l === "RBG" ? ($2 = 0, O = m, v = m * 2) : l === "BGR" && (O = 0, v = m, $2 = m * 2);
    for (let G = 0; G < m; G++, y += g, S += g, T += g, U += g) h[$2++] = (r[y] + w[0]) / d[0], h[v++] = (r[T] + w[1]) / d[1], h[O++] = (r[S] + w[2]) / d[2], R !== -1 && U !== -1 && (h[R++] = (r[U] + w[3]) / d[3]);
    return l === "RGBA" ? new re("float32", h, [1, 4, a, u]) : new re("float32", h, [1, 3, a, u]);
  }, Un = async (r, t) => {
    let a = typeof HTMLImageElement < "u" && r instanceof HTMLImageElement, u = typeof ImageData < "u" && r instanceof ImageData, o = typeof ImageBitmap < "u" && r instanceof ImageBitmap, d = typeof r == "string", w, c = t ?? {}, l = () => {
      if (typeof document < "u") return document.createElement("canvas");
      if (typeof OffscreenCanvas < "u") return new OffscreenCanvas(1, 1);
      throw new Error("Canvas is not supported");
    }, m = (h) => typeof HTMLCanvasElement < "u" && h instanceof HTMLCanvasElement || h instanceof OffscreenCanvas ? h.getContext("2d") : null;
    if (a) {
      let h = l();
      h.width = r.width, h.height = r.height;
      let g = m(h);
      if (g != null) {
        let y = r.height, T = r.width;
        if (t !== void 0 && t.resizedHeight !== void 0 && t.resizedWidth !== void 0 && (y = t.resizedHeight, T = t.resizedWidth), t !== void 0) {
          if (c = t, t.tensorFormat !== void 0) throw new Error("Image input config format must be RGBA for HTMLImageElement");
          c.tensorFormat = "RGBA", c.height = y, c.width = T;
        } else c.tensorFormat = "RGBA", c.height = y, c.width = T;
        g.drawImage(r, 0, 0), w = g.getImageData(0, 0, T, y).data;
      } else throw new Error("Can not access image data");
    } else if (u) {
      let h, g;
      if (t !== void 0 && t.resizedWidth !== void 0 && t.resizedHeight !== void 0 ? (h = t.resizedHeight, g = t.resizedWidth) : (h = r.height, g = r.width), t !== void 0 && (c = t), c.format = "RGBA", c.height = h, c.width = g, t !== void 0) {
        let y = l();
        y.width = g, y.height = h;
        let T = m(y);
        if (T != null) T.putImageData(r, 0, 0), w = T.getImageData(0, 0, g, h).data;
        else throw new Error("Can not access image data");
      } else w = r.data;
    } else if (o) {
      if (t === void 0) throw new Error("Please provide image config with format for Imagebitmap");
      let h = l();
      h.width = r.width, h.height = r.height;
      let g = m(h);
      if (g != null) {
        let y = r.height, T = r.width;
        return g.drawImage(r, 0, 0, T, y), w = g.getImageData(0, 0, T, y).data, c.height = y, c.width = T, ur(w, c);
      } else throw new Error("Can not access image data");
    } else {
      if (d) return new Promise((h, g) => {
        let y = l(), T = m(y);
        if (!r || !T) return g();
        let S = new Image();
        S.crossOrigin = "Anonymous", S.src = r, S.onload = () => {
          y.width = S.width, y.height = S.height, T.drawImage(S, 0, 0, y.width, y.height);
          let U = T.getImageData(0, 0, y.width, y.height);
          c.height = y.height, c.width = y.width, h(ur(U.data, c));
        };
      });
      throw new Error("Input data provided is not supported - aborted tensor creation");
    }
    if (w !== void 0) return ur(w, c);
    throw new Error("Input data provided is not supported - aborted tensor creation");
  }, Cn = (r, t) => {
    let { width: a, height: u, download: o, dispose: d } = t, w = [1, u, a, 4];
    return new re({ location: "texture", type: "float32", texture: r, dims: w, download: o, dispose: d });
  }, Mn = (r, t) => {
    let { dataType: a, dims: u, download: o, dispose: d } = t;
    return new re({ location: "gpu-buffer", type: a ?? "float32", gpuBuffer: r, dims: u, download: o, dispose: d });
  }, Rn = (r, t) => {
    let { dataType: a, dims: u, download: o, dispose: d } = t;
    return new re({ location: "ml-tensor", type: a ?? "float32", mlTensor: r, dims: u, download: o, dispose: d });
  }, Nn = (r, t, a) => new re({ location: "cpu-pinned", type: r, data: t, dims: a ?? [t.length] });
});
var xe;
var tt;
var kn;
var Wn;
var Gn = M(() => {
  "use strict";
  xe = /* @__PURE__ */ new Map([["float32", Float32Array], ["uint8", Uint8Array], ["int8", Int8Array], ["uint16", Uint16Array], ["int16", Int16Array], ["int32", Int32Array], ["bool", Uint8Array], ["float64", Float64Array], ["uint32", Uint32Array], ["int4", Uint8Array], ["uint4", Uint8Array]]), tt = /* @__PURE__ */ new Map([[Float32Array, "float32"], [Uint8Array, "uint8"], [Int8Array, "int8"], [Uint16Array, "uint16"], [Int16Array, "int16"], [Int32Array, "int32"], [Float64Array, "float64"], [Uint32Array, "uint32"]]), kn = false, Wn = () => {
    if (!kn) {
      kn = true;
      let r = typeof BigInt64Array < "u" && BigInt64Array.from, t = typeof BigUint64Array < "u" && BigUint64Array.from, a = globalThis.Float16Array, u = typeof a < "u" && a.from;
      r && (xe.set("int64", BigInt64Array), tt.set(BigInt64Array, "int64")), t && (xe.set("uint64", BigUint64Array), tt.set(BigUint64Array, "uint64")), u ? (xe.set("float16", a), tt.set(a, "float16")) : xe.set("float16", Uint16Array);
    }
  };
});
var $n;
var Hn;
var zn = M(() => {
  "use strict";
  wt();
  $n = (r) => {
    let t = 1;
    for (let a = 0; a < r.length; a++) {
      let u = r[a];
      if (typeof u != "number" || !Number.isSafeInteger(u)) throw new TypeError(`dims[${a}] must be an integer, got: ${u}`);
      if (u < 0) throw new RangeError(`dims[${a}] must be a non-negative integer, got: ${u}`);
      t *= u;
    }
    return t;
  }, Hn = (r, t) => {
    switch (r.location) {
      case "cpu":
        return new re(r.type, r.data, t);
      case "cpu-pinned":
        return new re({ location: "cpu-pinned", data: r.data, type: r.type, dims: t });
      case "texture":
        return new re({ location: "texture", texture: r.texture, type: r.type, dims: t });
      case "gpu-buffer":
        return new re({ location: "gpu-buffer", gpuBuffer: r.gpuBuffer, type: r.type, dims: t });
      case "ml-tensor":
        return new re({ location: "ml-tensor", mlTensor: r.mlTensor, type: r.type, dims: t });
      default:
        throw new Error(`tensorReshape: tensor location ${r.location} is not supported`);
    }
  };
});
var re;
var wt = M(() => {
  "use strict";
  xn();
  Fn();
  Gn();
  zn();
  re = class {
    constructor(t, a, u) {
      Wn();
      let o, d;
      if (typeof t == "object" && "location" in t) switch (this.dataLocation = t.location, o = t.type, d = t.dims, t.location) {
        case "cpu-pinned": {
          let c = xe.get(o);
          if (!c) throw new TypeError(`unsupported type "${o}" to create tensor from pinned buffer`);
          if (!(t.data instanceof c)) throw new TypeError(`buffer should be of type ${c.name}`);
          this.cpuData = t.data;
          break;
        }
        case "texture": {
          if (o !== "float32") throw new TypeError(`unsupported type "${o}" to create tensor from texture`);
          this.gpuTextureData = t.texture, this.downloader = t.download, this.disposer = t.dispose;
          break;
        }
        case "gpu-buffer": {
          if (o !== "float32" && o !== "float16" && o !== "int32" && o !== "int64" && o !== "uint32" && o !== "uint8" && o !== "bool" && o !== "uint4" && o !== "int4") throw new TypeError(`unsupported type "${o}" to create tensor from gpu buffer`);
          this.gpuBufferData = t.gpuBuffer, this.downloader = t.download, this.disposer = t.dispose;
          break;
        }
        case "ml-tensor": {
          if (o !== "float32" && o !== "float16" && o !== "int32" && o !== "int64" && o !== "uint32" && o !== "uint64" && o !== "int8" && o !== "uint8" && o !== "bool" && o !== "uint4" && o !== "int4") throw new TypeError(`unsupported type "${o}" to create tensor from MLTensor`);
          this.mlTensorData = t.mlTensor, this.downloader = t.download, this.disposer = t.dispose;
          break;
        }
        default:
          throw new Error(`Tensor constructor: unsupported location '${this.dataLocation}'`);
      }
      else {
        let c, l;
        if (typeof t == "string") if (o = t, l = u, t === "string") {
          if (!Array.isArray(a)) throw new TypeError("A string tensor's data must be a string array.");
          c = a;
        } else {
          let m = xe.get(t);
          if (m === void 0) throw new TypeError(`Unsupported tensor type: ${t}.`);
          if (Array.isArray(a)) {
            if (t === "float16" && m === Uint16Array || t === "uint4" || t === "int4") throw new TypeError(`Creating a ${t} tensor from number array is not supported. Please use ${m.name} as data.`);
            t === "uint64" || t === "int64" ? c = m.from(a, BigInt) : c = m.from(a);
          } else if (a instanceof m) c = a;
          else if (a instanceof Uint8ClampedArray) if (t === "uint8") c = Uint8Array.from(a);
          else throw new TypeError("A Uint8ClampedArray tensor's data must be type of uint8");
          else if (t === "float16" && a instanceof Uint16Array && m !== Uint16Array) c = new globalThis.Float16Array(a.buffer, a.byteOffset, a.length);
          else throw new TypeError(`A ${o} tensor's data must be type of ${m}`);
        }
        else if (l = a, Array.isArray(t)) {
          if (t.length === 0) throw new TypeError("Tensor type cannot be inferred from an empty array.");
          let m = typeof t[0];
          if (m === "string") o = "string", c = t;
          else if (m === "boolean") o = "bool", c = Uint8Array.from(t);
          else throw new TypeError(`Invalid element type of data array: ${m}.`);
        } else if (t instanceof Uint8ClampedArray) o = "uint8", c = Uint8Array.from(t);
        else {
          let m = tt.get(t.constructor);
          if (m === void 0) throw new TypeError(`Unsupported type for tensor data: ${t.constructor}.`);
          o = m, c = t;
        }
        if (l === void 0) l = [c.length];
        else if (!Array.isArray(l)) throw new TypeError("A tensor's dims must be a number array");
        d = l, this.cpuData = c, this.dataLocation = "cpu";
      }
      let w = $n(d);
      if (this.cpuData && w !== this.cpuData.length && !((o === "uint4" || o === "int4") && Math.ceil(w / 2) === this.cpuData.length)) throw new Error(`Tensor's size(${w}) does not match data length(${this.cpuData.length}).`);
      this.type = o, this.dims = d, this.size = w;
    }
    static async fromImage(t, a) {
      return Un(t, a);
    }
    static fromTexture(t, a) {
      return Cn(t, a);
    }
    static fromGpuBuffer(t, a) {
      return Mn(t, a);
    }
    static fromMLTensor(t, a) {
      return Rn(t, a);
    }
    static fromPinnedBuffer(t, a, u) {
      return Nn(t, a, u);
    }
    toDataURL(t) {
      return Dn(this, t);
    }
    toImageData(t) {
      return Pn(this, t);
    }
    get data() {
      if (this.ensureValid(), !this.cpuData) throw new Error("The data is not on CPU. Use `getData()` to download GPU data to CPU, or use `texture` or `gpuBuffer` property to access the GPU data directly.");
      return this.cpuData;
    }
    get location() {
      return this.dataLocation;
    }
    get texture() {
      if (this.ensureValid(), !this.gpuTextureData) throw new Error("The data is not stored as a WebGL texture.");
      return this.gpuTextureData;
    }
    get gpuBuffer() {
      if (this.ensureValid(), !this.gpuBufferData) throw new Error("The data is not stored as a WebGPU buffer.");
      return this.gpuBufferData;
    }
    get mlTensor() {
      if (this.ensureValid(), !this.mlTensorData) throw new Error("The data is not stored as a WebNN MLTensor.");
      return this.mlTensorData;
    }
    async getData(t) {
      switch (this.ensureValid(), this.dataLocation) {
        case "cpu":
        case "cpu-pinned":
          return this.data;
        case "texture":
        case "gpu-buffer":
        case "ml-tensor": {
          if (!this.downloader) throw new Error("The current tensor is not created with a specified data downloader.");
          if (this.isDownloading) throw new Error("The current tensor is being downloaded.");
          try {
            this.isDownloading = true;
            let a = await this.downloader();
            return this.downloader = void 0, this.dataLocation = "cpu", this.cpuData = a, t && this.disposer && (this.disposer(), this.disposer = void 0), a;
          } finally {
            this.isDownloading = false;
          }
        }
        default:
          throw new Error(`cannot get data from location: ${this.dataLocation}`);
      }
    }
    dispose() {
      if (this.isDownloading) throw new Error("The current tensor is being downloaded.");
      this.disposer && (this.disposer(), this.disposer = void 0), this.cpuData = void 0, this.gpuTextureData = void 0, this.gpuBufferData = void 0, this.mlTensorData = void 0, this.downloader = void 0, this.isDownloading = void 0, this.dataLocation = "none";
    }
    ensureValid() {
      if (this.dataLocation === "none") throw new Error("The tensor is disposed.");
    }
    reshape(t) {
      if (this.ensureValid(), this.downloader || this.disposer) throw new Error("Cannot reshape a tensor that owns GPU resource.");
      return Hn(this, t);
    }
  };
});
var pe;
var fr = M(() => {
  "use strict";
  wt();
  pe = re;
});
var bt;
var jn = M(() => {
  "use strict";
  mt();
  ir();
  fr();
  ht();
  bt = class r {
    constructor(t, a) {
      this.handler = t, this.backend = a;
    }
    async run(t, a, u) {
      de(), De("InferenceSession.run");
      let o = {}, d = {};
      if (typeof t != "object" || t === null || t instanceof pe || Array.isArray(t)) throw new TypeError("'feeds' must be an object that use input names as keys and OnnxValue as corresponding values.");
      let w = true;
      if (typeof a == "object") {
        if (a === null) throw new TypeError("Unexpected argument[1]: cannot be null.");
        if (a instanceof pe) throw new TypeError("'fetches' cannot be a Tensor");
        if (Array.isArray(a)) {
          if (a.length === 0) throw new TypeError("'fetches' cannot be an empty array.");
          w = false;
          for (let h of a) {
            if (typeof h != "string") throw new TypeError("'fetches' must be a string array or an object.");
            if (this.outputNames.indexOf(h) === -1) throw new RangeError(`'fetches' contains invalid output name: ${h}.`);
            o[h] = null;
          }
          if (typeof u == "object" && u !== null) d = u;
          else if (typeof u < "u") throw new TypeError("'options' must be an object.");
        } else {
          let h = false, g = Object.getOwnPropertyNames(a);
          for (let y of this.outputNames) if (g.indexOf(y) !== -1) {
            let T = a[y];
            (T === null || T instanceof pe) && (h = true, w = false, o[y] = T);
          }
          if (h) {
            if (typeof u == "object" && u !== null) d = u;
            else if (typeof u < "u") throw new TypeError("'options' must be an object.");
          } else d = a;
        }
      } else if (typeof a < "u") throw new TypeError("Unexpected argument[1]: must be 'fetches' or 'options'.");
      for (let h of this.inputNames) if (typeof t[h] > "u") throw new Error(`input '${h}' is missing in 'feeds'.`);
      if (w) for (let h of this.outputNames) o[h] = null;
      let c;
      if (d.activeLoraAdapters !== void 0) {
        if (!Array.isArray(d.activeLoraAdapters)) throw new TypeError("'activeLoraAdapters' must be an array.");
        c = d.activeLoraAdapters.map((h) => {
          if (!(h instanceof We)) throw new TypeError("'activeLoraAdapters' must be an array of LoraAdapter objects.");
          if (h.backend !== this.backend) throw new Error("LoRA adapter was created by a different backend than the session.");
          return h.handler;
        });
      }
      let l = await this.handler.run(t, o, d, c), m = {};
      for (let h in l) if (Object.hasOwnProperty.call(l, h)) {
        let g = l[h];
        g instanceof pe ? m[h] = g : m[h] = new pe(g.type, g.data, g.dims);
      }
      return Pe("InferenceSession.run"), le(), m;
    }
    async release() {
      return this.handler.dispose();
    }
    static async create(t, a, u, o) {
      de(), De("InferenceSession.create");
      let d, w = {};
      if (typeof t == "string") {
        if (d = t, typeof a == "object" && a !== null) w = a;
        else if (typeof a < "u") throw new TypeError("'options' must be an object.");
      } else if (t instanceof Uint8Array) {
        if (d = t, typeof a == "object" && a !== null) w = a;
        else if (typeof a < "u") throw new TypeError("'options' must be an object.");
      } else if (t instanceof ArrayBuffer || typeof SharedArrayBuffer < "u" && t instanceof SharedArrayBuffer) {
        let h = t, g = 0, y = t.byteLength;
        if (typeof a == "object" && a !== null) w = a;
        else if (typeof a == "number") {
          if (g = a, !Number.isSafeInteger(g)) throw new RangeError("'byteOffset' must be an integer.");
          if (g < 0 || g >= h.byteLength) throw new RangeError(`'byteOffset' is out of range [0, ${h.byteLength}).`);
          if (y = t.byteLength - g, typeof u == "number") {
            if (y = u, !Number.isSafeInteger(y)) throw new RangeError("'byteLength' must be an integer.");
            if (y <= 0 || g + y > h.byteLength) throw new RangeError(`'byteLength' is out of range (0, ${h.byteLength - g}].`);
            if (typeof o == "object" && o !== null) w = o;
            else if (typeof o < "u") throw new TypeError("'options' must be an object.");
          } else if (typeof u < "u") throw new TypeError("'byteLength' must be a number.");
        } else if (typeof a < "u") throw new TypeError("'options' must be an object.");
        d = new Uint8Array(h, g, y);
      } else throw new TypeError("Unexpected argument[0]: must be 'path' or 'buffer'.");
      let [c, l] = await Tn(w), m = await c.createInferenceSessionHandler(d, l);
      return Pe("InferenceSession.create"), le(), new r(m, c);
    }
    startProfiling() {
      this.handler.startProfiling();
    }
    endProfiling() {
      this.handler.endProfiling();
    }
    get inputNames() {
      return this.handler.inputNames;
    }
    get outputNames() {
      return this.handler.outputNames;
    }
    get inputMetadata() {
      return this.handler.inputMetadata;
    }
    get outputMetadata() {
      return this.handler.outputMetadata;
    }
  };
});
var gs;
var Vn = M(() => {
  "use strict";
  jn();
  gs = bt;
});
var Es;
var Yn = M(() => {
  "use strict";
  ir();
  Es = We;
});
var qn = M(() => {
  "use strict";
});
var Jn = M(() => {
  "use strict";
});
var Zn = M(() => {
  "use strict";
});
var Xn = M(() => {
  "use strict";
});
var cr = {};
pt(cr, { InferenceSession: () => gs, LoraAdapter: () => Es, TRACE: () => Bn, TRACE_EVENT_BEGIN: () => De, TRACE_EVENT_END: () => Pe, TRACE_FUNC_BEGIN: () => de, TRACE_FUNC_END: () => le, Tensor: () => pe, env: () => Y, registerBackend: () => et });
var Te = M(() => {
  "use strict";
  vn();
  Ln();
  Vn();
  Yn();
  fr();
  qn();
  Jn();
  ht();
  Zn();
  Xn();
});
var yt = M(() => {
  "use strict";
});
var to = {};
pt(to, { default: () => Ts });
var Qn;
var eo;
var Ts;
var ro = M(() => {
  "use strict";
  dr();
  Ue();
  gt();
  Qn = "ort-wasm-proxy-worker", eo = globalThis.self?.name === Qn;
  eo && (self.onmessage = (r) => {
    let { type: t, in: a } = r.data;
    try {
      switch (t) {
        case "init-wasm":
          Et(a.wasm).then(() => {
            Tt(a).then(() => {
              postMessage({ type: t });
            }, (u) => {
              postMessage({ type: t, err: u });
            });
          }, (u) => {
            postMessage({ type: t, err: u });
          });
          break;
        case "init-ep": {
          let { epName: u, env: o } = a;
          St(o, u).then(() => {
            postMessage({ type: t });
          }, (d) => {
            postMessage({ type: t, err: d });
          });
          break;
        }
        case "copy-from": {
          let { buffer: u } = a, o = rt(u);
          postMessage({ type: t, out: o });
          break;
        }
        case "create": {
          let { model: u, options: o } = a;
          vt(u, o).then((d) => {
            postMessage({ type: t, out: d });
          }, (d) => {
            postMessage({ type: t, err: d });
          });
          break;
        }
        case "release":
          At(a), postMessage({ type: t });
          break;
        case "run": {
          let { sessionId: u, inputIndices: o, inputs: d, outputIndices: w, options: c } = a;
          Ot(u, o, d, w, new Array(w.length).fill(null), c).then((l) => {
            l.some((m) => m[3] !== "cpu") ? postMessage({ type: t, err: "Proxy does not support non-cpu tensor location." }) : postMessage({ type: t, out: l }, Lt([...d, ...l]));
          }, (l) => {
            postMessage({ type: t, err: l });
          });
          break;
        }
        case "end-profiling":
          It(a), postMessage({ type: t });
          break;
        default:
      }
    } catch (u) {
      postMessage({ type: t, err: u });
    }
  });
  Ts = eo ? null : (r) => new Worker(r ?? se, { type: "module", name: Qn });
});
var oo = {};
pt(oo, { default: () => Ss });
async function no(r = {}) {
  var t = r, a = !!globalThis.window, u = !!globalThis.WorkerGlobalScope, o = u && self.name?.startsWith("em-pthread");
  t.mountExternalData = (e, n) => {
    e.startsWith("./") && (e = e.substring(2)), (t.$b || (t.$b = /* @__PURE__ */ new Map())).set(e, n);
  }, t.unmountExternalData = () => {
    delete t.$b, delete t.uc, delete t.tc, delete t.vc;
  }, globalThis.SharedArrayBuffer ?? new WebAssembly.Memory({ initial: 0, maximum: 0, shared: true }).buffer.constructor;
  var d, w, c = (e, n) => {
    throw n;
  }, l = import.meta.url, m = "";
  if (a || u) {
    try {
      m = new URL(".", l).href;
    } catch {
    }
    u && (w = (e) => {
      var n = new XMLHttpRequest();
      return n.open("GET", e, false), n.responseType = "arraybuffer", n.send(null), new Uint8Array(n.response);
    }), d = async (e) => {
      if (G(e)) return new Promise((i, s) => {
        var f = new XMLHttpRequest();
        f.open("GET", e, true), f.responseType = "arraybuffer", f.onload = () => {
          f.status == 200 || f.status == 0 && f.response ? i(f.response) : s(f.status);
        }, f.onerror = s, f.send(null);
      });
      var n = await fetch(e, { credentials: "same-origin" });
      if (n.ok) return n.arrayBuffer();
      throw Error(n.status + " : " + n.url);
    };
  }
  var h, g, y, T, S, U, $2 = console.log.bind(console), v = console.error.bind(console), O = $2, R = v, C = false, G = (e) => e.startsWith("file://");
  function b() {
    Oe.buffer != H.buffer && ne();
  }
  if (o) {
    let e = function(n) {
      try {
        var i = n.data, s = i.Yb;
        if (s === "load") {
          let f = [];
          self.onmessage = (p) => f.push(p), U = () => {
            postMessage({ Yb: "loaded" });
            for (let p of f) e(p);
            self.onmessage = e;
          };
          for (let p of i.ic) t[p] && !t[p].proxy || (t[p] = (...E) => {
            postMessage({ Yb: "callHandler", hc: p, args: E });
          }, p == "print" && (O = t[p]), p == "printErr" && (R = t[p]));
          Oe = i.nc, ne(), g = i.oc, q(), lt();
        } else if (s === "run") {
          (function(f) {
            var p = (b(), J)[f + 52 >>> 2 >>> 0];
            f = (b(), J)[f + 56 >>> 2 >>> 0], pn(p, p - f), _(p);
          })(i.Xb), Kt(i.Xb, 0, 0, 1, 0, 0), Tr(), Vt(i.Xb), Q ||= true;
          try {
            $o(i.lc, i.bc);
          } catch (f) {
            if (f != "unwind") throw f;
          }
        } else i.target !== "setimmediate" && (s === "checkMailbox" ? Q && ut() : s && (R(`worker: received unknown command ${s}`), R(i)));
      } catch (f) {
        throw un(), f;
      }
    };
    var $s = e, Q = false;
    self.onunhandledrejection = (n) => {
      throw n.reason || n;
    }, self.onmessage = e;
  }
  var H, ue, he, I, J, Re, z, j, Ne, L = false;
  function ne() {
    var e = Oe.buffer;
    t.HEAP8 = H = new Int8Array(e), he = new Int16Array(e), t.HEAPU8 = ue = new Uint8Array(e), new Uint16Array(e), t.HEAP32 = I = new Int32Array(e), t.HEAPU32 = J = new Uint32Array(e), Re = new Float32Array(e), z = new Float64Array(e), j = new BigInt64Array(e), new BigUint64Array(e);
  }
  function Je() {
    L = true, o ? U() : Ie.Wa();
  }
  function oe(e) {
    throw R(e = "Aborted(" + e + ")"), C = true, e = new WebAssembly.RuntimeError(e + ". Build with -sASSERTIONS for more info."), S?.(e), e;
  }
  function we() {
    return { a: { V: Ia, f: Ho, v: zo, e: jo, k: Vo, g: Yo, L: qo, b: Jo, G: Zo, ua: Br, j: Xo, N: Pr, La: xr, qa: Ur, sa: Cr, Ma: Mr, Ja: Rr, Ca: Nr, Ia: Fr, $: kr, ra: Wr, oa: Gr, Ka: $r, pa: Hr, Ra: Ko, Fa: Qo, ma: ta, va: ra, ja: na, X: oa, Ea: Vt, Oa: aa, za: sa, Aa: ia, Ba: ua, xa: Yr, ya: qr, ka: Jr, Ta: ca, Qa: pa, M: ma, Y: ha, Pa: da, F: wa, Na: ba, na: ya, u: fa, H: ga, T: ct, la: Ta, da: Ea, Va: Sa, Ga: Kr, Ha: Qr, ta: V, I: en, wa: tn, _: rn, Da: nn, Z: on, aa: cs, O: as, ba: fs, P: os, w: Ya, d: Da, m: Ba, n: La, q: Ga, ca: ts, E: es, o: Ca, Q: rs, C: ss, J: Qa, ea: Ka, W: xa, z: $a, ga: Ja, R: Xa, ha: qa, y: ja, D: ns, c: _a, r: Ua, i: Pa, Ua: ds, l: Ra, p: Na, s: Ma, t: Fa, x: Ha, S: Va, A: is, K: za, B: us, ia: Wa, U: ka, fa: Za, h: Aa, a: Oe, Sa: ye } };
  }
  async function q() {
    function e(s, f) {
      return Ie = s.exports, Ie = (function() {
        var p = Ie, E = (B) => () => B() >>> 0, A = (B) => (N) => B(N) >>> 0;
        return (p = Object.assign({}, p)).Bb = E(p.Bb), p.Db = A(p.Db), p.Rb = A(p.Rb), p.Sb = E(p.Sb), p.Wb = A(p.Wb), p;
      })(), Ze.push(Ie.Eb), s = Ie, t._OrtInit = s.Xa, t._OrtGetLastError = s.Ya, t._OrtCreateSessionOptions = s.Za, t._OrtAppendExecutionProvider = s._a, t._OrtGetEpDevices = s.$a, t._OrtEpDevice_EpName = s.ab, t._OrtAppendExecutionProviderV2 = s.bb, t._OrtAddFreeDimensionOverride = s.cb, t._OrtAddSessionConfigEntry = s.db, t._OrtReleaseSessionOptions = s.eb, t._OrtCreateSession = s.fb, t._OrtReleaseSession = s.gb, t._OrtGetInputOutputCount = s.hb, t._OrtGetInputOutputMetadata = s.ib, t._OrtFree = s.jb, t._OrtCreateTensor = s.kb, t._OrtGetTensorData = s.lb, t._OrtReleaseTensor = s.mb, t._OrtCreateLoraAdapter = s.nb, t._OrtReleaseLoraAdapter = s.ob, t._OrtCreateRunOptions = s.pb, t._OrtAddRunConfigEntry = s.qb, t._OrtRunOptionsAddActiveLoraAdapter = s.rb, t._OrtReleaseRunOptions = s.sb, t._OrtCreateBinding = s.tb, t._OrtBindInput = s.ub, t._OrtBindOutput = s.vb, t._OrtClearBoundOutputs = s.wb, t._OrtReleaseBinding = s.xb, t._OrtRunWithBinding = s.yb, t._OrtRun = s.zb, t._OrtEndProfiling = s.Ab, dt = s.Bb, an = t._free = s.Cb, sn = t._malloc = s.Db, Kt = s.Gb, un = s.Hb, fn = s.Ib, cn = s.Jb, Qt = s.Kb, dn = s.Lb, ln = s.Mb, P = s.Nb, Ke = s.Ob, pn = s.Pb, _ = s.Qb, er = s.Rb, D = s.Sb, mn = s.Tb, tr = s.Ub, hn = s.Vb, wn = s.Wb, bn = s.Fb, g = f, Ie;
    }
    var n, i = we();
    return t.instantiateWasm ? new Promise((s) => {
      t.instantiateWasm(i, (f, p) => {
        s(e(f, p));
      });
    }) : o ? e(new WebAssembly.Instance(g, we()), g) : (Ne ??= t.locateFile ? t.locateFile ? t.locateFile("ort-wasm-simd-threaded.wasm", m) : m + "ort-wasm-simd-threaded.wasm" : new URL("ort-wasm-simd-threaded.wasm", import.meta.url).href, n = await (async function(s) {
      var f = Ne;
      if (!h && !G(f)) try {
        var p = fetch(f, { credentials: "same-origin" });
        return await WebAssembly.instantiateStreaming(p, s);
      } catch (E) {
        R(`wasm streaming compile failed: ${E}`), R("falling back to ArrayBuffer instantiation");
      }
      return (async function(E, A) {
        try {
          var B = await (async function(N) {
            if (!h) try {
              var te = await d(N);
              return new Uint8Array(te);
            } catch {
            }
            if (N == Ne && h) N = new Uint8Array(h);
            else {
              if (!w) throw "both async and sync fetching of the wasm failed";
              N = w(N);
            }
            return N;
          })(E);
          return await WebAssembly.instantiate(B, A);
        } catch (N) {
          R(`failed to asynchronously prepare wasm: ${N}`), oe(N);
        }
      })(f, s);
    })(i), e(n.instance, n.module));
  }
  class X {
    name = "ExitStatus";
    constructor(n) {
      this.message = `Program terminated with exit(${n})`, this.status = n;
    }
  }
  var Gt = (e) => {
    e.terminate(), e.onmessage = () => {
    };
  }, Fe = [], be = 0, ve = null, at = (e) => {
    ee.length == 0 && (vr(), Sr(ee[0]));
    var n = ee.pop();
    if (!n) return 6;
    me.push(n), Ae[e.Xb] = n, n.Xb = e.Xb;
    var i = { Yb: "run", lc: e.kc, bc: e.bc, Xb: e.Xb };
    return n.postMessage(i, e.fc), 0;
  }, ae = 0, F = (e, n, ...i) => {
    var s, f = 16 * i.length, p = D(), E = er(f), A = E >>> 3;
    for (s of i) typeof s == "bigint" ? ((b(), j)[A++ >>> 0] = 1n, (b(), j)[A++ >>> 0] = s) : ((b(), j)[A++ >>> 0] = 0n, (b(), z)[A++ >>> 0] = s);
    return e = fn(e, 0, f, E, n), _(p), e;
  };
  function ye(e) {
    if (o) return F(0, 1, e);
    if (y = e, !(0 < ae)) {
      for (var n of me) Gt(n);
      for (n of ee) Gt(n);
      ee = [], me = [], Ae = {}, C = true;
    }
    c(0, new X(e));
  }
  function Z(e) {
    if (o) return F(1, 0, e);
    V(e);
  }
  var V = (e) => {
    if (y = e, o) throw Z(e), "unwind";
    ye(e);
  }, ee = [], me = [], Ze = [], Ae = {}, Er = (e) => {
    var n = e.Xb;
    delete Ae[n], ee.push(e), me.splice(me.indexOf(e), 1), e.Xb = 0, cn(n);
  };
  function Tr() {
    Ze.forEach((e) => e());
  }
  var Sr = (e) => new Promise((n) => {
    e.onmessage = (f) => {
      var p = f.data;
      if (f = p.Yb, p.ac && p.ac != dt()) {
        var E = Ae[p.ac];
        E ? E.postMessage(p, p.fc) : R(`Internal error! Worker sent a message "${f}" to target pthread ${p.ac}, but that thread no longer exists!`);
      } else f === "checkMailbox" ? ut() : f === "spawnThread" ? at(p) : f === "cleanupThread" ? jt(() => {
        Er(Ae[p.mc]);
      }) : f === "loaded" ? (e.loaded = true, n(e)) : p.target === "setimmediate" ? e.postMessage(p) : f === "uncaughtException" ? e.onerror(p.error) : f === "callHandler" ? t[p.hc](...p.args) : f && R(`worker sent an unknown command ${f}`);
    }, e.onerror = (f) => {
      throw R(`worker sent an error! ${f.filename}:${f.lineno}: ${f.message}`), f;
    };
    var i, s = [];
    for (i of []) t.propertyIsEnumerable(i) && s.push(i);
    e.postMessage({ Yb: "load", ic: s, nc: Oe, oc: g });
  });
  function vr() {
    var e = new Worker((() => {
      let n = URL;
      return import.meta.url > "file:" && import.meta.url < "file;" ? new n("ort.wasm.bundle.min.mjs", import.meta.url) : new URL(import.meta.url);
    })(), { type: "module", workerData: "em-pthread", name: "em-pthread" });
    ee.push(e);
  }
  var Oe, Ar = [], x = (e) => {
    var n = Ar[e];
    return n || (Ar[e] = n = bn.get(e)), n;
  }, $o = (e, n) => {
    ae = 0, e = x(e)(n), 0 < ae ? y = e : Qt(e);
  }, st = [], it = 0;
  function Ho(e) {
    var n = new $t(e >>>= 0);
    return (b(), H)[n.Zb + 12 >>> 0] == 0 && (Or(n, true), it--), Ir(n, false), st.push(n), wn(e);
  }
  var ke = 0, zo = () => {
    P(0, 0);
    var e = st.pop();
    mn(e.cc), ke = 0;
  };
  function Or(e, n) {
    n = n ? 1 : 0, (b(), H)[e.Zb + 12 >>> 0] = n;
  }
  function Ir(e, n) {
    n = n ? 1 : 0, (b(), H)[e.Zb + 13 >>> 0] = n;
  }
  class $t {
    constructor(n) {
      this.cc = n, this.Zb = n - 24;
    }
  }
  var Ht = (e) => {
    var n = ke;
    if (!n) return Ke(0), 0;
    var i = new $t(n);
    (b(), J)[i.Zb + 16 >>> 2 >>> 0] = n;
    var s = (b(), J)[i.Zb + 4 >>> 2 >>> 0];
    if (!s) return Ke(0), n;
    for (var f of e) {
      if (f === 0 || f === s) break;
      if (hn(f, s, i.Zb + 16)) return Ke(f), n;
    }
    return Ke(s), n;
  };
  function jo() {
    return Ht([]);
  }
  function Vo(e) {
    return Ht([e >>> 0]);
  }
  function Yo(e, n, i, s) {
    return Ht([e >>> 0, n >>> 0, i >>> 0, s >>> 0]);
  }
  var qo = () => {
    var e = st.pop();
    e || oe("no exception to throw");
    var n = e.cc;
    throw (b(), H)[e.Zb + 13 >>> 0] == 0 && (st.push(e), Ir(e, true), Or(e, false), it++), tr(n), ke = n;
  };
  function Jo(e, n, i) {
    var s = new $t(e >>>= 0);
    throw n >>>= 0, i >>>= 0, (b(), J)[s.Zb + 16 >>> 2 >>> 0] = 0, (b(), J)[s.Zb + 4 >>> 2 >>> 0] = n, (b(), J)[s.Zb + 8 >>> 2 >>> 0] = i, tr(e), it++, ke = e;
  }
  var Zo = () => it;
  function Lr(e, n, i, s) {
    return o ? F(2, 1, e, n, i, s) : Br(e, n, i, s);
  }
  function Br(e, n, i, s) {
    if (e >>>= 0, n >>>= 0, i >>>= 0, s >>>= 0, !globalThis.SharedArrayBuffer) return 6;
    var f = [];
    return o && f.length === 0 ? Lr(e, n, i, s) : (e = { kc: i, Xb: e, bc: s, fc: f }, o ? (e.Yb = "spawnThread", postMessage(e, f), 0) : at(e));
  }
  function Xo(e) {
    throw ke ||= e >>> 0, ke;
  }
  var _r = globalThis.TextDecoder && new TextDecoder(), Dr = (e, n = 0, i, s) => {
    var f = n >>>= 0;
    if (i = f + i, s) s = i;
    else {
      for (; e[f] && !(f >= i); ) ++f;
      s = f;
    }
    if (16 < s - n && e.buffer && _r) return _r.decode(e.buffer instanceof ArrayBuffer ? e.subarray(n, s) : e.slice(n, s));
    for (f = ""; n < s; ) if (128 & (i = e[n++])) {
      var p = 63 & e[n++];
      if ((224 & i) == 192) f += String.fromCharCode((31 & i) << 6 | p);
      else {
        var E = 63 & e[n++];
        65536 > (i = (240 & i) == 224 ? (15 & i) << 12 | p << 6 | E : (7 & i) << 18 | p << 12 | E << 6 | 63 & e[n++]) ? f += String.fromCharCode(i) : (i -= 65536, f += String.fromCharCode(55296 | i >> 10, 56320 | 1023 & i));
      }
    } else f += String.fromCharCode(i);
    return f;
  }, zt = (e, n, i) => (e >>>= 0) ? Dr((b(), ue), e, n, i) : "";
  function Pr(e, n, i) {
    return o ? F(3, 1, e, n, i) : 0;
  }
  function xr(e, n) {
    if (o) return F(4, 1, e, n);
  }
  function Ur(e, n) {
    if (o) return F(5, 1, e, n);
  }
  function Cr(e, n, i) {
    if (o) return F(6, 1, e, n, i);
  }
  function Mr(e, n, i) {
    return o ? F(7, 1, e, n, i) : 0;
  }
  function Rr(e, n) {
    if (o) return F(8, 1, e, n);
  }
  function Nr(e, n, i) {
    if (o) return F(9, 1, e, n, i);
  }
  function Fr(e, n, i, s) {
    if (o) return F(10, 1, e, n, i, s);
  }
  function kr(e, n, i, s) {
    if (o) return F(11, 1, e, n, i, s);
  }
  function Wr(e, n, i, s) {
    if (o) return F(12, 1, e, n, i, s);
  }
  function Gr(e) {
    if (o) return F(13, 1, e);
  }
  function $r(e, n) {
    if (o) return F(14, 1, e, n);
  }
  function Hr(e, n, i) {
    if (o) return F(15, 1, e, n, i);
  }
  var Ko = () => oe("");
  function Qo(e) {
    Kt(e >>> 0, !u, 1, !a, 131072, false), Tr();
  }
  var jt = (e) => {
    if (!C) try {
      if (e(), !(0 < ae)) try {
        o ? dt() && Qt(y) : V(y);
      } catch (n) {
        n instanceof X || n == "unwind" || c(0, n);
      }
    } catch (n) {
      n instanceof X || n == "unwind" || c(0, n);
    }
  }, ea = !Atomics.waitAsync || globalThis.navigator?.userAgent && 91 > Number((navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./) || [])[2]);
  function Vt(e) {
    e >>>= 0, ea || (Atomics.waitAsync((b(), I), e >>> 2, e).value.then(ut), e += 128, Atomics.store((b(), I), e >>> 2, 1));
  }
  var ut = () => jt(() => {
    var e = dt();
    e && (Vt(e), ln());
  });
  function ta(e, n) {
    (e >>>= 0) == n >>> 0 ? setTimeout(ut) : o ? postMessage({ ac: e, Yb: "checkMailbox" }) : (e = Ae[e]) && e.postMessage({ Yb: "checkMailbox" });
  }
  var Yt = [];
  function ra(e, n, i, s, f) {
    for (n >>>= 0, f >>>= 0, Yt.length = 0, i = f >>> 3, s = f + s >>> 3; i < s; ) {
      var p;
      p = (b(), j)[i++ >>> 0] ? (b(), j)[i++ >>> 0] : (b(), z)[i++ >>> 0], Yt.push(p);
    }
    return (n ? yn[n] : Oa[e])(...Yt);
  }
  var na = () => {
    ae = 0;
  };
  function oa(e) {
    e >>>= 0, o ? postMessage({ Yb: "cleanupThread", mc: e }) : Er(Ae[e]);
  }
  function aa(e) {
  }
  function sa(e, n) {
    e = -9007199254740992 > e || 9007199254740992 < e ? NaN : Number(e), n >>>= 0, e = new Date(1e3 * e), (b(), I)[n >>> 2 >>> 0] = e.getUTCSeconds(), (b(), I)[n + 4 >>> 2 >>> 0] = e.getUTCMinutes(), (b(), I)[n + 8 >>> 2 >>> 0] = e.getUTCHours(), (b(), I)[n + 12 >>> 2 >>> 0] = e.getUTCDate(), (b(), I)[n + 16 >>> 2 >>> 0] = e.getUTCMonth(), (b(), I)[n + 20 >>> 2 >>> 0] = e.getUTCFullYear() - 1900, (b(), I)[n + 24 >>> 2 >>> 0] = e.getUTCDay(), e = (e.getTime() - Date.UTC(e.getUTCFullYear(), 0, 1, 0, 0, 0, 0)) / 864e5 | 0, (b(), I)[n + 28 >>> 2 >>> 0] = e;
  }
  var zr = (e) => e % 4 == 0 && (e % 100 != 0 || e % 400 == 0), jr = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335], Vr = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  function ia(e, n) {
    e = -9007199254740992 > e || 9007199254740992 < e ? NaN : Number(e), n >>>= 0, e = new Date(1e3 * e), (b(), I)[n >>> 2 >>> 0] = e.getSeconds(), (b(), I)[n + 4 >>> 2 >>> 0] = e.getMinutes(), (b(), I)[n + 8 >>> 2 >>> 0] = e.getHours(), (b(), I)[n + 12 >>> 2 >>> 0] = e.getDate(), (b(), I)[n + 16 >>> 2 >>> 0] = e.getMonth(), (b(), I)[n + 20 >>> 2 >>> 0] = e.getFullYear() - 1900, (b(), I)[n + 24 >>> 2 >>> 0] = e.getDay();
    var i = (zr(e.getFullYear()) ? jr : Vr)[e.getMonth()] + e.getDate() - 1 | 0;
    (b(), I)[n + 28 >>> 2 >>> 0] = i, (b(), I)[n + 36 >>> 2 >>> 0] = -60 * e.getTimezoneOffset(), i = new Date(e.getFullYear(), 6, 1).getTimezoneOffset();
    var s = new Date(e.getFullYear(), 0, 1).getTimezoneOffset();
    e = 0 | (i != s && e.getTimezoneOffset() == Math.min(s, i)), (b(), I)[n + 32 >>> 2 >>> 0] = e;
  }
  function ua(e) {
    e >>>= 0;
    var n = new Date((b(), I)[e + 20 >>> 2 >>> 0] + 1900, (b(), I)[e + 16 >>> 2 >>> 0], (b(), I)[e + 12 >>> 2 >>> 0], (b(), I)[e + 8 >>> 2 >>> 0], (b(), I)[e + 4 >>> 2 >>> 0], (b(), I)[e >>> 2 >>> 0], 0), i = (b(), I)[e + 32 >>> 2 >>> 0], s = n.getTimezoneOffset(), f = new Date(n.getFullYear(), 6, 1).getTimezoneOffset(), p = new Date(n.getFullYear(), 0, 1).getTimezoneOffset(), E = Math.min(p, f);
    return 0 > i ? (b(), I)[e + 32 >>> 2 >>> 0] = +(f != p && E == s) : 0 < i != (E == s) && (f = Math.max(p, f), n.setTime(n.getTime() + 6e4 * ((0 < i ? E : f) - s))), (b(), I)[e + 24 >>> 2 >>> 0] = n.getDay(), i = (zr(n.getFullYear()) ? jr : Vr)[n.getMonth()] + n.getDate() - 1 | 0, (b(), I)[e + 28 >>> 2 >>> 0] = i, (b(), I)[e >>> 2 >>> 0] = n.getSeconds(), (b(), I)[e + 4 >>> 2 >>> 0] = n.getMinutes(), (b(), I)[e + 8 >>> 2 >>> 0] = n.getHours(), (b(), I)[e + 12 >>> 2 >>> 0] = n.getDate(), (b(), I)[e + 16 >>> 2 >>> 0] = n.getMonth(), (b(), I)[e + 20 >>> 2 >>> 0] = n.getYear(), e = n.getTime(), BigInt(isNaN(e) ? -1 : e / 1e3);
  }
  function Yr(e, n, i, s, f, p, E) {
    return o ? F(16, 1, e, n, i, s, f, p, E) : -52;
  }
  function qr(e, n, i, s, f, p) {
    if (o) return F(17, 1, e, n, i, s, f, p);
  }
  var Xe = {}, fa = () => performance.timeOrigin + performance.now();
  function Jr(e, n) {
    if (o) return F(18, 1, e, n);
    if (Xe[e] && (clearTimeout(Xe[e].id), delete Xe[e]), !n) return 0;
    var i = setTimeout(() => {
      delete Xe[e], jt(() => dn(e, performance.timeOrigin + performance.now()));
    }, n);
    return Xe[e] = { id: i, wc: n }, 0;
  }
  var Be = (e, n, i) => {
    var s = (b(), ue);
    if (n >>>= 0, 0 < i) {
      var f = n;
      i = n + i - 1;
      for (var p = 0; p < e.length; ++p) {
        var E = e.codePointAt(p);
        if (127 >= E) {
          if (n >= i) break;
          s[n++ >>> 0] = E;
        } else if (2047 >= E) {
          if (n + 1 >= i) break;
          s[n++ >>> 0] = 192 | E >> 6, s[n++ >>> 0] = 128 | 63 & E;
        } else if (65535 >= E) {
          if (n + 2 >= i) break;
          s[n++ >>> 0] = 224 | E >> 12, s[n++ >>> 0] = 128 | E >> 6 & 63, s[n++ >>> 0] = 128 | 63 & E;
        } else {
          if (n + 3 >= i) break;
          s[n++ >>> 0] = 240 | E >> 18, s[n++ >>> 0] = 128 | E >> 12 & 63, s[n++ >>> 0] = 128 | E >> 6 & 63, s[n++ >>> 0] = 128 | 63 & E, p++;
        }
      }
      s[n >>> 0] = 0, e = n - f;
    } else e = 0;
    return e;
  };
  function ca(e, n, i, s) {
    e >>>= 0, n >>>= 0, i >>>= 0, s >>>= 0;
    var f = (/* @__PURE__ */ new Date()).getFullYear(), p = new Date(f, 0, 1).getTimezoneOffset();
    f = new Date(f, 6, 1).getTimezoneOffset();
    var E = Math.max(p, f);
    (b(), J)[e >>> 2 >>> 0] = 60 * E, (b(), I)[n >>> 2 >>> 0] = +(p != f), e = (n = (A) => {
      var B = Math.abs(A);
      return `UTC${0 <= A ? "-" : "+"}${String(Math.floor(B / 60)).padStart(2, "0")}${String(B % 60).padStart(2, "0")}`;
    })(p), n = n(f), f < p ? (Be(e, i, 17), Be(n, s, 17)) : (Be(e, s, 17), Be(n, i, 17));
  }
  var da = () => Date.now(), la = 1;
  function pa(e, n, i) {
    if (i >>>= 0, !(0 <= e && 3 >= e)) return 28;
    if (e === 0) e = Date.now();
    else {
      if (!la) return 52;
      e = performance.timeOrigin + performance.now();
    }
    return e = Math.round(1e6 * e), (b(), j)[i >>> 3 >>> 0] = BigInt(e), 0;
  }
  var qt = [];
  function ma(e, n, i) {
    e >>>= 0, n >>>= 0, i >>>= 0, qt.length = 0;
    for (var s; s = (b(), ue)[n++ >>> 0]; ) {
      var f = s != 105;
      i += (f &= s != 112) && i % 8 ? 4 : 0, qt.push(s == 112 ? (b(), J)[i >>> 2 >>> 0] : s == 106 ? (b(), j)[i >>> 3 >>> 0] : s == 105 ? (b(), I)[i >>> 2 >>> 0] : (b(), z)[i >>> 3 >>> 0]), i += f ? 8 : 4;
    }
    return yn[e](...qt);
  }
  var ha = () => {
  };
  function wa(e, n) {
    return R(zt(e >>> 0, n >>> 0));
  }
  var ba = () => {
    throw ae += 1, "unwind";
  };
  function ya() {
    return 4294901760;
  }
  var ga = () => navigator.hardwareConcurrency, _e = {}, Jt = (e) => {
    for (var n = 0, i = 0; i < e.length; ++i) {
      var s = e.charCodeAt(i);
      127 >= s ? n++ : 2047 >= s ? n += 2 : 55296 <= s && 57343 >= s ? (n += 4, ++i) : n += 3;
    }
    return n;
  }, ft = (e) => {
    var n;
    return (n = /\bwasm-function\[\d+\]:(0x[0-9a-f]+)/.exec(e)) ? +n[1] : (n = /:(\d+):\d+(?:\)|$)/.exec(e)) ? 2147483648 | +n[1] : 0;
  }, Zr = (e) => {
    for (var n of e) (e = ft(n)) && (_e[e] = n);
  };
  function Ea() {
    var e = Error().stack.toString().split(`
`);
    return e[0] == "Error" && e.shift(), Zr(e), _e.dc = ft(e[3]), _e.jc = e, _e.dc;
  }
  function ct(e) {
    if (!(e = _e[e >>> 0])) return 0;
    var n;
    if (n = /^\s+at .*\.wasm\.(.*) \(.*\)$/.exec(e)) e = n[1];
    else if (n = /^\s+at (.*) \(.*\)$/.exec(e)) e = n[1];
    else {
      if (!(n = /^(.+?)@/.exec(e))) return 0;
      e = n[1];
    }
    an(ct.ec ?? 0), n = Jt(e) + 1;
    var i = sn(n);
    return i && Be(e, i, n), ct.ec = i, ct.ec;
  }
  function Ta(e) {
    e >>>= 0;
    var n = (b(), ue).length;
    if (e <= n || 4294901760 < e) return false;
    for (var i = 1; 4 >= i; i *= 2) {
      var s = n * (1 + 0.2 / i);
      s = Math.min(s, e + 100663296);
      e: {
        s = (Math.min(4294901760, 65536 * Math.ceil(Math.max(e, s) / 65536)) - Oe.buffer.byteLength + 65535) / 65536 | 0;
        try {
          Oe.grow(s), ne();
          var f = 1;
          break e;
        } catch {
        }
        f = void 0;
      }
      if (f) return true;
    }
    return false;
  }
  function Sa(e, n, i) {
    if (e >>>= 0, n >>>= 0, _e.dc == e) var s = _e.jc;
    else (s = Error().stack.toString().split(`
`))[0] == "Error" && s.shift(), Zr(s);
    for (var f = 3; s[f] && ft(s[f]) != e; ) ++f;
    for (e = 0; e < i && s[e + f]; ++e) (b(), I)[n + 4 * e >>> 2 >>> 0] = ft(s[e + f]);
    return e;
  }
  var Zt, Xt = {}, Xr = () => {
    if (!Zt) {
      var e, n = { USER: "web_user", LOGNAME: "web_user", PATH: "/", PWD: "/", HOME: "/home/web_user", LANG: (globalThis.navigator?.language ?? "C").replace("-", "_") + ".UTF-8", _: "./this.program" };
      for (e in Xt) Xt[e] === void 0 ? delete n[e] : n[e] = Xt[e];
      var i = [];
      for (e in n) i.push(`${e}=${n[e]}`);
      Zt = i;
    }
    return Zt;
  };
  function Kr(e, n) {
    if (o) return F(19, 1, e, n);
    e >>>= 0, n >>>= 0;
    var i, s = 0, f = 0;
    for (i of Xr()) {
      var p = n + s;
      (b(), J)[e + f >>> 2 >>> 0] = p, s += Be(i, p, 1 / 0) + 1, f += 4;
    }
    return 0;
  }
  function Qr(e, n) {
    if (o) return F(20, 1, e, n);
    e >>>= 0, n >>>= 0;
    var i = Xr();
    for (var s of ((b(), J)[e >>> 2 >>> 0] = i.length, e = 0, i)) e += Jt(s) + 1;
    return (b(), J)[n >>> 2 >>> 0] = e, 0;
  }
  function en(e) {
    return o ? F(21, 1, e) : 52;
  }
  function tn(e, n, i, s, f) {
    return o ? F(22, 1, e, n, i, s, f) : 52;
  }
  function rn(e, n, i, s) {
    return o ? F(23, 1, e, n, i, s) : 52;
  }
  function nn(e, n, i, s) {
    return o ? F(24, 1, e, n, i, s) : 70;
  }
  var va = [null, [], []];
  function on(e, n, i, s) {
    if (o) return F(25, 1, e, n, i, s);
    n >>>= 0, i >>>= 0, s >>>= 0;
    for (var f = 0, p = 0; p < i; p++) {
      var E = (b(), J)[n >>> 2 >>> 0], A = (b(), J)[n + 4 >>> 2 >>> 0];
      n += 8;
      for (var B = 0; B < A; B++) {
        var N = e, te = (b(), ue)[E + B >>> 0], ce = va[N];
        te === 0 || te === 10 ? ((N === 1 ? O : R)(Dr(ce)), ce.length = 0) : ce.push(te);
      }
      f += A;
    }
    return (b(), J)[s >>> 2 >>> 0] = f, 0;
  }
  function Aa(e) {
    return e >>> 0;
  }
  o || (function() {
    for (var e = t.numThreads - 1; e--; ) vr();
    Fe.push(async () => {
      var n = (async function() {
        if (!o) return Promise.all(ee.map(Sr));
      })();
      be++, await n, --be == 0 && ve && (n = ve, ve = null, n());
    });
  })(), o || (Oe = new WebAssembly.Memory({ initial: 256, maximum: 65536, shared: true }), ne()), t.wasmBinary && (h = t.wasmBinary), t.stackSave = () => D(), t.stackRestore = (e) => _(e), t.stackAlloc = (e) => er(e), t.setValue = function(e, n, i = "i8") {
    switch (i.endsWith("*") && (i = "*"), i) {
      case "i1":
      case "i8":
        (b(), H)[e >>> 0] = n;
        break;
      case "i16":
        (b(), he)[e >>> 1 >>> 0] = n;
        break;
      case "i32":
        (b(), I)[e >>> 2 >>> 0] = n;
        break;
      case "i64":
        (b(), j)[e >>> 3 >>> 0] = BigInt(n);
        break;
      case "float":
        (b(), Re)[e >>> 2 >>> 0] = n;
        break;
      case "double":
        (b(), z)[e >>> 3 >>> 0] = n;
        break;
      case "*":
        (b(), J)[e >>> 2 >>> 0] = n;
        break;
      default:
        oe(`invalid type for setValue: ${i}`);
    }
  }, t.getValue = function(e, n = "i8") {
    switch (n.endsWith("*") && (n = "*"), n) {
      case "i1":
      case "i8":
        return (b(), H)[e >>> 0];
      case "i16":
        return (b(), he)[e >>> 1 >>> 0];
      case "i32":
        return (b(), I)[e >>> 2 >>> 0];
      case "i64":
        return (b(), j)[e >>> 3 >>> 0];
      case "float":
        return (b(), Re)[e >>> 2 >>> 0];
      case "double":
        return (b(), z)[e >>> 3 >>> 0];
      case "*":
        return (b(), J)[e >>> 2 >>> 0];
      default:
        oe(`invalid type for getValue: ${n}`);
    }
  }, t.UTF8ToString = zt, t.stringToUTF8 = Be, t.lengthBytesUTF8 = Jt;
  var dt, an, sn, Kt, un, fn, cn, Qt, dn, ln, P, Ke, pn, _, er, D, mn, tr, hn, wn, bn, Ie, Oa = [ye, Z, Lr, Pr, xr, Ur, Cr, Mr, Rr, Nr, Fr, kr, Wr, Gr, $r, Hr, Yr, qr, Jr, Kr, Qr, en, tn, rn, nn, on], yn = { 1078380: (e, n, i, s, f) => {
    if (t === void 0 || !t.$b) return 1;
    if ((e = zt(Number(e >>> 0))).startsWith("./") && (e = e.substring(2)), !(e = t.$b.get(e))) return 2;
    if (n = Number(n >>> 0), i = Number(i >>> 0), s = Number(s >>> 0), n + i > e.byteLength) return 3;
    try {
      let p = e.subarray(n, n + i);
      switch (f) {
        case 0:
          (b(), ue).set(p, s >>> 0);
          break;
        case 1:
          t.pc ? t.pc(s, p) : t.sc(s, p);
          break;
        default:
          return 4;
      }
      return 0;
    } catch {
      return 4;
    }
  }, 1079204: () => typeof navigator < "u" && navigator.qc ? 1 : 0, 1079276: () => typeof wasmOffsetConverter < "u" };
  function Ia() {
    return typeof wasmOffsetConverter < "u";
  }
  function La(e, n, i, s) {
    var f = D();
    try {
      return x(e)(n, i, s);
    } catch (p) {
      if (_(f), p !== p + 0) throw p;
      P(1, 0);
    }
  }
  function Ba(e, n, i) {
    var s = D();
    try {
      return x(e)(n, i);
    } catch (f) {
      if (_(s), f !== f + 0) throw f;
      P(1, 0);
    }
  }
  function _a(e) {
    var n = D();
    try {
      x(e)();
    } catch (i) {
      if (_(n), i !== i + 0) throw i;
      P(1, 0);
    }
  }
  function Da(e, n) {
    var i = D();
    try {
      return x(e)(n);
    } catch (s) {
      if (_(i), s !== s + 0) throw s;
      P(1, 0);
    }
  }
  function Pa(e, n, i) {
    var s = D();
    try {
      x(e)(n, i);
    } catch (f) {
      if (_(s), f !== f + 0) throw f;
      P(1, 0);
    }
  }
  function xa(e, n, i, s) {
    var f = D();
    try {
      return x(e)(n, i, s);
    } catch (p) {
      if (_(f), p !== p + 0) throw p;
      P(1, 0);
    }
  }
  function Ua(e, n) {
    var i = D();
    try {
      x(e)(n);
    } catch (s) {
      if (_(i), s !== s + 0) throw s;
      P(1, 0);
    }
  }
  function Ca(e, n, i, s, f, p, E) {
    var A = D();
    try {
      return x(e)(n, i, s, f, p, E);
    } catch (B) {
      if (_(A), B !== B + 0) throw B;
      P(1, 0);
    }
  }
  function Ma(e, n, i, s, f, p) {
    var E = D();
    try {
      x(e)(n, i, s, f, p);
    } catch (A) {
      if (_(E), A !== A + 0) throw A;
      P(1, 0);
    }
  }
  function Ra(e, n, i, s) {
    var f = D();
    try {
      x(e)(n, i, s);
    } catch (p) {
      if (_(f), p !== p + 0) throw p;
      P(1, 0);
    }
  }
  function Na(e, n, i, s, f) {
    var p = D();
    try {
      x(e)(n, i, s, f);
    } catch (E) {
      if (_(p), E !== E + 0) throw E;
      P(1, 0);
    }
  }
  function Fa(e, n, i, s, f, p, E) {
    var A = D();
    try {
      x(e)(n, i, s, f, p, E);
    } catch (B) {
      if (_(A), B !== B + 0) throw B;
      P(1, 0);
    }
  }
  function ka(e, n, i, s, f, p, E) {
    var A = D();
    try {
      x(e)(n, i, s, f, p, E);
    } catch (B) {
      if (_(A), B !== B + 0) throw B;
      P(1, 0);
    }
  }
  function Wa(e, n, i, s, f, p, E, A) {
    var B = D();
    try {
      x(e)(n, i, s, f, p, E, A);
    } catch (N) {
      if (_(B), N !== N + 0) throw N;
      P(1, 0);
    }
  }
  function Ga(e, n, i, s, f) {
    var p = D();
    try {
      return x(e)(n, i, s, f);
    } catch (E) {
      if (_(p), E !== E + 0) throw E;
      P(1, 0);
    }
  }
  function $a(e, n, i) {
    var s = D();
    try {
      return x(e)(n, i);
    } catch (f) {
      if (_(s), f !== f + 0) throw f;
      P(1, 0);
    }
  }
  function Ha(e, n, i, s, f, p, E, A) {
    var B = D();
    try {
      x(e)(n, i, s, f, p, E, A);
    } catch (N) {
      if (_(B), N !== N + 0) throw N;
      P(1, 0);
    }
  }
  function za(e, n, i, s, f, p, E, A, B, N, te, ce) {
    var ge = D();
    try {
      x(e)(n, i, s, f, p, E, A, B, N, te, ce);
    } catch (Ee) {
      if (_(ge), Ee !== Ee + 0) throw Ee;
      P(1, 0);
    }
  }
  function ja(e, n, i) {
    var s = D();
    try {
      return x(e)(n, i);
    } catch (f) {
      if (_(s), f !== f + 0) throw f;
      return P(1, 0), 0n;
    }
  }
  function Va(e, n, i, s, f, p, E, A, B) {
    var N = D();
    try {
      x(e)(n, i, s, f, p, E, A, B);
    } catch (te) {
      if (_(N), te !== te + 0) throw te;
      P(1, 0);
    }
  }
  function Ya(e) {
    var n = D();
    try {
      return x(e)();
    } catch (i) {
      if (_(n), i !== i + 0) throw i;
      P(1, 0);
    }
  }
  function qa(e, n) {
    var i = D();
    try {
      return x(e)(n);
    } catch (s) {
      if (_(i), s !== s + 0) throw s;
      return P(1, 0), 0n;
    }
  }
  function Ja(e, n, i, s) {
    var f = D();
    try {
      return x(e)(n, i, s);
    } catch (p) {
      if (_(f), p !== p + 0) throw p;
      P(1, 0);
    }
  }
  function Za(e, n, i, s, f, p, E) {
    var A = D();
    try {
      x(e)(n, i, s, f, p, E);
    } catch (B) {
      if (_(A), B !== B + 0) throw B;
      P(1, 0);
    }
  }
  function Xa(e) {
    var n = D();
    try {
      return x(e)();
    } catch (i) {
      if (_(n), i !== i + 0) throw i;
      return P(1, 0), 0n;
    }
  }
  function Ka(e, n, i, s, f) {
    var p = D();
    try {
      return x(e)(n, i, s, f);
    } catch (E) {
      if (_(p), E !== E + 0) throw E;
      P(1, 0);
    }
  }
  function Qa(e, n, i, s, f, p) {
    var E = D();
    try {
      return x(e)(n, i, s, f, p);
    } catch (A) {
      if (_(E), A !== A + 0) throw A;
      P(1, 0);
    }
  }
  function es(e, n, i, s, f, p) {
    var E = D();
    try {
      return x(e)(n, i, s, f, p);
    } catch (A) {
      if (_(E), A !== A + 0) throw A;
      P(1, 0);
    }
  }
  function ts(e, n, i, s, f, p) {
    var E = D();
    try {
      return x(e)(n, i, s, f, p);
    } catch (A) {
      if (_(E), A !== A + 0) throw A;
      P(1, 0);
    }
  }
  function rs(e, n, i, s, f, p, E, A) {
    var B = D();
    try {
      return x(e)(n, i, s, f, p, E, A);
    } catch (N) {
      if (_(B), N !== N + 0) throw N;
      P(1, 0);
    }
  }
  function ns(e, n, i, s, f) {
    var p = D();
    try {
      return x(e)(n, i, s, f);
    } catch (E) {
      if (_(p), E !== E + 0) throw E;
      return P(1, 0), 0n;
    }
  }
  function os(e, n, i, s) {
    var f = D();
    try {
      return x(e)(n, i, s);
    } catch (p) {
      if (_(f), p !== p + 0) throw p;
      P(1, 0);
    }
  }
  function as(e, n, i, s) {
    var f = D();
    try {
      return x(e)(n, i, s);
    } catch (p) {
      if (_(f), p !== p + 0) throw p;
      P(1, 0);
    }
  }
  function ss(e, n, i, s, f, p, E, A, B, N, te, ce) {
    var ge = D();
    try {
      return x(e)(n, i, s, f, p, E, A, B, N, te, ce);
    } catch (Ee) {
      if (_(ge), Ee !== Ee + 0) throw Ee;
      P(1, 0);
    }
  }
  function is(e, n, i, s, f, p, E, A, B, N, te) {
    var ce = D();
    try {
      x(e)(n, i, s, f, p, E, A, B, N, te);
    } catch (ge) {
      if (_(ce), ge !== ge + 0) throw ge;
      P(1, 0);
    }
  }
  function us(e, n, i, s, f, p, E, A, B, N, te, ce, ge, Ee, ls, ps) {
    var ms = D();
    try {
      x(e)(n, i, s, f, p, E, A, B, N, te, ce, ge, Ee, ls, ps);
    } catch (rr) {
      if (_(ms), rr !== rr + 0) throw rr;
      P(1, 0);
    }
  }
  function fs(e, n, i) {
    var s = D();
    try {
      return x(e)(n, i);
    } catch (f) {
      if (_(s), f !== f + 0) throw f;
      P(1, 0);
    }
  }
  function cs(e, n, i) {
    var s = D();
    try {
      return x(e)(n, i);
    } catch (f) {
      if (_(s), f !== f + 0) throw f;
      P(1, 0);
    }
  }
  function ds(e, n, i, s) {
    var f = D();
    try {
      x(e)(n, i, s);
    } catch (p) {
      if (_(f), p !== p + 0) throw p;
      P(1, 0);
    }
  }
  function lt() {
    if (0 < be) ve = lt;
    else if (o) T?.(t), Je();
    else {
      for (var e = Fe; 0 < e.length; ) e.shift()(t);
      0 < be ? ve = lt : (t.calledRun = true, C || (Je(), T?.(t)));
    }
  }
  return o || (Ie = await q(), lt()), t.PTR_SIZE = 4, L ? t : new Promise((e, n) => {
    T = e, S = n;
  });
}
var Ss;
var vs;
var ao = M(() => {
  "use strict";
  Ss = no, vs = globalThis.self?.name?.startsWith("em-pthread");
  vs && no();
});
var uo;
var pr;
var As;
var se;
var fo;
var lr;
var Os;
var Is;
var co;
var Ls;
var so;
var lo;
var io;
var po;
var gt = M(() => {
  "use strict";
  yt();
  uo = typeof location > "u" ? void 0 : location.origin, pr = import.meta.url > "file:" && import.meta.url < "file;", As = () => {
    if (true) {
      if (pr) {
        let r = URL;
        return new URL(new r("ort.wasm.bundle.min.mjs", import.meta.url).href, uo).href;
      }
      return import.meta.url;
    }
  }, se = As(), fo = () => {
    if (se && !se.startsWith("blob:")) return se.substring(0, se.lastIndexOf("/") + 1);
  }, lr = (r, t) => {
    try {
      let a = t ?? se;
      return (a ? new URL(r, a) : new URL(r)).origin === uo;
    } catch {
      return false;
    }
  }, Os = (r, t) => {
    let a = t ?? se;
    try {
      return (a ? new URL(r, a) : new URL(r)).href;
    } catch {
      return;
    }
  }, Is = (r, t) => `${t ?? "./"}${r}`, co = async (r) => {
    let a = await (await fetch(r, { credentials: "same-origin" })).blob();
    return URL.createObjectURL(a);
  }, Ls = async (r) => (await import(
    /*webpackIgnore:true*/
    /*@vite-ignore*/
    r
  )).default, so = (ro(), ar(to)).default, lo = async () => {
    if (!se) throw new Error("Failed to load proxy worker: cannot determine the script source URL.");
    if (lr(se)) return [void 0, so()];
    let r = await co(se);
    return [r, so(r)];
  }, io = (ao(), ar(oo)).default, po = async (r, t, a, u) => {
    let o = io && !(r || t);
    if (o) if (se) o = lr(se) || u && !a;
    else if (u && !a) o = true;
    else throw new Error("cannot determine the script source URL.");
    if (o) return [void 0, io];
    {
      let d = "ort-wasm-simd-threaded.mjs", w = r ?? Os(d, t), c = a && w && !lr(w, t), l = c ? await co(w) : w ?? Is(d, t);
      return [c ? l : void 0, await Ls(l)];
    }
  };
});
var mr;
var hr;
var Bt;
var mo;
var Bs;
var _s;
var Ds;
var Et;
var k;
var Ue = M(() => {
  "use strict";
  gt();
  hr = false, Bt = false, mo = false, Bs = () => {
    if (typeof SharedArrayBuffer > "u") return false;
    try {
      return typeof MessageChannel < "u" && new MessageChannel().port1.postMessage(new SharedArrayBuffer(1)), WebAssembly.validate(new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 1, 4, 1, 96, 0, 0, 3, 2, 1, 0, 5, 4, 1, 3, 1, 1, 10, 11, 1, 9, 0, 65, 0, 254, 16, 2, 0, 26, 11]));
    } catch {
      return false;
    }
  }, _s = () => {
    try {
      return WebAssembly.validate(new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 1, 4, 1, 96, 0, 0, 3, 2, 1, 0, 10, 30, 1, 28, 0, 65, 0, 253, 15, 253, 12, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 253, 186, 1, 26, 11]));
    } catch {
      return false;
    }
  }, Ds = () => {
    try {
      return WebAssembly.validate(new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 1, 5, 1, 96, 0, 1, 123, 3, 2, 1, 0, 10, 19, 1, 17, 0, 65, 1, 253, 15, 65, 2, 253, 15, 65, 3, 253, 15, 253, 147, 2, 11]));
    } catch {
      return false;
    }
  }, Et = async (r) => {
    if (hr) return Promise.resolve();
    if (Bt) throw new Error("multiple calls to 'initializeWebAssembly()' detected.");
    if (mo) throw new Error("previous call to 'initializeWebAssembly()' failed.");
    Bt = true;
    let t = r.initTimeout, a = r.numThreads;
    if (r.simd !== false) {
      if (r.simd === "relaxed") {
        if (!Ds()) throw new Error("Relaxed WebAssembly SIMD is not supported in the current environment.");
      } else if (!_s()) throw new Error("WebAssembly SIMD is not supported in the current environment.");
    }
    let u = Bs();
    a > 1 && !u && (typeof self < "u" && !self.crossOriginIsolated && console.warn("env.wasm.numThreads is set to " + a + ", but this will not work unless you enable crossOriginIsolated mode. See https://web.dev/cross-origin-isolation-guide/ for more info."), console.warn("WebAssembly multi-threading is not supported in the current environment. Falling back to single-threading."), r.numThreads = a = 1);
    let o = r.wasmPaths, d = typeof o == "string" ? o : void 0, w = o?.mjs, c = w?.href ?? w, l = o?.wasm, m = l?.href ?? l, h = r.wasmBinary, [g, y] = await po(c, d, a > 1, !!h || !!m), T = false, S = [];
    if (t > 0 && S.push(new Promise((U) => {
      setTimeout(() => {
        T = true, U();
      }, t);
    })), S.push(new Promise((U, $2) => {
      let v = { numThreads: a };
      if (h) v.wasmBinary = h, v.locateFile = (O) => O;
      else if (m || d) v.locateFile = (O) => m ?? d + O;
      else if (c && c.indexOf("blob:") !== 0) v.locateFile = (O) => new URL(O, c).href;
      else if (g) {
        let O = fo();
        O && (v.locateFile = (R) => O + R);
      }
      y(v).then((O) => {
        Bt = false, hr = true, mr = O, U(), g && URL.revokeObjectURL(g);
      }, (O) => {
        Bt = false, mo = true, $2(O);
      });
    })), await Promise.race(S), T) throw new Error(`WebAssembly backend initializing failed due to timeout: ${t}ms`);
  }, k = () => {
    if (hr && mr) return mr;
    throw new Error("WebAssembly is not initialized yet.");
  };
});
var ie;
var nt;
var W;
var _t = M(() => {
  "use strict";
  Ue();
  ie = (r, t) => {
    let a = k(), u = a.lengthBytesUTF8(r) + 1, o = a._malloc(u);
    return a.stringToUTF8(r, o, u), t.push(o), o;
  }, nt = (r, t, a, u) => {
    if (typeof r == "object" && r !== null) {
      if (a.has(r)) throw new Error("Circular reference in options");
      a.add(r);
    }
    Object.entries(r).forEach(([o, d]) => {
      let w = t ? t + o : o;
      if (typeof d == "object") nt(d, w + ".", a, u);
      else if (typeof d == "string" || typeof d == "number") u(w, d.toString());
      else if (typeof d == "boolean") u(w, d ? "1" : "0");
      else throw new Error(`Can't handle extra config type: ${typeof d}`);
    });
  }, W = (r) => {
    let t = k(), a = t.stackSave();
    try {
      let u = t.PTR_SIZE, o = t.stackAlloc(2 * u);
      t._OrtGetLastError(o, o + u);
      let d = Number(t.getValue(o, u === 4 ? "i32" : "i64")), w = t.getValue(o + u, "*"), c = w ? t.UTF8ToString(w) : "";
      throw new Error(`${r} ERROR_CODE: ${d}, ERROR_MESSAGE: ${c}`);
    } finally {
      t.stackRestore(a);
    }
  };
});
var ho;
var wo = M(() => {
  "use strict";
  Ue();
  _t();
  ho = (r, t) => {
    let a = k(), u = 0, o = [], d = r || {};
    try {
      if (r?.logSeverityLevel === void 0) d.logSeverityLevel = 2;
      else if (typeof r.logSeverityLevel != "number" || !Number.isInteger(r.logSeverityLevel) || r.logSeverityLevel < 0 || r.logSeverityLevel > 4) throw new Error(`log severity level is not valid: ${r.logSeverityLevel}`);
      if (r?.logVerbosityLevel === void 0) d.logVerbosityLevel = 0;
      else if (typeof r.logVerbosityLevel != "number" || !Number.isInteger(r.logVerbosityLevel)) throw new Error(`log verbosity level is not valid: ${r.logVerbosityLevel}`);
      r?.terminate === void 0 && (d.terminate = false);
      let w = 0;
      r?.tag !== void 0 && (w = ie(r.tag, o)), u = a._OrtCreateRunOptions(d.logSeverityLevel, d.logVerbosityLevel, !!d.terminate, w), u === 0 && W("Can't create run options."), r?.extra !== void 0 && nt(r.extra, "", /* @__PURE__ */ new WeakSet(), (c, l) => {
        let m = ie(c, o), h = ie(l, o);
        a._OrtAddRunConfigEntry(u, m, h) !== 0 && W(`Can't set a run config entry: ${c} - ${l}.`);
      });
      for (let c of t) a._OrtRunOptionsAddActiveLoraAdapter(u, c) !== 0 && W("Can't add an active LoRA adapter.");
      return [u, o];
    } catch (w) {
      throw u !== 0 && a._OrtReleaseRunOptions(u), o.forEach((c) => a._free(c)), w;
    }
  };
});
var Ps;
var xs;
var Us;
var Ge;
var Cs;
var bo;
var yo = M(() => {
  "use strict";
  Ue();
  _t();
  Ps = (r) => {
    switch (r) {
      case "disabled":
        return 0;
      case "basic":
        return 1;
      case "extended":
        return 2;
      case "layout":
        return 3;
      case "all":
        return 99;
      default:
        throw new Error(`unsupported graph optimization level: ${r}`);
    }
  }, xs = (r) => {
    switch (r) {
      case "sequential":
        return 0;
      case "parallel":
        return 1;
      default:
        throw new Error(`unsupported execution mode: ${r}`);
    }
  }, Us = (r) => {
    r.extra || (r.extra = {}), r.extra.session || (r.extra.session = {});
    let t = r.extra.session;
    t.use_ort_model_bytes_directly || (t.use_ort_model_bytes_directly = "1"), r.executionProviders && r.executionProviders.some((a) => (typeof a == "string" ? a : a.name) === "webgpu") && (r.enableMemPattern = false);
  }, Ge = (r, t, a, u) => {
    let o = ie(t, u), d = ie(a, u);
    k()._OrtAddSessionConfigEntry(r, o, d) !== 0 && W(`Can't set a session config entry: ${t} - ${a}.`);
  }, Cs = async (r, t, a) => {
    let u = t.executionProviders;
    for (let o of u) {
      let d = typeof o == "string" ? o : o.name, w = [], c;
      switch (d) {
        case "webnn":
          if (d = "WEBNN", Ge(r, "session.disable_quant_qdq", "1", a), Ge(r, "session.disable_qdq_constant_folding", "1", a), typeof o != "string") {
            let T = o?.deviceType;
            T && Ge(r, "deviceType", T, a);
          }
          break;
        case "webgpu":
          if (d = "JS", typeof o != "string") {
            let y = o;
            if (y?.preferredLayout) {
              if (y.preferredLayout !== "NCHW" && y.preferredLayout !== "NHWC") throw new Error(`preferredLayout must be either 'NCHW' or 'NHWC': ${y.preferredLayout}`);
              Ge(r, "preferredLayout", y.preferredLayout, a);
            }
          }
          break;
        case "wasm":
        case "cpu":
          continue;
        default:
          throw new Error(`not supported execution provider: ${d}`);
      }
      let l = w.length, m = 0, h = 0;
      if (l > 0) {
        m = k()._malloc(l * k().PTR_SIZE), a.push(m), h = k()._malloc(l * k().PTR_SIZE), a.push(h);
        for (let y = 0; y < l; y++) k().setValue(m + y * k().PTR_SIZE, w[y][0], "*"), k().setValue(h + y * k().PTR_SIZE, w[y][1], "*");
      }
      let g;
      if (c !== void 0) {
        let y = k()._malloc(k().PTR_SIZE);
        a.push(y), k().setValue(y, c[0], "*"), g = await k()._OrtAppendExecutionProviderV2(r, y, 1, m, h, l);
      } else {
        let y = ie(d, a);
        g = await k()._OrtAppendExecutionProvider(r, y, m, h, l);
      }
      g !== 0 && W(`Can't append execution provider: ${d}.`);
    }
  }, bo = async (r) => {
    let t = k(), a = 0, u = [], o = r || {};
    Us(o);
    try {
      let d = Ps(o.graphOptimizationLevel ?? "all"), w = xs(o.executionMode ?? "sequential"), c = typeof o.logId == "string" ? ie(o.logId, u) : 0, l = o.logSeverityLevel ?? 2;
      if (!Number.isInteger(l) || l < 0 || l > 4) throw new Error(`log severity level is not valid: ${l}`);
      let m = o.logVerbosityLevel ?? 0;
      if (!Number.isInteger(m) || m < 0 || m > 4) throw new Error(`log verbosity level is not valid: ${m}`);
      let h = typeof o.optimizedModelFilePath == "string" ? ie(o.optimizedModelFilePath, u) : 0;
      if (a = t._OrtCreateSessionOptions(d, !!o.enableCpuMemArena, !!o.enableMemPattern, w, !!o.enableProfiling, 0, c, l, m, h), a === 0 && W("Can't create session options."), o.executionProviders && await Cs(a, o, u), o.enableGraphCapture !== void 0) {
        if (typeof o.enableGraphCapture != "boolean") throw new Error(`enableGraphCapture must be a boolean value: ${o.enableGraphCapture}`);
        Ge(a, "enableGraphCapture", o.enableGraphCapture.toString(), u);
      }
      if (o.freeDimensionOverrides) for (let [g, y] of Object.entries(o.freeDimensionOverrides)) {
        if (typeof g != "string") throw new Error(`free dimension override name must be a string: ${g}`);
        if (typeof y != "number" || !Number.isInteger(y) || y < 0) throw new Error(`free dimension override value must be a non-negative integer: ${y}`);
        let T = ie(g, u);
        t._OrtAddFreeDimensionOverride(a, T, y) !== 0 && W(`Can't set a free dimension override: ${g} - ${y}.`);
      }
      return o.extra !== void 0 && nt(o.extra, "", /* @__PURE__ */ new WeakSet(), (g, y) => {
        Ge(a, g, y, u);
      }), [a, u];
    } catch (d) {
      throw a !== 0 && t._OrtReleaseSessionOptions(a) !== 0 && W("Can't release session options."), u.forEach((w) => t._free(w)), d;
    }
  };
});
var $e;
var Dt;
var He;
var go;
var Eo;
var Pt;
var xt;
var To;
var wr = M(() => {
  "use strict";
  $e = (r) => {
    switch (r) {
      case "int8":
        return 3;
      case "uint8":
        return 2;
      case "bool":
        return 9;
      case "int16":
        return 5;
      case "uint16":
        return 4;
      case "int32":
        return 6;
      case "uint32":
        return 12;
      case "float16":
        return 10;
      case "float32":
        return 1;
      case "float64":
        return 11;
      case "string":
        return 8;
      case "int64":
        return 7;
      case "uint64":
        return 13;
      case "int4":
        return 22;
      case "uint4":
        return 21;
      default:
        throw new Error(`unsupported data type: ${r}`);
    }
  }, Dt = (r) => {
    switch (r) {
      case 3:
        return "int8";
      case 2:
        return "uint8";
      case 9:
        return "bool";
      case 5:
        return "int16";
      case 4:
        return "uint16";
      case 6:
        return "int32";
      case 12:
        return "uint32";
      case 10:
        return "float16";
      case 1:
        return "float32";
      case 11:
        return "float64";
      case 8:
        return "string";
      case 7:
        return "int64";
      case 13:
        return "uint64";
      case 22:
        return "int4";
      case 21:
        return "uint4";
      default:
        throw new Error(`unsupported data type: ${r}`);
    }
  }, He = (r, t) => {
    let a = [-1, 4, 1, 1, 2, 2, 4, 8, -1, 1, 2, 8, 4, 8, -1, -1, -1, -1, -1, -1, -1, 0.5, 0.5][r], u = typeof t == "number" ? t : t.reduce((o, d) => o * d, 1);
    return a > 0 ? Math.ceil(u * a) : void 0;
  }, go = (r) => {
    switch (r) {
      case "float16":
        return typeof Float16Array < "u" ? Float16Array : Uint16Array;
      case "float32":
        return Float32Array;
      case "uint8":
        return Uint8Array;
      case "int8":
        return Int8Array;
      case "uint16":
        return Uint16Array;
      case "int16":
        return Int16Array;
      case "int32":
        return Int32Array;
      case "bool":
        return Uint8Array;
      case "float64":
        return Float64Array;
      case "uint32":
        return Uint32Array;
      case "int64":
        return BigInt64Array;
      case "uint64":
        return BigUint64Array;
      default:
        throw new Error(`unsupported type: ${r}`);
    }
  }, Eo = (r) => {
    switch (r) {
      case "verbose":
        return 0;
      case "info":
        return 1;
      case "warning":
        return 2;
      case "error":
        return 3;
      case "fatal":
        return 4;
      default:
        throw new Error(`unsupported logging level: ${r}`);
    }
  }, Pt = (r) => r === "float32" || r === "float16" || r === "int32" || r === "int64" || r === "uint32" || r === "uint8" || r === "bool" || r === "uint4" || r === "int4", xt = (r) => r === "float32" || r === "float16" || r === "int32" || r === "int64" || r === "uint32" || r === "uint64" || r === "int8" || r === "uint8" || r === "bool" || r === "uint4" || r === "int4", To = (r) => {
    switch (r) {
      case "none":
        return 0;
      case "cpu":
        return 1;
      case "cpu-pinned":
        return 2;
      case "texture":
        return 3;
      case "gpu-buffer":
        return 4;
      case "ml-tensor":
        return 5;
      default:
        throw new Error(`unsupported data location: ${r}`);
    }
  };
});
var Me;
var Ut = M(() => {
  "use strict";
  yt();
  Me = async (r) => {
    if (typeof r == "string") if (false) try {
      let { readFile: t } = or("node:fs/promises");
      return new Uint8Array(await t(r));
    } catch (t) {
      if (t.code === "ERR_FS_FILE_TOO_LARGE") {
        let { createReadStream: a } = or("node:fs"), u = a(r), o = [];
        for await (let d of u) o.push(d);
        return new Uint8Array(Buffer.concat(o));
      }
      throw t;
    }
    else {
      let t = await fetch(r);
      if (!t.ok) throw new Error(`failed to load external data file: ${r}`);
      let a = t.headers.get("Content-Length"), u = a ? parseInt(a, 10) : 0;
      if (u < 1073741824) return new Uint8Array(await t.arrayBuffer());
      {
        if (!t.body) throw new Error(`failed to load external data file: ${r}, no response body.`);
        let o = t.body.getReader(), d;
        try {
          d = new ArrayBuffer(u);
        } catch (c) {
          if (c instanceof RangeError) {
            let l = Math.ceil(u / 65536);
            d = new WebAssembly.Memory({ initial: l, maximum: l }).buffer;
          } else throw c;
        }
        let w = 0;
        for (; ; ) {
          let { done: c, value: l } = await o.read();
          if (c) break;
          let m = l.byteLength;
          new Uint8Array(d, w, m).set(l), w += m;
        }
        return new Uint8Array(d, 0, u);
      }
    }
    else return r instanceof Blob ? new Uint8Array(await r.arrayBuffer()) : r instanceof Uint8Array ? r : new Uint8Array(r);
  };
});
var Ms;
var Tt;
var St;
var je;
var Rs;
var So;
var rt;
var vt;
var At;
var Ct;
var Ns;
var ze;
var Ao;
var Oo;
var vo;
var Ot;
var It;
var Lt;
var dr = M(() => {
  "use strict";
  Te();
  wo();
  yo();
  wr();
  Ue();
  _t();
  Ut();
  Ms = (r, t) => {
    k()._OrtInit(r, t) !== 0 && W("Can't initialize onnxruntime.");
  }, Tt = async (r) => {
    Ms(r.wasm.numThreads, Eo(r.logLevel));
  }, St = async (r, t) => {
    k().asyncInit?.();
    let a = r.webgpu.adapter;
    if (t === "webgpu") {
      if (typeof navigator > "u" || !navigator.gpu) throw new Error("WebGPU is not supported in current environment");
      if (a) {
        if (typeof a.limits != "object" || typeof a.features != "object" || typeof a.requestDevice != "function") throw new Error("Invalid GPU adapter set in `env.webgpu.adapter`. It must be a GPUAdapter object.");
      } else {
        let u = r.webgpu.powerPreference;
        if (u !== void 0 && u !== "low-power" && u !== "high-performance") throw new Error(`Invalid powerPreference setting: "${u}"`);
        let o = r.webgpu.forceFallbackAdapter;
        if (o !== void 0 && typeof o != "boolean") throw new Error(`Invalid forceFallbackAdapter setting: "${o}"`);
        if (a = await navigator.gpu.requestAdapter({ powerPreference: u, forceFallbackAdapter: o }), !a) throw new Error('Failed to get GPU adapter. You may need to enable flag "--enable-unsafe-webgpu" if you are using Chrome.');
      }
    }
    if (t === "webnn" && (typeof navigator > "u" || !navigator.ml)) throw new Error("WebNN is not supported in current environment");
  }, je = /* @__PURE__ */ new Map(), Rs = (r) => {
    let t = k(), a = t.stackSave();
    try {
      let u = t.PTR_SIZE, o = t.stackAlloc(2 * u);
      t._OrtGetInputOutputCount(r, o, o + u) !== 0 && W("Can't get session input/output count.");
      let w = u === 4 ? "i32" : "i64";
      return [Number(t.getValue(o, w)), Number(t.getValue(o + u, w))];
    } finally {
      t.stackRestore(a);
    }
  }, So = (r, t) => {
    let a = k(), u = a.stackSave(), o = 0;
    try {
      let d = a.PTR_SIZE, w = a.stackAlloc(2 * d);
      a._OrtGetInputOutputMetadata(r, t, w, w + d) !== 0 && W("Can't get session input/output metadata.");
      let l = Number(a.getValue(w, "*"));
      o = Number(a.getValue(w + d, "*"));
      let m = a.HEAP32[o / 4];
      if (m === 0) return [l, 0];
      let h = a.HEAPU32[o / 4 + 1], g = [];
      for (let y = 0; y < h; y++) {
        let T = Number(a.getValue(o + 8 + y * d, "*"));
        g.push(T !== 0 ? a.UTF8ToString(T) : Number(a.getValue(o + 8 + (y + h) * d, "*")));
      }
      return [l, m, g];
    } finally {
      a.stackRestore(u), o !== 0 && a._OrtFree(o);
    }
  }, rt = (r) => {
    let t = k(), a = t._malloc(r.byteLength);
    if (a === 0) throw new Error(`Can't create a session. failed to allocate a buffer of size ${r.byteLength}.`);
    return t.HEAPU8.set(r, a), [a, r.byteLength];
  }, vt = async (r, t) => {
    let a, u, o = k();
    Array.isArray(r) ? [a, u] = r : r.buffer === o.HEAPU8.buffer ? [a, u] = [r.byteOffset, r.byteLength] : [a, u] = rt(r);
    let d = 0, w = 0, c = 0, l = [], m = [], h = [];
    try {
      if ([w, l] = await bo(t), t?.externalData && o.mountExternalData) {
        let C = [];
        for (let G of t.externalData) {
          let b = typeof G == "string" ? G : G.path, Q = typeof G == "string" ? G : G.data;
          C.push(Me(Q).then((H) => {
            o.mountExternalData(b, H);
          }));
        }
        await Promise.all(C);
      }
      for (let C of t?.executionProviders ?? []) if ((typeof C == "string" ? C : C.name) === "webnn") {
        if (o.shouldTransferToMLTensor = false, typeof C != "string") {
          let b = C, Q = b?.context, H = b?.gpuDevice, ue = b?.deviceType, he = b?.powerPreference;
          Q ? o.currentContext = Q : H ? o.currentContext = await o.webnnCreateMLContext(H) : o.currentContext = await o.webnnCreateMLContext({ deviceType: ue, powerPreference: he });
        } else o.currentContext = await o.webnnCreateMLContext();
        break;
      }
      d = await o._OrtCreateSession(a, u, w), o.webgpuOnCreateSession?.(d), d === 0 && W("Can't create a session."), o.jsepOnCreateSession?.(), o.currentContext && (o.webnnRegisterMLContext(d, o.currentContext), o.currentContext = void 0, o.shouldTransferToMLTensor = true);
      let [g, y] = Rs(d), T = !!t?.enableGraphCapture, S = [], U = [], $2 = [], v = [], O = [];
      for (let C = 0; C < g; C++) {
        let [G, b, Q] = So(d, C);
        G === 0 && W("Can't get an input name."), m.push(G);
        let H = o.UTF8ToString(G);
        S.push(H), $2.push(b === 0 ? { name: H, isTensor: false } : { name: H, isTensor: true, type: Dt(b), shape: Q });
      }
      for (let C = 0; C < y; C++) {
        let [G, b, Q] = So(d, C + g);
        G === 0 && W("Can't get an output name."), h.push(G);
        let H = o.UTF8ToString(G);
        U.push(H), v.push(b === 0 ? { name: H, isTensor: false } : { name: H, isTensor: true, type: Dt(b), shape: Q });
      }
      return je.set(d, [d, m, h, null, T, false]), [d, S, U, $2, v];
    } catch (g) {
      throw m.forEach((y) => o._OrtFree(y)), h.forEach((y) => o._OrtFree(y)), c !== 0 && o._OrtReleaseBinding(c) !== 0 && W("Can't release IO binding."), d !== 0 && o._OrtReleaseSession(d) !== 0 && W("Can't release session."), g;
    } finally {
      o._free(a), w !== 0 && o._OrtReleaseSessionOptions(w) !== 0 && W("Can't release session options."), l.forEach((g) => o._free(g)), o.unmountExternalData?.();
    }
  }, At = (r) => {
    let t = k(), a = je.get(r);
    if (!a) throw new Error(`cannot release session. invalid session id: ${r}`);
    let [u, o, d, w, c] = a;
    w && (c && t._OrtClearBoundOutputs(w.handle) !== 0 && W("Can't clear bound outputs."), t._OrtReleaseBinding(w.handle) !== 0 && W("Can't release IO binding.")), t.jsepOnReleaseSession?.(r), t.webnnOnReleaseSession?.(r), t.webgpuOnReleaseSession?.(r), o.forEach((l) => t._OrtFree(l)), d.forEach((l) => t._OrtFree(l)), t._OrtReleaseSession(u) !== 0 && W("Can't release session."), je.delete(r);
  }, Ct = /* @__PURE__ */ new Map(), Ns = 1, ze = /* @__PURE__ */ new Map(), Ao = (r) => {
    let t = k(), a = t._malloc(r.byteLength);
    if (a === 0) throw new Error(`Can't create a LoRA adapter. failed to allocate a buffer of size ${r.byteLength}.`);
    try {
      t.HEAPU8.set(r, a);
      let u = t._OrtCreateLoraAdapter(a, r.byteLength);
      u === 0 && W("Can't create a LoRA adapter.");
      let o = Ns++;
      return Ct.set(o, u), o;
    } finally {
      t._free(a);
    }
  }, Oo = (r) => {
    let t = k(), a = Ct.get(r);
    if (a === void 0) throw new Error(`cannot release LoRA adapter. invalid adapter id: ${r}`);
    if (ze.has(r)) throw new Error(`cannot release LoRA adapter. the adapter is used by a run in progress. adapter id: ${r}`);
    t._OrtReleaseLoraAdapter(a) !== 0 && W("Can't release LoRA adapter."), Ct.delete(r);
  }, vo = async (r, t, a, u, o, d, w = false) => {
    if (!r) {
      t.push(0);
      return;
    }
    let c = k(), l = c.PTR_SIZE, m = r[0], h = r[1], g = r[3], y = g, T, S;
    if (m === "string" && (g === "gpu-buffer" || g === "ml-tensor")) throw new Error("String tensor is not supported on GPU.");
    if (w && g !== "gpu-buffer") throw new Error(`External buffer must be provided for input/output index ${d} when enableGraphCapture is true.`);
    if (g === "gpu-buffer") {
      let v = r[2].gpuBuffer;
      S = He($e(m), h);
      {
        let O = c.jsepRegisterBuffer;
        if (!O) throw new Error('Tensor location "gpu-buffer" is not supported without using WebGPU.');
        T = O(u, d, v, S);
      }
    } else if (g === "ml-tensor") {
      let v = r[2].mlTensor;
      S = He($e(m), h);
      let O = c.webnnRegisterMLTensor;
      if (!O) throw new Error('Tensor location "ml-tensor" is not supported without using WebNN.');
      T = O(u, v, $e(m), h);
    } else {
      let v = r[2];
      if (Array.isArray(v)) {
        S = l * v.length, T = c._malloc(S), a.push(T);
        for (let O = 0; O < v.length; O++) {
          if (typeof v[O] != "string") throw new TypeError(`tensor data at index ${O} is not a string`);
          c.setValue(T + O * l, ie(v[O], a), "*");
        }
      } else {
        let O = c.webnnIsGraphInput, R = c.webnnIsGraphOutput;
        if (m !== "string" && O && R) {
          let C = c.UTF8ToString(o);
          if (O(u, C) || R(u, C)) {
            let G = $e(m);
            S = He(G, h), y = "ml-tensor";
            let b = c.webnnCreateTemporaryTensor, Q = c.webnnUploadTensor;
            if (!b || !Q) throw new Error('Tensor location "ml-tensor" is not supported without using WebNN.');
            let H = await b(u, G, h);
            Q(H, new Uint8Array(v.buffer, v.byteOffset, v.byteLength)), T = H;
          } else S = v.byteLength, T = c._malloc(S), a.push(T), c.HEAPU8.set(new Uint8Array(v.buffer, v.byteOffset, S), T);
        } else S = v.byteLength, T = c._malloc(S), a.push(T), c.HEAPU8.set(new Uint8Array(v.buffer, v.byteOffset, S), T);
      }
    }
    let U = c.stackSave(), $2 = c.stackAlloc(4 * h.length);
    try {
      h.forEach((O, R) => c.setValue($2 + R * l, O, l === 4 ? "i32" : "i64"));
      let v = c._OrtCreateTensor($e(m), T, S, $2, h.length, To(y));
      v === 0 && W(`Can't create tensor for input/output. session=${u}, index=${d}.`), t.push(v);
    } finally {
      c.stackRestore(U);
    }
  }, Ot = async (r, t, a, u, o, d, w = []) => {
    let c = k(), l = c.PTR_SIZE, m = je.get(r);
    if (!m) throw new Error(`cannot run inference. invalid session id: ${r}`);
    let h = m[0], g = m[1], y = m[2], T = m[3], S = m[4], U = m[5], $2 = [];
    if (w.length > 0) {
      if (T) throw new Error("LoRA adapters are not supported for a session that uses IO binding, e.g. when an output is preferred to be on GPU, or when the WebNN execution provider produces an output.");
      for (let z of w) {
        let j = Ct.get(z);
        if (j === void 0) throw new Error(`cannot run inference. invalid LoRA adapter id: ${z}`);
        $2.push(j);
      }
    }
    let v = t.length, O = u.length, R = 0, C = [], G = [], b = [], Q = [], H = [], ue = c.stackSave(), he = c.stackAlloc(v * l), I = c.stackAlloc(v * l), J = c.stackAlloc(O * l), Re = c.stackAlloc(O * l);
    try {
      for (let L of w) ze.set(L, (ze.get(L) ?? 0) + 1);
      [R, C] = ho(d, $2), De("wasm prepareInputOutputTensor");
      for (let L = 0; L < v; L++) await vo(a[L], G, Q, r, g[t[L]], t[L], S);
      for (let L = 0; L < O; L++) await vo(o[L], b, Q, r, y[u[L]], v + u[L], S);
      Pe("wasm prepareInputOutputTensor");
      for (let L = 0; L < v; L++) c.setValue(he + L * l, G[L], "*"), c.setValue(I + L * l, g[t[L]], "*");
      for (let L = 0; L < O; L++) c.setValue(J + L * l, b[L], "*"), c.setValue(Re + L * l, y[u[L]], "*");
      c.jsepOnRunStart?.(h), c.webnnOnRunStart?.(h);
      let z;
      z = await c._OrtRun(h, I, he, v, Re, O, J, R), z !== 0 && W("failed to call OrtRun().");
      let j = [], Ne = [];
      De("wasm ProcessOutputTensor");
      for (let L = 0; L < O; L++) {
        let ne = Number(c.getValue(J + L * l, "*"));
        if (ne === b[L] || H.includes(b[L])) {
          j.push(o[L]), ne !== b[L] && c._OrtReleaseTensor(ne) !== 0 && W("Can't release tensor.");
          continue;
        }
        let Je = c.stackSave(), oe = c.stackAlloc(4 * l), we = false, q, X = 0;
        try {
          c._OrtGetTensorData(ne, oe, oe + l, oe + 2 * l, oe + 3 * l) !== 0 && W(`Can't access output tensor data on index ${L}.`);
          let Fe = l === 4 ? "i32" : "i64", be = Number(c.getValue(oe, Fe));
          X = c.getValue(oe + l, "*");
          let ve = c.getValue(oe + l * 2, "*"), at = Number(c.getValue(oe + l * 3, Fe)), ae = [];
          for (let Z = 0; Z < at; Z++) ae.push(Number(c.getValue(ve + Z * l, Fe)));
          c._OrtFree(ve) !== 0 && W("Can't free memory for tensor dims.");
          let F = ae.reduce((Z, V) => Z * V, 1);
          q = Dt(be);
          let ye = T?.outputPreferredLocations[u[L]];
          if (q === "string") {
            if (ye === "gpu-buffer" || ye === "ml-tensor") throw new Error("String tensor is not supported on GPU.");
            let Z = [];
            for (let V = 0; V < F; V++) {
              let ee = c.getValue(X + V * l, "*"), me = c.getValue(X + (V + 1) * l, "*"), Ze = V === F - 1 ? void 0 : me - ee;
              Z.push(c.UTF8ToString(ee, Ze));
            }
            j.push([q, ae, Z, "cpu"]);
          } else if (ye === "gpu-buffer" && F > 0) {
            let Z = c.jsepGetBuffer;
            if (!Z) throw new Error('preferredLocation "gpu-buffer" is not supported without using WebGPU.');
            let V = Z(X), ee = He(be, F);
            if (ee === void 0 || !Pt(q)) throw new Error(`Unsupported data type: ${q}`);
            we = true, j.push([q, ae, { gpuBuffer: V, download: c.jsepCreateDownloader(V, ee, q), dispose: () => {
              c._OrtReleaseTensor(ne) !== 0 && W("Can't release tensor.");
            } }, "gpu-buffer"]);
          } else if (ye === "ml-tensor" && F > 0) {
            let Z = c.webnnEnsureTensor, V = c.webnnIsGraphInputOutputTypeSupported;
            if (!Z || !V) throw new Error('preferredLocation "ml-tensor" is not supported without using WebNN.');
            if (He(be, F) === void 0 || !xt(q)) throw new Error(`Unsupported data type: ${q}`);
            if (!V(r, q, false)) throw new Error(`preferredLocation "ml-tensor" for ${q} output is not supported by current WebNN Context.`);
            let me = await Z(r, X, be, ae, false);
            we = true, j.push([q, ae, { mlTensor: me, download: c.webnnCreateMLTensorDownloader(X, q), dispose: () => {
              c.webnnReleaseTensorId(X), c._OrtReleaseTensor(ne);
            } }, "ml-tensor"]);
          } else if (ye === "ml-tensor-cpu-output" && F > 0) {
            let Z = c.webnnCreateMLTensorDownloader(X, q)(), V = j.length;
            we = true, Ne.push((async () => {
              let ee = [V, await Z];
              return c.webnnReleaseTensorId(X), c._OrtReleaseTensor(ne), ee;
            })()), j.push([q, ae, [], "cpu"]);
          } else {
            let Z = go(q), V = new Z(F);
            new Uint8Array(V.buffer, V.byteOffset, V.byteLength).set(c.HEAPU8.subarray(X, X + V.byteLength)), j.push([q, ae, V, "cpu"]);
          }
        } finally {
          c.stackRestore(Je), q === "string" && X && c._free(X), we || c._OrtReleaseTensor(ne);
        }
      }
      T && !S && (c._OrtClearBoundOutputs(T.handle) !== 0 && W("Can't clear bound outputs."), je.set(r, [h, g, y, T, S, false]));
      for (let [L, ne] of await Promise.all(Ne)) j[L][2] = ne;
      return Pe("wasm ProcessOutputTensor"), j;
    } finally {
      c.webnnOnRunEnd?.(h), c.stackRestore(ue), G.forEach((z) => c._OrtReleaseTensor(z)), b.forEach((z) => c._OrtReleaseTensor(z)), Q.forEach((z) => c._free(z)), R !== 0 && c._OrtReleaseRunOptions(R), C.forEach((z) => c._free(z));
      for (let z of w) {
        let j = ze.get(z) - 1;
        j === 0 ? ze.delete(z) : ze.set(z, j);
      }
    }
  }, It = (r) => {
    let t = k(), a = je.get(r);
    if (!a) throw new Error("invalid session id");
    let u = a[0], o = t._OrtEndProfiling(u);
    o === 0 && W("Can't get an profile file name."), t._OrtFree(o);
  }, Lt = (r) => {
    let t = [];
    for (let a of r) {
      let u = a[2];
      !Array.isArray(u) && "buffer" in u && t.push(u.buffer);
    }
    return t;
  };
});
var Se;
var fe;
var ot;
var Rt;
var Nt;
var Mt;
var br;
var yr;
var Ve;
var Ye;
var ks;
var Io;
var Lo;
var Bo;
var _o;
var Do;
var Po;
var xo;
var Uo;
var Co;
var Ft = M(() => {
  "use strict";
  Te();
  dr();
  Ue();
  gt();
  Ut();
  Se = () => !!Y.wasm.proxy && typeof document < "u", ot = false, Rt = false, Nt = false, yr = /* @__PURE__ */ new Map(), Ve = (r, t) => {
    let a = yr.get(r);
    a ? a.push(t) : yr.set(r, [t]);
  }, Ye = () => {
    if (ot || !Rt || Nt || !fe) throw new Error("worker not ready");
  }, ks = (r) => {
    switch (r.data.type) {
      case "init-wasm":
        ot = false, r.data.err ? (Nt = true, br[1](r.data.err)) : (Rt = true, br[0]()), Mt && (URL.revokeObjectURL(Mt), Mt = void 0);
        break;
      case "init-ep":
      case "copy-from":
      case "create":
      case "release":
      case "run":
      case "end-profiling": {
        let t = yr.get(r.data.type);
        r.data.err ? t.shift()[1](r.data.err) : t.shift()[0](r.data.out);
        break;
      }
      default:
    }
  }, Io = async () => {
    if (!Rt) {
      if (ot) throw new Error("multiple calls to 'initWasm()' detected.");
      if (Nt) throw new Error("previous call to 'initWasm()' failed.");
      if (ot = true, Se()) return new Promise((r, t) => {
        fe?.terminate(), lo().then(([a, u]) => {
          try {
            fe = u, fe.onerror = (d) => t(d), fe.onmessage = ks, br = [r, t];
            let o = { type: "init-wasm", in: Y };
            !o.in.wasm.wasmPaths && (a || pr) && (o.in.wasm.wasmPaths = { wasm: new URL("ort-wasm-simd-threaded.wasm", import.meta.url).href }), fe.postMessage(o), Mt = a;
          } catch (o) {
            t(o);
          }
        }, t);
      });
      try {
        await Et(Y.wasm), await Tt(Y), Rt = true;
      } catch (r) {
        throw Nt = true, r;
      } finally {
        ot = false;
      }
    }
  }, Lo = async (r) => {
    if (Se()) return Ye(), new Promise((t, a) => {
      Ve("init-ep", [t, a]);
      let u = { type: "init-ep", in: { epName: r, env: Y } };
      fe.postMessage(u);
    });
    await St(Y, r);
  }, Bo = async (r) => Se() ? (Ye(), new Promise((t, a) => {
    Ve("copy-from", [t, a]);
    let u = { type: "copy-from", in: { buffer: r } };
    fe.postMessage(u, [r.buffer]);
  })) : rt(r), _o = async (r, t) => {
    if (Se()) {
      if (t?.preferredOutputLocation) throw new Error('session option "preferredOutputLocation" is not supported for proxy.');
      return Ye(), new Promise((a, u) => {
        Ve("create", [a, u]);
        let o = { type: "create", in: { model: r, options: { ...t } } }, d = [];
        r instanceof Uint8Array && d.push(r.buffer), fe.postMessage(o, d);
      });
    } else return vt(r, t);
  }, Do = async (r) => {
    if (Se()) return Ye(), new Promise((t, a) => {
      Ve("release", [t, a]);
      let u = { type: "release", in: r };
      fe.postMessage(u);
    });
    At(r);
  }, Po = async (r) => {
    if (Se()) throw new Error("LoRA adapter is not supported for proxy.");
    let t = typeof r == "string" ? await Me(r) : r;
    return Ao(t);
  }, xo = async (r) => {
    if (Se()) throw new Error("LoRA adapter is not supported for proxy.");
    Oo(r);
  }, Uo = async (r, t, a, u, o, d, w) => {
    if (Se()) {
      if (w.length > 0) throw new Error("LoRA adapter is not supported for proxy.");
      if (a.some((c) => c[3] !== "cpu")) throw new Error("input tensor on GPU is not supported for proxy.");
      if (o.some((c) => c)) throw new Error("pre-allocated output tensor is not supported for proxy.");
      return Ye(), new Promise((c, l) => {
        Ve("run", [c, l]);
        let m = a, h = { type: "run", in: { sessionId: r, inputIndices: t, inputs: m, outputIndices: u, options: d } };
        fe.postMessage(h, Lt(m));
      });
    } else return Ot(r, t, a, u, o, d, w);
  }, Co = async (r) => {
    if (Se()) return Ye(), new Promise((t, a) => {
      Ve("end-profiling", [t, a]);
      let u = { type: "end-profiling", in: r };
      fe.postMessage(u);
    });
    It(r);
  };
});
var qe;
var gr = M(() => {
  "use strict";
  Te();
  Ft();
  qe = class {
    async loadAdapter(t) {
      de(), this.adapterId = await Po(t), le();
    }
    async dispose() {
      return xo(this.adapterId);
    }
  };
});
var Mo;
var Ws;
var kt;
var Ro = M(() => {
  "use strict";
  Te();
  gr();
  Ft();
  wr();
  yt();
  Ut();
  Mo = (r, t) => {
    switch (r.location) {
      case "cpu":
        return [r.type, r.dims, r.data, "cpu"];
      case "gpu-buffer":
        return [r.type, r.dims, { gpuBuffer: r.gpuBuffer }, "gpu-buffer"];
      case "ml-tensor":
        return [r.type, r.dims, { mlTensor: r.mlTensor }, "ml-tensor"];
      default:
        throw new Error(`invalid data location: ${r.location} for ${t()}`);
    }
  }, Ws = (r) => {
    switch (r[3]) {
      case "cpu":
        return new pe(r[0], r[2], r[1]);
      case "gpu-buffer": {
        let t = r[0];
        if (!Pt(t)) throw new Error(`not supported data type: ${t} for deserializing GPU tensor`);
        let { gpuBuffer: a, download: u, dispose: o } = r[2];
        return pe.fromGpuBuffer(a, { dataType: t, dims: r[1], download: u, dispose: o });
      }
      case "ml-tensor": {
        let t = r[0];
        if (!xt(t)) throw new Error(`not supported data type: ${t} for deserializing MLTensor tensor`);
        let { mlTensor: a, download: u, dispose: o } = r[2];
        return pe.fromMLTensor(a, { dataType: t, dims: r[1], download: u, dispose: o });
      }
      default:
        throw new Error(`invalid data location: ${r[3]}`);
    }
  }, kt = class {
    async fetchModelAndCopyToWasmMemory(t) {
      return Bo(await Me(t));
    }
    async loadModel(t, a) {
      de();
      let u;
      typeof t == "string" ? u = await this.fetchModelAndCopyToWasmMemory(t) : u = t, [this.sessionId, this.inputNames, this.outputNames, this.inputMetadata, this.outputMetadata] = await _o(u, a), le();
    }
    async dispose() {
      return Do(this.sessionId);
    }
    async run(t, a, u, o = []) {
      de();
      let d = o.map((S) => {
        if (!(S instanceof qe)) throw new Error("LoRA adapter was not created by the WebAssembly backend.");
        return S.adapterId;
      }), w = [], c = [];
      Object.entries(t).forEach((S) => {
        let U = S[0], $2 = S[1], v = this.inputNames.indexOf(U);
        if (v === -1) throw new Error(`invalid input '${U}'`);
        w.push($2), c.push(v);
      });
      let l = [], m = [];
      Object.entries(a).forEach((S) => {
        let U = S[0], $2 = S[1], v = this.outputNames.indexOf(U);
        if (v === -1) throw new Error(`invalid output '${U}'`);
        l.push($2), m.push(v);
      });
      let h = w.map((S, U) => Mo(S, () => `input "${this.inputNames[c[U]]}"`)), g = l.map((S, U) => S ? Mo(S, () => `output "${this.outputNames[m[U]]}"`) : null), y = await Uo(this.sessionId, c, h, m, g, u, d), T = {};
      for (let S = 0; S < y.length; S++) T[this.outputNames[m[S]]] = l[S] ?? Ws(y[S]);
      return le(), T;
    }
    startProfiling() {
    }
    endProfiling() {
      Co(this.sessionId);
    }
  };
});
var No;
var Fo = M(() => {
  "use strict";
  No = (r) => {
    if (r?.epContextDataRead) throw new Error('session option "epContextDataRead" is not supported by ONNX Runtime Web');
  };
});
var Wo = {};
pt(Wo, { OnnxruntimeWebAssemblyBackend: () => Wt, initializeFlags: () => ko, wasmBackend: () => Gs });
var ko;
var Wt;
var Gs;
var Go = M(() => {
  "use strict";
  Te();
  gr();
  Ft();
  Ro();
  Fo();
  ko = () => {
    (typeof Y.wasm.initTimeout != "number" || Y.wasm.initTimeout < 0) && (Y.wasm.initTimeout = 0);
    let r = Y.wasm.simd;
    if (typeof r != "boolean" && r !== void 0 && r !== "fixed" && r !== "relaxed" && (console.warn(`Property "env.wasm.simd" is set to unknown value "${r}". Reset it to \`false\` and ignore SIMD feature checking.`), Y.wasm.simd = false), typeof Y.wasm.proxy != "boolean" && (Y.wasm.proxy = false), typeof Y.wasm.trace != "boolean" && (Y.wasm.trace = false), typeof Y.wasm.numThreads != "number" || !Number.isInteger(Y.wasm.numThreads) || Y.wasm.numThreads <= 0) if (typeof self < "u" && !self.crossOriginIsolated) Y.wasm.numThreads = 1;
    else {
      let t = typeof navigator > "u" ? or("node:os").cpus().length : navigator.hardwareConcurrency;
      Y.wasm.numThreads = Math.min(4, Math.ceil((t || 1) / 2));
    }
  }, Wt = class {
    async init(t) {
      ko(), await Io(), await Lo(t);
    }
    async createInferenceSessionHandler(t, a) {
      No(a);
      let u = new kt();
      return await u.loadModel(t, a), u;
    }
    async createLoraAdapterHandler(t) {
      let a = new qe();
      return await a.loadAdapter(t), a;
    }
  }, Gs = new Wt();
});
Te();
Te();
Te();
var Kn = "1.31.1";
{
  let r = (Go(), ar(Wo)).wasmBackend;
  et("cpu", r, 10), et("wasm", r, 10);
}
Object.defineProperty(Y.versions, "web", { value: Kn, enumerable: true });

// ../../sky-aura/public/aura/voice-lab/vendor/phonemizer/dist/wasm/espeak-ng.mjs
var createEspeakModule = /* @__PURE__ */ (() => {
  return (async function(moduleArg = {}) {
    var moduleRtn;
    var Module2 = moduleArg;
    var ENVIRONMENT_IS_WEB = typeof window == "object";
    var ENVIRONMENT_IS_WORKER = typeof WorkerGlobalScope != "undefined";
    var ENVIRONMENT_IS_NODE = typeof process == "object" && process.versions?.node && process.type != "renderer";
    if (ENVIRONMENT_IS_NODE) {
      const { createRequire } = await import("module");
      var require2 = createRequire(import.meta.url);
    }
    var arguments_ = [];
    var thisProgram = "./this.program";
    var quit_ = (status2, toThrow) => {
      throw toThrow;
    };
    var _scriptName = import.meta.url;
    var scriptDirectory = "";
    function locateFile(path) {
      if (Module2["locateFile"]) {
        return Module2["locateFile"](path, scriptDirectory);
      }
      return scriptDirectory + path;
    }
    var readAsync, readBinary;
    if (ENVIRONMENT_IS_NODE) {
      var fs = require2("fs");
      if (_scriptName.startsWith("file:")) {
        scriptDirectory = require2("path").dirname(require2("url").fileURLToPath(_scriptName)) + "/";
      }
      readBinary = (filename) => {
        filename = isFileURI(filename) ? new URL(filename) : filename;
        var ret = fs.readFileSync(filename);
        return ret;
      };
      readAsync = async (filename, binary = true) => {
        filename = isFileURI(filename) ? new URL(filename) : filename;
        var ret = fs.readFileSync(filename, binary ? void 0 : "utf8");
        return ret;
      };
      if (process.argv.length > 1) {
        thisProgram = process.argv[1].replace(/\\/g, "/");
      }
      arguments_ = process.argv.slice(2);
      quit_ = (status2, toThrow) => {
        process.exitCode = status2;
        throw toThrow;
      };
    } else if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
      try {
        scriptDirectory = new URL(".", _scriptName).href;
      } catch {
      }
      {
        readAsync = async (url) => {
          var response = await fetch(url, { credentials: "same-origin" });
          if (response.ok) {
            return response.arrayBuffer();
          }
          throw new Error(response.status + " : " + response.url);
        };
      }
    } else {
    }
    var out = console.log.bind(console);
    var err = console.error.bind(console);
    var wasmBinary;
    var ABORT = false;
    var EXITSTATUS;
    var isFileURI = (filename) => filename.startsWith("file://");
    var readyPromiseResolve, readyPromiseReject;
    var wasmMemory;
    var HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;
    var HEAP64, HEAPU64;
    var runtimeInitialized = false;
    function updateMemoryViews() {
      var b = wasmMemory.buffer;
      HEAP8 = new Int8Array(b);
      HEAP16 = new Int16Array(b);
      HEAPU8 = new Uint8Array(b);
      HEAPU16 = new Uint16Array(b);
      HEAP32 = new Int32Array(b);
      HEAPU32 = new Uint32Array(b);
      HEAPF32 = new Float32Array(b);
      HEAPF64 = new Float64Array(b);
      HEAP64 = new BigInt64Array(b);
      HEAPU64 = new BigUint64Array(b);
    }
    function preRun() {
      if (Module2["preRun"]) {
        if (typeof Module2["preRun"] == "function") Module2["preRun"] = [Module2["preRun"]];
        while (Module2["preRun"].length) {
          addOnPreRun(Module2["preRun"].shift());
        }
      }
      callRuntimeCallbacks(onPreRuns);
    }
    function initRuntime() {
      runtimeInitialized = true;
      if (!Module2["noFSInit"] && !FS.initialized) FS.init();
      TTY.init();
      wasmExports["s"]();
      FS.ignorePermissions = false;
    }
    function postRun() {
      if (Module2["postRun"]) {
        if (typeof Module2["postRun"] == "function") Module2["postRun"] = [Module2["postRun"]];
        while (Module2["postRun"].length) {
          addOnPostRun(Module2["postRun"].shift());
        }
      }
      callRuntimeCallbacks(onPostRuns);
    }
    var runDependencies = 0;
    var dependenciesFulfilled = null;
    function addRunDependency(id) {
      runDependencies++;
      Module2["monitorRunDependencies"]?.(runDependencies);
    }
    function removeRunDependency(id) {
      runDependencies--;
      Module2["monitorRunDependencies"]?.(runDependencies);
      if (runDependencies == 0) {
        if (dependenciesFulfilled) {
          var callback = dependenciesFulfilled;
          dependenciesFulfilled = null;
          callback();
        }
      }
    }
    function abort(what) {
      Module2["onAbort"]?.(what);
      what = "Aborted(" + what + ")";
      err(what);
      ABORT = true;
      what += ". Build with -sASSERTIONS for more info.";
      var e = new WebAssembly.RuntimeError(what);
      readyPromiseReject?.(e);
      throw e;
    }
    var wasmBinaryFile;
    function findWasmBinary() {
      if (Module2["locateFile"]) {
        return locateFile("espeak-ng.wasm");
      }
      return new URL("espeak-ng.wasm", import.meta.url).href;
    }
    function getBinarySync(file) {
      if (file == wasmBinaryFile && wasmBinary) {
        return new Uint8Array(wasmBinary);
      }
      if (readBinary) {
        return readBinary(file);
      }
      throw "both async and sync fetching of the wasm failed";
    }
    async function getWasmBinary(binaryFile) {
      if (!wasmBinary) {
        try {
          var response = await readAsync(binaryFile);
          return new Uint8Array(response);
        } catch {
        }
      }
      return getBinarySync(binaryFile);
    }
    async function instantiateArrayBuffer(binaryFile, imports) {
      try {
        var binary = await getWasmBinary(binaryFile);
        var instance = await WebAssembly.instantiate(binary, imports);
        return instance;
      } catch (reason) {
        err(`failed to asynchronously prepare wasm: ${reason}`);
        abort(reason);
      }
    }
    async function instantiateAsync(binary, binaryFile, imports) {
      if (!binary && typeof WebAssembly.instantiateStreaming == "function" && !ENVIRONMENT_IS_NODE) {
        try {
          var response = fetch(binaryFile, { credentials: "same-origin" });
          var instantiationResult = await WebAssembly.instantiateStreaming(response, imports);
          return instantiationResult;
        } catch (reason) {
          err(`wasm streaming compile failed: ${reason}`);
          err("falling back to ArrayBuffer instantiation");
        }
      }
      return instantiateArrayBuffer(binaryFile, imports);
    }
    function getWasmImports() {
      return { a: wasmImports };
    }
    async function createWasm() {
      function receiveInstance(instance, module) {
        wasmExports = instance.exports;
        wasmMemory = wasmExports["r"];
        updateMemoryViews();
        assignWasmExports(wasmExports);
        removeRunDependency("wasm-instantiate");
        return wasmExports;
      }
      addRunDependency("wasm-instantiate");
      function receiveInstantiationResult(result2) {
        return receiveInstance(result2["instance"]);
      }
      var info = getWasmImports();
      if (Module2["instantiateWasm"]) {
        return new Promise((resolve, reject) => {
          Module2["instantiateWasm"](info, (mod, inst) => {
            resolve(receiveInstance(mod, inst));
          });
        });
      }
      wasmBinaryFile ??= findWasmBinary();
      var result = await instantiateAsync(wasmBinary, wasmBinaryFile, info);
      var exports = receiveInstantiationResult(result);
      return exports;
    }
    class ExitStatus {
      name = "ExitStatus";
      constructor(status2) {
        this.message = `Program terminated with exit(${status2})`;
        this.status = status2;
      }
    }
    var callRuntimeCallbacks = (callbacks) => {
      while (callbacks.length > 0) {
        callbacks.shift()(Module2);
      }
    };
    var onPostRuns = [];
    var addOnPostRun = (cb) => onPostRuns.push(cb);
    var onPreRuns = [];
    var addOnPreRun = (cb) => onPreRuns.push(cb);
    function getValue(ptr, type = "i8") {
      if (type.endsWith("*")) type = "*";
      switch (type) {
        case "i1":
          return HEAP8[ptr];
        case "i8":
          return HEAP8[ptr];
        case "i16":
          return HEAP16[ptr >> 1];
        case "i32":
          return HEAP32[ptr >> 2];
        case "i64":
          return HEAP64[ptr >> 3];
        case "float":
          return HEAPF32[ptr >> 2];
        case "double":
          return HEAPF64[ptr >> 3];
        case "*":
          return HEAPU32[ptr >> 2];
        default:
          abort(`invalid type for getValue: ${type}`);
      }
    }
    var noExitRuntime = true;
    function setValue(ptr, value, type = "i8") {
      if (type.endsWith("*")) type = "*";
      switch (type) {
        case "i1":
          HEAP8[ptr] = value;
          break;
        case "i8":
          HEAP8[ptr] = value;
          break;
        case "i16":
          HEAP16[ptr >> 1] = value;
          break;
        case "i32":
          HEAP32[ptr >> 2] = value;
          break;
        case "i64":
          HEAP64[ptr >> 3] = BigInt(value);
          break;
        case "float":
          HEAPF32[ptr >> 2] = value;
          break;
        case "double":
          HEAPF64[ptr >> 3] = value;
          break;
        case "*":
          HEAPU32[ptr >> 2] = value;
          break;
        default:
          abort(`invalid type for setValue: ${type}`);
      }
    }
    var stackRestore = (val) => __emscripten_stack_restore(val);
    var stackSave = () => _emscripten_stack_get_current();
    var syscallGetVarargI = () => {
      var ret = HEAP32[+SYSCALLS.varargs >> 2];
      SYSCALLS.varargs += 4;
      return ret;
    };
    var syscallGetVarargP = syscallGetVarargI;
    var PATH = { isAbs: (path) => path.charAt(0) === "/", splitPath: (filename) => {
      var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
      return splitPathRe.exec(filename).slice(1);
    }, normalizeArray: (parts, allowAboveRoot) => {
      var up = 0;
      for (var i = parts.length - 1; i >= 0; i--) {
        var last = parts[i];
        if (last === ".") {
          parts.splice(i, 1);
        } else if (last === "..") {
          parts.splice(i, 1);
          up++;
        } else if (up) {
          parts.splice(i, 1);
          up--;
        }
      }
      if (allowAboveRoot) {
        for (; up; up--) {
          parts.unshift("..");
        }
      }
      return parts;
    }, normalize: (path) => {
      var isAbsolute = PATH.isAbs(path), trailingSlash = path.slice(-1) === "/";
      path = PATH.normalizeArray(path.split("/").filter((p) => !!p), !isAbsolute).join("/");
      if (!path && !isAbsolute) {
        path = ".";
      }
      if (path && trailingSlash) {
        path += "/";
      }
      return (isAbsolute ? "/" : "") + path;
    }, dirname: (path) => {
      var result = PATH.splitPath(path), root = result[0], dir = result[1];
      if (!root && !dir) {
        return ".";
      }
      if (dir) {
        dir = dir.slice(0, -1);
      }
      return root + dir;
    }, basename: (path) => path && path.match(/([^\/]+|\/)\/*$/)[1], join: (...paths) => PATH.normalize(paths.join("/")), join2: (l, r) => PATH.normalize(l + "/" + r) };
    var initRandomFill = () => {
      if (ENVIRONMENT_IS_NODE) {
        var nodeCrypto = require2("crypto");
        return (view) => nodeCrypto.randomFillSync(view);
      }
      return (view) => crypto.getRandomValues(view);
    };
    var randomFill = (view) => {
      (randomFill = initRandomFill())(view);
    };
    var PATH_FS = { resolve: (...args) => {
      var resolvedPath = "", resolvedAbsolute = false;
      for (var i = args.length - 1; i >= -1 && !resolvedAbsolute; i--) {
        var path = i >= 0 ? args[i] : FS.cwd();
        if (typeof path != "string") {
          throw new TypeError("Arguments to path.resolve must be strings");
        } else if (!path) {
          return "";
        }
        resolvedPath = path + "/" + resolvedPath;
        resolvedAbsolute = PATH.isAbs(path);
      }
      resolvedPath = PATH.normalizeArray(resolvedPath.split("/").filter((p) => !!p), !resolvedAbsolute).join("/");
      return (resolvedAbsolute ? "/" : "") + resolvedPath || ".";
    }, relative: (from, to2) => {
      from = PATH_FS.resolve(from).slice(1);
      to2 = PATH_FS.resolve(to2).slice(1);
      function trim(arr) {
        var start = 0;
        for (; start < arr.length; start++) {
          if (arr[start] !== "") break;
        }
        var end = arr.length - 1;
        for (; end >= 0; end--) {
          if (arr[end] !== "") break;
        }
        if (start > end) return [];
        return arr.slice(start, end - start + 1);
      }
      var fromParts = trim(from.split("/"));
      var toParts = trim(to2.split("/"));
      var length = Math.min(fromParts.length, toParts.length);
      var samePartsLength = length;
      for (var i = 0; i < length; i++) {
        if (fromParts[i] !== toParts[i]) {
          samePartsLength = i;
          break;
        }
      }
      var outputParts = [];
      for (var i = samePartsLength; i < fromParts.length; i++) {
        outputParts.push("..");
      }
      outputParts = outputParts.concat(toParts.slice(samePartsLength));
      return outputParts.join("/");
    } };
    var UTF8Decoder = typeof TextDecoder != "undefined" ? new TextDecoder() : void 0;
    var UTF8ArrayToString = (heapOrArray, idx = 0, maxBytesToRead = NaN) => {
      var endIdx = idx + maxBytesToRead;
      var endPtr = idx;
      while (heapOrArray[endPtr] && !(endPtr >= endIdx)) ++endPtr;
      if (endPtr - idx > 16 && heapOrArray.buffer && UTF8Decoder) {
        return UTF8Decoder.decode(heapOrArray.subarray(idx, endPtr));
      }
      var str = "";
      while (idx < endPtr) {
        var u0 = heapOrArray[idx++];
        if (!(u0 & 128)) {
          str += String.fromCharCode(u0);
          continue;
        }
        var u1 = heapOrArray[idx++] & 63;
        if ((u0 & 224) == 192) {
          str += String.fromCharCode((u0 & 31) << 6 | u1);
          continue;
        }
        var u2 = heapOrArray[idx++] & 63;
        if ((u0 & 240) == 224) {
          u0 = (u0 & 15) << 12 | u1 << 6 | u2;
        } else {
          u0 = (u0 & 7) << 18 | u1 << 12 | u2 << 6 | heapOrArray[idx++] & 63;
        }
        if (u0 < 65536) {
          str += String.fromCharCode(u0);
        } else {
          var ch = u0 - 65536;
          str += String.fromCharCode(55296 | ch >> 10, 56320 | ch & 1023);
        }
      }
      return str;
    };
    var FS_stdin_getChar_buffer = [];
    var lengthBytesUTF8 = (str) => {
      var len = 0;
      for (var i = 0; i < str.length; ++i) {
        var c = str.charCodeAt(i);
        if (c <= 127) {
          len++;
        } else if (c <= 2047) {
          len += 2;
        } else if (c >= 55296 && c <= 57343) {
          len += 4;
          ++i;
        } else {
          len += 3;
        }
      }
      return len;
    };
    var stringToUTF8Array = (str, heap, outIdx, maxBytesToWrite) => {
      if (!(maxBytesToWrite > 0)) return 0;
      var startIdx = outIdx;
      var endIdx = outIdx + maxBytesToWrite - 1;
      for (var i = 0; i < str.length; ++i) {
        var u = str.codePointAt(i);
        if (u <= 127) {
          if (outIdx >= endIdx) break;
          heap[outIdx++] = u;
        } else if (u <= 2047) {
          if (outIdx + 1 >= endIdx) break;
          heap[outIdx++] = 192 | u >> 6;
          heap[outIdx++] = 128 | u & 63;
        } else if (u <= 65535) {
          if (outIdx + 2 >= endIdx) break;
          heap[outIdx++] = 224 | u >> 12;
          heap[outIdx++] = 128 | u >> 6 & 63;
          heap[outIdx++] = 128 | u & 63;
        } else {
          if (outIdx + 3 >= endIdx) break;
          heap[outIdx++] = 240 | u >> 18;
          heap[outIdx++] = 128 | u >> 12 & 63;
          heap[outIdx++] = 128 | u >> 6 & 63;
          heap[outIdx++] = 128 | u & 63;
          i++;
        }
      }
      heap[outIdx] = 0;
      return outIdx - startIdx;
    };
    var intArrayFromString = (stringy, dontAddNull, length) => {
      var len = length > 0 ? length : lengthBytesUTF8(stringy) + 1;
      var u8array = new Array(len);
      var numBytesWritten = stringToUTF8Array(stringy, u8array, 0, u8array.length);
      if (dontAddNull) u8array.length = numBytesWritten;
      return u8array;
    };
    var FS_stdin_getChar = () => {
      if (!FS_stdin_getChar_buffer.length) {
        var result = null;
        if (ENVIRONMENT_IS_NODE) {
          var BUFSIZE = 256;
          var buf = Buffer.alloc(BUFSIZE);
          var bytesRead = 0;
          var fd = process.stdin.fd;
          try {
            bytesRead = fs.readSync(fd, buf, 0, BUFSIZE);
          } catch (e) {
            if (e.toString().includes("EOF")) bytesRead = 0;
            else throw e;
          }
          if (bytesRead > 0) {
            result = buf.slice(0, bytesRead).toString("utf-8");
          }
        } else if (typeof window != "undefined" && typeof window.prompt == "function") {
          result = window.prompt("Input: ");
          if (result !== null) {
            result += "\n";
          }
        } else {
        }
        if (!result) {
          return null;
        }
        FS_stdin_getChar_buffer = intArrayFromString(result, true);
      }
      return FS_stdin_getChar_buffer.shift();
    };
    var TTY = { ttys: [], init() {
    }, shutdown() {
    }, register(dev, ops) {
      TTY.ttys[dev] = { input: [], output: [], ops };
      FS.registerDevice(dev, TTY.stream_ops);
    }, stream_ops: { open(stream) {
      var tty = TTY.ttys[stream.node.rdev];
      if (!tty) {
        throw new FS.ErrnoError(43);
      }
      stream.tty = tty;
      stream.seekable = false;
    }, close(stream) {
      stream.tty.ops.fsync(stream.tty);
    }, fsync(stream) {
      stream.tty.ops.fsync(stream.tty);
    }, read(stream, buffer, offset, length, pos) {
      if (!stream.tty || !stream.tty.ops.get_char) {
        throw new FS.ErrnoError(60);
      }
      var bytesRead = 0;
      for (var i = 0; i < length; i++) {
        var result;
        try {
          result = stream.tty.ops.get_char(stream.tty);
        } catch (e) {
          throw new FS.ErrnoError(29);
        }
        if (result === void 0 && bytesRead === 0) {
          throw new FS.ErrnoError(6);
        }
        if (result === null || result === void 0) break;
        bytesRead++;
        buffer[offset + i] = result;
      }
      if (bytesRead) {
        stream.node.atime = Date.now();
      }
      return bytesRead;
    }, write(stream, buffer, offset, length, pos) {
      if (!stream.tty || !stream.tty.ops.put_char) {
        throw new FS.ErrnoError(60);
      }
      try {
        for (var i = 0; i < length; i++) {
          stream.tty.ops.put_char(stream.tty, buffer[offset + i]);
        }
      } catch (e) {
        throw new FS.ErrnoError(29);
      }
      if (length) {
        stream.node.mtime = stream.node.ctime = Date.now();
      }
      return i;
    } }, default_tty_ops: { get_char(tty) {
      return FS_stdin_getChar();
    }, put_char(tty, val) {
      if (val === null || val === 10) {
        out(UTF8ArrayToString(tty.output));
        tty.output = [];
      } else {
        if (val != 0) tty.output.push(val);
      }
    }, fsync(tty) {
      if (tty.output?.length > 0) {
        out(UTF8ArrayToString(tty.output));
        tty.output = [];
      }
    }, ioctl_tcgets(tty) {
      return { c_iflag: 25856, c_oflag: 5, c_cflag: 191, c_lflag: 35387, c_cc: [3, 28, 127, 21, 4, 0, 1, 0, 17, 19, 26, 0, 18, 15, 23, 22, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] };
    }, ioctl_tcsets(tty, optional_actions, data) {
      return 0;
    }, ioctl_tiocgwinsz(tty) {
      return [24, 80];
    } }, default_tty1_ops: { put_char(tty, val) {
      if (val === null || val === 10) {
        err(UTF8ArrayToString(tty.output));
        tty.output = [];
      } else {
        if (val != 0) tty.output.push(val);
      }
    }, fsync(tty) {
      if (tty.output?.length > 0) {
        err(UTF8ArrayToString(tty.output));
        tty.output = [];
      }
    } } };
    var mmapAlloc = (size) => {
      abort();
    };
    var MEMFS = { ops_table: null, mount(mount) {
      return MEMFS.createNode(null, "/", 16895, 0);
    }, createNode(parent, name, mode, dev) {
      if (FS.isBlkdev(mode) || FS.isFIFO(mode)) {
        throw new FS.ErrnoError(63);
      }
      MEMFS.ops_table ||= { dir: { node: { getattr: MEMFS.node_ops.getattr, setattr: MEMFS.node_ops.setattr, lookup: MEMFS.node_ops.lookup, mknod: MEMFS.node_ops.mknod, rename: MEMFS.node_ops.rename, unlink: MEMFS.node_ops.unlink, rmdir: MEMFS.node_ops.rmdir, readdir: MEMFS.node_ops.readdir, symlink: MEMFS.node_ops.symlink }, stream: { llseek: MEMFS.stream_ops.llseek } }, file: { node: { getattr: MEMFS.node_ops.getattr, setattr: MEMFS.node_ops.setattr }, stream: { llseek: MEMFS.stream_ops.llseek, read: MEMFS.stream_ops.read, write: MEMFS.stream_ops.write, mmap: MEMFS.stream_ops.mmap, msync: MEMFS.stream_ops.msync } }, link: { node: { getattr: MEMFS.node_ops.getattr, setattr: MEMFS.node_ops.setattr, readlink: MEMFS.node_ops.readlink }, stream: {} }, chrdev: { node: { getattr: MEMFS.node_ops.getattr, setattr: MEMFS.node_ops.setattr }, stream: FS.chrdev_stream_ops } };
      var node = FS.createNode(parent, name, mode, dev);
      if (FS.isDir(node.mode)) {
        node.node_ops = MEMFS.ops_table.dir.node;
        node.stream_ops = MEMFS.ops_table.dir.stream;
        node.contents = {};
      } else if (FS.isFile(node.mode)) {
        node.node_ops = MEMFS.ops_table.file.node;
        node.stream_ops = MEMFS.ops_table.file.stream;
        node.usedBytes = 0;
        node.contents = null;
      } else if (FS.isLink(node.mode)) {
        node.node_ops = MEMFS.ops_table.link.node;
        node.stream_ops = MEMFS.ops_table.link.stream;
      } else if (FS.isChrdev(node.mode)) {
        node.node_ops = MEMFS.ops_table.chrdev.node;
        node.stream_ops = MEMFS.ops_table.chrdev.stream;
      }
      node.atime = node.mtime = node.ctime = Date.now();
      if (parent) {
        parent.contents[name] = node;
        parent.atime = parent.mtime = parent.ctime = node.atime;
      }
      return node;
    }, getFileDataAsTypedArray(node) {
      if (!node.contents) return new Uint8Array(0);
      if (node.contents.subarray) return node.contents.subarray(0, node.usedBytes);
      return new Uint8Array(node.contents);
    }, expandFileStorage(node, newCapacity) {
      var prevCapacity = node.contents ? node.contents.length : 0;
      if (prevCapacity >= newCapacity) return;
      var CAPACITY_DOUBLING_MAX = 1024 * 1024;
      newCapacity = Math.max(newCapacity, prevCapacity * (prevCapacity < CAPACITY_DOUBLING_MAX ? 2 : 1.125) >>> 0);
      if (prevCapacity != 0) newCapacity = Math.max(newCapacity, 256);
      var oldContents = node.contents;
      node.contents = new Uint8Array(newCapacity);
      if (node.usedBytes > 0) node.contents.set(oldContents.subarray(0, node.usedBytes), 0);
    }, resizeFileStorage(node, newSize) {
      if (node.usedBytes == newSize) return;
      if (newSize == 0) {
        node.contents = null;
        node.usedBytes = 0;
      } else {
        var oldContents = node.contents;
        node.contents = new Uint8Array(newSize);
        if (oldContents) {
          node.contents.set(oldContents.subarray(0, Math.min(newSize, node.usedBytes)));
        }
        node.usedBytes = newSize;
      }
    }, node_ops: { getattr(node) {
      var attr = {};
      attr.dev = FS.isChrdev(node.mode) ? node.id : 1;
      attr.ino = node.id;
      attr.mode = node.mode;
      attr.nlink = 1;
      attr.uid = 0;
      attr.gid = 0;
      attr.rdev = node.rdev;
      if (FS.isDir(node.mode)) {
        attr.size = 4096;
      } else if (FS.isFile(node.mode)) {
        attr.size = node.usedBytes;
      } else if (FS.isLink(node.mode)) {
        attr.size = node.link.length;
      } else {
        attr.size = 0;
      }
      attr.atime = new Date(node.atime);
      attr.mtime = new Date(node.mtime);
      attr.ctime = new Date(node.ctime);
      attr.blksize = 4096;
      attr.blocks = Math.ceil(attr.size / attr.blksize);
      return attr;
    }, setattr(node, attr) {
      for (const key of ["mode", "atime", "mtime", "ctime"]) {
        if (attr[key] != null) {
          node[key] = attr[key];
        }
      }
      if (attr.size !== void 0) {
        MEMFS.resizeFileStorage(node, attr.size);
      }
    }, lookup(parent, name) {
      throw MEMFS.doesNotExistError;
    }, mknod(parent, name, mode, dev) {
      return MEMFS.createNode(parent, name, mode, dev);
    }, rename(old_node, new_dir, new_name) {
      var new_node;
      try {
        new_node = FS.lookupNode(new_dir, new_name);
      } catch (e) {
      }
      if (new_node) {
        if (FS.isDir(old_node.mode)) {
          for (var i in new_node.contents) {
            throw new FS.ErrnoError(55);
          }
        }
        FS.hashRemoveNode(new_node);
      }
      delete old_node.parent.contents[old_node.name];
      new_dir.contents[new_name] = old_node;
      old_node.name = new_name;
      new_dir.ctime = new_dir.mtime = old_node.parent.ctime = old_node.parent.mtime = Date.now();
    }, unlink(parent, name) {
      delete parent.contents[name];
      parent.ctime = parent.mtime = Date.now();
    }, rmdir(parent, name) {
      var node = FS.lookupNode(parent, name);
      for (var i in node.contents) {
        throw new FS.ErrnoError(55);
      }
      delete parent.contents[name];
      parent.ctime = parent.mtime = Date.now();
    }, readdir(node) {
      return [".", "..", ...Object.keys(node.contents)];
    }, symlink(parent, newname, oldpath) {
      var node = MEMFS.createNode(parent, newname, 511 | 40960, 0);
      node.link = oldpath;
      return node;
    }, readlink(node) {
      if (!FS.isLink(node.mode)) {
        throw new FS.ErrnoError(28);
      }
      return node.link;
    } }, stream_ops: { read(stream, buffer, offset, length, position) {
      var contents = stream.node.contents;
      if (position >= stream.node.usedBytes) return 0;
      var size = Math.min(stream.node.usedBytes - position, length);
      if (size > 8 && contents.subarray) {
        buffer.set(contents.subarray(position, position + size), offset);
      } else {
        for (var i = 0; i < size; i++) buffer[offset + i] = contents[position + i];
      }
      return size;
    }, write(stream, buffer, offset, length, position, canOwn) {
      if (buffer.buffer === HEAP8.buffer) {
        canOwn = false;
      }
      if (!length) return 0;
      var node = stream.node;
      node.mtime = node.ctime = Date.now();
      if (buffer.subarray && (!node.contents || node.contents.subarray)) {
        if (canOwn) {
          node.contents = buffer.subarray(offset, offset + length);
          node.usedBytes = length;
          return length;
        } else if (node.usedBytes === 0 && position === 0) {
          node.contents = buffer.slice(offset, offset + length);
          node.usedBytes = length;
          return length;
        } else if (position + length <= node.usedBytes) {
          node.contents.set(buffer.subarray(offset, offset + length), position);
          return length;
        }
      }
      MEMFS.expandFileStorage(node, position + length);
      if (node.contents.subarray && buffer.subarray) {
        node.contents.set(buffer.subarray(offset, offset + length), position);
      } else {
        for (var i = 0; i < length; i++) {
          node.contents[position + i] = buffer[offset + i];
        }
      }
      node.usedBytes = Math.max(node.usedBytes, position + length);
      return length;
    }, llseek(stream, offset, whence) {
      var position = offset;
      if (whence === 1) {
        position += stream.position;
      } else if (whence === 2) {
        if (FS.isFile(stream.node.mode)) {
          position += stream.node.usedBytes;
        }
      }
      if (position < 0) {
        throw new FS.ErrnoError(28);
      }
      return position;
    }, mmap(stream, length, position, prot, flags) {
      if (!FS.isFile(stream.node.mode)) {
        throw new FS.ErrnoError(43);
      }
      var ptr;
      var allocated;
      var contents = stream.node.contents;
      if (!(flags & 2) && contents && contents.buffer === HEAP8.buffer) {
        allocated = false;
        ptr = contents.byteOffset;
      } else {
        allocated = true;
        ptr = mmapAlloc(length);
        if (!ptr) {
          throw new FS.ErrnoError(48);
        }
        if (contents) {
          if (position > 0 || position + length < contents.length) {
            if (contents.subarray) {
              contents = contents.subarray(position, position + length);
            } else {
              contents = Array.prototype.slice.call(contents, position, position + length);
            }
          }
          HEAP8.set(contents, ptr);
        }
      }
      return { ptr, allocated };
    }, msync(stream, buffer, offset, length, mmapFlags) {
      MEMFS.stream_ops.write(stream, buffer, 0, length, offset, false);
      return 0;
    } } };
    var asyncLoad = async (url) => {
      var arrayBuffer = await readAsync(url);
      return new Uint8Array(arrayBuffer);
    };
    var FS_createDataFile = (...args) => FS.createDataFile(...args);
    var getUniqueRunDependency = (id) => id;
    var preloadPlugins = [];
    var FS_handledByPreloadPlugin = (byteArray, fullname, finish, onerror) => {
      if (typeof Browser != "undefined") Browser.init();
      var handled = false;
      preloadPlugins.forEach((plugin) => {
        if (handled) return;
        if (plugin["canHandle"](fullname)) {
          plugin["handle"](byteArray, fullname, finish, onerror);
          handled = true;
        }
      });
      return handled;
    };
    var FS_createPreloadedFile = (parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile, canOwn, preFinish) => {
      var fullname = name ? PATH_FS.resolve(PATH.join2(parent, name)) : parent;
      var dep = getUniqueRunDependency(`cp ${fullname}`);
      function processData(byteArray) {
        function finish(byteArray2) {
          preFinish?.();
          if (!dontCreateFile) {
            FS_createDataFile(parent, name, byteArray2, canRead, canWrite, canOwn);
          }
          onload?.();
          removeRunDependency(dep);
        }
        if (FS_handledByPreloadPlugin(byteArray, fullname, finish, () => {
          onerror?.();
          removeRunDependency(dep);
        })) {
          return;
        }
        finish(byteArray);
      }
      addRunDependency(dep);
      if (typeof url == "string") {
        asyncLoad(url).then(processData, onerror);
      } else {
        processData(url);
      }
    };
    var FS_modeStringToFlags = (str) => {
      var flagModes = { r: 0, "r+": 2, w: 512 | 64 | 1, "w+": 512 | 64 | 2, a: 1024 | 64 | 1, "a+": 1024 | 64 | 2 };
      var flags = flagModes[str];
      if (typeof flags == "undefined") {
        throw new Error(`Unknown file open mode: ${str}`);
      }
      return flags;
    };
    var FS_getMode = (canRead, canWrite) => {
      var mode = 0;
      if (canRead) mode |= 292 | 73;
      if (canWrite) mode |= 146;
      return mode;
    };
    var FS = { root: null, mounts: [], devices: {}, streams: [], nextInode: 1, nameTable: null, currentPath: "/", initialized: false, ignorePermissions: true, filesystems: null, syncFSRequests: 0, readFiles: {}, ErrnoError: class {
      name = "ErrnoError";
      constructor(errno) {
        this.errno = errno;
      }
    }, FSStream: class {
      shared = {};
      get object() {
        return this.node;
      }
      set object(val) {
        this.node = val;
      }
      get isRead() {
        return (this.flags & 2097155) !== 1;
      }
      get isWrite() {
        return (this.flags & 2097155) !== 0;
      }
      get isAppend() {
        return this.flags & 1024;
      }
      get flags() {
        return this.shared.flags;
      }
      set flags(val) {
        this.shared.flags = val;
      }
      get position() {
        return this.shared.position;
      }
      set position(val) {
        this.shared.position = val;
      }
    }, FSNode: class {
      node_ops = {};
      stream_ops = {};
      readMode = 292 | 73;
      writeMode = 146;
      mounted = null;
      constructor(parent, name, mode, rdev) {
        if (!parent) {
          parent = this;
        }
        this.parent = parent;
        this.mount = parent.mount;
        this.id = FS.nextInode++;
        this.name = name;
        this.mode = mode;
        this.rdev = rdev;
        this.atime = this.mtime = this.ctime = Date.now();
      }
      get read() {
        return (this.mode & this.readMode) === this.readMode;
      }
      set read(val) {
        val ? this.mode |= this.readMode : this.mode &= ~this.readMode;
      }
      get write() {
        return (this.mode & this.writeMode) === this.writeMode;
      }
      set write(val) {
        val ? this.mode |= this.writeMode : this.mode &= ~this.writeMode;
      }
      get isFolder() {
        return FS.isDir(this.mode);
      }
      get isDevice() {
        return FS.isChrdev(this.mode);
      }
    }, lookupPath(path, opts = {}) {
      if (!path) {
        throw new FS.ErrnoError(44);
      }
      opts.follow_mount ??= true;
      if (!PATH.isAbs(path)) {
        path = FS.cwd() + "/" + path;
      }
      linkloop: for (var nlinks = 0; nlinks < 40; nlinks++) {
        var parts = path.split("/").filter((p) => !!p);
        var current = FS.root;
        var current_path = "/";
        for (var i = 0; i < parts.length; i++) {
          var islast = i === parts.length - 1;
          if (islast && opts.parent) {
            break;
          }
          if (parts[i] === ".") {
            continue;
          }
          if (parts[i] === "..") {
            current_path = PATH.dirname(current_path);
            if (FS.isRoot(current)) {
              path = current_path + "/" + parts.slice(i + 1).join("/");
              continue linkloop;
            } else {
              current = current.parent;
            }
            continue;
          }
          current_path = PATH.join2(current_path, parts[i]);
          try {
            current = FS.lookupNode(current, parts[i]);
          } catch (e) {
            if (e?.errno === 44 && islast && opts.noent_okay) {
              return { path: current_path };
            }
            throw e;
          }
          if (FS.isMountpoint(current) && (!islast || opts.follow_mount)) {
            current = current.mounted.root;
          }
          if (FS.isLink(current.mode) && (!islast || opts.follow)) {
            if (!current.node_ops.readlink) {
              throw new FS.ErrnoError(52);
            }
            var link = current.node_ops.readlink(current);
            if (!PATH.isAbs(link)) {
              link = PATH.dirname(current_path) + "/" + link;
            }
            path = link + "/" + parts.slice(i + 1).join("/");
            continue linkloop;
          }
        }
        return { path: current_path, node: current };
      }
      throw new FS.ErrnoError(32);
    }, getPath(node) {
      var path;
      while (true) {
        if (FS.isRoot(node)) {
          var mount = node.mount.mountpoint;
          if (!path) return mount;
          return mount[mount.length - 1] !== "/" ? `${mount}/${path}` : mount + path;
        }
        path = path ? `${node.name}/${path}` : node.name;
        node = node.parent;
      }
    }, hashName(parentid, name) {
      var hash = 0;
      for (var i = 0; i < name.length; i++) {
        hash = (hash << 5) - hash + name.charCodeAt(i) | 0;
      }
      return (parentid + hash >>> 0) % FS.nameTable.length;
    }, hashAddNode(node) {
      var hash = FS.hashName(node.parent.id, node.name);
      node.name_next = FS.nameTable[hash];
      FS.nameTable[hash] = node;
    }, hashRemoveNode(node) {
      var hash = FS.hashName(node.parent.id, node.name);
      if (FS.nameTable[hash] === node) {
        FS.nameTable[hash] = node.name_next;
      } else {
        var current = FS.nameTable[hash];
        while (current) {
          if (current.name_next === node) {
            current.name_next = node.name_next;
            break;
          }
          current = current.name_next;
        }
      }
    }, lookupNode(parent, name) {
      var errCode = FS.mayLookup(parent);
      if (errCode) {
        throw new FS.ErrnoError(errCode);
      }
      var hash = FS.hashName(parent.id, name);
      for (var node = FS.nameTable[hash]; node; node = node.name_next) {
        var nodeName = node.name;
        if (node.parent.id === parent.id && nodeName === name) {
          return node;
        }
      }
      return FS.lookup(parent, name);
    }, createNode(parent, name, mode, rdev) {
      var node = new FS.FSNode(parent, name, mode, rdev);
      FS.hashAddNode(node);
      return node;
    }, destroyNode(node) {
      FS.hashRemoveNode(node);
    }, isRoot(node) {
      return node === node.parent;
    }, isMountpoint(node) {
      return !!node.mounted;
    }, isFile(mode) {
      return (mode & 61440) === 32768;
    }, isDir(mode) {
      return (mode & 61440) === 16384;
    }, isLink(mode) {
      return (mode & 61440) === 40960;
    }, isChrdev(mode) {
      return (mode & 61440) === 8192;
    }, isBlkdev(mode) {
      return (mode & 61440) === 24576;
    }, isFIFO(mode) {
      return (mode & 61440) === 4096;
    }, isSocket(mode) {
      return (mode & 49152) === 49152;
    }, flagsToPermissionString(flag) {
      var perms = ["r", "w", "rw"][flag & 3];
      if (flag & 512) {
        perms += "w";
      }
      return perms;
    }, nodePermissions(node, perms) {
      if (FS.ignorePermissions) {
        return 0;
      }
      if (perms.includes("r") && !(node.mode & 292)) {
        return 2;
      } else if (perms.includes("w") && !(node.mode & 146)) {
        return 2;
      } else if (perms.includes("x") && !(node.mode & 73)) {
        return 2;
      }
      return 0;
    }, mayLookup(dir) {
      if (!FS.isDir(dir.mode)) return 54;
      var errCode = FS.nodePermissions(dir, "x");
      if (errCode) return errCode;
      if (!dir.node_ops.lookup) return 2;
      return 0;
    }, mayCreate(dir, name) {
      if (!FS.isDir(dir.mode)) {
        return 54;
      }
      try {
        var node = FS.lookupNode(dir, name);
        return 20;
      } catch (e) {
      }
      return FS.nodePermissions(dir, "wx");
    }, mayDelete(dir, name, isdir) {
      var node;
      try {
        node = FS.lookupNode(dir, name);
      } catch (e) {
        return e.errno;
      }
      var errCode = FS.nodePermissions(dir, "wx");
      if (errCode) {
        return errCode;
      }
      if (isdir) {
        if (!FS.isDir(node.mode)) {
          return 54;
        }
        if (FS.isRoot(node) || FS.getPath(node) === FS.cwd()) {
          return 10;
        }
      } else {
        if (FS.isDir(node.mode)) {
          return 31;
        }
      }
      return 0;
    }, mayOpen(node, flags) {
      if (!node) {
        return 44;
      }
      if (FS.isLink(node.mode)) {
        return 32;
      } else if (FS.isDir(node.mode)) {
        if (FS.flagsToPermissionString(flags) !== "r" || flags & (512 | 64)) {
          return 31;
        }
      }
      return FS.nodePermissions(node, FS.flagsToPermissionString(flags));
    }, checkOpExists(op, err2) {
      if (!op) {
        throw new FS.ErrnoError(err2);
      }
      return op;
    }, MAX_OPEN_FDS: 4096, nextfd() {
      for (var fd = 0; fd <= FS.MAX_OPEN_FDS; fd++) {
        if (!FS.streams[fd]) {
          return fd;
        }
      }
      throw new FS.ErrnoError(33);
    }, getStreamChecked(fd) {
      var stream = FS.getStream(fd);
      if (!stream) {
        throw new FS.ErrnoError(8);
      }
      return stream;
    }, getStream: (fd) => FS.streams[fd], createStream(stream, fd = -1) {
      stream = Object.assign(new FS.FSStream(), stream);
      if (fd == -1) {
        fd = FS.nextfd();
      }
      stream.fd = fd;
      FS.streams[fd] = stream;
      return stream;
    }, closeStream(fd) {
      FS.streams[fd] = null;
    }, dupStream(origStream, fd = -1) {
      var stream = FS.createStream(origStream, fd);
      stream.stream_ops?.dup?.(stream);
      return stream;
    }, doSetAttr(stream, node, attr) {
      var setattr = stream?.stream_ops.setattr;
      var arg = setattr ? stream : node;
      setattr ??= node.node_ops.setattr;
      FS.checkOpExists(setattr, 63);
      setattr(arg, attr);
    }, chrdev_stream_ops: { open(stream) {
      var device = FS.getDevice(stream.node.rdev);
      stream.stream_ops = device.stream_ops;
      stream.stream_ops.open?.(stream);
    }, llseek() {
      throw new FS.ErrnoError(70);
    } }, major: (dev) => dev >> 8, minor: (dev) => dev & 255, makedev: (ma, mi) => ma << 8 | mi, registerDevice(dev, ops) {
      FS.devices[dev] = { stream_ops: ops };
    }, getDevice: (dev) => FS.devices[dev], getMounts(mount) {
      var mounts = [];
      var check = [mount];
      while (check.length) {
        var m = check.pop();
        mounts.push(m);
        check.push(...m.mounts);
      }
      return mounts;
    }, syncfs(populate, callback) {
      if (typeof populate == "function") {
        callback = populate;
        populate = false;
      }
      FS.syncFSRequests++;
      if (FS.syncFSRequests > 1) {
        err(`warning: ${FS.syncFSRequests} FS.syncfs operations in flight at once, probably just doing extra work`);
      }
      var mounts = FS.getMounts(FS.root.mount);
      var completed = 0;
      function doCallback(errCode) {
        FS.syncFSRequests--;
        return callback(errCode);
      }
      function done(errCode) {
        if (errCode) {
          if (!done.errored) {
            done.errored = true;
            return doCallback(errCode);
          }
          return;
        }
        if (++completed >= mounts.length) {
          doCallback(null);
        }
      }
      mounts.forEach((mount) => {
        if (!mount.type.syncfs) {
          return done(null);
        }
        mount.type.syncfs(mount, populate, done);
      });
    }, mount(type, opts, mountpoint) {
      var root = mountpoint === "/";
      var pseudo = !mountpoint;
      var node;
      if (root && FS.root) {
        throw new FS.ErrnoError(10);
      } else if (!root && !pseudo) {
        var lookup = FS.lookupPath(mountpoint, { follow_mount: false });
        mountpoint = lookup.path;
        node = lookup.node;
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(10);
        }
        if (!FS.isDir(node.mode)) {
          throw new FS.ErrnoError(54);
        }
      }
      var mount = { type, opts, mountpoint, mounts: [] };
      var mountRoot = type.mount(mount);
      mountRoot.mount = mount;
      mount.root = mountRoot;
      if (root) {
        FS.root = mountRoot;
      } else if (node) {
        node.mounted = mount;
        if (node.mount) {
          node.mount.mounts.push(mount);
        }
      }
      return mountRoot;
    }, unmount(mountpoint) {
      var lookup = FS.lookupPath(mountpoint, { follow_mount: false });
      if (!FS.isMountpoint(lookup.node)) {
        throw new FS.ErrnoError(28);
      }
      var node = lookup.node;
      var mount = node.mounted;
      var mounts = FS.getMounts(mount);
      Object.keys(FS.nameTable).forEach((hash) => {
        var current = FS.nameTable[hash];
        while (current) {
          var next = current.name_next;
          if (mounts.includes(current.mount)) {
            FS.destroyNode(current);
          }
          current = next;
        }
      });
      node.mounted = null;
      var idx = node.mount.mounts.indexOf(mount);
      node.mount.mounts.splice(idx, 1);
    }, lookup(parent, name) {
      return parent.node_ops.lookup(parent, name);
    }, mknod(path, mode, dev) {
      var lookup = FS.lookupPath(path, { parent: true });
      var parent = lookup.node;
      var name = PATH.basename(path);
      if (!name) {
        throw new FS.ErrnoError(28);
      }
      if (name === "." || name === "..") {
        throw new FS.ErrnoError(20);
      }
      var errCode = FS.mayCreate(parent, name);
      if (errCode) {
        throw new FS.ErrnoError(errCode);
      }
      if (!parent.node_ops.mknod) {
        throw new FS.ErrnoError(63);
      }
      return parent.node_ops.mknod(parent, name, mode, dev);
    }, statfs(path) {
      return FS.statfsNode(FS.lookupPath(path, { follow: true }).node);
    }, statfsStream(stream) {
      return FS.statfsNode(stream.node);
    }, statfsNode(node) {
      var rtn = { bsize: 4096, frsize: 4096, blocks: 1e6, bfree: 5e5, bavail: 5e5, files: FS.nextInode, ffree: FS.nextInode - 1, fsid: 42, flags: 2, namelen: 255 };
      if (node.node_ops.statfs) {
        Object.assign(rtn, node.node_ops.statfs(node.mount.opts.root));
      }
      return rtn;
    }, create(path, mode = 438) {
      mode &= 4095;
      mode |= 32768;
      return FS.mknod(path, mode, 0);
    }, mkdir(path, mode = 511) {
      mode &= 511 | 512;
      mode |= 16384;
      return FS.mknod(path, mode, 0);
    }, mkdirTree(path, mode) {
      var dirs = path.split("/");
      var d = "";
      for (var dir of dirs) {
        if (!dir) continue;
        if (d || PATH.isAbs(path)) d += "/";
        d += dir;
        try {
          FS.mkdir(d, mode);
        } catch (e) {
          if (e.errno != 20) throw e;
        }
      }
    }, mkdev(path, mode, dev) {
      if (typeof dev == "undefined") {
        dev = mode;
        mode = 438;
      }
      mode |= 8192;
      return FS.mknod(path, mode, dev);
    }, symlink(oldpath, newpath) {
      if (!PATH_FS.resolve(oldpath)) {
        throw new FS.ErrnoError(44);
      }
      var lookup = FS.lookupPath(newpath, { parent: true });
      var parent = lookup.node;
      if (!parent) {
        throw new FS.ErrnoError(44);
      }
      var newname = PATH.basename(newpath);
      var errCode = FS.mayCreate(parent, newname);
      if (errCode) {
        throw new FS.ErrnoError(errCode);
      }
      if (!parent.node_ops.symlink) {
        throw new FS.ErrnoError(63);
      }
      return parent.node_ops.symlink(parent, newname, oldpath);
    }, rename(old_path, new_path) {
      var old_dirname = PATH.dirname(old_path);
      var new_dirname = PATH.dirname(new_path);
      var old_name = PATH.basename(old_path);
      var new_name = PATH.basename(new_path);
      var lookup, old_dir, new_dir;
      lookup = FS.lookupPath(old_path, { parent: true });
      old_dir = lookup.node;
      lookup = FS.lookupPath(new_path, { parent: true });
      new_dir = lookup.node;
      if (!old_dir || !new_dir) throw new FS.ErrnoError(44);
      if (old_dir.mount !== new_dir.mount) {
        throw new FS.ErrnoError(75);
      }
      var old_node = FS.lookupNode(old_dir, old_name);
      var relative = PATH_FS.relative(old_path, new_dirname);
      if (relative.charAt(0) !== ".") {
        throw new FS.ErrnoError(28);
      }
      relative = PATH_FS.relative(new_path, old_dirname);
      if (relative.charAt(0) !== ".") {
        throw new FS.ErrnoError(55);
      }
      var new_node;
      try {
        new_node = FS.lookupNode(new_dir, new_name);
      } catch (e) {
      }
      if (old_node === new_node) {
        return;
      }
      var isdir = FS.isDir(old_node.mode);
      var errCode = FS.mayDelete(old_dir, old_name, isdir);
      if (errCode) {
        throw new FS.ErrnoError(errCode);
      }
      errCode = new_node ? FS.mayDelete(new_dir, new_name, isdir) : FS.mayCreate(new_dir, new_name);
      if (errCode) {
        throw new FS.ErrnoError(errCode);
      }
      if (!old_dir.node_ops.rename) {
        throw new FS.ErrnoError(63);
      }
      if (FS.isMountpoint(old_node) || new_node && FS.isMountpoint(new_node)) {
        throw new FS.ErrnoError(10);
      }
      if (new_dir !== old_dir) {
        errCode = FS.nodePermissions(old_dir, "w");
        if (errCode) {
          throw new FS.ErrnoError(errCode);
        }
      }
      FS.hashRemoveNode(old_node);
      try {
        old_dir.node_ops.rename(old_node, new_dir, new_name);
        old_node.parent = new_dir;
      } catch (e) {
        throw e;
      } finally {
        FS.hashAddNode(old_node);
      }
    }, rmdir(path) {
      var lookup = FS.lookupPath(path, { parent: true });
      var parent = lookup.node;
      var name = PATH.basename(path);
      var node = FS.lookupNode(parent, name);
      var errCode = FS.mayDelete(parent, name, true);
      if (errCode) {
        throw new FS.ErrnoError(errCode);
      }
      if (!parent.node_ops.rmdir) {
        throw new FS.ErrnoError(63);
      }
      if (FS.isMountpoint(node)) {
        throw new FS.ErrnoError(10);
      }
      parent.node_ops.rmdir(parent, name);
      FS.destroyNode(node);
    }, readdir(path) {
      var lookup = FS.lookupPath(path, { follow: true });
      var node = lookup.node;
      var readdir = FS.checkOpExists(node.node_ops.readdir, 54);
      return readdir(node);
    }, unlink(path) {
      var lookup = FS.lookupPath(path, { parent: true });
      var parent = lookup.node;
      if (!parent) {
        throw new FS.ErrnoError(44);
      }
      var name = PATH.basename(path);
      var node = FS.lookupNode(parent, name);
      var errCode = FS.mayDelete(parent, name, false);
      if (errCode) {
        throw new FS.ErrnoError(errCode);
      }
      if (!parent.node_ops.unlink) {
        throw new FS.ErrnoError(63);
      }
      if (FS.isMountpoint(node)) {
        throw new FS.ErrnoError(10);
      }
      parent.node_ops.unlink(parent, name);
      FS.destroyNode(node);
    }, readlink(path) {
      var lookup = FS.lookupPath(path);
      var link = lookup.node;
      if (!link) {
        throw new FS.ErrnoError(44);
      }
      if (!link.node_ops.readlink) {
        throw new FS.ErrnoError(28);
      }
      return link.node_ops.readlink(link);
    }, stat(path, dontFollow) {
      var lookup = FS.lookupPath(path, { follow: !dontFollow });
      var node = lookup.node;
      var getattr = FS.checkOpExists(node.node_ops.getattr, 63);
      return getattr(node);
    }, fstat(fd) {
      var stream = FS.getStreamChecked(fd);
      var node = stream.node;
      var getattr = stream.stream_ops.getattr;
      var arg = getattr ? stream : node;
      getattr ??= node.node_ops.getattr;
      FS.checkOpExists(getattr, 63);
      return getattr(arg);
    }, lstat(path) {
      return FS.stat(path, true);
    }, doChmod(stream, node, mode, dontFollow) {
      FS.doSetAttr(stream, node, { mode: mode & 4095 | node.mode & ~4095, ctime: Date.now(), dontFollow });
    }, chmod(path, mode, dontFollow) {
      var node;
      if (typeof path == "string") {
        var lookup = FS.lookupPath(path, { follow: !dontFollow });
        node = lookup.node;
      } else {
        node = path;
      }
      FS.doChmod(null, node, mode, dontFollow);
    }, lchmod(path, mode) {
      FS.chmod(path, mode, true);
    }, fchmod(fd, mode) {
      var stream = FS.getStreamChecked(fd);
      FS.doChmod(stream, stream.node, mode, false);
    }, doChown(stream, node, dontFollow) {
      FS.doSetAttr(stream, node, { timestamp: Date.now(), dontFollow });
    }, chown(path, uid, gid, dontFollow) {
      var node;
      if (typeof path == "string") {
        var lookup = FS.lookupPath(path, { follow: !dontFollow });
        node = lookup.node;
      } else {
        node = path;
      }
      FS.doChown(null, node, dontFollow);
    }, lchown(path, uid, gid) {
      FS.chown(path, uid, gid, true);
    }, fchown(fd, uid, gid) {
      var stream = FS.getStreamChecked(fd);
      FS.doChown(stream, stream.node, false);
    }, doTruncate(stream, node, len) {
      if (FS.isDir(node.mode)) {
        throw new FS.ErrnoError(31);
      }
      if (!FS.isFile(node.mode)) {
        throw new FS.ErrnoError(28);
      }
      var errCode = FS.nodePermissions(node, "w");
      if (errCode) {
        throw new FS.ErrnoError(errCode);
      }
      FS.doSetAttr(stream, node, { size: len, timestamp: Date.now() });
    }, truncate(path, len) {
      if (len < 0) {
        throw new FS.ErrnoError(28);
      }
      var node;
      if (typeof path == "string") {
        var lookup = FS.lookupPath(path, { follow: true });
        node = lookup.node;
      } else {
        node = path;
      }
      FS.doTruncate(null, node, len);
    }, ftruncate(fd, len) {
      var stream = FS.getStreamChecked(fd);
      if (len < 0 || (stream.flags & 2097155) === 0) {
        throw new FS.ErrnoError(28);
      }
      FS.doTruncate(stream, stream.node, len);
    }, utime(path, atime, mtime) {
      var lookup = FS.lookupPath(path, { follow: true });
      var node = lookup.node;
      var setattr = FS.checkOpExists(node.node_ops.setattr, 63);
      setattr(node, { atime, mtime });
    }, open(path, flags, mode = 438) {
      if (path === "") {
        throw new FS.ErrnoError(44);
      }
      flags = typeof flags == "string" ? FS_modeStringToFlags(flags) : flags;
      if (flags & 64) {
        mode = mode & 4095 | 32768;
      } else {
        mode = 0;
      }
      var node;
      var isDirPath;
      if (typeof path == "object") {
        node = path;
      } else {
        isDirPath = path.endsWith("/");
        var lookup = FS.lookupPath(path, { follow: !(flags & 131072), noent_okay: true });
        node = lookup.node;
        path = lookup.path;
      }
      var created = false;
      if (flags & 64) {
        if (node) {
          if (flags & 128) {
            throw new FS.ErrnoError(20);
          }
        } else if (isDirPath) {
          throw new FS.ErrnoError(31);
        } else {
          node = FS.mknod(path, mode | 511, 0);
          created = true;
        }
      }
      if (!node) {
        throw new FS.ErrnoError(44);
      }
      if (FS.isChrdev(node.mode)) {
        flags &= ~512;
      }
      if (flags & 65536 && !FS.isDir(node.mode)) {
        throw new FS.ErrnoError(54);
      }
      if (!created) {
        var errCode = FS.mayOpen(node, flags);
        if (errCode) {
          throw new FS.ErrnoError(errCode);
        }
      }
      if (flags & 512 && !created) {
        FS.truncate(node, 0);
      }
      flags &= ~(128 | 512 | 131072);
      var stream = FS.createStream({ node, path: FS.getPath(node), flags, seekable: true, position: 0, stream_ops: node.stream_ops, ungotten: [], error: false });
      if (stream.stream_ops.open) {
        stream.stream_ops.open(stream);
      }
      if (created) {
        FS.chmod(node, mode & 511);
      }
      if (Module2["logReadFiles"] && !(flags & 1)) {
        if (!(path in FS.readFiles)) {
          FS.readFiles[path] = 1;
        }
      }
      return stream;
    }, close(stream) {
      if (FS.isClosed(stream)) {
        throw new FS.ErrnoError(8);
      }
      if (stream.getdents) stream.getdents = null;
      try {
        if (stream.stream_ops.close) {
          stream.stream_ops.close(stream);
        }
      } catch (e) {
        throw e;
      } finally {
        FS.closeStream(stream.fd);
      }
      stream.fd = null;
    }, isClosed(stream) {
      return stream.fd === null;
    }, llseek(stream, offset, whence) {
      if (FS.isClosed(stream)) {
        throw new FS.ErrnoError(8);
      }
      if (!stream.seekable || !stream.stream_ops.llseek) {
        throw new FS.ErrnoError(70);
      }
      if (whence != 0 && whence != 1 && whence != 2) {
        throw new FS.ErrnoError(28);
      }
      stream.position = stream.stream_ops.llseek(stream, offset, whence);
      stream.ungotten = [];
      return stream.position;
    }, read(stream, buffer, offset, length, position) {
      if (length < 0 || position < 0) {
        throw new FS.ErrnoError(28);
      }
      if (FS.isClosed(stream)) {
        throw new FS.ErrnoError(8);
      }
      if ((stream.flags & 2097155) === 1) {
        throw new FS.ErrnoError(8);
      }
      if (FS.isDir(stream.node.mode)) {
        throw new FS.ErrnoError(31);
      }
      if (!stream.stream_ops.read) {
        throw new FS.ErrnoError(28);
      }
      var seeking = typeof position != "undefined";
      if (!seeking) {
        position = stream.position;
      } else if (!stream.seekable) {
        throw new FS.ErrnoError(70);
      }
      var bytesRead = stream.stream_ops.read(stream, buffer, offset, length, position);
      if (!seeking) stream.position += bytesRead;
      return bytesRead;
    }, write(stream, buffer, offset, length, position, canOwn) {
      if (length < 0 || position < 0) {
        throw new FS.ErrnoError(28);
      }
      if (FS.isClosed(stream)) {
        throw new FS.ErrnoError(8);
      }
      if ((stream.flags & 2097155) === 0) {
        throw new FS.ErrnoError(8);
      }
      if (FS.isDir(stream.node.mode)) {
        throw new FS.ErrnoError(31);
      }
      if (!stream.stream_ops.write) {
        throw new FS.ErrnoError(28);
      }
      if (stream.seekable && stream.flags & 1024) {
        FS.llseek(stream, 0, 2);
      }
      var seeking = typeof position != "undefined";
      if (!seeking) {
        position = stream.position;
      } else if (!stream.seekable) {
        throw new FS.ErrnoError(70);
      }
      var bytesWritten = stream.stream_ops.write(stream, buffer, offset, length, position, canOwn);
      if (!seeking) stream.position += bytesWritten;
      return bytesWritten;
    }, mmap(stream, length, position, prot, flags) {
      if ((prot & 2) !== 0 && (flags & 2) === 0 && (stream.flags & 2097155) !== 2) {
        throw new FS.ErrnoError(2);
      }
      if ((stream.flags & 2097155) === 1) {
        throw new FS.ErrnoError(2);
      }
      if (!stream.stream_ops.mmap) {
        throw new FS.ErrnoError(43);
      }
      if (!length) {
        throw new FS.ErrnoError(28);
      }
      return stream.stream_ops.mmap(stream, length, position, prot, flags);
    }, msync(stream, buffer, offset, length, mmapFlags) {
      if (!stream.stream_ops.msync) {
        return 0;
      }
      return stream.stream_ops.msync(stream, buffer, offset, length, mmapFlags);
    }, ioctl(stream, cmd, arg) {
      if (!stream.stream_ops.ioctl) {
        throw new FS.ErrnoError(59);
      }
      return stream.stream_ops.ioctl(stream, cmd, arg);
    }, readFile(path, opts = {}) {
      opts.flags = opts.flags || 0;
      opts.encoding = opts.encoding || "binary";
      if (opts.encoding !== "utf8" && opts.encoding !== "binary") {
        throw new Error(`Invalid encoding type "${opts.encoding}"`);
      }
      var stream = FS.open(path, opts.flags);
      var stat = FS.stat(path);
      var length = stat.size;
      var buf = new Uint8Array(length);
      FS.read(stream, buf, 0, length, 0);
      if (opts.encoding === "utf8") {
        buf = UTF8ArrayToString(buf);
      }
      FS.close(stream);
      return buf;
    }, writeFile(path, data, opts = {}) {
      opts.flags = opts.flags || 577;
      var stream = FS.open(path, opts.flags, opts.mode);
      if (typeof data == "string") {
        data = new Uint8Array(intArrayFromString(data, true));
      }
      if (ArrayBuffer.isView(data)) {
        FS.write(stream, data, 0, data.byteLength, void 0, opts.canOwn);
      } else {
        throw new Error("Unsupported data type");
      }
      FS.close(stream);
    }, cwd: () => FS.currentPath, chdir(path) {
      var lookup = FS.lookupPath(path, { follow: true });
      if (lookup.node === null) {
        throw new FS.ErrnoError(44);
      }
      if (!FS.isDir(lookup.node.mode)) {
        throw new FS.ErrnoError(54);
      }
      var errCode = FS.nodePermissions(lookup.node, "x");
      if (errCode) {
        throw new FS.ErrnoError(errCode);
      }
      FS.currentPath = lookup.path;
    }, createDefaultDirectories() {
      FS.mkdir("/tmp");
      FS.mkdir("/home");
      FS.mkdir("/home/web_user");
    }, createDefaultDevices() {
      FS.mkdir("/dev");
      FS.registerDevice(FS.makedev(1, 3), { read: () => 0, write: (stream, buffer, offset, length, pos) => length, llseek: () => 0 });
      FS.mkdev("/dev/null", FS.makedev(1, 3));
      TTY.register(FS.makedev(5, 0), TTY.default_tty_ops);
      TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops);
      FS.mkdev("/dev/tty", FS.makedev(5, 0));
      FS.mkdev("/dev/tty1", FS.makedev(6, 0));
      var randomBuffer = new Uint8Array(1024), randomLeft = 0;
      var randomByte = () => {
        if (randomLeft === 0) {
          randomFill(randomBuffer);
          randomLeft = randomBuffer.byteLength;
        }
        return randomBuffer[--randomLeft];
      };
      FS.createDevice("/dev", "random", randomByte);
      FS.createDevice("/dev", "urandom", randomByte);
      FS.mkdir("/dev/shm");
      FS.mkdir("/dev/shm/tmp");
    }, createSpecialDirectories() {
      FS.mkdir("/proc");
      var proc_self = FS.mkdir("/proc/self");
      FS.mkdir("/proc/self/fd");
      FS.mount({ mount() {
        var node = FS.createNode(proc_self, "fd", 16895, 73);
        node.stream_ops = { llseek: MEMFS.stream_ops.llseek };
        node.node_ops = { lookup(parent, name) {
          var fd = +name;
          var stream = FS.getStreamChecked(fd);
          var ret = { parent: null, mount: { mountpoint: "fake" }, node_ops: { readlink: () => stream.path }, id: fd + 1 };
          ret.parent = ret;
          return ret;
        }, readdir() {
          return Array.from(FS.streams.entries()).filter(([k2, v]) => v).map(([k2, v]) => k2.toString());
        } };
        return node;
      } }, {}, "/proc/self/fd");
    }, createStandardStreams(input, output, error) {
      if (input) {
        FS.createDevice("/dev", "stdin", input);
      } else {
        FS.symlink("/dev/tty", "/dev/stdin");
      }
      if (output) {
        FS.createDevice("/dev", "stdout", null, output);
      } else {
        FS.symlink("/dev/tty", "/dev/stdout");
      }
      if (error) {
        FS.createDevice("/dev", "stderr", null, error);
      } else {
        FS.symlink("/dev/tty1", "/dev/stderr");
      }
      var stdin = FS.open("/dev/stdin", 0);
      var stdout = FS.open("/dev/stdout", 1);
      var stderr = FS.open("/dev/stderr", 1);
    }, staticInit() {
      FS.nameTable = new Array(4096);
      FS.mount(MEMFS, {}, "/");
      FS.createDefaultDirectories();
      FS.createDefaultDevices();
      FS.createSpecialDirectories();
      FS.filesystems = { MEMFS };
    }, init(input, output, error) {
      FS.initialized = true;
      input ??= Module2["stdin"];
      output ??= Module2["stdout"];
      error ??= Module2["stderr"];
      FS.createStandardStreams(input, output, error);
    }, quit() {
      FS.initialized = false;
      for (var stream of FS.streams) {
        if (stream) {
          FS.close(stream);
        }
      }
    }, findObject(path, dontResolveLastLink) {
      var ret = FS.analyzePath(path, dontResolveLastLink);
      if (!ret.exists) {
        return null;
      }
      return ret.object;
    }, analyzePath(path, dontResolveLastLink) {
      try {
        var lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
        path = lookup.path;
      } catch (e) {
      }
      var ret = { isRoot: false, exists: false, error: 0, name: null, path: null, object: null, parentExists: false, parentPath: null, parentObject: null };
      try {
        var lookup = FS.lookupPath(path, { parent: true });
        ret.parentExists = true;
        ret.parentPath = lookup.path;
        ret.parentObject = lookup.node;
        ret.name = PATH.basename(path);
        lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
        ret.exists = true;
        ret.path = lookup.path;
        ret.object = lookup.node;
        ret.name = lookup.node.name;
        ret.isRoot = lookup.path === "/";
      } catch (e) {
        ret.error = e.errno;
      }
      return ret;
    }, createPath(parent, path, canRead, canWrite) {
      parent = typeof parent == "string" ? parent : FS.getPath(parent);
      var parts = path.split("/").reverse();
      while (parts.length) {
        var part = parts.pop();
        if (!part) continue;
        var current = PATH.join2(parent, part);
        try {
          FS.mkdir(current);
        } catch (e) {
          if (e.errno != 20) throw e;
        }
        parent = current;
      }
      return current;
    }, createFile(parent, name, properties, canRead, canWrite) {
      var path = PATH.join2(typeof parent == "string" ? parent : FS.getPath(parent), name);
      var mode = FS_getMode(canRead, canWrite);
      return FS.create(path, mode);
    }, createDataFile(parent, name, data, canRead, canWrite, canOwn) {
      var path = name;
      if (parent) {
        parent = typeof parent == "string" ? parent : FS.getPath(parent);
        path = name ? PATH.join2(parent, name) : parent;
      }
      var mode = FS_getMode(canRead, canWrite);
      var node = FS.create(path, mode);
      if (data) {
        if (typeof data == "string") {
          var arr = new Array(data.length);
          for (var i = 0, len = data.length; i < len; ++i) arr[i] = data.charCodeAt(i);
          data = arr;
        }
        FS.chmod(node, mode | 146);
        var stream = FS.open(node, 577);
        FS.write(stream, data, 0, data.length, 0, canOwn);
        FS.close(stream);
        FS.chmod(node, mode);
      }
    }, createDevice(parent, name, input, output) {
      var path = PATH.join2(typeof parent == "string" ? parent : FS.getPath(parent), name);
      var mode = FS_getMode(!!input, !!output);
      FS.createDevice.major ??= 64;
      var dev = FS.makedev(FS.createDevice.major++, 0);
      FS.registerDevice(dev, { open(stream) {
        stream.seekable = false;
      }, close(stream) {
        if (output?.buffer?.length) {
          output(10);
        }
      }, read(stream, buffer, offset, length, pos) {
        var bytesRead = 0;
        for (var i = 0; i < length; i++) {
          var result;
          try {
            result = input();
          } catch (e) {
            throw new FS.ErrnoError(29);
          }
          if (result === void 0 && bytesRead === 0) {
            throw new FS.ErrnoError(6);
          }
          if (result === null || result === void 0) break;
          bytesRead++;
          buffer[offset + i] = result;
        }
        if (bytesRead) {
          stream.node.atime = Date.now();
        }
        return bytesRead;
      }, write(stream, buffer, offset, length, pos) {
        for (var i = 0; i < length; i++) {
          try {
            output(buffer[offset + i]);
          } catch (e) {
            throw new FS.ErrnoError(29);
          }
        }
        if (length) {
          stream.node.mtime = stream.node.ctime = Date.now();
        }
        return i;
      } });
      return FS.mkdev(path, mode, dev);
    }, forceLoadFile(obj) {
      if (obj.isDevice || obj.isFolder || obj.link || obj.contents) return true;
      if (typeof XMLHttpRequest != "undefined") {
        throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");
      } else {
        try {
          obj.contents = readBinary(obj.url);
          obj.usedBytes = obj.contents.length;
        } catch (e) {
          throw new FS.ErrnoError(29);
        }
      }
    }, createLazyFile(parent, name, url, canRead, canWrite) {
      class LazyUint8Array {
        lengthKnown = false;
        chunks = [];
        get(idx) {
          if (idx > this.length - 1 || idx < 0) {
            return void 0;
          }
          var chunkOffset = idx % this.chunkSize;
          var chunkNum = idx / this.chunkSize | 0;
          return this.getter(chunkNum)[chunkOffset];
        }
        setDataGetter(getter) {
          this.getter = getter;
        }
        cacheLength() {
          var xhr = new XMLHttpRequest();
          xhr.open("HEAD", url, false);
          xhr.send(null);
          if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
          var datalength = Number(xhr.getResponseHeader("Content-length"));
          var header;
          var hasByteServing = (header = xhr.getResponseHeader("Accept-Ranges")) && header === "bytes";
          var usesGzip = (header = xhr.getResponseHeader("Content-Encoding")) && header === "gzip";
          var chunkSize = 1024 * 1024;
          if (!hasByteServing) chunkSize = datalength;
          var doXHR = (from, to2) => {
            if (from > to2) throw new Error("invalid range (" + from + ", " + to2 + ") or no bytes requested!");
            if (to2 > datalength - 1) throw new Error("only " + datalength + " bytes available! programmer error!");
            var xhr2 = new XMLHttpRequest();
            xhr2.open("GET", url, false);
            if (datalength !== chunkSize) xhr2.setRequestHeader("Range", "bytes=" + from + "-" + to2);
            xhr2.responseType = "arraybuffer";
            if (xhr2.overrideMimeType) {
              xhr2.overrideMimeType("text/plain; charset=x-user-defined");
            }
            xhr2.send(null);
            if (!(xhr2.status >= 200 && xhr2.status < 300 || xhr2.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr2.status);
            if (xhr2.response !== void 0) {
              return new Uint8Array(xhr2.response || []);
            }
            return intArrayFromString(xhr2.responseText || "", true);
          };
          var lazyArray2 = this;
          lazyArray2.setDataGetter((chunkNum) => {
            var start = chunkNum * chunkSize;
            var end = (chunkNum + 1) * chunkSize - 1;
            end = Math.min(end, datalength - 1);
            if (typeof lazyArray2.chunks[chunkNum] == "undefined") {
              lazyArray2.chunks[chunkNum] = doXHR(start, end);
            }
            if (typeof lazyArray2.chunks[chunkNum] == "undefined") throw new Error("doXHR failed!");
            return lazyArray2.chunks[chunkNum];
          });
          if (usesGzip || !datalength) {
            chunkSize = datalength = 1;
            datalength = this.getter(0).length;
            chunkSize = datalength;
            out("LazyFiles on gzip forces download of the whole file when length is accessed");
          }
          this._length = datalength;
          this._chunkSize = chunkSize;
          this.lengthKnown = true;
        }
        get length() {
          if (!this.lengthKnown) {
            this.cacheLength();
          }
          return this._length;
        }
        get chunkSize() {
          if (!this.lengthKnown) {
            this.cacheLength();
          }
          return this._chunkSize;
        }
      }
      if (typeof XMLHttpRequest != "undefined") {
        if (!ENVIRONMENT_IS_WORKER) throw "Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc";
        var lazyArray = new LazyUint8Array();
        var properties = { isDevice: false, contents: lazyArray };
      } else {
        var properties = { isDevice: false, url };
      }
      var node = FS.createFile(parent, name, properties, canRead, canWrite);
      if (properties.contents) {
        node.contents = properties.contents;
      } else if (properties.url) {
        node.contents = null;
        node.url = properties.url;
      }
      Object.defineProperties(node, { usedBytes: { get: function() {
        return this.contents.length;
      } } });
      var stream_ops = {};
      var keys = Object.keys(node.stream_ops);
      keys.forEach((key) => {
        var fn = node.stream_ops[key];
        stream_ops[key] = (...args) => {
          FS.forceLoadFile(node);
          return fn(...args);
        };
      });
      function writeChunks(stream, buffer, offset, length, position) {
        var contents = stream.node.contents;
        if (position >= contents.length) return 0;
        var size = Math.min(contents.length - position, length);
        if (contents.slice) {
          for (var i = 0; i < size; i++) {
            buffer[offset + i] = contents[position + i];
          }
        } else {
          for (var i = 0; i < size; i++) {
            buffer[offset + i] = contents.get(position + i);
          }
        }
        return size;
      }
      stream_ops.read = (stream, buffer, offset, length, position) => {
        FS.forceLoadFile(node);
        return writeChunks(stream, buffer, offset, length, position);
      };
      stream_ops.mmap = (stream, length, position, prot, flags) => {
        FS.forceLoadFile(node);
        var ptr = mmapAlloc(length);
        if (!ptr) {
          throw new FS.ErrnoError(48);
        }
        writeChunks(stream, HEAP8, ptr, length, position);
        return { ptr, allocated: true };
      };
      node.stream_ops = stream_ops;
      return node;
    } };
    var UTF8ToString = (ptr, maxBytesToRead) => ptr ? UTF8ArrayToString(HEAPU8, ptr, maxBytesToRead) : "";
    var SYSCALLS = { DEFAULT_POLLMASK: 5, calculateAt(dirfd, path, allowEmpty) {
      if (PATH.isAbs(path)) {
        return path;
      }
      var dir;
      if (dirfd === -100) {
        dir = FS.cwd();
      } else {
        var dirstream = SYSCALLS.getStreamFromFD(dirfd);
        dir = dirstream.path;
      }
      if (path.length == 0) {
        if (!allowEmpty) {
          throw new FS.ErrnoError(44);
        }
        return dir;
      }
      return dir + "/" + path;
    }, writeStat(buf, stat) {
      HEAP32[buf >> 2] = stat.dev;
      HEAP32[buf + 4 >> 2] = stat.mode;
      HEAPU32[buf + 8 >> 2] = stat.nlink;
      HEAP32[buf + 12 >> 2] = stat.uid;
      HEAP32[buf + 16 >> 2] = stat.gid;
      HEAP32[buf + 20 >> 2] = stat.rdev;
      HEAP64[buf + 24 >> 3] = BigInt(stat.size);
      HEAP32[buf + 32 >> 2] = 4096;
      HEAP32[buf + 36 >> 2] = stat.blocks;
      var atime = stat.atime.getTime();
      var mtime = stat.mtime.getTime();
      var ctime = stat.ctime.getTime();
      HEAP64[buf + 40 >> 3] = BigInt(Math.floor(atime / 1e3));
      HEAPU32[buf + 48 >> 2] = atime % 1e3 * 1e3 * 1e3;
      HEAP64[buf + 56 >> 3] = BigInt(Math.floor(mtime / 1e3));
      HEAPU32[buf + 64 >> 2] = mtime % 1e3 * 1e3 * 1e3;
      HEAP64[buf + 72 >> 3] = BigInt(Math.floor(ctime / 1e3));
      HEAPU32[buf + 80 >> 2] = ctime % 1e3 * 1e3 * 1e3;
      HEAP64[buf + 88 >> 3] = BigInt(stat.ino);
      return 0;
    }, writeStatFs(buf, stats) {
      HEAP32[buf + 4 >> 2] = stats.bsize;
      HEAP32[buf + 40 >> 2] = stats.bsize;
      HEAP32[buf + 8 >> 2] = stats.blocks;
      HEAP32[buf + 12 >> 2] = stats.bfree;
      HEAP32[buf + 16 >> 2] = stats.bavail;
      HEAP32[buf + 20 >> 2] = stats.files;
      HEAP32[buf + 24 >> 2] = stats.ffree;
      HEAP32[buf + 28 >> 2] = stats.fsid;
      HEAP32[buf + 44 >> 2] = stats.flags;
      HEAP32[buf + 36 >> 2] = stats.namelen;
    }, doMsync(addr, stream, len, flags, offset) {
      if (!FS.isFile(stream.node.mode)) {
        throw new FS.ErrnoError(43);
      }
      if (flags & 2) {
        return 0;
      }
      var buffer = HEAPU8.slice(addr, addr + len);
      FS.msync(stream, buffer, offset, len, flags);
    }, getStreamFromFD(fd) {
      var stream = FS.getStreamChecked(fd);
      return stream;
    }, varargs: void 0, getStr(ptr) {
      var ret = UTF8ToString(ptr);
      return ret;
    } };
    function ___syscall_fcntl64(fd, cmd, varargs) {
      SYSCALLS.varargs = varargs;
      try {
        var stream = SYSCALLS.getStreamFromFD(fd);
        switch (cmd) {
          case 0: {
            var arg = syscallGetVarargI();
            if (arg < 0) {
              return -28;
            }
            while (FS.streams[arg]) {
              arg++;
            }
            var newStream;
            newStream = FS.dupStream(stream, arg);
            return newStream.fd;
          }
          case 1:
          case 2:
            return 0;
          case 3:
            return stream.flags;
          case 4: {
            var arg = syscallGetVarargI();
            stream.flags |= arg;
            return 0;
          }
          case 12: {
            var arg = syscallGetVarargP();
            var offset = 0;
            HEAP16[arg + offset >> 1] = 2;
            return 0;
          }
          case 13:
          case 14:
            return 0;
        }
        return -28;
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
        return -e.errno;
      }
    }
    var stringToUTF8 = (str, outPtr, maxBytesToWrite) => stringToUTF8Array(str, HEAPU8, outPtr, maxBytesToWrite);
    function ___syscall_getdents64(fd, dirp, count) {
      try {
        var stream = SYSCALLS.getStreamFromFD(fd);
        stream.getdents ||= FS.readdir(stream.path);
        var struct_size = 280;
        var pos = 0;
        var off = FS.llseek(stream, 0, 1);
        var startIdx = Math.floor(off / struct_size);
        var endIdx = Math.min(stream.getdents.length, startIdx + Math.floor(count / struct_size));
        for (var idx = startIdx; idx < endIdx; idx++) {
          var id;
          var type;
          var name = stream.getdents[idx];
          if (name === ".") {
            id = stream.node.id;
            type = 4;
          } else if (name === "..") {
            var lookup = FS.lookupPath(stream.path, { parent: true });
            id = lookup.node.id;
            type = 4;
          } else {
            var child;
            try {
              child = FS.lookupNode(stream.node, name);
            } catch (e) {
              if (e?.errno === 28) {
                continue;
              }
              throw e;
            }
            id = child.id;
            type = FS.isChrdev(child.mode) ? 2 : FS.isDir(child.mode) ? 4 : FS.isLink(child.mode) ? 10 : 8;
          }
          HEAP64[dirp + pos >> 3] = BigInt(id);
          HEAP64[dirp + pos + 8 >> 3] = BigInt((idx + 1) * struct_size);
          HEAP16[dirp + pos + 16 >> 1] = 280;
          HEAP8[dirp + pos + 18] = type;
          stringToUTF8(name, dirp + pos + 19, 256);
          pos += struct_size;
        }
        FS.llseek(stream, idx * struct_size, 0);
        return pos;
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
        return -e.errno;
      }
    }
    function ___syscall_ioctl(fd, op, varargs) {
      SYSCALLS.varargs = varargs;
      try {
        var stream = SYSCALLS.getStreamFromFD(fd);
        switch (op) {
          case 21509: {
            if (!stream.tty) return -59;
            return 0;
          }
          case 21505: {
            if (!stream.tty) return -59;
            if (stream.tty.ops.ioctl_tcgets) {
              var termios = stream.tty.ops.ioctl_tcgets(stream);
              var argp = syscallGetVarargP();
              HEAP32[argp >> 2] = termios.c_iflag || 0;
              HEAP32[argp + 4 >> 2] = termios.c_oflag || 0;
              HEAP32[argp + 8 >> 2] = termios.c_cflag || 0;
              HEAP32[argp + 12 >> 2] = termios.c_lflag || 0;
              for (var i = 0; i < 32; i++) {
                HEAP8[argp + i + 17] = termios.c_cc[i] || 0;
              }
              return 0;
            }
            return 0;
          }
          case 21510:
          case 21511:
          case 21512: {
            if (!stream.tty) return -59;
            return 0;
          }
          case 21506:
          case 21507:
          case 21508: {
            if (!stream.tty) return -59;
            if (stream.tty.ops.ioctl_tcsets) {
              var argp = syscallGetVarargP();
              var c_iflag = HEAP32[argp >> 2];
              var c_oflag = HEAP32[argp + 4 >> 2];
              var c_cflag = HEAP32[argp + 8 >> 2];
              var c_lflag = HEAP32[argp + 12 >> 2];
              var c_cc = [];
              for (var i = 0; i < 32; i++) {
                c_cc.push(HEAP8[argp + i + 17]);
              }
              return stream.tty.ops.ioctl_tcsets(stream.tty, op, { c_iflag, c_oflag, c_cflag, c_lflag, c_cc });
            }
            return 0;
          }
          case 21519: {
            if (!stream.tty) return -59;
            var argp = syscallGetVarargP();
            HEAP32[argp >> 2] = 0;
            return 0;
          }
          case 21520: {
            if (!stream.tty) return -59;
            return -28;
          }
          case 21531: {
            var argp = syscallGetVarargP();
            return FS.ioctl(stream, op, argp);
          }
          case 21523: {
            if (!stream.tty) return -59;
            if (stream.tty.ops.ioctl_tiocgwinsz) {
              var winsize = stream.tty.ops.ioctl_tiocgwinsz(stream.tty);
              var argp = syscallGetVarargP();
              HEAP16[argp >> 1] = winsize[0];
              HEAP16[argp + 2 >> 1] = winsize[1];
            }
            return 0;
          }
          case 21524: {
            if (!stream.tty) return -59;
            return 0;
          }
          case 21515: {
            if (!stream.tty) return -59;
            return 0;
          }
          default:
            return -28;
        }
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
        return -e.errno;
      }
    }
    function ___syscall_openat(dirfd, path, flags, varargs) {
      SYSCALLS.varargs = varargs;
      try {
        path = SYSCALLS.getStr(path);
        path = SYSCALLS.calculateAt(dirfd, path);
        var mode = varargs ? syscallGetVarargI() : 0;
        return FS.open(path, flags, mode).fd;
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
        return -e.errno;
      }
    }
    function ___syscall_rmdir(path) {
      try {
        path = SYSCALLS.getStr(path);
        FS.rmdir(path);
        return 0;
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
        return -e.errno;
      }
    }
    function ___syscall_stat64(path, buf) {
      try {
        path = SYSCALLS.getStr(path);
        return SYSCALLS.writeStat(buf, FS.stat(path));
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
        return -e.errno;
      }
    }
    function ___syscall_unlinkat(dirfd, path, flags) {
      try {
        path = SYSCALLS.getStr(path);
        path = SYSCALLS.calculateAt(dirfd, path);
        if (!flags) {
          FS.unlink(path);
        } else if (flags === 512) {
          FS.rmdir(path);
        } else {
          return -28;
        }
        return 0;
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
        return -e.errno;
      }
    }
    var _emscripten_get_now = () => performance.now();
    var _emscripten_date_now = () => Date.now();
    var nowIsMonotonic = 1;
    var checkWasiClock = (clock_id) => clock_id >= 0 && clock_id <= 3;
    var INT53_MAX = 9007199254740992;
    var INT53_MIN = -9007199254740992;
    var bigintToI53Checked = (num) => num < INT53_MIN || num > INT53_MAX ? NaN : Number(num);
    function _clock_time_get(clk_id, ignored_precision, ptime) {
      ignored_precision = bigintToI53Checked(ignored_precision);
      if (!checkWasiClock(clk_id)) {
        return 28;
      }
      var now;
      if (clk_id === 0) {
        now = _emscripten_date_now();
      } else if (nowIsMonotonic) {
        now = _emscripten_get_now();
      } else {
        return 52;
      }
      var nsec = Math.round(now * 1e3 * 1e3);
      HEAP64[ptime >> 3] = BigInt(nsec);
      return 0;
    }
    var getHeapMax = () => 2147483648;
    var alignMemory = (size, alignment) => Math.ceil(size / alignment) * alignment;
    var growMemory = (size) => {
      var b = wasmMemory.buffer;
      var pages = (size - b.byteLength + 65535) / 65536 | 0;
      try {
        wasmMemory.grow(pages);
        updateMemoryViews();
        return 1;
      } catch (e) {
      }
    };
    var _emscripten_resize_heap = (requestedSize) => {
      var oldSize = HEAPU8.length;
      requestedSize >>>= 0;
      var maxHeapSize = getHeapMax();
      if (requestedSize > maxHeapSize) {
        return false;
      }
      for (var cutDown = 1; cutDown <= 4; cutDown *= 2) {
        var overGrownHeapSize = oldSize * (1 + 0.2 / cutDown);
        overGrownHeapSize = Math.min(overGrownHeapSize, requestedSize + 100663296);
        var newSize = Math.min(maxHeapSize, alignMemory(Math.max(requestedSize, overGrownHeapSize), 65536));
        var replacement = growMemory(newSize);
        if (replacement) {
          return true;
        }
      }
      return false;
    };
    var ENV = {};
    var getExecutableName = () => thisProgram || "./this.program";
    var getEnvStrings = () => {
      if (!getEnvStrings.strings) {
        var lang = (typeof navigator == "object" && navigator.language || "C").replace("-", "_") + ".UTF-8";
        var env = { USER: "web_user", LOGNAME: "web_user", PATH: "/", PWD: "/", HOME: "/home/web_user", LANG: lang, _: getExecutableName() };
        for (var x in ENV) {
          if (ENV[x] === void 0) delete env[x];
          else env[x] = ENV[x];
        }
        var strings = [];
        for (var x in env) {
          strings.push(`${x}=${env[x]}`);
        }
        getEnvStrings.strings = strings;
      }
      return getEnvStrings.strings;
    };
    var _environ_get = (__environ, environ_buf) => {
      var bufSize = 0;
      var envp = 0;
      for (var string of getEnvStrings()) {
        var ptr = environ_buf + bufSize;
        HEAPU32[__environ + envp >> 2] = ptr;
        bufSize += stringToUTF8(string, ptr, Infinity) + 1;
        envp += 4;
      }
      return 0;
    };
    var _environ_sizes_get = (penviron_count, penviron_buf_size) => {
      var strings = getEnvStrings();
      HEAPU32[penviron_count >> 2] = strings.length;
      var bufSize = 0;
      for (var string of strings) {
        bufSize += lengthBytesUTF8(string) + 1;
      }
      HEAPU32[penviron_buf_size >> 2] = bufSize;
      return 0;
    };
    var runtimeKeepaliveCounter = 0;
    var keepRuntimeAlive = () => noExitRuntime || runtimeKeepaliveCounter > 0;
    var _proc_exit = (code) => {
      EXITSTATUS = code;
      if (!keepRuntimeAlive()) {
        Module2["onExit"]?.(code);
        ABORT = true;
      }
      quit_(code, new ExitStatus(code));
    };
    var exitJS = (status2, implicit) => {
      EXITSTATUS = status2;
      _proc_exit(status2);
    };
    var _exit = exitJS;
    function _fd_close(fd) {
      try {
        var stream = SYSCALLS.getStreamFromFD(fd);
        FS.close(stream);
        return 0;
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
        return e.errno;
      }
    }
    var doReadv = (stream, iov, iovcnt, offset) => {
      var ret = 0;
      for (var i = 0; i < iovcnt; i++) {
        var ptr = HEAPU32[iov >> 2];
        var len = HEAPU32[iov + 4 >> 2];
        iov += 8;
        var curr = FS.read(stream, HEAP8, ptr, len, offset);
        if (curr < 0) return -1;
        ret += curr;
        if (curr < len) break;
        if (typeof offset != "undefined") {
          offset += curr;
        }
      }
      return ret;
    };
    function _fd_read(fd, iov, iovcnt, pnum) {
      try {
        var stream = SYSCALLS.getStreamFromFD(fd);
        var num = doReadv(stream, iov, iovcnt);
        HEAPU32[pnum >> 2] = num;
        return 0;
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
        return e.errno;
      }
    }
    function _fd_seek(fd, offset, whence, newOffset) {
      offset = bigintToI53Checked(offset);
      try {
        if (isNaN(offset)) return 61;
        var stream = SYSCALLS.getStreamFromFD(fd);
        FS.llseek(stream, offset, whence);
        HEAP64[newOffset >> 3] = BigInt(stream.position);
        if (stream.getdents && offset === 0 && whence === 0) stream.getdents = null;
        return 0;
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
        return e.errno;
      }
    }
    var doWritev = (stream, iov, iovcnt, offset) => {
      var ret = 0;
      for (var i = 0; i < iovcnt; i++) {
        var ptr = HEAPU32[iov >> 2];
        var len = HEAPU32[iov + 4 >> 2];
        iov += 8;
        var curr = FS.write(stream, HEAP8, ptr, len, offset);
        if (curr < 0) return -1;
        ret += curr;
        if (curr < len) {
          break;
        }
        if (typeof offset != "undefined") {
          offset += curr;
        }
      }
      return ret;
    };
    function _fd_write(fd, iov, iovcnt, pnum) {
      try {
        var stream = SYSCALLS.getStreamFromFD(fd);
        var num = doWritev(stream, iov, iovcnt);
        HEAPU32[pnum >> 2] = num;
        return 0;
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
        return e.errno;
      }
    }
    var getCFunc = (ident) => {
      var func = Module2["_" + ident];
      return func;
    };
    var writeArrayToMemory = (array, buffer) => {
      HEAP8.set(array, buffer);
    };
    var stackAlloc = (sz) => __emscripten_stack_alloc(sz);
    var stringToUTF8OnStack = (str) => {
      var size = lengthBytesUTF8(str) + 1;
      var ret = stackAlloc(size);
      stringToUTF8(str, ret, size);
      return ret;
    };
    var ccall = (ident, returnType, argTypes, args, opts) => {
      var toC = { string: (str) => {
        var ret2 = 0;
        if (str !== null && str !== void 0 && str !== 0) {
          ret2 = stringToUTF8OnStack(str);
        }
        return ret2;
      }, array: (arr) => {
        var ret2 = stackAlloc(arr.length);
        writeArrayToMemory(arr, ret2);
        return ret2;
      } };
      function convertReturnValue(ret2) {
        if (returnType === "string") {
          return UTF8ToString(ret2);
        }
        if (returnType === "boolean") return Boolean(ret2);
        return ret2;
      }
      var func = getCFunc(ident);
      var cArgs = [];
      var stack = 0;
      if (args) {
        for (var i = 0; i < args.length; i++) {
          var converter = toC[argTypes[i]];
          if (converter) {
            if (stack === 0) stack = stackSave();
            cArgs[i] = converter(args[i]);
          } else {
            cArgs[i] = args[i];
          }
        }
      }
      var ret = func(...cArgs);
      function onDone(ret2) {
        if (stack !== 0) stackRestore(stack);
        return convertReturnValue(ret2);
      }
      ret = onDone(ret);
      return ret;
    };
    var cwrap = (ident, returnType, argTypes, opts) => {
      var numericArgs = !argTypes || argTypes.every((type) => type === "number" || type === "boolean");
      var numericRet = returnType !== "string";
      if (numericRet && numericArgs && !opts) {
        return getCFunc(ident);
      }
      return (...args) => ccall(ident, returnType, argTypes, args, opts);
    };
    var FS_createPath = (...args) => FS.createPath(...args);
    var FS_unlink = (...args) => FS.unlink(...args);
    var FS_createLazyFile = (...args) => FS.createLazyFile(...args);
    var FS_createDevice = (...args) => FS.createDevice(...args);
    FS.createPreloadedFile = FS_createPreloadedFile;
    FS.staticInit();
    MEMFS.doesNotExistError = new FS.ErrnoError(44);
    MEMFS.doesNotExistError.stack = "<generic error, no stack>";
    {
      if (Module2["noExitRuntime"]) noExitRuntime = Module2["noExitRuntime"];
      if (Module2["preloadPlugins"]) preloadPlugins = Module2["preloadPlugins"];
      if (Module2["print"]) out = Module2["print"];
      if (Module2["printErr"]) err = Module2["printErr"];
      if (Module2["wasmBinary"]) wasmBinary = Module2["wasmBinary"];
      if (Module2["arguments"]) arguments_ = Module2["arguments"];
      if (Module2["thisProgram"]) thisProgram = Module2["thisProgram"];
    }
    Module2["addRunDependency"] = addRunDependency;
    Module2["removeRunDependency"] = removeRunDependency;
    Module2["ccall"] = ccall;
    Module2["cwrap"] = cwrap;
    Module2["setValue"] = setValue;
    Module2["getValue"] = getValue;
    Module2["UTF8ToString"] = UTF8ToString;
    Module2["stringToUTF8"] = stringToUTF8;
    Module2["lengthBytesUTF8"] = lengthBytesUTF8;
    Module2["FS_createPreloadedFile"] = FS_createPreloadedFile;
    Module2["FS_unlink"] = FS_unlink;
    Module2["FS_createPath"] = FS_createPath;
    Module2["FS_createDevice"] = FS_createDevice;
    Module2["FS"] = FS;
    Module2["FS_createDataFile"] = FS_createDataFile;
    Module2["FS_createLazyFile"] = FS_createLazyFile;
    var _espeak_ListVoices, _espeak_TextToPhonemesWithTerminator, _espeak_Initialize, _espeak_SetVoiceByName, _espeak_Terminate, _malloc, _free, __emscripten_stack_restore, __emscripten_stack_alloc, _emscripten_stack_get_current;
    function assignWasmExports(wasmExports2) {
      Module2["_espeak_ListVoices"] = _espeak_ListVoices = wasmExports2["t"];
      Module2["_espeak_TextToPhonemesWithTerminator"] = _espeak_TextToPhonemesWithTerminator = wasmExports2["u"];
      Module2["_espeak_Initialize"] = _espeak_Initialize = wasmExports2["v"];
      Module2["_espeak_SetVoiceByName"] = _espeak_SetVoiceByName = wasmExports2["w"];
      Module2["_espeak_Terminate"] = _espeak_Terminate = wasmExports2["x"];
      Module2["_malloc"] = _malloc = wasmExports2["y"];
      Module2["_free"] = _free = wasmExports2["z"];
      __emscripten_stack_restore = wasmExports2["A"];
      __emscripten_stack_alloc = wasmExports2["B"];
      _emscripten_stack_get_current = wasmExports2["C"];
    }
    var wasmImports = { c: ___syscall_fcntl64, l: ___syscall_getdents64, g: ___syscall_ioctl, d: ___syscall_openat, m: ___syscall_rmdir, h: ___syscall_stat64, n: ___syscall_unlinkat, o: _clock_time_get, i: _emscripten_date_now, p: _emscripten_resize_heap, j: _environ_get, k: _environ_sizes_get, q: _exit, a: _fd_close, e: _fd_read, f: _fd_seek, b: _fd_write };
    var wasmExports = await createWasm();
    function run() {
      if (runDependencies > 0) {
        dependenciesFulfilled = run;
        return;
      }
      preRun();
      if (runDependencies > 0) {
        dependenciesFulfilled = run;
        return;
      }
      function doRun() {
        Module2["calledRun"] = true;
        if (ABORT) return;
        initRuntime();
        readyPromiseResolve?.(Module2);
        Module2["onRuntimeInitialized"]?.();
        postRun();
      }
      if (Module2["setStatus"]) {
        Module2["setStatus"]("Running...");
        setTimeout(() => {
          setTimeout(() => Module2["setStatus"](""), 1);
          doRun();
        }, 1);
      } else {
        doRun();
      }
    }
    function preInit() {
      if (Module2["preInit"]) {
        if (typeof Module2["preInit"] == "function") Module2["preInit"] = [Module2["preInit"]];
        while (Module2["preInit"].length > 0) {
          Module2["preInit"].shift()();
        }
      }
    }
    preInit();
    run();
    if (runtimeInitialized) {
      moduleRtn = Module2;
    } else {
      moduleRtn = new Promise((resolve, reject) => {
        readyPromiseResolve = resolve;
        readyPromiseReject = reject;
      });
    }
    return moduleRtn;
  });
})();
var espeak_ng_default = createEspeakModule;

// ../../sky-aura/public/aura/voice-lab/vendor/phonemizer/src/constants.mjs
var espeakCHARS_AUTO = 0;
var espeakPHONEMES_IPA = 2;
var AUDIO_OUTPUT_SYNCHRONOUS = 2;
var CLAUSE_TYPE_SENTENCE = 524288;
var CLAUSE_PERIOD = 524328;
var CLAUSE_COMMA = 266260;
var CLAUSE_QUESTION = 532520;
var CLAUSE_EXCLAMATION = 536621;
var CLAUSE_COLON = 262174;
var CLAUSE_SEMICOLON = 266270;
var CLAUSE_TERMINATOR_MASK = 1048575;
var TERMINATOR_STRINGS = /* @__PURE__ */ new Map([
  [CLAUSE_PERIOD, "."],
  [CLAUSE_QUESTION, "?"],
  [CLAUSE_EXCLAMATION, "!"],
  [CLAUSE_COMMA, ","],
  [CLAUSE_COLON, ":"],
  [CLAUSE_SEMICOLON, ";"]
]);
function decodeTerminator(terminator) {
  const masked = terminator & CLAUSE_TERMINATOR_MASK;
  return {
    terminator: TERMINATOR_STRINGS.get(masked) ?? "",
    isSentenceEnd: (masked & CLAUSE_TYPE_SENTENCE) === CLAUSE_TYPE_SENTENCE
  };
}

// ../../sky-aura/public/aura/voice-lab/vendor/phonemizer/src/espeak.mjs
var ESPEAK_DATA_VIRTUAL_PATH = "/espeak-ng-data";
var isNode = typeof globalThis.process?.versions?.node === "string" && globalThis.process?.type !== "renderer";
var Module = null;
var manifest = null;
var dataDir = null;
var espeak_SetVoiceByName = null;
var espeak_TextToPhonemesWithTerminator = null;
var loadedBuckets = /* @__PURE__ */ new Set();
async function readAsset(url) {
  if (isNode) {
    const { readFile } = await import("node:fs/promises");
    return new Uint8Array(await readFile(url));
  }
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  }
  return new Uint8Array(await res.arrayBuffer());
}
function virtualDirname(virtualPath) {
  const idx = virtualPath.lastIndexOf("/");
  return idx <= 0 ? "/" : virtualPath.slice(0, idx);
}
async function loadBucket(bucket) {
  const bytes = await readAsset(`${dataDir}/${bucket.path}`);
  for (const [relPath, { offset, length }] of Object.entries(bucket.files)) {
    const virtualPath = `${ESPEAK_DATA_VIRTUAL_PATH}/${relPath}`;
    Module.FS.mkdirTree(virtualDirname(virtualPath));
    Module.FS.writeFile(virtualPath, bytes.subarray(offset, offset + length));
  }
}
async function defaultDistDir() {
  if (!isNode) {
    return "";
  }
  const { fileURLToPath } = await import("node:url");
  return fileURLToPath(new URL("../dist", import.meta.url));
}
async function fetchManifest(dir) {
  const response = await fetch(`${dir}/manifest.json`);
  return await response.json();
}
async function initialize(distDir) {
  if (Module) return;
  if (!distDir) {
    distDir = (await defaultDistDir()).replace(/\\+$/);
  }
  dataDir = `${distDir}/data`;
  manifest = await fetchManifest(dataDir);
  const loadedModule = await espeak_ng_default({
    locateFile: (filename) => `${distDir}/wasm/${filename}`
  });
  Module = loadedModule;
  await loadBucket(manifest.core);
  const init = Module.cwrap("espeak_Initialize", "number", ["number", "number", "string", "number"]);
  const rc = init(AUDIO_OUTPUT_SYNCHRONOUS, 0, ESPEAK_DATA_VIRTUAL_PATH, 0);
  if (rc < 0) {
    throw new Error("Failed to initialize espeak-ng");
  }
  espeak_SetVoiceByName = Module.cwrap("espeak_SetVoiceByName", "number", ["string"]);
  espeak_TextToPhonemesWithTerminator = Module.cwrap(
    "espeak_TextToPhonemesWithTerminator",
    "string",
    ["number", "number", "number", "number"]
  );
}
function requireInitialized() {
  if (!Module) {
    throw new Error("espeak-ng is not initialized \u2014 call initialize(distDir) first.");
  }
}
async function setVoice(voice) {
  requireInitialized();
  const bucketName = manifest.voiceToBucket[voice];
  if (!bucketName) {
    throw new Error(`Unknown or unbundled voice: ${voice}`);
  }
  if (!loadedBuckets.has(bucketName)) {
    await loadBucket(manifest.buckets[bucketName]);
    loadedBuckets.add(bucketName);
  }
  if (espeak_SetVoiceByName(voice) !== 0) {
    throw new Error(`Failed to set voice: ${voice}`);
  }
}
function getPhonemes(text) {
  requireInitialized();
  const bytes = Module.lengthBytesUTF8(text) + 1;
  const textPtr = Module._malloc(bytes);
  Module.stringToUTF8(text, textPtr, bytes);
  const textPtrCell = Module._malloc(4);
  Module.setValue(textPtrCell, textPtr, "i32");
  const terminatorCell = Module._malloc(4);
  const results = [];
  try {
    while (Module.getValue(textPtrCell, "i32") !== 0) {
      const phonemes = espeak_TextToPhonemesWithTerminator(
        textPtrCell,
        espeakCHARS_AUTO,
        espeakPHONEMES_IPA,
        terminatorCell
      );
      const terminator = Module.getValue(terminatorCell, "i32");
      results.push({ phonemes: phonemes ?? "", ...decodeTerminator(terminator) });
    }
  } finally {
    Module._free(textPtr);
    Module._free(textPtrCell);
    Module._free(terminatorCell);
  }
  return results;
}

// ../../sky-aura/public/aura/voice-lab/source.js
Y.wasm.numThreads = 1;
Y.wasm.wasmPaths = "./vendor/";
window.auraVoiceStop = () => {
  generation++;
  if (audio) audio.pause();
};
var $ = (id) => document.getElementById(id);
var session = null;
var vocab = null;
var voices = {};
var audio = null;
var generation = 0;
function status(s) {
  $("status").textContent = s;
}
$("load").onclick = async () => {
  if (session) return;
  $("load").disabled = true;
  try {
    status("Downloading model: about 110 MB total. Keep this tab open.");
    let parts = [];
    for (let i = 0; i < 5; i++) {
      parts.push(new Uint8Array(await (await fetch(`models/model-${i}.bin`)).arrayBuffer()));
      status(`Model part ${i + 1}/5 loaded...`);
    }
    const all = new Uint8Array(parts.reduce((n, x) => n + x.length, 0));
    let offset = 0;
    for (const p of parts) {
      all.set(p, offset);
      offset += p.length;
    }
    parts = null;
    status("Preparing local voice model...");
    session = await gs.create(all);
    vocab = (await (await fetch("models/tokenizer.json")).json()).model.vocab;
    await initialize("./vendor/phonemizer");
    for (const v of ["hf_alpha", "af_heart"]) voices[v] = new Float32Array(await (await fetch(`models/${v}.bin`)).arrayBuffer());
    $("speak").disabled = false;
    status("Ready. Hindi and English synthesis runs on this device.");
  } catch (e) {
    if (session) {
      await session.release().catch(() => {
      });
      session = null;
    }
    status("Voice model could not load: " + e.message);
    $("load").disabled = false;
  }
};
$("speak").onclick = async () => {
  if (!session) return;
  const text = $("text").value.trim().slice(0, 300);
  if (!text) return;
  $("speak").disabled = true;
  const run = ++generation;
  try {
    if (audio) audio.pause();
    status("Generating locally...");
    const hi = $("lang").value === "hi";
    await setVoice(hi ? "hi" : "en-us");
    const phonemes = getPhonemes(text).map((x) => x.phonemes + x.terminator).join(" ");
    const ids = [0, ...[...phonemes].map((x) => vocab[x]).filter((x) => x !== void 0), 0];
    if (ids.length > 450) throw Error("Text is too long. Use a shorter sentence.");
    const voice = voices[hi ? "hf_alpha" : "af_heart"];
    const style = voice.slice((ids.length - 2) * 256, (ids.length - 1) * 256);
    const start = performance.now();
    const out = await session.run({ input_ids: new pe("int64", BigInt64Array.from(ids.map(BigInt)), [1, ids.length]), style: new pe("float32", style, [1, 256]), speed: new pe("float32", new Float32Array([Number($("rate").value)]), [1]) });
    if (run !== generation) {
      status("Stopped. Local generation finished but audio was not played.");
      return;
    }
    const samples = out.waveform.data;
    const b = new ArrayBuffer(44 + samples.length * 2), d = new DataView(b);
    const str = (o, s) => [...s].forEach((c, i) => d.setUint8(o + i, c.charCodeAt(0)));
    str(0, "RIFF");
    d.setUint32(4, 36 + samples.length * 2, true);
    str(8, "WAVEfmt ");
    d.setUint32(16, 16, true);
    d.setUint16(20, 1, true);
    d.setUint16(22, 1, true);
    d.setUint32(24, 24e3, true);
    d.setUint32(28, 48e3, true);
    d.setUint16(32, 2, true);
    d.setUint16(34, 16, true);
    str(36, "data");
    d.setUint32(40, samples.length * 2, true);
    samples.forEach((x, i) => d.setInt16(44 + i * 2, Math.max(-32768, Math.min(32767, x * 32767)), true));
    audio = $("audio");
    if (audio.dataset.blob) URL.revokeObjectURL(audio.dataset.blob);
    const url = URL.createObjectURL(new Blob([b], { type: "audio/wav" }));
    audio.src = url;
    audio.dataset.blob = url;
    status(`Generated ${(samples.length / 24e3).toFixed(1)}s audio in ${((performance.now() - start) / 1e3).toFixed(1)}s. Tap Play if needed.`);
    audio.play().catch(() => {
    });
  } catch (e) {
    status("Synthesis failed: " + e.message);
  } finally {
    $("speak").disabled = false;
  }
};
$("stop").onclick = () => {
  window.auraVoiceStop();
  status("Audio stopped. An in-progress model run may finish, but its result will not play.");
};
var lastReply = "";
var log = document.getElementById("chatlog");
function add(role, text) {
  const p = document.createElement("p");
  p.className = "msg " + role;
  p.textContent = text;
  log.appendChild(p);
  log.scrollTop = log.scrollHeight;
  return p;
}
var gate = null;
window.auraGateReady = () => {
  if (gate) return;
  gate = new Promise((resolve) => {
    window.turnstile.render("#gate", { sitekey: "0x4AAAAAAFma9HVVe7IMMcQC", appearance: "interaction-only", callback: async (token) => {
      try {
        const r = await fetch("/api/aura/session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token }) });
        resolve(r.ok);
      } catch {
        resolve(false);
      }
    }, "error-callback": () => resolve(false) });
  });
};
var turns = [];
document.getElementById("chatForm").onsubmit = async (e) => {
  e.preventDefault();
  const input = document.getElementById("question"), send = document.getElementById("send");
  const text = input.value.trim();
  if (!text) return;
  send.disabled = true;
  window.auraVoiceStop();
  add("user", text);
  input.value = "";
  const reply = add("assistant", "Thinking...");
  try {
    if (!gate || !await Promise.race([gate, new Promise((r2) => setTimeout(() => r2(false), 2e4))])) throw Error("Security check not ready. Reload and try again.");
    turns.push({ role: "user", content: text });
    const r = await fetch("/api/aura/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ provider: "cloudflare", stream: true, messages: turns.slice(-12) }) });
    if (!r.ok) throw Error("Chat unavailable (" + r.status + "). Your question was not answered.");
    const reader = r.body.getReader(), decoder = new TextDecoder();
    let buffer = "", answer = "";
    while (true) {
      const v = await reader.read();
      if (v.done) break;
      buffer += decoder.decode(v.value, { stream: true });
      let n;
      while ((n = buffer.indexOf("\n")) >= 0) {
        const line = buffer.slice(0, n);
        buffer = buffer.slice(n + 1);
        if (!line.startsWith("data:")) continue;
        const data = line.slice(5).trim();
        if (data === "[DONE]") continue;
        let d;
        try {
          d = JSON.parse(data);
        } catch {
          continue;
        }
        if (d.error) throw Error(d.error);
        answer += d.token || d.response || d.delta || d.text || "";
        reply.textContent = answer.replace(/^\[\w+\]\s*/, "");
      }
    }
    if (!answer) throw Error("No answer received.");
    lastReply = answer.replace(/^\[\w+\]\s*/, "");
    reply.textContent = lastReply;
    window.dispatchEvent(new CustomEvent("voice-reply", { detail: { tone: (answer.match(/^\[(\w+)\]/) || [])[1] || "neutral" } }));
    turns.push({ role: "assistant", content: lastReply });
    $("text").value = lastReply.slice(0, 300);
    $("lang").value = /[\u0900-\u097f]/.test(lastReply) ? "hi" : "en";
    if (session && !$("mute").checked) {
      $("speak").click();
      if (lastReply.length > 300) document.getElementById("chatnote").textContent = "Voice reads first 300 characters only. Full answer stays above.";
    } else status("Answer ready. Load voice, then Generate to hear it.");
  } catch (err) {
    reply.textContent = err.message;
    reply.className += " error";
    if (turns.at(-1)?.role === "user") turns.pop();
  } finally {
    send.disabled = false;
  }
};
document.addEventListener("visibilitychange", () => {
  if (document.hidden) window.auraVoiceStop();
});
if (window.turnstile) window.auraGateReady();
$("mute").onchange = () => {
  if ($("mute").checked) window.auraVoiceStop();
};
var face = document.getElementById("face");
var faceToggle = document.getElementById("faceToggle");
var faceNote = document.getElementById("faceNote");
var faceFrames = { mouth: [], blink: [], happy: [] };
var faceLoaded = false;
var faceTick = null;
var blinkTick = null;
var faceRun = 0;
var reduced = matchMedia("(prefers-reduced-motion: reduce)");
function faceStop() {
  faceRun++;
  clearTimeout(faceTick);
  clearTimeout(blinkTick);
  face.src = "../talk/base.jpg";
}
function faceCycle(name, loop = false) {
  faceStop();
  if (!faceToggle.checked || !faceLoaded || reduced.matches || document.hidden) return;
  let i = 0;
  const run = faceRun;
  const step = () => {
    if (run !== faceRun || document.hidden || !faceToggle.checked) return;
    face.src = faceFrames[name][i++].src;
    if (i < faceFrames[name].length || loop) {
      i %= faceFrames[name].length;
      faceTick = setTimeout(step, name === "blink" ? 90 : 180);
    } else faceTick = setTimeout(faceStop, 350);
  };
  step();
}
function scheduleBlink() {
  clearTimeout(blinkTick);
  if (!faceToggle.checked || !faceLoaded || reduced.matches || document.hidden) return;
  blinkTick = setTimeout(() => {
    if (!audio || audio.paused) faceCycle("blink");
    scheduleBlink();
  }, 7e3);
}
faceToggle.onchange = async () => {
  faceStop();
  if (!faceToggle.checked) {
    faceNote.textContent = "Original photo. Face clips off.";
    return;
  }
  if (reduced.matches) {
    faceNote.textContent = "Reduced motion is on. Static photo retained.";
    return;
  }
  try {
    if (!faceLoaded) {
      const promises = [];
      for (const name of ["mouth", "blink"]) for (let i = 0; i < 7; i++) {
        const im = new Image();
        im.src = `../lab/${name}-${i}.jpg`;
        faceFrames[name].push(im);
        promises.push(im.decode());
      }
      const h = new Image();
      h.src = "../lab/happy.jpg";
      faceFrames.happy = [h];
      promises.push(h.decode());
      await Promise.all(promises);
      faceLoaded = true;
    }
    faceNote.textContent = "Reconstructed 2D face. Body static. Basic mouth cycle follows actual audio, not phoneme lip sync.";
    scheduleBlink();
  } catch {
    faceToggle.checked = false;
    faceStop();
    faceNote.textContent = "Face clips unavailable. Original retained.";
  }
};
$("audio").addEventListener("playing", () => {
  faceCycle("mouth", true);
});
for (const event of ["pause", "ended", "error", "waiting"]) $("audio").addEventListener(event, () => {
  faceStop();
  scheduleBlink();
});
window.addEventListener("voice-reply", (e) => {
  if (["happy", "excited", "playful"].includes(e.detail.tone)) faceCycle("happy");
});
document.addEventListener("visibilitychange", () => {
  faceStop();
  if (!document.hidden) scheduleBlink();
});
reduced.addEventListener("change", () => {
  faceStop();
  scheduleBlink();
});
/*! Bundled license information:

onnxruntime-web/dist/ort.wasm.bundle.min.mjs:
  (*!
   * ONNX Runtime Web v1.31.1
   * Copyright (c) Microsoft Corporation. All rights reserved.
   * Licensed under the MIT License.
   *)
*/
