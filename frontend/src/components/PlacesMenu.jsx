import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MapPin } from "lucide-react";
import GlassButton from "./GlassButton.jsx";
import { places, scenes } from "../lib/content.js";

// The Places button at the top: a small map of every place on the island,
// each with a little picture. Picking a place takes you straight there,
// and Zazo starts by telling you about it. You can also just type
// "can we go to the beach?".
export default function PlacesMenu({ here, seen, disabled, onPick }) {
  const [open, setOpen] = useState(false);
  const box = useRef(null);
  const button = useRef(null);

  // Close on Escape, or on a click anywhere else.
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
        button.current?.focus();
      }
    };
    const onClick = (event) => {
      if (!box.current?.contains(event.target)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onClick);
    };
  }, [open]);

  function pick(place) {
    setOpen(false);
    onPick(place);
  }

  return (
    <div ref={box} className="relative">
      <GlassButton
        ref={button}
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls="places-list"
        className="h-11 rounded-full px-4 text-sm font-bold short:h-9"
      >
        <MapPin size={18} />
        <span>Places</span>
      </GlassButton>

      <AnimatePresence>
        {open && (
          <motion.div
            id="places-list"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="glass absolute right-0 top-[calc(100%+8px)] z-40 w-72 rounded-3xl bg-black/30 p-2 short:max-h-[70svh] short:overflow-y-auto"
            data-lenis-prevent
          >
            <p className="px-3 pb-1 pt-2 font-display text-xs font-semibold uppercase tracking-wider text-white/85">
              Go to
            </p>
            <ul>
              {places.map((place) => {
                const isHere = place.scene === here;
                return (
                  <li key={place.scene}>
                    <button
                      type="button"
                      disabled={isHere || disabled}
                      onClick={() => pick(place)}
                      className="flex w-full items-center gap-3 rounded-2xl px-2 py-1.5 text-left text-sm font-bold text-white transition-colors hover:bg-white/15 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                    >
                      <img
                        src={scenes[place.scene].src}
                        alt=""
                        draggable="false"
                        className={`h-10 w-14 shrink-0 rounded-xl object-cover ${isHere ? "ring-2 ring-white/90" : ""}`}
                      />
                      <span className={`flex-1 ${isHere ? "text-white/70" : ""}`}>{place.name}</span>
                      <span className="font-display text-[11px] font-semibold uppercase tracking-wider text-white/75">
                        {isHere ? "You are here" : seen.includes(place.scene) ? "" : "New"}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
