import React, { useCallback, useMemo, useState } from "react";
import cn from "classnames";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import BigNumber from "bignumber.js";
import * as ReactGA from "react-ga";
import AppRoutes from "../../navigation/AppRoutes";
import Paper from "../common/Paper/Paper";
import {
  isRequestStateError,
  isRequestStateLoaded,
  RequestStateType,
} from "../../models/RequestState";
import { Icon, IconType } from "../common/Icons/Icons";
import { useEffectOnce } from "../../hooks/useEffectOnce";
import { ReactionType } from "../reactions/ReactionModel";
import { useLocale } from "../../providers/AppLocaleProvider";
import { ReactionTargetType, useReactionAPI } from "../../api/reactionAPI";
import VoteProposalModal from "../TransactionModals/VoteProposalModal";
import { VoteProposalFormValues } from "../forms/VoteProposalForm/VoteProposalFormModel";
import { ConnectionStatus, useWallet } from "../../providers/WalletProvider";
import { useCosmosAPI } from "../../api/cosmosAPI";
import { useGovAPI } from "../../api/govAPI";
import { DepositProposalFormValues } from "../forms/DepositProposalForm/DepositProposalFormModel";
import DepositProposalModal from "../TransactionModals/DepositProposalModal";
import TransactionError from "../common/TransactionError/TransactionError";
import ProposalHeader from "./ProposalHeader";
import ProposalDescription from "./ProposalDescription";
import { useProposalQuery } from "./ProposalDetailScreenAPI";
import { ProposalData } from "./ProposalData";

enum ProposalDetailModal {
  Vote = "vote",
  Deposit = "deposit",
}

