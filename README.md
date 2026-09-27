# Tribezo

**Talk to Zazo, the friendly leader of an island where every word comes out backwards.**

Tribezo is a website. You type words in English. Benji, the translator, turns your words around. Then Zazo talks back to you in his own language.

Their language is called **XYZ**. XYZ is English with every word reversed.

---

## How I Got This Idea

I was sitting in class, thinking about my DSA project and what to build for it.

I kept coming back to the **stack**. I knew a stack can reverse a word. On its own, though, reversing words felt too plain for a whole project.

Then I remembered that some movies have tribes who speak in reverse. Their words sound strange, but they make sense once you reverse them.

*What if I made a forest tribe that only speaks in reverse, and a stack was what lets you talk to them?*

That is how Tribezo started, right there in class.

---

## What Is This Project About?

In Tribezo, you visit a far-away island and meet two characters:

1. **Zazo.** He is the leader of the islands. He is warm, kind, and always happy to see a visitor. But he does not know English. He only speaks XYZ, which is reversed English. Right now the rest of his people are away on a 3-day trip to another island to see their families, so Zazo is looking after everything by himself.
2. **Benji.** He is the translator. He wears modern clothes, and he knows English and XYZ.

You talk to Benji in English. He reverses your words with a stack and tells Zazo. Zazo answers in XYZ, and Benji tells you what he said. Zazo can even show you around the island.

---

## Why I Am Building It

- **To learn.** This is my DSA project (DSA means Data Structures and Algorithms). I want to understand how a **stack** works.
- **To make the idea easy to see.** Reversing words is a simple idea. A forest, a tribe, and a translator make it more interesting to watch.
- **To build a full project.** I want to build both parts of a real app: the part you see (frontend) and the part that does the work (backend).

---

## What Is a Stack?

A stack works like a pile of plates.

- You put a plate **on top**. This is called a **push**.
- You take a plate **off the top**. This is called a **pop**.

The last plate you put on is the first plate you take off. This is called **LIFO**, which means **Last In, First Out**.

### How a stack reverses a word

Here is how the word `hello` gets reversed.

1. Push each letter onto the stack: `h`, then `e`, then `l`, then `l`, then `o`.
2. The stack now looks like this, with `o` on top.

   ```
   | o |  <- top
   | l |
   | l |
   | e |
   | h |
   -----
   ```

3. Pop the letters off, one at a time: `o`, `l`, `l`, `e`, `h`.
4. Put them together to get `olleh`.

---

## How XYZ Language Works

These are the rules for turning English into XYZ:

1. **The letters in each word are reversed.**
2. **The words stay in the same order.**
3. **Punctuation stays in the same place.** Commas, periods, and marks like `!` and `?` do not move.
4. **Numbers stay the same.** `123` stays `123`.
5. **Money stays the same,** so the amount means the same thing in both languages. This covers:
   - money signs: `$`, `€`, `£`, `¥`, `₹` (like `$100.50` or `₹500`)
   - money names next to a number: `100 dollars`, `Rs 500`, `USD 20`, `50 cents`
   - money names joined to a number: `Rs500`, `20usd`

   The money names are: dollar, buck, cent, rupee, Rs, paise, euro, pound, yen, USD, INR, EUR, GBP, and JPY.

### Examples

| English | XYZ |
|---|---|
| `hello` | `olleh` |
| `hello world` | `olleh dlrow` |
| `hello, world!` | `olleh, dlrow!` |
| `you are kind.` | `uoy era dnik.` |
| `how are you?` | `woh era uoy?` |
| `it costs $20.` | `ti stsoc $20.` |
| `I have 3 cats` | `I evah 3 stac` |
| `it is Rs 500` | `ti si Rs 500` |
| `only 100 dollars` | `ylno 100 dollars` |

---

## How It Works (The User Flow)

Here is what happens when you use Tribezo.

1. **Your name.** The first screen asks *"What's your name?"* The box starts empty. It asks every time you visit.

2. **The title screen.** A mountain meadow. The title shows up backwards, `ozebirT`, and then its letters slide into `Tribezo`. You press **Begin**.

3. **A short story (about 40 seconds).** One tap per step:
   1. A beach: *"Past the edge of every map lies a little island that no one has visited in a very long time. Until today."*
   2. A jungle path: Zazo walks in and waves. *"Meet Zazo, leader of the islands."* He says `olleH, relevart! emocleW!`
   3. The village: Zazo looks puzzled and says `ohW era uoy? erehW era uoy morf?` *"There's just one problem. Everything Zazo says comes out… backwards."*
   4. Benji walks in: *"Hi, I'm Benji! Zazo speaks XYZ, which is English in reverse. Talk to me in English, I'll flip your words with my stack, and he'll understand you."*

