import React from "react";
import { UseFormRegisterReturn } from "react-hook-form";
import cn from "classnames";
import { BaseFormField, BaseFormFieldProps } from "./BaseFormField";

interface TextFormFieldProps extends BaseFormFieldProps {
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  registerReturn: UseFormRegisterReturn;
}
const TextFormField: React.FC<TextFormFieldProps> = (props) => {
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
          errorMessage != null ? "border-red-700" : "border-gray-300"
        )}
        {...registerReturn}
        {...inputProps}
      />
    </BaseFormField>
  );
};

export { TextFormField };
