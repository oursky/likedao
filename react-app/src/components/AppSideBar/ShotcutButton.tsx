import React from "react";
import cn from "classnames";
import { MessageID } from "../../i18n/LocaleModel";
import { IconType, Icon } from "../common/Icons/Icons";
import LocalizedText from "../common/Localized/LocalizedText";

interface ShortcutButtonProps {
  className?: string;
  icon: IconType;
  labelId: MessageID;
  onClick: () => void;
}
const ShortcutButton: React.FC<ShortcutButtonProps> = (props) => {
  const { className, icon, labelId, onClick } = props;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex",
        "flex-col",
        "gap-y-1",
        "items-center",
        "bg-white",
        "py-2",
        "rounded-md",
        className
      )}
    >
      <Icon
        fill="currentColor"
        icon={icon}
        height={24}
        width={24}
        className={cn("text-likecoin-green")}
      />
      <p
        className={cn(
          "text-xs",
          "leading-6",
          "font-medium",
          "text-likecoin-green"
        )}
      >
        <LocalizedText messageID={labelId} />
      </p>
    </button>
  );
};

export { ShortcutButton };
