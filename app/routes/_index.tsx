import { json, LoaderFunctionArgs, type MetaFunction } from "@remix-run/node";
import { Form, Link, useLoaderData } from "@remix-run/react";
import { desc, gt } from "drizzle-orm";
import { RepositorySchema, db } from "~/db/config.server";
import { auth } from "~/session.session";

export const meta: MetaFunction = () => {
  return [
    { title: "Trender Remix" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export const loader = async (c: LoaderFunctionArgs) => {
  const date = new Date();
  date.setDate(date.getDate() - 3);
  const repositories = await db
    .select()
    .from(RepositorySchema)
    .where(gt(RepositorySchema.created, date))
    .orderBy(desc(RepositorySchema.star))
    .limit(50);

  const user = await auth(c.request);

  return json({
    repositories,
    user,
  });
};

export default function Index() {
  const data = useLoaderData<typeof loader>();
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

      <ul className="mt-4">
        <li className="flex leading-8">
          <span className="w-20 shrink-0">Stars</span>
          <div>Name</div>
        </li>
        {data.repositories.map((item) => (
          <li key={item.id} className="flex leading-8">
            <span className="w-20 shrink-0">{item.star}</span>
            <a
              target="_blank"
              href={item.url!}
              rel="noreferrer"
              className="text-blue-400"
            >
              {item.name}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
