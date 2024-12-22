# Talking to PlayTak

We have a semi-decent bot on our hands. Let's try to get it online!

We will put our bot on [PlayTak] which will require adhering to its
bespoke protocol, described it the [GitHub repository for the PlayTak server].
The protocol is somewhat annoying to work with, so we will ignore most of it
except for the bare essentials required to play a game.

The plan is this:
1. Establish connection to PlayTak.
2. Keep connection alive with periodic `PING`s in the background.
3. Login and create a seek.
4. Once in a game, send and receive moves from our bot.

## Connecting to PlayTak

We will talk to PlayTak using the [WebSocket] protocol with the help of the third-party library [`websockets`].
Install it with `pip`:

```sh
pip install websockets
```

We will handle all of PlayTak communication in a new file called `playtak.py`.
We start our implementation by opening a connection, receiving two messages to check that things are working,
and then quitting. Unfortunately, PlayTak is not a nicely behaved WebSocket server, so we have to explicitly
state the subprotocol and disable pings. All of that looks like this:

```py
import asyncio
from websockets.asyncio.client import connect, ClientConnection
from websockets import Subprotocol


async def talk_to_playtak():
    URI = "ws://playtak.com:9999/ws"
    subprotocols = [Subprotocol("binary")]
    async with connect(URI, subprotocols=subprotocols, ping_timeout=None) as ws:
        print(await ws.recv())  # Welcome!
        print(await ws.recv())  # Login or Register
        await ws.send("quit")


if __name__ == "__main__":
    asyncio.run(talk_to_playtak())
```

