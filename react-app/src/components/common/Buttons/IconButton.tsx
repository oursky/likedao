import React, { useCallback } from "react";
import cn from "classnames";
import { Icon, IconType } from "../Icons/Icons";

interface IconButtonProps
  extends Omit<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    "onClick" | "type"
  > {
  icon: IconType;
  size: number;
  onClick?: () => void;
}

const IconButton: React.FC<IconButtonProps> = (props) => {
  const { icon, size, className, onClick: onClick_, ...rest } = props;

  const onClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      onClick_?.();
    },
    [onClick_]
  );

  return (
    <button
      type="button"
      className={cn("p-2", className)}
      onClick={onClick}
      {...rest}
    >
      <Icon icon={icon} height={size} width={size} />
    </button>
  );
};

export default IconButton;
