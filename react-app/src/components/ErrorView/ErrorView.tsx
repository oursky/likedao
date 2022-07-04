import React from "react";
import cn from "classnames";
import { MessageID } from "../../i18n/LocaleModel";
import { Icon, IconType } from "../common/Icons/Icons";
import LocalizedText from "../common/Localized/LocalizedText";

export enum ErrorType {
  NotFound = "NotFound",
  InvalidAddress = "InvalidAddress",
}

function getErrorViewMessage(type?: ErrorType): MessageID {
  switch (type) {
    case ErrorType.NotFound:
      return "ErrorView.notFound";
    case ErrorType.InvalidAddress:
      return "ErrorView.invalidAddress";
    default:
      return "ErrorView.unknown";
  }
}

interface ErrorViewProps {
  type?: ErrorType;
}

const ErrorView: React.FC<ErrorViewProps> = (props) => {
  const { type } = props;

  return (
    <div
      className={cn(
        "h-full",
        "w-full",
        "pt-20",
        "flex",
        "gap-y-6",
        "flex-col",
        "items-center"
      )}
    >
      <Icon icon={IconType.ThinX} width={114} height={114} />
      <h1 className={cn("text-4xl", "leading-5", "font-medium", "text-black")}>
        <LocalizedText messageID={getErrorViewMessage(type)} />
      </h1>
      <a
        className={cn(
          "text-sm",
          "leading-5",
          "font-medium",
          "text-likecoin-green",
          "hover:text-likecoin-lightgreen",
          "active:text-likecoin-darkgreen"
        )}
        href="/"
      >
        <LocalizedText messageID="ErrorView.backToHome" />
      </a>
    </div>
  );
};

export default ErrorView;
