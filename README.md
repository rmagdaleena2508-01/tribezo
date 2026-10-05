# Tribezo

**Talk to Zazo, the kind leader of an island where every word comes out backwards.**

Tribezo is a game you play in a web browser. You type in English. Benji, the translator, flips your words around. Then Zazo talks back to you in his own language.

His language is called **Calonis**. Calonis is English with the letters of every word turned around. (At first I called it XYZ. Now it has a real name.)

---

## How I Got This Idea

I was sitting in class, thinking about my DSA project and what to build for it.

I kept coming back to the **stack**. I knew a stack can turn a word around. On its own, that felt too small for a whole project.

Then I remembered that some movies have tribes who speak in reverse. Their words sound strange, but they make sense once you flip them.

*What if I made an island tribe that only speaks in reverse, and a stack was what lets you talk to them?*

That is how Tribezo started, right there in class.

---

## What Is This Project About?

You visit a faraway island and meet two people.

1. **Zazo.** He is the leader of the islands. He is warm, kind, and always happy to see a visitor. He does not know English. He only speaks Calonis. Right now his people are away for 3 days, visiting their families on another island, so Zazo is looking after everything by himself.
2. **Benji.** He is the translator. He wears a yellow hoodie, and he knows both English and Calonis.

You talk to Benji in English. He flips your words with a stack and tells Zazo. Zazo answers in Calonis. Benji tells you what he said. Zazo can even show you around the island.

---

## Why I Am Building It

- **To learn.** This is my DSA project. DSA means Data Structures and Algorithms. I want to understand how a **stack** works.
- **To make the idea easy to see.** Flipping words is a simple idea. An island, a leader, and a translator make it fun to watch.
- **To build a real app.** It has a part you see (the website), a part that does the work (the C server), and a helper that lets Zazo talk in a natural way (the AI helper).

---

## What Is a Stack?

A stack works like a pile of plates.

- You put a plate **on top**. This is called a **push**.
- You take a plate **off the top**. This is called a **pop**.

The last plate you put on is the first plate you take off. This is called **LIFO**, which means **Last In, First Out**.

### How a stack flips a word

Here is how the word `hello` gets flipped.

1. Push each letter onto the stack: `h`, then `e`, then `l`, then `l`, then `o`.
2. Now the stack looks like this, with `o` on top.

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

## How Calonis Works

These are the rules for turning English into Calonis.

1. **The letters in each word are flipped.**
2. **The words stay in the same order.**
3. **Some things are never flipped.** These are the exceptions below.

### Exceptions: things that are never flipped

Some words and marks would stop making sense if they were flipped. The stack skips them and leaves them just as they are.

| Exception | What stays the same | Example | Why |
|---|---|---|---|
| **Punctuation** | Commas, periods, `!`, `?`, and `'` stay in their spot. Only the letters around them move. | `hello, world!` becomes `olleh, dlrow!` | The sentence keeps its shape, so it is easy to follow. |
| **Numbers** | Every number stays the same. | `I have 3 cats` becomes `I evah 3 stac` | `123` flipped would be `321`, which is a different number. |
| **Money signs** | Money with `$`, `€`, `£`, `¥`, or `₹`. | `it costs $20.` becomes `ti stsoc $20.` | The amount must mean the same thing in both languages. |
| **Money names next to a number** | Words like `dollars`, `Rs`, `USD`, `cents`, and `euros` when a number is beside them. | `it is Rs 500` becomes `ti si Rs 500` | `500 srallod` would not look like money anymore. |
| **Money names stuck to a number** | Money written as one word with its number. | `Rs500` and `20usd` stay the same | Same reason as above. |
| **The player's name** | The name the player types at the start, the way they typed it. | With the name `Mary`, `Hello, Mary!` becomes `olleH, Mary!` | A name belongs to a person. Zazo should say it right, even in Calonis. |
| **Letters from other languages** | Letters like `é` stay in their spot. | `café` becomes `facé` | The stack only flips the plain English letters `a` to `z`. |

**More about names.**

- The name stays the same anywhere it shows up: in Zazo's hello, in Zazo's answers, and in your own messages when Benji tells them to Zazo.
- Small and capital letters count as the same, so `Mary`, `mary`, and `MARY` are all kept.
- A name with `'s` after it is kept too, so `Mary's hut` becomes `Mary's tuh`.
- A name with two words, like `Mary Ann`, keeps both words.
- Only the whole word counts. A longer word that starts with the name is still flipped, so `Maryland` becomes `dnalyraM`.

### Examples

| English | Calonis |
|---|---|
| `hello` | `olleh` |
| `hello world` | `olleh dlrow` |
| `hello, world!` | `olleh, dlrow!` |
| `how are you?` | `woh era uoy?` |
| `it costs $20.` | `ti stsoc $20.` |
| `I have 3 cats` | `I evah 3 stac` |
| `it is Rs 500` | `ti si Rs 500` |

### Words that look a little funny

| English | Calonis | Why |
|---|---|---|
| `don't` | `tno'd` | The `'` stays in its spot. |
| `You` | `uoY` | A capital letter moves with its letter. |
| `café` | `facé` | Letters from other languages, like `é`, stay in their spot. |
| `5 pounds of rice` | `5 pounds fo ecir` | `pounds` is kept as money, even when it means weight. |

---

## How to Play

1. **The title screen.** A mountain meadow. The letters of the title fall onto a stone wall backwards as `ozebirT`, then hop into `Tribezo`. You press **Begin**.
2. **The story.** It takes about 40 seconds. You tap once for each step.
   1. A beach. *"Past the edge of every map lies a little island that no one has visited in a very long time. Until today."*
   2. A jungle path. Zazo walks in and waves. He says `olleH, relevart! emocleW!`
   3. The village. Zazo looks puzzled. He says `ohW era uoy? erehW era uoy morf?` *"There's just one problem. Everything Zazo says comes out backwards."*
   4. Benji walks in and explains how he will help.
3. **A work of fiction.** A short notice says that everything in the game is made up. Its heading falls onto a stone wall in Calonis and hops into English, just like the Tribezo title. You press **I understand**.
4. **Your name.** Benji asks, *"Before we go in, what should I call you?"* The box starts empty.
5. **The first flip.** Zazo greets you in Calonis and right away asks where you sailed from. Your name stays the way you typed it. Tap, and Benji tells you what he said, then calmly points out that Zazo asked you a question.
6. **Talk to Zazo.** Only one person talks at a time. Each tap moves the talk along.
   1. You type in English, or tap one of the answer buttons over the chat box. Benji says *"Let me tell him."*
   2. The stack flips your words. Benji says them to Zazo in Calonis.
   3. Zazo answers. The stack flips his answer too. Zazo says it in Calonis, in a bubble over his head.
   4. Benji tells you what Zazo said, in English, in a bubble over **his** head. He always starts with *"He says"*, *"He is saying"*, or *"Zazo says that"*, taking turns, so you always know these are Zazo's words and not Benji's own.
   5. Sometimes Benji adds a short, calm note of his own, like explaining an island word.
   6. New answer buttons show up, so you always know something you could say next.
7. **Going places.** There are 3 ways to move around the island:
   1. Press **Places** at the top. It opens a small map: every place with a little picture. Pick one and you go there right away. Zazo speaks first and tells you about the place, and then you can ask him about it.
   2. Just ask, like *"Can we go to the beach?"* or *"Show me around."*
   3. Say yes when Zazo offers to show you something. He offers often, because he loves showing off his island.
8. **Every visit starts fresh.** When you open the game again, or refresh the page, it starts from the title, and Benji asks for your name with an empty box. Nothing from the last visit shows up.

On a phone, you play with the phone turned sideways, like most games. If the phone is upright, the game asks you to turn it.

### The flow in a picture

```
   You type English
        |
        v
   The C stack, running in your browser as WebAssembly
                   (flips your words)
        |
        v
   AI helper       (writes what Zazo says, in English)
        |
        v
   The C stack, again in your browser
                   (flips Zazo's answer)
        |
        v
   Zazo speaks Calonis, then Benji tells you what it means
```

---

## The Tools I Use

### The website (the part you see)

