import React from "react";
import cn from "classnames";
import { Proposal } from "../../generated/graphql";
import Paper from "../common/Paper/Paper";
import Badge from "../common/Badge/Badge";
import AppButton from "../common/Buttons/AppButton";
import LocalizedText from "../common/Localized/LocalizedText";
import { truncateAddress } from "../../utils/address";
import UTCDatetime from "../common/DateTime/UTCDatetime";

const ProposalHeader: React.FC<{ proposal: Proposal }> = ({ proposal }) => {
  const {
    id,
    title,
    status,
    votingStartTime,
    votingEndTime,
    type,
    proposerAddress,
    submitTime,
  } = proposal;

  const daysRemaining = votingEndTime
    ? votingEndTime.getDate() - new Date().getDate()
    : -1;

  return (
    <Paper>
      <div className={cn("flex", "flex-col", "gap-x-2.5", "items-center")}>
        <div className={cn("text-xs", "mb-4")}>#{id}</div>
        <h1
          className={cn(
            "text-3xl",
            "leading-none",
            "text-center",
            "text-likecoin-green"
          )}
        >
          {title}
        </h1>
      </div>
      <div className={cn("flex", "flex-col", "my-4", "items-center")}>
        <Badge color="yellow">{status}</Badge>
      </div>
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
            "text-sm"
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
          {daysRemaining > 0 && (
            <Badge color="likecoin-yellow">
              <LocalizedText
                messageID="ProposalDetail.votingDaysRemaining"
                messageArgs={{ days: daysRemaining }}
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
            "mt-5"
          )}
        >
          <div className={cn("flex", "flex-col", "items-center", "grow")}>
            <LocalizedText messageID="ProposalDetail.deposit" />
            <p>100,000 LIKE</p>
          </div>
          <div className={cn("flex", "flex-col", "items-center", "grow")}>
            <LocalizedText messageID="ProposalDetail.turnOut" />
            <p>16%</p>
          </div>
        </div>
      </div>
      <div
        className={cn("my-4", "p-6", "bg-likecoin-lightergrey", "rounded-xl")}
      >
        <p className={cn("text-sm", "text-likecoin-lightgreen", "mb-1")}>
          <LocalizedText messageID="ProposalDetail.proposalType" />
        </p>
        <p className={cn("text-sm", "mb-4")}>{type}</p>
        <p className={cn("text-sm", "text-likecoin-lightgreen", "mb-1")}>
          <LocalizedText messageID="ProposalDetail.publishedBy" />
        </p>
        <div>
          {/* TODO: Get proposer name */}
          <span className={cn("text-sm", "text-likecoin-green")}>
            joggerpant23
          </span>
          <span className={cn("text-xs", "text-likecoin-lightgreen", "ml-2")}>
            {truncateAddress(proposerAddress)}
          </span>
        </div>
        <UTCDatetime className={cn("text-xs")} date={submitTime} />
      </div>
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
            messageID="ProposalDetail.addReaction"
          />
        </div>
        <AppButton
          size="regular"
          theme="primary"
          messageID="ProposalDetail.voteNow"
        />
      </div>
    </Paper>
  );
};

export default ProposalHeader;
