import {
  ActionFunctionArgs,
  json,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import bcrypt from "bcryptjs";
import { db, UserSchema } from "~/db/config.server";
import { userSessionStorage } from "~/session.session";
import { Button, Input } from "@nextui-org/react";

export const action = async (c: ActionFunctionArgs) => {
  const formData = await c.request.formData();

  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (!username || username.length >= 64) {
    return json({
      success: false,
      errors: {
        username: "用户名格式异常",
        password: "",
        other: "",
      },
    });
  } else if (!password || password.length >= 128) {
    return json({
      success: false,
      errors: {
        username: "",
        password: "密码格式异常",
        other: "",
      },
    });
  }

  try {
    await db.insert(UserSchema).values({
      username: username,
      password: await bcrypt.hash(password, 10),
    });
  } catch (err) {
    return json({
      success: false,
      errors: { username: "", password: "", other: (err as Error).message },
    });
  }

  return redirect("/signin");
};

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await userSessionStorage.getSession(
    request.headers.get("Cookie"),
  );

  if (session.has("username")) {
    // Redirect to the home page if they are already signed in.
    return redirect("/");
  }

  const data = { username: session.get("username") };

  return json(data, {
    headers: {
      "Set-Cookie": await userSessionStorage.commitSession(session),
    },
  });
}

export default function Signup() {
  const actionData = useActionData<typeof action>();
  const errors = actionData?.errors;

  return (
    <div className="flex flex-col items-center justify-center pt-12 w-[40%] mx-auto">
      <h1 className="text-xl mb-4">Sign Up</h1>
      <Form method="post" className="rounded-2xl bg-gray-200 p-4 w-96">
        <div className="p-2 flex flex-col gap-3">
          <Input id="username" name="username" label="Username" />
          {errors?.username ? (
            <p className="text-red-500 my-2">{errors.username}</p>
          ) : null}

          <Input
            id="password"
            type="password"
            name="password"
            label="password"
          />
          {errors?.username ? (
            <p className="text-red-500 my-2">{errors.username}</p>
          ) : null}
          {errors?.other ? (
            <p className="text-red-500 my-2">{errors.other}</p>
          ) : null}

          <div className="w-full text-center">
            <Button color="primary" type="submit">
              Sign Up
            </Button>
          </div>
        </div>
      </Form>
    </div>
  );
}