4. **The first reverse.** Your name goes to the C server. Zazo laughs and greets you backwards, like `olleH, anilegnavE! emocleW ot ym sdnalsi!` Tap, and Benji tells you what he said.

5. **Talk to Zazo.** Only one person speaks at a time. Each tap moves the talk along; nothing else on the screen changes.
   1. You type English. Benji says *"Let me tell him…"*
   2. The C server reverses your words. Benji says them to Zazo in XYZ. *(tap)*
   3. Zazo picks an answer, and the C server reverses it too. Zazo says it in XYZ, in a bubble over his head. *(tap)*
   4. Benji translates it for you in English, in a bubble over **his** head. Then you can type again.

6. **The tour.** Ask *"Where are the other people?"* and Zazo explains they went on a 3-day vacation, and offers to show you around. Say *"yes"* or *"show me around"* and the place changes: his family's hut, the Singing Falls, the lookout hill, and the campfire at night.

Phones are made to be held upright. If a phone is turned on its side, the game asks you to turn it back.

### The flow in a picture

```
   You (type English)
        |
        v
   Website (frontend)
        |
        |  sends your words
        v
   C server (backend)
        |
        |  uses a stack to reverse each word
        v
   Website (frontend)
        |
        v
   Benji tells Zazo
        |
        v
   Zazo answers in XYZ (reversed by the same stack), and Benji translates
```

---

## Tech Stack (The Tools I Use)

### Frontend (the part you see)

| Tool | What it does |
|---|---|
| **React 19** | Builds the parts of the page, like the chat box and the characters. |
| **Vite** | Runs the website on my computer while I build it, and packs it up when it is done. |
| **React Router** | Lets the website have different pages. |
| **Tailwind CSS** | Styles the page: colors, sizes, and spacing. |
| **Framer Motion** | Animates the characters. |
| **Lenis** | Smooth scrolling. |
| **Lucide React** | Icons. |
| **howler.js** | Plays the background music and fades between songs when the place changes. |

### Backend (the part that does the work)

| Tool | What it does |
|---|---|
| **C** | The main language for the backend. |
| **Stack** | The data structure that reverses each word. |
| **HTTP server in C** | Lets the website send words to the C program and get the reversed words back. |

### Art

- **Zazo and Benji.** Made with AI image tools, in a clay and felt stop-motion style. Each one has 6 poses: idle, talking, welcome, pointing, laughing, and confused.
- **8 backgrounds.** Made with AI image tools, in a voxel style (built from little blocks) with a tilt-shift look: a mountain meadow, a beach, a jungle path, the village, a family hut, a waterfall, a lookout hill, and a campfire at night.

### Later

| Tool | What it does |
|---|---|
| **Google Gemini API** (free tier) | Helps Zazo reply in a natural way. |

---

## Project Status

| Phase | What | Status |
|---|---|---|
| 1 | The C core (stack and reverse) | Done |
| 2 | The connection (HTTP server in C) | Done |
| 3 | The frontend (with placeholders) | Done |
| 4 | The art, the story, and the music system | Done |
| 5 | Natural conversation with AI | Next |
| 6 | Changing scenes and poses | Not started |

The plan for each phase is below.

---

## Build Plan

### The order I am building in

**Backend first, then the connection, then the frontend.**

1. The **stack** is the main DSA part of this project, so I build it and test it first.
2. Next comes the **connection**: a small server that lets the website talk to the C program.
3. Then the **frontend**. It only needs to know what the server sends back, so it can start with placeholder pictures until the real art is ready.

### Folder structure