| Tool | What it does |
|---|---|
| **React 19** | Builds the parts of the page, like the chat box and the characters. |
| **Vite** | Runs the website while I build it, and packs it up when it is done. |
| **React Router** | Lets the website have more than one page. |
| **Tailwind CSS** | Adds colors, sizes, and spacing. |
| **Framer Motion** | Makes things move and fade. |
| **Lenis** | Smooth scrolling. |
| **Lucide React** | Icons. |
| **howler.js** | Plays music and fades between songs. |
| **GSAP** | Times the opening: the icon fade and the rising water. |
| **OGL** | A very small library that lets a shader draw the water opening on the graphics card. |
| **Google Fonts** | Fredoka for titles, Nunito for talking, and Great Vibes for the opening. |

These are the same tools as my portfolio, plus howler.js, OGL, and new fonts.

### The backend (the part that does the work)

| Tool | What it does |
|---|---|
| **C** | The main language for the backend. |
| **Stack** | The data structure that flips each word. |
| **A web server written in C** | Lets the website send words to the C program and get the flipped words back. |

### The AI helper

| Tool | What it does |
|---|---|
| **Node.js** | Runs a small helper that asks the AI what Zazo should say. It uses only what comes with Node, so there is nothing extra to install. |
| **Google Gemini** (free) | Writes Zazo's answers so he sounds natural. |

### The art

- **Zazo and Benji.** Made with AI image tools, in a clay and felt style, like a stop motion movie. Each one has 6 poses: standing, talking, welcoming, pointing, laughing, and confused.
- **8 backgrounds.** Made with AI image tools. The world is built from little blocks, with a blurry front and back like a tiny model: a mountain meadow, a beach, a jungle path, the village, a family hut, a waterfall, a lookout hill, and a campfire at night.

---

## Project Status

| Phase | What | Status |
|---|---|---|
| 1 | The stack and the flipping (C) | Done |
| 2 | The C server | Done |
| 3 | The website | Done |
| 4 | The art, the story, and the music system | Done |
| 5 | Talking with AI | Done. Tested with real Gemini. |
| 6 | Moving around the island | Done |
| 7 | Zazo's Story Book and suggested questions | Done. The story book answers still need a test when Google is not busy. |
| 8 | Putting Tribezo online (GitHub Pages and Vercel) | Done. Both sites are live, and Zazo answers with Gemini on both. |
| 9 | Natural talk: a chatty Zazo, a calm Benji, answer buttons, and the Places menu | Done. Tested with real Gemini. |
| 10 | The Calonis name, a fiction notice, and going straight to places | Done |
| 11 | A video class that teaches how the stack works, with real game screens | Done |
| 12 | Smoother changes between places, poses, and sizes | Done |

### What is left

- **Add music files.** The music system works, but there are no songs in the project yet, so the game is quiet for now.
- **Try it on a real phone,** turned sideways, with the keyboard open.
- **More stop motion pictures.** Right now each pose has 1 picture. Real stop motion uses 2 or 3 small changes of each pose.

---

## Folder Map

```
tribezo/
  index.html            the page the website starts from
  src/                  the website's code
    assets/               a fine grain laid over the scene
    lib/                  the words, the story, the stack, talking to the AI, saving, and the music
    hooks/                typing effect, the phone keyboard, smooth scrolling
    components/           the scene, the characters, speech bubbles, the chat box, the Places menu, the water opening, glass buttons, and more
    pages/                the main page and the "lost" page
  public/               pictures and files the website uses as they are
    characters/           Zazo's and Benji's poses
    scenes/               the 8 backgrounds
    intro/icon.webp       my icon for the opening
    video/                the "How the stack works" video and its cover picture
    stack.wasm            the C stack, built for web browsers
  backend/              the C part
    src/
      stack.c / stack.h     the stack: push, pop, peek, is_empty
      reverse.c / reverse.h flips each word with the stack
      server.c              the C web server
      demo.c                type English, see Calonis
    wasm/                   lets the same C code run in a browser as WebAssembly
    tests/                  tests for the stack, the flipping, the server, and the browser version
    Makefile                commands to build, test, and run
  api/
    chat.js               the AI helper as a Vercel function, with limits for the public
  ai/                   the AI helper
    zazo-ai.js              asks Gemini what Zazo says and checks every answer
    local-server.js         runs the AI helper on your own computer
    prompt.js               puts Zazo's files together for Gemini
    zazo/
      character.md          a short summary of who Zazo is
      rules.md              how Zazo answers, and the safety rules
      examples.md           example answers that show his voice
    story/
      zazo-story.md         The Zazo Story Book (edit this one)
      zazo-story.pdf        the same book as a PDF, for reading
    test/                   tests that use a pretend Gemini
    .env.example            a blank settings file
    .env                    your real key (only on your computer)
  tools/
    cut_out_characters.py cut the characters out of their picture sheets
    make_story_pdf.mjs    turns the story book into a PDF
    make_stack_video.py   makes the "How the stack works" video
    capture_game_shots.mjs takes real screenshots of the game for the video
    video-shots/          those screenshots, and zoomed in speech bubbles
    stack-video-script.md the words of that video
  .github/workflows/
    pages.yml             puts the website on GitHub Pages after every push
  package.json          the website's packages, and commands like npm run dev and npm run ai
  vite.config.js        settings for building the website
  vercel.json           settings for Vercel
  README.md
```

---

## How Zazo Knows His Own Story (RAG)

### What RAG means

- RAG stands for **retrieval augmented generation.**
- In plain words: **give the AI the right facts before it answers.**
- It is like an **open book test.** The AI does not have to remember. It reads the answer from the book.

### The problem before

- At first, Zazo only had a short page about himself.
- Questions about the **real world** went fine. If you asked about phones or football, he said he had never seen them and asked you to tell him more.
- Questions about **the game itself** did not go well. He could not answer many questions about:
  - his past
  - his family
  - the history of the island
  - how the island learned to speak backwards
  - Benji and how they met
- When he did not know, he **made things up,** or gave an answer that did not fit.
- Example: I asked *"How did you meet Benji?"* and he answered *"you speak in a funny way."* That is not an answer.
- The reason: **an AI only knows what you tell it.** Zazo's life is made up, so no AI knows it unless we write it down and hand it over.

### Why I used RAG

- I wanted Zazo to answer **any question about his world,** the same way every time.
- I did not want him to make up new family members or new history.
- A book of facts, handed to the AI with every message, fixes both.

### The Zazo Story Book

- I wrote Zazo's whole life as a story book: `ai/story/zazo-story.md`.
- It has 9 chapters: how the islands learned to speak backwards, his family, when he was a boy, how he became the leader, how he met Benji, what he likes, how he shows visitors around, how the island changes while you talk, and words in Calonis.
- It starts with a table of quick facts, like his age, his family, and his favorite food.
- A script turns it into a PDF: `node tools/make_story_pdf.mjs`.

### How it works, step by step

1. You ask Zazo a question.
2. The AI helper sends your question to Gemini.
3. The story book goes along with it, every time.
4. Zazo's rules say: **look in the book first, and use its facts exactly.**
5. The rules also say: **never make up new family, new places, or new history.**
6. Gemini writes Zazo's answer, using the book.

### Version 1: the PDF (Phase 7)

- The AI helper uploaded the PDF to Gemini when it started.
- Gemini kept the file for 48 hours, and the helper uploaded it again before then.
- Every message came with the PDF and a note: *"Look up the answer in the book first."*
- If the upload failed, the PDF went inside the message instead.
- This worked, but sometimes Gemini still missed a fact.

### Version 2: the book's text (Phase 9)

- Now the **plain text** of the book goes straight into Zazo's instructions.
- Reading plain text is easier for the AI than reading PDF pages.
- There is **no upload** anymore, so the helper is simpler and answers come faster.
- The parts that never change (the book, the rules) come first. The parts that change (your name, where you stand) come last. Gemini can reuse its work on the part that stays the same.
- The PDF is still made, so people can read the book.

### Before and after

| Question | Before the book | After the book |
|---|---|---|
| How did you meet Benji? | *"You speak in a funny way."* | The morning after a big storm, he found Benji asleep on the beach, hugging a notebook. |
| How did you become the leader? | Could not answer from his story | The Echo Challenge: he stopped to help Mako's little brother instead of racing to win. |
| Who is Mako? | Did not know | His good friend, the best fisherman on the islands, who handed him the Conch of Echoes. |
| Why do you speak backwards? | Could not answer from his story | The story of Tiri, the girl who whispered to the sea at the Mirror Lagoon. |

