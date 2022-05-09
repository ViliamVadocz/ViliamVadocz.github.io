# Machine Learning Tak

The aim for this blog is to document the progress of my implementation of AlphaZero for Tak as it learns to play on a 6x6 board.
The bot, nicknamed Wilem, has already successfully learned to play on a 5x5 board, arguably becoming the strongest 5x5 tak playing entity.
Now it is facing a much greater challenge, since the action space and complexity of the game increases exponentially with each step up in board size.

The blog is divided into *lessons*. In each post I give commentary on some example games by the most recent model and try to tie it
together into some general principle or useful pattern. I also talk about technical challenges I faced or any significant changes I made to the training.

## What is AlphaZero?

It is an machine learning algorithm developed by DeepMind.
The engine is a modified version of Monte Carlo tree search (MCTS)
with early evaluations where both the policies for each move and the static board evaluation
is provided by a neural network. The network is trained on examples generated through self-play.
The engine is able to learn without any human information except for the rules of the game.

## What is Tak?

It is a abstract strategy board game played on a square grid.
The aim of the game is to create a road from any edge of the board to the opposite side by placing stones on empty squares.
Stones can also stack on top of each other and stacks of stones can spread.
[Read the complete rules here](https://ustak.org/play-beautiful-game-tak/).