```
tribezo/
  backend/              the C part
    src/
      stack.c / stack.h     the stack: push, pop, peek, is_empty
      reverse.c / reverse.h reverses each word, keeps punctuation in place
      demo.c                type English, see XYZ (for trying things by hand)
      server.c              a small HTTP server
    tests/
      test_stack.c          checks that the stack works
      test_reverse.c        checks that reversing works
      test_server.sh        starts the server and checks every answer
    Makefile              make test, make test-server, make run, make demo
  frontend/             the website
    public/
      characters/           Zazo's and Benji's poses (zazo-idle.webp, benji-talking.webp, ...)
      scenes/               the 8 backgrounds
      textures/grain.png    film grain laid over the whole scene
      music/                background music (add your own, see Phase 4)
    src/
      lib/
        content.js            all the words, the story, poses, scenes, and music in one place
        api.js                talks to the C server
        zazo.js               picks what Zazo says back
        visitor.js            checks the visitor's name
        music.js              plays music and fades between songs
      hooks/
        useTypewriter.js      types speech out a few letters at a time
        useLenis.js           smooth scrolling
      components/
        Scene.jsx             the background, plus the front flowers and grain
        NameScreen.jsx        the first screen, which asks for your name
        Hero.jsx              the title screen
        StoryCard.jsx         the story captions, dots, Next, and Skip
        Character.jsx         shows Zazo or Benji, lit to match the scene
        RotateNotice.jsx      asks phone users to hold the phone upright
        SpeechBubble.jsx      a speech bubble
        ChatBox.jsx           the liquid glass box where you type
        HistoryPanel.jsx      the list of everything said
      pages/
        Home.jsx              the main page
        NotFound.jsx          the page for a wrong address
    index.html
    vite.config.js        ports, the /api pass-through, and the security rules
  tools/
    cut_out_characters.py cuts the poses out of a character sheet with clean edges
  .gitignore            keeps built files and secrets off GitHub
  README.md
```

### Phase 1: The C core (the DSA part) — Done

1. **Build the stack.** It uses an array that grows when it gets full. `push`, `pop`, `peek`, and `is_empty` each take the same short time, no matter how big the stack is (O(1)).
2. **Build the reverse function.** For each word:
   - Push only the letters onto the stack.
   - Go through the word again. Where there was a letter, pop from the stack. Numbers and punctuation stay where they are.
   - Example: `hello, world!` becomes `olleh, dlrow!`
   - Money, like `$100.50` or `100 dollars`, is skipped and stays the same.
3. **Write tests** for:
   - empty input
   - one word
   - extra spaces between words
   - punctuation inside a word, like `don't`, which becomes `tno'd`
   - numbers
   - money signs and money names
   - a long paragraph
4. **Done when** `make test` passes.

#### What Phase 1 built

- **The stack** (`stack.c`). It keeps characters in an array. When the array is full, it doubles in size. Because it doubles, it only needs to grow once in a while, so pushing stays fast. `push`, `pop`, `peek`, and `is_empty` all take O(1) time.
- **The reverse function** (`reverse.c`). It makes one copy of the text. Spaces, numbers, and punctuation are already in the right spots in the copy, so only the letters need to change. It goes over each word twice: once to push, once to pop. One stack is reused for every word, because the stack is empty again at the end of each word.
  - **Time:** O(n). Each character is pushed at most once and popped at most once.
  - **Space:** O(n) for the new text, plus a stack as big as the longest word.
- **Money check.** Before reversing a word, the function checks if it is money. A word is money if it has a number and a money sign (`$100`) or a money name (`Rs500`). A money name with no number (`dollars`) also counts when the word just before or just after it has a number (`100 dollars`, `Rs 500`). Money is left as it is and is never pushed or popped.
- **Push and pop counts.** The function also counts how many pushes and pops it did, so the website can show them later.
- **Tests.** 2 test files check:
  - the stack: empty stack, last in first out, growing past 1,000 items
  - reversing: words, punctuation, extra spaces, new lines, tabs, numbers, money signs, money names, capital letters, a long paragraph, and that reversing twice gives back the original English
  - Tests are built with memory checkers (AddressSanitizer and UndefinedBehaviorSanitizer). These catch memory mistakes, like reading past the end of an array.
- **A demo program** (`demo.c`). Type English, see XYZ and the push and pop counts.

#### Things I noticed while building Phase 1

Because punctuation stays in place, some words look a little different than you might guess:

| English | XYZ | Why |
|---|---|---|
| `don't` | `tno'd` | The `'` stays in spot 4. |
| `well-known` | `nwon-kllew` | The `-` stays in spot 5. |
| `You` | `uoY` | Capital letters move with their letter. |
| `$100.50` | `$100.50` | Money is never reversed. |
| `123` | `123` | Numbers never move. |
| `2nd` | `2dn` | The number stays. Only the letters flip. |
| `one dollar` | `eno rallod` | No number next to `dollar`, so it is a normal word. |
| `5 pounds of rice` | `5 pounds fo ecir` | `pounds` is kept as money, even when it means weight. |

### Phase 2: The connection (backend to frontend) — Done

1. **Build a small HTTP server in C** on port `8765`. It uses plain sockets, with no extra libraries.
2. **Add two endpoints:**
   - `GET /api/health` answers `{"ok":true}` so I can check the server is on.
   - `POST /api/reverse` takes the text and answers with:
     ```json
     { "english": "hello, world!", "xyz": "olleh, dlrow!", "pushes": 10, "pops": 10 }
     ```
     `pushes` and `pops` show how much work the stack did. The website can show these numbers.
