import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import cn from "classnames";
import BigNumber from "bignumber.js";
import { toast } from "react-toastify";
import Config from "../../config/Config";
import { isRequestStateLoaded } from "../../models/RequestState";
import { translateAddress } from "../../utils/address";
import LoadingSpinner from "../common/LoadingSpinner/LoadingSpinner";
import Paper from "../common/Paper/Paper";
import ProposalHistory, {
  PROPOSAL_HISTORY_PAGE_SIZE,
} from "../ProposalHistory/ProposalHistory";
import { useProposalHistory } from "../ProposalHistory/ProposalHistoryAPI";
import StakeTokenModal from "../TransactionModals/StakeTokenModal";
import { ConnectionStatus, useWallet } from "../../providers/WalletProvider";
import { StakeTokenFormValues } from "../forms/StakeTokenForm/StakeTokenFormModel";
import { UnstakeTokenFormValues } from "../forms/UnstakeTokenForm/UnstakeTokenFormModel";
import UnstakeTokenModal from "../TransactionModals/UnstakeTokenModal";
import { useStakingAPI } from "../../api/stakingAPI";
import { useLocale } from "../../providers/AppLocaleProvider";
import { useCosmosAPI } from "../../api/cosmosAPI";
import ValidatorDetailDescriptionPanel from "./ValidatorDetailDescriptionPanel";
import ValidatorDetailYourStakes from "./ValidatorDetailYourStakesPanel";
import { useValidatorQuery } from "./ValidatorDetailScreenAPI";
import ValidatorDetailScreenInformationPanel from "./ValidatorDetailScreenInformationPanel";

const Bech32PrefixAccAddr = Config.chainInfo.bech32Config.bech32PrefixAccAddr;

enum ValidatorDetailModal {
  Stake = "stake",
  Unstake = "unstake",
}

