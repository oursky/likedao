import React, { useCallback, useState } from "react";
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
  tooltip?: React.ReactNode;
  onClick?: () => void;
}

const IconButton: React.FC<IconButtonProps> = (props) => {
  const { icon, size, className, tooltip, onClick: onClick_, ...rest } = props;

  const [refEle, setRefEle] = useState<HTMLButtonElement | null>(null);

  const onClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      onClick_?.();
    },
    [onClick_]
  );
  return (
    <div className={cn("flex", "items-center", "justify-center", className)}>
      <button
        type="button"
        className={cn("p-2", "hover:bg-gray-100", "rounded-full")}
        onClick={onClick}
        ref={setRefEle}
        {...rest}
      >
        <Icon icon={icon} height={size} width={size} />
      </button>
      {tooltip && (
        <Tooltip
          content={tooltip}
          parentElement={refEle}
          popperOptions={{ placement: "bottom" }}
        />
      )}
    </div>
  );
};

export default IconButton;
