import React from "react";
import cn from "classnames";

interface DividerProps {
  className?: string;
}

const Divider: React.FC<DividerProps> = ({ className }) => {
  return (
    <div
      className={cn("border-b", "border-solid", "border-app-grey", className)}
    />
  );
};

export default Divider;
