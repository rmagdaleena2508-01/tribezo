import { useState } from "react";
import { SendHorizontal } from "lucide-react";
import { MAX_MESSAGE_LENGTH } from "../lib/content.js";

// The liquid glass box where you type English for Benji.
// Enter sends. Shift + Enter starts a new line.
export default function ChatBox({ onSend, disabled }) {
  const [text, setText] = useState("");
  const trimmed = text.trim();
  const canSend = !disabled && trimmed.length > 0;

  function send() {
    if (!canSend) return;
    onSend(trimmed);
    setText("");
  }

  function onKeyDown(event) {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      send();
    }
  }

  return (
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
        placeholder="Say something in English…"
        autoComplete="off"
        spellCheck="true"
        data-lenis-prevent
        className="max-h-32 min-h-[44px] flex-1 resize-none bg-transparent px-3 py-2.5 text-base text-white placeholder:text-white/75 focus:outline-none [field-sizing:content]"
      />

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
  );
}
