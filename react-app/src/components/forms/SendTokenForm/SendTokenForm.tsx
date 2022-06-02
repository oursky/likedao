import React, { useCallback } from "react";
import cn from "classnames";
import { useForm } from "react-hook-form";
import BigNumber from "bignumber.js";
import AppButton from "../../common/Buttons/AppButton";
import Config from "../../../config/Config";
import LocalizedText from "../../common/Localized/LocalizedText";
import { FormField } from "../../common/Form/FormField";
import {
  SendTokenFormValues,
  useSendTokenFormModel,
} from "./SendTokenFormModel";

interface SendTokenFormProps {
  className?: string;
  availableTokens: BigNumber;
  onCancel: () => void;
  onSubmit: (data: SendTokenFormValues) => void;
}

const SendTokenForm: React.FC<SendTokenFormProps> = (props) => {
  const chainInfo = Config.chainInfo;
  const { className, availableTokens, onCancel, onSubmit } = props;

  const {
    register,
    setValue,
    handleSubmit,
    clearErrors,
    formState: { errors },
  } = useForm<SendTokenFormValues>({
    mode: "onTouched",
    reValidateMode: "onBlur",
    defaultValues: undefined,
  });

  const setAmount = useCallback(
    (value: string | number) => {
      clearErrors("amount");
      setValue("amount", value.toString());
    },
    [setValue, clearErrors]
  );

  const { registerOptions } = useSendTokenFormModel(availableTokens);

  return (
    <form
      className={cn("flex", "flex-col", "gap-y-6", "items-start", className)}
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      onSubmit={handleSubmit(onSubmit)}
    >
      <FormField.TextInput
        label="SendTokenModal.fields.recipent"
        registerReturn={register("recipent", registerOptions.recipent)}
        errorMessage={errors.recipent?.message}
      />
      <FormField.Currency
        label="SendTokenModal.fields.amount"
        currencyUnit={chainInfo.currency.coinDenom}
        inputProps={{
          placeholder: "0",
        }}
        setValue={setAmount}
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
          messageID="SendTokenModal.fields.amount.available"
          messageArgs={{
            amount: availableTokens.toFixed(),
            denom: chainInfo.currency.coinDenom,
          }}
        />
      </span>

      <FormField.TextInput
        label="SendTokenModal.fields.memo"
        registerReturn={register("memo", registerOptions.memo)}
        errorMessage={errors.memo?.message}
      />

      <div className={cn("flex", "flex-row", "gap-x-2.5", "self-end")}>
        <AppButton
          type="secondary"
          size="regular"
          onClick={onCancel}
          messageID="TransactionModal.cancel"
        />
        <AppButton
          type="primary"
          size="regular"
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          onClick={handleSubmit(onSubmit)}
          messageID="TransactionModal.next"
        />
      </div>
    </form>
  );
};

export default SendTokenForm;