3. **Keep it safe:**
   - Text is limited to 10 KB.
   - Slow connections time out.
   - The server only listens on my own computer.
4. **Connect it:** while building, Vite passes `/api` requests to the C server. This is set up in Phase 3, when the frontend is made.
5. **Done when** a `curl` command gets back the reversed text.

#### What Phase 2 built

- **The server** (`server.c`). It uses plain sockets from C, with no extra libraries. It waits for a request, answers it, hangs up, and waits for the next one. One request at a time is plenty for one person using the website.
- **How a request is read:**
  1. Read until the blank line that ends the headers.
  2. Read the first line, like `POST /api/reverse HTTP/1.1`, to get the method and the path.
  3. Send the request to the right place: `/api/health` or `/api/reverse`. Anything else gets `404`.
  4. Read `Content-Length` to know how long the text is, then read the text.
  5. Run `reverse_words` from Phase 1 and send back JSON.
- **JSON answers.** Quotes, backslashes, new lines, and other special characters in the text are written the way JSON needs them (`\"`, `\\`, `\n`), so the answer is always proper JSON.
- **Safety checks:**

  | Check | Answer if it fails |
  |---|---|
  | Wrong path | `404 {"error":"not found"}` |
  | Wrong method, like `GET /api/reverse` | `405 {"error":"use POST"}` |
  | Text longer than 10 KB | `413 {"error":"text is longer than 10 KB"}` |
  | Text that is not UTF-8 | `400 {"error":"text must be UTF-8"}` |
  | Text sent in pieces (`Transfer-Encoding`) | `411` |
  | Headers bigger than 8 KB | `400 {"error":"headers too large"}` |
  | Client takes more than 5 seconds | the server hangs up |
  | `Host` is not this computer, or `Origin` is another website (added in Phase 3) | `403 {"error":"not allowed"}` |

  - The server only listens on `127.0.0.1`, so only my own computer can reach it.
  - If a client leaves in the middle of an answer, the server keeps running instead of crashing.
- **Tests** (`tests/test_server.sh`). The script:
  1. Starts the server on a spare port (`18765`).
  2. Sends 15 requests with `curl`: health, reversing, money and numbers, quotes and new lines, letters like `é`, empty text, wrong path, wrong method, text that is too long, bad UTF-8, requests from other websites (added in Phase 3), and one last health check to make sure the server still works after all the errors.
  3. Checks every status code and answer.
  4. Stops the server.

  The server used by the tests is built with the same memory checkers as the Phase 1 tests.

#### The API

**`GET /api/health`**

```bash
curl http://127.0.0.1:8765/api/health
```
```json
{"ok":true}
```

**`POST /api/reverse`**

Send the English as plain text in the body.

```bash
curl -X POST --data-binary 'Welcome, friend! It costs $5.' http://127.0.0.1:8765/api/reverse
```
```json
{"english":"Welcome, friend! It costs $5.","xyz":"emocleW, dneirf! tI stsoc $5.","pushes":20,"pops":20}
```

| Field | What it is |
|---|---|
| `english` | the text that was sent |
| `xyz` | the same text in XYZ |
| `pushes` | how many letters went onto the stack |
| `pops` | how many letters came off the stack |

#### Things I noticed while building Phase 2

- **A bug the tests caught.** When `Content-Length` was the last header, the server could not read its number, because the end of that line looked different from the other lines. The empty-text test found it, and it is fixed.
- **Hanging up too early.** When the text was too long, the server answered `413` and hung up right away. The client was still sending, so it sometimes never saw the answer. Now the server finishes by reading and throwing away what the client is still sending (up to 64 KB) before it hangs up.
- **Letters outside plain English stay in place.** `café` becomes `facé`, because `é` takes more than one byte to store and is not reversed. This is the same as in Phase 1.

### Phase 3: The frontend (with placeholders) — Done

1. **Set it up** with the same tools as my portfolio: Vite, React 19, Tailwind 3, Framer Motion, Lenis, Lucide React, and React Router. It runs on port `8766`.
2. **Forest scene:** the background is split into layers. The layers move a little when the mouse moves, which gives a feeling of depth (parallax).
3. **Characters:** each pose is a small set of pictures shown one after another, 8 to 12 pictures per second. This gives a stop-motion look. Simple placeholder drawings are used until the real art is ready. When the real pictures go into `public/characters/`, they replace the placeholders with no code changes.
4. **Flow:**
   1. **Intro:** the translator explains the tribe in speech bubbles. The user presses "Next", then "Start talking".
   2. **Chat:** the user types English, and the translator says "Let me tell them…". The C server reverses the words. The tribe switches to its talking pose, and the reversed words appear in its speech bubble.
   3. **History panel:** shows each English message next to its XYZ version, with the push and pop counts.
   4. **Error message:** if the C server is off, the translator says "I can't reach the tribe right now."
