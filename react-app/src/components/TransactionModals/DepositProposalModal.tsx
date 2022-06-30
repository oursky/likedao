import React, { useCallback, useState } from "react";
import BigNumber from "bignumber.js";
import { DepositProposalFormValues } from "../forms/DepositProposalForm/DepositProposalFormModel";
import DepositProposalForm from "../forms/DepositProposalForm/DepositProposalForm";
import { BaseTransactionModal, TransactionStep } from "./BaseTransactionModal";

interface VoteProposalModalProps {
  proposalId: number;
  availableTokens: BigNumber;
  onSubmit: (values: DepositProposalFormValues) => Promise<void>;
  onClose: () => void;
}

const VoteProposalModal: React.FC<VoteProposalModalProps> = (props) => {
  const { proposalId, availableTokens, onSubmit, onClose } = props;

  const [currentStep, setCurrentStep] = useState<TransactionStep>(
    TransactionStep.Details
  );

  const onNextClick = useCallback(
    async (values: DepositProposalFormValues) => {
      setCurrentStep(TransactionStep.Sign);
      await onSubmit(values);
    },
    [onSubmit]
  );

  return (
    <BaseTransactionModal
      title="DepositProposalModal.title"
      currentStep={currentStep}
      onClose={onClose}
    >
      <DepositProposalForm
        proposalId={proposalId}
        availableTokens={availableTokens}
        // Error handled in screen
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onSubmit={onNextClick}
        onCancel={onClose}
      />
    </BaseTransactionModal>
  );
};

export default VoteProposalModal;
