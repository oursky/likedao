import React, { useState, Fragment } from "react";
import cn from "classnames";
import { Transition } from "@headlessui/react";

const Tooltip: React.FC<{
  children: React.ReactNode;
  content?: React.ReactNode | string;
}> = ({ children, content }) => {
  const [show, setShow] = useState(false);

  const handleMouseEnter = () => {
    if (content) {
      setShow(true);
    }
  };

  const handleMouseLeave = () => {
    setShow(false);
  };

  return (
    <div
      className={cn("relative", "w-min", "h-min")}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      <Transition
        show={show}
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
            "absolute",
            "bg-gray-600",
            "text-white",
            "text-xs",
            "w-max",
            "py-1",
            "px-2",
            "rounded-md",
            "left-1/2",
            "transform",
            "-translate-x-1/2",
            "translate-y-2",
            "z-50",
            "transition-opacity"
          )}
        >
          {content}
        </div>
      </Transition>
    </div>
  );
};

export default Tooltip;
