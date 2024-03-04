import { ActionFunctionArgs } from "@remix-run/node";
import { logout } from "~/session.session";

export const action = async (c: ActionFunctionArgs) => {
  return await logout(c.request);
};

export default function LogoutPage() {
  return <div />;
}
