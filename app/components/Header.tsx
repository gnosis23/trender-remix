import { Form, NavLink } from "@remix-run/react";

export default function Header() {
  return (
    <div className="flex justify-between items-center">
      <div className="flex space-x-4">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `p-1 rounded-lg hover:bg-gray-200 ${
              isActive ? "text-blue-400" : "text-gray-600"
            }`
          }
        >
          Home
        </NavLink>
        <NavLink
          to="/like"
          className={({ isActive }) =>
            `p-1 rounded-lg hover:bg-gray-200 ${
              isActive ? "text-blue-400" : "text-gray-600"
            }`
          }
        >
          Like
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
