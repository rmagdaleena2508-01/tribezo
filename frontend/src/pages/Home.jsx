import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { RotateCcw, ScrollText, Volume2, VolumeX } from "lucide-react";
import Scene from "../components/Scene.jsx";
import Hero from "../components/Hero.jsx";
import Character from "../components/Character.jsx";
import SpeechBubble from "../components/SpeechBubble.jsx";
import StoryCard from "../components/StoryCard.jsx";
import NameForm from "../components/NameForm.jsx";
import ChatBox from "../components/ChatBox.jsx";
import HistoryPanel from "../components/HistoryPanel.jsx";
import { benjiLines, characters, greetings, hero, scenes, story } from "../lib/content.js";
import { reverseText } from "../lib/api.js";
import { zazoReply } from "../lib/zazo.js";
import { forgetName, loadName, saveName } from "../lib/visitor.js";
import { hasMusic, isMuted, playForScene, setMuted, startMusic } from "../lib/music.js";

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Load pictures early, so they show up at once when they are needed.
function preload(urls) {
  for (const url of urls) {
    const image = new Image();
    image.src = url;
  }
}

// Each speech bubble gets its own number, so a new bubble always starts
// typing from the beginning, even if the words are the same as before.
let nextId = 1;
const speech = (text, extra = {}) => ({ id: nextId++, text, ...extra });

