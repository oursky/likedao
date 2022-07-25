import React, { useCallback, useLayoutEffect, useState } from "react";
import cn from "classnames";
import { Transition } from "@headlessui/react";
import { usePopper } from "react-popper";
import { Options } from "@popperjs/core";

interface TooltipProps extends React.HTMLAttributes<HTMLDivElement> {
  popperOptions?: Partial<Options>;
  parentElement: HTMLElement | null;
  triggerElement?: HTMLElement | null;
  content: React.ReactNode | string;
}

const Tooltip: React.FC<TooltipProps> = (props) => {
  const { content, popperOptions, parentElement, triggerElement, ...rest } =
    props;

  const [showTooltip, setShowTooltip] = useState<boolean>(false);
  const [tooltipEle, setTooltipEle] = useState<HTMLDivElement | null>(null);

  const { styles, attributes } = usePopper(
    parentElement,
    tooltipEle,
    popperOptions
  );

  const handleMouseEnter = useCallback(() => {
    setShowTooltip(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setShowTooltip(false);
  }, []);

  useLayoutEffect(() => {
    const element = triggerElement ?? parentElement;
    element?.addEventListener("mouseenter", handleMouseEnter);
    element?.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      element?.removeEventListener("mouseenter", handleMouseEnter);
      element?.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [handleMouseEnter, handleMouseLeave, parentElement, triggerElement]);

  return (
    <Transition
      ref={setTooltipEle}
      show={showTooltip}
      static={true}
      style={styles.popper}
      as={"div"}
      enter="transition-opacity duration-150"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="transition-opacity duration-150"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
      {...attributes.popper}
      {...rest}
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
  );
};

export default Tooltip;
