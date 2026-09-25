# Tribezo

**Talk to a friendly forest tribe that speaks backwards!**

Tribezo is a fun little website. You type words in English. A helper turns your words around. Then a tribe in the forest talks back to you in their own language.

Their language is called **XYZ**. XYZ is just English, but every word is flipped backwards.

---

## How I Got This Idea

I was sitting in class one day. My teacher was talking, and I was thinking about my DSA project. I needed an idea.

I kept thinking about the **stack**. A stack is a way to keep things in order. I knew a stack can flip a word backwards. But flipping words felt a little boring by itself.

Then I remembered something. In some movies, there are tribes who talk backwards. Their words sound funny and strange, but they still make sense if you flip them around.

And then it clicked. 💡

*What if I made a forest tribe that only speaks backwards?*
*What if a stack was the thing that helps you talk to them?*

That is how Tribezo was born. I got the idea right there in class.

---

## What Is This Project About?

Tribezo is a game-like website where you meet two people in a forest:

1. **The Tribe Member.** They live in the forest. They are very kind and very friendly. But they do not know English. They only speak XYZ, which is backwards English.
2. **The Translator.** He wears modern clothes, just like you and me. He knows English *and* XYZ. He helps you talk to the tribe.

You talk to the translator in English. He flips your words and passes them to the tribe. The tribe hears you and talks back to you.

---

## Why I Am Building It

- **To learn.** This is my DSA project (DSA means Data Structures and Algorithms). I want to really understand how a **stack** works.
- **To make learning fun.** Flipping words is a simple idea. A forest, a tribe, and a translator make it way more fun to see.
- **To build a full project.** I want to build both parts of a real app: the part you see (frontend) and the part that does the work (backend).

---

## What Is a Stack?

Think of a stack of plates.

- You put a plate **on top**. This is called a **push**.
- You take a plate **off the top**. This is called a **pop**.

The last plate you put on is the first plate you take off. People call this **LIFO**, which means **Last In, First Out**.

### How a stack flips a word

Let's flip the word `hello`.

1. Push each letter onto the stack: `h`, then `e`, then `l`, then `l`, then `o`.
2. Now the stack looks like this. The top is `o`.

   ```
   | o |  <- top
   | l |
   | l |
   | e |
   | h |
   -----
   ```

3. Pop the letters off, one at a time: `o`, `l`, `l`, `e`, `h`.
4. Put them together and you get `olleh`. 🎉

---

## How XYZ Language Works

These are the rules for turning English into XYZ:

1. **Each word gets flipped backwards.**
2. **The words stay in the same order.**
3. **Punctuation stays in the same place.** Commas, periods, and marks like `!` and `?` do not move.

### Examples

| English | XYZ |
|---|---|
| `hello` | `olleh` |
| `hello world` | `olleh dlrow` |
| `hello, world!` | `olleh, dlrow!` |
| `you are kind.` | `uoy era dnik.` |
| `how are you?` | `woh era uoy?` |

---

## How It Works (The User Flow)

Here is what happens when you use Tribezo, step by step.

1. **You open the website.**
   You see a big, green forest. The tribe member is standing there. The translator is standing next to them.

2. **The translator says hello.**
   He tells you something like this:

   > "Hi there! Meet the tribe. They are super friendly, kind, and welcoming. But they don't know your language. They speak XYZ, which is English backwards. Don't worry! You can talk to me in English. I will flip your words and tell them. Then they will talk back to you."

3. **You type something.**
   You type a word, a sentence, or even a whole paragraph in the box.

4. **You press send.**
   Your words go to the **backend**. The backend is written in C. It uses a stack to flip every word.

5. **The translator passes it on.**
   The flipped words come back to the website. The translator "tells" the tribe what you said.

6. **The tribe talks back.**
   The tribe member moves and speaks your words in XYZ. You can see what they said on the screen.

7. **Talk again!**
   You can keep typing and keep talking to the tribe as long as you want.

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
        |  uses a stack to flip each word
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
| **React 19** | Builds the pieces of the page, like the chat box and the characters. |
| **Vite** | Runs the website on my computer while I build it, and packs it up when it is done. |
| **React Router** | Lets the website have different pages. |
| **Tailwind CSS** | Makes things look nice with colors, sizes, and spacing. |
| **Framer Motion** | Makes the characters move and come alive. |
| **Lenis** | Makes scrolling feel smooth. |
| **Lucide React** | Gives me small, clean icons. |

### Backend (the part that does the work)

| Tool | What it does |
|---|---|
| **C** | The main language for the backend. |
| **Stack** | The data structure that flips each word. |
| **HTTP server in C** | Lets the website send words to the C program and get the flipped words back. |

### Art

- **Tribe and translator characters.** I make these with AI image tools.
- **Forest background.** This sets the scene so it feels like you are really in the woods.

---

## Project Status

🌱 **Just getting started.**

Right now, this project is only an idea and a plan. The code is coming soon.

---

## I Will Keep Changing This

This project is going to grow step by step. I will **keep iterating** as I build it. That means I will:

- Try things out.
- See what works and what does not.
- Fix things and make them better.
- Add new ideas as I think of them.

So this README will change too. Some parts might look different later, and that is okay. That is how building things works!

### Ideas I might add later

- Sounds for the forest and for the tribe talking.
- More tribe members.
- A way to type in XYZ and get English back.
- A mode that shows the stack pushing and popping, letter by letter, so you can watch it work.

---

## How to Run It

Coming soon! I will add the steps here once the code is ready.

---

Made with curiosity in class. 🌳
