import { createCookieSessionStorage, redirect } from "@remix-run/node";

export type UserSessionData = {
  userId: number;
  username: string;
  message?: string;
};

export const userSessionStorage = createCookieSessionStorage<UserSessionData>({
  cookie: {
    name: "__session",
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7, // 过期时间，这里为一天
    path: "/",
    sameSite: "lax",
    // 加密密钥
    secrets: [process.env.SESSION_SECRET as string],
    secure: true,
  },
});

export async function createUserSession(
  userId: number,
  username: string,
  redirectTo: string
) {
  const session = await userSessionStorage.getSession();
  session.set("userId", userId);
  session.set("username", username);

  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await userSessionStorage.commitSession(session),
    },
  });
}

export async function requireUser(
  request: Request,
  redirectTo: string = new URL(request.url).pathname
) {
  const session = await getUserSession(request);
  const userId = session.get("userId");
  if (!userId || typeof userId !== "number") {
    const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
    throw redirect(`/signin?${searchParams}`);
  }
  return { userId, username: session.get("username") } as UserSessionData;
}

function getUserSession(request: Request) {
  return userSessionStorage.getSession(request.headers.get("Cookie"));
}

export async function logout(request: Request) {
  const session = await getUserSession(request);
  return redirect("/signin", {
    headers: {
      "Set-Cookie": await userSessionStorage.destroySession(session),
    },
  });
}
