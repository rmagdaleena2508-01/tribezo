"""Makes the "How the Stack Works" video (public/video/stack-explained.mp4).

How it works:
  1. Every sentence of the script is read out loud by Kokoro, a free, open
     source voice model (Apache 2.0) that runs on this computer, with no
     internet and no key. The voice is "bm_fable", a young, natural sounding
     British male voice. If Kokoro is not set up, the Mac's own voice ("say") is
     used instead.
  2. The sentences are joined into one sound track, with short pauses.
     We keep the time each sentence starts, so the pictures can match it.
  3. Python (Pillow) draws every frame: the backgrounds from the game,
     Zazo and Benji, plates that move on and off a stack, and captions.
  4. ffmpeg joins the frames and the sound into one small MP4 file.

Set up Kokoro once, from the top folder:
  python3 -m venv .venv-tts
  .venv-tts/bin/pip install kokoro-onnx soundfile pillow
  mkdir -p ~/.cache/tribezo-tts
  (then download kokoro-v1.0.onnx and voices-v1.0.bin into that folder,
  from https://github.com/thewh1teagle/kokoro-onnx/releases/tag/model-files-v1.0)

Then make the video (needs ffmpeg):
  .venv-tts/bin/python tools/make_stack_video.py

The script is written out too, to tools/stack-video-script.md.
"""

import math
import os
import shutil
import subprocess
import tempfile
import wave

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(ROOT, "public", "video")
OUT_FILE = os.path.join(OUT_DIR, "stack-explained.mp4")
SCRIPT_FILE = os.path.join(ROOT, "tools", "stack-video-script.md")

W, H = 1280, 720
FPS = 24
KOKORO_DIR = os.path.expanduser("~/.cache/tribezo-tts")
KOKORO_VOICE = "bm_fable"  # a young British male voice; others: am_puck, am_liam, am_michael
KOKORO_LANG = "en-gb"  # "en-us" for the am_ voices, "en-gb" for the bm_ voices
KOKORO_SPEED = 1.12
MAC_VOICE = "Samantha"  # only used if Kokoro is not set up
MAC_RATE = 165  # words a minute
RATE_HZ = 24000
GAP = 0.25  # pause after each sentence, in seconds
SCENE_END = 0.6  # pause at the end of each scene

FONT_FILE = "/System/Library/Fonts/Supplemental/Arial Rounded Bold.ttf"
_fonts = {}


def font(size):
    if size not in _fonts:
        _fonts[size] = ImageFont.truetype(FONT_FILE, size)
    return _fonts[size]


# Colors from the game.
CREAM = (255, 248, 236)
INK = (40, 28, 20)
MUSTARD = (240, 190, 70)
SASH = (224, 112, 72)
LEAF = (110, 180, 100)
SKY = (120, 190, 230)
BERRY = (200, 90, 140)
PLATE_COLORS = [SASH, MUSTARD, LEAF, SKY, BERRY, (170, 130, 220)]


# ---------------------------------------------------------------- the script
# Each scene: a title, a background, and its sentences.

