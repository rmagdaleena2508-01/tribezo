import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { RotateCcw, ScrollText, Volume2, VolumeX } from "lucide-react";
import Scene from "../components/Scene.jsx";
import NameScreen from "../components/NameScreen.jsx";
import Hero from "../components/Hero.jsx";
import Character from "../components/Character.jsx";
import SpeechBubble from "../components/SpeechBubble.jsx";
import StoryCard from "../components/StoryCard.jsx";
import ChatBox from "../components/ChatBox.jsx";
import HistoryPanel from "../components/HistoryPanel.jsx";
import PixelIntro from "../components/PixelIntro.jsx";
import GlassButton, { LiquidGlassFilter } from "../components/GlassButton.jsx";
import { benjiLines, characters, greeting, hero, nameScreen, scenes, story, suggestedQuestions } from "../lib/content.js";
import { useKeyboard } from "../hooks/useKeyboard.js";
import { askZazo } from "../lib/api.js";
import { reverseText } from "../lib/stack.js";
import { zazoReply } from "../lib/zazo.js";
import { hasMusic, isMuted, playForScene, setMuted, startMusic } from "../lib/music.js";

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Load pictures early, so they show up at once when they are needed.
function preload(urls) {
  for (const url of urls) {
    const image = new Image();
    image.src = url;
  }
}

// Every line of dialogue gets its own number, so a new speech bubble
// always starts typing from the beginning.
let nextId = 1;

