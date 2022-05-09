---
title: Flats are Good
---

Wilem has been training for over a week now and it is on generation 25.
A generation is completed when the a new model beats the previous in a series of matches with a win-rate above 55%.
This takes around 500 games of self-play. So, we could say the newest model has already played more than twelve thousand games of tak.
But I think this gives a false impression of the skill of the model. The bot started with absolutely no preconceptions about what moves would be good
and each of these games is played with incredibly short time controls (in reality it is a fixed number of rollouts per move).

I think comparing a random network to the first generation network (500 games played) gives a good illustration.

Here are the first ten moves of game played by a completely random network (15 seconds per move):

<iframe src="https://ptn.ninja/NoZQlgXgpgBARANjgXQLAChgGkD2BbMeAJhQ2AHkAHKAOzBoHN4BnAdwENLT0MBGAOhjteMAGa8MRQVAAsMAN5QAXDADUABn7r1MgDQxKKzdvW99ANxVEiMgMwBfGAGEoCBcpgBaY+oCs+wxgfUwsVW3UAdhkATnsMW0EXEUUVDS0QgyN0jMsYW2iZX19HVwA+dxVvdKIArJMzGFyiBD91OPQZQRB2Wwq1YNqg7Ibc3l98tpgQACM3FP7020HgkZUxmSJYjF8ugGM5ebTtBGXh0JhedQRfSdnyw589TKH685kADiL2hGkZTz6jpFTq9GmtNhFeI5hKoAY9gdpVjAEDIIg4MBFBOIYQ90u94TkrO9otEEI4QFBfH0qgj8YjbBDrO13oJ9v8cTTnitzgVopCpgATOYeQHqWnnXwRBBo9DRFm2e7CnwnTlnUF5dTvMaOQVsjzUnRitW+EmS9qXaS2bGKxaG3LI9ThKFEBWVHz+FUg3LjBC8GT2IA&name=E4QwdgJg9gtgBGApgFwO5WAayA" title="first ten moves of a game by a random network" class="ptn-ninja">
</iframe>

And here are the first twenty moves played by the first successful generation:

<iframe src="https://ptn.ninja/NoZQlgXgpgBARANjgXQLAChgGkD2BbMeAJhQ2AHkAHKAOzBoHN4BnAdwENLT0MBGAOhjteMAGa8MRQQGEARghgBvKAC4YAagAM-TQGYArABoYlNds2aiCYwDc1CTQ90BfGNKi6lqjdt4JdxqYw5nq8tmq8upoAHA7OGLqCAMYKympa-ES8ACyBZjqaOeEwWbrZ+ryuotle6eb61ib5FrzRxUTR0a3R8ejZggAmnmk+BW1NwQV+xWUORPpVw94ZFgCceZMWRETF2Zar8736yTUjK7rrEyFEl3Yw2QDsjg+rrrJLdTr6l0HXmsX6XQPBAvXoIQSyU7Lcy6Rq-Ap7YoOWL6Howd4AHlqo003w2IVaSNWOWyRF6DxOWLO9XG8JaOxgd2Bmmy0VeQl06mxKz0+IKmgexWiewQRBcGGig10VO8AFpzDc+RZNLc1AcVat2aIiNj5V8Alcpv9GWrVvoOq8MKsIdkuSM9SzBYbleM7rwBbxPeyoFC1A7dGFnYVjW6cg9UeL0O7BOIZX7zNMgzFirxtl1UW8PjjCkrQindERstlVppep6pdyE0Yg7wnW6LpZWq4BjrqTpC7nPSnyp0EAs+FIYElfTjSbmOyaYLx9BVImT0a3ofrOyGIqKENEHg8y4l0bbK18GXTCgy3U9ohY0S3ZQfcQbj4mzw8utlKnx+nvb4DcyqU8LeMSpYLnGOLmiuf6rGyZplscMAtgetaBseyaTu6+ikk8za8HaS61nCzQWAaoZlLC-ZRuCMBQPoCHAp2jRukQliFNuHI0T8BGpimVgqo8ZYUpRvAgRkjHVshqpTrowrAmi7BEAAfAejFOsh1b1pqDRka0Uo3m2WRHgRvKoYUFTZAgmY4Z82yiQZRERCqKpRGW1rovoOm4X2P62TA3wARYrjsNkCltmGP6BncfYIOUkaMcki6fDkxrIXW9hFpEQEgEk1HBVEP65JOCCrJFFzOEAA&name=GYSwTgzgLgBA5gUwHYLAQyiA9koA" title="first twenty moves by generation 1" class="ptn-ninja">
</iframe>

