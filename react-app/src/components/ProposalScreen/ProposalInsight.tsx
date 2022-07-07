import React, { useMemo } from "react";
import cn from "classnames";
import { ProposalStatus } from "../../generated/graphql";
import UTCDatetime from "../common/DateTime/UTCDatetime";
import LocalizedText from "../common/Localized/LocalizedText";
import { MessageID } from "../../i18n/LocaleModel";
import VoteOptionIndicator from "../ProposalVoteOption/VoteOptionIndicator";
import { Proposal } from "./ProposalScreenModel";

interface ProposalInsightProps {
  proposal: Proposal;
}

const ProposalInsight: React.FC<ProposalInsightProps> = (props) => {
  const { proposal } = props;

  const [insightTimeMessage, insightTime] = useMemo((): [
    MessageID | null,
    Date | null
  ] => {
    switch (true) {
      case proposal.status === ProposalStatus.DepositPeriod &&
        proposal.depositEndTime != null:
        return [
          "ProposalScreen.insight.depositEndTime",
          proposal.depositEndTime,
        ];
      case proposal.votingEndTime != null:
        return ["ProposalScreen.insight.votingEndTime", proposal.votingEndTime];
      default:
        return [null, null];
    }
  }, [proposal]);

  return (
    <div className={cn("flex", "flex-row", "gap-x-2.5")}>
      {insightTimeMessage != null && insightTime != null && (
        <div className={cn("flex", "flex-col")}>
          <span
            className={cn("text-2xs", "leading-5", "font-medium", "text-black")}
          >
            <LocalizedText messageID={insightTimeMessage} />
          </span>
          <UTCDatetime
            className={cn("text-sm", "leading-5", "font-medium", "text-black")}
            date={new Date(insightTime)}
          />
        </div>
      )}
      {proposal.tallyResult?.outstandingOption != null && (
        <div className={cn("flex", "flex-col")}>
          <span
            className={cn("text-2xs", "leading-5", "font-medium", "text-black")}
          >
            <LocalizedText messageID="ProposalScreen.insight.mostVoted" />
          </span>
          <span
            className={cn("text-sm", "leading-5", "font-medium", "text-black")}
          >
            <VoteOptionIndicator
              option={proposal.tallyResult.outstandingOption}
            />
          </span>
        </div>
      )}
    </div>
  );
};

export { ProposalInsight };
