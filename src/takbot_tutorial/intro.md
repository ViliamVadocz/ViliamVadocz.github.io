# Takbot Tutorial

Let's make an engine that plays Tak!

The tutorial is organized into bite-sized chapters that build on each other.
We will start by looking at an existing implementation of the game
and we will make a small command line interface to get familiar with it.
Then we build it to a hopefully-interesting bot that you can customize
and extend as you wish. At the end of this tutorial you should be able
to play with your very own bot on [playtak], and you should have the confidence
to improve it on your own.

## Prerequisites

You will need to know:
- fundamentals of the [Python] programming language
- rules of [Tak] (you can try it on [playtak])

[Python]: https://www.python.org/
[Tak]: https://ustak.org/play-beautiful-game-tak/
[playtak]: https://playtak.com/

## Python is a Plastic Fork

We will be using Python for this tutorial because it is a popular
programming langauge and easy to learn. Unfortunately, it can be quite slow,
so once perfomance becomes a problem, consider switching to faster language.

Many people in the Tak community made their bots in [Rust], so there
are plenty of examples as well as libraries to help you out in case
you choose to switch later.

[Rust]: https://www.rust-lang.org/

## Other Resources

The [Chess Programming Wiki](https://www.chessprogramming.org) is an excellent resource for creating engines that play board games (not just chess).