> Thanks to @the1Rogue on Discord for helping me out [here](https://discord.com/channels/176389490762448897/361023655465058307/1320016862578212925).

We will be using [`asyncio`] for asynchronous execution so that we can manually ping PlayTak while our bot is thinking.
Don't worry if you have never used `async-await` syntax. It will be isolated to code which deals with PlayTak communication,
and all of that you can just copy from the tutorial.

The code above opens a WebSocket connection to PlayTak with `connect()` and we name the connection `ws`.
To receive a message over the connection we use `ws.recv()` and to send messages we use `ws.send()`.
We use `await` if we want to wait for the result (i.e. waiting until we get a message, or until our message is fully sent).

## Keeping the connection alive

WebSocket supports sending pings (short round-trip heartbeat messages) natively, but unfortunately the PlayTak server doesn't deal with
them correctly. Instead, the PlayTak protocol requires us to text `PING` every half-minute, to which it replies with `OK`.
For simplicity we won't be trying to match up our requests to specific `OK` responses. We also won't be checking whether we received this `OK`.
This makes pinging periodically relatively easy:

```py
async def ping(ws: ClientConnection, stop_event: asyncio.Event):
    PERIOD_SECONDS = 30
    while not stop_event.is_set():
        await asyncio.sleep(PERIOD_SECONDS)
        await ws.send("PING")

async def talk_to_playtak():
    URI = "ws://playtak.com:9999/ws"
    subprotocols = [Subprotocol("binary")]
    async with connect(URI, subprotocols=subprotocols, ping_timeout=None) as ws:
        # Start background task.
        stop_event = asyncio.Event()
        ping_task = asyncio.create_task(ping(ws, stop_event))

        await asyncio.sleep(5)  # Pretend we are doing something.

        # Stop background task.
        stop_event.set()
        await ping_task

        await ws.send("quit")

if __name__ == "__main__":
    asyncio.run(talk_to_playtak())
```

We start a background task `ping` which will periodically send `PING` across the WebSocket connection.
It will stop only once we set the `stop_event`. We can reuse this pattern for any future long-running
background tasks. 

## Making seeks

The server won't cut our connection off; good. Let's login as a guest and make a seek.

```py
def seek(size: int, clock_seconds: int, increment_seconds: int) -> str:
    return f"Seek {size} {clock_seconds} {increment_seconds}"

async def talk_to_playtak():
    URI = "ws://playtak.com:9999/ws"
    subprotocols = [Subprotocol("binary")]
    async with connect(URI, subprotocols=subprotocols, ping_timeout=None) as ws:
        stop_event = asyncio.Event()
        ping_task = asyncio.create_task(ping(ws, stop_event))

        await ws.send("Login Guest")
        await ws.send(seek(6, 5 * 60, 5))  # Seek 6x6, 5 min + 5 sec

        await asyncio.sleep(5)  # Pretend we are doing something.

        stop_event.set()
        await ping_task
        await ws.send("quit")
```

Once someone accept the seek and the game starts, we will receive a `Game Start` message that looks like this:

```
Game Start 645331 6 Guest535 vs x57696c6c white 300 0 30 1 0 0
```

Where the pattern is this:
```
Game Start <GAME_ID> <SIZE> <WHITE_PLAYER> vs <BLACK_PLAYER> <MY_COLOR> <TIME_SECONDS> <HALF_KOMI> <FLATS> <CAPSTONES> <UNRATED> <TOURNAMENT>
```

Since we are the one who started the seek, all we care about is the game ID and our color.
We can wait until we get that message.

```py
from takpy import Color

def to_color(s: str) -> Color:
    match s:
        case "white":
            return Color.White
        case "black":
            return Color.Black
        case _:
            raise ValueError("invalid color")

async def wait_until_game_start(ws: ClientConnection) -> tuple[int, Color]:
    while True:
        msg = await ws.recv()
        assert isinstance(msg, bytes)  # subprotocol is "binary"
        match msg.decode().split():
            # Game Start 645331 6 Guest535 vs x57696c6c white 300 0 30 1 0 0
            case ["Game", "Start", game_id, _, _, "vs", _, color, *_]:
                return int(game_id), to_color(color)

async def talk_to_playtak():
    ...
    async with connect(URI, subprotocols=subprotocols, ping_timeout=None) as ws:
        ...
        
        await ws.send("Login Guest")
        await ws.send(seek(6, 5 * 60, 5))

        game_id, my_color = await wait_until_game_start(ws)
        print(game_id, my_color)
        
        ...
```

You can try running this code, joining your seek from the browser, and see that it abandons the game after a while
(It will abandon after the `ping` coroutine (fancy word for `async` function) finishes,
which might take some time because it could be in the middle of sleeping).

## Playing the game

Let's make the bot play the game! Unfortunately, PlayTak does not use PTN to send its moves.
Let's build two functions, one for converting from our `Move` to PlayTak notation,
and another to parse PlayTak notation into `Move`.

> PlayTak notation Summary:
>
> A square is always a capital letter for the column
> followed by a 1-indexed row number. No space.
>
> Examples of placements:
> ```
> P A1    # a1   place a flat on a1
> P B2 C  # Cb2  place a capstone on b2
> P C3 W  # Sc3  place a wall on c3
> ```
> The pattern is `P <SQUARE> <PIECE>`
>
> Examples of spreads:
> ```
> M A6 A4 2 1    # 3a6-21
> M B3 E3 1 2 1  # 4b3>121
> ```
> The pattern is `M <START> <END> <DROPS>`.

```py
def to_playtak_square(row: int, col: int) -> str:
    return "ABCDEFGH"[col] + str(row + 1)


def to_playtak_notation(move: Move) -> str:
    row, col = move.square
    start = to_playtak_square(row, col)
    match move.kind:
        case MoveKind.Place:
            piece = ""
            match move.piece:
                case Piece.Flat:
                    pass
                case Piece.Wall:
                    piece = " W"
                case Piece.Cap:
                    piece = " C"
            return f"P {start}{piece}"
        case MoveKind.Spread:
            drop_counts = move.drop_counts()
            assert drop_counts is not None
            end_row, end_col = row, col
            match move.direction:
                case Direction.Up:
                    end_row += len(drop_counts)
                case Direction.Down:
                    end_row -= len(drop_counts)
                case Direction.Left:
                    end_col -= len(drop_counts)
                case Direction.Right:
                    end_col += len(drop_counts)
            direction = move.direction
            end = to_playtak_square(end_row, end_col)
            drops = " ".join(str(x) for x in drop_counts)
            return f"M {start} {end} {drops}"
```

To convert to a `Move` from PlayTak notation I build an intermediate PTN,
since `takpy` only exposes that way to make `Move` (maybe I should change that).
With that, converting *from* PlayTak notation looks like this:

```py
def from_playtak_notation(s: str) -> Move:
    match s.split():
        case ["P", square, *maybe_piece]:
            piece = ""
            match maybe_piece:
                case ["W"]:
                    piece = "S"
                case ["C"]:
                    piece = "C"
            return Move(piece + square.lower())  # type: ignore
        case ["M", start, end, *drops]:
            direction = ""
            match ord(end[0]) - ord(start[0]), ord(end[1]) - ord(start[1]):
                case x, y if x > 0:
                    direction = ">"
                case x, y if x < 0:
                    direction = "<"
                case x, y if y > 0:
                    direction = "+"
                case x, y if y < 0:
                    direction = "-"
            return Move(f"{sum(int(x) for x in drops)}{start.lower()}{direction}{"".join(drops)}")  # type: ignore
        case _:
            raise ValueError(f"unrecognized move: {s}")
```

Feel free to implement the conversion your own way if you like.
The last step to actually receiving moves is filtering through the received messages
until it contains a move for our game, which looks like `Game#<GAME_ID> <PLAYTAK_NOTATION>`:

```py
async def wait_until_move(ws: ClientConnection, game_id: int) -> Move:
    while True:
        msg = await ws.recv()
        assert isinstance(msg, bytes)  # subprotocol is "binary"
        match msg.decode().strip().split(maxsplit=1):
            case [game, notation]:
                if game == f"Game#{game_id}" and notation.startswith(("P", "M")):
                    return from_playtak_notation(notation)
```

> We have to check that the notation starts with `P` or `M` because messages which inform us about time look identical.

Armed with these functions, we can make our bot play a game!

```py
async def talk_to_playtak():
    URI = "ws://playtak.com:9999/ws"
    subprotocols = [Subprotocol("binary")]
    async with connect(URI, subprotocols=subprotocols, ping_timeout=None) as ws:
        stop_event = asyncio.Event()
        ping_task = asyncio.create_task(ping(ws, stop_event))

        await ws.send("Login Guest")
        await ws.send(seek(6, 5 * 60, 5))
        print("Waiting for someone to join the seek...")

        game_id, my_color = await wait_until_game_start(ws)
        print(f"Game started! id: {game_id}, my_color: {my_color}")

        game = new_game(6)
        while game.result() == GameResult.Ongoing:
            if game.to_move == my_color:
                move = bot_move(game)
                await ws.send(f"Game#{game_id} {to_playtak_notation(move)}")
                print("bot played: {move}")
            else:
                move = await wait_until_move(ws, game_id)
                print("opp played: {move}")
            game.play(move)
        print(f"result: {game.result()}")

        stop_event.set()
        print("Waiting for all background tasks to finish...")
        await ping_task

        await ws.send("quit")
```

You can now play against your bot on PlayTak! Have fun!

There are many things you could add from here on out. Here are some of my suggestions:
- Make your bot seek with komi (try to see if you can figure out how to do that by reading the [GitHub repository for the PlayTak server]).
- Trash talk your opponent! (You can get their name from the start game message, and then use `Tell <PLAYER> <MESSAGE>` to directly message them).
- Make a new seek after the game ends, but also handle keyboards interrupts nicely (allow for graceful shutdown of background tasks).
- Give your bot a name by making a profile for them, and then message `@bcreature` on Discord to add them to the bot list.
- Make the seek configurable through command line arguments, or perhaps even through chat!
    (You can look for `Shout <PLAYER> <MESSAGE>` messages to read the Global chat.)
- Retrieve how much time your bot has left (this may be useful in the next chapter).

[PlayTak]: https://playtak.com/
[GitHub repository for the PlayTak server]: https://github.com/USTakAssociation/tak-server?tab=readme-ov-file#client-to-server-communication
[WebSocket]: https://en.wikipedia.org/wiki/WebSocket
[asyncio]: (https://docs.python.org/3/library/asyncio.html)
