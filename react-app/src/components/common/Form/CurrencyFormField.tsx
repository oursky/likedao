import React from "react";
import { UseFormRegisterReturn } from "react-hook-form";
import cn from "classnames";
import {
  BaseFormField,
  BaseFormFieldProps,
  FormFieldSize,
} from "./BaseFormField";

import "./CurrencyFormField.module.scss";

function getInputClassNameBySize(size: FormFieldSize): string {
  switch (size) {
    case "regular":
      return cn("py-3", "px-4");
    case "small":
      return cn("py-2", "px-3");
    default:
      throw new Error(`Unknown form field size`);
  }
}

interface CurrencyFormFieldProps extends BaseFormFieldProps {
  inputProps?: Omit<React.InputHTMLAttributes<HTMLInputElement>, "className">;
  inputClassName?: string;
  currencyUnit?: string;
  registerReturn: UseFormRegisterReturn;
}
const CurrencyFormField: React.FC<CurrencyFormFieldProps> = (props) => {
  const {
    registerReturn,
    currencyUnit,
    errorMessage,
    inputProps,
    inputClassName,
    size = "regular",
    ...rest
  } = props;

  return (
    <BaseFormField {...rest} size={size} errorMessage={errorMessage}>
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
              errorMessage != null ? "border-red-700" : "border-gray-300",
              getInputClassNameBySize(size),
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
      </div>
    </BaseFormField>
  );
};

export { CurrencyFormField };
