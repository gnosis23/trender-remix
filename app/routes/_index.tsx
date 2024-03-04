import { json, type MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { desc, gt } from "drizzle-orm";
import { RepositorySchema, db } from "~/db/config.server";

export const meta: MetaFunction = () => {
  return [
    { title: "Trender Remix" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export const loader = async () => {
  const date = new Date();
  date.setDate(date.getDate() - 3);
  const result = await db
    .select()
    .from(RepositorySchema)
    .where(gt(RepositorySchema.created, date))
    .orderBy(desc(RepositorySchema.star))
    .limit(50);
  return json(result);
};

export default function Index() {
  const data = useLoaderData<typeof loader>();
  return (
    <div
      style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}
      className="p-4 w-[40%] mx-auto"
    >
      <h1 className="text-xl py-4">Github Trend</h1>
      <ul>
        <li className="flex leading-8">
          <span className="w-20 shrink-0">Stars</span>
          <div>Name</div>
        </li>
        {data.map((item) => (
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