SCENES = [
    {
        "id": "intro",
        "title": "How the Stack Works",
        "bg": "hero-meadow",
        "lines": [
            "Hi everyone, come on in and grab a seat!",
            "Today's class is about the stack. It's small, it's simple, and it's everywhere.",
            "By the end, you'll see a stack at work inside a real game called Tribezo. Ready? Let's go!",
        ],
    },
    {
        "id": "ds",
        "title": "First, a big word",
        "bg": "family-hut",
        "lines": [
            "First, a big word. Data structure.",
            "A data structure is a way to keep data in order, so a computer can use it fast.",
            "There are many kinds. Arrays, linked lists, queues, trees, and today's star, the stack.",
            "A stack is a linear data structure. That means the items sit in a line, one after another.",
        ],
    },
    {
        "id": "what",
        "title": "What is a stack?",
        "bg": "village",
        "lines": [
            "So, what is a stack? Picture a pile of plates.",
            "You add a plate on the top. You take a plate off the top. Never from the middle.",
            "This rule is called last in, first out. L, I, F, O. Say it with me. LIFO!",
            "The last plate you put on is the first one you take off.",
        ],
    },
    {
        "id": "ops",
        "title": "The four jobs of a stack",
        "bg": "family-hut",
        "lines": [
            "A stack has just four jobs.",
            "Push puts a new item on the top. Pop takes the top item off.",
            "Peek looks at the top item, without taking it off.",
            "And is empty asks, is there anything left?",
            "Push and pop are super fast, because you only touch the top. We call that O of 1.",
        ],
    },
    {
        "id": "dsa",
        "title": "Stacks in data structures and algorithms",
        "bg": "jungle-path",
        "lines": [
            "Where do stacks show up in algorithms? Lots of places!",
            "When a function calls another function, the computer keeps a call stack. That's how recursion works.",
            "Stacks check that brackets match. Every open bracket needs its own close bracket.",
            "Calculators use stacks to work out math, like three plus four, times five.",
            "And when a program searches a maze, a stack helps it back up and try a new path. That's depth first search.",
        ],
    },
    {
        "id": "apps",
        "title": "Stacks in apps you use every day",
        "bg": "jungle-path",
        "lines": [
            "You also use stacks every day.",
            "The undo button in your drawing app or your document. Your last change comes off first.",
            "The back button in your web browser, or on your phone, takes you to the last screen you saw.",
            "And redo? It puts the change you just undid right back on top.",
        ],
    },
    {
        "id": "proscons",
        "title": "Good sides and limits",
        "bg": "waterfall",
        "lines": [
            "What's good about stacks? They're simple, fast, and need little extra memory.",
            "The limits? You can only reach the top. To find something in the middle, you take things off one by one.",
            "A full stack with a fixed size overflows. And popping an empty stack underflows.",
        ],
    },
    {
        "id": "meet",
        "title": "Meet Zazo and Benji",
        "bg": "island-arrival",
        "lines": [
            "Now, let's visit Tribezo, an island far past the edge of every map.",
            "This is Zazo, the leader of the islands. He's loud, friendly, and loves visitors. But he only speaks Calonis, where every word comes out backwards.",
            "And this is Benji, his calm friend and translator. Benji speaks English and Calonis.",
            "His secret? A stack. Benji uses it to flip every word.",
        ],
    },
    {
        "id": "convo",
        "title": "What happens when you talk",
        "bg": "village",
        "lines": [
            "Here's what happens when you talk to them.",
            "You type in English, like, how old are you? Benji pushes each word's letters onto his stack, then pops them off.",
            "Out comes Calonis! woH dlo era uoy? Benji says it to Zazo.",
            "Zazo answers in Calonis. His words went through the same stack.",
            "Then Benji flips them back, and tells you what Zazo said, in English.",
        ],
    },
    {
        "id": "flip",
        "title": "Watch one word flip",
        "bg": "lookout",
        "lines": [
            "Let's slow it down and watch one word.",
            "Take the word hello. Push each letter. H, E, L, L, O.",
            "Now pop them off. Last in, first out.",
            "O, L, L, E, H. Hello just became olleh.",
        ],
    },
    {
        "id": "rules",
        "title": "What does not flip",
        "bg": "island-arrival",
        "lines": [
            "The stack only flips letters.",
            "Commas, marks, and spaces stay right where they are.",
            "Money never flips. Twenty dollars stays twenty dollars.",
            "And your name stays just the way you typed it.",
        ],
    },
    {
        "id": "build",
        "title": "Benji's stack is real code",
        "bg": "lookout",
        "lines": [
            "Benji's stack is real code, written in C. It keeps letters in an array, and the top is the end of the array.",
            "When the array gets full, it grows to twice its size, so it never overflows.",
            "And the C code runs right in your browser, as WebAssembly.",
        ],
    },
    {
        "id": "history",
        "title": "See the stack at work",
        "bg": "village",
        "lines": [
            "Want to see the stack at work? Open the History panel.",
            "For, how old are you, the stack did twelve pushes and twelve pops. One push and one pop for every letter.",
        ],
    },
    {
        "id": "outro",
        "title": "One stack, two directions",
        "bg": "fire-camp",
        "lines": [
            "So that's our class for today. One stack, two directions.",
            "Flip English once, and you get Calonis. Flip it again, and you're back to English.",
            "Now go say hello to Zazo. Or, as he'd say, olleH! See you next time.",
        ],
    },
]


def calonis(text):
    """Flip the letters of each word with a stack, like reverse.c does
    (punctuation, spaces, and numbers stay where they are)."""
    out = list(text)
    i = 0
    while i < len(text):
        if text[i].isspace():
            i += 1
            continue
        j = i
        while j < len(text) and not text[j].isspace():
            j += 1
        stack = [c for c in text[i:j] if c.isalpha()]
        for k in range(i, j):
            if text[k].isalpha():
                out[k] = stack.pop()
        i = j
    return "".join(out)


# ---------------------------------------------------------------- the voice

def make_speaker(work):
    """Returns a function that turns one sentence into 16 bit sound at
    RATE_HZ. Uses Kokoro if it is set up, or else the Mac's voice."""
    model = os.path.join(KOKORO_DIR, "kokoro-v1.0.onnx")
    voices = os.path.join(KOKORO_DIR, "voices-v1.0.bin")
    try:
        import numpy as np
        from kokoro_onnx import Kokoro

        kokoro = Kokoro(model, voices)
        print(f"Voice: Kokoro, {KOKORO_VOICE}")

        def speak(line, index):
            samples, rate = kokoro.create(line, voice=KOKORO_VOICE, speed=KOKORO_SPEED, lang=KOKORO_LANG)
            if rate != RATE_HZ:
                raise SystemExit(f"Kokoro gave {rate} Hz, expected {RATE_HZ}")
            return (np.clip(samples, -1, 1) * 32767).astype("<i2").tobytes()

        return speak
    except (ImportError, OSError, FileNotFoundError) as error:
        print(f"Kokoro is not set up ({error}), so the Mac's voice is used.")

    def speak(line, index):
        path = os.path.join(work, f"{index}.wav")
        subprocess.run(
            ["say", "-v", MAC_VOICE, "-r", str(MAC_RATE), "--file-format=WAVE", f"--data-format=LEI16@{RATE_HZ}", "-o", path, line],
            check=True,
        )
        with wave.open(path) as w:
            return w.readframes(w.getnframes())

    return speak


