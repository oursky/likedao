import React, { useCallback } from "react";
import cn from "classnames";
import { useForm } from "react-hook-form";
import BigNumber from "bignumber.js";
import AppButton from "../../common/Buttons/AppButton";
import Config from "../../../config/Config";
import LocalizedText from "../../common/Localized/LocalizedText";
import * as FormField from "../../common/Form";
import { CreateProposalFormValues } from "../CreateProposalForm/CreateProposalFormModel";
import {
  SubmitProposalFormValues,
  useSubmitProposalFormModel,
} from "./SubmitProposalFormModel";

interface SubmitProposalFormProps {
  className?: string;
  availableTokens: BigNumber;
  requiredDeposit: BigNumber;
  defaultValues: Partial<SubmitProposalFormValues> & CreateProposalFormValues;
  onCancel: () => void;
  onSubmit: (data: SubmitProposalFormValues) => void;
}

const SubmitProposalForm: React.FC<SubmitProposalFormProps> = (props) => {
  const chainInfo = Config.chainInfo;
  const {
    className,
    availableTokens,
    requiredDeposit,
    defaultValues,
    onCancel,
    onSubmit,
  } = props;

  const {
    register,
    setValue,
    handleSubmit,
    clearErrors,
    formState: { errors },
  } = useForm<SubmitProposalFormValues>({
    mode: "onSubmit",
    reValidateMode: "onBlur",
    defaultValues,
  });

  const setAmount = useCallback(
    (value: string | number) => {
      clearErrors("amount");
      setValue("amount", value.toString());
    },
    [setValue, clearErrors]
  );

  const { registerOptions } = useSubmitProposalFormModel(availableTokens);

  return (
    <form
      className={cn("flex", "flex-col", "gap-y-6", "items-start", className)}
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      onSubmit={handleSubmit(onSubmit)}
    >
      <FormField.Currency
        label="SubmitProposalModal.fields.initialDeposit"
        currencyUnit={chainInfo.currency.coinDenom}
        inputProps={{
          placeholder: "0",
          max: availableTokens.toFixed(),
        }}
        setValue={setAmount}
        registerReturn={register("amount", registerOptions.amount)}
        errorMessage={errors.amount?.message}
      />
      <span
        className={cn(
          "-mt-5",
          "text-xs",
          "leading-4",
          "font-medium",
          "text-black",
          "text-left"
        )}
      >
        <LocalizedText
          messageID="SubmitProposalModal.fields.hint"
          messageArgs={{
            availableAmount: availableTokens.toFixed(3),
            mininumDeposit: requiredDeposit.toFixed(),
            denom: chainInfo.currency.coinDenom,
          }}
        />
      </span>

      <FormField.TextInput
        label="SubmitProposalModal.fields.memo"
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

export default SubmitProposalForm;
