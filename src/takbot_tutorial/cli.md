# Playing Tak Locally

Although it is not necessary to implement a command-line interface ([CLI]) to make
a Tak bot, it is a useful exercise to get practice with the [`takpy`] package
before we move only more complicated topics. Having a simple CLI will also make
it easy to play with our bot before we set up a connection to [PlayTak].

We will create a loop which prompts us to enter moves and have them take effect on a virtual board.
We will also build a way to visualize the board that is a little easier to look at than [TPS] strings.

## Move Loop

Before we do anything, make sure `takpy` is installed (See [Representing Tak](./takpy.md)).
Then, make a new Python file (name it `bot.py`), and open it in your favorite editor (I am using [VSCode]).

The CLI will consist of a simple loop where the user is presented with the current board state
and they enter a move as [PTN] to see it happen on the board. We need to initialize the game before we
can modify it, and we have already seen that we can use `new_game` for that:

```py
from takpy import new_game

game = new_game(6)
print(game)
```

Next we create a `while` loop that will only exit once the game is over.
We want to keep asking the user for moves, and that ends when there are no more moves to play.
To find the result of a game, we use `game.result()` which can be either `Ongoing`, `WhiteWin`, `BlackWin`, or `Draw`.

```py
from takpy import new_game, GameResult

game = new_game(6)

while game.result() == GameResult.Ongoing:
    print(game)
```

> Press <kbd>Ctrl</kbd> + <kbd>C</kbd> while the terminal is selected to interrupt and exit a program.

If you try to run the code above, you will quickly notice that the program is stuck in an infinite loop.
This is because we are not changing the game state in the loop, so the result will never change from
`GameResult.Ongoing`. Let's fix that by asking the user to give us a move and playing that.

```py
from takpy import new_game, GameResult, Move

game = new_game(6)

while game.result() == GameResult.Ongoing:
    print(game)
    user_input = input("enter move: ")
    move = Move(user_input)
    game.play(move)
```

Now we can actually play a game!

## Handling errors

If you try running the code above you might see something like this:

```py
x6/x6/x6/x6/x6/x6 1 1
enter move: a6
2,x5/x6/x6/x6/x6/x6 2 1
enter move: f1
2,x5/x6/x6/x6/x6/x5,1 1 2
enter move: e3
2,x5/x6/x6/x4,1,x/x6/x5,1 2 2
enter move: c4
2,x5/x6/x2,2,x3/x4,1,x/x6/x5,1 1 3
enter move: hello
Traceback (most recent call last):
  File "D:\Code\takbot-tutorial\part_1\bot.py", line 74, in <module>
    move = Move(user_input)
           ^^^^^^^^^^^^^^^^
ValueError: move prefix was not a valid piece or count
```

The program crashed when I put in an invalid move `hello`.
This is because `Move` will raise a `ValueError` when the move is not valid PTN.
We can handle this error with a `try-except` block.

```py
from takpy import new_game, GameResult, Move

game = new_game(6)

while game.result() == GameResult.Ongoing:
    print(game)
    user_input = input("enter move: ")
    try:
        move = Move(user_input)
    except ValueError as error:
        print(f"invalid PTN: {error}")
        continue
    game.play(move)
```

Now, when we enter an invalid PTN the execution will enter into the `except` block and print the reason for the error.
The `continue` statement afterwards will skip the rest of the code in the loop,
since we do not want to play a move when the move is invalid.

```py
x6/x6/x6/x6/x6/x6 1 1
enter move: a6
2,x5/x6/x6/x6/x6/x6 2 1
enter move: f1
2,x5/x6/x6/x6/x6/x5,1 1 2
enter move: e3
2,x5/x6/x6/x4,1,x/x6/x5,1 2 2
enter move: hello
invalid PTN: move prefix was not a valid piece or count
2,x5/x6/x6/x4,1,x/x6/x5,1 2 2
enter move: e3<
Traceback (most recent call last):
  File "D:\Code\takbot-tutorial\part_1\bot.py", line 79, in <module>
    game.play(move)
ValueError: cannot move a stack that you do not own
```

