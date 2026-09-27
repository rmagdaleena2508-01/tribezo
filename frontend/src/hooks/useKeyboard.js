import { useEffect, useState } from "react";

// Watches the phone's on-screen keyboard.
//
// When the keyboard opens, the browser shrinks the "visual viewport" (the
// part of the page you can see) but the page itself stays the same size.
// This works out how much of the bottom of the screen the keyboard covers,
// and saves it in the CSS variable --keyboard-inset. The chat box uses it
// to sit just above the keyboard, while the scene and the characters stay
// exactly where they are, so nothing jumps or squashes.
//
// Returns true while the keyboard is open.
export function useKeyboard() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;

    const update = () => {
      const covered = Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop);
      // Small differences come from browser toolbars, not the keyboard.
      const inset = covered > 80 ? covered : 0;
      document.documentElement.style.setProperty("--keyboard-inset", `${inset}px`);
      setOpen(inset > 0);
    };

    update();
    viewport.addEventListener("resize", update);
    viewport.addEventListener("scroll", update);
    return () => {
      viewport.removeEventListener("resize", update);
      viewport.removeEventListener("scroll", update);
      document.documentElement.style.setProperty("--keyboard-inset", "0px");
    };
  }, []);

  return open;
}
