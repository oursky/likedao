import React, { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import cn from "classnames";
import Config from "../../config/Config";
import { ChainHealth } from "../../generated/graphql";
import { ChainSwitcherItem } from "./ChainSwitcherItem";
import { ChainStatus } from "./ChainStatus";

interface ChainSwitcherProps {
  chainHealth?: ChainHealth;
}

const ChainSwitcher: React.FC<ChainSwitcherProps> = (props) => {
  const { chainInfo, chainLinks } = Config;

  const { chainHealth } = props;

  return (
    <Menu as="div" className={cn("relative", "inline-block", "text-left")}>
      <div className={cn("flex", "items-center")}>
        <Menu.Button
          className={cn(
            "inline-flex",
            "w-full",
            "justify-center",
            "rounded-md"
          )}
        >
          <ChainStatus chainId={chainInfo.chainId} chainHealth={chainHealth} />
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
          <div className={cn("flex", "flex-col", "py-1")}>
            {chainLinks.map((chain, index) => (
              <Menu.Item key={`${chain.chainId}${index}`}>
                {({ active }) => (
                  <ChainSwitcherItem
                    isActive={active || chain.chainId === chainInfo.chainId}
                    chainId={chain.chainId}
                    href={chain.link}
                  />
                )}
              </Menu.Item>
            ))}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export default ChainSwitcher;
