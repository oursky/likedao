import React, { useCallback } from "react";
import cn from "classnames";
import { UseFormRegisterReturn } from "react-hook-form";
import { MessageID } from "../../../i18n/LocaleModel";
import LocalizedText from "../Localized/LocalizedText";
import "./FormField.module.css";
import AppButton from "../Buttons/AppButton";

interface BaseFormFieldProps {
  label: MessageID;
  children?: React.ReactNode;
  errorMessage?: string;
}
const BaseFormField: React.FC<BaseFormFieldProps> = (props) => {
  const { label, children, errorMessage } = props;

  return (
    <div
      className={cn(
        "w-full",
        "flex",
        "flex-col",
        "gap-y-1",
        "text-base",
        "leading-6",
        "font-normal",
        "items-start"
      )}
    >
      <label
        className={cn(
          "text-sm",
          "font-medium",
          "leading-5",
          "text-likecoin-black"
        )}
      >
        <LocalizedText messageID={label} />
      </label>
      {children}
      {!!errorMessage && (
        <span className={cn("text-red-700")}>{errorMessage}</span>
      )}
    </div>
  );
};

interface InputFormFieldProps extends BaseFormFieldProps {
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  registerReturn: UseFormRegisterReturn;
}
const InputFormField: React.FC<InputFormFieldProps> = (props) => {
  const { registerReturn, inputProps, errorMessage, ...rest } = props;

  return (
    <BaseFormField {...rest} errorMessage={errorMessage}>
      <input
        className={cn(
          "w-full",
          "drop-shadow-sm",
          "border",
          "py-3",
          "px-4",
          "rounded-md",
          "focus:outline-none",
          !!errorMessage ? "border-red-700" : "border-gray-300"
        )}
        {...registerReturn}
        {...inputProps}
      />
    </BaseFormField>
  );
};

interface CurrencyFormFieldProps extends BaseFormFieldProps {
  inputProps?: Omit<React.InputHTMLAttributes<HTMLInputElement>, "className">;
  inputClassName?: string;
  currencyUnit?: string;
  setValue?: (value: string | number) => void;
  registerReturn: UseFormRegisterReturn;
}
const CurrencyFormField: React.FC<CurrencyFormFieldProps> = (props) => {
  const {
    registerReturn,
    currencyUnit,
    errorMessage,
    inputProps,
    inputClassName,
    setValue,
    ...rest
  } = props;

  const setValueToMax = useCallback(() => {
    if (inputProps?.max) {
      setValue?.(inputProps.max);
    }
  }, [inputProps?.max, setValue]);

  return (
    <BaseFormField {...rest} errorMessage={errorMessage}>
      <div className={cn("w-full", "flex", "flex-row", "gap-x-2")}>
        <div className={cn("flex-1", "relative")}>
          <input
            {...inputProps}
            type="number"
            className={cn(
              "w-full",
              "drop-shadow-sm",
              "border",
              "py-3",
              "pl-4",
              "pr-14",
              "rounded-md",
              "focus:outline-none",
              !!errorMessage ? "border-red-700" : "border-gray-300",
              inputClassName
            )}
            {...registerReturn}
          />
          {currencyUnit && (
            <span
              className={cn(
                "absolute",
                "text-base",
                "leading-6",
                "font-normal",
                "text-gray-500",
                "right-4",
                "top-3",
                "uppercase"
              )}
            >
              {currencyUnit}
            </span>
          )}
        </div>
        {!!inputProps?.max && (
          <AppButton
            messageID="form.fields.currency.max"
            size="regular"
            type="secondary"
            onClick={setValueToMax}
          />
        )}
      </div>
    </BaseFormField>
  );
};

export const FormField = {
  TextInput: InputFormField,
  Currency: CurrencyFormField,
};
