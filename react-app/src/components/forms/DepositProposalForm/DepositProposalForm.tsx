import React, { useCallback } from "react";
import cn from "classnames";
import { useForm } from "react-hook-form";
import BigNumber from "bignumber.js";
import AppButton from "../../common/Buttons/AppButton";
import * as FormField from "../../common/Form";
import LocalizedText from "../../common/Localized/LocalizedText";
import Config from "../../../config/Config";
import {
  useDepositProposalFromModel,
  DepositProposalFormValues,
} from "./DepositProposalFormModel";

interface DepositProposalFormProps {
  className?: string;
  proposalId: number;
  availableTokens: BigNumber;
  onCancel: () => void;
  onSubmit: (data: DepositProposalFormValues) => void;
}

const DepositProposalForm: React.FC<DepositProposalFormProps> = (props) => {
  const { className, availableTokens, proposalId, onCancel, onSubmit } = props;
  const coinDenom = Config.chainInfo.currency.coinDenom;

  const {
    register,
    setValue,
    handleSubmit,
    clearErrors,
    formState: { errors },
  } = useForm<DepositProposalFormValues>({
    mode: "onSubmit",
    reValidateMode: "onBlur",
    defaultValues: {
      proposalId,
    },
  });

  const setAmount = useCallback(
    (value: string | number) => {
      clearErrors("amount");
      setValue("amount", value.toString());
    },
    [setValue, clearErrors]
  );

  const { registerOptions } = useDepositProposalFromModel(availableTokens);

  return (
    <form
      className={cn("flex", "flex-col", "gap-y-6", "items-start", className)}
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      onSubmit={handleSubmit(onSubmit)}
    >
      <FormField.Currency
        label="DepositProposalModal.fields.amount"
        currencyUnit={coinDenom}
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
          "leading-6",
          "font-medium",
          "text-black"
        )}
      >
        <LocalizedText
          messageID="DepositProposalModal.fields.amount.available"
          messageArgs={{
            amount: availableTokens.toFixed(),
            denom: coinDenom,
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

export default DepositProposalForm;
