import { useEffect, useRef, useState } from "react";

// The opening of the game, in two parts.
//
// 1. A starry night sky with twinkling stars, one shooting star, and a
//    small greeting. This is the same intro as in my portfolio.
// 2. The sky breaks into pixel blocks, row by row, from the top to the
//    bottom. Each block first shows a pixel of the island picture, then
//    clears, so the real island shows through. It fits the island, which
//    is built from blocks too.
//
// When the last row has cleared, onDone lets the title animation start.

const SKY_HOLD_MS = 1800; // how long the stars and greeting stay
const ROW_DELAY_MS = 40; // time between one row starting and the next
const ROW_SPREAD_MS = 70; // blocks in a row start a little apart, so it looks natural
const BLOCK_MS = 260; // how long each block shows its pixel before it clears

// Makes the same "random" numbers every time.
function seededRandom(seed) {
  let value = seed;
  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

export default function PixelIntro({ src, onDone }) {
  const canvasRef = useRef(null);
  const [greetingGone, setGreetingGone] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const random = seededRandom(7);
    let width, height, ratio, stars, block, columns, rows, starts, colors;
    let frame;
    let startTime = null;
    let finished = false;

    // The island picture, shrunk to one color per block.
    const image = new Image();
    let imageReady = false;
    image.onload = () => {
      imageReady = true;
      sampleColors();
    };
    image.src = src;

    function build() {
      ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);

      stars = Array.from({ length: 180 }, () => ({
        x: random() * width,
        y: random() * height,
        size: random() * 1.3 + 0.3,
        brightness: random() * 0.5 + 0.35,
        speed: random() * 1.8 + 0.6,
        phase: random() * Math.PI * 2,
      }));

      // Square blocks, about 48 across on a laptop.
      block = Math.max(18, Math.ceil(width / 48));
      columns = Math.ceil(width / block);
      rows = Math.ceil(height / block);

      // When each block starts, counted from the start of the wipe.
      starts = Array.from({ length: rows }, (_, row) =>
        Array.from({ length: columns }, () => row * ROW_DELAY_MS + random() * ROW_SPREAD_MS)
      );
      if (imageReady) sampleColors();
    }

    // Shrink the picture to one pixel per block, covering the screen the
    // same way the background does, and keep each block's color.
    function sampleColors() {
      if (!columns) return;
      const small = document.createElement("canvas");
      small.width = columns;
      small.height = rows;
      const smallContext = small.getContext("2d");
      const screenShape = (columns * block) / (rows * block);
      const imageShape = image.width / image.height;
      let sx = 0;
      let sy = 0;
      let sw = image.width;
      let sh = image.height;
      if (imageShape > screenShape) {
        sw = image.height * screenShape;
        sx = (image.width - sw) / 2;
      } else {
        sh = image.width / screenShape;
        sy = (image.height - sh) / 2;
      }
      smallContext.drawImage(image, sx, sy, sw, sh, 0, 0, columns, rows);
      const data = smallContext.getImageData(0, 0, columns, rows).data;
      colors = [];
      for (let i = 0; i < columns * rows; i++) {
        colors.push(`rgb(${data[i * 4]}, ${data[i * 4 + 1]}, ${data[i * 4 + 2]})`);
      }
    }

    function drawSky(time) {
      const glow = context.createRadialGradient(width * 0.5, height * 0.62, 0, width * 0.5, height * 0.62, Math.max(width, height) * 0.8);
      glow.addColorStop(0, "#101a2e");
      glow.addColorStop(0.55, "#0a1120");
      glow.addColorStop(1, "#05070e");
      context.fillStyle = glow;
      context.fillRect(0, 0, width, height);

      // Twinkling stars.
      for (const star of stars) {
        context.globalAlpha = star.brightness * (0.5 + 0.5 * Math.sin(time * 0.001 * star.speed + star.phase));
        context.fillStyle = "#ffffff";
        context.beginPath();
        context.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        context.fill();
      }
      context.globalAlpha = 1;

      // One shooting star across the top of the sky.
      const shootStart = 550;
      const shootLength = 900;
      if (time > shootStart && time < shootStart + shootLength) {
        const progress = (time - shootStart) / shootLength;
        const x = width * 0.08 + progress * width * 0.7;
        const y = height * 0.14 + progress * height * 0.12;
        const fade = Math.sin(progress * Math.PI);
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

    function draw(now) {
      if (startTime === null) startTime = now;
      const time = now - startTime;
      drawSky(time);

      // The wipe starts once the sky has been shown, and once the island
      // picture has loaded (or after 2 more seconds, whichever comes first).
      const wipeTime = time - SKY_HOLD_MS;
      if (wipeTime > 0 && (colors || wipeTime > 2000)) {
        let allClear = true;
        for (let row = 0; row < rows; row++) {
          for (let column = 0; column < columns; column++) {
            const progress = (wipeTime - starts[row][column]) / BLOCK_MS;
            const x = column * block;
            const y = row * block;
            if (progress >= 1) {
              context.clearRect(x, y, block, block); // the real island shows through
            } else {
              allClear = false;
              if (progress >= 0) {
                context.fillStyle = colors ? colors[row * columns + column] : "#0f1a14";
                context.fillRect(x, y, block, block);
              }
            }
          }
        }
        if (allClear && !finished) {
          finished = true;
          onDone();
          return;
        }
      }
      frame = requestAnimationFrame(draw);
    }

    build();
    frame = requestAnimationFrame(draw);
    const greetingTimer = setTimeout(() => setGreetingGone(true), SKY_HOLD_MS - 200);
    window.addEventListener("resize", build);

    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(greetingTimer);
      window.removeEventListener("resize", build);
    };
  }, [src, onDone]);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[90]">
      <canvas ref={canvasRef} className="h-full w-full" />
      <div
        className="absolute inset-x-0 bottom-[16vh] flex flex-col items-center px-6 text-center transition-opacity duration-500"
        style={{ opacity: greetingGone ? 0 : 1 }}
      >
        <p className="font-display text-2xl font-medium text-white/90 sm:text-[28px]">a small island, far past the edge of every map</p>
        <p className="mt-4 font-mono text-[11px] tracking-[0.35em] text-white/45">· Tribezo ·</p>
      </div>
    </div>
  );
}
