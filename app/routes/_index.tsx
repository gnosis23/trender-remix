import {
  ActionFunctionArgs,
  json,
  LoaderFunctionArgs,
  type MetaFunction,
} from "@remix-run/node";
import {
  Form,
  Link,
  useFetcher,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import { fetchRepositories, TRepository } from "~/db/config.server";
import { requireUser } from "~/session.session";
import { addLike, fetchLike, updateLike } from "~/db/like.server";
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/react";
import React, { Key } from "react";

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

const columns = [
  {
    key: "star",
    label: "Star",
  },
  {
    key: "language",
    label: "Language",
  },
  {
    key: "like",
    label: "Like",
  },
  {
    key: "name",
    label: "Name",
  },
];

export default function Index() {
  const data = useLoaderData<typeof loader>();
  const fetcher = useFetcher();

  const navigation = useNavigation();

  const onFavor = React.useCallback(
    (id: number, favor: string) => {
      if (navigation.state === "submitting") return;
      fetcher.submit(
        { id, favor },
        {
          method: "post",
        },
      );
    },
    [fetcher, navigation],
  );

  const renderCell = React.useCallback(
    (item: TRepository, columnKey: Key) => {
      const cellValue = item[columnKey as keyof TRepository];

      switch (columnKey) {
        case "like":
          return (
            // eslint-disable-next-line jsx-a11y/interactive-supports-focus
            <div
              role="button"
              className="w-6 mr-6 cursor-pointer text-yellow-500"
              onClick={() => onFavor(item.id, item.like === 1 ? "0" : "1")}
              onKeyDown={() => onFavor(item.id, item.like === 1 ? "0" : "1")}
            >
              {item.like === 1 ? "★" : "☆"}
            </div>
          );
        case "name":
          return (
            <a
              target="_blank"
              href={item.url!}
              rel="noreferrer"
              className="text-blue-400"
            >
              {item.name}
            </a>
          );
        default:
          return cellValue;
      }
    },
    [onFavor],
  );

  return (
    <div
      style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}
      className="p-4 w-[600px] mx-auto"
    >
      <div className="flex justify-between items-center content-center">
        <h1 className="text-xl">Github Trend</h1>
      </div>
      {data.user.username ? (
        <div className="flex">
          <div>hello, {data.user.username}</div>
          <Form method="post" action="/logout">
            {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
            <button type="submit" className="text-blue-400 ml-4">
              Logout
            </button>
          </Form>
        </div>
      ) : (
        <div className="text-blue-400">
          <Link to="/signin">Login</Link>
        </div>
      )}

      <Table
        removeWrapper
        aria-label="Example table with dynamic content"
        className="mt-4"
      >
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn key={column.key}>{column.label}</TableColumn>
          )}
        </TableHeader>
        <TableBody items={data.repositories}>
          {(item) => (
            <TableRow key={item.id}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
