import { api } from 'sdk';
import { t } from '../lib/locales.js';
import { getPublicDataString, saveWidgetRef } from '../lib/leaderboard.js';
import { getFlappyHtml } from '../lib/games/flappy.js';
import { getRunnerHtml } from '../lib/games/runner.js';
import { getStackHtml } from '../lib/games/stack.js';
import { getBrickHtml } from '../lib/games/brick.js';
import { getOrbitHtml } from '../lib/games/orbit.js';
import { getSolitaireHtml } from '../lib/games/solitaire.js';
import { getPyramidHtml } from '../lib/games/pyramid.js';

async function sendSharedGameWidget(chatId, gameKey, html, caption) {
  const pubData = await getPublicDataString(gameKey);
  const sent = await api.sendWidget({
    chat_id: chatId,
    html,
    width: 320,
    height: 480,
    caption,
    is_shared: true,
    public_data: pubData
  });
  await saveWidgetRef(gameKey, chatId, sent);
}

export default async function (callbackQuery, ctx) {
  const data = callbackQuery.data;
  const chatId = callbackQuery.message?.chat?.id;
  const queryId = callbackQuery.id;
  const lang = callbackQuery.from?.language_code || 'en';

  console.log('Callback query received:', data);
  await api.answerCallbackQuery({ callback_query_id: queryId });

  if (!chatId) return;

  const me = await api.getMe();
  const botUsername = me.username || '';

  if (data === 'play_flappy') {
    await sendSharedGameWidget(chatId, 'flappy', getFlappyHtml(lang, botUsername), t('btnFlappy', lang));
  } else if (data === 'play_runner') {
    await sendSharedGameWidget(chatId, 'runner', getRunnerHtml(lang, botUsername), t('btnRunner', lang));
  } else if (data === 'play_stack') {
    await sendSharedGameWidget(chatId, 'stack', getStackHtml(lang, botUsername), t('btnStack', lang));
  } else if (data === 'play_brick') {
    await sendSharedGameWidget(chatId, 'brick', getBrickHtml(lang, botUsername), t('btnBrick', lang));
  } else if (data === 'play_orbit') {
    await sendSharedGameWidget(chatId, 'orbit', getOrbitHtml(lang, botUsername), t('btnOrbit', lang));
  } else if (data === 'play_solitaire') {
    await sendSharedGameWidget(chatId, 'solitaire', getSolitaireHtml(lang, botUsername), t('btnSolitaire', lang));
  } else if (data === 'play_pyramid') {
    await sendSharedGameWidget(chatId, 'pyramid', getPyramidHtml(lang, botUsername), t('btnPyramid', lang));
  }
}