def make_audio(work):
    """Say every sentence, join them, and return the timings.
    Returns (wav path, scenes with start and end times, total seconds)."""
    speak = make_speaker(work)
    frames = bytearray()
    silence = lambda s: bytes(int(RATE_HZ * s) * 2)
    t = 0.0
    timed = []
    for s_index, scene in enumerate(SCENES):
        start = t
        starts = []
        for l_index, line in enumerate(scene["lines"]):
            data = speak(line, f"{s_index:02d}-{l_index:02d}")
            length = len(data) / 2 / RATE_HZ
            starts.append((t, t + length))
            frames += data + silence(GAP)
            t += length + GAP
        frames += silence(SCENE_END)
        t += SCENE_END
        timed.append({**scene, "start": start, "end": t, "line_times": starts})
    path = os.path.join(work, "voice.wav")
    with wave.open(path, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(RATE_HZ)
        w.writeframes(bytes(frames))
    return path, timed, t


# ---------------------------------------------------------------- drawing help

def ease(x):
    x = max(0.0, min(1.0, x))
    return x * x * (3 - 2 * x)


def ease_out_back(x):
    x = max(0.0, min(1.0, x))
    c1, c3 = 1.70158, 2.70158
    return 1 + c3 * (x - 1) ** 3 + c1 * (x - 1) ** 2


def since(t, start, length=0.6):
    """How far (0 to 1) an animation that starts at 'start' has gone."""
    return ease((t - start) / length)


def text_center(d, xy, text, size, fill=CREAM, shadow=True):
    f = font(size)
    box = d.textbbox((0, 0), text, font=f)
    x = xy[0] - (box[2] - box[0]) / 2
    y = xy[1] - (box[3] - box[1]) / 2 - box[1]
    if shadow:
        d.text((x + 2, y + 3), text, font=f, fill=(60, 34, 16, fill[3] if len(fill) == 4 else 255))
    d.text((x, y), text, font=f, fill=fill)


def text_left(d, xy, text, size, fill=CREAM, shadow=True):
    f = font(size)
    if shadow:
        d.text((xy[0] + 2, xy[1] + 2), text, font=f, fill=(40, 24, 12, fill[3] if len(fill) == 4 else 255))
    d.text(xy, text, font=f, fill=fill)


def with_alpha(color, a):
    return (*color[:3], int(255 * max(0, min(1, a))))


def layer():
    return Image.new("RGBA", (W, H), (0, 0, 0, 0))


def panel(d, box, a=1.0, fill=(20, 28, 40), radius=26):
    d.rounded_rectangle(box, radius=radius, fill=with_alpha(fill, 0.72 * a), outline=with_alpha(CREAM, 0.35 * a), width=2)


def plate(d, cx, cy, w, color, label="", a=1.0, h=46, label_size=30, outline=None):
    box = (cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2)
    d.rounded_rectangle((box[0], box[1] + 5, box[2], box[3] + 5), radius=16, fill=with_alpha((40, 24, 12), 0.35 * a))
    d.rounded_rectangle(box, radius=16, fill=with_alpha(color, a), outline=with_alpha(outline or CREAM, 0.9 * a), width=3)
    d.rounded_rectangle((box[0] + 10, box[1] + 6, box[2] - 10, box[1] + 12), radius=4, fill=with_alpha((255, 255, 255), 0.35 * a))
    if label:
        f = font(label_size)
        bb = d.textbbox((0, 0), label, font=f)
        d.text((cx - (bb[2] - bb[0]) / 2, cy - (bb[3] - bb[1]) / 2 - bb[1]), label, font=f, fill=with_alpha(INK, a))


class StackAnim:
    """A pile of plates that can be pushed and popped over time.
    ops: list of (time, "push", label) or (time, "pop", target) where
    target is None (fly away) or an (x, y) spot."""

    def __init__(self, base_x, base_y, width=170, step=54, ops=(), start_items=()):
        self.x, self.y, self.w, self.step = base_x, base_y, width, step
        self.ops = sorted(ops, key=lambda o: o[0])
        self.start_items = list(start_items)

    def draw(self, d, t, a=1.0, label_size=30, highlight_top_at=None):
        items = [(label, i) for i, label in enumerate(self.start_items)]
        count = len(items)
        moving = []
        landed = []  # popped plates that sit at a target spot
        for (when, kind, value) in self.ops:
            if t < when:
                break
            p = (t - when) / 0.55
            if kind == "push":
                color_index = count
                count += 1
                if p >= 1:
                    items.append((value, color_index))
                else:
                    moving.append(("push", value, color_index, p))
            else:
                if not items:
                    continue
                label, color_index = items.pop()
                if p >= 1:
                    if value is not None:
                        landed.append((label, color_index, value))
                else:
                    moving.append(("pop", label, color_index, p, len(items), value))
        # the base
        d.rounded_rectangle((self.x - self.w / 2 - 20, self.y + 26, self.x + self.w / 2 + 20, self.y + 40), radius=7, fill=with_alpha((120, 84, 50), a))
        for i, (label, ci) in enumerate(items):
            top = i == len(items) - 1
            glow = highlight_top_at is not None and top and t >= highlight_top_at
            plate(d, self.x, self.y - i * self.step, self.w, PLATE_COLORS[ci % len(PLATE_COLORS)], label, a, label_size=label_size, outline=MUSTARD if glow else None)
            if glow:
                d.rounded_rectangle((self.x - self.w / 2 - 8, self.y - i * self.step - 31, self.x + self.w / 2 + 8, self.y - i * self.step + 31), radius=20, outline=with_alpha(MUSTARD, a), width=4)
        for m in moving:
            if m[0] == "push":
                _, label, ci, p = m
                target_y = self.y - len(items) * self.step
                y = -60 + (target_y + 60) * ease_out_back(p)
                plate(d, self.x, y, self.w, PLATE_COLORS[ci % len(PLATE_COLORS)], label, a, label_size=label_size)
            else:
                _, label, ci, p, index, target = m
                sy = self.y - index * self.step
                q = ease(p)
                if target is None:
                    x, y = self.x + 260 * q, sy - 140 * math.sin(q * math.pi / 2)
                    plate(d, x, y, self.w, PLATE_COLORS[ci % len(PLATE_COLORS)], label, a * (1 - q * 0.6), label_size=label_size)
                else:
                    x = self.x + (target[0] - self.x) * q
                    y = sy + (target[1] - sy) * q - 120 * math.sin(q * math.pi)
                    plate(d, x, y, 70, PLATE_COLORS[ci % len(PLATE_COLORS)], label, a, h=60, label_size=label_size)
        for label, ci, spot in landed:
            plate(d, spot[0], spot[1], 70, PLATE_COLORS[ci % len(PLATE_COLORS)], label, a, h=60, label_size=label_size)
        return len(items)


# ---------------------------------------------------------------- assets

def cover(img):
    scale = max(W / img.width, H / img.height)
    img = img.resize((int(img.width * scale + 1), int(img.height * scale + 1)), Image.LANCZOS)
    left = (img.width - W) // 2
    top = (img.height - H) // 2
    return img.crop((left, top, left + W, top + H))


def load_backgrounds():
    out = {}
    for scene in SCENES:
        name = scene["bg"]
        if name in out:
            continue
        img = Image.open(os.path.join(ROOT, "public", "scenes", f"{name}.webp")).convert("RGB")
        img = cover(img).filter(ImageFilter.GaussianBlur(6))
        dark = Image.new("RGB", (W, H), (12, 16, 26))
        out[name] = Image.blend(img, dark, 0.52).convert("RGBA")
    return out


def load_shots():
    """Real screenshots of the game, made by tools/capture_game_shots.mjs."""
    folder = os.path.join(ROOT, "tools", "video-shots")
    return {name[:-5]: Image.open(os.path.join(folder, name)).convert("RGB") for name in os.listdir(folder) if name.endswith(".webp")}


def load_character(who, pose, height):
    img = Image.open(os.path.join(ROOT, "public", "characters", f"{who}-{pose}.webp")).convert("RGBA")
    scale = height / img.height
    return img.resize((int(img.width * scale), height), Image.LANCZOS)


# ---------------------------------------------------------------- the scenes

def screen(frame, shot, box, a=1.0):
    """Show a real screenshot of the game in a rounded frame."""
    x0, y0, x1, y1 = box
    w, h = int(x1 - x0), int(y1 - y0)
    img = shot.resize((w, h), Image.LANCZOS).convert("RGBA")
    mask = Image.new("L", (w, h), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, w - 1, h - 1), radius=22, fill=int(255 * max(0, min(1, a))))
    L = layer()
    d = ImageDraw.Draw(L)
    d.rounded_rectangle((x0 - 4, y0 + 8, x1 + 4, y1 + 14), radius=26, fill=(0, 0, 0, int(110 * a)))
    frame.alpha_composite(L)
    frame.paste(img, (int(x0), int(y0)), mask)
    L = layer()
    ImageDraw.Draw(L).rounded_rectangle((x0, y0, x1, y1), radius=22, outline=with_alpha(CREAM, 0.7 * a), width=3)
    frame.alpha_composite(L)


