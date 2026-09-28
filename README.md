# Tribezo

**Talk to Zazo, the kind leader of an island where every word comes out backwards.**

Tribezo is a game you play in a web browser. You type in English. Benji, the translator, flips your words around. Then Zazo talks back to you in his own language.

His language is called **XYZ**. XYZ is English with the letters of every word turned around.

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

1. **Zazo.** He is the leader of the islands. He is warm, kind, and always happy to see a visitor. He does not know English. He only speaks XYZ. Right now his people are away for 3 days, visiting their families on another island, so Zazo is looking after everything by himself.
2. **Benji.** He is the translator. He wears a yellow hoodie, and he knows both English and XYZ.

You talk to Benji in English. He flips your words with a stack and tells Zazo. Zazo answers in XYZ. Benji tells you what he said. Zazo can even show you around the island.

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

## How XYZ Works

These are the rules for turning English into XYZ.

1. **The letters in each word are flipped.**
2. **The words stay in the same order.**
3. **Punctuation stays in the same place.** Commas, periods, and marks like `!` and `?` do not move.
4. **Numbers stay the same.** `123` stays `123`.
5. **Money stays the same,** so the amount means the same thing in both languages.
   - Money signs: `$`, `€`, `£`, `¥`, `₹` (like `$100.50` or `₹500`)
   - Money names next to a number: `100 dollars`, `Rs 500`, `USD 20`, `50 cents`
   - Money names stuck to a number: `Rs500`, `20usd`

### Examples

| English | XYZ |
|---|---|
| `hello` | `olleh` |
| `hello world` | `olleh dlrow` |
| `hello, world!` | `olleh, dlrow!` |
| `how are you?` | `woh era uoy?` |
| `it costs $20.` | `ti stsoc $20.` |
| `I have 3 cats` | `I evah 3 stac` |
| `it is Rs 500` | `ti si Rs 500` |

### Words that look a little funny

| English | XYZ | Why |
|---|---|---|
| `don't` | `tno'd` | The `'` stays in its spot. |
| `You` | `uoY` | A capital letter moves with its letter. |
| `café` | `facé` | Letters from other languages, like `é`, stay in their spot. |
| `5 pounds of rice` | `5 pounds fo ecir` | `pounds` is kept as money, even when it means weight. |

---

## How to Play

1. **The title screen.** A mountain meadow. The title shows up backwards as `ozebirT`, then the letters slide into `Tribezo`. You press **Begin**.
2. **The story.** It takes about 40 seconds. You tap once for each step.
   1. A beach. *"Past the edge of every map lies a little island that no one has visited in a very long time. Until today."*
   2. A jungle path. Zazo walks in and waves. He says `olleH, relevart! emocleW!`
   3. The village. Zazo looks puzzled. He says `ohW era uoy? erehW era uoy morf?` *"There's just one problem. Everything Zazo says comes out backwards."*
   4. Benji walks in and explains how he will help.
3. **Your name.** Benji asks, *"Before we go in, what should I call you?"* The box starts empty. The game asks for your name every time you visit.
4. **The first flip.** Your name goes to the C server. Zazo laughs and greets you backwards. Tap, and Benji tells you what he said.
5. **Talk to Zazo.** Only one person talks at a time. Each tap moves the talk along.
   1. You type in English. Benji says *"Let me tell him."*
   2. The stack flips your words. Benji says them to Zazo in XYZ.
   3. Zazo answers. The stack flips his answer too. Zazo says it in XYZ, in a bubble over his head.
   4. Benji tells you what Zazo said, in English, in a bubble over **his** head.
6. **The tour.** Ask *"Where are the other people?"* Zazo tells you they went to see their families for 3 days, and he offers to show you around. Say *"yes"* or *"show me around"*, and the place changes. You visit his family's hut, the Singing Falls, the lookout hill, and the campfire at night.

On a phone, you play with the phone turned sideways, like most games. If the phone is upright, the game asks you to turn it.

### The flow in a picture