5. **Phones:** on small screens, the characters stack on top of each other and the chat sits at the bottom.
6. **Done when** the whole flow works in the browser.

#### What Phase 3 built

- **The website** with the same tools as my portfolio. It runs on port `8766`. Vite passes every `/api` request to the C server on port `8765`.
- **The forest** (`ForestScene.jsx`, replaced in Phase 4 by the real backgrounds). It is drawn with shapes: sky, far trees, beams of light, near trees, the ground, fireflies, and big leaves in the front corners. Each layer moves a different amount when the mouse moves, so the forest feels deep. The trees are placed by a "random" formula that always gives the same answer, so the forest looks the same every time.
- **The characters** (`Character.jsx` and `PlaceholderFigure.jsx`, replaced in Phase 4 by the real art). Until the real art is ready, both characters are drawn with shapes that match the character descriptions: the translator's glasses, beard, mustard hoodie, and bag, and the tribe member's curly hair, leaf, face dots, beads, sash, and green wrap. They move like stop-motion:
  - 10 frames per second
  - a tiny wobble on every frame
  - the mouth opens and closes while talking
  - the eyes blink now and then
  - a small hop when the pose changes
- **Poses.** The arms and head move for each pose: `idle`, `talking`, `welcome`, `pointing`, `laughing`, `confused`, `explaining`, and `listening`. When the translator explains, he points at the tribe member.
- **Real art needs no code changes.** When the real pictures are ready, their file names go into `content.js`. The website then flips through them instead of showing the drawings.
- **The flow** (`Home.jsx`):
  1. The translator explains the tribe in 4 speech bubbles, with "Next" and "Skip" buttons.
  2. On "Start talking", the tribe member waves with both arms and the chat box appears.
  3. You type English and press Enter or the send button. Shift + Enter makes a new line.
  4. The translator says "Let me tell them…" while the C server reverses your words.
  5. The tribe member speaks the XYZ, typed out a few letters at a time. Under the bubble, it shows how many pushes and pops the stack did.
  6. When the tribe member finishes, you can talk again.
- **History panel.** It lists every message in English and XYZ with the push and pop counts. It opens from the "History" button and closes with the X button, the Escape key, or a click outside it.
- **Replay button** to hear the introduction again.
- **Error message.** If the C server is off or too slow (more than 8 seconds), the translator says "I can't reach the tribe right now. Please try again in a moment."
- **Phones.** Both characters stay side by side but get smaller, and the chat box sits at the bottom.
- **Accessibility:**
  - Screen readers hear each speech bubble all at once, not letter by letter.
  - Every button has a name a screen reader can read.
  - The keyboard focus outline is easy to see.
  - People who ask their device for less motion get no wobble, no fireflies, no parallax, and text that appears all at once.

#### Security

The website is kept small and closed, so people cannot poke at parts they are not meant to see.

| What | How |
|---|---|
| The C server is hidden | The browser only talks to the website. The website passes `/api` requests to the C server. |
| Only this computer | The website (`8766`), the preview (`8767`), and the C server (`8765`) all listen on `127.0.0.1` only. |
| Other websites are blocked | The C server now checks two headers. `Host` must be `localhost` or `127.0.0.1`. `Origin`, if there is one, must be a page on this computer. Anything else gets `403 {"error":"not allowed"}`. This stops other websites from using the server through someone's browser. |
| Content Security Policy | The built website tells the browser to only run its own code, only load fonts from Google Fonts, only talk to its own address, and never load plugins. Anything else is blocked. |
| No source maps | The built website does not include the original source code. |
| No secrets in the website | There are no keys or passwords in the frontend. `.env` files are kept off GitHub. |
| Text is shown as text | Everything people type is shown as plain text, never as HTML, so no one can sneak code into the page. |
| Limits on both sides | The chat box stops at 2,000 characters. The C server still checks for 10 KB, in case someone skips the website. |
| Answers are checked | The website only uses the four fields it expects from the server, and checks each one is the right type. |
| Friendly errors | People see a friendly message, never server details. |
| No outside links | The page sends no referrer, and has no tracking or ads. |

One honest note: anything that runs in a browser can be looked at with the browser's developer tools. That is why every real check happens in the C server, not only in the website.

#### Things I noticed while building Phase 3

