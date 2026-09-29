import { useEffect, useRef, useState } from "react";

// How many blocks wide the picture is at each step, from big chunky
// blocks to almost sharp. It fits the island's voxel look.
const STEPS = [4, 7, 12, 20, 34, 56, 96, 160];
const STEP_MS = 120;
const FADE_MS = 450;

// The opening of the game: the first picture appears as big pixel blocks
// that get smaller and smaller until the picture is sharp. Then it fades
// into the real scene, and onDone lets the title animation start.
export default function PixelIntro({ src, onDone }) {
  const canvasRef = useRef(null);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const image = new Image();
    let timers = [];
    let cancelled = false;

    // Draw the picture with this many blocks across, covering the whole
    // screen like the background does.
    function draw(blocksAcross) {
      const width = window.innerWidth;
      const height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;

      // The part of the picture that fits the screen's shape.
      const screenShape = width / height;
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

      // Shrink the picture to a few blocks, then stretch it back up with
      // no smoothing, so every block has sharp edges.
      const small = document.createElement("canvas");
      small.width = blocksAcross;
      small.height = Math.max(1, Math.round(blocksAcross / screenShape));
      small.getContext("2d").drawImage(image, sx, sy, sw, sh, 0, 0, small.width, small.height);

      context.imageSmoothingEnabled = false;
      context.drawImage(small, 0, 0, small.width, small.height, 0, 0, width, height);
    }

    function finish() {
      if (cancelled) return;
      setFading(true);
      timers.push(setTimeout(onDone, FADE_MS));
    }

    image.onload = () => {
      if (cancelled) return;
      STEPS.forEach((blocks, i) => timers.push(setTimeout(() => draw(blocks), i * STEP_MS)));
      timers.push(setTimeout(finish, STEPS.length * STEP_MS + 150));
    };
    // If the picture cannot load, skip straight to the game.
    image.onerror = finish;
    image.src = src;

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [src, onDone]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[90] h-full w-full bg-night"
      style={{ opacity: fading ? 0 : 1, transition: `opacity ${FADE_MS}ms ease-out` }}
    />
  );
}
