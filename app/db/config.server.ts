import {
	mysqlTable,
	serial,
	varchar,
	int,
	timestamp,
} from 'drizzle-orm/mysql-core';
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';

// Create the connection
const poolConnection = mysql.createPool(process.env.DATABASE_URL as string);

export const db = drizzle(poolConnection);

export const RepositorySchema = mysqlTable('repository', {
	id: serial('id').primaryKey(),
	language: varchar('language', { length: 64 }),
	ownerName: varchar('owner_name', { length: 64 }),
	ownerUrl: varchar('owner_url', { length: 128 }),
	name: varchar('name', { length: 64 }),
	star: int('star'),
	description: varchar('description', { length: 256 }),
	url: varchar('url', { length: 256 }),
	created: timestamp('created'),
});
