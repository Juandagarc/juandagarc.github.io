// Atmosphere: black lacquer floor, the void, light spilling from each piece, post-processing.
import * as THREE from 'three';
import { Reflector } from 'three/addons/objects/Reflector.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { COLORS, FOG, time } from './materials.js';

export { time };

const OUT = /* glsl */`
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
`;
const FOG_GLSL = /* glsl */`
  uniform vec3 uFogColor;
  uniform float uFogDensity;
  float fogAmount(vec3 w) { return 1.0 - exp(-pow(uFogDensity * length(cameraPosition - w), 2.0)); }
`;
const fogUniforms = () => ({ uFogColor: FOG.color, uFogDensity: FOG.density });

// ---------------------------------------------------------------- floor
const floorVert = /* glsl */`
  uniform mat4 textureMatrix;
  varying vec4 vUv;
  varying vec3 vW;
  void main() {
    vUv = textureMatrix * vec4(position, 1.0);
    vec4 w = modelMatrix * vec4(position, 1.0);
    vW = w.xyz;
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`;
const floorFrag = /* glsl */`
  uniform vec3 color;
  uniform sampler2D tDiffuse;
  uniform float uReflect;
  uniform float uTime;
  varying vec4 vUv;
  varying vec3 vW;
  ${FOG_GLSL}
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  void main() {
    vec3 V = normalize(cameraPosition - vW);
    float fres = 0.08 + 0.92 * pow(1.0 - max(V.y, 0.0), 5.0);
    vec3 col = color + (hash(floor(vW.xz * 90.0)) - 0.5) * 0.003;
    #ifdef USE_REFLECT
      vec2 uv = vUv.xy / vUv.w;
      uv += vec2(sin(vW.z * 3.1 + uTime * 0.6) + sin(vW.x * 2.3 - uTime * 0.4), cos(vW.x * 2.7 + uTime * 0.5)) * 0.0012;
      // a soft, slightly smeared reflection, like wet black stone
      vec3 r = vec3(0.0);
      float wsum = 0.0;
      for (int i = -3; i <= 3; i++) {
        float fi = float(i);
        float w = exp(-fi * fi * 0.25);
        r += texture2D(tDiffuse, uv + vec2(fi * 0.0016, fi * 0.0045)).rgb * w;
        wsum += w;
      }
      // fade out near the edges of the reflection texture instead of smearing its border
      vec2 e = smoothstep(vec2(0.0), vec2(0.06), uv) * (1.0 - smoothstep(vec2(0.94), vec2(1.0), uv));
      col += (r / wsum) * uReflect * fres * e.x * e.y;
    #else
      col += vec3(0.01, 0.012, 0.02) * fres;
    #endif
    col = mix(col, uFogColor, fogAmount(vW) * 0.9);
    gl_FragColor = vec4(col, 1.0);
    ${OUT}
  }
`;

export function createFloor({ reflect, size = 560, rtScale = 0.5 }) {
  const geo = new THREE.PlaneGeometry(size, size);
  const color = new THREE.Color('#040509');
  const group = new THREE.Group();
  const plain = new THREE.Mesh(geo, new THREE.ShaderMaterial({
    uniforms: { color: { value: color }, tDiffuse: { value: null }, textureMatrix: { value: new THREE.Matrix4() }, uReflect: { value: 0 }, uTime: time, ...fogUniforms() },
    vertexShader: floorVert,
    fragmentShader: floorFrag,
  }));
  plain.rotation.x = -Math.PI / 2;
  plain.position.z = -140;
  group.add(plain);

  let mirror = null;
  if (reflect) {
    const dpr = Math.min(window.devicePixelRatio, 2);
    mirror = new Reflector(geo, {
      textureWidth: Math.round(window.innerWidth * dpr * rtScale),
      textureHeight: Math.round(window.innerHeight * dpr * rtScale),
      clipBias: 0.003,
      multisample: 0,
      color,
      shader: {
        name: 'LacquerFloor',
        uniforms: { color: { value: null }, tDiffuse: { value: null }, textureMatrix: { value: null }, uReflect: { value: 0.85 }, uTime: time, ...fogUniforms() },
        vertexShader: floorVert,
        fragmentShader: '#define USE_REFLECT\n' + floorFrag,
      },
    });
    mirror.material.uniforms.uFogColor = FOG.color;
    mirror.material.uniforms.uFogDensity = FOG.density;
    mirror.material.uniforms.uTime = time;
    mirror.rotation.x = -Math.PI / 2;
    mirror.position.z = -140;
    group.add(mirror);
    plain.visible = false;
  }
  return {
    group,
    mirror,
    setReflect(on) {
      if (!mirror) return;
      mirror.visible = on;
      plain.visible = !on;
    },
  };
}

