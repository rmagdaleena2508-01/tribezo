import { Link } from "react-router-dom";
import Scene from "../components/Scene.jsx";

export default function NotFound() {
  return (
    <main className="relative grid h-[100svh] place-items-center overflow-hidden px-6 text-center">
      <Scene scene="jungle-path" layer="back" />
      <div className="glass relative rounded-3xl px-8 py-7">
        <p className="font-serif text-6xl font-semibold">tsoL</p>
        <p className="mt-2">This path does not lead anywhere.</p>
        <Link to="/" className="mt-5 inline-block rounded-full bg-white/90 px-5 py-2.5 font-medium text-ink [text-shadow:none] hover:bg-white">
          Back to Zazo
        </Link>
      </div>
    </main>
  );
}
