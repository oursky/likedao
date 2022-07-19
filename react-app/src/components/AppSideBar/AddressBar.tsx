import React from "react";
import cn from "classnames";
import { IconType } from "../common/Icons/Icons";
import IconButton from "../common/Buttons/IconButton";
import LocalizedText from "../common/Localized/LocalizedText";
import { truncateAddress } from "../../utils/address";

interface AddressBarProps {
  address: string;
  className?: string;
  onDisconnect: () => void;
}

const AddressBar: React.FC<AddressBarProps> = (props) => {
  const { address, className, onDisconnect } = props;

  return (
    <div className={cn("flex", "flex-row", "items-center", className)}>
      <span
        className={cn(
          "flex-0",
          "text-2xs",
          "leading-5",
          "font-normal",
          "text-app-lightgreen",
          "whitespace-nowrap"
        )}
      >
        <LocalizedText messageID="AddressBar.yourAddress" />
      </span>
      <span
        className={cn(
          "ml-1",
          "text-xs",
          "leading-5",
          "font-normal",
          "text-black",
          "overflow-hidden"
        )}
      >
        {truncateAddress(address)}
      </span>
      <IconButton
        className={cn("ml-2", "p-0")}
        icon={IconType.Exit}
        size={16}
        onClick={onDisconnect}
      />
    </div>
  );
};

export { AddressBar };
