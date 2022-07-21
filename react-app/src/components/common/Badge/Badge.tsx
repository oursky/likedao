import React from "react";
import cn from "classnames";

export type BadgeColor =
  | "likecoin-yellow"
  | "yellow"
  | "green"
  | "blue"
  | "red"
  | "grey"
  | "purple";

const ColorClasses: Record<BadgeColor, string[]> = {
  "likecoin-yellow": ["bg-app-yellow"],
  yellow: ["bg-yellow-100", "text-yellow-800"],
  green: ["bg-green-100", "text-green-800"],
  red: ["bg-red-100", "text-red-800"],
  blue: ["bg-blue-100", "text-blue-800"],
  grey: ["bg-grey-100", "text-grey-800"],
  purple: ["bg-purple-100", "text-purple-800"],
};

const Badge: React.FC<{
  className?: string;
  children?: React.ReactNode;
  color: BadgeColor;
}> = ({ children, color }) => (
  <span
    className={cn(
      ...ColorClasses[color],
      "rounded-xl",
      "px-3",
      "py-0.5",
      "text-sm",
      "leading-5",
      "font-medium"
    )}
  >
    {children}
  </span>
);

export default Badge;
