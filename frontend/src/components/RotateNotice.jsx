import { useEffect, useState } from "react";
import { Smartphone } from "lucide-react";

// Phones are held upright for Tribezo. A phone turned on its side
// (a touch screen that is wider than tall and short) gets a message
// asking to turn it back. Laptops and tablets are not affected.
const PHONE_ON_ITS_SIDE = "(orientation: landscape) and (pointer: coarse) and (max-height: 540px)";

export default function RotateNotice() {
  const [sideways, setSideways] = useState(() => window.matchMedia(PHONE_ON_ITS_SIDE).matches);

  useEffect(() => {
    const query = window.matchMedia(PHONE_ON_ITS_SIDE);
    const onChange = () => setSideways(query.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  if (!sideways) return null;

  return (
    <div role="alert" className="fixed inset-0 z-[100] grid place-items-center bg-night px-8 text-center">
      <div>
        <Smartphone size={44} className="mx-auto mb-4 text-parchment" strokeWidth={1.6} />
        <p className="font-serif text-3xl font-semibold text-parchment">Please turn your phone upright</p>
        <p className="mt-2 text-parchment/75">Tribezo is made to be played with your phone held the tall way.</p>
      </div>
    </div>
  );
}
