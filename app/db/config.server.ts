import {
  int,
  mysqlTable,
  serial,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { desc, eq, gt } from "drizzle-orm";

// Create the connection
const poolConnection = mysql.createPool(process.env.DATABASE_URL as string);

export const db = drizzle(poolConnection);

export const RepositorySchema = mysqlTable("repository", {
  id: serial("id").primaryKey(),
  language: varchar("language", { length: 64 }),
  ownerName: varchar("owner_name", { length: 64 }),
  ownerUrl: varchar("owner_url", { length: 128 }),
  name: varchar("name", { length: 64 }),
  star: int("star"),
  description: varchar("description", { length: 256 }),
  url: varchar("url", { length: 256 }),
  created: timestamp("created"),
});

export const UserSchema = mysqlTable("user", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 64 }),
  password: varchar("password", { length: 128 }),
});

export const LikeSchema = mysqlTable("like", {
  id: serial("id").primaryKey(),
  userId: int("user_id"),
  repoId: int("repo_id"),
  like: int("like"),
  created: timestamp("created"),
});

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
      like: LikeSchema.like,
    })
    .from(RepositorySchema)
    .leftJoin(like, eq(RepositorySchema.id, like.repoId))
    .where(gt(RepositorySchema.created, date))
    .orderBy(desc(RepositorySchema.star))
    .limit(50);
};
