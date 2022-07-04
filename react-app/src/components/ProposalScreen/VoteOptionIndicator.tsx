import React, { useMemo } from "react";
import cn from "classnames";
import { MessageID } from "../../i18n/LocaleModel";
import LocalizedText from "../common/Localized/LocalizedText";
import { ProposalVoteOption } from "../../generated/graphql";

function getVoteOptionMessage(option: ProposalVoteOption): MessageID | null {
  switch (option) {
    case ProposalVoteOption.Yes:
      return "proposal.voteOption.yes";
    case ProposalVoteOption.Abstain:
      return "proposal.voteOption.abstain";
    case ProposalVoteOption.No:
      return "proposal.voteOption.no";
    case ProposalVoteOption.NoWithVeto:
      return "proposal.voteOption.noWithVeto";
    default:
      return null;
  }
}

function getVoteOptionIndicatorClassname(
  option: ProposalVoteOption
): string | null {
  switch (option) {
    case ProposalVoteOption.Yes:
      return "bg-likecoin-vote-color-yes";
    case ProposalVoteOption.Abstain:
      return "bg-likecoin-vote-color-abstain";
    case ProposalVoteOption.No:
      return "bg-likecoin-vote-color-no";
    case ProposalVoteOption.NoWithVeto:
      return "bg-likecoin-vote-color-veto";
    default:
      return null;
  }
}

interface VoteOptionIndicatorProps {
  className?: string;
  option: ProposalVoteOption;
}

const VoteOptionIndicator: React.FC<VoteOptionIndicatorProps> = (props) => {
  const { className, option } = props;

  const [voteOptionIndicatorClassName, voteOptionMessage] = useMemo(
    () => [
      getVoteOptionIndicatorClassname(option),
      getVoteOptionMessage(option),
    ],
    [option]
  );

  if (voteOptionIndicatorClassName == null || voteOptionMessage == null) {
    return null;
  }

  return (
    <div
      className={cn("flex", "flex-row", "gap-x-1", "items-center", className)}
    >
      <div
        className={cn(
          "rounded-full",
          "h-1",
          "w-1",
          voteOptionIndicatorClassName
        )}
      />
      <span
        className={cn("text-2xs", "leading-5", "font-medium", "text-black")}
      >
        <LocalizedText messageID={voteOptionMessage} />
      </span>
    </div>
  );
};

export { VoteOptionIndicator };