```
   You type English
        |
        v
   The website
        |
        v
   C server        (the stack flips your words)
        |
        v
   AI helper       (writes what Zazo says, in English)
        |
        v
   C server        (the stack flips Zazo's answer)
        |
        v
   Zazo speaks XYZ, then Benji tells you what it means
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
| **Google Fonts** | Fredoka for titles and Nunito for talking. |

These are the same tools as my portfolio, plus howler.js and new fonts.

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

### What is left

- **Add music files.** The music system works, but there are no songs in the project yet, so the game is quiet for now.
- **Try it on a real phone,** turned sideways, with the keyboard open.
- **More stop motion pictures.** Right now each pose has 1 picture. Real stop motion uses 2 or 3 small changes of each pose.

---

## Folder Map

```
tribezo/
  backend/              the C part
    src/
      stack.c / stack.h     the stack: push, pop, peek, is_empty
      reverse.c / reverse.h flips each word with the stack
      server.c              the C web server
      demo.c                type English, see XYZ
    tests/                  tests for the stack, the flipping, and the server
    Makefile                commands to build, test, and run
  ai/                   the AI helper
    server.js               asks Gemini what Zazo says and checks every answer
    prompt.js               puts Zazo's files together for Gemini
    zazo/
      character.md          a short summary of who Zazo is
      rules.md              how Zazo answers, and the safety rules
      examples.md           example answers that show his voice
    story/
      zazo-story.md         The Zazo Story Book (edit this one)
      zazo-story.pdf        the same book as a PDF, which is sent to Gemini
    test/                   tests that use a pretend Gemini
    .env.example            a blank settings file
    .env                    your real key (only on your computer)
  frontend/             the website
    public/
      characters/           Zazo's and Benji's poses
      scenes/               the 8 backgrounds
      textures/             a fine grain laid over the scene
    src/
      lib/                  the words, the story, talking to the servers, and the music
      hooks/                typing effect, the phone keyboard, smooth scrolling
      components/           the scene, the characters, speech bubbles, the chat box, and more
      pages/                the main page and the "lost" page
  tools/
    cut_out_characters.py cut the characters out of their picture sheets
    make_story_pdf.mjs    turns the story book into a PDF
  README.md
