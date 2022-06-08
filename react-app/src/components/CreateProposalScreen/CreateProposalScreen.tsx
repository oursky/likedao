import React, { useCallback, useEffect, useState } from "react";
import cn from "classnames";
import BigNumber from "bignumber.js";
import { TextProposal } from "cosmjs-types/cosmos/gov/v1beta1/gov";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import CreateProposalForm from "../forms/CreateProposalForm/CreateProposalForm";
import { CreateProposalFormValues } from "../forms/CreateProposalForm/CreateProposalFormModel";
import SubmitProposalModal from "../TransactionModals/SubmitProposalModal";
import { SubmitProposalFormValues } from "../forms/SubmitProposalForm/SubmitProposalFormModel";
import { useCosmos } from "../../api/cosmosAPI";
import { useGov } from "../../api/govAPI";
import Config from "../../config/Config";
import { ConnectionStatus, useWallet } from "../../providers/WalletProvider";
import { ProposalType } from "../../models/cosmos/gov";
import { useLocale } from "../../providers/AppLocaleProvider";
import AppRoutes from "../../navigation/AppRoutes";

const CreateProposalScreen: React.FC = () => {
  const wallet = useWallet();
  const cosmosAPI = useCosmos();
  const govAPI = useGov();
  const { translate } = useLocale();
  const navigate = useNavigate();
  const chainInfo = Config.chainInfo;

  const [isSubmissionModalActive, setIsSubmissionModalActive] =
    useState<boolean>(false);
  const [createProposalFormValues, setCreateProposalFormValues] =
    useState<CreateProposalFormValues | null>(null);
  const [userBalance, setUserBalance] = useState<BigNumber>(new BigNumber(0));
  const [minimumDeposit, setMinimumDeposit] = useState<BigNumber>(
    new BigNumber(0)
  );

  const onCloseModal = useCallback(() => {
    setIsSubmissionModalActive(false);
  }, []);

  const onSubmitCreateProposal = useCallback(
    (values: CreateProposalFormValues) => {
      if (wallet.status === ConnectionStatus.Connected) {
        setCreateProposalFormValues(values);
        setIsSubmissionModalActive(true);
      } else {
        wallet.openConnectWalletModal?.();
      }
    },
    [wallet]
  );

  const onSubmitSubmitProposal = useCallback(
    async (values: SubmitProposalFormValues) => {
      if (wallet.status !== ConnectionStatus.Connected) return;

      try {
        const tx = await govAPI.signSubmitProposalTx(
          {
            // TODO: Handle other proposal types
            type: values.type as ProposalType.Signaling,
            proposal: {
              title: values.title,
              description: values.description,
            } as TextProposal,
          },
          new BigNumber(values.amount),
          values.memo ?? undefined
        );

        setIsSubmissionModalActive(false);

        await toast.promise(cosmosAPI.broadcastTx(tx), {
          pending: translate("transaction.broadcasting"),
          success: translate("transaction.success"),
        });

        await wallet.refreshAccounts();

        navigate(AppRoutes.Proposals);

        return;
      } catch (e: unknown) {
        console.error("Error signing send token tx", e);
        toast.error(translate("transaction.failure"));
        setIsSubmissionModalActive(false);
      }
    },
    [cosmosAPI, govAPI, wallet, translate, navigate]
  );

  useEffect(() => {
    // TODO: Handle query from bdjuno after implementing gov param display
    Promise.all([cosmosAPI.getBalance(), govAPI.getMinDepositParams()])
      .then(([balance, minDeposit]) => {
        setUserBalance(balance.amount);
        setMinimumDeposit(minDeposit.amount);
      })
      .catch((err) => {
        console.log("Failed to get balance", err);
      });
  }, [chainInfo, cosmosAPI, govAPI, wallet]);

  return (
    <div
      className={cn(
        "flex",
        "flex-col",
        "flex-1",
        "bg-white",
        "rounded-lg",
        "drop-shadow",
        "px-5",
        "py-6"
      )}
    >
      <CreateProposalForm onSubmit={onSubmitCreateProposal} />
      {isSubmissionModalActive && !!createProposalFormValues && (
        <SubmitProposalModal
          availableTokens={userBalance}
          requiredDeposit={minimumDeposit}
          defaultValues={createProposalFormValues}
          onSubmit={onSubmitSubmitProposal}
          onClose={onCloseModal}
        />
      )}
    </div>
  );
};

export default CreateProposalScreen;
