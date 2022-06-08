import React, { useCallback } from "react";
import cn from "classnames";
import { Icon, IconType } from "../Icons/Icons";
import Tooltip from "../Tooltip/Tooltip";

interface IconButtonProps
  extends Omit<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    "onClick" | "type"
  > {
  icon: IconType;
  size: number;
  title?: string;
  tooltip?: React.ReactNode;
  onClick?: () => void;
}

const IconButton: React.FC<IconButtonProps> = (props) => {
  const {
    icon,
    size,
    className,
    title,
    tooltip,
    onClick: onClick_,
    ...rest
  } = props;

  const onClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      onClick_?.();
    },
    [onClick_]
  );

  return (
    <Tooltip title={title} content={tooltip}>
      <button
        type="button"
        className={cn("p-2", "hover:bg-gray-100", "rounded-full", className)}
        onClick={onClick}
        {...rest}
      >
        <Icon icon={icon} height={size} width={size} />
      </button>
    </Tooltip>
  );
};

export default IconButton;
