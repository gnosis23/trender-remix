import { db, NoteSchema } from "~/db/config.server";
import { and, desc, eq } from "drizzle-orm";
import dayjs from "dayjs";

export const createNote = async (userId: number, content: string) => {
  return db.insert(NoteSchema).values({ userId, content });
};

export type SelectNoteType = Omit<
  typeof NoteSchema.$inferSelect,
  "createdAt"
> & { createdAt: string };

export const fetchNotes = async (userId: number) => {
  const list = await db
    .select()
    .from(NoteSchema)
    .where(eq(NoteSchema.userId, userId))
    .orderBy(desc(NoteSchema.createdAt));
  return list.map((x) => ({
    id: x.id,
    userId: x.userId,
    content: x.content,
    createdAt: dayjs(x.createdAt).format("YYYY-MM-DD HH:mm:ss"),
  }));
};

export const updateNote = async (
  id: string,
  userId: number,
  content: string,
) => {
  return db
    .update(NoteSchema)
    .set({
      content: content,
    })
    .where(and(eq(NoteSchema.id, id), eq(NoteSchema.userId, userId)));
};

export const deleteNote = async (id: string, userId: number) => {
  return db
    .delete(NoteSchema)
    .where(and(eq(NoteSchema.id, id), eq(NoteSchema.userId, userId)));
};
