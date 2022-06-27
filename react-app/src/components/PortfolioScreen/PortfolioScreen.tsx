import React, { useEffect } from "react";
import cn from "classnames";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import { useLocale } from "../../providers/AppLocaleProvider";
import {
  isRequestStateError,
  isRequestStateLoaded,
} from "../../models/RequestState";
import LoadingSpinner from "../common/LoadingSpinner/LoadingSpinner";
import AppRoutes from "../../navigation/AppRoutes";
import { ConnectionStatus, useWallet } from "../../providers/WalletProvider";
import PortfolioPanel from "./PortfolioPanel";
import { usePortfolioQuery } from "./PortfolioScreenAPI";

const PortfolioScreen: React.FC = () => {
  const { translate } = useLocale();
  const { address } = useParams();
  const requestState = usePortfolioQuery(address);
  const navigate = useNavigate();
  const wallet = useWallet();

  useEffect(() => {
    if (wallet.status === ConnectionStatus.Idle && !address) {
      // open connect wallet dialog
      wallet.openConnectWalletModal();
    }
  }, [address, wallet]);

  useEffect(() => {
    if (wallet.status !== ConnectionStatus.Connected) {
      return;
    }

    if (isRequestStateError(requestState)) {
      if (requestState.error.message === "Invalid address.") {
        navigate(AppRoutes.ErrorInvalidAddress);
      } else if (requestState.error.message.includes("Wallet not connected")) {
        // do nothing
      } else {
        toast.error(translate("PortfolioScreen.requestState.error"));
      }
    } else if (isRequestStateLoaded(requestState) && !requestState.data) {
      toast.error(translate("PortfolioScreen.requestState.noData"));
    }
  }, [navigate, requestState, translate, wallet]);

  if (!isRequestStateLoaded(requestState)) {
    return <LoadingSpinner />;
  }

  if (!requestState.data) return null;

  return (
    <div className={cn("flex", "flex-col")}>
      <PortfolioPanel portfolio={requestState.data} />
    </div>
  );
};

export default PortfolioScreen;