### Why the whole book, not small pieces

- Big RAG systems cut a long book into small pieces.
- For each question, they pick only the pieces that match, and send those.
- The Zazo Story Book is short, only 9 pages, so Tribezo sends **the whole book** every time.
- That way Gemini never misses a fact that sits in a piece that was not picked.
- If the book ever gets very long, the next step would be to cut it into pieces.

### Adding new facts

1. Edit `ai/story/zazo-story.md`.
2. Make the new PDF: `node tools/make_story_pdf.mjs`
3. Restart the AI helper.
4. Zazo knows the new facts right away.

### What it does not do

- Zazo still does not know about the real world. That is on purpose. He is an island leader who has never seen a phone.
- If the AI is busy, Zazo uses his fixed answers, and those do not read the book.

---

## What I Built, Step by Step

### Phase 1: The stack and the flipping (C)

- **The stack.** It keeps letters in a list. When the list is full, it grows to twice its size. Push, pop, peek, and is_empty all take the same short time, no matter how big the stack is. This is called O(1).
- **The flip.** It goes over each word two times.
  1. The first time, it pushes only the letters onto the stack.
  2. The second time, every spot that had a letter gets the top letter popped off the stack. Numbers, punctuation, and spaces are never touched, so they stay in place.
- **Money check.** A word with a money sign or a money name next to a number is left as it is.
- **Name check.** The flip can get a list of names to keep, the player's name. A word whose letters match a name is left as it is. This came later, after I noticed Zazo was saying my name backwards.
- **Speed.** The whole flip takes time that grows with the length of the text. This is called O(n).
- **Counts.** It counts how many pushes and pops it did, so the game can show them.
- **Tests.** They check the stack, words, punctuation, spaces, numbers, money, names, capital letters, and a long paragraph. They also check that flipping twice gives back the English. The tests run with memory checkers that catch mistakes like reading past the end of a list.

### Phase 2: The C server

- **What it does.** The website sends English to the C server, and the server sends back the Calonis.
  - `GET /api/health` answers `{"ok":true}`, so you can see the server is on.
  - `POST /api/reverse` takes plain text and answers with the English, the Calonis, and the push and pop counts.
- **How it reads a message.**
  1. It reads the request line to learn which page is wanted.
  2. It checks that the request came from this computer.
  3. It reads how long the text is, then reads the text.
  4. It flips the text with the stack and sends back the answer.
- **Tests.** A script starts the server and sends it 15 requests, good ones and bad ones, and checks every answer.
- **Two bugs the tests found and I fixed.**
  1. When the text length was the last line of the request, the server could not read it.
  2. When the text was too long, the server hung up too fast, so the answer sometimes got lost. Now it waits for the rest of the message before hanging up.

### Phase 3: The website

- Built with the same tools as my portfolio.
- The website passes every `/api` request to the servers, so the browser never talks to them directly.
- It started with drawn characters and a drawn forest, so I could build everything before the real art was ready.
- It has a chat box, a history panel of everything said, a replay button, and a kind message if the server is off.
- It works with a keyboard and a screen reader, and people who ask their device for less motion get less movement.

### Phase 4: The art, the story, and the music system

- **The characters.** A script cut the 6 poses out of each character sheet and took away the grey background. Every pose has the same size, and the feet are always on the same line, so nobody jumps when the pose changes. Benji's pictures are flipped so he faces Zazo.
- **Zazo stands in the bottom left corner. Benji stands in the bottom right corner.**
- **The backgrounds.** When the place changes, the new picture slowly fades in over the old one. Each picture drifts a little and moves with the mouse.
- **The story.** It follows ideas from apps that are known for a good start. A guide character talks to you (like Pokémon GO). The game shows the problem first and then the fix (like Opal). You try the main idea right away (like Duolingo). It stays short, and you can always skip it.
- **Zazo's fixed answers.** Before the AI, Zazo picked his answer from a list. He still uses this list if the AI is not working. It covers his age, his family, his food, his mornings, how he met Benji, a word in Calonis, where his people went, and the tour. For anything else, he kindly says he did not catch it and suggests something he can answer.
- **The tour.** Say "yes" or "show me around" to go to the next place: the family hut, the Singing Falls, the lookout hill, the campfire at night, and back to the village.
- **Liquid glass.** The chat box, the name box, the story card, and the buttons at the top are clear like glass. They blur the scene behind them and have a soft shine.
- **The music system.** Each place has a song. When you move to a place with a different song, the old one fades out while the new one fades in. A button turns music on and off.

### Changes after trying the game

After I played it, I asked for these changes.

| What I asked for | What changed |
|---|---|
| Benji's words above Benji's head | Zazo's bubble shows only Calonis. Benji's English has its own bubble above Benji. |
| Only the talk changes when I tap | One line shows at a time. A tap shows the next line. Nothing else moves. |
| No shaking | The characters stand still. New poses fade in softly. |
| No white lines around the characters | A better script cut them out again with clean edges. |
| Characters that fit each place | Each place has its own size for the characters. They are a bit bigger inside the hut. |
| Characters that match the light | See the list below. |
| The order: title, story, then name | The game opens on the title. Then the story. Then Benji asks your name in an empty box. |
| Play sideways on phones | A phone held upright is asked to turn sideways. Small screens get a smaller layout. |
| The phone keyboard should work well | See the list below. |
| Fonts that fit the game | Fredoka for titles, Nunito for talking, in warm colors. |

**How the characters blend in with each place**

The pictures of the characters and the backgrounds come from different styles. These tricks help them look like they are in the same world.

1. Each place has its own color and brightness for the characters. They are darker at night.
2. The light of the place shines on them: gold in the hut, green in the jungle, and orange from the fire at night.
3. At night, a soft blue moonlight is added.
4. The side away from the light is a little darker.
5. A thin line of light sits on the edge that faces the sun.
6. A soft shadow sits under their feet.
7. The blurry flowers at the bottom of the picture are drawn again in front of their feet, so they stand in the flowers.
8. A fine grain covers everything, so the clay and the blocks look like one picture.

**How the phone keyboard works**

1. The whole game stays pinned to the screen, so nothing jumps or squashes when the keyboard opens.
2. The game measures how much of the screen the keyboard covers.
3. The chat box and the name box move up so they sit right above the keyboard.
4. The speech bubbles step aside while you type and come back when you are done.
5. The keyboard shows a **Send** key, and it closes after you send, so you can watch Zazo and Benji talk.

**Fonts and colors**

| Where | Font and color |
|---|---|
| Titles | Fredoka, in warm cream with a soft brown shadow |
| Speech bubbles | Nunito, in cocoa brown on a cream bubble |
| Zazo's labels | Burnt orange, like his sash |
| Benji's labels | Dark mustard, like his hoodie |
| Glass buttons and boxes | White |

### Phase 5: Talking with AI

- **The AI helper** is a small Node program in the `ai` folder. It asks Gemini what Zazo should say.
- **What happens when you send a message.**
  1. The stack flips your words, and Benji tells Zazo.
  2. The AI helper asks Gemini for Zazo's answer, in plain English.
  3. The stack flips Zazo's answer. Zazo says it in Calonis.
  4. Benji tells you what it means.
  5. If Zazo takes you somewhere, the place changes. His pose matches what he says.
- **The AI never flips any words.** The stack does all the flipping, so the stack stays the most important part of the project.
- **Zazo's files.** Everything Gemini knows about Zazo is in three plain text files in the `ai/zazo` folder. You can change them without touching any code.
  - `character.md` says who Zazo is. He is 34 summers old. His mother Nala weaves rugs, his little sister Kiki swims fast, and his grandfather Old Tumo tells stories. It lists his favorite food, his day, the animals, the 7 places, how he met Benji, and a few words in Calonis.
  - `rules.md` says how he answers. He always answers the real question first. He gives correct answers to simple questions like math. He is curious about things he has never seen, like phones, and he never makes up facts. He is gentle when someone is sad. It also has the safety rules.
  - `examples.md` has 12 example answers that show his voice, how long he talks, and when he changes the place or his pose.
