import React, { useEffect, useMemo } from "react";
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
import { useWallet } from "../../providers/WalletProvider";
import { useStakesQuery } from "../StakesTablePanel/StakesTablePanelAPI";
import StakesTablePanel from "../StakesTablePanel/StakesTablePanel";
import { useCommunityStatusQuery } from "./OverviewScreenAPI";
import ActiveProposalsPanel from "./RecentProposalsPanel";

const OverviewScreen: React.FC = () => {
  const communityStatusRequestState = useCommunityStatusQuery();
  const {
    requestState: stakesRequestState,
    fetch: fetchStakes,
    order: stakesOrder,
    setOrder: setStakesOrder,
  } = useStakesQuery();

  const { translate } = useLocale();
  const wallet = useWallet();

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
        toast.error(
          translate("OverviewScreen.requestState.communityStatus.error")
        );
      }
    },
    () =>
      isRequestStateError(communityStatusRequestState) ||
      isRequestStateLoaded(communityStatusRequestState)
  );

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    fetchStakes();
  }, [fetchStakes, wallet]);

  useEffectOnce(
    () => {
      if (
        isRequestStateError(stakesRequestState) &&
        !stakesRequestState.error.message.includes("Wallet not connected.")
      ) {
        toast.error(translate("OverviewScreen.requestState.stakes.error"));
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
      <StakesTablePanel
        isLoading={isRequestStateLoading(stakesRequestState)}
        stakes={
          isRequestStateLoaded(stakesRequestState)
            ? stakesRequestState.data
            : null
        }
        isYourPortfolio={true}
        order={stakesOrder}
        setOrder={setStakesOrder}
      />
      <GovernanceInfoPanel />
    </div>
  );
};

export default OverviewScreen;
