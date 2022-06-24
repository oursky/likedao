import React, { useMemo } from "react";
import cn from "classnames";
import { toast } from "react-toastify";
import CommunityStatus from "../CommunityStatus/CommunityStatus";
import {
  isRequestStateError,
  isRequestStateInitial,
  isRequestStateLoaded,
  isRequestStateLoading,
} from "../../models/RequestState";
import { useLocale } from "../../providers/AppLocaleProvider";
import { useEffectOnce } from "../../hooks/useEffectOnce";
import { useCommunityStatusQuery } from "./OverviewScreenAPI";

const OverviewScreen: React.FC = () => {
  const communityStatusRequestState = useCommunityStatusQuery();
  const { translate } = useLocale();

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

  useEffectOnce(
    () => {
      if (isRequestStateError(communityStatusRequestState)) {
        toast.error(translate("OverviewScreen.requestState.error"));
      }
    },
    () =>
      isRequestStateError(communityStatusRequestState) ||
      isRequestStateLoaded(communityStatusRequestState)
  );

  return (
    <div className={cn("flex-1", "rounded-lg", "flex", "flex-col", "gap-y-3")}>
      <CommunityStatus
        isLoading={isScreenLoading}
        communityStatus={screenData}
      />
      <p>Other Content</p>
    </div>
  );
};

export default OverviewScreen;
