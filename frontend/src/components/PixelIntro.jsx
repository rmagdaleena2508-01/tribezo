import { useEffect, useRef } from "react";
// Only the GSAP core: it moves plain numbers. The part of GSAP that writes
// styles is left out, because the site's security rules block how it works.
import { gsap } from "gsap/gsap-core";

// The opening of the game.
//
// 1. A starry night sky (twinkling stars and one shooting star). Your icon
//    and the word "builds" fade in, stay for a moment, and fade out.
// 2. After about 2.8 seconds, the sky dissolves into pixel blocks from the
//    top to the bottom, showing the island underneath. This is the same
//    method as the opening of my MagWorks portfolio:
//      - The screen is cut into square blocks.
//      - Each block gets a "turn" based on its row, plus a little random
//        extra, so the edge of the reveal is soft and uneven, not a line.
//      - GSAP moves one number, "progress", from the top to the bottom
//        with a gentle start and end (sine.inOut).
//      - Each block fades out over a short window as progress passes its
//        turn, so nothing ever disappears all at once.
//    While the reveal moves down, the rest of the sky keeps twinkling.
//
// onDone runs when the last block has faded, so the title can start.

const SKY_SECONDS = 2.8; // the starry sky, before the reveal starts (at least 2.5)
const REVEAL_SECONDS = 2.9; // the pixel reveal, top to bottom
const SPREAD = 7; // how many rows a block's turn can be moved by, for a soft edge
const FADE = 0.24; // how long each block takes to fade, as a share of the reveal

