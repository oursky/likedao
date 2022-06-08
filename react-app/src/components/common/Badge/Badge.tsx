import React from "react";
import cn from "classnames";

type BadgeVariant = "light" | "medium";

type BadgeColor = "yellow";

const ColorClasses = {
  "medium-yellow": ["bg-likecoin-yellow"],
  "light-yellow": ["bg-yellow-100", "text-yellow-800"],
};

const Badge: React.FC<{
  className?: string;
  children?: React.ReactNode;
  variant?: BadgeVariant;
  color?: BadgeColor;
}> = ({ children, variant = "medium", color = "yellow" }) => (
  <span
    className={cn(
      ...ColorClasses[`${variant}-${color}`],
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
