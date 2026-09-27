import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { MAX_NAME_LENGTH, nameScreen } from "../lib/content.js";
import { cleanName, isValidName } from "../lib/visitor.js";

// The first screen: ask for the visitor's name. The box starts empty.
export default function NameScreen({ onDone }) {
  const [name, setName] = useState("");
  const [problem, setProblem] = useState("");

  function submit(event) {
    event.preventDefault();
    const clean = cleanName(name);
    if (!isValidName(clean)) {
      setProblem(nameScreen.badName);
      return;
    }
    onDone(clean);
  }

  return (
    <div className="absolute inset-0 z-20 grid place-items-center px-5">
      <motion.form
        onSubmit={submit}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="glass w-full max-w-md rounded-[32px] px-6 pb-6 pt-7 sm:px-8"
      >
        <h1 className="font-serif text-4xl font-semibold leading-tight sm:text-5xl">{nameScreen.title}</h1>
        <label htmlFor="visitor-name" className="mt-2 block text-lg">
          {nameScreen.question}
        </label>

        <div className="mt-5 flex items-center gap-2 rounded-full border border-white/50 bg-white/15 p-1.5 pl-4">
          <input
            id="visitor-name"
            value={name}
            maxLength={MAX_NAME_LENGTH}
            onChange={(event) => {
              setName(event.target.value);
              setProblem("");
            }}
            autoComplete="given-name"
            autoFocus
            aria-invalid={problem ? "true" : "false"}
            aria-describedby={problem ? "name-problem" : undefined}
            className="h-11 min-w-0 flex-1 bg-transparent text-lg text-white focus:outline-none"
          />
          <button
            type="submit"
            aria-label="Continue"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/90 text-ink shadow-md hover:bg-white"
          >
            <ArrowRight size={20} strokeWidth={2.2} />
          </button>
        </div>

        {problem && (
          <p id="name-problem" role="alert" className="mt-3 px-2 text-sm">
            {problem}
          </p>
        )}
      </motion.form>
    </div>
  );
}
