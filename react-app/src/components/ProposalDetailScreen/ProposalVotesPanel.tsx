import React, { useCallback, useEffect, useMemo } from "react";
import cn from "classnames";
import { useOutletContext, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import TallyResultIndicator from "../TallyResultIndicator/TallyResultIndicator";
import * as SectionedTable from "../SectionedTable/SectionedTable";
import { VoteOption } from "../../models/cosmos/gov";
import LocalizedText from "../common/Localized/LocalizedText";
import {
  isRequestStateError,
  isRequestStateLoaded,
} from "../../models/RequestState";
import PageContoller from "../common/PageController/PageController";
import { useLocale } from "../../providers/AppLocaleProvider";
import {
  Proposal,
  ProposalVote,
  ProposalVoteVoter,
} from "./ProposalDetailScreenModel";
import { useProposalVotesQuery } from "./ProposalDetailScreenAPI";

const PROPOSAL_VOTE_PAGE_SIZE = 5;

const ProposalVoter: React.FC<{ voter: ProposalVoteVoter }> = ({ voter }) => {
  if (voter.__typename === "StringObject") {
    return (
      <span
        className={cn(
          "text-sm",
          "leading-5",
          "font-normal",
          "text-likecoin-green"
        )}
      >
        {voter.value}
      </span>
    );
  }

  if (voter.__typename === "Validator") {
    return (
      <div className={cn("flex", "flex-col", "gap-y-0.5")}>
        <span
          className={cn(
            "text-sm",
            "leading-5",
            "font-medium",
            "text-likecoin-green"
          )}
        >
          {/* eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing */}
          {voter.moniker || voter.operatorAddress}
        </span>
        <span
          className={cn(
            "text-xs",
            "leading-tight",
            "font-medium",
            "text-likecoin-yellow"
          )}
        >
          <LocalizedText messageID="ProposalDetail.votes.voter.validator" />
        </span>
      </div>
    );
  }

  // Should not be reachable
  return null;
};

const ProposalVoteOption: React.FC<{ option: VoteOption | null }> = ({
  option,
}) => {
  switch (option) {
    case VoteOption.Yes:
      return (
        <span
          className={cn(
            "text-sm",
            "leading-5",
            "font-normal",
            "text-likecoin-vote-color-yes"
          )}
        >
          <LocalizedText messageID="proposal.voteOption.yes" />
        </span>
      );
    case VoteOption.No:
      return (
        <span
          className={cn(
            "text-sm",
            "leading-5",
            "font-normal",
            "text-likecoin-vote-color-no"
          )}
        >
          <LocalizedText messageID="proposal.voteOption.no" />
        </span>
      );
    case VoteOption.NoWithVeto:
      return (
        <span
          className={cn(
            "text-sm",
            "leading-5",
            "font-normal",
            "text-likecoin-vote-color-veto"
          )}
        >
          <LocalizedText messageID="proposal.voteOption.noWithVeto" />
        </span>
      );
    case VoteOption.Abstain:
      return (
        <span
          className={cn(
            "text-sm",
            "leading-5",
            "font-normal",
            "text-likecoin-vote-color-abstain"
          )}
        >
          <LocalizedText messageID="proposal.voteOption.abstain" />
        </span>
      );
    case null:
      return (
        <span
          className={cn(
            "text-sm",
            "leading-5",
            "font-normal",
            "text-likecoin-darkgrey"
          )}
        >
          <LocalizedText messageID="ProposalDetail.votes.option.notVoted" />
        </span>
      );
    default:
      // Should not be reachable
      return null;
  }
};

const ProposalVotesPanel: React.FC = () => {
  const proposal = useOutletContext<Proposal>();
  const { translate } = useLocale();
  const [searchParams, setSearchParams] = useSearchParams();

  const currentOffset = useMemo(() => {
    const page = searchParams.get("page") ?? "1";

    return (parseInt(page, 10) - 1) * PROPOSAL_VOTE_PAGE_SIZE;
  }, [searchParams]);

  const { fetch, requestState } = useProposalVotesQuery(
    proposal.id,
    0,
    PROPOSAL_VOTE_PAGE_SIZE
  );

  const setPage = useCallback(
    (after: number) => {
      setSearchParams({
        page: `${Math.floor(after / PROPOSAL_VOTE_PAGE_SIZE) + 1}`,
      });
    },
    [setSearchParams]
  );

  const tableSections =
    useMemo((): SectionedTable.SectionItem<ProposalVote>[] => {
      if (!isRequestStateLoaded(requestState)) {
        return [];
      }
      return [
        {
          titleId: "ProposalDetail.votes.delegatedValidators",
          className: cn(
            "uppercase",
            "bg-likecoin-secondarygreen",
            "text-likecoin-green"
          ),
          items: requestState.data.pinnedVotes,
        },
        {
          titleId: "ProposalDetail.votes.others",
          className: cn(
            "uppercase",
            "bg-likecoin-gold",
            "text-likecoin-darkgrey"
          ),
          items: requestState.data.votes,
        },
      ];
    }, [requestState]);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    fetch({
      first: PROPOSAL_VOTE_PAGE_SIZE,
      after: currentOffset,
      order: {},
    });
  }, [fetch, currentOffset]);

  useEffect(() => {
    if (isRequestStateError(requestState)) {
      toast.error(translate("ProposalDetail.votes.requestState.error"));
    }
  }, [requestState, translate]);

  return (
    <div className={cn("flex", "flex-col", "gap-y-4")}>
      <TallyResultIndicator proposal={proposal} />
      <SectionedTable.Table
        sections={tableSections}
        isLoading={!isRequestStateLoaded(requestState)}
        emptyMessageID="ProposalDetail.votes.empty"
      >
        <SectionedTable.Column<ProposalVote>
          id="voter"
          titleId="ProposalDetail.votes.voter"
          sortable={true}
        >
          {(item) => <ProposalVoter voter={item.voter} />}
        </SectionedTable.Column>
        <SectionedTable.Column<ProposalVote>
          id="option"
          titleId="ProposalDetail.votes.option"
          sortable={true}
        >
          {(item) => <ProposalVoteOption option={item.option ?? null} />}
        </SectionedTable.Column>
      </SectionedTable.Table>
      <PageContoller
        offsetBased={true}
        pageSize={PROPOSAL_VOTE_PAGE_SIZE}
        totalItems={
          isRequestStateLoaded(requestState) ? requestState.data.totalCount : 0
        }
        currentOffset={currentOffset}
        onPageChange={setPage}
      />
    </div>
  );
};

export { ProposalVotesPanel };
