import React, { useCallback, useEffect, useMemo, useState } from "react";
import BigNumber from "bignumber.js";
import { toast } from "react-toastify";
import { useBank } from "../api/bankAPI";
import { useCosmos } from "../api/cosmosAPI";
import { SendTokenFormValues } from "../components/forms/SendTokenForm/SendTokenFormModel";
import SendTokenModal from "../components/TransactionModals/SendTokenModal";
import UserAddressModal from "../components/UserAddressModal/UserAddressModal";
import { useLocale } from "./AppLocaleProvider";
import { ConnectionStatus, useWallet } from "./WalletProvider";

enum TransactionModal {
  SendToken = "SendToken",
  ReceiveToken = "ReceiveToken",
}

interface TransactionProviderProps {
  children?: React.ReactNode;
}

interface TransactionProviderContextValue {
  openSendTokenModal: () => void;
  openReceiveTokenModal: () => void;
}

const TransactionContext = React.createContext<TransactionProviderContextValue>(
  null as any
);

const TransactionProvider: React.FC<TransactionProviderProps> = (props) => {
  const { children } = props;
  const wallet = useWallet();
  const cosmosAPI = useCosmos();
  const bankAPI = useBank();
  const { translate } = useLocale();

  const [activeModal, setActiveModal] = useState<TransactionModal | null>(null);
  const [userBalance, setUserBalance] = useState<BigNumber>(new BigNumber(0));

  const openSendTokenModal = useCallback(() => {
    setActiveModal(TransactionModal.SendToken);
  }, []);

  const openReceiveTokenModal = useCallback(() => {
    setActiveModal(TransactionModal.ReceiveToken);
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

  useEffect(() => {
    cosmosAPI
      .getBalance()
      .then((balance) => {
        setUserBalance(balance.amount);
      })
      .catch((err) => {
        console.error("Failed to get balance", err);
      });
  }, [cosmosAPI]);

  const contextValue = useMemo((): TransactionProviderContextValue => {
    return {
      openSendTokenModal,
      openReceiveTokenModal,
    };
  }, [openSendTokenModal, openReceiveTokenModal]);

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
