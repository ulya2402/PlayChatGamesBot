import { table, integer, text, uniqueIndex, index, sql } from 'sdk/db';

export const scores = table('scores', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  game: text('game').notNull(),
  userId: integer('user_id').notNull(),
  name: text('name').notNull(),
  score: integer('score').notNull(),
  updatedAt: integer('updated_at').default(sql`(unixepoch())`)
}, (t) => ({
  userGameIdx: uniqueIndex('idx_scores_game_user').on(t.game, t.userId),
  rankIdx: index('idx_scores_game_score').on(t.game, t.score)
}));

export const widgetMeta = table('widget_meta', {
  game: text('game').primaryKey(),
  rev: integer('rev').notNull().default(1),
  widgetId: text('widget_id'),
  chatId: integer('chat_id'),
  messageId: integer('message_id')
});