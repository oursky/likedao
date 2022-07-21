import React, { useCallback, useMemo } from "react";
import cn from "classnames";
import { Reaction } from "@charkour/react-reactions";
import { getReactionType, ReactionType } from "./ReactionModel";

import "./ReactionBadge.module.scss";

export type ReactionBadgeTheme = "white" | "grey";

interface ReactionBadgeProps {
  theme?: ReactionBadgeTheme;
  reaction: Reaction;
  count: number;
  isActive?: boolean;
  className?: string;
  onClick?: (reactionType: ReactionType) => void;
}

export const ReactionBadge: React.FC<ReactionBadgeProps> = (props) => {
  const {
    className,
    reaction,
    count,
    isActive,
    onClick,
    theme = "white",
  } = props;

  const backgroundColorClass = useMemo(() => {
    switch (theme) {
      case "white":
        return "bg-white";
      case "grey":
        return "bg-app-lightergrey";
      default:
        throw new Error("Unknown theme");
    }
  }, [theme]);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const reactionType = getReactionType(reaction.label);
      if (reactionType == null) return;
      onClick?.(reactionType);
    },
    [reaction, onClick]
  );

  return (
    <button
      disabled={!onClick}
      type="button"
      onClick={handleClick}
      className={cn(
        "flex",
        "flex-row",
        "bg-white",
        "rounded-full",
        "items-center",
        "pr-4",
        "h-9",
        isActive ? "bg-app-secondarygreen" : backgroundColorClass,
        !onClick && "pointer-events-none",
        className
      )}
    >
      <div
        className={cn(
          "flex",
          "items-center",
          "justify-center",
          "h-9",
          "w-9",
          "rounded-full",
          "bg-app-lightgrey"
        )}
      >
        <div
          className={cn("reactionBadgeNode", "p-1", "text-xl", "leading-none")}
        >
          {reaction.node}
        </div>
      </div>
      <span
        className={cn(
          "ml-2",
          "text-sm",
          "leading-4",
          "font-medium",
          "text-black"
        )}
      >
        {count}
      </span>
    </button>
  );
};
