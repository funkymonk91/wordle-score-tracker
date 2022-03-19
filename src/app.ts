import 'dotenv/config';
import { Client, Intents, TextChannel } from 'discord.js';

console.log('Bot is starting...');

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
  ],
});

const scoreReaction = (score: string): string => {
  if (score.toLowerCase() === 'x') {
    return '💩';
  }

  const scoreInt = parseInt(score);
  let icons: string[] = ['😅'];

  if (scoreInt >= 2 && scoreInt <= 5) {
    icons = ['🧨', '🤘', '🤓', '🔥', '👏', '🎉'];
  }

  return icons[Math.floor(Math.random() * icons.length)];
};

client.on('ready', async () => {
  console.log(`${client?.user?.username} is online`);
  console.log(
    `https://discord.com/api/oauth2/authorize?client_id=${process.env.APP_ID}&permissions=${process.env.permissions}&scope=bot%20applications.commands`
  );
});

client.on('messageCreate', async (message) => {
  const { content, author, channel } = message;

  const regex = new RegExp(
    /wordle+\s+\d+\s+(\d\/6|x).*(\n*\w*(⬜|⬛|🟩|🟨|){5}\n?){6}.*/gi
  );

  if (
    regex.test(content) &&
    author.bot === false &&
    (channel as TextChannel).name === 'wordle'
  ) {
    const scoreLine: string = content.split('\n')[0];
    const wordleId: string = scoreLine.split(' ')[1];
    const score: string = scoreLine.split(' ')[2].substring(0, 1);
    const userId: string = author.id;

    console.log(
      `${author.username}(${userId}) scored ${score} on Wordle: ${wordleId}`
    );

    message.react(scoreReaction(score));
  }
});

client.login(process.env.TOKEN);
