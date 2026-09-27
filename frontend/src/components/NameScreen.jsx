import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { MAX_NAME_LENGTH, nameScreen } from "../lib/content.js";
import { cleanName, isValidName } from "../lib/visitor.js";

// The glass box at the bottom where you tell Benji your name.
// The box starts empty, with no hint text inside it.
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
    // Close the phone keyboard so the characters can be seen again.
    document.activeElement?.blur();
    onDone(clean);
  }

  return (
    <form onSubmit={submit} className="glass rounded-[28px] p-2">
      <div className="flex items-center gap-2">
        <label htmlFor="visitor-name" className="shrink-0 pl-3 font-display text-lg font-medium">
          {nameScreen.question}
        </label>
        <input
          id="visitor-name"
          value={name}
          maxLength={MAX_NAME_LENGTH}
          onChange={(event) => {
            setName(event.target.value);
            setProblem("");
          }}
          autoComplete="given-name"
          autoCapitalize="words"
          enterKeyHint="done"
          autoFocus
          aria-invalid={problem ? "true" : "false"}
          aria-describedby={problem ? "name-problem" : undefined}
          className="h-11 min-w-0 flex-1 rounded-full bg-white/15 px-4 text-base font-semibold text-white focus:bg-white/25 focus:outline-none"
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
        <p id="name-problem" role="alert" className="px-3 pb-1 pt-2 text-sm">
          {problem}
        </p>
      )}
    </form>
  );
}
