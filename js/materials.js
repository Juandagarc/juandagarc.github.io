// The one material of the museum: iridescent glass that reads as lit from within.
// A stylised glass shader rather than physical transmission, so it holds up on every device:
//  - reflections of an imaginary studio (a top softbox, a cyan and a pink strip light) give crisp bands on bevels
//  - refraction with dispersion (one index per colour channel) through an inner caustic web gives the inside detail
//  - a thin-film tint (cyan → violet → pink) shifts with the viewing angle
import * as THREE from 'three';
import { toCreasedNormals } from 'three/addons/utils/BufferGeometryUtils.js';

export const COLORS = {
  cyan: new THREE.Color('#5FE8FF'),
  violet: new THREE.Color('#8C7BFF'),
  pink: new THREE.Color('#F27BFF'),
  ink: new THREE.Color('#ECEEF2'),
  void: new THREE.Color('#030407'),
};

// Shared fog so every custom shader fades into the same darkness.
export const FOG = {
  color: { value: COLORS.void.clone() },
  density: { value: 0.034 },
};

export const time = { value: 0 };

const crystalVert = /* glsl */`
  varying vec3 vW;
  varying vec3 vN;
  varying vec3 vL;
  void main() {
    vL = position;
    vec4 w = modelMatrix * vec4(position, 1.0);
    vW = w.xyz;
    vN = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`;

const LIGHTS = /* glsl */`
  vec3 film(float t) {
    t = fract(t);
    vec3 c1 = vec3(0.24, 0.92, 1.00);
    vec3 c2 = vec3(0.46, 0.42, 1.00);
    vec3 c3 = vec3(0.98, 0.44, 0.98);
    float s = t * 3.0;
    vec3 c = mix(c1, c2, smoothstep(0.0, 1.0, s));
    c = mix(c, c3, smoothstep(1.0, 2.0, s));
    return mix(c, c1, smoothstep(2.0, 3.0, s));
  }

  // the studio the glass reflects: dark, with three soft lights
  vec3 studio(vec3 d) {
    vec3 c = vec3(0.0);
    c += vec3(1.0) * smoothstep(0.55, 0.85, d.y) * 1.5;
    float tall = smoothstep(-0.35, 0.15, d.y);
    c += vec3(0.30, 0.95, 1.00) * exp(-pow((d.x - 0.7) * 7.0, 2.0)) * tall * 2.0;
    c += vec3(1.00, 0.40, 0.95) * exp(-pow((d.x + 0.7) * 7.0, 2.0)) * tall * 1.7;
    c += vec3(0.55, 0.48, 1.00) * exp(-pow((d.y + 0.05) * 12.0, 2.0)) * 0.7;
    c += mix(vec3(0.25, 0.75, 0.95), vec3(0.85, 0.4, 0.95), 0.5 + 0.5 * d.x) * (1.0 - smoothstep(-0.9, -0.15, d.y)) * 0.55;
    return c;
  }

`;

