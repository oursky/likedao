import React from "react";
import { UseFormRegisterReturn } from "react-hook-form";
import cn from "classnames";
import {
  BaseFormField,
  BaseFormFieldProps,
  FormFieldSize,
} from "./BaseFormField";

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
interface TextFormFieldProps extends BaseFormFieldProps {
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  registerReturn: UseFormRegisterReturn;
}
const TextFormField: React.FC<TextFormFieldProps> = (props) => {
  const {
    registerReturn,
    inputProps,
    errorMessage,
    size = "regular",
    ...rest
  } = props;

  return (
    <BaseFormField {...rest} size={size} errorMessage={errorMessage}>
      <input
        className={cn(
          "w-full",
          "drop-shadow-sm",
          "border",
          "rounded-md",
          "focus:outline-none",
          errorMessage != null ? "border-red-700" : "border-gray-300",
          getInputClassNameBySize(size)
        )}
        {...registerReturn}
        {...inputProps}
      />
    </BaseFormField>
  );
};

export { TextFormField };
