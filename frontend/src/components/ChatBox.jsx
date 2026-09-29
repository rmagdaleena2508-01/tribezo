import { useState } from "react";
import { SendHorizontal } from "lucide-react";
import { MAX_MESSAGE_LENGTH } from "../lib/content.js";

// On phones there is no Tab key, so the button says "Use" instead.
const usesTouch = () => window.matchMedia("(pointer: coarse)").matches;

// The liquid glass box where you type English for Benji.
// Enter sends. Shift + Enter starts a new line.
//
// choices: 2 or 3 things you could say next, from Zazo's answer. They show
// as buttons above the box, and tapping one says it. The first one also
// shows inside the empty box, and the Tab key (or the small button on
// phones) fills it in, so you can change it before sending.
// showChoices: false hides the buttons, when the phone keyboard needs room.
export default function ChatBox({ onSend, disabled, choices = [], showChoices = true }) {
  const suggestion = choices[0] ?? "";
  const [text, setText] = useState("");
  const trimmed = text.trim();
  const canSend = !disabled && trimmed.length > 0;
  const canSuggest = Boolean(suggestion) && text.length === 0;

  function send() {
    if (!canSend) return;
    onSend(trimmed);
    setText("");
    // On phones and tablets, close the keyboard so the characters can
    // be seen while they talk.
    if (usesTouch()) document.activeElement?.blur();
  }

  function fillSuggestion() {
    if (canSuggest) setText(suggestion);
  }

  function onKeyDown(event) {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      send();
      return;
    }
    // Tab fills in the suggestion, but only when the box is empty, so
    // Tab still moves to the next button the rest of the time.
    if (event.key === "Tab" && !event.shiftKey && canSuggest) {
      event.preventDefault();
      fillSuggestion();
    }
  }

  return (
    <div>
      {showChoices && choices.length > 0 && (
        <ul aria-label="Things you could say" className="mb-2 flex flex-wrap justify-center gap-2">
          {choices.map((choice) => (
            <li key={choice}>
              <button
                type="button"
                disabled={disabled}
                onClick={() => onSend(choice)}
                className="glass-button rounded-full px-4 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60 short:py-1.5"
              >
                {choice}
              </button>
            </li>
          ))}
        </ul>
      )}
      <form
        onSubmit={(event) => {
          event.preventDefault();
          send();
        }}
        className="glass flex items-end gap-2 rounded-[28px] p-2"
      >
        <label htmlFor="message" className="sr-only">
          Message for Benji to pass on to Zazo, in English
        </label>
        <textarea
          id="message"
          rows={1}
          value={text}
          maxLength={MAX_MESSAGE_LENGTH}
          onChange={(event) => setText(event.target.value.slice(0, MAX_MESSAGE_LENGTH))}
          onKeyDown={onKeyDown}
          placeholder={suggestion ? `Try: ${suggestion}` : "Say something in English…"}
          aria-describedby={canSuggest ? "suggestion-hint" : undefined}
          autoComplete="off"
          autoCapitalize="sentences"
          enterKeyHint="send"
          spellCheck="true"
          data-lenis-prevent
          className="max-h-32 min-h-[44px] flex-1 resize-none bg-transparent px-3 py-2.5 text-base font-semibold text-white placeholder:font-medium placeholder:text-white/80 focus:outline-none [field-sizing:content] short:max-h-20"
        />

        {/* A small key that fills in the suggestion. It reads "Tab" on a
          laptop and "Use" on a phone. */}
        {canSuggest && (
          <button
            type="button"
            onClick={fillSuggestion}
            id="suggestion-hint"
            aria-label={`Use the suggestion: ${suggestion}`}
            tabIndex={-1}
            className="mb-2 shrink-0 self-end rounded-md border border-white/60 bg-white/15 px-2 py-0.5 font-display text-xs font-semibold uppercase tracking-wider text-white hover:bg-white/25"
          >
            {usesTouch() ? "Use" : "Tab"}
          </button>
        )}

        {/* Only show the count when getting close to the limit. */}
        {text.length > MAX_MESSAGE_LENGTH * 0.8 && (
          <span className="self-center font-mono text-xs text-white/80">
            {text.length}/{MAX_MESSAGE_LENGTH}
          </span>
        )}

        <button
          type="submit"
          disabled={!canSend}
          aria-label="Send to Benji"
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/90 text-ink shadow-md transition-colors ease-editorial hover:bg-white disabled:cursor-not-allowed disabled:bg-white/25 disabled:text-white/60 disabled:shadow-none"
        >
          <SendHorizontal size={20} strokeWidth={2.2} />
        </button>
      </form>
    </div>
  );
}
