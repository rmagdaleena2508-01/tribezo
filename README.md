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
| 2 | The connection (HTTP server in C) | Next |
| 3 | The frontend (with placeholders) | Not started |
| 4 | The art | Not started |
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
      server.c              a small HTTP server (Phase 2)
    tests/
      test_stack.c          checks that the stack works
      test_reverse.c        checks that reversing works
    Makefile              make test, make demo, make run
  frontend/             the website
    public/
      characters/           pose pictures for the tribe and the translator
      scenes/               background pictures
    src/
      lib/content.js        all the text, poses, scenes, and picture paths in one place
      components/           ForestScene, Character, SpeechBubble, ChatBox
      pages/Home.jsx        the main page
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

### Phase 2: The connection (backend to frontend)

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
4. **Connect it:** while building, Vite passes `/api` requests to the C server.
5. **Done when** a `curl` command gets back the reversed text.

### Phase 3: The frontend (with placeholders)

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

More steps will be added here as each phase is finished.