// ---------------------------------------------------------------- the void
export function createVoid() {
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(500, 32, 16),
    new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      uniforms: { uFogColor: FOG.color },
      vertexShader: /* glsl */`
        varying vec3 vDir;
        void main() {
          vDir = position;
          vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          gl_Position = p.xyww;
        }
      `,
      fragmentShader: /* glsl */`
        uniform vec3 uFogColor;
        varying vec3 vDir;
        void main() {
          gl_FragColor = vec4(uFogColor, 1.0);
          ${OUT}
        }
      `,
    }),
  );
  sky.frustumCulled = false;
  sky.renderOrder = -10;
  return sky;
}

// ---------------------------------------------------------------- light spilling on the floor
// Radial streaks plus a faint caustic web, cyan and violet, like light passing through the piece above.
export function spill({ size = 7, width = size, depth = size, intensity = 1, seed = Math.random() * 10, squash = 1 } = {}) {
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uA: { value: COLORS.cyan }, uB: { value: COLORS.pink }, uC: { value: COLORS.violet },
      uIntensity: { value: intensity }, uTime: time, uSeed: { value: seed }, uSquash: { value: squash },
      ...fogUniforms(),
    },
    vertexShader: /* glsl */`
      varying vec2 vUv;
      varying vec3 vW;
      void main() {
        vUv = uv;
        vec4 w = modelMatrix * vec4(position, 1.0);
        vW = w.xyz;
        gl_Position = projectionMatrix * viewMatrix * w;
      }
    `,
    fragmentShader: /* glsl */`
      uniform vec3 uA;
      uniform vec3 uB;
      uniform vec3 uC;
      uniform float uIntensity;
      uniform float uTime;
      uniform float uSeed;
      uniform float uSquash;
      varying vec2 vUv;
      varying vec3 vW;
      ${FOG_GLSL}
      float web(vec2 p, float t) {
        p += 0.5 * vec2(sin(p.y * 1.6 + t), cos(p.x * 1.4 - t * 0.8));
        float a = sin(p.x * 2.0 + t * 0.5);
        float b = sin((p.x * 0.5 + p.y * 0.866) * 2.0 - t * 0.4);
        float c = sin((-p.x * 0.5 + p.y * 0.866) * 2.0 + t * 0.3);
        return pow(1.0 - abs(a + b + c) / 3.0, 12.0);
      }
      void main() {
        vec2 p = (vUv - 0.5) * 2.0;
        p.y *= uSquash;
        float r = length(p);
        float ang = atan(p.y, p.x);
        float t = uTime * 0.35 + uSeed;
        float s1 = pow(0.5 + 0.5 * sin(ang * 7.0 + 1.8 * sin(ang * 3.0 + uSeed) + t * 0.15), 2.0);
        float streaks = s1 * 0.18 * exp(-r * 3.0);
        float core = exp(-r * r * 14.0) * 0.12;
        vec2 q = p * 3.4 + uSeed;
        vec3 caustic = vec3(web(q * 0.996, t), web(q, t), web(q * 1.004, t)) * 0.6;
        caustic += vec3(web(p * 6.1 * 0.995 - uSeed, t * 1.3), web(p * 6.1 - uSeed, t * 1.3), web(p * 6.1 * 1.005 - uSeed, t * 1.3)) * 0.22;
        caustic *= exp(-r * 2.6);
        float hueMix = 0.5 + 0.5 * sin(ang * 2.0 + uSeed + t * 0.2);
        vec3 tint = mix(uA, uB, hueMix);
        tint = mix(tint, uC, 0.5 + 0.5 * sin(ang * 5.0 - t * 0.1) * 0.5);
        vec3 col = tint * streaks + mix(tint, vec3(1.0), 0.35) * caustic + mix(uA, vec3(1.0), 0.5) * core;
        col *= uIntensity * (1.0 - smoothstep(0.55, 1.0, r)) * (1.0 - fogAmount(vW));
        gl_FragColor = vec4(col, 1.0);
        ${OUT}
      }
    `,
  });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(width, depth), mat);
  m.rotation.x = -Math.PI / 2;
  m.position.y = 0.01;
  m.renderOrder = 0;
  return m;
}

