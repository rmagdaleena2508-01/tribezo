"""Makes the "How the Stack Works" video (public/video/stack-explained.mp4).

How it works:
  1. Every sentence of the script is read out loud by Kokoro, a free, open
     source voice model (Apache 2.0) that runs on this computer, with no
     internet and no key. The voice is "am_puck", a young, natural sounding
     male voice. If Kokoro is not set up, the Mac's own voice ("say") is
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
KOKORO_VOICE = "am_puck"  # a young male voice; others: am_liam, am_michael, am_echo
KOKORO_SPEED = 1.0
MAC_VOICE = "Samantha"  # only used if Kokoro is not set up
MAC_RATE = 165  # words a minute
RATE_HZ = 24000
GAP = 0.35  # pause after each sentence, in seconds
SCENE_END = 0.8  # pause at the end of each scene

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
            "Hi, and welcome to Tribezo!",
            "In this video, you will learn what a stack is.",
            "You will see where stacks help us in real life.",
            "And you will see how Benji uses a stack to talk with Zazo.",
        ],
    },
    {
        "id": "what",
        "title": "What is a stack?",
        "bg": "village",
        "lines": [
            "A stack is a way to keep things in a pile.",
            "Think of a pile of plates.",
            "You can only put a new plate on the top.",
            "You can only take a plate off the top.",
            "You cannot pull a plate out of the middle.",
        ],
    },
    {
        "id": "lifo",
        "title": "Last In, First Out",
        "bg": "village",
        "lines": [
            "This rule has a name. Last in, first out.",
            "People call it LIFO for short.",
            "The last plate you put on is the first plate you take off.",
        ],
    },
    {
        "id": "ops",
        "title": "The four jobs of a stack",
        "bg": "family-hut",
        "lines": [
            "A stack has four small jobs.",
            "Push puts a new item on the top.",
            "Pop takes the top item off.",
            "Peek looks at the top item, but does not take it off.",
            "And is empty checks if the stack has nothing in it.",
        ],
    },
    {
        "id": "speed",
        "title": "Always fast",
        "bg": "family-hut",
        "lines": [
            "Push and pop are always fast.",
            "It does not matter if the stack holds five things or five million things.",
            "Computer people call this O of 1. It means the same short time, every time.",
        ],
    },
    {
        "id": "uses",
        "title": "Stacks in real life",
        "bg": "jungle-path",
        "lines": [
            "Stacks are all around you.",
            "The undo button uses a stack. Your newest change comes off first.",
            "The back button in a web browser uses a stack of the pages you visited.",
            "When a program calls a function, the computer puts it on a call stack, and takes it off when the job is done.",
            "Stacks also check that every open bracket has a matching close bracket.",
        ],
    },
    {
        "id": "pros",
        "title": "Why stacks are good",
        "bg": "waterfall",
        "lines": [
            "Why do people like stacks?",
            "They are simple to build.",
            "Push and pop are very fast.",
            "And they use very little extra memory.",
        ],
    },
    {
        "id": "cons",
        "title": "What stacks cannot do well",
        "bg": "waterfall",
        "lines": [
            "Stacks have limits too.",
            "You can only reach the top. To find something in the middle, you must take things off one by one.",
            "If a stack has a fixed size and gets too full, that is called overflow.",
            "If you try to pop from an empty stack, that is called underflow.",
        ],
    },
    {
        "id": "build",
        "title": "The stack inside Tribezo",
        "bg": "lookout",
        "lines": [
            "Now let's see the stack inside Tribezo.",
            "It is written in the C language.",
            "It keeps letters in a list called an array. The top of the stack is the end of the list.",
            "When the list gets full, it grows to twice its size, so it never overflows.",
            "The same C code runs right in your web browser, as WebAssembly.",
        ],
    },
    {
        "id": "flip",
        "title": "Flipping a word",
        "bg": "lookout",
        "lines": [
            "Here is how the stack flips a word.",
            "Take the word hello. Push each letter onto the stack. H, E, L, L, O.",
            "Now pop them off, one at a time. The last letter in comes out first.",
            "O, L, L, E, H. The word is flipped! Hello becomes olleh.",
        ],
    },
    {
        "id": "rules",
        "title": "What does not flip",
        "bg": "island-arrival",
        "lines": [
            "The stack only flips letters.",
            "Commas, marks, and spaces stay in their spots.",
            "Numbers and money are never flipped, so twenty dollars stays twenty dollars.",
            "And your name stays just the way you typed it.",
        ],
    },
    {
        "id": "benji",
        "title": "When you talk to Benji",
        "bg": "village",
        "lines": [
            "So what happens when you talk to Benji?",
            "You type in English. Benji pushes the letters of each word onto the stack, then pops them off.",
            "The words come out flipped. This is Calonis, Zazo's language.",
            "Where are you from, becomes, erehW era uoy morf.",
        ],
    },
    {
        "id": "zazo",
        "title": "When Zazo answers",
        "bg": "village",
        "lines": [
            "When Zazo answers, the same stack flips his words too.",
            "Zazo speaks in Calonis, and Benji tells you what he said in English.",
            "Open the History panel to see how many pushes and pops the stack did for each message.",
        ],
    },
    {
        "id": "outro",
        "title": "One stack, two directions",
        "bg": "fire-camp",
        "lines": [
            "One stack, two directions.",
            "Flip English once, and you get Calonis. Flip it again, and you get English back.",
            "Now go and say hello to Zazo. Or, as he would say, olleH!",
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
            samples, rate = kokoro.create(line, voice=KOKORO_VOICE, speed=KOKORO_SPEED, lang="en-us")
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


def load_character(who, pose, height):
    img = Image.open(os.path.join(ROOT, "public", "characters", f"{who}-{pose}.webp")).convert("RGBA")
    scale = height / img.height
    return img.resize((int(img.width * scale), height), Image.LANCZOS)


# ---------------------------------------------------------------- the scenes

def draw_scene(scene, local, line_starts, frame, chars):
    """Draw one scene's pictures on 'frame' at 'local' seconds into it."""
    L = layer()
    d = ImageDraw.Draw(L)
    at = lambda i: line_starts[i] if i < len(line_starts) else 999
    sid = scene["id"]

    # the title at the top
    ta = since(local, 0.05, 0.5)
    text_center(d, (W / 2, 70 - 16 * (1 - ta)), scene["title"], 50, fill=with_alpha(CREAM, ta))

    if sid == "intro":
        a = since(local, 0.2, 0.8)
        frame.alpha_composite(fade(chars["zazo-welcome"], a), (110, H - chars["zazo-welcome"].height - 40))
        frame.alpha_composite(fade(chars["benji-welcome"], a), (W - 110 - chars["benji-welcome"].width, H - chars["benji-welcome"].height - 40))
        text_center(d, (W / 2, 180), "A short lesson from the island", 30, fill=with_alpha(MUSTARD, a))
        s = StackAnim(W / 2, 470, width=200, ops=[(0.6 + i * 0.35, "push", c) for i, c in enumerate("STACK")])
        s.draw(d, local, label_size=30)

    elif sid == "what":
        ops = [(0.3, "push", ""), (0.5, "push", ""), (0.7, "push", ""), (at(2) + 0.6, "push", ""), (at(3) + 0.6, "pop", None)]
        s = StackAnim(W / 2 - 180, 540, width=240, ops=ops)
        s.draw(d, local)
        if local >= at(2):
            text_left(d, (W / 2 + 60, 260), "Put on the top", 34, fill=with_alpha(LEAF, since(local, at(2))))
        if local >= at(3):
            text_left(d, (W / 2 + 60, 330), "Take off the top", 34, fill=with_alpha(SKY, since(local, at(3))))
        if local >= at(4):
            a = since(local, at(4))
            text_left(d, (W / 2 + 60, 400), "Not from the middle", 34, fill=with_alpha(SASH, a))
            cx, cy = W / 2 - 180, 540 - 54
            d.line((cx - 50, cy - 30, cx + 50, cy + 30), fill=with_alpha(SASH, a), width=10)
            d.line((cx - 50, cy + 30, cx + 50, cy - 30), fill=with_alpha(SASH, a), width=10)

    elif sid == "lifo":
        text_center(d, (W / 2, 190), "LIFO", 110, fill=with_alpha(MUSTARD, since(local, at(1), 0.5)))
        spots = [(W / 2 + 180 + i * 90, 470) for i in range(3)]
        ops = [(0.4, "push", "1"), (1.0, "push", "2"), (1.6, "push", "3")]
        ops += [(at(2) + 0.4 + i * 0.7, "pop", spots[i]) for i in range(3)]
        s = StackAnim(W / 2 - 220, 560, width=200, ops=ops)
        s.draw(d, local, label_size=34)
        if local >= at(2):
            text_left(d, (W / 2 + 130, 380), "Comes out first", 30, fill=with_alpha(CREAM, since(local, at(2))))

    elif sid == "ops":
        cards = [("push", "Push", "put on top", LEAF), ("pop", "Pop", "take off the top", SASH), ("peek", "Peek", "look at the top", SKY), ("empty", "Is empty", "is nothing left?", MUSTARD)]
        for i, (_, name, what, color) in enumerate(cards):
            start = at(i + 1)
            if local < start:
                continue
            a = since(local, start, 0.4)
            y = 170 + i * 115
            panel(d, (W / 2 + 20, y, W - 90, y + 95), a)
            text_left(d, (W / 2 + 50, y + 16), name, 36, fill=with_alpha(color, a))
            text_left(d, (W / 2 + 50, y + 58), what, 24, fill=with_alpha(CREAM, a), shadow=False)
        ops = [(0.3, "push", "A"), (0.7, "push", "B"), (at(1) + 0.4, "push", "C"), (at(2) + 0.4, "pop", None)]
        s = StackAnim(330, 560, width=200, ops=ops)
        s.draw(d, local, highlight_top_at=at(3) + 0.2)
        if local >= at(4) + 0.4:
            text_center(d, (330, 260), "Is empty?  No", 34, fill=with_alpha(MUSTARD, since(local, at(4) + 0.4)))

    elif sid == "speed":
        text_center(d, (W / 2, 190), "O(1)", 120, fill=with_alpha(MUSTARD, since(local, at(2), 0.5)))
        a = since(local, 0.3)
        # a small stack and a very tall one, both with the same clock
        for i in range(5):
            plate(d, 300, 500 - i * 30, 150, PLATE_COLORS[i % 6], "", a, h=26)
        for i in range(14):
            plate(d, 980, 500 - i * 22, 150, PLATE_COLORS[i % 6], "", a, h=18)
        text_center(d, (300, 555), "5 things", 30, fill=with_alpha(CREAM, a))
        text_center(d, (980, 555), "5 million things", 30, fill=with_alpha(CREAM, a))
        for cx, top in ((300, 320), (980, 160)):
            spin = (local * 2.2) % (2 * math.pi)
            d.ellipse((cx - 30, top - 30, cx + 30, top + 30), outline=with_alpha(CREAM, a), width=5)
            d.line((cx, top, cx + 22 * math.cos(spin), top + 22 * math.sin(spin)), fill=with_alpha(MUSTARD, a), width=5)
        if local >= at(2):
            text_center(d, (W / 2, 300), "same short time", 34, fill=with_alpha(CREAM, since(local, at(2))))

    elif sid == "uses":
        cards = [("Undo", ("newest change", "comes off first"), "Ctrl+Z"), ("Back button", ("the pages", "you visited"), "<-"), ("Call stack", ("functions waiting", "to finish"), "f()"), ("Brackets", ("each ( needs", "its own )"), "( { } )")]
        for i, (name, what, icon) in enumerate(cards):
            start = at(i + 1)
            if local < start:
                continue
            a = since(local, start, 0.45)
            col, row = i % 2, i // 2
            x0 = 120 + col * 540
            y0 = 160 + row * 230 + 20 * (1 - a)
            panel(d, (x0, y0, x0 + 500, y0 + 200), a)
            d.rounded_rectangle((x0 + 24, y0 + 30, x0 + 164, y0 + 170), radius=22, fill=with_alpha(PLATE_COLORS[i], a))
            text_center(d, (x0 + 94, y0 + 100), icon, 34, fill=with_alpha(INK, a), shadow=False)
            text_left(d, (x0 + 190, y0 + 52), name, 38, fill=with_alpha(MUSTARD, a))
            text_left(d, (x0 + 190, y0 + 110), what[0], 24, fill=with_alpha(CREAM, a), shadow=False)
            text_left(d, (x0 + 190, y0 + 142), what[1], 24, fill=with_alpha(CREAM, a), shadow=False)

    elif sid in ("pros", "cons"):
        good = sid == "pros"
        items = (
            ["Simple to build", "Push and pop are very fast: O(1)", "Very little extra memory"]
            if good
            else ["Only the top can be reached", "Overflow: too full", "Underflow: popping when empty"]
        )
        for i, item in enumerate(items):
            start = at(i + 1)
            if local < start:
                continue
            a = since(local, start, 0.4)
            y = 180 + i * 130
            panel(d, (170, y, W - 170, y + 105), a)
            color = LEAF if good else SASH
            d.ellipse((200, y + 22, 262, y + 84), fill=with_alpha(color, a))
            if good:
                d.line((215, y + 55, 228, y + 68, 250, y + 38), fill=with_alpha(CREAM, a), width=8, joint="curve")
            else:
                d.line((217, y + 39, 245, y + 67), fill=with_alpha(CREAM, a), width=8)
                d.line((217, y + 67, 245, y + 39), fill=with_alpha(CREAM, a), width=8)
            text_left(d, (292, y + 32), item, 38, fill=with_alpha(CREAM, a))

    elif sid == "build":
        a = since(local, at(1))
        if local >= at(1):
            panel(d, (100, 150, 620, 390), a)
            code = ["typedef struct {", "    char *items;", "    size_t size;", "    size_t capacity;", "} Stack;"]
            for i, line in enumerate(code):
                d.text((130, 175 + i * 40), line, font=font(28), fill=with_alpha((200, 230, 255), a))
            text_left(d, (100, 405), "backend/src/stack.c", 24, fill=with_alpha(MUSTARD, a))
        if local >= at(2):
            b = since(local, at(2))
            grow = since(local, at(3) + 0.8, 0.8)
            cells = 4 + int(round(4 * grow))
            filled = 4 if local < at(3) else 4 + (1 if local > at(3) + 1.7 else 0)
            x0, y0, size = 680, 220, 62
            for i in range(cells):
                x = x0 + i * (size + 6)
                col = PLATE_COLORS[i % 6] if i < filled else (70, 80, 95)
                d.rounded_rectangle((x, y0, x + size, y0 + size), radius=12, fill=with_alpha(col, b), outline=with_alpha(CREAM, 0.6 * b), width=2)
                if i < filled:
                    text_center(d, (x + size / 2, y0 + size / 2), "hellowor"[i], 30, fill=with_alpha(INK, b), shadow=False)
            text_left(d, (x0, y0 - 60), "array", 30, fill=with_alpha(CREAM, b))
            top_x = x0 + (filled - 1) * (size + 6) + size / 2
            text_center(d, (top_x, y0 + size + 34), "top", 26, fill=with_alpha(MUSTARD, b))
            if local >= at(3):
                text_left(d, (x0, y0 + size + 70), "Full? Make it 2 times bigger", 26, fill=with_alpha(LEAF, since(local, at(3))))
        if local >= at(4):
            c = since(local, at(4))
            steps = ["C code", "WebAssembly", "Your browser"]
            for i, s in enumerate(steps):
                x = 200 + i * 330
                d.rounded_rectangle((x - 130, 500, x + 130, 580), radius=24, fill=with_alpha(PLATE_COLORS[i + 1], c))
                text_center(d, (x, 540), s, 30, fill=with_alpha(INK, c), shadow=False)
                if i < 2:
                    d.polygon([(x + 150, 525), (x + 190, 540), (x + 150, 555)], fill=with_alpha(CREAM, c))

    elif sid == "flip":
        word = "hello"
        spots = [(W / 2 + 90 + i * 90, 470) for i in range(5)]
        ops = [(at(1) + 1.6 + i * 0.5, "push", c) for i, c in enumerate(word)]
        ops += [(at(3) + 0.1 + i * 0.55, "pop", spots[i]) for i in range(5)]
        s = StackAnim(360, 590, width=170, step=58, ops=ops)
        s.draw(d, local, label_size=34)
        if local >= at(1):
            a = since(local, at(1))
            for i, c in enumerate(word):
                pushed = local >= at(1) + 1.6 + i * 0.5
                plate(d, 250 + i * 55, 175, 48, PLATE_COLORS[i], c, a * (0.3 if pushed else 1), h=52, label_size=30)
            text_left(d, (W / 2 + 60, 170), "In:  hello", 40, fill=with_alpha(CREAM, a))
        if local >= at(3) + 3.0:
            text_left(d, (W / 2 + 60, 260), "Out: olleh", 40, fill=with_alpha(MUSTARD, since(local, at(3) + 3.0)))
        if local >= at(2):
            text_left(d, (W / 2 + 60, 380), "Pop, pop, pop...", 28, fill=with_alpha(CREAM, since(local, at(2))), shadow=False)

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
            y = 180 + i * 150
            panel(d, (110, y, W - 110, y + 120), a)
            text_left(d, (150, y + 22), english, 38, fill=with_alpha(CREAM, a))
            d.polygon([(560, y + 34), (600, y + 50), (560, y + 66)], fill=with_alpha(MUSTARD, a))
            text_left(d, (630, y + 22), flipped, 38, fill=with_alpha(MUSTARD, a))
            text_left(d, (150, y + 76), why, 24, fill=with_alpha(LEAF, a), shadow=False)

    elif sid == "benji":
        benji = chars["benji-pointing"]
        a = since(local, 0.1, 0.6)
        frame.alpha_composite(fade(benji, a), (W - benji.width - 50, H - benji.height - 20))
        english = "Where are you from?"
        if local >= at(1):
            b = since(local, at(1))
            panel(d, (70, 160, 700, 250), b)
            text_left(d, (100, 180), "You: " + english, 36, fill=with_alpha(CREAM, b))
            ops = [(at(1) + 1.2 + i * 0.3, "push", c) for i, c in enumerate("Where")]
            ops += [(at(1) + 3.0 + i * 0.3, "pop", None) for i in range(5)]
            s = StackAnim(385, 590, width=130, step=46, ops=ops)
            s.draw(d, local, label_size=28)
        if local >= at(2):
            c = since(local, at(2))
            panel(d, (70, 290, 700, 380), c, fill=(60, 40, 20))
            text_left(d, (100, 310), "Calonis: " + calonis(english), 36, fill=with_alpha(MUSTARD, c))

    elif sid == "zazo":
        zazo = chars["zazo-talking"]
        benji = chars["benji-talking"]
        a = since(local, 0.1, 0.6)
        frame.alpha_composite(fade(zazo, a), (40, H - zazo.height - 20))
        frame.alpha_composite(fade(benji, a), (W - benji.width - 40, H - benji.height - 20))
        english = "Hello, friend!"
        if local >= at(0) + 0.8:
            b = since(local, at(0) + 0.8)
            panel(d, (330, 150, 950, 240), b, fill=(60, 40, 20))
            text_center(d, (640, 195), "Zazo: " + calonis(english), 38, fill=with_alpha(MUSTARD, b))
        if local >= at(1) + 1.2:
            c = since(local, at(1) + 1.2)
            panel(d, (330, 265, 950, 355), c)
            text_center(d, (640, 310), "Benji: He says, “" + english + "”", 34, fill=with_alpha(CREAM, c))
        if local >= at(2):
            e = since(local, at(2))
            panel(d, (430, 395, 850, 530), e)
            text_center(d, (640, 430), "History", 32, fill=with_alpha(MUSTARD, e))
            text_center(d, (640, 485), "11 pushes, 11 pops", 30, fill=with_alpha(CREAM, e))

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
        draw_scene(scene, local, starts, frame, chars)

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