export default function PixelIntro({ onDone }) {
  const canvasRef = useRef(null);
  const badgeRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    let width, height, stars, cell, columns, rows, turns;
    const reveal = { progress: -FADE }; // GSAP moves this from -FADE to 1 + FADE
    let revealing = false;
    const startTime = performance.now();

    function build() {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.ceil(width * ratio);
      canvas.height = Math.ceil(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);

      stars = Array.from({ length: 180 }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 1.3 + 0.3,
        brightness: Math.random() * 0.5 + 0.35,
        speed: Math.random() * 1.8 + 0.6,
        phase: Math.random() * Math.PI * 2,
      }));

      // Square blocks, about 26 across the short side of the screen.
      cell = Math.max(20, Math.round(Math.min(width, height) / 26));
      columns = Math.ceil(width / cell);
      rows = Math.ceil(height / cell);
      turns = new Float32Array(columns * rows);
      for (let row = 0; row < rows; row++) {
        for (let column = 0; column < columns; column++) {
          turns[row * columns + column] = (row + Math.random() * SPREAD) / (rows + SPREAD);
        }
      }
    }

    function drawSky(time) {
      const glow = context.createRadialGradient(width * 0.5, height * 0.62, 0, width * 0.5, height * 0.62, Math.max(width, height) * 0.8);
      glow.addColorStop(0, "#101a2e");
      glow.addColorStop(0.55, "#0a1120");
      glow.addColorStop(1, "#05070e");
      context.globalCompositeOperation = "source-over";
      context.globalAlpha = 1;
      context.fillStyle = glow;
      context.fillRect(0, 0, width, height);

      for (const star of stars) {
        context.globalAlpha = star.brightness * (0.5 + 0.5 * Math.sin(time * 0.001 * star.speed + star.phase));
        context.fillStyle = "#ffffff";
        context.beginPath();
        context.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        context.fill();
      }
      context.globalAlpha = 1;

      // One shooting star across the top.
      const shootStart = 650;
      const shootLength = 900;
      if (time > shootStart && time < shootStart + shootLength) {
        const p = (time - shootStart) / shootLength;
        const x = width * 0.08 + p * width * 0.7;
        const y = height * 0.14 + p * height * 0.12;
        const fade = Math.sin(p * Math.PI);
        const tail = context.createLinearGradient(x - 180, y - 50, x, y);
        tail.addColorStop(0, "rgba(255,255,255,0)");
        tail.addColorStop(1, `rgba(255,255,255,${0.9 * fade})`);
        context.strokeStyle = tail;
        context.lineWidth = 2;
        context.lineCap = "round";
        context.beginPath();
        context.moveTo(x - 180, y - 50);
        context.lineTo(x, y);
        context.stroke();
      }
    }

    // Take away the sky block by block. "cover" is how much of a block's
    // sky is still there: 1 is all sky, 0 is gone (the island shows).
    function drawReveal() {
      const p = reveal.progress;
      for (let row = 0; row < rows; row++) {
        const y = row * cell;
        for (let column = 0; column < columns; column++) {
          const cover = (turns[row * columns + column] - p) / FADE;
          if (cover >= 1) continue; // still fully sky
          const x = column * cell;
          if (cover <= 0) {
            context.clearRect(x, y, cell, cell);
            continue;
          }
          // Part way: fade the sky out of this block...
          context.globalCompositeOperation = "destination-out";
          context.globalAlpha = 1 - cover;
          context.fillRect(x, y, cell, cell);
          // ...and give it a faint glass edge while it fades, so it reads as a pixel.
          context.globalCompositeOperation = "source-over";
          context.globalAlpha = cover * 0.5;
          context.fillStyle = "rgba(255,255,255,0.16)";
          context.fillRect(x, y, cell, 2);
          context.globalAlpha = cover * 0.4;
          context.strokeStyle = "rgba(255,255,255,0.1)";
          context.lineWidth = 1;
          context.strokeRect(x + 0.5, y + 0.5, cell - 1, cell - 1);
        }
      }
      context.globalCompositeOperation = "source-over";
      context.globalAlpha = 1;
    }

    function draw() {
      drawSky(performance.now() - startTime);
      if (revealing) drawReveal();
    }

    build();
    draw();
    gsap.ticker.add(draw);
    window.addEventListener("resize", build);

    // Follow the real clock, even if the browser draws slowly (for example
    // in a background tab), so the opening always takes the same time.
    gsap.ticker.lagSmoothing(0);

    // The timeline: the icon and "builds" fade in and out over the sky,
    // then the pixel reveal runs from the top to the bottom.
    //
    // GSAP moves plain numbers here, and the numbers are copied onto the
    // icon's style. The site's security rules block some of the ways GSAP
    // writes styles itself, but they allow this one.
    const badge = { opacity: 0, y: 10, blur: 6 };
    const showBadge = () => {
      const style = badgeRef.current.style;
      style.opacity = badge.opacity;
      style.transform = `translateY(${badge.y}px)`;
      style.filter = `blur(${badge.blur}px)`;
    };
    showBadge();

    const timeline = gsap.timeline();
    timeline
      .to(badge, { opacity: 1, y: 0, blur: 0, duration: 0.9, ease: "power2.out", onUpdate: showBadge }, 0.35)
      .to(badge, { opacity: 0, y: -8, blur: 4, duration: 0.7, ease: "power2.in", onUpdate: showBadge }, 1.95)
      .add(() => {
        revealing = true;
      }, SKY_SECONDS)
      .to(reveal, { progress: 1 + FADE, duration: REVEAL_SECONDS, ease: "sine.inOut", onComplete: onDone }, SKY_SECONDS);

    return () => {
      timeline.kill();
      gsap.ticker.remove(draw);
      window.removeEventListener("resize", build);
    };
  }, [onDone]);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[90]">
      <canvas ref={canvasRef} className="h-full w-full" />
      {/* Your icon, with "builds" beside it */}
      <div ref={badgeRef} className="absolute inset-0 flex items-center justify-center gap-4 sm:gap-5" style={{ opacity: 0 }}>
        <img src={`${import.meta.env.BASE_URL}intro/icon.webp`} alt="" className="h-16 w-auto sm:h-20" draggable="false" />
        <span className="font-script text-6xl leading-none text-[#fbf5eb] sm:text-7xl">builds</span>
      </div>
    </div>
  );
}
