import React, { useCallback } from "react";
import BigNumber from "bignumber.js";
import StakeStokenForm from "../forms/StakeTokenForm/StakeTokenForm";
import { StakeTokenFormValues } from "../forms/StakeTokenForm/StakeTokenFormModel";
import { BaseTransactionModal, TransactionStep } from "./BaseTransactionModal";

interface StakeTokenModalProps {
  validatorMoniker: string | null;
  validatorAddress: string;
  availableTokens: BigNumber;
  onSubmit: (values: StakeTokenFormValues) => Promise<void>;
  onClose: () => void;
}

const StakeTokenModal: React.FC<StakeTokenModalProps> = (props) => {
  const {
    validatorMoniker,
    validatorAddress,
    availableTokens,
    onSubmit,
    onClose,
  } = props;

  const [currentStep, setCurrentStep] = React.useState<TransactionStep>(
    TransactionStep.Details
  );

  const onNextClick = useCallback(
    (values: StakeTokenFormValues) => {
      setCurrentStep(TransactionStep.Sign);
      // Error handled in transaction provider
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      onSubmit(values);
    },
    [onSubmit]
  );

  return (
    <BaseTransactionModal
      title="StakeTokenModal.title"
      currentStep={currentStep}
      onClose={onClose}
    >
      <StakeStokenForm
        validatorMoniker={validatorMoniker}
        validatorAddress={validatorAddress}
        availableTokens={availableTokens}
        onSubmit={onNextClick}
        onCancel={onClose}
      />
    </BaseTransactionModal>
  );
};

export default StakeTokenModal;