def badge(d, xy, number, text, a):
    x, y = xy
    f = font(28)
    width = d.textlength(text, font=f) + 90
    d.rounded_rectangle((x, y, x + width, y + 54), radius=27, fill=with_alpha((20, 28, 40), 0.85 * a), outline=with_alpha(MUSTARD, a), width=3)
    d.ellipse((x + 8, y + 7, x + 48, y + 47), fill=with_alpha(MUSTARD, a))
    text_center(d, (x + 28, y + 27), str(number), 24, fill=with_alpha(INK, a), shadow=False)
    text_left(d, (x + 62, y + 12), text, 28, fill=with_alpha(CREAM, a), shadow=False)


def name_tag(d, xy, name, lines, color, a):
    x, y = xy
    panel(d, (x, y, x + 295, y + 40 + 34 * len(lines) + 20), a)
    text_left(d, (x + 22, y + 14), name, 40, fill=with_alpha(color, a))
    for i, line in enumerate(lines):
        text_left(d, (x + 22, y + 66 + i * 34), line, 24, fill=with_alpha(CREAM, a), shadow=False)


def cards_grid(d, local, at, cards, first_line=1):
    for i, (name, what, icon) in enumerate(cards):
        start = at(i + first_line)
        if local < start:
            continue
        a = since(local, start, 0.45)
        col, row = i % 2, i // 2
        x0 = 100 + col * 560
        y0 = 150 + row * 220 + 20 * (1 - a)
        panel(d, (x0, y0, x0 + 520, y0 + 195), a)
        d.rounded_rectangle((x0 + 22, y0 + 28, x0 + 162, y0 + 168), radius=22, fill=with_alpha(PLATE_COLORS[i], a))
        text_center(d, (x0 + 92, y0 + 98), icon, 30 if len(icon) < 8 else 24, fill=with_alpha(INK, a), shadow=False)
        text_left(d, (x0 + 186, y0 + 40), name, 34, fill=with_alpha(MUSTARD, a))
        text_left(d, (x0 + 186, y0 + 96), what[0], 24, fill=with_alpha(CREAM, a), shadow=False)
        text_left(d, (x0 + 186, y0 + 128), what[1], 24, fill=with_alpha(CREAM, a), shadow=False)


