import { Card } from "@nextui-org/card";
import { json, LoaderFunctionArgs } from "@remix-run/node";
import { requireUser } from "~/session.session";
import { fetchBasicInfo } from "~/db/basic.server";
import { Link, useLoaderData } from "@remix-run/react";
import { Button } from "@nextui-org/react";

export const loader = async (c: LoaderFunctionArgs) => {
  const user = await requireUser(c.request);
  const basic = await fetchBasicInfo(user.userId);

  return json({
    basic,
  });
};

export default function BasicPage() {
  const data = useLoaderData<typeof loader>();

  return (
    <Card className="p-4 min-h-[600px]">
      <div className="space-y-2">
        <div className="flex">
          <div className="w-[150px] mr-4">Nick Name:</div>
          <div>{data.basic?.nickName ?? "--"}</div>
        </div>
        <div className="text-center">
          <Link to="edit">
            <Button>Edit</Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
