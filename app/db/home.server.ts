import { and, desc, eq, gt, isNotNull } from "drizzle-orm";
import { db, LikeSchema, RepositorySchema } from "~/db/config.server";

export type TRepository = {
  id: number;
  name: string;
  star: number;
  url: string;
  language: string;
  like: number;
};

export const fetchRepositories = async (date: Date, userId: number) => {
  const like = db
    .select()
    .from(LikeSchema)
    .where(eq(LikeSchema.userId, userId))
    .as("like");
  return db
    .select({
      id: RepositorySchema.id,
      name: RepositorySchema.name,
      star: RepositorySchema.star,
      url: RepositorySchema.url,
      language: RepositorySchema.language,
      like: LikeSchema.like,
    })
    .from(RepositorySchema)
    .leftJoin(like, eq(RepositorySchema.id, like.repoId))
    .where(
      and(
        gt(RepositorySchema.created, date),
        isNotNull(RepositorySchema.language),
      ),
    )
    .orderBy(desc(RepositorySchema.star))
    .limit(50) as Promise<TRepository[]>;
};
