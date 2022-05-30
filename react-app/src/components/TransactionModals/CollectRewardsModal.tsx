import React, { useState, useCallback } from "react";
import BigNumber from "bignumber.js";
import CollectRewardsForm from "../forms/CollectRewardsForm/CollectRewardsForm";
import { CollectRewardsFormValues } from "../forms/CollectRewardsForm/CollectRewardsFormModel";
import { BaseTransactionModal, TransactionStep } from "./BaseTransactionModal";

interface CollectRewardsModalProps {
  availableRewards: BigNumber;
  onSubmit: (values: CollectRewardsFormValues) => void;
  onClose: () => void;
}

const CollectRewardsModal: React.FC<CollectRewardsModalProps> = (props) => {
  const { availableRewards, onSubmit, onClose } = props;

  const [currentStep, setCurrentStep] = useState<TransactionStep>(
    TransactionStep.Details
  );

  const onNextClick = useCallback(
    (values: CollectRewardsFormValues) => {
      setCurrentStep(TransactionStep.Sign);
      onSubmit(values);
    },
    [onSubmit]
  );

  return (
    <BaseTransactionModal
      title="CollectRewardsModal.title"
      currentStep={currentStep}
      onClose={onClose}
    >
      <CollectRewardsForm
        availableRewards={availableRewards}
        onSubmit={onNextClick}
        onCancel={onClose}
      />
    </BaseTransactionModal>
  );
};

export default CollectRewardsModal;
