import { Form, NavLink } from "@remix-run/react";

const linkClass = ({
  isActive,
  isPending,
}: {
  isActive: boolean;
  isPending: boolean;
}) =>
  `p-1 rounded-lg hover:bg-gray-200 ${
    isActive ? "text-blue-400" : isPending ? "text-blue-200" : "text-gray-400"
  }`;

export default function Header() {
  return (
    <div className="flex justify-between items-center">
      <div className="flex space-x-4">
        <NavLink to="/" className={linkClass}>
          Home
        </NavLink>
        <NavLink to="/like" className={linkClass}>
          Like
        </NavLink>
        <NavLink to="/setting/basic" className={linkClass}>
          Setting
        </NavLink>
      </div>
      <Form method="post" action="/logout">
        <button type="submit" className="ml-4 text-gray-400">
          Logout
        </button>
      </Form>
    </div>
  );
}