const ProposalDetailScreen: React.FC = () => {
  const { id } = useParams();
  const { translate } = useLocale();
  const reactionAPI = useReactionAPI();
  const wallet = useWallet();
  const navigate = useNavigate();
  const govAPI = useGovAPI();
  const cosmosAPI = useCosmosAPI();

  const proposalId = useMemo(() => {
    return id != null ? parseInt(id, 10) : null;
  }, [id]);

  const { requestState } = useProposalQuery(proposalId);

  const [activeModal, setActiveModal] = useState<ProposalDetailModal | null>(
    null
  );

  const userBalance = useMemo(() => {
    if (wallet.status !== ConnectionStatus.Connected) {
      return new BigNumber(0);
    }

    return wallet.accountBalance.amount;
  }, [wallet]);

  const onSetReaction = useCallback(
    async (type: ReactionType): Promise<void> => {
      if (!isRequestStateLoaded(requestState) || requestState.data == null) {
        return;
      }

      if (wallet.status !== ConnectionStatus.Connected) {
        wallet.openConnectWalletModal?.();
        return;
      }

      ReactGA.event({
        category: "Reaction",
        action: "Set on proposal",
        value: proposalId!,
        label: type,
      });

      try {
        await reactionAPI.setReaction(
          ReactionTargetType.Proposal,
          requestState.data.id,
          type
        );
      } catch (e: unknown) {
        console.error("Error while setting reaction", e);
        toast.error(translate("ProposalDetail.setReaction.failure"));
      }
    },
    [requestState, wallet, proposalId, reactionAPI, translate]
  );

  const onUnsetReaction = useCallback(async (): Promise<void> => {
    if (!isRequestStateLoaded(requestState) || requestState.data == null) {
      return;
    }

    if (wallet.status !== ConnectionStatus.Connected) {
      wallet.openConnectWalletModal?.();
      return;
    }

    ReactGA.event({
      category: "Reaction",
      action: "Unset on proposal",
      value: proposalId!,
    });

    try {
      await reactionAPI.unsetReaction(
        ReactionTargetType.Proposal,
        requestState.data.id
      );
    } catch (e: unknown) {
      console.error("Error while setting reaction", e);
      toast.error(translate("ProposalDetail.setReaction.failure"));
    }
  }, [requestState, reactionAPI, proposalId, wallet, translate]);

  const handleOpenVoteModal = useCallback(() => {
    if (wallet.status !== ConnectionStatus.Connected) {
      wallet.openConnectWalletModal?.();
    } else {
      setActiveModal(ProposalDetailModal.Vote);
    }
  }, [wallet]);

  const handleOpenDepositModal = useCallback(() => {
    if (wallet.status !== ConnectionStatus.Connected) {
      wallet.openConnectWalletModal?.();
    } else {
      setActiveModal(ProposalDetailModal.Deposit);
    }
  }, [wallet]);

  const closeModals = useCallback(() => {
    setActiveModal(null);
  }, []);

  const handleVoteSubmission = useCallback(
    async (values: VoteProposalFormValues) => {
      if (wallet.status !== ConnectionStatus.Connected) return;

      try {
        const tx = await govAPI.signVoteProposalTx(
          values.proposalId,
          values.option,
          values.memo ?? undefined
        );

        setActiveModal(null);

        await toast.promise(cosmosAPI.broadcastTx(tx), {
          pending: translate("transaction.broadcasting"),
          success: translate("transaction.success"),
        });

        await wallet.refreshAccount();
      } catch (err: unknown) {
        console.error("Error signing send token tx", err);
        toast.error(<TransactionError error={err} />);
        closeModals();
      }
    },
    [closeModals, cosmosAPI, govAPI, translate, wallet]
  );

  const handleDepositSubmission = useCallback(
    async (values: DepositProposalFormValues) => {
      if (wallet.status !== ConnectionStatus.Connected) return;

      try {
        const tx = await govAPI.signDepositProposalTx(
          values.proposalId,
          new BigNumber(values.amount),
          values.memo ?? undefined
        );

        setActiveModal(null);

        await toast.promise(cosmosAPI.broadcastTx(tx), {
          pending: translate("transaction.broadcasting"),
          success: translate("transaction.success"),
        });

        await wallet.refreshAccount();
      } catch (err: unknown) {
        console.error("Error signing send token tx", err);
        toast.error(<TransactionError error={err} />);
        closeModals();
      }
    },
    [closeModals, cosmosAPI, govAPI, translate, wallet]
  );

  useEffectOnce(
    () => {
      switch (requestState.type) {
        case RequestStateType.Error:
          toast.error(translate("ProposalDetail.proposal.requestState.error"), {
            toastId: "proposal-detail-request-error",
          });
          break;
        case RequestStateType.Loaded:
          if (requestState.data === null) {
            toast.error(
              translate("ProposalDetail.proposal.requestState.empty", {
                id: id?.toString() ?? "",
              })
            );
            navigate(AppRoutes.Proposals);
          }
          break;
        default:
          console.error(
            "Unrecognized request state type = ",
            requestState.type
          );
          break;
      }
    },
    () =>
      isRequestStateError(requestState) || isRequestStateLoaded(requestState)
  );

  if (!proposalId) return <Navigate to={AppRoutes.Proposals} />;

  if (!isRequestStateLoaded(requestState)) {
    return (
      <div className={cn("flex", "flex-col", "h-full")}>
        {[...Array(4)].map((_, index) => (
          <Paper
            key={index}
            className={cn("flex", "justify-center", "items-center")}
          >
            <Icon
              icon={IconType.Ellipse}
              className={cn("animate-spin")}
              height={24}
              width={24}
            />
          </Paper>
        ))}
      </div>
    );
  }

  if (!requestState.data) return null;

  return (
    <>
      <div className={cn("flex", "flex-col")}>
        <ProposalHeader
          proposal={requestState.data}
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          onSetReaction={onSetReaction}
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          onUnsetReaction={onUnsetReaction}
          onVoteClick={handleOpenVoteModal}
          onDepositClick={handleOpenDepositModal}
        />
        <ProposalDescription proposal={requestState.data} />
        <ProposalData proposal={requestState.data} />
      </div>
      {activeModal === ProposalDetailModal.Vote && (
        <VoteProposalModal
          proposalId={proposalId}
          onSubmit={handleVoteSubmission}
          onClose={closeModals}
        />
      )}
      {activeModal === ProposalDetailModal.Deposit && (
        <DepositProposalModal
          proposalId={proposalId}
          availableTokens={userBalance}
          onSubmit={handleDepositSubmission}
          onClose={closeModals}
        />
      )}
    </>
  );
};

export default ProposalDetailScreen;
