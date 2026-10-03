# How the Stack Works: the video script

The narration for `public/video/stack-explained.mp4`. Made by `tools/make_stack_video.py`.

## 0:00 How the Stack Works

- Hi everyone, come on in and grab a seat!
- Today's class is about the stack. It's small, it's simple, and it's everywhere.
- By the end, you'll see a stack at work inside a real game called Tribezo. Ready? Let's go!

## 0:13 First, a big word

- First, a big word. Data structure.
- A data structure is a way to keep data in order, so a computer can use it fast.
- There are many kinds. Arrays, linked lists, queues, trees, and today's star, the stack.
- A stack is a linear data structure. That means the items sit in a line, one after another.

## 0:33 What is a stack?

- So, what is a stack? Picture a pile of plates.
- You add a plate on the top. You take a plate off the top. Never from the middle.
- This rule is called last in, first out. L, I, F, O. Say it with me. LIFO!
- The last plate you put on is the first one you take off.

## 0:50 The four jobs of a stack

- A stack has just four jobs.
- Push puts a new item on the top. Pop takes the top item off.
- Peek looks at the top item, without taking it off.
- And is empty asks, is there anything left?
- Push and pop are super fast, because you only touch the top. We call that O of 1.

## 1:08 Stacks in data structures and algorithms

- Where do stacks show up in algorithms? Lots of places!
- When a function calls another function, the computer keeps a call stack. That's how recursion works.
- Stacks check that brackets match. Every open bracket needs its own close bracket.
- Calculators use stacks to work out math, like three plus four, times five.
- And when a program searches a maze, a stack helps it back up and try a new path. That's depth first search.

## 1:35 Stacks in apps you use every day

- You also use stacks every day.
- The undo button in your drawing app or your document. Your last change comes off first.
- The back button in your web browser, or on your phone, takes you to the last screen you saw.
- And redo? It puts the change you just undid right back on top.

## 1:52 Good sides and limits

- What's good about stacks? They're simple, fast, and need little extra memory.
- The limits? You can only reach the top. To find something in the middle, you take things off one by one.
- A full stack with a fixed size overflows. And popping an empty stack underflows.

## 2:08 Meet Zazo and Benji

- Now, let's visit Tribezo, an island far past the edge of every map.
- This is Zazo, the leader of the islands. He's loud, friendly, and loves visitors. But he only speaks Calonis, where every word comes out backwards.
- And this is Benji, his calm friend and translator. Benji speaks English and Calonis.
- His secret? A stack. Benji uses it to flip every word.

## 2:31 What happens when you talk

- Here's what happens when you talk to them.
- You type in English, like, how old are you? Benji pushes each word's letters onto his stack, then pops them off.
- Out comes Calonis! woH dlo era uoy? Benji says it to Zazo.
- Zazo answers in Calonis. His words went through the same stack.
- Then Benji flips them back, and tells you what Zazo said, in English.

## 2:55 Watch one word flip

- Let's slow it down and watch one word.
- Take the word hello. Push each letter. H, E, L, L, O.
- Now pop them off. Last in, first out.
- O, L, L, E, H. Hello just became olleh.

## 3:08 What does not flip

- The stack only flips letters.
- Commas, marks, and spaces stay right where they are.
- Money never flips. Twenty dollars stays twenty dollars.
- And your name stays just the way you typed it.

## 3:22 Benji's stack is real code

- Benji's stack is real code, written in C. It keeps letters in an array, and the top is the end of the array.
- When the array gets full, it grows to twice its size, so it never overflows.
- And the C code runs right in your browser, as WebAssembly.

## 3:38 See the stack at work

- Want to see the stack at work? Open the History panel.
- For, how old are you, the stack did twelve pushes and twelve pops. One push and one pop for every letter.

## 3:48 One stack, two directions

- So that's our class for today. One stack, two directions.
- Flip English once, and you get Calonis. Flip it again, and you're back to English.
- Now go say hello to Zazo. Or, as he'd say, olleH! See you next time.

Facts checked against GeeksforGeeks (Stack Data Structure, and Applications, Advantages and Disadvantages of Stack) and Programiz (Stack Data Structure).
