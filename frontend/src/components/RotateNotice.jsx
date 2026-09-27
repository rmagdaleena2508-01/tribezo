import { useEffect, useState } from "react";
import { Smartphone } from "lucide-react";

// On a phone, Tribezo is played with the phone turned sideways (the wide
// way), like most games. A phone held upright (a narrow touch screen)
// gets a message asking to turn it. Laptops and tablets are not affected.
const PHONE_UPRIGHT = "(orientation: portrait) and (pointer: coarse) and (max-width: 540px)";

export default function RotateNotice() {
  const [upright, setUpright] = useState(() => window.matchMedia(PHONE_UPRIGHT).matches);

  useEffect(() => {
    const query = window.matchMedia(PHONE_UPRIGHT);
    const onChange = () => setUpright(query.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  if (!upright) return null;

  return (
    <div role="alert" className="fixed inset-0 z-[100] grid place-items-center bg-night px-8 text-center">
      <div>
        <Smartphone size={44} className="mx-auto mb-4 rotate-90 text-parchment" strokeWidth={1.6} />
        <p className="title-text font-display text-3xl font-semibold">Please turn your phone sideways</p>
        <p className="mt-2 text-parchment/80">Tribezo is played with your phone held the wide way, like most games.</p>
      </div>
    </div>
  );
}
