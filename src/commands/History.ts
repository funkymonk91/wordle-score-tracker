import { BaseCommandInteraction, Client } from 'discord.js';
import { Command } from '../Command';
import { Database, OPEN_READWRITE } from 'sqlite3';

const db = new Database('./src/db.sqlite', OPEN_READWRITE);

export const History: Command = {
  name: 'history',
  description: 'Returns the last 30 Wordles you recorded with the point value.',
  type: 'CHAT_INPUT',
  run: async (client: Client, interaction: BaseCommandInteraction) => {
    db.serialize(() => {
      db.all(
        `SELECT scores.userId,
            wordleId, 
            score,
            CASE score
                WHEN 1 THEN 6
                WHEN 2 THEN 5
                WHEN 3 THEN 4
                WHEN 4 THEN 3
                WHEN 5 THEN 2
                WHEN 6 THEN 1
            END AS points
        FROM scores
        INNER JOIN usernames ON scores.userId = usernames.userId
        WHERE scores.userId = ${interaction.user.id}
        ORDER BY wordleId DESC
        LIMIT 30`,
        (err, rows: Record<string, any>[]) => {
          if (err) {
            console.error(err);
          }

          let content = `Here's what I got for you <@${rows[0].userId}>:`;

          content += '```';
          content += `| Wordle | Guesses | Points |`;

          rows.forEach((row) => {
            content += `\n| ${row.wordleId
              .toString()
              .padStart(6, ' ')} | ${row.score
              .toString()
              .padStart(7, ' ')} | ${row.points.toString().padStart(6, ' ')} |`;
          });
          content += '```';

          interaction.followUp({
            ephemeral: false,
            content,
          });
        }
      );
    });
  },
};
