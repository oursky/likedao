import React, { useCallback, useEffect, useMemo, useState } from "react";
import BigNumber from "bignumber.js";
import { toast } from "react-toastify";
import { useBank } from "../api/bankAPI";
import { useCosmos } from "../api/cosmosAPI";
import { SendTokenFormValues } from "../components/forms/SendTokenForm/SendTokenFormModel";
import SendTokenModal from "../components/TransactionModals/SendTokenModal";
import UserAddressModal from "../components/UserAddressModal/UserAddressModal";
import { CollectRewardsFormValues } from "../components/forms/CollectRewardsForm/CollectRewardsFormModel";
import { useDistribution } from "../api/distributionAPI";
import CollectRewardsModal from "../components/TransactionModals/CollectRewardsModal";
import { useLocale } from "./AppLocaleProvider";
import { ConnectionStatus, useWallet } from "./WalletProvider";

enum TransactionModal {
  SendToken = "SendToken",
  ReceiveToken = "ReceiveToken",
  CollectRewards = "CollectRewards",
}

interface TransactionProviderProps {
  children?: React.ReactNode;
}

interface TransactionProviderContextValue {
  openSendTokenModal: () => void;
  openReceiveTokenModal: () => void;
  openCollectRewardsModal: () => void;
}

const TransactionContext = React.createContext<TransactionProviderContextValue>(
  null as any
);

const TransactionProvider: React.FC<TransactionProviderProps> = (props) => {
  const { children } = props;
  const wallet = useWallet();
  const cosmosAPI = useCosmos();
  const bankAPI = useBank();
  const distributionAPI = useDistribution();

  const { translate } = useLocale();

  const [activeModal, setActiveModal] = useState<TransactionModal | null>(null);
  const [userBalance, setUserBalance] = useState<BigNumber>(new BigNumber(0));
  const [availableRewards, setAvailableRewards] = useState<BigNumber>(
    new BigNumber(0)
  );

  const openSendTokenModal = useCallback(() => {
    setActiveModal(TransactionModal.SendToken);
  }, []);

  const openReceiveTokenModal = useCallback(() => {
    setActiveModal(TransactionModal.ReceiveToken);
  }, []);

  const openCollectRewardsModal = useCallback(() => {
    setActiveModal(TransactionModal.CollectRewards);
  }, []);

  const closeModals = useCallback(() => {
    setActiveModal(null);
  }, []);

  const submitSendRequest = useCallback(
    (values: SendTokenFormValues) => {
      if (wallet.status !== ConnectionStatus.Connected) return;

      bankAPI
        .signSendTokenTx(
          values.recipent,
          values.amount,
          values.memo ?? undefined
        )
        .then(async (tx) => {
          setActiveModal(null);
          // TODO: Review this loading state
          return toast.promise(cosmosAPI.broadcastTx(tx), {
            pending: translate("transaction.broadcasting"),
            success: translate("transaction.success"),
          });
        })
        .then(async () => {
          return wallet.refreshAccounts();
        })
        .catch((e) => {
          console.error("Error signing send token tx", e);
          toast.error(translate("transaction.failure"));
          closeModals();
        });
    },
    [cosmosAPI, bankAPI, wallet, closeModals, translate]
  );

  const submitCollectRewardsRequest = useCallback(
    (_: CollectRewardsFormValues) => {
      if (wallet.status !== ConnectionStatus.Connected) return;
      distributionAPI
        .signWithdrawDelegationRewardsTx(undefined)
        .then(async (tx) => {
          setActiveModal(null);
          // TODO: Review this loading state
          return toast.promise(cosmosAPI.broadcastTx(tx), {
            pending: translate("transaction.broadcasting"),
            success: translate("transaction.success"),
          });
        })
        .then(async () => {
          return wallet.refreshAccounts();
        })
        .catch((e) => {
          console.error("Error signing send token tx", e);
          toast.error(translate("transaction.failure"));
          closeModals();
        });
    },
    [cosmosAPI, distributionAPI, wallet, closeModals, translate]
  );

  useEffect(() => {
    Promise.all([
      cosmosAPI.getBalance(),
      distributionAPI.getTotalDelegationRewards(),
    ])
      .then(([balance, rewards]) => {
        setUserBalance(balance.amount);
        setAvailableRewards(rewards.amount);
      })
      .catch((err) => {
        console.error("Failed to get balance and rewards", err);
      });
  }, [cosmosAPI, distributionAPI]);

  const contextValue = useMemo((): TransactionProviderContextValue => {
    return {
      openSendTokenModal,
      openReceiveTokenModal,
      openCollectRewardsModal,
    };
  }, [openSendTokenModal, openReceiveTokenModal, openCollectRewardsModal]);

  return (
    <TransactionContext.Provider value={contextValue}>
      {children}
      {activeModal === TransactionModal.SendToken && (
        <SendTokenModal
          availableTokens={userBalance}
          onSubmit={submitSendRequest}
          onClose={closeModals}
        />
      )}
      {activeModal === TransactionModal.CollectRewards && (
        <CollectRewardsModal
          availableRewards={availableRewards}
          onSubmit={submitCollectRewardsRequest}
          onClose={closeModals}
        />
      )}
      <UserAddressModal
        address={
          wallet.status === ConnectionStatus.Connected
            ? wallet.account.address
            : ""
        }
        isOpened={activeModal === TransactionModal.ReceiveToken}
        onClose={closeModals}
      />
    </TransactionContext.Provider>
  );
};

export default TransactionProvider;

export const useTransaction = (): TransactionProviderContextValue =>
  React.useContext(TransactionContext);
