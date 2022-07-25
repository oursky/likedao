import React, { useCallback } from "react";
import BigNumber from "bignumber.js";
import UnstakeStokenForm from "../forms/UnstakeTokenForm/UnstakeTokenForm";
import { UnstakeTokenFormValues } from "../forms/UnstakeTokenForm/UnstakeTokenFormModel";
import { BaseTransactionModal, TransactionStep } from "./BaseTransactionModal";

interface UnstakeTokenModalProps {
  validatorMoniker: string | null;
  validatorAddress: string;
  availableDelegatedTokens: BigNumber;
  onSubmit: (values: UnstakeTokenFormValues) => Promise<void>;
  onClose: () => void;
}

const UnstakeTokenModal: React.FC<UnstakeTokenModalProps> = (props) => {
  const {
    validatorMoniker,
    validatorAddress,
    availableDelegatedTokens,
    onSubmit,
    onClose,
  } = props;

  const [currentStep, setCurrentStep] = React.useState<TransactionStep>(
    TransactionStep.Details
  );

  const onNextClick = useCallback(
    (values: UnstakeTokenFormValues) => {
      setCurrentStep(TransactionStep.Sign);
      // Error handled in transaction provider
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      onSubmit(values);
    },
    [onSubmit]
  );

  return (
    <BaseTransactionModal
      title="UnstakeTokenModal.title"
      currentStep={currentStep}
      onClose={onClose}
    >
      <UnstakeStokenForm
        validatorMoniker={validatorMoniker}
        validatorAddress={validatorAddress}
        availableTokens={availableDelegatedTokens}
        onSubmit={onNextClick}
        onCancel={onClose}
      />
    </BaseTransactionModal>
  );
};

export default UnstakeTokenModal;