const crystalFrag = /* glsl */`
  uniform float uTime;
  uniform float uFacet;
  uniform float uOpacity;
  uniform float uGlow;
  uniform float uHue;
  uniform float uGhost;
  uniform float uHover;
  uniform float uBack;
  uniform float uInner;
  uniform float uBase;
  uniform float uFogScale;
  uniform vec3 uFogColor;
  uniform float uFogDensity;
  varying vec3 vW;
  varying vec3 vN;
  varying vec3 vL;

  ${LIGHTS}

  // light gathered inside the glass: a slowly moving caustic web
  float web(vec2 p, float t) {
    p += 0.45 * vec2(sin(p.y * 1.7 + t), cos(p.x * 1.5 - t * 0.8));
    float a = sin(p.x * 2.0 + t * 0.5);
    float b = sin((p.x * 0.5 + p.y * 0.866) * 2.0 - t * 0.4);
    float c = sin((-p.x * 0.5 + p.y * 0.866) * 2.0 + t * 0.3);
    return pow(1.0 - abs(a + b + c) / 3.0, 9.0);
  }

  float inside(vec3 T) {
    vec3 q = vL * 1.6 + T * 0.9;
    float t = uTime * 0.25 + uHue * 7.0;
    return web(q.xy + q.z * 0.6, t) * 0.8 + web(q.zy * 1.3 + 4.0, t * 0.8) * 0.45;
  }

  void main() {
    vec3 N = normalize(vN);
    if (uFacet > 0.5) N = normalize(cross(dFdx(vW), dFdy(vW)));
    vec3 V = normalize(cameraPosition - vW);
    if (dot(N, V) < 0.0) N = -N;
    float ndv = clamp(dot(N, V), 0.0, 1.0);
    float F = 0.04 + 0.96 * pow(1.0 - ndv, 5.0);
    float rim = pow(1.0 - ndv, 2.0);
    float facet = fract(sin(dot(floor(N * 7.0 + 0.5), vec3(12.9898, 78.233, 37.719))) * 43758.5453) * uFacet;

    vec3 f = film(ndv * 0.9 + N.y * 0.3 + N.x * 0.25 + facet * 0.55 + (vW.x * 0.11 + vW.y * 0.23) + uTime * 0.025 + uHue);

    // reflection
    vec3 R = reflect(-V, N);
    vec3 refl = studio(R);

    // refraction, one index per channel: the rainbow edges of real glass
    vec3 Tr = refract(-V, N, 1.0 / 1.44);
    vec3 Tg = refract(-V, N, 1.0 / 1.50);
    vec3 Tb = refract(-V, N, 1.0 / 1.57);
    vec3 inner = vec3(inside(Tr), inside(Tg), inside(Tb));
    vec3 through = vec3(studio(Tr).r, studio(Tg).g, studio(Tb).b) * 0.35;
    vec3 body = f * (0.08 + 0.14 * facet + 0.06 * (1.0 - uFacet) + uBase) + (inner * f * 1.0 + through * 0.7) * uInner;

    vec3 col = body * (1.0 - F) + refl * (0.12 + F * 1.1) + f * rim * 0.5;
    col *= uGlow * (1.0 + uHover * 0.35) * mix(1.0, 0.45, uBack);

    float lum = dot(refl, vec3(0.3, 0.5, 0.2));
    float a = clamp(uOpacity + F * 0.9 + lum * 0.25 + max(inner.r, inner.b) * 0.3 * uInner + rim * 0.3, 0.0, 1.0);
    // a ghost keeps only its rim: used for what has not happened yet
    col = mix(col, f * rim * 1.3, uGhost);
    a = mix(a, rim * 0.65, uGhost);

    float fogF = (1.0 - exp(-pow(uFogDensity * length(cameraPosition - vW), 2.0))) * uFogScale;
    col = mix(col, uFogColor, fogF);
    a *= 1.0 - fogF * 0.85;
    gl_FragColor = vec4(col, a);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

export function crystalMaterial({ facet = 1, opacity = 0.3, glow = 1, hue = 0, ghost = 0, inner = 1, base = 0, fog = 1, side = THREE.FrontSide, back = 0 } = {}) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: time,
      uFacet: { value: facet },
      uOpacity: { value: opacity },
      uGlow: { value: glow },
      uHue: { value: hue },
      uGhost: { value: ghost },
      uHover: { value: 0 },
      uBack: { value: back },
      uInner: { value: inner },
      uBase: { value: base },
      uFogScale: { value: fog },
      uFogColor: FOG.color,
      uFogDensity: FOG.density,
    },
    vertexShader: crystalVert,
    fragmentShader: crystalFrag,
    transparent: true,
    side,
    depthWrite: side === THREE.FrontSide,
  });
}

// Convex, faceted pieces (piano, quartz, blocks): drawn twice, the far faces dimmer, then the near ones.
// Returns the outer mesh (the one to raycast) with the inner one attached.
export function crystal(geo, opts = {}) {
  const inner = new THREE.Mesh(geo, crystalMaterial({ ...opts, side: THREE.BackSide, back: 1, hue: (opts.hue || 0) + 0.33, opacity: (opts.opacity ?? 0.3) * 0.6 }));
  const outer = new THREE.Mesh(geo, crystalMaterial(opts));
  inner.renderOrder = 1;
  outer.renderOrder = 2;
  inner.raycast = () => {};
  outer.add(inner);
  outer.userData.setHover = (v) => {
    outer.material.uniforms.uHover.value = v;
    inner.material.uniforms.uHover.value = v;
  };
  return outer;
}

// Lettering and other intricate pieces: a depth-only pass first, so only the outer skin is ever shaded —
// the bevels' inner folds and the back cap's triangles can never show through.
export function solidGlass(geo, opts = {}) {
  const smooth = toCreasedNormals(geo, THREE.MathUtils.degToRad(35));
  // same vertex shader as the skin, so both passes land on exactly the same depth
  const pre = new THREE.Mesh(smooth, new THREE.ShaderMaterial({ vertexShader: crystalVert, fragmentShader: 'void main() { gl_FragColor = vec4(0.0); }', colorWrite: false, depthWrite: true, transparent: true }));
  pre.renderOrder = 2;
  pre.raycast = () => {};
  const skin = new THREE.Mesh(smooth, crystalMaterial({ facet: 0, ...opts }));
  skin.material.depthWrite = false;
  skin.material.depthFunc = THREE.LessEqualDepth;
  skin.renderOrder = 3;
  skin.add(pre);
  skin.userData.setHover = (v) => { skin.material.uniforms.uHover.value = v; };
  return skin;
}

// A posable glass figure: the same glass on a skinned mesh, with its own skinned depth pre-pass so only the
// outer skin is ever shaded. Both meshes share one skeleton; add the root bone to `skin` before binding.
const skinnedVert = /* glsl */`
  #include <common>
  #include <skinning_pars_vertex>
  varying vec3 vW;
  varying vec3 vN;
  varying vec3 vL;
  void main() {
    #include <skinbase_vertex>
    #include <begin_vertex>
    #include <beginnormal_vertex>
    #include <skinnormal_vertex>
    #include <skinning_vertex>
    vL = position;
    vec4 w = modelMatrix * vec4(transformed, 1.0);
    vW = w.xyz;
    vN = normalize(mat3(modelMatrix) * objectNormal);
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`;

export function skinnedGlass(geo, opts = {}) {
  // both sides: where a limb has been cut free of the body, the opening shows the glass inside, never the room behind
  const skinMat = crystalMaterial({ facet: 0, side: THREE.DoubleSide, ...opts });
  skinMat.vertexShader = skinnedVert;
  skinMat.depthWrite = false;
  skinMat.depthFunc = THREE.LessEqualDepth;
  const preMat = new THREE.ShaderMaterial({ vertexShader: skinnedVert, fragmentShader: 'void main() { gl_FragColor = vec4(0.0); }', colorWrite: false, depthWrite: true, transparent: true, side: THREE.DoubleSide });
  const pre = new THREE.SkinnedMesh(geo, preMat);
  const skin = new THREE.SkinnedMesh(geo, skinMat);
  pre.renderOrder = 2;
  skin.renderOrder = 3;
  pre.frustumCulled = skin.frustumCulled = false;
  skin.userData.setHover = (v) => { skinMat.uniforms.uHover.value = v; };
  return { pre, skin };
}

// Space-grey aluminium for the laptops: the same studio reflected, a fine brushed grain, a hint of iridescence on the edges.
const metalFrag = /* glsl */`
  uniform vec3 uColor;
  uniform float uRough;
  uniform float uRim;
  uniform float uTime;
  uniform vec3 uFogColor;
  uniform float uFogDensity;
  varying vec3 vW;
  varying vec3 vN;
  varying vec3 vL;
  ${LIGHTS}
  void main() {
    vec3 N = normalize(vN);
    vec3 V = normalize(cameraPosition - vW);
    if (dot(N, V) < 0.0) N = -N;
    float ndv = clamp(dot(N, V), 0.0, 1.0);
    vec3 R = reflect(-V, N);
    vec3 env = mix(studio(R), vec3(0.16, 0.17, 0.22), uRough);
    float grain = fract(sin(dot(floor(vL.xz * 900.0), vec2(12.9898, 78.233))) * 43758.5453);
    vec3 F = uColor + (1.0 - uColor) * pow(1.0 - ndv, 5.0);
    vec3 col = env * F * (0.92 + 0.08 * grain) + uColor * 0.035;
    col += film(ndv * 0.9 + uTime * 0.02) * pow(1.0 - ndv, 3.0) * uRim;
    float fogF = 1.0 - exp(-pow(uFogDensity * length(cameraPosition - vW), 2.0));
    gl_FragColor = vec4(mix(col, uFogColor, fogF), 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

export function metalMaterial({ color = '#5b5e66', rough = 0.35, rim = 0.12 } = {}) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color(color) }, uRough: { value: rough }, uRim: { value: rim }, uTime: time,
      uFogColor: FOG.color, uFogDensity: FOG.density,
    },
    vertexShader: crystalVert,
    fragmentShader: metalFrag,
  });
}