def draw_scene(scene, local, line_starts, frame, chars, shots):
    """Draw one scene's pictures on 'frame' at 'local' seconds into it."""
    L = layer()
    d = ImageDraw.Draw(L)
    at = lambda i: line_starts[i] if i < len(line_starts) else 999
    sid = scene["id"]

    # the title at the top
    ta = since(local, 0.05, 0.5)
    text_center(d, (W / 2, 70 - 16 * (1 - ta)), scene["title"], 46, fill=with_alpha(CREAM, ta))

    if sid == "intro":
        a = since(local, 0.2, 0.8)
        frame.alpha_composite(fade(chars["zazo-welcome"], a), (110, H - chars["zazo-welcome"].height - 40))
        frame.alpha_composite(fade(chars["benji-welcome"], a), (W - 110 - chars["benji-welcome"].width, H - chars["benji-welcome"].height - 40))
        text_center(d, (W / 2, 180), "A short class from the island", 30, fill=with_alpha(MUSTARD, a))
        s = StackAnim(W / 2, 470, width=200, ops=[(0.6 + i * 0.35, "push", c) for i, c in enumerate("STACK")])
        s.draw(d, local, label_size=30)

    elif sid == "ds":
        a = since(local, 0.2)
        text_center(d, (W / 2, 175), "Data structure", 64, fill=with_alpha(MUSTARD, a))
        if local >= at(1):
            text_center(d, (W / 2, 245), "a way to keep data in order", 32, fill=with_alpha(CREAM, since(local, at(1))))
        kinds = ["Array", "Linked list", "Queue", "Tree", "Stack"]
        for i, kind in enumerate(kinds):
            start = at(2) + 0.6 + i * 0.7
            if local < start:
                continue
            b = since(local, start, 0.4)
            x = 140 + i * 250
            is_stack = kind == "Stack"
            glow = is_stack and local >= at(2) + 4.0
            d.rounded_rectangle((x - 105, 300, x + 105, 380), radius=20, fill=with_alpha(PLATE_COLORS[i], b), outline=with_alpha(MUSTARD if glow else CREAM, b), width=6 if glow else 2)
            text_center(d, (x, 340), kind, 30, fill=with_alpha(INK, b), shadow=False)
        if local >= at(3):
            c = since(local, at(3))
            text_center(d, (W / 2, 440), "Linear: the items sit in a line", 32, fill=with_alpha(LEAF, c))
            for i in range(5):
                x = W / 2 - 240 + i * 120
                d.rounded_rectangle((x - 40, 490, x + 40, 550), radius=14, fill=with_alpha(PLATE_COLORS[i], c))
                if i < 4:
                    d.polygon([(x + 50, 510), (x + 72, 520), (x + 50, 530)], fill=with_alpha(CREAM, c))

    elif sid == "what":
        spots = [(W / 2 + 140 + i * 90, 520) for i in range(3)]
        ops = [(0.5, "push", "1"), (1.1, "push", "2"), (1.7, "push", "3")]
        ops += [(at(3) + 0.3 + i * 0.7, "pop", spots[i]) for i in range(3)]
        s = StackAnim(W / 2 - 260, 500, width=220, ops=ops)
        s.draw(d, local, label_size=34)
        notes = [("Add on the top", LEAF, 0.0), ("Take off the top", SKY, 1.2), ("Never from the middle", SASH, 2.6)]
        for text, color, offset in notes:
            if local >= at(1) + offset:
                text_left(d, (W / 2 - 20, 170 + notes.index((text, color, offset)) * 56), text, 34, fill=with_alpha(color, since(local, at(1) + offset)))
        if local >= at(2):
            text_left(d, (W / 2 - 20, 350), "LIFO", 90, fill=with_alpha(MUSTARD, since(local, at(2), 0.5)))
            text_left(d, (W / 2 + 230, 380), "Last In, First Out", 30, fill=with_alpha(CREAM, since(local, at(2) + 0.4)))

    elif sid == "ops":
        cards = [("Push", "put on top", LEAF, at(1)), ("Pop", "take off the top", SASH, at(1) + 2.2), ("Peek", "look at the top", SKY, at(2)), ("Is empty", "is anything left?", MUSTARD, at(3))]
        dim = 1 - 0.7 * since(local, at(4), 0.5)
        for i, (name, what, color, start) in enumerate(cards):
            if local < start:
                continue
            a = since(local, start, 0.4) * dim
            y = 150 + i * 112
            panel(d, (W / 2 + 20, y, W - 90, y + 94), a)
            text_left(d, (W / 2 + 50, y + 14), name, 36, fill=with_alpha(color, a))
            text_left(d, (W / 2 + 50, y + 56), what, 24, fill=with_alpha(CREAM, a), shadow=False)
        ops = [(0.3, "push", "A"), (0.7, "push", "B"), (at(1) + 0.4, "push", "C"), (at(1) + 2.4, "pop", None)]
        s = StackAnim(330, 500, width=200, ops=ops)
        s.draw(d, local, highlight_top_at=at(2) + 0.2, a=dim)
        if at(3) + 0.4 <= local < at(4):
            text_center(d, (330, 230), "Is empty?  No", 34, fill=with_alpha(MUSTARD, since(local, at(3) + 0.4)))
        if local >= at(4):
            e = since(local, at(4), 0.5)
            panel(d, (W / 2 - 300, 200, W / 2 + 300, 470), e)
            text_center(d, (W / 2, 300), "O(1)", 110, fill=with_alpha(MUSTARD, e))
            text_center(d, (W / 2, 410), "only the top is touched", 32, fill=with_alpha(CREAM, e))

    elif sid == "dsa":
        cards_grid(d, local, at, [
            ("Call stack", ("functions wait their", "turn: recursion"), "f(f())"),
            ("Brackets", ("every ( needs", "its own )"), "( { } )"),
            ("Math", ("3 + 4, then", "times 5 = 35"), "3 4 + 5 x"),
            ("Mazes (DFS)", ("back up and try", "a new path"), "maze"),
        ])

    elif sid == "apps":
        rows = [("Undo", "your last change comes off first", "Ctrl+Z", 1), ("Back button", "back to the last screen you saw", "<-", 2), ("Redo", "the undone change goes back on top", "Ctrl+Y", 3)]
        for i, (name, what, icon, line) in enumerate(rows):
            if local < at(line):
                continue
            a = since(local, at(line), 0.45)
            y = 160 + i * 145 + 20 * (1 - a)
            panel(d, (150, y, W - 150, y + 120), a)
            d.rounded_rectangle((176, y + 18, 326, y + 102), radius=20, fill=with_alpha(PLATE_COLORS[i + 1], a))
            text_center(d, (251, y + 60), icon, 30, fill=with_alpha(INK, a), shadow=False)
            text_left(d, (360, y + 20), name, 38, fill=with_alpha(MUSTARD, a))
            text_left(d, (360, y + 70), what, 26, fill=with_alpha(CREAM, a), shadow=False)

    elif sid == "proscons":
        good = ["Simple to build", "Fast: O(1)", "Little extra memory"]
        bad = ["Only the top can be reached", "Overflow: too full", "Underflow: empty"]
        for side, items, color, starts in ((0, good, LEAF, [0.6, 1.8, 3.0]), (1, bad, SASH, [at(1) + 0.3, at(2) + 0.2, at(2) + 2.0])):
            x0 = 90 + side * 560
            if local >= starts[0]:
                a = since(local, starts[0])
                panel(d, (x0, 140, x0 + 540, 560), a)
                text_left(d, (x0 + 30, 160), "Good sides" if side == 0 else "Limits", 40, fill=with_alpha(color, a))
            for i, item in enumerate(items):
                if local < starts[i]:
                    continue
                b = since(local, starts[i], 0.4)
                y = 250 + i * 100
                d.ellipse((x0 + 30, y, x0 + 82, y + 52), fill=with_alpha(color, b))
                if side == 0:
                    d.line((x0 + 43, y + 27, x0 + 53, y + 38, x0 + 71, y + 15), fill=with_alpha(CREAM, b), width=7, joint="curve")
                else:
                    d.line((x0 + 45, y + 15, x0 + 67, y + 37), fill=with_alpha(CREAM, b), width=7)
                    d.line((x0 + 45, y + 37, x0 + 67, y + 15), fill=with_alpha(CREAM, b), width=7)
                text_left(d, (x0 + 100, y + 8), item, 30, fill=with_alpha(CREAM, b))

    elif sid == "meet":
        a = since(local, 0.2)
        text_center(d, (W / 2, 140), "The Tribezo islands", 34, fill=with_alpha(MUSTARD, a))
        if local >= at(1):
            b = since(local, at(1), 0.7)
            zazo = chars["zazo-welcome"]
            frame.alpha_composite(fade(zazo, b), (90, H - zazo.height - 30))
            name_tag(d, (335, 175), "Zazo", ["Leader of the islands", "Loud and friendly", "Speaks Calonis"], SASH, b)
        if local >= at(2):
            c = since(local, at(2), 0.7)
            benji = chars["benji-welcome"]
            frame.alpha_composite(fade(benji, c), (W - benji.width - 90, H - benji.height - 30))
            name_tag(d, (650, 175), "Benji", ["The calm translator", "Speaks English", "and Calonis"], SKY, c)
        if local >= at(3):
            s = StackAnim(W / 2, 560, width=120, step=38, ops=[(at(3) + 0.3 + i * 0.25, "push", ch) for i, ch in enumerate("STACK")])
            s.draw(d, local, label_size=22)
            text_center(d, (W / 2, 595), "Benji's stack", 24, fill=with_alpha(MUSTARD, since(local, at(3) + 0.3)))

    elif sid == "convo":
        steps = [
            ("chat", None, None),
            ("chat", (1, "You type"), None),
            ("benji-tells-zazo", (2, "Benji tells Zazo"), "bubble-benji-tells"),
            ("zazo-answers", (3, "Zazo answers"), "bubble-zazo"),
            ("benji-translates", (4, "Benji translates"), "bubble-benji-translates"),
        ]
        current = 0
        for i in range(len(steps)):
            if local >= at(i):
                current = i
        box = (50, 130, 690, 490)
        name, label, bubble = steps[current]
        prev = steps[max(0, current - 1)][0]
        mix = since(local, at(current), 0.45) if current > 0 else 1.0
        screen(frame, shots[prev], box, 1.0)
        screen(frame, shots[name], box, mix)
        if label:
            badge(d, (70, 145), label[0], label[1], since(local, at(current), 0.35))
        if bubble:
            # the same speech bubble, zoomed in so it can be read
            e = since(local, at(current) + 0.3, 0.45)
            img = shots[bubble]
            w = 520
            h = int(img.height * w / img.width)
            text_left(d, (725, 150), "Zoomed in", 24, fill=with_alpha(MUSTARD, e), shadow=False)
            frame.alpha_composite(L)
            L = layer()
            d = ImageDraw.Draw(L)
            screen(frame, img, (720, 190, 720 + w, 190 + h), e)
        if current == 1:
            e = since(local, at(1) + 0.4)
            panel(d, (720, 150, 1230, 230), e)
            text_left(d, (745, 170), "You: How old are you?", 34, fill=with_alpha(CREAM, e))
            spots = [(1020, 330), (1100, 330), (1180, 330)]
            ops = [(at(1) + 2.0 + i * 0.35, "push", ch) for i, ch in enumerate("How")]
            ops += [(at(1) + 3.4 + i * 0.45, "pop", spots[i]) for i in range(3)]
            s = StackAnim(840, 480, width=120, step=48, ops=ops)
            s.draw(d, local, label_size=28)
            if local >= at(1) + 5.0:
                text_center(d, (1100, 400), "How  becomes  woH", 28, fill=with_alpha(MUSTARD, since(local, at(1) + 5.0)))

    elif sid == "flip":
        word = "hello"
        spots = [(W / 2 + 90 + i * 90, 470) for i in range(5)]
        ops = [(at(1) + 1.4 + i * 0.45, "push", c) for i, c in enumerate(word)]
        ops += [(at(3) + 0.1 + i * 0.5, "pop", spots[i]) for i in range(5)]
        s = StackAnim(360, 540, width=170, step=58, ops=ops)
        s.draw(d, local, label_size=34)
        if local >= at(1):
            a = since(local, at(1))
            for i, c in enumerate(word):
                pushed = local >= at(1) + 1.4 + i * 0.45
                plate(d, 250 + i * 55, 175, 48, PLATE_COLORS[i], c, a * (0.3 if pushed else 1), h=52, label_size=30)
            text_left(d, (W / 2 + 60, 170), "In:  hello", 40, fill=with_alpha(CREAM, a))
        if local >= at(3) + 2.7:
            text_left(d, (W / 2 + 60, 260), "Out: olleh", 40, fill=with_alpha(MUSTARD, since(local, at(3) + 2.7)))
        if local >= at(2):
            text_left(d, (W / 2 + 60, 380), "Last in, first out", 28, fill=with_alpha(CREAM, since(local, at(2))), shadow=False)

    elif sid == "rules":
        rows = [
            (1, "hello, world!", "olleh, dlrow!", "marks stay put"),
            (2, "it costs $20.", "ti stsoc $20.", "money stays"),
            (3, "Hello, Mary!", "olleH, Mary!", "names stay"),
        ]
        for i, (line, english, flipped, why) in enumerate(rows):
            if local < at(line):
                continue
            a = since(local, at(line), 0.45)
            y = 160 + i * 140
            panel(d, (110, y, W - 110, y + 115), a)
            text_left(d, (150, y + 20), english, 38, fill=with_alpha(CREAM, a))
            d.polygon([(560, y + 32), (600, y + 48), (560, y + 64)], fill=with_alpha(MUSTARD, a))
            text_left(d, (630, y + 20), flipped, 38, fill=with_alpha(MUSTARD, a))
            text_left(d, (150, y + 72), why, 24, fill=with_alpha(LEAF, a), shadow=False)

    elif sid == "build":
        a = since(local, 0.3)
        panel(d, (90, 140, 600, 380), a)
        code = ["typedef struct {", "    char *items;", "    size_t size;", "    size_t capacity;", "} Stack;"]
        for i, line in enumerate(code):
            d.text((120, 165 + i * 40), line, font=font(28), fill=with_alpha((200, 230, 255), a))
        text_left(d, (90, 395), "backend/src/stack.c", 24, fill=with_alpha(MUSTARD, a))
        b = since(local, 1.4)
        grow = since(local, at(1) + 0.8, 0.8)
        cells = 4 + int(round(4 * grow))
        filled = 4 if local < at(1) else 5 if local > at(1) + 1.7 else 4
        x0, y0, size = 660, 210, 62
        for i in range(cells):
            x = x0 + i * (size + 6)
            col = PLATE_COLORS[i % 6] if i < filled else (70, 80, 95)
            d.rounded_rectangle((x, y0, x + size, y0 + size), radius=12, fill=with_alpha(col, b), outline=with_alpha(CREAM, 0.6 * b), width=2)
            if i < filled:
                text_center(d, (x + size / 2, y0 + size / 2), "hello"[i], 30, fill=with_alpha(INK, b), shadow=False)
        text_left(d, (x0, y0 - 56), "array", 30, fill=with_alpha(CREAM, b))
        top_x = x0 + (filled - 1) * (size + 6) + size / 2
        text_center(d, (top_x, y0 + size + 32), "top", 26, fill=with_alpha(MUSTARD, b))
        if local >= at(1):
            text_left(d, (x0, y0 + size + 66), "Full? Make it 2 times bigger", 26, fill=with_alpha(LEAF, since(local, at(1))))
        if local >= at(2):
            c = since(local, at(2))
            for i, step in enumerate(["C code", "WebAssembly", "Your browser"]):
                x = 200 + i * 330
                d.rounded_rectangle((x - 130, 470, x + 130, 545), radius=24, fill=with_alpha(PLATE_COLORS[i + 1], c))
                text_center(d, (x, 507), step, 30, fill=with_alpha(INK, c), shadow=False)
                if i < 2:
                    d.polygon([(x + 150, 492), (x + 190, 507), (x + 150, 522)], fill=with_alpha(CREAM, c))

    elif sid == "history":
        a = since(local, 0.3, 0.6)
        panel_img = shots["history-panel"]
        h = 430
        scale = h / panel_img.height
        w = int(panel_img.width * scale)
        x0, y0 = 120, 125
        screen(frame, panel_img, (x0, y0, x0 + w, y0 + h), a)
        if local >= at(1):
            b = since(local, at(1), 0.5)
            # circle the "stack: 12 pushes, 12 pops" line in the panel
            y = y0 + 412 * scale
            d.rounded_rectangle((x0 + 66 * scale, y - 16, x0 + 470 * scale, y + 16), radius=12, outline=with_alpha(MUSTARD, b), width=5)
            text_left(d, (x0 + w + 70, 200), "12 pushes", 64, fill=with_alpha(MUSTARD, b))
            text_left(d, (x0 + w + 70, 290), "12 pops", 64, fill=with_alpha(MUSTARD, since(local, at(1) + 0.4, 0.5)))
            text_left(d, (x0 + w + 70, 390), "one of each, for every letter", 28, fill=with_alpha(CREAM, since(local, at(1) + 1.0)))

    elif sid == "outro":
        words = ["English", "Calonis", "English"]
        for i, w in enumerate(words):
            start = at(1) + i * 1.3
            if local < start:
                continue
            a = since(local, start, 0.45)
            x = 250 + i * 390
            d.rounded_rectangle((x - 150, 240, x + 150, 330), radius=28, fill=with_alpha(PLATE_COLORS[i * 2], a))
            text_center(d, (x, 285), w, 38, fill=with_alpha(INK, a), shadow=False)
            if i < 2 and local >= start + 0.6:
                d.polygon([(x + 170, 270), (x + 220, 285), (x + 170, 300)], fill=with_alpha(CREAM, since(local, start + 0.6)))
        if local >= at(2):
            a = since(local, at(2), 0.5)
            text_center(d, (W / 2, 470), "olleH!", 120 + int(10 * math.sin(local * 3)), fill=with_alpha(MUSTARD, a))
            zazo = chars["zazo-laughing"]
            frame.alpha_composite(fade(zazo, a), (60, H - zazo.height - 10))

    frame.alpha_composite(L)


