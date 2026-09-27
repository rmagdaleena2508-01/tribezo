import { useCallback, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { ArrowRight, RotateCcw, ScrollText } from "lucide-react";
import ForestScene from "../components/ForestScene.jsx";
import Character from "../components/Character.jsx";
import SpeechBubble from "../components/SpeechBubble.jsx";
import ChatBox from "../components/ChatBox.jsx";
import HistoryPanel from "../components/HistoryPanel.jsx";
import { introLines, translatorLines } from "../lib/content.js";
import { reverseText } from "../lib/api.js";

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Each speech bubble gets its own number, so a new bubble always
// starts typing from the beginning, even if the words are the same.
let nextBubbleId = 1;
const bubble = (pose, text, extra = {}) => ({ pose, text, id: nextBubbleId++, ...extra });

export default function Home() {
  // "intro" while the translator explains the tribe, then "chat".
  const [stage, setStage] = useState("intro");
  const [introStep, setIntroStep] = useState(0);

  // What each character is doing and saying. text: null means no bubble.
  const [translator, setTranslator] = useState(() => bubble("explaining", introLines[0]));
  const [tribe, setTribe] = useState(() => bubble("idle", null));

  // True from pressing send until the tribe has finished speaking.
  const [busy, setBusy] = useState(false);

  const [history, setHistory] = useState([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const historyButton = useRef(null);

  // Goes up each time a message is sent or the intro restarts. If an answer
  // comes back after that, it is old, so we ignore it.
  const round = useRef(0);

  const isLastIntroLine = introStep === introLines.length - 1;

  function startChat() {
    setStage("chat");
    setTranslator(bubble("idle", translatorLines.ready));
    setTribe(bubble("welcome", null));
  }

  function nextIntroLine() {
    if (isLastIntroLine) {
      startChat();
      return;
    }
    setIntroStep(introStep + 1);
    setTranslator(bubble("explaining", introLines[introStep + 1]));
  }

  function replayIntro() {
    round.current++;
    setStage("intro");
    setIntroStep(0);
    setBusy(false);
    setTranslator(bubble("explaining", introLines[0]));
    setTribe(bubble("idle", null));
  }

  async function sendMessage(english) {
    const thisRound = ++round.current;
    setBusy(true);
    setTribe(bubble("idle", null));
    setTranslator(bubble("talking", translatorLines.relaying));

    try {
      // Ask the C server, and give the translator a moment to "speak".
      const [answer] = await Promise.all([reverseText(english), wait(900)]);
      if (thisRound !== round.current) return;

      setTranslator(bubble("listening", null));
      setTribe(bubble("talking", answer.xyz, { pushes: answer.pushes, pops: answer.pops }));
      setHistory((entries) => [...entries, { id: nextBubbleId++, ...answer }]);
    } catch {
      if (thisRound !== round.current) return;
      setTranslator(bubble("explaining", translatorLines.error));
      setBusy(false);
    }
  }

  // When the tribe finishes speaking, they relax and you can talk again.
  const onTribeDone = useCallback(() => {
    setTribe((current) => ({ ...current, pose: "idle" }));
    setTranslator((current) => ({ ...current, pose: "idle" }));
    setBusy(false);
  }, []);

  const closeHistory = useCallback(() => {
    setHistoryOpen(false);
    historyButton.current?.focus();
  }, []);

  return (
    <main className="relative h-[100svh] overflow-hidden">
      <ForestScene />

      <header className="absolute inset-x-0 top-0 z-30 flex items-center justify-between px-4 py-4 sm:px-8 sm:py-6">
        <h1 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">Tribezo</h1>

        {stage === "chat" && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={replayIntro}
              aria-label="Hear the introduction again"
              className="grid h-10 w-10 place-items-center rounded-full border border-parchment/15 bg-night/60 text-parchment/80 backdrop-blur hover:text-parchment"
            >
              <RotateCcw size={18} />
            </button>
            <button
              ref={historyButton}
              type="button"
              onClick={() => setHistoryOpen(true)}
              className="flex h-10 items-center gap-2 rounded-full border border-parchment/15 bg-night/60 px-4 text-sm text-parchment/80 backdrop-blur hover:text-parchment"
            >
              <ScrollText size={18} />
              <span>History</span>
              {history.length > 0 && (
                <span className="rounded-full bg-ember px-1.5 font-mono text-xs text-night">{history.length}</span>
              )}
            </button>
          </div>
        )}
      </header>

      {/* The stage: the translator on the left, the tribe member on the right. */}
      <div className="absolute inset-x-0 bottom-[96px] z-10 mx-auto flex max-w-5xl items-end justify-between px-3 sm:bottom-[112px] sm:px-12">
        <div className="relative aspect-[2/3] h-[min(46svh,400px,64vw)]">
          <div className="absolute bottom-[calc(100%+14px)] left-0 z-20">
            <AnimatePresence mode="wait">
              {translator.text && (
                <SpeechBubble key={translator.id} text={translator.text} side="left">
                  {stage === "intro" && (
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={startChat}
                        className="text-sm text-ink-soft underline-offset-4 hover:underline"
                      >
                        Skip
                      </button>
                      <button
                        type="button"
                        onClick={nextIntroLine}
                        autoFocus
                        className="flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-sm font-medium text-parchment hover:bg-canopy"
                      >
                        {isLastIntroLine ? "Start talking" : "Next"}
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  )}
                </SpeechBubble>
              )}
            </AnimatePresence>
          </div>
          <Character who="translator" pose={translator.pose} />
        </div>

        <div className="relative aspect-[2/3] h-[min(46svh,400px,64vw)]">
          <div className="absolute bottom-[calc(100%+14px)] right-0 z-20">
            <AnimatePresence mode="wait">
              {tribe.text !== null && (
                <SpeechBubble key={tribe.id} text={tribe.text} side="right" onDone={onTribeDone}>
                  <p className="mt-2 font-mono text-[11px] text-ink-soft">
                    stack: {tribe.pushes} pushes · {tribe.pops} pops
                  </p>
                </SpeechBubble>
              )}
            </AnimatePresence>
          </div>
          <Character who="tribe" pose={tribe.pose} />
        </div>
      </div>

      {stage === "chat" && (
        <div className="absolute inset-x-0 bottom-0 z-20 px-3 pb-4 sm:pb-6">
          <div className="mx-auto max-w-2xl">
            <ChatBox onSend={sendMessage} disabled={busy} />
          </div>
        </div>
      )}

      <HistoryPanel open={historyOpen} onClose={closeHistory} entries={history} />
    </main>
  );
}
