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
import GovernanceInfoPanel from "../GovernanceInfoPanel/GovernanceInfoPanel";
import { useCommunityStatusQuery } from "./OverviewScreenAPI";
import ActiveProposalsPanel from "./RecentProposalsPanel";

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
    <div className={cn("flex", "flex-col", "gap-y-3")}>
      <CommunityStatus
        isLoading={isScreenLoading}
        communityStatus={screenData?.communityStatus ?? null}
      />
      <ActiveProposalsPanel proposals={screenData?.proposals ?? []} />
      <GovernanceInfoPanel />
    </div>
  );
};

export default OverviewScreen;
