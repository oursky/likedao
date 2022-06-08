import React, { useEffect } from "react";
import cn from "classnames";
import { Icon, IconType } from "../common/Icons/Icons";
import LocalizedText from "../common/Localized/LocalizedText";
import AppButton from "../common/Buttons/AppButton";
import AppRoutes from "../../navigation/AppRoutes";
import {
  isRequestStateError,
  isRequestStateInitial,
  isRequestStateLoading,
} from "../../models/RequestState";
import { useProposalsQuery } from "./ProposalScreenAPI";

const PROPOSAL_LIST_PAGE_SIZE = 5;

const ProposalScreen: React.FC = () => {
  const { requestState, fetch } = useProposalsQuery(0, PROPOSAL_LIST_PAGE_SIZE);

  useEffect(() => {
    // TODO: Should fetch based on offset
    fetch();
  }, [fetch]);

  if (
    isRequestStateLoading(requestState) ||
    isRequestStateInitial(requestState)
  ) {
    return <p>Loading...</p>;
  }

  if (isRequestStateError(requestState)) {
    return <p>{`Failed to load: ${requestState.error.message}`}</p>;
  }

  return (
    <div
      className={cn(
        "flex-1",
        "bg-white",
        "rounded-lg",
        "drop-shadow",
        "px-5",
        "py-6",
        "h-min",
        "w-full"
      )}
    >
      <div className={cn("flex", "flex-row", "gap-x-2.5", "items-center")}>
        <Icon
          icon={IconType.Vote}
          fill="currentColor"
          height={24}
          width={24}
          className={cn("text-likecoin-black")}
        />
        <h1
          className={cn(
            "text-lg",
            "leading-none",
            "font-bold",
            "text-likecoin-black"
          )}
        >
          <LocalizedText messageID="ProposalScreen.title" />
        </h1>
      </div>

      <div className={cn("flex", "flex-col", "mt-9")}>
        <div
          className={cn(
            "w-full",
            "flex",
            "flex-row",
            "gap-x-2.5",
            "justify-between"
          )}
        >
          <div
            className={cn(
              "w-full",
              "max-w-[320px]",
              "bg-blue-400",
              "flex",
              "items-center",
              "justify-center"
            )}
          >
            Search Bar
          </div>
          <AppButton
            className={cn("whitespace-nowrap")}
            type="link"
            size="small"
            theme="primary"
            messageID="ProposalScreen.newProposal"
            to={AppRoutes.NewProposal}
          />
        </div>
        <div className={cn("mt-7", "flex", "flex-col")}>
          {requestState.data.proposals.map((proposal) => (
            <p key={proposal.proposalId}>{proposal.proposalId}</p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProposalScreen;
