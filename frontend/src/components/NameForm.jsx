import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { MAX_NAME_LENGTH, benjiLines } from "../lib/content.js";
import { cleanName, isValidName } from "../lib/visitor.js";

// The glass box where you tell Benji your name.
export default function NameForm({ onDone }) {
  const [name, setName] = useState("");
  const [problem, setProblem] = useState("");

  function submit(event) {
    event.preventDefault();
    const clean = cleanName(name);
    if (!isValidName(clean)) {
      setProblem(benjiLines.badName);
      return;
    }
    onDone(clean);
  }

  return (
    <form onSubmit={submit} className="glass flex flex-col gap-2 rounded-[28px] p-2">
      <div className="flex items-center gap-2">
        <label htmlFor="visitor-name" className="sr-only">
          Your name
        </label>
        <input
          id="visitor-name"
          value={name}
          maxLength={MAX_NAME_LENGTH}
          onChange={(event) => {
            setName(event.target.value);
            setProblem("");
          }}
          placeholder="Your name"
          autoComplete="given-name"
          autoFocus
          aria-invalid={problem ? "true" : "false"}
          aria-describedby={problem ? "name-problem" : undefined}
          className="h-11 flex-1 bg-transparent px-3 text-base text-white placeholder:text-white/75 focus:outline-none"
        />
        <button
          type="submit"
          aria-label="Tell Benji your name"
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/90 text-ink shadow-md hover:bg-white"
        >
          <ArrowRight size={20} strokeWidth={2.2} />
        </button>
      </div>
      {problem && (
        <p id="name-problem" role="alert" className="px-3 pb-1 text-sm">
          {problem}
        </p>
      )}
    </form>
  );
}
