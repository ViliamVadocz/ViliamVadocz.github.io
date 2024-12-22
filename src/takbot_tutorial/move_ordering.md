# Move Ordering

We are finally ready to start making our bot!
We'll start with something that is perhaps a bit unconventional: [move ordering].

The usual way to introduce bot-making for board games (if one can even say there is a usual way)
is to start with some kind of tree-search such as [Minimax] and then work through to [Negamax],
[Alpha-Beta pruning], and eventually add [Move Ordering] to improve performance.
In this tutorial we start with Move Ordering because I think it's a bit easier to grasp
for someone who has never heard of [graphs] and [trees] in the context of games.
As a bonus we'll get an IntuitionBot-style engine out of it which is easy to change.

The basic idea of Move Ordering is to rank moves from best to worst according to some [heuristic].
In the short term, our bot will just take the top move. Then we take a peek at planning
by adding 1 move look-ahead so that our bot doesn't blunder losses in 1. Sounds like a plan?

## Random Bot

Let's modify our code from the previous chapter to alternate between a player and a bot move.
We'll create two new functions `player_move` and `bot_move` that both receive a game state and 
play a move. Then, we modify the the `cli` function to check whether it's the player's or bot's
turn to move. We'll keep the player color in a new variable called `player_color`.

```py
def player_move(game: Game):
    ...

def bot_move(game: Game):
    ...

def cli():
    player_color = Color.White
    game = new_game(6)

    while game.result() == GameResult.Ongoing:
        pretty_print(game)
        if game.to_move == player_color:
            player_move(game)
        else:
            bot_move(game)

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

Inside `player_move` we want to keep asking the user for input until they enter a valid move
(both in terms of PTN and validity in the board state). We will do this by using a `while True`
loop and breaking only once we succeed in playing a move.

```py
def player_move(game: Game) -> Move:
    while True:
        user_input = input("enter move: ")
        try:
            move = Move(user_input)
        except ValueError as error:
            print(f"invalid PTN: {error}")
            continue
        try:
            game.play(move)
            break  # valid move was entered and played
        except ValueError as error:
            print(f"invalid move: {error}")
```

To test whether we have completed this transformation without introducing any bugs,
let's just make `bot_move` play a random valid move.
We can get a list of valid moves using `game.possible_moves()`, and then for picking a random
value out of a list we can use `random.choice` (once we import it).

```py
import random  # Put this at the top of the file.

def bot_move(game: Game):
    random_move = random.choice(game.possible_moves())
    game.play(random_move)
    print(f"the bot played {random_move}")
```

If you followed along, you can now play against a random bot!

## A Little Cleanup

A random bot is not very interesting, so let's add to it. We will be adding a lot, so in preparation
for that let's move everything except `bot_move` to it's own file called `cli.py`

Then, to make things work again, we need to import `bot_move` from `bot.py` like this (put it at the top of `cli.py`):

```py
from bot import bot_move
```

> Make sure to add missing imports to `bot.py`, and remove any unnecessary ones in `cli.py` (such as `import random`).

Try running `python cli.py` now. You should be able to play against your random bot again.

## Ranking Moves

In this tutorial we will implement move ordering by giving each move a score.
The moves with the highest score will be ranked first.
Let's implement this by adding a new function `move_score` which gets a Move, and returns an number.

```py
def move_score(move: Move) -> float:
    return 0
```

Then, in `bot_move`, we can pick the move that scores highest according to this function.
We do this with `max`, and by specifying our `move_score` function as the `key`.
This will run our function for each move, and return the one that gives the highest output. 

```py
def bot_move(game: Game):
    possible_moves = game.possible_moves()
    best_move = max(possible_moves, key=move_score)
    game.play(best_move)
    print(f"the bot played {best_move}")
```

Often the best move depends on the board state, so it would be useful to have access to that
in the scoring function (currently we only have access to the move). We might also compute
some statistics later, and we would want to reuse them for each move. The easiest way to do
that right now is to just define `move_score` *inside* `bot_move`, so that it has access to
all our local variables such as the `game`.

```py
def bot_move(game: Game):
    def move_score(move: Move) -> float:
        return 0

    possible_moves = game.possible_moves()
    best_move = max(possible_moves, key=move_score)
    game.play(best_move)
    print(f"the bot played {best_move}")