// The page moves through these stages in order:
//   hero      the start screen
//   story     the short story, one step per tap
//   name      Benji asks for your name
//   greeting  Zazo says hello to you, backwards
//   chat      you talk to Zazo through Benji
export default function Home() {
  const [stage, setStage] = useState("hero");
  const [step, setStep] = useState(0);
  const [scene, setScene] = useState(hero.scene);
  const [name, setName] = useState(loadName);

  // What each character is doing. bubble: null means they are quiet.
  const [zazo, setZazo] = useState({ pose: "idle", bubble: null });
  const [benji, setBenji] = useState({ pose: "idle", bubble: null });

  // True from pressing send until Zazo has finished answering.
  const [busy, setBusy] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [muted, setMutedState] = useState(isMuted);
  const historyButton = useRef(null);

  // Where Zazo's tour is, and which fallback answer is next.
  const memory = useRef({ tourStop: 0, fallback: 0 });

  // Goes up each time something new starts. If a server answer comes back
  // after that, it is old, so we ignore it.
  const round = useRef(0);

  // Load the characters and the story scenes right away.
  useEffect(() => {
    preload([
      ...Object.values(characters.zazo.poses),
      ...Object.values(characters.benji.poses),
      ...story.map((s) => scenes[s.scene]),
    ]);
  }, []);

  // Change the music when the place changes.
  useEffect(() => {
    playForScene(scene);
  }, [scene]);

  const showZazo = stage !== "hero" && !(stage === "story" && step === 0);
  const showBenji = stage === "name" || stage === "greeting" || stage === "chat" || (stage === "story" && step >= 3);

  // ---------- The story ----------

  function showStep(index) {
    const s = story[index];
    setStep(index);
    setScene(s.scene);
    setZazo({ pose: s.zazo?.pose ?? "idle", bubble: s.zazo?.xyz ? speech(s.zazo.xyz) : null });
    setBenji({ pose: s.benji?.pose ?? "idle", bubble: s.benji?.says ? speech(s.benji.says) : null });
  }

  function startStory() {
    round.current++;
    setBusy(false);
    setStage("story");
    showStep(0);
  }

  function begin() {
    startMusic(name ? "village" : story[0].scene);
    preload(Object.values(scenes));
    if (name) {
      greet(name, true);
    } else {
      startStory();
    }
  }

  function startFresh() {
    forgetName();
    setName("");
    startMusic(story[0].scene);
    preload(Object.values(scenes));
    startStory();
  }

  function nextStep() {
    if (step < story.length - 1) {
      showStep(step + 1);
    } else {
      finishStory();
    }
  }

  function finishStory() {
    if (name) {
      greet(name, true);
      return;
    }
    setStage("name");
    setScene("village");
    setZazo({ pose: "idle", bubble: null });
    setBenji({ pose: "welcome", bubble: speech(benjiLines.askName) });
  }

  function onName(newName) {
    saveName(newName);
    setName(newName);
    greet(newName, false);
  }

  // Zazo says hello, backwards. This is the first time the stack is used.
  async function greet(visitorName, returning) {
    const thisRound = ++round.current;
    setStage("greeting");
    setScene("village");
    setBenji({ pose: "idle", bubble: null });
    setZazo({ pose: "idle", bubble: null });

    const english = (returning ? greetings.returning : greetings.newVisitor).replaceAll("{name}", visitorName);
    try {
      const [answer] = await Promise.all([reverseText(english), wait(500)]);
      if (thisRound !== round.current) return;
      setZazo({ pose: "laughing", bubble: speech(answer.xyz, { translation: english }) });
    } catch {
      if (thisRound !== round.current) return;
      setBenji({ pose: "confused", bubble: speech(benjiLines.error) });
      setStage("chat");
    }
  }

  // ---------- The chat ----------

  async function sendMessage(english) {
    const thisRound = ++round.current;
    setBusy(true);
    setZazo({ pose: "idle", bubble: null });
    setBenji({ pose: "talking", bubble: speech(benjiLines.relaying) });

    try {
      // 1. Benji flips your words and tells Zazo.
      const [told] = await Promise.all([reverseText(english), wait(700)]);
      if (thisRound !== round.current) return;
      setBenji({ pose: "pointing", bubble: speech(told.xyz, { label: "Benji tells Zazo" }) });

      // 2. Zazo thinks of an answer, and the stack flips it into XYZ.
      const reply = zazoReply(english, name, memory.current);
      memory.current = reply.memory;
      const readingTime = Math.min(3000, told.xyz.length * 40) + 900;
      const [answer] = await Promise.all([reverseText(reply.says), wait(readingTime)]);
      if (thisRound !== round.current) return;

      // 3. Zazo answers. If he is showing you around, the place changes.
      if (reply.scene) setScene(reply.scene);
      setBenji({ pose: "idle", bubble: null });
      setZazo({ pose: reply.pose, bubble: speech(answer.xyz, { translation: reply.says }) });
      setHistory((entries) => [
        ...entries,
        {
          id: nextId++,
          english,
          xyz: told.xyz,
          pushes: told.pushes,
          pops: told.pops,
          reply: reply.says,
          replyXyz: answer.xyz,
        },
      ]);
    } catch {
      if (thisRound !== round.current) return;
      setBenji({ pose: "confused", bubble: speech(benjiLines.error) });
      setBusy(false);
    }
  }

  // When Zazo finishes speaking, you can talk again.
  const onZazoDone = useCallback(() => {
    setZazo((current) => (current.pose === "talking" ? { ...current, pose: "idle" } : current));
    setStage((current) => (current === "greeting" ? "chat" : current));
    setBusy(false);
  }, []);

  const onBenjiDone = useCallback(() => {
    setBenji((current) => (current.pose === "talking" && !current.bubble?.label ? { ...current, pose: "idle" } : current));
  }, []);

  const closeHistory = useCallback(() => {
    setHistoryOpen(false);
    historyButton.current?.focus();
  }, []);

  function toggleMute() {
    setMuted(!muted);
    setMutedState(!muted);
  }

  // ---------- The page ----------

  return (
    <main className="relative h-[100svh] overflow-hidden">
      <Scene scene={scene} />

      <header className="absolute inset-x-0 top-0 z-30 flex items-center justify-between px-4 py-4 sm:px-8 sm:py-6">
        {stage !== "hero" ? (
          <p className="font-serif text-3xl font-semibold tracking-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.4)] sm:text-4xl">
            Tribezo
          </p>
        ) : (
          <span />
        )}

        <div className="flex items-center gap-2">
          {hasMusic && (
            <button
              type="button"
              onClick={toggleMute}
              aria-label={muted ? "Turn music on" : "Turn music off"}
              aria-pressed={muted}
              className="glass-button grid h-11 w-11 place-items-center rounded-full"
            >
              {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
          )}
          {stage === "chat" && (
            <>
              <button
                type="button"
                onClick={startStory}
                aria-label="Watch the story again"
                className="glass-button grid h-11 w-11 place-items-center rounded-full"
              >
                <RotateCcw size={18} />
              </button>
              <button
                ref={historyButton}
                type="button"
                onClick={() => setHistoryOpen(true)}
                className="glass-button flex h-11 items-center gap-2 rounded-full px-4 text-sm font-medium"
              >
                <ScrollText size={18} />
                <span>History</span>
                {history.length > 0 && (
                  <span className="rounded-full bg-white/90 px-1.5 font-mono text-xs text-ink [text-shadow:none]">
                    {history.length}
                  </span>
                )}
              </button>
            </>
          )}
        </div>
      </header>

      {stage === "hero" && <Hero name={name} onBegin={begin} onChangeName={startFresh} />}

      {/* Zazo stands in the bottom left corner. */}
      <AnimatePresence>
        {showZazo && (
          <motion.div
            key="zazo"
            initial={{ opacity: 0, x: -80 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -80 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="absolute bottom-0 left-[1vw] z-10 h-[40svh] sm:left-[3vw] sm:h-[min(60svh,600px)]"
          >
            <div className="absolute bottom-[calc(100%+10px)] left-[8%] z-20">
              <AnimatePresence mode="wait">
                {zazo.bubble && (
                  <SpeechBubble key={zazo.bubble.id} text={zazo.bubble.text} side="left" onDone={onZazoDone}>
                    {zazo.bubble.translation && (
                      <div className="mt-2 border-t border-ink/15 pt-2">
                        <p className="text-[11px] font-medium uppercase tracking-widest text-ink-soft">Benji translates</p>
                        <p className="text-sm italic text-ink-soft">“{zazo.bubble.translation}”</p>
                      </div>
                    )}
                  </SpeechBubble>
                )}
              </AnimatePresence>
            </div>
            <Character who="zazo" pose={zazo.pose} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Benji stands in the bottom right corner. */}
      <AnimatePresence>
        {showBenji && (
          <motion.div
            key="benji"
            initial={{ opacity: 0, x: 80 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 80 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="absolute bottom-0 right-[1vw] z-10 h-[40svh] sm:right-[3vw] sm:h-[min(60svh,600px)]"
          >
            <div className="absolute bottom-[calc(100%+10px)] right-[8%] z-20">
              <AnimatePresence mode="wait">
                {benji.bubble && (
                  <SpeechBubble
                    key={benji.bubble.id}
                    text={benji.bubble.text}
                    label={benji.bubble.label}
                    side="right"
                    onDone={onBenjiDone}
                  />
                )}
              </AnimatePresence>
            </div>
            <Character who="benji" pose={benji.pose} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* The glass panel at the bottom: the story card, the name box, or the chat box. */}
      <div className="absolute inset-x-0 bottom-4 z-20 px-3 sm:bottom-6">
        <div className="mx-auto max-w-xl">
          {stage === "story" && (
            <StoryCard
              caption={story[step].caption}
              step={step}
              steps={story.length}
              onNext={nextStep}
              onSkip={finishStory}
            />
          )}
          {stage === "name" && <NameForm onDone={onName} />}
          {stage === "chat" && <ChatBox onSend={sendMessage} disabled={busy} />}
        </div>
      </div>

      <HistoryPanel open={historyOpen} onClose={closeHistory} entries={history} />
    </main>
  );
}
