import { and, eq } from "drizzle-orm";
import { db, LikeSchema } from "~/db/config.server";

export const fetchLike = async (userId: number, repoId: number) => {
  const items = await db
    .select()
    .from(LikeSchema)
    .where(and(eq(LikeSchema.userId, userId), eq(LikeSchema.repoId, repoId)));
  return items[0];
};

export const addLike = async (userId: number, repoId: number, like: number) => {
  return db.insert(LikeSchema).values({
    userId,
    repoId,
    like,
  });
};

export const updateLike = async (id: number, like: number) => {
  return db.update(LikeSchema).set({ like: like }).where(eq(LikeSchema.id, id));
};
