import { ActionFunctionArgs, redirect } from "@remix-run/node";
import { requireUser } from "~/session.session";
import { deleteNote } from "~/db/note.server";

export const action = async (c: ActionFunctionArgs) => {
  const user = await requireUser(c.request);
  const noteId = c.params.noteId as string;

  await deleteNote(noteId, user.userId);

  return redirect("/note");
};
