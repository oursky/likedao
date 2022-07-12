import React from "react";
import cn from "classnames";

type ChainSwitcherItemRef = HTMLAnchorElement;
interface ChainSwitcherItemProps {
  isActive: boolean;
  chainId: string;
  href: string;
}

const ChainSwitcherItem: React.FC<ChainSwitcherItemProps> = React.forwardRef<
  ChainSwitcherItemRef,
  ChainSwitcherItemProps
>((props, ref) => {
  const { isActive, chainId, href } = props;
  return (
    <a
      ref={ref}
      href={href}
      className={cn(
        "w-full",
        "py-2",
        "px-4",
        "font-normal",
        "text-sm",
        "leading-5",
        "hover:bg-gray-100",
        isActive ? "text-gray-900" : "text-gray-700"
      )}
    >
      {chainId}
    </a>
  );
});

export { ChainSwitcherItem };
