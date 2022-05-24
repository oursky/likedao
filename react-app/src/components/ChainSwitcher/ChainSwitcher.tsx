import React, { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import cn from "classnames";

const ChainSwitcher: React.FC = () => {
  return (
    <Menu as="div" className={cn("relative", "inline-block", "text-left")}>
      <div>
        <Menu.Button
          className={cn(
            "inline-flex",
            "w-full",
            "justify-center",
            "rounded-md"
          )}
        >
          Dropdown
        </Menu.Button>
      </div>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items
          className={cn(
            "absolute mt-2 w-56 divide-y divide-gray-100 rounded-md bg-white shadow-lg right-0 sm:left-0 sm:right-auto"
          )}
        >
          <div className={cn("px-1", "py-1")}>
            <Menu.Item>
              <p>Test item</p>
            </Menu.Item>
            <Menu.Item>
              <p>Test item 2 </p>
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export default ChainSwitcher;