- **Phones:** the plan said the characters would stack on top of each other on phones. Side by side and smaller looked better and kept both characters in view, so I kept them side by side.
- **Stuck fireflies:** at first, all the fireflies sat on the left edge. The "random" formula gives tiny numbers for its first few answers, so now it skips them.
- **Old answers:** if you restart the intro while a message is on its way, the late answer is now ignored instead of popping up in the middle of the intro.
- **The translator pointed the wrong way** at first, away from the tribe. Fixed.

### Phase 4: The art, the story, and the music system — Done

1. **Make the characters in order:** first a master picture of each character, then each pose, then 2 to 3 small changes of each pose for the stop-motion frames.
2. **Clean up the pictures:** remove the backgrounds, and check that every picture is the same size and that the feet sit on the same line.
3. **Connect them** in `content.js`.
4. **Make the backgrounds:** `forest-entry` first, then the others.
5. **Tell the story:** a short onboarding story that introduces the island, Zazo, the problem, and Benji, and then asks for your name.
6. **Add music** that changes with the place.

#### What Phase 4 built

- **Characters.** Zazo stands in the bottom left corner. Benji stands in the bottom right corner.
  - A small script cut the 6 poses out of each character sheet. It removed the grey background, including the small grey gaps between an arm and the head.
  - Every pose sits on the same size canvas with the feet on the bottom edge, so a character does not jump when the pose changes.
  - Benji's pictures are flipped so he faces Zazo, and his pointing pose points at Zazo.
  - There is only one picture per pose, so the stop-motion look comes from a tiny wobble 8 times per second, a small bob while talking, and a hop when the pose changes.
- **Backgrounds.** All 8 pictures are in `public/scenes/`. When the place changes, the new picture fades in over the old one. Each picture also drifts very slowly and moves a little with the mouse. The hut picture had a small mark in its top left corner from the image tool, so it was trimmed a little.
- **Start screen** (`Hero.jsx`). The meadow picture, with the title flipping from `ozebirT` to `Tribezo`.
- **The story** (about 40 seconds). It follows the research below: show the problem first, let a guide character ask your name inside the story, and make the first reverse happen right away.

  | Step | Place | What happens |
  |---|---|---|
  | Name | Mountain meadow | *"Welcome, traveler. What's your name?"* (added in round 2) |
  | Start | Mountain meadow | The title flips from backwards to forwards. **Begin**. |
  | 1 | Beach | *"Past the edge of every map lies a little island that no one has visited in a very long time. Until today."* |
  | 2 | Jungle path | Zazo walks in and waves: `olleH, relevart! emocleW!` *"Meet Zazo, leader of the islands. He is warm, kind, and always happy to see a visitor."* |
  | 3 | Village | Zazo is puzzled: `ohW era uoy? erehW era uoy morf?` *"There's just one problem. Everything Zazo says comes out… backwards."* |
  | 4 | Village | Benji walks in and explains how he will help. *"Luckily, someone here speaks both languages."* |
  | 5 | Village | Zazo greets you by name, backwards. Tap, and Benji translates. The chat starts. |

  - One tap per step. **Next** has the keyboard focus, so Enter works too.
  - **Skip** is always there. It goes straight to Zazo's greeting.
  - Dots show how far along you are.
  - The **replay** button at the top plays the story again.
  - The Zazo lines in the story were made with the real C stack (`make demo`), so they match exactly.
- **Talking to Zazo** (`zazo.js`). For now, Zazo picks his answer from a fixed list in `content.js`. In Phase 5 an AI model will write his answers instead.

  | You say something like | Zazo says |
  |---|---|
  | "Where are the other people?" | They have gone on a 3-day vacation to another island to meet their families and relatives. I'm the only one taking care of the islands. Come, let me show you around! |
  | "Yes", "show me around", "next" | The next stop on the tour, and the place changes |
  | "I'm hungry" | Come to my hut! There is fresh fruit on the table. |
  | "Who are you?" | I am Zazo, leader of these islands. Benji is my good friend. |
  | "How are you?" | I am very happy today, because I have a visitor! |
  | "Thank you" | You are always welcome here. |
  | "Bye" | Goodbye! Come back soon. |
  | "Hi" | Hello! It is so good to see you. |
  | Anything else | One of 4 friendly answers, taking turns |

  **The tour:**

  | Stop | Place | Zazo says |
  |---|---|---|
  | 1 | Family hut | This is my family's hut. My mother wove these rugs herself. Sit down, have some fruit! |
  | 2 | Waterfall | These are the Singing Falls. We drink this water, and the children swim here on hot days. |
  | 3 | Lookout hill | From this hill you can see every island. The small one far away? That's where my people are now. |
  | 4 | Campfire at night | Night comes fast here. When everyone is home, we sing around this fire until the moon is high. |
  | 5 | Village | And we are back in the village! That's the whole island. |

  Every message uses the stack twice: once for your words, and once for Zazo's answer. The history panel shows both, with Benji's translation.
