import {
  ActionFunctionArgs,
  json,
  LoaderFunctionArgs,
  type MetaFunction,
} from "@remix-run/node";
import { useFetcher, useLoaderData, useNavigation } from "@remix-run/react";
import { fetchRepositories } from "~/db/home.server";
import { requireUser } from "~/session.session";
import { addLike, fetchLike, updateLike } from "~/db/like.server";
import Header from "~/components/Header";
import { Card } from "@nextui-org/card";

export const meta: MetaFunction = () => {
  return [
    { title: "Trender Remix" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export const loader = async (c: LoaderFunctionArgs) => {
  const user = await requireUser(c.request);
  const date = new Date();
  date.setDate(date.getDate() - 3);
  const repositories = await fetchRepositories(date, user.userId);

  return json({
    repositories,
    user,
  });
};

export const action = async (c: ActionFunctionArgs) => {
  const user = await requireUser(c.request);
  const data = await c.request.formData();
  const form = Object.fromEntries(data);

  const { id, favor } = form;
  const repoId = +id;
  const like = favor === "1" ? 1 : 0;
  if (Number.isNaN(repoId)) {
    return null;
  }

  const record = await fetchLike(user.userId, repoId);
  if (record) {
    await updateLike(record.id, like);
  } else {
    await addLike(user.userId, repoId, like);
  }

  return null;
};

export default function Index() {
  const data = useLoaderData<typeof loader>();
  const fetcher = useFetcher();

  const navigation = useNavigation();

  const onFavor = (id: number, favor: string) => {
    if (navigation.state === "submitting") return;
    fetcher.submit(
      { id, favor },
      {
        method: "post",
      },
    );
  };

  return (
    <div className="p-4 w-[600px] mx-auto">
      <Header />

      <Card className="p-2 mt-4">
        {data.repositories.map((repo) => {
          let like = repo.like;
          if (
            fetcher.formData?.has("id") &&
            fetcher.formData?.get("id") === String(repo.id)
          ) {
            like = fetcher.formData.get("favor") === "1" ? 1 : 0;
          }
          return (
            <div key={repo.id} className="flex py-1">
              <div className="w-8 shrink-0">
                <button
                  className="w-6 mr-6 cursor-pointer text-yellow-500"
                  onClick={() => onFavor(repo.id, repo.like === 1 ? "0" : "1")}
                >
                  {like === 1 ? "★" : "☆"}
                </button>
              </div>
              <div className="w-12 shrink-0 text-right mr-4">{repo.star}</div>
              <div className="w-20 shrink-0">{repo.language}</div>
              <div>
                <a
                  target="_blank"
                  href={repo.url!}
                  rel="noreferrer"
                  className="text-blue-400"
                >
                  {repo.name}
                </a>
              </div>
            </div>
          );
        })}
      </Card>
    </div>
  );
}
