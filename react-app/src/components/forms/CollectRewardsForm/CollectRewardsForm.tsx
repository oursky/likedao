import React from "react";
import cn from "classnames";
import { useForm } from "react-hook-form";
import BigNumber from "bignumber.js";
import AppButton from "../../common/Buttons/AppButton";
import Config from "../../../config/Config";
import * as FormField from "../../common/Form";
import {
  CollectRewardsFormValues,
  useCollectRewardsFormModel,
} from "./CollectRewardsFormModel";

interface CollectRewardsFormProps {
  className?: string;
  availableRewards: BigNumber;
  onCancel: () => void;
  onSubmit: (data: CollectRewardsFormValues) => void;
}

const CollectRewardsForm: React.FC<CollectRewardsFormProps> = (props) => {
  const chainInfo = Config.chainInfo;
  const { className, availableRewards, onCancel, onSubmit } = props;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CollectRewardsFormValues>({
    mode: "onTouched",
    reValidateMode: "onBlur",
    defaultValues: {
      amount: availableRewards.toFixed(6),
    },
  });

  const { registerOptions } = useCollectRewardsFormModel();

  return (
    <form
      className={cn("flex", "flex-col", "gap-y-6", "items-start", className)}
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      onSubmit={handleSubmit(onSubmit)}
    >
      <FormField.Currency
        label="CollectRewardsModal.fields.amount"
        currencyUnit={chainInfo.currency.coinDenom}
        inputProps={{
          placeholder: "0",
          disabled: true,
          readOnly: true,
        }}
        inputClassName={cn("text-likecoin-grey")}
        registerReturn={register("amount", registerOptions.amount)}
        errorMessage={errors.amount?.message}
      />

      <div className={cn("flex", "flex-row", "gap-x-2.5", "self-end")}>
        <AppButton
          theme="secondary"
          size="regular"
          onClick={onCancel}
          messageID="TransactionModal.cancel"
        />
        <AppButton
          theme="primary"
          size="regular"
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          onClick={handleSubmit(onSubmit)}
          messageID="TransactionModal.next"
        />
      </div>
    </form>
  );
};

export default CollectRewardsForm;
