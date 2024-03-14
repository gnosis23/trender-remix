import {
  Button,
  Textarea,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
} from "@nextui-org/react";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import {
  Form,
  useFetcher,
  useLoaderData,
  useSearchParams,
} from "@remix-run/react";
import dayjs from "dayjs";
import Header from "~/components/Header";
import { requireUser } from "~/session.session";
import {
  createNote,
  fetchNotes,
  fetchTags,
  SelectNoteType,
} from "~/db/note.server";
import { useState } from "react";

export const loader = async (c: LoaderFunctionArgs) => {
  const user = await requireUser(c.request);
  const searchParams = new URL(c.request.url).searchParams;
  const tag = searchParams.get("tag");

  const notes = await fetchNotes(user.userId, tag);
  const tags = await fetchTags(user.userId);
  return { notes, tags };
};

export const action = async (c: ActionFunctionArgs) => {
  const user = await requireUser(c.request);
  const formData = await c.request.formData();
  const content = (formData.get("content") as string) || "";
  await createNote(user.userId, content);

  return null;
};

type Props = { note: SelectNoteType };

const NoteCard = ({ note }: Props) => {
  const fetcher = useFetcher();
  const deleteFetcher = useFetcher();
  const isUpdating = fetcher.state === "submitting";
  const [isEditing, setIsEditing] = useState(false);

  return (
    <Card className="p-3">
      <CardHeader>
        <div className="text-gray-500 text-sm">
          {dayjs(note.createdAt).format("YYYY-MM-DD HH:mm:ss")}
        </div>
      </CardHeader>
      <CardBody>
        {isEditing ? (
          <>
            <fetcher.Form action="/note/edit" method="POST">
              <div className="flex flex-col gap-3">
                <input type="hidden" name="noteId" value={note.id} />
                <Textarea name="content" defaultValue={note.content} />
                <Button isLoading={isUpdating} type="submit">
                  更新
                </Button>
              </div>
            </fetcher.Form>
          </>
        ) : (
          <>{note.content}</>
        )}
      </CardBody>
      <CardFooter>
        <div className="flex gap-3">
          <Button
            size="sm"
            variant="flat"
            onClick={() => setIsEditing((x) => !x)}
          >
            {isEditing ? "取消" : "编辑"}
          </Button>
          <deleteFetcher.Form action={`/note/${note.id}/delete`} method="POST">
            <Button type="submit" size="sm" color="danger">
              删除
            </Button>
          </deleteFetcher.Form>
        </div>
      </CardFooter>
    </Card>
  );
};

export default function NotePage() {
  const { notes, tags } = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();

  return (
    <div className="p-4 w-[960px] mx-auto">
      <Header />

      <div className="flex gap-3 min-h-screen mt-4">
        <div className="w-[200px] flex flex-col gap-3">
          {tags.map((item) => (
            <Button
              variant={searchParams.get("tag") === item.tag ? "solid" : "light"}
              key={item.tag}
              onClick={() =>
                setSearchParams({
                  tag: searchParams.get("tag") === item.tag ? "" : item.tag,
                })
              }
            >
              # {item.tag}
            </Button>
          ))}
        </div>
        <div className="flex-1">
          <Form method="POST">
            <div className="flex flex-col gap-3">
              <Textarea
                name="content"
                minRows={10}
                placeholder="现在的想法是..."
              />
              <Button type="submit" color="primary">
                发布
              </Button>
            </div>
          </Form>
          <div className="flex flex-col gap-3 mt-4">
            {notes.map((note) => (
              <NoteCard key={note.id} note={note} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
