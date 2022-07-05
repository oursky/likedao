import React from "react";
import cn from "classnames";
import LocalizedText from "../common/Localized/LocalizedText";
import ProposalCard from "./ProposalCard";
import { Proposal } from "./ProposalModel";

interface ProposalListProps {
  className?: string;
  proposals: Proposal[];
}

const ProposalList: React.FC<ProposalListProps> = (props) => {
  const { proposals, className } = props;

  if (proposals.length === 0) {
    return (
      <div
        className={cn(
          "h-96",
          "flex",
          "items-center",
          "justify-center",
          className
        )}
      >
        <span className={cn("font-bold", "text-xl", "leading-5", "text-black")}>
          <LocalizedText messageID="ProposalScreen.noProposals" />
        </span>
      </div>
    );
  }

  return (
    <div className={cn("flex", "flex-col", "gap-y-4", className)}>
      {proposals.map((proposal) => (
        <ProposalCard key={proposal.proposalId} proposal={proposal} />
      ))}
    </div>
  );
};

export { ProposalList };
