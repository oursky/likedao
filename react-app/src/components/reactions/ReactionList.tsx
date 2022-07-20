import React from "react";
import cn from "classnames";
import { Reaction } from "@charkour/react-reactions";
import { ReactionType } from "./ReactionModel";
import { ReactionBadge, ReactionBadgeTheme } from "./ReactionBadge";

export interface ReactionListItem {
  isActive?: boolean;
  reaction: Reaction;
  count: number;
}

interface ReactionListProps {
  items: ReactionListItem[];
  itemTheme?: ReactionBadgeTheme;
  onItemClick?: (reactionType: ReactionType) => void;
}

export const ReactionList: React.FC<ReactionListProps> = (props) => {
  const { items, itemTheme, onItemClick } = props;

  if (items.length === 0) {
    return null;
  }

  return (
    <div className={cn("flex", "flex-row", "gap-x-3")}>
      {items.map((item, index) => (
        <ReactionBadge
          key={index}
          theme={itemTheme}
          reaction={item.reaction}
          isActive={item.isActive}
          count={item.count}
          onClick={onItemClick}
        />
      ))}
    </div>
  );
};
