import { api } from 'sdk';
import { t, fullBtn } from '../lib/locales.js';
import { getPublicDataString, saveWidgetRef, saveScoreAndSyncWidget } from '../lib/leaderboard.js';
import { getFlappyHtml } from '../lib/games/flappy.js';
import { getRunnerHtml } from '../lib/games/runner.js';
import { getStackHtml } from '../lib/games/stack.js';
import { getBrickHtml } from '../lib/games/brick.js';
import { getOrbitHtml } from '../lib/games/orbit.js';
import { getSolitaireHtml } from '../lib/games/solitaire.js';
import { getPyramidHtml } from '../lib/games/pyramid.js';

async function launchGameWidget(chatId, gameKey, html, caption) {
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

export default async function (message, ctx) {
  const chatId = message.chat.id;
  const text = (message.text || '').trim();
  const lang = message.from?.language_code || 'en';

  if (text.startsWith('/start')) {
    const parts = text.split(/\s+/);
    const payload = (parts[1] || '').toLowerCase();

    if (payload.startsWith('save_')) {
      const segs = payload.split('_');
      const gameKey = segs[1] || '';
      const scoreVal = parseInt(segs[2], 10) || 0;
      console.log('Saving cloud score via deep link for game:', gameKey, 'score:', scoreVal);
      await saveScoreAndSyncWidget(gameKey, message.from, scoreVal);
      try {
        await api.deleteMessage({ chat_id: chatId, message_id: message.message_id });
      } catch (e) {
        console.log('Could not delete score trigger message:', e.message || e);
      }
      return;
    }

    const me = await api.getMe();
    const botUsername = me.username || 'bot';

    if (payload === 'flappy') {
      await launchGameWidget(chatId, 'flappy', getFlappyHtml(lang, botUsername), t('btnFlappy', lang));
      return;
    }
    if (payload === 'runner') {
      await launchGameWidget(chatId, 'runner', getRunnerHtml(lang, botUsername), t('btnRunner', lang));
      return;
    }
    if (payload === 'stack') {
      await launchGameWidget(chatId, 'stack', getStackHtml(lang, botUsername), t('btnStack', lang));
      return;
    }
    if (payload === 'brick') {
      await launchGameWidget(chatId, 'brick', getBrickHtml(lang, botUsername), t('btnBrick', lang));
      return;
    }
    if (payload === 'orbit') {
      await launchGameWidget(chatId, 'orbit', getOrbitHtml(lang, botUsername), t('btnOrbit', lang));
      return;
    }
    if (payload === 'solitaire') {
      await launchGameWidget(chatId, 'solitaire', getSolitaireHtml(lang, botUsername), t('btnSolitaire', lang));
      return;
    }
    if (payload === 'pyramid') {
      await launchGameWidget(chatId, 'pyramid', getPyramidHtml(lang, botUsername), t('btnPyramid', lang));
      return;
    }

    console.log('Sending localized full-width rich welcome menu to chat', chatId);
    await api.sendRichMessage({
      chat_id: chatId,
      rich_message: {
        html: `<h1>${t('welcomeTitle', lang)}</h1>
<p>${t('welcomeBody', lang)}</p>
<tg-button-row align="center">
  <tg-button type="callback_data" style="primary" data="play_flappy">${fullBtn(t('btnFlappy', lang))}</tg-button>
</tg-button-row>
<tg-button-row align="center">
  <tg-button type="callback_data" style="success" data="play_runner">${fullBtn(t('btnRunner', lang))}</tg-button>
</tg-button-row>
<tg-button-row align="center">
  <tg-button type="callback_data" style="danger" data="play_stack">${fullBtn(t('btnStack', lang))}</tg-button>
</tg-button-row>
<tg-button-row align="center">
  <tg-button type="callback_data" style="primary" data="play_brick">${fullBtn(t('btnBrick', lang))}</tg-button>
</tg-button-row>
<tg-button-row align="center">
  <tg-button type="callback_data" style="success" data="play_orbit">${fullBtn(t('btnOrbit', lang))}</tg-button>
</tg-button-row>
<tg-button-row align="center">
  <tg-button type="callback_data" style="danger" data="play_solitaire">${fullBtn(t('btnSolitaire', lang))}</tg-button>
</tg-button-row>
<tg-button-row align="center">
  <tg-button type="callback_data" style="primary" data="play_pyramid">${fullBtn(t('btnPyramid', lang))}</tg-button>
</tg-button-row>
<hr/>
<p>${t('guestHint', lang)} <code>@${botUsername} pyramid</code></p>
<tg-button-row align="center">
  <tg-button type="copy_text" text="@${botUsername} pyramid">${fullBtn(`📋 Copy @${botUsername} pyramid`)}</tg-button>
</tg-button-row>`,
        skip_entity_detection: false
      }
    });
  }
}