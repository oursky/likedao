import React from "react";
import cn from "classnames";
import LocalizedText from "../common/Localized/LocalizedText";
import { ProposalVoteOption } from "../../generated/graphql";
import { getVoteOptionBgCn, getVoteOptionMessage } from "./utils";

interface VoteOptionIndicatorProps {
  className?: string;
  option: ProposalVoteOption;
}

const VoteOptionIndicator: React.FC<VoteOptionIndicatorProps> = (props) => {
  const { className, option } = props;

  return (
    <div
      className={cn("flex", "flex-row", "gap-x-1", "items-center", className)}
    >
      <div
        className={cn("rounded-full", "h-1", "w-1", getVoteOptionBgCn(option))}
      />
      <span
        className={cn("text-2xs", "leading-5", "font-medium", "text-black")}
      >
        <LocalizedText messageID={getVoteOptionMessage(option)} />
      </span>
    </div>
  );
};

export default VoteOptionIndicator;
