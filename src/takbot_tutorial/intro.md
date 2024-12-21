# Tak Bot Tutorial

Let's make an engine (AKA bot) that plays Tak!

The tutorial is organized into bite-sized chapters that build on each other:
1. Explore how we [Represent Tak](./takpy.md) inside our code.
2. Build a command-line interface to [Play Tak Locally](./cli.md).
3. Implement a simple heuristic agent using [Move Ordering](./move_ordering.md).
4. Add your bot to [PlayTak] in [Talking to PlayTak](./talking_to_playtak.md).
5. Make the engine smarter by thinking with [Tree Search](./tree_search.md).

## Prerequisites

You will need to know:
- Fundamentals of the [Python] programming language
- Rules of [Tak] (you can try it on [PlayTak] or [ptn-ninja])

## Python is a Plastic Fork

We will be using Python for this tutorial because it is a popular
programming language and easy to learn. Unfortunately, it can be quite slow,
so once performance becomes a problem, consider switching to faster language.

Many people in the Tak community made their bots in [Rust], so there
are plenty of examples as well as libraries to help you out in case
you choose to switch later.

## Other Resources

The [Chess Programming Wiki] is an excellent resource
for creating engines that play board games (not just chess).

[`takpy`]: https://pypi.org/project/takpy/
[Chess Programming Wiki]: https://www.chessprogramming.org
[PlayTak]: https://playtak.com/
[ptn-ninja]: https://ptn.ninja/
[Python]: https://www.python.org/
[Rust]: https://www.rust-lang.org/
[Tak]: https://ustak.org/play-beautiful-game-tak/