// ---------------------------------------------------------------- halo with rays, behind a piece
export function halo({ width = 20, height = 9, intensity = 1, rays = 18, rayAmount = 0.35 } = {}) {
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uA: { value: COLORS.cyan }, uB: { value: COLORS.pink }, uIntensity: { value: intensity }, uTime: time,
      uAspect: { value: width / height }, uRays: { value: rays }, uRayAmount: { value: rayAmount }, ...fogUniforms(),
    },
    vertexShader: /* glsl */`
      varying vec2 vUv;
      varying vec3 vW;
      void main() {
        vUv = uv;
        vec4 w = modelMatrix * vec4(position, 1.0);
        vW = w.xyz;
        gl_Position = projectionMatrix * viewMatrix * w;
      }
    `,
    fragmentShader: /* glsl */`
      uniform vec3 uA;
      uniform vec3 uB;
      uniform float uIntensity;
      uniform float uTime;
      uniform float uAspect;
      uniform float uRays;
      uniform float uRayAmount;
      varying vec2 vUv;
      varying vec3 vW;
      ${FOG_GLSL}
      void main() {
        vec2 p = (vUv - 0.5) * 2.0;
        float edge = (1.0 - smoothstep(0.7, 1.0, abs(p.x))) * (1.0 - smoothstep(0.6, 1.0, abs(p.y)));
        p.x *= 0.62;
        float r = length(p);
        float ang = atan(p.y, p.x);
        float rays = pow(0.5 + 0.5 * sin(ang * uRays + 1.3 * sin(ang * 5.0) + uTime * 0.06), 7.0);
        rays += pow(0.5 + 0.5 * sin(ang * uRays * 2.3 - uTime * 0.04 + 1.0), 16.0) * 0.6;
        float glow = exp(-r * r * 4.0);
        float body = rays * exp(-r * 3.0) * uRayAmount + glow * 0.45;
        vec3 tint = mix(uA, uB, smoothstep(-0.6, 0.6, p.x + sin(uTime * 0.1) * 0.2));
        vec3 col = tint * body * uIntensity * edge * (1.0 - fogAmount(vW));
        gl_FragColor = vec4(col, 1.0);
        ${OUT}
      }
    `,
  });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(width, height), mat);
  m.renderOrder = 0;
  return m;
}

