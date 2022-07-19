import React from "react";
import cn from "classnames";
import { MessageID } from "../../../i18n/LocaleModel";
import LocalizedText from "../Localized/LocalizedText";

export type FormFieldSize = "regular" | "small";
export type FormFieldDirection = "horizontal" | "vertical";

function getInputClassNameBySize(size: FormFieldSize): string {
  switch (size) {
    case "regular":
      return cn("text-base", "leading-6", "font-normal");
    case "small":
      return cn("text-sm", "leading-5", "font-medium");
    default:
      throw new Error(`Unknown form field size`);
  }
}

function getFormFieldClassNameClassNameByDirection(
  direction: FormFieldDirection
): {
  containerClassName?: string;
  inputClassName?: string;
  errorClassName?: string;
} {
  switch (direction) {
    case "horizontal":
      return {
        containerClassName: cn(
          "grid",
          "auto-rows-min",
          "gap-y-2",
          "sm:grid-cols-4",
          "sm:gap-y-1",
          "sm:gap-x-4",
          "sm:items-center"
        ),
        inputClassName: cn("col-span-3"),
        errorClassName: cn("sm:col-start-2", "sm:col-span-3"),
      };
    case "vertical":
      return {
        containerClassName: cn("flex", "flex-col", "gap-y-1", "items-start"),
        inputClassName: cn("w-full"),
      };
    default:
      throw new Error(`Unknown form field direction`);
  }
}
export interface BaseFormFieldProps {
  direction?: FormFieldDirection;
  size?: FormFieldSize;
  label?: MessageID;
  children?: React.ReactNode;
  errorMessage?: string;
}

const BaseFormField: React.FC<BaseFormFieldProps> = (props) => {
  const {
    label,
    children,
    errorMessage,
    direction = "vertical",
    size = "regular",
  } = props;

  const { containerClassName, inputClassName, errorClassName } =
    getFormFieldClassNameClassNameByDirection(direction);

  return (
    <div className={cn("w-full", containerClassName)}>
      {label != null && (
        <label
          className={cn(
            "text-sm",
            "font-medium",
            "leading-5",
            "text-app-black"
          )}
        >
          <LocalizedText messageID={label} />
        </label>
      )}
      <div className={cn(inputClassName, getInputClassNameBySize(size))}>
        {children}
      </div>
      {errorMessage != null && (
        <span
          className={cn(
            "text-sm",
            "leading-5",
            "font-normal",
            "text-red-700",
            errorClassName
          )}
        >
          {errorMessage}
        </span>
      )}
    </div>
  );
};

export { BaseFormField };
