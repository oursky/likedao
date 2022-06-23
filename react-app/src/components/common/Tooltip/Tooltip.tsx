import React, { Fragment } from "react";
import cn from "classnames";
import { Transition } from "@headlessui/react";

interface TooltipProps extends React.HTMLAttributes<HTMLDivElement> {
  content: React.ReactNode | string;
}

const Tooltip = React.forwardRef<HTMLDivElement, TooltipProps>((props, ref) => {
  const { content, ...rest } = props;
  return (
    <div ref={ref} {...rest}>
      <Transition
        show={true}
        static={true}
        as={Fragment}
        enter="transition-opacity duration-150"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity duration-150"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div
          role="tooltip"
          className={cn(
            "bg-gray-600",
            "text-white",
            "text-xs",
            "h-min",
            "py-1",
            "px-2",
            "rounded-md",
            "z-50",
            "transition-opacity"
          )}
        >
          {content}
        </div>
      </Transition>
    </div>
  );
});

export default Tooltip;
