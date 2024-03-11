import { eq } from "drizzle-orm";
import { BasicInfoSchema, db } from "~/db/config.server";

export const fetchBasicInfo = async (userId: number) => {
  const items = await db
    .select()
    .from(BasicInfoSchema)
    .where(eq(BasicInfoSchema.userId, userId));
  return items[0];
};

export const addBasicInfo = async (userId: number, nickName: string) => {
  return db.insert(BasicInfoSchema).values({
    userId,
    nickName,
  });
};

export const updateBasicInfo = async (id: number, nickName: string) => {
  return db
    .update(BasicInfoSchema)
    .set({ nickName: nickName })
    .where(eq(BasicInfoSchema.id, id));
};