// Laptop keycaps: satin black plastic, printed legends that light up with the backlight,
// and the light bleeding out from under each cap. `aTop` marks the cap faces, `aH` the height up a side.
export function keycapMaterial(legend) {
  return new THREE.ShaderMaterial({
    uniforms: { uLegend: { value: legend }, uBack: { value: 0 }, uFogColor: FOG.color, uFogDensity: FOG.density },
    vertexShader: /* glsl */`
      attribute float aTop;
      attribute float aH;
      varying vec2 vUv;
      varying vec3 vW;
      varying vec3 vN;
      varying float vTop;
      varying float vH;
      void main() {
        vUv = uv; vTop = aTop; vH = aH;
        vec4 w = modelMatrix * vec4(position, 1.0);
        vW = w.xyz;
        vN = normalize(mat3(modelMatrix) * normal);
        gl_Position = projectionMatrix * viewMatrix * w;
      }
    `,
    fragmentShader: /* glsl */`
      uniform sampler2D uLegend;
      uniform float uBack;
      uniform vec3 uFogColor;
      uniform float uFogDensity;
      varying vec2 vUv;
      varying vec3 vW;
      varying vec3 vN;
      varying float vTop;
      varying float vH;
      ${LIGHTS}
      void main() {
        vec3 N = normalize(vN);
        vec3 V = normalize(cameraPosition - vW);
        vec3 R = reflect(-V, N);
        float ndv = clamp(dot(N, V), 0.0, 1.0);
        vec3 col = vec3(0.016, 0.017, 0.02) + studio(R) * (0.012 + 0.03 * pow(1.0 - ndv, 3.0));
        float ink = texture2D(uLegend, vUv).a * vTop;
        col = mix(col, mix(vec3(0.34, 0.35, 0.38), vec3(1.05, 1.07, 1.12), uBack), ink * 0.92);
        col += vec3(0.7, 0.8, 1.0) * uBack * (1.0 - vTop) * pow(1.0 - vH, 2.0) * 0.12;
        float fogF = 1.0 - exp(-pow(uFogDensity * length(cameraPosition - vW), 2.0));
        gl_FragColor = vec4(mix(col, uFogColor, fogF), 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `,
  });
}

// A print over the laptop deck: the dark keyboard well, the speaker grilles, and the backlight glow between the keys.
export function deckMaterial(shade, glow) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
    uniforms: { uShade: { value: shade }, uGlow: { value: glow }, uBack: { value: 0 }, uFogColor: FOG.color, uFogDensity: FOG.density },
    vertexShader: /* glsl */`
      varying vec2 vUv;
      varying vec3 vW;
      void main() { vUv = uv; vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }
    `,
    fragmentShader: /* glsl */`
      uniform sampler2D uShade;
      uniform sampler2D uGlow;
      uniform float uBack;
      uniform vec3 uFogColor;
      uniform float uFogDensity;
      varying vec2 vUv;
      varying vec3 vW;
      void main() {
        float dark = texture2D(uShade, vUv).a;
        float g = texture2D(uGlow, vUv).a * uBack;
        float a = clamp(dark + g * 0.3, 0.0, 1.0);
        vec3 col = a > 0.002 ? vec3(0.75, 0.84, 1.0) * g * 0.22 / a : vec3(0.0);
        float fogF = 1.0 - exp(-pow(uFogDensity * length(cameraPosition - vW), 2.0));
        gl_FragColor = vec4(mix(col, uFogColor, fogF), a);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `,
  });
}