- **Liquid glass.** The chat box, the name box, the story card, and the buttons at the top right (music, replay, history) are now see-through glass: they blur the scene behind them and have a soft shine on the top edge. It is plain CSS (the `.glass` class in `index.css`), the same way as in my portfolio, so there is no extra library.
- **Music system** (`music.js`), using **howler.js**:
  - Music can only start after a tap, because browsers block sound until then. The **Begin** button is that tap.
  - Each place has a track. When you move to a place with a different track, the old one fades out while the new one fades in (1.8 seconds).
  - A music button at the top turns it on and off. The choice is remembered in this browser.
  - Tracks are listed in `content.js`. No music files are in the project yet, so the site works quietly and the music button stays hidden until tracks are added.

#### Onboarding research

| App | What works | What Tribezo uses |
|---|---|---|
| Pokémon GO | A guide character (Professor Willow) teaches you by talking, asks your name, and then lets you play right away. | Benji asks your name inside the story, and Zazo greets you with it right after. |
| Opal | Shows you the problem first, then how the app fixes it. | First the problem (Zazo speaks backwards), then the fix (Benji and his stack). |
| Duolingo | Lets you try the main thing before asking for anything. | The first reverse happens during the story. There is no sign-up. |
| Game onboarding studies | Get to the fun within about a minute. Make tutorials skippable, and keep them short. | About 40 seconds, one tap per step, and Skip is always there. |

#### Music picks

These fit the calm, sunny, handmade feel of the island. They need to be downloaded and put in `public/music/`, then listed in `content.js`.

| Track slot | Places | Mood | Suggestion |
|---|---|---|---|
| `theme` | Start screen, beach | Gentle, curious, a little magical | Soft acoustic or marimba, like Pixabay's "tropical island" results |
| `island` | Jungle, village, hut, waterfall, lookout | Happy, relaxed island daytime | "Island Meet and Greet" by Kevin MacLeod (Creative Commons Attribution 3.0, needs a credit line) |
| `night` | Campfire at night | Calm, warm, quiet | Slow acoustic guitar or soft ambient, from Pixabay |

Pixabay music can be used without a credit line. Kevin MacLeod's music can be used for free with a credit line like: *"Island Meet and Greet" Kevin MacLeod (incompetech.com), licensed under Creative Commons: By Attribution 3.0.*

#### Security in Phase 4

- **Your name is not saved anywhere.** It is only kept while the page is open (since round 2). The C server reverses the greeting and forgets it.
- **Names are checked.** 1 to 20 characters, letters from any language, spaces, dots, dashes, and apostrophes only. They are always shown as plain text.
- **Music is local only.** The security rules now allow sound files, but only from this website (`media-src 'self'`).
- **No new outside connections.** All pictures and music load from the website itself.

#### Things I noticed while building Phase 4

- **The crossfade got stuck at first.** The old song faded to a low volume but never paused. howler.js did not always send its "fade finished" signal when two fades ran at the same time. Now a timer pauses the old song once its fade time is over.
- **One picture per pose.** Real stop-motion needs 2 to 3 small changes of each pose. More frames can be added later with no code changes to the story.
- **Style.** The clay characters and the voxel backgrounds come from different styles, but the shadows and the tilt-shift blur help them sit together.
- **"3-day" becomes "3-yad"**, because numbers stay in place and only the letters flip.

#### Round 2 changes

After trying Phase 4, I asked for these changes:

| What I asked for | What changed |
|---|---|
| Benji's translation above Benji's head | Zazo's bubble shows only what Zazo says, in XYZ. Benji's translation now has its own bubble above Benji. |
| Only the dialogue changes on a tap | The talk is a list of lines shown one at a time. A tap (anywhere, or Enter, Space, or →) finishes the line being typed, or shows the next one. Nothing else moves. A **Tap to continue** button sits where the chat box is until the talk is done. |
| No shaking | The wobble, the bob, and the hop are gone. Poses now fade into each other in a quarter of a second. |
| No white lines around the characters | The poses were cut out again with a better script (`tools/cut_out_characters.py`, using Pillow and NumPy). It shrinks the edge by 2 pixels to drop the grey-white outline, fills the edge with the colors just inside it ("color bleed"), removes larger grey gaps between arms and bodies, and softens the edge. |
| Characters sized for each background | Each scene has a `scale`, like 1.08 inside the hut and 0.95 at the village and the lookout. |
| Laptop first | Characters are about two thirds of the screen height on a laptop (`--character-height` in `index.css`). Phones held upright get a smaller size. |
| Phones upright only | A phone turned on its side (a touch screen that is short and wide) sees *"Please turn your phone upright"* until it is turned back. Laptops and tablets are not affected. |
| Always ask the name first, with an empty box | The first screen asks *"What's your name?"* with no hint text in the box. The name is asked on every visit and is not saved. Then the title screen, then the story, then the game. |
| Make the characters blend with each background's light | See the table below. |

