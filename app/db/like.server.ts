import { and, desc, eq } from "drizzle-orm";
import { db, LikeSchema, RepositorySchema } from "~/db/config.server";
import { TRepository } from "~/db/home.server";

export const fetchLike = async (userId: number, repoId: number) => {
  const items = await db
    .select()
    .from(LikeSchema)
    .where(and(eq(LikeSchema.userId, userId), eq(LikeSchema.repoId, repoId)));
  return items[0];
};

export const fetchMyLikes = async (userId: number) => {
  return db
    .select({
      id: LikeSchema.id,
      name: RepositorySchema.name,
      star: RepositorySchema.star,
      url: RepositorySchema.url,
      language: RepositorySchema.language,
      like: LikeSchema.like,
    })
    .from(LikeSchema)
    .leftJoin(RepositorySchema, eq(RepositorySchema.id, LikeSchema.repoId))
    .where(eq(LikeSchema.userId, userId))
    .orderBy(desc(LikeSchema.id)) as Promise<TRepository[]>;
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

export const removeLike = async (id: number, userId: number) => {
  return db
    .delete(LikeSchema)
    .where(and(eq(LikeSchema.id, id), eq(LikeSchema.userId, userId)));
};
