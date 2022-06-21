import React from "react";
import { toast } from "react-toastify";
import cn from "classnames";
import { useEffectOnce } from "../../hooks/useEffectOnce";
import {
  isRequestStateError,
  isRequestStateLoaded,
} from "../../models/RequestState";
import LoadingSpinner from "../common/LoadingSpinner/LoadingSpinner";
import { useLocale } from "../../providers/AppLocaleProvider";
import { usePortfolioQuery } from "./PortfolioScreenAPI";
import PortfolioPanel from "./PortfolioPanel";

const PortfolioScreen: React.FC = () => {
  const requestState = usePortfolioQuery();
  const { translate } = useLocale();

  useEffectOnce(
    () => {
      if (isRequestStateError(requestState)) {
        toast.error(translate("PortfolioScreen.requestState.error"));
      } else if (isRequestStateLoaded(requestState) && !requestState.data) {
        toast.error(translate("PortfolioScreen.requestState.noData"));
      }
    },
    () =>
      isRequestStateError(requestState) || isRequestStateLoaded(requestState)
  );

  if (!isRequestStateLoaded(requestState)) {
    return (
      <div className={cn("flex", "justify-center", "items-center", "h-full")}>
        <LoadingSpinner />
      </div>
    );
  }

  if (!requestState.data) return null;

  return (
    <div className={cn("flex", "flex-col")}>
      <PortfolioPanel portfolio={requestState.data} />
    </div>
  );
};

export default PortfolioScreen;
