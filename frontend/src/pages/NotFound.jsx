import { Link } from "react-router-dom";
import ForestScene from "../components/ForestScene.jsx";

export default function NotFound() {
  return (
    <main className="relative grid h-[100svh] place-items-center overflow-hidden px-6 text-center">
      <ForestScene />
      <div className="relative">
        <p className="font-serif text-6xl font-semibold">tsoL</p>
        <p className="mt-2 text-parchment/70">This path does not lead anywhere.</p>
        <Link
          to="/"
          className="mt-6 inline-block rounded-full bg-ember px-5 py-2.5 font-medium text-night hover:bg-[#e8894a]"
        >
          Back to the tribe
        </Link>
      </div>
    </main>
  );
}
