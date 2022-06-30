import { useMemo } from "react";
import BigNumber from "bignumber.js";

import { RegisterOptions } from "react-hook-form";
import { useFormValidators } from "../../../hooks/useFormValidators";
import { useLocale } from "../../../providers/AppLocaleProvider";

export interface DepositProposalFormValues {
  proposalId: number;
  amount: string;
  memo: string | null;
}

export const useDepositProposalFromModel = (
  availableTokens: BigNumber
): {
  registerOptions: Record<keyof DepositProposalFormValues, RegisterOptions>;
} => {
  const { translate } = useLocale();
  const { requiredValidator, tokenAmountValidators, maxLengthValidator } =
    useFormValidators();

  const registerOptions = useMemo((): Record<
    keyof DepositProposalFormValues,
    RegisterOptions
  > => {
    return {
      proposalId: {
        required: requiredValidator,
      },
      amount: {
        required: requiredValidator,
        validate: {
          isFinite: tokenAmountValidators.isFinite,
          isGreaterThanZero: tokenAmountValidators.isGreaterThanZero,
          isLessThanMax: (v) => {
            const amount = new BigNumber(v);
            return (
              amount.isLessThanOrEqualTo(availableTokens) ||
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
    requiredValidator,
    tokenAmountValidators,
    translate,
    maxLengthValidator,
  ]);

  return {
    registerOptions,
  };
};
