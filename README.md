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

1. **Each word is reversed.**
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

- **Tribe and translator characters.** Made with AI image tools.
- **Forest background.** Sets the scene in the woods.

---

## Project Status

**Just getting started.** Right now, this project is an idea and a plan. The code is coming soon.

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

Coming soon. I will add the steps once the code is ready.
