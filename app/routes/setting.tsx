import Header from "~/components/Header";
import { ListboxWrapper } from "~/components/ListBoxWrapper";
import { Listbox, ListboxItem } from "@nextui-org/react";
import { Link, Outlet } from "@remix-run/react";

export default function SettingPage() {
  return (
    <div className="p-4 w-[960px] mx-auto">
      <Header />

      <div className="mt-4 flex min-h-[600px]">
        <ListboxWrapper className="mr-4">
          <Listbox variant="faded" aria-label="Listbox menu with icons">
            <ListboxItem key="new">
              <Link to="basic" className="">
                <div className="text-center">Basic Info</div>
              </Link>
            </ListboxItem>
          </Listbox>
        </ListboxWrapper>
        <div className="flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
