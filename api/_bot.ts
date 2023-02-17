import { Knex } from 'knex';
import { GoogleAuth } from 'google-auth-library';
import { AddGamePayload, Game } from '../src/services/games';
import { existsSync, writeFileSync } from 'fs';
import atob from 'atob';
import { computeScore, formatDate } from '../src/helpers';
import { TokenPayload } from './_common';

const googlePrivateKeyPath = '/tmp/BionathlonBot.privatekey.json';

if (!existsSync(googlePrivateKeyPath)) {
  writeFileSync(googlePrivateKeyPath, atob(process.env.GOOGLE_PRIVATE_KEY || ''));
}

process.env.GOOGLE_APPLICATION_CREDENTIALS = googlePrivateKeyPath;

async function sendChatMessage(spaceId: string | null, thread: string, message: string) {
  if (!spaceId) {
    return;
  }

  try {
    const auth = new GoogleAuth({
      scopes: 'https://www.googleapis.com/auth/chat.bot',
    });
    const client = await auth.getClient();

    const url = `https://chat.googleapis.com/v1/spaces/${spaceId}/messages?threadKey=${thread}`;
    await client.request({
      url,
      method: 'POST',
      data: {
        text: message,
      },
    });
  } catch (error) {
    console.error(error);
  }
}

export async function sendScoreOnChat(db: Knex, payload: AddGamePayload) {
  const payloadDate = new Date(payload.data.date).toISOString().split('T')[0];
  const threadKey = payloadDate + payload.data.time;

  const player = await db('player').first().where('id', payload.data.playerId);
  const otherGames = await db('game')
    .select()
    .whereRaw(`CAST(date AS DATE) = ?`, [payloadDate])
    .andWhere('time', payload.data.time)
    .andWhereNot('playerId', payload.data.playerId);

  if (otherGames.length === 0) {
    const welcomeMessage = `*Match du ${formatDate(payload.data.date)} - ${
      payload.data.time === 'midday' ? 'midi' : 'soir'
    }*
N'oubliez pas d'ajouter vos scores sur https://bionathlon.com !
    `;
    await sendChatMessage(process.env.CHATSPACE || null, threadKey, welcomeMessage);
  }

  const score = computeScore(payload.data);
  const chatNote = payload.data.note ? '(' + payload.data.note + ')' : '';
  const message = `- ${player.name} : ${score === 0 ? '⭕️' : score} ${chatNote}`;

  await sendChatMessage(process.env.CHATSPACE || null, threadKey, message);
}

export async function sendSuddenDeathOnChat(db: Knex, gameId: string) {
  const game = await db('game').first().join('player', 'game.playerId', 'player.id').where('game.id', gameId);

  if (!game) {
    return;
  }

  const gameDate = new Date(game.date).toISOString().split('T')[0];
  const threadKey = gameDate + game.time;

  const message = `${game.name} gagne la mort subite`;

  await sendChatMessage(process.env.CHATSPACE || null, threadKey, message);
}

export async function sendDeletionOnChat(game: Game, user: TokenPayload) {
  const gameDate = new Date(game.date).toISOString().split('T')[0];
  const threadKey = gameDate + game.time;

  const message = `${user.name} a invalidé la partie de ${game.playerName}`;

  await sendChatMessage(process.env.CHATSPACE || null, threadKey, message);
}

export async function sendNewPlayerOnChat(playerName: string, user: TokenPayload) {
  const threadKey = 'newPlayers';

  const message = `Bienvenue à ${playerName} ! (ajouté par ${user.name})`;

  await sendChatMessage(process.env.CHATSPACE || null, threadKey, message);
}