def fade(img, a):
    if a >= 1:
        return img
    out = img.copy()
    alpha = out.getchannel("A").point(lambda v: int(v * max(0, a)))
    out.putalpha(alpha)
    return out


def draw_caption(frame, text, a):
    if not text or a <= 0:
        return
    L = layer()
    d = ImageDraw.Draw(L)
    f = font(28)
    words, lines, line = text.split(), [], ""
    for word in words:
        test = (line + " " + word).strip()
        if d.textlength(test, font=f) > 980:
            lines.append(line)
            line = word
        else:
            line = test
    lines.append(line)
    height = 44 * len(lines) + 24
    top = H - height - 22
    widest = max(d.textlength(l, font=f) for l in lines)
    d.rounded_rectangle((W / 2 - widest / 2 - 28, top, W / 2 + widest / 2 + 28, top + height), radius=22, fill=(0, 0, 0, int(165 * a)))
    for i, l in enumerate(lines):
        text_center(d, (W / 2, top + 34 + i * 44), l, 28, fill=with_alpha(CREAM, a), shadow=False)
    frame.alpha_composite(L)


# ---------------------------------------------------------------- putting it together

def write_script(timed):
    lines = ["# How the Stack Works: the video script", "", "The narration for `public/video/stack-explained.mp4`. Made by `tools/make_stack_video.py`.", ""]
    for scene in timed:
        m, s = divmod(int(scene["start"]), 60)
        lines.append(f"## {m}:{s:02d} {scene['title']}")
        lines.append("")
        for line in scene["lines"]:
            lines.append(f"- {line}")
        lines.append("")
    lines.append("Facts checked against GeeksforGeeks (Stack Data Structure, and Applications, Advantages and Disadvantages of Stack) and Programiz (Stack Data Structure).")
    with open(SCRIPT_FILE, "w") as f:
        f.write("\n".join(lines) + "\n")


