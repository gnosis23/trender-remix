import { and, desc, eq, gt, isNotNull } from "drizzle-orm";
import { db, LikeSchema, RepositorySchema } from "~/db/config.server";

export type TRepository = {
  id: number;
  name: string;
  star: number;
  url: string;
  owner: string;
  ownerUrl: string;
  language: string;
  like: number;
};

export const fetchRepositories = async (
  date: Date,
  userId: number,
  tag: string | null,
) => {
  const like = db
    .select()
    .from(LikeSchema)
    .where(eq(LikeSchema.userId, userId))
    .as("like");
  const cond = tag
    ? eq(RepositorySchema.language, tag)
    : isNotNull(RepositorySchema.url);
  return db
    .select({
      id: RepositorySchema.id,
      name: RepositorySchema.name,
      star: RepositorySchema.star,
      url: RepositorySchema.url,
      owner: RepositorySchema.ownerName,
      ownerUrl: RepositorySchema.ownerUrl,
      language: RepositorySchema.language,
      like: LikeSchema.like,
    })
    .from(RepositorySchema)
    .leftJoin(like, eq(RepositorySchema.id, like.repoId))
    .where(and(gt(RepositorySchema.created, date), cond))
    .orderBy(desc(RepositorySchema.star))
    .limit(100) as Promise<TRepository[]>;
};
