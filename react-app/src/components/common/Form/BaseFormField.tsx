import React from "react";
import cn from "classnames";
import { MessageID } from "../../../i18n/LocaleModel";
import LocalizedText from "../Localized/LocalizedText";

export interface BaseFormFieldProps {
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
      {errorMessage != null && (
        <span className={cn("text-red-700")}>{errorMessage}</span>
      )}
    </div>
  );
};

export { BaseFormField };