// The page moves through these stages in order:
//   hero   the Tribezo title screen
//   story  the short story that introduces Zazo and Benji, one step per tap
//   name   Benji asks for your name (every visit, starting with an empty box)
//   chat   you talk to Zazo through Benji
export default function Home() {
  const [stage, setStage] = useState("hero");
  const [step, setStep] = useState(0);
  const [scene, setScene] = useState(hero.scene);
  const [name, setName] = useState("");

  // The dialogue: a list of lines, shown one at a time. Tapping shows
  // the next line. Each line is { id, who, text, pose, label?, scene? }.
  const [lines, setLines] = useState([]);
  const [lineIndex, setLineIndex] = useState(0);
  const [lineDone, setLineDone] = useState(false); // finished typing?
  const [showAll, setShowAll] = useState(false); // tapped while typing?

  // How each character stands when they are not the one talking.
  const [zazoRest, setZazoRest] = useState("idle");
  const [benjiRest, setBenjiRest] = useState("idle");

  // True while waiting for the C server.
  const [busy, setBusy] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [muted, setMutedState] = useState(isMuted);
  const historyButton = useRef(null);
  const keyboardOpen = useKeyboard();

  // The pixel opening plays once, when the page first opens. People who
  // ask their device for less motion skip it.
  const [introDone, setIntroDone] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const endIntro = useCallback(() => setIntroDone(true), []);

  // Where Zazo's tour is, and which fallback answer is next.
  const memory = useRef({ tourStop: 0, fallback: 0 });

  // The last few turns of the chat, sent to the AI so Zazo remembers them.
  const recentTurns = useRef([]);

  // The question suggested in the chat box. Tab fills it in.
  const [suggestion, setSuggestion] = useState(suggestedQuestions[0]);
  const asked = useRef(new Set()); // questions already asked, in lowercase

  // The next suggestion: Zazo's own idea if it is new, or else the next
  // question from the list that has not been asked yet.
  function pickSuggestion(fromZazo) {
    const isNew = (question) => question && !asked.current.has(question.toLowerCase().trim());
    if (isNew(fromZazo)) return fromZazo;
    return suggestedQuestions.find(isNew) ?? "";
  }

  // Goes up each time something new starts. If a server answer comes back
  // after that, it is old, so we ignore it.
  const round = useRef(0);

  const line = lines[lineIndex] ?? null;
  const moreLines = lineIndex < lines.length - 1;
  const look = scenes[scene].look;

  // Load the characters and the story scenes right away.
  useEffect(() => {
    preload([
      ...Object.values(characters.zazo.poses),
      ...Object.values(characters.benji.poses),
      ...story.map((s) => scenes[s.scene].src),
    ]);
  }, []);

  // Change the music when the place changes.
  useEffect(() => {
    playForScene(scene);
  }, [scene]);

  // Some of Zazo's lines take you to a new place.
  useEffect(() => {
    if (line?.scene) setScene(line.scene);
  }, [line]);

  // ---------- Dialogue ----------

  function say(newLines) {
    setLines(newLines.map((l) => ({ id: nextId++, ...l })));
    setLineIndex(0);
    setLineDone(false);
    setShowAll(false);
  }

  const onLineDone = useCallback(() => setLineDone(true), []);

  // One tap: finish the current line, or move to the next one.
  function tap() {
    if (line && !lineDone) {
      setShowAll(true);
      return;
    }
    if (stage === "story") {
      nextStep();
    } else if (stage === "chat" && moreLines) {
      setLineIndex(lineIndex + 1);
      setLineDone(false);
      setShowAll(false);
    }
  }

  // Tapping anywhere on the scene counts, and so do Enter, Space, and →.
  const tapRef = useRef(tap);
  tapRef.current = tap;
  useEffect(() => {
    const onKey = (event) => {
      if (!["Enter", " ", "ArrowRight"].includes(event.key)) return;
      if (event.target.closest("button, a, input, textarea, [role=dialog]")) return;
      event.preventDefault();
      tapRef.current();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function onSceneClick(event) {
    if (stage !== "story" && stage !== "chat") return;
    if (event.target.closest("button, a, input, textarea, form, [role=dialog]")) return;
    tap();
  }

  // ---------- Title, story, and name ----------

  function begin() {
    startMusic(hero.scene); // the Begin press is the tap browsers need before sound
    preload(Object.values(scenes).map((s) => s.src));
    startStory();
  }

  function showStep(index) {
    const s = story[index];
    setStep(index);
    setScene(s.scene);
    setZazoRest(s.zazo?.pose ?? "idle");
    setBenjiRest(s.benji?.pose ?? "idle");
    say([
      ...(s.zazo?.xyz ? [{ who: "zazo", text: s.zazo.xyz, pose: s.zazo.pose }] : []),
      ...(s.benji?.says ? [{ who: "benji", text: s.benji.says, pose: s.benji.pose }] : []),
    ]);
  }

  function startStory() {
    round.current++;
    setBusy(false);
    setStage("story");
    showStep(0);
  }

  function nextStep() {
    if (step < story.length - 1) {
      showStep(step + 1);
    } else {
      askName();
    }
  }

  // After the story, Benji asks for your name. If you watch the story
  // again later, he already knows it.
  function askName() {
    if (name) {
      startChat(name);
      return;
    }
    round.current++;
    setStage("name");
    setScene("village");
    setZazoRest("idle");
    setBenjiRest("idle");
    say([{ who: "benji", text: nameScreen.benjiAsks, pose: "welcome" }]);
  }

  function onName(newName) {
    setName(newName);
    startChat(newName);
  }

  // The story is over. Zazo greets you by name, backwards, and Benji
  // tells you what he said. This is the first time the stack is used.
  async function startChat(visitorName) {
    const thisRound = ++round.current;
    setStage("chat");
    setScene("village");
    setZazoRest("idle");
    setBenjiRest("idle");
    say([]);
    setBusy(true);

    const english = greeting.zazo.replaceAll("{name}", visitorName);
    try {
      const [answer] = await Promise.all([reverseText(english), wait(400)]);
      if (thisRound !== round.current) return;
      say([
        { who: "zazo", text: answer.xyz, pose: "laughing" },
        {
          who: "benji",
          text: greeting.benji.replaceAll("{name}", visitorName),
          pose: "welcome",
          label: "Benji translates",
        },
      ]);
    } catch {
      if (thisRound !== round.current) return;
      say([{ who: "benji", text: benjiLines.error, pose: "confused" }]);
    }
    setBusy(false);
  }

  // ---------- Talking to Zazo ----------

  // Zazo's answer, in English. The AI writes it when the AI helper is
  // running and has a key. If not, Zazo uses his fixed answers instead.
  async function thinkOfReply(english) {
    try {
      // "hero-meadow" is only the title screen, so it counts as the village.
      const here = scene === "hero-meadow" ? "village" : scene;
      const ai = await askZazo(english, name, recentTurns.current, here);
      recentTurns.current = [...recentTurns.current, { you: english, zazo: ai.reply }].slice(-6);
      return {
        says: ai.reply,
        pose: characters.zazo.poses[ai.pose] ? ai.pose : "talking",
        scene: scenes[ai.scene] ? ai.scene : undefined, // "stay" is not a scene, so he stays put
        source: "ai",
        suggestion: ai.suggestion,
      };
    } catch {
      const reply = zazoReply(english, name, memory.current);
      memory.current = reply.memory;
      return { ...reply, source: "fixed" };
    }
  }

  async function sendMessage(english) {
    const thisRound = ++round.current;
    asked.current.add(english.toLowerCase().trim());
    setBusy(true);
    say([{ who: "benji", text: benjiLines.relaying, pose: "talking" }]);

    try {
      // 1. Benji flips your words for Zazo.
      const [told] = await Promise.all([reverseText(english), wait(600)]);
      if (thisRound !== round.current) return;

      // 2. Zazo thinks of an answer, and the stack flips it into XYZ too.
      const reply = await thinkOfReply(english);
      const answer = await reverseText(reply.says);
      if (thisRound !== round.current) return;
      setSuggestion(pickSuggestion(reply.suggestion));

      // 3. Tap through: Benji tells Zazo, Zazo answers, Benji translates.
      say([
        { who: "benji", text: told.xyz, pose: "pointing", label: "Benji tells Zazo" },
        { who: "zazo", text: answer.xyz, pose: reply.pose, scene: reply.scene },
        { who: "benji", text: reply.says, pose: "talking", label: "Benji translates" },
      ]);
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
          source: reply.source,
        },
      ]);
    } catch {
      if (thisRound !== round.current) return;
      say([{ who: "benji", text: benjiLines.error, pose: "confused" }]);
    }
    setBusy(false);
  }

  const closeHistory = useCallback(() => {
    setHistoryOpen(false);
    historyButton.current?.focus();
  }, []);

  function toggleMute() {
    setMuted(!muted);
    setMutedState(!muted);
  }

  // ---------- The page ----------

  const showZazo = stage === "chat" || stage === "name" || (stage === "story" && step >= 1);
  const showBenji = stage === "chat" || stage === "name" || (stage === "story" && step >= 3);
  const zazoPose = line?.who === "zazo" ? line.pose : zazoRest;
  const benjiPose = line?.who === "benji" ? line.pose : benjiRest;
  const hint = stage === "chat" && moreLines ? "Tap to continue" : undefined;

  // Character height: set for laptops first (see --character-height in
  // index.css), then made bigger or smaller for each place.
  const characterStyle = { height: `calc(var(--character-height) * ${look.scale})` };

  function bubbleFor(who, side) {
    if (line?.who !== who) return null;
    // While the phone keyboard is open there is very little room, so the
    // bubbles step aside. They come back when the keyboard closes.
    if (keyboardOpen) return null;
    return (
      <SpeechBubble
        key={line.id}
        text={line.text}
        label={line.label}
        side={side}
        onDone={onLineDone}
        showAll={showAll}
        hint={hint}
      />
    );
  }

  return (
    // "fixed inset-0" keeps the whole game still when the phone keyboard opens.
    <main className="fixed inset-0 select-none overflow-hidden" onClick={onSceneClick}>
      <Scene scene={scene} layer="back" />

      {/* Zazo stands in the bottom left corner. */}
      <AnimatePresence>
        {showZazo && (
          <motion.div
            key="zazo"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute bottom-[1.5svh] left-[2vw] z-10 lg:left-[5vw]"
            style={characterStyle}
          >
            <div className="absolute bottom-[calc(100%+8px)] left-[10%] z-20">
              <AnimatePresence mode="wait">{bubbleFor("zazo", "left")}</AnimatePresence>
            </div>
            <Character who="zazo" pose={zazoPose} look={look} side="left" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Benji stands in the bottom right corner. */}
      <AnimatePresence>
        {showBenji && (
          <motion.div
            key="benji"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute bottom-[1.5svh] right-[2vw] z-10 lg:right-[5vw]"
            style={characterStyle}
          >
            <div className="absolute bottom-[calc(100%+8px)] right-[10%] z-20">
              <AnimatePresence mode="wait">{bubbleFor("benji", "right")}</AnimatePresence>
            </div>
            <Character who="benji" pose={benjiPose} look={look} side="right" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Front flowers, film grain, and soft edges go over the characters. */}
      <div className="pointer-events-none absolute inset-0 z-[15]">
        <Scene scene={scene} layer="front" />
      </div>

      <header className="absolute inset-x-0 top-0 z-30 flex items-center justify-between px-4 py-4 sm:px-8 sm:py-6 short:py-2">
        {stage !== "hero" ? (
          <p className="title-text font-display text-3xl font-bold tracking-tight sm:text-4xl short:hidden">
            Tribezo
          </p>
        ) : (
          <span />
        )}

        <div className="flex items-center gap-2">
          {hasMusic && (
            <GlassButton
              onClick={toggleMute}
              aria-label={muted ? "Turn music on" : "Turn music off"}
              aria-pressed={muted}
              className="h-11 w-11 rounded-full short:h-9 short:w-9"
            >
              {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </GlassButton>
          )}
          {stage === "chat" && (
            <>
              <GlassButton
                onClick={startStory}
                aria-label="Watch the story again"
                className="h-11 w-11 rounded-full short:h-9 short:w-9"
              >
                <RotateCcw size={18} />
              </GlassButton>
              <GlassButton
                ref={historyButton}
                onClick={() => setHistoryOpen(true)}
                className="h-11 rounded-full px-4 text-sm font-bold short:h-9"
              >
                <ScrollText size={18} />
                <span>History</span>
                {history.length > 0 && (
                  <span className="rounded-full bg-white/90 px-1.5 font-mono text-xs text-ink [text-shadow:none]">
                    {history.length}
                  </span>
                )}
              </GlassButton>
            </>
          )}
        </div>
      </header>

      {stage === "hero" && introDone && <Hero onBegin={begin} />}
      {!introDone && <PixelIntro onDone={endIntro} />}
      <LiquidGlassFilter />

      {/* The glass panel at the bottom: the story card, the name box, a
          Continue button, or the chat box. When the phone keyboard is open,
          it sits just above the keyboard. */}
      <div
        className="absolute inset-x-0 z-20 px-3 transition-[bottom] duration-200"
        style={{ bottom: `calc(var(--keyboard-inset) + ${keyboardOpen ? "8px" : "clamp(8px, 3svh, 24px)"})` }}
      >
        <div className="mx-auto max-w-xl">
          {stage === "story" && (
            <StoryCard caption={story[step].caption} step={step} steps={story.length} onNext={tap} onSkip={askName} />
          )}
          {stage === "name" && <NameScreen onDone={onName} />}
          {stage === "chat" &&
            (moreLines ? (
              <GlassButton onClick={tap} autoFocus className="mx-auto w-fit rounded-full px-8 py-3 font-display font-semibold short:py-2">
                Tap to continue
              </GlassButton>
            ) : (
              <ChatBox onSend={sendMessage} disabled={busy || (line !== null && !lineDone)} suggestion={suggestion} />
            ))}
        </div>
      </div>

      <HistoryPanel open={historyOpen} onClose={closeHistory} entries={history} />
    </main>
  );
}
