/**
 * Fragment shader for the K.A.I. core: a body of living light.
 * Everything is soft — domain-warped plasma, gaussian ripples, diffuse rays —
 * so there are no hard edges anywhere. Output is premultiplied light over a
 * transparent canvas, so the page background shows through.
 */

export const VERTEX = /* glsl */ `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

export const FRAGMENT = /* glsl */ `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform vec2  uCenter;   // core center, buffer px (GL origin bottom-left)
uniform float uR;        // core radius unit, buffer px
uniform float uTime;
uniform float uEnergy;   // 0 idle .. 1 speaking
uniform float uLevel;    // live voice amplitude
uniform float uKick;     // momentary impulse
uniform float uTint;     // 0 cyan .. 1 violet
uniform float uDim;      // 1 = offline grey
uniform float uSwirl;    // thinking lobe strength
uniform float uSwirlRot;
uniform vec4  uWaves[4]; // x radius (R units), y strength

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = m * p;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 p = (gl_FragCoord.xy - uCenter) / uR;
  float r = length(p);
  float t = uTime;
  float e = uEnergy;
  float lv = uLevel;

  // Soft ripples from syllable onsets; they also refract the plasma.
  float ripple = 0.0;
  float warp = 0.0;
  for (int i = 0; i < 4; i++) {
    float d = r - uWaves[i].x;
    float g = exp(-d * d * 22.0) * uWaves[i].y;
    ripple += g;
    warp += g;
  }
  vec2 q = p * (1.0 - warp * 0.07);

  // Slowly rotating frame so the whole body turns, faster when awake.
  float spin = t * (0.03 + e * 0.08);
  mat2 rot = mat2(cos(spin), -sin(spin), sin(spin), cos(spin));
  q = rot * q;

  // Domain-warped plasma.
  float flow = t * (0.06 + e * 0.22 + lv * 0.45);
  vec2 w1 = vec2(fbm(q * 1.5 + vec2(0.0, flow)), fbm(q * 1.5 + vec2(5.2, -flow)));
  vec2 w2 = vec2(fbm(q * 2.2 + w1 * 1.6 + vec2(1.7, 9.2) + flow * 0.5),
                 fbm(q * 2.2 + w1 * 1.6 + vec2(8.3, 2.8) - flow * 0.3));
  float f = fbm(q * 1.7 + w2 * (1.4 + lv * 1.8));

  // Body: a gaussian envelope that breathes at rest and swells with the voice.
  float size = 0.5 + e * 0.1 + lv * 0.3 + uKick * 0.1 + sin(t * 1.05) * 0.025;
  float body = exp(-pow(r / size, 2.0) * 1.7);
  // Wispy edge: plasma pushes the boundary in and out.
  float edge = exp(-pow(r / (size * (1.15 + f * 0.9)), 2.0) * 2.4);
  float aura = body * (0.25 + f * 1.25) + edge * f * 0.35;

  // Diffuse light rays, sampled on the unit circle to avoid an angular seam.
  vec2 dir = p / (r + 1e-4);
  float rayA = pow(noise(dir * 3.2 + vec2(t * 0.25, -t * 0.18) + w1 * 0.8), 3.0);
  float rayB = pow(noise(dir * 7.5 - vec2(t * 0.4, t * 0.3)), 5.0);
  float rays = (rayA * (0.04 + e * 0.12 + lv * 0.75) + rayB * lv * 0.9)
               * smoothstep(0.05, 0.3, r) * exp(-r * 1.75);

  // Hot core: a gaussian heart plus a long soft bloom.
  float coreR = 0.085 + lv * 0.07 + uKick * 0.03;
  float core = exp(-r * r / (coreR * coreR)) * (0.9 + e * 0.3 + lv * 1.6)
             + 0.016 / (r + 0.035) * (0.45 + e * 0.5 + lv * 1.3);

  // Thinking: a violet lobe circling through the body.
  vec2 sd = vec2(cos(uSwirlRot), sin(uSwirlRot));
  float lobe = pow(max(dot(dir, sd), 0.0), 5.0) * exp(-pow((r - 0.45) / 0.3, 2.0)) * uSwirl;

  // Glittering dust carried by the flow.
  vec2 gp = q * 13.0 + w1 * 3.0 - dir * t * (0.2 + lv * 2.5);
  vec2 cell = floor(gp);
  float h = hash(cell);
  vec2 off = vec2(hash(cell + 1.7), hash(cell + 3.1)) - 0.5;
  float dust = smoothstep(0.12, 0.0, length(fract(gp) - 0.5 - off * 0.6))
             * step(0.88, h) * (0.5 + 0.5 * sin(t * (1.5 + h * 4.0) + h * 30.0));
  dust *= edge * (0.25 + e * 0.4 + lv * 1.8);

  // Palette: site accents plus a deep blue and a faint rose for depth.
  // Light accents (#9be7ff / #b3a6ff) for highlights; saturated versions
  // for the plasma body so dim areas stay colorful instead of grey.
  vec3 cyan = vec3(0.608, 0.906, 1.0);
  vec3 violet = vec3(0.702, 0.651, 1.0);
  vec3 cyanSat = vec3(0.22, 0.74, 1.0);
  vec3 violetSat = vec3(0.52, 0.38, 1.0);
  vec3 deep = vec3(0.08, 0.16, 0.78);
  vec3 rose = vec3(1.0, 0.42, 0.82);
  vec3 base = mix(cyan, violet, uTint);
  vec3 baseSat = mix(cyanSat, violetSat, uTint);

  vec3 plasma = mix(deep, baseSat, smoothstep(0.25, 0.7, f));
  plasma = mix(plasma, violetSat, smoothstep(0.45, 0.8, w2.x) * 0.6);
  plasma = mix(plasma, rose, smoothstep(0.6, 0.88, w2.y) * (0.18 + lv * 0.4));
  plasma = mix(plasma, base, smoothstep(0.7, 0.95, f) * 0.5);

  vec3 col = plasma * aura * (0.75 + e * 0.35 + lv * 1.0);
  col += mix(base, vec3(1.0), 0.3) * rays;
  col += mix(base, vec3(1.0), 0.5) * ripple * (0.18 + lv * 0.45);
  col += violet * lobe * 0.9;
  col += mix(base, vec3(1.0), 0.6) * dust;
  col += mix(base, vec3(1.0), 0.8) * core;
  col += baseSat * exp(-r * 1.6) * (0.06 + e * 0.06 + lv * 0.12);

  // Offline: desaturate and fade.
  float lum = dot(col, vec3(0.299, 0.587, 0.114));
  col = mix(col, vec3(lum) * vec3(0.72, 0.78, 0.86), uDim);
  col *= 1.0 - uDim * 0.55;

  // Filmic-ish tone map keeps highlights soft instead of clipping.
  col = 1.0 - exp(-col * 1.3);
  col += (hash(gl_FragCoord.xy + fract(t)) - 0.5) / 255.0;
  col = max(col, 0.0);

  float alpha = clamp(max(col.r, max(col.g, col.b)), 0.0, 1.0);
  gl_FragColor = vec4(col, alpha);
}
`;
