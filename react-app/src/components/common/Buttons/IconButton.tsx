import React, { useCallback, useState } from "react";
import cn from "classnames";
import { usePopper } from "react-popper";
import { Icon, IconType } from "../Icons/Icons";
import Tooltip from "../Tooltip/Tooltip";

interface IconButtonProps
  extends Omit<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    "onClick" | "type"
  > {
  icon: IconType;
  size: number;
  tooltip?: React.ReactNode;
  onClick?: () => void;
}

const IconButton: React.FC<IconButtonProps> = (props) => {
  const { icon, size, className, tooltip, onClick: onClick_, ...rest } = props;

  const [showTooltip, setShowTooltip] = useState<boolean>(false);
  const [refEle, setRefEle] = useState<HTMLButtonElement | null>(null);
  const [tooltipEle, setTooltipEle] = useState<HTMLDivElement | null>(null);

  const { styles, attributes, update } = usePopper(refEle, tooltipEle, {
    placement: "bottom",
  });

  const handleMouseEnter = useCallback(() => {
    setShowTooltip(true);
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    update?.();
  }, [update]);

  const handleMouseLeave = useCallback(() => {
    setShowTooltip(false);
  }, []);

  const onClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      onClick_?.();
    },
    [onClick_]
  );
  return (
    <>
      <button
        type="button"
        className={cn("p-2", "hover:bg-gray-100", "rounded-full", className)}
        onClick={onClick}
        ref={setRefEle}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...rest}
      >
        <Icon icon={icon} height={size} width={size} />
      </button>
      {showTooltip && (
        <Tooltip
          ref={setTooltipEle}
          style={styles.popper}
          content={tooltip}
          {...attributes.popper}
        />
      )}
    </>
  );
};

export default IconButton;
