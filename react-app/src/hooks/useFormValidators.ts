import { useMemo, useCallback } from "react";
import { bech32 } from "bech32";
import { Validate, ValidationRule } from "react-hook-form";
import { useLocale } from "../providers/AppLocaleProvider";

interface IValidators {
  requiredValidator: ValidationRule<boolean>;
  maxLengthValidator: (maxLength: number) => ValidationRule<number>;
  minLengthValidator: (minLength: number) => ValidationRule<number>;
  addressValidator: Validate<string>;
  tokenAmountValidators: {
    isFinite: Validate<string>;
    isGreaterThanZero: Validate<string>;
  };
}

export const useFormValidators = (): IValidators => {
  const { translate } = useLocale();

  const requiredValidator = useMemo(
    (): ValidationRule<boolean> => ({
      value: true,
      message: translate("form.validation.required"),
    }),
    [translate]
  );

  const maxLengthValidator = useCallback(
    (maxLength: number): ValidationRule<number> => ({
      value: maxLength,
      message: translate("form.validation.amount.lessThan", {
        value: maxLength,
      }),
    }),
    [translate]
  );

  const minLengthValidator = useCallback(
    (minLength: number): ValidationRule<number> => ({
      value: minLength,
      message: translate("form.validation.minLength", {
        value: minLength,
      }),
    }),
    [translate]
  );

  const addressValidator = useMemo((): Validate<string> => {
    return (v: string) => {
      try {
        return bech32.decode(v).words.length > 0;
      } catch (_: unknown) {
        return translate("form.validation.address.invalidAddress");
      }
    };
  }, [translate]);

  const tokenAmountValidators = useMemo(
    (): {
      isFinite: Validate<string>;
      isGreaterThanZero: Validate<string>;
    } => ({
      isFinite: (v: string) =>
        isFinite(parseFloat(v)) || translate("form.validation.amount.infinite"),
      isGreaterThanZero: (v: string) =>
        parseFloat(v) > 0 ||
        translate("form.validation.amount.greaterThan", {
          value: 0,
        }),
    }),
    [translate]
  );

  return {
    requiredValidator,
    maxLengthValidator,
    minLengthValidator,
    addressValidator,
    tokenAmountValidators,
  };
};
