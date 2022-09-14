import React, { useCallback, useMemo } from "react";
import cn from "classnames";
import { isBefore, isWithinInterval } from "date-fns";
import { Link } from "react-router-dom";
import Paper from "../common/Paper/Paper";
import Badge from "../common/Badge/Badge";
import AppButton from "../common/Buttons/AppButton";
import LocalizedText from "../common/Localized/LocalizedText";
import { truncateAddress } from "../../utils/address";
import UTCDatetime from "../common/DateTime/UTCDatetime";
import { convertBigNumberToLocalizedString } from "../../utils/number";
import Config from "../../config/Config";
import { getProposalTypeMessage } from "../proposals/utils";
import { ReactionList, ReactionPicker } from "../reactions";
import { DefaultReactionMap, ReactionType } from "../reactions/ReactionModel";
import ProposalStatusBadge from "../proposals/ProposalStatusBadge";
import { ProposalStatus } from "../../generated/graphql";
import AppRoutes from "../../navigation/AppRoutes";
import { Proposal } from "./ProposalDetailScreenModel";

const CoinDenom = Config.chainInfo.currency.coinDenom;

const ProposalTitle: React.FC<{ proposal: Proposal }> = ({ proposal }) => {
  const { proposalId, title, status } = proposal;

  return (
    <div className={cn("flex", "flex-col", "gap-y-4", "items-center")}>
      <div className={cn("text-xs", "mb-4")}>#{proposalId}</div>
      <h1
        className={cn(
          "text-3xl",
          "leading-none",
          "text-center",
          "text-app-green",
          "leading-9",
          "font-medium",
          "break-all"
        )}
      >
        {title}
      </h1>
      <div className={cn("flex", "flex-col", "items-center")}>
        <ProposalStatusBadge status={status} />
      </div>
    </div>
  );
};

const ProposalPeriod: React.FC<{ proposal: Proposal }> = ({ proposal }) => {
  const {
    depositEndTime,
    submitTime,
    remainingDepositDuration,
    status,
    votingEndTime,
    votingStartTime,
    remainingVotingDuration,
  } = proposal;

  if (status === ProposalStatus.DepositPeriod) {
    return (
      <div className={cn("col-span-2", "flex", "flex-col", "items-center")}>
        <LocalizedText messageID="ProposalDetail.depositPeriod" />

        <p className={cn("mb-1", "text-sm", "text-center")}>
          {depositEndTime ? (
            <LocalizedText
              messageID="ProposalDetail.dateRange"
              messageArgs={{
                from: <UTCDatetime date={submitTime} />,
                to: <UTCDatetime date={depositEndTime} />,
              }}
            />
          ) : (
            "-"
          )}
        </p>
        {remainingDepositDuration && (
          <Badge color="likecoin-yellow">
            <LocalizedText
              messageID="ProposalDetail.durationRemaining"
              messageArgs={{ duration: remainingDepositDuration }}
            />
          </Badge>
        )}
      </div>
    );
  }

  return (
    <div className={cn("col-span-2", "flex", "flex-col", "items-center")}>
      <LocalizedText messageID="ProposalDetail.votingPeriod" />

      <p className={cn("mb-1", "text-sm", "text-center")}>
        {votingStartTime && votingEndTime ? (
          <LocalizedText
            messageID="ProposalDetail.dateRange"
            messageArgs={{
              from: <UTCDatetime date={votingStartTime} />,
              to: <UTCDatetime date={votingEndTime} />,
            }}
          />
        ) : (
          "-"
        )}
      </p>
      {remainingVotingDuration && (
        <Badge color="likecoin-yellow">
          <LocalizedText
            messageID="ProposalDetail.durationRemaining"
            messageArgs={{ duration: remainingVotingDuration }}
          />
        </Badge>
      )}
    </div>
  );
};

const ProposalStatistics: React.FC<{ proposal: Proposal }> = ({ proposal }) => {
  const { depositTotal, turnout } = proposal;

  const totalDepositString = useMemo(() => {
    if (depositTotal.lt(1)) {
      return depositTotal.toFixed(3);
    }
    return convertBigNumberToLocalizedString(depositTotal);
  }, [depositTotal]);

  return (
    <div
      className={cn(
        "p-2.5",
        "grid",
        "grid-rows-2",
        "grid-cols-2",
        "desktop:grid-rows-1",
        "desktop:grid-cols-4",
        "text-sm",
        "leading-5",
        "font-medium",
        "text-center",
        "gap-y-5"
      )}
    >
      <ProposalPeriod proposal={proposal} />
      <div className={cn("flex", "flex-col", "items-center", "grow")}>
        <LocalizedText messageID="ProposalDetail.deposit" />
        <p>{`${totalDepositString} ${CoinDenom}`}</p>
      </div>
      <div className={cn("flex", "flex-col", "items-center", "grow")}>
        <LocalizedText messageID="ProposalDetail.turnOut" />
        <p>{turnout != null ? `${(turnout * 100).toFixed(2)}%` : "-"}</p>
      </div>
    </div>
  );
};