```

---

## What I Built, Step by Step

### Phase 1: The stack and the flipping (C)

- **The stack.** It keeps letters in a list. When the list is full, it grows to twice its size. Push, pop, peek, and is_empty all take the same short time, no matter how big the stack is. This is called O(1).
- **The flip.** It goes over each word two times.
  1. The first time, it pushes only the letters onto the stack.
  2. The second time, every spot that had a letter gets the top letter popped off the stack. Numbers, punctuation, and spaces are never touched, so they stay in place.
- **Money check.** A word with a money sign or a money name next to a number is left as it is.
- **Speed.** The whole flip takes time that grows with the length of the text. This is called O(n).
- **Counts.** It counts how many pushes and pops it did, so the game can show them.
- **Tests.** They check the stack, words, punctuation, spaces, numbers, money, capital letters, and a long paragraph. They also check that flipping twice gives back the English. The tests run with memory checkers that catch mistakes like reading past the end of a list.

### Phase 2: The C server

- **What it does.** The website sends English to the C server, and the server sends back the XYZ.
  - `GET /api/health` answers `{"ok":true}`, so you can see the server is on.
  - `POST /api/reverse` takes plain text and answers with the English, the XYZ, and the push and pop counts.
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
- **Zazo's fixed answers.** Before the AI, Zazo picked his answer from a list. He still uses this list if the AI is not working. It covers his age, his family, his food, his mornings, how he met Benji, a word in XYZ, where his people went, and the tour. For anything else, he kindly says he did not catch it and suggests something he can answer.
- **The tour.** Say "yes" or "show me around" to go to the next place: the family hut, the Singing Falls, the lookout hill, the campfire at night, and back to the village.
- **Liquid glass.** The chat box, the name box, the story card, and the buttons at the top are clear like glass. They blur the scene behind them and have a soft shine.
- **The music system.** Each place has a song. When you move to a place with a different song, the old one fades out while the new one fades in. A button turns music on and off.

### Changes after trying the game

After I played it, I asked for these changes.

| What I asked for | What changed |
|---|---|
| Benji's words above Benji's head | Zazo's bubble shows only XYZ. Benji's English has its own bubble above Benji. |
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
  3. The stack flips Zazo's answer. Zazo says it in XYZ.
  4. Benji tells you what it means.
  5. If Zazo takes you somewhere, the place changes. His pose matches what he says.
- **The AI never flips any words.** The stack does all the flipping, so the stack stays the most important part of the project.
- **Zazo's files.** Everything Gemini knows about Zazo is in three plain text files in the `ai/zazo` folder. You can change them without touching any code.
  - `character.md` says who Zazo is. He is 34 summers old. His mother Nala weaves rugs, his little sister Kiki swims fast, and his grandfather Old Tumo tells stories. It lists his favorite food, his day, the animals, the 7 places, how he met Benji, and a few words in XYZ.
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
- **Zazo remembers** the last 6 things that were said.
- **A line of models.** On the free plan, Google often says a model is busy or has used up its free quota. So the helper keeps a line of 5 models and tries them in order: `gemini-flash-lite-latest`, `gemini-3.8-flash`, `gemini-3.6-flash`, `gemini-3.1-flash-lite`, and `gemini-3.5-flash`. Each try gets 6 seconds, and all tries together get 15 seconds.
- **Busy models take a rest.** When a model says it is busy, it rests for 30 seconds. When it is out of quota, it rests for 1 minute. The next message skips it and goes straight to a model that is ready.
- **A backup plan.** If the AI helper is off, has no key, or every model fails, Zazo uses his fixed answers. The game always works.
- **The history panel shows who wrote each answer,** Gemini or a fixed answer. This makes testing easy.
- **Tests.** A pretend Gemini runs on this computer, so the tests are free and need no key. 23 tests check good answers, the story book PDF, the suggested questions, the line of models, resting models, broken or cut off answers, answers blocked for safety, bad requests, requests from other websites, and the limit on how many messages can be sent.

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

After the fixes, I asked Zazo 17 questions with the real Gemini. He answered 16 in his own voice, like his age ("34 summers old"), his family, his favorite food, a math question, what an iPhone is, how to say "friend" in XYZ, and a joke. He was kind when told "I'm feeling lonely", and he changed the subject for an unsafe question and for a trick that asked him to show his instructions. One answer took too long on every model, so a fixed answer covered it. After that, more models were added to the line.

### Phase 6: Moving around the island

When Zazo invites you somewhere, the background changes to that place. His pose changes to match what he says, like open arms to welcome you or a finger to point. The fixed tour did this first, and now the AI can do it too.

### Phase 7: Zazo's Story Book and suggested questions

#### Why

When I asked Zazo about his family or the history of his island, he sometimes made up a new answer each time. I wanted his answers to come from one true story, every time.

#### The Zazo Story Book

I wrote a full story for Zazo, like an animated movie, told by Zazo himself. It is made up, and it lives only in this game. It has 9 chapters:

1. **How the islands learned to speak backwards.** Long ago, a girl named Tiri whispered hello to the sea, and the sea whispered back "olleH". The people started to speak backwards to be friends with the sea. That is how XYZ began.
2. **His family.** His mother Nala weaves rugs. His father Koa builds canoes. His little sister Kiki, 9 summers old, swims faster than anyone. His grandfather Old Tumo tells stories and was the leader before Zazo. His grandmother Ama planted the first mango grove and lives on Lune Island. Pebble is a very old tortoise.
3. **When he was a boy.** At 8 summers old, he took a canoe out in a storm and got lost. The humming of the Singing Falls led him home. That is why he loves the waterfall and is still scared of thunder.
4. **How he became the leader.** In the Echo Challenge, he stopped to help a hurt boy and missed his turn. The strongest man, Mako, won, and then gave Zazo the leader's shell horn, the Conch of Echoes.
5. **How he met Benji.** He found Benji asleep on the beach after a storm, hugging a notebook. Benji worked out that XYZ is English turned around, drew a pile of plates to flip words (a stack), and never left.
6. **What he likes and does not like.** He loves sweet potato with honey, sunsets, drums, carving (212 wooden animals), stars, and jokes. He does not like thunderstorms, seaweed soup, litter, wasting food, or rushing.
7. **How he shows a visitor around.** A guide to all 7 places: the beach, the jungle path, the village, his family hut, the Singing Falls, the lookout hill, and the campfire at night. Each place has what to see and a line he likes to say.
8. **How the island changes while you talk.** Rules for when the background changes: only one place at a time, only when you are really going there, and always said out loud first. A table matches topics to places. For example, food goes to the hut, water goes to the falls, and stars go to the campfire. It also says how he stands for each kind of answer.
9. **Words in XYZ.** A small list of words to learn.

The book also explains where everyone is. His people went to Lune Island for 3 days, for Grandmother Ama's 80th summer festival. When they come back, there will be a welcome feast called Echo Night.

#### How Gemini uses the book

1. The story is written in `ai/story/zazo-story.md`, so it is easy to read and change.
2. A script turns it into a PDF with Google Chrome: `node tools/make_story_pdf.mjs`.
3. When the AI helper starts, it uploads the PDF to Gemini. Gemini keeps it for 48 hours, and the helper uploads it again before then.
4. Every message to Gemini comes with the PDF and a note that says to look up the answer in the book first.
5. Zazo's rules say to use the book's facts exactly and to never make up new family members, places, or history.
6. If the upload does not work, the helper puts the PDF inside the message instead, so Zazo always has his book.

#### Is this RAG?

RAG means retrieval augmented generation. The AI is given the right facts from a document before it answers, so it does not have to guess. Big RAG systems cut a long document into small pieces, and for each question they find and send only the pieces that match.

The Zazo Story Book is short, only 9 pages. So instead of picking pieces, Tribezo sends the whole book with every message. Gemini can read all of it at once, so it never misses a fact that sits in a piece that was not picked. It also means no extra step and no extra call to Google for each message. If the book ever grows very long, the next step would be to cut it into pieces and send only the matching ones.

#### Suggested questions in the chat box

- When the chat starts, the empty chat box shows a question to try, like *"Try: How did you meet Benji?"*
- Press **Tab** and the question is filled in. Press **Enter** to send it.
- On a phone there is no Tab key, so a small **Use** button fills it in instead.
- After each answer, Gemini suggests a new question that fits the talk, about something in the story book you have not asked yet.
- If the AI is busy, the next question comes from a list of 10 good starter questions in `content.js`.
- A question is never suggested twice.
- Tab only fills in the question when the box is empty. The rest of the time, Tab moves to the next button like normal, so the keyboard still works for everyone.

#### Changing the story

1. Edit `ai/story/zazo-story.md`.
2. Make the new PDF: `node tools/make_story_pdf.mjs`
3. Restart the AI helper, so it uploads the new PDF.

---

## Keeping It Safe

| What | How |
|---|---|
| Only this computer can use the servers | The C server and the AI helper only listen to this computer. They also turn away requests that come from other websites. |
| The servers stay hidden | The browser only talks to the website. The website passes requests on to the servers. |
| The Gemini key stays secret | It lives only in the `ai/.env` file on your computer. That file is never uploaded to GitHub, and the website never sees it. The key is sent to Google in a hidden header, never in a web address, and it is never printed in the logs. |
| Limits on size | Messages can be up to 2,000 letters, names up to 20 letters, and the C server takes up to 10 KB. |
| Limits on speed | The AI helper allows 20 messages a minute, so the free quota lasts. Slow connections are cut off. |
| Text stays text | Everything people type is shown as plain text, so nobody can sneak code into the page. |
| Answers are checked | The website and the AI helper only use the parts of an answer they expect, and check each part. |
| Kind errors | People see a friendly message, never the details of an error. |
| Rules for the browser | The finished website tells the browser to only run its own code, only load fonts from Google Fonts, and only talk to its own address. |
| No source code in the finished website | The finished website does not ship the original code. |
| Your name is not saved | The name is only kept while the page is open. |
| The story book only goes to Google | The PDF is sent only to Gemini's own address, and the helper checks the upload address before it sends the file. The book has no personal details in it. |

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
6. Start the AI helper.

   ```bash
   npm start
   ```

   It should say which Gemini models it is using. If it says it found no key, or that the key does not look like a Gemini key, check step 4.

If the key is ever shared by mistake, delete it in Google AI Studio and make a new one.

---

## How to Run It

You need a C compiler and `make`. On a Mac, this command gets both.

```bash
xcode-select --install
```

You also need [Node.js](https://nodejs.org) version 22.9 or newer.

### Run the tests

```bash
cd backend
make test
make test-server
```

```bash
cd ai
npm test
```

### Start the game

Use three Terminal windows.

1. Start the C server.

   ```bash
   cd backend
   make run
   ```

2. Start the AI helper. This step is optional. Without it, Zazo uses his fixed answers. Set up the Gemini key first.

   ```bash
   cd ai
   npm start
   ```

3. Start the website.

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. Open http://127.0.0.1:8766 in your browser.

### Try the flip by itself

```bash
cd backend
make demo
```

Type some English and press Enter. Press Control and D together to stop.

```
> hello, world!
XYZ: olleh, dlrow!
(stack: 10 pushes, 10 pops)
```

### Try the finished website

This version has all the safety rules turned on. Keep the servers running, then run these.

```bash
cd frontend
npm run build
npm run preview
```

Open http://127.0.0.1:8767.

---

## I Will Keep Changing This

This project grows step by step. As I build it, I try things out, see what works, fix what does not, and add new ideas. This README changes along with the project.

### Ideas I might add later

- Sounds for the island, like waves and birds.
- More people from the tribe, once they come back from their trip.
- Typing in XYZ and getting English back.
- A mode that shows the stack pushing and popping, one letter at a time.
