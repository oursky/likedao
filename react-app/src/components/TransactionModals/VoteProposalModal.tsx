import React, { useCallback, useState } from "react";
import { VoteProposalFormValues } from "../forms/VoteProposalForm/VoteProposalFormModel";
import VoteProposalForm from "../forms/VoteProposalForm/VoteProposalForm";
import { StepItem } from "../StepIndicator/StepIndicator";
import { BaseTransactionModal, TransactionStep } from "./BaseTransactionModal";

const TransactionSteps: StepItem[] = [
  {
    label: "VoteProposalModal.step1.title",
    value: TransactionStep.Details,
  },
  {
    label: "TransactionModal.step2.title",
    value: TransactionStep.Sign,
  },
];
interface VoteProposalModalProps {
  proposalId: number;
  onSubmit: (values: VoteProposalFormValues) => Promise<void>;
  onClose: () => void;
}

const VoteProposalModal: React.FC<VoteProposalModalProps> = (props) => {
  const { proposalId, onSubmit, onClose } = props;

  const [currentStep, setCurrentStep] = useState<TransactionStep>(
    TransactionStep.Details
  );

  const onNextClick = useCallback(
    async (values: VoteProposalFormValues) => {
      setCurrentStep(TransactionStep.Sign);
      await onSubmit(values);
    },
    [onSubmit]
  );

  return (
    <BaseTransactionModal
      title="VoteProposalModal.title"
      steps={TransactionSteps}
      currentStep={currentStep}
      onClose={onClose}
    >
      <VoteProposalForm
        proposalId={proposalId}
        // Error handled in screen
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onSubmit={onNextClick}
        onCancel={onClose}
      />
    </BaseTransactionModal>
  );
};

export default VoteProposalModal;
