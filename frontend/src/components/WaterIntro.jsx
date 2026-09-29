import { useEffect, useRef } from "react";
// Only the GSAP core: it moves plain numbers. The part of GSAP that writes
// styles is left out, because the site's security rules block how it works.
import { gsap } from "gsap/gsap-core";
import { Mesh, Program, Renderer, Texture, Triangle } from "ogl";
import { scenes, hero } from "../lib/content.js";

// The opening of the game, drawn on the graphics card with WebGL.
//
// 1. A starry night sky. My icon and the word "builds" fade in and out.
// 2. The dark sky fades a little, and a line of water rises from the
//    bottom to the top. Below the water line, the island picture shows,
//    rippling. The edge of the water is wavy and dissolves into the sky,
//    with a soft glow of foam along it.
// 3. The island picture comes up with the water, then settles down into
//    place as the ripples calm.
// 4. The opening fades into the real scene, and the title starts.
//
// The picture is made by a small program (a "shader", written in GLSL)
// that works out the color of every pixel, 60 times a second. OGL is a
// tiny library that sets up WebGL for it, and GSAP times each part.

const TIMING = {
  badgeIn: 0.35,
  badgeOut: 1.95,
  skyFade: 2.6, // the dark sky starts fading
  riseStart: 2.8, // the water starts rising
  riseSeconds: 3.4,
  fadeSeconds: 0.6, // the opening fades into the real scene
};

const VERTEX = /* glsl */ `
  attribute vec2 uv;
  attribute vec2 position;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const FRAGMENT = /* glsl */ `
  precision highp float;

  uniform sampler2D uImage;
  uniform vec2 uResolution;  // the screen, in pixels
  uniform vec2 uImageSize;   // the picture, in pixels
  uniform float uTime;       // seconds since the opening began
  uniform float uRise;       // 0 = no water yet, 1 = the water has passed the top
  uniform float uSkyFade;    // 0 = full night sky, 1 = the sky has faded
  uniform float uPixelRatio;
  varying vec2 vUv;          // 0,0 is the bottom left, 1,1 is the top right

  // ---- Soft random patterns (noise), the base of the water shapes ----
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }
  float fbm(vec2 p) {
    float value = 0.0;
    float amount = 0.5;
    for (int i = 0; i < 5; i++) {
      value += amount * noise(p);
      p *= 2.03;
      amount *= 0.5;
    }
    return value;
  }

  // ---- The picture, covering the screen like the real background ----
  // The real background is a little bigger than the screen (32 pixels on
  // each side) and a little zoomed in, so this matches it for a smooth
  // hand over at the end.
  vec2 pictureUv(vec2 uv) {
    vec2 pixel = uv * uResolution;
    vec2 box = uResolution + 64.0 * uPixelRatio;
    vec2 boxUv = (pixel + 32.0 * uPixelRatio) / box;
    boxUv = (boxUv - 0.5) / 1.06 + 0.5;
    float boxShape = box.x / box.y;
    float imageShape = uImageSize.x / uImageSize.y;
    vec2 scale = boxShape > imageShape ? vec2(1.0, imageShape / boxShape) : vec2(boxShape / imageShape, 1.0);
    // OGL already turns the picture the right way up.
    return (boxUv - 0.5) * scale + 0.5;
  }

  // ---- The night sky: a soft glow, twinkling stars, a shooting star ----
  vec3 sky(vec2 uv) {
    float shape = uResolution.x / uResolution.y;
    vec2 p = vec2(uv.x * shape, uv.y);
    float glow = length(p - vec2(0.5 * shape, 0.38));
    vec3 color = mix(vec3(0.063, 0.102, 0.18), vec3(0.02, 0.027, 0.055), smoothstep(0.0, 1.1, glow));

    vec2 grid = p * 70.0;
    vec2 id = floor(grid);
    float h = hash(id);
    if (h > 0.982) {
      vec2 spot = vec2(hash(id + 1.3), hash(id + 7.1)) - 0.5;
      float twinkle = 0.5 + 0.5 * sin(uTime * (1.0 + h * 3.0) + h * 40.0);
      float star = smoothstep(0.09, 0.0, length(fract(grid) - 0.5 - spot * 0.6));
      color += vec3(1.0) * star * twinkle * 0.9;
    }

    float shoot = (uTime - 0.65) / 0.9;
    if (shoot > 0.0 && shoot < 1.0) {
      vec2 head = vec2((0.08 + shoot * 0.7) * shape, 0.86 - shoot * 0.12);
      vec2 dir = normalize(vec2(0.7 * shape, -0.12));
      vec2 d = p - head;
      float along = dot(d, -dir);
      float across = abs(d.x * dir.y - d.y * dir.x);
      float tail = step(0.0, along) * smoothstep(0.18, 0.0, along);
      color += vec3(1.0) * tail * smoothstep(0.004, 0.0, across) * sin(shoot * 3.14159) * 0.9;
    }

    // The dark sky fades as the water comes.
    return color * mix(1.0, 0.45, uSkyFade);
  }

  void main() {
    vec2 uv = vUv;
    float t = uTime;

    // The water line: it rises from below the bottom to above the top,
    // with slow waves and a little noise so it is never a straight line.
    float waves = 0.035 * sin(uv.x * 9.0 + t * 2.2)
                + 0.022 * sin(uv.x * 17.0 - t * 3.1)
                + 0.07 * (fbm(vec2(uv.x * 3.0, t * 0.35)) - 0.5);
    float line = uRise * 1.35 - 0.2 + waves;
    float height = uv.y - line; // below 0 is under water, above 0 is sky

    // The edge dissolves into the sky in soft, uneven patches.
    float patches = fbm(uv * vec2(6.0, 4.0) + vec2(0.0, t * 0.25));
    float skyAmount = smoothstep(0.0, 0.14, height + (patches - 0.5) * 0.16);

    // The picture comes up with the water, then settles into place.
    float settle = 1.0 - smoothstep(0.0, 1.0, uRise);
    vec2 pictureAt = uv;
    pictureAt.y -= settle * 0.07;
    float ripple = exp(-abs(height) * 12.0) * (0.01 + settle * 0.02);
    pictureAt += vec2(sin(uv.y * 40.0 - t * 6.0), cos(uv.x * 30.0 + t * 4.0)) * ripple;
    pictureAt.x += sin(uv.y * 6.0 + t * 1.5) * 0.006 * settle;
    vec3 picture = texture2D(uImage, pictureUv(pictureAt)).rgb;

    // A soft glow of foam along the water line.
    float foam = exp(-abs(height + (patches - 0.5) * 0.16) * 55.0) * (1.0 - smoothstep(0.95, 1.0, uRise));

    vec3 color = mix(picture, sky(uv), skyAmount);
    color += vec3(0.75, 0.9, 1.0) * foam * 0.5;
    gl_FragColor = vec4(color, 1.0);
  }
