import { BaseCommandInteraction, Client } from 'discord.js';
import { Command } from '../Command';
import { Database, OPEN_READWRITE } from 'sqlite3';

const db = new Database('./src/db.sqlite', OPEN_READWRITE);

export const Scoreboard: Command = {
  name: 'scoreboard',
  description: 'Returns a scoreboard',
  type: 'CHAT_INPUT',
  run: async (client: Client, interaction: BaseCommandInteraction) => {
    db.serialize(() => {
      db.all(
        `SELECT username, MAX(wordleId) AS maxWordle, SUM(
            CASE score
              WHEN 1 THEN 6
              WHEN 2 THEN 5
              WHEN 3 THEN 4
              WHEN 4 THEN 3
              WHEN 5 THEN 2
              WHEN 6 THEN 1
              WHEN 0 THEN 0
          END) AS sumScore
      FROM scores s 
      INNER JOIN usernames u 
        ON s.userId = u.userId
      WHERE wordleId BETWEEN ((SELECT MAX(wordleId) FROM scores) - 7 )
        AND (SELECT MAX(wordleId) FROM scores)
      GROUP BY u.userId
      ORDER BY sumScore DESC`,
        (err, rows: Record<string, any>[]) => {
          if (err) {
            console.error(err);
          }

          let content = `Scoreboard for last 7 Wordles on record:\n`;
          content += '```';

          rows.forEach((row, i) => {
            content += `\n| ${i + 1} | ${row.username} - ${row.sumScore}`;
            if (i === 0) {
              content += ' 🏆';
            }
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
