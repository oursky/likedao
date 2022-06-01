import { useMemo } from "react";
import BigNumber from "bignumber.js";

import { RegisterOptions } from "react-hook-form";
import { useFormValidators } from "../../../hooks/useFormValidators";
import { useLocale } from "../../../providers/AppLocaleProvider";
import {
  CreateProposalFormValues,
  useCreateProposalFormModel,
} from "../CreateProposalForm/CreateProposalFormModel";

export interface SubmitProposalFormValues extends CreateProposalFormValues {
  amount: string;
  memo: string | null;
}

export const useSubmitProposalFormModel = (
  availableTokens: BigNumber
): {
  registerOptions: Record<keyof SubmitProposalFormValues, RegisterOptions>;
} => {
  const { registerOptions: createProposalFormModelRegisterOptions } =
    useCreateProposalFormModel();
  const { requiredValidator, tokenAmountValidators, maxLengthValidator } =
    useFormValidators();
  const { translate } = useLocale();
  const registerOptions = useMemo((): Record<
    keyof SubmitProposalFormValues,
    RegisterOptions
  > => {
    return {
      ...createProposalFormModelRegisterOptions,
      amount: {
        required: requiredValidator,
        validate: {
          isFinite: tokenAmountValidators.isFinite,
          isLessThanMax: (v) => {
            const amount = new BigNumber(v);
            return (
              amount.isLessThan(availableTokens) ||
              translate("form.validation.amount.lessThan", {
                value: availableTokens.toNumber(),
              })
            );
          },
        },
      },
      memo: {
        required: false,
        maxLength: maxLengthValidator(140),
      },
    };
  }, [
    availableTokens,
    createProposalFormModelRegisterOptions,
    requiredValidator,
    tokenAmountValidators,
    maxLengthValidator,
    translate,
  ]);

  return { registerOptions };
};
