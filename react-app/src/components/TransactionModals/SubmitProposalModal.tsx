import React, { useCallback } from "react";
import BigNumber from "bignumber.js";
import SubmitProposalForm from "../forms/SubmitProposalForm/SubmitProposalForm";
import { SubmitProposalFormValues } from "../forms/SubmitProposalForm/SubmitProposalFormModel";
import { CreateProposalFormValues } from "../forms/CreateProposalForm/CreateProposalFormModel";
import { BaseTransactionModal, TransactionStep } from "./BaseTransactionModal";

interface SubmitProposalModalProps {
  availableTokens: BigNumber;
  requiredDeposit: BigNumber;
  defaultValues: Partial<SubmitProposalFormValues> & CreateProposalFormValues;
  onSubmit: (values: SubmitProposalFormValues) => Promise<void>;
  onClose: () => void;
}

const SubmitProposalModal: React.FC<SubmitProposalModalProps> = (props) => {
  const { availableTokens, requiredDeposit, defaultValues, onSubmit, onClose } =
    props;

  const [currentStep, setCurrentStep] = React.useState<TransactionStep>(
    TransactionStep.Details
  );

  const onNextClick = useCallback(
    async (values: SubmitProposalFormValues) => {
      setCurrentStep(TransactionStep.Sign);
      await onSubmit(values);
    },
    [onSubmit]
  );

  return (
    <BaseTransactionModal
      title="SubmitProposalModal.title"
      currentStep={currentStep}
      onClose={onClose}
    >
      <SubmitProposalForm
        availableTokens={availableTokens}
        requiredDeposit={requiredDeposit}
        defaultValues={defaultValues}
        // Error handled in screen
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onSubmit={onNextClick}
        onCancel={onClose}
      />
    </BaseTransactionModal>
  );
};

export default SubmitProposalModal;
