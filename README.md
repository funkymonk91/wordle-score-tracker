# wordle-score-tracker

Parses Wordle's 'share' output. You know the one, with the square emojis. 

```
Wordle 279 4/6

⬜⬜⬜⬜🟨
⬜⬜🟨🟨⬜
⬜🟩⬜⬜🟩
🟩🟩🟩🟩🟩
```

This bot reads those messages (only in `wordle` channels), parses them, stores the info in a sqlite database and then reacts based on your score.

## Commands
- `/scoreboard` - Simple algorithm gives points based on the # of guesses your wordle took. Scores points only for the last 7 Wordles.
- `/history` - Shows the 30 most recent Wordle's the bot has logged for you