const ProposalTypeAndProposer: React.FC<{ proposal: Proposal }> = ({
  proposal,
}) => {
  const { type, proposerAddress, submitTime } = proposal;

  const typeNameId = getProposalTypeMessage(type);

  return (
    <div
      className={cn(
        "p-6",
        "bg-app-lightergrey",
        "rounded-xl",
        "text-sm",
        "leading-5",
        "font-medium"
      )}
    >
      <p className={cn("text-sm", "text-app-lightgreen", "mb-1")}>
        <LocalizedText messageID="ProposalDetail.proposalType" />
      </p>
      <p className={cn("text-sm", "mb-4")}>
        {typeNameId !== null ? <LocalizedText messageID={typeNameId} /> : type}
      </p>
      <p className={cn("text-sm", "text-app-lightgreen", "mb-1")}>
        <LocalizedText messageID="ProposalDetail.publishedBy" />
      </p>
      <div>
        {proposerAddress ? (
          <Link
            to={AppRoutes.OtherPortfolio.replace(":address", proposerAddress)}
          >
            <span className={cn("text-sm", "text-app-green")}>
              {truncateAddress(proposerAddress)}
            </span>
            <span
              className={cn(
                "text-xs",
                "text-app-lightgreen",
                "ml-2",
                "text-xs"
              )}
            >
              {truncateAddress(proposerAddress)}
            </span>
          </Link>
        ) : (
          <span className={cn("text-sm", "text-app-green")}>-</span>
        )}
      </div>
      <UTCDatetime className={cn("text-xs")} date={submitTime} />
    </div>
  );
};

enum ProposalPeriodType {
  Voting = "voting",
  Deposit = "deposit",
}
interface ProposalActionAreaProps {
  proposal: Proposal;
  onVoteClick: () => void;
  onDepositClick: () => void;
  handleReactionSelect: (type: ReactionType) => void;
}
const ProposalActionArea: React.FC<ProposalActionAreaProps> = (props) => {
  const { proposal, onVoteClick, onDepositClick, handleReactionSelect } = props;

  const reactionItems = useMemo(() => {
    return proposal.reactions.map((r) => {
      return {
        isActive: r.type === proposal.myReaction,
        reaction: DefaultReactionMap[r.type],
        count: r.count,
      };
    });
  }, [proposal]);

  const proposalPeriod = useMemo(() => {
    const now = new Date();

    if (
      proposal.status === ProposalStatus.DepositPeriod &&
      proposal.depositEndTime &&
      isBefore(now, proposal.depositEndTime)
    ) {
      return ProposalPeriodType.Deposit;
    }

    if (
      proposal.status === ProposalStatus.VotingPeriod &&
      proposal.votingStartTime &&
      proposal.votingEndTime
    ) {
      if (
        isWithinInterval(now, {
          start: proposal.votingStartTime,
          end: proposal.votingEndTime,
        })
      ) {
        return ProposalPeriodType.Voting;
      }
    }

    return null;
  }, [proposal]);

  return (
    <div
      className={cn(
        "flex",
        "flex-col",
        "gap-y-4",
        "desktop:flex-row",
        "desktop:justify-between",
        "desktop:justify-center"
      )}
    >
      <div
        className={cn(
          "flex",
          "flex-row",
          "space-x-3",
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
      {proposalPeriod !== null && (
        <AppButton
          size="extra-small"
          theme="primary"
          className={cn("text-base", "leading-6", "font-medium", "px-6")}
          messageID={
            proposalPeriod === ProposalPeriodType.Voting
              ? "ProposalDetail.voteNow"
              : "ProposalDetail.deposit"
          }
          onClick={
            proposalPeriod === ProposalPeriodType.Voting
              ? onVoteClick
              : onDepositClick
          }
        />
      )}
    </div>
  );
};

interface ProposalHeaderProps {
  proposal: Proposal;
  onSetReaction: (type: ReactionType) => void;
  onUnsetReaction: () => void;
  onVoteClick: () => void;
  onDepositClick: () => void;
}
const ProposalHeader: React.FC<ProposalHeaderProps> = (props) => {
  const {
    proposal,
    onSetReaction,
    onUnsetReaction,
    onVoteClick,
    onDepositClick,
  } = props;

  const handleReactionSelect = useCallback(
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
    <Paper className={cn("flex", "flex-col", "gap-y-4")}>
      <ProposalTitle proposal={proposal} />
      <ProposalStatistics proposal={proposal} />
      <ProposalTypeAndProposer proposal={proposal} />
      <ProposalActionArea
        proposal={proposal}
        handleReactionSelect={handleReactionSelect}
        onVoteClick={onVoteClick}
        onDepositClick={onDepositClick}
      />
    </Paper>
  );
};

export default ProposalHeader;
