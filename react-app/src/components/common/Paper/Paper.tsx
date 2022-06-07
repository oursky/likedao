import React from "react";
import cn from "classnames";

const Paper: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <div
    className={cn(
      "flex-1",
      "bg-white",
      "rounded-lg",
      "drop-shadow",
      "px-5",
      "py-6",
      "h-min",
      "w-full",
      "mb-3"
    )}
  >
    {children}
  </div>
);

export default Paper;
