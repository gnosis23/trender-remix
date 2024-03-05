import {
  ActionFunctionArgs,
  json,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import {
  Form,
  Link,
  useActionData,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import { Button, Input } from "@nextui-org/react";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db, UserSchema } from "~/db/config.server";
import { createUserSession, userSessionStorage } from "~/session.session";

export const action = async (c: ActionFunctionArgs) => {
  const formData = await c.request.formData();

  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  const users = await db
    .select()
    .from(UserSchema)
    .where(eq(UserSchema.username, username));

  const user = users[0];
  if (!user || !(await bcrypt.compare(password, user.password!))) {
    return json({
      success: false,
      errors: {
        username: "用户名密码不正确",
      },
    });
  }

  return await createUserSession(user.id, username, "/");
};

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await userSessionStorage.getSession(
    request.headers.get("Cookie"),
  );

  if (session.has("userId")) {
    // Redirect to the home page if they are already signed in.
    return redirect("/");
  }

  const data = {
    message: session.get("message"),
  };

  return json(data, {
    headers: {
      "Set-Cookie": await userSessionStorage.commitSession(session),
    },
  });
}

export default function Signin() {
  const actionData = useActionData<typeof action>();
  const { message } = useLoaderData<typeof loader>();
  const errors = actionData?.errors;

  const navigation = useNavigation();

  return (
    <div className="flex flex-col items-center justify-center pt-12 w-[40%] mx-auto">
      <h1 className="text-xl mb-4">Login</h1>
      <Form method="post" className="rounded-2xl bg-gray-200 p-4 w-96">
        <div className="p-2 flex flex-col gap-3">
          {message ? (
            <p className="p-2 bg-yellow-400 text-white rounded-md">{message}</p>
          ) : null}

          <Input
            id="username"
            name="username"
            label="Username"
            isInvalid={!!errors?.username}
            errorMessage={errors?.username}
          />

          <Input
            id="password"
            type="password"
            name="password"
            label="password"
          />

          <div className="w-full text-center">
            <Button
              color="primary"
              type="submit"
              isLoading={navigation.state === "submitting"}
            >
              Sign In
            </Button>
            <Link to="/signup" className="ml-4 text-xs">
              Sign Up
            </Link>
          </div>
        </div>
      </Form>
    </div>
  );
}
