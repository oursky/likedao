import React, { useCallback, useEffect, useMemo, useState } from "react";
import BigNumber from "bignumber.js";
import { toast } from "react-toastify";
import { useBank } from "../api/bankAPI";
import { useCosmos } from "../api/cosmosAPI";
import { SendTokenFormValues } from "../components/forms/SendTokenForm/SendTokenFormModel";
import SendTokenModal from "../components/TransactionModals/SendTokenModal";
import Config from "../config/Config";
import { useLocale } from "./AppLocaleProvider";

enum TransactionModal {
  SendToken = "SendToken",
}

interface TransactionProviderProps {
  children?: React.ReactNode;
}

interface TransactionProviderContextValue {
  openSendTokenModal: () => void;
}

const TransactionContext = React.createContext<TransactionProviderContextValue>(
  null as any
);

const TransactionProvider: React.FC<TransactionProviderProps> = (props) => {
  const { children } = props;
  const cosmosAPI = useCosmos();
  const bankAPI = useBank();
  const chainInfo = Config.chainInfo;
  const { translate } = useLocale();

  const [activeModal, setActiveModal] = useState<TransactionModal | null>(null);
  const [userBalance, setUserBalance] = useState<BigNumber>(new BigNumber(0));

  const openSendTokenModal = useCallback(() => {
    setActiveModal(TransactionModal.SendToken);
  }, []);

  const closeModals = useCallback(() => {
    setActiveModal(null);
  }, []);

  const submitSendRequest = useCallback(
    (values: SendTokenFormValues) => {
      const amount = new BigNumber(values.amount).shiftedBy(
        chainInfo.currency.coinDecimals
      );

      bankAPI
        .signSendTokenTx(values.recipent, amount, values.memo ?? undefined)
        .then(async (tx) => {
          setActiveModal(null);
          // TODO: Review this loading state
          return toast.promise(cosmosAPI.broadcastTx(tx), {
            pending: translate("transaction.broadcasting"),
            success: translate("transaction.success"),
          });
        })
        .then((tx) => {
          // TODO: Handle boardcasted state
          console.log(tx);
        })
        .catch((e) => {
          console.error("Error signing send token tx", e);
          toast.error(translate("transaction.failure"));
          closeModals();
        });
    },
    [cosmosAPI, bankAPI, chainInfo, closeModals, translate]
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
    };
  }, [openSendTokenModal]);

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
    </TransactionContext.Provider>
  );
};

export default TransactionProvider;

export const useTransaction = (): TransactionProviderContextValue =>
  React.useContext(TransactionContext);
