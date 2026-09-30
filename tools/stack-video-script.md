# How the Stack Works: the video script

The narration for `public/video/stack-explained.mp4`. Made by `tools/make_stack_video.py`.

## 0:00 How the Stack Works

- Hi, and welcome to Tribezo!
- In this video, you will learn what a stack is.
- You will see where stacks help us in real life.
- And you will see how Benji uses a stack to talk with Zazo.

## 0:11 What is a stack?

- A stack is a way to keep things in a pile.
- Think of a pile of plates.
- You can only put a new plate on the top.
- You can only take a plate off the top.
- You cannot pull a plate out of the middle.

## 0:24 Last In, First Out

- This rule has a name. Last in, first out.
- People call it LIFO for short.
- The last plate you put on is the first plate you take off.

## 0:33 The four jobs of a stack

- A stack has four small jobs.
- Push puts a new item on the top.
- Pop takes the top item off.
- Peek looks at the top item, but does not take it off.
- And is empty checks if the stack has nothing in it.

## 0:46 Always fast

- Push and pop are always fast.
- It does not matter if the stack holds five things or five million things.
- Computer people call this O of 1. It means the same short time, every time.

## 0:59 Stacks in real life

- Stacks are all around you.
- The undo button uses a stack. Your newest change comes off first.
- The back button in a web browser uses a stack of the pages you visited.
- When a program calls a function, the computer puts it on a call stack, and takes it off when the job is done.
- Stacks also check that every open bracket has a matching close bracket.

## 1:21 Why stacks are good

- Why do people like stacks?
- They are simple to build.
- Push and pop are very fast.
- And they use very little extra memory.

## 1:30 What stacks cannot do well

- Stacks have limits too.
- You can only reach the top. To find something in the middle, you must take things off one by one.
- If a stack has a fixed size and gets too full, that is called overflow.
- If you try to pop from an empty stack, that is called underflow.

## 1:47 The stack inside Tribezo

- Now let's see the stack inside Tribezo.
- It is written in the C language.
- It keeps letters in a list called an array. The top of the stack is the end of the list.
- When the list gets full, it grows to twice its size, so it never overflows.
- The same C code runs right in your web browser, as WebAssembly.

## 2:06 Flipping a word

- Here is how the stack flips a word.
- Take the word hello. Push each letter onto the stack. H, E, L, L, O.
- Now pop them off, one at a time. The last letter in comes out first.
- O, L, L, E, H. The word is flipped! Hello becomes olleh.

## 2:23 What does not flip

- The stack only flips letters.
- Commas, marks, and spaces stay in their spots.
- Numbers and money are never flipped, so twenty dollars stays twenty dollars.
- And your name stays just the way you typed it.

## 2:36 When you talk to Benji

- So what happens when you talk to Benji?
- You type in English. Benji pushes the letters of each word onto the stack, then pops them off.
- The words come out flipped. This is Calonis, Zazo's language.
- Where are you from, becomes, erehW era uoy morf.

## 2:53 When Zazo answers

- When Zazo answers, the same stack flips his words too.
- Zazo speaks in Calonis, and Benji tells you what he said in English.
- Open the History panel to see how many pushes and pops the stack did for each message.

## 3:07 One stack, two directions

- One stack, two directions.
- Flip English once, and you get Calonis. Flip it again, and you get English back.
- Now go and say hello to Zazo. Or, as he would say, olleH!

Facts checked against GeeksforGeeks (Stack Data Structure, and Applications, Advantages and Disadvantages of Stack) and Programiz (Stack Data Structure).
