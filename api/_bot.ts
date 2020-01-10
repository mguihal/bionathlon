import knex from 'knex';
import { GoogleAuth } from 'google-auth-library';
import { GamePayload } from './game';
import { SuddenDeathPayload } from './suddenDeath';
import { existsSync, writeFileSync } from 'fs';
import atob from 'atob';

const googlePrivateKeyPath = __dirname + '/../BionathlonBot.privatekey.json';

if (!existsSync(googlePrivateKeyPath)) {
  writeFileSync(googlePrivateKeyPath, atob(process.env.GOOGLE_PRIVATE_KEY || ''));
}

process.env.GOOGLE_APPLICATION_CREDENTIALS = googlePrivateKeyPath;

function formatDate(date: string) {
  const dateObject = new Date(date);
  const day = dateObject.getDate();
  const month = dateObject.getMonth() + 1;
  const year = dateObject.getFullYear();

  const pad = (n: number) => n < 10 ? `0${n}` : n;

  return `${pad(day)}/${pad(month)}/${year}`;
}

async function sendChatMessage(spaceId: string | null, thread: string, message: string) {
  if (!spaceId) {
    return;
  }

  try {
    const auth = new GoogleAuth({
      scopes: 'https://www.googleapis.com/auth/chat.bot'
    });
    const client = await auth.getClient();

    const url = `https://chat.googleapis.com/v1/spaces/${spaceId}/messages?threadKey=${thread}`;
    const res = await client.request({
      url,
      method: 'POST',
      data: {
        text: message,
      },
    });
  } catch(error) {
    console.error(error);
  }
}

export async function sendScoreOnChat(db: knex, payload: GamePayload) {
  const payloadDate = (new Date(payload.data.date)).toISOString().split('T')[0];
  const threadKey = payloadDate + payload.data.time;

  const player = await db('player').first().where('id', payload.data.playerId);
  const otherGames = await db('game').select()
    .whereRaw(`CAST(date AS DATE) = ?`, [payloadDate])
    .andWhere('time', payload.data.time)
    .andWhereNot('playerId', payload.data.playerId);

  if (otherGames.length === 0) {
    const welcomeMessage = `*Match du ${formatDate(payload.data.date)} - ${payload.data.time === 'midday' ? 'midi' : 'soir'}*
N'oubliez pas d'ajouter vos scores sur https://bionathlon.now.sh !
    `;
    await sendChatMessage(process.env.CHATSPACE || null, threadKey, welcomeMessage);
  }

  const chatScore = payload.data.score === 0 ? '⭕️' : payload.data.score;
  const chatNote = payload.data.note ? '(' + payload.data.note + ')' : '';
  const message = `- ${player.name} : ${chatScore} ${chatNote}`;

  await sendChatMessage(process.env.CHATSPACE || null, threadKey, message);
}

export async function sendSuddenDeathOnChat(db: knex, payload: SuddenDeathPayload) {
  const game = await db('game')
    .first()
    .join('player', 'game.playerId', 'player.id')
    .where('game.id', payload.data.gameId);

  if (!game) {
    return;
  }

  const gameDate = (new Date(game.date)).toISOString().split('T')[0];
  const threadKey = gameDate + game.time;

  const message = `${game.name} gagne la mort subite`;

  await sendChatMessage(process.env.CHATSPACE || null, threadKey, message);
}
