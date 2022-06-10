import React, { useMemo } from "react";
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

  const [isScreenLoading, screenData] = useMemo(() => {
    if (
      isRequestStateInitial(communityStatusRequestState) ||
      isRequestStateLoading(communityStatusRequestState)
    ) {
      return [true, null];
    }

    if (isRequestStateError(communityStatusRequestState)) {
      return [false, null];
    }

    return [false, communityStatusRequestState.data];
  }, [communityStatusRequestState]);

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
        isLoading={isScreenLoading}
        communityStatus={screenData}
      />
      <p>Other Content</p>
    </div>
  );
};

export default OverviewScreen;
