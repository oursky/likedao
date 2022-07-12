import React, { useCallback, useEffect, useMemo, useState } from "react";
import cn from "classnames";
import { isBefore, isWithinInterval } from "date-fns";
import { Link } from "react-router-dom";
import Paper from "../common/Paper/Paper";
import Badge from "../common/Badge/Badge";
import AppButton from "../common/Buttons/AppButton";
import LocalizedText from "../common/Localized/LocalizedText";
import { translateAddress, truncateAddress } from "../../utils/address";
import UTCDatetime from "../common/DateTime/UTCDatetime";
import { convertBigNumberToLocalizedIntegerString } from "../../utils/number";
import Config from "../../config/Config";
import { getProposalTypeMessage } from "../proposals/utils";
import { ReactionList, ReactionPicker } from "../reactions";
import { DefaultReactionMap, ReactionType } from "../reactions/ReactionModel";
import ProposalStatusBadge from "../proposals/ProposalStatusBadge";
import { ProposalStatus } from "../../generated/graphql";
import AppRoutes from "../../navigation/AppRoutes";
import { useQueryClient } from "../../providers/QueryClientProvider";
import { Proposal } from "./ProposalDetailScreenModel";

const CoinDenom = Config.chainInfo.currency.coinDenom;

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
    remainingVotingDuration,
    depositTotal,
    turnout,
  } = proposal;

  const totalDepositString = useMemo(() => {
    if (depositTotal.lt(1)) {
      return depositTotal.toFixed(3);
    }
    return convertBigNumberToLocalizedIntegerString(depositTotal);
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

        <Badge color="likecoin-yellow">
          <LocalizedText
            messageID="ProposalDetail.votingDurationRemaining"
            messageArgs={{ duration: remainingVotingDuration }}
          />
        </Badge>
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
          <p>{`${totalDepositString} ${CoinDenom}`}</p>
        </div>
        <div className={cn("flex", "flex-col", "items-center", "grow")}>
          <LocalizedText messageID="ProposalDetail.turnOut" />
          <p>{turnout != null ? `${(turnout * 100).toFixed(2)}%` : "-"}</p>
        </div>
      </div>
    </div>
  );
};

const ProposalTypeAndProposer: React.FC<{ proposal: Proposal }> = ({
  proposal,
}) => {
  const { type, proposerAddress, submitTime } = proposal;

  const [proposerName, setProposerName] = useState<string>();
  const { desmosQuery } = useQueryClient();

  useEffect(() => {
    desmosQuery
      .getProfile(translateAddress(proposerAddress, "desmos"))
      .then((res) => {
        if (res) {
          setProposerName(res.dtag);
        }
      })
      .catch((err) => {
        console.error("failed to fetch desmos profile =", err);
      });
  }, [desmosQuery, proposerAddress]);

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
        <Link
          to={AppRoutes.OtherPortfolio.replace(":address", proposerAddress)}
        >
          <span className={cn("text-sm", "text-likecoin-green")}>
            {proposerName ?? truncateAddress(proposerAddress)}
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
        </Link>
      </div>
      <UTCDatetime className={cn("text-xs")} date={submitTime} />
    </div>
  );
};

enum ProposalPeriod {
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
      return ProposalPeriod.Deposit;
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
        return ProposalPeriod.Voting;
      }
    }

    return null;
  }, [proposal]);

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
      {proposalPeriod !== null && (
        <AppButton
          size="regular"
          theme="primary"
          className={cn("text-base", "leading-6", "font-medium")}
          messageID={
            proposalPeriod === ProposalPeriod.Voting
              ? "ProposalDetail.voteNow"
              : "ProposalDetail.deposit"
          }
          onClick={
            proposalPeriod === ProposalPeriod.Voting
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
    <Paper>
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
