import React, { useCallback, useEffect, useMemo, useState } from "react";
import cn from "classnames";
import { Link, useOutletContext, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import TallyResultIndicator from "../TallyResultIndicator/TallyResultIndicator";
import * as SectionedTable from "../SectionedTable/SectionedTable";
import { ProposalStatus, VoteOption } from "../../models/cosmos/gov";
import LocalizedText from "../common/Localized/LocalizedText";
import {
  isRequestStateError,
  isRequestStateLoaded,
} from "../../models/RequestState";
import PageContoller from "../common/PageController/PageController";
import { useLocale } from "../../providers/AppLocaleProvider";
import AppButton from "../common/Buttons/AppButton";
import AppRoutes from "../../navigation/AppRoutes";
import { useEffectOnce } from "../../hooks/useEffectOnce";
import { validateEmail } from "../../utils/regex";
import Tooltip from "../common/Tooltip/Tooltip";
import {
  Proposal,
  ProposalVote,
  ProposalVoteVoter,
} from "./ProposalDetailScreenModel";
import {
  ProposalVoteSortableColumn,
  useGovParamsQuery,
  useProposalVotesQuery,
} from "./ProposalDetailScreenAPI";

const PROPOSAL_VOTE_PAGE_SIZE = 5;

const ProposalVoter: React.FC<{ voter: ProposalVoteVoter }> = ({ voter }) => {
  if (voter.__typename === "StringObject") {
    return (
      <Link
        to={AppRoutes.OtherPortfolio.replace(":address", voter.value)}
        className={cn("text-sm", "leading-5", "font-normal", "text-app-green")}
      >
        {voter.value}
      </Link>
    );
  }

  if (voter.__typename === "Validator") {
    return (
      <div className={cn("flex", "flex-col", "gap-y-0.5")}>
        {/* TODO: link to validator portfolio page */}
        <span
          className={cn(
            "text-sm",
            "leading-5",
            "font-medium",
            "text-app-green"
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
            "text-app-yellow"
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
            "text-app-vote-color-yes"
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
            "text-app-vote-color-no"
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
            "text-app-vote-color-veto"
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
            "text-app-vote-color-abstain"
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
            "text-app-darkgrey"
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

const RemindToVoteButton: React.FC<{
  proposal: Proposal;
  vote: ProposalVote;
}> = ({ proposal, vote }) => {
  const { translate } = useLocale();
  const [containerRef, setContainerRef] = useState<HTMLElement | null>(null);
  const [buttonRef, setButtonRef] = useState<HTMLElement | null>(null);

  if (
    vote.option != null ||
    vote.voter.__typename !== "Validator" ||
    proposal.status !== ProposalStatus.VotingPeriod
  ) {
    return null;
  }

  const email = vote.voter.securityContact;
  const validatedEmail: string | null =
    email && validateEmail(email) ? email : null;

  return (
    <div
      ref={setContainerRef}
      className={cn("flex", "cursor-not-allowed", "justify-end")}
    >
      <AppButton
        type="anchor"
        theme="secondary"
        size="regular"
        ref={setButtonRef}
        className={cn(
          "border",
          "border-app-grey",
          validatedEmail == null
            ? cn("bg-gray-300", "pointer-events-none")
            : null
        )}
        messageID="ProposalDetail.votes.remindToVote"
        href={validatedEmail != null ? `mailto:${validatedEmail}` : ""}
      />
      {validatedEmail == null && (
        <Tooltip
          parentElement={buttonRef}
          triggerElement={containerRef}
          content={translate("ProposalDetail.votes.voter.noSecurityContact")}
          popperOptions={{
            placement: "bottom-start",
            modifiers: [{ name: "offset", options: { offset: [20, 10] } }],
          }}
        />
      )}
    </div>
  );
};

const ProposalVotesPanel: React.FC = () => {
  const proposal = useOutletContext<Proposal>();
  const { translate } = useLocale();
  const [searchParams, setSearchParams] = useSearchParams();

  const [currentOffset, sortOrder] = useMemo(() => {
    const page = searchParams.get("page") ?? "1";
    const sortBy = searchParams.get("sortBy");
    const sortDirection = searchParams.get("sortDirection");

    const sortOrder =
      sortBy && sortDirection
        ? {
            id: sortBy as ProposalVoteSortableColumn,
            direction: sortDirection as SectionedTable.ColumnOrder["direction"],
          }
        : undefined;

    const offset = (parseInt(page, 10) - 1) * PROPOSAL_VOTE_PAGE_SIZE;

    return [offset, sortOrder];
  }, [searchParams]);

  const { fetch, requestState } = useProposalVotesQuery(
    proposal.id,
    0,
    PROPOSAL_VOTE_PAGE_SIZE
  );
  const { requestState: govParamRequestState } = useGovParamsQuery();

  const setPage = useCallback(
    (after: number) => {
      setSearchParams({
        page: `${Math.floor(after / PROPOSAL_VOTE_PAGE_SIZE) + 1}`,
      });
    },
    [setSearchParams]
  );

  const setSortOrder = useCallback(
    (order: SectionedTable.ColumnOrder) => {
      setSearchParams({
        sortBy: order.id,
        sortDirection: order.direction,
      });
    },
    [setSearchParams]
  );

  const quorumParam = useMemo(() => {
    if (isRequestStateLoaded(govParamRequestState)) {
      return (
        govParamRequestState.data?.tally.quorum.toFloatApproximation() ?? null
      );
    }

    return null;
  }, [govParamRequestState]);

  const tableSections =
    useMemo((): SectionedTable.SectionItem<ProposalVote>[] => {
      if (!isRequestStateLoaded(requestState)) {
        return [];
      }
      return [
        {
          titleId: "ProposalDetail.votes.delegatedValidators",
          className: cn("uppercase", "bg-app-secondarygreen", "text-app-green"),
          items: requestState.data.pinnedVotes,
        },
        {
          titleId: "ProposalDetail.votes.others",
          className: cn("uppercase", "bg-app-gold", "text-app-darkgrey"),
          items: requestState.data.votes,
        },
      ];
    }, [requestState]);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    fetch({
      first: PROPOSAL_VOTE_PAGE_SIZE,
      after: currentOffset,
      order: sortOrder
        ? {
            id: sortOrder.id,
            direction: sortOrder.direction,
          }
        : null,
    });
  }, [fetch, currentOffset, sortOrder]);

  useEffect(() => {
    if (isRequestStateError(requestState)) {
      toast.error(translate("ProposalDetail.votes.requestState.error"));
    }
  }, [requestState, translate]);

  useEffectOnce(
    () => {
      if (isRequestStateError(govParamRequestState)) {
        toast.error(translate("ProposalDetail.govParams.requestState.error"), {
          toastId: "gov-params-request-error",
        });
      }
    },
    () =>
      isRequestStateError(govParamRequestState) ||
      isRequestStateLoaded(govParamRequestState)
  );

  return (
    <div className={cn("flex", "flex-col", "gap-y-4")}>
      <TallyResultIndicator proposal={proposal} quorum={quorumParam} />
      <SectionedTable.Table
        sections={tableSections}
        isLoading={!isRequestStateLoaded(requestState)}
        emptyMessageID="ProposalDetail.votes.empty"
        sortOrder={sortOrder}
        onSort={setSortOrder}
      >
        <SectionedTable.Column<ProposalVote>
          id={ProposalVoteSortableColumn.Voter}
          titleId="ProposalDetail.votes.voter"
          sortable={true}
        >
          {(item) => <ProposalVoter voter={item.voter} />}
        </SectionedTable.Column>
        <SectionedTable.Column<ProposalVote>
          id={ProposalVoteSortableColumn.Option}
          titleId="ProposalDetail.votes.option"
          sortable={true}
        >
          {(item) => <ProposalVoteOption option={item.option ?? null} />}
        </SectionedTable.Column>
        <SectionedTable.Column<ProposalVote>
          id="action"
          className={cn("text-right")}
        >
          {(item) => <RemindToVoteButton proposal={proposal} vote={item} />}
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
