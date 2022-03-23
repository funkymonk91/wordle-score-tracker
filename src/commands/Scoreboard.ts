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
    let content = '-------------------------------------------------------\n';

    db.all(
      `
    SELECT username, wordleId, score 
    FROM scores s 
    INNER JOIN usernames u ON s.userId = u.userId
    WHERE wordleId BETWEEN (SELECT MAX(wordleId) FROM scores) - 10 AND (SELECT MAX(wordleId) FROM scores)
    ORDER BY wordleId ASC, username ASC
    `,
      (err, rows) => {
        if (err) {
          console.log(err);
        }

        rows.forEach((row, i) => {
          if (i === 0) {
            content += `User - Wordle - Score\n`;
            //   for (let i = row.wordleId; i <= rows[-1].wordleId; i++) {
            //     content += i + ' | ';
            //   }
            //   content += '\n';
          }

          // console.log(row.username, row.wordleId, row.score);
          content += `${row.username} - ${row.wordleId} - ${row.score}\n`;
        });

        interaction.followUp({
          ephemeral: false,
          content,
        });
      }
    );
  },
};
