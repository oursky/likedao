import React, { useCallback } from "react";
import BigNumber from "bignumber.js";
import SendTokenForm from "../forms/SendTokenForm/SendTokenForm";
import { SendTokenFormValues } from "../forms/SendTokenForm/SendTokenFormModel";
import { BaseTransactionModal, TransactionStep } from "./BaseTransactionModal";

interface SendTokenModalProps {
  availableTokens: BigNumber;
  onSubmit: (values: SendTokenFormValues) => void;
  onClose: () => void;
}

const SendTokenModal: React.FC<SendTokenModalProps> = (props) => {
  const { availableTokens, onSubmit, onClose } = props;

  const [currentStep, setCurrentStep] = React.useState<TransactionStep>(
    TransactionStep.Details
  );

  const onNextClick = useCallback(
    (values: SendTokenFormValues) => {
      setCurrentStep(TransactionStep.Sign);
      onSubmit(values);
    },
    [onSubmit]
  );

  return (
    <BaseTransactionModal
      title="SendTokenModal.title"
      currentStep={currentStep}
      onClose={onClose}
    >
      <SendTokenForm
        availableTokens={availableTokens}
        onSubmit={onNextClick}
        onCancel={onClose}
      />
    </BaseTransactionModal>
  );
};

export default SendTokenModal;