This time the program didn't crash when I put in `hello`, but when I entered a valid PTN move that was invalid in the current board state,
it did crash. This is because `game.play` will raise a `ValueError` when an impossible move is played. We can handle this similarly.

```py
from takpy import new_game, GameResult, Move

game = new_game(6)

while game.result() == GameResult.Ongoing:
    print(game)
    user_input = input("enter move: ")

    try:
        move = Move(user_input)
    except ValueError as error:
        print(f"invalid PTN: {error}")
        continue

    try:
        game.play(move)
    except ValueError as error:
        print(f"invalid move: {error}")
```

Great, the program is no longer crashing on invalid input!

```
x6/x6/x6/x6/x6/x6 1 1
enter move: a6
2,x5/x6/x6/x6/x6/x6 2 1
enter move: f1
2,x5/x6/x6/x6/x6/x5,1 1 2
enter move: e3
2,x5/x6/x6/x4,1,x/x6/x5,1 2 2
enter move: hello
invalid PTN: move prefix was not a valid piece or count
2,x5/x6/x6/x4,1,x/x6/x5,1 2 2
enter move: e3<
invalid move: cannot move a stack that you do not own
2,x5/x6/x6/x4,1,x/x6/x5,1 2 2
```

## Pretty Printing

Unless you can play Tak blind or are adept are reading TPS, you will quickly get lost in the position after a few moves.
Let's make a simple visualization function that prints the board as a grid. Let's name the function `pretty_print`.
It will take an instance of the game, which has a type `Game`. We can import this type from `takpy` and use it as a type hint
so that our editor can help us find the methods and properties we will need. Let's also import `Piece` and `Color` since
we will need them later.

```py
from takpy import new_game, GameResult, Move, Game, Piece, Color

def pretty_print(game: Game):
    ...

game = new_game(6)

while game.result() == GameResult.Ongoing:
    pretty_print(game)  # Switch out `print` with `pretty_print`.
    ...  # The rest of our code is the same as before.
```

To keep it simple, let's only print the top of each stack, so that we do not have to think about the 3D nature of Tak.
This does mean that the pretty print will be incomplete, so we should also print the TPS so that ambiguities can be resolved.
To print the top of each stack, we need to iterate over every square.

```py
def pretty_print(game: Game):
    print(game)  # Print the TPS.
    for row in game.board():
        for square in row:
            print(square)
```

This might seem right, but if you try to use it, you would see something like this (board position after `1. a6 f1`):

```py
2,x5/x6/x6/x6/x6/x5,1 1 2
None
None
None
None
None
(Piece.Flat, [Color.White])
None
None
None
None
None
None
None
None
None
None
None
None
None
None
None
None
None
None
None
None
None
None
None
None
(Piece.Flat, [Color.Black])
None
None
None
None
None
```

We need to print all the squares in row in one line, but `print` will automatically put a newline character `\n` after printing.
Luckily, we can specify that we want the ending to be a space instead by adding `end=" "`. We also want to split each row, so we should
add an empty print after the inner `for-loop`.

```py
def pretty_print(game: Game):
    print(game)  # Print the TPS.
    for row in game.board():
        for square in row:
            print(square, end=" ")
        print()  # Print a newline after each row.
```

This already looks much better:

```py
2,x5/x6/x6/x6/x6/x5,1 1 2
None None None None None (Piece.Flat, [Color.White])
None None None None None None
None None None None None None
None None None None None None
None None None None None None
(Piece.Flat, [Color.Black]) None None None None None
```

The keen-eyed readers might have noticed something is off. This should be the board after `1. a6 f1`, which means that there should be a black
flat in the top-left and a white flat in the bottom-right. What happened?

The rows are printed in the wrong order!
This is because we are printing top to bottom, but the first row is corresponds to the first rank, which should be at the bottom.
Let's reverse the order of the rows.