**How the characters blend in.** Everything is done with the browser's own CSS (filters, blend modes, and masks) through Tailwind, so no extra library is needed:

| Trick | What it does |
|---|---|
| Color filter per scene | Matches brightness and color. For example, darker and less colorful at night. |
| Scene light over the character | A colored light (warm gold in the hut, green in the jungle, fire orange at night) is laid over the character. The character's own picture is used as a mask, so only the character is colored. |
| Moonlight | At night, a blue shade is added too. |
| Shade on the far side | The side away from the light is a little darker. |
| Rim light | A thin line of light on the edge that faces the sun. At the campfire, both characters are lit from the fire between them. |
| Ground shadow | A soft shadow under the feet, darker in shady scenes. |
| Front flowers | The blurry flowers at the bottom of each background are drawn again in front of the feet, so the characters stand in the scene instead of on top of it. |
| Film grain | A fine grain over the whole picture, characters included, so the clay and the voxel worlds share one texture. |
| Soft edges | A gentle dark vignette around the screen, like a camera lens. |

Each scene's settings live in `content.js`, under `scenes`, so they are easy to adjust.

### Phase 5: Natural conversation with AI (later)

1. **Flow:**
   1. The user types English.
   2. An AI model writes the tribe's reply in **normal English**, as JSON with three parts: `reply`, `scene`, and `pose`.
   3. The **C stack** reverses the reply. The AI never does the reversing, so the stack stays the most important part.
   4. The tribe says the reversed reply.
2. **AI service:** the free tier of Google Gemini.
3. **API key:** kept only on the backend, in a `.env` file. It is never put in the website code and never uploaded to GitHub.
4. **Guardrails:** rules in the prompt keep the tribe friendly, on topic, and short. `scene` and `pose` can only be values from a fixed list. Anything else falls back to the `idle` pose.
5. **Still to decide:** whether the C server calls the AI (using `libcurl`) or a small Node helper does it.

### Phase 6: Changing scenes and poses

1. **Scenes:** when the tribe invites you somewhere, like their village, `scene` changes the background.
2. **Poses:** `pose` changes how the character stands, for example arms open to welcome you.
3. **Changes between scenes and poses:** a quick stop-motion cut or a soft fade.

### After each phase

- The work is saved and pushed to GitHub.
- This README is updated with how to run the new parts.

---

## I Will Keep Iterating

This project will grow step by step. As I build it, I will:

- Try things out.
- See what works and what does not.
- Fix things and make them better.
- Add new ideas as I think of them.

This README will change along with the project.

### Ideas I might add later

- Sounds for the forest and for the tribe talking.
- More tribe members.
- Typing in XYZ and getting English back.
- A mode that shows the stack pushing and popping, letter by letter.

---

## How to Run It

You need a C compiler (`cc`, `gcc`, or `clang`) and `make`. On a Mac, running `xcode-select --install` gets both.

### Run the tests

```bash
cd backend
make test
```

You should see `all passed` twice.

To test the server too:

```bash
cd backend
make test-server
```

### Start the server

```bash
cd backend
make run
```

You should see `Tribezo server is listening on http://127.0.0.1:8765`. Press `Ctrl+C` to stop it.

To use a different port:

```bash
PORT=9000 make run
```

In a second terminal, try it:

```bash
curl -X POST --data-binary 'hello, world!' http://127.0.0.1:8765/api/reverse
```

### Try it yourself

```bash
cd backend
make demo
```

Type some English and press Enter. Press `Ctrl+D` to stop.

```
> hello, world!
XYZ: olleh, dlrow!
(stack: 10 pushes, 10 pops)
```

### Start the website

You need [Node.js](https://nodejs.org) 20 or newer.

1. Start the C server in one terminal:

   ```bash
   cd backend
   make run
   ```

2. Start the website in a second terminal:

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. Open http://127.0.0.1:8766 in your browser.

### Try the built website

This is the version with all the security rules turned on. Keep the C server running, then:

```bash
cd frontend
npm run build
npm run preview
```

Open http://127.0.0.1:8767.

More steps will be added here as each phase is finished.