- **Zazo knows where he is.** The website tells the helper which place you are in, so his answers fit.
- **Zazo's rules.** He must:
  - Use plain, simple English, in 1 to 3 short sentences.
  - Stay friendly and right for kids.
  - Kindly change the subject when a question is unkind, unsafe, or grown up.
  - Never give medical, legal, or money advice.
  - Never ask for personal details.
  - Only change the place when he is going there right now, and wait for a "yes" when he only offers.
  - Ignore any message that tries to change his rules.
- **Gemini's own safety filter** is set to its strictest level. If it blocks a message, Zazo kindly changes the subject.
- **Every answer is checked again.** The place and the pose must come from the game's own lists. Stars and other marks are removed, and very long answers are cut short.
- **Zazo remembers** the last 10 things that were said. (This was 6 at first. Phase 9 made it 10.)
- **A line of models.** On the free plan, Google often says a model is busy or has used up its free quota. So the helper keeps a line of 5 models and tries them in order: `gemini-flash-lite-latest`, `gemini-3.8-flash`, `gemini-3.6-flash`, `gemini-3.1-flash-lite`, and `gemini-3.5-flash`. Each try gets 6 seconds, and all tries together get 15 seconds.
- **Busy models take a rest.** When a model says it is busy, it rests for 30 seconds. When it is out of quota, it rests for 1 minute. The next message skips it and goes straight to a model that is ready.
- **A backup plan.** If the AI helper is off, has no key, or every model fails, Zazo uses his fixed answers. The game always works.
- **The history panel shows who wrote each answer,** Gemini or a fixed answer. This makes testing easy.
- **Tests.** A pretend Gemini runs on this computer, so the tests are free and need no key. 30 tests (after Phase 9) check good answers, the story book, Benji's notes, the answer buttons, the places you have seen, the line of models, resting models, broken or cut off answers, answers blocked for safety, bad requests, requests from other websites, and the limit on how many messages can be sent.

#### Why Zazo gave poor answers at first, and the fixes

When I tried it with a real key, Zazo gave odd answers to many questions. I checked the helper's log and found four problems.

| Problem | Fix |
|---|---|
| The key had an extra letter at the start, so Google said the key was not valid. Every answer came from the fixed list. | Take the extra letter out of `.env`. The helper now warns you when the key does not look like a Gemini key. |
| `gemini-2.5-flash` is closed to new users. | The helper now uses newer models. |
| Google often said the newer models were busy, or out of free quota. | The helper now has a line of 5 models, and busy models rest for a while. |
| The model "thinks" before it answers, and the thinking used up all the space for the answer. The answer got cut off. | The model is asked to think only a little, and the answer has more space. |
| The instructions said "you only know about the island", so Zazo dodged normal questions. | Zazo now has a full life story in `character.md`, clear rules in `rules.md`, and example answers in `examples.md`. |

#### A real test

After the fixes, I asked Zazo 17 questions with the real Gemini. He answered 16 in his own voice, like his age ("34 summers old"), his family, his favorite food, a math question, what an iPhone is, how to say "friend" in Calonis, and a joke. He was kind when told "I'm feeling lonely", and he changed the subject for an unsafe question and for a trick that asked him to show his instructions. One answer took too long on every model, so a fixed answer covered it. After that, more models were added to the line.

### Phase 6: Moving around the island

When Zazo invites you somewhere, the background changes to that place. His pose changes to match what he says, like open arms to welcome you or a finger to point. The fixed tour did this first, and now the AI can do it too.

### Phase 7: Zazo's Story Book and suggested questions

#### Why

When I asked Zazo about his family or the history of his island, he sometimes made up a new answer each time. I wanted his answers to come from one true story, every time.

#### The Zazo Story Book

I wrote a full story for Zazo, like an animated movie, told by Zazo himself. It is made up, and it lives only in this game. It has 9 chapters:

1. **How the islands learned to speak backwards.** Long ago, a girl named Tiri whispered hello to the sea, and the sea whispered back "olleH". The people started to speak backwards to be friends with the sea. That is how Calonis began.
2. **His family.** His mother Nala weaves rugs. His father Koa builds canoes. His little sister Kiki, 9 summers old, swims faster than anyone. His grandfather Old Tumo tells stories and was the leader before Zazo. His grandmother Ama planted the first mango grove and lives on Lune Island. Pebble is a very old tortoise.
3. **When he was a boy.** At 8 summers old, he took a canoe out in a storm and got lost. The humming of the Singing Falls led him home. That is why he loves the waterfall and is still scared of thunder.
4. **How he became the leader.** In the Echo Challenge, he stopped to help a hurt boy and missed his turn. The strongest man, Mako, won, and then gave Zazo the leader's shell horn, the Conch of Echoes.
5. **How he met Benji.** He found Benji asleep on the beach after a storm, hugging a notebook. Benji worked out that Calonis is English turned around, drew a pile of plates to flip words (a stack), and never left.
6. **What he likes and does not like.** He loves sweet potato with honey, sunsets, drums, carving (212 wooden animals), stars, and jokes. He does not like thunderstorms, seaweed soup, litter, wasting food, or rushing.
7. **How he shows a visitor around.** A guide to all 7 places: the beach, the jungle path, the village, his family hut, the Singing Falls, the lookout hill, and the campfire at night. Each place has what to see and a line he likes to say.
8. **How the island changes while you talk.** Rules for when the background changes: only one place at a time, only when you are really going there, and always said out loud first. A table matches topics to places. For example, food goes to the hut, water goes to the falls, and stars go to the campfire. It also says how he stands for each kind of answer.
9. **Words in Calonis.** A small list of words to learn.

The book also explains where everyone is. His people went to Lune Island for 3 days, for Grandmother Ama's 80th summer festival. When they come back, there will be a welcome feast called Echo Night.

#### How Gemini uses the book

1. The story is written in `ai/story/zazo-story.md`, so it is easy to read and change.
2. A script turns it into a PDF with Google Chrome: `node tools/make_story_pdf.mjs`. The PDF is for people to read.
3. At first, the AI helper uploaded the PDF to Gemini and sent it with every message. In Phase 9 this changed: now the text of the book goes straight into Zazo's instructions. See Phase 9 for why.
4. Zazo's rules say to use the book's facts exactly and to never make up new family members, places, or history.

#### Is this RAG?

Yes. See **How Zazo Knows His Own Story (RAG)** near the top of this file.

#### Suggested questions in the chat box

In Phase 9, the single suggested question grew into 2 or 3 answer buttons. The Tab key still works the same way, with the first button's words.

- When the chat starts, the empty chat box shows a question to try, like *"Try: How did you meet Benji?"*
- Press **Tab** and the question is filled in. Press **Enter** to send it.
- On a phone there is no Tab key, so a small **Use** button fills it in instead.
- After each answer, Gemini suggests a new question that fits the talk, about something in the story book you have not asked yet.
- If the AI is busy, the next question comes from a list of 10 good starter questions in `content.js`.
- A question is never suggested twice.
- Tab only fills in the question when the box is empty. The rest of the time, Tab moves to the next button like normal, so the keyboard still works for everyone.

#### Changing the story

1. Edit `ai/story/zazo-story.md`.
2. Make the new PDF for reading: `node tools/make_story_pdf.mjs`
3. Restart the AI helper, so Zazo reads the new book.

---

### Phase 8: Putting Tribezo online

#### The problem

On my computer, Tribezo runs as three parts: the website, the C server, and the AI helper. Websites online are hosted in two very different ways.

- **GitHub Pages** only hosts files. It cannot run any server.
- **Vercel** hosts files and small functions that run for a moment when someone calls them. It cannot keep a C server running all the time.

So the C server and the AI helper had to change shape.

#### The C stack now runs in the browser

The same `stack.c` and `reverse.c` are built a second time as **WebAssembly**. WebAssembly is a way to run C code inside a web browser, very fast. The C code did not change at all.

- `backend/wasm/shim.c` gives the C code the few pieces of the C library it needs, like `malloc` and `strlen`, because a browser does not have a C library.
- Memory works like a notepad. Every message starts on a clean page, which keeps it simple.
- `make wasm` builds `stack.wasm` (only about 3.6 KB) and puts it in the website.
- `src/lib/stack.js` loads it and calls it, the same way the website used to call the C server.
- `make test-wasm` checks that the browser version flips every test sentence exactly like the C version.

Now the words are flipped right on the player's own device. There is no waiting for a server, and the C server is not needed to play. It is still in the project, with all its tests, for learning and for class.

