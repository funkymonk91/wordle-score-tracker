import 'dotenv/config';
import { Client, Intents, TextChannel, User } from 'discord.js';
import { Database, OPEN_READWRITE } from 'sqlite3';

interface Score {
  userId: User['id'];
  wordleId: number;
  score: number;
}

const TABLE_NAME = 'scores';
const db = new Database('./src/db.sqlite', OPEN_READWRITE);

function initDb() {
  db.run(`CREATE TABLE IF NOT EXISTS ${TABLE_NAME}(
      userId INTEGER NOT NULL,
      wordleId INTEGER NOT NULL,
      score INTEGER NOT NULL,
      date_created DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY(userId, wordleId)
    )`);
  console.log('Connected to database');
}

function storeScore(score: Score) {
  return db.serialize(() => {
    const stmt = db.prepare(`
    INSERT OR IGNORE INTO ${TABLE_NAME} (userId, wordleId, score) 
    VALUES (?, ?, ?)
  `);
    stmt.run([score.userId, score.wordleId, score.score]);
    stmt.finalize();

    db.each(`SELECT * FROM ${TABLE_NAME}`, function (_err, row) {
      console.log({ row });
    });
  });
}

console.log('Bot is starting...');

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
  ],
});

const scoreReaction = (score: number): string => {
  if (score === 0) return '💩';
  if (score === 6) return '😅';

  const icons = ['🧨', '🤘', '🤓', '🔥', '👏', '🎉'];

  return icons[Math.floor(Math.random() * icons.length)];
};

client.on('ready', async () => {
  console.log(`${client?.user?.username} is online`);

  initDb();

  // console.log(
  //   `https://discord.com/api/oauth2/authorize?client_id=${process.env.APP_ID}&permissions=${process.env.permissions}&scope=bot%20applications.commands`
  // );
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
    const tempScore = scoreLine.split(' ')[2].toLowerCase();

    const score: Score = {
      userId: author.id,
      wordleId: parseInt(scoreLine.split(' ')[1]),
      score: tempScore === 'x' ? 0 : parseInt(tempScore),
    };

    storeScore(score);

    message.react(scoreReaction(score.score));
  }
});

client.login(process.env.TOKEN);
