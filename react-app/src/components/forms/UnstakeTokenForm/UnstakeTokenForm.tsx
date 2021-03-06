import React from "react";
import cn from "classnames";
import { useForm } from "react-hook-form";
import BigNumber from "bignumber.js";
import AppButton from "../../common/Buttons/AppButton";
import Config from "../../../config/Config";
import LocalizedText from "../../common/Localized/LocalizedText";
import * as FormField from "../../common/Form";
import { truncateAddress } from "../../../utils/address";
import {
  UnstakeTokenFormValues,
  useUnstakeTokenFormModel,
} from "./UnstakeTokenFormModel";

interface StakeTokenFormProps {
  className?: string;
  validatorMoniker: string | null;
  validatorAddress: string;
  availableTokens: BigNumber;
  onCancel: () => void;
  onSubmit: (data: UnstakeTokenFormValues) => void;
}

const StakeTokenForm: React.FC<StakeTokenFormProps> = (props) => {
  const chainInfo = Config.chainInfo;
  const {
    className,
    availableTokens,
    validatorMoniker,
    validatorAddress,
    onCancel,
    onSubmit,
  } = props;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UnstakeTokenFormValues>({
    mode: "onSubmit",
    reValidateMode: "onBlur",
    defaultValues: {
      validator: validatorAddress,
    },
  });

  const { registerOptions } = useUnstakeTokenFormModel(availableTokens);

  return (
    <form
      className={cn("flex", "flex-col", "gap-y-6", "items-start", className)}
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      onSubmit={handleSubmit(onSubmit)}
    >
      <FormField.TextInput
        label="UnstakeTokenModal.fields.from"
        inputProps={{
          disabled: true,
          readOnly: true,
          className: "text-app-grey",
          value: !validatorMoniker
            ? truncateAddress(validatorAddress)
            : `${validatorMoniker} - ${truncateAddress(validatorAddress)}`,
        }}
      />
      <FormField.Currency
        label="UnstakeTokenModal.fields.amount"
        currencyUnit={chainInfo.currency.coinDenom}
        inputProps={{
          placeholder: "0",
          max: availableTokens.toFixed(),
        }}
        registerReturn={register("amount", registerOptions.amount)}
        errorMessage={errors.amount?.message}
      />
      <span
        className={cn(
          "-mt-5",
          "text-xs",
          "leading-6",
          "font-medium",
          "text-black"
        )}
      >
        <LocalizedText
          messageID="UnstakeTokenModal.fields.amount.available"
          messageArgs={{
            amount: availableTokens.toFixed(),
            denom: chainInfo.currency.coinDenom,
          }}
        />
      </span>

      <FormField.TextInput
        label="UnstakeTokenModal.fields.memo"
        registerReturn={register("memo", registerOptions.memo)}
        errorMessage={errors.memo?.message}
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

export default StakeTokenForm;