`;

export default function WaterIntro({ onDone }) {
  const holderRef = useRef(null);
  const badgeRef = useRef(null);

  useEffect(() => {
    const holder = holderRef.current;

    // Set up WebGL. If this device cannot, skip straight to the game.
    let renderer;
    try {
      renderer = new Renderer({ dpr: Math.min(window.devicePixelRatio || 1, 2), alpha: false, antialias: false });
    } catch {
      onDone();
      return undefined;
    }
    const gl = renderer.gl;
    if (!gl) {
      onDone();
      return undefined;
    }
    gl.canvas.style.width = "100%";
    gl.canvas.style.height = "100%";
    holder.prepend(gl.canvas);

    const texture = new Texture(gl, { generateMipmaps: false });
    const program = new Program(gl, {
      vertex: VERTEX,
      fragment: FRAGMENT,
      uniforms: {
        uImage: { value: texture },
        uResolution: { value: [1, 1] },
        uImageSize: { value: [16, 9] },
        uTime: { value: 0 },
        uRise: { value: 0 },
        uSkyFade: { value: 0 },
        uPixelRatio: { value: renderer.dpr },
      },
    });
    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });

    const image = new Image();
    image.onload = () => {
      texture.image = image;
      program.uniforms.uImageSize.value = [image.width, image.height];
    };
    image.src = scenes[hero.scene].src;

    const resize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      program.uniforms.uResolution.value = [gl.canvas.width, gl.canvas.height];
    };
    resize();
    window.addEventListener("resize", resize);

    // Draw every frame, following the real clock.
    const start = performance.now();
    const draw = () => {
      program.uniforms.uTime.value = (performance.now() - start) / 1000;
      renderer.render({ scene: mesh });
    };
    gsap.ticker.lagSmoothing(0);
    gsap.ticker.add(draw);

    // GSAP moves plain numbers. They go into the shader, or onto the
    // icon's style, which the site's security rules allow.
    const badge = { opacity: 0, y: 10, blur: 6 };
    const showBadge = () => {
      const style = badgeRef.current.style;
      style.opacity = badge.opacity;
      style.transform = `translateY(${badge.y}px)`;
      style.filter = `blur(${badge.blur}px)`;
    };
    const fade = { opacity: 1 };
    const showFade = () => {
      holder.style.opacity = fade.opacity;
    };
    const uniforms = program.uniforms;
    const water = { rise: 0, sky: 0 };
    const showWater = () => {
      uniforms.uRise.value = water.rise;
      uniforms.uSkyFade.value = water.sky;
    };

    const timeline = gsap.timeline();
    timeline
      .to(badge, { opacity: 1, y: 0, blur: 0, duration: 0.9, ease: "power2.out", onUpdate: showBadge }, TIMING.badgeIn)
      .to(badge, { opacity: 0, y: -8, blur: 4, duration: 0.7, ease: "power2.in", onUpdate: showBadge }, TIMING.badgeOut)
      .to(water, { sky: 1, duration: 1.4, ease: "sine.inOut", onUpdate: showWater }, TIMING.skyFade)
      .to(water, { rise: 1, duration: TIMING.riseSeconds, ease: "power2.inOut", onUpdate: showWater }, TIMING.riseStart)
      .to(fade, { opacity: 0, duration: TIMING.fadeSeconds, ease: "sine.out", onUpdate: showFade, onComplete: onDone }, TIMING.riseStart + TIMING.riseSeconds - 0.15);

    return () => {
      timeline.kill();
      gsap.ticker.remove(draw);
      window.removeEventListener("resize", resize);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      gl.canvas.remove();
    };
  }, [onDone]);

  return (
    <div ref={holderRef} aria-hidden="true" className="pointer-events-none fixed inset-0 z-[90] bg-[#05070e]">
      {/* My icon, with "builds" beside it */}
      <div ref={badgeRef} className="absolute inset-0 flex items-center justify-center gap-4 sm:gap-5" style={{ opacity: 0 }}>
        <img src={`${import.meta.env.BASE_URL}intro/icon.webp`} alt="" className="h-16 w-auto sm:h-20" draggable="false" />
        <span className="font-script text-6xl leading-none text-[#fbf5eb] sm:text-7xl">builds</span>
      </div>
    </div>
  );
}