It is immediately clear that neither network has any idea what is going on.
But, what we can clearly notice is that the first generation model is placing a lot more flats.
We can draw our first general principle from this:

## Flats are good

Placing flats allows you to create roads and also advances your flat count. Moving just wastes time and walls are situational.
These things are clear to us humans, but let us think about how the model would have learned this.
The random network played essentially random moves.
In those first 500 games, if one side placed more flats it usually ended up winning, so the bot would learn that boards with more flats lead to wins.
This would mean that next time it is considering moves, it might consider moves which place flats more often than those than don't.
Eventually the policy will learn that placing flats is good.

Now let's skip ahead to the latest model. Here is a full game played by generation 25:

<iframe src="https://ptn.ninja/NoZQlgXgpgBARANjgXQLAChgGkD2BbMeAJhQ2AHkAHKAOzBoHN4BnAdwENLT0MBGAOhjteMAGa8MRQQGEAJgBYYAbygAuGAGoADPyIBmABwAaGJXU6tCeQHYTAN3V7rCAKy8AvjGkBjPcrWaOkREtqbm-Ly81vL26ghEBtHuGHqC3ooq6tq68jFhMEEuVrEwvFpEvHpEnrJ+mYG6+iZmBboAnNZaJbzyLkQIHhjyglB1Adn6xvkWLi563f3yiZ4ARkT+WUFavM3h2-JdMA6lhi7ybcnoLiMZ41sIu62Vem0lBlo2HjCyLhsNvAZXtN+FoivMjuoyolypcEIIVrdNrpeERHjpeH08scygh3ghPN5fvVsrw2kCWhZXFNjm0XLT8RhrCMiXdkVMKSCXNZURDSlo9ALrAT1sStqEOfotKFjgYQggLhgDCMRayiEU0SD4uDjnMEnoaiqkXpQRqoksShUiDCMG0RiJRfwnDtgeV3iVosF5DU9AA+P7ZPTnDVaUFYyEC+SVS5leFjI3q4EY6zU9T05yediGhpVcEc8ptZ3Y3gIKxaaMCMRx7OdYOVIFFrmdb3+nRVPIcyKA7p9ZxlvhSGBQBAtx3F2vWaWQ0FnFw1Fx+h1EWnB0H18N6eIK9CVQQ-EdL8XhFHWQuQ0lOMtiLMTLnB-Rh0oYp3R4aVgA8I4vwb0s26JfkgbegurIboceYfJOpR4gYgzbtcg7yAAtCO8gVN+AwWpG3IXFeH4OqhLh3lEJTytsW7FoIRCjMh+FkkRPLYoYxY4bUI5uO2R4fCmMAHHSs58EyPFQEQb6VGxxEutskG0ii+owGswFIi4WjsnsOIlG0CDcl6fBKjARCyCJbEIGBez8qeJxlJGQFsTY34GNxZTWE4Qp8LaCFsc4wbyg8vKRLk7yeFRegaGxLiqa0-Lmry5z9AYlxWvCLJKXRLrxL5xzRFyXowL4oUOuFhEum4GWOAWUQJRWvgjgMPJ5oVJQbgWQqDteOjhb5eYGAmOpzFpCUDkONGslqd49XE1hFPFMB6FA8j5SN2wruUJS5J0OnoPo8LDg6AwcZFpKHMc-4bkF6SIZEYWdWZY68m0HxEBtj2Ub4PqXQVXmSQCCyVCengIN4RAaCiKK2YekUhkdkK4tYbTxZI8EKHhrJFOSewhBZFQYlY-1QC4iGPWFzrgSGFqGM5W79LuiINOFxN7K4DHQ2UgG5S4yNKSeK6GN0ejPLBIS7jti3XZFJkWT0DkOQSvpsW0dVmcaJRnCGrmbXpejnaDu18yubhvHxckGSFNWPbW8vusmBhPe5aw1WcprKaVj6wz0GZEIpDQIC85tFTKkQdJcxppPaI2uOOUM8f0IRBWsC1IlYRXgRJxy9PdW582kNPZFpubhBjFnvEuOV6Cssu7biK6V7yTje-x6BVLuVbZJ0SdHpEftxICRSeC4owc17n3J4XPZqwKu5tfw8po08-LalOlTFmdCCeznbqSR83SggYThB6+KwIMNSLOW3kVqp3MDd70BLsyO2ncw+fGWEH8EIvHDTRKLFgfGufK0lyng9CyEPnfJwy1nYHAPEHOEg5eDvxbrDWst1jqTQFEFaioCv4glBCPVw9cnBZ1XjoSa+0LDY2Vvob2nh5A-CPh-CS4ElwaSsvDBuel5ArHnMEO+yllrcVLFUXuCh4HEO+hvZ2LMVKwReBPIh-BnJYJDNbVa8hNwEmzsQphiY2hK15CQpeQwdAzWEsDSeMEIrfwOG8Awrh8QwAQD8Ae2QYKmQhktXkCR4jVCGBWeQc1RLNx0LKcG39dHHSKEsf6tQRH8HMctJm9iDhlEuKhWMI4d4WJBI9SCiRSRfDtg6YJ3lNJvCWEuFJqQPKFNyI7bq1iHKznkho2Jt08wCmdtyTpKTXyGXSbrNK8QLQ73TE0uRzhMkhmXLyEsAJWG9BekDd6rJ3j0whpUDSLwzhnQ9ks4+BYVw9AWMEdMQwYFEHSHImCISslND8nMSWMsYnvDzms52ET+gpMEg4+QTign6w3r-GCwQ7G0L6RM+W88o4fH1EMPS-j0nynHJBPm5VhTpJqcVNUFoTwVSGO5DBhSbF60juTKM+lDKXJMsS1a4VNKXGUoIGh81uEOnuqs7+WidTFmsjAPuQN9DpInMtSFj1EgMiuL4rWzcBCQz4Vva2cNLgYCUD0AA+pw9w6A9KcP3Lo+qNYYqTR3o8m0aQ-C1DfHwIxrFvAIAwMqgEqraiapjN8QJjoMLAixoXdOjTMx8ArGXSs-ZlQfmCpa7clTRj2vQEoJcqqqL40iC6+CiFkKJouqHJEqFSHYNvNMnoiq+AwLmshUQIkBKUQwZw3STcY1KAOKqoamqKgjBAbtTeLpJjYtRcY+akgBzVWEpIKN8h63hVVekTVwdcrNKsFgx6yD1AHC0tNIgccUgVlYn3PQokx0N0HUhet8om2zgbqm5CeM769GDMmB8Lw2jXxSGczhfoEQpEErQ+tzhT3TvxclD+IRTShlWv0FEgDhIRoOFnb4dr0CRkIfpfx9bH2qpcBct28G9LofkG9ZpNiZ7f0sI1Kyl5CSITxbGP05zcNAA&name=IYO2BsE8GcEtqA" title="a full game by generation 25" class="ptn-ninja">
</iframe>

> Now would probably a good time to explain what the comments on each move mean. Each comment has three values, which are explained below:
> 
> - `e` is the evaluation of the current position from white's perspective ranging from -1 (black is winning) to 1 (white is winning).
> - `p` is the policy of the move played. This ranges from 0 to 1.
>  The sum of policies across all possible moves is equal to 1, so whenever we see a high policy (>0.5), that > means the network is really confident in that move.
> - `v` is the number of visits or rollouts for that move. This number tells us how many times the bot considered this move
>  in this position (even when thinking about a > different board state).
> 
> If there were multiple potential move, the analysis also includes a branch showing the line with the most visits following the alternative move.

The bot has a very good understanding of the first general principle *flats are good*.
It pretty much always places a flat whenever it is not facing a road threat.
It is quite human-like in the opening, although it does have a tendency to place its capstone as early as possible.
I observed the same behaviour with early 5x5 models. I think it will go away with more training.
I will let you know once it does!
