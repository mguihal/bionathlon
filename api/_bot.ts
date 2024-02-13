/* eslint-disable @typescript-eslint/no-unused-vars */
import { Knex } from 'knex';
import { GoogleAuth } from 'google-auth-library';
import { AddGamePayload, Game } from '../src/services/games';
import { existsSync, writeFileSync } from 'fs';
import atob from 'atob';
import { byScoreDesc, computeScore, formatDate, round2 } from '../src/helpers';
import { TokenPayload } from './_common';

const googlePrivateKeyPath = '/tmp/BionathlonBot.privatekey.json';

if (!existsSync(googlePrivateKeyPath)) {
  writeFileSync(googlePrivateKeyPath, atob(process.env.GOOGLE_PRIVATE_KEY || ''));
}

process.env.GOOGLE_APPLICATION_CREDENTIALS = googlePrivateKeyPath;

export async function sendChatMessage(spaceId: string | null, thread: string, message: string, messageId?: string) {
  if (!spaceId) {
    return;
  }

  try {
    const auth = new GoogleAuth({
      // keyFilename: __dirname + '/credentials.json',
      scopes: 'https://www.googleapis.com/auth/chat.bot',
    });
    const client = await auth.getClient();

    let url = `https://chat.googleapis.com/v1/spaces/${spaceId}/messages?messageReplyOption=REPLY_MESSAGE_FALLBACK_TO_NEW_THREAD&threadKey=${thread}`;

    if (messageId) {
      url = url + `&messageId=client-${messageId}`;
    }

    const result = await client.request({
      url,
      method: 'POST',
      data: {
        text: message,
        thread: {
          threadKey: thread,
        },
        threadReply: true,
      },
    });
  } catch (error) {
    console.error(error);
  }
}

export async function updateChatMessage(spaceId: string | null, thread: string, messageId: string, message: string) {
  if (!spaceId) {
    return;
  }

  try {
    const auth = new GoogleAuth({
      keyFilename: __dirname + '/credentials.json',
      scopes: 'https://www.googleapis.com/auth/chat.bot',
    });
    const client = await auth.getClient();

    const url = `https://chat.googleapis.com/v1/spaces/${spaceId}/messages/client-${messageId}?updateMask=text`;

    const result = await client.request({
      url,
      method: 'PATCH',
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

  const sessionGames = await db('game')
    .select()
    .join('player', 'game.playerId', 'player.id')
    .whereRaw(`CAST(date AS DATE) = ?`, [payloadDate])
    .andWhere('time', payload.data.time);

  const nbPlayers = sessionGames.length;
  const bestScore = sessionGames.sort(byScoreDesc);
  const average = sessionGames.reduce((acc, g) => acc + computeScore(g), 0) / nbPlayers;

  const score = computeScore(payload.data);

  if (otherGames.length === 0) {
    const welcomeMessage = `*Match du ${formatDate(payload.data.date)} - ${
      payload.data.time === 'midday' ? 'midi' : 'soir'
    }*
N'oubliez pas d'ajouter vos scores sur https://bionathlon.com !

Joueurs : ${nbPlayers}
Record : ${computeScore(bestScore[0])} (${bestScore[0].name})
Moyenne : ${round2(average)}
    `;
    await sendChatMessage(process.env.CHATSPACE || null, threadKey, welcomeMessage, `${threadKey}-welcome`);
  } else {
    const welcomeMessage = `*Match du ${formatDate(payload.data.date)} - ${
      payload.data.time === 'midday' ? 'midi' : 'soir'
    }*
N'oubliez pas d'ajouter vos scores sur https://bionathlon.com !

Joueurs : ${nbPlayers}
Record : ${computeScore(bestScore[0])} (${bestScore[0].name})
Moyenne : ${round2(average)}
    `;
    await updateChatMessage(process.env.CHATSPACE || null, threadKey, `${threadKey}-welcome`, welcomeMessage);
  }

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