// ---------------------------------------------------------------- motes of light
export function createDust(count, span) {
  const pos = new Float32Array(count * 3);
  const seed = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 30;
    pos[i * 3 + 1] = Math.random() * 6;
    pos[i * 3 + 2] = span[0] - Math.random() * (span[0] - span[1]);
    seed[i] = Math.random();
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uTime: time, uPR: { value: 1 }, uMotion: { value: 1 }, uA: { value: COLORS.cyan }, uB: { value: COLORS.pink } },
    vertexShader: /* glsl */`
      attribute float aSeed;
      uniform float uTime;
      uniform float uPR;
      uniform float uMotion;
      varying float vA;
      varying float vS;
      void main() {
        vec3 p = position;
        float t = uTime * uMotion;
        p.x += sin(t * 0.11 + aSeed * 31.0) * 0.5;
        p.y = mod(p.y + t * (0.02 + aSeed * 0.04), 6.0);
        p.z += cos(t * 0.09 + aSeed * 17.0) * 0.5;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        vA = (0.3 + 0.7 * (0.5 + 0.5 * sin(t * (0.8 + aSeed * 2.0) + aSeed * 50.0))) * (1.0 - smoothstep(3.0, 22.0, -mv.z)) * smoothstep(0.3, 1.5, -mv.z);
        vS = aSeed;
        gl_PointSize = (0.8 + aSeed * 1.8) * uPR * (6.0 / max(1.0, -mv.z));
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */`
      uniform vec3 uA;
      uniform vec3 uB;
      varying float vA;
      varying float vS;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        float a = (1.0 - smoothstep(0.0, 0.5, d)) * vA * 0.45;
        gl_FragColor = vec4(mix(uA, uB, vS) * a, 1.0);
        ${OUT}
      }
    `,
  });
  const pts = new THREE.Points(g, mat);
  pts.frustumCulled = false;
  return pts;
}

// ---------------------------------------------------------------- motes around a piece
// Specks of light drifting up through the glow of one piece; they catch the light and fade in and out.
export function motes({ count = 60, radius = 2.5, height = 3, pr = Math.min(window.devicePixelRatio || 1, 2) } = {}) {
  const pos = new Float32Array(count * 3);
  const seed = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = Math.sqrt(Math.random()) * radius;
    pos[i * 3] = Math.cos(a) * r;
    pos[i * 3 + 1] = Math.random() * height;
    pos[i * 3 + 2] = Math.sin(a) * r * 0.7;
    seed[i] = Math.random();
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uTime: time, uPR: { value: pr }, uH: { value: height }, uA: { value: COLORS.cyan }, uB: { value: COLORS.pink }, ...fogUniforms() },
    vertexShader: /* glsl */`
      attribute float aSeed;
      uniform float uTime;
      uniform float uPR;
      uniform float uH;
      varying float vA;
      varying float vS;
      varying vec3 vW;
      void main() {
        vec3 p = position;
        float t = uTime;
        p.y = mod(p.y + t * (0.05 + aSeed * 0.08), uH);
        p.x += sin(t * 0.3 + aSeed * 40.0) * 0.15;
        p.z += cos(t * 0.25 + aSeed * 23.0) * 0.15;
        float life = sin(3.14159 * p.y / uH);
        vA = life * (0.35 + 0.65 * pow(0.5 + 0.5 * sin(t * (1.2 + aSeed * 2.5) + aSeed * 60.0), 3.0));
        vS = aSeed;
        vec4 w = modelMatrix * vec4(p, 1.0);
        vW = w.xyz;
        vec4 mv = viewMatrix * w;
        gl_PointSize = (1.2 + aSeed * 2.2) * uPR * (9.0 / max(1.0, -mv.z));
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */`
      uniform vec3 uA;
      uniform vec3 uB;
      varying float vA;
      varying float vS;
      varying vec3 vW;
      ${FOG_GLSL}
      void main() {
        float d = length(gl_PointCoord - 0.5);
        float a = (1.0 - smoothstep(0.0, 0.5, d)) * vA * (1.0 - fogAmount(vW));
        gl_FragColor = vec4(mix(mix(uA, uB, vS), vec3(1.0), 0.35) * a * 0.6, 1.0);
        ${OUT}
      }
    `,
  });
  const pts = new THREE.Points(g, mat);
  pts.frustumCulled = false;
  pts.renderOrder = 4;
  return pts;
}

// ---------------------------------------------------------------- post
const FinalShader = {
  uniforms: { tDiffuse: { value: null }, uTime: { value: 0 }, uGrain: { value: 0.022 } },
  vertexShader: /* glsl */`
    varying vec2 vUv;
    void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
  `,
  fragmentShader: /* glsl */`
    uniform sampler2D tDiffuse;
    uniform float uTime;
    uniform float uGrain;
    varying vec2 vUv;
    float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
    void main() {
      vec2 c = vUv - 0.5;
      float d = dot(c, c);
      vec2 off = c * d * 0.012;
      vec3 col;
      col.r = texture2D(tDiffuse, vUv + off).r;
      col.g = texture2D(tDiffuse, vUv).g;
      col.b = texture2D(tDiffuse, vUv - off).b;
      col *= mix(1.0, 0.35, smoothstep(0.05, 0.55, d));
      col += (hash(vUv * 1000.0 + fract(uTime * 7.0) * 100.0) - 0.5) * uGrain * (0.3 + col);
      gl_FragColor = vec4(col, 1.0);
    }
  `,
};

export function createPost(renderer, scene, camera, { msaa = 4 } = {}) {
  const size = renderer.getDrawingBufferSize(new THREE.Vector2());
  const rt = new THREE.WebGLRenderTarget(size.x, size.y, { type: THREE.HalfFloatType, samples: msaa });
  const composer = new EffectComposer(renderer, rt);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(size.x, size.y), 0.32, 0.45, 0.96);
  composer.addPass(bloom);
  const final = new ShaderPass(FinalShader);
  composer.addPass(final);
  composer.addPass(new OutputPass());
  return {
    composer,
    setSize(w, h, pr) {
      composer.setPixelRatio(pr);
      composer.setSize(w, h);
    },
    render(t) {
      final.uniforms.uTime.value = t;
      composer.render();
    },
  };
}
