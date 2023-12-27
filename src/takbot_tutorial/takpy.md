# Representing Tak

When implementing a bot for a board game, one would usually start by making an implementation of the game.
This is a fun challenge, but it is not a goal for this tutorial. For this reason, we will be using [`takpy`],
a library I prepared earlier which includes a complete implementation of Tak. `takpy` mainly includes a state
representation and the move generation. It does not include a graphical user interface
(we will eventually be using playtak for that).

> `takpy` is a Python wrapper for [`fast-tak`]. `fast-tak` is a Rust library that I wrote for my AlphaZero bot WilemBot.
> I am keen on improving the interface, so if you have any feedback, let me know on Discord!

In this section I'll describe how we represent a position in the game, 
what sort of types there are, and how to use the library to play a game of Tak.

[`takpy`]: https://pypi.org/project/takpy/
[`fast_tak`]: https://github.com/ViliamVadocz/fast-tak

## Installation

Assuming you have a recent version of Python 3 installed, you can install `takpy` using `pip`:

```bash
pip install takpy
```

Once that is done, start up your Python REPL and follow along with the examples:

```sh
> python
Python 3.12.0 (tags/v3.12.0:0fb18b0, Oct  2 2023, 13:03:39) [MSC v.1935 64 bit (AMD64)] on win32
Type "help", "copyright", "credits" or "license" for more information.
```

## Creating a New Game

To create a new game use `new_game`.

```py
>>> from takpy import new_game
>>> # Create a 5x5 game.
>>> new_game(5)
x5/x5/x5/x5/x5 1 1
>>> # Create a 6x6 game with 2 komi (4 half-komi).
>>> new_game(6, half_komi=4)
x6/x6/x6/x6/x6/x6 1 1
```

To make a game from [TPS] use `game_from_tps`.

```py
>>> from takpy import game_from_tps
>>> # Create a 4x4 game from TPS.
>>> game_from_tps(4, "12,1,1,1/2112,x3/1S,x3/2,x3 2 8")
12,1,1,1/2112,x3/1S,x3/2,x3 2 8
>>> # Create a 5x5 game from TPS with 2 komi.
>>> game_from_tps(5, "2,x4/x,1,x3/x2,1,x2/x3,2,x/x4,1 2 3", half_komi=4)
2,x4/x,1,x3/x2,1,x2/x3,2,x/x4,1 2 3
```

Using half-komi is admittedly a little confusing,
but it allows for fractional komi without needing to use floating point numbers.
A komi of `2.5` would be represented by `5` half-komi.

## The Board and Stacks

A Tak board is made up of NxN squares and each one can be home to a stack of limitless height
(technically there is a limit, determined by the number of reserves). We represent this as a nested list.
The outer list contains rows, which are lists of squares. A square is either empty (represented by `None`),
or it contains a stack. A stack has a top `Piece` and a list of colors for every piece in the stack from bottom to top.

An empty 5x5 board would look like this:

```py
>>> game = new_game(5)
>>> game
x5/x5/x5/x5/x5 1 1
>>> game.board
[
    [None, None, None, None, None],
    [None, None, None, None, None],
    [None, None, None, None, None],
    [None, None, None, None, None],
    [None, None, None, None, None]
]
```

If we play `a1`, we get this board:

```py
>>> from takpy import Move
>>> game.play(Move.from_ptn("a1"))   
>>> game
x5/x5/x5/x5/2,x4 2 1
>>> game.board
[
    [(Piece.Flat, [Color.Black]), None, None, None, None],
    [None, None, None, None, None],
    [None, None, None, None, None],
    [None, None, None, None, None],
    [None, None, None, None, None]
]
```

You can see from this example that `a1` is in the first row, the first element.
`a2` would be at in the second row, the first element:

```py
>>> game.play(Move.from_ptn("a2")) 
>>> game      
x5/x5/x5/1,x4/2,x4 1 2
>>> game.board
[
    [(Piece.Flat, [Color.Black]), None, None, None, None],
    [(Piece.Flat, [Color.White]), None, None, None, None],
    [None, None, None, None, None],
    [None, None, None, None, None],
    [None, None, None, None, None]
]
```

---

Let's take a closer look at how the squares are represented.
We will use the position shown in the image below.