```

## Heuristics

And now comes the fun part. What makes one move better than another?
Why is some move good in one situation, but then the same move is bad in another?
If you know the answers to those questions, you've just solved Tak!
I don't, so instead I will have to come up with some guesses based on my experience.

### Placements over Spreads

To make any sort of threat, one needs to make placements. Maybe we can start by valuing
placements above spreads. 

```py
# You need to import `MoveKind` as well.
from takpy import GameResult, Move, Piece, Color, Game, MoveKind

def bot_move(game: Game):
    def move_score(move: Move) -> float:
        match move.kind:
            case MoveKind.Place:
                return 100
            case MoveKind.Spread:
                return 0

    ... # Same as before.
```

Now, all placements will get a score of `100`, while all spreads get a score of `0`.
This essentially means the bot will never spread, because any placement will have higher score.
The placement location and piece type will depend on what order the moves are generated in.

It's better than nothing, but we can do much better.

We'll need to combine multiple different heuristics, so let's keep a `score` variable which we will add to.
Let's also name our constants so that we don't end up with a bunch of [magic numbers].

```py
PLACEMENT = 100
SPREAD = 0

def bot_move(game: Game):
    def move_score(move: Move) -> float:
        score = 0
        match move.kind:
            case MoveKind.Place:
                score += PLACEMENT
            case MoveKind.Spread:
                score += SPREAD
        return score

    ...
```

### Flats > Capstones > Walls

Let's prioritize placing flats over capstones, and capstones over walls:

```py
PLACEMENT = 100
SPREAD = 0
FLAT = 100
CAP = 50
WALL = 0

def bot_move(game: Game):
    def move_score(move: Move) -> float:
        score = 0
        match move.kind:
            case MoveKind.Place:
                score += PLACEMENT
            case MoveKind.Spread:
                score += SPREAD
        match move.piece:
            case Piece.Flat:
                score += FLAT
            case Piece.Cap:
                score += CAP
            case Piece.Wall:
                score += WALL
        return score

    ...
```

> Note that `move.piece` will return `None` if the move was a spread.

### Making Roads

We should also think about *where* it's good to place.
To win, the bot should make road threats, and thus we might want to prioritize
squares which continue our existing roads. Calculating which square benefits
most roads is hard, but a decent heuristic is prioritizing squares
that are in the same row or column as existing road pieces.

A road piece is either a flat or capstone. We will check for this often,
so let's make it a function `road_piece`.

```py
def road_piece(piece: Piece | None) -> bool:
    return piece == Piece.Flat or piece == Piece.Cap
```

> The input type is `Piece | None` because we will generally use it
> in combination with `move.piece` which could be `None` if the move
> is a spread.

For the heuristic mentioned above, let's try counting how many
road pieces are in the same row or column as some given square.
For example, for the position below, I have looked at each empty square,
and counted how many road pieces are in the same row or column (as white).

![An opening position where each empty square has a number counting how many road pieces are in the same row or column as that square](images/row_column_score.png)

For this example, `f5` and `f1` would score highly, which is what we want since those placements build towards a road.

The row and column information doesn't change between the different moves that
we are scoring, so we can just calculate it once in the outer function `bot_move`.
To keep our code modular, let's split the implementation into multiple functions
that we can reuse for other heuristics.

```py
from collections.abc import Iterable

# Helper types
Stack = tuple[Piece, list[Color]]
Board = list[list[None | Stack]]

def count_road_pieces(stacks: Iterable[None | Stack], color: Color) -> int:
    """Count how many stacks have a road piece with our color on top."""
    only_stacks = (stack for stack in stacks if stack is not None)
    return sum(
        road_piece(piece) for piece, colors in only_stacks if colors[-1] == color
    )


def columns(board: Board) -> Board:
    """Get the columns of a board."""
    return [[row[i] for row in board] for i in range(len(board[0]))]


def row_score(board: Board, color: Color) -> list[int]:
    """Count the road pieces per row."""
    return [count_road_pieces(row, color) for row in board]


def col_score(board: Board, color: Color) -> list[int]:
    """Count the road pieces per column."""
    return [count_road_pieces(col, color) for col in columns(board)]
