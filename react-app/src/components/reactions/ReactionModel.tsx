import React from "react";
import { Reaction } from "@charkour/react-reactions";
import { Icon, IconType } from "../common/Icons/Icons";

export enum ReactionType {
  Likecoin = ":likecoin:",
  Like = ":like:",
  Dislike = ":dislike:",
  Confused = ":confused:",
  Thinking = ":thinking:",
  Bored = ":bored:",
  Whatever = ":whatever:",
}

export function getReactionType(type: string): ReactionType | null {
  switch (type) {
    case ":likecoin:":
      return ReactionType.Likecoin;
    case ":like:":
      return ReactionType.Like;
    case ":dislike:":
      return ReactionType.Dislike;
    case ":confused:":
      return ReactionType.Confused;
    case ":thinking:":
      return ReactionType.Thinking;
    case ":bored:":
      return ReactionType.Bored;
    case ":whatever:":
      return ReactionType.Whatever;
    default:
      return null;
  }
}

export const DefaultReactionMap: Record<ReactionType, Reaction> = {
  [ReactionType.Likecoin]: {
    label: ReactionType.Likecoin,
    node: <Icon icon={IconType.LikeCoin} width="1em" height="1em" />,
  },
  [ReactionType.Like]: {
    label: ReactionType.Like,
    node: <span>👍</span>,
  },
  [ReactionType.Dislike]: {
    label: ReactionType.Dislike,
    node: <span>👎</span>,
  },
  [ReactionType.Confused]: {
    label: ReactionType.Confused,
    node: <span>😵‍💫</span>,
  },
  [ReactionType.Thinking]: {
    label: ReactionType.Thinking,
    node: <span>🤔</span>,
  },
  [ReactionType.Bored]: {
    label: ReactionType.Bored,
    node: <span>😴</span>,
  },
  [ReactionType.Whatever]: {
    label: ReactionType.Whatever,
    node: <span>🤷</span>,
  },
};