![Position with stacks](https://tps.ptn.ninja/?tps=x4/x,2122,1122S,x/x,21S,21,x/x4%202%2012&bgAlpha=0&stackCounts=false&moveNumber=false&name=4x4%20-%20-1-.png&theme=discord)

```py
>>> from takpy import game_from_tps
>>> game = game_from_tps(4, "x4/x,2122,1122S,x/x,21S,21,x/x4 2 12")
>>> game
x4/x,2122,1122S,x/x,21S,21,x/x4 2 12
>>> game.board
[
    [None, None, None, None],
    [None, (Piece.Wall, [Color.Black, Color.White]), (Piece.Flat, [Color.Black, Color.White]), None],
    [None, (Piece.Flat, [Color.Black, Color.White, Color.Black, Color.Black]), (Piece.Wall, [Color.White, Color.White, Color.Black, Color.Black]), None],
    [None, None, None, None]
]
```

At `b2` we have a white wall on top of a black flat. This is represented by `(Piece.Wall, [Color.Black, Color.White])`.
Notice that the colors in the stack are stored bottom to top.

```py
>>> game.board[1][1]  # b2
(Piece.Wall, [Color.Black, Color.White])
```


Since they are stored bottom to top, to get the color of the top of the stack, you would access the color at `[-1]`.

```py
>>> piece, colors = game.board[1][1]
>>> colors[-1]  # getting the color at the top of the stack
Color.White
```

Here are all the other stacks:

```py
>>> game.board[1][2]  # c2
(Piece.Flat, [Color.Black, Color.White])
>>> game.board[2][1]  # b3
(Piece.Flat, [Color.Black, Color.White, Color.Black, Color.Black])
>>> game.board[2][2]  # c3
(Piece.Wall, [Color.White, Color.White, Color.Black, Color.Black])
```

## Making Moves

To make a move in the game, you first need to know which moves are possible.
You can use `.possible_moves` to get a list of moves that are possible in the current position.

```py
>>> game = new_game(6)
>>> game.possible_moves
[
    a1, a2, a3, a4, a5, a6,
    b1, b2, b3, b4, b5, b6,
    c1, c2, c3, c4, c5, c6,
    d1, d2, d3, d4, d5, d6,
    e1, e2, e3, e4, e5, e6,
    f1, f2, f3, f4, f5, f6
]
```

To make a move, use `.play(move)` with a valid move.

```py
>>> my_move = game.possible_moves[3]
>>> my_move
a4
>>> game.play(my_move)
>>> game
x6/x6/2,x5/x6/x6/x6 2 1
>>> game.board
[
    [None, None, None, None, None, None],
    [None, None, None, None, None, None],
    [None, None, None, None, None, None],
    [(Piece.Flat, [Color.Black]), None, None, None, None, None],
    [None, None, None, None, None, None],
    [None, None, None, None, None, None]
]
```

If you try playing an invalid move, you will get a `ValueError`.

```py
>>> game.play(my_move)  # trying to play a4 again
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
ValueError: cannot place a piece in that position because it is already occupied
```

You can also create move from [PTN]:

```py
>>> another_move = Move.from_ptn("a6")
>>> another_move
a6
>>> game.play(another_move)
>>> game
1,x5/x6/2,x5/x6/x6/x6 1 2
>>> game.board
[
    [None, None, None, None, None, None],
    [None, None, None, None, None, None],
    [None, None, None, None, None, None],
    [(Piece.Flat, [Color.Black]), None, None, None, None, None],
    [None, None, None, None, None, None],
    [(Piece.Flat, [Color.White]), None, None, None, None, None]
]
```

## Other Useful Features

It's often useful to create a copy of the current position so something can be simulated on the copy without affecting the original.
You can use `.clone()` for this:

```py
>>> clone = game.clone()
>>> clone.play(Move.from_ptn("Cb2"))
>>> clone
1,x5/x6/2,x5/x6/x,1C,x4/x6 2 2
>>> clone.board
[
    [None, None, None, None, None, None],
    [None, (Piece.Cap, [Color.White]), None, None, None, None],
    [None, None, None, None, None, None],
    [(Piece.Flat, [Color.Black]), None, None, None, None, None],
    [None, None, None, None, None, None],
    [(Piece.Flat, [Color.White]), None, None, None, None, None]
]
>>> game  # unaffected
1,x5/x6/2,x5/x6/x6/x6 1 2
>>> game.board
[
    [None, None, None, None, None, None],
    [None, None, None, None, None, None],
    [None, None, None, None, None, None],
    [(Piece.Flat, [Color.Black]), None, None, None, None, None],
    [None, None, None, None, None, None],
    [(Piece.Flat, [Color.White]), None, None, None, None, None]
]
```

The `Game` object also provides various other information,
such as whose turn it is (`.to_move`),
what the result of the game (`.result`) is,
or how many plies have been played (`.ply`).

```py
>>> game.to_move
Color.White
>>> game.result
GameResult.Ongoing
>>> game.ply
2
```

[REPL]: https://en.wikipedia.org/wiki/Read%E2%80%93eval%E2%80%93print_loop
[TPS]: https://ustak.org/tak-positional-system-tps/
[PTN]: https://ustak.org/portable-tak-notation/