```

> This might be a little overwhelming at first, especially since I
> used [list comprehensions] and [generator expressions] which you
> might not be familiar with. A good exercise is to try implementing
> it yourself in your own way, or to try modifying it to see what
> happens.

Now we can precalculate the row and column scores, and look them up when ranking placements.

```py
...
ROW_COLUMN_ROAD = 10


def bot_move(game: Game):
    board = game.board()
    # Precompute row and column scores.
    my_row_score = row_score(board, game.to_move)
    my_col_score = col_score(board, game.to_move)

    def move_score(move: Move) -> float:
        score = 0
        row, column = move.square
        match move.kind: ...
        match move.piece: ...
        if road_piece(move.piece):
            score += ROW_COLUMN_ROAD * (my_row_score[row] + my_col_score[column])
        return score

    ...
```

With that implemented, the bot now tries to build a road, although it doesn't take into account when it has been blocked.
Maybe we can encourage placing the capstone next to opponent stacks so that the bot has the opportunity to capture onto them
for a road in the future.

### Capstone Next to Stacks

For this, we will need to find out the neighboring stacks to any given square. We have to be careful about not accessing positions
which do not exist on the board, but once that is taken care of, it's not difficult. We can make it a function for convenience.

```py
def neighbor_stacks(board: Board, size: int, row: int, col: int) -> list[Stack]:
    """Get the neighboring stacks to a square."""
    neighbors = []
    if row < size - 1:
        neighbors.append(board[row + 1][col])
    if row >= 1:
        neighbors.append(board[row - 1][col])
    if col < size - 1:
        neighbors.append(board[row][col + 1])
    if col >= 1:
        neighbors.append(board[row][col - 1])
    return [n for n in neighbors if n is not None]
```

Then we can look at the neighboring stacks when placing a capstone and add a bonus for each opponent stack,
multiplied by height to encourage attacking tall stacks.

```py
...
CAP_NEXT_TO_OPPONENT_STACK = 50


def move_ordering(game: Game) -> list[Move]:
    board = game.board()
    my_color = game.to_move
    opp_color = game.to_move.next()
    # Precompute row and column scores.
    my_row_score = row_score(board, my_color)
    my_col_score = col_score(board, my_color)

    def move_score(move: Move) -> float:
        score = 0
        row, column = move.square
        neighbors = neighbor_stacks(board, game.size, row, column)
        match move.kind: ...
        match move.piece:
            case Piece.Flat:
                score += FLAT
            case Piece.Cap:
                score += CAP
                for _piece, colors in neighbors:
                    if colors[-1] == opp_color:
                        score += CAP_NEXT_TO_OPPONENT_STACK * len(colors)
            case Piece.Wall:
                score += WALL
        if road_piece(move.piece): ...
        return score

    ...
```

### Central Placements

Let's also add a bonus for placing near the center to help the bot pivot once it cannot make a threat in once direction.

For this we can calculate the distance from the center. We will use [Manhattan distance] because Tak is played on grid
and road connections are orthogonal. It's more natural to work with.

```py
def distance_from_center(row: int, col: int, size: int) -> float:
    mid = (size - 1) / 2
    return abs(row - mid) + abs(col - mid)
```

Then we use this function to get the distance, and subtract it from the score when placing.

```py
...
CENTER_PLACEMENT = 10


def move_ordering(game: Game) -> list[Move]:
    ...

    def move_score(move: Move) -> float:
        score = 0
        row, column = move.square
        neighbors = neighbor_stacks(board, game.size, row, column)
        distance = distance_from_center(row, column, game.size)
        match move.kind:
            case MoveKind.Place:
                score += PLACEMENT
                # We subtract the distance from the center
                score -= CENTER_PLACEMENT * distance
            case MoveKind.Spread:
                score += SPREAD
        match move.piece: ...
        if road_piece(move.piece): 
            score += ROW_COLUMN_ROAD * (my_row_score[row] + my_col_score[column])
        return score

    ...
