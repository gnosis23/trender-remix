import Header from "~/components/Header";
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/react";
import { Form, useLoaderData, useNavigation } from "@remix-run/react";
import { ActionFunctionArgs, json, LoaderFunctionArgs } from "@remix-run/node";
import { requireUser } from "~/session.session";
import { TRepository } from "~/db/home.server";
import { fetchMyLikes, removeLike } from "~/db/like.server";
import React, { Key } from "react";

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
    key: "name",
    label: "Name",
  },
  {
    key: "Operation",
    label: "Operation",
  },
];

export const loader = async (c: LoaderFunctionArgs) => {
  const user = await requireUser(c.request);
  const repositories = await fetchMyLikes(user.userId);

  return json({
    repositories,
  });
};

export const action = async (c: ActionFunctionArgs) => {
  const user = await requireUser(c.request);
  const formData = await c.request.formData();
  const id = Number(formData.get("id"));
  if (Number.isNaN(id)) {
    return null;
  }

  await removeLike(id, user.userId);
  return null;
};

export default function Like() {
  const data = useLoaderData<typeof loader>();
  const navigation = useNavigation();

  const renderCell = React.useCallback(
    (item: TRepository, columnKey: Key) => {
      const cellValue = item[columnKey as keyof TRepository];

      switch (columnKey) {
        case "Operation":
          return (
            <Form method="post">
              <input name="id" type="hidden" value={item.id} />
              <button
                type="submit"
                className="hover:text-blue-400"
                disabled={navigation.state === "submitting"}
              >
                delete
              </button>
            </Form>
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
    [navigation],
  );

  return (
    <div className="p-4 w-[960px] mx-auto">
      <Header />

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