def main():
    if not shutil.which("ffmpeg"):
        raise SystemExit("This needs ffmpeg.")
    os.makedirs(OUT_DIR, exist_ok=True)
    work = tempfile.mkdtemp(prefix="tribezo-video-")
    voice, timed, total = make_audio(work)
    write_script(timed)
    print(f"Voice: {total:.1f} seconds")

    backgrounds = load_backgrounds()
    shots = load_shots()
    chars = {
        "zazo-welcome": load_character("zazo", "welcome", 430),
        "benji-welcome": load_character("benji", "welcome", 430),
        "benji-pointing": load_character("benji", "pointing", 470),
        "zazo-talking": load_character("zazo", "talking", 380),
        "benji-talking": load_character("benji", "talking", 380),
        "zazo-laughing": load_character("zazo", "laughing", 340),
    }

    video = subprocess.Popen(
        [
            "ffmpeg", "-y", "-loglevel", "error",
            "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
            "-i", voice,
            "-c:v", "libx264", "-preset", "slow", "-crf", "27", "-pix_fmt", "yuv420p",
            # a keyframe every 2 seconds, so jumping around in the video is quick
            "-g", str(FPS * 2), "-keyint_min", str(FPS),
            "-c:a", "aac", "-b:a", "96k", "-shortest", "-movflags", "+faststart",
            OUT_FILE,
        ],
        stdin=subprocess.PIPE,
    )

    frames = int(total * FPS) + 1
    for n in range(frames):
        t = n / FPS
        scene = next((s for s in timed if s["start"] <= t < s["end"]), timed[-1])
        local = t - scene["start"]
        starts = [a - scene["start"] for a, _ in scene["line_times"]]
        frame = backgrounds[scene["bg"]].copy()
        draw_scene(scene, local, starts, frame, chars, shots)

        caption, cap_a = "", 0.0
        for (a, b), line in zip(scene["line_times"], scene["lines"]):
            if a - 0.05 <= t <= b + GAP:
                caption, cap_a = line, min(1.0, (t - a + 0.05) / 0.15)
        draw_caption(frame, caption, cap_a)

        # a thin line at the top shows how far the video has gone
        bar = ImageDraw.Draw(frame)
        bar.rectangle((0, 0, int(W * t / total), 5), fill=MUSTARD)

        # fade in and out between scenes
        edge = min(local, scene["end"] - t)
        rgb = frame.convert("RGB")
        if edge < 0.3:
            rgb = Image.blend(Image.new("RGB", (W, H), (0, 0, 0)), rgb, max(0.0, edge / 0.3))
        video.stdin.write(rgb.tobytes())
        if n % (FPS * 20) == 0:
            print(f"  {t:5.1f} s")
    video.stdin.close()
    video.wait()
    shutil.rmtree(work, ignore_errors=True)
    print(f"Made {OUT_FILE} ({os.path.getsize(OUT_FILE) / 1e6:.1f} MB)")


if __name__ == "__main__":
    main()
