import React, { useCallback } from "react";
import cn from "classnames";
import { MessageID } from "../../../i18n/LocaleModel";
import LocalizedText from "../Localized/LocalizedText";

type AppButtonType = "primary" | "secondary";
type AppButtonSize = "regular" | "small";

interface AppButtonProps
  extends Omit<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    "type" | "onClick"
  > {
  type: AppButtonType;
  size: AppButtonSize;
  messageID: MessageID;
  onClick?: () => void;
}

function getButtonTypeClassNames(type: AppButtonType): string {
  switch (type) {
    case "primary":
      return cn(
        "bg-likecoin-green",
        "text-white",
        "hover:bg-likecoin-lightgreen"
      );
    case "secondary":
      return cn(
        "bg-white",
        "text-likecoin-green",
        "hover:bg-likecoin-lightgreen",
        "hover:text-white"
      );
    default:
      throw new Error("Unknown button type");
  }
}

function getButtonSizeStyle(size: AppButtonSize): string {
  switch (size) {
    case "regular":
      return cn(
        "text-base",
        "leading-6",
        "font-medium",
        "py-3",
        "px-6",
        "rounded-md",
        "shadow-sm",
        "rounded-md"
      );
    case "small":
      return cn(
        "text-sm",
        "leading-4",
        "font-medium",
        "py-2",
        "px-3",
        "rounded-md",
        "shadow-sm",
        "rounded-md"
      );
    default:
      throw new Error("Unknown button size");
  }
}

const AppButton: React.FC<AppButtonProps> = (props) => {
  const { type, size, messageID, onClick: onClick_, ...rest } = props;

  const onClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      onClick_?.();
    },
    [onClick_]
  );

  return (
    <button
      type="button"
      className={cn(getButtonTypeClassNames(type), getButtonSizeStyle(size))}
      onClick={onClick}
      {...rest}
    >
      <LocalizedText messageID={messageID} />
    </button>
  );
};

export default AppButton;