```py
def pretty_print(game: Game):
    print(game)  # Print the TPS.
    for row in reversed(game.board()):
        for square in row:
            print(square, end=" ")
        print()  # Print a newline after each row.
```

```py
2,x5/x6/x6/x6/x6/x5,1 1 2
(Piece.Flat, [Color.Black]) None None None None None
None None None None None None
None None None None None None
None None None None None None
None None None None None None
None None None None None (Piece.Flat, [Color.White])
```

Great! This is technically already playable, but let's make it actually *pretty* by using some symbols.
We will also limit to just one symbol per square so that the board stays aligned when more of the squares are filled out.

Let's use 🔳 for empty squares,
(🟧 and 🟦) for flats,
(🔶 and 🔷) for walls,
and (🟠 and 🔵) for capstones,
for (white and black) respectively.

```py
def pretty_print(game: Game):
    print(game)  # Print the TPS.
    for row in reversed(game.board()):
        for square in row:
            # If the square is empty, print the empty symbol.
            if square is None:
                print("🔳", end=" ")
                continue
            # Print a symbol for the top piece of each stack.
            piece, colors = square
            if colors[-1] == Color.White:
                if piece == Piece.Flat:
                    print("🟧", end=" ")
                elif piece == Piece.Wall:
                    print("🔶", end=" ")
                else:
                    print("🟠", end=" ")
            else:
                if piece == Piece.Flat:
                    print("🟦", end=" ")
                elif piece == Piece.Wall:
                    print("🔷", end=" ")
                else:
                    print("🔵", end=" ")
        print()  # Print a newline after each row.
```

```
2,x5/x6/x6/x6/x6/x5,1 1 2
🟦 🔳 🔳 🔳 🔳 🔳
🔳 🔳 🔳 🔳 🔳 🔳
🔳 🔳 🔳 🔳 🔳 🔳
🔳 🔳 🔳 🔳 🔳 🔳
🔳 🔳 🔳 🔳 🔳 🔳
🔳 🔳 🔳 🔳 🔳 🟧

2,x5/x3,1S,2,x/x2,12,2,x2/x2,1C,1,1,2/x,2,1,x3/1,x,1,2,x2 1 9
🟦 🔳 🔳 🔳 🔳 🔳
🔳 🔳 🔳 🔶 🟦 🔳
🔳 🔳 🟦 🟦 🔳 🔳
🔳 🔳 🟠 🟧 🟧 🟦
🔳 🟦 🟧 🔳 🔳 🔳
🟧 🔳 🟧 🟦 🔳 🔳
```

That looks much better!

I do have one more issue though. I would like to find out the name of a square without having to count.
I want to have the ranks and files displayed on the sides of the board. For the ranks we can `enumerate` the rows
starting at `1` before we reverse them. `enumerate` is not reversible though, so we will also have to convert to a `list`.
For the files, we can just print letters after we are done printing the board.

```py
def pretty_print(game: Game):
    print(game)  # Print the TPS.
    for rank, row in reversed(list(enumerate(game.board(), 1))):
        print(rank, end=" ")
        ... # Same as before.
    # Print the files.
    print("   a  b  c  d  e  f  g  h"[: 1 + game.size * 3])
```

```
2,x5/x6/x6/x6/x6/x5,1 1 2
6 🟦 🔳 🔳 🔳 🔳 🔳 
5 🔳 🔳 🔳 🔳 🔳 🔳
4 🔳 🔳 🔳 🔳 🔳 🔳
3 🔳 🔳 🔳 🔳 🔳 🔳
2 🔳 🔳 🔳 🔳 🔳 🔳
1 🔳 🔳 🔳 🔳 🔳 🟧
   a  b  c  d  e  f
```

> The letters for the files might appear misaligned on some browsers or in some terminals.
> Play around with the spacing if it doesn't look right for you. If you use different
> unicode symbols for your board you might also need different spacing.

