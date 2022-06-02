import React from "react";
import cn from "classnames";
import CommunityStatus from "../CommunityStatus/CommunityStatus";
import {
  isRequestStateError,
  isRequestStateInitial,
  isRequestStateLoading,
} from "../../models/RequestState";
import { useCommunityStatusQuery } from "./OverviewScreenAPI";

const OverviewScreen: React.FC = () => {
  const communityStatusRequestState = useCommunityStatusQuery();

  if (
    isRequestStateInitial(communityStatusRequestState) ||
    isRequestStateLoading(communityStatusRequestState)
  ) {
    // TODO: Handle loading state
    return <span>Loading...</span>;
  }

  if (isRequestStateError(communityStatusRequestState)) {
    // TODO: Handle error state
    return (
      <span>
        Failed to fetch data: {communityStatusRequestState.error.message}
      </span>
    );
  }

  return (
    <div
      className={cn(
        "flex-1",
        "bg-white",
        "rounded-lg",
        "flex",
        "flex-col",
        "gap-y-3"
      )}
    >
      <CommunityStatus
        inflation={communityStatusRequestState.data.inflation}
        bondedRatio={communityStatusRequestState.data.bondedRatio}
        communityPool={communityStatusRequestState.data.communityPool.amount}
      />
      <p>Other Content</p>
    </div>
  );
};

export default OverviewScreen;
