import { api } from 'sdk';
import { t, fullBtn } from '../lib/locales.js';
import { getPublicDataString } from '../lib/leaderboard.js';
import { getFlappyHtml } from '../lib/games/flappy.js';
import { getRunnerHtml } from '../lib/games/runner.js';
import { getStackHtml } from '../lib/games/stack.js';
import { getBrickHtml } from '../lib/games/brick.js';
import { getOrbitHtml } from '../lib/games/orbit.js';
import { getSolitaireHtml } from '../lib/games/solitaire.js';
import { getPyramidHtml } from '../lib/games/pyramid.js';

export default async function (guestMessage, ctx) {
  const queryId = guestMessage.guest_query_id;
  if (!queryId) {
    console.error('Guest message missing guest_query_id');
    return;
  }

  const lang = guestMessage.from?.language_code || 'en';
  const me = await api.getMe();
  const botUsername = me.username || '';

  const rawText = guestMessage.text || guestMessage.caption || '';
  const mentionRegex = new RegExp(`@${botUsername}\\b`, 'gi');
  const prompt = rawText.replace(mentionRegex, '').trim().toLowerCase();

  console.log('Guest query received with prompt:', prompt);

  let selectedKey = 'flappy';
  let gameTitle = t('btnFlappy', lang);
  let gameHtml = getFlappyHtml(lang, botUsername);

  if (prompt.includes('runner') || prompt.includes('cyber') || prompt.includes('dino')) {
    selectedKey = 'runner';
    gameTitle = t('btnRunner', lang);
    gameHtml = getRunnerHtml(lang, botUsername);
  } else if (prompt.includes('stack') || prompt.includes('tower')) {
    selectedKey = 'stack';
    gameTitle = t('btnStack', lang);
    gameHtml = getStackHtml(lang, botUsername);
  } else if (prompt.includes('brick') || prompt.includes('neon') || prompt.includes('break')) {
    selectedKey = 'brick';
    gameTitle = t('btnBrick', lang);
    gameHtml = getBrickHtml(lang, botUsername);
  } else if (prompt.includes('orbit') || prompt.includes('dash') || prompt.includes('space')) {
    selectedKey = 'orbit';
    gameTitle = t('btnOrbit', lang);
    gameHtml = getOrbitHtml(lang, botUsername);
  } else if (prompt.includes('pyramid')) {
    selectedKey = 'pyramid';
    gameTitle = t('btnPyramid', lang);
    gameHtml = getPyramidHtml(lang, botUsername);
  } else if (prompt.includes('solitaire') || prompt.includes('card') || prompt.includes('klondike')) {
    selectedKey = 'solitaire';
    gameTitle = t('btnSolitaire', lang);
    gameHtml = getSolitaireHtml(lang, botUsername);
  }

  try {
    console.log('Attempting direct widget reply in guest mode for:', selectedKey);
    const pubData = await getPublicDataString(selectedKey);
    await api.answerGuestQuery({
      guest_query_id: queryId,
      result: {
        type: 'article',
        id: `widget_${ctx.update.update_id}`,
        title: gameTitle,
        input_message_content: {
          html: gameHtml,
          width: 320,
          height: 480,
          is_shared: true,
          public_data: pubData
        }
      }
    });
    console.log('Direct widget reply sent successfully');
  } catch (err) {
    console.log('Direct widget restricted in external chat, sending rich guest card instead:', err.message || err);
    const flappyUrl = `https://t.me/${botUsername}?start=flappy`;
    const runnerUrl = `https://t.me/${botUsername}?start=runner`;
    const stackUrl = `https://t.me/${botUsername}?start=stack`;
    const brickUrl = `https://t.me/${botUsername}?start=brick`;
    const orbitUrl = `https://t.me/${botUsername}?start=orbit`;
    const solitaireUrl = `https://t.me/${botUsername}?start=solitaire`;
    const pyramidUrl = `https://t.me/${botUsername}?start=pyramid`;

    await api.answerGuestQuery({
      guest_query_id: queryId,
      result: {
        type: 'article',
        id: `rich_${ctx.update.update_id}`,
        title: gameTitle,
        input_message_content: {
          rich_message: {
            html: `<h3>${t('guestTitle', lang)}</h3>
<p>${t('guestDesc', lang)}</p>
<tg-button-row align="center">
  <tg-button type="url" style="primary" url="${flappyUrl}">${fullBtn(t('launchFlappy', lang))}</tg-button>
</tg-button-row>
<tg-button-row align="center">
  <tg-button type="url" style="success" url="${runnerUrl}">${fullBtn(t('launchRunner', lang))}</tg-button>
</tg-button-row>
<tg-button-row align="center">
  <tg-button type="url" style="danger" url="${stackUrl}">${fullBtn(t('launchStack', lang))}</tg-button>
</tg-button-row>
<tg-button-row align="center">
  <tg-button type="url" style="primary" url="${brickUrl}">${fullBtn(t('launchBrick', lang))}</tg-button>
</tg-button-row>
<tg-button-row align="center">
  <tg-button type="url" style="success" url="${orbitUrl}">${fullBtn(t('launchOrbit', lang))}</tg-button>
</tg-button-row>
<tg-button-row align="center">
  <tg-button type="url" style="danger" url="${solitaireUrl}">${fullBtn(t('launchSolitaire', lang))}</tg-button>
</tg-button-row>
<tg-button-row align="center">
  <tg-button type="url" style="primary" url="${pyramidUrl}">${fullBtn(t('launchPyramid', lang))}</tg-button>
</tg-button-row>`
          }
        }
      }
    });
    console.log('Rich guest card sent successfully');
  }
}