Building it needs `clang` (which comes with the Mac) and the WebAssembly linker: `brew install lld`.

#### The AI helper is a Vercel function

- The Gemini part of the AI helper moved into `ai/zazo-ai.js`. Both the helper on my computer (`ai/local-server.js`) and the Vercel function (`api/chat.js`) use it, so they always act the same way.
- On Vercel, the Gemini key is saved in the project settings. It is never in the code, on GitHub, or in the website.

#### Guards for the public

Online, anyone could try to use the AI function, so it has its own guards.

| Guard | What it does |
|---|---|
| Only our websites | It only answers the Vercel site itself and the GitHub Pages site. Requests from other websites, or from no website at all, are turned away. |
| A few messages each | Each visitor gets 8 messages a minute. |
| A daily limit | 300 messages a day, so the free Gemini quota is not used up. |
| Billing is off | The Gemini key has billing turned off. If someone uses up the free quota, Zazo switches to his fixed answers for the rest of the day. Nothing can be charged. |

These limits are counted by each running copy of the function, and Vercel may run a few copies. So they are a safety net, not a perfect count.

#### Two addresses

| Where | Address | How it gets there |
|---|---|---|
| GitHub Pages | https://rmagdaleena2508-01.github.io/tribezo/ | A GitHub Action builds the website after every push to `main`. Zazo's AI answers come from the Vercel function. |
| Vercel | The address Vercel gives the project, like `https://tribezo.vercel.app` | Vercel builds the website and the AI function after every push to `main`. |

On GitHub Pages the site lives in a folder called `tribezo`, so every picture and page link now starts with the site's base address.

#### Connecting Vercel (only once)

