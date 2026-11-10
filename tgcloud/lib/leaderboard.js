import { api, db } from 'sdk';
import { eq, and, desc, sql } from 'sdk/db';
import { scores, widgetMeta } from '../schema.js';

export const VALID_GAMES = ['flappy', 'runner', 'stack', 'brick', 'orbit', 'solitaire', 'pyramid'];

export async function getLeaderboardState(game) {
  const meta = await db.select().from(widgetMeta).where(eq(widgetMeta.game, game)).get();
  const topRows = await db.select()
    .from(scores)
    .where(eq(scores.game, game))
    .orderBy(desc(scores.score))
    .limit(5)
    .all();

  return {
    r: meta ? meta.rev : 1,
    top: topRows.map((row) => ({
      n: String(row.name || 'Player').slice(0, 14),
      s: row.score
    }))
  };
}

export async function getPublicDataString(game) {
  const state = await getLeaderboardState(game);
  return JSON.stringify(state);
}

export async function saveWidgetRef(game, chatId, sentMsg) {
  const wId = sentMsg?.widget?.id || null;
  const mId = sentMsg?.message_id || null;
  await db.insert(widgetMeta)
    .values({ game, rev: 1, widgetId: wId, chatId, messageId: mId })
    .onConflictDoUpdate({
      target: widgetMeta.game,
      set: {
        widgetId: wId,
        chatId,
        messageId: mId
      }
    })
    .run();
}

export async function saveScoreAndSyncWidget(game, user, rawScore) {
  if (!VALID_GAMES.includes(game)) return null;
  const cleanScore = Math.max(0, Math.min(999999, Math.floor(Number(rawScore) || 0)));
  const userId = Number(user?.id || 0);
  if (!userId) return null;

  const cleanName = String(user.first_name || user.username || 'Player').slice(0, 16);

  if (cleanScore > 0) {
    const existing = await db.select()
      .from(scores)
      .where(and(eq(scores.game, game), eq(scores.userId, userId)))
      .get();

    if (!existing) {
      await db.insert(scores).values({
        game,
        userId,
        name: cleanName,
        score: cleanScore
      }).run();
    } else if (cleanScore > existing.score || existing.name !== cleanName) {
      await db.update(scores)
        .set({
          score: Math.max(existing.score, cleanScore),
          name: cleanName,
          updatedAt: Math.floor(Date.now() / 1000)
        })
        .where(eq(scores.id, existing.id))
        .run();
    }
  }

  await db.insert(widgetMeta)
    .values({ game, rev: 2 })
    .onConflictDoUpdate({
      target: widgetMeta.game,
      set: { rev: sql`${widgetMeta.rev} + 1` }
    })
    .run();

  const nextState = await getLeaderboardState(game);
  const payloadStr = JSON.stringify(nextState);
  const meta = await db.select().from(widgetMeta).where(eq(widgetMeta.game, game)).get();

  if (meta?.widgetId) {
    try {
      await api.editSharedWidgetData({
        widget_id: meta.widgetId,
        public_data: payloadStr
      });
    } catch (e) {
      console.log('Skipped editSharedWidgetData:', e.message || e);
    }
  }

  if (meta?.chatId && meta?.messageId) {
    try {
      await api.editMessageWidgetData({
        chat_id: meta.chatId,
        message_id: meta.messageId,
        public_data: payloadStr
      });
    } catch (e) {
      console.log('Skipped editMessageWidgetData:', e.message || e);
    }
  }

  return nextState;
}