# Tribezo

**Talk to a friendly forest tribe that speaks in reverse.**

Tribezo is a website. You type words in English. A helper turns your words around. Then a tribe in the forest talks back to you in their own language.

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

In Tribezo, you meet two characters in a forest:

1. **The Tribe Member.** They live in the forest. They are kind and friendly, but they do not know English. They only speak XYZ, which is reversed English.
2. **The Translator.** He wears modern clothes. He knows English and XYZ, and he helps you talk to the tribe.

You talk to the translator in English. He reverses your words and passes them to the tribe. The tribe replies to you.

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

1. **You open the website.**
   You see a forest with the tribe member and the translator standing in it.

2. **The translator says hello.**
   He says something like this:

   > "Meet the tribe. They are friendly, kind, and welcoming, but they don't know your language. They speak XYZ, which is English in reverse. You can talk to me in English. I will reverse your words and tell them, and they will speak back to you."

3. **You type something.**
   You type a word, a sentence, or even a whole paragraph in the box.

4. **You press send.**
   Your words go to the **backend**. The backend is written in C. It uses a stack to reverse every word.

5. **The translator passes it on.**
   The reversed words come back to the website, and the translator passes them to the tribe.

6. **The tribe talks back.**
   The tribe member is animated and speaks your words in XYZ. Their reply shows on the screen.

7. **Keep talking.**
   You can keep typing and talking to the tribe.

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
   Translator tells the tribe
        |
        v
   Tribe talks back in XYZ
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

### Backend (the part that does the work)

| Tool | What it does |
|---|---|
| **C** | The main language for the backend. |
| **Stack** | The data structure that reverses each word. |
| **HTTP server in C** | Lets the website send words to the C program and get the reversed words back. |

### Art

- **Tribe and translator characters.** Made with AI image tools, in a stop-motion style (claymation or paper cut-out).
- **Forest background.** Sets the scene in the woods.

### Later

| Tool | What it does |
|---|---|
| **Google Gemini API** (free tier) | Helps the tribe reply in a natural way. |

---

## Project Status

| Phase | What | Status |
|---|---|---|
| 1 | The C core (stack and reverse) | Done |
| 2 | The connection (HTTP server in C) | Done |
| 3 | The frontend (with placeholders) | Done |
| 4 | The art | Next |
| 5 | Natural conversation with AI | Not started |
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
      characters/           pose pictures for the tribe and the translator (Phase 4)
      scenes/               background pictures (Phase 4)
    src/
      lib/
        content.js            all the text, poses, scenes, and picture paths in one place
        api.js                talks to the C server
      hooks/
        useFrame.js           the flip-book counter for stop-motion
        useTypewriter.js      types speech out a few letters at a time
        useLenis.js           smooth scrolling
      components/
        ForestScene.jsx       the forest background with parallax
        Character.jsx         shows a character in a pose
        PlaceholderFigure.jsx the drawn characters used until the real art is ready
        SpeechBubble.jsx      a speech bubble
        ChatBox.jsx           the box where you type
        HistoryPanel.jsx      the list of everything said
      pages/
        Home.jsx              the main page
        NotFound.jsx          the page for a wrong address
    index.html
    vite.config.js        ports, the /api pass-through, and the security rules
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
- **The forest** (`ForestScene.jsx`). It is drawn with shapes: sky, far trees, beams of light, near trees, the ground, fireflies, and big leaves in the front corners. Each layer moves a different amount when the mouse moves, so the forest feels deep. The trees are placed by a "random" formula that always gives the same answer, so the forest looks the same every time.
- **The characters** (`Character.jsx` and `PlaceholderFigure.jsx`). Until the real art is ready, both characters are drawn with shapes that match the character descriptions: the translator's glasses, beard, mustard hoodie, and bag, and the tribe member's curly hair, leaf, face dots, beads, sash, and green wrap. They move like stop-motion:
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

### Phase 4: The art

1. **Make the characters in order:** first a master picture of each character, then each pose, then 2 to 3 small changes of each pose for the stop-motion frames.
2. **Clean up the pictures:** remove the backgrounds, and check that every picture is the same size and that the feet sit on the same line.
3. **Connect them** in `content.js`.
4. **Make the backgrounds:** `forest-entry` first, then the others.

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
