import { useMemo } from "react";
import BigNumber from "bignumber.js";

import { RegisterOptions } from "react-hook-form";
import { useFormValidators } from "../../../hooks/useFormValidators";
import { useLocale } from "../../../providers/AppLocaleProvider";

export interface SendTokenFormValues {
  recipent: string;
  amount: string;
  memo: string | null;
}

export const useSendTokenFormModel = (
  availableTokens: BigNumber
): {
  registerOptions: Record<keyof SendTokenFormValues, RegisterOptions>;
} => {
  const {
    requiredValidator,
    addressValidator,
    tokenAmountValidators,
    maxLengthValidator,
  } = useFormValidators();
  const { translate } = useLocale();
  const registerOptions = useMemo((): Record<
    keyof SendTokenFormValues,
    RegisterOptions
  > => {
    return {
      recipent: {
        required: requiredValidator,
        validate: addressValidator,
      },
      amount: {
        required: requiredValidator,
        validate: {
          isFinite: tokenAmountValidators.isFinite,
          isGreaterThanZero: tokenAmountValidators.isGreaterThanZero,
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
    requiredValidator,
    maxLengthValidator,
    addressValidator,
    availableTokens,
    tokenAmountValidators,
    translate,
  ]);

  return { registerOptions };
};
