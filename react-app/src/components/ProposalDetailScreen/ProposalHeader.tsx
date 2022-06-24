import React, { useMemo } from "react";
import cn from "classnames";
import Paper from "../common/Paper/Paper";
import Badge from "../common/Badge/Badge";
import AppButton from "../common/Buttons/AppButton";
import LocalizedText from "../common/Localized/LocalizedText";
import { truncateAddress } from "../../utils/address";
import UTCDatetime from "../common/DateTime/UTCDatetime";
import { convertBigNumberToLocalizedIntegerString } from "../../utils/number";
import Config from "../../config/Config";
import { getProposalTypeMessage } from "../ProposalStatusBadge/utils";
import ProposalStatusBadge from "../ProposalStatusBadge/ProposalStatusBadge";
import AppRoutes from "../../navigation/AppRoutes";
import { Proposal } from "./ProposalDetailScreenModel";

const ProposalTitle: React.FC<{ proposal: Proposal }> = ({ proposal }) => {
  const { proposalId, title, status } = proposal;

  return (
    <div>
      <div className={cn("flex", "flex-col", "gap-x-2.5", "items-center")}>
        <div className={cn("text-xs", "mb-4")}>#{proposalId}</div>
        <h1
          className={cn(
            "text-3xl",
            "leading-none",
            "text-center",
            "text-likecoin-green",
            "leading-9",
            "font-medium"
          )}
        >
          {title}
        </h1>
      </div>
      <div className={cn("flex", "flex-col", "my-4", "items-center")}>
        <ProposalStatusBadge status={status} />
      </div>
    </div>
  );
};

const ProposalStatistics: React.FC<{ proposal: Proposal }> = ({ proposal }) => {
  const {
    votingStartTime,
    votingEndTime,
    remainingVotingDays,
    depositTotal,
    turnout,
  } = proposal;
  const totalDepositString = useMemo(() => {
    return (
      convertBigNumberToLocalizedIntegerString(depositTotal) +
      " " +
      Config.chainInfo.currency.coinDenom.toUpperCase()
    );
  }, [depositTotal]);

  return (
    <div
      className={cn(
        "flex",
        "flex-col",
        "items-center",
        "justify-around",
        "my-4",
        "p-2",
        "sm:flex-row",
        "sm:items-end"
      )}
    >
      <div
        className={cn(
          "flex",
          "flex-col",
          "items-center",
          "justify-end",
          "grow",
          "text-sm",
          "leading-5",
          "font-medium"
        )}
      >
        <LocalizedText messageID="ProposalDetail.votingPeriod" />
        <p className={cn("mb-1", "text-sm", "text-center")}>
          {votingStartTime && votingEndTime ? (
            <LocalizedText
              messageID="ProposalDetail.votingDateRange"
              messageArgs={{
                from: <UTCDatetime date={votingStartTime} />,
                to: <UTCDatetime date={votingEndTime} />,
              }}
            />
          ) : (
            "-"
          )}
        </p>
        {remainingVotingDays && remainingVotingDays > 0 && (
          <Badge color="likecoin-yellow">
            <LocalizedText
              messageID="ProposalDetail.votingDaysRemaining"
              messageArgs={{ days: remainingVotingDays }}
            />
          </Badge>
        )}
      </div>
      <div
        className={cn(
          "flex",
          "justify-center",
          "items-stretch",
          "grow",
          "w-full",
          "sm:w-1/2",
          "mt-5",
          "text-sm",
          "leading-5",
          "font-medium"
        )}
      >
        <div className={cn("flex", "flex-col", "items-center", "grow")}>
          <LocalizedText messageID="ProposalDetail.deposit" />
          <p>{totalDepositString}</p>
        </div>
        <div className={cn("flex", "flex-col", "items-center", "grow")}>
          <LocalizedText messageID="ProposalDetail.turnOut" />
          <p>{turnout}%</p>
        </div>
      </div>
    </div>
  );
};

const ProposalTypeAndProposer: React.FC<{ proposal: Proposal }> = ({
  proposal,
}) => {
  const { type, proposerAddress, submitTime } = proposal;
  return (
    <div
      className={cn(
        "my-4",
        "p-6",
        "bg-likecoin-lightergrey",
        "rounded-xl",
        "text-sm",
        "leading-5",
        "font-medium"
      )}
    >
      <p className={cn("text-sm", "text-likecoin-lightgreen", "mb-1")}>
        <LocalizedText messageID="ProposalDetail.proposalType" />
      </p>
      <p className={cn("text-sm", "mb-4")}>
        <LocalizedText messageID={getProposalTypeMessage(type)} />
      </p>
      <p className={cn("text-sm", "text-likecoin-lightgreen", "mb-1")}>
        <LocalizedText messageID="ProposalDetail.publishedBy" />
      </p>
      <div>
        {/* TODO: Get proposer name from Desmos API*/}
        <a
          href={AppRoutes.Portfolio.replace(":address", proposerAddress)}
          className={cn("text-sm", "text-likecoin-green")}
        >
          {truncateAddress(proposerAddress)}
        </a>
        <span
          className={cn(
            "text-xs",
            "text-likecoin-lightgreen",
            "ml-2",
            "text-xs"
          )}
        >
          {truncateAddress(proposerAddress)}
        </span>
      </div>
      <UTCDatetime className={cn("text-xs")} date={submitTime} />
    </div>
  );
};

const ProposalActionArea: React.FC = () => {
  return (
    <div
      className={cn(
        "flex",
        "flex-col",
        "sm:flex-row",
        "sm:justify-between",
        "sm:justify-center",
        "my-4",
        "p-2"
      )}
    >
      <div className={cn("inline", "sm:mb-0", "mb-3")}>
        {/* TODO: Insert reactions here */}
        <AppButton
          size="regular"
          theme="rounded"
          className={cn(
            "text-likecoin-green",
            "text-sm",
            "leading-5",
            "font-semibold"
          )}
          messageID="ProposalDetail.addReaction"
        />
      </div>
      <AppButton
        size="regular"
        theme="primary"
        className={cn("text-base", "leading-6", "font-medium")}
        messageID="ProposalDetail.voteNow"
      />
    </div>
  );
};

const ProposalHeader: React.FC<{
  proposal: Proposal;
}> = ({ proposal }) => {
  return (
    <Paper>
      <ProposalTitle proposal={proposal} />
      <ProposalStatistics proposal={proposal} />
      <ProposalTypeAndProposer proposal={proposal} />
      <ProposalActionArea />
    </Paper>
  );
};

export default ProposalHeader;