```

## Opening Swap

If you try playing the bot now, you'll see something strange. It places your first piece in the center.
The bot does not consider that for the first two [plies], players play the opponents piece.
There are several ways to address this (you could even hardcode an opening), but maybe easiest
is just to pick the lowest scoring move for the first two plies. This corresponds to using `min`
when `game.ply < 2`

```py
def bot_move(game: Game):
    ...
    if game.ply < 2:
        best_move = min(possible_moves, key=move_score)
    else:
        best_move = max(possible_moves, key=move_score)
```

## One-move Lookahead

The bot plays... well, still very badly.
It's better than random, but it has a lot of room for improvement.
Let's move on from heuristics though, because we can also improve the bot in other ways.

I think the best thing we can do for our bot right now would be adding search.
I want to leave that for the next chapters, so instead I suggest we limit ourselves to a single move
lookahead. That means taking winning moves when we have them, and to prevent roads in 1 (when possible).

The idea is to use the score to order the moves from best to worst, and to try them
on a "virtual" board to see if it wins. If yes, we can just play it.
We can likewise check the opponent's moves before playing our prospective move to
see whether they can win. If yes, we should avoid playing that move.  move.

Whether it's for us or for the opponent, we want to know if the current player can win.
Let's implement a function to check that and give us the winning move.

```py
def winning_move(game: Game, moves: list[Move]) -> Move | None:
    for move in moves:
        after_move = game.clone_and_play(move)
        if after_move.result.color() == game.to_move:
            return move
    return None
```

Notice that the order of the moves we pass in matters. If the move ordering gives us
likely winning moves early, then we do not have to simulate as many moves.
This idea of searching promising moves first will come up again when implementing
Alpha-Beta search in the next few chapters.

Since we care about more than just the best move now, we will sort the moves instead of just
taking the maximum or minimum scoring one.

Now we can use that function in `bot_move` to take immediate wins.

```py
def bot_move(game: Game):
    ...
    def move_score(move: Move):
        ...

    possible_moves = game.possible_moves()
    sorted_moves = sorted(possible_moves, key=move_score, reverse=game.ply >= 2)
    best_move = sorted_moves[0]

    possibly_winning = winning_move(game, sorted_moves)
    if possibly_winning is not None:
        # Take immediate wins.
        best_move = possibly_winning

    game.play(best_move)
    print(f"the bot played {best_move}")
```

> `sorted` is similar to `min` and `max` in that it takes a `key` function.
> It would normally order the moves from smallest score to highest,
> so we reverse the order when the is out of the opening swap.

Before we add avoidance for losses in 1, let's so some minor refactoring because this `bot_move`
function has grown quite large. Let's make a function `move_ordering` which takes a list
of moves and returns it in order. We will transplant most of `bot_move` into it.

```py
def move_ordering(game: Game) -> list[Move]:
    board = game.board()
    my_color = game.to_move
    opp_color = game.to_move.next()
    # Precompute row and column scores.
    my_row_score = row_score(board, game.to_move)
    my_col_score = col_score(board, game.to_move)

    def move_score(move: Move) -> float:
        ...
 
    possible_moves = game.possible_moves()
    return sorted(possible_moves, key=move_score, reverse=game.ply >= 2)

def bot_move(game: Game):
    sorted_moves = move_ordering(game)
    best_move = sorted_moves[0]

    possibly_winning = winning_move(game, sorted_moves)
    if possibly_winning is not None:
        # Take immediate wins.
        best_move = possibly_winning

    game.play(best_move)
    print(f"the bot played {best_move}")
```

Then we can decompose `move_score` into more helper functions to make it a bit easier on the eyes:

```py
def move_kind_bonus(kind: MoveKind, distance: float) -> float:
    match kind:
        case MoveKind.Place:
            return PLACEMENT - CENTER_PLACEMENT * distance
        case MoveKind.Spread:
            return SPREAD


def piece_type_bonus(
    piece: Piece | None, opp_color: Color, neighbors: list[Stack]
) -> float:
    match piece:
        case Piece.Flat:
            return FLAT
        case Piece.Cap:
            score = CAP
            for _piece, colors in neighbors:
                if colors[-1] == opp_color:
                    score += CAP_NEXT_TO_OPPONENT_STACK * len(colors)
            return score
        case Piece.Wall:
            return WALL
        case None:
            return 0


