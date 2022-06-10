import React from "react";
import cn from "classnames";
import { Icon, IconType } from "../Icons/Icons";

interface LoadingSpinnerProps {
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = (props) => {
  const { className } = props;
  return (
    <div className={cn("flex", "items-center", "justify-center", className)}>
      <Icon
        icon={IconType.Ellipse}
        width={24}
        height={24}
        className={cn("animate-spin")}
      />
    </div>
  );
};

export default LoadingSpinner;
