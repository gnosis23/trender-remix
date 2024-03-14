import { and, desc, eq } from "drizzle-orm";
import dayjs from "dayjs";
import crypto from "node:crypto";
import { db, NoteSchema, TagSchema } from "~/db/config.server";

export type SelectNoteType = Omit<
  typeof NoteSchema.$inferSelect,
  "createdAt"
> & { createdAt: string };

export const fetchNotes = async (userId: number, tag: string | null) => {
  let list: (typeof NoteSchema.$inferSelect)[];
  if (!tag) {
    list = await db
      .select()
      .from(NoteSchema)
      .where(eq(NoteSchema.userId, userId))
      .orderBy(desc(NoteSchema.createdAt));
  } else {
    list = await db
      .select({
        id: NoteSchema.id,
        userId: NoteSchema.userId,
        content: NoteSchema.content,
        createdAt: NoteSchema.createdAt,
      })
      .from(NoteSchema)
      .leftJoin(TagSchema, eq(TagSchema.note, NoteSchema.id))
      .where(and(eq(TagSchema.tag, tag), eq(NoteSchema.userId, userId)))
      .orderBy(desc(NoteSchema.createdAt));
  }

  return list.map((x) => ({
    id: x.id,
    userId: x.userId,
    content: x.content,
    createdAt: dayjs(x.createdAt).format("YYYY-MM-DD HH:mm:ss"),
  }));
};

export const fetchTags = async (userId: number) => {
  return db
    .selectDistinct({
      tag: TagSchema.tag,
    })
    .from(TagSchema)
    .where(eq(TagSchema.userId, userId));
};

export const createNote = async (userId: number, content: string) => {
  await db.transaction(async (tx) => {
    const noteId = crypto.randomUUID();
    await tx.insert(NoteSchema).values({ id: noteId, userId, content });

    const tagReg = new RegExp(/#[^ ]+/g);
    const tags = content.match(tagReg)?.map((tag) => tag.slice(1));
    if (tags) {
      await tx
        .insert(TagSchema)
        .values(tags.map((tag) => ({ tag, note: noteId, userId })));
    }
  });
};

export const updateNote = async (
  noteId: string,
  userId: number,
  content: string,
) => {
  await db.transaction(async (tx) => {
    await tx
      .update(NoteSchema)
      .set({
        content: content,
      })
      .where(and(eq(NoteSchema.id, noteId), eq(NoteSchema.userId, userId)));
    await tx
      .delete(TagSchema)
      .where(and(eq(TagSchema.note, noteId), eq(TagSchema.userId, userId)));

    const tagReg = new RegExp(/#[^ ]+/g);
    const tags = content.match(tagReg)?.map((tag) => tag.slice(1));
    if (tags) {
      await tx
        .insert(TagSchema)
        .values(tags.map((tag) => ({ tag, note: noteId, userId })));
    }
  });
};

export const deleteNote = async (noteId: string, userId: number) => {
  await db.transaction(async (tx) => {
    await tx
      .delete(NoteSchema)
      .where(and(eq(NoteSchema.id, noteId), eq(NoteSchema.userId, userId)));
    // 删除对应的标签
    await tx
      .delete(TagSchema)
      .where(and(eq(TagSchema.note, noteId), eq(TagSchema.userId, userId)));
  });
};
