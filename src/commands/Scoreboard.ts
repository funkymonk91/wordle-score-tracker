import { BaseCommandInteraction, Client } from 'discord.js';
import { Command } from '../Command';
import { Database, OPEN_READONLY } from 'sqlite3';

const db = new Database('./src/db.sqlite', OPEN_READONLY);

interface reportRow {
  username: string;
  wordles: string[];
}

export const Scoreboard: Command = {
  name: 'scoreboard',
  description: 'Returns a scoreboard',
  type: 'CHAT_INPUT',
  run: async (client: Client, interaction: BaseCommandInteraction) => {
    let content = `Summed Scores from last 10 Wordles:\nRank | User | Score`;

    db.all(
      `
    SELECT username, wordleId, SUM(score) AS score 
    FROM scores s 
    INNER JOIN usernames u ON s.userId = u.userId
    WHERE wordleId BETWEEN (SELECT MAX(wordleId) FROM scores) - 10 AND (SELECT MAX(wordleId) FROM scores) AND score > 0
    GROUP BY u.userId
    ORDER BY score ASC
    `,
      (err, rows) => {
        if (err) {
          console.log(err);
        }

        rows.forEach((row, i) => {
          content += `\n${i + 1} | ${row.username} | ${row.score}`;
        });

        interaction.followUp({
          ephemeral: false,
          content,
        });
      }
    );
  },
};