const ValidatorDetailScreen: React.FC = () => {
  const { address: operatorAddress } = useParams();
  const wallet = useWallet();
  const stakingAPI = useStakingAPI();
  const cosmosAPI = useCosmosAPI();

  const { translate } = useLocale();

  const selfDelegateAddress = useMemo(
    // eslint-disable-next-line no-confusing-arrow
    () =>
      operatorAddress
        ? translateAddress(operatorAddress, Bech32PrefixAccAddr)
        : null,
    [operatorAddress]
  );

  const [activeModal, setActiveModal] = useState<ValidatorDetailModal | null>(
    null
  );

  const userBalance = useMemo(() => {
    if (wallet.status !== ConnectionStatus.Connected) {
      return new BigNumber(0);
    }

    return wallet.accountBalance.amount;
  }, [wallet]);

  const {
    selectedTab,
    after,
    handlePageChange,
    handleSelectTab,
    requestState: proposalHistoryRequestState,
    fetch: fetchProposalHistory,
  } = useProposalHistory();
  const { requestState: validatorRequestState, fetch: fetchValidator } =
    useValidatorQuery();

  const openStakeTokenModal = useCallback(() => {
    if (wallet.status !== ConnectionStatus.Connected) {
      wallet.openConnectWalletModal?.();
      return;
    }
    setActiveModal(ValidatorDetailModal.Stake);
  }, [wallet]);

  const openUnstakeTokenModal = useCallback(() => {
    if (wallet.status !== ConnectionStatus.Connected) {
      wallet.openConnectWalletModal?.();
      return;
    }
    setActiveModal(ValidatorDetailModal.Unstake);
  }, [wallet]);

  const closeModals = useCallback(() => {
    setActiveModal(null);
  }, []);

  const handleStakeToken = useCallback(
    async (values: StakeTokenFormValues) => {
      if (wallet.status !== ConnectionStatus.Connected) return;

      try {
        const tx = await stakingAPI.signDelegateTokenTx(
          values.validator,
          values.amount,
          values.memo ?? undefined
        );

        setActiveModal(null);

        await toast.promise(cosmosAPI.broadcastTx(tx), {
          pending: translate("transaction.broadcasting"),
          success: translate("transaction.success"),
        });

        await wallet.refreshAccount();
      } catch (err: unknown) {
        console.error("Error signing delegate token tx", err);
        toast.error(translate("transaction.failure"));
        closeModals();
      }
    },
    [closeModals, cosmosAPI, stakingAPI, translate, wallet]
  );

  const handleUnstakeToken = useCallback(
    async (values: UnstakeTokenFormValues) => {
      if (wallet.status !== ConnectionStatus.Connected) return;

      try {
        const tx = await stakingAPI.signUndelegateTokenTx(
          values.validator,
          values.amount,
          values.memo ?? undefined
        );

        setActiveModal(null);

        await toast.promise(cosmosAPI.broadcastTx(tx), {
          pending: translate("transaction.broadcasting"),
          success: translate("transaction.success"),
        });

        await wallet.refreshAccount();
      } catch (err: unknown) {
        console.error("Error signing delegate token tx", err);
        toast.error(translate("transaction.failure"));
        closeModals();
      }
    },
    [closeModals, cosmosAPI, stakingAPI, translate, wallet]
  );
  useEffect(() => {
    if (selfDelegateAddress) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      fetchProposalHistory({
        first: PROPOSAL_HISTORY_PAGE_SIZE,
        after: after,
        tab: selectedTab,
        address: selfDelegateAddress,
      });
    }
  }, [fetchProposalHistory, after, selectedTab, selfDelegateAddress]);

  useEffect(() => {
    if (operatorAddress) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      fetchValidator(operatorAddress);
    }
  }, [fetchValidator, operatorAddress]);

  return (
    <>
      <div>
        <ValidatorDetailDescriptionPanel
          isLoading={!isRequestStateLoaded(validatorRequestState)}
          data={
            isRequestStateLoaded(validatorRequestState)
              ? validatorRequestState.data
              : null
          }
          onStake={openStakeTokenModal}
          onUnstake={openUnstakeTokenModal}
        />
        <ValidatorDetailYourStakes
          isLoading={!isRequestStateLoaded(validatorRequestState)}
          data={
            isRequestStateLoaded(validatorRequestState)
              ? validatorRequestState.data.stake
              : null
          }
        />
        {isRequestStateLoaded(proposalHistoryRequestState) ? (
          <ProposalHistory
            data={proposalHistoryRequestState.data}
            selectedTab={selectedTab}
            onSelectTab={handleSelectTab}
            pageSize={PROPOSAL_HISTORY_PAGE_SIZE}
            currentOffset={after}
            onPageChange={handlePageChange}
          />
        ) : (
          <Paper className={cn("flex", "justify-center", "items-center")}>
            <LoadingSpinner />
          </Paper>
        )}
        <ValidatorDetailScreenInformationPanel
          isLoading={!isRequestStateLoaded(validatorRequestState)}
          data={
            isRequestStateLoaded(validatorRequestState)
              ? validatorRequestState.data
              : undefined
          }
        />
      </div>
      {activeModal === ValidatorDetailModal.Stake &&
        isRequestStateLoaded(validatorRequestState) && (
          <StakeTokenModal
            validatorMoniker={
              validatorRequestState.data.validator.description.moniker
            }
            validatorAddress={
              validatorRequestState.data.validator.operatorAddress
            }
            availableTokens={userBalance}
            onClose={closeModals}
            onSubmit={handleStakeToken}
          />
        )}
      {activeModal === ValidatorDetailModal.Unstake &&
        isRequestStateLoaded(validatorRequestState) && (
          <UnstakeTokenModal
            validatorMoniker={
              validatorRequestState.data.validator.description.moniker
            }
            validatorAddress={
              validatorRequestState.data.validator.operatorAddress
            }
            availableDelegatedTokens={
              validatorRequestState.data.stake?.balance.amount ??
              new BigNumber(0)
            }
            onClose={closeModals}
            onSubmit={handleUnstakeToken}
          />
        )}
    </>
  );
};

export default ValidatorDetailScreen;
