import React, { useCallback, useMemo } from "react";
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
import { ReactionList, ReactionPicker } from "../reactions";
import { DefaultReactionMap, ReactionType } from "../reactions/ReactionModel";
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
        <span className={cn("text-sm", "text-likecoin-green")}>
          {truncateAddress(proposerAddress)}
        </span>
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

const ProposalActionArea: React.FC<{
  proposal: Proposal;
  handleReactionSelect: (type: ReactionType) => void;
}> = ({ proposal, handleReactionSelect }) => {
  const { reactions, myReaction } = proposal;
  const reactionItems = useMemo(() => {
    return reactions.map((r) => {
      return {
        isActive: r.type === myReaction,
        reaction: DefaultReactionMap[r.type],
        count: r.count,
      };
    });
  }, [reactions, myReaction]);

  return (
    <div
      className={cn(
        "flex",
        "flex-col",
        "sm:flex-row",
        "sm:justify-between",
        "sm:justify-center",
        "mt-4"
      )}
    >
      <div
        className={cn(
          "flex",
          "flex-row",
          "gap-x-3",
          "sm:mb-0",
          "mb-3",
          "items-center",
          "flex-wrap",
          "gap-y-4"
        )}
      >
        <ReactionList
          items={reactionItems}
          itemTheme="grey"
          onItemClick={handleReactionSelect}
        />
        <ReactionPicker onAddNewReaction={handleReactionSelect} />
      </div>
      <AppButton
        size="extra-small"
        theme="primary"
        className={cn("text-base", "leading-6", "font-medium", "w-36")}
        messageID="ProposalDetail.voteNow"
      />
    </div>
  );
};

const ProposalHeader: React.FC<{
  proposal: Proposal;
  onSetReaction: (type: ReactionType) => void;
  onUnsetReaction: () => void;
}> = ({ proposal, onSetReaction, onUnsetReaction }) => {
  const handleRectionSelect = useCallback(
    (type: ReactionType) => {
      if (type === proposal.myReaction) {
        onUnsetReaction();
      } else {
        onSetReaction(type);
      }
    },
    [onSetReaction, onUnsetReaction, proposal.myReaction]
  );
  return (
    <Paper>
      <ProposalTitle proposal={proposal} />
      <ProposalStatistics proposal={proposal} />
      <ProposalTypeAndProposer proposal={proposal} />
      <ProposalActionArea
        proposal={proposal}
        handleReactionSelect={handleRectionSelect}
      />
    </Paper>
  );
};

export default ProposalHeader;