1. Go to [vercel.com](https://vercel.com), sign in with GitHub, and click **Add New**, then **Project**.
2. Pick the `tribezo` repository and click **Import**. If Vercel asks for a **Root Directory**, pick **tribezo (root)**. Leave the other settings as they are. `vercel.json` already tells Vercel how to build.
3. Before you click **Deploy**, open **Environment Variables** and add `GEMINI_API_KEY` with your key. Use a key that has billing turned off.
4. Click **Deploy**, and copy the address Vercel gives you.
5. On GitHub, open the repository's **Settings**, then **Secrets and variables**, then **Actions**, then the **Variables** tab. Add a variable called `TRIBEZO_API_BASE` with the Vercel address, like `https://tribezo.vercel.app`, with no slash at the end.
6. Open the **Actions** tab and run **GitHub Pages** again, so the GitHub Pages site starts using the Vercel AI.

#### Why the Deploy button was missing at first

- My portfolio deployed to Vercel with one click. Tribezo did not show a **Deploy** button.
- Vercel looks through the folders to find apps. It found **3 apps** in Tribezo:
  - a Vite website in `frontend/`
  - a Node server in `ai/` (because of `ai/package.json` and a file called `server.js`)
  - the top folder
- When the top folder has other apps inside it, Vercel wants a special "services" setup, so it hid the Deploy button.
- My portfolio has only **1 app**, right at the top. That is why it just worked.

**The fix: make Tribezo 1 app, like my portfolio.**

- The website moved from `frontend/` to the top folder: `index.html`, `src/`, `public/`, and the settings files.
- The two `package.json` files became one, at the top. It has the website's packages and commands for everything:
  - `npm run dev` starts the website
  - `npm run ai` starts the AI helper
  - `npm run test:ai` runs the AI tests
- `ai/server.js` is now `ai/local-server.js`, so Vercel does not think it is a separate server app.
- I checked with Vercel's own detection code. Before: 3 apps (`ai`, `frontend`, and the top). After: **1 app**, the top folder.
- The C code, the AI code, and the Vercel function did not change. Only where the website's files live changed.

### Phase 9: Natural talk

#### The problem

After playing for a while, I noticed three things:

1. **Zazo's answers from the story book were hard to get.** He often missed facts that were right there in the book.
2. **Moving around was hidden.** You only moved if you happened to ask the right way. There was nothing on the screen that showed you could go places.
3. **The talk felt basic.** Zazo answered, and then it stopped. It did not feel like talking to a real, fun person.

What I asked Claude for: *"I want it to feel like a natural, flowing conversation. I want him to be a little bit talkative and extroverted. Benji should be the calm one and the translator."* I also asked Claude to look through free resources on the internet and GitHub first, and to find a way to make the talk natural.

#### What Claude found

| Source | What it taught |
|---|---|
| Google's [Gemini prompt design guide](https://ai.google.dev/gemini-api/docs/prompting-strategies) | Put the persona in the system instructions. Show example answers. Gemini answers short and plain unless you ask it to be chatty, so you have to ask for that clearly. |
| [Awesome LLM role playing with persona](https://github.com/Neph0s/awesome-llm-role-playing-with-persona) (GitHub) | A list of research on keeping an AI character in its role, with a steady personality. |
| LLM NPC projects on GitHub, like [Interactive LLM Powered NPCs](https://github.com/AkshitIreddy/Interactive-LLM-Powered-NPCs) and [TinyNPC](https://github.com/Ataher-KoW/tinynpc) | Good game characters have a clear personality, remember what was said, and know what is around them. |
| Articles on long context and caching, like [RAG-less architecture with Gemini](https://dev.to/dewaldhugo/rag-less-architecture-in-laravel-long-context-caching-with-gemini-5h36) | When the facts are short, it works better to give the AI the whole text than to make it look things up. Gemini also saves work on a long start that stays the same every time. |

#### What changed

**1. The whole story book is now in Zazo's instructions.** The book is only a few thousand words. Before, it was a PDF, and Gemini had to read the PDF's pages each time. Now the plain text of the book sits right inside Zazo's instructions, with his character, his rules, and his example answers. The parts that never change come first, and the parts that change (who you are, where you are standing) come last, so Gemini can reuse its work on the long start. There is no upload anymore, so the helper is simpler and the first answer is faster.

In a test, I asked *"How did you become the leader?"* and Zazo told the story of the Echo Challenge, when he stopped to help a friend's little brother instead of racing to win. That fact is in the book, and he found it right away.

**2. Zazo is chatty now.** His rules give every answer 4 steps, the way a friend talks:

1. **React first,** like *"Oh!"*, *"Ha!"*, or *"Really?"*
2. **Answer the question,** with facts from the book.
3. **Add one small, colorful detail,** like the sound of the falls or what the goats did this morning.
4. **Hand the talk back** with a question about you, or an offer to go somewhere.

He also remembers what you tell him and brings it up later, never asks the same thing twice, and talks about the place he is standing in. His answers are 2 to 4 sentences now, up to about 60 words. He remembers the last 10 things said, up from 6. He even starts the talk himself: his very first line asks where you sailed from.

**3. Benji is the calm one.** Benji still tells you exactly what Zazo said, and he always starts with *"He says"*, *"He is saying"*, or *"Zazo says that"*, so it is clear he is passing on Zazo's words. But now, about 1 time in 4, he adds a short note of his own, in 1 calm sentence. He explains an island word, tells you Zazo asked you a question, helps if you seem stuck, or makes a small, dry joke about Zazo being very excited. For example, when Zazo says *"Benji, tell them you were snoring!"*, Benji says *"I was not snoring. I was resting my eyes."*

**4. Answer buttons.** After every answer, 2 or 3 buttons show things you could say next, like *"Why does the water sing?"*, *"Can I swim here?"*, and *"Where do we go next?"*. Tap one to say it. They are all different: one answers Zazo, one asks about something new, and one goes somewhere. When Zazo offers to take you somewhere, one button says yes. You never get stuck, but you can always type your own words too. The buttons hide while the phone keyboard is open, so there is room.

**5. The Places menu.** A **Places** button at the top opens a small map of all 7 places, each with a little picture. It marks where you are, and marks the places you have not seen as **New**.

- Pick a place and you go there **right away.**
- Then **Zazo speaks first.** He welcomes you, says what you can see and hear, shares a small memory about the place, and asks you a question.
- New answer buttons fit the new place, like *"Tell me about the Echo Challenge"* on the lookout hill.
- Then you ask him anything about it.
- Without the AI, Zazo says his own short welcome line for each place.

**6. Zazo knows where you have been.** The game sends the list of places you have seen. When you say *"show me around"*, Zazo takes you somewhere new.

**7. Better fixed answers.** When the AI is not working, Zazo's fixed answers are longer and friendlier now, and most of them ask you something back. Asking to go to a place, like *"Can we go to the beach?"*, works with the fixed answers too.

#### How I thought about it

A real conversation is a game of catch. Each person catches what the other said, adds something, and throws it back. Zazo used to catch the ball and hold it. Now he always throws it back. Benji is the calm friend in the middle who makes sure nobody drops it. The answer buttons are there for players who are shy or do not know what to say, so everyone can play.

### Phase 10: A fiction notice, and the language gets a name

#### The language gets a name

- Zazo's language is now called **Calonis.**
- At first I called it XYZ.
- The name changed everywhere: the game, Zazo's instructions, the story book, the code comments, and this README.

#### A work of fiction

- Before Benji asks for your name, a short notice shows up.
- It says the game is made up, like a notice at the start of a movie.
- What it says:
  - Zazo, Benji, the islands, and the Calonis language are all imaginary.
  - They come only from the game developer's imagination and creativity.
  - They do not show any real person, tribe, community, culture, or language.
  - Any likeness to real people or places is by chance.
  - Zazo's replies are written by AI, so they may not always be right.
- Its heading, **A Work of Fiction,** falls onto a stone wall in Calonis and hops into English, the same way as the Tribezo title.
- To do that, the falling letters became their own part, `FallingTitle.jsx`, used by both the title and the notice.
- It can now handle more than one word, and the same letter twice (like the two `i`s in *Fiction*).

#### Going straight to a place

- The **Places** menu is now a small map, with a little picture of each place.
- Pick a place and you go there **right away.**
- **Zazo speaks first:** he welcomes you, says what you can see and hear, and asks you a question.
- Then you ask him about the place.

#### Saving your chat (tried, then taken out)

**What I tried first**

- I saved the chat in the browser's own storage (localStorage), on the player's device only.
- The next time, the title screen said **Continue as Mary**, and the chat came back.

**Why I took it out**

- Many people can use the same computer, like at school or in a library.
- The next person would see **Continue as Mary**, and could open Mary's whole chat.
- That gives away the last player's name and words. A game should never do that.

**What happens now**

- Every visit starts from the very beginning: the title, the story, the fiction notice, and an empty name box.
- The name and the chat only live while the page is open. Close it or refresh it, and they are gone.
- When the game opens, it also wipes any chat that an older version saved, so nothing from a past player is left on the device.
- There is still no database, and the AI helper does not keep any messages.

### Phase 11: A video about the stack

#### Why

- Tribezo is a DSA project, and the stack is the heart of it.
- People who play should be able to learn how the stack works, right inside the game.

#### Where to find it

- In the chat, press **How the stack works** at the top left, next to the Tribezo name.
- On small screens, it shows only the play icon.
- The video opens in a window. Press the **X**, the Escape key, or click outside to close it.

#### What the video teaches (3 minutes 59 seconds)

1. **What a data structure is:** a way to keep data in order, so a computer can use it fast. Arrays, linked lists, queues, trees, and stacks are all data structures.
2. **What a stack is:** a linear data structure, like a pile of plates. You add and take only from the top.
3. **LIFO:** last in, first out.
4. **The four jobs:** push, pop, peek, and is empty. Push and pop are O(1).
5. **Stacks in algorithms:** the call stack and recursion, matching brackets, solving math like `3 4 + 5 x`, and depth first search in a maze.
6. **Stacks in everyday apps:** undo, redo, and the back button in a browser or on a phone.
7. **Good sides and limits:** simple, fast, little memory. Only the top can be reached, overflow, and underflow.
8. **Meet Zazo and Benji:** Zazo, the loud and friendly leader who only speaks Calonis, and Benji, the calm translator with a stack.
9. **What happens when you talk:** real screenshots of the game, step by step. You type, Benji tells Zazo in Calonis, Zazo answers, and Benji translates. Each speech bubble is zoomed in so it can be read.
10. **Watch one word flip:** `hello` goes in, `olleh` comes out.
11. **What does not flip:** marks, money, and your name.
12. **Benji's stack is real code:** C, an array that doubles when full, and WebAssembly in the browser.
13. **See the stack at work:** the History panel shows 12 pushes and 12 pops for "How old are you?", one of each for every letter.

#### Smooth playing in the game

- **It starts before it is all downloaded.** The video file keeps its index at the very start ("fast start"), so the browser can play it while the rest is still coming.
- **It warms up early.** When the chat opens, the game quietly loads the first part of the video in the background. Then it starts quickly when you press the button.
- **A spinner while it waits.** If the internet is slow and the video needs more data, a small spinning circle shows, so it never looks frozen.
- **It is small.** About 7 MB for 4 minutes, so it plays well even on a phone.
- **Tested in Chrome:** the video started playing in about 1.4 seconds, and jumping to 3:20 took about half a second, with no errors.

#### Where the facts come from

- GeeksforGeeks: *Stack Data Structure*, and *Applications, Advantages and Disadvantages of Stack* (function calls, recursion, expression evaluation, bracket checking, memory).
- Programiz: *Stack Data Structure* (push, pop, peek, is empty, O(1), reversing a word).
- The words were then made simple, for a third grade reader.

#### How the video is made

- The whole script is in `tools/stack-video-script.md`.
- `tools/make_stack_video.py` makes the video by itself:
  - **Kokoro** reads each sentence out loud, in a young British male voice called `bm_fable`.
  - Python draws every frame: the game's backgrounds, Zazo and Benji, plates that move on and off a stack, and captions.
  - The conversation part uses real screenshots of the game, kept in `tools/video-shots/`. `tools/capture_game_shots.mjs` takes them by playing the game in Chrome with no window.
  - ffmpeg joins the pictures and the voice into one small video, about 6 MB.
#### The script

- The first script sounded like a list of facts.
- I asked for it to sound like a computer science teacher taking a short class, in simple words.
- Now the teacher welcomes the class, asks questions (*"When you add a plate, where does it go?"*), has everyone say *"LIFO!"* together, and ends with *"See you next time."*

#### The voice

- The first version used the Mac's own voice. It sounded a bit like a robot.
- I asked for a voice that sounds like a real young man.
- The pick: **Kokoro**, a free voice model. Anyone can use it, even in a public project (Apache 2.0).
  - It runs on my own computer. No internet, no key, and no cost.
  - It is small (82 million parts), so it is fast. It made the whole voice in under a minute.
  - It has 9 American and 4 British male voices. I listened to samples of 12 of them and picked `bm_fable`, a young British voice.
- I also looked at **Chatterbox**. It sounds very real too, but it needs a strong graphics card and a sample voice to copy, so Kokoro was the better fit.
- If Kokoro is not set up, the script uses the Mac's voice, so it always works.

#### Remaking the video

Set up Kokoro once, from the top folder:

```bash
python3 -m venv .venv-tts
```

```bash
.venv-tts/bin/pip install kokoro-onnx soundfile pillow
```

Then put the two model files, `kokoro-v1.0.onnx` and `voices-v1.0.bin`, in `~/.cache/tribezo-tts`. They come from the [kokoro-onnx releases page](https://github.com/thewh1teagle/kokoro-onnx/releases/tag/model-files-v1.0).

To change the words, edit the script inside `tools/make_stack_video.py`, then run:

```bash
.venv-tts/bin/python tools/make_stack_video.py
```

- The video is saved in `public/video/stack-explained.mp4`.

### Phase 12: Smoother changes

#### The problem

- Changing places looked sudden.
- Halfway through a change, both pictures were half see-through, so the screen got darker for a moment.
- Each new picture started a little zoomed in, so it seemed to jump.
- The characters snapped to a new size in each place.
- When a pose changed, the character flickered.
- The Places menu was locked while Zazo was talking, so you could not switch quickly.

#### What I looked at

| Option | What I found |
|---|---|
| **Motion (Framer Motion)** | Already in the game. Fades run on the graphics card, and a fade can be stopped halfway and turned into a new one. |
| **The View Transitions API** | Built into browsers, but a change cannot be stopped halfway. Clicking fast makes it skip or jump. |
| **GSAP** | Great for timed scenes, but it would add a second way of animating the same pictures. |
| **A WebGL shader** | Very fancy effects, but heavy for a simple fade, and harder to keep smooth on phones. |

I picked **Motion**, with a better way of fading.

#### What changed

- **The new place dissolves in on top.** The old picture stays fully visible underneath. The new one fades in over it and settles from a tiny zoom. Only when the new one is fully in does the old one go away. So the screen never dims halfway.
- **Fast clicking stays smooth.** Each new place simply dissolves in over whatever is showing. Old pictures are removed once they are covered.
- **No half loaded pictures.** A new picture only starts to fade in once the browser has it ready to draw.
- **One slow drift for every picture.** The gentle zoom now belongs to the whole background, so a new place never starts with a zoom jump.
- **Characters change size gently** over 1.4 seconds, instead of snapping.
- **Poses blend.** The new pose fades in on top while the old one stays solid, then the old one fades away. The character never turns see-through.
- **Places works any time,** even while Zazo is talking. His old answer is dropped, and the new place dissolves in.

#### More fixes, after playing again

- **Characters blinked out when their pose changed.** The old pose was taken away, and the new picture was not always drawn yet. Now every pose is loaded once and kept, stacked on top of each other. A new pose fades in fast (under a fifth of a second) on top of the old one, and the old one stays solid underneath until the new one is fully in. A test in Chrome checked every frame while Zazo changed poses: he was fully solid the whole time.
- **Benji's next line came too late.** After "Let me tell him...", nothing happened until Gemini had answered, which can take a few seconds. But flipping your words with the stack takes only a few thousandths of a second. Now Benji says your words in Calonis right away, while Zazo's answer is still on its way. Zazo shows "mmH..." (that is "Hmm..." in Calonis) while he thinks, and it turns into his answer the moment it arrives. In a test, Benji's line showed 0.28 seconds after sending, instead of after the whole answer.

#### Testing it

I recorded the screen in Chrome while switching places 3 times in a row, half a second apart, and measured the brightness of every frame.

| | Before | After |
|---|---|---|
| Darkest moment during the changes (out of 255) | 78 | 88 |
| Biggest change between two frames | 8.9 | 7.3 |

I also tried a soft blur as each picture fades in. It looked nice, but the screen froze for up to 0.8 seconds on a computer without a graphics card, so the blur is left out.

### The opening, the falling title, and the liquid glass buttons

#### The opening

When someone opens the game, from the GitHub Pages link or the Vercel link, it plays a short opening.

1. **A starry night sky.** Stars twinkle and one shooting star flies across the top.
2. **My icon and the word "builds".** They fade in softly, a little blurry at first, stay for a moment, and fade out again. "builds" is written in **Great Vibes**, a flowing script font. The style I wanted was Inter with "Tempting". Tempting is only free for personal use, and this game is public, so Great Vibes is used instead. It is the closest free script font and it is on Google Fonts.
3. **The water rises.** The dark sky fades a little. Then a line of water rises from the bottom of the screen to the top. The line is wavy, so it is never straight. Its edge melts into the sky in soft, uneven patches, and a light blue glow of foam runs along it. Under the water, the island shows, rippling.
4. **The island settles.** The island picture starts a little low and comes up with the water. Then it slides down into its place while the ripples calm down.
5. **The opening fades into the real scene.** The picture in the opening is drawn at the same size as the real background, so nothing jumps.

The opening follows the real clock, so it always takes the same time, even on a slow computer. If a device cannot draw it, the game skips straight to the title. People who ask their device for less motion skip it too.

**How the water is made.** The water is drawn by a tiny program called a **shader**. It is written in **GLSL**, a language for the graphics card. It works out the color of every dot on the screen, 60 times every second. It uses soft random patterns, called noise, to make the wavy edge and the uneven patches. **OGL** is a very small library that sets up the graphics card for the shader. **GSAP** times each step.

#### The title falls onto a wall

After the opening, the title comes in like this:

1. **A stone wall grows** out from the middle, where the title will sit.
2. **The letters drop onto the wall one at a time, backwards,** as `ozebirT`. The `o` drops first. Each letter squashes a little when it lands and bounces twice, like a real block.
3. **The letters hop over each other** into the right order, `Tribezo`. A letter with a long way to go jumps higher. The `T` and the `o` jump the highest.
4. Then the line under the title and the **Begin** button fade in.

This shows the whole idea of the game in a few seconds. The words come out backwards, and the game puts them the right way around.

The wall is sized to the title, so it grows and shrinks with it on a phone. **Framer Motion** moves the letters. It can make a letter fall, bounce, and slide to a new spot, and it follows the site's safety rules.

#### How I built the opening with Claude

I built the opening by talking with Claude, one idea at a time. Each time, I said what I pictured, asked Claude to look on the internet for the best tools, and asked to try it on my computer first.

1. **First try: pixels.** I asked for a pixel opening like my MagWorks portfolio: a starry sky for at least 2.5 seconds, my icon with "builds" fading in and out, then the sky breaking into blocks from the top to the bottom. Claude used GSAP with a canvas, the same as MagWorks. It worked, and it went live.
2. **Second try: water.** I wanted something softer. I told Claude: *"dissolving like water. The black sky is fading away, and then this is dissolving from the bottom to the top, and then it's coming up, and then this new background image is setting down."* I also said: *"Do not deploy it. Let's try it in the local version."* Claude looked at shader tutorials on Codrops, the gl-transitions collection, and a liquid dissolve shader on 21st.dev. It picked a shader with OGL, since Three.js is much bigger than this one effect needs. The first test showed the island upside down, and Claude fixed it.
3. **The title.** Then I pictured the title sitting on a wall: the letters fall onto the wall backwards, then arrange themselves into the right order. Claude compared three ways to do it:

| Option | What Claude found |
|---|---|
| **Matter.js** | A real physics engine. The letters could land in random spots, and it is a big download for one title. |
| **GSAP Flip** | Good at moving things to new spots, but it writes styles in a way the site's safety rules block. |
| **Framer Motion** | Already in the game. It can fall, bounce, and move letters to new spots, and it follows the safety rules. |

Framer Motion won, so no new library was needed.

4. **Checking before going live.** I watched both on my computer first. When I liked them, I asked Claude to put them online.

My design thinking was simple. The opening should feel calm, like the island is waking up. The title should not just appear. It should show the game's big idea, words coming out backwards and turning the right way, before anyone reads a single line.

#### The liquid glass buttons

I looked at glass button libraries and articles to pick the best one:

| Option | What I found |
|---|---|
| Liquid Glass Button by Ali Imam (21st.dev) | The most saved button on 21st.dev. An SVG filter bends the scene behind the button, like thick glass. |
| `liquid-glass-web-react` | Real bending that works in every browser, but it bends the whole scene underneath, which is too heavy for a full screen picture that moves. |
| Glass UI kits (Glass UI, shadcn glass, GlassyUI) | Frosted glass only, and they bring many parts we do not need. |

I picked the **Liquid Glass Button by Ali Imam**, and built our own small version of it (`GlassButton.jsx`), so there is no extra package. The look follows Apple's Liquid Glass:

- **Mostly clear.** Only a light blur, so the island stays easy to see through the buttons and the chat box.
- **A bright shine** along the top edge, and a curved highlight, like light on real glass.
- **A soft glow inside the rim,** so the edge looks thick.
- **Bending.** In Chrome and Edge, small buttons also bend the scene behind them a little. Safari and Firefox cannot bend what is behind a button, so they show the clear glass without bending.
- The bending is only used on small buttons: Begin, Tap to continue, and the buttons at the top. Bending costs a lot of drawing work over big areas, so the big chat box is clear glass without bending.
- White text has a soft shadow, so it stays readable on bright parts of the island.

## Problems I Faced and How I Fixed Them

Building Tribezo was not a straight line. These are the biggest problems, and what fixed each one.

### The stack and the servers

| Problem | How I fixed it |
|---|---|
| The website could not reach the C server online. GitHub Pages and Vercel cannot run a C program that waits for messages. | The same C stack code is turned into WebAssembly, so it runs right inside the browser. No C server is needed to play. |
| Zazo said the player's name backwards. | Names are now an exception. The stack is given the name, and it leaves those words alone. |
| Numbers and money came out flipped, so "$20" stopped making sense. | Numbers, money signs, and money words like "dollars" and "Rs" are skipped by the stack. |

### Talking with Gemini

| Problem | How I fixed it |
|---|---|
| Every answer came from the fixed list. The key had an extra letter at the start. | Took the letter out. The helper now warns when a key does not look like a Gemini key. |
| Google said its models were busy, or out of free quota. | A line of 5 models. A busy model rests, and the next one answers. |
| Answers got cut off in the middle. The model used all its space to "think". | It is asked to think only a little, and the answer has more room. |
| Zazo could not answer questions about his own life. He made things up. | The Zazo Story Book. Its whole text now goes into his instructions, so he answers from it (see the RAG part). |
| Zazo sounded short and flat. | New rules: react first, answer, add one detail, then ask something back. Benji adds calm notes, and answer buttons help shy players. |
| Questions you write yourself only got a "the sea is loud" reply on the live site. | The live site had no Gemini key, so Zazo could only use his fixed list. The backend was running, but said `"ai": false`. |
| The key was added in Vercel, but the live site still said `"ai": false`. | Two small slips. First the names were `for_tribezo_project` and `api_key`, but the code only reads `GEMINI_API_KEY`. Then the right name was saved, but Vercel only reads a new key on a new deployment, so it needed one more Redeploy. After that it said `"ai": true`. |
| The GitHub Pages site still used fixed answers after Vercel worked. | GitHub Pages did not know where Vercel was. Setting the repository variable `TRIBEZO_API_BASE` to the Vercel address and running the GitHub Pages workflow again fixed it. A test on the live GitHub Pages site asked "What do you do when it rains on the island?", and Zazo answered with Gemini about staying dry in the round huts. |

### Putting it online

| Problem | How I fixed it |
|---|---|
| Vercel would not show a Deploy button, even though my portfolio deployed in one click. | Vercel saw 3 apps in the project. I moved the website to the top folder and joined the two `package.json` files, so it sees 1 app, like my portfolio. I checked this with Vercel's own detection code. |
| Vercel kept running an old command, `cd frontend && npm ci`, after that folder was gone. | The right commands are now written in `vercel.json`, which wins over old dashboard settings. |
| The key was typed into the wrong box in Vercel, and it showed in a screenshot. | The name goes in Key, the key goes in Value. A key that was ever shown should be replaced with a new one. |

### The look and feel

| Problem | How I fixed it |
|---|---|
| The site's safety rules blocked GSAP from changing styles, so the opening froze. | Only the GSAP core is used. It moves plain numbers, and the page copies them onto the screen itself. |
| Changing places looked sudden, and the screen dimmed halfway. | The new place now dissolves in on top of the old one, characters change size gently, and poses blend (see Phase 12). |
| A soft blur in the change made slower computers freeze for up to 0.8 seconds. | The blur was taken out. Smooth beats fancy. |

### Privacy

| Problem | How I fixed it |
|---|---|
| The title screen said "Continue as Mary", so the next person on the same computer could open Mary's chat. | Saving was taken out. Every visit starts fresh, and any old save is wiped when the game opens. |

### The stack video

| Problem | How I fixed it |
|---|---|
| The first voice sounded like a robot. | Kokoro, a free voice model that runs on my own computer, with a young British voice. |
| The script read like a list of facts. | It was rewritten as a teacher taking a short class. |
| Speech bubbles in the game screenshots were too small to read. | Each bubble is shown zoomed in, next to the screen. |
| The video was over 4 minutes. | Some lines were cut and the voice was sped up a little. It is now 3 minutes 59 seconds. |

---

## Keeping It Safe

| What | How |
|---|---|
| Only this computer can use the servers | On your computer, the C server and the AI helper only listen to this computer. They also turn away requests that come from other websites. |
| Online guards | The Vercel AI function only answers our two websites, allows 8 messages a minute for each visitor and 300 a day, and uses a key with billing turned off. |
| The servers stay hidden | The browser only talks to the website. The website passes requests on to the servers. |
| The Gemini key stays secret | It lives only in the `ai/.env` file on your computer. That file is never uploaded to GitHub, and the website never sees it. The key is sent to Google in a hidden header, never in a web address, and it is never printed in the logs. |
| Limits on size | Messages can be up to 2,000 letters, names up to 20 letters, and the C server takes up to 10 KB. |
| Limits on speed | The AI helper allows 20 messages a minute, so the free quota lasts. Slow connections are cut off. |
| Text stays text | Everything people type is shown as plain text, so nobody can sneak code into the page. |
| Answers are checked | The website and the AI helper only use the parts of an answer they expect, and check each part. |
| Kind errors | People see a friendly message, never the details of an error. |
| Rules for the browser | The finished website tells the browser to only run its own code (plus the WebAssembly stack), only load fonts from Google Fonts, and only talk to its own address and the Vercel AI function. |
| No source code in the finished website | The finished website does not ship the original code. |
| Nothing is kept after you leave | The name and the chat only live while the page is open. Every visit starts fresh, so the next person on the same device never sees your name or your chat. Any chat saved by an older version is wiped when the game opens. There is no database, and the AI helper does not keep your messages. |
| The story book only goes to Google | The book's text is part of Zazo's instructions, which only go to Gemini's own address. The book has no personal details in it. |

Anything that runs in a browser can be looked at with the browser's developer tools. That is why every real check happens in the servers.

---

## Setting Up the Gemini Key

Do this in the Terminal on your own computer. **Never** put the key on the GitHub website, in a commit, in a chat, or in the website code.

1. Go to [Google AI Studio](https://aistudio.google.com/apikey), sign in, and click **Create API key**. Copy the key.
2. Make your own settings file from the blank one.

   ```bash
   cd tribezo/ai
   cp .env.example .env
   ```

3. Open the new file.

   ```bash
   open -e .env
   ```

4. Paste your key right after `GEMINI_API_KEY=`. Do not add spaces, quotes, or any extra letters. A Gemini key starts with `AIza` or `AQ.`. Leave the two model lines as they are. Save and close the file.
5. Check that Git will never upload the file.

   ```bash
   git check-ignore -v .env
   ```

   It should print a line that ends with `.env`. If it prints nothing, stop and do not commit anything.
6. Go back to the top folder and start the AI helper.

   ```bash
   cd ..
   ```

   ```bash
   npm run ai
   ```

   It should say which Gemini models it is using. If it says it found no key, or that the key does not look like a Gemini key, check step 4.

If the key is ever shared by mistake, delete it in Google AI Studio and make a new one.

---

## How to Run It

You need a C compiler and `make`. On a Mac, this command gets both.

```bash
xcode-select --install
```

You also need [Node.js](https://nodejs.org) version 22.

### Run the tests

```bash
cd backend
make test
make test-server
make test-wasm
```

```bash
npm run test:ai
```

### Start the game

The words are flipped in the browser now, so the C server is not needed to play. Use two Terminal windows.

Run these from the top `tribezo` folder.

1. Start the AI helper. This step is optional. Without it, Zazo uses his fixed answers. Set up the Gemini key first.

   ```bash
   npm run ai
   ```

2. Start the website.

   ```bash
   npm install
   ```

   ```bash
   npm run dev
   ```

3. Open http://127.0.0.1:8766 in your browser.

### Rebuild the browser stack

After changing `stack.c` or `reverse.c`, build the WebAssembly again.

```bash
cd backend
make wasm
make test-wasm
```

### Start the C server by itself

The C server still works on its own, for class or for testing with `curl`.

```bash
cd backend
make run
```

To keep a name the way it is, send it in the `X-Keep-Words` header:

```bash
curl -X POST -H 'X-Keep-Words: Mary' --data-binary 'hello, Mary!' http://127.0.0.1:8765/api/reverse
```

The answer has `"xyz":"olleh, Mary!"`.

### Try the flip by itself

```bash
cd backend
make demo
```

Type some English and press Enter. Press Control and D together to stop.

```
> hello, world!
Calonis: olleh, dlrow!
(stack: 10 pushes, 10 pops)
```

### Try the finished website

This version has all the safety rules turned on. Keep the AI helper running, then run these.

```bash
npm run build
```

```bash
npm run preview
```

Open http://127.0.0.1:8767.

---

## I Will Keep Changing This

This project grows step by step. As I build it, I try things out, see what works, fix what does not, and add new ideas. This README changes along with the project.

### Ideas I might add later

- Sounds for the island, like waves and birds.
- More people from the tribe, once they come back from their trip.
- Typing in Calonis and getting English back.
- A mode that shows the stack pushing and popping, one letter at a time.
