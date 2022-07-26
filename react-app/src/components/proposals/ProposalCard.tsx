import React, { useMemo } from "react";
import cn from "classnames";
import BigNumber from "bignumber.js";
import AppButton from "../common/Buttons/AppButton";
import AppRoutes from "../../navigation/AppRoutes";
import LocalizedText from "../common/Localized/LocalizedText";
import ColorBar, { ColorBarData } from "../common/ColorBar/ColorBar";
import { ReactionList } from "../reactions";
import { DefaultReactionMap } from "../reactions/ReactionModel";
import { ProposalInsight } from "../ProposalScreen/ProposalInsight";
import { getProposalTypeMessage } from "./utils";
import ProposalStatusBadge from "./ProposalStatusBadge";
import { Proposal } from "./ProposalModel";

interface ProposalCardProps {
  proposal: Proposal;
}

const ProposalCard: React.FC<ProposalCardProps> = (props) => {
  const { proposal } = props;

  const voteData = useMemo(
    (): ColorBarData[] => [
      {
        value: new BigNumber(proposal.tallyResult?.yes ?? 0),
        colorClassName: "bg-app-vote-color-yes",
      },
      {
        value: new BigNumber(proposal.tallyResult?.no ?? 0),
        colorClassName: "bg-app-vote-color-no",
      },
      {
        value: new BigNumber(proposal.tallyResult?.noWithVeto ?? 0),
        colorClassName: "bg-app-vote-color-veto",
      },
      {
        value: new BigNumber(proposal.tallyResult?.abstain ?? 0),
        colorClassName: "bg-app-vote-color-abstain",
      },
    ],
    [proposal]
  );

  const reactionItems = useMemo(() => {
    return proposal.reactions.map((r) => {
      return {
        reaction: DefaultReactionMap[r.type],
        count: r.count,
      };
    });
  }, [proposal]);

  return (
    <div
      className={cn(
        "flex",
        "flex-col",
        "bg-app-lightergrey",
        "rounded-xl",
        "p-2.5",
        "gap-y-2.5"
      )}
    >
      <div
        className={cn(
          "flex",
          "flex-row",
          "justify-start",
          "items-center",
          "gap-x-3"
        )}
      >
        <span
          className={cn("text-xs", "leading-5", "text-black", "font-medium")}
        >
          #{proposal.proposalId}
        </span>
        <ProposalStatusBadge status={proposal.status} />
      </div>
      <div className={cn("flex", "flex-col", "gap-y-1")}>
        <span
          className={cn(
            "text-xs",
            "leading-5",
            "font-medium",
            "text-app-darkgrey"
          )}
        >
          <LocalizedText messageID={getProposalTypeMessage(proposal.type)} />
        </span>
        <h1
          className={cn(
            "text-sm",
            "leading-5",
            "font-medium",
            "text-app-green"
          )}
        >
          {proposal.title}
        </h1>
      </div>
      <ProposalInsight proposal={proposal} />

      <div className={cn("h-1.5")}>
        <ColorBar data={voteData} />
      </div>

      <div
        className={cn(
          "flex",
          "flex-row",
          reactionItems.length !== 0 ? "justify-between" : "justify-end"
        )}
      >
        <ReactionList items={reactionItems} />
        <AppButton
          className={cn("self-end")}
          type="link"
          theme="secondary"
          size="small"
          messageID="ProposalScreen.proposalCard.viewDetails"
          to={AppRoutes.ProposalDetail.replace(
            ":id",
            proposal.proposalId.toString()
          )}
        />
      </div>
    </div>
  );
};

export default ProposalCard;
