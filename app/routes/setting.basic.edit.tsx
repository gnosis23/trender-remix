import { Card } from "@nextui-org/card";
import {
  ActionFunctionArgs,
  json,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import { requireUser } from "~/session.session";
import {
  addBasicInfo,
  fetchBasicInfo,
  updateBasicInfo,
} from "~/db/basic.server";
import { Form, Link, useLoaderData, useNavigation } from "@remix-run/react";
import { Button, Input } from "@nextui-org/react";

export const loader = async (c: LoaderFunctionArgs) => {
  const user = await requireUser(c.request);
  const basic = await fetchBasicInfo(user.userId);

  return json({
    basic,
  });
};

export const action = async (c: ActionFunctionArgs) => {
  const user = await requireUser(c.request);
  const data = await c.request.formData();
  const nickName = (data.get("nickName") as string) || "";

  const record = await fetchBasicInfo(user.userId);
  if (record) {
    await updateBasicInfo(record.id, nickName);
  } else {
    await addBasicInfo(user.userId, nickName);
  }

  return redirect("/setting/basic");
};

export default function BasicPageEdit() {
  const data = useLoaderData<typeof loader>();
  const navigation = useNavigation();

  return (
    <Card className="p-4 min-h-[600px]">
      <Form method="post" className="space-y-4">
        <Input
          label="Nick Name"
          name="nickName"
          defaultValue={data.basic?.nickName || ""}
        />
        <div className="text-center">
          <Link to="/setting/basic">
            <Button
              className="mr-4"
              disabled={navigation.state === "submitting"}
            >
              Cancel
            </Button>
          </Link>

          <Button
            type="submit"
            color="warning"
            disabled={navigation.state === "submitting"}
          >
            Submit
          </Button>
        </div>
      </Form>
    </Card>
  );
}
