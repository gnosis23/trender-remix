import { ActionFunctionArgs } from "@remix-run/node";
import { requireUser } from "~/session.session";
import { updateNote } from "~/db/note.server";

export const action = async (c: ActionFunctionArgs) => {
  const user = await requireUser(c.request);
  const formData = await c.request.formData();

  const content = formData.get("content") as string;
  const noteId = formData.get("noteId") as string;

  await updateNote(noteId, user.userId, content);

  return null;
};