I think that is plenty good for now. I encourage you to try your own version of pretty printing:
You can change the symbols, print sizes for each stack, or maybe even display the stacks somehow.
Have fun with it!

---

Before we leave `pretty_print` for good, I want to make one stylistic change to the code: I am a big fan of `match` statements and pattern matching;
it's probably my favorite language feature. I want to use it here instead of the nested if statements in the inner loop.
I didn't use it initially since Python only introduced `match` statements in version 3.10, and I do not expect everyone to have that version.

```py
def pretty_print(game: Game):
    # Print the TPS.
    print(game)
    # Print the board.
    for rank, row in reversed(list(enumerate(game.board(), 1))):
        print(rank, end=" ")
        for square in row:
            # If the square is empty, print the empty symbol.
            if square is None:
                print("🔳", end=" ")
                continue
            # Print a symbol for the top piece of each stack.
            piece, colors = square
            match colors[-1], piece:
                case Color.White, Piece.Flat:
                    print("🟧", end=" ")
                case Color.White, Piece.Wall:
                    print("🔶", end=" ")
                case Color.White, Piece.Cap:
                    print("🟠", end=" ")
                case Color.Black, Piece.Flat:
                    print("🟦", end=" ")
                case Color.Black, Piece.Wall:
                    print("🔷", end=" ")
                case Color.Black, Piece.Cap:
                    print("🔵", end=" ")
        # Print a newline after each row.
        print()
    # Print the files.
    print("   a  b  c  d  e  f  g  h"[: 1 + game.size * 3])
```

## Final Touches

Now that we can actually see what is going we can play a game all the way to the end without getting lost.
If you do that, you may notice that once you finish a game, the final position is not printed and neither is the winner.
Let's fix that.

```py
from takpy import new_game, GameResult, Move, Piece, Color, Game

def pretty_print(game: Game):
    ...

game = new_game(6)

while game.result == GameResult.Ongoing:
    ...

# Summary after the game.
pretty_print(game)
match game.result:
    case GameResult.WhiteWin:
        print("🟧 wins!")
    case GameResult.BlackWin:
        print("🟦 wins!")
    case GameResult.Draw:
        print("It's a draw!")
```

Alright. We have a working CLI to play Tak locally! We could end here, but let's do a tiny bit
of refactoring in preparation for the next few chapters. Let's move the loop and the final summary message
into a function that we call from an `if __name__ == "__main__":` block.
We should do this so that when we import functions from this module (such as `pretty_print`),
we want to avoid running the CLI. `__name__` is only equal to `"__main__"` when the current module
is the one that was launched by Python.

```py
from takpy import new_game, GameResult, Move, Piece, Color, Game

def pretty_print(game: Game):
    ...

def cli():
    game = new_game(6)

    while game.result == GameResult.Ongoing:
        ...

    # Summary after the game.
    pretty_print(game)
    match game.result:
        ...

if __name__ == "__main__":
    cli()
```

And that's it! You can try adding some more features on your own. Here are some suggestions:
- Specify the board size from the command line. (Make them parameters of `cli` and read the arguments from `sys.argv`)
- Allow undoing moves. (Keep track of the previous position (or even the whole history),
    and if a player writes `undo`, replace the current game with the previous one)
- Suggest a possible move if the user made a typo. (Compute [edit distance] for each possible move.)

You can find the final code for this chapter here: <https://github.com/ViliamVadocz/takbot-tutorial/blob/main/part_1/bot.py>

[CLI]: https://en.wikipedia.org/wiki/Command-line_interface
[edit-distance]: https://en.wikipedia.org/wiki/Edit_distance
[PlayTak]: https://playtak.com/
[PTN]: https://ustak.org/portable-tak-notation/
[takpy]: https://pypi.org/project/takpy/
[TPS]: https://ustak.org/tak-positional-system-tps/
[VSCode]: https://code.visualstudio.com/
