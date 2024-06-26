import {
  ActionFunctionArgs,
  json,
  LoaderFunctionArgs,
  type MetaFunction,
} from "@remix-run/node";
import {
  useFetcher,
  useLoaderData,
  useNavigation,
  useSearchParams,
} from "@remix-run/react";
import { fetchRepositories } from "~/db/home.server";
import { requireUser } from "~/session.session";
import { addLike, fetchLike, updateLike } from "~/db/like.server";
import Header from "~/components/Header";
import { Card } from "@nextui-org/card";
import { Chip } from "@nextui-org/chip";

const tags = [
  "C++",
  "Go",
  "Java",
  "JavaScript",
  "Python",
  "Swift",
  "TypeScript",
];

export const meta: MetaFunction = () => {
  return [
    { title: "Trender Remix" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export const loader = async (c: LoaderFunctionArgs) => {
  const user = await requireUser(c.request);
  const url = new URL(c.request.url);
  const tag = url.searchParams.get("t");
  const date = new Date();
  date.setDate(date.getDate() - 7);
  const repositories = await fetchRepositories(date, user.userId, tag);

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
  const { repositories } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigation = useNavigation();

  const tag = searchParams.get("t");
  const searching =
    navigation.location &&
    new URLSearchParams(navigation.location.search).has("t");

  const onFilter = (tag: string) => {
    setSearchParams((prev) => {
      prev.set("t", tag);
      return prev;
    });
  };

  const onFavor = (id: number, favor: string) => {
    if (fetcher.state === "submitting") return;
    fetcher.submit(
      { id, favor },
      {
        method: "post",
      },
    );
  };

  return (
    <div className="p-4 w-[960px] mx-auto">
      <Header />

      <div className="space-x-2 mt-2">
        {tags.map((key) => (
          <Chip
            key={key}
            className="cursor-pointer"
            color={key === tag ? "primary" : "default"}
            onClick={() => {
              if (searching) return;
              onFilter(key === tag ? "" : key);
            }}
          >
            {key}
          </Chip>
        ))}
      </div>

      <Card className="p-2 mt-4">
        {repositories.map((repo) => {
          let like = repo.like;
          if (
            fetcher.formData?.has("id") &&
            fetcher.formData?.get("id") === String(repo.id)
          ) {
            like = fetcher.formData.get("favor") === "1" ? 1 : 0;
          }
          return (
            <div key={repo.id} className="flex py-1 gap-x-1 text-sm">
              <div className="w-8 shrink-0 flex-grow-0">
                <button
                  className="w-6 mr-6 cursor-pointer text-yellow-500"
                  onClick={() => onFavor(repo.id, repo.like === 1 ? "0" : "1")}
                >
                  {like === 1 ? "★" : "☆"}
                </button>
              </div>
              <div className="w-12 shrink-0 flex-grow-0 text-right mr-4">
                {repo.star}
              </div>
              <div className="w-24 shrink-0 flex-grow-0 text-right mr-4">
                {repo.language}
              </div>
              <div className="text-blue-400">
                <a target="_blank" href={repo.ownerUrl!} rel="noreferrer">
                  {repo.owner}
                </a>
                <span className="mx-2">/</span>
                <a target="_blank" href={repo.url!} rel="noreferrer">
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