def move_ordering(game: Game) -> list[Move]:
    board = game.board()
    my_color, opp_color = game.to_move, game.to_move.next()
    # Precompute row and column scores.
    my_row_score = row_score(board, game.to_move)
    my_col_score = col_score(board, game.to_move)

    def move_score(move: Move) -> float:
        score = 0
        row, column = move.square
        distance = distance_from_center(row, column, game.size)
        neighbors = neighbor_stacks(board, game.size, row, column)
        score += move_kind_bonus(move.kind, distance)
        score += piece_type_bonus(move.piece, opp_color, neighbors)
        if road_piece(move.piece):
            score += ROW_COLUMN_ROAD * (my_row_score[row] + my_col_score[column])
        return score

    possible_moves = game.possible_moves()
    return sorted(possible_moves, key=move_score, reverse=game.ply >= 2)
```

Alright, that should do.

Avoiding a road in 1 is a bit more complicated than picking a winning move, but not by much.
The basic idea is that we try each move, and then if the game is not lost already,
we check if the opponent has a winning move. If they don't we can play this move and
we break out of the loop.

```py
def bot_move(game: Game):
    sorted_moves = move_ordering(game)
    best_move = sorted_moves[0]

    possibly_winning = winning_move(game, sorted_moves)
    if possibly_winning is not None:
        # Take immediate wins.
        best_move = possibly_winning
    else:
        # Look for the first non-losing move.
        for my_move in sorted_moves:
            after_my_move = game.clone_and_play(my_move)
            if after_my_move.result().color() == after_my_move.to_move:
                continue  # I made a road for the opponent accidentally.
            if winning_move(after_my_move, move_ordering(after_my_move)) is None:
                best_move = my_move
                break

    game.play(best_move)
    print(f"the bot played {best_move}")
```

Try playing the bot now. It plays much better!

It can still fall into Tinue easily, but I'll leave that as an exercise for the reader.

---

Some things you can try implementing:
- Blocking enemy roads (maybe using `row_score` and `col_score`)
- Discourage flat-on-flat captures (Check whether the top piece of the spreading stack is a flat)
- Encourage placing walls near stacks with captives
- Avoid making negative flat-count-difference ([FCD]) moves (Compute the FCD of spreads)
- Reward strong shapes (citadels, staircases)

Some ideas to think about before the next chapter:
- When an opponent has a Tak threat, we need to prevent it.
That means that for every move we want to play, we have to check that same move,
and if is doesn't stop it, we can immediately reject our candidate move.
If we are able to identify these "killer" moves, checking for them first would improve performance.
Can you think of how we could implement that?
- The bot is currently searching 2 plies ahead. That means we consider our current move, and our opponents response.
How could you look 3 plies ahead? 4 plies? arbitrary `N` plies?
- Do we really have to look at all moves? Are there some moves which are so bad that we should not even consider them?
Could you figure out a way to identify such moves?
- You have some ideas about how to recognize good moves. What about good board positions? What makes one Tak position
better than another? Are there any ideas you can re-use from move ordering?

You can find the final code for this chapter here: <https://github.com/ViliamVadocz/takbot-tutorial/tree/main/part_2>

[Alpha-Beta pruning]: https://en.wikipedia.org/wiki/Alpha%E2%80%93beta_pruning
[FCD]: https://youtu.be/SHk5EBJpWOg
[generator expressions]: https://docs.python.org/3.13/tutorial/classes.html#generator-expressions
[graphs]: https://en.wikipedia.org/wiki/Graph
[heuristic]: https://en.wikipedia.org/wiki/Heuristic_(computer_science)
[list comprehensions]: https://docs.python.org/3.13/tutorial/datastructures.html#list-comprehensions
[magic numbers]: https://en.wikipedia.org/wiki/Magic_number_(programming)
[Manhattan distance]: https://en.wikipedia.org/wiki/Taxicab_geometry
[Minimax]: https://en.wikipedia.org/wiki/Minimax
[move ordering]: https://www.chessprogramming.org/Move_Ordering
[move ordering]: https://www.chessprogramming.org/Move_Ordering
[Negamax]: https://en.wikipedia.org/wiki/Negamax
[plies]: https://en.wikipedia.org/wiki/Ply_(game_theory)
[tree]: https://en.wikipedia.org/wiki/Tree_(abstract_data_type)