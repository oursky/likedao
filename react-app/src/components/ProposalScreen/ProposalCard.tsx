import React, { useMemo } from "react";
import cn from "classnames";
import BigNumber from "bignumber.js";
import AppButton from "../common/Buttons/AppButton";
import AppRoutes from "../../navigation/AppRoutes";
import {
  ProposalScreenProposalFragment as Proposal,
  ProposalStatus,
  ProposalType,
} from "../../generated/graphql";
import Badge, { BadgeColor } from "../common/Badge/Badge";
import { MessageID } from "../../i18n/LocaleModel";
import LocalizedText from "../common/Localized/LocalizedText";
import ColorBar, { ColorBarData } from "../common/ColorBar/ColorBar";
import { ProposalInsight } from "./ProposalInsight";

function getProposalStatusBadgeConfig(
  status: ProposalStatus
): [MessageID, BadgeColor] {
  switch (status) {
    case ProposalStatus.Passed:
      return ["ProposalScreen.proposalStatus.passed", "green"];
    case ProposalStatus.Rejected:
      return ["ProposalScreen.proposalStatus.rejected", "red"];
    case ProposalStatus.DepositPeriod:
      return ["ProposalScreen.proposalStatus.depositPeriod", "blue"];
    case ProposalStatus.VotingPeriod:
      return ["ProposalScreen.proposalStatus.votingPeriod", "yellow"];
    case ProposalStatus.Invalid:
      return ["ProposalScreen.proposalStatus.invalid", "grey"];
    case ProposalStatus.Failed:
      return ["ProposalScreen.proposalStatus.failed", "purple"];
    default:
      throw new Error(`Unsupported proposal status`);
  }
}

function getProposalTypeMessage(type: ProposalType): MessageID {
  switch (type) {
    case ProposalType.Text:
      return "ProposalScreen.proposalType.text";
    case ProposalType.ParameterChange:
      return "ProposalScreen.proposalType.parameterChange";
    case ProposalType.CommunityPoolSpend:
      return "ProposalScreen.proposalType.communityPoolSpend";
    case ProposalType.SoftwareUpgrade:
      return "ProposalScreen.proposalType.softwareUpgrade";
    case ProposalType.CancelSoftwareUpgrade:
      return "ProposalScreen.proposalType.cancelSoftwareUpgrade";
    default:
      throw new Error("Unknown proposal type");
  }
}
interface ProposalCardProps {
  proposal: Proposal;
}

const ProposalCard: React.FC<ProposalCardProps> = (props) => {
  const { proposal } = props;

  const [statusMessage, statusBadgeColor] = useMemo(
    () => getProposalStatusBadgeConfig(proposal.status),
    [proposal]
  );

  const voteData = useMemo(
    (): ColorBarData[] => [
      {
        value: new BigNumber(proposal.tallyResult?.yes ?? 0).toNumber(),
        colorClassName: "bg-likecoin-vote-color-yes",
      },
      {
        value: new BigNumber(proposal.tallyResult?.no ?? 0).toNumber(),
        colorClassName: "bg-likecoin-vote-color-no",
      },
      {
        value: new BigNumber(proposal.tallyResult?.noWithVeto ?? 0).toNumber(),
        colorClassName: "bg-likecoin-vote-color-veto",
      },
      {
        value: new BigNumber(proposal.tallyResult?.abstain ?? 0).toNumber(),
        colorClassName: "bg-likecoin-vote-color-abstain",
      },
    ],
    [proposal]
  );

  return (
    <div
      className={cn(
        "flex",
        "flex-col",
        "bg-likecoin-lightergrey",
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
        <Badge color={statusBadgeColor}>
          <LocalizedText messageID={statusMessage} />
        </Badge>
      </div>
      <div className={cn("flex", "flex-col", "gap-y-1")}>
        <span
          className={cn(
            "text-xs",
            "leading-5",
            "font-medium",
            "text-likecoin-darkgrey"
          )}
        >
          <LocalizedText messageID={getProposalTypeMessage(proposal.type)} />
        </span>
        <h1
          className={cn(
            "text-sm",
            "leading-5",
            "font-medium",
            "text-likecoin-green"
          )}
        >
          {proposal.title}
        </h1>
      </div>
      <ProposalInsight proposal={proposal} />

      <ColorBar data={voteData} />

      <div className={cn("flex", "flex-row", "justify-end")}>
        {/* TODO: Add reactions */}
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
