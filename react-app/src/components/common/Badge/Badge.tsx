import React from "react";
import cn from "classnames";

type BadgeColor = "yellow" | "likecoin-yellow";

const ColorClasses: Record<BadgeColor, string[]> = {
  "likecoin-yellow": ["bg-likecoin-yellow"],
  yellow: ["bg-yellow-100", "text-yellow-800"],
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
      "text-sm"
    )}
  >
    {children}
  </span>
);

export default Badge;
