import {
  int,
  mysqlTable,
  serial,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

// Create the connection
const poolConnection = mysql.createPool(process.env.DATABASE_URL as string);

export const db = drizzle(poolConnection);

export const RepositorySchema = mysqlTable("repository", {
  id: serial("id").primaryKey(),
  language: varchar("language", { length: 64 }),
  ownerName: varchar("owner_name", { length: 64 }),
  ownerUrl: varchar("owner_url", { length: 128 }),
  name: varchar("name", { length: 64 }).notNull(),
  star: int("star").notNull(),
  description: varchar("description", { length: 256 }).notNull(),
  url: varchar("url", { length: 256 }).notNull(),
  created: timestamp("created").defaultNow(),
});

export const UserSchema = mysqlTable("user", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 64 }),
  password: varchar("password", { length: 128 }),
});

export const LikeSchema = mysqlTable("like", {
  id: serial("id").primaryKey(),
  userId: int("user_id").notNull(),
  repoId: int("repo_id").notNull(),
  like: int("like").notNull(),
  created: timestamp("created").defaultNow(),
});
