import 'dotenv/config';
import {
  BaseCommandInteraction,
  Client,
  Intents,
  Interaction,
  TextChannel,
  User,
} from 'discord.js';
import { Database, OPEN_READWRITE } from 'sqlite3';
import { Commands } from './Commands';

interface Score {
  user: User;
  wordleId: number;
  value: number;
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
    );
    CREATE TABLE IF NOT EXISTS usernames(
      userId INTEGER NOT NULL,
      username TEXT NOT NULL,
      PRIMARY KEY(userId)
    )`);
  console.log('Connected to database');
}

function storeScore(score: Score) {
  return db.serialize(() => {
    const scoreStmt = db.prepare(`
      INSERT OR IGNORE INTO ${TABLE_NAME} (userId, wordleId, score) 
      VALUES (?, ?, ?)
    `);

    scoreStmt.run([score.user.id, score.wordleId, score.value]);
    scoreStmt.finalize();

    const userStmt = db.prepare(`
      INSERT OR REPLACE INTO usernames (userId, username) 
      VALUES (?, ?)
    `);

    userStmt.run([score.user.id, score.user.username]);
    userStmt.finalize();
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
  let icons;

  if (score === 0) icons = ['💩'];
  if (score === 1) icons = ['🤨'];
  if (score === 6) icons = ['😅', '🤔'];
  else icons = ['🧨', '🤘', '🤓', '🔥', '👏', '🎉', '🏆', '🤯', '🤩'];

  return icons[Math.floor(Math.random() * icons.length)];
};

client.on('ready', async () => {
  client!.user!.setActivity('Wordle', { type: 'PLAYING' });

  await client!.application!.commands.set(Commands);

  initDb();

  console.log(`${client!.user!.username} is online`);
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
    const tempScore = scoreLine.split(' ')[2].toUpperCase();

    const score: Score = {
      user: author,
      wordleId: parseInt(scoreLine.split(' ')[1]),
      value: tempScore === 'X' ? 0 : parseInt(tempScore),
    };

    storeScore(score);

    message.react(scoreReaction(score.value));
  }
});

client.on('interactionCreate', async (interaction: Interaction) => {
  if (interaction.isCommand() || interaction.isContextMenu()) {
    await handleSlashCommand(client, interaction);
  }
});

const handleSlashCommand = async (
  client: Client,
  interaction: BaseCommandInteraction
): Promise<void> => {
  const slashCommand = Commands.find((c) => c.name === interaction.commandName);
  if (!slashCommand) {
    interaction.followUp({ content: 'An error has occurred' });
    return;
  }

  await interaction.deferReply();

  slashCommand.run(client, interaction);
};

client.login(process.env.TOKEN);
