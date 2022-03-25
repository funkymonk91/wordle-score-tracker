# wordle-score-tracker

Parses Wordle's 'share' output. You know the one, with the square emojis. 

```
Wordle 279 4/6

⬜⬜⬜⬜🟨
⬜⬜🟨🟨⬜
⬜🟩⬜⬜🟩
🟩🟩🟩🟩🟩
```

This bot reads those messages (only in `wordle` channels), parses them, stores the info in a sqlite database and then reacts based on your score. A simple scoreboard can be called with `/scoreboard`.
